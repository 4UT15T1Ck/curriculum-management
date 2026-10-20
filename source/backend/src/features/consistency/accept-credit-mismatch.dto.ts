import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { trimString } from '../../shared/dtos/transforms.js';

export const CONSISTENCY_LIMITS = { REASON_MAX: 500 } as const;
export const CREDIT_GAP_PATTERN = /^-?\d{1,3}(\.\d{1,2})?$/;
export const CREDIT_GAP_MESSAGE = 'Chênh lệch tín chỉ không hợp lệ.';

export class AcceptCreditMismatchDto {
  @ApiProperty({ maxLength: CONSISTENCY_LIMITS.REASON_MAX })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty({ message: 'Nhập lý do chấp nhận chênh lệch.' })
  @MaxLength(CONSISTENCY_LIMITS.REASON_MAX)
  reason!: string;

  @ApiProperty({ example: '-2' })
  @Matches(CREDIT_GAP_PATTERN, { message: CREDIT_GAP_MESSAGE })
  compulsoryGap!: string;

  @ApiProperty({ example: '0' })
  @Matches(CREDIT_GAP_PATTERN, { message: CREDIT_GAP_MESSAGE })
  electiveGap!: string;
}
