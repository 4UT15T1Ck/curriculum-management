import { describe, expect, it } from 'vitest';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import {
  coversDay,
  overlapsPeriod,
  parsePeriod,
  validityState,
  VALIDITY_STATE,
} from './validity.js';

const TODAY = new Date('2026-10-19T00:00:00.000Z');
const BEFORE = new Date('2026-10-18T00:00:00.000Z');
const AFTER = new Date('2026-10-20T00:00:00.000Z');

describe('validity', () => {
  it.each([
    [
      { validFrom: TODAY, validTo: TODAY, revokedAt: null },
      VALIDITY_STATE.ACTIVE,
    ],
    [
      { validFrom: TODAY, validTo: null, revokedAt: null },
      VALIDITY_STATE.ACTIVE,
    ],
    [
      { validFrom: AFTER, validTo: null, revokedAt: null },
      VALIDITY_STATE.SCHEDULED,
    ],
    [
      { validFrom: BEFORE, validTo: BEFORE, revokedAt: null },
      VALIDITY_STATE.EXPIRED,
    ],
    [
      { validFrom: AFTER, validTo: null, revokedAt: TODAY },
      VALIDITY_STATE.REVOKED,
    ],
  ])('computes %o as %s', (row, state) => {
    expect(validityState(row, TODAY)).toBe(state);
  });

  it('parses inclusive and open periods and rejects reversed dates', () => {
    expect(parsePeriod('2026-10-19', '2026-10-19')).toEqual({
      validFrom: TODAY,
      validTo: TODAY,
    });
    expect(parsePeriod('2026-10-19')).toEqual({
      validFrom: TODAY,
      validTo: null,
    });
    expect(() => parsePeriod('2026-10-19', '2026-10-18')).toThrow(
      COMMON_ERRORS.VALIDITY_INVALID.message,
    );
  });

  it('builds inclusive overlap and day filters without capping an open period', () => {
    expect(overlapsPeriod({ validFrom: TODAY, validTo: null })).toEqual({
      OR: [{ validTo: null }, { validTo: { gte: TODAY } }],
    });
    expect(overlapsPeriod({ validFrom: BEFORE, validTo: AFTER })).toEqual({
      OR: [{ validTo: null }, { validTo: { gte: BEFORE } }],
      validFrom: { lte: AFTER },
    });
    expect(coversDay(TODAY)).toEqual({
      validFrom: { lte: TODAY },
      OR: [{ validTo: null }, { validTo: { gte: TODAY } }],
    });
  });
});
