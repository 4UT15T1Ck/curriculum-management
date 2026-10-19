# Technical Reference

<!--
  FILE PURPOSE   : Configuration, setup, and usage patterns for every library and technical
                   concern in the project.

  WHAT BELONGS   : Library versions, initialization, configuration, code patterns, and
                   constraints to follow.

  WHAT DOES NOT  : Implementation status (→ todo.md), feature design
                   (→ features_architecture.md), schema details (→ database_and_models.md),
                   active work (→ current_work.md).

  UPDATE WHEN    : A new library is added, a configuration changes, or a usage pattern is
                   established.

  FORMAT:
            ## N. Library / Concern Name
            **Library**: `package-name` **Version**: x.y.z
            ### Configuration
            ### Usage Pattern
-->

Lý do chọn và bảng phiên bản: `docs/design/tech-stack.md` §2 và §6. Số chính xác của mọi gói nằm trong `package.json` và `pnpm-lock.yaml` của từng dự án. Tệp này chỉ ghi **cách dùng** đã thiết lập trong mã.

---

## 1. Node.js và pnpm

**Version**: Node.js ≥ 22.22 < 23 (`engines`, `.nvmrc`), pnpm 10.23.0 (`packageManager`)

### Usage Pattern
- Chạy mọi lệnh bên trong `source/backend` hoặc `source/frontend`; không có lệnh ở gốc repo.
- Volta trên máy phát triển đang gắn pnpm 10.23.0 với Node 20 nên in cảnh báo `engines`. Sửa bằng `volta install pnpm@10.23.0` (chưa chạy).

---

## 2. Cấu hình môi trường của máy chủ

**Library**: `@nestjs/config`, `class-validator`, `class-transformer`

### Configuration
`src/shared/config/env.validation.ts` khai báo lớp `Env`; `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`.

### Usage Pattern
- Mỗi biến mới: thêm vào `Env` **kèm kiểu tường minh** (xem error log 2026-10-15), thêm dòng vào bảng biến trong `source/backend/README.md`.
- Đọc bằng `config.get('NAME', { infer: true })` trên `ConfigService<Env, true>`.

| Biến | Mặc định | Ràng buộc |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | 3000 | 1..65535 |
| `DATABASE_URL` | — | bắt buộc |
| `REDIS_HOST`, `REDIS_PORT` | `localhost`, 6379 | |
| `SESSION_SECRET` | — | bắt buộc, ≥ 32 ký tự (F-01) |
| `SESSION_IDLE_MINUTES` | 60 | số nguyên ≥ 1 (F-01, NFR-08) |

`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD` chỉ dành cho `prisma/seed.ts`, đọc trực tiếp từ `process.env`, không có trong `Env`.

---

## 3. Prisma

**Library**: `prisma`, `@prisma/client`, `@prisma/adapter-pg` **Version**: 7.10.0 (ghim cứng)

### Configuration
- Generator `prisma-client`, `moduleFormat = "esm"`, sinh vào `src/generated/prisma`; import từ `../generated/prisma/client.js`.
- `prisma.config.ts` đọc `process.env.DATABASE_URL` trực tiếp, không qua `env()` (xem error log 2026-10-15).
- `PrismaService extends PrismaClient`, nối qua `PrismaPg`; `onModuleInit` kiểm cơ sở dữ liệu dùng ICU `vi-VN`, sai thì dừng.

### Usage Pattern
- Model `PascalCase` số ít, trường `camelCase`, tên theo `docs/design/naming-map.md`.
- Thay đổi lược đồ: sửa `schema.prisma` → `pnpm prisma:migrate` → ghi vào `docs/architecture/database_and_models.md`.
- Nhiều bảng trong một thao tác: `$transaction`.
- Seed: `pnpm prisma:seed` chạy `tsx prisma/seed.ts` (khai ở `migrations.seed` trong `prisma.config.ts`); `tsx` là phụ thuộc phát triển.
- Không có cơ sở dữ liệu chạy sẵn thì migration có thể sinh bằng `prisma migrate diff --from-empty` (cách làm của `20261018141101_auth_session`); một thư mục migration rỗng làm `migrate deploy` lỗi P3015.

---

## 4. HTTP, kiểm dữ liệu vào, OpenAPI

**Library**: `@nestjs/platform-express`, `@nestjs/swagger`, `class-validator`

### Configuration
`configureApp` (`src/app.setup.ts`): tiền tố `api`, `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`, Swagger ở `/api/docs`, JSON ở `/api/docs-json`.

### Usage Pattern
- `configureApp` dùng chung cho `main.ts` và kiểm thử đầu-cuối — thêm cấu hình toàn cục vào đó, không vào `main.ts`.
- Mọi DTO trả về có `@ApiProperty`, kể cả `enum`, để `openapi-typescript` sinh đúng kiểu hợp.

