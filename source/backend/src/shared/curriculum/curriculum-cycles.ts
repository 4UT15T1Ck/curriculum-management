import {
  findRequisiteCycle,
  type RequisiteEdge,
} from '../courses/requisite-graph.js';

// Each loop that runs through at least one curriculum edge, once, as course ids starting and ending at the same id.
// Loops made of catalog edges alone are F-05's concern and were refused when written.
export function curriculumCycles(
  catalogEdges: readonly RequisiteEdge[],
  curriculumEdges: readonly RequisiteEdge[],
): string[][] {
  return curriculumCycleHits(catalogEdges, curriculumEdges).map(
    (hit) => hit.path,
  );
}

export interface CycleHit {
  path: string[];
  edge: RequisiteEdge;
}

// Same as curriculumCycles, but also names the curriculum edge that closed each loop.
export function curriculumCycleHits(
  catalogEdges: readonly RequisiteEdge[],
  curriculumEdges: readonly RequisiteEdge[],
): CycleHit[] {
  const all = [...catalogEdges, ...curriculumEdges];
  const seen = new Set<string>();
  const hits: CycleHit[] = [];
  for (const edge of curriculumEdges) {
    const path = findRequisiteCycle(
      all.filter((other) => other !== edge),
      edge,
    );
    if (!path) continue;
    const key = [...new Set(path)].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({ path, edge });
  }
  return hits;
}
