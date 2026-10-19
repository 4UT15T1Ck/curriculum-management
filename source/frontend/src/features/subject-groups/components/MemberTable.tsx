import { useState } from 'react';
import { App, Button, Popconfirm, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { ApiError } from '../../../shared/api/client';
import {
  formatPeriod,
  VALIDITY_STATE_COLORS,
  VALIDITY_STATE_LABELS,
} from '../../../shared/validity/validity';
import type { SubjectGroupMember } from '../api/subjectGroupAdmin';
import { EndMemberModal } from './EndMemberModal';
import { useRevokeMember } from '../hooks/useSubjectGroupAdmin';

interface MemberTableProps {
  groupId: string;
  rows: SubjectGroupMember[];
  canManage: boolean;
}
export function MemberTable({ groupId, rows, canManage }: MemberTableProps) {
  const [ending, setEnding] = useState<SubjectGroupMember | null>(null);
  const { message } = App.useApp();
  const revoke = useRevokeMember();
  async function revokeRow(row: SubjectGroupMember) {
    try {
      await revoke.mutateAsync({ groupId, memberId: row.id });
    } catch (error) {
      message.error(
        error instanceof ApiError
          ? error.message
          : 'Không thể thu hồi dòng thành viên',
      );
    }
  }
  const columns: TableColumnsType<SubjectGroupMember> = [
    {
      title: 'Mã giảng viên',
      render: (_value, row) => (
        <>
          {row.lecturer.userCode}
          {row.lecturer.status === 'DISABLED' && <Tag>Đã vô hiệu hóa</Tag>}
        </>
      ),
    },
    { title: 'Họ tên', render: (_value, row) => row.lecturer.fullName },
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
    {
      title: 'Người gán',
      render: (_value, row) =>
        `${row.assignedBy?.fullName ?? '—'} · ${row.createdAt}`,
    },
    {
      title: 'Người thu hồi',
      render: (_value, row) =>
        row.revokedBy
          ? `${row.revokedBy.fullName} · ${row.revokedAt ?? ''}`
          : '—',
    },
    ...(canManage
      ? [
          {
            title: 'Thao tác',
            render: (_: unknown, row: SubjectGroupMember) =>
              ['ACTIVE', 'SCHEDULED'].includes(row.state) ? (
                <>
                  <Button type="link" onClick={() => setEnding(row)}>
                    Kết thúc
                  </Button>
                  <Popconfirm
                    title="Dùng khi dòng này nhập nhầm. Lịch sử vẫn giữ dòng đã thu hồi."
                    onConfirm={() => void revokeRow(row)}
                  >
                    <Button type="link" danger>
                      Thu hồi
                    </Button>
                  </Popconfirm>
                </>
              ) : null,
          },
        ]
      : []),
  ];
  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={false}
      />
      <EndMemberModal
        groupId={groupId}
        row={ending}
        onClose={() => setEnding(null)}
      />
    </>
  );
}
