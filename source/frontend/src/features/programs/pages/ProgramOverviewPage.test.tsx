import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgramOverviewPage } from './ProgramOverviewPage';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const FACULTY = { id: 'f1', unitCode: 'KHOA_CNTT', unitName: 'Khoa CNTT' };
const INFO = {
  id: 'v1',
  versionNumber: null,
  status: 'DRAFT',
  programName: 'Kỹ thuật máy tính',
  majorCode: '7480106',
  majorName: 'Kỹ thuật máy tính',
  semesterCount: 10,
  totalCredits: '150',
  compulsoryCredits: '140',
  electiveCredits: '10',
  updatedAt: '2026-10-19T00:00:00.000Z',
};
const PROGRAM = {
  id: 'p1',
  programCode: '1024034',
  degreeLevel: 'ENGINEER',
  status: 'ACTIVE',
  faculty: FACULTY,
  programName: 'Kỹ thuật máy tính',
  currentVersion: { id: 'v1', versionNumber: null, status: 'DRAFT' },
  directors: [],
  currentVersionInfo: INFO,
  draftVersion: INFO,
  versions: [{ id: 'v1', versionNumber: null, status: 'DRAFT' }],
  clonedFrom: null,
  editPath: 'DIRECT',
  canManage: true,
  canClone: true,
  createdAt: '2026-10-19T00:00:00.000Z',
  updatedAt: '2026-10-19T00:00:00.000Z',
};
const director = (patch: Record<string, unknown> = {}) => ({
  id: 'd1',
  director: { id: 'u1', fullName: 'Nguyễn An' },
  validFrom: '2026-01-01',
  validTo: null,
  state: 'ACTIVE',
  assignedBy: { id: 'a', fullName: 'Quản trị' },
  revokedAt: null,
  revokedBy: null,
  ...patch,
});

function renderPage(
  program: Record<string, unknown> = PROGRAM,
  directors: unknown[] = [],
) {
  const writes: { url: string; method: string }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === 'POST') {
        writes.push({ url, method: 'POST' });
        return Promise.resolve(json({ ...program, status: 'INACTIVE' }));
      }
      if (url === '/api/programs/p1/directors')
        return Promise.resolve(json(directors));
      if (url === '/api/programs/p1') return Promise.resolve(json(program));
      return Promise.resolve(json({}, 404));
    }),
  );
  const router = createMemoryRouter(
    [{ path: '/programs/:programId', element: <ProgramOverviewPage /> }],
    { initialEntries: ['/programs/p1'] },
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

afterEach(() => vi.unstubAllGlobals());

describe('ProgramOverviewPage', () => {
  it('shows the Draft info, the status and the way to the later sections', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', {
        name: /1024034 — Kỹ thuật máy tính/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Tổng tín chỉ')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Khung chương trình')).toBeInTheDocument();
    expect(screen.getByText('Kiểm tra nhất quán')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sửa thông tin' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Nhân bản' }),
    ).toBeInTheDocument();
  });

  it('links the curriculum and elective groups to the Draft version (F-07)', async () => {
    renderPage();
    const curriculum = await screen.findByRole('link', {
      name: 'Khung chương trình',
    });
    expect(curriculum).toHaveAttribute(
      'href',
      '/programs/p1/versions/v1/curriculum',
    );
    expect(screen.getByRole('link', { name: 'Nhóm tự chọn' })).toHaveAttribute(
      'href',
      '/programs/p1/versions/v1/elective-groups',
    );
    expect(
      screen.queryByRole('link', { name: 'Kiểm tra nhất quán' }),
    ).not.toBeInTheDocument();
  });

  it('opens the current version when the program has no Draft', async () => {
    renderPage({
      ...PROGRAM,
      draftVersion: null,
      currentVersion: { id: 'v9', versionNumber: '1.0', status: 'ACTIVE' },
    });
    expect(
      await screen.findByRole('link', { name: 'Khung chương trình' }),
    ).toHaveAttribute('href', '/programs/p1/versions/v9/curriculum');
  });

  it('shows the disabled request button when the edit must go through a request', async () => {
    renderPage({ ...PROGRAM, editPath: 'VIA_REQUEST' });
    const button = await screen.findByRole('button', { name: 'Tạo đề xuất' });
    expect(button).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Sửa thông tin' }),
    ).not.toBeInTheDocument();
  });

  it('hides every edit control from a caller with no edit path, manage right or clone right', async () => {
    renderPage({
      ...PROGRAM,
      editPath: null,
      canManage: false,
      canClone: false,
    });
    await screen.findByText('Thông tin chương trình');
    for (const name of [
      'Sửa thông tin',
      'Tạo đề xuất',
      'Nhân bản',
      'Ngừng sử dụng',
      'Phân công',
    ])
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  });

  it('hides the director actions without canManage', async () => {
    renderPage({ ...PROGRAM, canManage: false }, [director()]);
    expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Kết thúc' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thu hồi' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Phân công' }),
    ).not.toBeInTheDocument();
  });

  it('lists active rows first and offers end and revoke only on rows still in force', async () => {
    renderPage(PROGRAM, [
      director({
        id: 'old',
        director: { id: 'u2', fullName: 'Trần Bình' },
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        state: 'EXPIRED',
      }),
      director(),
    ]);
    const card = (await screen.findByText('Trần Bình')).closest('.ant-card')!;
    const rows = within(card as HTMLElement).getAllByRole('row');
    // rows[0] is the header.
    expect(rows[1]).toHaveTextContent('Nguyễn An');
    expect(rows[1]).toHaveTextContent('Đang hiệu lực');
    expect(rows[1]).toHaveTextContent('Kết thúc');
    expect(rows[1]).toHaveTextContent('Thu hồi');
    expect(rows[2]).toHaveTextContent('Trần Bình');
    expect(rows[2]).toHaveTextContent('Đã hết hạn');
    expect(rows[2]).not.toHaveTextContent('Kết thúc');
    expect(rows[2]).not.toHaveTextContent('Thu hồi');
    expect(screen.getByRole('button', { name: 'Phân công' })).toBeEnabled();
  });

  it('offers no assignment on a deactivated program', async () => {
    renderPage({ ...PROGRAM, status: 'INACTIVE' }, []);
    await screen.findByText('Chưa phân công Giám đốc CTĐT');
    expect(
      screen.queryByRole('button', { name: 'Phân công' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Dùng lại' }),
    ).toBeInTheDocument();
  });

  it('asks before deactivating, then posts the action', async () => {
    const { writes } = renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ngừng sử dụng' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(writes).toHaveLength(0);
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Ngừng sử dụng' }),
    );
    await waitFor(() =>
      expect(writes).toEqual([
        { url: '/api/programs/p1/deactivate', method: 'POST' },
      ]),
    );
  });
});
