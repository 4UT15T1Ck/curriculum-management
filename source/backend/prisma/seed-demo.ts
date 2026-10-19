import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from '../src/shared/password/password-policy.js';
import { ORG_UNIT_CODES } from './seed-data/org-units.js';
import { SEED_PROGRAM_CODES } from './seed-data/programs.js';
import { ROLE_CODES } from './seed-data/roles.js';
import {
  seedDemoAccounts,
  seedDemoAssignments,
} from './seed-data/demo/accounts.js';
import { seedDemoCatalog } from './seed-data/demo/catalog.js';
import { seedDemoOutcomes } from './seed-data/demo/outcomes.js';
import { seedDemoPrograms } from './seed-data/demo/programs.js';
import { seedDemoCloLinks, seedDemoSyllabi } from './seed-data/demo/syllabi.js';

// Demo data for walking the MVP in a browser. Run after `pnpm prisma:seed`; safe to run again (every row is keyed on its
// natural code and an existing row is never overwritten). Releases, change requests and approvals are not created.
const password = process.env.SEED_DEMO_PASSWORD;
if (
  !password ||
  password.length < PASSWORD_MIN_LENGTH ||
  !PASSWORD_PATTERN.test(password)
) {
  throw new Error(
    'SEED_DEMO_PASSWORD must be set, at least 8 characters, with a letter and a digit',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function assertBaseSeedRan(): Promise<void> {
  const [faculty, roles, program] = await Promise.all([
    prisma.orgUnit.findUnique({
      where: { unitCode: ORG_UNIT_CODES.FACULTY_IT },
    }),
    prisma.role.count({
      where: { roleCode: { in: Object.values(ROLE_CODES) } },
    }),
    prisma.program.findUnique({
      where: { programCode: SEED_PROGRAM_CODES.COMPUTER_ENGINEERING },
    }),
  ]);
  if (!faculty || roles < Object.values(ROLE_CODES).length || !program) {
    throw new Error(
      'The base seed has not run: run `pnpm prisma:seed` first, then `pnpm prisma:seed:demo`',
    );
  }
}

try {
  await assertBaseSeedRan();
  await seedDemoAccounts(prisma, password);
  await seedDemoCatalog(prisma);
  const { mainVersionId } = await seedDemoPrograms(prisma);
  await seedDemoAssignments(prisma);
  await seedDemoSyllabi(prisma);
  await seedDemoOutcomes(prisma, mainVersionId);
  await seedDemoCloLinks(prisma, mainVersionId);
  console.log('Demo seed done.');
} finally {
  await prisma.$disconnect();
}
