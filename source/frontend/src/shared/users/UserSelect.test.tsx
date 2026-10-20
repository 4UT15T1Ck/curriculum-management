import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserSelect } from './UserSelect';
import { USER_SEARCH_DEBOUNCE_MS } from './UserSelect';

describe('UserSelect', () => {
  it('debounces search, queries active users and returns the selected id', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((..._args: [RequestInfo | URL, RequestInit?]) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              {
                id: 'u1',
                username: 'an',
                userCode: 'GV01',
                fullName: 'Nguyễn An',
                email: null,
                orgUnit: null,
                status: 'ACTIVE',
                activeRoleCodes: [],
              },
            ],
            total: 1,
            page: 1,
            pageSize: 20,
          }),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const onChange = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserSelect onChange={onChange} />
      </QueryClientProvider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Nguyễn' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(USER_SEARCH_DEBOUNCE_MS);
    });
    expect(screen.getByText('GV01 — Nguyễn An')).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('q=Nguy%E1%BB%85n&status=ACTIVE'),
      ),
    ).toBe(true);
    fireEvent.click(screen.getByText('GV01 — Nguyễn An'));
    expect(onChange).toHaveBeenCalledWith('u1');
  });
});

describe('UserSelect with a search path', () => {
  it('reads an array of options from the given path and sends only the term', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((..._args: [RequestInfo | URL, RequestInit?]) =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            { id: 'u2', userCode: 'GV02', fullName: 'Trần Bình' },
          ]),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const onChange = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserSelect
          onChange={onChange}
          searchPath="/change-requests/user-options"
        />
      </QueryClientProvider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Bình' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(USER_SEARCH_DEBOUNCE_MS);
    });
    expect(screen.getByText('GV02 — Trần Bình')).toBeInTheDocument();
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(
      urls.some((url) =>
        url.startsWith('/api/change-requests/user-options?q='),
      ),
    ).toBe(true);
    expect(urls.some((url) => url.includes('status='))).toBe(false);
    fireEvent.click(screen.getByText('GV02 — Trần Bình'));
    expect(onChange).toHaveBeenCalledWith('u2');
  });
});
afterEach(() => vi.useRealTimers());
