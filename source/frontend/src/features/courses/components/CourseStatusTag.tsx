import { Tag } from 'antd';
import type { CourseStatus } from '../api/courses';
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
} from '../constants/courseLabels';

interface CourseStatusTagProps {
  status: CourseStatus;
}

export function CourseStatusTag({ status }: CourseStatusTagProps) {
  return (
    <Tag color={COURSE_STATUS_COLORS[status]}>
      {COURSE_STATUS_LABELS[status]}
    </Tag>
  );
}
