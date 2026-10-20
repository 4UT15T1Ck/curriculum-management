import { Flex, Result, Select, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { RequestStatusTag } from '../../../shared/change-requests/RequestStatusTag';
import type {
  ApprovalQueueItem,
  ApprovalQueueQuery,
} from '../api/changeRequests';
import { NO_QUEUE } from '../constants/approvalLabels';
import { REQUEST_TYPE_LABELS } from '../constants/changeRequestLabels';
import { useApprovalQueue } from '../hooks/useApprovals';
import { formatDateTime } from '../utils/format';

const COLUMNS: TableColumnsType<ApprovalQueueItem> = [
  {
    title: 'Mã',
    dataIndex: 'requestCode',
    render: (code: string, item) => (
      <Link
        to={generatePath(ROUTES.changeRequestDetail, {
          requestId: item.requestId,
        })}
      >
        {code}
      </Link>
    ),
  },
  { title: 'Tiêu đề', dataIndex: 'title' },
  {
    title: 'Loại',
    dataIndex: 'requestType',
    render: (type: ApprovalQueueItem['requestType']) =>
      REQUEST_TYPE_LABELS[type],
  },
  {
    title: 'Cấp',
    dataIndex: 'status',
    render: (status: ApprovalQueueItem['status']) => (
      <RequestStatusTag status={status} />
    ),
  },
  {
    title: 'Thay mặt',
    dataIndex: 'standsFor',
    render: (standsFor: string | null) => standsFor ?? '—',
  },
  { title: 'Người tạo', dataIndex: ['createdBy', 'fullName'] },
  {
    title: 'Ngày gửi',
    dataIndex: 'submittedAt',
    render: (iso: string) => formatDateTime(iso),
  },
  {
    title: 'Số ngày chờ',
    dataIndex: 'daysWaiting',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.daysWaiting - b.daysWaiting,
  },
];

const TYPE_OPTIONS = Object.entries(REQUEST_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

// MH-42: what waits for the caller, longest first (US-061).
export function ApprovalQueuePage() {
  const [query, setQuery] = useState<ApprovalQueueQuery>({});
  const { data, isLoading, isError } = useApprovalQueue(query);
  if (isError)
    return <Result status="error" title="Không thể tải hàng chờ duyệt" />;
  return (
    <Flex vertical gap="middle">
      <Typography.Title level={2} style={{ margin: 0 }}>
        Chờ tôi duyệt
      </Typography.Title>
      <Select
        allowClear
        aria-label="Loại đề xuất"
        placeholder="Loại đề xuất"
        style={{ width: 280 }}
        value={query.requestType}
        options={TYPE_OPTIONS}
        onChange={(requestType) =>
          setQuery((current) => ({
            ...current,
            requestType: requestType as ApprovalQueueQuery['requestType'],
          }))
        }
      />
      <Table<ApprovalQueueItem>
        rowKey="requestId"
        loading={isLoading}
        columns={COLUMNS}
        dataSource={data ?? []}
        pagination={false}
        locale={{ emptyText: NO_QUEUE }}
      />
    </Flex>
  );
}
