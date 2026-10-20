import { Flex, Result, Skeleton, Table, Typography } from 'antd';
import { generatePath, Link, useParams } from 'react-router';
import { ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import { versionLabel } from '../../../shared/constants/versionLabels';
import type { VersionRef } from '../api/releases';
import { VersionStatusTag } from '../components/VersionStatusTag';
import { NO_VERSIONS } from '../constants/releaseLabels';
import { useVersionHistory } from '../hooks/useReleases';
import { formatDay } from '../utils/format';

// MH-46: every version of a program, newest first, scoped like the program itself.
export function VersionHistoryPage() {
  const { programId = '' } = useParams();
  const { data, isPending, error } = useVersionHistory(programId);
  if (isPending) return <Skeleton active />;
  if (!data) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result
          status="403"
          title="Bạn không có quyền xem lịch sử chương trình này"
        />
      );
    return <Result status="404" title="Không tìm thấy chương trình" />;
  }
  return (
    <Flex vertical gap="middle">
      <Link to={generatePath(ROUTES.programDetail, { programId })}>
        ← Chương trình
      </Link>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Lịch sử phiên bản
      </Typography.Title>
      <Table<VersionRef>
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={data.versions}
        locale={{ emptyText: NO_VERSIONS }}
        columns={[
          {
            title: 'Số phiên bản',
            key: 'number',
            render: (_: unknown, version) => (
              <Link
                to={generatePath(
                  version.status === 'DRAFT'
                    ? ROUTES.curriculum
                    : ROUTES.versionDetail,
                  { programId, versionId: version.id },
                )}
              >
                {versionLabel(version)}
              </Link>
            ),
          },
          {
            title: 'Trạng thái',
            key: 'status',
            render: (_: unknown, version) => (
              <VersionStatusTag status={version.status} />
            ),
          },
          {
            title: 'Số quyết định',
            dataIndex: 'decisionNumber',
            render: (value: string | null) => value ?? '—',
          },
          {
            title: 'Ngày ký',
            dataIndex: 'signedDate',
            render: (day: string | null) => formatDay(day),
          },
          {
            title: 'Học kỳ hiệu lực',
            key: 'semester',
            render: (_: unknown, version) =>
              version.effectiveSemester?.semesterCode ?? '—',
          },
          {
            title: 'Khóa áp dụng',
            key: 'cohorts',
            render: (_: unknown, version) =>
              version.cohorts.map((cohort) => cohort.cohortCode).join(', ') ||
              '—',
          },
          {
            title: 'Đề xuất gốc',
            key: 'origin',
            render: (_: unknown, version) =>
              version.originRequest ? (
                <Link
                  to={generatePath(ROUTES.changeRequestDetail, {
                    requestId: version.originRequest.id,
                  })}
                >
                  {version.originRequest.requestCode}
                </Link>
              ) : (
                '—'
              ),
          },
          {
            title: 'Đính chính',
            key: 'corrected',
            render: (_: unknown, version) =>
              version.correctedBy
                ? `Đã được đính chính bởi ${versionLabel(version.correctedBy)}`
                : '—',
          },
        ]}
      />
    </Flex>
  );
}
