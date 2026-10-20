import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from '../../generated/prisma/client.js';
import {
  RELATED_COURSE_SELECT,
  RelatedCourseDto,
  toRelatedCourseDto,
} from '../../shared/courses/related-course.js';

export class EquivalenceGroupDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
  @ApiProperty({ nullable: true, type: String }) note!: string | null;
  @ApiProperty({ type: [RelatedCourseDto] }) members!: RelatedCourseDto[];
  @ApiProperty() updatedAt!: string;
}

export class EquivalenceGroupPageDto {
  @ApiProperty({ type: [EquivalenceGroupDto] }) items!: EquivalenceGroupDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}

export const GROUP_INCLUDE = {
  members: { select: RELATED_COURSE_SELECT, orderBy: { courseCode: 'asc' } },
} as const satisfies Prisma.EquivalentCourseGroupInclude;

export type GroupRow = Prisma.EquivalentCourseGroupGetPayload<{
  include: typeof GROUP_INCLUDE;
}>;

export function toEquivalenceGroupDto(row: GroupRow): EquivalenceGroupDto {
  return {
    id: row.id,
    groupCode: row.groupCode,
    note: row.note,
    members: row.members.map(toRelatedCourseDto),
    updatedAt: row.updatedAt.toISOString(),
  };
}
