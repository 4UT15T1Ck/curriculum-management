// Map.groupBy is ES2024; the project compiles for ES2023.
export function groupBy<T, V = T>(
  rows: readonly T[],
  key: (row: T) => string,
  value: (row: T) => V = (row) => row as unknown as V,
): Map<string, V[]> {
  const groups = new Map<string, V[]>();
  for (const row of rows) {
    const k = key(row);
    const held = groups.get(k);
    if (held) {
      held.push(value(row));
    } else {
      groups.set(k, [value(row)]);
    }
  }
  return groups;
}
