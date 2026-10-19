import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { UserDetailPage } from './UserDetailPage';

const account = {
  id: 'u1',
  username: 'gv01',
  userCode: 'GV01',
  fullName: 'Nguyễn An',
  email: null,
  orgUnit: null,
  status: 'ACTIVE',
  activeRoleCodes: [],
  mustChangePassword: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};
function renderPage(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(
    [{ path: '/users/:userId', element: <UserDetailPage /> }],
    { initialEntries: ['/users/u1'] },
  );
  return render(
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
}
function responseFor(url: string, method?: string) {
  if (url.includes('/auth/me'))
    return { id: 'admin', permissions: ['user.manage'] };
  if (url.endsWith('/role-assignments')) return [];
  if (url.includes('/subject-group-memberships')) return [];
  if (url.endsWith('/roles')) return [];
  if (url.endsWith('/roles')) return [];
  if (url.endsWith('/reset-password')) return { temporaryPassword: 'Temp1234' };
  if (url.endsWith('/disable') || method === 'POST')
    return { ...account, status: 'DISABLED' };
  return account;
}

describe('UserDetailPage', () => {
  it('asks for confirmation before disabling and then calls the endpoint', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify(responseFor(String(input), init?.method))),
      ),
    );
    renderPage(fetchMock);
    expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Vô hiệu hóa' }));
    expect(
      await screen.findByText(/Người này sẽ bị đăng xuất/),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).endsWith('/disable')),
    ).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await vi.waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).endsWith('/disable')),
      ).toBe(true),
    );
  });

  it('shows the reset temporary password and hides disable for the current user', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/auth/me'))
        return Promise.resolve(
          new Response(
            JSON.stringify({ id: 'u1', permissions: ['user.manage'] }),
          ),
        );
      return Promise.resolve(
        new Response(JSON.stringify(responseFor(url, init?.method))),
      );
    });
    renderPage(fetchMock);
    expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
    // The account and the session load independently; the button is hidden only once both are in.
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Vô hiệu hóa' }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }));
    expect(await screen.findByText('Temp1234')).toBeInTheDocument();
  });
});
