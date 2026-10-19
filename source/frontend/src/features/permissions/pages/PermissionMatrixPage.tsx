import { useMemo, useState } from 'react';
import { Result, Select, Space, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useCan } from '../../../shared/auth/useCan';
import { PERMISSIONS } from '../../../shared/auth/permissions';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';
import type { PermissionMatrix } from '../api/permissionMatrix';
import {
  CELL_OPTIONS,
  FUNCTION_GROUP_LABELS,
  NO_CELL_LABEL,
} from '../constants/matrixLabels';
import { MatrixCell } from '../components/MatrixCell';

type PermissionRow = PermissionMatrix['permissions'][number];

export function PermissionMatrixPage() {
  const { data, isPending, isError } = usePermissionMatrix();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [group, setGroup] = useState<string>();
  const editable = useCan(PERMISSIONS.permissionManage);
  const roles = data?.roles ?? [];
  const shownRoles = selectedRoles.length
    ? roles.filter((role) => selectedRoles.includes(role.roleCode))
    : roles;
  const permissions = useMemo(
    () =>
      (data?.permissions ?? []).filter(
        (item) => !group || item.functionGroup === group,
      ),
    [data, group],
  );
  const columns: TableColumnsType<PermissionRow> = [
    {
      title: 'Quyền',
      key: 'permission',
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <span>{item.permissionName}</span>
          <Typography.Text code>{item.permissionCode}</Typography.Text>
          <Typography.Text type="secondary">{item.source}</Typography.Text>
        </Space>
      ),
    },
    ...shownRoles.map((role) => ({
      title: `${role.roleCode} ${role.roleName}`,
      key: role.roleCode,
      render: (_: unknown, permission: PermissionRow) => (
        <MatrixCell
          roleCode={role.roleCode}
          permissionCode={permission.permissionCode}
          cell={data?.cells.find(
            (cell) =>
              cell.roleCode === role.roleCode &&
              cell.permissionCode === permission.permissionCode,
          )}
          locked={Boolean(
            data?.lockedCells.some(
              (cell) =>
                cell.roleCode === role.roleCode &&
                cell.permissionCode === permission.permissionCode,
            ),
          )}
          editable={editable}
        />
      ),
    })),
  ];
  if (isError)
    return <Result status="error" title="Không thể tải ma trận quyền" />;
  const groups = [
    ...new Set(
      (data?.permissions ?? []).map((permission) => permission.functionGroup),
    ),
  ];
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Title level={2}>Ma trận quyền</Typography.Title>
      <Space>
        <Select
          mode="multiple"
          placeholder="Lọc vai trò"
          value={selectedRoles}
          onChange={setSelectedRoles}
          options={roles.map((role) => ({
            value: role.roleCode,
            label: `${role.roleCode} — ${role.roleName}`,
          }))}
        />
        <Select
          allowClear
          placeholder="Nhóm chức năng"
          value={group}
          onChange={setGroup}
          options={groups.map((value) => ({
            value,
            label: FUNCTION_GROUP_LABELS[value],
          }))}
        />
      </Space>
      <Table<PermissionRow>
        rowKey="permissionCode"
        columns={columns}
        dataSource={permissions}
        loading={isPending}
        pagination={false}
      />
      <Space wrap>
        {CELL_OPTIONS.map((option) => (
          <Tag key={option.key}>{option.label}</Tag>
        ))}
        <Tag>{NO_CELL_LABEL}</Tag>
      </Space>
    </Space>
  );
}
