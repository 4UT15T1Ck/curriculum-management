import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, ValidateIf } from 'class-validator';
import {
  GRADE_POINT_MESSAGE,
  GRADE_POINT_PATTERN,
} from '../../shared/decimal/decimal.js';
import { emptyToNull } from '../../shared/dtos/transforms.js';

export class UpdateCourseRelationDto {
  @ApiProperty({ nullable: true, type: String, example: '2' })
  @Transform(emptyToNull)
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString()
  @Matches(GRADE_POINT_PATTERN, { message: GRADE_POINT_MESSAGE })
  minScore!: string | null;
}
