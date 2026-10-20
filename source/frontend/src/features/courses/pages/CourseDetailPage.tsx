import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Result, Skeleton, Space, Typography } from 'antd';
import { generatePath, Link, useParams } from 'react-router';
import { ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import { PERMISSIONS } from '../../../shared/auth/permissions';
import { useCan } from '../../../shared/auth/useCan';
import { CourseEditButton } from '../components/CourseEditButton';
import { CourseInfoCard } from '../components/CourseInfoCard';
import { CourseRelationsSection } from '../components/CourseRelationsSection';
import { CourseStatusActions } from '../components/CourseStatusActions';
import { EquivalentCoursesCard } from '../components/EquivalentCoursesCard';
import { ProgramsUsingList } from '../../../shared/courses/ProgramsUsingList';
import { PROGRAMS_USING_TITLE, SYLLABUS_LINK } from '../constants/courseLabels';
import { useCourse } from '../hooks/useCourses';

export function CourseDetailPage() {
  const { courseId = '' } = useParams();
  const { data: course, isPending, error } = useCourse(courseId);
  const canViewSyllabus = useCan(PERMISSIONS.syllabusView);
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
          {canViewSyllabus && (
            <Link to={generatePath(ROUTES.syllabus, { courseId: course.id })}>
              <Button icon={<FileTextOutlined />}>{SYLLABUS_LINK}</Button>
            </Link>
          )}
          <CourseEditButton course={course} />
          {course.canChangeStatus && <CourseStatusActions course={course} />}
        </Space>
      </Flex>
      <CourseInfoCard course={course} />
      <CourseRelationsSection course={course} />
      <EquivalentCoursesCard course={course} />
      <Card title={PROGRAMS_USING_TITLE}>
        <ProgramsUsingList programs={course.programsUsing} />
      </Card>
    </Flex>
  );
}
