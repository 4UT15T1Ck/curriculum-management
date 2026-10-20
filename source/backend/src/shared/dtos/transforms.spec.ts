import type { TransformFnParams } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { toArray } from './transforms.js';

const params = (value: unknown) => ({ value }) as TransformFnParams;

describe('toArray', () => {
  it('wraps a single query value', () => {
    expect(toArray(params('ACTIVE'))).toEqual(['ACTIVE']);
  });

  it('keeps a repeated query key as the array it is', () => {
    expect(toArray(params(['ACTIVE', 'DISCONTINUED']))).toEqual([
      'ACTIVE',
      'DISCONTINUED',
    ]);
  });

  it('leaves an absent key absent', () => {
    expect(toArray(params(undefined))).toBeUndefined();
  });
});
