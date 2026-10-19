import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus, type Prisma } from '../../generated/prisma/client.js';
import { toWireDecimal } from '../decimal/decimal.js';
import { CourseRefDto } from '../dtos/ref.dto.js';

export class RelatedCourseDto extends CourseRefDto {
  @ApiProperty({ example: '3' }) credits!: string;
  @ApiProperty({ enum: CourseStatus, enumName: 'CourseStatus' })
  status!: CourseStatus;
}

export const RELATED_COURSE_SELECT = {
  id: true,
  courseCode: true,
  courseName: true,
  credits: true,
  status: true,
} as const satisfies Prisma.CourseSelect;

export function toRelatedCourseDto(
  row: Prisma.CourseGetPayload<{ select: typeof RELATED_COURSE_SELECT }>,
): RelatedCourseDto {
  return {
    id: row.id,
    courseCode: row.courseCode,
    courseName: row.courseName,
    credits: toWireDecimal(row.credits),
    status: row.status,
  };
}
