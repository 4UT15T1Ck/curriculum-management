import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RequestDraftBanner } from './RequestDraftBanner';

describe('RequestDraftBanner', () => {
  it('renders nothing for a version or revision that is not a working copy', () => {
    const { container } = render(<RequestDraftBanner request={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('names the request, links to its workbench and shows its status', () => {
    render(
      <MemoryRouter>
        <RequestDraftBanner
          request={{ id: 'r1', requestCode: 'DX-2026-0007', status: 'DRAFT' }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'DX-2026-0007' })).toHaveAttribute(
      'href',
      '/change-requests/r1/edit',
    );
    expect(screen.getByText('Nháp')).toBeInTheDocument();
    expect(
      screen.getByText(/dữ liệu đang áp dụng giữ nguyên/),
    ).toBeInTheDocument();
  });
});
