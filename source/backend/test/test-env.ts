import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { TestPostgres, TestRedis } from './containers.js';

const TEST_SESSION_SECRET = 'e2e-session-secret-long-enough-for-validation';

export function setAppEnv(postgres: TestPostgres, redis: TestRedis): void {
  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.REDIS_HOST = redis.getHost();
  process.env.REDIS_PORT = String(redis.getPort());
  process.env.SESSION_SECRET = TEST_SESSION_SECRET;
  // Attachments land in a folder of their own per spec file, created by the app and removed when the worker exits.
  const filesRoot = path.join(tmpdir(), `ctdt-files-${randomUUID()}`);
  process.env.FILES_ROOT = filesRoot;
  process.once('exit', () =>
    rmSync(filesRoot, { recursive: true, force: true }),
  );
}
