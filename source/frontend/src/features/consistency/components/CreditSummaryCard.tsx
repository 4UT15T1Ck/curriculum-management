import { Button, Card, Descriptions, Flex, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import type {
  CreditBreakdown,
  CreditCheck,
  GroupRequirement,
} from '../api/consistency';
import { ACCEPT_LABEL } from '../constants/consistencyLabels';
import { formatGap } from '../utils/issueTarget';

interface CreditSummaryCardProps {
  credits: CreditCheck;
  groups: GroupRequirement[];
  canAccept: boolean;
  onAccept: () => void;
}

const BUCKETS = [
  ['compulsory', 'Bắt buộc'],
  ['elective', 'Tự chọn'],
  ['total', 'Tổng'],
] as const;

interface BucketRow {
  key: keyof CreditBreakdown;
  label: string;
}

function minimumText(group: GroupRequirement): string {
  return [
    group.minCredits !== null && `${group.minCredits} TC`,
    group.minCourses !== null && `${group.minCourses} HP`,
  ]
    .filter(Boolean)
    .join(' và ');
}

export function CreditSummaryCard({
  credits,
  groups,
  canAccept,
  onAccept,
}: CreditSummaryCardProps) {
  const rows: BucketRow[] = BUCKETS.map(([key, label]) => ({ key, label }));
  const columns: TableColumnsType<BucketRow> = [
    { title: '', dataIndex: 'label' },
    {
      title: 'Khai báo',
      align: 'right',
      render: (_value, row) => credits.declared[row.key],
    },
    {
      title: 'Tính từ khung',
      align: 'right',
      render: (_value, row) => credits.computed[row.key],
    },
    {
      title: 'Chênh lệch',
      align: 'right',
      render: (_value, row) => {
        const gap = credits.gap[row.key];
        return (
          <Typography.Text type={gap === '0' ? undefined : 'danger'}>
            {formatGap(gap)}
          </Typography.Text>
        );
      },
    },
  ];
  const groupColumns: TableColumnsType<GroupRequirement> = [
    { title: 'Mã nhóm', dataIndex: 'groupCode' },
    { title: 'Tên nhóm', dataIndex: 'groupName' },
    { title: 'Tối thiểu', render: (_value, group) => minimumText(group) },
    {
      title: 'Tính vào tổng',
      dataIndex: 'requiredCredits',
      align: 'right',
    },
    {
      title: 'Đã liệt kê',
      align: 'right',
      render: (_value, group) =>
        `${group.listedCredits} (${group.itemCount} HP)`,
    },
  ];
  const { acceptance } = credits;
  return (
    <Flex vertical gap="middle">
      <Card
        size="small"
        title="Tín chỉ"
        extra={
          credits.mismatch &&
          !credits.acceptanceCurrent &&
          canAccept && (
            <Button type="primary" onClick={onAccept}>
              {ACCEPT_LABEL}
            </Button>
          )
        }
      >
        <Table<BucketRow>
          size="small"
          rowKey="key"
          pagination={false}
          columns={columns}
          dataSource={rows}
        />
      </Card>
      {groups.length > 0 && (
        <Card size="small" title="Nhóm tự chọn">
          <Table<GroupRequirement>
            size="small"
            rowKey="id"
            pagination={false}
            columns={groupColumns}
            dataSource={groups}
          />
        </Card>
      )}
      {acceptance && (
        <Card
          size="small"
          title={
            <Flex gap="small" align="center">
              Đã chấp nhận chênh lệch
              {!credits.acceptanceCurrent && (
                <Tag color="default">Đã hết hiệu lực — chênh lệch đã đổi</Tag>
              )}
            </Flex>
          }
        >
          <Descriptions size="small" column={{ xs: 1, md: 2 }}>
            <Descriptions.Item label="Lý do">
              {acceptance.reason}
            </Descriptions.Item>
            <Descriptions.Item label="Người chấp nhận">
              {acceptance.acceptedBy.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Lúc">
              {dayjs(acceptance.acceptedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Chênh lệch đã chấp nhận">
              Bắt buộc {formatGap(acceptance.compulsoryGap)}, tự chọn{' '}
              {formatGap(acceptance.electiveGap)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Flex>
  );
}
