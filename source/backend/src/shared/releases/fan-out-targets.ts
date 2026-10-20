import {
  ProgramStatus,
  ProgramVersionStatus,
  type Prisma,
  type ProgramVersion,
} from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

type Db = PrismaService | Prisma.TransactionClient;

export type TargetVersion = ProgramVersion & {
  program: { programCode: string };
  effectiveSemester: { startDate: Date | null } | null;
};

// US-075: a published syllabus change reaches every program in use whose in-force or upcoming version holds the course.
// Per program the newest such version is the base of the new one. Sorted by program id: the order locks are taken in.
export async function newestVersionsContainingCourse(
  db: Db,
  courseId: string,
): Promise<TargetVersion[]> {
  const rows = await db.programVersion.findMany({
    where: {
      sourceRequestId: null,
      // A program switched off is not in use: it gets no new version (same rule as the routing of the request).
      program: { status: ProgramStatus.ACTIVE },
      status: {
        in: [ProgramVersionStatus.ACTIVE, ProgramVersionStatus.PENDING],
      },
      curriculumItems: { some: { courseId } },
    },
    include: {
      program: { select: { programCode: true } },
      effectiveSemester: { select: { startDate: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  const newest = new Map<string, TargetVersion>();
  for (const row of rows) {
    if (!newest.has(row.programId)) newest.set(row.programId, row);
  }
  return [...newest.values()].sort((a, b) =>
    a.programId < b.programId ? -1 : 1,
  );
}
