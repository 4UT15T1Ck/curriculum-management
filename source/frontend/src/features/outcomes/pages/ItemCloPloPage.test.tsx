import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { itemCloPloMatrix } from '../testFixtures';
import { json, renderOutcomePage } from '../testRender';
import { ItemCloPloPage } from './ItemCloPloPage';

const URL = '/api/curriculum-items/i1/clo-plo-matrix';

function renderPage(
  data = itemCloPloMatrix(),
  writeResponse?: Parameters<typeof renderOutcomePage>[0]['writeResponse'],
) {
  return renderOutcomePage({
    path: '/programs/:programId/versions/:versionId/items/:itemId/clo-plo',
    entry: '/programs/p1/versions/v1/items/i1/clo-plo',
    element: <ItemCloPloPage />,
    reads: { [URL]: data },
    writeResponse,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ItemCloPloPage', () => {
  it('disables the columns the course does not map (US-044 AC3)', async () => {
    renderPage();
    const mapped = await screen.findByLabelText('CLO1 – PLO1');
    expect(mapped).toBeEnabled();
    expect(screen.getByLabelText('CLO1 – PLO2')).toBeDisabled();
  });

  it('saves the whole set of ticked pairs', async () => {
    const { writes } = renderPage(
      itemCloPloMatrix({ links: [{ cloId: 'c-CLO1', ploId: 'p-PLO1' }] }),
    );
    const save = await screen.findByRole('button', { name: 'Lưu' });
    expect(save).toBeDisabled();
    fireEvent.click(screen.getByLabelText('CLO2 – PLO1'));
    expect(save).toBeEnabled();
    fireEvent.click(save);
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      method: 'PUT',
      url: '/api/curriculum-items/i1/clo-plo-links',
      body: {
        links: [
          { cloId: 'c-CLO1', ploId: 'p-PLO1' },
          { cloId: 'c-CLO2', ploId: 'p-PLO1' },
        ],
      },
    });
  });

  it('shows the server message when a PLO is no longer mapped', async () => {
    const { writes } = renderPage(itemCloPloMatrix(), () =>
      json(
        {
          code: 'PLO_NOT_MAPPED_TO_COURSE',
          message:
            'Học phần chưa gắn PLO này trong ma trận học phần–PLO; gắn ở đó trước.',
        },
        409,
      ),
    );
    fireEvent.click(await screen.findByLabelText('CLO1 – PLO1'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(
      await screen.findByText(/Học phần chưa gắn PLO này trong ma trận/),
    ).toBeInTheDocument();
    expect(writes).toHaveLength(1);
  });

  it('offers no ticks to a viewer', async () => {
    renderPage(itemCloPloMatrix({ canEdit: false, editPath: null }));
    expect(await screen.findByLabelText('CLO1 – PLO1')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Lưu' })).toBeNull();
  });

  it('points to the syllabus when the course has none', async () => {
    renderPage(itemCloPloMatrix({ revision: null, clos: [], canEdit: false }));
    expect(
      await screen.findByText('Học phần chưa có đề cương'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mở đề cương' })).toHaveAttribute(
      'href',
      '/courses/c1/syllabus',
    );
  });
});
