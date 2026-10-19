import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

export const formatDateTime = (iso: string) =>
  dayjs(iso).format(DATE_TIME_FORMAT);

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * KILOBYTE;

export function formatSize(bytes: number): string {
  if (bytes >= MEGABYTE) return `${(bytes / MEGABYTE).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / KILOBYTE))} KB`;
}
