import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getJson, sendJson, withQuery } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('parses the error envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'BAD_REQUEST',
            message: 'Lỗi',
            details: [{ property: 'name' }],
          }),
          { status: 400 },
        ),
      ),
    );
    await expect(getJson('/x')).rejects.toMatchObject({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Lỗi',
      details: [{ property: 'name' }],
    });
  });
  it('uses a fallback for non-JSON errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('nope', { status: 502 })),
    );
    try {
      await getJson('/x');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBeUndefined();
      expect((error as Error).message).toContain('502');
    }
  });
  it('returns undefined on 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(sendJson<void>('POST', '/x')).resolves.toBeUndefined();
  });
  it('sends the CSRF header on every request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    await getJson('/x');
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      'X-Requested-With': 'XMLHttpRequest',
    });
  });
  it('returns a body for an accepted error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 503 })),
    );
    await expect(getJson('/health', [503])).resolves.toEqual({ ok: false });
  });
});

describe('withQuery', () => {
  it('writes an array as a repeated key', () => {
    expect(withQuery('/courses', { status: ['ACTIVE', 'DISCONTINUED'] })).toBe(
      '/courses?status=ACTIVE&status=DISCONTINUED',
    );
  });

  it('keeps scalars as they were and skips empty values', () => {
    expect(
      withQuery('/courses', {
        q: 'it',
        page: 2,
        foreign: false,
        empty: '',
        none: undefined,
        nothing: null,
        statuses: [],
      }),
    ).toBe('/courses?q=it&page=2&foreign=false');
  });

  it('returns the bare path when there is nothing to send', () => {
    expect(withQuery('/courses', { status: [] })).toBe('/courses');
  });
});
