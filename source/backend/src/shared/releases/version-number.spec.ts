import { describe, expect, it } from 'vitest';
import {
  bumpForRequest,
  nextReleaseNumber,
  nextVersionNumber,
  parseVersionNumber,
  VERSION_BUMP,
  VERSION_NUMBER_PATTERN,
} from './version-number.js';

describe('version numbers (BR-24)', () => {
  it('accepts Major.Minor of one to three digits and nothing else', () => {
    for (const ok of ['1.0', '12.34', '999.999']) {
      expect(VERSION_NUMBER_PATTERN.test(ok)).toBe(true);
    }
    for (const bad of [
      '1',
      '1.',
      '.1',
      '1.0.0',
      'v1.0',
      '1.a',
      '1000.0',
      '1.1000',
      '',
    ]) {
      expect(VERSION_NUMBER_PATTERN.test(bad)).toBe(false);
    }
    expect(parseVersionNumber('2.7')).toEqual({ major: 2, minor: 7 });
    expect(() => parseVersionNumber('2')).toThrowError(
      expect.objectContaining({ code: 'VERSION_NUMBER_INVALID' }),
    );
  });

  it('bumps the major (minor back to 0) or the minor', () => {
    expect(nextVersionNumber('1.3', VERSION_BUMP.MAJOR)).toBe('2.0');
    expect(nextVersionNumber('1.3', VERSION_BUMP.MINOR)).toBe('1.4');
  });

  it('refuses a number past three digits instead of writing one the pattern would later reject', () => {
    expect(() => nextVersionNumber('999.0', VERSION_BUMP.MAJOR)).toThrowError(
      expect.objectContaining({ code: 'VERSION_NUMBER_INVALID' }),
    );
    expect(() => nextVersionNumber('1.999', VERSION_BUMP.MINOR)).toThrowError(
      expect.objectContaining({ code: 'VERSION_NUMBER_INVALID' }),
    );
  });

  it('takes a major number for a curriculum or a program-level outcome request, a minor one otherwise', () => {
    const bump = (requestType: never, targetType: never) =>
      bumpForRequest({ requestType, targetType });
    expect(bump('CURRICULUM' as never, 'PROGRAM' as never)).toBe('MAJOR');
    expect(bump('OUTCOME' as never, 'PROGRAM' as never)).toBe('MAJOR');
    expect(bump('OUTCOME' as never, 'COURSE' as never)).toBe('MINOR');
    expect(bump('PROGRAM_INFO' as never, 'PROGRAM' as never)).toBe('MINOR');
    expect(bump('SYLLABUS_CONTENT' as never, 'COURSE' as never)).toBe('MINOR');
  });

  describe('nextReleaseNumber', () => {
    it('numbers a minor release above the highest minor of the base major, numerically', () => {
      expect(
        nextReleaseNumber(
          '1.2',
          ['1.0', '1.2', '1.9', '2.0'],
          VERSION_BUMP.MINOR,
        ),
      ).toBe('1.10');
      expect(
        nextReleaseNumber('1.9', ['1.9', '1.10'], VERSION_BUMP.MINOR),
      ).toBe('1.11');
    });

    it('numbers a major release above the highest major the program holds', () => {
      expect(
        nextReleaseNumber('1.2', ['1.0', '3.1', null], VERSION_BUMP.MAJOR),
      ).toBe('4.0');
    });

    it('counts the base itself and ignores unnumbered rows', () => {
      expect(nextReleaseNumber('1.0', [null, null], VERSION_BUMP.MINOR)).toBe(
        '1.1',
      );
    });
  });
});
