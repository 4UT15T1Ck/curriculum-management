import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { json, renderReleasePage, versionDetail } from '../testRender';
import { CorrectionPage } from './CorrectionPage';

const DRAFT = versionDetail({
  id: 'd1',
  status: 'DRAFT',
  versionNumber: null,
  isCorrectionDraft: true,
  correctionOf: { id: 'v1', versionNumber: '1.0' },
});

function renderPage(
  writeResponse?: Parameters<typeof renderReleasePage>[0]['writeResponse'],
) {
  return renderReleasePage({
    path: '/programs/:programId/versions/:versionId/corrections/:correctionId',
    entry: '/programs/p1/versions/v1/corrections/d1',
    element: <CorrectionPage />,
    permissions: ['version.correct'],
    reads: { '/api/programs/p1/versions/d1': DRAFT },
    writeResponse,
    extraRoutes: [
      {
        path: '/programs/:programId/versions/:versionId',
        element: <p>Chi tiết phiên bản</p>,
      },
    ],
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('CorrectionPage (MH-49)', () => {
  it("links the screens that edit the Draft with the Draft's own version id, and never creates a Draft on its own", async () => {
    const { writes } = renderPage();

    expect(
      await screen.findByRole('link', { name: 'Khung chương trình' }),
    ).toHaveAttribute('href', '/programs/p1/versions/d1/curriculum');
    expect(
      screen.getByRole('link', { name: 'Thông tin chương trình' }),
    ).toHaveAttribute('href', '/programs/p1/versions/d1/info');
    expect(writes).toEqual([]);
  });

  it('keeps the cohort move on by default and refuses an empty reason without sending anything', async () => {
    const { writes } = renderPage();

    expect(
      await screen.findByRole('checkbox', {
        name: /Chuyển các khóa đang áp dụng/,
      }),
    ).toBeChecked();
    fireEvent.click(
      screen.getByRole('button', { name: 'Ban hành đính chính' }),
    );

    expect(
      await screen.findByText('Nhập lý do đính chính.'),
    ).toBeInTheDocument();
    expect(writes).toEqual([]);
  });

  it('issues with the reason and the cohort choice after a confirmation, then opens the issued version', async () => {
    const { writes } = renderPage(() =>
      json(versionDetail({ id: 'd1', versionNumber: '1.1' }), 201),
    );

    fireEvent.change(await screen.findByLabelText('Lý do đính chính'), {
      target: { value: 'Sai mã học phần IT001' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Chuyển các khóa/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Ban hành đính chính' }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ban hành' }));

    expect(await screen.findByText('Chi tiết phiên bản')).toBeInTheDocument();
    expect(writes).toEqual([
      {
        method: 'POST',
        url: '/api/programs/p1/versions/v1/corrections/d1/issue',
        body: { reason: 'Sai mã học phần IT001', moveCohorts: false },
      },
    ]);
  });

  it('discards the Draft and goes back to the version', async () => {
    const { writes } = renderPage(() => new Response(null, { status: 204 }));

    fireEvent.click(
      await screen.findByRole('button', { name: 'Hủy bản nháp' }),
    );
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Hủy bản nháp' }).length,
      ).toBeGreaterThan(1),
    );
    const buttons = screen.getAllByRole('button', { name: 'Hủy bản nháp' });
    fireEvent.click(buttons[buttons.length - 1]);

    expect(await screen.findByText('Chi tiết phiên bản')).toBeInTheDocument();
    expect(writes).toEqual([
      {
        method: 'DELETE',
        url: '/api/programs/p1/versions/v1/corrections/d1',
        body: undefined,
      },
    ]);
  });

  it('says so when the Draft is gone (issued or discarded elsewhere)', async () => {
    renderReleasePage({
      path: '/programs/:programId/versions/:versionId/corrections/:correctionId',
      entry: '/programs/p1/versions/v1/corrections/zzz',
      element: <CorrectionPage />,
      permissions: ['version.correct'],
    });

    await waitFor(() =>
      expect(
        screen.getByText(/Không tìm thấy bản nháp đính chính/),
      ).toBeInTheDocument(),
    );
  });
});
