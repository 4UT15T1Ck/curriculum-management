import { SyllabusStatus, type Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

export interface CurrentRevision {
  id: string;
  revisionNumber: number;
  status: SyllabusStatus;
}

// A curriculum row as far as syllabus lookup is concerned.
export interface RevisionItem {
  id: string;
  courseId: string;
  syllabusId: string | null;
}

type Db = Pick<PrismaService, 'syllabus'> | Prisma.TransactionClient;

const REVISION_SELECT = {
  id: true,
  courseId: true,
  revisionNumber: true,
  status: true,
} as const satisfies Prisma.SyllabusSelect;

// The revision each row maps, keyed by row id (a course shared by two versions can sit on different revisions).
// A released row is pinned to its revision, whatever that revision's status is now. A Draft row has no pin yet and reads
// the course's Published revision, else its Draft: that decides which CLOs the row has, never what a viewer may read.
// A row whose course has no revision maps to null.
export async function revisionForItems(
  db: Db,
  items: readonly RevisionItem[],
): Promise<Map<string, CurrentRevision | null>> {
  const result = new Map<string, CurrentRevision | null>();
  if (items.length === 0) return result;
  const pinnedIds = [
    ...new Set(
      items.flatMap((item) => (item.syllabusId ? [item.syllabusId] : [])),
    ),
  ];
  const pins = pinnedIds.length
    ? await db.syllabus.findMany({
        where: { id: { in: pinnedIds } },
        select: REVISION_SELECT,
      })
    : [];
  const pinById = new Map(pins.map((row) => [row.id, toRevision(row)]));
  const unpinnedCourseIds = [
    ...new Set(
      items.filter((item) => !item.syllabusId).map((item) => item.courseId),
    ),
  ];
  const fallback = await publishedElseDraft(db, unpinnedCourseIds);
  for (const item of items) {
    result.set(
      item.id,
      item.syllabusId
        ? (pinById.get(item.syllabusId) ?? null)
        : (fallback.get(item.courseId) ?? null),
    );
  }
  return result;
}

async function publishedElseDraft(
  db: Db,
  courseIds: readonly string[],
): Promise<Map<string, CurrentRevision>> {
  const byCourse = new Map<string, CurrentRevision>();
  if (courseIds.length === 0) return byCourse;
  const rows = await db.syllabus.findMany({
    where: {
      courseId: { in: [...courseIds] },
      status: { in: [SyllabusStatus.PUBLISHED, SyllabusStatus.DRAFT] },
      // A request's working copy is not a revision of the course.
      sourceRequestId: null,
    },
    select: REVISION_SELECT,
  });
  for (const row of rows) {
    const revision = toRevision(row);
    if (!revision) continue;
    const held = byCourse.get(row.courseId);
    if (!held || revision.status === SyllabusStatus.PUBLISHED) {
      byCourse.set(row.courseId, revision);
    }
  }
  return byCourse;
}

function toRevision(row: {
  id: string;
  revisionNumber: number | null;
  status: SyllabusStatus;
}): CurrentRevision | null {
  return row.revisionNumber === null
    ? null
    : { id: row.id, revisionNumber: row.revisionNumber, status: row.status };
}
