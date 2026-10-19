import { Flex, Result, Skeleton, Space, Typography } from 'antd';
import { useParams } from 'react-router';
import { ApiError } from '../../../shared/api/client';
import { CourseEditButton } from '../components/CourseEditButton';
import { CourseInfoCard } from '../components/CourseInfoCard';
import { CourseRelationsSection } from '../components/CourseRelationsSection';
import { CourseStatusActions } from '../components/CourseStatusActions';
import { EquivalentCoursesCard } from '../components/EquivalentCoursesCard';
import { ProgramsUsingList } from '../components/ProgramsUsingList';
import { useCourse } from '../hooks/useCourses';

export function CourseDetailPage() {
  const { courseId = '' } = useParams();
  const { data: course, isPending, error } = useCourse(courseId);
  if (isPending) return <Skeleton active />;
  if (!course) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result status="403" title="Bạn không có quyền xem học phần này" />
      );
    return <Result status="404" title="Không tìm thấy học phần" />;
  }
  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {course.courseCode} — {course.courseName}
        </Typography.Title>
        <Space>
          <CourseEditButton course={course} />
          {course.canChangeStatus && <CourseStatusActions course={course} />}
        </Space>
      </Flex>
      <CourseInfoCard course={course} />
      <CourseRelationsSection course={course} />
      <EquivalentCoursesCard course={course} />
      <ProgramsUsingList programs={course.programsUsing} />
    </Flex>
  );
}
