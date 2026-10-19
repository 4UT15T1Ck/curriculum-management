import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filter/all-exceptions.filter.js';
import { validationExceptionFactory } from './shared/exception/validation-exception.factory.js';
import type { Env } from './shared/config/env.validation.js';
import { SessionStoreService } from './shared/session/session-store.service.js';
import {
  SESSION_COOKIE_NAME,
  TRUSTED_PROXY_HOPS,
} from './shared/session/session.constants.js';

export const API_PREFIX = 'api';
// The frontend generates its types from `${API_DOCS_PATH}-json`.
export const API_DOCS_PATH = `${API_PREFIX}/docs`;

// Shared by main.ts and the e2e tests so both serve the same routes.
export function configureApp(app: NestExpressApplication): void {
  const config: ConfigService<Env, true> = app.get(ConfigService);
  if (config.get('NODE_ENV', { infer: true }) === 'production')
    app.set('trust proxy', TRUSTED_PROXY_HOPS);
  app.use(app.get(SessionStoreService).handler);
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = new DocumentBuilder()
    .setTitle('Quản lý Chương trình đào tạo')
    .setVersion('0.1')
    .addCookieAuth(SESSION_COOKIE_NAME)
    .build();
  SwaggerModule.setup(API_DOCS_PATH, app, () =>
    SwaggerModule.createDocument(app, document),
  );
}
