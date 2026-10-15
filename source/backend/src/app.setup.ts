import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api';
// The frontend generates its types from `${API_DOCS_PATH}-json`.
export const API_DOCS_PATH = `${API_PREFIX}/docs`;

// Shared by main.ts and the e2e tests so both serve the same routes.
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = new DocumentBuilder()
    .setTitle('Quản lý Chương trình đào tạo')
    .setVersion('0.1')
    .build();
  SwaggerModule.setup(API_DOCS_PATH, app, () =>
    SwaggerModule.createDocument(app, document),
  );
}
