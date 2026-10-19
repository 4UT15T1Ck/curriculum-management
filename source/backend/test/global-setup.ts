import type { TestProject } from 'vitest/node';
import {
  ICU_TEMPLATE_DATABASE,
  startPostgresContainer,
  startRedisContainer,
} from './containers.js';
import { applyMigrations } from './migrations.js';

// One Postgres and one Redis for the whole e2e run. Each spec file gets its own database,
// copied from a template that is migrated once here (see startPostgres in containers.ts).
export default async function setup(project: TestProject) {
  const [postgres, redis] = await Promise.all([
    startPostgresContainer({ vietnameseCollation: true }),
    startRedisContainer(),
  ]);
  const adminUri = postgres.getConnectionUri();
  const templateUri = new URL(adminUri);
  templateUri.pathname = `/${ICU_TEMPLATE_DATABASE}`;

  const { Client } = await import('pg');
  const admin = new Client({ connectionString: adminUri });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${ICU_TEMPLATE_DATABASE}"`);
  } finally {
    await admin.end();
  }
  applyMigrations(templateUri.toString());

  project.provide('postgresAdminUri', adminUri);
  project.provide('redisHost', redis.getHost());
  project.provide('redisPort', redis.getPort());

  return async () => {
    await Promise.all([postgres.stop(), redis.stop()]);
  };
}

declare module 'vitest' {
  export interface ProvidedContext {
    postgresAdminUri: string;
    redisHost: string;
    redisPort: number;
  }
}
