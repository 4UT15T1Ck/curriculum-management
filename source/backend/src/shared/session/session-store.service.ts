import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import connectPgSimple from 'connect-pg-simple';
import type { RequestHandler } from 'express';
import session from 'express-session';
import { Pool } from 'pg';
import type { Env } from '../config/env.validation.js';
import {
  MS_PER_MINUTE,
  SESSION_COOKIE_NAME,
  SESSION_TABLE,
} from './session.constants.js';
import './session-data.js';

@Injectable()
export class SessionStoreService implements OnModuleDestroy {
  readonly handler: RequestHandler;
  private readonly pool: Pool;

  constructor(config: ConfigService<Env, true>) {
    this.pool = new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });
    const PgStore = connectPgSimple(session);
    this.handler = session({
      store: new PgStore({
        pool: this.pool,
        tableName: SESSION_TABLE,
        createTableIfMissing: false,
      }),
      name: SESSION_COOKIE_NAME,
      secret: config.get('SESSION_SECRET', { infer: true }),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.get('NODE_ENV', { infer: true }) === 'production',
        maxAge:
          config.get('SESSION_IDLE_MINUTES', { infer: true }) * MS_PER_MINUTE,
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
