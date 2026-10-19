import { Card, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { Link, generatePath } from 'react-router';
import { ROUTES } from '../../../routes';
import { MEMBER_ROLE_LABELS } from '../../../shared/subject-groups/subjectGroups';
import {
  formatPeriod,
  VALIDITY_STATE_COLORS,
  VALIDITY_STATE_LABELS,
} from '../../../shared/validity/validity';
import type { UserSubjectGroupMembership } from '../api/subjectGroupMemberships';
import { useSubjectGroupMemberships } from '../hooks/useSubjectGroupMemberships';

interface UserSubjectGroupsCardProps {
  userId: string;
}
export function UserSubjectGroupsCard({ userId }: UserSubjectGroupsCardProps) {
  const { data = [], isPending } = useSubjectGroupMemberships(userId);
  const columns: TableColumnsType<UserSubjectGroupMembership> = [
    {
      title: 'Nhóm chuyên môn',
      render: (_value, row) => (
        <Link
          to={generatePath(ROUTES.subjectGroupDetail, {
            groupId: row.subjectGroup.id,
          })}
        >
          {row.subjectGroup.groupName}
        </Link>
      ),
    },
    {
      title: 'Vai trò',
      render: (_value, row) => MEMBER_ROLE_LABELS[row.memberRole],
    },
    {
      title: 'Thời hạn',
      render: (_value, row) => formatPeriod(row.validFrom, row.validTo),
    },
    {
      title: 'Trạng thái',
      render: (_value, row) => (
        <Tag color={VALIDITY_STATE_COLORS[row.state]}>
          {VALIDITY_STATE_LABELS[row.state]}
        </Tag>
      ),
    },
  ];
  return (
    <Card title="Nhóm chuyên môn">
      <Table
        rowKey="id"
        loading={isPending}
        columns={columns}
        dataSource={data}
        pagination={false}
        locale={{ emptyText: 'Chưa thuộc nhóm chuyên môn nào' }}
      />
      <div>Thay đổi ở màn hình Nhóm chuyên môn.</div>
    </Card>
  );
}
