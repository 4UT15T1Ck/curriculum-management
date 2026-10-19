import { describe, expect, it } from 'vitest';
import { AppException } from '../../shared/exception/app.exception.js';
import { assertCreditsAddUp } from './credits-check.js';

function failure(totals: Parameters<typeof assertCreditsAddUp>[0]) {
  try {
    assertCreditsAddUp(totals);
  } catch (error) {
    return error as AppException;
  }
  return undefined;
}

describe('assertCreditsAddUp', () => {
  it('accepts compulsory plus elective equal to the total', () => {
    expect(
      failure({
        totalCredits: '150',
        compulsoryCredits: '140',
        electiveCredits: '10',
      }),
    ).toBeUndefined();
  });

  it('accepts decimals that add up exactly', () => {
    expect(
      failure({
        totalCredits: '130.5',
        compulsoryCredits: '120.25',
        electiveCredits: '10.25',
      }),
    ).toBeUndefined();
  });

  it('names the gap when the parts fall short of the total (KB-011)', () => {
    const error = failure({
      totalCredits: '150',
      compulsoryCredits: '120',
      electiveCredits: '25',
    });
    expect(error?.code).toBe('CREDITS_MISMATCH');
    expect(error?.message).toContain('chênh lệch 5 tín chỉ');
    expect(error?.details).toEqual([
      { field: 'totalCredits', constraints: ['creditsSum'] },
    ]);
  });

  it('names the gap when the parts exceed the total', () => {
    const error = failure({
      totalCredits: '100',
      compulsoryCredits: '90',
      electiveCredits: '12.5',
    });
    expect(error?.message).toContain('chênh lệch 2.5 tín chỉ');
  });
});
