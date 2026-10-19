import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderRequestPage } from '../testRender';
import { CommentsCard } from './CommentsCard';

const COMMENTS = [
  {
    id: 'c1',
    author: { id: 'u2', fullName: 'Trưởng khoa' },
    content: 'Dòng một\nDòng hai',
    createdAt: '2026-10-19T03:00:00.000Z',
  },
];

function renderCard(canComment: boolean) {
  return renderRequestPage({
    path: '/x',
    entry: '/x',
    element: <CommentsCard requestId="r1" canComment={canComment} />,
    reads: { '/api/change-requests/r1/comments': COMMENTS },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('CommentsCard', () => {
  it('lists author, time and text, with no edit or delete control (US-067 AC2, AC3)', async () => {
    renderCard(false);
    expect(await screen.findByText(/Trưởng khoa · /)).toBeInTheDocument();
    expect(screen.getByText(/Dòng một/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sửa|Xóa/ })).toBeNull();
  });

  it('hides the form from a viewer who may not comment', async () => {
    renderCard(false);
    await screen.findByText(/Trưởng khoa/);
    expect(screen.queryByRole('button', { name: 'Gửi bình luận' })).toBeNull();
  });

  it('posts trimmed content and clears the box', async () => {
    const { writes } = renderCard(true);
    const box = await screen.findByLabelText('Nội dung bình luận');
    fireEvent.change(box, { target: { value: '  Cần xem lại mục tiêu.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi bình luận' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      url: '/api/change-requests/r1/comments',
      body: { content: 'Cần xem lại mục tiêu.' },
    });
    // The count wrapper re-renders the field, so it is looked up again.
    await waitFor(() =>
      expect(screen.getByLabelText('Nội dung bình luận')).toHaveValue(''),
    );
  });

  it('refuses a blank comment', async () => {
    const { writes } = renderCard(true);
    fireEvent.change(await screen.findByLabelText('Nội dung bình luận'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi bình luận' }));
    expect(
      await screen.findByText('Nhập nội dung bình luận.'),
    ).toBeInTheDocument();
    expect(writes).toEqual([]);
  });
});
