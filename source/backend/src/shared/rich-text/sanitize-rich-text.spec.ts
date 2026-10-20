import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from './sanitize-rich-text.js';

describe('sanitizeRichText', () => {
  it('drops a script element and its content, keeps the rest', () => {
    expect(sanitizeRichText('<script>alert(1)</script><p>x</p>')).toBe(
      '<p>x</p>',
    );
  });

  it('drops an event-handler image entirely', () => {
    expect(sanitizeRichText('<img src=x onerror=alert(1)>')).toBeNull();
  });

  it('removes a javascript: link target and forces safe link attributes', () => {
    const result = sanitizeRichText('<a href="javascript:alert(1)">x</a>');

    expect(result).not.toContain('javascript');
    expect(result).toContain('rel="noopener noreferrer nofollow"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('>x</a>');
  });

  it('keeps an https link and overrides a caller-supplied target', () => {
    const result = sanitizeRichText(
      '<a href="https://example.com" target="_self" onclick="x()">tài liệu</a>',
    );

    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).not.toContain('onclick');
  });

  it('keeps every tag the editor toolbar can produce', () => {
    const html =
      '<h3>a</h3><h4>b</h4><p><strong>b</strong><em>i</em><u>u</u><s>s</s><code>c</code></p>' +
      '<ul><li>x</li></ul><ol><li>y</li></ol><blockquote><p>q</p></blockquote><hr>' +
      '<table><thead><tr><th colspan="2">h</th></tr></thead><tbody><tr><td rowspan="2">c</td></tr></tbody></table>';

    const result = sanitizeRichText(html)!;

    for (const tag of [
      'h3',
      'h4',
      'strong',
      'em',
      'u',
      's',
      'code',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ]) {
      expect(result).toContain(`<${tag}`);
    }
    expect(result).toContain('colspan="2"');
    expect(result).toContain('rowspan="2"');
  });

  it('drops styles and unknown attributes but keeps the text', () => {
    expect(sanitizeRichText('<p style="color:red" class="x">x</p>')).toBe(
      '<p>x</p>',
    );
    expect(sanitizeRichText('<div><span>chữ</span></div>')).toBe('chữ');
  });

  it.each(['<p></p>', '<p>&nbsp;</p>', '<p> </p>', '', '   '])(
    'turns %j into null',
    (html) => {
      expect(sanitizeRichText(html)).toBeNull();
    },
  );

  it('passes null and undefined through as null', () => {
    expect(sanitizeRichText(null)).toBeNull();
    expect(sanitizeRichText(undefined)).toBeNull();
  });

  it('escapes a bare less-than sign', () => {
    expect(sanitizeRichText('<p>a &lt; b</p>')).toBe('<p>a &lt; b</p>');
  });
});
