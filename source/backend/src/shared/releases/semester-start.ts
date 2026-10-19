import type { Prisma, Semester } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { RELEASE_ERRORS } from './release.errors.js';

type Db = PrismaService | Prisma.TransactionClient;

export type StartedSemester = Semester & { startDate: Date };

// A release names its effective semester; one without a start date cannot be scheduled (never guessed from the signed date).
export async function requireSemesterStart(
  db: Db,
  semesterId: string,
): Promise<StartedSemester> {
  const semester = await db.semester.findUnique({ where: { id: semesterId } });
  if (!semester) throw new AppException(RELEASE_ERRORS.SEMESTER_NOT_FOUND);
  if (!semester.startDate) {
    throw new AppException(RELEASE_ERRORS.SEMESTER_START_UNKNOWN);
  }
  return { ...semester, startDate: semester.startDate };
}

export async function assertCohortsExist(
  db: Db,
  cohortIds: readonly string[],
): Promise<void> {
  const unique = [...new Set(cohortIds)];
  if (unique.length === 0) return;
  const found = await db.cohort.count({ where: { id: { in: unique } } });
  if (found !== unique.length) {
    throw new AppException(RELEASE_ERRORS.COHORT_NOT_FOUND);
  }
}
