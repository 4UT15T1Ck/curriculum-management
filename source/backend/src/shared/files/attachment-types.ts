import path from 'node:path';
import { AttachmentFileType } from '../../generated/prisma/client.js';

export const BYTES_PER_MB = 1024 * 1024;

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

export interface AttachmentTypeSpec {
  type: AttachmentFileType;
  extension: string;
  mime: string;
  signature: readonly number[];
}

// DOCX and XLSX are ZIP containers, so their signature only proves "ZIP"; the extension picks the type.
export const ATTACHMENT_TYPE_SPECS: readonly AttachmentTypeSpec[] = [
  {
    type: AttachmentFileType.PDF,
    extension: '.pdf',
    mime: 'application/pdf',
    signature: PDF_SIGNATURE,
  },
  {
    type: AttachmentFileType.DOCX,
    extension: '.docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    signature: ZIP_SIGNATURE,
  },
  {
    type: AttachmentFileType.XLSX,
    extension: '.xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    signature: ZIP_SIGNATURE,
  },
  {
    type: AttachmentFileType.IMAGE,
    extension: '.png',
    mime: 'image/png',
    signature: PNG_SIGNATURE,
  },
  {
    type: AttachmentFileType.IMAGE,
    extension: '.jpg',
    mime: 'image/jpeg',
    signature: JPEG_SIGNATURE,
  },
  {
    type: AttachmentFileType.IMAGE,
    extension: '.jpeg',
    mime: 'image/jpeg',
    signature: JPEG_SIGNATURE,
  },
];

export const ATTACHMENT_FILE_TYPES: AttachmentFileType[] = [
  ...new Set(ATTACHMENT_TYPE_SPECS.map((spec) => spec.type)),
];
export const ATTACHMENT_MIMES: string[] = [
  ...new Set(ATTACHMENT_TYPE_SPECS.map((spec) => spec.mime)),
];
export const OCTET_STREAM = 'application/octet-stream';

// The extension picks the spec; the first bytes must then match it (a renamed executable fails).
export function detectAttachmentType(
  fileName: string,
  content: Uint8Array,
): AttachmentTypeSpec | null {
  const extension = path.extname(fileName).toLowerCase();
  const spec = ATTACHMENT_TYPE_SPECS.find(
    (candidate) => candidate.extension === extension,
  );
  if (!spec) {
    return null;
  }
  return spec.signature.every((byte, index) => content[index] === byte)
    ? spec
    : null;
}

export function mimeForPath(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  return (
    ATTACHMENT_TYPE_SPECS.find((spec) => spec.extension === extension)?.mime ??
    OCTET_STREAM
  );
}
