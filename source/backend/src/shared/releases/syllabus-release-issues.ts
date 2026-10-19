import { SyllabusStatus, type Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { richTextToPlain } from '../rich-text/rich-text-to-plain.js';
import { RELEASE_ERRORS } from './release.errors.js';
import {
  SYLLABUS_ISSUE_CODE,
  type SyllabusReleaseIssueDto,
} from './release-issue.dto.js';

type Db = PrismaService | Prisma.TransactionClient;

// DC-03 publish conditions that exist today. The assessment ones (weights 100%, a component per CLO, thresholds)
// belong to F-12, which owns grading data; this list grows there rather than being faked here.
export const SYLLABUS_PUBLISH_CONDITION = {
  DESCRIPTION: 'COURSE_DESCRIPTION_EMPTY',
  OBJECTIVES: 'OBJECTIVES_EMPTY',
} as const;

export function syllabusPublishIssues(syllabus: {
  courseDescription: string | null;
  objectives: string | null;
}): string[] {
  const issues: string[] = [];
  if (richTextToPlain(syllabus.courseDescription) === null) {
    issues.push(SYLLABUS_PUBLISH_CONDITION.DESCRIPTION);
  }
  if (richTextToPlain(syllabus.objectives) === null) {
    issues.push(SYLLABUS_PUBLISH_CONDITION.OBJECTIVES);
  }
  return issues;
}

// A version's unpinned rows each need a revision to publish with: the course's Published one, else a complete Draft.
// Pinned rows are already published. Read-only, so the preview and the release check one rule.
export async function collectSyllabusIssues(
  db: Db,
  versionId: string,
): Promise<SyllabusReleaseIssueDto[]> {
  const items = await db.curriculumItem.findMany({
    where: { versionId, syllabusId: null },
    select: { courseId: true, course: { select: { courseCode: true } } },
    orderBy: [{ plannedSemester: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });
  if (items.length === 0) return [];
  const revisions = await db.syllabus.findMany({
    where: {
      courseId: { in: items.map((item) => item.courseId) },
      status: { in: [SyllabusStatus.PUBLISHED, SyllabusStatus.DRAFT] },
      sourceRequestId: null,
    },
    select: {
      courseId: true,
      status: true,
      courseDescription: true,
      objectives: true,
    },
  });
  const issues: SyllabusReleaseIssueDto[] = [];
  for (const item of items) {
    const own = revisions.filter((row) => row.courseId === item.courseId);
    const where = {
      courseId: item.courseId,
      courseCode: item.course.courseCode,
    };
    if (own.some((row) => row.status === SyllabusStatus.PUBLISHED)) continue;
    const draft = own.find((row) => row.status === SyllabusStatus.DRAFT);
    if (!draft) {
      issues.push({
        ...where,
        code: SYLLABUS_ISSUE_CODE.MISSING_SYLLABUS,
        details: [],
      });
      continue;
    }
    const details = syllabusPublishIssues(draft);
    if (details.length > 0) {
      issues.push({
        ...where,
        code: SYLLABUS_ISSUE_CODE.SYLLABUS_INCOMPLETE,
        details,
      });
    }
  }
  return issues;
}

// The same check as the preview, raised: every course that cannot be released is named with what it lacks.
export async function assertNoSyllabusIssues(
  db: Db,
  versionId: string,
): Promise<void> {
  const issues = await collectSyllabusIssues(db, versionId);
  if (issues.length > 0) {
    throw new AppException(
      RELEASE_ERRORS.SYLLABUS_INCOMPLETE,
      issues.map((issue) => ({
        field: issue.courseCode,
        constraints: [issue.code, ...issue.details],
      })),
    );
  }
}
