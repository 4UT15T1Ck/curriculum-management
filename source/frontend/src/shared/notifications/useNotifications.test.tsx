import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NOTIFICATION_POLL_MS } from './notificationConstants';
import { useMarkNotificationRead, useUnreadCount } from './useNotifications';

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { Wrapper, client };
}

describe('notification hooks', () => {
  let count: number;
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    count = 2;
    fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify(init?.method === 'POST' ? { id: 'n1' } : { count }),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('polls the unread count every minute (F14-10)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUnreadCount(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data?.count).toBe(2));
    count = 5;
    await act(() => vi.advanceTimersByTimeAsync(NOTIFICATION_POLL_MS + 100));
    await waitFor(() => expect(result.current.data?.count).toBe(5));
  });

  it('refreshes the count after a notification is marked read', async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(
      () => ({ unread: useUnreadCount(), mark: useMarkNotificationRead() }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.unread.data?.count).toBe(2));
    count = 1;
    await act(() => result.current.mark.mutateAsync('n1'));
    await waitFor(() => expect(result.current.unread.data?.count).toBe(1));
  });
});
