import { Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PROGRAM_CONSTRAINT, PROGRAM_ERRORS } from './programs.errors.js';

export interface CreditTotals {
  totalCredits: string;
  compulsoryCredits: string;
  electiveCredits: string;
}

// BR-03; the gap goes into the message so the form can show it (KB-011).
export function assertCreditsAddUp(totals: CreditTotals): void {
  const sum = new Prisma.Decimal(totals.compulsoryCredits).plus(
    totals.electiveCredits,
  );
  const gap = sum.minus(totals.totalCredits);
  if (!gap.isZero()) {
    const base = PROGRAM_ERRORS.CREDITS_MISMATCH;
    throw new AppException(
      {
        ...base,
        message: `${base.message} (chênh lệch ${gap.abs().toString()} tín chỉ).`,
      },
      [
        {
          field: 'totalCredits',
          constraints: [PROGRAM_CONSTRAINT.CREDITS_SUM],
        },
      ],
    );
  }
}
