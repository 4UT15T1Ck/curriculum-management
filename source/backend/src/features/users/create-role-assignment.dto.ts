import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { ScopeType } from '../../generated/prisma/client.js';
import { ISO_DAY_LENGTH } from '../../shared/time/today.js';

export const ASSIGNABLE_SCOPE_TYPES = [
  ScopeType.SYSTEM,
  ScopeType.UNIT,
] as const;

export class CreateRoleAssignmentDto {
  @ApiProperty()
  @IsString()
  roleId!: string;

  @ApiProperty({ enum: ASSIGNABLE_SCOPE_TYPES })
  @IsIn(ASSIGNABLE_SCOPE_TYPES)
  scopeType!: (typeof ASSIGNABLE_SCOPE_TYPES)[number];

  @ApiPropertyOptional()
  @ValidateIf(
    (dto: CreateRoleAssignmentDto) => dto.scopeType === ScopeType.UNIT,
  )
  @IsString()
  @IsNotEmpty()
  scopeUnitId?: string;

  @ApiProperty({ format: 'date' })
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  validFrom!: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  validTo?: string;
}
