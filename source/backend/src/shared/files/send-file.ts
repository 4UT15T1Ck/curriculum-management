import type { Readable } from 'node:stream';
import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';

const NON_ASCII = /[^\x20-\x7e]|["\\]/g;
const ASCII_FALLBACK_CHAR = '_';

// RFC 5987 so Vietnamese file names survive the header; the ASCII name is for old clients.
export function sendFile(
  res: Response,
  body: Uint8Array | Readable,
  fileName: string,
  mime: string,
): StreamableFile {
  res.set({
    'Content-Type': mime,
    'Content-Disposition': `attachment; filename="${asciiFileName(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
  });
  return body instanceof Uint8Array
    ? new StreamableFile(body)
    : new StreamableFile(body);
}

export function asciiFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, (letter) => (letter === 'đ' ? 'd' : 'D'))
    .replace(NON_ASCII, ASCII_FALLBACK_CHAR);
}
