import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestPostgres, TestRedis } from './containers.js';
import request from 'supertest';
import {
  CourseStatus,
  CourseType,
  Prisma,
  SubjectGroupMemberRole,
} from '../src/generated/prisma/client.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { HOME_FACULTY_CODE } from '../src/shared/org-units/home-faculty.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse, createForeignFaculty } from './fixtures/courses.js';
import {
  addCurriculumItem,
  releaseVersionForTest,
} from './fixtures/curriculum.js';
import { createProgram } from './fixtures/programs.js';
import {
  addMembership,
  createSubjectGroup,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
const MATH_CODE = 'KHOA_TOAN';
// NFR-01: a catalog lookup answers within two seconds.
const CATALOG_LOOKUP_BUDGET_MS = 2000;
const CATALOG_SIZE = 500;

type Agent = ReturnType<typeof request.agent>;

describe('course catalog', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let director: Agent;
  let coordinator: Agent;
  let lecturer: Agent;
  let student: Agent;
  let homeId: string;
  let mathId: string;
  let g1Id: string;
  let g2Id: string;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    homeId = (
      await prisma.orgUnit.findUniqueOrThrow({
        where: { unitCode: HOME_FACULTY_CODE },
      })
    ).id;
    mathId = (await createForeignFaculty(app, MATH_CODE)).id;
    g1Id = (await createSubjectGroup(app, 'CAT_G1')).id;
    g2Id = (await createSubjectGroup(app, 'CAT_G2')).id;
    admin = await loginAgent(app, await createAccount(app, 'catadmin', 'R1'));
    director = await loginAgent(app, await createAccount(app, 'catdir', 'R3'));
    student = await loginAgent(
      app,
      await createAccount(app, 'catstudent', 'R6'),
    );
    const coordinatorAccount = await createAccount(app, 'catcoordinator');
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
    const lecturerAccount = await createAccount(app, 'catlecturer');
    await addMembership(app, { groupId: g1Id, userId: lecturerAccount.id });
    lecturer = await loginAgent(app, lecturerAccount);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  function body(courseCode: string, patch: Record<string, unknown> = {}) {
    return {
      courseCode,
      courseName: `Học phần ${courseCode}`,
      credits: '3',
      courseType: CourseType.THEORY,
      ownerFacultyId: homeId,
      ...patch,
    };
  }

  it('creates a 2.5-credit course and reads it back as a string (KB-001)', async () => {
    const created = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('KB001', { credits: '2.5', englishName: ' Intro ' }))
      .expect(201);
    expect(created.body).toMatchObject({
      courseCode: 'KB001',
      credits: '2.5',
      englishName: 'Intro',
      status: CourseStatus.ACTIVE,
      isForeign: false,
      ownerGroup: null,
      editPath: 'DIRECT',
      canChangeStatus: true,
      programsUsing: [],
    });
    const detail = await admin
      .get(`/api/courses/${created.body.id}`)
      .expect(200);
    expect(detail.body.credits).toBe('2.5');
    const list = await admin.get('/api/courses?q=kb001').expect(200);
    expect(list.body.items.map((c: { credits: string }) => c.credits)).toEqual([
      '2.5',
    ]);
  });

  it('accepts 0 credits for a conditional course and strips trailing zeros (KB-003)', async () => {
    const created = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('KB003', { credits: '0', courseType: CourseType.CONDITIONAL }))
      .expect(201);
    expect(created.body.credits).toBe('0');
    const padded = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('KB003B', { credits: '3.00' }))
      .expect(201);
    expect(padded.body.credits).toBe('3');
  });

  it.each(['-1', 'abc', '1.234', '1000', ''])(
    'refuses credits %j and names the field (KB-002)',
    async (credits) => {
      const res = await admin
        .post('/api/courses')
        .set(CSRF)
        .send(body('KB002', { credits }))
        .expect(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.details[0].field).toBe('credits');
      expect(res.body.details[0].constraints).toContain('matches');
    },
  );

  it('names every missing required field (US-012 AC5)', async () => {
    const res = await admin
      .post('/api/courses')
      .set(CSRF)
      .send({ courseCode: 'MISSING', credits: '1' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(
      res.body.details.map((detail: { field: string }) => detail.field).sort(),
    ).toEqual(['courseName', 'courseType', 'ownerFacultyId']);
  });

  it('refuses a duplicate code regardless of case and spaces, and keeps the code immutable', async () => {
    await admin.post('/api/courses').set(CSRF).send(body('IT001')).expect(201);
    const duplicate = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body(' it001 '))
      .expect(409);
    expect(duplicate.body.code).toBe('COURSE_CODE_TAKEN');
    expect(duplicate.body.details[0].field).toBe('courseCode');
    const course = await prisma.course.findUniqueOrThrow({
      where: { courseCode: 'IT001' },
    });
    const patched = await admin
      .patch(`/api/courses/${course.id}`)
      .set(CSRF)
      .send({ courseCode: 'IT999' })
      .expect(400);
    expect(patched.body.code).toBe('VALIDATION_FAILED');
  });

  it('rejects a group of another faculty or an office as owner', async () => {
    const wrongGroup = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('BADOWNER1', { ownerFacultyId: mathId, ownerGroupId: g1Id }))
      .expect(400);
    expect(wrongGroup.body.code).toBe('OWNER_GROUP_INVALID');
    const office = await prisma.orgUnit.findUniqueOrThrow({
      where: { unitCode: 'PDT' },
    });
    const wrongFaculty = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('BADOWNER2', { ownerFacultyId: office.id }))
      .expect(400);
    expect(wrongFaculty.body.code).toBe('OWNER_FACULTY_INVALID');
  });

  it('lets a group member edit a course of the group but not another group', async () => {
    const own = await createCourse(app, {
      courseCode: 'SCOPE1',
      groupId: g1Id,
    });
    const other = await createCourse(app, {
      courseCode: 'SCOPE2',
      groupId: g2Id,
    });
    const edited = await lecturer
      .patch(`/api/courses/${own.id}`)
      .set(CSRF)
      .send({ courseName: 'Tên mới', credits: '4' })
      .expect(200);
    expect(edited.body).toMatchObject({ courseName: 'Tên mới', credits: '4' });
    const refused = await lecturer
      .patch(`/api/courses/${other.id}`)
      .set(CSRF)
      .send({ courseName: 'Không được' })
      .expect(403);
    expect(refused.body.code).toBe('OUT_OF_SCOPE');
    const view = await lecturer.get(`/api/courses/${other.id}`).expect(200);
    expect(view.body.editPath).toBeNull();
  });

  it('refuses a coordinator moving a course to a group they do not coordinate', async () => {
    const own = await createCourse(app, { courseCode: 'MOVE1', groupId: g1Id });
    const refused = await coordinator
      .patch(`/api/courses/${own.id}`)
      .set(CSRF)
      .send({ ownerGroupId: g2Id })
      .expect(403);
    expect(refused.body.code).toBe('OUT_OF_SCOPE');
    await admin
      .patch(`/api/courses/${own.id}`)
      .set(CSRF)
      .send({ ownerGroupId: g2Id })
      .expect(200)
      .expect(({ body: moved }) => expect(moved.ownerGroup.id).toBe(g2Id));
  });

  it('separates courses of other faculties and leaves them to R1 (KB-010)', async () => {
    const created = await admin
      .post('/api/courses')
      .set(CSRF)
      .send(body('MATH01', { ownerFacultyId: mathId }))
      .expect(201);
    expect(created.body).toMatchObject({ isForeign: true, ownerGroup: null });
    const foreign = await admin.get('/api/courses?foreign=true').expect(200);
    expect(
      foreign.body.items.map((c: { courseCode: string }) => c.courseCode),
    ).toEqual(['MATH01']);
    const own = await admin
      .get('/api/courses?foreign=false&pageSize=100')
      .expect(200);
    expect(
      own.body.items.some(
        (c: { courseCode: string }) => c.courseCode === 'MATH01',
      ),
    ).toBe(false);
    const refusedLecturer = await lecturer
      .patch(`/api/courses/${created.body.id}`)
      .set(CSRF)
      .send({ courseName: 'X' })
      .expect(403);
    expect(refusedLecturer.body.code).toBe('OUT_OF_SCOPE');
    const refusedDirector = await director
      .patch(`/api/courses/${created.body.id}`)
      .set(CSRF)
      .send({ courseName: 'X' })
      .expect(409);
    expect(refusedDirector.body.code).toBe('CHANGE_REQUEST_REQUIRED');
    await admin
      .patch(`/api/courses/${created.body.id}`)
      .set(CSRF)
      .send({ courseName: 'Giải tích' })
      .expect(200);
    const viewed = await director
      .get(`/api/courses/${created.body.id}`)
      .expect(200);
    expect(viewed.body.editPath).toBe('VIA_REQUEST');
  });

  it('lets the director edit a home-faculty course directly before release', async () => {
    const course = await createCourse(app, { courseCode: 'DIR01' });
    await director
      .patch(`/api/courses/${course.id}`)
      .set(CSRF)
      .send({ courseName: 'Do giám đốc sửa' })
      .expect(200);
  });

  it('refuses to discontinue without a replacement (US-014 AC1)', async () => {
    const course = await createCourse(app, { courseCode: 'DISC01' });
    const res = await admin
      .post(`/api/courses/${course.id}/discontinue`)
      .set(CSRF)
      .expect(409);
    expect(res.body.code).toBe('REPLACEMENT_REQUIRED');
    const reopen = await admin
      .post(`/api/courses/${course.id}/reopen`)
      .set(CSRF)
      .expect(409);
    expect(reopen.body.code).toBe('STATUS_TRANSITION_INVALID');
  });

  it('discontinues with a replacement in one step, then reopens (KB-008, NT-B1-05)', async () => {
    const x = await createCourse(app, { courseCode: 'KB008_X' });
    const y = await createCourse(app, { courseCode: 'KB008_Y' });
    const refused = await admin
      .post(`/api/courses/${x.id}/discontinue`)
      .set(CSRF)
      .expect(409);
    expect(refused.body.code).toBe('REPLACEMENT_REQUIRED');

    const invalid = await admin
      .post(`/api/courses/${x.id}/discontinue`)
      .set(CSRF)
      .send({ replacementCourseId: x.id })
      .expect(400);
    expect(invalid.body.code).toBe('REPLACEMENT_INVALID');
    expect(
      await prisma.courseRelation.count({ where: { sourceCourseId: x.id } }),
    ).toBe(0);

    const done = await admin
      .post(`/api/courses/${x.id}/discontinue`)
      .set(CSRF)
      .send({ replacementCourseId: y.id })
      .expect(200);
    expect(done.body.status).toBe(CourseStatus.DISCONTINUED);
    const relation = await prisma.courseRelation.findFirstOrThrow({
      where: { sourceCourseId: x.id },
    });
    expect(relation).toMatchObject({
      targetCourseId: y.id,
      relationType: 'REPLACEMENT',
    });

    const reopened = await admin
      .post(`/api/courses/${x.id}/reopen`)
      .set(CSRF)
      .expect(200);
    expect(reopened.body.status).toBe(CourseStatus.ACTIVE);
    // The relation stays; discontinuing again needs no body.
    await admin.post(`/api/courses/${x.id}/discontinue`).set(CSRF).expect(200);
    expect(
      await prisma.courseRelation.count({ where: { sourceCourseId: x.id } }),
    ).toBe(1);
  });

  it('refuses a Discontinued or Cancelled replacement and writes nothing', async () => {
    const x = await createCourse(app, { courseCode: 'KB008_X2' });
    const old = await createCourse(app, {
      courseCode: 'KB008_OLD',
      status: CourseStatus.DISCONTINUED,
    });
    const res = await admin
      .post(`/api/courses/${x.id}/discontinue`)
      .set(CSRF)
      .send({ replacementCourseId: old.id })
      .expect(400);
    expect(res.body.code).toBe('REPLACEMENT_INVALID');
    const after = await prisma.course.findUniqueOrThrow({
      where: { id: x.id },
    });
    expect(after.status).toBe(CourseStatus.ACTIVE);
  });

  it('cancels a never-used course once, then keeps it final and hidden', async () => {
    const course = await createCourse(app, { courseCode: 'CANCEL01' });
    await admin
      .post(`/api/courses/${course.id}/cancel`)
      .set(CSRF)
      .expect(200)
      .expect(({ body: cancelled }) => {
        expect(cancelled.status).toBe(CourseStatus.CANCELLED);
        expect(cancelled.editPath).toBeNull();
        expect(cancelled.canChangeStatus).toBe(false);
      });
    const cancelAgain = await admin
      .post(`/api/courses/${course.id}/cancel`)
      .set(CSRF)
      .expect(409);
    expect(cancelAgain.body.code).toBe('COURSE_CANCELLED');
    const edit = await admin
      .patch(`/api/courses/${course.id}`)
      .set(CSRF)
      .send({ courseName: 'X' })
      .expect(409);
    expect(edit.body.code).toBe('COURSE_CANCELLED');
    const staff = await admin.get('/api/courses?q=CANCEL01').expect(200);
    expect(staff.body.total).toBe(1);
    const hidden = await student.get('/api/courses?q=CANCEL01').expect(200);
    expect(hidden.body.total).toBe(0);
    const missing = await student.get(`/api/courses/${course.id}`).expect(404);
    expect(missing.body.code).toBe('COURSE_NOT_FOUND');
  });

  it('keeps status changes to callers with a direct right', async () => {
    const course = await createCourse(app, {
      courseCode: 'STAT01',
      groupId: g1Id,
    });
    const res = await coordinator
      .post(`/api/courses/${course.id}/cancel`)
      .set(CSRF)
      .expect(409);
    expect(res.body.code).toBe('CHANGE_REQUEST_REQUIRED');
    const after = await prisma.course.findUniqueOrThrow({
      where: { id: course.id },
    });
    expect(after.status).toBe(CourseStatus.ACTIVE);
  });

  it('has no delete route (US-014 AC3)', async () => {
    const course = await createCourse(app, { courseCode: 'NODEL01' });
    await admin.delete(`/api/courses/${course.id}`).set(CSRF).expect(404);
    expect(await prisma.course.count({ where: { id: course.id } })).toBe(1);
  });

  it('filters, sorts and pages the catalog', async () => {
    await createCourse(app, { courseCode: 'SORT1', credits: '1' });
    await createCourse(app, { courseCode: 'SORT2', credits: '5' });
    await createCourse(app, {
      courseCode: 'SORT3',
      credits: '3',
      courseType: CourseType.LAB,
    });
    const sorted = await admin
      .get('/api/courses?q=SORT&sort=credits&order=desc')
      .expect(200);
    expect(
      sorted.body.items.map((c: { courseCode: string }) => c.courseCode),
    ).toEqual(['SORT2', 'SORT3', 'SORT1']);
    const lab = await admin
      .get('/api/courses?q=SORT&courseType=LAB')
      .expect(200);
    expect(lab.body.total).toBe(1);
    const paged = await admin
      .get('/api/courses?q=SORT&pageSize=2&page=2')
      .expect(200);
    expect(paged.body).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    expect(paged.body.items).toHaveLength(1);
    await admin.get('/api/courses?sort=passwordHash').expect(400);
  });

  it('filters by one status or a list of statuses', async () => {
    await createCourse(app, { courseCode: 'STL_ACT' });
    await createCourse(app, {
      courseCode: 'STL_OLD',
      status: CourseStatus.DISCONTINUED,
    });
    const codes = (response: { body: { items: { courseCode: string }[] } }) =>
      response.body.items.map((course) => course.courseCode);
    expect(
      codes(await admin.get('/api/courses?q=STL_&status=ACTIVE').expect(200)),
    ).toEqual(['STL_ACT']);
    expect(
      codes(
        await admin
          .get('/api/courses?q=STL_&status=ACTIVE&status=DISCONTINUED')
          .expect(200),
      ),
    ).toEqual(['STL_ACT', 'STL_OLD']);
    await admin.get('/api/courses?status=NOPE').expect(400);
  });

  it('lists the programs using a course, with the semester, and freezes it once released (US-028, KB-026)', async () => {
    const course = await createCourse(app, { courseCode: 'USE_X' });
    const lonely = await createCourse(app, { courseCode: 'USE_NONE' });
    const program = await createProgram(app, { programCode: 'USE_PROG' });
    const versionId = program.versions[0].id;
    await addCurriculumItem(admin, versionId, {
      courseId: course.id,
      plannedSemester: 4,
    });

    const detail = await admin.get(`/api/courses/${course.id}`).expect(200);
    expect(detail.body.programsUsing).toEqual([
      {
        programId: program.id,
        programCode: 'USE_PROG',
        programName: 'Chương trình USE_PROG',
        versionLabel: null,
        plannedSemester: 4,
      },
    ]);
    const unused = await admin.get(`/api/courses/${lonely.id}`).expect(200);
    expect(unused.body.programsUsing).toEqual([]);

    // Still a Draft: the course is edited directly.
    await admin
      .patch(`/api/courses/${course.id}`)
      .set(CSRF)
      .send({ courseName: 'Tên sửa trực tiếp' })
      .expect(200);

    await releaseVersionForTest(app, versionId);
    const released = await admin.get(`/api/courses/${course.id}`).expect(200);
    expect(released.body.programsUsing[0].versionLabel).toBe('1.0');
    expect(released.body.editPath).toBe('VIA_REQUEST');
    const refused = await admin
      .patch(`/api/courses/${course.id}`)
      .set(CSRF)
      .send({ courseName: 'Tên sau ban hành' })
      .expect(409);
    expect(refused.body.code).toBe('CHANGE_REQUEST_REQUIRED');
  });

  it('answers a catalog lookup on 500 courses within the budget (CV-035)', async () => {
    const data = Array.from({ length: CATALOG_SIZE }, (_, index) => ({
      courseCode: `PF${1000 + index}`,
      courseName: `Học phần hiệu năng ${index}`,
      credits: new Prisma.Decimal('3'),
      courseType: CourseType.THEORY,
      ownerFacultyId: homeId,
    }));
    await prisma.course.createMany({ data });
    await student.get('/api/courses?q=10&pageSize=20').expect(200);
    const started = performance.now();
    const res = await student.get('/api/courses?q=10&pageSize=20').expect(200);
    const elapsed = performance.now() - started;
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.items).toHaveLength(20);
    expect(elapsed).toBeLessThan(CATALOG_LOOKUP_BUDGET_MS);
  });
});
