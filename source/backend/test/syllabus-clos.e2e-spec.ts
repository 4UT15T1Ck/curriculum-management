import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { SubjectGroupMemberRole } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse } from './fixtures/courses.js';
import { createClo } from './fixtures/outcomes.js';
import {
  addMembership,
  createSubjectGroup,
} from './fixtures/subject-groups.js';
import {
  createSyllabusDraft,
  publishSyllabusForTest,
} from './fixtures/syllabi.js';
import { startPostgres, startRedis } from './containers.js';
import type { TestPostgres, TestRedis } from './containers.js';
import { createTestApp } from './test-app.js';
import { setAppEnv } from './test-env.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

describe('CLOs in the syllabus', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let viewer: Agent;
  let coordinator: Agent;
  let otherLecturer: Agent;
  let g1Id: string;
  let counter = 0;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    g1Id = (await createSubjectGroup(app, 'CLO_G1')).id;
    const g2Id = (await createSubjectGroup(app, 'CLO_G2')).id;
    admin = await loginAgent(app, await createAccount(app, 'cloadmin', 'R1'));
    viewer = await loginAgent(app, await createAccount(app, 'cloviewer', 'R2'));
    const coordinatorAccount = await createAccount(app, 'clocoordinator');
    for (const memberRole of [
      SubjectGroupMemberRole.MEMBER,
      SubjectGroupMemberRole.COORDINATOR,
    ]) {
      await addMembership(app, {
        groupId: g1Id,
        userId: coordinatorAccount.id,
        memberRole,
      });
    }
    coordinator = await loginAgent(app, coordinatorAccount);
    const otherAccount = await createAccount(app, 'cloother');
    await addMembership(app, { groupId: g2Id, userId: otherAccount.id });
    otherLecturer = await loginAgent(app, otherAccount);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  async function newDraft() {
    counter += 1;
    const course = await createCourse(app, {
      courseCode: `CLOC${counter}`,
      groupId: g1Id,
    });
    return { course, draft: await createSyllabusDraft(admin, course.id) };
  }

  const syllabusOf = (agent: Agent, courseId: string) =>
    agent.get(`/api/courses/${courseId}/syllabus`);

  it('adds, edits, reorders and deletes CLOs in order, with the English text (US-043)', async () => {
    const { course, draft } = await newDraft();

    const first = await coordinator
      .post(`/api/syllabi/${draft.id}/clos`)
      .set(CSRF)
      .send({
        cloCode: ' clo1 ',
        description: 'Giải thích được',
        englishDescription: 'Explain',
        cognitiveLevel: 'Hiểu',
      })
      .expect(201);
    expect(first.body).toMatchObject({
      cloCode: 'CLO1',
      sortOrder: 1,
      englishDescription: 'Explain',
      cognitiveLevel: 'Hiểu',
      linkedPrograms: [],
    });
    const second = await createClo(coordinator, draft.id, 'CLO2');
    const third = await createClo(coordinator, draft.id, 'CLO3');

    const edited = await coordinator
      .patch(`/api/clos/${second.id}`)
      .set(CSRF)
      .send({ description: 'Đã sửa', englishDescription: '' })
      .expect(200);
    expect(edited.body).toMatchObject({
      description: 'Đã sửa',
      englishDescription: null,
    });
    const clash = await coordinator
      .patch(`/api/clos/${second.id}`)
      .set(CSRF)
      .send({ cloCode: 'clo1' })
      .expect(409);
    expect(clash.body.code).toBe('CLO_CODE_TAKEN');

    const order = await coordinator
      .put(`/api/syllabi/${draft.id}/clos/order`)
      .set(CSRF)
      .send({ ids: [third.id, first.body.id, second.id] })
      .expect(200);
    expect(order.body.map((c: { cloCode: string }) => c.cloCode)).toEqual([
      'CLO3',
      'CLO1',
      'CLO2',
    ]);
    await coordinator
      .put(`/api/syllabi/${draft.id}/clos/order`)
      .set(CSRF)
      .send({ ids: [third.id] })
      .expect(409);

    await coordinator.delete(`/api/clos/${third.id}`).set(CSRF).expect(204);
    const shown = await syllabusOf(coordinator, course.id).expect(200);
    expect(shown.body.canEditClos).toBe(true);
    expect(
      shown.body.draft.clos.map((c: { cloCode: string; sortOrder: number }) => [
        c.cloCode,
        c.sortOrder,
      ]),
    ).toEqual([
      ['CLO1', 1],
      ['CLO2', 2],
    ]);
  });

  it('links CLOs to a weekly row, keeps them when the row is edited without cloIds and drops them with the CLO', async () => {
    const { course, draft } = await newDraft();
    const other = await newDraft();
    const clo1 = await createClo(admin, draft.id, 'CLO1');
    const clo2 = await createClo(admin, draft.id, 'CLO2');
    const foreign = await createClo(admin, other.draft.id, 'CLO1');

    const refused = await admin
      .post(`/api/syllabi/${draft.id}/weekly-contents`)
      .set(CSRF)
      .send({
        weekLabel: 'Tuần 1',
        content: '<p>x</p>',
        cloIds: [clo1.id, foreign.id],
      })
      .expect(400);
    expect(refused.body).toMatchObject({
      code: 'CLO_NOT_IN_SYLLABUS',
      details: [{ field: 'cloIds' }],
    });

    const created = await admin
      .post(`/api/syllabi/${draft.id}/weekly-contents`)
      .set(CSRF)
      .send({
        weekLabel: 'Tuần 1',
        content: '<p>x</p>',
        cloIds: [clo2.id, clo1.id],
      })
      .expect(201);
    expect(created.body.cloIds).toEqual([clo1.id, clo2.id]);

    const kept = await admin
      .patch(`/api/weekly-contents/${created.body.id}`)
      .set(CSRF)
      .send({ weekLabel: 'Tuần 1 (sửa)' })
      .expect(200);
    expect(kept.body.cloIds).toEqual([clo1.id, clo2.id]);
    const cleared = await admin
      .patch(`/api/weekly-contents/${created.body.id}`)
      .set(CSRF)
      .send({ cloIds: [clo2.id] })
      .expect(200);
    expect(cleared.body.cloIds).toEqual([clo2.id]);

    await admin.delete(`/api/clos/${clo2.id}`).set(CSRF).expect(204);
    const shown = await syllabusOf(admin, course.id).expect(200);
    expect(shown.body.draft.weeklyContents[0].cloIds).toEqual([]);
  });

  it('keeps CLO writes to clo.edit holders of the course group on a Draft', async () => {
    const { course, draft } = await newDraft();
    const clo = await createClo(admin, draft.id, 'CLO1');
    const body = { cloCode: 'CLO9', description: 'x' };

    const outside = await otherLecturer
      .post(`/api/syllabi/${draft.id}/clos`)
      .set(CSRF)
      .send(body)
      .expect(403);
    expect(outside.body.code).toBe('OUT_OF_SCOPE');
    const reader = await viewer
      .post(`/api/syllabi/${draft.id}/clos`)
      .set(CSRF)
      .send(body)
      .expect(403);
    expect(reader.body.code).toBe('PERMISSION_DENIED');
    const flag = await syllabusOf(viewer, course.id).expect(200);
    expect(flag.body.canEditClos).toBe(false);

    await publishSyllabusForTest(app, draft.id);
    const published = await admin
      .patch(`/api/clos/${clo.id}`)
      .set(CSRF)
      .send({ description: 'Sửa' })
      .expect(409);
    expect(published.body.code).toBe('CHANGE_REQUEST_REQUIRED');
  });
});
