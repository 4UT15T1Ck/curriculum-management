import {
  CourseRelationType,
  CourseStatus,
  Prisma,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { mapUniqueViolation } from '../prisma/unique-violation.js';
import { COURSE_RELATION_ERRORS } from './course-relation.errors.js';
import {
  owningCourse,
  RELATION_COURSE_SELECT,
  RELATION_INCLUDE,
  type OwnerCourseRow,
  type RelationRow,
} from './relation-rows.js';
import {
  CYCLE_CHECKED_TYPES,
  findRequisiteCycle,
  lockRequisiteGraph,
  RELATION_CONSTRAINT,
} from './requisite-graph.js';

type Db = PrismaService | Prisma.TransactionClient;

export interface NewRelation {
  sourceCourseId: string;
  targetCourseId: string;
  relationType: CourseRelationType;
  minScore?: string | null;
}

// Who may change the relation is the caller's question (a screen checks the caller's cell; a final approval has the
// request's own three levels behind it). The data rules below are the same for both, and run in the caller's transaction.
export type BeforeRelationWrite<T> = (subject: T) => Promise<void> | void;

export async function createRelation(
  tx: Prisma.TransactionClient,
  dto: NewRelation,
  beforeWrite?: BeforeRelationWrite<OwnerCourseRow>,
): Promise<RelationRow> {
  if (dto.sourceCourseId === dto.targetCourseId) {
    throw new AppException(COURSE_RELATION_ERRORS.RELATION_SELF);
  }
  if (
    dto.minScore != null &&
    dto.relationType !== CourseRelationType.PREREQUISITE
  ) {
    throw minScoreNotAllowed();
  }
  const [source, target] = await Promise.all([
    findCourse(tx, dto.sourceCourseId),
    findCourse(tx, dto.targetCourseId),
  ]);
  if (
    source.status === CourseStatus.CANCELLED ||
    target.status === CourseStatus.CANCELLED
  ) {
    throw new AppException(COURSE_RELATION_ERRORS.RELATION_COURSE_CANCELLED);
  }
  await beforeWrite?.(
    owningCourse({
      relationType: dto.relationType,
      sourceCourse: source,
      targetCourse: target,
    }),
  );
  await lockRequisiteGraph(tx);
  if (CYCLE_CHECKED_TYPES.includes(dto.relationType)) {
    await assertNoCycle(tx, dto);
  }
  try {
    return await tx.courseRelation.create({
      data: {
        sourceCourseId: dto.sourceCourseId,
        targetCourseId: dto.targetCourseId,
        relationType: dto.relationType,
        minScore:
          dto.minScore == null ? null : new Prisma.Decimal(dto.minScore),
      },
      include: RELATION_INCLUDE,
    });
  } catch (error) {
    throw mapUniqueViolation(
      error,
      COURSE_RELATION_ERRORS.RELATION_EXISTS,
      'relationType',
    );
  }
}

export async function updateRelationMinScore(
  db: Db,
  relationId: string,
  minScore: string | null,
  beforeWrite?: BeforeRelationWrite<RelationRow>,
): Promise<RelationRow> {
  const row = await findRelation(db, relationId);
  await beforeWrite?.(row);
  if (
    minScore !== null &&
    row.relationType !== CourseRelationType.PREREQUISITE
  ) {
    throw minScoreNotAllowed();
  }
  return db.courseRelation.update({
    where: { id: relationId },
    data: { minScore: minScore === null ? null : new Prisma.Decimal(minScore) },
    include: RELATION_INCLUDE,
  });
}

export async function removeRelation(
  db: Db,
  relationId: string,
  beforeWrite?: BeforeRelationWrite<RelationRow>,
): Promise<RelationRow> {
  const row = await findRelation(db, relationId);
  await beforeWrite?.(row);
  // The only replacement of a discontinued course stays until another one is declared.
  if (
    row.relationType === CourseRelationType.REPLACEMENT &&
    row.sourceCourse.status === CourseStatus.DISCONTINUED
  ) {
    const others = await db.courseRelation.count({
      where: {
        id: { not: relationId },
        sourceCourseId: row.sourceCourseId,
        relationType: CourseRelationType.REPLACEMENT,
        targetCourse: { status: CourseStatus.ACTIVE },
      },
    });
    if (others === 0) {
      throw new AppException(COURSE_RELATION_ERRORS.REPLACEMENT_STILL_NEEDED);
    }
  }
  await db.courseRelation.delete({ where: { id: relationId } });
  return row;
}

export async function findRelation(
  db: Db,
  relationId: string,
): Promise<RelationRow> {
  const row = await db.courseRelation.findUnique({
    where: { id: relationId },
    include: RELATION_INCLUDE,
  });
  if (!row) {
    throw new AppException(COURSE_RELATION_ERRORS.RELATION_NOT_FOUND);
  }
  return row;
}

async function findCourse(db: Db, courseId: string): Promise<OwnerCourseRow> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: RELATION_COURSE_SELECT,
  });
  if (!course) {
    throw new AppException(COURSE_RELATION_ERRORS.RELATION_COURSE_NOT_FOUND);
  }
  return course;
}

async function assertNoCycle(
  tx: Prisma.TransactionClient,
  dto: NewRelation,
): Promise<void> {
  const edges = await tx.courseRelation.findMany({
    where: { relationType: { in: [...CYCLE_CHECKED_TYPES] } },
    select: { sourceCourseId: true, targetCourseId: true },
  });
  const cycle = findRequisiteCycle(edges, dto);
  if (!cycle) {
    return;
  }
  const courses = await tx.course.findMany({
    where: { id: { in: cycle } },
    select: { id: true, courseCode: true },
  });
  const codeOf = new Map(
    courses.map((course) => [course.id, course.courseCode]),
  );
  const base = COURSE_RELATION_ERRORS.REQUISITE_CYCLE;
  throw new AppException({
    ...base,
    message: `${base.message}: ${cycle.map((id) => codeOf.get(id)).join(' → ')}.`,
  });
}

function minScoreNotAllowed(): AppException {
  return new AppException(COURSE_RELATION_ERRORS.MIN_SCORE_NOT_ALLOWED, [
    { field: 'minScore', constraints: [RELATION_CONSTRAINT.GRADE_POINT] },
  ]);
}
