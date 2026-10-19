import { describe, expect, it } from 'vitest';
import { AttachmentFileType } from '../../generated/prisma/client.js';
import {
  detectAttachmentType,
  mimeForPath,
  OCTET_STREAM,
} from './attachment-types.js';

const PDF = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const ZIP = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0x14]);
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
const EXE = Uint8Array.from([0x4d, 0x5a, 0x90, 0x00]);

describe('detectAttachmentType', () => {
  it('accepts PDF bytes named .pdf', () => {
    expect(detectAttachmentType('a.pdf', PDF)?.type).toBe(
      AttachmentFileType.PDF,
    );
  });

  it('refuses PDF bytes named .docx', () => {
    expect(detectAttachmentType('a.docx', PDF)).toBeNull();
  });

  it('lets the extension pick Word or Excel for a ZIP container', () => {
    expect(detectAttachmentType('a.docx', ZIP)?.type).toBe(
      AttachmentFileType.DOCX,
    );
    expect(detectAttachmentType('a.xlsx', ZIP)?.type).toBe(
      AttachmentFileType.XLSX,
    );
  });

  it('refuses an executable under any allowed name, and unknown extensions', () => {
    expect(detectAttachmentType('a.pdf', EXE)).toBeNull();
    expect(detectAttachmentType('a.exe', EXE)).toBeNull();
    expect(detectAttachmentType('noextension', PDF)).toBeNull();
  });

  it('ignores the case of the extension and accepts images', () => {
    expect(detectAttachmentType('SCAN.JPG', JPEG)?.type).toBe(
      AttachmentFileType.IMAGE,
    );
    expect(detectAttachmentType('a.png', PNG)?.mime).toBe('image/png');
  });

  it('refuses a file shorter than its signature', () => {
    expect(detectAttachmentType('a.png', Uint8Array.from([0x89]))).toBeNull();
  });
});

describe('mimeForPath', () => {
  it('maps a stored path to its type and falls back to octet-stream', () => {
    expect(mimeForPath('syllabi/s1/x.pdf')).toBe('application/pdf');
    expect(mimeForPath('syllabi/s1/x.bin')).toBe(OCTET_STREAM);
  });
});
