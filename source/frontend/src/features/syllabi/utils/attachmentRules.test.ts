import { describe, expect, it } from 'vitest';
import { checkAttachment } from './attachmentRules';

const RULES = {
  maxBytes: 20 * 1024 * 1024,
  fileTypes: ['PDF', 'DOCX', 'XLSX', 'IMAGE'] as const,
};
const MB = 1024 * 1024;

describe('checkAttachment', () => {
  it('refuses an unknown extension and names the types and the size', () => {
    const message = checkAttachment(
      { name: 'virus.exe', size: 10 },
      { ...RULES, fileTypes: [...RULES.fileTypes] },
    );

    expect(message).toContain('PDF, Word, Excel, Ảnh');
    expect(message).toContain('20 MB');
  });

  it('refuses a file over the limit with the same message', () => {
    const message = checkAttachment(
      { name: 'big.pdf', size: 21 * MB },
      { ...RULES, fileTypes: [...RULES.fileTypes] },
    );

    expect(message).toContain('20 MB');
  });

  it('accepts an upper-case extension within the limit', () => {
    expect(
      checkAttachment(
        { name: 'Đề cương.PDF', size: MB },
        { ...RULES, fileTypes: [...RULES.fileTypes] },
      ),
    ).toBeNull();
  });

  it('refuses a name without an extension', () => {
    expect(
      checkAttachment(
        { name: 'noext', size: 1 },
        { ...RULES, fileTypes: [...RULES.fileTypes] },
      ),
    ).not.toBeNull();
  });
});
