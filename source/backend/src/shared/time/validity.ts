import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { fromIsoDay } from './today.js';

export const VALIDITY_STATE = {
  ACTIVE: 'ACTIVE',
  SCHEDULED: 'SCHEDULED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;
export type ValidityState =
  (typeof VALIDITY_STATE)[keyof typeof VALIDITY_STATE];
export const VALIDITY_STATES = Object.values(VALIDITY_STATE);

export interface Period {
  validFrom: Date;
  validTo: Date | null;
}

export interface DatedRow extends Period {
  revokedAt: Date | null;
}

export function validityState(row: DatedRow, today: Date): ValidityState {
  if (row.revokedAt) return VALIDITY_STATE.REVOKED;
  if (row.validFrom > today) return VALIDITY_STATE.SCHEDULED;
  if (row.validTo && row.validTo < today) return VALIDITY_STATE.EXPIRED;
  return VALIDITY_STATE.ACTIVE;
}

export function parsePeriod(
  validFrom: string,
  validTo?: string | null,
): Period {
  const period = {
    validFrom: fromIsoDay(validFrom),
    validTo: validTo ? fromIsoDay(validTo) : null,
  };
  if (period.validTo && period.validTo < period.validFrom) {
    throw new AppException(COMMON_ERRORS.VALIDITY_INVALID);
  }
  return period;
}

export function overlapsPeriod(period: Period) {
  return {
    OR: [{ validTo: null }, { validTo: { gte: period.validFrom } }],
    ...(period.validTo && { validFrom: { lte: period.validTo } }),
  };
}

export function coversDay(today: Date) {
  return {
    validFrom: { lte: today },
    OR: [{ validTo: null }, { validTo: { gte: today } }],
  };
}
