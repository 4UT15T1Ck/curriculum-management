import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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
import {
  emptyToNull,
  trimString,
  trimUpperCase,
} from '../../shared/dtos/transforms.js';
import { OUTCOME_LIMITS } from './outcome.errors.js';
import { EditAccessDto, OutcomeVersionDto } from './outcome-version.dto.js';

export const PLO_FIELD = { CODE: 'ploCode' } as const;

export class CreatePloDto {
  @ApiProperty({ example: 'PLO1', description: 'Trimmed and upper-cased' })
  @Transform(trimUpperCase)
  @IsString()
  @Length(1, OUTCOME_LIMITS.PLO_CODE_MAX)
  ploCode!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @Length(1, OUTCOME_LIMITS.TEXT_MAX)
  description!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(OUTCOME_LIMITS.TEXT_MAX)
  englishDescription?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(OUTCOME_LIMITS.GROUP_MAX)
  competencyGroup?: string | null;
}

export class UpdatePloDto extends PartialType(CreatePloDto) {}

export class ReorderOutcomeRowsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(OUTCOME_LIMITS.PLOS_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}

export class PloDto {
  @ApiProperty() id!: string;
  @ApiProperty() ploCode!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ nullable: true, type: String }) englishDescription!:
    string | null;
  @ApiProperty({ nullable: true, type: String }) competencyGroup!:
    string | null;
  @ApiProperty({ description: '1-based, contiguous' }) sortOrder!: number;
  @ApiProperty({ description: 'Course cells that carry this PLO' })
  courseCount!: number;
  @ApiProperty({ description: 'CLO links that go with the PLO if deleted' })
  cloLinkCount!: number;
}

export class PloListDto extends EditAccessDto {
  @ApiProperty({ type: OutcomeVersionDto }) version!: OutcomeVersionDto;
  @ApiProperty({ type: [PloDto] }) plos!: PloDto[];
}

export interface PloUsage {
  courseCount: number;
  cloLinkCount: number;
}
export const NO_USAGE: PloUsage = { courseCount: 0, cloLinkCount: 0 };

export function toPloDto(
  row: {
    id: string;
    ploCode: string;
    description: string;
    englishDescription: string | null;
    competencyGroup: string | null;
    sortOrder: number;
  },
  usage: PloUsage,
): PloDto {
  return {
    id: row.id,
    ploCode: row.ploCode,
    description: row.description,
    englishDescription: row.englishDescription,
    competencyGroup: row.competencyGroup,
    sortOrder: row.sortOrder,
    courseCount: usage.courseCount,
    cloLinkCount: usage.cloLinkCount,
  };
}
