import { randomBytes } from 'node:crypto';

export function uniqueSuffix(): string {
  return randomBytes(8).toString('hex').toUpperCase();
}
