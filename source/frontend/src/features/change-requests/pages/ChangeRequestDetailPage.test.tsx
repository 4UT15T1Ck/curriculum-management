import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTIONS, detail } from '../testFixtures';
import { renderRequestPage } from '../testRender';
import { ChangeRequestDetailPage } from './ChangeRequestDetailPage';

function renderDetail(request: ReturnType<typeof detail>) {
  return renderRequestPage({
    path: '/change-requests/:requestId',
    entry: '/change-requests/r1',
    element: <ChangeRequestDetailPage />,
    reads: {
      '/api/change-requests/r1': request,
      '/api/change-requests/r1/diff': { live: false, sections: [] },
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ChangeRequestDetailPage', () => {
  it('offers no action to a viewer who is not the creator', async () => {
    renderDetail(
      detail({
        permissions: {
          canEdit: false,
          canDelete: false,
          canSubmit: false,
          canWithdraw: false,
          canUpload: false,
        },
      }),
    );
    expect(
      await screen.findByText('DX-2026-0001 — Cập nhật mục tiêu'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rút đề xuất' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Tiếp tục soạn' })).toBeNull();
  });

  it('shows "Tiếp tục soạn" for a draft the viewer can edit, without "Rút"', async () => {
    renderDetail(detail({ permissions: ACTIONS }));
    expect(
      await screen.findByRole('button', { name: 'Tiếp tục soạn' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rút đề xuất' })).toBeNull();
  });

  it('shows "Rút đề xuất" only when withdrawing is allowed', async () => {
    renderDetail(
      detail({
        status: 'PENDING_COORDINATOR',
        permissions: { ...ACTIONS, canEdit: false, canWithdraw: true },
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Rút đề xuất' }),
    ).toBeInTheDocument();
  });
});
