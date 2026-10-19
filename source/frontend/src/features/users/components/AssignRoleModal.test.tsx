import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignRoleModal } from './AssignRoleModal';

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useRoleAssignments', () => ({
  useRoles: () => ({
    data: [
      { id: 'r1', roleCode: 'R1', roleName: 'Quản trị', assignable: true },
      { id: 'r3', roleCode: 'R3', roleName: 'Giảng viên', assignable: false },
    ],
  }),
  useAssignRole: () => ({ mutateAsync, isPending: false }),
}));
vi.mock('../../../shared/org-units/OrgUnitSelect', () => ({
  OrgUnitSelect: () => <select aria-label="Đơn vị" />,
}));

describe('AssignRoleModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({});
  });
  it('offers only assignable roles', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <AssignRoleModal userId="u1" open onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    expect(
      (await screen.findAllByText('R1 — Quản trị')).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText('R3 — Giảng viên')).not.toBeInTheDocument();
  });

  it('requires a unit when UNIT scope is selected', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <App>
          <AssignRoleModal userId="u1" open onClose={vi.fn()} />
        </App>
      </QueryClientProvider>,
    );
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click((await screen.findAllByText('R1 — Quản trị'))[0]);
    fireEvent.click(screen.getByRole('radio', { name: 'Đơn vị' }));
    await screen.findByRole('combobox', { name: 'Đơn vị' });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(await screen.findByText('Chọn đơn vị')).toBeInTheDocument();
  });

  it('submits validity dates in ISO calendar-day format', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <App>
          <AssignRoleModal userId="u1" open onClose={vi.fn()} />
        </App>
      </QueryClientProvider>,
    );
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click((await screen.findAllByText('R1 — Quản trị'))[0]);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].validFrom).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
