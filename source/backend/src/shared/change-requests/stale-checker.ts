import { Injectable } from '@nestjs/common';
import {
  SyllabusStatus,
  type ChangeItem,
  type CourseRelationType,
  type ChangeRequestType,
  type ChangeTargetType,
  type Prisma,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { toIsoDay } from '../time/today.js';
import { AUTHORED_OPERATION } from './authored-item.types.js';
import { newestReleasedVersion } from './released-base.js';
import { WORKSPACE_KIND, workspaceKindFor } from './request-kinds.js';

type Db = PrismaService | Prisma.TransactionClient;
type Bag = Record<string, unknown>;

export interface StaleSubject {
  id: string;
  requestType: ChangeRequestType;
  targetType: ChangeTargetType;
  programId: string | null;
  courseId: string | null;
}

// EC-27: a request is stale when what it was written against is no longer what is in force.
// Used at submit here, and by F-15 at final approval.
@Injectable()
export class StaleChecker {
  async isStale(db: Db, request: StaleSubject): Promise<boolean> {
    const kind = workspaceKindFor(request.requestType, request.targetType);
    if (kind === WORKSPACE_KIND.PROGRAM_VERSION) {
      const copy = await db.programVersion.findUniqueOrThrow({
        where: { sourceRequestId: request.id },
        select: { baseVersionId: true },
      });
      const newest = await newestReleasedVersion(db, request.programId!);
      return newest?.id !== copy.baseVersionId;
    }
    if (kind === WORKSPACE_KIND.SYLLABUS) {
      const copy = await db.syllabus.findUniqueOrThrow({
        where: { sourceRequestId: request.id },
        select: { baseRevisionId: true },
      });
      const published = await db.syllabus.findFirst({
        where: {
          courseId: request.courseId!,
          status: SyllabusStatus.PUBLISHED,
        },
        select: { id: true },
      });
      return published?.id !== copy.baseRevisionId;
    }
    const items = await db.changeItem.findMany({
      where: { changeRequestId: request.id },
    });
    for (const item of items) {
      if (!(await this.authoredStillMatches(db, item, request.courseId))) {
        return true;
      }
    }
    return false;
  }

  // COURSE_FIELD: the field still holds oldValue.value. Relation update / remove: the row exists with oldValue.minScore.
  // Relation add: no row with the three keys. END_*: the row is not revoked and still ends when oldValue.validTo says.
  // ADD_MEMBER / ASSIGN_DIRECTOR add a new row and are never stale.
  private async authoredStillMatches(
    db: Db,
    item: ChangeItem,
    courseId: string | null,
  ): Promise<boolean> {
    const next = asBag(item.newValue);
    const prior = asBag(item.oldValue);
    if (!next) return true;
    switch (next.operation) {
      case AUTHORED_OPERATION.SET_COURSE_FIELD: {
        const course =
          courseId && (await db.course.findUnique({ where: { id: courseId } }));
        if (!course) return false;
        const field = String(next.field) as keyof typeof course;
        const current = course[field];
        return (
          (current === null ? null : String(current)) === (prior?.value ?? null)
        );
      }
      case AUTHORED_OPERATION.ADD_RELATION: {
        const found = await db.courseRelation.findFirst({
          where: {
            sourceCourseId: String(next.sourceCourseId),
            targetCourseId: String(next.targetCourseId),
            relationType: next.relationType as CourseRelationType,
          },
          select: { id: true },
        });
        return found === null;
      }
      case AUTHORED_OPERATION.UPDATE_RELATION:
      case AUTHORED_OPERATION.REMOVE_RELATION: {
        const relation = await db.courseRelation.findUnique({
          where: { id: String(next.relationId) },
          select: { minScore: true },
        });
        return (
          relation !== null &&
          (relation.minScore === null ? null : relation.minScore.toString()) ===
            (prior?.minScore ?? null)
        );
      }
      case AUTHORED_OPERATION.END_MEMBERSHIP: {
        const row = await db.subjectGroupMember.findUnique({
          where: { id: String(next.memberRowId) },
          select: { revokedAt: true, validTo: true },
        });
        return (
          row !== null &&
          row.revokedAt === null &&
          sameDay(row.validTo, prior?.validTo)
        );
      }
      case AUTHORED_OPERATION.END_DIRECTOR: {
        const row = await db.programDirectorAssignment.findUnique({
          where: { id: String(next.assignmentId) },
          select: { revokedAt: true, validTo: true },
        });
        return (
          row !== null &&
          row.revokedAt === null &&
          sameDay(row.validTo, prior?.validTo)
        );
      }
      default:
        return true;
    }
  }
}

const asBag = (value: unknown): Bag | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Bag)
    : null;

function sameDay(current: Date | null, stored: unknown): boolean {
  return (current ? toIsoDay(current) : null) === (stored ?? null);
}
