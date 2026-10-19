import { useState } from 'react';
import { Button, Card, Popconfirm, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { useMe } from '../../../shared/auth/useMe';
import { useRoleAssignments, useRevokeRole } from '../hooks/useRoleAssignments';
import type { RoleAssignment } from '../api/roleAssignments';
import {
  formatPeriod,
  VALIDITY_STATE_COLORS,
  VALIDITY_STATE_LABELS,
} from '../../../shared/validity/validity';
import { SCOPE_TYPE_LABELS } from '../constants/userLabels';
import { AssignRoleModal } from './AssignRoleModal';

interface RoleAssignmentsCardProps {
  userId: string;
}

export function RoleAssignmentsCard({ userId }: RoleAssignmentsCardProps) {
  const { data: me } = useMe();
  const { data = [], isPending } = useRoleAssignments(userId);
  const revoke = useRevokeRole(userId);
  const [assigning, setAssigning] = useState(false);
  const columns: TableColumnsType<RoleAssignment> = [
    {
      title: 'Vai trò',
      render: (_, row) => `${row.role.roleCode} — ${row.role.roleName}`,
    },
    {
      title: 'Phạm vi',
      render: (_, row) =>
        row.scopeUnit
          ? `${SCOPE_TYPE_LABELS[row.scopeType]}: ${row.scopeUnit.unitName}`
          : SCOPE_TYPE_LABELS[row.scopeType],
    },
    {
      title: 'Thời hạn',
      render: (_, row) =>
        row.derived ? '—' : formatPeriod(row.validFrom, row.validTo),
    },
    {
      title: 'Trạng thái',
      render: (_, row) => (
        <Tag color={VALIDITY_STATE_COLORS[row.state]}>
          {VALIDITY_STATE_LABELS[row.state]}
        </Tag>
      ),
    },
    {
      title: 'Người gán',
      render: (_, row) =>
        `${row.assignedBy?.fullName ?? 'Hệ thống'}${row.createdAt ? ` · ${new Date(row.createdAt).toLocaleString('vi-VN')}` : ''}`,
    },
    {
      title: 'Người thu hồi',
      render: (_, row) =>
        row.revokedBy
          ? `${row.revokedBy.fullName} · ${row.revokedAt ? new Date(row.revokedAt).toLocaleString('vi-VN') : ''}`
          : '—',
    },
    {
      title: '',
      render: (_, row) =>
        row.derived ? (
          <Tooltip title="Suy ra từ phân công; thay đổi ở màn hình phân công">
            Theo phân công
          </Tooltip>
        ) : (row.state === 'ACTIVE' || row.state === 'SCHEDULED') && row.id ? (
          <Popconfirm
            title="Thu hồi vai trò này?"
            onConfirm={() => revoke.mutate(row.id!)}
          >
            <Button danger size="small">
              Thu hồi
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];
  return (
    <Card
      title="Vai trò và phạm vi"
      extra={
        me?.id !== userId && (
          <Button type="primary" onClick={() => setAssigning(true)}>
            Gán vai trò
          </Button>
        )
      }
    >
      <Table<RoleAssignment>
        rowKey={(row) => row.id ?? `${row.role.roleCode}-${row.scopeType}`}
        columns={columns}
        dataSource={data}
        loading={isPending}
        pagination={false}
      />
      <p>Đổi phạm vi = thu hồi dòng cũ rồi gán dòng mới; lịch sử giữ cả hai.</p>
      <AssignRoleModal
        userId={userId}
        open={assigning}
        onClose={() => setAssigning(false)}
      />
    </Card>
  );
}
