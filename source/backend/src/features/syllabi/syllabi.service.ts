import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CourseStatus,
  SyllabusStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import {
  assertDirectEdit,
  EDIT_PATH,
  editPathFor,
} from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import type { Env } from '../../shared/config/env.validation.js';
import { courseTarget } from '../../shared/courses/course-target.js';
import { CourseUsageReader } from '../../shared/courses/course-usage.reader.js';
import { AppException } from '../../shared/exception/app.exception.js';
import {
  ATTACHMENT_FILE_TYPES,
  BYTES_PER_MB,
} from '../../shared/files/attachment-types.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { mapUniqueViolation } from '../../shared/prisma/unique-violation.js';
import { sanitizeRichText } from '../../shared/rich-text/sanitize-rich-text.js';
import {
  assertCourseVisible,
  assertDraftWrite,
  SYLLABUS_ACCESS_SELECT,
  SYLLABUS_COURSE_SELECT,
  seesDrafts,
  syllabusEditState,
} from './syllabus-access.js';
import type { AttachmentRulesDto } from './syllabus-attachment.dto.js';
import {
  SYLLABUS_INCLUDE,
  toSyllabusCourseDto,
  toSyllabusDto,
  type CourseSyllabusDto,
  type SyllabusDto,
} from './syllabus.dto.js';
import { SYLLABUS_ERRORS, SYLLABUS_LIMITS } from './syllabus.errors.js';
import {
  SYLLABUS_SECTION_FIELDS,
  type UpdateSyllabusDto,
} from './update-syllabus.dto.js';

@Injectable()
export class SyllabiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usage: CourseUsageReader,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // Always answers for a visible course: both revisions may be null ("chưa có đề cương", US-038 AC3).
  async forCourse(
    courseId: string,
    access: AccessContext,
  ): Promise<CourseSyllabusDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: SYLLABUS_COURSE_SELECT,
    });
    assertCourseVisible(course, access);
    const revisions = await this.prisma.syllabus.findMany({
      where: {
        courseId,
        status: { in: [SyllabusStatus.PUBLISHED, SyllabusStatus.DRAFT] },
      },
      include: SYLLABUS_INCLUDE,
    });
    const state = await syllabusEditState(this.prisma, course);
    const editPath = editPathFor(
      access,
      PERMISSIONS.SYLLABUS_EDIT,
      courseTarget(course),
      state,
    );
    const published =
      revisions.find((row) => row.status === SyllabusStatus.PUBLISHED) ?? null;
    const draft = seesDrafts(access)
      ? (revisions.find((row) => row.status === SyllabusStatus.DRAFT) ?? null)
      : null;
    const hasAnyRevision = revisions.length > 0 || state.released;
    const canDeleteFrom = (uploadedById: string) =>
      uploadedById === access.userId && editPath === EDIT_PATH.DIRECT;
    return {
      course: toSyllabusCourseDto(course),
      programsUsing: await this.usage.programsUsing(courseId),
      published: published && toSyllabusDto(published, () => false),
      draft: draft && toSyllabusDto(draft, canDeleteFrom),
      canCreate:
        !hasAnyRevision &&
        course.status !== CourseStatus.CANCELLED &&
        editPath === EDIT_PATH.DIRECT,
      editPath,
      attachmentRules: this.attachmentRules(),
    };
  }

  // DC-01: the first revision, as a Draft. Any existing revision makes this a conflict.
  async create(
    courseId: string,
    access: AccessContext,
  ): Promise<CourseSyllabusDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: SYLLABUS_COURSE_SELECT,
    });
    assertCourseVisible(course, access);
    assertDirectEdit(
      access,
      PERMISSIONS.SYLLABUS_EDIT,
      courseTarget(course),
      await syllabusEditState(this.prisma, course),
    );
    if (course.status === CourseStatus.CANCELLED) {
      throw new AppException(SYLLABUS_ERRORS.COURSE_CANCELLED);
    }
    if ((await this.prisma.syllabus.count({ where: { courseId } })) > 0) {
      throw new AppException(SYLLABUS_ERRORS.SYLLABUS_ALREADY_EXISTS);
    }
    try {
      await this.prisma.syllabus.create({
        data: {
          courseId,
          revisionNumber: SYLLABUS_LIMITS.FIRST_REVISION,
          status: SyllabusStatus.DRAFT,
        },
      });
    } catch (error) {
      throw mapUniqueViolation(
        error,
        SYLLABUS_ERRORS.SYLLABUS_ALREADY_EXISTS,
        'courseId',
      );
    }
    return this.forCourse(courseId, access);
  }

  // DC-02: only the sections present in the body change; each is sanitized, empty becomes null.
  async update(
    syllabusId: string,
    dto: UpdateSyllabusDto,
    access: AccessContext,
  ): Promise<SyllabusDto> {
    const row = await this.prisma.syllabus.findUnique({
      where: { id: syllabusId },
      select: SYLLABUS_ACCESS_SELECT,
    });
    await assertDraftWrite(this.prisma, access, row);
    const data: Prisma.SyllabusUpdateInput = {};
    for (const field of SYLLABUS_SECTION_FIELDS) {
      if (dto[field] !== undefined) {
        data[field] = sanitizeRichText(dto[field]);
      }
    }
    const updated = await this.prisma.syllabus.update({
      where: { id: syllabusId },
      data,
      include: SYLLABUS_INCLUDE,
    });
    return toSyllabusDto(
      updated,
      (uploadedById) => uploadedById === access.userId,
    );
  }

  attachmentRules(): AttachmentRulesDto {
    return {
      maxBytes:
        this.config.get('ATTACHMENT_MAX_MB', { infer: true }) * BYTES_PER_MB,
      fileTypes: ATTACHMENT_FILE_TYPES,
    };
  }
}
