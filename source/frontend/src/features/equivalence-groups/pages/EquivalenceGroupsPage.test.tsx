import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from 'antd';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GROUP_MEMBERS_MIN_MESSAGE } from '../schema/equivalenceGroupRules';
import { EquivalenceGroupsPage } from './EquivalenceGroupsPage';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const member = (id: string, code: string) => ({
  id,
  courseCode: code,
  courseName: `Học phần ${code}`,
  credits: '3',
  status: 'ACTIVE',
});
const GROUP = {
  id: 'g1',
  groupCode: 'EQ1',
  note: 'Mã cũ và mã mới',
  members: [member('c1', 'IT001'), member('c2', 'IT002')],
  updatedAt: '2026-10-19T00:00:00.000Z',
};
const OTHER_GROUP = {
  id: 'g2',
  groupCode: 'EQ2',
  note: null,
  members: [member('c3', 'IT003'), member('c4', 'IT004')],
  updatedAt: '2026-10-19T00:00:00.000Z',
};
const ME = {
  id: 'u1',
  username: 'admin',
  userCode: 'AD',
  fullName: 'Quản trị',
  email: null,
  mustChangePassword: false,
  orgUnit: null,
  roles: [],
  permissions: ['course.view', 'course.edit', 'courseRelation.edit'],
};

interface Setup {
  permissions?: string[];
  onMutation?: (url: string, init: RequestInit) => Response | undefined;
  initialEntry?: string;
}

function renderPage({
  permissions = ME.permissions,
  onMutation,
  initialEntry = '/equivalence-groups',
}: Setup = {}) {
  const calls: { url: string; method: string; body: unknown }[] = [];
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({
      url,
      method,
      body:
        init?.body === undefined ? undefined : JSON.parse(String(init.body)),
    });
    if (url === '/api/auth/me')
      return Promise.resolve(json({ ...ME, permissions }));
    if (url.startsWith('/api/equivalence-groups?'))
      return Promise.resolve(
        json({ items: [GROUP, OTHER_GROUP], total: 2, page: 1, pageSize: 20 }),
      );
    if (url.startsWith('/api/courses?'))
      return Promise.resolve(
        json({
          items: [
            { ...member('c5', 'IT005'), englishName: null },
            { ...member('c6', 'IT006'), englishName: null },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        }),
      );
    if (url === '/api/courses/c5')
      return Promise.resolve(
        json({
          ...member('c5', 'IT005'),
          equivalenceGroup: { id: 'g2', groupCode: 'EQ2', members: [] },
        }),
      );
    if (method !== 'GET') {
      const answer = onMutation?.(url, init ?? {});
      if (answer) return Promise.resolve(answer);
    }
    return Promise.resolve(json({}, 404));
  });
  vi.stubGlobal('fetch', fetchMock);
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
        <MemoryRouter initialEntries={[initialEntry]}>
          <EquivalenceGroupsPage />
        </MemoryRouter>
      </App>
    </QueryClientProvider>,
  );
  return { calls, fetchMock };
}

afterEach(() => vi.unstubAllGlobals());

