import { describe, expect, it } from 'vitest';
import { FILE_NAME_MAX, uploadedFileName } from './uploaded-file-name.js';

const asMulterSends = (name: string) =>
  Buffer.from(name, 'utf8').toString('latin1');

describe('uploadedFileName', () => {
  it('restores a UTF-8 name that multer read as latin1', () => {
    expect(uploadedFileName(asMulterSends('Đề cương ký.pdf'))).toBe(
      'Đề cương ký.pdf',
    );
  });

  it('keeps only the last path segment', () => {
    expect(uploadedFileName('C:\\x\\a.pdf')).toBe('a.pdf');
    expect(uploadedFileName('../../etc/a.pdf')).toBe('a.pdf');
  });

  it('strips control characters and falls back for an empty name', () => {
    expect(uploadedFileName('a\u0000b.pdf')).toBe('ab.pdf');
    expect(uploadedFileName('   ')).toBe('tep-dinh-kem');
  });

  it('limits the length', () => {
    expect(uploadedFileName(`${'a'.repeat(400)}.pdf`)).toHaveLength(
      FILE_NAME_MAX,
    );
  });
});
