// Root of every cached change-request query. Shared so a write on a request's working copy (curriculum, outcomes,
// program info, syllabus) can refresh the request's diff and detail without importing the change-requests feature.
export const CHANGE_REQUEST_QUERY_ROOT = ['change-requests'] as const;
