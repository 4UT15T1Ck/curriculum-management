// Root of every cached course query (list, detail, picker search). Shared so a feature that changes what a course page shows
// (the curriculum, through "used in programs") can refresh them without importing the courses feature.
export const COURSE_QUERY_ROOT = ['courses'] as const;
