export const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const ISO_DAY_LENGTH = 10;

export function todayDate(now: Date = new Date()): Date {
  const isoDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
  }).format(now);
  return new Date(`${isoDay}T00:00:00.000Z`);
}

export function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromIsoDay(isoDay: string): Date {
  return new Date(`${isoDay}T00:00:00.000Z`);
}
