import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Env } from '../config/env.validation.js';
import { PrismaClient } from '../../generated/prisma/client.js';

const CONNECTION_TIMEOUT_MS = 5000;
const ICU_PROVIDER = 'i';
const REQUIRED_LOCALE = 'vi-VN';

interface DatabaseLocale {
  provider: string;
  locale: string | null;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL', { infer: true }),
        connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.assertVietnameseCollation();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // A database created with the wrong collation sorts and searches Vietnamese names wrongly without any error,
  // and Prisma cannot declare a database-wide collation, so the only guard is to refuse to start.
  private async assertVietnameseCollation(): Promise<void> {
    const [db] = await this.$queryRaw<DatabaseLocale[]>`
      SELECT datlocprovider::text AS provider, datlocale AS locale
      FROM pg_database
      WHERE datname = current_database()`;
    if (db?.provider !== ICU_PROVIDER || db.locale !== REQUIRED_LOCALE) {
      throw new Error(
        `Database must be created with ICU locale ${REQUIRED_LOCALE}; found provider=${db?.provider} locale=${db?.locale}`,
      );
    }
  }
}
