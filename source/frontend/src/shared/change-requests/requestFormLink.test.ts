import { describe, expect, it } from 'vitest';
import { requestFormLink } from './requestFormLink';

describe('requestFormLink', () => {
  it('carries the type, target kind and target id as encoded query parameters', () => {
    const link = requestFormLink({
      type: 'CURRICULUM',
      targetType: 'PROGRAM',
      targetId: 'p 1&x',
    });
    const url = new URL(link, 'http://localhost');
    expect(url.pathname).toBe('/change-requests/new');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      type: 'CURRICULUM',
      targetType: 'PROGRAM',
      targetId: 'p 1&x',
    });
  });
});
