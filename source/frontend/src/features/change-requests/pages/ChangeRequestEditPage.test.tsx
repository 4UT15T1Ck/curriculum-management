import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTIONS, detail } from '../testFixtures';
import { renderRequestPage } from '../testRender';
import { ChangeRequestEditPage } from './ChangeRequestEditPage';

const DIFF = { live: true, sections: [] };

function renderEdit(request: ReturnType<typeof detail>) {
  return renderRequestPage({
    path: '/change-requests/:requestId/edit',
    entry: '/change-requests/r1/edit',
    element: <ChangeRequestEditPage />,
    reads: {
      '/api/change-requests/r1': request,
      '/api/change-requests/r1/diff': DIFF,
    },
    extraRoutes: [
      { path: '/change-requests/:requestId', element: <p>Trang chi tiết</p> },
    ],
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ChangeRequestEditPage', () => {
  it('sends a viewer who cannot edit to the detail page', async () => {
    renderEdit(detail({ permissions: { ...ACTIONS, canEdit: false } }));
    expect(await screen.findByText('Trang chi tiết')).toBeInTheDocument();
  });

  it('shows the items editor for a course-relation request', async () => {
    renderEdit(detail({ requestType: 'COURSE_RELATION', workspace: null }));
    expect(
      await screen.findByText('DX-2026-0001 — Cập nhật mục tiêu'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Dựa trên/)).not.toBeInTheDocument();
  });

  it('shows the workspace card for a syllabus request', async () => {
    renderEdit(detail());
    expect(
      await screen.findByText('Dựa trên Đề cương bản 3'),
    ).toBeInTheDocument();
  });
});
