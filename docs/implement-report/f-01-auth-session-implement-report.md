# F-01 Đăng nhập, phiên — Implement Report

Kế hoạch: `docs/implementation/f-01-auth-session-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-10, FE-01..FE-07, DOC-01 xong (2026-10-18) |
| Nhánh | `main`, chưa commit |
| Cơ sở dữ liệu | Migration `20261018141101_auth_session` đã áp trên cơ sở dữ liệu phát triển (`prisma migrate deploy`); seed đã chạy, tạo tài khoản `admin` |
| Hiệu lực lúc chạy | Mọi route `/api` trừ `@Public` cần phiên; giao diện bắt đăng nhập trước mọi trang |
| Còn nợ | Không — người dùng đi thử 6 bước của §7 bằng trình duyệt, đạt (2026-10-18) |

### Kết quả kiểm tra (2026-10-18)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc` 0 lỗi | oxlint 0 | 26/26 (6 tệp) | 14/14 (3 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 20/20 (5 tệp) | — | `vite build` ổn; Prettier sạch |

### Cách dựng

Giao cho Codex (gpt-6-luna) qua 6 lượt chạy. Sandbox Windows của Codex chặn tạo tiến trình con, nên bộ điều phối tự chạy Vitest và Prisma (generate, migrate diff, kiểm thử) giữa các lượt.

---

## Summary

| ID | Tệp chính | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01 | `src/features/health/*`, `src/shared/{config,prisma,queue}/*`, `test/prisma-collation.e2e-spec.ts` | tsc, đơn vị, đầu-cuối health | Thêm một tệp ngoài danh sách — xem Incident 3 |
| BE-02 | `package.json`, `pnpm-lock.yaml` | cài đặt, tsc | `express-session`, `connect-pg-simple`, `pg`, `argon2`; dev: `tsx`, `@types/*` |
| BE-03 | `src/shared/{exception,filter,dtos}/*`, `health.controller.ts` | đơn vị bộ lọc | Không lệch |
| BE-04 | `prisma/schema.prisma`, `prisma/migrations/20261018141101_auth_session/` | đầu-cuối (migrate deploy) | Migration sinh bằng `migrate diff --from-empty` — xem Incident 1 |
| BE-05 | `src/shared/config/env.validation.ts`, `src/shared/session/*`, `app.setup.ts` | đầu-cuối | Không lệch |
| BE-06 | `src/shared/password/*` | đơn vị | Không lệch |
| BE-07 | `src/shared/auth/*`, `app.module.ts` | đơn vị hai guard | Không lệch |
| BE-08 | `src/features/auth/*` | đơn vị service | Không lệch |
| BE-09 | `prisma/seed.ts`, `prisma.config.ts` | tsc | Chưa chạy trên cơ sở dữ liệu thật |
| BE-10 | `test/auth.e2e-spec.ts`, `test/test-app.ts`, `test/test-env.ts`, `test/migrations.ts` | `pnpm test:e2e` | Sửa fixture — xem Incident 2 |
| FE-01 | `src/features/{health}/*`, `src/shared/layout/AppLayout.tsx` | tsc, đơn vị | Không lệch |
| FE-02 | `src/shared/api/schema.d.ts` | tsc | Sinh từ JSON OpenAPI dump — xem Incident 4 |
| FE-03 | `src/shared/api/{client,queryClient,errorCodes}.ts` | đơn vị `client.test.ts` | Không lệch |
| FE-04 | `src/shared/auth/*` | đơn vị `RequireAuth.test.tsx` | Không lệch |
| FE-05 | `src/features/auth/{api,hooks,schema}/*`, `LoginPage.tsx` | đơn vị | `fireEvent` — xem Deviation |
| FE-06 | `AccountPage.tsx`, `useChangePassword.ts` | đơn vị | `fireEvent` — xem Deviation |
| FE-07 | `src/router.tsx`, `src/routes.ts`, `src/features/home/pages/HomePage.tsx`, `src/main.tsx` | tsc, `vite build` | Đi thử trình duyệt chưa làm |
| DOC-01 | `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/implementation/*`, `docs/progress/*`, tệp này | đối chiếu đường dẫn với mã | Từ điển dữ liệu đã có dòng `mustChangePassword` từ trước, không sửa |

---

## Incidents

### 1. Thư mục migration rỗng gây P3015
- **Triệu chứng**: kiểm thử đầu-cuối dừng với Prisma P3015 (không tìm thấy tệp migration).
- **Cơ chế**: một thư mục `20261018120000_auth_session` rỗng còn lại từ lần thử trước; `migrate deploy` coi mọi thư mục là một migration.
- **Sửa**: xóa thư mục rỗng; migration thật là `20261018141101_auth_session`, sinh bằng `prisma migrate diff --from-empty` vì lúc dựng không có cơ sở dữ liệu chạy sẵn.

### 2. Fixture đầu-cuối gửi trường thừa khi đăng nhập
- **Triệu chứng**: các ca đăng nhập trong `test/auth.e2e-spec.ts` nhận 400 thay vì 200/401/403.
- **Cơ chế**: fixture dùng chung một đối tượng cho dữ liệu seed và thân yêu cầu, nên `userCode`/`fullName` lọt vào thân `POST /api/auth/login`; `ValidationPipe` toàn cục (`forbidNonWhitelisted`) từ chối trường ngoài `LoginDto`.
- **Sửa**: tách thông tin đăng nhập (`username`, `password`) khỏi danh tính được seed trong fixture.
- **Lesson**: fixture vừa làm dữ liệu seed vừa làm thân yêu cầu sẽ làm rò trường thừa vào yêu cầu; với `forbidNonWhitelisted`, dựng thân yêu cầu từ đúng trường của DTO.

### 3. `test/prisma-collation.e2e-spec.ts` thiếu trong danh sách tệp của BE-01
- Tệp này import đường dẫn cũ của config và Prisma; đã sửa import cùng BE-01. Đã ghi ở §2c của kế hoạch.

### 4. Sinh kiểu API khi cổng 6379 bị chiếm
- **Cơ chế**: cổng 6379 trên máy đang bị container valkey của dự án khác giữ, nên `docker compose up` của dự án này không dựng được Redis để chạy máy chủ cho `pnpm api:types`.
- **Sửa**: chạy máy chủ trong một harness Testcontainers dùng một lần, dump JSON OpenAPI, rồi chạy `openapi-typescript` trên tệp đó ra `src/shared/api/schema.d.ts`.
- **Lesson**: chạy dự án này cạnh dự án khác cần đặt `REDIS_PORT` khác khi `docker compose up`.

### 5. Mã Codex sinh ra chưa qua Prettier
- `prettier --write` chạy trên cả hai dự án sau khi dựng; `format:check` sạch.

---

## Deviations

### FE-05, FE-06 — `fireEvent` thay cho `user-event`
- Kế hoạch dùng `@testing-library/user-event` trong kiểm thử giao diện; gói này không phải phụ thuộc của frontend. Codex dùng `fireEvent` của Testing Library thay vì thêm phụ thuộc mới.

---

## Lessons worth keeping

- Thân yêu cầu trong kiểm thử phải dựng từ đúng trường của DTO; đừng tái dùng đối tượng seed (Incident 2).
- Không có cơ sở dữ liệu chạy sẵn vẫn sinh được migration bằng `migrate diff --from-empty`, nhưng đừng để lại thư mục migration rỗng (Incident 1).