describe('EquivalenceGroupsPage', () => {
  it('lists each group with its member courses linked to their pages', async () => {
    renderPage();
    expect(await screen.findByText('EQ1')).toBeInTheDocument();
    expect(screen.getByText('Mã cũ và mã mới')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IT001' })).toHaveAttribute(
      'href',
      '/courses/c1',
    );
    expect(screen.getByRole('link', { name: 'IT004' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tạo nhóm' }),
    ).toBeInTheDocument();
  });

  it('pre-fills the search from ?q= (the link on the course page)', async () => {
    const { calls } = renderPage({ initialEntry: '/equivalence-groups?q=EQ1' });
    await screen.findByText('EQ1');
    expect(
      calls.some(
        ({ url }) =>
          url.includes('/api/equivalence-groups?') && url.includes('q=EQ1'),
      ),
    ).toBe(true);
    expect(
      screen.getByPlaceholderText('Tìm theo mã nhóm hoặc mã học phần'),
    ).toHaveValue('EQ1');
  });

  it('hides every editing control from a caller without courseRelation.edit', async () => {
    renderPage({ permissions: ['course.view'] });
    await screen.findByText('EQ1');
    for (const name of [
      'Tạo nhóm',
      'Thêm học phần',
      'Gộp với nhóm…',
      'Sửa',
      'Giải thể',
    ]) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('blocks a new group with one course before sending anything', async () => {
    const { calls } = renderPage();
    await screen.findByText('EQ1');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Mã nhóm'), {
      target: { value: 'NEW' },
    });
    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(await screen.findByText('IT005 — Học phần IT005 (3 TC)'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    expect(
      await screen.findByText(GROUP_MEMBERS_MIN_MESSAGE),
    ).toBeInTheDocument();
    expect(calls.some(({ method }) => method === 'POST')).toBe(false);
  });

  it('creates a group of two courses', async () => {
    const { calls } = renderPage({
      onMutation: (url, init) =>
        url === '/api/equivalence-groups' && init.method === 'POST'
          ? json(GROUP, 201)
          : undefined,
    });
    await screen.findByText('EQ1');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Mã nhóm'), {
      target: { value: 'NEW' },
    });
    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(await screen.findByText('IT005 — Học phần IT005 (3 TC)'));
    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(await screen.findByText('IT006 — Học phần IT006 (3 TC)'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    await waitFor(() =>
      expect(calls.find(({ method }) => method === 'POST')?.body).toEqual({
        groupCode: 'NEW',
        note: null,
        courseIds: ['c5', 'c6'],
      }),
    );
  });

  it('offers to merge when the course is already in another group', async () => {
    const message =
      'Học phần đã thuộc một nhóm tương đương khác; hãy gộp hai nhóm: IT005 (nhóm EQ2).';
    const { calls } = renderPage({
      onMutation: (url) =>
        url === '/api/equivalence-groups/g1/members'
          ? json({ code: 'COURSE_ALREADY_GROUPED', message }, 409)
          : url === '/api/equivalence-groups/g1/merge'
            ? json(GROUP)
            : undefined,
    });
    await screen.findByText('EQ1');
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Thêm học phần' })[0],
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(await screen.findByText('IT005 — Học phần IT005 (3 TC)'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Gộp nhóm' }));
    expect(await screen.findByText('Gộp nhóm EQ1')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Nhóm còn lại sẽ bị xóa; các học phần của nó chuyển sang nhóm được giữ/,
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gộp nhóm' }));
    await waitFor(() =>
      expect(
        calls.find(({ url }) => url === '/api/equivalence-groups/g1/merge'),
      ).toMatchObject({ method: 'POST', body: { otherGroupId: 'g2' } }),
    );
  });

  it('asks before dissolving and posts only after confirmation', async () => {
    const { calls } = renderPage({
      onMutation: (url) =>
        url === '/api/equivalence-groups/g1/dissolve'
          ? new Response(null, { status: 204 })
          : undefined,
    });
    await screen.findByText('EQ1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Giải thể' })[0]);
    expect(
      await screen.findByText('Giải thể nhóm EQ1?', {
        selector: '.ant-modal-confirm-title',
      }),
    ).toBeInTheDocument();
    expect(calls.some(({ method }) => method === 'POST')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Giải thể nhóm' }));
    await waitFor(() =>
      expect(
        calls.some(
          ({ url, method }) =>
            url === '/api/equivalence-groups/g1/dissolve' && method === 'POST',
        ),
      ).toBe(true),
    );
  });

  it('shows the server message when removing a member is refused', async () => {
    const message =
      'Nhóm tương đương cần ít nhất 2 học phần; hãy giải thể nhóm nếu không cần nữa.';
    renderPage({
      onMutation: (url, init) =>
        init.method === 'DELETE' &&
        url.startsWith('/api/equivalence-groups/g1/members/')
          ? json({ code: 'GROUP_MIN_MEMBERS', message }, 409)
          : undefined,
    });
    await screen.findByText('EQ1');
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Bỏ khỏi nhóm' }),
    );
    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
