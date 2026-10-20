import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { step } from '../testFixtures';
import { renderRequestPage } from '../testRender';
import { ApprovalHistory } from './ApprovalHistory';

const HISTORY = {
  rounds: [
    {
      submissionRound: 2,
      submittedAt: '2026-10-19T05:00:00.000Z',
      steps: [
        step('b1', 1, { approver: { id: 'a', fullName: 'Điều phối An' } }),
      ],
    },
    {
      submissionRound: 1,
      submittedAt: '2026-10-18T05:00:00.000Z',
      steps: [
        step('a1', 1, {
          approver: { id: 'a', fullName: 'Điều phối An' },
          action: 'APPROVE',
          recordedAt: '2026-10-18T06:00:00.000Z',
        }),
        step('a2', 2, {
          approver: { id: 'd', fullName: 'Giám đốc Dũng' },
          action: 'APPROVE',
          isOverride: true,
          kind: 'OVERRIDE',
          performedBy: { id: 'o', fullName: 'Chuyên viên ĐT' },
        }),
        step('a3', 2, {
          approver: { id: 'e', fullName: 'Giám đốc Em' },
          action: 'PENDING',
        }),
      ],
    },
  ],
};

function renderHistory(submissionRound = 2) {
  return renderRequestPage({
    path: '/x',
    entry: '/x',
    element: (
      <ApprovalHistory requestId="r1" submissionRound={submissionRound} />
    ),
    reads: { '/api/change-requests/r1/history': HISTORY },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ApprovalHistory', () => {
  it('stays closed and does not load until opened', () => {
    const { reads } = renderHistory();
    expect(reads.filter((url) => url.includes('/history'))).toEqual([]);
  });

  it('is absent for a request that was never submitted', () => {
    renderHistory(0);
    expect(screen.queryByText('Lịch sử phê duyệt')).toBeNull();
  });

  it('lists the rounds newest first, shows both names of an override and marks a dead row of an earlier round (US-069)', async () => {
    renderHistory();
    fireEvent.click(screen.getByText('Lịch sử phê duyệt'));
    const headers = await screen.findAllByText(/^Lần gửi \d/);
    expect(headers.map((header) => header.textContent?.slice(0, 9))).toEqual([
      'Lần gửi 2',
      'Lần gửi 1',
    ]);
    expect(
      screen.getByText(
        /Người duyệt: Giám đốc Dũng · Thực hiện: Chuyên viên ĐT/,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('không còn hiệu lực')).toHaveLength(1);
  });
});
