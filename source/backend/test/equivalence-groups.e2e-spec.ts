import type { NestExpressApplication } from '@nestjs/platform-express';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { CourseStatus } from '../src/generated/prisma/client.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse, createForeignFaculty } from './fixtures/courses.js';
import { startPostgres, startRedis } from './containers.js';
import { applyMigrations } from './migrations.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
const MATH_CODE = 'KHOA_TOAN_EQ';

type Agent = ReturnType<typeof request.agent>;

describe('equivalence groups', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let director: Agent;
  let student: Agent;

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
    admin = await loginAgent(app, await createAccount(app, 'eqadmin', 'R1'));
    director = await loginAgent(app, await createAccount(app, 'eqdir', 'R3'));
    student = await loginAgent(app, await createAccount(app, 'eqstu', 'R6'));
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

  function createGroup(
    groupCode: string,
    courseIds: string[],
    agent: Agent = admin,
  ) {
    return agent
      .post('/api/equivalence-groups')
      .set(CSRF)
      .send({ groupCode, courseIds });
  }

  async function equivalentsOf(courseId: string) {
    const detail = await student.get(`/api/courses/${courseId}`).expect(200);
    return detail.body.equivalenceGroup;
  }

  const codes = (members: { courseCode: string }[]) =>
    members.map((m) => m.courseCode);

  it('makes A, B and C equivalent when C joins {A, B}, each page listing the others (KB-006, US-017 AC1-AC2)', async () => {
    const [a, b, c] = await courses('KB006_A', 'KB006_B', 'KB006_C');
    const created = await createGroup(' kb006 ', [a.id, b.id]).expect(201);
    expect(created.body.groupCode).toBe('KB006');
    expect(codes(created.body.members)).toEqual(['KB006_A', 'KB006_B']);
    const groupId = created.body.id;

    const added = await admin
      .post(`/api/equivalence-groups/${groupId}/members`)
      .set(CSRF)
      .send({ courseId: c.id })
      .expect(201);
    expect(codes(added.body.members)).toEqual([
      'KB006_A',
      'KB006_B',
      'KB006_C',
    ]);

    expect(codes((await equivalentsOf(c.id)).members)).toEqual([
      'KB006_A',
      'KB006_B',
    ]);
    const forA = await equivalentsOf(a.id);
    expect(forA.groupCode).toBe('KB006');
    expect(codes(forA.members)).toEqual(['KB006_B', 'KB006_C']);
  });

  it('refuses a course already in another group, names that group and offers a merge (KB-006 tail, US-017 AC3)', async () => {
    const [a, b, c, d] = await courses(
      'KB006T_A',
      'KB006T_B',
      'KB006T_C',
      'KB006T_D',
    );
    const first = await createGroup('KB006T1', [a.id, b.id, c.id]).expect(201);
    const second = await createGroup('KB006T2', [
      d.id,
      (await courses('KB006T_E'))[0].id,
    ]).expect(201);
    const clash = await admin
      .post(`/api/equivalence-groups/${second.body.id}/members`)
      .set(CSRF)
      .send({ courseId: c.id })
      .expect(409);
    expect(clash.body.code).toBe('COURSE_ALREADY_GROUPED');
    expect(clash.body.message).toContain('KB006T_C (nhóm KB006T1)');
    // The course page carries the group id the client needs to offer the merge.
    expect((await equivalentsOf(c.id)).id).toBe(first.body.id);

    const merged = await admin
      .post(`/api/equivalence-groups/${second.body.id}/merge`)
      .set(CSRF)
      .send({ otherGroupId: first.body.id })
      .expect(200);
    expect(merged.body.groupCode).toBe('KB006T2');
    expect(merged.body.members).toHaveLength(5);
    await admin.get(`/api/equivalence-groups/${first.body.id}`).expect(404);
    expect((await equivalentsOf(c.id)).groupCode).toBe('KB006T2');
  });

  it('groups old-code, new-code and foreign courses of different credits (KB-007, US-017 AC4)', async () => {
    const oldCode = await createCourse(app, {
      courseCode: 'KB007_OLD',
      credits: '2',
    });
    const newCode = await createCourse(app, {
      courseCode: 'KB007_NEW',
      credits: '3',
    });
    const foreign = await createCourse(app, {
      courseCode: 'KB007_FOREIGN',
      credits: '4.5',
      facultyCode: MATH_CODE,
    });
    const created = await createGroup('KB007', [
      oldCode.id,
      newCode.id,
      foreign.id,
    ]).expect(201);
    expect(
      created.body.members.map((m: { credits: string }) => m.credits),
    ).toEqual(['4.5', '3', '2']);
  });

  it('leaves groups to R1 alone (D8)', async () => {
    const [a, b, c] = await courses('R1ONLY_A', 'R1ONLY_B', 'R1ONLY_C');
    const denied = await createGroup('R1ONLY', [a.id, b.id], director).expect(
      403,
    );
    expect(denied.body.code).toBe('PERMISSION_DENIED');
    const created = await createGroup('R1ONLY', [a.id, b.id]).expect(201);
    const attempts = [
      () =>
        director
          .post(`/api/equivalence-groups/${created.body.id}/members`)
          .send({ courseId: c.id }),
      () =>
        director.delete(
          `/api/equivalence-groups/${created.body.id}/members/${a.id}`,
        ),
      () =>
        director
          .patch(`/api/equivalence-groups/${created.body.id}`)
          .send({ note: 'x' }),
      () =>
        director.post(`/api/equivalence-groups/${created.body.id}/dissolve`),
    ];
    for (const attempt of attempts) {
      const res = await attempt().set(CSRF).expect(403);
      expect(res.body.code).toBe('PERMISSION_DENIED');
    }
    // Everyone with course.view can read.
    await student.get(`/api/equivalence-groups/${created.body.id}`).expect(200);
    expect(
      (await director.get('/api/equivalence-groups?q=R1ONLY').expect(200)).body
        .total,
    ).toBe(1);
  });

  it('keeps a group at two members or more and dissolves it on request', async () => {
    const [a, b, c] = await courses('MIN_A', 'MIN_B', 'MIN_C');
    const created = await createGroup('MINGRP', [a.id, b.id, c.id]).expect(201);
    const id = created.body.id;
    const removed = await admin
      .delete(`/api/equivalence-groups/${id}/members/${c.id}`)
      .set(CSRF)
      .expect(200);
    expect(codes(removed.body.members)).toEqual(['MIN_A', 'MIN_B']);
    expect(await equivalentsOf(c.id)).toBeNull();
    const tooFew = await admin
      .delete(`/api/equivalence-groups/${id}/members/${a.id}`)
      .set(CSRF)
      .expect(409);
    expect(tooFew.body.code).toBe('GROUP_MIN_MEMBERS');
    const stranger = await admin
      .delete(`/api/equivalence-groups/${id}/members/${c.id}`)
      .set(CSRF)
      .expect(404);
    expect(stranger.body.code).toBe('EQUIVALENCE_NOT_A_MEMBER');

    await admin
      .post(`/api/equivalence-groups/${id}/dissolve`)
      .set(CSRF)
      .expect(204);
    await admin.get(`/api/equivalence-groups/${id}`).expect(404);
    expect(await equivalentsOf(a.id)).toBeNull();
    expect(await equivalentsOf(b.id)).toBeNull();
    // Freed courses can join a new group.
    await createGroup('MINGRP2', [a.id, b.id]).expect(201);
  });

  it('validates codes, members and merge targets', async () => {
    const [a, b, c] = await courses('VAL_A', 'VAL_B', 'VAL_C');
    const dead = await createCourse(app, {
      courseCode: 'VAL_DEAD',
      status: CourseStatus.CANCELLED,
    });
    const one = await createGroup('VAL1', [a.id]).expect(400);
    expect(one.body.code).toBe('VALIDATION_FAILED');
    const twice = await createGroup('VAL1', [a.id, a.id]).expect(400);
    expect(twice.body.code).toBe('VALIDATION_FAILED');
    const cancelled = await createGroup('VAL1', [a.id, dead.id]).expect(409);
    expect(cancelled.body.code).toBe('MEMBER_COURSE_CANCELLED');
    const unknown = await createGroup('VAL1', [a.id, 'ghost']).expect(400);
    expect(unknown.body.code).toBe('MEMBER_COURSE_NOT_FOUND');
    const created = await createGroup('VAL1', [a.id, b.id]).expect(201);
    const taken = await createGroup('val1', [
      c.id,
      (await courses('VAL_D'))[0].id,
    ]).expect(409);
    expect(taken.body.code).toBe('EQUIVALENCE_GROUP_CODE_TAKEN');
    // A failed create leaves no half-built group behind.
    expect(
      await prisma.equivalentCourseGroup.count({
        where: { groupCode: 'VAL1' },
      }),
    ).toBe(1);
    const self = await admin
      .post(`/api/equivalence-groups/${created.body.id}/merge`)
      .set(CSRF)
      .send({ otherGroupId: created.body.id })
      .expect(400);
    expect(self.body.code).toBe('MERGE_SAME_GROUP');
    const renamed = await admin
      .patch(`/api/equivalence-groups/${created.body.id}`)
      .set(CSRF)
      .send({ groupCode: ' val9 ', note: ' Ghi chú ' })
      .expect(200);
    expect(renamed.body).toMatchObject({ groupCode: 'VAL9', note: 'Ghi chú' });
  });

  it('searches by group code or a member course code', async () => {
    const [a, b] = await courses('SRCH_ALPHA', 'SRCH_BETA');
    await createGroup('SRCHGRP', [a.id, b.id]).expect(201);
    const byGroup = await student
      .get('/api/equivalence-groups?q=srchg')
      .expect(200);
    expect(byGroup.body.total).toBe(1);
    const byMember = await student
      .get('/api/equivalence-groups?q=srch_be')
      .expect(200);
    expect(byMember.body.items[0].groupCode).toBe('SRCHGRP');
    const none = await student
      .get('/api/equivalence-groups?q=zzzz')
      .expect(200);
    expect(none.body.total).toBe(0);
  });
});
