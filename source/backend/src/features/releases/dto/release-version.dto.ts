import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { trimString } from '../../../shared/dtos/transforms.js';
import { VERSION_NUMBER_PATTERN } from '../../../shared/releases/version-number.js';
import { ReleaseDecisionDto } from '../../../shared/releases/release-decision.dto.js';

export const RELEASE_LIMITS = {
  COHORTS_MAX: 50,
  REASON_MAX: 2000,
} as const;

export class ReleaseVersionDto extends ReleaseDecisionDto {
  @ApiPropertyOptional({ example: '1.0', default: '1.0' })
  @IsOptional()
  @Matches(VERSION_NUMBER_PATTERN)
  versionNumber?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(RELEASE_LIMITS.COHORTS_MAX)
  @IsString({ each: true })
  cohortIds!: string[];
}

export class IssueCorrectionDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(RELEASE_LIMITS.REASON_MAX)
  reason!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  moveCohorts?: boolean;
}
