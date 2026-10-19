import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
import { ORG_UNIT_FIELD_LIMITS } from './create-org-unit.dto.js';

export class UpdateOrgUnitDto {
  @ApiPropertyOptional({ maxLength: ORG_UNIT_FIELD_LIMITS.NAME_MAX })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, ORG_UNIT_FIELD_LIMITS.NAME_MAX)
  unitName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentUnitId?: string;
}
