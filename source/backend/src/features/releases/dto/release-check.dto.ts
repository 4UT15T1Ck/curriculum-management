import { ApiProperty } from '@nestjs/swagger';
import { CurriculumWarningDto } from '../../../shared/curriculum/curriculum-warning.dto.js';
import { SyllabusReleaseIssueDto } from '../../../shared/releases/release-issue.dto.js';

// MH-45 preflight: advisory (the POST repeats every check), never a lock.
export class ReleaseCheckDto {
  @ApiProperty() versionId!: string;
  @ApiProperty() canRelease!: boolean;
  @ApiProperty({ type: [CurriculumWarningDto] })
  consistencyIssues!: CurriculumWarningDto[];
  @ApiProperty({ type: [SyllabusReleaseIssueDto] })
  syllabusIssues!: SyllabusReleaseIssueDto[];
}
