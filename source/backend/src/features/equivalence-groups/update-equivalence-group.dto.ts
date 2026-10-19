import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { emptyToNull, trimUpperCase } from '../../shared/dtos/transforms.js';
import { EQUIVALENCE_LIMITS } from './create-equivalence-group.dto.js';

export class UpdateEquivalenceGroupDto {
  @ApiPropertyOptional({ maxLength: EQUIVALENCE_LIMITS.CODE_MAX })
  @Transform(trimUpperCase)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, EQUIVALENCE_LIMITS.CODE_MAX)
  groupCode?: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  @MaxLength(EQUIVALENCE_LIMITS.NOTE_MAX)
  note?: string | null;
}
