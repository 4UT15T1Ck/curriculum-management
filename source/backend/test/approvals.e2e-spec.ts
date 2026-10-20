import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { SubjectGroupMemberRole } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { todayDate, toIsoDay } from '../src/shared/time/today.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import {
  courseInProgram,
  notificationsOf,
  submitSyllabusRequest,
} from './fixtures/approvals.js';
import {
  approveAs,
  decide,
  openRequest,
  publishedCourse,
  readRequest,
  releasedProgram,
  returnAs,
  submitRequest,
  VALID_REMARK,
  type RequestStep,
} from './fixtures/change-requests.js';
import { assignDirector } from './fixtures/programs.js';
import {
  addMembership,
  createSubjectGroup,
} from './fixtures/subject-groups.js';
import { startPostgres, startRedis } from './containers.js';
import type { TestPostgres, TestRedis } from './containers.js';
import { createTestApp } from './test-app.js';
import { setAppEnv } from './test-env.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
type Agent = ReturnType<typeof request.agent>;

describe('three-level approval', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let admin2: Agent;
  let viewer: Agent;
  let memberA: Agent;
  let memberAId: string;
  let memberB: Agent;
  let coordA: Agent;
  let coordAId: string;
  let coordB1: Agent;
  let coordB1Id: string;
  let coordB2: Agent;
  let directorA: Agent;
  let directorAId: string;
  let ga: string;
  let gb: string;
  let counter = 0;
  const code = (prefix: string) => `${prefix}${(counter += 1)}`;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    ga = (await createSubjectGroup(app, 'AP_GA')).id;
    gb = (await createSubjectGroup(app, 'AP_GB')).id;
    admin = await loginAgent(app, await createAccount(app, 'apadmin', 'R1'));
    admin2 = await loginAgent(app, await createAccount(app, 'apadmin2', 'R1'));
    // An unscoped R2 would see every unit; a scoped one still sees requests of its faculty.
    viewer = await loginAgent(
      app,
      await createAccount(app, 'apviewer', 'R2', { unitCode: 'KHOA_CNTT' }),
    );
    const memberAAccount = await createAccount(app, 'apmembera');
    memberAId = memberAAccount.id;
    await addMembership(app, { groupId: ga, userId: memberAId });
    memberA = await loginAgent(app, memberAAccount);
    const memberBAccount = await createAccount(app, 'apmemberb');
    await addMembership(app, { groupId: gb, userId: memberBAccount.id });
    memberB = await loginAgent(app, memberBAccount);
    const coordAAccount = await createAccount(app, 'apcoorda');
    coordAId = coordAAccount.id;
    await coordinate(ga, coordAId);
    coordA = await loginAgent(app, coordAAccount);
    const coordB1Account = await createAccount(app, 'apcoordb1');
    coordB1Id = coordB1Account.id;
    await coordinate(gb, coordB1Id);
    coordB1 = await loginAgent(app, coordB1Account);
    const coordB2Account = await createAccount(app, 'apcoordb2');
    await coordinate(gb, coordB2Account.id);
    coordB2 = await loginAgent(app, coordB2Account);
    const directorAAccount = await createAccount(app, 'apdira');
    directorAId = directorAAccount.id;
    directorA = await loginAgent(app, directorAAccount);
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  async function coordinate(groupId: string, userId: string) {
    for (const memberRole of [
      SubjectGroupMemberRole.MEMBER,
      SubjectGroupMemberRole.COORDINATOR,
    ]) {
      await addMembership(app, { groupId, userId, memberRole });
    }
  }

  const rows = (steps: RequestStep[], level: number) =>
    steps.filter((step) => step.approvalLevel === level);
  const queueOf = async (agent: Agent, query = '') =>
    (await agent.get(`/api/approval-queue${query}`).expect(200)).body as {
      requestId: string;
      daysWaiting: number;
      approvalLevel: number;
      standsFor: string | null;
    }[];
  const queued = async (agent: Agent, id: string) =>
    (await queueOf(agent)).some((item) => item.requestId === id);
  const statusOf = async (agent: Agent, id: string) =>
    (await readRequest(agent, id)).status;

  describe('the path from creator to academic office', () => {
    it('walks coordinator, director, office; the office returns; the creator resubmits (KB-049, NT-B4-04, US-061, US-063, US-064, US-065, US-069)', async () => {
      const { course } = await courseInProgram(
        app,
        admin,
        code('AW'),
        ga,
        directorAId,
      );
      const submitted = await submitSyllabusRequest(memberA, course.id);
      expect(submitted.status).toBe('PENDING_COORDINATOR');

      // US-061 AC1, AC3: the coordinator sees it with days waiting; the director does not yet.
      const queue = await queueOf(coordA);
      expect(queue).toEqual([
        expect.objectContaining({
          requestId: submitted.id,
          approvalLevel: 1,
          daysWaiting: 0,
          standsFor: 'AP_GA',
        }),
      ]);
      expect(await queued(directorA, submitted.id)).toBe(false);
      expect(await queueOf(coordA, '?requestType=CURRICULUM')).toEqual([]);
      const permissions = (await readRequest(coordA, submitted.id)).permissions;
      expect(permissions).toMatchObject({
        canApprove: true,
        canReturn: true,
        canReject: true,
        canOverride: false,
      });
      expect(
        (await readRequest(memberA, submitted.id)).permissions,
      ).toMatchObject({
        canApprove: false,
        canReturn: false,
      });

      // US-063 AC1, US-061 AC4: level 1 passes, the item changes queues.
      const afterCoordinator = await approveAs(coordA, submitted.id);
      expect(afterCoordinator.status).toBe('PENDING_DIRECTOR');
      expect(await queued(coordA, submitted.id)).toBe(false);
      expect(await queued(directorA, submitted.id)).toBe(true);
      expect(
        (await notificationsOf(directorA)).map((row) => row.notificationType),
      ).toContain('REQUEST_AWAITING_YOU');

      // US-064 AC1: one program, one director.
      expect((await approveAs(directorA, submitted.id)).status).toBe(
        'PENDING_ACADEMIC_OFFICE',
      );
      expect(await queued(admin, submitted.id)).toBe(true);
      expect(await queued(admin2, submitted.id)).toBe(true);

      // D5: a data request cannot be approved here at level 3.
      const final = await decide(admin, submitted.id, 'approve').expect(409);
      expect(final.body.code).toBe('FINAL_APPROVAL_REQUIRED');
      expect(
        (await readRequest(admin, submitted.id)).permissions,
      ).toMatchObject({
        canApprove: false,
        canReturn: true,
        canReject: true,
      });

      // US-065 AC1, AC3: Return goes to Draft, the creator and the lower approvers hear the reason.
      await returnAs(admin, submitted.id);
      const returned = await readRequest(memberA, submitted.id);
      expect(returned.status).toBe('DRAFT');
      expect(returned.submissionRound).toBe(1);
      for (const agent of [memberA, coordA, directorA]) {
        const mine = (await notificationsOf(agent)).filter(
          (row) =>
            row.changeRequestId === submitted.id &&
            row.notificationType === 'REQUEST_RETURNED',
        );
        expect(mine).toHaveLength(1);
        expect(mine[0].content).toContain(VALID_REMARK);
      }
      expect(await queued(admin, submitted.id)).toBe(false);

      // US-063 AC4 / BR-29: the resubmit starts again at level 1, in round 2; round 1 stays in the history.
      const again = (await submitRequest(memberA, submitted.id).expect(200))
        .body;
      expect(again.submissionRound).toBe(2);
      expect(again.status).toBe('PENDING_COORDINATOR');
      const history = (
        await memberA
          .get(`/api/change-requests/${submitted.id}/history`)
          .expect(200)
      ).body.rounds as { submissionRound: number; steps: RequestStep[] }[];
      expect(history.map((round) => round.submissionRound)).toEqual([2, 1]);
      const roundOne = history[1].steps;
      expect(rows(roundOne, 1)[0]).toMatchObject({
        action: 'APPROVE',
        kind: 'NORMAL',
        performedBy: { id: coordAId },
      });
      expect(rows(roundOne, 3)[0]).toMatchObject({
        action: 'RETURN',
        remark: VALID_REMARK,
      });
    });

    it('ends the request when the office rejects it, and refuses a resubmit (US-065 AC2, US-063 AC5)', async () => {
      const course = await publishedCourse(app, admin, code('AR'), ga);
      const submitted = await submitSyllabusRequest(memberA, course.id);
      await approveAs(coordA, submitted.id);
      expect(await statusOf(admin, submitted.id)).toBe(
        'PENDING_ACADEMIC_OFFICE',
      );
      const rejected = (await decide(admin, submitted.id, 'reject').expect(200))
        .body;
      expect(rejected.status).toBe('REJECTED');
      // F-14 closes the working copy with the request; the stored items keep the diff readable.
      expect(
        await prisma.syllabus.count({
          where: { sourceRequestId: submitted.id },
        }),
      ).toBe(0);
      await memberA
        .get(`/api/change-requests/${submitted.id}/diff`)
        .expect(200);
      const resubmit = await submitRequest(memberA, submitted.id).expect(409);
      expect(resubmit.body.code).toBe('REQUEST_NOT_DRAFT');
      const mine = (await notificationsOf(memberA)).filter(
        (row) => row.changeRequestId === submitted.id,
      );
      expect(mine.map((row) => row.notificationType)).toContain(
        'REQUEST_REJECTED',
      );
    });
  });

  describe('a level with several approvers', () => {
    it('waits for both coordinators; a Return by one ends the round at once (US-063 AC2, AC4)', async () => {
      const course = await publishedCourse(app, admin, code('AB'), gb);
      const submitted = await submitSyllabusRequest(memberB, course.id);
      expect(rows(submitted.steps, 1)).toHaveLength(2);

      const first = await approveAs(coordB1, submitted.id);
      expect(first.status).toBe('PENDING_COORDINATOR');
      expect(
        rows(first.steps, 1)
          .map((step) => step.action)
          .sort(),
      ).toEqual(['APPROVE', 'PENDING']);
      expect(await queued(coordB1, submitted.id)).toBe(false);
      expect(await queued(coordB2, submitted.id)).toBe(true);

      const short = await decide(
        coordB2,
        submitted.id,
        'return',
        'quá ngắn',
      ).expect(400);
      expect(short.body.code).toBe('VALIDATION_FAILED');
      const blanks = await decide(
        coordB2,
        submitted.id,
        'return',
        ' '.repeat(30),
      ).expect(400);
      expect(blanks.body.code).toBe('VALIDATION_FAILED');
      await returnAs(coordB2, submitted.id);
      const returned = await readRequest(memberB, submitted.id);
      expect(returned).toMatchObject({ status: 'DRAFT', submissionRound: 1 });
      // The first coordinator's approval is kept as history.
      const mine = (await notificationsOf(memberB)).filter(
        (row) => row.notificationType === 'REQUEST_RETURNED',
      );
      expect(mine[0].content).toContain(VALID_REMARK);
    });

    it('never leaves the level stuck when both coordinators approve at once', async () => {
      const course = await publishedCourse(app, admin, code('AC'), gb);
      const submitted = await submitSyllabusRequest(memberB, course.id);
      const results = await Promise.all([
        decide(coordB1, submitted.id, 'approve'),
        decide(coordB2, submitted.id, 'approve'),
      ]);
      expect(results.some((result) => result.status === 200)).toBe(true);
      for (const result of results) {
        if (result.status !== 200) {
          expect(result.status).toBe(409);
          expect(result.body.code).toBe('REQUEST_STATE_CHANGED');
        }
      }
      // A 409 means the other call moved the request first; if so a retry is refused as not yours or already done.
      const status = await statusOf(admin, submitted.id);
      expect(status).toBe('PENDING_ACADEMIC_OFFICE');
    });

    it('needs the director of every program; one Return among three ends the round (US-064 AC2, AC3, KB-042)', async () => {
      const course = await publishedCourse(app, admin, code('AD'), ga);
      const directors: Agent[] = [];
      for (let index = 0; index < 3; index += 1) {
        const account = await createAccount(app, `apdir3${counter}x${index}`);
        directors.push(await loginAgent(app, account));
        const program = await releasedProgram(app, admin, code('APP'), [
          course.id,
        ]);
        await assignDirector(app, {
          programId: program.programId,
          userId: account.id,
        });
      }
      const submitted = await submitSyllabusRequest(memberA, course.id);
      await approveAs(coordA, submitted.id);
      expect(await statusOf(admin, submitted.id)).toBe('PENDING_DIRECTOR');
      await approveAs(directors[0], submitted.id);
      expect((await approveAs(directors[1], submitted.id)).status).toBe(
        'PENDING_DIRECTOR',
      );
      expect(await queued(directors[2], submitted.id)).toBe(true);
      await returnAs(directors[2], submitted.id);
      expect(await statusOf(memberA, submitted.id)).toBe('DRAFT');
    });
  });

  describe('who may decide', () => {
    it('refuses the creator, a viewer who is not an approver and anyone outside the request (US-066 AC5, US-062 AC4, US-063 AC6, KB-052)', async () => {
      const course = await publishedCourse(app, admin, code('AS'), gb);
      const submitted = await submitSyllabusRequest(memberB, course.id);
      const own = await decide(memberB, submitted.id, 'approve').expect(403);
      expect(own.body.code).toBe('SELF_APPROVAL');
      const viewed = await decide(viewer, submitted.id, 'approve').expect(403);
      expect(viewed.body.code).toBe('NOT_YOUR_STEP');
      expect(
        (await readRequest(viewer, submitted.id)).permissions,
      ).toMatchObject({
        canApprove: false,
        canReturn: false,
        canReject: false,
        canOverride: false,
        canComment: true,
      });
      // Another group's coordinator cannot even see it.
      await decide(coordA, submitted.id, 'approve').expect(404);
      expect(await statusOf(admin, submitted.id)).toBe('PENDING_COORDINATOR');
    });

    it('skips the level of the creator end to end (US-066 AC1..AC4, KB-050, KB-051)', async () => {
      const { course, program } = await courseInProgram(
        app,
        admin,
        code('AK'),
        ga,
        directorAId,
      );
      const byCoordinator = await submitSyllabusRequest(coordA, course.id);
      expect(byCoordinator.status).toBe('PENDING_DIRECTOR');
      expect(rows(byCoordinator.steps, 1)[0]).toMatchObject({
        isSkipped: true,
        kind: 'SKIPPED',
        skipReason: 'Người duyệt là người tạo đề xuất',
      });
      expect(await queued(coordA, byCoordinator.id)).toBe(false);

      const info = await openRequest(directorA, {
        requestType: 'PROGRAM_INFO',
        targetType: 'PROGRAM',
        targetId: program.programId,
      });
      await directorA
        .patch(`/api/program-versions/${info.workspace!.copyId}/info`)
        .set(CSRF)
        .send({ programName: 'Tên chương trình mới' })
        .expect(200);
      const submittedInfo = (
        await submitRequest(directorA, info.id).expect(200)
      ).body;
      expect(rows(submittedInfo.steps, 2)[0]).toMatchObject({
        isSkipped: true,
      });
      expect(submittedInfo.status).not.toBe('PENDING_DIRECTOR');
    });
  });

  describe('academic-office override', () => {
    it('decides the whole level for an absent approver, names both, and tells the approver (US-070 AC1..AC3, KB-053)', async () => {
      const { course } = await courseInProgram(
        app,
        admin,
        code('AO'),
        ga,
        directorAId,
      );
      const submitted = await submitSyllabusRequest(memberA, course.id);
      expect(
        (await readRequest(admin, submitted.id)).permissions.canOverride,
      ).toBe(true);
      expect(
        (await readRequest(memberA, submitted.id)).permissions.canOverride,
      ).toBe(false);

      const post = (agent: Agent, body: object) =>
        agent
          .post(`/api/change-requests/${submitted.id}/override`)
          .set(CSRF)
          .send(body);
      const short = await post(admin, {
        action: 'APPROVE',
        reason: 'ngắn',
      }).expect(400);
      expect(short.body.code).toBe('VALIDATION_FAILED');
      await post(memberA, { action: 'APPROVE', reason: VALID_REMARK }).expect(
        403,
      );
      const done = (
        await post(admin, { action: 'APPROVE', reason: VALID_REMARK }).expect(
          200,
        )
      ).body;
      expect(done.status).toBe('PENDING_DIRECTOR');
      expect(rows(done.steps, 1)[0]).toMatchObject({
        isOverride: true,
        kind: 'OVERRIDE',
        action: 'APPROVE',
        remark: VALID_REMARK,
        approver: { id: coordAId },
        performedBy: { fullName: 'apadmin' },
      });
      const coordinatorNotes = await notificationsOf(coordA);
      expect(
        coordinatorNotes.filter(
          (row) =>
            row.changeRequestId === submitted.id &&
            row.notificationType === 'REQUEST_OVERRIDDEN',
        ),
      ).toHaveLength(1);
      expect(
        coordinatorNotes.some(
          (row) =>
            row.changeRequestId === submitted.id &&
            row.notificationType === 'REQUEST_RETURNED',
        ),
      ).toBe(false);

      // Level 2 is overridden too, then level 3 is the office's own and refuses an override.
      await post(admin2, { action: 'APPROVE', reason: VALID_REMARK }).expect(
        200,
      );
      expect(await statusOf(admin, submitted.id)).toBe(
        'PENDING_ACADEMIC_OFFICE',
      );
      const level3 = await post(admin, {
        action: 'APPROVE',
        reason: VALID_REMARK,
      }).expect(409);
      expect(level3.body.code).toBe('OVERRIDE_LEVEL');
    });

    it("refuses an override of the office's own request and can return a stuck one (US-070 AC3)", async () => {
      const course = await publishedCourse(app, admin, code('AP'), ga);
      const own = await submitSyllabusRequest(admin, course.id);
      const refused = await admin
        .post(`/api/change-requests/${own.id}/override`)
        .set(CSRF)
        .send({ action: 'APPROVE', reason: VALID_REMARK })
        .expect(403);
      expect(refused.body.code).toBe('SELF_APPROVAL');
      const returned = (
        await admin2
          .post(`/api/change-requests/${own.id}/override`)
          .set(CSRF)
          .send({ action: 'RETURN', reason: VALID_REMARK })
          .expect(200)
      ).body;
      expect(returned.status).toBe('DRAFT');
    });

    it('lists the backlog by days waiting (US-070 AC4)', async () => {
      const course = await publishedCourse(app, admin, code('AQ'), gb);
      const submitted = await submitSyllabusRequest(memberB, course.id);
      await prisma.changeRequest.update({
        where: { id: submitted.id },
        data: { levelEnteredAt: new Date(Date.now() - 4 * 86_400_000) },
      });
      const ids = async (days: number) =>
        (
          (
            await admin
              .get(`/api/change-requests?minDaysWaiting=${days}&pageSize=100`)
              .expect(200)
          ).body.items as { id: string; daysWaiting: number }[]
        ).filter((item) => item.id === submitted.id);
      expect(await ids(3)).toEqual([
        expect.objectContaining({ daysWaiting: 4 }),
      ]);
      expect(await ids(4)).toHaveLength(1);
      expect(await ids(5)).toEqual([]);
      expect((await queueOf(coordB1))[0].daysWaiting).toBe(4);
    });
  });

  describe('organisational requests', () => {
    async function memberRequest(userId: string) {
      const created = await openRequest(coordA, {
        requestType: 'ORGANIZATION',
        targetType: 'SUBJECT_GROUP',
        targetId: ga,
      });
      await coordA
        .put(`/api/change-requests/${created.id}/items`)
        .set(CSRF)
        .send({
          items: [
            {
              operation: 'ADD_MEMBER',
              lecturerId: userId,
              memberRole: 'MEMBER',
              validFrom: toIsoDay(todayDate()),
            },
          ],
        })
        .expect(200);
      return (await submitRequest(coordA, created.id).expect(200)).body;
    }
    const memberRows = (userId: string) =>
      prisma.subjectGroupMember.count({
        where: { subjectGroupId: ga, lecturerId: userId, revokedAt: null },
      });

    it('applies the change at once on the office approval and tells the creator (US-060 AC2)', async () => {
      const lecturer = await createAccount(app, code('aporg'));
      const submitted = await memberRequest(lecturer.id);
      expect(await memberRows(lecturer.id)).toBe(0);
      const done = await approveAs(admin, submitted.id);
      expect(done.status).toBe('EFFECTIVE');
      expect(await memberRows(lecturer.id)).toBe(1);
      expect(
        (await notificationsOf(coordA)).some(
          (row) =>
            row.changeRequestId === submitted.id &&
            row.notificationType === 'REQUEST_APPROVED',
        ),
      ).toBe(true);
      expect(await queued(admin2, submitted.id)).toBe(false);
    });

    it('refuses the whole approval when an item no longer applies and leaves the request pending (US-060 AC2)', async () => {
      const lecturer = await createAccount(app, code('aporg'));
      const submitted = await memberRequest(lecturer.id);
      // An admin added the same row after the request was filed.
      await addMembership(app, { groupId: ga, userId: lecturer.id });
      const refused = await decide(admin, submitted.id, 'approve').expect(409);
      expect(refused.body.code).toBe('ORGANIZATION_APPLY_FAILED');
      expect(refused.body.details[0]).toMatchObject({
        constraints: ['MEMBERSHIP_OVERLAP'],
      });
      expect(refused.body.details[0].field.length).toBeGreaterThan(0);
      expect(await statusOf(admin, submitted.id)).toBe(
        'PENDING_ACADEMIC_OFFICE',
      );
      expect(await memberRows(lecturer.id)).toBe(1);
      await decide(admin, submitted.id, 'reject').expect(200);
    });
  });

  describe('comments', () => {
    it('lets a viewer comment on a pending and on a rejected request without moving it (US-067, NT-B4-07)', async () => {
      const course = await publishedCourse(app, admin, code('AM'), gb);
      const submitted = await submitSyllabusRequest(memberB, course.id);
      const posted = await viewer
        .post(`/api/change-requests/${submitted.id}/comments`)
        .set(CSRF)
        .send({ content: '  Cần xem lại phần mục tiêu.  ' })
        .expect(201);
      expect(posted.body).toMatchObject({
        content: 'Cần xem lại phần mục tiêu.',
        author: { fullName: 'apviewer' },
      });
      expect(await statusOf(admin, submitted.id)).toBe('PENDING_COORDINATOR');
      for (const agent of [memberB, coordB1, coordB2]) {
        expect(
          (await notificationsOf(agent)).some(
            (row) =>
              row.changeRequestId === submitted.id &&
              row.notificationType === 'REQUEST_COMMENTED',
          ),
        ).toBe(true);
      }
      await viewer
        .post(`/api/change-requests/${submitted.id}/comments`)
        .set(CSRF)
        .send({ content: '   ' })
        .expect(400);

      await decide(admin, submitted.id, 'reject').expect(403);
      await decide(coordB1, submitted.id, 'approve').expect(200);
      await decide(coordB2, submitted.id, 'approve').expect(200);
      await decide(admin, submitted.id, 'reject').expect(200);
      await viewer
        .post(`/api/change-requests/${submitted.id}/comments`)
        .set(CSRF)
        .send({ content: 'Bình luận sau khi đóng.' })
        .expect(201);
      const list = (
        await memberB
          .get(`/api/change-requests/${submitted.id}/comments`)
          .expect(200)
      ).body as { id: string; content: string }[];
      expect(list.map((comment) => comment.content)).toEqual([
        'Cần xem lại phần mục tiêu.',
        'Bình luận sau khi đóng.',
      ]);
      expect(await statusOf(admin, submitted.id)).toBe('REJECTED');
      await viewer
        .patch(`/api/change-requests/${submitted.id}/comments/${list[0].id}`)
        .set(CSRF)
        .send({ content: 'x' })
        .expect(404);
      await viewer
        .delete(`/api/change-requests/${submitted.id}/comments/${list[0].id}`)
        .set(CSRF)
        .expect(404);
      await decide(viewer, submitted.id, 'approve').expect(403);
    });
  });

  it('keeps a returned request out of every queue and lets its other rows die (S-4)', async () => {
    const course = await publishedCourse(app, admin, code('AZ'), gb);
    const submitted = await submitSyllabusRequest(memberB, course.id);
    await returnAs(coordB1, submitted.id);
    expect(await queued(coordB2, submitted.id)).toBe(false);
    const dead = await decide(coordB2, submitted.id, 'approve').expect(403);
    expect(dead.body.code).toBe('NOT_YOUR_STEP');
    const again = (await submitRequest(memberB, submitted.id).expect(200)).body;
    expect(again.submissionRound).toBe(2);
    expect(await queued(coordB2, submitted.id)).toBe(true);
    // Withdrawing clears the clock and the queue.
    await memberB
      .post(`/api/change-requests/${submitted.id}/withdraw`)
      .set(CSRF)
      .expect(200);
    expect(await queued(coordB2, submitted.id)).toBe(false);
    const row = await prisma.changeRequest.findUniqueOrThrow({
      where: { id: submitted.id },
    });
    expect(row.levelEnteredAt).toBeNull();
  });
});
