import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { SubjectGroupDetailPage } from './SubjectGroupDetailPage';

vi.mock('../../../shared/auth/useCan', () => ({ useCan: () => false }));
describe('SubjectGroupDetailPage', () => {
  it('shows member and coordinator sections and the missing coordinator warning', async () => {
    const detail = {
      id: 'g',
      groupCode: 'G1',
      groupName: 'Đại số',
      status: 'ACTIVE',
      faculty: { id: 'f', unitCode: 'F', unitName: 'Khoa Toán' },
      activeMemberCount: 1,
      activeCoordinators: [],
      hasActiveCoordinator: false,
      members: [],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify(detail)))),
    );
    const router = createMemoryRouter(
      [
        {
          path: '/subject-groups/:groupId',
          element: <SubjectGroupDetailPage />,
        },
      ],
      { initialEntries: ['/subject-groups/g'] },
    );
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <App>
          <RouterProvider router={router} />
        </App>
      </QueryClientProvider>,
    );
    expect(await screen.findByText('Chưa có Điều phối')).toBeInTheDocument();
    expect(screen.getByText('Điều phối')).toBeInTheDocument();
    expect(screen.getByText('Thành viên', { exact: true })).toBeInTheDocument();
  });
  it('renders a 403 result for a group outside the caller scope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ code: 'OUT_OF_SCOPE', message: 'Ngoài phạm vi' }),
            { status: 403 },
          ),
        ),
      ),
    );
    const router = createMemoryRouter(
      [
        {
          path: '/subject-groups/:groupId',
          element: <SubjectGroupDetailPage />,
        },
      ],
      { initialEntries: ['/subject-groups/g'] },
    );
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <App>
          <RouterProvider router={router} />
        </App>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText('Nhóm này nằm ngoài phạm vi của bạn'),
    ).toBeInTheDocument();
  });
});
