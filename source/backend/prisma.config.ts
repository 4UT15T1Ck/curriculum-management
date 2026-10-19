import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Not env(): it throws when the variable is unset, and `prisma generate` runs on install before any .env exists.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: process.env.DATABASE_URL },
});
