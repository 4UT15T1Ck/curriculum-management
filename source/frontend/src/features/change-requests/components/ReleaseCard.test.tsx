import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { RequestRelease } from '../api/changeRequests';
import { ReleaseCard } from './ReleaseCard';

const release = (overrides: Partial<RequestRelease> = {}): RequestRelease =>
  ({
    decisionNumber: '123/QD-DHCN',
    signedDate: '2026-09-01',
    effectiveSemester: { id: 's1', semesterCode: '2026-2027-HK1' },
    pastSemesterAllowed: false,
    versions: [
      {
        id: 'v2',
        programId: 'p1',
        programCode: 'CNTT',
        versionNumber: '1.1',
        status: 'PENDING',
      },
    ],
    ...overrides,
  }) as RequestRelease;

const renderCard = (value: RequestRelease) =>
  render(
    <MemoryRouter>
      <ReleaseCard release={value} />
    </MemoryRouter>,
  );

describe('ReleaseCard', () => {
  it('shows the decision and links each version it made', () => {
    renderCard(release());
    expect(screen.getByText('123/QD-DHCN')).toBeInTheDocument();
    expect(screen.getByText('01/09/2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CNTT/ })).toHaveAttribute(
      'href',
      '/programs/p1/versions/v2',
    );
  });

  it('says so when the request created no version', () => {
    renderCard(release({ versions: [] }));
    expect(
      screen.getByText('Đề xuất không tạo phiên bản mới.'),
    ).toBeInTheDocument();
  });
});
