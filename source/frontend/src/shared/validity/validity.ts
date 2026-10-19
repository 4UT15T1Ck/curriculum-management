import dayjs from 'dayjs';
import type { components } from '../api/schema';

export type ValidityState = components['schemas']['ValidityState'];
export const DATE_FORMAT = 'DD/MM/YYYY';
export const ISO_DAY_FORMAT = 'YYYY-MM-DD';
export const OPEN_END_LABEL = 'không thời hạn';
export const VALIDITY_STATE_LABELS: Record<ValidityState, string> = {
  ACTIVE: 'Đang hiệu lực',
  SCHEDULED: 'Chưa tới ngày',
  EXPIRED: 'Đã hết hạn',
  REVOKED: 'Đã thu hồi',
};
export const VALIDITY_STATE_COLORS: Record<ValidityState, string> = {
  ACTIVE: 'green',
  SCHEDULED: 'blue',
  EXPIRED: 'default',
  REVOKED: 'red',
};
export function formatPeriod(
  validFrom: string | null,
  validTo: string | null,
): string {
  const from = validFrom ? dayjs(validFrom).format(DATE_FORMAT) : '';
  return `${from} – ${validTo ? dayjs(validTo).format(DATE_FORMAT) : OPEN_END_LABEL}`;
}
