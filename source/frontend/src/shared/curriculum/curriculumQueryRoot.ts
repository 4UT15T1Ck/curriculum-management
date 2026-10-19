// Root of every cached curriculum query. Shared so a feature that changes what a curriculum row shows
// (a new syllabus, through "Chưa có đề cương") can refresh it without importing the curriculum feature.
export const CURRICULUM_QUERY_ROOT = ['curriculum'] as const;
