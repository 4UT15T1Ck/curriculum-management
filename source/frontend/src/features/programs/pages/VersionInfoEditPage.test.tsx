import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderRequestPage } from '../../change-requests/testRender';
import { VersionInfoEditPage } from './VersionInfoEditPage';

const INFO = {
  id: 'v7',
  versionNumber: null,
  status: 'DRAFT',
  programName: 'Kỹ thuật máy tính',
  majorCode: '7480106',
  majorName: 'Kỹ thuật máy tính',
  semesterCount: 8,
  totalCredits: '150',
  compulsoryCredits: '140',
  electiveCredits: '10',
  updatedAt: '2026-10-19T03:00:00.000Z',
  program: { id: 'p1', programCode: '1024034', degreeLevel: 'BACHELOR' },
  sourceRequest: { id: 'r1', requestCode: 'DX-2026-0001', status: 'DRAFT' },
  canEdit: true,
};

function renderInfo(info: unknown) {
  return renderRequestPage({
    path: '/programs/:programId/versions/:versionId/info',
    entry: '/programs/p1/versions/v7/info',
    element: <VersionInfoEditPage />,
    reads: { '/api/program-versions/v7/info': info },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('VersionInfoEditPage', () => {
  it('is read-only when the viewer cannot edit the version', async () => {
    renderInfo({ ...INFO, canEdit: false });
    expect(await screen.findByText('7480106')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu' })).toBeNull();
  });

  it('shows the credit gap while typing', async () => {
    renderInfo(INFO);
    const elective = await screen.findByLabelText('Tín chỉ tự chọn');
    fireEvent.change(elective, { target: { value: '25' } });
    expect(
      await screen.findByText('Chênh lệch 15 tín chỉ.'),
    ).toBeInTheDocument();
  });
});
