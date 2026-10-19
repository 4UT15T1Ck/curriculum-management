import { useState } from 'react';
import { App, Dropdown, Tooltip, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { PermissionCode } from '../../../shared/auth/permissions';
import type { MatrixCell as MatrixCellDto } from '../api/permissionMatrix';
import {
  CELL_OPTIONS,
  CELL_SYMBOLS,
  NO_CELL_LABEL,
} from '../constants/matrixLabels';
import { useMatrixMutations } from '../hooks/usePermissionMatrix';

interface MatrixCellProps {
  roleCode: string;
  permissionCode: PermissionCode;
  cell: MatrixCellDto | undefined;
  locked: boolean;
  editable: boolean;
}

function symbol(cell: MatrixCellDto | undefined) {
  if (!cell) return NO_CELL_LABEL;
  const option = CELL_OPTIONS.find(
    (entry) => entry.mode === cell.mode && entry.scope === cell.scope,
  );
  return option ? CELL_SYMBOLS[option.key] : NO_CELL_LABEL;
}

export function MatrixCell({
  roleCode,
  permissionCode,
  cell,
  locked,
  editable,
}: MatrixCellProps) {
  const { modal } = App.useApp();
  const { set, clear } = useMatrixMutations();
  const [open, setOpen] = useState(false);
  const current = symbol(cell);
  const items: MenuProps['items'] = [
    ...CELL_OPTIONS.map((option) => ({ key: option.key, label: option.label })),
    { key: 'none', label: NO_CELL_LABEL },
  ];
  function choose(key: string) {
    const next = CELL_OPTIONS.find((option) => option.key === key);
    const label = next?.label ?? NO_CELL_LABEL;
    modal.confirm({
      title: 'Xác nhận thay đổi quyền',
      content: `Đổi quyền của ${roleCode} với ${permissionCode} từ ${current} sang ${label}? Thay đổi có hiệu lực ngay.`,
      onOk: () =>
        next
          ? set.mutateAsync({
              roleCode,
              permissionCode,
              body: { mode: next.mode, scope: next.scope },
            })
          : clear.mutateAsync({ roleCode, permissionCode }),
    });
    setOpen(false);
  }
  const content = (
    <>
      {current}
      {locked && <LockOutlined style={{ marginLeft: 6 }} />}
    </>
  );
  const tooltip = locked
    ? 'Ô quyền này được khóa để bảo vệ quyền quản trị.'
    : cell
      ? `Cập nhật lần cuối: ${cell.updatedBy?.fullName ?? 'Hệ thống'}, ${new Date(cell.updatedAt).toLocaleString('vi-VN')}`
      : current;
  return (
    <Tooltip title={tooltip}>
      {editable && !locked ? (
        <Dropdown
          open={open}
          onOpenChange={setOpen}
          menu={{ items, onClick: ({ key }) => choose(key) }}
          trigger={['click']}
        >
          <Typography.Link>{content}</Typography.Link>
        </Dropdown>
      ) : (
        <span>{content}</span>
      )}
    </Tooltip>
  );
}