---

## 5. Phiên, CSRF, mật khẩu

**Library**: `express-session` 1.19, `connect-pg-simple` 10, `pg` 8, `argon2` 0.45

### Configuration
- `SessionStoreService` (`src/shared/session/`) dựng một handler `express-session` dùng chung: store `connect-pg-simple`, bảng `session` (`createTableIfMissing: false`), cookie `ctdt.sid` HttpOnly, `rolling: true`, `maxAge` = `SESSION_IDLE_MINUTES` phút; `configureApp` gắn handler và đặt `trust proxy` 1 bước.
- `PasswordService` băm Argon2id; `argon2` là gói native.

### Usage Pattern
- Đăng nhập dùng `regenerate`, đăng xuất dùng `destroy` qua `session-lifecycle.ts` — không gọi callback của `express-session` trực tiếp.
- Route công khai đánh `@Public()`; route phải gọi được khi đang bị buộc đổi mật khẩu đánh `@AllowPendingPasswordChange()`.
- Giao diện gửi `X-Requested-With: XMLHttpRequest` trên mọi yêu cầu (`src/shared/api/client.ts`); kiểm thử đầu-cuối gửi yêu cầu ghi phải tự thêm header này.
- Thân yêu cầu chỉ chứa trường của DTO: `forbidNonWhitelisted` trả 400 cho trường thừa, kể cả trong kiểm thử.

---

## 6. Hàng đợi

**Library**: `@nestjs/bullmq`, `bullmq` 6.3, `ioredis`

### Configuration
`QueueModule`: `BullModule.forRootAsync` lấy `REDIS_HOST`, `REDIS_PORT`. Redis chạy `noeviction` và AOF (`compose.yaml`).

### Usage Pattern
- Redis chỉ chứa hàng đợi; mọi job phải chạy lại được mà không sinh kết quả kép.
- Tên hàng đợi là hằng số; một processor cho một hàng đợi.

---

## 7. Giao diện

**Library**: React 19.3, Vite 8.3, `antd` 6.6, `@tanstack/react-query` 5, `react-router` 8.4, `openapi-typescript` 7.13

### Usage Pattern
- `getJson<T>(path, acceptedStatuses)` và `sendJson<T>` trong `src/shared/api/client.ts`; mã lỗi khác ném `ApiError` mang `ErrorResponseDto`. 401 `SESSION_REQUIRED` được `queryClient.ts` bắt chung và đặt `me` về `null`.
- Sau khi máy chủ đổi DTO: chạy máy chủ, `pnpm api:types` (đọc `http://localhost:3000/api/docs-json`), đưa `src/shared/api/schema.d.ts` vào git.
- Thông báo, hộp xác nhận: dùng `App.useApp()` của Ant Design (đã bọc `AntApp` ở `main.tsx`).

---

## 8. Kiểm thử

| Dự án | Công cụ | Lệnh |
|---|---|---|
| backend, đơn vị | Vitest | `pnpm test` |
| backend, đầu-cuối | Vitest + Supertest + Testcontainers (`postgres:18`, `redis:8`) | `pnpm test:e2e` — cần Docker |
| frontend | Vitest + React Testing Library, jsdom | `pnpm test` |

### Usage Pattern
- Kiểm thử đầu-cuối tạo cơ sở dữ liệu ICU `vi-VN` qua `test/containers.ts`; kiểm thử mới dùng lại hàm ở đó.
- Kiểm thử giao diện giả `fetch` bằng `vi.stubGlobal` và bọc `QueryClientProvider` với `retry: false` (mẫu: `HealthPage.test.tsx`).
- `src/test/setup.ts` giả `ResizeObserver` (jsdom không có, AntD `Select` cần); kiểm thử mới dùng `Select` không phải tự giả.
- AntD `Typography.Link` không có `href` thì không mang vai trò `link`; tìm bằng chữ hoặc `td a`, không `getByRole('link')`.
- Tương tác người dùng trong kiểm thử giao diện dùng `fireEvent`; `@testing-library/user-event` không phải phụ thuộc.
- Cổng 6379 trên máy phát triển có thể đã bị dự án khác chiếm; khi đó `docker compose up` cần đặt `REDIS_PORT` khác.

---

## 9. Kiểm tra mã

oxlint (`pnpm lint`; máy chủ bật `--type-aware`, lời hứa bị bỏ quên là lỗi), Prettier (`pnpm format`). Kiểm kiểu: `pnpm exec tsc --noEmit -p tsconfig.json` (backend), `pnpm exec tsc -b` (frontend).
