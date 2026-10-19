import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestPostgres, TestRedis } from './containers.js';
import request from 'supertest';
import {
  DegreeLevel,
  ProgramStatus,
  ProgramVersionStatus,
  SubjectGroupMemberRole,
  UserStatus,
} from '../src/generated/prisma/client.js';
import {
  SEED_PROGRAM_CODES,
  seedPrograms,
} from '../prisma/seed-data/programs.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { toIsoDay } from '../src/shared/time/today.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse } from './fixtures/courses.js';
import { addCurriculumItem, readCurriculum } from './fixtures/curriculum.js';
import { createProgram } from './fixtures/programs.js';
import {
  addMembership,
  createSubjectGroup,
  daysFromToday,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

const ISO = (days: number) => toIsoDay(daysFromToday(days));

describe('programs and program directors', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let viewer: Agent;
  let student: Agent;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    admin = await loginAgent(app, await createAccount(app, 'pgadmin', 'R1'));
    viewer = await loginAgent(app, await createAccount(app, 'pgviewer', 'R2'));
    // R6 is derived from enrolment (F-17), so the test gives it by hand and scopes it to a unit other than the programs' faculty.
    student = await loginAgent(
      app,
      await createAccount(app, 'pgstudent', 'R6', { unitCode: 'PDT' }),
    );
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  function body(programCode: string, patch: Record<string, unknown> = {}) {
    return {
      programCode,
      degreeLevel: 'ENGINEER',
      programName: `Chương trình ${programCode}`,
      majorCode: '7480106',
      majorName: 'Kỹ thuật máy tính',
      semesterCount: 10,
      totalCredits: '150',
      compulsoryCredits: '140',
      electiveCredits: '10',
      ...patch,
    };
  }

  const create = (code: string, patch: Record<string, unknown> = {}) =>
    admin.post('/api/programs').set(CSRF).send(body(code, patch));

  function assign(
    programId: string,
    directorId: string,
    patch: Record<string, unknown> = {},
  ) {
    return admin
      .post(`/api/programs/${programId}/directors`)
      .set(CSRF)
      .send({ directorId, validFrom: ISO(-5), ...patch });
  }

  async function director(username: string) {
    const account = await createAccount(app, username);
    return { account, agent: await loginAgent(app, account) };
  }

  it('creates a program with one Draft version and reads it back (US-019 AC1)', async () => {
    const created = await create('P_CREATE').expect(201);
    expect(created.body).toMatchObject({
      programCode: 'P_CREATE',
      degreeLevel: 'ENGINEER',
      status: 'ACTIVE',
      faculty: { unitCode: 'KHOA_CNTT' },
      programName: 'Chương trình P_CREATE',
      currentVersion: { versionNumber: null, status: 'DRAFT' },
      draftVersion: {
        totalCredits: '150',
        compulsoryCredits: '140',
        electiveCredits: '10',
        semesterCount: 10,
      },
      versions: [{ versionNumber: null, status: 'DRAFT' }],
      clonedFrom: null,
      editPath: 'DIRECT',
      canManage: true,
      canClone: true,
      directors: [],
    });
    const detail = await admin
      .get(`/api/programs/${created.body.id}`)
      .expect(200);
    expect(detail.body.id).toBe(created.body.id);
    expect(
      await prisma.programVersion.count({
        where: { programId: created.body.id },
      }),
    ).toBe(1);
  });

  it('refuses 150 = 120 + 25 and states the gap (KB-011)', async () => {
    const refused = await create('P_KB011', {
      compulsoryCredits: '120',
      electiveCredits: '25',
    }).expect(400);
    expect(refused.body.code).toBe('CREDITS_MISMATCH');
    expect(refused.body.message).toContain('chênh lệch 5');
    expect(
      await prisma.program.count({ where: { programCode: 'P_KB011' } }),
    ).toBe(0);
    await create('P_KB011', {
      compulsoryCredits: '120',
      electiveCredits: '30',
    }).expect(201);
  });

  it('keeps an Engineer and a Bachelor program side by side (US-019 AC3)', async () => {
    await create('P_ENG', { degreeLevel: 'ENGINEER' }).expect(201);
    await create('P_BAC', {
      degreeLevel: 'BACHELOR',
      semesterCount: 8,
      totalCredits: '120',
      compulsoryCredits: '110',
    }).expect(201);
    const bachelors = await admin
      .get('/api/programs?degreeLevel=BACHELOR&q=P_BAC')
      .expect(200);
    expect(bachelors.body.items).toHaveLength(1);
    expect(bachelors.body.items[0]).toMatchObject({
      programCode: 'P_BAC',
      degreeLevel: 'BACHELOR',
    });
    const engineers = await admin
      .get('/api/programs?degreeLevel=ENGINEER&q=P_ENG')
      .expect(200);
    expect(
      engineers.body.items.map((p: { programCode: string }) => p.programCode),
    ).toEqual(['P_ENG']);
  });

  it('validates the body and the code', async () => {
    const badSemesters = await create('P_BADSEM', { semesterCount: 13 }).expect(
      400,
    );
    expect(badSemesters.body.code).toBe('VALIDATION_FAILED');
    await create('P_BADCRED', { totalCredits: '-1' }).expect(400);
    const dup = await create('P_CREATE').expect(409);
    expect(dup.body.code).toBe('PROGRAM_CODE_TAKEN');
    const faculty = await create('P_FAC', { facultyId: 'ghost' }).expect(400);
    expect(faculty.body.code).toBe('PROGRAM_FACULTY_INVALID');
  });

  it('edits the Draft info, lets nobody else create, and keeps the code', async () => {
    const created = await create('P_EDIT').expect(201);
    const patched = await admin
      .patch(`/api/programs/${created.body.id}`)
      .set(CSRF)
      .send({ programName: 'Tên mới', electiveCredits: '10', semesterCount: 9 })
      .expect(200);
    expect(patched.body.draftVersion).toMatchObject({
      programName: 'Tên mới',
      semesterCount: 9,
    });
    const mismatch = await admin
      .patch(`/api/programs/${created.body.id}`)
      .set(CSRF)
      .send({ electiveCredits: '12' })
      .expect(400);
    expect(mismatch.body.message).toContain('chênh lệch 2');
    await admin
      .patch(`/api/programs/${created.body.id}`)
      .set(CSRF)
      .send({ programCode: 'OTHER' })
      .expect(400);
    await viewer.post('/api/programs').set(CSRF).send(body('P_R2')).expect(403);
  });

  it('lets a director direct two programs and shows them on both (US-020 AC1)', async () => {
    const a = (await createProgram(app, { programCode: 'P_TWO_A' })).id;
    const b = (await createProgram(app, { programCode: 'P_TWO_B' })).id;
    const { account, agent } = await director('pgtwo');
    const before = await agent.get('/api/auth/me').expect(200);
    expect(before.body.roles).toEqual([]);
    await assign(a, account.id).expect(201);
    await assign(b, account.id).expect(201);
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.roles).toEqual([
      expect.objectContaining({ roleCode: 'R3', derived: true }),
    ]);
    const list = await admin.get('/api/programs?q=P_TWO').expect(200);
    for (const item of list.body.items) {
      expect(item.directors).toEqual([
        { id: account.id, fullName: account.username },
      ]);
    }
    expect(list.body.items).toHaveLength(2);
  });

  it('allows two directors at once but not the same person twice (US-020 AC3)', async () => {
    const program = (await createProgram(app, { programCode: 'P_PAIR' })).id;
    const first = await director('pgpairone');
    const second = await director('pgpairtwo');
    await assign(program, first.account.id).expect(201);
    await assign(program, second.account.id).expect(201);
    const overlap = await assign(program, first.account.id, {
      validFrom: ISO(-1),
      validTo: ISO(3),
    }).expect(409);
    expect(overlap.body.code).toBe('DIRECTOR_PERIOD_OVERLAP');
    const list = await admin.get('/api/programs?q=P_PAIR').expect(200);
    expect(list.body.items[0].directors).toHaveLength(2);
    const reversed = await assign(program, second.account.id, {
      validFrom: ISO(10),
      validTo: ISO(5),
    }).expect(400);
    expect(reversed.body.code).toBe('VALIDITY_INVALID');
  });

  it('refuses a disabled person and an inactive program as director', async () => {
    const program = (await createProgram(app, { programCode: 'P_BADDIR' })).id;
    const gone = await createAccount(app, 'pggone');
    await prisma.user.update({
      where: { id: gone.id },
      data: { status: UserStatus.DISABLED },
    });
    const refused = await assign(program, gone.id).expect(400);
    expect(refused.body.code).toBe('DIRECTOR_INVALID');
    const ghost = await assign(program, 'ghost').expect(400);
    expect(ghost.body.code).toBe('DIRECTOR_INVALID');
    await prisma.program.update({
      where: { id: program },
      data: { status: ProgramStatus.INACTIVE },
    });
    const inactive = await assign(
      program,
      (await createAccount(app, 'pgok')).id,
    ).expect(409);
    expect(inactive.body.code).toBe('PROGRAM_INACTIVE');
  });

  it('edits only the directed program, and stops at once when the row ends (US-021 AC1, AC2, US-020 AC2)', async () => {
    const a = (await createProgram(app, { programCode: 'P_SCOPE_A' })).id;
    const b = (await createProgram(app, { programCode: 'P_SCOPE_B' })).id;
    const { account, agent } = await director('pgscope');
    const row = await assign(a, account.id).expect(201);
    await agent
      .patch(`/api/programs/${a}`)
      .set(CSRF)
      .send({ programName: 'Do giám đốc sửa' })
      .expect(200);
    await agent.get(`/api/programs/${b}`).expect(200);
    const outside = await agent
      .patch(`/api/programs/${b}`)
      .set(CSRF)
      .send({ programName: 'Không được' })
      .expect(403);
    expect(outside.body.code).toBe('OUT_OF_SCOPE');
    const detailA = await agent.get(`/api/programs/${a}`).expect(200);
    expect(detailA.body).toMatchObject({
      editPath: 'DIRECT',
      canManage: false,
    });
    const detailB = await agent.get(`/api/programs/${b}`).expect(200);
    expect(detailB.body.editPath).toBeNull();
    // R3 may not deactivate, create or clone even on the directed program.
    await agent.post(`/api/programs/${a}/deactivate`).set(CSRF).expect(403);
    await agent.post('/api/programs').set(CSRF).send(body('P_R3')).expect(403);
    await agent
      .post(`/api/programs/${a}/clone`)
      .set(CSRF)
      .send({ programCode: 'P_R3C', programName: 'x' })
      .expect(403);

    await admin
      .post(`/api/programs/${a}/directors/${row.body.id}/end`)
      .set(CSRF)
      .send({ validTo: ISO(-1) })
      .expect(200);
    const expired = await agent
      .patch(`/api/programs/${a}`)
      .set(CSRF)
      .send({ programName: 'Hết hạn' })
      .expect(403);
    expect(expired.body.code).toBe('PERMISSION_DENIED');
    const summary = await admin.get('/api/programs?q=P_SCOPE_A').expect(200);
    expect(summary.body.items[0].directors).toEqual([]);
    const history = await admin.get(`/api/programs/${a}/directors`).expect(200);
    expect(history.body).toEqual([
      expect.objectContaining({
        id: row.body.id,
        state: 'EXPIRED',
        validTo: ISO(-1),
      }),
    ]);
  });

  it('keeps the R3 and R5 scopes independent (US-021 AC3)', async () => {
    const a = (await createProgram(app, { programCode: 'P_BOTH_A' })).id;
    const b = (await createProgram(app, { programCode: 'P_BOTH_B' })).id;
    const group = await createSubjectGroup(app, 'PG_BOTH');
    const mine = await createCourse(app, {
      courseCode: 'PG_BOTH_C1',
      groupId: group.id,
    });
    const { account, agent } = await director('pgboth');
    await assign(a, account.id).expect(201);
    await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      memberRole: SubjectGroupMemberRole.MEMBER,
    });
    await agent
      .patch(`/api/courses/${mine.id}`)
      .set(CSRF)
      .send({ courseName: 'Giảng viên sửa' })
      .expect(200);
    await agent
      .patch(`/api/programs/${a}`)
      .set(CSRF)
      .send({ programName: 'Giám đốc sửa' })
      .expect(200);
    const outside = await agent
      .patch(`/api/programs/${b}`)
      .set(CSRF)
      .send({ programName: 'Không được' })
      .expect(403);
    expect(outside.body.code).toBe('OUT_OF_SCOPE');
  });

  it('ends only by shortening, and revokes a mistaken row', async () => {
    const program = (await createProgram(app, { programCode: 'P_HIST' })).id;
    const { account } = await director('pghist');
    const row = await assign(program, account.id, { validTo: ISO(10) }).expect(
      201,
    );
    const path = `/api/programs/${program}/directors/${row.body.id}`;
    const longer = await admin
      .post(`${path}/end`)
      .set(CSRF)
      .send({ validTo: ISO(20) })
      .expect(400);
    expect(longer.body.code).toBe('END_DATE_NOT_EARLIER');
    const before = await admin
      .post(`${path}/end`)
      .set(CSRF)
      .send({ validTo: ISO(-10) })
      .expect(400);
    expect(before.body.code).toBe('VALIDITY_INVALID');
    const shorter = await admin
      .post(`${path}/end`)
      .set(CSRF)
      .send({ validTo: ISO(5) })
      .expect(200);
    expect(shorter.body).toMatchObject({ validTo: ISO(5), state: 'ACTIVE' });
    const revoked = await admin.post(`${path}/revoke`).set(CSRF).expect(200);
    expect(revoked.body.state).toBe('REVOKED');
    expect(revoked.body.revokedBy).toMatchObject({ fullName: 'pgadmin' });
    const again = await admin.post(`${path}/revoke`).set(CSRF).expect(404);
    expect(again.body.code).toBe('DIRECTOR_ASSIGNMENT_NOT_FOUND');
    const history = await admin
      .get(`/api/programs/${program}/directors`)
      .expect(200);
    expect(history.body).toHaveLength(1);
    // The same person can be assigned again once the mistaken row is revoked.
    await assign(program, account.id, {
      validFrom: ISO(-5),
      validTo: ISO(10),
    }).expect(201);
    const foreign = await admin
      .post(`/api/programs/${program}/directors/ghost/end`)
      .set(CSRF)
      .send({ validTo: ISO(1) })
      .expect(404);
    expect(foreign.body.code).toBe('DIRECTOR_ASSIGNMENT_NOT_FOUND');
  });

  it('refuses the list to a student scope but lets staff read (US-018 AC3)', async () => {
    const refused = await student.get('/api/programs').expect(403);
    expect(refused.body.code).toBe('PERMISSION_DENIED');
    const program = (await createProgram(app, { programCode: 'P_READ' })).id;
    const own = await student.get(`/api/programs/${program}`).expect(403);
    expect(own.body.code).toBe('OUT_OF_SCOPE');
    const staff = await viewer.get(`/api/programs/${program}`).expect(200);
    expect(staff.body).toMatchObject({
      editPath: null,
      canManage: false,
      canClone: false,
    });
    await viewer.get(`/api/programs/${program}/directors`).expect(200);
    const missing = await viewer.get('/api/programs/ghost').expect(404);
    expect(missing.body.code).toBe('PROGRAM_NOT_FOUND');
  });

  it('only deactivates and reactivates, never deletes (US-019 AC5, KB-084)', async () => {
    const program = (await createProgram(app, { programCode: 'P_STATUS' })).id;
    const { account, agent } = await director('pgstatus');
    await assign(program, account.id).expect(201);
    const off = await admin
      .post(`/api/programs/${program}/deactivate`)
      .set(CSRF)
      .expect(200);
    expect(off.body.status).toBe('INACTIVE');
    expect(off.body.directors).toEqual([]);
    const twice = await admin
      .post(`/api/programs/${program}/deactivate`)
      .set(CSRF)
      .expect(409);
    expect(twice.body.code).toBe('PROGRAM_STATUS_UNCHANGED');
    // A deactivated program drops out of the director's scope.
    await agent
      .patch(`/api/programs/${program}`)
      .set(CSRF)
      .send({ programName: 'Đã ngừng' })
      .expect(403);
    await admin.delete(`/api/programs/${program}`).set(CSRF).expect(404);
    const hidden = await admin
      .get('/api/programs?status=ACTIVE&q=P_STATUS')
      .expect(200);
    expect(hidden.body.items).toHaveLength(0);
    const shown = await admin.get('/api/programs?q=P_STATUS').expect(200);
    expect(shown.body.items).toHaveLength(1);
    const on = await admin
      .post(`/api/programs/${program}/reactivate`)
      .set(CSRF)
      .expect(200);
    expect(on.body.status).toBe('ACTIVE');
    expect(on.body.directors).toHaveLength(1);
    await agent
      .patch(`/api/programs/${program}`)
      .set(CSRF)
      .send({ programName: 'Dùng lại' })
      .expect(200);
  });

  it('routes edits through a request once any version has left Draft', async () => {
    const released = await createProgram(app, {
      programCode: 'P_RELEASED',
      versionStatus: ProgramVersionStatus.ACTIVE,
      versionNumber: '1.0',
    });
    const detail = await admin.get(`/api/programs/${released.id}`).expect(200);
    expect(detail.body).toMatchObject({
      editPath: 'VIA_REQUEST',
      currentVersion: { versionNumber: '1.0', status: 'ACTIVE' },
      draftVersion: null,
    });
    const refused = await admin
      .patch(`/api/programs/${released.id}`)
      .set(CSRF)
      .send({ programName: 'Sửa trực tiếp' })
      .expect(409);
    expect(refused.body.code).toBe('CHANGE_REQUEST_REQUIRED');
    // Status and directors are not version content: R1 still manages them directly (D10).
    await admin
      .post(`/api/programs/${released.id}/deactivate`)
      .set(CSRF)
      .expect(200);
  });

  it('clones into a new program that records its source and shares nothing (US-022)', async () => {
    const source = await create('P_SRC').expect(201);
    const { account } = await director('pgclone');
    await assign(source.body.id, account.id).expect(201);
    const cloned = await admin
      .post(`/api/programs/${source.body.id}/clone`)
      .set(CSRF)
      .send({ programCode: 'P_CLONE', programName: 'Bản nhân bản' })
      .expect(201);
    expect(cloned.body).toMatchObject({
      programCode: 'P_CLONE',
      programName: 'Bản nhân bản',
      status: 'ACTIVE',
      directors: [],
      currentVersion: { versionNumber: null, status: 'DRAFT' },
      draftVersion: {
        majorCode: '7480106',
        totalCredits: '150',
        semesterCount: 10,
      },
      clonedFrom: {
        programId: source.body.id,
        programCode: 'P_SRC',
        version: { id: source.body.currentVersion.id, status: 'DRAFT' },
      },
    });
    expect(cloned.body.currentVersion.id).not.toBe(
      source.body.currentVersion.id,
    );
    await admin
      .patch(`/api/programs/${cloned.body.id}`)
      .set(CSRF)
      .send({ programName: 'Đã sửa bản sao', semesterCount: 9 })
      .expect(200);
    const untouched = await admin
      .get(`/api/programs/${source.body.id}`)
      .expect(200);
    expect(untouched.body).toMatchObject({
      programName: 'Chương trình P_SRC',
      draftVersion: { semesterCount: 10 },
    });
    expect(untouched.body.directors).toHaveLength(1);
    const dup = await admin
      .post(`/api/programs/${source.body.id}/clone`)
      .set(CSRF)
      .send({ programCode: 'P_CLONE', programName: 'Trùng' })
      .expect(409);
    expect(dup.body.code).toBe('PROGRAM_CODE_TAKEN');
    expect(
      await prisma.program.count({ where: { programCode: 'P_CLONE' } }),
    ).toBe(1);
    const foreign = await admin
      .post(`/api/programs/${source.body.id}/clone`)
      .set(CSRF)
      .send({
        programCode: 'P_CLONE2',
        programName: 'x',
        sourceVersionId: cloned.body.currentVersion.id,
      })
      .expect(400);
    expect(foreign.body.code).toBe('SOURCE_VERSION_INVALID');
    expect(
      await prisma.program.count({ where: { programCode: 'P_CLONE2' } }),
    ).toBe(0);
  });

  it('clones the curriculum with its groups and requisites, leaving the source untouched (US-022 AC1)', async () => {
    const source = await createProgram(app, { programCode: 'P_CLONE_ROWS' });
    const sourceVersion = source.versions[0].id;
    const [a, b, c] = await Promise.all(
      ['CLR_A', 'CLR_B', 'CLR_C'].map((courseCode) =>
        createCourse(app, { courseCode }),
      ),
    );
    await prisma.courseRelation.create({
      data: {
        sourceCourseId: a.id,
        targetCourseId: b.id,
        relationType: 'PREREQUISITE',
        minScore: '2',
      },
    });
    const rowA = await addCurriculumItem(admin, sourceVersion, {
      courseId: a.id,
      plannedSemester: 1,
      blockSymbol: 'CSN',
    });
    await addCurriculumItem(admin, sourceVersion, {
      courseId: b.id,
      plannedSemester: 2,
    });
    const rowC = await addCurriculumItem(admin, sourceVersion, {
      courseId: c.id,
      plannedSemester: 2,
      isElective: true,
    });
    const group = await admin
      .post(`/api/program-versions/${sourceVersion}/elective-groups`)
      .set(CSRF)
      .send({ groupCode: 'TC1', groupName: 'Tự chọn 1', minCredits: '3' })
      .expect(201);
    await admin
      .put(`/api/elective-groups/${group.body.id}/items`)
      .set(CSRF)
      .send({ itemIds: [rowC.id] })
      .expect(200);
    const before = await readCurriculum(admin, sourceVersion);

    const cloned = await admin
      .post(`/api/programs/${source.id}/clone`)
      .set(CSRF)
      .send({ programCode: 'P_CLONE_ROWS2', programName: 'Bản sao có khung' })
      .expect(201);

    const copy = await readCurriculum(admin, cloned.body.draftVersion.id);
    expect(copy.items).toHaveLength(3);
    expect(
      copy.items.map(
        (item: { course: { courseCode: string } }) => item.course.courseCode,
      ),
    ).toEqual(['CLR_A', 'CLR_B', 'CLR_C']);
    expect(copy.items[0]).toMatchObject({
      blockSymbol: 'CSN',
      plannedSemester: 1,
    });
    expect(copy.items[1].requisites).toEqual([
      expect.objectContaining({
        relationType: 'PREREQUISITE',
        minScore: '2',
        sourceSemester: 1,
        sourceCourse: expect.objectContaining({ courseCode: 'CLR_A' }),
      }),
    ]);
    expect(copy.electiveGroups).toHaveLength(1);
    const copiedGroup = copy.electiveGroups[0];
    expect(copiedGroup).toMatchObject({
      groupCode: 'TC1',
      minCredits: '3',
      itemCount: 1,
    });
    expect(copiedGroup.id).not.toBe(group.body.id);
    expect(copy.items[2].electiveGroup).toEqual({
      id: copiedGroup.id,
      groupCode: 'TC1',
    });
    expect(copy.items.map((item: { id: string }) => item.id)).not.toContain(
      rowA.id,
    );

    // Editing the copy leaves the source alone.
    await admin
      .delete(`/api/curriculum-items/${copy.items[0].id}`)
      .set(CSRF)
      .expect(204);
    const after = await readCurriculum(admin, sourceVersion);
    expect(after.items).toEqual(before.items);
    expect(after.electiveGroups).toEqual(before.electiveGroups);
    expect(
      (await readCurriculum(admin, cloned.body.draftVersion.id)).items,
    ).toHaveLength(2);
  });

  it('refuses a semester count below a planned row and accepts one that covers it (EC-08)', async () => {
    const program = await createProgram(app, { programCode: 'P_SEM_GUARD' });
    const row = await createCourse(app, { courseCode: 'SEM_A' });
    await addCurriculumItem(admin, program.versions[0].id, {
      courseId: row.id,
      plannedSemester: 8,
    });
    const refused = await admin
      .patch(`/api/programs/${program.id}`)
      .set(CSRF)
      .send({ semesterCount: 7 })
      .expect(409);
    expect(refused.body.code).toBe('SEMESTERS_BELOW_CURRICULUM');
    expect(refused.body.message).toContain('8');
    expect(refused.body.details).toEqual([
      expect.objectContaining({ field: 'semesterCount' }),
    ]);
    await admin
      .patch(`/api/programs/${program.id}`)
      .set(CSRF)
      .send({ semesterCount: 8 })
      .expect(200);
    const empty = await createProgram(app, { programCode: 'P_SEM_EMPTY' });
    await admin
      .patch(`/api/programs/${empty.id}`)
      .set(CSRF)
      .send({ semesterCount: 4 })
      .expect(200);
  });

  it('allows one Draft and one Active version per program at the database (D9)', async () => {
    const program = await createProgram(app, { programCode: 'P_INDEX' });
    const draft = {
      programId: program.id,
      programName: 'x',
      majorCode: 'm',
      majorName: 'm',
      semesterCount: 1,
      totalCredits: '1',
      compulsoryCredits: '1',
      electiveCredits: '0',
    };
    await expect(prisma.programVersion.create({ data: draft })).rejects.toThrow(
      /ProgramVersion_one_draft/,
    );
    await prisma.programVersion.create({
      data: {
        ...draft,
        status: ProgramVersionStatus.ACTIVE,
        versionNumber: '1.0',
      },
    });
    await expect(
      prisma.programVersion.create({
        data: {
          ...draft,
          status: ProgramVersionStatus.ACTIVE,
          versionNumber: '1.1',
        },
      }),
    ).rejects.toThrow(/ProgramVersion_one_active/);
    await prisma.programVersion.create({
      data: {
        ...draft,
        status: ProgramVersionStatus.HISTORICAL,
        versionNumber: '0.9',
      },
    });
  });

  it('seeds program 1024034 with one Draft, however many times it runs', async () => {
    await seedPrograms(prisma);
    await seedPrograms(prisma);
    const seeded = await prisma.program.findMany({
      where: { programCode: SEED_PROGRAM_CODES.COMPUTER_ENGINEERING },
      include: { versions: true, faculty: true },
    });
    expect(seeded).toHaveLength(1);
    expect(seeded[0]).toMatchObject({
      degreeLevel: DegreeLevel.ENGINEER,
      faculty: { unitCode: 'KHOA_CNTT' },
    });
    expect(seeded[0].versions).toEqual([
      expect.objectContaining({ status: 'DRAFT', versionNumber: null }),
    ]);
    const listed = await admin.get('/api/programs?q=1024034').expect(200);
    expect(listed.body.items[0].currentVersion.versionNumber).toBeNull();
    // The placeholder curriculum is written once and fits the placeholder program (10 semesters).
    const curriculum = await readCurriculum(admin, seeded[0].versions[0].id);
    expect(curriculum.items).toHaveLength(6);
    expect(curriculum.semesters).toHaveLength(10);
    expect(curriculum.electiveGroups).toEqual([
      expect.objectContaining({
        groupCode: 'TC1',
        itemCount: 2,
        listedCredits: '6',
      }),
    ]);
    expect(
      curriculum.warnings.some(
        (w: { code: string }) => w.code === 'REQUISITE_NOT_EARLIER',
      ),
    ).toBe(false);
    expect(
      await prisma.course.count({
        where: { courseCode: { startsWith: 'DEMO' } },
      }),
    ).toBe(6);
  });
});
