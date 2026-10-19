import { ApiProperty } from '@nestjs/swagger';
import { toWireDecimal } from '../decimal/decimal.js';
import type { ProgramCredits } from './program-credits.js';

// Shared because the consistency feature returns it too and a feature does not import another feature.
export class CreditBreakdownDto {
  @ApiProperty({ example: '98' }) compulsory!: string;
  @ApiProperty({ example: '50' }) elective!: string;
  @ApiProperty({ example: '148' }) total!: string;
}

export function toCreditBreakdownDto(
  credits: ProgramCredits,
): CreditBreakdownDto {
  return {
    compulsory: toWireDecimal(credits.compulsory),
    elective: toWireDecimal(credits.elective),
    total: toWireDecimal(credits.total),
  };
}
