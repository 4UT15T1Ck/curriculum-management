import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { COURSE_RELATION_ROOT_KEY } from './useCourseRelations';
import { subjectGroupsQueryKey } from '../../../shared/subject-groups/subjectGroups';
import {
  changeCourseStatus,
  createCourse,
  fetchCourse,
  fetchCourses,
  updateCourse,
  type CourseAction,
  type CourseDetail,
  type CourseQuery,
  type DiscontinueCourseRequest,
  type UpdateCourseRequest,
} from '../api/courses';

export const COURSE_QUERY_KEYS = {
  all: ['courses'] as const,
  list: (query: CourseQuery) => ['courses', 'list', query] as const,
  detail: (courseId: string) => ['courses', 'detail', courseId] as const,
};

export function useCourseList(query: CourseQuery) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(query),
    queryFn: () => fetchCourses(query),
    placeholderData: keepPreviousData,
  });
}

export function useCourse(courseId: string, enabled = true) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(courseId),
    queryFn: () => fetchCourse(courseId),
    enabled: enabled && Boolean(courseId),
  });
}

// Every course mutation returns the full detail, so it replaces the cached detail without a refetch.
// Subject-group impact lists courses too, hence the second invalidation.
function useCourseMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<CourseDetail>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (course) => {
      queryClient.setQueryData(COURSE_QUERY_KEYS.detail(course.id), course);
      void queryClient.invalidateQueries({
        queryKey: [...COURSE_QUERY_KEYS.all, 'list'],
      });
      void queryClient.invalidateQueries({ queryKey: subjectGroupsQueryKey });
      // A discontinue can write a REPLACEMENT relation; every course's relation list may have changed.
      void queryClient.invalidateQueries({
        queryKey: COURSE_RELATION_ROOT_KEY,
      });
    },
  });
}

export const useCreateCourse = () => useCourseMutation(createCourse);
export const useUpdateCourse = () =>
  useCourseMutation(
    ({ courseId, body }: { courseId: string; body: UpdateCourseRequest }) =>
      updateCourse(courseId, body),
  );
export const useChangeCourseStatus = () =>
  useCourseMutation(
    ({
      courseId,
      action,
      body,
    }: {
      courseId: string;
      action: CourseAction;
      body?: DiscontinueCourseRequest;
    }) => changeCourseStatus(courseId, action, body),
  );
