import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { seedAccessControl } from '../prisma/seed-data/seed-access-control.js';
import { SubjectGroupMemberRole } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { createAccount, loginAgent } from './fixtures/accounts.js';
import {
  notificationsOf,
  submitSyllabusRequest,
  unreadCount,
} from './fixtures/approvals.js';
import { publishedCourse } from './fixtures/change-requests.js';
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

const IDLE_MINUTES = 1;
const MS_PER_SECOND = 1000;

describe('in-app notifications and the idle limit', () => {
  let postgres: TestPostgres;
  let redis: TestRedis;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let admin: Agent;
  let memberB: Agent;
  let memberBId: string;
  let coordB1: Agent;
  let coordB2: Agent;
  let counter = 0;
  const previousIdle = process.env.SESSION_IDLE_MINUTES;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    // The one-minute limit of F-01's manual walk; set before the app reads its configuration.
    process.env.SESSION_IDLE_MINUTES = String(IDLE_MINUTES);
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await seedAccessControl(prisma);
    const gb = (await createSubjectGroup(app, 'NT_GB')).id;
    admin = await loginAgent(app, await createAccount(app, 'ntadmin', 'R1'));
    await createAccount(app, 'ntadmin2', 'R1');
    const memberBAccount = await createAccount(app, 'ntmemberb');
    memberBId = memberBAccount.id;
    await addMembership(app, { groupId: gb, userId: memberBId });
    memberB = await loginAgent(app, memberBAccount);
    for (const [name, assign] of [
      ['ntcoordb1', (agent: Agent) => (coordB1 = agent)],
      ['ntcoordb2', (agent: Agent) => (coordB2 = agent)],
    ] as const) {
      const account = await createAccount(app, name);
      for (const memberRole of [
        SubjectGroupMemberRole.MEMBER,
        SubjectGroupMemberRole.COORDINATOR,
      ]) {
        await addMembership(app, {
          groupId: gb,
          userId: account.id,
          memberRole,
        });
      }
      assign(await loginAgent(app, account));
    }
    groupB = gb;
  });

  let groupB: string;

  afterAll(async () => {
    if (previousIdle === undefined) delete process.env.SESSION_IDLE_MINUTES;
    else process.env.SESSION_IDLE_MINUTES = previousIdle;
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  async function submitOne() {
    const course = await publishedCourse(
      app,
      admin,
      `NTC${(counter += 1)}`,
      groupB,
    );
    return submitSyllabusRequest(memberB, course.id);
  }

  describe('writing and reading', () => {
    it('tells each level-1 approver once, and not the creator (US-068 AC1)', async () => {
      const submitted = await submitOne();
      for (const agent of [coordB1, coordB2]) {
        const mine = (await notificationsOf(agent)).filter(
          (row) => row.changeRequestId === submitted.id,
        );
        expect(mine).toHaveLength(1);
        expect(mine[0]).toMatchObject({
          notificationType: 'REQUEST_AWAITING_YOU',
          readStatus: 'UNREAD',
        });
        expect(mine[0].content).toContain(submitted.requestCode);
      }
      expect(
        (await notificationsOf(memberB)).filter(
          (row) => row.changeRequestId === submitted.id,
        ),
      ).toEqual([]);
    });

    it("counts unread, drops the count on read, hides other users' rows and reads them all (US-068 AC4)", async () => {
      const before = await unreadCount(coordB1);
      expect(before).toBeGreaterThanOrEqual(1);
      const [first] = await notificationsOf(coordB1);
      const read = await coordB1
        .post(`/api/notifications/${first.id}/read`)
        .set(CSRF)
        .expect(200);
      expect(read.body.readStatus).toBe('READ');
      expect(await unreadCount(coordB1)).toBe(before - 1);
      await coordB1
        .post(`/api/notifications/${first.id}/read`)
        .set(CSRF)
        .expect(200);
      expect(await unreadCount(coordB1)).toBe(before - 1);

      const foreign = await coordB2
        .post(`/api/notifications/${first.id}/read`)
        .set(CSRF)
        .expect(404);
      expect(foreign.body.code).toBe('NOTIFICATION_NOT_FOUND');

      await submitOne();
      const unread = await notificationsOf(coordB1, '&unread=true');
      expect(unread.every((row) => row.readStatus === 'UNREAD')).toBe(true);
      const all = await coordB1
        .post('/api/notifications/read-all')
        .set(CSRF)
        .expect(200);
      expect(all.body).toEqual({ count: 0 });
      expect(await unreadCount(coordB1)).toBe(0);
      await coordB1.get('/api/notifications?pageSize=51').expect(400);
    });
  });

  // The session row holds the idle clock; moving it back stands in for waiting, so the test does not sleep.
  describe('the idle limit', () => {
    const clock = async (userId: string) => {
      const rows = await prisma.$queryRaw<{ at: string }[]>`
        SELECT sess->>'lastActivityAt' AS at FROM "session" WHERE sess->>'userId' = ${userId}`;
      return Number(rows[0].at);
    };
    const backdate = (userId: string, seconds: number) =>
      prisma.$executeRaw`
        UPDATE "session"
        SET sess = (sess::jsonb || jsonb_build_object('lastActivityAt', ${Date.now() - seconds * MS_PER_SECOND}::bigint))::json
        WHERE sess->>'userId' = ${userId}`;

    it('does not renew the session on a poll: a tab left polling still ends after the limit (NFR-08)', async () => {
      const account = await createAccount(app, 'ntidle1');
      const agent = await loginAgent(app, account);
      await backdate(account.id, 30);
      const stamp = await clock(account.id);
      await agent.get('/api/notifications/unread-count').expect(200);
      await agent.get('/api/notifications/unread-count').expect(200);
      expect(await clock(account.id)).toBe(stamp);
      await backdate(account.id, IDLE_MINUTES * 60 + 5);
      const refused = await agent
        .get('/api/notifications/unread-count')
        .expect(401);
      expect(refused.body.code).toBe('SESSION_REQUIRED');
      await agent.get('/api/auth/me').expect(401);
    });

    it('is kept alive by a real request in between', async () => {
      const account = await createAccount(app, 'ntidle2');
      const agent = await loginAgent(app, account);
      await backdate(account.id, 40);
      await agent.get('/api/auth/me').expect(200);
      expect(Date.now() - (await clock(account.id))).toBeLessThan(
        10 * MS_PER_SECOND,
      );
      await backdate(account.id, 30);
      await agent.get('/api/notifications/unread-count').expect(200);
    });
  });
});
