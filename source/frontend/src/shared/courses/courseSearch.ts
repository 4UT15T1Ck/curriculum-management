import { getJson, withQuery } from '../api/client';
import type { components } from '../api/schema';

export type CourseOption = components['schemas']['CourseSummaryDto'];
type CoursePage = components['schemas']['CoursePageDto'];

// Its own path and fetcher: shared code must not import from a feature (react-vite-rules §4).
export const COURSE_SEARCH_PATH = '/courses';
export const COURSE_SEARCH_PAGE_SIZE = 20;
export const courseSearchQueryKey = (q: string) =>
  ['courses', 'search', q] as const;

// Active courses only: no dialog that uses the picker accepts a discontinued or cancelled course as the other end.
export const searchCourses = (q: string) =>
  getJson<CoursePage>(
    withQuery(COURSE_SEARCH_PATH, {
      q,
      pageSize: COURSE_SEARCH_PAGE_SIZE,
      status: 'ACTIVE',
    }),
  );

export const courseOptionLabel = (course: CourseOption) =>
  `${course.courseCode} — ${course.courseName} (${course.credits} TC)`;
