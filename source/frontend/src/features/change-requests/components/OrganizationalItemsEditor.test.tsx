import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AuthoredItemInput } from '../api/changeRequests';
import { ME, detail } from '../testFixtures';
import { json, renderRequestPage } from '../testRender';
import { OrganizationalItemsEditor } from './OrganizationalItemsEditor';

const GROUP = {
  id: 'g1',
  groupCode: 'G1',
  groupName: 'Lập trình',
  members: [
    {
      id: 'm1',
      lecturer: {
        id: 'l1',
        userCode: 'GV1',
        fullName: 'Nguyễn An',
        status: 'ACTIVE',
      },
      memberRole: 'MEMBER',
      validFrom: '2026-01-01',
      validTo: null,
      state: 'ACTIVE',
    },
    {
      id: 'm2',
      lecturer: {
        id: 'l2',
        userCode: 'GV2',
        fullName: 'Trần Bình',
        status: 'ACTIVE',
      },
      memberRole: 'COORDINATOR',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      state: 'EXPIRED',
    },
  ],
};
const groupRequest = detail({
  requestType: 'ORGANIZATION',
  workspace: null,
  target: {
    targetType: 'SUBJECT_GROUP',
    id: 'g1',
    code: 'G1',
    name: 'Lập trình',
  },
});
const USERS = [{ id: 'u9', userCode: 'GV9', fullName: 'Lê Chi' }];

function renderEditor(request = groupRequest) {
  return renderRequestPage({
    path: '/x',
    entry: '/x',
    element: <OrganizationalItemsEditor request={request} />,
    me: {
      ...ME,
      permissions: [...ME.permissions, 'changeRequest.createOrganizational'],
    },
    reads: {
      '/api/subject-groups/g1': GROUP,
      '/api/programs/p1/directors': [
        {
          id: 'd1',
          director: { id: 'u5', fullName: 'Phạm Dũng' },
          validFrom: '2026-01-01',
          validTo: null,
          state: 'ACTIVE',
        },
      ],
      '/api/change-requests/user-options': USERS,
    },
    writeResponse: () => json(request),
  });
}

const sent = (writes: { body: unknown }[]) =>
  (writes[0].body as { items: AuthoredItemInput[] }).items;

describe('OrganizationalItemsEditor', () => {
  it('lists the live members only and sends END_MEMBERSHIP with a date string', async () => {
    const { writes } = renderEditor();
    expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
    expect(screen.queryByText('Trần Bình')).not.toBeInTheDocument();
    const row = screen.getByText('Nguyễn An').closest('tr')!;
    fireEvent.click(within(row).getByRole('button', { name: 'Kết thúc' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý' }));
    await waitFor(() =>
      expect(
        within(row).getByText(/Kết thúc \d{2}\/\d{2}\/\d{4}/),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(sent(writes)).toEqual([
      {
        operation: 'END_MEMBERSHIP',
        memberRowId: 'm1',
        validTo: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      },
    ]);
  });

  it('adds a coordinator picked from the user-options search with ADD_MEMBER and date strings', async () => {
    const { writes, reads } = renderEditor();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Thêm thành viên' }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.mouseDown(within(dialog).getAllByRole('combobox')[0]);
    fireEvent.click(await screen.findByText('GV9 — Lê Chi'));
    fireEvent.mouseDown(within(dialog).getAllByRole('combobox')[1]);
    fireEvent.click(
      await screen.findByText('Điều phối', {
        selector: '.ant-select-item-option-content',
      }),
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    await waitFor(() =>
      expect(screen.getByText('GV9 — Lê Chi')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(sent(writes)).toEqual([
      {
        operation: 'ADD_MEMBER',
        lecturerId: 'u9',
        memberRole: 'COORDINATOR',
        validFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        validTo: null,
      },
    ]);
    expect(
      reads.some((url) => url.startsWith('/api/change-requests/user-options')),
    ).toBe(true);
  });

  it('shows the directors of a program target and ends one with END_DIRECTOR', async () => {
    const { writes } = renderEditor(
      detail({
        requestType: 'ORGANIZATION',
        workspace: null,
        target: {
          targetType: 'PROGRAM',
          id: 'p1',
          code: '1024034',
          name: 'KTMT',
        },
      }),
    );
    expect(await screen.findByText('Phạm Dũng')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thêm thành viên' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Phân công Giám đốc CTĐT' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kết thúc' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Lưu thay đổi' }),
    );
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(sent(writes)[0]).toMatchObject({
      operation: 'END_DIRECTOR',
      assignmentId: 'd1',
    });
  });

  it('rebuilds additions from the saved items and offers no editing when the viewer cannot edit', async () => {
    renderEditor(
      detail({
        ...groupRequest,
        permissions: { ...detail().permissions, canEdit: false },
        authoredItems: [
          {
            id: 'i1',
            entityType: 'ORG_MEMBERSHIP',
            itemKey: 'k',
            label: 'Thêm Lê Chi — Thành viên, từ 01/11/2026',
            oldValue: null,
            newValue: {
              operation: 'ADD_MEMBER',
              lecturerId: 'u9',
              memberRole: 'MEMBER',
              validFrom: '2026-11-01',
              validTo: null,
            },
          },
        ] as never,
      }),
    );
    expect(
      await screen.findByText('Thêm Lê Chi — Thành viên, từ 01/11/2026'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Lưu thay đổi' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Kết thúc' }),
    ).not.toBeInTheDocument();
  });
});
