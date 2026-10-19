import type { NestExpressApplication } from '@nestjs/platform-express';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { UserStatus } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/shared/prisma/prisma.service.js';
import { PasswordService } from '../src/shared/password/password.service.js';
import { startPostgres, startRedis } from './containers.js';
import { applyMigrations } from './migrations.js';
import { setAppEnv } from './test-env.js';
import { createTestApp } from './test-app.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };
// Login bodies carry credentials only: the global ValidationPipe rejects unknown fields.
const ACTIVE = { username: 'gv01', password: 'matkhau01' };
const DISABLED = { username: 'gv02', password: 'matkhau02' };
const ACTIVE_IDENTITY = { userCode: 'GV01', fullName: 'Nguyễn Văn A' };
const DISABLED_IDENTITY = { userCode: 'GV02', fullName: 'Trần Thị B' };

describe('auth endpoints', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    setAppEnv(postgres, redis);
    applyMigrations(postgres.getConnectionUri());
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);
    const seeds = [
      [ACTIVE, ACTIVE_IDENTITY, UserStatus.ACTIVE],
      [DISABLED, DISABLED_IDENTITY, UserStatus.DISABLED],
    ] as const;
    for (const [{ username, password }, identity, status] of seeds) {
      await prisma.user.create({
        data: {
          ...identity,
          username,
          status,
          passwordHash: await passwords.hash(password),
        },
      });
    }
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  it('logs in and returns only safe identity fields', async () => {
    const response = await agent
      .post('/api/auth/login')
      .set(CSRF)
      .send(ACTIVE)
      .expect(200);
    expect(response.body).toMatchObject({
      username: ACTIVE.username,
      userCode: ACTIVE_IDENTITY.userCode,
      roles: [],
      permissions: [],
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(response.headers['set-cookie'][0]).toContain('SameSite=Lax');
  });

  it('normalizes usernames', async () => {
    await request
      .agent(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .send({ ...ACTIVE, username: ' GV01 ' })
      .expect(200);
  });

  it('returns the current user for its session', async () => {
    await agent
      .get('/api/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.username).toBe(ACTIVE.username);
        expect(body.roles).toEqual([]);
        expect(body.permissions).toEqual([]);
      });
  });

  it('uses identical responses for unknown users and incorrect passwords', async () => {
    const wrong = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .send({ ...ACTIVE, password: 'incorrect1' })
      .expect(401);
    const missing = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .send({ username: 'missing', password: 'incorrect1' })
      .expect(401);
    expect({ ...wrong.body, timestamp: undefined }).toEqual({
      ...missing.body,
      timestamp: undefined,
    });
  });

  it('rejects disabled users after validating their password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .send(DISABLED)
      .expect(403)
      .expect(({ body }) => expect(body.code).toBe('ACCOUNT_DISABLED'));
  });

  it('enforces CSRF, validation, error envelopes, and authenticated routes', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(ACTIVE)
      .expect(403)
      .expect(({ body }) => expect(body.code).toBe('CSRF_HEADER_MISSING'));
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .send({})
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('VALIDATION_FAILED'));
    await request(app.getHttpServer())
      .get('/api/nope')
      .expect(404)
      .expect(({ body }) => expect(body.code).toBe('NOT_FOUND'));
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set(CSRF)
      .set('Content-Type', 'application/json')
      .send('{')
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('BAD_REQUEST'));
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401)
      .expect(({ body }) => expect(body.code).toBe('SESSION_REQUIRED'));
  });

  it('rejects expired sessions and does not change the password', async () => {
    const expiryAgent = request.agent(app.getHttpServer());
    await expiryAgent
      .post('/api/auth/login')
      .set(CSRF)
      .send(ACTIVE)
      .expect(200);
    const before = await prisma.user.findUniqueOrThrow({
      where: { username: ACTIVE.username },
      select: { passwordHash: true },
    });
    await prisma.$executeRaw`UPDATE "session" SET "expire" = now() - interval '1 minute'`;
    await expiryAgent
      .post('/api/auth/change-password')
      .set(CSRF)
      .send({ currentPassword: ACTIVE.password, newPassword: 'newpass123' })
      .expect(401);
    const after = await prisma.user.findUniqueOrThrow({
      where: { username: ACTIVE.username },
      select: { passwordHash: true },
    });
    expect(after.passwordHash).toBe(before.passwordHash);
  });

  it('validates and changes a password, then clears the forced-change flag', async () => {
    const passwordAgent = request.agent(app.getHttpServer());
    await passwordAgent
      .post('/api/auth/login')
      .set(CSRF)
      .send(ACTIVE)
      .expect(200);
    await passwordAgent
      .post('/api/auth/change-password')
      .set(CSRF)
      .send({ currentPassword: 'wrongpass1', newPassword: 'newpass123' })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('CURRENT_PASSWORD_WRONG'));
    await passwordAgent
      .post('/api/auth/change-password')
      .set(CSRF)
      .send({ currentPassword: ACTIVE.password, newPassword: ACTIVE.password })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('PASSWORD_UNCHANGED'));
    await passwordAgent
      .post('/api/auth/change-password')
      .set(CSRF)
      .send({ currentPassword: ACTIVE.password, newPassword: 'weakpass' })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('VALIDATION_FAILED'));
    await prisma.user.update({
      where: { username: ACTIVE.username },
      data: { mustChangePassword: true },
    });
    await passwordAgent
      .get('/api/auth/me')
      .expect(200)
      .expect(({ body }) => expect(body.mustChangePassword).toBe(true));
    await passwordAgent
      .post('/api/auth/change-password')
      .set(CSRF)
      .send({ currentPassword: ACTIVE.password, newPassword: 'newpass123' })
      .expect(204);
    await passwordAgent
      .get('/api/auth/me')
      .expect(200)
      .expect(({ body }) => expect(body.mustChangePassword).toBe(false));
    const stored = await prisma.user.findUniqueOrThrow({
      where: { username: ACTIVE.username },
      select: { passwordHash: true },
    });
    expect(stored.passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(stored.passwordHash).not.toBe('newpass123');
  });

  it('logs out idempotently and expires a disabled account session', async () => {
    await agent.post('/api/auth/logout').set(CSRF).expect(204);
    await agent.post('/api/auth/logout').set(CSRF).expect(204);
    await agent
      .post('/api/auth/login')
      .set(CSRF)
      .send({ ...ACTIVE, password: 'newpass123' })
      .expect(200);
    await prisma.user.update({
      where: { username: ACTIVE.username },
      data: { status: UserStatus.DISABLED },
    });
    await agent.get('/api/auth/me').expect(401);
  });
});
