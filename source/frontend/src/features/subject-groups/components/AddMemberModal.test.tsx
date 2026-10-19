import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddMemberModal } from './AddMemberModal';
import type { SubjectGroupMember } from '../api/subjectGroupAdmin';

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useSubjectGroupAdmin', () => ({
  useAddMember: () => ({ mutateAsync, isPending: false }),
}));
vi.mock('../../../shared/users/UserSelect', () => ({
  UserSelect: () => <input aria-label="Giảng viên" />,
}));
describe('AddMemberModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({});
  });
  it('offers group members as coordinator candidates and submits ISO dates', async () => {
    const members: SubjectGroupMember[] = [
      {
        id: 'm',
        lecturer: {
          id: 'u1',
          userCode: 'GV01',
          fullName: 'Nguyễn An',
          status: 'ACTIVE',
        },
        memberRole: 'MEMBER',
        validFrom: '2026-01-01',
        validTo: null,
        state: 'ACTIVE',
        assignedBy: null,
        createdAt: '2026-01-01T00:00:00Z',
        revokedAt: null,
        revokedBy: null,
      },
    ];
    render(
      <QueryClientProvider client={new QueryClient()}>
        <App>
          <AddMemberModal
            groupId="g1"
            memberRole="COORDINATOR"
            members={members}
            onClose={vi.fn()}
          />
        </App>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText('Chỉ chọn được thành viên của nhóm'),
    ).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('GV01 — Nguyễn An'));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: 'g1',
        body: expect.objectContaining({
          memberRole: 'COORDINATOR',
          validFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        }),
      }),
    );
  });
});
