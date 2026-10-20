import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { programCloPloMatrix } from '../testFixtures';
import { renderOutcomePage } from '../testRender';
import { ProgramCloPloPage } from './ProgramCloPloPage';

function renderPage() {
  return renderOutcomePage({
    path: '/programs/:programId/versions/:versionId/clo-plo-matrix',
    entry: '/programs/p1/versions/v1/clo-plo-matrix',
    element: <ProgramCloPloPage />,
    reads: { '/api/program-versions/v1/clo-plo-matrix': programCloPloMatrix() },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ProgramCloPloPage', () => {
  it('lists every curriculum row with its revision and a link to edit it', async () => {
    renderPage();
    expect(
      await screen.findByText(/IT001 — Nhập môn · đề cương bản 1/),
    ).toBeInTheDocument();
    expect(screen.getByText(/IT002 — Cấu trúc dữ liệu/)).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Xem / sửa' })[0],
    ).toHaveAttribute('href', '/programs/p1/versions/v1/items/i1/clo-plo');
  });

  it('shows the ticks of an opened row', async () => {
    renderPage();
    fireEvent.click(await screen.findByText(/IT001 — Nhập môn/));
    expect(await screen.findByLabelText('CLO1 gắn PLO1')).toBeInTheDocument();
  });

  it('filters by semester', async () => {
    renderPage();
    await screen.findByText(/IT001 — Nhập môn/);
    fireEvent.mouseDown(screen.getByLabelText('Lọc theo học kỳ'));
    fireEvent.click(await screen.findByTitle('Học kỳ 2'));
    expect(screen.queryByText(/IT001 — Nhập môn/)).toBeNull();
    expect(screen.getByText(/IT002 — Cấu trúc dữ liệu/)).toBeInTheDocument();
  });

  it('filters by PLO to the courses that map it', async () => {
    renderPage();
    await screen.findByText(/IT001 — Nhập môn/);
    fireEvent.mouseDown(screen.getByLabelText('Lọc theo PLO'));
    fireEvent.click(await screen.findByTitle('PLO1'));
    expect(screen.queryByText(/IT002 — Cấu trúc dữ liệu/)).toBeNull();
    expect(
      within(document.body).getByText(/IT001 — Nhập môn/),
    ).toBeInTheDocument();
  });
});
