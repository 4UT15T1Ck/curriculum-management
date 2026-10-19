import { Button, Tooltip } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import type { CourseDetail } from '../api/courses';
import { CHANGE_REQUEST_PENDING_TOOLTIP } from '../constants/courseLabels';

interface CourseEditButtonProps {
  course: CourseDetail;
}

// The server decides the path (editPath); the client never derives it from roles.
export function CourseEditButton({ course }: CourseEditButtonProps) {
  const navigate = useNavigate();
  if (course.editPath === null) return null;
  if (course.editPath === 'VIA_REQUEST')
    return (
      <Tooltip title={CHANGE_REQUEST_PENDING_TOOLTIP}>
        <Button disabled>Tạo đề xuất</Button>
      </Tooltip>
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
