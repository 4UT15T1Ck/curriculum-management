import type { NestExpressApplication } from '@nestjs/platform-express';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import {
  CourseRelationType,
  ProgramVersionStatus,
  SubjectGroupMemberRole,
} from '../src/generated/prisma/client.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse } from './fixtures/courses.js';
import {
  addCurriculumItem,
  postItem,
  readCurriculum,
  releaseVersionForTest,
} from './fixtures/curriculum.js';
import { assignDirector, createProgram } from './fixtures/programs.js';
import {
  addMembership,
  createSubjectGroup,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { applyMigrations } from './migrations.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

describe('curriculum, requisites and elective groups', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let adminToo: Agent;
  let coordinator: Agent;
  let g1Id: string;
  let g2Id: string;
  let seq = 0;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    applyMigrations(postgres.getConnectionUri());
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    g1Id = (await createSubjectGroup(app, 'CUR_G1')).id;
    g2Id = (await createSubjectGroup(app, 'CUR_G2')).id;
    admin = await loginAgent(app, await createAccount(app, 'curadmin', 'R1'));
    adminToo = await loginAgent(
      app,
      await createAccount(app, 'curadmin2', 'R1'),
    );
    const lecturer = await createAccount(app, 'curcoord');
    await addMembership(app, {
      groupId: g1Id,
      userId: lecturer.id,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
    });
    coordinator = await loginAgent(app, lecturer);
    // Concurrent requests need a server that stays up between them.
    await app.listen(0);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  // A fresh 8-semester program with its Draft; returns the Draft version id.
  async function draft() {
    seq += 1;
    const program = await createProgram(app, { programCode: `CUR${seq}` });
    return { programId: program.id, versionId: program.versions[0].id };
  }

  const course = (
    suffix: string,
    options: { credits?: string; groupId?: string } = {},
  ) =>
    createCourse(app, {
      courseCode: `CUR${seq}_${suffix}`,
      credits: options.credits,
      groupId: options.groupId,
    });

  const put = (path: string, body: object, agent: Agent = admin) =>
    agent.put(path).set(CSRF).send(body);

  it('adds rows, orders them by semester and totals credits exactly (US-023 AC1, US-024 AC1)', async () => {
    const { versionId } = await draft();
    const [a, b, c] = await Promise.all([
      course('A'),
      course('B', { credits: '2.5' }),
      course('C'),
    ]);
    const first = await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 1,
      blockSymbol: 'Đ.Cương',
    });
    await addCurriculumItem(admin, versionId, {
      courseId: b.id,
      plannedSemester: 1,
    });
    await addCurriculumItem(admin, versionId, {
      courseId: c.id,
      plannedSemester: 2,
      isElective: true,
    });

    const curriculum = await readCurriculum(admin, versionId);

    expect(
      curriculum.items.map(
        (item: { displayOrder: number }) => item.displayOrder,
      ),
    ).toEqual([1, 2, 3]);
    expect(curriculum.items[0]).toMatchObject({
      id: first.id,
      plannedSemester: 1,
      sortOrder: 1,
      blockSymbol: 'Đ.Cương',
      blockName: null,
      isElective: false,
      htDa: false,
      canEdit: true,
    });
    expect(curriculum.semesters).toHaveLength(8);
    expect(curriculum.semesters[0]).toMatchObject({
      semester: 1,
      itemCount: 2,
      totalCredits: '5.5',
      compulsoryCredits: '5.5',
      electiveCredits: '0',
    });
    expect(curriculum.semesters[1]).toMatchObject({
      totalCredits: '3',
      electiveCredits: '3',
    });
    expect(curriculum.blocks).toEqual([
      { symbol: null, blockName: null, totalCredits: '5.5', itemCount: 2 },
      { symbol: 'Đ.Cương', blockName: null, totalCredits: '3', itemCount: 1 },
    ]);
    expect(curriculum).toMatchObject({
      editPath: 'DIRECT',
      canEditStructure: true,
      canAddItems: true,
      version: { semesterCount: 8, status: 'DRAFT', versionNumber: null },
    });
  });

  it('keeps every Excel column on a row and edits it later (US-023 AC1)', async () => {
    const { versionId } = await draft();
    const a = await course('A');
    const created = await admin
      .post(`/api/program-versions/${versionId}/curriculum-items`)
      .set(CSRF)
      .send({
        courseId: a.id,
        plannedSemester: 4,
        blockSymbol: '  CSN ',
        isElective: false,
        htDa: true,
        tqDa: true,
        minStudiedScore: '3.5',
        minTransferScore: '3',
        note: 'Có đồ án',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      blockSymbol: 'CSN',
      htDa: true,
      tqDa: true,
      minStudiedScore: '3.5',
      minTransferScore: '3',
      note: 'Có đồ án',
    });
    const patched = await admin
      .patch(`/api/curriculum-items/${created.body.id}`)
      .set(CSRF)
      .send({ blockSymbol: '', minStudiedScore: null, htDa: false })
      .expect(200);
    expect(patched.body).toMatchObject({
      blockSymbol: null,
      minStudiedScore: null,
      htDa: false,
      tqDa: true,
    });
    const bad = await admin
      .patch(`/api/curriculum-items/${created.body.id}`)
      .set(CSRF)
      .send({ minStudiedScore: '5' })
      .expect(400);
    expect(bad.body.code).toBe('VALIDATION_FAILED');
    await admin
      .patch(`/api/curriculum-items/${created.body.id}`)
      .set(CSRF)
      .send({ courseId: 'other' })
      .expect(400);
  });

  it('refuses the same course twice and names its semester (KB-015)', async () => {
    const { versionId } = await draft();
    const a = await course('A');
    await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 3,
    });
    const again = await postItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 5,
    }).expect(409);
    expect(again.body.code).toBe('COURSE_ALREADY_IN_CURRICULUM');
    expect(again.body.message).toMatch(/ở học kỳ 3\.$/);
  });

  it('refuses semester 9 of 8 and names the count (KB-017)', async () => {
    const { versionId } = await draft();
    const a = await course('A');
    const refused = await postItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 9,
    }).expect(400);
    expect(refused.body.code).toBe('SEMESTER_OUT_OF_RANGE');
    expect(refused.body.message).toContain('8 học kỳ');
    const row = await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 2,
    });
    const moved = await admin
      .patch(`/api/curriculum-items/${row.id}`)
      .set(CSRF)
      .send({ plannedSemester: 9 })
      .expect(400);
    expect(moved.body.code).toBe('SEMESTER_OUT_OF_RANGE');
  });

  it('refuses a course that is not Active', async () => {
    const { versionId } = await draft();
    const old = await createCourse(app, {
      courseCode: `CUR${seq}_OLD`,
      status: 'DISCONTINUED',
    });
    const refused = await postItem(admin, versionId, {
      courseId: old.id,
      plannedSemester: 1,
    }).expect(409);
    expect(refused.body.code).toBe('COURSE_NOT_ACTIVE');
  });

  it('warns about an empty semester (KB-016)', async () => {
    const { versionId } = await draft();
    for (let semester = 1; semester <= 7; semester += 1) {
      const row = await course(`S${semester}`);
      await addCurriculumItem(admin, versionId, {
        courseId: row.id,
        plannedSemester: semester,
      });
    }
    const curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.warnings).toEqual([
      expect.objectContaining({
        code: 'EMPTY_SEMESTER',
        severity: 'INFO',
        semester: 8,
        itemId: null,
      }),
    ]);
    expect(curriculum.semesters[7]).toMatchObject({
      itemCount: 0,
      totalCredits: '0',
    });
  });

  it('seeds requisites from the catalog and flags one planned later (US-027 AC3, KB-019)', async () => {
    const { versionId } = await draft();
    const [a, b, replacement] = await Promise.all([
      course('A'),
      course('B'),
      course('R'),
    ]);
    await prisma.courseRelation.create({
      data: {
        sourceCourseId: a.id,
        targetCourseId: b.id,
        relationType: CourseRelationType.PREREQUISITE,
        minScore: '2',
      },
    });
    await prisma.courseRelation.create({
      data: {
        sourceCourseId: replacement.id,
        targetCourseId: b.id,
        relationType: CourseRelationType.REPLACEMENT,
      },
    });
    await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 3,
    });
    const rowB = await addCurriculumItem(admin, versionId, {
      courseId: b.id,
      plannedSemester: 2,
    });

    const curriculum = await readCurriculum(admin, versionId);

    const itemB = curriculum.items.find(
      (item: { id: string }) => item.id === rowB.id,
    );
    expect(itemB.requisites).toHaveLength(1);
    expect(itemB.requisites[0]).toMatchObject({
      relationType: 'PREREQUISITE',
      minScore: '2',
      sourceSemester: 3,
      sourceCourse: { courseCode: `CUR${seq}_A` },
    });
    expect(curriculum.warnings).toContainEqual(
      expect.objectContaining({
        code: 'REQUISITE_NOT_EARLIER',
        severity: 'HIGH',
        itemId: rowB.id,
        semester: 2,
      }),
    );
  });

  it('does not let the catalog reach into a row after it was added (D6)', async () => {
    const { versionId } = await draft();
    const [a, b] = await Promise.all([course('A'), course('B')]);
    const rowB = await addCurriculumItem(admin, versionId, {
      courseId: b.id,
      plannedSemester: 2,
    });
    await prisma.courseRelation.create({
      data: {
        sourceCourseId: a.id,
        targetCourseId: b.id,
        relationType: CourseRelationType.PRIOR,
      },
    });
    const curriculum = await readCurriculum(admin, versionId);
    expect(
      curriculum.items.find((item: { id: string }) => item.id === rowB.id)
        .requisites,
    ).toEqual([]);
  });

  it('edits the requisites of one curriculum only and refuses loops with the catalog (KB-020)', async () => {
    const { versionId } = await draft();
    const other = await draft();
    const [a, b] = await Promise.all([course('A'), course('B')]);
    // Catalog: A is a prerequisite of B.
    await prisma.courseRelation.create({
      data: {
        sourceCourseId: a.id,
        targetCourseId: b.id,
        relationType: CourseRelationType.PREREQUISITE,
      },
    });
    await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 1,
    });
    await addCurriculumItem(admin, versionId, {
      courseId: b.id,
      plannedSemester: 2,
    });
    const rowA = (await readCurriculum(admin, versionId)).items[0];

    const loop = await put(`/api/curriculum-items/${rowA.id}/requisites`, {
      requisites: [{ sourceCourseId: b.id, relationType: 'PREREQUISITE' }],
    }).expect(409);
    expect(loop.body.code).toBe('REQUISITE_CYCLE');
    expect(loop.body.message).toMatch(
      new RegExp(`CUR${seq}_A → CUR${seq}_B → CUR${seq}_A\\.$`),
    );

    // Another curriculum is free to disagree about a pair nobody has put in it.
    const rowOtherB = await addCurriculumItem(admin, other.versionId, {
      courseId: b.id,
      plannedSemester: 1,
    });
    const mixed = await put(
      `/api/curriculum-items/${rowOtherB.id}/requisites`,
      {
        requisites: [
          { sourceCourseId: a.id, relationType: 'COREQUISITE' },
          { sourceCourseId: a.id, relationType: 'PRIOR' },
        ],
      },
    ).expect(200);
    expect(mixed.body.requisites).toHaveLength(2);

    const cleared = await put(`/api/curriculum-items/${rowA.id}/requisites`, {
      requisites: [],
    }).expect(200);
    expect(cleared.body.requisites).toEqual([]);
  });

  it('validates requisite input', async () => {
    const { versionId } = await draft();
    const [a, b] = await Promise.all([course('A'), course('B')]);
    const row = await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 1,
    });
    const url = `/api/curriculum-items/${row.id}/requisites`;
    expect(
      (
        await put(url, {
          requisites: [{ sourceCourseId: a.id, relationType: 'PRIOR' }],
        }).expect(400)
      ).body.code,
    ).toBe('REQUISITE_SELF');
    expect(
      (
        await put(url, {
          requisites: [
            {
              sourceCourseId: b.id,
              relationType: 'COREQUISITE',
              minScore: '2',
            },
          ],
        }).expect(400)
      ).body.code,
    ).toBe('MIN_SCORE_NOT_ALLOWED');
    expect(
      (
        await put(url, {
          requisites: [{ sourceCourseId: b.id, relationType: 'REPLACEMENT' }],
        }).expect(400)
      ).body.code,
    ).toBe('VALIDATION_FAILED');
    expect(
      (
        await put(url, {
          requisites: [{ sourceCourseId: 'ghost', relationType: 'PRIOR' }],
        }).expect(400)
      ).body.code,
    ).toBe('COURSE_NOT_FOUND');
    const cancelled = await createCourse(app, {
      courseCode: `CUR${seq}_X`,
      status: 'CANCELLED',
    });
    expect(
      (
        await put(url, {
          requisites: [{ sourceCourseId: cancelled.id, relationType: 'PRIOR' }],
        }).expect(409)
      ).body.code,
    ).toBe('REQUISITE_COURSE_CANCELLED');
  });

  it('lets exactly one of two opposite requisites win a race (advisory lock)', async () => {
    const { versionId } = await draft();
    const [a, b] = await Promise.all([course('A'), course('B')]);
    const rowA = await addCurriculumItem(admin, versionId, {
      courseId: a.id,
      plannedSemester: 1,
    });
    const rowB = await addCurriculumItem(admin, versionId, {
      courseId: b.id,
      plannedSemester: 2,
    });
    const results = await Promise.all([
      put(
        `/api/curriculum-items/${rowA.id}/requisites`,
        {
          requisites: [{ sourceCourseId: b.id, relationType: 'PREREQUISITE' }],
        },
        admin,
      ),
      put(
        `/api/curriculum-items/${rowB.id}/requisites`,
        {
          requisites: [{ sourceCourseId: a.id, relationType: 'PREREQUISITE' }],
        },
        adminToo,
      ),
    ]);
    expect(results.map((res) => res.status).sort((l, r) => l - r)).toEqual([
      200, 409,
    ]);
    expect(results.find((res) => res.status === 409)?.body.code).toBe(
      'REQUISITE_CYCLE',
    );
    expect(
      await prisma.curriculumRequisite.count({
        where: { item: { versionId } },
      }),
    ).toBe(1);
  });

  it('assigns elective rows to a group; extra courses are allowed (KB-013)', async () => {
    const { versionId } = await draft();
    const created = await admin
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'Tự chọn 1', minCredits: '6' })
      .expect(201);
    expect(created.body).toMatchObject({
      groupCode: 'TC1',
      minCredits: '6',
      minCourses: null,
      itemIds: [],
      listedCredits: '0',
    });
    const ids: string[] = [];
    for (let index = 1; index <= 5; index += 1) {
      const row = await course(`E${index}`);
      ids.push(
        (
          await addCurriculumItem(admin, versionId, {
            courseId: row.id,
            plannedSemester: 5,
            isElective: true,
          })
        ).id,
      );
    }
    const assigned = await put(
      `/api/elective-groups/${created.body.id}/items`,
      { itemIds: ids },
    ).expect(200);
    expect(assigned.body).toMatchObject({ itemCount: 5, listedCredits: '15' });
    const curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.electiveGroups[0].itemIds).toHaveLength(5);
    expect(curriculum.items[0].electiveGroup).toEqual({
      id: created.body.id,
      groupCode: 'TC1',
    });

    // Shrinking the membership ungroups the others.
    const shrunk = await put(`/api/elective-groups/${created.body.id}/items`, {
      itemIds: ids.slice(0, 2),
    }).expect(200);
    expect(shrunk.body).toMatchObject({ itemCount: 2, listedCredits: '6' });
    const ungrouped = await prisma.curriculumItem.count({
      where: { versionId, electiveGroupId: null },
    });
    expect(ungrouped).toBe(3);
  });

  it('refuses a compulsory row, a second group and a foreign row (KB-014, US-026 AC3, AC4)', async () => {
    const { versionId } = await draft();
    const other = await draft();
    const [first, second] = await Promise.all(
      ['TC1', 'TC2'].map((groupCode) =>
        admin
          .post(`/api/program-versions/${versionId}/elective-groups`)
          .set(CSRF)
          .send({ groupCode, groupName: groupCode, minCourses: 1 })
          .expect(201),
      ),
    );
    const compulsory = await course('BB');
    const elective = await course('EL');
    const foreign = await course('FO');
    const compulsoryRow = await addCurriculumItem(admin, versionId, {
      courseId: compulsory.id,
      plannedSemester: 1,
    });
    const electiveRow = await addCurriculumItem(admin, versionId, {
      courseId: elective.id,
      plannedSemester: 1,
      isElective: true,
    });
    const foreignRow = await addCurriculumItem(admin, other.versionId, {
      courseId: foreign.id,
      plannedSemester: 1,
      isElective: true,
    });

    const bb = await put(`/api/elective-groups/${first.body.id}/items`, {
      itemIds: [compulsoryRow.id],
    }).expect(409);
    expect(bb.body.code).toBe('GROUP_REQUIRES_ELECTIVE');
    expect(bb.body.message).toContain(compulsory.courseCode);

    await put(`/api/elective-groups/${first.body.id}/items`, {
      itemIds: [electiveRow.id],
    }).expect(200);
    const taken = await put(`/api/elective-groups/${second.body.id}/items`, {
      itemIds: [electiveRow.id],
    }).expect(409);
    expect(taken.body.code).toBe('ITEM_IN_OTHER_GROUP');

    const crossed = await put(`/api/elective-groups/${first.body.id}/items`, {
      itemIds: [electiveRow.id, foreignRow.id],
    }).expect(400);
    expect(crossed.body.code).toBe('ITEM_NOT_IN_VERSION');

    const toCompulsory = await admin
      .patch(`/api/curriculum-items/${electiveRow.id}`)
      .set(CSRF)
      .send({ isElective: false })
      .expect(409);
    expect(toCompulsory.body.code).toBe('ITEM_IN_ELECTIVE_GROUP');
  });

  it('needs a minimum, keeps codes unique per version and leaves rows elective after delete (US-026 AC2)', async () => {
    const { versionId } = await draft();
    const none = await admin
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'x' })
      .expect(400);
    expect(none.body.code).toBe('GROUP_MINIMUM_REQUIRED');
    const group = await admin
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'x', minCourses: 2 })
      .expect(201);
    const dup = await admin
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'y', minCourses: 1 })
      .expect(409);
    expect(dup.body.code).toBe('ELECTIVE_GROUP_CODE_TAKEN');
    const both = await admin
      .patch(`/api/elective-groups/${group.body.id}`)
      .set(CSRF)
      .send({ minCredits: '6' })
      .expect(200);
    expect(both.body).toMatchObject({ minCredits: '6', minCourses: 2 });
    await admin
      .patch(`/api/elective-groups/${group.body.id}`)
      .set(CSRF)
      .send({ minCourses: null })
      .expect(200);
    const cleared = await admin
      .patch(`/api/elective-groups/${group.body.id}`)
      .set(CSRF)
      .send({ minCredits: null })
      .expect(400);
    expect(cleared.body.code).toBe('GROUP_MINIMUM_REQUIRED');

    const row = await course('E');
    const item = await addCurriculumItem(admin, versionId, {
      courseId: row.id,
      plannedSemester: 1,
      isElective: true,
    });
    await put(`/api/elective-groups/${group.body.id}/items`, {
      itemIds: [item.id],
    }).expect(200);
    await admin
      .delete(`/api/elective-groups/${group.body.id}`)
      .set(CSRF)
      .expect(204);
    const curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.electiveGroups).toEqual([]);
    expect(curriculum.items[0]).toMatchObject({
      isElective: true,
      electiveGroup: null,
    });
  });

  it('reorders inside a semester and moves a row last into another (US-027 AC1, AC2)', async () => {
    const { versionId } = await draft();
    const [a, b, c, d] = await Promise.all([
      course('A'),
      course('B'),
      course('C'),
      course('D'),
    ]);
    const rows: { id: string }[] = [];
    for (const [row, semester] of [
      [a, 1],
      [b, 1],
      [c, 1],
      [d, 2],
    ] as const) {
      rows.push(
        await addCurriculumItem(admin, versionId, {
          courseId: row.id,
          plannedSemester: semester,
        }),
      );
    }
    await put(`/api/program-versions/${versionId}/curriculum-order`, {
      plannedSemester: 1,
      itemIds: [rows[2].id, rows[0].id, rows[1].id],
    }).expect(204);
    let curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.items.map((item: { id: string }) => item.id)).toEqual([
      rows[2].id,
      rows[0].id,
      rows[1].id,
      rows[3].id,
    ]);
    expect(
      curriculum.items.map((item: { sortOrder: number }) => item.sortOrder),
    ).toEqual([1, 2, 3, 1]);

    const missing = await put(
      `/api/program-versions/${versionId}/curriculum-order`,
      { plannedSemester: 1, itemIds: [rows[2].id, rows[0].id] },
    ).expect(409);
    expect(missing.body.code).toBe('CURRICULUM_ORDER_MISMATCH');

    await admin
      .patch(`/api/curriculum-items/${rows[2].id}`)
      .set(CSRF)
      .send({ plannedSemester: 2 })
      .expect(200);
    curriculum = await readCurriculum(admin, versionId);
    expect(curriculum.semesters[0]).toMatchObject({
      itemCount: 2,
      totalCredits: '6',
    });
    expect(curriculum.semesters[1]).toMatchObject({
      itemCount: 2,
      totalCredits: '6',
    });
    const moved = curriculum.items.find(
      (item: { id: string }) => item.id === rows[2].id,
    );
    expect(moved).toMatchObject({ plannedSemester: 2, sortOrder: 2 });
  });

  it('lets R3 of the program edit its curriculum and nobody else (US-021)', async () => {
    const mine = await draft();
    const theirs = await draft();
    const director = await createAccount(app, `curdir${seq}`);
    await assignDirector(app, {
      programId: mine.programId,
      userId: director.id,
    });
    const agent = await loginAgent(app, director);
    const row = await course('A');
    await addCurriculumItem(agent, mine.versionId, {
      courseId: row.id,
      plannedSemester: 1,
    });
    const outside = await postItem(agent, theirs.versionId, {
      courseId: row.id,
      plannedSemester: 1,
    }).expect(403);
    expect(outside.body.code).toBe('OUT_OF_SCOPE');
    const own = await readCurriculum(agent, mine.versionId);
    expect(own).toMatchObject({
      editPath: 'DIRECT',
      canEditStructure: true,
      canAddItems: true,
    });
    const read = await readCurriculum(agent, theirs.versionId);
    expect(read).toMatchObject({
      editPath: null,
      canEditStructure: false,
      canAddItems: false,
    });
  });

  it('lets R4 add and edit rows of its own group only (US-023 AC5)', async () => {
    const { versionId } = await draft();
    const mine = await course('MINE', { groupId: g1Id });
    const theirs = await course('THEIRS', { groupId: g2Id });
    const created = await postItem(coordinator, versionId, {
      courseId: mine.id,
      plannedSemester: 1,
    }).expect(201);
    expect(created.body.canEdit).toBe(true);
    const refused = await postItem(coordinator, versionId, {
      courseId: theirs.id,
      plannedSemester: 1,
    }).expect(403);
    expect(refused.body.code).toBe('OUT_OF_SCOPE');
    await coordinator
      .patch(`/api/curriculum-items/${created.body.id}`)
      .set(CSRF)
      .send({ note: 'Do tổ trưởng sửa' })
      .expect(200);

    const groupRow = await admin
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'x', minCourses: 1 })
      .expect(201);
    const group = await coordinator
      .post(`/api/program-versions/${versionId}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC2', groupName: 'x', minCourses: 1 })
      .expect(403);
    expect(group.body.code).toBe('OUT_OF_SCOPE');
    await put(
      `/api/elective-groups/${groupRow.body.id}/items`,
      { itemIds: [] },
      coordinator,
    ).expect(403);
    const reorder = await put(
      `/api/program-versions/${versionId}/curriculum-order`,
      { plannedSemester: 1, itemIds: [created.body.id] },
      coordinator,
    ).expect(403);
    expect(reorder.body.code).toBe('OUT_OF_SCOPE');

    const adminRow = await addCurriculumItem(admin, versionId, {
      courseId: theirs.id,
      plannedSemester: 2,
    });
    await coordinator
      .patch(`/api/curriculum-items/${adminRow.id}`)
      .set(CSRF)
      .send({ note: 'x' })
      .expect(403);

    const curriculum = await readCurriculum(coordinator, versionId);
    expect(curriculum).toMatchObject({
      canAddItems: true,
      canEditStructure: false,
      editPath: null,
    });
    expect(
      curriculum.items.map((item: { canEdit: boolean }) => item.canEdit),
    ).toEqual([true, false]);
  });

  it('freezes a released version and sends edits through a request (FR-55)', async () => {
    const { programId, versionId } = await draft();
    const row = await course('A');
    const item = await addCurriculumItem(admin, versionId, {
      courseId: row.id,
      plannedSemester: 1,
    });
    await releaseVersionForTest(app, versionId);

    const frozen = await postItem(admin, versionId, {
      courseId: row.id,
      plannedSemester: 2,
    }).expect(409);
    expect(frozen.body.code).toBe('VERSION_NOT_EDITABLE');
    await admin
      .delete(`/api/curriculum-items/${item.id}`)
      .set(CSRF)
      .expect(409);
    const readable = await readCurriculum(admin, versionId);
    expect(readable).toMatchObject({
      editPath: 'VIA_REQUEST',
      canEditStructure: false,
      canAddItems: false,
      version: { status: 'ACTIVE', versionNumber: '1.0' },
    });
    expect(readable.items[0].canEdit).toBe(false);

    // A new Draft of a program that has been released belongs to a change request, not to direct edit.
    const newDraft = await prisma.programVersion.create({
      data: {
        programId,
        programName: 'x',
        majorCode: 'm',
        majorName: 'm',
        semesterCount: 8,
        totalCredits: '1',
        compulsoryCredits: '1',
        electiveCredits: '0',
        status: ProgramVersionStatus.DRAFT,
      },
    });
    const other = await course('B');
    const viaRequest = await postItem(admin, newDraft.id, {
      courseId: other.id,
      plannedSemester: 1,
    }).expect(409);
    expect(viaRequest.body.code).toBe('CHANGE_REQUEST_REQUIRED');
    const drawn = await readCurriculum(admin, newDraft.id);
    expect(drawn).toMatchObject({
      editPath: 'VIA_REQUEST',
      canAddItems: false,
    });
  });

  it('reads 60 rows in one go', async () => {
    const { versionId } = await draft();
    const created = [];
    for (let index = 0; index < 60; index += 1) {
      created.push({
        versionId,
        courseId: (await course(`B${index}`)).id,
        plannedSemester: (index % 8) + 1,
        sortOrder: Math.floor(index / 8) + 1,
        isElective: false,
      });
    }
    await prisma.curriculumItem.createMany({ data: created });
    const started = Date.now();
    const curriculum = await readCurriculum(admin, versionId);
    const elapsed = Date.now() - started;
    expect(curriculum.items).toHaveLength(60);
    // NFR smoke, not a gate: the budget is generous so a slow CI container does not flake.
    expect(elapsed).toBeLessThan(2000);
  });

  it('answers 404 for an unknown version, row or group', async () => {
    expect(
      (await admin.get('/api/program-versions/ghost/curriculum').expect(404))
        .body.code,
    ).toBe('PROGRAM_VERSION_NOT_FOUND');
    expect(
      (await admin.delete('/api/curriculum-items/ghost').set(CSRF).expect(404))
        .body.code,
    ).toBe('CURRICULUM_ITEM_NOT_FOUND');
    expect(
      (await admin.delete('/api/elective-groups/ghost').set(CSRF).expect(404))
        .body.code,
    ).toBe('ELECTIVE_GROUP_NOT_FOUND');
  });

  it('holds the shape rules at the database (BE-01)', async () => {
    const { versionId } = await draft();
    const [a, b] = await Promise.all([course('A'), course('B')]);
    const group = await prisma.electiveGroup.create({
      data: { versionId, groupCode: 'G', groupName: 'g', minCourses: 1 },
    });
    await expect(
      prisma.curriculumItem.create({
        data: {
          versionId,
          courseId: a.id,
          plannedSemester: 1,
          sortOrder: 1,
          isElective: false,
          electiveGroupId: group.id,
        },
      }),
    ).rejects.toThrow(/CurriculumItem_group_needs_elective/);
    await expect(
      prisma.curriculumItem.create({
        data: {
          versionId,
          courseId: a.id,
          plannedSemester: 0,
          sortOrder: 1,
          isElective: false,
        },
      }),
    ).rejects.toThrow(/CurriculumItem_semester_positive/);
    await expect(
      prisma.curriculumItem.create({
        data: {
          versionId,
          courseId: a.id,
          plannedSemester: 1,
          sortOrder: 0,
          isElective: false,
        },
      }),
    ).rejects.toThrow(/CurriculumItem_sort_positive/);
    await expect(
      prisma.electiveGroup.create({
        data: { versionId, groupCode: 'H', groupName: 'h' },
      }),
    ).rejects.toThrow(/ElectiveGroup_has_minimum/);
    const item = await prisma.curriculumItem.create({
      data: {
        versionId,
        courseId: a.id,
        plannedSemester: 1,
        sortOrder: 1,
        isElective: false,
      },
    });
    await expect(
      prisma.curriculumRequisite.create({
        data: {
          itemId: item.id,
          sourceCourseId: b.id,
          relationType: CourseRelationType.REPLACEMENT,
        },
      }),
    ).rejects.toThrow(/CurriculumRequisite_not_replacement/);
    await expect(
      prisma.curriculumRequisite.create({
        data: {
          itemId: item.id,
          sourceCourseId: b.id,
          relationType: CourseRelationType.COREQUISITE,
          minScore: '2',
        },
      }),
    ).rejects.toThrow(/CurriculumRequisite_min_score_prerequisite/);
    await expect(
      prisma.curriculumItem.create({
        data: {
          versionId,
          courseId: a.id,
          plannedSemester: 2,
          sortOrder: 1,
          isElective: false,
        },
      }),
    ).rejects.toThrow(/Unique constraint/);
  });
});
