import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessContext } from './access-context.js';
import { ANY_AUTHENTICATED_KEY } from './any-authenticated.decorator.js';
import { IS_PUBLIC_KEY } from '../auth/public.decorator.js';
import { PERMISSIONS } from './permission-codes.js';
import { PermissionGuard } from './permission.guard.js';
import { REQUIRED_PERMISSIONS_KEY } from './require-permission.decorator.js';
import { ScopeService } from './scope.service.js';

function executionContext(request: Record<string, unknown>) {
  const handler = () => undefined;
  class Controller {}
  const context = {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({ getRequest: () => request }),
  };
  return { context, handler, Controller };
}

describe('PermissionGuard', () => {
  let loadAccess: ReturnType<typeof vi.fn>;
  let metadata: Record<string, unknown>;
  let guard: PermissionGuard;

  beforeEach(() => {
    metadata = {};
    loadAccess = vi.fn().mockResolvedValue(new AccessContext('user-1', []));
    const reflector = {
      getAllAndOverride: vi.fn((key: string) => metadata[key]),
    };
    guard = new PermissionGuard(
      reflector as unknown as Reflector,
      { loadAccess } as unknown as ScopeService,
    );
  });

  it('allows public routes without loading access', async () => {
    metadata[IS_PUBLIC_KEY] = true;
    const { context } = executionContext({});

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(loadAccess).not.toHaveBeenCalled();
  });

  it('attaches access and allows a held required code', async () => {
    metadata[REQUIRED_PERMISSIONS_KEY] = [PERMISSIONS.USER_MANAGE];
    const access = new AccessContext('user-1', [
      {
        assignmentId: 'assignment',
        roleId: 'role',
        roleCode: 'R1',
        roleName: 'Admin',
        scopeSource: 'NONE',
        scopeType: 'SYSTEM',
        scopeUnit: null,
        scope: { all: true },
        permissions: new Map([
          [PERMISSIONS.USER_MANAGE, { mode: 'DIRECT', scope: 'ALL' }],
        ]),
      },
    ]);
    loadAccess.mockResolvedValue(access);
    const request: Record<string, unknown> = { user: { id: 'user-1' } };
    const { context } = executionContext(request);

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.access).toBe(access);
  });

  it('denies when required codes are not held', async () => {
    metadata[REQUIRED_PERMISSIONS_KEY] = [PERMISSIONS.USER_MANAGE];
    const { context } = executionContext({ user: { id: 'user-1' } });

    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
  });

  it('allows any-of metadata when one permission is held', async () => {
    metadata[REQUIRED_PERMISSIONS_KEY] = [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.PERMISSION_VIEW,
    ];
    loadAccess.mockResolvedValue(
      new AccessContext('user-1', [
        {
          assignmentId: 'assignment',
          roleId: 'role',
          roleCode: 'R1',
          roleName: 'Admin',
          scopeSource: 'NONE',
          scopeType: 'SYSTEM',
          scopeUnit: null,
          scope: { all: true },
          permissions: new Map([
            [PERMISSIONS.PERMISSION_VIEW, { mode: 'DIRECT', scope: 'ALL' }],
          ]),
        },
      ]),
    );
    const { context } = executionContext({ user: { id: 'user-1' } });

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
  });

  it('allows explicitly any authenticated routes', async () => {
    metadata[ANY_AUTHENTICATED_KEY] = true;
    const { context } = executionContext({ user: { id: 'user-1' } });

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(loadAccess).toHaveBeenCalledWith('user-1');
  });

  it('denies routes with neither marker', async () => {
    const { context } = executionContext({ user: { id: 'user-1' } });

    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
  });
});
