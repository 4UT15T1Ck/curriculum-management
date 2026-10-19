import { Result } from 'antd';
import type { ReactNode } from 'react';
import type { PermissionCode } from './permissions';
import { useCan } from './useCan';

interface RequirePermissionProps {
  code: PermissionCode;
  children: ReactNode;
}

export function RequirePermission({ code, children }: RequirePermissionProps) {
  if (!useCan(code)) {
    return (
      <Result status="403" title="Bạn không có quyền truy cập trang này" />
    );
  }
  return children;
}
