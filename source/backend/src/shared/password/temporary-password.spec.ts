import { describe, expect, it } from 'vitest';
import {
  generateTemporaryPassword,
  TEMPORARY_PASSWORD_LENGTH,
} from './temporary-password.js';

describe('generateTemporaryPassword', () => {
  it('generates 12-character passwords with a letter and digit', () => {
    for (let sample = 0; sample < 1000; sample += 1) {
      const password = generateTemporaryPassword();
      expect(password).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
      expect(password).toMatch(/[a-zA-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[0O1lI]/);
    }
  });
});
