import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestPostgres, TestRedis } from './containers.js';
import request from 'supertest';
import {
  CourseStatus,
  OrgUnitType,
  ScopeType,
  SubjectGroupMemberRole,
  SubjectGroupStatus,
} from '../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from '../prisma/seed-data/org-units.js';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { PERMISSIONS } from '../src/shared/authz/permission-codes.js';
import { ScopeService } from '../src/shared/authz/scope.service.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { toIsoDay } from '../src/shared/time/today.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import { createCourse } from './fixtures/courses.js';
import {
  addMembership,
  createSubjectGroup,
  daysFromToday,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
const MATH_CODE = 'KHOA_TOAN';

describe('subject groups and memberships', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: ReturnType<typeof request.agent>;
  let facultyId: string;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    admin = await loginAgent(app, await createAccount(app, 'groupadmin', 'R1'));
    const root = await prisma.orgUnit.findUniqueOrThrow({
      where: { unitCode: ORG_UNIT_CODES.UNIVERSITY },
    });
    facultyId = (
      await prisma.orgUnit.findUniqueOrThrow({
        where: { unitCode: ORG_UNIT_CODES.FACULTY_IT },
      })
    ).id;
    await prisma.orgUnit.create({
      data: {
        unitCode: MATH_CODE,
        unitName: 'Khoa Toán',
        unitType: OrgUnitType.FACULTY,
        parentUnitId: root.id,
      },
    });
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  it('creates four groups under the faculty and rejects duplicate codes', async () => {
    for (const groupCode of ['IT_ONE', 'IT_TWO', 'IT_THREE', 'IT_FOUR']) {
      await admin
        .post('/api/subject-groups')
        .set(CSRF)
        .send({ groupCode, groupName: groupCode, facultyId })
        .expect(201);
    }
    const listed = await admin
      .get('/api/subject-groups')
      .query({ facultyId })
      .expect(200);
    expect(listed.body).toHaveLength(4);
    for (const row of listed.body)
      expect(row.faculty.unitCode).toBe(ORG_UNIT_CODES.FACULTY_IT);
    await admin
      .post('/api/subject-groups')
      .set(CSRF)
      .send({ groupCode: 'IT_ONE', groupName: 'Trùng', facultyId })
      .expect(409)
      .expect(({ body }) => {
        expect(body.code).toBe('GROUP_CODE_TAKEN');
        expect(body.details[0].field).toBe('groupCode');
      });
  });

  it('derives lecturer scope from two groups without manual assignments', async () => {
    const account = await createAccount(app, 'twogroups');
    const groups = [
      await createSubjectGroup(app, 'TWO_A'),
      await createSubjectGroup(app, 'TWO_B'),
    ];
    for (const group of groups)
      await addMembership(app, { groupId: group.id, userId: account.id });
    const agent = await loginAgent(app, account);
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleCode: 'R5',
          scopeType: ScopeType.ASSIGNMENT,
          derived: true,
        }),
      ]),
    );
    expect(me.body.permissions).toContain(PERMISSIONS.COURSE_VIEW);
    const access = await app.get(ScopeService).loadAccess(account.id);
    const scope = access.assignments.find(
      (assignment) => assignment.roleCode === 'R5',
    )!.scope;
    expect(scope.all).toBe(false);
    if (!scope.all)
      expect(scope.subjectGroupIds).toEqual(
        new Set(groups.map((group) => group.id)),
      );
    expect(
      await prisma.roleAssignment.count({ where: { userId: account.id } }),
    ).toBe(0);
  });

  it('keeps expired membership history but removes its derived role', async () => {
    const account = await createAccount(app, 'expiredmember');
    const group = await createSubjectGroup(app, 'EXPIRED_MEMBER');
    const row = await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      validFrom: daysFromToday(-2),
      validTo: daysFromToday(-1),
    });
    const me = await (
      await loginAgent(app, account)
    )
      .get('/api/auth/me')
      .expect(200);
    expect(me.body.roles).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ roleCode: 'R5' })]),
    );
    const detail = await admin
      .get(`/api/subject-groups/${group.id}`)
      .expect(200);
    expect(detail.body.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: row.id, state: 'EXPIRED' }),
      ]),
    );
    const history = await admin
      .get('/api/subject-group-memberships')
      .query({ userId: account.id })
      .expect(200);
    expect(history.body[0]).toMatchObject({
      id: row.id,
      state: 'EXPIRED',
      subjectGroup: { id: group.id },
    });
  });

  it('rejects duplicate membership and coordination without a covering membership', async () => {
    const account = await createAccount(app, 'overlapmember');
    const outsider = await createAccount(app, 'nonmember');
    const group = await createSubjectGroup(app, 'OVERLAP');
    const dto = {
      lecturerId: account.id,
      memberRole: SubjectGroupMemberRole.MEMBER,
      validFrom: toIsoDay(daysFromToday(0)),
    };
    await admin
      .post(`/api/subject-groups/${group.id}/members`)
      .set(CSRF)
      .send(dto)
      .expect(201);
    await admin
      .post(`/api/subject-groups/${group.id}/members`)
      .set(CSRF)
      .send(dto)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('MEMBERSHIP_OVERLAP'));
    await admin
      .post(`/api/subject-groups/${group.id}/members`)
      .set(CSRF)
      .send({
        ...dto,
        lecturerId: outsider.id,
        memberRole: SubjectGroupMemberRole.COORDINATOR,
      })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('COORDINATOR_NOT_MEMBER'));
  });

  it('drops an expired coordinator role while retaining membership and the warning', async () => {
    const account = await createAccount(app, 'expiredcoordinator');
    const group = await createSubjectGroup(app, 'EXPIRED_COORDINATOR');
    await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      validFrom: daysFromToday(-2),
    });
    await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
      validFrom: daysFromToday(-2),
      validTo: daysFromToday(-1),
    });
    const me = await (
      await loginAgent(app, account)
    )
      .get('/api/auth/me')
      .expect(200);
    expect(
      me.body.roles.map((role: { roleCode: string }) => role.roleCode),
    ).toEqual(['R5']);
    await admin
      .get(`/api/subject-groups/${group.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.hasActiveCoordinator).toBe(false);
        expect(body.activeMemberCount).toBe(1);
      });
  });

  it('lists the group courses that are not cancelled in the deactivation impact', async () => {
    const group = await createSubjectGroup(app, 'IMPACT_COURSES');
    await createCourse(app, { courseCode: 'IMP002', groupId: group.id });
    await createCourse(app, {
      courseCode: 'IMP001',
      groupId: group.id,
      status: CourseStatus.DISCONTINUED,
    });
    await createCourse(app, {
      courseCode: 'IMP003',
      groupId: group.id,
      status: CourseStatus.CANCELLED,
    });
    const impact = await admin
      .get(`/api/subject-groups/${group.id}/deactivation-impact`)
      .expect(200);
    expect(
      impact.body.courses.map(
        (course: { courseCode: string }) => course.courseCode,
      ),
    ).toEqual(['IMP001', 'IMP002']);
  });

  it('lists several coordinators without counting anyone twice', async () => {
    const group = await createSubjectGroup(app, 'MULTIPLE_COORDINATORS');
    const accounts = [
      await createAccount(app, 'coordinatorone'),
      await createAccount(app, 'coordinatortwo'),
    ];
    for (const account of accounts) {
      await addMembership(app, { groupId: group.id, userId: account.id });
      await admin
        .post(`/api/subject-groups/${group.id}/members`)
        .set(CSRF)
        .send({
          lecturerId: account.id,
          memberRole: SubjectGroupMemberRole.COORDINATOR,
          validFrom: toIsoDay(daysFromToday(0)),
        })
        .expect(201);
    }
    const detail = await admin
      .get(`/api/subject-groups/${group.id}`)
      .expect(200);
    expect(detail.body.activeMemberCount).toBe(2);
    expect(detail.body.activeCoordinators).toHaveLength(2);
    expect(detail.body.hasActiveCoordinator).toBe(true);
  });

  it('restricts coordinator list/detail access and removes scope on deactivation', async () => {
    const account = await createAccount(app, 'scopedcoordinator');
    const own = await createSubjectGroup(app, 'COORDINATED');
    const other = await createSubjectGroup(app, 'NOT_COORDINATED');
    await addMembership(app, { groupId: own.id, userId: account.id });
    await addMembership(app, { groupId: other.id, userId: account.id });
    await addMembership(app, {
      groupId: own.id,
      userId: account.id,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
    });
    const agent = await loginAgent(app, account);
    await agent.get(`/api/subject-groups/${own.id}`).expect(200);
    await agent
      .get(`/api/subject-groups/${other.id}`)
      .expect(403)
      .expect(({ body }) => expect(body.code).toBe('OUT_OF_SCOPE'));
    const listed = await agent.get('/api/subject-groups').expect(200);
    expect(listed.body.map((row: { id: string }) => row.id)).toEqual([own.id]);
    const impact = await admin
      .get(`/api/subject-groups/${own.id}/deactivation-impact`)
      .expect(200);
    expect(impact.body).toEqual({
      activeMemberCount: 1,
      activeCoordinators: [{ id: account.id, fullName: account.username }],
      courses: [],
    });
    await admin
      .post(`/api/subject-groups/${own.id}/deactivate`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) =>
        expect(body.status).toBe(SubjectGroupStatus.INACTIVE),
      );
    const me = await agent.get('/api/auth/me').expect(200);
    expect(
      me.body.roles.map((role: { roleCode: string }) => role.roleCode),
    ).toEqual(['R5']);
    await agent.get('/api/subject-groups').expect(403);
    await admin
      .get(`/api/subject-groups/${own.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.members).toHaveLength(2);
        expect(body.activeMemberCount).toBe(0);
        expect(body.hasActiveCoordinator).toBe(false);
      });
    await admin
      .post(`/api/subject-groups/${own.id}/activate`)
      .set(CSRF)
      .expect(200);
    await agent.get(`/api/subject-groups/${own.id}`).expect(200);
  });

  it('limits a faculty manager to groups belonging to that faculty', async () => {
    const account = await createAccount(app, 'facultymanager', 'R2', {
      unitCode: ORG_UNIT_CODES.FACULTY_IT,
    });
    const foreign = await createSubjectGroup(app, 'FOREIGN_GROUP', MATH_CODE);
    const agent = await loginAgent(app, account);
    const listed = await agent.get('/api/subject-groups').expect(200);
    expect(listed.body.length).toBeGreaterThan(0);
    for (const row of listed.body) expect(row.faculty.id).toBe(facultyId);
    await agent
      .get(`/api/subject-groups/${foreign.id}`)
      .expect(403)
      .expect(({ body }) => expect(body.code).toBe('OUT_OF_SCOPE'));
    await agent
      .get('/api/subject-groups')
      .query({ facultyId: foreign.facultyId })
      .expect(200)
      .expect(({ body }) => expect(body).toEqual([]));
  });

  it('atomically shortens membership and coordinator periods and preserves history', async () => {
    const account = await createAccount(app, 'endingmember');
    const group = await createSubjectGroup(app, 'ENDING');
    const member = await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      validFrom: daysFromToday(-2),
    });
    const coordinator = await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
      validFrom: daysFromToday(-2),
    });
    const agent = await loginAgent(app, account);
    const validTo = toIsoDay(daysFromToday(-1));
    const ended = await admin
      .post(`/api/subject-groups/${group.id}/members/${member.id}/end`)
      .set(CSRF)
      .send({ validTo })
      .expect(200);
    expect(ended.body).toHaveLength(2);
    expect(ended.body[0].id).toBe(member.id);
    for (const row of ended.body)
      expect(row).toMatchObject({ validTo, state: 'EXPIRED' });
    expect(ended.body[1].id).toBe(coordinator.id);
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.roles).toEqual([]);
    await admin
      .get(`/api/subject-groups/${group.id}`)
      .expect(200)
      .expect(({ body }) => expect(body.members).toHaveLength(2));
  });

  it('protects dependent coordinators on revoke and allows correction after revoking them', async () => {
    const account = await createAccount(app, 'revokingmember');
    const group = await createSubjectGroup(app, 'REVOKING');
    const member = await addMembership(app, {
      groupId: group.id,
      userId: account.id,
    });
    const coordinator = await addMembership(app, {
      groupId: group.id,
      userId: account.id,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
    });
    const path = `/api/subject-groups/${group.id}/members`;
    await admin
      .post(`${path}/${member.id}/revoke`)
      .set(CSRF)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('MEMBER_HAS_COORDINATOR'));
    await admin
      .post(`${path}/${coordinator.id}/revoke`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.state).toBe('REVOKED'));
    await admin
      .post(`${path}/${member.id}/revoke`)
      .set(CSRF)
      .expect(200)
      .expect(({ body }) => expect(body.state).toBe('REVOKED'));
    await admin
      .post(`${path}/${member.id}/revoke`)
      .set(CSRF)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('MEMBER_ALREADY_REVOKED'));
  });
});
