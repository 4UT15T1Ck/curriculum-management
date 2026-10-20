import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coverage } from '../testFixtures';
import { renderOutcomePage } from '../testRender';
import { OutcomeCoveragePage } from './OutcomeCoveragePage';

function renderPage(data = coverage()) {
  return renderOutcomePage({
    path: '/programs/:programId/versions/:versionId/outcome-coverage',
    entry: '/programs/p1/versions/v1/outcome-coverage',
    element: <OutcomeCoveragePage />,
    reads: { '/api/program-versions/v1/outcome-coverage': data },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('OutcomeCoveragePage', () => {
  it('lists the three gap kinds and the courses skipped for lack of a syllabus', async () => {
    renderPage();
    expect(await screen.findByText('PLO6')).toBeInTheDocument();
    expect(screen.getByText('CLO2')).toBeInTheDocument();
    expect(screen.getByText('IT002 — Cấu trúc dữ liệu')).toBeInTheDocument();
    expect(
      screen.getByText('Học phần chưa có đề cương (không xét CLO): 1'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Chỉ hiện học phần thuộc nhóm/)).toBeNull();
  });

  it('shows the success state for an empty list and the note for a group filter', async () => {
    renderPage(
      coverage({
        plosWithoutCourse: [],
        closWithoutPlo: [],
        coursesWithoutPlo: [],
        filteredToGroups: true,
      }),
    );
    expect(await screen.findAllByText('Không có thiếu sót')).toHaveLength(3);
    expect(
      screen.getByText('Chỉ hiện học phần thuộc nhóm của bạn'),
    ).toBeInTheDocument();
  });

  it('links a gap to the screen that fixes it', async () => {
    renderPage();
    await screen.findByText('CLO2');
    const hrefs = screen
      .getAllByRole('link', { name: 'Ma trận CLO–PLO' })
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/programs/p1/versions/v1/items/i1/clo-plo');
  });
});
