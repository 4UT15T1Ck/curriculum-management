import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
const DATE_FORMAT = 'DD/MM/YYYY';

export const formatDateTime = (iso: string) =>
  dayjs(iso).format(DATE_TIME_FORMAT);
export const formatDate = (iso: string) => dayjs(iso).format(DATE_FORMAT);
