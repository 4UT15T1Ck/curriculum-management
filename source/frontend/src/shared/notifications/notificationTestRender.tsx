import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App } from 'antd';
import type { ReactElement } from 'react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';
import { vi } from 'vitest';

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

export interface RecordedCall {
  method: string;
  url: string;
}

// Renders `element` at `entry` with fetch stubbed: GETs answer from `reads` (url -> body), POSTs answer from `writes`.
export function renderWithNotifications(options: {
  element: ReactElement;
  entry?: string;
  reads: Record<string, unknown>;
  writes?: Record<string, unknown>;
}) {
  const calls: RecordedCall[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({ method, url });
      const table = method === 'GET' ? options.reads : (options.writes ?? {});
      return Promise.resolve(
        url in table
          ? jsonResponse(table[url])
          : jsonResponse({ message: 'Not found' }, 404),
      );
    }),
  );
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <>
            <Link to="/elsewhere">Đi nơi khác</Link>
            {options.element}
          </>
        ),
      },
    ],
    { initialEntries: [options.entry ?? '/'] },
  );
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <App>
        <RouterProvider router={router} />
      </App>
    </QueryClientProvider>,
  );
  return { calls, router };
}
