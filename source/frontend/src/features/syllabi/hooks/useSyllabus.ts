import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OUTCOME_QUERY_ROOT } from '../../../shared/outcomes/outcomeQueryRoot';
import { CURRICULUM_QUERY_ROOT } from '../../../shared/curriculum/curriculumQueryRoot';
import {
  createClo,
  createSyllabus,
  createWeek,
  deleteAttachment,
  deleteClo,
  deleteWeek,
  downloadAttachment,
  fetchCourseSyllabus,
  reorderClos,
  reorderWeeks,
  updateClo,
  updateSyllabus,
  updateWeek,
  uploadAttachment,
  type CreateCloRequest,
  type CreateWeeklyContentRequest,
  type UpdateCloRequest,
  type UpdateSyllabusRequest,
  type UpdateWeeklyContentRequest,
} from '../api/syllabi';

export const SYLLABUS_QUERY_KEYS = {
  all: ['syllabi'] as const,
  course: (courseId: string) => ['syllabi', courseId] as const,
};

export function useCourseSyllabus(courseId: string) {
  return useQuery({
    queryKey: SYLLABUS_QUERY_KEYS.course(courseId),
    queryFn: () => fetchCourseSyllabus(courseId),
    enabled: Boolean(courseId),
  });
}

// Every write returns a fragment; refetching the course's syllabus keeps timestamps and canDelete flags right.
function useSyllabusMutation<TVars, TResult>(
  courseId: string,
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: SYLLABUS_QUERY_KEYS.course(courseId),
      }),
  });
}

// The curriculum tags rows without a syllabus, so a new syllabus refreshes it too.
export function useCreateSyllabus(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createSyllabus(courseId),
    onSuccess: (data) => {
      queryClient.setQueryData(SYLLABUS_QUERY_KEYS.course(courseId), data);
      return queryClient.invalidateQueries({
        queryKey: CURRICULUM_QUERY_ROOT,
      });
    },
  });
}

export const useUpdateSyllabus = (courseId: string) =>
  useSyllabusMutation(
    courseId,
    ({
      syllabusId,
      body,
    }: {
      syllabusId: string;
      body: UpdateSyllabusRequest;
    }) => updateSyllabus(syllabusId, body),
  );

export const useCreateWeek = (courseId: string) =>
  useSyllabusMutation(
    courseId,
    ({
      syllabusId,
      body,
    }: {
      syllabusId: string;
      body: CreateWeeklyContentRequest;
    }) => createWeek(syllabusId, body),
  );

export const useUpdateWeek = (courseId: string) =>
  useSyllabusMutation(
    courseId,
    ({
      weeklyContentId,
      body,
    }: {
      weeklyContentId: string;
      body: UpdateWeeklyContentRequest;
    }) => updateWeek(weeklyContentId, body),
  );

export const useDeleteWeek = (courseId: string) =>
  useSyllabusMutation(courseId, deleteWeek);

export const useReorderWeeks = (courseId: string) =>
  useSyllabusMutation(
    courseId,
    ({ syllabusId, ids }: { syllabusId: string; ids: string[] }) =>
      reorderWeeks(syllabusId, ids),
  );

// A CLO is shared with the PLO matrices (links, gaps), so a CLO write refreshes those too.
function useCloMutation<TVars, TResult>(
  courseId: string,
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: SYLLABUS_QUERY_KEYS.course(courseId),
        }),
        queryClient.invalidateQueries({ queryKey: OUTCOME_QUERY_ROOT }),
      ]),
  });
}

export const useCreateClo = (courseId: string, syllabusId: string) =>
  useCloMutation(courseId, (body: CreateCloRequest) =>
    createClo(syllabusId, body),
  );

export const useUpdateClo = (courseId: string) =>
  useCloMutation(
    courseId,
    ({ cloId, body }: { cloId: string; body: UpdateCloRequest }) =>
      updateClo(cloId, body),
  );

export const useDeleteClo = (courseId: string) =>
  useCloMutation(courseId, deleteClo);

export const useReorderClos = (courseId: string) =>
  useCloMutation(
    courseId,
    ({ syllabusId, ids }: { syllabusId: string; ids: string[] }) =>
      reorderClos(syllabusId, ids),
  );

export const useUploadAttachment = (courseId: string, syllabusId: string) =>
  useSyllabusMutation(courseId, (file: File) =>
    uploadAttachment(syllabusId, file),
  );

export const useDeleteAttachment = (courseId: string) =>
  useSyllabusMutation(courseId, deleteAttachment);

export function useDownloadAttachment() {
  return useMutation({ mutationFn: downloadAttachment });
}
