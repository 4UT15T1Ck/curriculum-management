import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderRequestPage } from '../testRender';
import { OrganizationalRequestPage } from './OrganizationalRequestPage';

afterEach(() => vi.unstubAllGlobals());

describe('OrganizationalRequestPage', () => {
  it('lets the creator switch between a subject group and a program', async () => {
    renderRequestPage({
      path: '/change-requests/new-organizational',
      entry: '/change-requests/new-organizational',
      element: <OrganizationalRequestPage />,
    });
    expect(
      await screen.findByText('Đề xuất thay đổi tổ chức'),
    ).toBeInTheDocument();
    const toggle = await screen.findByText('Đối tượng thuộc loại');
    expect(toggle).toBeInTheDocument();
    fireEvent.click(screen.getByText('Chương trình đào tạo'));
    expect(screen.getAllByText('Chương trình đào tạo').length).toBeGreaterThan(
      0,
    );
  });
});
