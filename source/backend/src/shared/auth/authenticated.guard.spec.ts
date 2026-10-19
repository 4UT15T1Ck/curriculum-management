import { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthenticatedGuard } from './authenticated.guard.js';
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from './allow-pending-password-change.decorator.js';
import { IS_PASSIVE_REQUEST_KEY } from '../session/passive-request.decorator.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

describe('AuthenticatedGuard', () => {
  const reflector = new Reflector();
  const findUnique = vi.fn();
  const IDLE_MINUTES = 60;
  const MS_PER_MINUTE = 60_000;
  const guard = new AuthenticatedGuard(
    reflector,
    { user: { findUnique } } as unknown as PrismaService,
    { get: () => IDLE_MINUTES } as unknown as ConfigService<never, true>,
  );
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
    lastActivityAt?: number,
  ) {
    const handler = () => undefined;
    if (metadata) Reflect.defineMetadata(metadata.key, metadata.value, handler);
    const destroy = vi.fn((callback: (error?: unknown) => void) => callback());
    const request: Record<string, unknown> = {
      session: userId ? { userId, destroy, lastActivityAt } : undefined,
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

  describe('idle limit', () => {
    const minutesAgo = (minutes: number) =>
      Date.now() - minutes * MS_PER_MINUTE;
    const session = (request: Record<string, unknown>) =>
      request.session as { lastActivityAt?: number };

    it('ends a session idle for 61 minutes', async () => {
      const { context, destroy } = makeContext(
        'user-id',
        undefined,
        active,
        minutesAgo(61),
      );
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: COMMON_ERRORS.SESSION_REQUIRED.code,
      });
      expect(destroy).toHaveBeenCalled();
      expect(findUnique).not.toHaveBeenCalled();
    });

    it('renews the clock of a session idle for 59 minutes', async () => {
      const { context, request } = makeContext(
        'user-id',
        undefined,
        active,
        minutesAgo(59),
      );
      const before = Date.now();
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(session(request).lastActivityAt).toBeGreaterThanOrEqual(before);
    });

    it('lets a passive poll through without renewing the clock', async () => {
      const stamp = minutesAgo(59);
      const { context, request } = makeContext(
        'user-id',
        { key: IS_PASSIVE_REQUEST_KEY, value: true },
        active,
        stamp,
      );
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(session(request).lastActivityAt).toBe(stamp);
    });

    it('ends the session on a passive poll after 61 minutes', async () => {
      const { context } = makeContext(
        'user-id',
        { key: IS_PASSIVE_REQUEST_KEY, value: true },
        active,
        minutesAgo(61),
      );
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: COMMON_ERRORS.SESSION_REQUIRED.code,
      });
    });

    it('treats a session without a clock as active now', async () => {
      const { context, request } = makeContext('user-id');
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(session(request).lastActivityAt).toBeTypeOf('number');
    });
  });
});
