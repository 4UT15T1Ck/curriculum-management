import { Prisma } from '../../generated/prisma/client.js';

// Row locks taken in id order, so two releases that touch the same rows queue instead of deadlocking.
// $queryRaw: SELECT ... FOR UPDATE returns rows, which the driver adapter can read.
export async function lockPrograms(
  tx: Prisma.TransactionClient,
  programIds: readonly string[],
): Promise<void> {
  const ids = [...new Set(programIds)].sort();
  if (ids.length === 0) return;
  await tx.$queryRaw`SELECT "id" FROM "Program" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" FOR UPDATE`;
}

export async function lockCourses(
  tx: Prisma.TransactionClient,
  courseIds: readonly string[],
): Promise<void> {
  const ids = [...new Set(courseIds)].sort();
  if (ids.length === 0) return;
  await tx.$queryRaw`SELECT "id" FROM "Course" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" FOR UPDATE`;
}

// Taken by a start-date edit and by an activation, so the one sees the other's result.
export async function lockSemester(
  tx: Prisma.TransactionClient,
  semesterId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "Semester" WHERE "id" = ${semesterId} FOR UPDATE`;
}

// A release rewrites every row of a version; the default 5 s interactive-transaction limit is too tight for a large frame.
export const RELEASE_TRANSACTION = {
  timeout: 30_000,
  maxWait: 10_000,
} as const;
