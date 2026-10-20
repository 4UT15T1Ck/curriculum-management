import { ApiProperty } from '@nestjs/swagger';
import type { CloGap, CourseGap } from '../../shared/outcomes/outcome-gaps.js';
import { OutcomeVersionDto, PloHeaderDto } from './outcome-version.dto.js';

export class CourseGapDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty() plannedSemester!: number;
}

export class CloGapDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty() cloId!: string;
  @ApiProperty() cloCode!: string;
  @ApiProperty() cloDescription!: string;
}

export class OutcomeCoverageDto {
  @ApiProperty({ type: OutcomeVersionDto }) version!: OutcomeVersionDto;
  @ApiProperty({ type: [PloHeaderDto] }) plosWithoutCourse!: PloHeaderDto[];
  @ApiProperty({ type: [CloGapDto] }) closWithoutPlo!: CloGapDto[];
  @ApiProperty({ type: [CourseGapDto] }) coursesWithoutPlo!: CourseGapDto[];
  @ApiProperty({
    description: 'Courses skipped from the CLO list for lack of a syllabus',
  })
  coursesWithoutSyllabus!: number;
  @ApiProperty({ description: 'Course lists hold only the caller’s groups' })
  filteredToGroups!: boolean;
}

// The owner group is a filter key, not part of the contract.
export function toCourseGapDto(gap: CourseGap): CourseGapDto {
  return {
    itemId: gap.itemId,
    courseCode: gap.courseCode,
    courseName: gap.courseName,
    plannedSemester: gap.plannedSemester,
  };
}

export function toCloGapDto(gap: CloGap): CloGapDto {
  return {
    itemId: gap.itemId,
    courseCode: gap.courseCode,
    courseName: gap.courseName,
    cloId: gap.cloId,
    cloCode: gap.cloCode,
    cloDescription: gap.cloDescription,
  };
}
