import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';

const TEST_SESSION_SECRET = 'e2e-session-secret-long-enough-for-validation';

export function setAppEnv(
  postgres: StartedPostgreSqlContainer,
  redis: StartedRedisContainer,
): void {
  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.REDIS_HOST = redis.getHost();
  process.env.REDIS_PORT = String(redis.getPort());
  process.env.SESSION_SECRET = TEST_SESSION_SECRET;
}
