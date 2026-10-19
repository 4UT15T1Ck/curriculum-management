import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthenticatedGuard } from './authenticated.guard.js';
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from './allow-pending-password-change.decorator.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

describe('AuthenticatedGuard', () => {
  const reflector = new Reflector();
  const findUnique = vi.fn();
  const guard = new AuthenticatedGuard(reflector, {
    user: { findUnique },
  } as unknown as PrismaService);
  const active = {
    id: 'id',
    username: 'admin',
    userCode: 'ADMIN',
    fullName: 'Admin',
    email: null,
    status: UserStatus.ACTIVE,
    mustChangePassword: false,
  };
  function makeContext(
    userId?: string,
    metadata?: { key: string; value: boolean },
    user: unknown = active,
  ) {
    const handler = () => undefined;
    if (metadata) Reflect.defineMetadata(metadata.key, metadata.value, handler);
    const destroy = vi.fn((callback: (error?: unknown) => void) => callback());
    const request: Record<string, unknown> = {
      session: userId ? { userId, destroy } : undefined,
    };
    findUnique.mockResolvedValue(user);
    return {
      context: {
        getHandler: () => handler,
        getClass: () => class {},
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
      request,
      destroy,
    };
  }

  beforeEach(() => findUnique.mockReset());

  it('allows public routes without querying', async () => {
    const { context } = makeContext(undefined, {
      key: IS_PUBLIC_KEY,
      value: true,
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('requires a session', async () => {
    const { context } = makeContext();
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: COMMON_ERRORS.SESSION_REQUIRED.code,
    });
  });

  it.each([null, { ...active, status: UserStatus.DISABLED }])(
    'rejects missing or disabled users and destroys session',
    async (user) => {
      const { context, destroy } = makeContext('user-id', undefined, user);
      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        AppException,
      );
      expect(destroy).toHaveBeenCalled();
    },
  );

  it('requires a password change unless route opts in', async () => {
    const { context } = makeContext('user-id', undefined, {
      ...active,
      mustChangePassword: true,
    });
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: COMMON_ERRORS.PASSWORD_CHANGE_REQUIRED.code,
    });
    const allowed = makeContext(
      'user-id',
      { key: ALLOW_PENDING_PASSWORD_CHANGE_KEY, value: true },
      { ...active, mustChangePassword: true },
    );
    await expect(guard.canActivate(allowed.context)).resolves.toBe(true);
    expect(allowed.request.user).toMatchObject({ id: 'id' });
  });

  it('accepts an active user and attaches it to request', async () => {
    const { context, request } = makeContext('user-id');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(active);
  });
});
