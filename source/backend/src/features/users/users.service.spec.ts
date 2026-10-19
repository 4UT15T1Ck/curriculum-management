import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserStatus } from '../../generated/prisma/client.js';
import { PasswordService } from '../../shared/password/password.service.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CreateUserDto } from './create-user.dto.js';
import { ListUsersQueryDto } from './list-users-query.dto.js';
import { UsersService } from './users.service.js';

function userRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    username: 'person',
    userCode: 'PERSON',
    fullName: 'Test Person',
    email: null,
    status: UserStatus.ACTIVE,
    mustChangePassword: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    orgUnit: null,
    roleAssignments: [],
    ...overrides,
  };
}

describe('UsersService', () => {
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
  let hash: ReturnType<typeof vi.fn>;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn().mockResolvedValue(userRow()),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve(userRow({ ...data, id: 'created-user' })),
          ),
        update: vi
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve(userRow({ ...data })),
          ),
      },
      orgUnit: { findUnique: vi.fn().mockResolvedValue({ id: 'unit-1' }) },
    };
    const prismaService = {
      ...prisma,
      $transaction: vi.fn(async (queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
    } as unknown as PrismaService;
    hash = vi.fn().mockResolvedValue('hashed-password');
    service = new UsersService(prismaService, {
      hash,
    } as unknown as PasswordService);
  });

  it('reports duplicate username with a field error', async () => {
    prisma.user.findFirst.mockResolvedValue({ username: 'person' });
    await expect(
      service.create(
        {
          username: 'person',
          userCode: 'P1',
          fullName: 'Person',
        } as CreateUserDto,
        'actor',
      ),
    ).rejects.toMatchObject({
      code: 'USERNAME_TAKEN',
      details: [{ field: 'username' }],
    });
  });

  it('reports duplicate user code with a field error', async () => {
    prisma.user.findFirst.mockResolvedValue({
      username: 'other',
      userCode: 'P1',
    });
    await expect(
      service.create(
        {
          username: 'person',
          userCode: 'P1',
          fullName: 'Person',
        } as CreateUserDto,
        'actor',
      ),
    ).rejects.toMatchObject({
      code: 'USER_CODE_TAKEN',
      details: [{ field: 'userCode' }],
    });
  });

  it('rejects an unknown organization unit', async () => {
    prisma.orgUnit.findUnique.mockResolvedValue(null);
    await expect(
      service.create(
        {
          username: 'person',
          userCode: 'P1',
          fullName: 'Person',
          orgUnitId: 'bad',
        } as CreateUserDto,
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'ORG_UNIT_NOT_FOUND' });
  });

  it('returns a temporary password but persists only its hash', async () => {
    const result = await service.create(
      {
        username: 'person',
        userCode: 'P1',
        fullName: 'Person',
      } as CreateUserDto,
      'actor',
    );

    expect(result.temporaryPassword).toHaveLength(12);
    expect(hash).toHaveBeenCalledWith(result.temporaryPassword);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed-password',
          mustChangePassword: true,
        }),
      }),
    );
    expect(JSON.stringify(prisma.user.create.mock.calls[0])).not.toContain(
      result.temporaryPassword,
    );
  });

  it('refuses self-disable and keeps disable idempotent', async () => {
    await expect(service.disable('user-1', 'user-1')).rejects.toMatchObject({
      code: 'CANNOT_DISABLE_SELF',
    });
    prisma.user.findUnique.mockResolvedValue(
      userRow({ status: UserStatus.DISABLED }),
    );
    await expect(service.disable('user-1', 'admin')).resolves.toMatchObject({
      status: UserStatus.DISABLED,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('forces a password change after reset', async () => {
    const result = await service.resetPassword('user-1', 'admin');

    expect(result.temporaryPassword).toHaveLength(12);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed-password',
          mustChangePassword: true,
        }),
      }),
    );
  });

  it('adds text search OR conditions only when q is provided', async () => {
    await service.list(
      Object.assign(new ListUsersQueryDto(), { page: 1, pageSize: 20 }),
    );
    expect(prisma.user.findMany.mock.calls[0][0].where.OR).toBeUndefined();

    await service.list(
      Object.assign(new ListUsersQueryDto(), {
        page: 1,
        pageSize: 20,
        q: 'query',
      }),
    );
    expect(prisma.user.findMany.mock.calls[1][0].where.OR).toHaveLength(3);
  });
});
