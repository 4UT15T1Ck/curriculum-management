import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { configureApp } from '../src/app.setup.js';
import { startPostgres, startRedis } from './containers.js';

describe('GET /api/health', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      startPostgres({ vietnameseCollation: true }),
      startRedis(),
    ]);
    process.env.DATABASE_URL = postgres.getConnectionUri();
    process.env.REDIS_HOST = redis.getHost();
    process.env.REDIS_PORT = String(redis.getPort());

    // Imported late: ConfigModule.forRoot validates the environment while AppModule is being decorated.
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  it('returns 200 when the database and Redis are up', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up', redis: 'up' });
  });

  it('serves the OpenAPI document the frontend generates types from', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    expect(response.body.paths).toHaveProperty('/api/health');
  });

  // Runs last: it stops the Redis container the other tests share.
  it('returns 503 naming Redis once Redis stops', async () => {
    await redis.stop();
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(503)
      .expect({ status: 'error', database: 'up', redis: 'down' });
  });
});
