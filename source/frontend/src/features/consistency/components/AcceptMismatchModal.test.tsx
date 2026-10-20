import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from 'antd';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AcceptMismatchModal } from './AcceptMismatchModal';

const GAP = { compulsory: '-2', elective: '0', total: '-2' };

function renderModal(response: Response | null = null) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(response ?? new Response('{}', { status: 200 })),
  );
  vi.stubGlobal('fetch', fetchMock);
  const onClose = vi.fn();
  const onStale = vi.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <App>
        <AcceptMismatchModal
          versionId="v1"
          gap={GAP}
          onClose={onClose}
          onStale={onStale}
        />
      </App>
    </QueryClientProvider>,
  );
  return { fetchMock, onClose, onStale };
}

const submit = () =>
  fireEvent.click(screen.getByRole('button', { name: /Chấp nhận$/ }));

afterEach(() => vi.unstubAllGlobals());

describe('AcceptMismatchModal', () => {
  it('refuses an empty or spaces-only reason without a request', async () => {
    const { fetchMock } = renderModal();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    submit();
    expect(
      await screen.findByText('Nhập lý do chấp nhận chênh lệch.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the gaps it showed with the reason', async () => {
    const { fetchMock, onClose } = renderModal();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Theo quyết định' },
    });
    submit();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('/api/program-versions/v1/credit-mismatch-acceptance');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({
      reason: 'Theo quyết định',
      compulsoryGap: '-2',
      electiveGap: '0',
    });
  });

  it('says so and asks the page to recompute when the gaps moved', async () => {
    const { onStale, onClose } = renderModal(
      new Response(
        JSON.stringify({
          code: 'CREDIT_GAP_CHANGED',
          message: 'Chênh lệch tín chỉ đã thay đổi; chạy lại.',
        }),
        { status: 409 },
      ),
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
    submit();
    expect(
      await screen.findByText('Chênh lệch tín chỉ đã thay đổi; chạy lại.'),
    ).toBeInTheDocument();
    expect(onStale).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
