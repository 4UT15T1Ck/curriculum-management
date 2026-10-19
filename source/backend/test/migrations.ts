import { execSync } from 'node:child_process';

export function applyMigrations(databaseUrl: string): void {
  execSync('pnpm exec prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
}
