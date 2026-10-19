import { describe, expect, it } from 'vitest';
import { formatDay, formatTimestamp } from './format';

describe('release date formats', () => {
  it('formats a calendar day without a time zone shift', () => {
    expect(formatDay('2026-09-07')).toBe('07/09/2026');
  });

  it('shows a dash for a missing value', () => {
    expect(formatDay(null)).toBe('—');
    expect(formatTimestamp(null)).toBe('—');
  });
});
