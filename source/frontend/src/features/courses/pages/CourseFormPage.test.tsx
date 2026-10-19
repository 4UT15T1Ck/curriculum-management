import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CREDITS_MESSAGE } from '../schema/courseRules';
import { CourseFormPage } from './CourseFormPage';

const allowed = vi.hoisted(() => new Set<string>());
vi.mock('../../../shared/auth/useCan', () => ({
  useCan: (code: string) => allowed.has(code),
}));
vi.mock('../../../shared/org-units/OrgUnitSelect', () => ({
  OrgUnitSelect: ({
    value,
    onChange,
  }: {
    value?: string | null;
    onChange?: (value: string | null) => void;
  }) => (
    <input
      aria-label="Khoa phụ trách"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value || null)}
    />
  ),
}));

const course = {
  id: 'c1',
  courseCode: 'IT001',
  courseName: 'Nhập môn',
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
const groups = [
  {
    id: 'g1',
    groupCode: 'G1',
    groupName: 'Lập trình',
    status: 'ACTIVE',
    faculty: { id: 'f1', unitCode: 'KHOA_CNTT', unitName: 'Khoa CNTT' },
    activeMemberCount: 1,
    activeCoordinators: [],
    hasActiveCoordinator: false,
  },
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

function renderForm(
  path: string,
  write: () => Response = () => json(course, 201),
  detail: object = course,
) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (init?.method === 'POST' || init?.method === 'PATCH')
      return Promise.resolve(write());
    return Promise.resolve(
      url.includes('/subject-groups')
        ? json(groups)
        : url.startsWith('/api/courses/')
          ? json(detail)
          : json([]),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(
    [
      { path: '/courses/new', element: <CourseFormPage /> },
      { path: '/courses/:courseId/edit', element: <CourseFormPage /> },
      { path: '/courses/:courseId', element: <p>Chi tiết học phần</p> },
    ],
    { initialEntries: [path] },
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

const writes = (fetchMock: ReturnType<typeof renderForm>) =>
  fetchMock.mock.calls.filter(
    ([, init]) => init?.method === 'POST' || init?.method === 'PATCH',
  );

async function pickType(label: string) {
  fireEvent.mouseDown(screen.getByLabelText('Loại học phần'));
  fireEvent.click(await screen.findByText(label));
}

describe('CourseFormPage', () => {
  beforeEach(() => {
    allowed.clear();
    allowed.add('course.edit');
    allowed.add('subjectGroup.view');
  });

  it('names the missing required fields without sending a request', async () => {
    const fetchMock = renderForm('/courses/new');
    fireEvent.click(await screen.findByRole('button', { name: 'Lưu' }));
    expect(
      await screen.findByText('Nhập tên tiếng Việt của học phần.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Chọn loại học phần.')).toBeInTheDocument();
    expect(screen.getByText('Chọn khoa phụ trách.')).toBeInTheDocument();
    expect(writes(fetchMock)).toHaveLength(0);
  });

  it('refuses negative credits and states the valid range', async () => {
    const fetchMock = renderForm('/courses/new');
    fireEvent.change(await screen.findByLabelText('Số tín chỉ'), {
      target: { value: '-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText(CREDITS_MESSAGE)).toBeInTheDocument();
    expect(writes(fetchMock)).toHaveLength(0);
  });

  it('posts credits as a string with the code upper-cased', async () => {
    const fetchMock = renderForm('/courses/new');
    fireEvent.change(await screen.findByLabelText('Mã học phần'), {
      target: { value: 'it002' },
    });
    fireEvent.change(screen.getByLabelText('Tên tiếng Việt'), {
      target: { value: 'Lập trình' },
    });
    fireEvent.change(screen.getByLabelText('Số tín chỉ'), {
      target: { value: '2.5' },
    });
    fireEvent.change(screen.getByLabelText('Khoa phụ trách'), {
      target: { value: 'f1' },
    });
    await pickType('Lý thuyết');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(writes(fetchMock)).toHaveLength(1));
    const [url, init] = writes(fetchMock)[0];
    expect(String(url)).toBe('/api/courses');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      courseCode: 'IT002',
      courseName: 'Lập trình',
      credits: '2.5',
      courseType: 'THEORY',
      ownerFacultyId: 'f1',
    });
    expect(await screen.findByText('Chi tiết học phần')).toBeInTheDocument();
  });

  it('puts a duplicate-code refusal under the code field', async () => {
    renderForm('/courses/new', () =>
      json(
        {
          code: 'COURSE_CODE_TAKEN',
          message: 'Mã học phần đã tồn tại.',
          details: [{ field: 'courseCode', constraints: ['unique'] }],
        },
        409,
      ),
    );
    fireEvent.change(await screen.findByLabelText('Mã học phần'), {
      target: { value: 'IT001' },
    });
    fireEvent.change(screen.getByLabelText('Tên tiếng Việt'), {
      target: { value: 'Trùng' },
    });
    fireEvent.change(screen.getByLabelText('Số tín chỉ'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Khoa phụ trách'), {
      target: { value: 'f1' },
    });
    await pickType('Lý thuyết');
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(
      await screen.findByText('Mã học phần đã tồn tại.'),
    ).toBeInTheDocument();
  });

  it('disables the code in edit mode and patches without a courseCode', async () => {
    const fetchMock = renderForm('/courses/c1/edit', () => json(course));
    const code = await screen.findByLabelText('Mã học phần');
    await waitFor(() => expect(code).toHaveValue('IT001'));
    expect(code).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Số tín chỉ'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(writes(fetchMock)).toHaveLength(1));
    const [url, init] = writes(fetchMock)[0];
    expect(String(url)).toBe('/api/courses/c1');
    expect(init?.method).toBe('PATCH');
    const body = JSON.parse(String(init?.body));
    expect(body).not.toHaveProperty('courseCode');
    expect(body).toMatchObject({ credits: '3', ownerGroupId: 'g1' });
  });

  it('warns before editing a course that programs use, with their semester (US-028 AC1)', async () => {
    renderForm('/courses/c1/edit', undefined, {
      ...course,
      programsUsing: [
        {
          programId: 'p1',
          programCode: '1024034',
          programName: 'Kỹ thuật máy tính',
          versionLabel: null,
          plannedSemester: 3,
        },
      ],
    });
    expect(
      await screen.findByText('Học phần đang được dùng ở các chương trình sau'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '1024034 — Kỹ thuật máy tính' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nháp, học kỳ 3/)).toBeInTheDocument();
  });

  it('says when no program uses the course being edited (US-028 AC2)', async () => {
    renderForm('/courses/c1/edit');
    expect(
      await screen.findByText('Học phần chưa được chương trình nào sử dụng'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Học phần đang được dùng ở các chương trình sau'),
    ).not.toBeInTheDocument();
  });

  it('clears the group when the faculty changes', async () => {
    const fetchMock = renderForm('/courses/c1/edit', () => json(course));
    const faculty = await screen.findByLabelText('Khoa phụ trách');
    await waitFor(() => expect(faculty).toHaveValue('f1'));
    fireEvent.change(faculty, { target: { value: 'f2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(writes(fetchMock)).toHaveLength(1));
    expect(JSON.parse(String(writes(fetchMock)[0][1]?.body))).toMatchObject({
      ownerFacultyId: 'f2',
      ownerGroupId: null,
    });
  });

  it('does not send the group when the caller cannot list groups', async () => {
    allowed.delete('subjectGroup.view');
    const fetchMock = renderForm('/courses/c1/edit', () => json(course));
    const code = await screen.findByLabelText('Mã học phần');
    await waitFor(() => expect(code).toHaveValue('IT001'));
    expect(screen.queryByLabelText('Nhóm phụ trách')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(writes(fetchMock)).toHaveLength(1));
    expect(
      JSON.parse(String(writes(fetchMock)[0][1]?.body)),
    ).not.toHaveProperty('ownerGroupId');
  });
});
