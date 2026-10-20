import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  COURSE_SELECT_DEBOUNCE_MS,
  CourseMultiSelect,
  CourseSelect,
} from './CourseSelect';

const page = (codes: string[]) =>
  new Response(
    JSON.stringify({
      items: codes.map((code) => ({
        id: code.toLowerCase(),
        courseCode: code,
        courseName: `Học phần ${code}`,
        credits: '3',
        status: 'ACTIVE',
      })),
      total: codes.length,
      page: 1,
      pageSize: 20,
    }),
  );

function setup(ui: React.ReactElement) {
  vi.useFakeTimers();
  const fetchMock = vi.fn((_input: RequestInfo | URL) =>
    Promise.resolve(page(['IT001', 'IT002'])),
  );
  vi.stubGlobal('fetch', fetchMock);
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {ui}
    </QueryClientProvider>,
  );
  return fetchMock;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('CourseSelect', () => {
  it('debounces the search, asks for active courses and returns the chosen id', async () => {
    const onChange = vi.fn();
    const fetchMock = setup(<CourseSelect onChange={onChange} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'IT' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COURSE_SELECT_DEBOUNCE_MS);
    });
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('q=IT&pageSize=20&status=ACTIVE'),
      ),
    ).toBe(true);
    fireEvent.click(screen.getByText('IT002 — Học phần IT002 (3 TC)'));
    expect(onChange).toHaveBeenCalledWith('it002');
  });

  it('leaves out the excluded courses', async () => {
    setup(<CourseSelect excludeIds={['it001']} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(
      screen.queryByText('IT001 — Học phần IT001 (3 TC)'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('IT002 — Học phần IT002 (3 TC)'),
    ).toBeInTheDocument();
  });
});

describe('CourseMultiSelect', () => {
  it('returns every chosen id', async () => {
    const onChange = vi.fn();
    setup(<CourseMultiSelect onChange={onChange} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('IT001 — Học phần IT001 (3 TC)'));
    expect(onChange).toHaveBeenCalledWith(['it001']);
  });
});
