import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestPostgres, TestRedis } from './containers.js';
import request from 'supertest';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { ConsistencyChecker } from '../src/shared/curriculum/consistency-checker.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse } from './fixtures/courses.js';
import {
  addCurriculumItem,
  readCurriculum,
  releaseVersionForTest,
} from './fixtures/curriculum.js';
import { createProgram } from './fixtures/programs.js';
import { startPostgres, startRedis } from './containers.js';
import { createTestApp } from './test-app.js';
import { setAppEnv } from './test-env.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

interface Issue {
  code: string;
  severity: string;
  message: string;
  itemId: string | null;
  groupId: string | null;
}

describe('consistency check', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let viewer: Agent;
  let lecturer: Agent;
  let seq = 0;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    admin = await loginAgent(app, await createAccount(app, 'conadmin', 'R1'));
    viewer = await loginAgent(app, await createAccount(app, 'conview', 'R2'));
    lecturer = await loginAgent(app, await createAccount(app, 'conlect', 'R4'));
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  // A program whose Draft declares `declared` = compulsory + elective in `semesters` semesters.
  async function draft(
    declared: [string, string, string] = ['10', '6', '16'],
    semesters = 1,
  ) {
    seq += 1;
    const program = await createProgram(app, { programCode: `CON${seq}` });
    const versionId = program.versions[0].id;
    await prisma.programVersion.update({
      where: { id: versionId },
      data: {
        semesterCount: semesters,
        compulsoryCredits: declared[0],
        electiveCredits: declared[1],
        totalCredits: declared[2],
      },
    });
    return { programId: program.id, versionId };
  }

  const course = (suffix: string, credits = '3') =>
    createCourse(app, { courseCode: `CON${seq}_${suffix}`, credits });

  const row = async (
    versionId: string,
    suffix: string,
    options: { credits?: string; semester?: number; elective?: boolean } = {},
  ) => {
    const created = await course(suffix, options.credits);
    const item = await addCurriculumItem(admin, versionId, {
      courseId: created.id,
      plannedSemester: options.semester ?? 1,
      isElective: options.elective ?? false,
    });
    return { course: created, item };
  };

  const report = async (versionId: string, agent: Agent = admin) =>
    (
      await agent
        .get(`/api/program-versions/${versionId}/consistency`)
        .expect(200)
    ).body;

  const accept = (versionId: string, body: object, agent: Agent = admin) =>
    agent
      .put(`/api/program-versions/${versionId}/credit-mismatch-acceptance`)
      .set(CSRF)
      .send(body);

  const issue = (body: { issues: Issue[] }, code: string) =>
    body.issues.find((candidate) => candidate.code === code);

  // Compulsory 3 + 3 + 2 = 8; group TC1 (min 6) with five 3-credit members = 6 counted, 15 listed.
  async function standardCurriculum() {
    const { programId, versionId } = await draft();
    const compulsory = [
      await row(versionId, 'C1'),
      await row(versionId, 'C2'),
      await row(versionId, 'C3', { credits: '2' }),
    ];
    const group = (
      await admin
        .post(`/api/program-versions/${versionId}/elective-groups`)
        .set(CSRF)
        .send({ groupCode: 'TC1', groupName: 'Tự chọn 1', minCredits: '6' })
        .expect(201)
    ).body;
    const members: string[] = [];
    for (let index = 1; index <= 5; index += 1) {
      members.push(
        (await row(versionId, `E${index}`, { elective: true })).item.id,
      );
    }
    await admin
      .put(`/api/elective-groups/${group.id}/items`)
      .set(CSRF)
      .send({ itemIds: members })
      .expect(200);
    return { programId, versionId, compulsory, group };
  }

  it('counts a group by its minimum and warns about the credit gap (KB-013, KB-018)', async () => {
    const { versionId } = await standardCurriculum();

    const body = await report(versionId);

    expect(body.credits.computed).toEqual({
      compulsory: '8',
      elective: '6',
      total: '14',
    });
    expect(body.credits.gap.total).toBe('-2');
    expect(body.groups[0]).toMatchObject({
      groupCode: 'TC1',
      requiredCredits: '6',
      listedCredits: '15',
      itemCount: 5,
    });
    const mismatch = issue(body, 'CREDIT_MISMATCH');
    expect(mismatch).toMatchObject({ severity: 'HIGH' });
    expect(mismatch?.message).toContain('16');
    expect(mismatch?.message).toContain('14');
    expect(mismatch?.message).toContain('2.');
    expect(body).toMatchObject({ passes: true, errorCount: 0 });
    expect(body.canAcceptMismatch).toBe(true);
    const curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.programCredits).toMatchObject({
      computed: { elective: '6', total: '14' },
      mismatch: true,
    });
  });

  it('accepts a mismatch with a reason, and brings the warning back when the gap moves (KB-018)', async () => {
    const { versionId, compulsory } = await standardCurriculum();
    const gaps = { compulsoryGap: '-2', electiveGap: '0' };

    const empty = await accept(versionId, { reason: '  ', ...gaps }).expect(
      400,
    );
    expect(empty.body.details[0].field).toBe('reason');

    const accepted = await accept(versionId, {
      reason: 'Theo quyết định 123',
      ...gaps,
    }).expect(200);
    expect(issue(accepted.body, 'CREDIT_MISMATCH_ACCEPTED')).toMatchObject({
      severity: 'INFO',
    });
    expect(issue(accepted.body, 'CREDIT_MISMATCH')).toBeUndefined();
    expect(accepted.body.credits).toMatchObject({
      acceptanceCurrent: true,
      acceptance: {
        reason: 'Theo quyết định 123',
        compulsoryGap: '-2',
        acceptedBy: { fullName: 'conadmin' },
      },
    });

    await admin
      .delete(`/api/curriculum-items/${compulsory[0].item.id}`)
      .set(CSRF)
      .expect(204);
    const moved = await report(versionId);
    expect(moved.credits.gap.total).toBe('-5');
    expect(moved.credits.acceptanceCurrent).toBe(false);
    expect(moved.credits.acceptance).not.toBeNull();
    expect(issue(moved, 'CREDIT_MISMATCH')).toBeDefined();

    const stale = await accept(versionId, {
      reason: 'Đã xem lệch 2',
      ...gaps,
    }).expect(409);
    expect(stale.body.code).toBe('CREDIT_GAP_CHANGED');
  });

  it('refuses to accept when nothing mismatches, or on a released version', async () => {
    const { versionId } = await draft(['3', '0', '3']);
    await row(versionId, 'A');
    const none = await accept(versionId, {
      reason: 'x',
      compulsoryGap: '0',
      electiveGap: '0',
    }).expect(409);
    expect(none.body.code).toBe('NO_CREDIT_MISMATCH');

    const released = await draft();
    await row(released.versionId, 'A');
    await releaseVersionForTest(app, released.versionId);
    const frozen = await accept(released.versionId, {
      reason: 'x',
      compulsoryGap: '-7',
      electiveGap: '0',
    }).expect(409);
    expect(frozen.body.code).toBe('VERSION_NOT_EDITABLE');
    expect((await report(released.versionId)).canAcceptMismatch).toBe(false);
  });

  it('flags a prerequisite planned later, naming both semesters (KB-019)', async () => {
    const { versionId } = await draft(['6', '0', '6'], 3);
    const a = await row(versionId, 'A', { semester: 3 });
    const b = await row(versionId, 'B', { semester: 2 });
    await admin
      .put(`/api/curriculum-items/${b.item.id}/requisites`)
      .set(CSRF)
      .send({
        requisites: [
          { sourceCourseId: a.course.id, relationType: 'PREREQUISITE' },
        ],
      })
      .expect(200);

    const later = issue(await report(versionId), 'REQUISITE_NOT_EARLIER');

    expect(later).toMatchObject({ severity: 'HIGH', itemId: b.item.id });
    expect(later?.message).toContain('học kỳ 2');
    expect(later?.message).toContain('học kỳ 3');
  });

  it('reports a loop through the catalog and the curriculum, and assertPasses refuses it (KB-020)', async () => {
    const { versionId } = await draft(['6', '0', '6']);
    const a = await row(versionId, 'A');
    const b = await row(versionId, 'B', { semester: 1 });
    await admin
      .put(`/api/curriculum-items/${b.item.id}/requisites`)
      .set(CSRF)
      .send({
        requisites: [
          { sourceCourseId: a.course.id, relationType: 'PREREQUISITE' },
        ],
      })
      .expect(200);
    // The catalog check sees catalog edges only, so this write is allowed; the report is where the loop surfaces.
    await admin
      .post('/api/course-relations')
      .set(CSRF)
      .send({
        sourceCourseId: b.course.id,
        targetCourseId: a.course.id,
        relationType: 'PREREQUISITE',
      })
      .expect(201);

    const body = await report(versionId);

    const cycle = issue(body, 'REQUISITE_CYCLE');
    expect(cycle).toMatchObject({ severity: 'ERROR', itemId: b.item.id });
    expect(cycle?.message).toMatch(
      new RegExp(
        `CON${seq}_A → CON${seq}_B → CON${seq}_A|CON${seq}_B → CON${seq}_A → CON${seq}_B`,
      ),
    );
    expect(body).toMatchObject({ passes: false, errorCount: 1 });

    await expect(
      app.get(ConsistencyChecker).assertPasses(versionId),
    ).rejects.toMatchObject({
      code: 'CONSISTENCY_FAILED',
      details: [{ field: 'REQUISITE_CYCLE' }],
    });
  });

  it('warns about a requisite outside the curriculum but still accepts more rows (KB-021)', async () => {
    const { versionId } = await draft(['6', '0', '6']);
    const b = await row(versionId, 'B');
    const outside = await course('X');
    await admin
      .put(`/api/curriculum-items/${b.item.id}/requisites`)
      .set(CSRF)
      .send({
        requisites: [
          { sourceCourseId: outside.id, relationType: 'PREREQUISITE' },
        ],
      })
      .expect(200);

    const warned = issue(await report(versionId), 'REQUISITE_OUTSIDE');

    expect(warned).toMatchObject({ severity: 'HIGH', itemId: b.item.id });
    await row(versionId, 'D');
  });

  it('refuses a group whose members cannot reach its minimum, and flags a loose elective row', async () => {
    const { versionId } = await draft(['0', '9', '9']);
    const group = (
      await admin
        .post(`/api/program-versions/${versionId}/elective-groups`)
        .set(CSRF)
        .send({ groupCode: 'TC3', groupName: 'Tự chọn 3', minCredits: '9' })
        .expect(201)
    ).body;
    const members = [
      (await row(versionId, 'E1', { elective: true })).item.id,
      (await row(versionId, 'E2', { elective: true })).item.id,
    ];
    await admin
      .put(`/api/elective-groups/${group.id}/items`)
      .set(CSRF)
      .send({ itemIds: members })
      .expect(200);
    await row(versionId, 'LOOSE', { elective: true });

    const body = await report(versionId);

    expect(issue(body, 'GROUP_MINIMUM_UNREACHABLE')).toMatchObject({
      severity: 'ERROR',
      groupId: group.id,
    });
    expect(issue(body, 'ELECTIVE_WITHOUT_GROUP')).toMatchObject({
      severity: 'HIGH',
    });
    expect(body.passes).toBe(false);
  });

  it('says nothing for a clean curriculum (US-031 AC5)', async () => {
    const { versionId } = await draft(['6', '0', '6']);
    await row(versionId, 'A');
    await row(versionId, 'B');

    const body = await report(versionId);

    expect(body).toMatchObject({
      issues: [],
      errorCount: 0,
      warningCount: 0,
      passes: true,
    });
    await expect(
      app.get(ConsistencyChecker).assertPasses(versionId),
    ).resolves.toBeUndefined();
  });

  it('lets R2 read but not accept, and refuses R4 an acceptance', async () => {
    const { versionId } = await standardCurriculum();

    expect((await report(versionId, viewer)).canAcceptMismatch).toBe(false);
    await accept(
      versionId,
      { reason: 'x', compulsoryGap: '-2', electiveGap: '0' },
      lecturer,
    ).expect(403);
    await accept(
      versionId,
      { reason: 'x', compulsoryGap: '-2', electiveGap: '0' },
      viewer,
    ).expect(403);
  });

  it('answers 404 for an unknown version', async () => {
    await admin.get('/api/program-versions/nope/consistency').expect(404);
  });

  it('does not copy an acceptance into a cloned program', async () => {
    const { programId, versionId } = await standardCurriculum();
    await accept(versionId, {
      reason: 'Theo quyết định',
      compulsoryGap: '-2',
      electiveGap: '0',
    }).expect(200);

    const cloned = await admin
      .post(`/api/programs/${programId}/clone`)
      .set(CSRF)
      .send({ programCode: `CON_CLONE${seq}`, programName: 'Bản sao' })
      .expect(201);

    const body = await report(cloned.body.currentVersion.id);
    expect(body.credits.acceptance).toBeNull();
  });

  it('holds the five-or-none acceptance rule at the database', async () => {
    const { versionId } = await draft();
    await expect(
      prisma.programVersion.update({
        where: { id: versionId },
        data: { creditMismatchReason: 'chỉ có lý do' },
      }),
    ).rejects.toThrow(/credit_acceptance_complete/);
  });
});
