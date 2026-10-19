import { Button } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import type { CourseDetail } from '../api/courses';
import { CreateRequestButton } from '../../../shared/change-requests/CreateRequestButton';

interface CourseEditButtonProps {
  course: CourseDetail;
}

// The server decides the path (editPath); the client never derives it from roles.
export function CourseEditButton({ course }: CourseEditButtonProps) {
  const navigate = useNavigate();
  if (course.editPath === null) return null;
  if (course.editPath === 'VIA_REQUEST')
    return (
      <CreateRequestButton
        prefill={{
          type: 'COURSE_RELATION',
          targetType: 'COURSE',
          targetId: course.id,
        }}
      />
    );
  return (
    <Button
      onClick={() =>
        void navigate(generatePath(ROUTES.courseEdit, { courseId: course.id }))
      }
    >
      Sửa
    </Button>
  );
}
