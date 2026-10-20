import { Table, Typography } from 'antd';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { VERSION_ID_PARAM } from '../../../shared/releases/versionParams';
import type { VersionRow } from '../api/releases';
import { PIN_STATUS_LABELS } from '../constants/releaseLabels';

interface FrozenRowsTableProps {
  rows: VersionRow[];
  versionId: string;
}

// The curriculum of a released version as it was released: the frozen name and credits and the revision each row pins.
// Each syllabus link carries the version id, so it opens that revision, not today's (US-074, US-079 AC3).
export function FrozenRowsTable({ rows, versionId }: FrozenRowsTableProps) {
  return (
    <Table<VersionRow>
      rowKey="itemId"
      size="small"
      pagination={false}
      dataSource={rows}
      columns={[
        { title: 'Học kỳ', dataIndex: 'plannedSemester', width: 90 },
        { title: 'Mã học phần', dataIndex: 'courseCode' },
        { title: 'Tên học phần', dataIndex: 'courseName' },
        { title: 'Tín chỉ', dataIndex: 'credits', width: 90 },
        {
          title: 'Đề cương',
          key: 'syllabus',
          render: (_: unknown, row) =>
            row.syllabus ? (
              <Link
                to={`${generatePath(ROUTES.syllabus, { courseId: row.courseId })}?${new URLSearchParams({ [VERSION_ID_PARAM]: versionId })}`}
              >
                Bản {row.syllabus.revisionNumber} (
                {PIN_STATUS_LABELS[row.syllabus.status]})
              </Link>
            ) : (
              <Typography.Text type="secondary">Chưa có</Typography.Text>
            ),
        },
      ]}
    />
  );
}
