import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourseRelation,
  deleteCourseRelation,
  fetchCourseRelations,
  updateRelationMinScore,
} from '../api/courseRelations';

export const COURSE_RELATION_ROOT_KEY = ['courses', 'relations'] as const;
export const COURSE_RELATION_QUERY_KEYS = {
  ofCourse: (courseId: string) => ['courses', 'relations', courseId] as const,
};

export const useCourseRelations = (courseId: string) =>
  useQuery({
    queryKey: COURSE_RELATION_QUERY_KEYS.ofCourse(courseId),
    queryFn: () => fetchCourseRelations(courseId),
    enabled: Boolean(courseId),
  });

// A relation shows on both of its courses, so every change refreshes every course's relation list.
function useRelationMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: COURSE_RELATION_ROOT_KEY }),
  });
}

export const useCreateCourseRelation = () =>
  useRelationMutation(createCourseRelation);
export const useUpdateRelationMinScore = () =>
  useRelationMutation(
    ({
      relationId,
      minScore,
    }: {
      relationId: string;
      minScore: string | null;
    }) => updateRelationMinScore(relationId, minScore),
  );
export const useDeleteCourseRelation = () =>
  useRelationMutation(deleteCourseRelation);
