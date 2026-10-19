// Root of every cached outcome query (PLOs, both matrices, coverage). Shared so a feature that changes what they show
// (a CLO in the syllabus, a curriculum row removed) can refresh them without importing the outcomes feature.
export const OUTCOME_QUERY_ROOT = ['outcomes'] as const;
