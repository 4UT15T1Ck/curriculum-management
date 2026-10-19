import { Injectable, Logger } from '@nestjs/common';
import { CourseStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { assertDirectEdit, editPathFor } from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { courseTarget } from '../../shared/courses/course-target.js';
import { courseEditState } from '../../shared/courses/course-edit-state.js';
import { CourseUsageReader } from '../../shared/courses/course-usage.reader.js';
import { toRelatedCourseDto } from '../../shared/courses/related-course.js';
import {
  createRelation,
  removeRelation,
  updateRelationMinScore,
} from '../../shared/courses/course-relation.writer.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  owningCourse,
  RELATION_INCLUDE,
  type CourseRelationDto,
  type OwnerCourseRow,
  type RelationRow,
} from './course-relation.dto.js';
import { COURSE_RELATION_ERRORS } from './course-relations.errors.js';
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
    const row = await this.prisma.$transaction((tx) =>
      createRelation(tx, dto, (owner) => this.assertCanChange(owner, access)),
    );
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
    const updated = await updateRelationMinScore(
      this.prisma,
      relationId,
      dto.minScore,
      (row) => this.assertCanChange(owningCourse(row), access),
    );
    return this.toDto(updated, access);
  }

  async remove(relationId: string, access: AccessContext): Promise<void> {
    await removeRelation(this.prisma, relationId, (row) =>
      this.assertCanChange(owningCourse(row), access),
    );
    this.logger.log(`Relation ${relationId} removed by ${access.userId}`);
  }

  private async assertCanChange(
    owner: OwnerCourseRow,
    access: AccessContext,
  ): Promise<void> {
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
}
