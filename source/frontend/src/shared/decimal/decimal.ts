// Credits and thresholds travel as decimal strings (at most two decimals); adding them as floats would turn 2.5 + 3.5
// into something other than 6. Everything here works in hundredths, as integers.
const HUNDREDTHS = 100;
const DECIMAL_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;

export function toHundredths(value: string): number {
  const match = DECIMAL_PATTERN.exec(value.trim());
  if (!match) return Number.NaN;
  const [, whole, fraction = ''] = match;
  return Number(whole) * HUNDREDTHS + Number(fraction.padEnd(2, '0'));
}

export function fromHundredths(value: number): string {
  const whole = Math.trunc(value / HUNDREDTHS);
  const fraction = value % HUNDREDTHS;
  if (fraction === 0) return String(whole);
  const text = String(fraction).padStart(2, '0').replace(/0$/, '');
  return `${whole}.${text}`;
}

export function sumDecimals(values: readonly string[]): string {
  return fromHundredths(
    values.reduce((total, value) => total + toHundredths(value), 0),
  );
}

// Negative when left < right, zero when equal.
export function compareDecimals(left: string, right: string): number {
  return toHundredths(left) - toHundredths(right);
}
