import { daysSince, subtractDays, waitingBefore } from './days-since.js';
import { fromIsoDay } from './today.js';

describe('daysSince', () => {
  const today = fromIsoDay('2026-10-20');

  it('counts calendar days in the school time zone, not elapsed hours', () => {
    // 23:50 on the 19th in Ho Chi Minh City is 16:50 UTC.
    expect(daysSince(new Date('2026-10-19T16:50:00Z'), today)).toBe(1);
  });

  it('is 0 for an event today and never negative', () => {
    expect(daysSince(new Date('2026-10-20T03:00:00Z'), today)).toBe(0);
    expect(daysSince(new Date('2026-10-25T03:00:00Z'), today)).toBe(0);
  });

  it('subtracts whole days from a day', () => {
    expect(subtractDays(today, 3)).toEqual(fromIsoDay('2026-10-17'));
  });

  it('puts the backlog cut-off at the start of the local day, so day N is included', () => {
    expect(waitingBefore(3, today)).toEqual(new Date('2026-10-17T17:00:00Z'));
    // Entered 18 Oct 08:00 local: daysWaiting 2 at 20 Oct, so not 3 days or more.
    expect(new Date('2026-10-18T01:00:00Z') < waitingBefore(3, today)).toBe(
      false,
    );
    expect(new Date('2026-10-17T10:00:00Z') < waitingBefore(3, today)).toBe(
      true,
    );
    expect(daysSince(new Date('2026-10-17T10:00:00Z'), today)).toBe(3);
  });
});
