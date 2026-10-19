import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App } from 'antd';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { ME } from './testFixtures';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

export interface Write {
  method: string;
  url: string;
  body: unknown;
}

// Renders a page at `entry` with fetch stubbed: GETs are answered from `reads` (url -> body), writes are recorded and
// answered by `writeResponse` (or 200 with `{}`), anything else is a 404.
export function renderOutcomePage(options: {
  path: string;
  entry: string;
  element: ReactElement;
  reads: Record<string, unknown>;
  me?: Record<string, unknown>;
  writeResponse?: (write: Write) => Response;
}) {
  const writes: Write[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method && init.method !== 'GET') {
        const write = {
          method: init.method,
          url,
          body: init.body ? JSON.parse(String(init.body)) : undefined,
        };
        writes.push(write);
        return Promise.resolve(options.writeResponse?.(write) ?? json({}));
      }
      if (url === '/api/auth/me')
        return Promise.resolve(json(options.me ?? ME));
      if (url in options.reads)
        return Promise.resolve(json(options.reads[url]));
      return Promise.resolve(json({ message: 'Not found' }, 404));
    }),
  );
  const router = createMemoryRouter(
    [{ path: options.path, element: options.element }],
    { initialEntries: [options.entry] },
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
  return { writes };
}

export { json };
