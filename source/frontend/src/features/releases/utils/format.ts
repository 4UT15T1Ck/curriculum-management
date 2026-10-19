import dayjs from 'dayjs';

export const DATE_FORMAT = 'DD/MM/YYYY';
export const API_DATE_FORMAT = 'YYYY-MM-DD';

// The server sends calendar days ("2026-09-07") and takes them back the same way: no time zone round trip.
export const formatDay = (day: string | null): string =>
  day ? dayjs(day, API_DATE_FORMAT).format(DATE_FORMAT) : '—';
export const formatTimestamp = (value: string | null): string =>
  value ? dayjs(value).format(`${DATE_FORMAT} HH:mm`) : '—';
