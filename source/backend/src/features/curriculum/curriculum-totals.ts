import { Prisma } from '../../generated/prisma/client.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import type { BlockTotalDto, SemesterTotalDto } from './curriculum.dto.js';

export interface TotalsItem {
  plannedSemester: number;
  isElective: boolean;
  credits: Prisma.Decimal;
  blockSymbol: string | null;
}

const sum = (items: readonly TotalsItem[]) =>
  items.reduce(
    (total, item) => total.plus(item.credits),
    new Prisma.Decimal(0),
  );

// Every row counts, as on the Khoa's sheet; the program-level totals that count a group by its minimum are F-08's.
export function semesterTotals(
  semesterCount: number,
  items: readonly TotalsItem[],
): SemesterTotalDto[] {
  return Array.from({ length: semesterCount }, (_, index) => {
    const semester = index + 1;
    const rows = items.filter((item) => item.plannedSemester === semester);
    return {
      semester,
      totalCredits: toWireDecimal(sum(rows)),
      compulsoryCredits: toWireDecimal(
        sum(rows.filter((item) => !item.isElective)),
      ),
      electiveCredits: toWireDecimal(
        sum(rows.filter((item) => item.isElective)),
      ),
      itemCount: rows.length,
    };
  });
}

// One entry per distinct symbol as typed; rows without a symbol form the entry with `symbol: null`, listed first.
export function blockTotals(
  items: readonly TotalsItem[],
  blockNames: ReadonlyMap<string, string>,
): BlockTotalDto[] {
  const bySymbol = new Map<string | null, TotalsItem[]>();
  for (const item of items) {
    bySymbol.set(item.blockSymbol, [
      ...(bySymbol.get(item.blockSymbol) ?? []),
      item,
    ]);
  }
  return [...bySymbol.entries()]
    .sort(([a], [b]) => (a ?? '').localeCompare(b ?? '', 'vi'))
    .map(([symbol, rows]) => ({
      symbol,
      blockName: symbol ? (blockNames.get(symbol) ?? null) : null,
      totalCredits: toWireDecimal(sum(rows)),
      itemCount: rows.length,
    }));
}
