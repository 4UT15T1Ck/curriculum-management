import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTIONS, detail } from '../testFixtures';
import { json, renderRequestPage } from '../testRender';
import { ApprovalPanel } from './ApprovalPanel';

const REMARK_OK = 'Cần bổ sung minh chứng cho thay đổi.';

function renderPanel(
  permissions: Partial<typeof ACTIONS>,
  writeResponse?: Parameters<typeof renderRequestPage>[0]['writeResponse'],
) {
  const request = detail({
    status: 'PENDING_COORDINATOR',
    submissionRound: 1,
    permissions: { ...ACTIONS, canEdit: false, ...permissions },
  });
  return renderRequestPage({
    path: '/x',
    entry: '/x',
    element: <ApprovalPanel request={request} />,
    writeResponse,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ApprovalPanel', () => {
  it('renders nothing when no decision is open to the viewer (US-062 AC4, US-067 AC1)', async () => {
    renderPanel({});
    await Promise.resolve();
    expect(screen.queryByText('Xử lý đề xuất')).toBeNull();
  });

  it('refuses a reason shorter than 20 characters without sending anything (KB-047)', async () => {
    const { writes } = renderPanel({ canReturn: true, canReject: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Trả lại' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: 'quá ngắn' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(
      await screen.findByText('Lý do cần ít nhất 20 ký tự.'),
    ).toBeInTheDocument();
    expect(writes).toEqual([]);
  });

  it('does not count blanks toward the minimum', async () => {
    const { writes } = renderPanel({ canReturn: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Trả lại' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: `${' '.repeat(25)}ngắn` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(
      await screen.findByText('Lý do cần ít nhất 20 ký tự.'),
    ).toBeInTheDocument();
    expect(writes).toEqual([]);
  });

  it('posts a valid reason to /return, trimmed', async () => {
    const { writes } = renderPanel({ canReturn: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Trả lại' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: `  ${REMARK_OK}  ` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      method: 'POST',
      url: '/api/change-requests/r1/return',
      body: { remark: REMARK_OK },
    });
  });

  it('posts a rejection to /reject', async () => {
    const { writes } = renderPanel({ canReject: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Từ chối' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: REMARK_OK },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() =>
      expect(writes[0]?.url).toBe('/api/change-requests/r1/reject'),
    );
  });

  it('approves after a confirmation', async () => {
    const { writes } = renderPanel({ canApprove: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý' }));
    // The confirmation carries its own "Đồng ý" button.
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Đồng ý' })).toHaveLength(2),
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Đồng ý' })[1]);
    await waitFor(() => expect(writes.length).toBeGreaterThan(0));
    expect(writes[0]).toMatchObject({ url: '/api/change-requests/r1/approve' });
  });

  it('posts the override with its action and reason (US-070)', async () => {
    const { writes } = renderPanel({ canOverride: true });
    fireEvent.click(await screen.findByRole('button', { name: 'Duyệt thay' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: REMARK_OK },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      url: '/api/change-requests/r1/override',
      body: { action: 'APPROVE', reason: REMARK_OK },
    });
  });

  it('shows the server refusal and keeps the dialog open', async () => {
    renderPanel({ canReturn: true }, () =>
      json(
        {
          code: 'NOT_YOUR_STEP',
          message: 'Đề xuất không chờ bạn duyệt ở cấp hiện tại.',
        },
        403,
      ),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Trả lại' }));
    fireEvent.change(await screen.findByLabelText('Lý do'), {
      target: { value: REMARK_OK },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(
      await screen.findByText(/Đề xuất không chờ bạn duyệt/),
    ).toBeInTheDocument();
  });
});
