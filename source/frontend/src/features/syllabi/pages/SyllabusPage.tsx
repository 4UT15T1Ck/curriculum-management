import {
  Empty,
  Flex,
  Result,
  Segmented,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import { generatePath, Link, useParams } from 'react-router';
import { ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import { PERMISSIONS } from '../../../shared/auth/permissions';
import { useCan } from '../../../shared/auth/useCan';
import type { Syllabus } from '../api/syllabi';
import { SyllabusActions } from '../components/SyllabusActions';
import { SyllabusSections } from '../components/SyllabusSections';
import {
  BACK_TO_COURSE,
  LANGUAGE_OPTIONS,
  NO_SYLLABUS,
  NOT_TRANSLATED,
  SYLLABUS_STATUS_LABELS,
  type SyllabusLanguage,
} from '../constants/syllabusLabels';
import { useCourseSyllabus } from '../hooks/useSyllabus';
import { translated } from '../utils/syllabusLanguage';

export function SyllabusPage() {
  const { courseId = '' } = useParams();
  const { data, isPending, error } = useCourseSyllabus(courseId);
  const canViewCourse = useCan(PERMISSIONS.courseView);
  const [language, setLanguage] = useState<SyllabusLanguage>('vi');
  if (isPending) return <Skeleton active />;
  if (!data) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result status="403" title="Bạn không có quyền xem đề cương này" />
      );
    return <Result status="404" title="Không tìm thấy học phần" />;
  }
  const name = translated(
    language,
    data.course.courseName,
    data.course.englishName,
  );
  const revisions = [data.published, data.draft].filter(
    (revision): revision is Syllabus => revision !== null,
  );
  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center" wrap gap="small">
        <Space wrap>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {data.course.courseCode} — {name.text}
          </Typography.Title>
          {name.missing && <Tag>{NOT_TRANSLATED}</Tag>}
        </Space>
        <Space wrap>
          {canViewCourse && (
            <Link
              to={generatePath(ROUTES.courseDetail, {
                courseId: data.course.id,
              })}
            >
              {BACK_TO_COURSE}
            </Link>
          )}
          <Segmented
            options={[...LANGUAGE_OPTIONS]}
            value={language}
            onChange={setLanguage}
          />
          <SyllabusActions data={data} />
        </Space>
      </Flex>
      {revisions.length === 0 ? (
        <Empty description={NO_SYLLABUS} />
      ) : (
        <Tabs
          items={revisions.map((revision) => ({
            key: revision.id,
            label: `${SYLLABUS_STATUS_LABELS[revision.status]} — bản ${revision.revisionNumber}`,
            children: (
              <SyllabusSections syllabus={revision} language={language} />
            ),
          }))}
        />
      )}
    </Flex>
  );
}
