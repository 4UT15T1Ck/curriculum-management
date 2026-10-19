import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequirePermission } from './RequirePermission';
import { PERMISSIONS } from './permissions';

const useMe = vi.hoisted(() => vi.fn());
vi.mock('./useMe', () => ({ useMe }));

describe('RequirePermission', () => {
  beforeEach(() => useMe.mockReset());

  it('renders children when permission is held', () => {
    useMe.mockReturnValue({ data: { permissions: [PERMISSIONS.userManage] } });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RequirePermission code={PERMISSIONS.userManage}>
          Nội dung
        </RequirePermission>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Nội dung')).toBeInTheDocument();
  });

  it('shows forbidden when permission is missing', () => {
    useMe.mockReturnValue({ data: { permissions: [] } });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RequirePermission code={PERMISSIONS.userManage}>
          Nội dung
        </RequirePermission>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText('Bạn không có quyền truy cập trang này'),
    ).toBeInTheDocument();
  });
});
