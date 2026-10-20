import { Card, Space, Typography } from 'antd';
import { Link, generatePath } from 'react-router';
import { ROUTES } from '../../../routes';
import type { CourseDetail } from '../api/courses';
import { NO_EQUIVALENT_GROUP_TEXT } from '../constants/relationLabels';

interface EquivalentCoursesCardProps {
  course: CourseDetail;
}

export function EquivalentCoursesCard({ course }: EquivalentCoursesCardProps) {
  const group = course.equivalenceGroup;
  return (
    <Card title="Học phần tương đương">
      {group ? (
        <Space direction="vertical">
          <Typography.Text>
            Nhóm{' '}
            <Link
              to={`${ROUTES.equivalenceGroups}?q=${encodeURIComponent(group.groupCode)}`}
            >
              {group.groupCode}
            </Link>
          </Typography.Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {group.members.map((member) => (
              <li key={member.id}>
                <Link
                  to={generatePath(ROUTES.courseDetail, {
                    courseId: member.id,
                  })}
                >
                  {member.courseCode} — {member.courseName}
                </Link>{' '}
                ({member.credits} TC)
              </li>
            ))}
          </ul>
        </Space>
      ) : (
        <Typography.Text type="secondary">
          {NO_EQUIVALENT_GROUP_TEXT}
        </Typography.Text>
      )}
    </Card>
  );
}
