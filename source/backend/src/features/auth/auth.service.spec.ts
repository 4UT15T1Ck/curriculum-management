import { UserStatus } from '../../generated/prisma/client.js';
import type { AuthenticatedUser } from '../../shared/auth/authenticated-user.js';
import type { PasswordService } from '../../shared/password/password.service.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { AUTH_ERRORS } from './auth.errors.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findUnique = vi.fn();
  const update = vi.fn();
  const verify = vi.fn();
  const verifyAgainstDummy = vi.fn();
  const hash = vi.fn();
  const service = new AuthService(
    { user: { findUnique, update } } as unknown as PrismaService,
    { verify, verifyAgainstDummy, hash } as unknown as PasswordService,
  );
  const user = {
    id: 'id',
    username: 'gv01',
    userCode: 'GV01',
    fullName: 'Nguyễn Văn A',
    email: null,
    status: UserStatus.ACTIVE,
    mustChangePassword: false,
    passwordHash: 'hash',
  };

  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    verify.mockReset();
    verifyAgainstDummy.mockReset();
    hash.mockReset();
  });

  it('uses dummy verification and generic credentials error for unknown usernames', async () => {
    findUnique.mockResolvedValue(null);
    verifyAgainstDummy.mockResolvedValue(false);
    await expect(
      service.login({ username: 'absent', password: 'bad' }, '127.0.0.1'),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.INVALID_CREDENTIALS.code });
    expect(verifyAgainstDummy).toHaveBeenCalledWith('bad');
  });

  it('uses the same generic error for incorrect passwords', async () => {
    findUnique.mockResolvedValue(user);
    verify.mockResolvedValue(false);
    await expect(
      service.login({ username: 'gv01', password: 'wrong' }, undefined),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.INVALID_CREDENTIALS.code });
  });

  it('reveals disabled status only after valid password verification', async () => {
    findUnique.mockResolvedValue({ ...user, status: UserStatus.DISABLED });
    verify.mockResolvedValue(false);
    await expect(
      service.login({ username: 'gv01', password: 'wrong' }, undefined),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.INVALID_CREDENTIALS.code });
    verify.mockResolvedValue(true);
    await expect(
      service.login({ username: 'gv01', password: 'right' }, undefined),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.ACCOUNT_DISABLED.code });
  });

  it('returns authenticated user without password hash', async () => {
    findUnique.mockResolvedValue(user);
    verify.mockResolvedValue(true);
    const result = await service.login(
      { username: 'gv01', password: 'right' },
      undefined,
    );
    expect(result).not.toHaveProperty('passwordHash');
    expect(result as AuthenticatedUser).toMatchObject({ id: 'id' });
  });

  it('rejects incorrect current and unchanged passwords', async () => {
    findUnique.mockResolvedValue({ passwordHash: 'hash' });
    verify.mockResolvedValue(false);
    await expect(
      service.changePassword('id', {
        currentPassword: 'bad',
        newPassword: 'newpass1',
      }),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.CURRENT_PASSWORD_WRONG.code });
    verify.mockResolvedValue(true);
    await expect(
      service.changePassword('id', {
        currentPassword: 'samepass1',
        newPassword: 'samepass1',
      }),
    ).rejects.toMatchObject({ code: AUTH_ERRORS.PASSWORD_UNCHANGED.code });
  });

  it('hashes and saves the new password while clearing forced change', async () => {
    findUnique.mockResolvedValue({ passwordHash: 'old-hash' });
    verify.mockResolvedValue(true);
    hash.mockResolvedValue('new-hash');
    update.mockResolvedValue({});
    await service.changePassword('id', {
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'id' },
      data: { passwordHash: 'new-hash', mustChangePassword: false },
    });
  });
});
