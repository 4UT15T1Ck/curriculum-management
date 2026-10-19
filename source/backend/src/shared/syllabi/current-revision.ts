import { SyllabusStatus, type Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export interface CurrentRevision {
  id: string;
  revisionNumber: number;
  status: SyllabusStatus;
}

// Published wins over Draft. Until curriculum rows pin a revision (F-15), this is the revision a program maps:
// it decides which CLOs a curriculum row has, not what a viewer may read, so it never looks at who is asking.
export async function currentRevisionByCourse(
  prisma: Pick<PrismaService, 'syllabus'> | Prisma.TransactionClient,
  courseIds: readonly string[],
): Promise<Map<string, CurrentRevision>> {
  const byCourse = new Map<string, CurrentRevision>();
  if (courseIds.length === 0) {
    return byCourse;
  }
  const rows = await prisma.syllabus.findMany({
    where: {
      courseId: { in: [...courseIds] },
      status: { in: [SyllabusStatus.PUBLISHED, SyllabusStatus.DRAFT] },
      // A request's working copy is not a revision of the course.
      sourceRequestId: null,
    },
    select: { id: true, courseId: true, revisionNumber: true, status: true },
  });
  for (const { courseId, revisionNumber, ...rest } of rows) {
    if (revisionNumber === null) {
      continue;
    }
    const revision = { ...rest, revisionNumber };
    const held = byCourse.get(courseId);
    if (!held || revision.status === SyllabusStatus.PUBLISHED) {
      byCourse.set(courseId, revision);
    }
  }
  return byCourse;
}
