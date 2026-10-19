import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addEquivalenceMember,
  createEquivalenceGroup,
  dissolveEquivalenceGroup,
  fetchCourseGroup,
  fetchEquivalenceGroups,
  mergeEquivalenceGroups,
  removeEquivalenceMember,
  updateEquivalenceGroup,
  type CreateEquivalenceGroupRequest,
  type EquivalenceGroupQuery,
  type UpdateEquivalenceGroupRequest,
} from '../api/equivalenceGroups';

export const EQUIVALENCE_QUERY_KEYS = {
  all: ['equivalence-groups'] as const,
  list: (query: EquivalenceGroupQuery) =>
    ['equivalence-groups', 'list', query] as const,
  ofCourse: (courseId: string) =>
    ['equivalence-groups', 'of-course', courseId] as const,
};
const COURSE_DETAIL_ROOT_KEY = ['courses', 'detail'] as const;

export function useEquivalenceGroupList(query: EquivalenceGroupQuery) {
  return useQuery({
    queryKey: EQUIVALENCE_QUERY_KEYS.list(query),
    queryFn: () => fetchEquivalenceGroups(query),
    placeholderData: keepPreviousData,
  });
}

// The group a course already belongs to, fetched only when a merge is being offered.
export function useCourseGroup(courseId: string, enabled: boolean) {
  return useQuery({
    queryKey: EQUIVALENCE_QUERY_KEYS.ofCourse(courseId),
    queryFn: () => fetchCourseGroup(courseId),
    enabled: enabled && Boolean(courseId),
  });
}

// Groups show on the course page too, so every change refreshes the groups and the course details.
function useGroupMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: EQUIVALENCE_QUERY_KEYS.all,
        }),
        queryClient.invalidateQueries({ queryKey: COURSE_DETAIL_ROOT_KEY }),
      ]);
    },
  });
}

export const useCreateEquivalenceGroup = () =>
  useGroupMutation((body: CreateEquivalenceGroupRequest) =>
    createEquivalenceGroup(body),
  );
export const useUpdateEquivalenceGroup = () =>
  useGroupMutation(
    ({
      groupId,
      body,
    }: {
      groupId: string;
      body: UpdateEquivalenceGroupRequest;
    }) => updateEquivalenceGroup(groupId, body),
  );
export const useAddEquivalenceMember = () =>
  useGroupMutation(
    ({ groupId, courseId }: { groupId: string; courseId: string }) =>
      addEquivalenceMember(groupId, courseId),
  );
export const useRemoveEquivalenceMember = () =>
  useGroupMutation(
    ({ groupId, courseId }: { groupId: string; courseId: string }) =>
      removeEquivalenceMember(groupId, courseId),
  );
export const useMergeEquivalenceGroups = () =>
  useGroupMutation(
    ({ keptId, otherGroupId }: { keptId: string; otherGroupId: string }) =>
      mergeEquivalenceGroups(keptId, otherGroupId),
  );
export const useDissolveEquivalenceGroup = () =>
  useGroupMutation((groupId: string) => dissolveEquivalenceGroup(groupId));
