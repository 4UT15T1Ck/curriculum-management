import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from './RequireAuth';

const normalUser = {
  id: '1',
  username: 'user',
  userCode: 'U1',
  fullName: 'Người dùng',
  email: null,
  mustChangePassword: false,
};

afterEach(() => vi.unstubAllGlobals());

function renderGuard(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>login marker</div> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <div>home marker</div> },
          { path: '/account', element: <div>account marker</div> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('RequireAuth', () => {
  it('redirects a 401 session to login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 401 })),
    );
    renderGuard('/');
    expect(await screen.findByText('login marker')).toBeInTheDocument();
  });
  it('redirects first-login password changes to account', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ ...normalUser, mustChangePassword: true }),
          ),
        ),
    );
    renderGuard('/');
    expect(await screen.findByText('account marker')).toBeInTheDocument();
  });
  it('renders the requested page for an authenticated user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(normalUser))),
    );
    renderGuard('/');
    expect(await screen.findByText('home marker')).toBeInTheDocument();
  });
});
