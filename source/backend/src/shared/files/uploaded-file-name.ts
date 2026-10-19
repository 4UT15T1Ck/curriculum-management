export const FILE_NAME_MAX = 255;
// The control characters are exactly what is being stripped.
// oxlint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const UNNAMED_FILE = 'tep-dinh-kem';

// Multer hands over the multipart file name as latin1; UTF-8 names (Vietnamese) need re-decoding.
export function uploadedFileName(originalname: string): string {
  const decoded = Buffer.from(originalname, 'latin1').toString('utf8');
  const base = decoded.replaceAll('\\', '/').split('/').pop() ?? '';
  return (
    base.replace(CONTROL_CHARS, '').trim().slice(0, FILE_NAME_MAX) ||
    UNNAMED_FILE
  );
}
