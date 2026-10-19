import { describe, expect, it } from 'vitest';
import { formatWeight, isValidWeight, normalizeWeight } from './weight';

describe('weight', () => {
  it.each(['0,5', '0.5', '1', '1,00', '0.01', ' 0,75 '])('accepts %s', (v) => {
    expect(isValidWeight(v)).toBe(true);
  });

  it.each(['1,5', '0', '0.555', '', '.5', 'abc', '2', '0.00'])(
    'refuses %s',
    (v) => {
      expect(isValidWeight(v)).toBe(false);
    },
  );

  it('sends a dot, whatever the user typed', () => {
    expect(normalizeWeight(' 0,5 ')).toBe('0.5');
  });

  it('prints the wire decimal the Vietnamese way', () => {
    expect(formatWeight('0.5')).toBe('0,5');
    expect(formatWeight('1')).toBe('1');
  });
});
