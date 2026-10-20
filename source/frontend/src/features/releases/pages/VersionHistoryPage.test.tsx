import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderReleasePage, versionRef } from '../testRender';
import { VersionHistoryPage } from './VersionHistoryPage';

function renderPage(versions: ReturnType<typeof versionRef>[]) {
  return renderReleasePage({
    path: '/programs/:programId/versions',
    entry: '/programs/p1/versions',
    element: <VersionHistoryPage />,
    permissions: ['program.view'],
    reads: { '/api/programs/p1/versions': { versions } },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('VersionHistoryPage (MH-46)', () => {
  it('lists each version with its decision, semester, cohorts and origin request, newest first as served', async () => {
    renderPage([
      versionRef({
        id: 'v2',
        versionNumber: '2.0',
        status: 'PENDING',
        originRequest: { id: 'r1', requestCode: 'DX-2026-0001' },
      }),
      versionRef({
        id: 'v1',
        versionNumber: '1.0',
        status: 'HISTORICAL',
        correctedBy: { id: 'v3', versionNumber: '1.1' },
      }),
    ]);

    expect(await screen.findByText('Chờ hiệu lực')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'DX-2026-0001' })).toHaveAttribute(
      'href',
      '/change-requests/r1',
    );
    expect(screen.getByText('Đã được đính chính bởi 1.1')).toBeInTheDocument();
    expect(screen.getAllByText('QĐ-100/2026')).toHaveLength(2);
    const rows = screen.getAllByRole('row').map((row) => row.textContent);
    expect(rows[1]).toContain('2.0');
    expect(rows[2]).toContain('1.0');
  });

  it('sends an issued version to its read-only detail and the Draft to the curriculum it is built in', async () => {
    renderPage([
      versionRef({ id: 'v1', versionNumber: '1.0' }),
      versionRef({
        id: 'd1',
        versionNumber: null,
        status: 'DRAFT',
        decisionNumber: null,
        signedDate: null,
        effectiveSemester: null,
        cohorts: [],
      }),
    ]);

    expect(await screen.findByRole('link', { name: '1.0' })).toHaveAttribute(
      'href',
      '/programs/p1/versions/v1',
    );
    expect(screen.getByRole('link', { name: 'Nháp' })).toHaveAttribute(
      'href',
      '/programs/p1/versions/d1/curriculum',
    );
  });

  it('says so when a program has no version', async () => {
    renderPage([]);

    expect(
      await screen.findByText('Chương trình chưa có phiên bản nào.'),
    ).toBeInTheDocument();
  });
});
