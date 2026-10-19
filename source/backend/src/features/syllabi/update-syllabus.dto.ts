import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { SYLLABUS_SECTION_FIELDS } from '../../shared/syllabi/syllabus-sections.js';
import { SYLLABUS_LIMITS } from './syllabus.errors.js';

// Every field is optional: only the sections sent change (two people may edit different sections).
// null clears a section; the HTML is sanitized on save.
export class UpdateSyllabusDto {
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  courseDescription?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  englishDescription?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  objectives?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  teachingMethods?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  assessmentMethods?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  references?: string | null;
}

export { SYLLABUS_SECTION_FIELDS };

// The shared list must stay a subset of this DTO's fields.
export const SECTION_FIELDS_CHECK: readonly (keyof UpdateSyllabusDto)[] =
  SYLLABUS_SECTION_FIELDS;
