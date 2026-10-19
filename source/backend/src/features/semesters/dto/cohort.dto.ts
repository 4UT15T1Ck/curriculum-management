import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { trimString } from '../../../shared/dtos/transforms.js';

export const COHORT_LIMITS = {
  CODE_MAX: 30,
  YEAR_MIN: 1900,
  YEAR_MAX: 2200,
} as const;

export class CreateCohortDto {
  @ApiProperty({ example: 'K2026' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Length(1, COHORT_LIMITS.CODE_MAX)
  cohortCode!: string;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(COHORT_LIMITS.YEAR_MIN)
  @Max(COHORT_LIMITS.YEAR_MAX)
  intakeYear!: number;
}

export class UpdateCohortDto extends PartialType(CreateCohortDto) {}
