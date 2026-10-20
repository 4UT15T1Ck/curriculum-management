import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { emptyToNull, trimUpperCase } from '../../shared/dtos/transforms.js';

export const EQUIVALENCE_LIMITS = {
  CODE_MAX: 20,
  NOTE_MAX: 500,
  QUERY_MAX: 100,
  MEMBERS_MIN: 2,
  MEMBERS_MAX: 50,
} as const;

export class CreateEquivalenceGroupDto {
  @ApiProperty({ maxLength: EQUIVALENCE_LIMITS.CODE_MAX })
  @Transform(trimUpperCase)
  @IsString()
  @Length(1, EQUIVALENCE_LIMITS.CODE_MAX)
  groupCode!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  @MaxLength(EQUIVALENCE_LIMITS.NOTE_MAX)
  note?: string | null;

  @ApiProperty({ type: [String], minItems: EQUIVALENCE_LIMITS.MEMBERS_MIN })
  @IsArray()
  @ArrayMinSize(EQUIVALENCE_LIMITS.MEMBERS_MIN)
  @ArrayMaxSize(EQUIVALENCE_LIMITS.MEMBERS_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  courseIds!: string[];
}
