import { describe, expect, it } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import {
  blockTotals,
  semesterTotals,
  type TotalsItem,
} from './curriculum-totals.js';

function item(
  plannedSemester: number,
  credits: string,
  isElective = false,
  blockSymbol: string | null = null,
): TotalsItem {
  return {
    plannedSemester,
    isElective,
    credits: new Prisma.Decimal(credits),
    blockSymbol,
  };
}

describe('semesterTotals', () => {
  it('splits compulsory and elective credits and keeps 2.5 exact', () => {
    const totals = semesterTotals(2, [
      item(1, '3'),
      item(1, '2.5'),
      item(1, '3', true),
    ]);

    expect(totals[0]).toEqual({
      semester: 1,
      totalCredits: '8.5',
      compulsoryCredits: '5.5',
      electiveCredits: '3',
      itemCount: 3,
    });
  });

  it('lists every semester, empty ones with zero', () => {
    const totals = semesterTotals(3, [item(2, '4')]);

    expect(totals.map((entry) => entry.semester)).toEqual([1, 2, 3]);
    expect(totals[0]).toMatchObject({ totalCredits: '0', itemCount: 0 });
    expect(totals[2]).toMatchObject({ totalCredits: '0', itemCount: 0 });
  });

  it('adds 2.5 and 3.5 to exactly 6', () => {
    const [first] = semesterTotals(1, [item(1, '2.5'), item(1, '3.5')]);
    expect(first.totalCredits).toBe('6');
  });
});

describe('blockTotals', () => {
  it('gives the null symbol first and a block name from the map', () => {
    const totals = blockTotals(
      [item(1, '3', false, 'A1'), item(1, '2'), item(2, '3', false, 'A1')],
      new Map([['A1', 'Toán và khoa học cơ bản']]),
    );

    expect(totals).toEqual([
      { symbol: null, blockName: null, totalCredits: '2', itemCount: 1 },
      {
        symbol: 'A1',
        blockName: 'Toán và khoa học cơ bản',
        totalCredits: '6',
        itemCount: 2,
      },
    ]);
  });

  it('keeps a symbol that matches no knowledge block, without a name', () => {
    const totals = blockTotals([item(1, '3', false, 'ZZ')], new Map());
    expect(totals).toEqual([
      { symbol: 'ZZ', blockName: null, totalCredits: '3', itemCount: 1 },
    ]);
  });
});
