import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coursePloMatrix } from '../testFixtures';
import { json, renderOutcomePage } from '../testRender';
import { CoursePloMatrixPage } from './CoursePloMatrixPage';

const URL = '/api/program-versions/v1/course-plo-matrix';

function renderPage(data = coursePloMatrix()) {
  return renderOutcomePage({
    path: '/programs/:programId/versions/:versionId/course-plo-matrix',
    entry: '/programs/p1/versions/v1/course-plo-matrix',
    element: <CoursePloMatrixPage />,
    reads: { [URL]: data },
    writeResponse: () => json({}),
  });
}

const rowOf = async (code: string) =>
  (await screen.findByText(new RegExp(code))).closest('tr')!;

afterEach(() => vi.unstubAllGlobals());

describe('CoursePloMatrixPage', () => {
  it('prints the weights the Vietnamese way and leaves unmapped cells empty', async () => {
    renderPage();
    const row = await rowOf('IT001');
    expect(row).toHaveTextContent('0,5');
    expect(within(await rowOf('IT002')).queryByText('0,5')).toBeNull();
  });

  it('refuses 1,5 inline and sends nothing (US-046 AC2)', async () => {
    const { writes } = renderPage();
    const row = await rowOf('IT002');
    fireEvent.click(within(row).getAllByLabelText('Nhập trọng số')[0]);
    const input = within(row).getByLabelText('Trọng số');
    fireEvent.change(input, { target: { value: '1,5' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);
    expect(
      await within(row).findByText(/lớn hơn 0, không quá 1/),
    ).toBeInTheDocument();
    expect(writes).toHaveLength(0);
  });

  it('saves 0,75 as 0.75 on Enter', async () => {
    const { writes } = renderPage();
    const row = await rowOf('IT002');
    fireEvent.click(within(row).getAllByLabelText('Nhập trọng số')[0]);
    const input = within(row).getByLabelText('Trọng số');
    fireEvent.change(input, { target: { value: '0,75' } });
    fireEvent.blur(input);
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      method: 'PUT',
      url: '/api/curriculum-items/i2/plo-weights/p-PLO1',
      body: { weight: '0.75' },
    });
  });

  it('asks before clearing a cell that carries CLO links, then deletes it (NT-B3-04)', async () => {
    const { writes } = renderPage();
    const row = await rowOf('IT001');
    fireEvent.click(within(row).getByLabelText('Trọng số 0,5'));
    const input = within(row).getByLabelText('Trọng số');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(
      'Xóa ô này sẽ xóa 2 liên kết CLO–PLO của học phần với PLO này.',
    );
    expect(writes).toHaveLength(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      method: 'DELETE',
      url: '/api/curriculum-items/i1/plo-weights/p-PLO1',
    });
  });

  it('is read-only when the caller cannot edit', async () => {
    renderPage(coursePloMatrix({ canEdit: false, editPath: null }));
    const row = await rowOf('IT001');
    expect(row).toHaveTextContent('0,5');
    expect(within(row).queryByLabelText('Trọng số 0,5')).toBeNull();
    expect(screen.queryAllByLabelText('Nhập trọng số')).toHaveLength(0);
  });
});
