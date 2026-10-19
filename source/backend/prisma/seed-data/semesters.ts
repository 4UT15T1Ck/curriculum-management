import type { PrismaClient } from '../../src/generated/prisma/client.js';

// Placeholder calendar until the school's academic calendar is supplied (F15-03): the codes follow the
// year-term pattern, the start dates are typical ones and are corrected on MH-10. The seed never overwrites an edited row.
export const SEED_SEMESTERS: readonly {
  semesterCode: string;
  academicYear: string;
  termInYear: number;
  startDate: Date | null;
}[] = [
  {
    semesterCode: '2025-2026-1',
    academicYear: '2025-2026',
    termInYear: 1,
    startDate: new Date('2025-09-08T00:00:00.000Z'),
  },
  {
    semesterCode: '2025-2026-2',
    academicYear: '2025-2026',
    termInYear: 2,
    startDate: new Date('2026-01-19T00:00:00.000Z'),
  },
  {
    semesterCode: '2026-2027-1',
    academicYear: '2026-2027',
    termInYear: 1,
    startDate: new Date('2026-09-07T00:00:00.000Z'),
  },
  {
    semesterCode: '2026-2027-2',
    academicYear: '2026-2027',
    termInYear: 2,
    startDate: new Date('2027-01-18T00:00:00.000Z'),
  },
];

export const SEED_COHORTS: readonly {
  cohortCode: string;
  intakeYear: number;
}[] = [
  { cohortCode: 'K2023', intakeYear: 2023 },
  { cohortCode: 'K2024', intakeYear: 2024 },
  { cohortCode: 'K2025', intakeYear: 2025 },
  { cohortCode: 'K2026', intakeYear: 2026 },
];

export async function seedSemesters(prisma: PrismaClient): Promise<void> {
  for (const semester of SEED_SEMESTERS) {
    await prisma.semester.upsert({
      where: { semesterCode: semester.semesterCode },
      create: semester,
      update: {},
    });
  }
  for (const cohort of SEED_COHORTS) {
    await prisma.cohort.upsert({
      where: { cohortCode: cohort.cohortCode },
      create: cohort,
      update: {},
    });
  }
}
