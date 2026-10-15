import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { Health } from '../api/health';
import { HealthPage } from './HealthPage';

function respondWith(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(Response.json(body, { status }))),
  );
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <HealthPage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HealthPage', () => {
  it('shows every dependency as running', async () => {
    respondWith(200, {
      status: 'ok',
      database: 'up',
      redis: 'up',
    } satisfies Health);
    renderPage();
    expect(await screen.findAllByText('Hoạt động')).toHaveLength(2);
  });

  it('names the dependency that is down when the API answers 503', async () => {
    respondWith(503, {
      status: 'error',
      database: 'up',
      redis: 'down',
    } satisfies Health);
    renderPage();
    expect(await screen.findByText('Mất kết nối')).toBeInTheDocument();
    expect(screen.getByText('Hoạt động')).toBeInTheDocument();
  });

  it('reports the server as unreachable on any other failure', async () => {
    respondWith(502, {});
    renderPage();
    expect(
      await screen.findByText('Không kết nối được máy chủ ứng dụng'),
    ).toBeInTheDocument();
  });
});
