import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { asciiFileName, sendFile } from './send-file.js';

describe('asciiFileName', () => {
  it('strips Vietnamese marks and the letter đ', () => {
    expect(asciiFileName('Đề cương.pdf')).toBe('De cuong.pdf');
  });

  it('replaces quotes and other non-ASCII characters', () => {
    expect(asciiFileName('a"b\\c漢.pdf')).toBe('a_b_c_.pdf');
  });
});

describe('sendFile', () => {
  it('sets an attachment header with both the ASCII and the UTF-8 name', () => {
    const set = vi.fn();

    sendFile(
      { set } as unknown as Response,
      Uint8Array.from([1]),
      'Đề cương.pdf',
      'application/pdf',
    );

    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="De cuong.pdf"; filename*=UTF-8''${encodeURIComponent('Đề cương.pdf')}`,
    });
  });
});
