import { PasswordService } from './password.service.js';
import { PASSWORD_PATTERN } from './password-policy.js';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes passwords with Argon2id', async () => {
    const password = 'secure-pass1';
    const hash = await service.hash(password);
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).not.toContain(password);
  });

  it('verifies correct and incorrect passwords', async () => {
    const hash = await service.hash('secure-pass1');
    await expect(service.verify(hash, 'secure-pass1')).resolves.toBe(true);
    await expect(service.verify(hash, 'wrong-pass2')).resolves.toBe(false);
  });

  it('verifies unknown accounts against the dummy hash', async () => {
    await expect(service.verifyAgainstDummy('candidate1')).resolves.toBe(false);
  });

  it('requires a letter and a digit', () => {
    expect(PASSWORD_PATTERN.test('abcdefgh')).toBe(false);
    expect(PASSWORD_PATTERN.test('12345678')).toBe(false);
    expect(PASSWORD_PATTERN.test('abc12345')).toBe(true);
    expect(PASSWORD_PATTERN.test('mậtkhẩu1')).toBe(true);
  });
});
