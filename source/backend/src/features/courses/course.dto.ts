import { ApiProperty } from '@nestjs/swagger';
import {
  CourseStatus,
  CourseType,
  type Prisma,
} from '../../generated/prisma/client.js';
import { EDIT_PATHS, type EditPath } from '../../shared/authz/edit-path.js';
import { RelatedCourseDto } from '../../shared/courses/related-course.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import {
  OrgUnitRefDto,
  SubjectGroupRefDto,
} from '../../shared/dtos/ref.dto.js';
import { HOME_FACULTY_CODE } from '../../shared/org-units/home-faculty.js';

export class CourseSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty({ nullable: true, type: String }) englishName!: string | null;
  @ApiProperty({ example: '2.5' }) credits!: string;
  @ApiProperty({ enum: CourseType, enumName: 'CourseType' })
  courseType!: CourseType;
  @ApiProperty({ enum: CourseStatus, enumName: 'CourseStatus' })
  status!: CourseStatus;
  @ApiProperty({ type: OrgUnitRefDto }) ownerFaculty!: OrgUnitRefDto;
  @ApiProperty({ type: SubjectGroupRefDto, nullable: true })
  ownerGroup!: SubjectGroupRefDto | null;
  @ApiProperty() isForeign!: boolean;
}

export class CoursePageDto {
  @ApiProperty({ type: [CourseSummaryDto] }) items!: CourseSummaryDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}

export class CourseUsageDto {
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty({ nullable: true, type: String }) versionLabel!: string | null;
  @ApiProperty() plannedSemester!: number;
}

export class CourseEquivalenceDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
  @ApiProperty({ type: [RelatedCourseDto] }) members!: RelatedCourseDto[];
}

export class CourseDetailDto extends CourseSummaryDto {
  @ApiProperty({ type: [CourseUsageDto] }) programsUsing!: CourseUsageDto[];
  @ApiProperty({ enum: EDIT_PATHS, enumName: 'EditPath', nullable: true })
  editPath!: EditPath | null;
  @ApiProperty() canChangeStatus!: boolean;
  @ApiProperty({ type: CourseEquivalenceDto, nullable: true })
  equivalenceGroup!: CourseEquivalenceDto | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export const COURSE_INCLUDE = {
  ownerFaculty: { select: { id: true, unitCode: true, unitName: true } },
  ownerGroup: {
    select: { id: true, groupCode: true, groupName: true, status: true },
  },
} as const satisfies Prisma.CourseInclude;

export type CourseRow = Prisma.CourseGetPayload<{
  include: typeof COURSE_INCLUDE;
}>;

export function toCourseSummaryDto(row: CourseRow): CourseSummaryDto {
  return {
    id: row.id,
    courseCode: row.courseCode,
    courseName: row.courseName,
    englishName: row.englishName,
    credits: toWireDecimal(row.credits),
    courseType: row.courseType,
    status: row.status,
    ownerFaculty: row.ownerFaculty,
    ownerGroup: row.ownerGroup,
    isForeign: row.ownerFaculty.unitCode !== HOME_FACULTY_CODE,
  };
}
