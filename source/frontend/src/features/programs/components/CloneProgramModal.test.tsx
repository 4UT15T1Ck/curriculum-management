import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProgramDetail } from '../api/programs';
import { CloneProgramModal } from './CloneProgramModal';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const PROGRAM = {
  id: 'p1',
  programCode: '1024034',
  currentVersion: { id: 'v2', versionNumber: '1.0', status: 'ACTIVE' },
  currentVersionInfo: { programName: 'Kỹ thuật máy tính' },
  versions: [
    { id: 'v2', versionNumber: '1.0', status: 'ACTIVE' },
    { id: 'v3', versionNumber: null, status: 'DRAFT' },
  ],
} as unknown as ProgramDetail;

function renderModal(write: () => Response) {
  const posts: { url: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      posts.push({
        url: String(input),
        body:
          init?.body === undefined ? undefined : JSON.parse(String(init.body)),
      });
      return Promise.resolve(write());
    }),
  );
  const onClose = vi.fn();
  const router = createMemoryRouter(
    [
      {
        path: '/programs/:programId',
        element: <p>Tổng quan chương trình</p>,
      },
      {
        path: '/',
        element: <CloneProgramModal program={PROGRAM} onClose={onClose} />,
      },
    ],
    { initialEntries: ['/'] },
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
  return { posts, onClose };
}

afterEach(() => vi.unstubAllGlobals());

describe('CloneProgramModal', () => {
  it('posts the picked source version with the new code and name, then opens the clone', async () => {
    const { posts } = renderModal(() => json({ id: 'p9' }, 201));
    expect(
      await screen.findByText(/PLO và hai ma trận chuẩn đầu ra/),
    ).toBeInTheDocument();
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(await screen.findByText('Nháp — Nháp'));
    fireEvent.change(screen.getByLabelText('Mã chương trình mới'), {
      target: { value: '1024035' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Nhân bản' }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]).toEqual({
      url: '/api/programs/p1/clone',
      body: {
        sourceVersionId: 'v3',
        programCode: '1024035',
        programName: 'Kỹ thuật máy tính',
      },
    });
    expect(
      await screen.findByText('Tổng quan chương trình'),
    ).toBeInTheDocument();
  });

  it('defaults to the current version', async () => {
    const { posts } = renderModal(() => json({ id: 'p9' }, 201));
    fireEvent.change(await screen.findByLabelText('Mã chương trình mới'), {
      target: { value: '1024035' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Nhân bản' }));
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].body).toMatchObject({ sourceVersionId: 'v2' });
  });

  it('puts a duplicate-code refusal under the code field', async () => {
    renderModal(() =>
      json(
        {
          code: 'PROGRAM_CODE_TAKEN',
          message: 'Mã chương trình đã tồn tại.',
          details: [{ field: 'programCode', constraints: ['unique'] }],
        },
        409,
      ),
    );
    fireEvent.change(await screen.findByLabelText('Mã chương trình mới'), {
      target: { value: '1024034' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Nhân bản' }));
    expect(
      await screen.findByText('Mã chương trình đã tồn tại.'),
    ).toBeInTheDocument();
  });

  it('refuses an empty code without posting', async () => {
    const { posts } = renderModal(() => json({}, 201));
    fireEvent.click(await screen.findByRole('button', { name: 'Nhân bản' }));
    expect(
      await screen.findByText('Nhập mã chương trình.'),
    ).toBeInTheDocument();
    expect(posts).toHaveLength(0);
  });
});
