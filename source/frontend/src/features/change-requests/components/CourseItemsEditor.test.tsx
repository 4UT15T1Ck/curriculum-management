import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AuthoredItemInput } from '../api/changeRequests';
import { detail } from '../testFixtures';
import { json, renderRequestPage } from '../testRender';
import { CourseItemsEditor } from './CourseItemsEditor';

const COURSE = {
  id: 'c1',
  courseCode: 'IT3020',
  courseName: 'Cấu trúc dữ liệu',
  englishName: null,
  credits: '3',
  courseType: 'THEORY',
  status: 'ACTIVE',
  ownerFaculty: { id: 'f1', unitCode: 'KHOA_CNTT', unitName: 'Khoa CNTT' },
  ownerGroup: {
    id: 'g1',
    groupCode: 'G1',
    groupName: 'Lập trình',
    status: 'ACTIVE',
  },
};
const REL = (
  id: string,
  source: string,
  target: string,
  minScore: string | null = null,
) => ({
  id,
  relationType: 'PREREQUISITE',
  sourceCourse: {
    id: source === 'IT1' ? 'c9' : 'c1',
    courseCode: source,
    courseName: source,
    status: 'ACTIVE',
  },
  targetCourse: {
    id: target === 'IT3020' ? 'c1' : 'c8',
    courseCode: target,
    courseName: target,
    status: 'ACTIVE',
  },
  minScore,
  editPath: 'VIA_REQUEST',
});

function renderEditor(
  request = detail({
    requestType: 'COURSE_RELATION',
    workspace: null,
    target: {
      targetType: 'COURSE',
      id: 'c1',
      code: 'IT3020',
      name: 'Cấu trúc dữ liệu',
    },
  }),
  writeResponse?: Parameters<typeof renderRequestPage>[0]['writeResponse'],
) {
  return renderRequestPage({
    path: '/x',
    entry: '/x',
    element: <CourseItemsEditor request={request} />,
    reads: {
      '/api/courses/c1': COURSE,
      '/api/courses/c1/relations': [
        REL('r1', 'IT1', 'IT3020', '2'),
        REL('r2', 'IT3020', 'IT4000'),
      ],
      '/api/subject-groups?facultyId=f1&status=ACTIVE': [],
    },
    writeResponse: writeResponse ?? (() => json(request)),
  });
}

const sent = (writes: { body: unknown }[]) =>
  (writes[0].body as { items: AuthoredItemInput[] }).items;

describe('CourseItemsEditor', () => {
  it('sends one SET_COURSE_FIELD for credits 3 to 4 and nothing for the untouched fields', async () => {
    const { writes } = renderEditor();
    fireEvent.change(await screen.findByLabelText('Số tín chỉ'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      method: 'PUT',
      url: '/api/change-requests/r1/items',
    });
    expect(sent(writes)).toEqual([
      { operation: 'SET_COURSE_FIELD', field: 'credits', value: '4' },
    ]);
  });

  it('drops a field set back to its current value and refuses an invalid credits value on the client', async () => {
    const { writes } = renderEditor();
    const credits = await screen.findByLabelText('Số tín chỉ');
    fireEvent.change(credits, { target: { value: '3.00' } });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(sent(writes)).toEqual([]);
    fireEvent.change(credits, { target: { value: 'abc' } });
    expect(
      await screen.findByText(/Số tín chỉ phải là số/),
    ).toBeInTheDocument();
  });

  it('reads each relation from this course side and sends REMOVE_RELATION with its id', async () => {
    const { writes } = renderEditor();
    expect(
      await screen.findByText('Cần đạt tiên quyết học phần IT1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Là học phần tiên quyết của IT4000'),
    ).toBeInTheDocument();
    const row = screen
      .getByText('Cần đạt tiên quyết học phần IT1')
      .closest('tr')!;
    fireEvent.click(within(row).getByRole('button', { name: 'Xóa' }));
    expect(
      within(row).getByText('Xóa', { selector: '.ant-tag' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(sent(writes)).toEqual([
      { operation: 'REMOVE_RELATION', relationId: 'r1' },
    ]);
  });

  it('rebuilds its rows from the saved items on load', async () => {
    renderEditor(
      detail({
        requestType: 'COURSE_RELATION',
        workspace: null,
        target: {
          targetType: 'COURSE',
          id: 'c1',
          code: 'IT3020',
          name: 'CTDL',
        },
        authoredItems: [
          {
            id: 'i1',
            entityType: 'COURSE_FIELD',
            itemKey: 'credits',
            label: 'Số tín chỉ',
            oldValue: { value: '3' },
            newValue: {
              operation: 'SET_COURSE_FIELD',
              field: 'credits',
              value: '5',
            },
          },
          {
            id: 'i2',
            entityType: 'COURSE_RELATION',
            itemKey: 'k',
            label: 'l',
            oldValue: { minScore: '2' },
            newValue: {
              operation: 'UPDATE_RELATION',
              relationId: 'r1',
              minScore: '3',
            },
          },
        ] as never,
      }),
    );
    expect(await screen.findByLabelText('Số tín chỉ')).toHaveValue('5');
    expect(screen.getByText('3', { selector: 'strong' })).toBeInTheDocument();
  });

  it('marks the row of the item the server refused (details.items.N)', async () => {
    renderEditor(undefined, () =>
      json(
        {
          statusCode: 400,
          code: 'ITEM_UNCHANGED',
          message: 'Giá trị mới trùng giá trị hiện tại.',
          details: [{ field: 'items.1', constraints: ['ITEM_UNCHANGED'] }],
        },
        400,
      ),
    );
    fireEvent.change(await screen.findByLabelText('Tên học phần'), {
      target: { value: 'Tên mới' },
    });
    fireEvent.change(screen.getByLabelText('Số tín chỉ'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));
    expect(await screen.findByText(/Một mục bị từ chối/)).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    const marked = rows.filter((row) =>
      row.getAttribute('style')?.includes('background'),
    );
    expect(marked).toHaveLength(1);
    expect(within(marked[0]).getByText('Số tín chỉ')).toBeInTheDocument();
  });

  it('shows no inputs to save with when the viewer cannot edit', async () => {
    renderEditor(
      detail({
        requestType: 'COURSE_RELATION',
        workspace: null,
        target: { targetType: 'COURSE', id: 'c1', code: 'IT3020', name: 'x' },
        permissions: { ...detail().permissions, canEdit: false },
      }),
    );
    await screen.findByLabelText('Số tín chỉ');
    expect(
      screen.queryByRole('button', { name: /Lưu thay đổi/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Số tín chỉ')).toBeDisabled();
  });
});
