import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CHANGE_REQUEST_QUERY_ROOT } from '../../../shared/change-requests/changeRequestQueryRoot';
import { COURSE_QUERY_ROOT } from '../../../shared/courses/courseQueryKeys';
import { CURRICULUM_QUERY_ROOT } from '../../../shared/curriculum/curriculumQueryRoot';
import { OUTCOME_QUERY_ROOT } from '../../../shared/outcomes/outcomeQueryRoot';
import { RELEASE_OPTIONS_QUERY_ROOT } from '../../../shared/releases/semesters';
import {
  createCohort,
  createSemester,
  discardCorrection,
  fetchReleaseCheck,
  fetchVersionDetail,
  fetchVersionHistory,
  issueCorrection,
  openCorrection,
  releaseVersion,
  updateCohort,
  updateSemester,
  type CohortInput,
  type CohortPatch,
  type IssueCorrectionInput,
  type ReleaseVersionInput,
  type SemesterInput,
  type SemesterPatch,
} from '../api/releases';

export const RELEASE_QUERY_ROOT = ['releases'] as const;
export const RELEASE_QUERY_KEYS = {
  check: (programId: string, versionId: string) =>
    [...RELEASE_QUERY_ROOT, 'check', programId, versionId] as const,
  history: (programId: string) =>
    [...RELEASE_QUERY_ROOT, 'history', programId] as const,
  detail: (programId: string, versionId: string) =>
    [...RELEASE_QUERY_ROOT, 'detail', programId, versionId] as const,
};

// A release changes what several screens show: program and version lists, the curriculum, syllabi pinned per version
// and the requests that produced them. Nothing is guessed on the client; the next read says what is in force (D5).
// The program, syllabus and consistency roots belong to features this one cannot import, so their names are repeated.
const PROGRAM_ROOT = ['programs'] as const;
const SYLLABUS_ROOT = ['syllabi'] as const;
const CONSISTENCY_ROOT = ['consistency'] as const;

export function useReleaseCheck(programId: string, versionId: string) {
  return useQuery({
    queryKey: RELEASE_QUERY_KEYS.check(programId, versionId),
    queryFn: () => fetchReleaseCheck(programId, versionId),
    enabled: Boolean(programId && versionId),
    staleTime: 0,
  });
}

export function useVersionHistory(programId: string) {
  return useQuery({
    queryKey: RELEASE_QUERY_KEYS.history(programId),
    queryFn: () => fetchVersionHistory(programId),
    enabled: Boolean(programId),
  });
}

export function useVersionDetail(programId: string, versionId: string) {
  return useQuery({
    queryKey: RELEASE_QUERY_KEYS.detail(programId, versionId),
    queryFn: () => fetchVersionDetail(programId, versionId),
    enabled: Boolean(programId && versionId),
  });
}

function useInvalidateReleased() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      [
        RELEASE_QUERY_ROOT,
        PROGRAM_ROOT,
        CURRICULUM_QUERY_ROOT,
        OUTCOME_QUERY_ROOT,
        COURSE_QUERY_ROOT,
        SYLLABUS_ROOT,
        CONSISTENCY_ROOT,
        CHANGE_REQUEST_QUERY_ROOT,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

export function useReleaseVersion(programId: string, versionId: string) {
  const invalidate = useInvalidateReleased();
  return useMutation({
    mutationFn: (body: ReleaseVersionInput) =>
      releaseVersion(programId, versionId, body),
    onSuccess: invalidate,
  });
}

export function useOpenCorrection(programId: string, versionId: string) {
  const invalidate = useInvalidateReleased();
  return useMutation({
    mutationFn: () => openCorrection(programId, versionId),
    onSuccess: invalidate,
  });
}

export function useIssueCorrection(
  programId: string,
  versionId: string,
  correctionId: string,
) {
  const invalidate = useInvalidateReleased();
  return useMutation({
    mutationFn: (body: IssueCorrectionInput) =>
      issueCorrection(programId, versionId, correctionId, body),
    onSuccess: invalidate,
  });
}

export function useDiscardCorrection(
  programId: string,
  versionId: string,
  correctionId: string,
) {
  const invalidate = useInvalidateReleased();
  return useMutation({
    mutationFn: () => discardCorrection(programId, versionId, correctionId),
    onSuccess: invalidate,
  });
}

// MH-10 writes refresh the selectors every release form reads.
function useInvalidateOptions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: RELEASE_OPTIONS_QUERY_ROOT,
    });
}

export function useCreateSemester() {
  const invalidate = useInvalidateOptions();
  return useMutation({
    mutationFn: (body: SemesterInput) => createSemester(body),
    onSuccess: invalidate,
  });
}

export function useUpdateSemester() {
  const invalidate = useInvalidateOptions();
  const invalidateReleased = useInvalidateReleased();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SemesterPatch }) =>
      updateSemester(id, body),
    // A start date that has been reached activates Pending versions on the server at once.
    onSuccess: () => Promise.all([invalidate(), invalidateReleased()]),
  });
}

export function useCreateCohort() {
  const invalidate = useInvalidateOptions();
  return useMutation({
    mutationFn: (body: CohortInput) => createCohort(body),
    onSuccess: invalidate,
  });
}

export function useUpdateCohort() {
  const invalidate = useInvalidateOptions();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CohortPatch }) =>
      updateCohort(id, body),
    onSuccess: invalidate,
  });
}
