import { ApiProperty } from '@nestjs/swagger';
import {
  CourseStatus,
  SyllabusStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { EDIT_PATHS, type EditPath } from '../../shared/authz/edit-path.js';
import { CourseUsageDto } from '../../shared/courses/course-usage.dto.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import { USER_REF_SELECT } from '../../shared/dtos/ref.dto.js';
import type { SyllabusCourseRow } from './syllabus-access.js';
import {
  AttachmentRulesDto,
  SyllabusAttachmentDto,
  toAttachmentDto,
} from './syllabus-attachment.dto.js';
import { CLO_INCLUDE, CloDto, toCloDto } from './clo.dto.js';
import {
  toWeeklyContentDto,
  WEEKLY_CONTENT_INCLUDE,
  WeeklyContentDto,
} from './weekly-content.dto.js';

export class SyllabusCourseDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty({ nullable: true, type: String }) englishName!: string | null;
  @ApiProperty({ example: '3' }) credits!: string;
  @ApiProperty({ enum: CourseStatus, enumName: 'CourseStatus' })
  status!: CourseStatus;
}

const NULLABLE_HTML = {
  nullable: true,
  type: String,
  description: 'Sanitized HTML; null = empty section',
} as const;

export class SyllabusDto {
  @ApiProperty() id!: string;
  @ApiProperty() revisionNumber!: number;
  @ApiProperty({ enum: SyllabusStatus, enumName: 'SyllabusStatus' })
  status!: SyllabusStatus;
  @ApiProperty(NULLABLE_HTML) courseDescription!: string | null;
  @ApiProperty(NULLABLE_HTML) englishDescription!: string | null;
  @ApiProperty(NULLABLE_HTML) objectives!: string | null;
  @ApiProperty(NULLABLE_HTML) teachingMethods!: string | null;
  @ApiProperty(NULLABLE_HTML) assessmentMethods!: string | null;
  @ApiProperty(NULLABLE_HTML) references!: string | null;
  @ApiProperty({ nullable: true, type: String }) publishedAt!: string | null;
  @ApiProperty() updatedAt!: string;
  @ApiProperty({ type: [WeeklyContentDto] })
  weeklyContents!: WeeklyContentDto[];
  @ApiProperty({ type: [SyllabusAttachmentDto] })
  attachments!: SyllabusAttachmentDto[];
  @ApiProperty({ type: [CloDto] })
  clos!: CloDto[];
}

export class CourseSyllabusDto {
  @ApiProperty({ type: SyllabusCourseDto }) course!: SyllabusCourseDto;
  @ApiProperty({ type: [CourseUsageDto] }) programsUsing!: CourseUsageDto[];
  @ApiProperty({ type: SyllabusDto, nullable: true })
  published!: SyllabusDto | null;
  @ApiProperty({ type: SyllabusDto, nullable: true })
  draft!: SyllabusDto | null;
  @ApiProperty() canCreate!: boolean;
  @ApiProperty({
    description: 'A Draft exists and its CLOs are directly editable',
  })
  canEditClos!: boolean;
  @ApiProperty({ enum: EDIT_PATHS, enumName: 'EditPath', nullable: true })
  editPath!: EditPath | null;
  @ApiProperty({ type: AttachmentRulesDto })
  attachmentRules!: AttachmentRulesDto;
}

export const SYLLABUS_INCLUDE = {
  weeklyContents: {
    include: WEEKLY_CONTENT_INCLUDE,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  },
  attachments: {
    include: { uploadedBy: { select: USER_REF_SELECT } },
    orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }],
  },
  clos: {
    include: CLO_INCLUDE,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  },
} as const satisfies Prisma.SyllabusInclude;
export type SyllabusRow = Prisma.SyllabusGetPayload<{
  include: typeof SYLLABUS_INCLUDE;
}>;

export function toSyllabusCourseDto(row: SyllabusCourseRow): SyllabusCourseDto {
  return {
    id: row.id,
    courseCode: row.courseCode,
    courseName: row.courseName,
    englishName: row.englishName,
    credits: toWireDecimal(row.credits),
    status: row.status,
  };
}

export function toSyllabusDto(
  row: SyllabusRow,
  canDeleteFrom: (uploadedById: string) => boolean,
): SyllabusDto {
  return {
    id: row.id,
    revisionNumber: row.revisionNumber,
    status: row.status,
    courseDescription: row.courseDescription,
    englishDescription: row.englishDescription,
    objectives: row.objectives,
    teachingMethods: row.teachingMethods,
    assessmentMethods: row.assessmentMethods,
    references: row.references,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    weeklyContents: row.weeklyContents.map(toWeeklyContentDto),
    clos: row.clos.map(toCloDto),
    attachments: row.attachments.map((attachment) =>
      toAttachmentDto(attachment, canDeleteFrom(attachment.uploadedBy.id)),
    ),
  };
}
