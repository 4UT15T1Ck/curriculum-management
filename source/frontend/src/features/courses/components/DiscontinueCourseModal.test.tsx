import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CourseDetail } from '../api/courses';
import { DiscontinueCourseModal } from './DiscontinueCourseModal';

const course = {
  id: 'c1',
  courseCode: 'IT001',
  courseName: 'Nhập môn lập trình',
  status: 'ACTIVE',
} as CourseDetail;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const related = (id: string, code: string, status = 'ACTIVE') => ({
  id,
  courseCode: code,
  courseName: `Học phần ${code}`,
  credits: '3',
  status,
});

function renderModal(relations: unknown[] = []) {
  const posts: { url: string; body: unknown }[] = [];
  const onClose = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/courses/c1/relations')
        return Promise.resolve(json(relations));
      if (url.startsWith('/api/courses?'))
        return Promise.resolve(
          json({
            items: [related('c2', 'IT002')],
            total: 1,
            page: 1,
            pageSize: 20,
          }),
        );
      if (init?.method === 'POST') {
        posts.push({
          url,
          body:
            init.body === undefined ? undefined : JSON.parse(String(init.body)),
        });
        return Promise.resolve(json({ ...course, status: 'DISCONTINUED' }));
      }
      return Promise.resolve(json({}, 404));
    }),
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
        <DiscontinueCourseModal course={course} onClose={onClose} />
      </App>
    </QueryClientProvider>,
  );
  return { posts, onClose };
}

afterEach(() => vi.unstubAllGlobals());

describe('DiscontinueCourseModal', () => {
  it('keeps OK disabled until a replacement is picked, then posts it', async () => {
    const { posts, onClose } = renderModal();
    const ok = screen.getByRole('button', { name: 'Ngừng mở lớp' });
    expect(
      await screen.findByText(/Chọn học phần thay thế/),
    ).toBeInTheDocument();
    expect(ok).toBeDisabled();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('IT002 — Học phần IT002 (3 TC)'));
    await waitFor(() => expect(ok).toBeEnabled());
    fireEvent.click(ok);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(posts).toEqual([
      {
        url: '/api/courses/c1/discontinue',
        body: { replacementCourseId: 'c2' },
      },
    ]);
  });

  it('enables OK at once when an active replacement already exists and sends no course', async () => {
    const { posts, onClose } = renderModal([
      {
        id: 'r1',
        relationType: 'REPLACEMENT',
        sourceCourse: related('c1', 'IT001'),
        targetCourse: related('c3', 'IT003'),
        minScore: null,
        editPath: 'DIRECT',
      },
    ]);
    expect(await screen.findByText(/IT003/)).toBeInTheDocument();
    const ok = screen.getByRole('button', { name: 'Ngừng mở lớp' });
    await waitFor(() => expect(ok).toBeEnabled());
    fireEvent.click(ok);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(posts).toEqual([{ url: '/api/courses/c1/discontinue', body: {} }]);
  });

  it('does not count a replacement that is itself no longer active', async () => {
    renderModal([
      {
        id: 'r1',
        relationType: 'REPLACEMENT',
        sourceCourse: related('c1', 'IT001'),
        targetCourse: related('c3', 'IT003', 'DISCONTINUED'),
        minScore: null,
        editPath: 'DIRECT',
      },
    ]);
    expect(
      await screen.findByText(/Chọn học phần thay thế/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ngừng mở lớp' })).toBeDisabled();
  });
});
