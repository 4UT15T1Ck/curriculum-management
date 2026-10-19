import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
import { SUBJECT_GROUP_FIELD_LIMITS } from './create-subject-group.dto.js';

export class UpdateSubjectGroupDto {
  @ApiPropertyOptional({ maxLength: SUBJECT_GROUP_FIELD_LIMITS.NAME_MAX })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, SUBJECT_GROUP_FIELD_LIMITS.NAME_MAX)
  groupName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facultyId?: string;
}
