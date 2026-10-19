import { describe, expect, it } from 'vitest';
import { fromIsoDay, todayDate, toIsoDay } from './today.js';

describe('todayDate', () => {
  it('uses the current calendar day in Vietnam', () => {
    expect(toIsoDay(todayDate(new Date('2026-10-18T17:30:00.000Z')))).toBe(
      '2026-10-19',
    );
    expect(toIsoDay(todayDate(new Date('2026-10-18T16:59:59.000Z')))).toBe(
      '2026-10-18',
    );
  });

  it('round-trips ISO calendar days', () => {
    const date = new Date('2026-10-18T12:34:56.000Z');

    expect(fromIsoDay(toIsoDay(date))).toEqual(
      new Date('2026-10-18T00:00:00.000Z'),
    );
  });
});
