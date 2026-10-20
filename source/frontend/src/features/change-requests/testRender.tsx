import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App } from 'antd';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { ME } from './testFixtures';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

export interface Write {
  method: string;
  url: string;
  body: unknown;
}

interface RenderOptions {
  path: string;
  entry: string;
  element: ReactElement;
  // GET url -> body; anything else answers 404.
  reads?: Record<string, unknown>;
  me?: Record<string, unknown>;
  writeResponse?: (write: Write) => Response | undefined;
  // Other routes the page may navigate to.
  extraRoutes?: { path: string; element: ReactElement }[];
}

// Renders a page at `entry` with fetch stubbed: reads are answered from `reads`, writes are recorded and answered by
// `writeResponse` (or 200 with `{}`).
export function renderRequestPage(options: RenderOptions) {
  const writes: Write[] = [];
  const reads: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method && init.method !== 'GET') {
        const write = {
          method: init.method,
          url,
          body:
            typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
        };
        writes.push(write);
        return Promise.resolve(options.writeResponse?.(write) ?? json({}));
      }
      reads.push(url);
      if (url === '/api/auth/me')
        return Promise.resolve(json(options.me ?? ME));
      if (options.reads && url in options.reads)
        return Promise.resolve(json(options.reads[url]));
      return Promise.resolve(json({ message: 'Not found' }, 404));
    }),
  );
  const router = createMemoryRouter(
    [
      { path: options.path, element: options.element },
      ...(options.extraRoutes ?? []),
    ],
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
  return { writes, reads, router };
}
