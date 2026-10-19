import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export const SUBJECT_GROUP_FIELD_LIMITS = {
  CODE_MAX: 32,
  NAME_MAX: 200,
} as const;
export const GROUP_CODE_PATTERN = /^[A-Z0-9_]+$/;

export class CreateSubjectGroupDto {
  @ApiProperty({ maxLength: SUBJECT_GROUP_FIELD_LIMITS.CODE_MAX })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(1, SUBJECT_GROUP_FIELD_LIMITS.CODE_MAX)
  @Matches(GROUP_CODE_PATTERN)
  groupCode!: string;

  @ApiProperty({ maxLength: SUBJECT_GROUP_FIELD_LIMITS.NAME_MAX })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, SUBJECT_GROUP_FIELD_LIMITS.NAME_MAX)
  groupName!: string;

  @ApiProperty()
  @IsString()
  facultyId!: string;
}
