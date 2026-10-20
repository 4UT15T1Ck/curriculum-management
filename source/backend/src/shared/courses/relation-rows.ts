import {
  CourseRelationType,
  type Prisma,
} from '../../generated/prisma/client.js';
import { RELATED_COURSE_SELECT } from './related-course.js';

const OWNER_SELECT = {
  ...RELATED_COURSE_SELECT,
  ownerFacultyId: true,
  ownerGroupId: true,
  ownerFaculty: { select: { unitCode: true } },
} as const satisfies Prisma.CourseSelect;

export const RELATION_INCLUDE = {
  sourceCourse: { select: OWNER_SELECT },
  targetCourse: { select: OWNER_SELECT },
} as const satisfies Prisma.CourseRelationInclude;

export type RelationRow = Prisma.CourseRelationGetPayload<{
  include: typeof RELATION_INCLUDE;
}>;
export type OwnerCourseRow = Prisma.CourseGetPayload<{
  select: typeof OWNER_SELECT;
}>;
export const RELATION_COURSE_SELECT = OWNER_SELECT;

// The course that holds the requirement: the target, except a replacement belongs to the discontinued source.
export function owningCourse(
  row: Pick<RelationRow, 'relationType' | 'sourceCourse' | 'targetCourse'>,
): OwnerCourseRow {
  return row.relationType === CourseRelationType.REPLACEMENT
    ? row.sourceCourse
    : row.targetCourse;
}
