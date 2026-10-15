import type { ConfigService } from '@nestjs/config';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { Env } from '../src/config/env.validation.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { startPostgres } from './containers.js';

function prismaFor(container: StartedPostgreSqlContainer): PrismaService {
  const config = {
    get: () => container.getConnectionUri(),
  } as unknown as ConfigService<Env, true>;
  return new PrismaService(config);
}

describe('PrismaService startup collation check', () => {
  it('starts on a database created with ICU vi-VN', async () => {
    const container = await startPostgres({ vietnameseCollation: true });
    const prisma = prismaFor(container);
    try {
      await expect(prisma.onModuleInit()).resolves.toBeUndefined();
    } finally {
      await prisma.$disconnect();
      await container.stop();
    }
  });

  it('refuses a database created with the default collation', async () => {
    const container = await startPostgres({ vietnameseCollation: false });
    const prisma = prismaFor(container);
    try {
      await expect(prisma.onModuleInit()).rejects.toThrow(/ICU locale vi-VN/);
    } finally {
      await prisma.$disconnect();
      await container.stop();
    }
  });
});
