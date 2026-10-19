import { Injectable, Logger } from '@nestjs/common';
import {
  CourseRelationType,
  CourseStatus,
  Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { assertDirectEdit, editPathFor } from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { courseTarget } from '../../shared/courses/course-target.js';
import { courseEditState } from '../../shared/courses/course-edit-state.js';
import { CourseUsageReader } from '../../shared/courses/course-usage.reader.js';
import { toRelatedCourseDto } from '../../shared/courses/related-course.js';
import {
  CYCLE_CHECKED_TYPES,
  findRequisiteCycle,
  lockRequisiteGraph,
} from '../../shared/courses/requisite-graph.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { mapUniqueViolation } from '../../shared/prisma/unique-violation.js';
import {
  owningCourse,
  RELATION_COURSE_SELECT,
  RELATION_INCLUDE,
  type CourseRelationDto,
  type OwnerCourseRow,
  type RelationRow,
} from './course-relation.dto.js';
import {
  COURSE_RELATION_ERRORS,
  RELATION_CONSTRAINT,
} from './course-relations.errors.js';
import { CreateCourseRelationDto } from './create-course-relation.dto.js';
import { UpdateCourseRelationDto } from './update-course-relation.dto.js';

@Injectable()
export class CourseRelationsService {
  private readonly logger = new Logger(CourseRelationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usage: CourseUsageReader,
  ) {}

  async listForCourse(
    courseId: string,
    access: AccessContext,
  ): Promise<CourseRelationDto[]> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { status: true },
    });
    if (
      !course ||
      (course.status === CourseStatus.CANCELLED &&
        !access.has(PERMISSIONS.COURSE_EDIT))
    ) {
      throw new AppException(COURSE_RELATION_ERRORS.COURSE_NOT_FOUND);
    }
    const rows = await this.prisma.courseRelation.findMany({
      where: {
        OR: [{ sourceCourseId: courseId }, { targetCourseId: courseId }],
      },
      include: RELATION_INCLUDE,
      orderBy: [{ relationType: 'asc' }, { createdAt: 'asc' }],
    });
    return Promise.all(rows.map((row) => this.toDto(row, access)));
  }

  async create(
    dto: CreateCourseRelationDto,
    access: AccessContext,
  ): Promise<CourseRelationDto> {
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
      this.findCourse(dto.sourceCourseId),
      this.findCourse(dto.targetCourseId),
    ]);
    if (
      source.status === CourseStatus.CANCELLED ||
      target.status === CourseStatus.CANCELLED
    ) {
      throw new AppException(COURSE_RELATION_ERRORS.RELATION_COURSE_CANCELLED);
    }
    const owner = owningCourse({
      relationType: dto.relationType,
      sourceCourse: source,
      targetCourse: target,
    });
    assertDirectEdit(
      access,
      PERMISSIONS.COURSE_RELATION_EDIT,
      courseTarget(owner),
      await courseEditState(this.usage, owner),
    );

    const row = await this.prisma.$transaction(async (tx) => {
      await lockRequisiteGraph(tx);
      if (CYCLE_CHECKED_TYPES.includes(dto.relationType)) {
        await this.assertNoCycle(tx, dto);
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
    });
    this.logger.log(
      `Relation ${row.relationType} ${row.sourceCourse.courseCode}→${row.targetCourse.courseCode} created by ${access.userId}`,
    );
    return this.toDto(row, access);
  }

  async updateMinScore(
    relationId: string,
    dto: UpdateCourseRelationDto,
    access: AccessContext,
  ): Promise<CourseRelationDto> {
    const row = await this.findOrThrow(relationId);
    await this.assertCanChange(row, access);
    if (
      dto.minScore !== null &&
      row.relationType !== CourseRelationType.PREREQUISITE
    ) {
      throw minScoreNotAllowed();
    }
    const updated = await this.prisma.courseRelation.update({
      where: { id: relationId },
      data: {
        minScore:
          dto.minScore === null ? null : new Prisma.Decimal(dto.minScore),
      },
      include: RELATION_INCLUDE,
    });
    return this.toDto(updated, access);
  }

  async remove(relationId: string, access: AccessContext): Promise<void> {
    const row = await this.findOrThrow(relationId);
    await this.assertCanChange(row, access);
    if (
      row.relationType === CourseRelationType.REPLACEMENT &&
      row.sourceCourse.status === CourseStatus.DISCONTINUED
    ) {
      const others = await this.prisma.courseRelation.count({
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
    await this.prisma.courseRelation.delete({ where: { id: relationId } });
    this.logger.log(`Relation ${relationId} removed by ${access.userId}`);
  }

  private async assertNoCycle(
    tx: Prisma.TransactionClient,
    dto: CreateCourseRelationDto,
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

  private async assertCanChange(
    row: RelationRow,
    access: AccessContext,
  ): Promise<void> {
    const owner = owningCourse(row);
    assertDirectEdit(
      access,
      PERMISSIONS.COURSE_RELATION_EDIT,
      courseTarget(owner),
      await courseEditState(this.usage, owner),
    );
  }

  private async toDto(
    row: RelationRow,
    access: AccessContext,
  ): Promise<CourseRelationDto> {
    const owner = owningCourse(row);
    return {
      id: row.id,
      relationType: row.relationType,
      sourceCourse: toRelatedCourseDto(row.sourceCourse),
      targetCourse: toRelatedCourseDto(row.targetCourse),
      minScore: row.minScore === null ? null : toWireDecimal(row.minScore),
      editPath: editPathFor(
        access,
        PERMISSIONS.COURSE_RELATION_EDIT,
        courseTarget(owner),
        await courseEditState(this.usage, owner),
      ),
    };
  }

  private async findCourse(courseId: string): Promise<OwnerCourseRow> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: RELATION_COURSE_SELECT,
    });
    if (!course) {
      throw new AppException(COURSE_RELATION_ERRORS.RELATION_COURSE_NOT_FOUND);
    }
    return course;
  }

  private async findOrThrow(relationId: string): Promise<RelationRow> {
    const row = await this.prisma.courseRelation.findUnique({
      where: { id: relationId },
      include: RELATION_INCLUDE,
    });
    if (!row) {
      throw new AppException(COURSE_RELATION_ERRORS.RELATION_NOT_FOUND);
    }
    return row;
  }
}

function minScoreNotAllowed(): AppException {
  return new AppException(COURSE_RELATION_ERRORS.MIN_SCORE_NOT_ALLOWED, [
    { field: 'minScore', constraints: [RELATION_CONSTRAINT.GRADE_POINT] },
  ]);
}
