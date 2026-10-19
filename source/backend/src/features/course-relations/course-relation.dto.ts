import { ApiProperty } from '@nestjs/swagger';
import { CourseRelationType } from '../../generated/prisma/client.js';
import { EDIT_PATHS, type EditPath } from '../../shared/authz/edit-path.js';
import { RelatedCourseDto } from '../../shared/courses/related-course.js';

export class CourseRelationDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: CourseRelationType, enumName: 'CourseRelationType' })
  relationType!: CourseRelationType;
  @ApiProperty({ type: RelatedCourseDto }) sourceCourse!: RelatedCourseDto;
  @ApiProperty({ type: RelatedCourseDto }) targetCourse!: RelatedCourseDto;
  @ApiProperty({ nullable: true, type: String }) minScore!: string | null;
  @ApiProperty({ enum: EDIT_PATHS, enumName: 'EditPath', nullable: true })
  editPath!: EditPath | null;
}

// The row shapes live in shared/ because the approved-write path (F-15) reads the same rows.
export {
  owningCourse,
  RELATION_COURSE_SELECT,
  RELATION_INCLUDE,
  type OwnerCourseRow,
  type RelationRow,
} from '../../shared/courses/relation-rows.js';
