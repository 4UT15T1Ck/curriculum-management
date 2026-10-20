import { describe, expect, it } from 'vitest';
import {
  compareDecimals,
  fromHundredths,
  sumDecimals,
  toHundredths,
} from './decimal';

describe('decimal strings', () => {
  it('reads and writes without float drift', () => {
    expect(toHundredths('2.5')).toBe(250);
    expect(toHundredths('3')).toBe(300);
    expect(toHundredths('0.05')).toBe(5);
    expect(fromHundredths(250)).toBe('2.5');
    expect(fromHundredths(5)).toBe('0.05');
    expect(fromHundredths(600)).toBe('6');
  });

  it('adds 2.5 and 3.5 to exactly 6', () => {
    expect(sumDecimals(['2.5', '3.5'])).toBe('6');
    expect(sumDecimals(['0.1', '0.2'])).toBe('0.3');
    expect(sumDecimals([])).toBe('0');
  });

  it('compares by value, not by text', () => {
    expect(compareDecimals('6', '6.00')).toBe(0);
    expect(compareDecimals('5.5', '6')).toBeLessThan(0);
    expect(compareDecimals('15', '6')).toBeGreaterThan(0);
  });

  it('gives NaN for something that is not a decimal', () => {
    expect(Number.isNaN(toHundredths('abc'))).toBe(true);
  });
});
