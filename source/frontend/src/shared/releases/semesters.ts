import { getJson } from '../api/client';
import type { components } from '../api/schema';

export type Semester = components['schemas']['SemesterDto'];
export type Cohort = components['schemas']['CohortDto'];

// Root of every cached semester and cohort query: MH-10's writes refresh the selectors of the release forms.
export const RELEASE_OPTIONS_QUERY_ROOT = ['release-options'] as const;
export const releaseOptionKeys = {
  semesters: [...RELEASE_OPTIONS_QUERY_ROOT, 'semesters'] as const,
  cohorts: [...RELEASE_OPTIONS_QUERY_ROOT, 'cohorts'] as const,
};

// Its own fetchers: shared code must not import from a feature (react-vite-rules §4).
export const fetchSemesters = () => getJson<Semester[]>('/semesters');
export const fetchCohorts = () => getJson<Cohort[]>('/cohorts');

export const NO_START_DATE_LABEL = 'Chưa có ngày bắt đầu';
export const semesterLabel = (semester: Semester) =>
  `${semester.semesterCode} · ${semester.startDate ?? NO_START_DATE_LABEL}`;
