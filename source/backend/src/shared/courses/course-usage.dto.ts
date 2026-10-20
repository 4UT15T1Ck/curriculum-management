import { ApiProperty } from '@nestjs/swagger';

// A program version that uses a course; shared by the course page and the syllabus screens.
export class CourseUsageDto {
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty({ nullable: true, type: String }) versionLabel!: string | null;
  @ApiProperty() plannedSemester!: number;
}
