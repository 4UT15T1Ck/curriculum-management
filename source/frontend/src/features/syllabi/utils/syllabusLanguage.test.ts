import { describe, expect, it } from 'vitest';
import { translated } from './syllabusLanguage';

describe('translated', () => {
  it('falls back to Vietnamese and flags the gap in English mode', () => {
    expect(translated('en', 'Xin chào', null)).toEqual({
      text: 'Xin chào',
      missing: true,
    });
  });

  it('does not flag when both texts are empty', () => {
    expect(translated('en', null, null)).toEqual({
      text: null,
      missing: false,
    });
  });

  it('prefers the English text when there is one', () => {
    expect(translated('en', 'Xin chào', 'Hello')).toEqual({
      text: 'Hello',
      missing: false,
    });
  });

  it('never flags in Vietnamese mode', () => {
    expect(translated('vi', 'Xin chào', null)).toEqual({
      text: 'Xin chào',
      missing: false,
    });
    expect(translated('vi', null, 'Hello')).toEqual({
      text: null,
      missing: false,
    });
  });
});
