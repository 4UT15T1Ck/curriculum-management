import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApprovalAction } from '../../generated/prisma/client.js';
import {
  REMARK_MAX,
  REMARK_MIN,
} from '../../shared/change-requests/approval.constants.js';
import { emptyToNull, trimString } from '../../shared/dtos/transforms.js';

export class ApproveDecisionDto {
  @ApiPropertyOptional({ maxLength: REMARK_MAX })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(REMARK_MAX)
  remark?: string | null;
}

// Counted after trimming (D8): twenty spaces are not a reason.
export class DecisionRemarkDto {
  @ApiProperty({ minLength: REMARK_MIN, maxLength: REMARK_MAX })
  @Transform(trimString)
  @IsString()
  @MinLength(REMARK_MIN)
  @MaxLength(REMARK_MAX)
  remark!: string;
}

export const OVERRIDE_ACTIONS = [
  ApprovalAction.APPROVE,
  ApprovalAction.RETURN,
  ApprovalAction.REJECT,
] as const;
export type OverrideAction = (typeof OVERRIDE_ACTIONS)[number];

export class OverrideDecisionDto {
  @ApiProperty({ enum: OVERRIDE_ACTIONS, enumName: 'OverrideAction' })
  @IsIn(OVERRIDE_ACTIONS)
  action!: OverrideAction;

  @ApiProperty({ minLength: REMARK_MIN, maxLength: REMARK_MAX })
  @Transform(trimString)
  @IsString()
  @MinLength(REMARK_MIN)
  @MaxLength(REMARK_MAX)
  reason!: string;
}
