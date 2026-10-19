import { randomInt } from 'node:crypto';

export const TEMPORARY_PASSWORD_LENGTH = 12;
const LETTERS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALPHABET = LETTERS + DIGITS;

export function generateTemporaryPassword(): string {
  const chars = [pick(LETTERS), pick(DIGITS)];
  while (chars.length < TEMPORARY_PASSWORD_LENGTH) {
    chars.push(pick(ALPHABET));
  }
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    [chars[index], chars[swap]] = [chars[swap], chars[index]];
  }
  return chars.join('');
}

function pick(source: string): string {
  return source[randomInt(source.length)];
}
