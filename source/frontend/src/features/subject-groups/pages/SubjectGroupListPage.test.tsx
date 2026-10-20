import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { SubjectGroupListPage } from './SubjectGroupListPage';

const canManage = vi.hoisted(() => vi.fn(() => false));
vi.mock('../../../shared/auth/useCan', () => ({ useCan: canManage }));
describe('SubjectGroupListPage', () => {
  it('shows read-only groups and missing coordinator warning', async () => {
    canManage.mockReturnValue(false);
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify([
              {
                id: 'g1',
                groupCode: 'G1',
                groupName: 'Đại số',
                status: 'ACTIVE',
                faculty: { id: 'f', unitCode: 'F', unitName: 'Khoa Toán' },
                activeMemberCount: 2,
                activeCoordinators: [],
                hasActiveCoordinator: false,
              },
            ]),
          ),
        ),
      ),
    );
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <App>
          <MemoryRouter>
            <SubjectGroupListPage />
          </MemoryRouter>
        </App>
      </QueryClientProvider>,
    );
    expect(await screen.findByText('Đại số')).toBeInTheDocument();
    expect(screen.getByText('Chưa có Điều phối')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thêm nhóm' }),
    ).not.toBeInTheDocument();
  });
  it('shows management actions and loads impact before confirming deactivation', async () => {
    canManage.mockReturnValue(true);
    const group = {
      id: 'g1',
      groupCode: 'G1',
      groupName: 'Đại số',
      status: 'ACTIVE',
      faculty: { id: 'f', unitCode: 'F', unitName: 'Khoa Toán' },
      activeMemberCount: 2,
      activeCoordinators: [],
      hasActiveCoordinator: false,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        const body = url.includes('/deactivation-impact')
          ? { activeMemberCount: 2, activeCoordinators: [], courses: [] }
          : url.endsWith('/org-units')
            ? []
            : [group];
        return Promise.resolve(new Response(JSON.stringify(body)));
      }),
    );
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <App>
          <MemoryRouter>
            <SubjectGroupListPage />
          </MemoryRouter>
        </App>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByRole('button', { name: 'Thêm nhóm' }),
    ).toBeInTheDocument();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ngừng sử dụng' }),
    );
    expect(
      await screen.findByText('2 thành viên đang hiệu lực'),
    ).toBeInTheDocument();
  });
});
