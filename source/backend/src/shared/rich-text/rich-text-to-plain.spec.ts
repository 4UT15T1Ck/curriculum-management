import { describe, expect, it } from 'vitest';
import { richTextToPlain } from './rich-text-to-plain.js';

describe('richTextToPlain', () => {
  it('keeps null and turns empty markup into null', () => {
    expect(richTextToPlain(null)).toBeNull();
    expect(richTextToPlain('<p></p>')).toBeNull();
  });

  it('breaks lines at blocks, separates cells and unescapes entities', () => {
    expect(
      richTextToPlain('<p>a &lt; b</p><ul><li>x</li><li>y</li></ul>'),
    ).toBe('a < b\nx\ny');
    expect(
      richTextToPlain('<table><tr><td>1</td><td>2</td></tr></table>'),
    ).toBe('1 | 2 |');
    expect(richTextToPlain('<p>Tom &amp;amp; Jerry</p>')).toBe(
      'Tom &amp; Jerry',
    );
  });
});
