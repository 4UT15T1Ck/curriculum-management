import { Card, Descriptions } from 'antd';
import type { CourseDetail } from '../api/courses';
import {
  COURSE_TYPE_LABELS,
  FOREIGN_COURSE_LABEL,
} from '../constants/courseLabels';
import { CourseStatusTag } from './CourseStatusTag';

interface CourseInfoCardProps {
  course: CourseDetail;
}

const EMPTY = '—';

export function CourseInfoCard({ course }: CourseInfoCardProps) {
  return (
    <Card title="Thông tin học phần">
      <Descriptions column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Mã học phần">
          {course.courseCode}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <CourseStatusTag status={course.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Tên tiếng Việt">
          {course.courseName}
        </Descriptions.Item>
        <Descriptions.Item label="Tên tiếng Anh">
          {course.englishName ?? EMPTY}
        </Descriptions.Item>
        <Descriptions.Item label="Số tín chỉ">
          {course.credits}
        </Descriptions.Item>
        <Descriptions.Item label="Loại học phần">
          {COURSE_TYPE_LABELS[course.courseType]}
        </Descriptions.Item>
        <Descriptions.Item label="Khoa phụ trách">
          {course.ownerFaculty.unitName}
          {course.isForeign ? ` (${FOREIGN_COURSE_LABEL})` : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Nhóm phụ trách">
          {course.ownerGroup
            ? `${course.ownerGroup.groupCode} — ${course.ownerGroup.groupName}`
            : EMPTY}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
