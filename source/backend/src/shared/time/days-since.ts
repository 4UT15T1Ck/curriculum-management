import { todayDate, toIsoDay } from './today.js';

// Viet Nam has no daylight saving; todayDate() is the local date, this is where that date starts as an instant.
const APP_UTC_OFFSET = '+07:00';

export const MS_PER_DAY = 86_400_000;

// Whole calendar days in the school's time zone, so a request entered at 23:50 shows one day the next morning.
export function daysSince(from: Date, today: Date = todayDate()): number {
  return Math.max(
    0,
    Math.round((today.getTime() - todayDate(from).getTime()) / MS_PER_DAY),
  );
}

export function subtractDays(day: Date, days: number): Date {
  return new Date(day.getTime() - days * MS_PER_DAY);
}

// The instant a local day begins, for comparing a timestamp column with a day.
export function dayStartInstant(day: Date): Date {
  return new Date(`${toIsoDay(day)}T00:00:00${APP_UTC_OFFSET}`);
}

// Requests that have waited `days` calendar days or more entered their level before this instant.
export function waitingBefore(days: number, today: Date = todayDate()): Date {
  return dayStartInstant(subtractDays(today, days - 1));
}
