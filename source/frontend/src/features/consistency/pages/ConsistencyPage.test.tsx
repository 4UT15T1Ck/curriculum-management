import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ConsistencyIssue, ConsistencyReport } from '../api/consistency';
import { ConsistencyPage } from './ConsistencyPage';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const breakdown = (compulsory: string, elective: string, total: string) => ({
  compulsory,
  elective,
  total,
});

export function report(
  patch: Partial<ConsistencyReport> = {},
  credits: Partial<ConsistencyReport['credits']> = {},
): ConsistencyReport {
  return {
    version: {
      id: 'v1',
      programId: 'p1',
      programCode: '1024034',
      programName: 'Kỹ thuật máy tính',
      versionNumber: null,
      status: 'DRAFT',
    },
    checkedAt: '2026-10-19T03:00:00.000Z',
    credits: {
      declared: breakdown('100', '50', '150'),
      computed: breakdown('98', '50', '148'),
      gap: breakdown('-2', '0', '-2'),
      mismatch: true,
      acceptance: null,
      acceptanceCurrent: false,
      ...credits,
    },
    groups: [],
    issues: [],
    errorCount: 0,
    warningCount: 0,
    passes: true,
    canAcceptMismatch: true,
    ...patch,
  };
}

const issue = (patch: Partial<ConsistencyIssue>): ConsistencyIssue => ({
  code: 'EMPTY_SEMESTER',
  severity: 'INFO',
  message: 'Học kỳ 2 chưa có học phần nào.',
  semester: 2,
  itemId: null,
  groupId: null,
  ...patch,
});

function renderPage(data: ConsistencyReport) {
  const fetchMock = vi.fn(() => Promise.resolve(json(data)));
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(
    [
      {
        path: '/programs/:programId/versions/:versionId/consistency',
        element: <ConsistencyPage />,
      },
    ],
    { initialEntries: ['/programs/p1/versions/v1/consistency'] },
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
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('ConsistencyPage', () => {
  it('says so when there is nothing to report (US-031 AC5)', async () => {
    renderPage(report({}, { mismatch: false }));
    expect(
      await screen.findByText('Không có lỗi, không có cảnh báo.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Còn lỗi: chưa gửi duyệt/),
    ).not.toBeInTheDocument();
  });

  it('shows an error under "Lỗi (1)" with the blocking note and a link to the row', async () => {
    renderPage(
      report({
        passes: false,
        errorCount: 1,
        issues: [
          issue({
            code: 'REQUISITE_CYCLE',
            severity: 'ERROR',
            message: 'Vòng điều kiện: A → B → A.',
            semester: null,
            itemId: 'i1',
          }),
        ],
      }),
    );
    expect(
      await screen.findByText(/Còn lỗi: chưa gửi duyệt hoặc ban hành/),
    ).toBeInTheDocument();
    expect(screen.getByText('Lỗi (1)')).toBeInTheDocument();
    expect(screen.getByText('Vòng điều kiện: A → B → A.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tới chỗ sửa' })).toHaveAttribute(
      'href',
      '/programs/p1/versions/v1/curriculum?focus=i1',
    );
  });

  it('computes again on "Chạy lại"', async () => {
    const fetchMock = renderPage(report());
    fireEvent.click(await screen.findByRole('button', { name: /Chạy lại/ }));
    await vi.waitFor(() => expect(fetchMock.mock.calls.length).toBe(2));
  });

  it('shows declared, computed and signed gaps, and offers the acceptance', async () => {
    renderPage(report());
    const table = (await screen.findAllByRole('table'))[0];
    const compulsory = within(table).getByRole('row', { name: /Bắt buộc/ });
    expect(compulsory).toHaveTextContent('100');
    expect(compulsory).toHaveTextContent('98');
    expect(compulsory).toHaveTextContent('-2');
    expect(
      screen.getByRole('button', { name: 'Chấp nhận chênh lệch' }),
    ).toBeInTheDocument();
  });

  it('offers no acceptance to a caller who cannot accept', async () => {
    renderPage(report({ canAcceptMismatch: false }));
    await screen.findByText('Tín chỉ');
    expect(
      screen.queryByRole('button', { name: 'Chấp nhận chênh lệch' }),
    ).not.toBeInTheDocument();
  });

  it('shows a stored acceptance as out of date when the gap moved', async () => {
    renderPage(
      report(
        {},
        {
          acceptance: {
            reason: 'Theo quyết định 12',
            compulsoryGap: '-1',
            electiveGap: '0',
            acceptedBy: { id: 'u1', fullName: 'Nguyễn An' },
            acceptedAt: '2026-10-18T03:00:00.000Z',
          },
        },
      ),
    );
    expect(await screen.findByText('Theo quyết định 12')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn An')).toBeInTheDocument();
    expect(
      screen.getByText('Đã hết hiệu lực — chênh lệch đã đổi'),
    ).toBeInTheDocument();
  });
});
