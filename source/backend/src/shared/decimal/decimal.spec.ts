import { describe, expect, it } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { CREDITS_PATTERN, toWireDecimal } from './decimal.js';

describe('credits decimal', () => {
  it.each(['0', '2.5', '2.50', '999.99', '3'])('accepts %s', (value) => {
    expect(CREDITS_PATTERN.test(value)).toBe(true);
  });

  it.each(['-1', '1.234', '1000', 'abc', '', ' 2', '2 ', '.5', '1.'])(
    'rejects %j',
    (value) => {
      expect(CREDITS_PATTERN.test(value)).toBe(false);
    },
  );

  it('drops trailing zeros on the wire', () => {
    expect(toWireDecimal(new Prisma.Decimal('2.50'))).toBe('2.5');
    expect(toWireDecimal(new Prisma.Decimal('3.00'))).toBe('3');
    expect(toWireDecimal(new Prisma.Decimal('0'))).toBe('0');
  });
});
