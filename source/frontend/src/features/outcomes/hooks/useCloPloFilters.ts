import { useState } from 'react';
import type { ProgramCloPloMatrix, ProgramCloPloRow } from '../api/outcomes';
import type { ProgramCloPloFilterValues } from '../components/ProgramCloPloFilters';

const NO_FILTERS: ProgramCloPloFilterValues = { semester: null, ploId: null };

// Filters run on the client: the whole program is at most 200 rows (US-045 AC2).
// A PLO filter keeps the courses that map it and, within them, only that PLO's links.
export function filterRows(
  rows: readonly ProgramCloPloRow[],
  { semester, ploId }: ProgramCloPloFilterValues,
): ProgramCloPloRow[] {
  return rows
    .filter((row) => semester === null || row.plannedSemester === semester)
    .filter((row) => ploId === null || row.mappedPloIds.includes(ploId));
}

export function useCloPloFilters(matrix: ProgramCloPloMatrix) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const semesters = [
    ...new Set(matrix.rows.map((row) => row.plannedSemester)),
  ].sort((a, b) => a - b);
  return {
    filters,
    setFilters,
    semesters,
    rows: filterRows(matrix.rows, filters),
    plos: filters.ploId
      ? matrix.plos.filter((plo) => plo.id === filters.ploId)
      : matrix.plos,
  };
}
