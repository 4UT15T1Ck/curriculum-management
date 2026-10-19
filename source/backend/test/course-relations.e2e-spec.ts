import type { NestExpressApplication } from '@nestjs/platform-express';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import {
  CourseRelationType,
  CourseStatus,
} from '../src/generated/prisma/client.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse, createForeignFaculty } from './fixtures/courses.js';
import {
  addMembership,
  createSubjectGroup,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { applyMigrations } from './migrations.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
const MATH_CODE = 'KHOA_TOAN_REL';

type Agent = ReturnType<typeof request.agent>;

describe('course relations', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let director: Agent;
  let lecturer: Agent;
  let student: Agent;
  let g1Id: string;
  let g2Id: string;

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
    await createForeignFaculty(app, MATH_CODE);
    g1Id = (await createSubjectGroup(app, 'REL_G1')).id;
    g2Id = (await createSubjectGroup(app, 'REL_G2')).id;
    admin = await loginAgent(app, await createAccount(app, 'reladmin', 'R1'));
    director = await loginAgent(app, await createAccount(app, 'reldir', 'R3'));
    student = await loginAgent(app, await createAccount(app, 'relstu', 'R6'));
    const lecturerAccount = await createAccount(app, 'rellecturer');
    await addMembership(app, { groupId: g1Id, userId: lecturerAccount.id });
    lecturer = await loginAgent(app, lecturerAccount);
    // Concurrent requests need a server that stays up between them.
    await app.listen(0);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  async function courses(...codes: string[]) {
    return Promise.all(
      codes.map((courseCode) => createCourse(app, { courseCode })),
    );
  }

  function relate(
    agent: Agent,
    sourceCourseId: string,
    targetCourseId: string,
    relationType: CourseRelationType,
    minScore?: string,
  ) {
    return agent
      .post('/api/course-relations')
      .set(CSRF)
      .send({ sourceCourseId, targetCourseId, relationType, minScore });
  }

  it('shows a prior-study relation on both courses (US-015 AC1)', async () => {
    const [a, b] = await courses('REL_AC1_A', 'REL_AC1_B');
    const created = await relate(admin, a.id, b.id, 'PRIOR').expect(201);
    expect(created.body).toMatchObject({
      relationType: 'PRIOR',
      sourceCourse: { courseCode: 'REL_AC1_A', credits: '3', status: 'ACTIVE' },
      targetCourse: { courseCode: 'REL_AC1_B' },
      minScore: null,
      editPath: 'DIRECT',
    });
    for (const id of [a.id, b.id]) {
      const list = await student
        .get(`/api/courses/${id}/relations`)
        .expect(200);
      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(created.body.id);
      expect(list.body[0].editPath).toBeNull();
    }
  });

  it('stores an optional threshold on prerequisites only, as a string (US-015 AC2)', async () => {
    const [a, b, c] = await courses('REL_AC2_A', 'REL_AC2_B', 'REL_AC2_C');
    const withScore = await relate(
      admin,
      a.id,
      b.id,
      'PREREQUISITE',
      '2.5',
    ).expect(201);
    expect(withScore.body.minScore).toBe('2.5');
    const without = await relate(admin, a.id, c.id, 'PREREQUISITE').expect(201);
    expect(without.body.minScore).toBeNull();

    const tooHigh = await relate(
      admin,
      b.id,
      c.id,
      'PREREQUISITE',
      '4.5',
    ).expect(400);
    expect(tooHigh.body.code).toBe('VALIDATION_FAILED');
    expect(tooHigh.body.details[0].field).toBe('minScore');

    const onPrior = await relate(admin, b.id, c.id, 'PRIOR', '2').expect(400);
    expect(onPrior.body.code).toBe('MIN_SCORE_NOT_ALLOWED');

    const patched = await admin
      .patch(`/api/course-relations/${without.body.id}`)
      .set(CSRF)
      .send({ minScore: '3' })
      .expect(200);
    expect(patched.body.minScore).toBe('3');
    const cleared = await admin
      .patch(`/api/course-relations/${without.body.id}`)
      .set(CSRF)
      .send({ minScore: null })
      .expect(200);
    expect(cleared.body.minScore).toBeNull();
    const coreq = await relate(admin, b.id, c.id, 'COREQUISITE').expect(201);
    const refused = await admin
      .patch(`/api/course-relations/${coreq.body.id}`)
      .set(CSRF)
      .send({ minScore: '2' })
      .expect(400);
    expect(refused.body.code).toBe('MIN_SCORE_NOT_ALLOWED');
  });

  it('refuses the same relation twice and a relation with itself (US-015 AC3, AC4)', async () => {
    const [a, b] = await courses('REL_DUP_A', 'REL_DUP_B');
    await relate(admin, a.id, b.id, 'PRIOR').expect(201);
    const duplicate = await relate(admin, a.id, b.id, 'PRIOR').expect(409);
    expect(duplicate.body.code).toBe('RELATION_EXISTS');
    await relate(admin, a.id, b.id, 'COREQUISITE').expect(201);
    const self = await relate(admin, a.id, a.id, 'PRIOR').expect(400);
    expect(self.body.code).toBe('RELATION_SELF');
    const ghost = await relate(admin, a.id, 'ghost', 'PRIOR').expect(400);
    expect(ghost.body.code).toBe('RELATION_COURSE_NOT_FOUND');
  });

  it('backs the service checks with database constraints', async () => {
    const [a, b] = await courses('REL_DB_A', 'REL_DB_B');
    await expect(
      prisma.courseRelation.create({
        data: {
          sourceCourseId: a.id,
          targetCourseId: a.id,
          relationType: 'PRIOR',
        },
      }),
    ).rejects.toThrow(/CourseRelation_not_self/);
    await expect(
      prisma.$executeRaw`INSERT INTO "CourseRelation" ("id","sourceCourseId","targetCourseId","relationType","minScore","updatedAt") VALUES ('x', ${a.id}, ${b.id}, 'PRIOR', 2, now())`,
    ).rejects.toThrow(/CourseRelation_minScore_prerequisite_only/);
  });

  it('refuses a two-course prerequisite loop and names it (KB-004, NT-B1-04)', async () => {
    const [a, b] = await courses('KB004_A', 'KB004_B');
    await relate(admin, a.id, b.id, 'PREREQUISITE').expect(201);
    const loop = await relate(admin, b.id, a.id, 'PREREQUISITE').expect(409);
    expect(loop.body.code).toBe('REQUISITE_CYCLE');
    expect(loop.body.message).toMatch(/: KB004_A → KB004_B → KB004_A\.$/);
    expect(
      await prisma.courseRelation.count({ where: { sourceCourseId: b.id } }),
    ).toBe(0);
  });

  it('refuses a loop over mixed prior and prerequisite edges, but never checks corequisites (KB-005)', async () => {
    const [a, b, c, d, e] = await courses(
      'KB005_A',
      'KB005_B',
      'KB005_C',
      'KB005_D',
      'KB005_E',
    );
    await relate(admin, a.id, b.id, 'PREREQUISITE').expect(201);
    await relate(admin, b.id, c.id, 'PRIOR').expect(201);
    const loop = await relate(admin, c.id, a.id, 'PREREQUISITE').expect(409);
    expect(loop.body.message).toMatch(
      /KB005_A → KB005_B → KB005_C → KB005_A\.$/,
    );
    const prior = await relate(admin, c.id, a.id, 'PRIOR').expect(409);
    expect(prior.body.code).toBe('REQUISITE_CYCLE');
    await relate(admin, d.id, e.id, 'COREQUISITE').expect(201);
    await relate(admin, e.id, d.id, 'COREQUISITE').expect(201);
    // A replacement against the grain is not a loop either.
    await relate(admin, c.id, a.id, 'REPLACEMENT').expect(201);
  });

  it('lets exactly one of two opposite prerequisites win a race', async () => {
    const [a, b] = await courses('RACE_A', 'RACE_B');
    const results = await Promise.all([
      relate(admin, a.id, b.id, 'PREREQUISITE'),
      relate(admin, b.id, a.id, 'PREREQUISITE'),
    ]);
    expect(
      results.map((res) => res.status).sort((left, right) => left - right),
    ).toEqual([201, 409]);
    expect(results.find((res) => res.status === 409)?.body.code).toBe(
      'REQUISITE_CYCLE',
    );
    expect(
      await prisma.courseRelation.count({
        where: { sourceCourseId: { in: [a.id, b.id] } },
      }),
    ).toBe(1);
  });

  it('judges a relation by the course that owns it (D2)', async () => {
    const own = await createCourse(app, {
      courseCode: 'OWN_G1',
      groupId: g1Id,
    });
    const other = await createCourse(app, {
      courseCode: 'OWN_G2',
      groupId: g2Id,
    });
    const [free] = await courses('OWN_FREE');
    // The requirement belongs to the target: a G1 member may declare it with any source.
    await relate(lecturer, free.id, own.id, 'PREREQUISITE').expect(201);
    const outside = await relate(
      lecturer,
      free.id,
      other.id,
      'PREREQUISITE',
    ).expect(403);
    expect(outside.body.code).toBe('OUT_OF_SCOPE');
    const noRight = await relate(student, free.id, own.id, 'PRIOR').expect(403);
    expect(noRight.body.code).toBe('PERMISSION_DENIED');
    // A replacement belongs to the discontinued source.
    await relate(lecturer, own.id, free.id, 'REPLACEMENT').expect(201);
    const foreign = await relate(
      lecturer,
      other.id,
      free.id,
      'REPLACEMENT',
    ).expect(403);
    expect(foreign.body.code).toBe('OUT_OF_SCOPE');
  });

  it('asks R3 for a change request on a course of another faculty and lets R1 through', async () => {
    const math = await createCourse(app, {
      courseCode: 'FOR_MATH',
      facultyCode: MATH_CODE,
    });
    const [home, other] = await courses('FOR_HOME', 'FOR_OTHER');
    // The requirement belongs to the target: a home course needing a foreign one is the director's to declare.
    await relate(director, math.id, home.id, 'PREREQUISITE').expect(201);
    // A foreign course holding the requirement is not.
    const needsRequest = await relate(
      director,
      other.id,
      math.id,
      'PREREQUISITE',
    ).expect(409);
    expect(needsRequest.body.code).toBe('CHANGE_REQUEST_REQUIRED');
    await relate(admin, other.id, math.id, 'PREREQUISITE').expect(201);
    const list = await director
      .get(`/api/courses/${math.id}/relations`)
      .expect(200);
    const owned = (target: string) =>
      list.body.find(
        (item: { targetCourse: { id: string } }) =>
          item.targetCourse.id === target,
      );
    expect(owned(home.id).editPath).toBe('DIRECT');
    expect(owned(math.id).editPath).toBe('VIA_REQUEST');
  });

  it('keeps a Cancelled course out of relations and hides it from callers without course.edit', async () => {
    const [a] = await courses('CAN_A');
    const dead = await createCourse(app, {
      courseCode: 'CAN_DEAD',
      status: CourseStatus.CANCELLED,
    });
    const refused = await relate(admin, a.id, dead.id, 'PRIOR').expect(409);
    expect(refused.body.code).toBe('RELATION_COURSE_CANCELLED');
    await student.get(`/api/courses/${dead.id}/relations`).expect(404);
    await admin.get(`/api/courses/${dead.id}/relations`).expect(200);
  });

  it('deletes a relation but keeps the last replacement of a Discontinued course', async () => {
    const [x, y, z] = await courses('REM_X', 'REM_Y', 'REM_Z');
    const first = await relate(admin, x.id, y.id, 'REPLACEMENT').expect(201);
    await admin.post(`/api/courses/${x.id}/discontinue`).set(CSRF).expect(200);
    const kept = await admin
      .delete(`/api/course-relations/${first.body.id}`)
      .set(CSRF)
      .expect(409);
    expect(kept.body.code).toBe('REPLACEMENT_STILL_NEEDED');
    const second = await relate(admin, x.id, z.id, 'REPLACEMENT').expect(201);
    await admin
      .delete(`/api/course-relations/${first.body.id}`)
      .set(CSRF)
      .expect(204);
    const last = await admin
      .delete(`/api/course-relations/${second.body.id}`)
      .set(CSRF)
      .expect(409);
    expect(last.body.code).toBe('REPLACEMENT_STILL_NEEDED');
    const missing = await admin
      .delete(`/api/course-relations/${first.body.id}`)
      .set(CSRF)
      .expect(404);
    expect(missing.body.code).toBe('RELATION_NOT_FOUND');
  });

  it('does not count a replacement that is itself discontinued when discontinuing (HP-02)', async () => {
    const [x, y] = await courses('HP_X', 'HP_Y');
    await relate(admin, x.id, y.id, 'REPLACEMENT').expect(201);
    await prisma.course.update({
      where: { id: y.id },
      data: { status: CourseStatus.DISCONTINUED },
    });
    const res = await admin
      .post(`/api/courses/${x.id}/discontinue`)
      .set(CSRF)
      .expect(409);
    expect(res.body.code).toBe('REPLACEMENT_REQUIRED');
  });
});
