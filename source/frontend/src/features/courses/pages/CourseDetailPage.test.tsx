import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { CANCEL_CONFIRM_TEXT } from '../constants/courseLabels';
import { CourseDetailPage } from './CourseDetailPage';

const course = {
  id: 'c1',
  courseCode: 'IT001',
  courseName: 'Nhập môn lập trình',
  englishName: null,
  credits: '2.5',
  courseType: 'THEORY',
  status: 'ACTIVE',
  ownerFaculty: { id: 'f1', unitCode: 'KHOA_CNTT', unitName: 'Khoa CNTT' },
  ownerGroup: {
    id: 'g1',
    groupCode: 'G1',
    groupName: 'Lập trình',
    status: 'ACTIVE',
  },
  isForeign: false,
  programsUsing: [],
  editPath: 'DIRECT',
  canChangeStatus: true,
  createdAt: '2026-10-19T00:00:00.000Z',
  updatedAt: '2026-10-19T00:00:00.000Z',
};

function renderPage(respond: (url: string, init?: RequestInit) => Response) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(respond(String(input), init)),
  );
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(
    [{ path: '/courses/:courseId', element: <CourseDetailPage /> }],
    { initialEntries: ['/courses/c1'] },
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
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe('CourseDetailPage', () => {
  it('shows every catalog field, with a dash for a missing English name', async () => {
    renderPage(() => json(course));
    expect(
      await screen.findByText('IT001 — Nhập môn lập trình'),
    ).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('Lý thuyết')).toBeInTheDocument();
    expect(screen.getByText('Đang sử dụng')).toBeInTheDocument();
    expect(screen.getByText('Khoa CNTT')).toBeInTheDocument();
    expect(screen.getByText('G1 — Lập trình')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sửa' })).toBeEnabled();
  });

  it('shows a disabled change-request button when the edit path is via request', async () => {
    renderPage(() =>
      json({ ...course, editPath: 'VIA_REQUEST', canChangeStatus: false }),
    );
    const button = await screen.findByRole('button', { name: 'Tạo đề xuất' });
    expect(button).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Sửa' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Đổi trạng thái' }),
    ).not.toBeInTheDocument();
  });

  it('shows no edit button when the caller may not edit', async () => {
    renderPage(() =>
      json({ ...course, editPath: null, canChangeStatus: false }),
    );
    await screen.findByText('IT001 — Nhập môn lập trình');
    expect(
      screen.queryByRole('button', { name: 'Sửa' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tạo đề xuất' }),
    ).not.toBeInTheDocument();
  });

  it('lists the programs using the course only when there are some', async () => {
    renderPage(() =>
      json({
        ...course,
        programsUsing: [
          {
            programId: 'p',
            programCode: 'CNTT',
            programName: 'Công nghệ thông tin',
            versionLabel: '1.0',
          },
        ],
      }),
    );
    expect(
      await screen.findByText('CNTT — Công nghệ thông tin (1.0)'),
    ).toBeInTheDocument();
  });

  it('asks for confirmation before cancelling and posts only after OK', async () => {
    const fetchMock = renderPage((_url, init) =>
      init?.method === 'POST'
        ? json({
            ...course,
            status: 'CANCELLED',
            editPath: null,
            canChangeStatus: false,
          })
        : json(course),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Đổi trạng thái' }),
    );
    fireEvent.click(await screen.findByText('Hủy học phần'));
    expect(await screen.findByText(CANCEL_CONFIRM_TEXT)).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === 'POST'),
    ).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Hủy học phần' }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            String(url) === '/api/courses/c1/cancel' && init?.method === 'POST',
        ),
      ).toBe(true),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Đổi trạng thái' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the server message when a discontinue is refused for lack of a replacement', async () => {
    const message = 'Hãy khai báo học phần thay thế trước khi ngừng mở lớp.';
    renderPage((_url, init) =>
      init?.method === 'POST'
        ? json({ code: 'REPLACEMENT_REQUIRED', message }, 409)
        : json(course),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Đổi trạng thái' }),
    );
    fireEvent.click(
      await screen.findByText('Ngừng mở lớp', {
        selector: '.ant-dropdown-menu-title-content',
      }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ngừng mở lớp' }),
    );
    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it('renders not found when the course does not exist', async () => {
    renderPage(() =>
      json(
        { code: 'COURSE_NOT_FOUND', message: 'Không tìm thấy học phần.' },
        404,
      ),
    );
    expect(
      await screen.findByText('Không tìm thấy học phần'),
    ).toBeInTheDocument();
  });
});
