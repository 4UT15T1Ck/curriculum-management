import { Prisma } from '../../../generated/prisma/client.js';
import { toWireDecimal } from '../../decimal/decimal.js';
import type { DiffScalar, SnapshotEntry } from './snapshot-entry.js';

// Decimals, numbers and booleans become strings; "3.00" and "3" are the same Decimal and never differ.
export function scalar(
  value: Prisma.Decimal | number | boolean | string | null | undefined,
): DiffScalar {
  if (value === null || value === undefined) return null;
  if (value instanceof Prisma.Decimal) return toWireDecimal(value);
  return String(value);
}

export function entry(
  entityType: string,
  itemKey: string,
  label: string,
  recordId: string | null,
  value: Record<string, DiffScalar>,
): SnapshotEntry {
  return { entityType, itemKey, label, recordId, value };
}
