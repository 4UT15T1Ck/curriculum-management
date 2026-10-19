# General Architecture

<!--
  FILE PURPOSE   : Single source of truth for overall app structure, layers, patterns, and wiring.

  WHAT BELONGS   : Package/module layout, layer rules, state-management pattern, navigation
                   structure, DI setup.

  WHAT DOES NOT  : Feature-level detail (→ features_architecture.md), tech config
                   (→ technical_reference.md), implementation status or TODOs
                   (→ todo.md / current_work.md).

  UPDATE WHEN    : A new layer convention is introduced, navigation structure changes,
                   or a project-wide architectural decision is made.

  FORMAT:
            ## <Section Name>
            Brief description of what this section establishes.
            ```
            code block or diagram if needed
            ```
-->

Ghi những gì **đã dựng** trong `source/`. Lựa chọn công nghệ và lý do ở `docs/design/tech-stack.md`; quy ước chung ở `.claude/rules/*-rules.md` và mục Deviations của `CLAUDE.md`. Các điểm kiến trúc nền (bố cục `features/` + `shared/`, `@RequirePermission`, AntD `Form`, `/api/auth/me` làm trạng thái phiên phía giao diện, khóa `cuid`) đã trả lời ở `docs/planning/feature-questions.md` §F-00; mã đã chuyển sang bố cục mới cùng F-01 (`docs/implementation/f-01-auth-session-implementation-plan.md`).

---

## 1. Bố cục repo

Hai dự án pnpm **độc lập**, không có workspace và không có gói dùng chung. Giao diện lấy kiểu dữ liệu từ đặc tả OpenAPI của máy chủ.

```
curriculum-management/
├── docs/                  tài liệu (tiếng Việt, định danh tiếng Anh)
├── source/
│   ├── backend/           NestJS — package.json, pnpm-lock.yaml, node_modules riêng
│   └── frontend/          React + Vite — package.json, pnpm-lock.yaml, node_modules riêng
├── .claude/               cấu hình Claude Code (rules, agents, hooks)
└── CLAUDE.md
```

---

## 2. Máy chủ — `source/backend`

Một ứng dụng NestJS duy nhất (RB-01), ESM: mọi import tương đối có đuôi `.js`.

```
src/
├── main.ts                khởi động: tạo app → configureApp → lắng nghe PORT
├── app.setup.ts           tiền tố /api, trust proxy, middleware phiên, ValidationPipe, AllExceptionsFilter, Swagger ở /api/docs
├── app.module.ts          gom các module; CsrfGuard → AuthenticatedGuard → PermissionGuard là APP_GUARD, theo thứ tự đó
├── features/
│   ├── auth/              đăng nhập, đăng xuất, me, đổi mật khẩu (F-01)
│   ├── users/             tài khoản, gán vai trò (F-02)
│   ├── permissions/       vai trò, ma trận vai trò × quyền (F-02)
│   ├── org-units/         danh sách đơn vị cho ô chọn (F-02, F-03 mở rộng)
│   └── health/            trạng thái hệ thống
├── shared/
│   ├── config/            env.validation.ts — lớp Env (class-validator); sai thì dừng khi khởi động
│   ├── prisma/            PrismaModule (@Global) + PrismaService (kiểm ICU vi-VN lúc khởi động)
│   ├── queue/             QueueModule: BullModule.forRootAsync nối Redis
│   ├── session/           SessionStoreService: express-session + connect-pg-simple (bảng session); regenerate/destroy
│   ├── password/          PasswordService (Argon2id), chính sách mật khẩu
│   ├── auth/              @Public, @AllowPendingPasswordChange, @CurrentUser, CsrfGuard, AuthenticatedGuard
│   ├── authz/             @RequirePermission, @AnyAuthenticated, @CurrentAccess, PermissionGuard, ScopeService, AccessContext, PERMISSIONS, LOCKED_CELLS
│   ├── pagination/        PageQueryDto + Page<T>
│   ├── time/              todayDate() — ngày hôm nay theo Asia/Ho_Chi_Minh
│   ├── exception/         AppException, ErrorDefinition, COMMON_ERRORS, validation-exception.factory
│   ├── filter/            AllExceptionsFilter — mọi lỗi ra dạng ErrorResponseDto
│   └── dtos/              ErrorResponseDto, RefDto
└── generated/prisma/      Prisma Client sinh ra (không sửa tay, không đưa vào git)
prisma/
├── schema.prisma          User, Session, OrgUnit, Role, Permission, RolePermission, RoleAssignment
├── migrations/            migration của Prisma
├── seed-data/             đơn vị, vai trò, danh mục 41 quyền + ma trận ban đầu
└── seed.ts                tài khoản R1 đầu tiên, quyền và vai trò (`pnpm prisma:seed`)
test/                      đầu-cuối: Testcontainers dựng PostgreSQL + Redis thật; test-app.ts, migrations.ts áp migration
```

### Quy tắc đang áp dụng

| Quy tắc | Cách làm hiện tại |
|---|---|
| Module | Tính năng ở `src/features/<f>/`, hạ tầng dùng chung ở `src/shared/`; tính năng không import tính năng khác; module khác chỉ dùng provider được `exports` |
| Lớp trong module | `*.controller.ts` nhận và trả, `*.service.ts` xử lý, `*.dto.ts` vào/ra. Không có tầng repository: service gọi `PrismaService` trực tiếp |
| Dữ liệu ra | DTO có `@ApiProperty` để Swagger sinh đúng kiểu cho giao diện; không trả model Prisma thô |
| Cấu hình | `ConfigService<Env, true>` với `{ infer: true }`; không đọc `process.env` trong mã ứng dụng (ngoại lệ: `prisma.config.ts`) |
| Việc nặng | Worker BullMQ; Redis chỉ chứa hàng đợi |
| Lỗi | Service ném `AppException(<định nghĩa>)` (mã + câu tiếng Việt) hoặc ngoại lệ Nest; `AllExceptionsFilter` trả `ErrorResponseDto { statusCode, code, message, details?, path, timestamp }`; lỗi kiểm dữ liệu có `details` theo trường |
| Xác thực | Mọi route cần phiên trừ `@Public()`; `AuthenticatedGuard` nạp lại người dùng mỗi yêu cầu, tài khoản DISABLED → 401 `SESSION_REQUIRED`; `mustChangePassword` → 403 `PASSWORD_CHANGE_REQUIRED` trừ route `@AllowPendingPasswordChange()` |
| Phiên | Cookie HttpOnly `ctdt.sid`, hàng trong bảng `session` (PostgreSQL), `rolling`, hết hạn sau `SESSION_IDLE_MINUTES` không hoạt động; đăng nhập gọi `regenerate` |
| CSRF | `CsrfGuard`: phương thức khác GET/HEAD/OPTIONS phải có `X-Requested-With: XMLHttpRequest`, thiếu → 403 `CSRF_HEADER_MISSING` |
| Phân quyền | `PermissionGuard` từ chối mặc định: route không `@Public` phải có `@RequirePermission(...codes)` (đủ một trong các mã) hoặc `@AnyAuthenticated()`, thiếu cả hai → 403. Quyền nạp lại mỗi yêu cầu, không cache |
| Phạm vi | `ScopeService.loadAccess()` dựng `AccessContext` một lần mỗi yêu cầu, gắn vào `request.access`; service lấy bằng `@CurrentAccess()` và kiểm phạm vi đồng bộ trên đó. Vai trò `scopeSource = NONE` lấy từ hàng `RoleAssignment` (`SYSTEM`/`UNIT`); vai trò khác suy ra qua `ScopeSourceReader` — các tính năng sau (F-03, F-06, F-17) điền bộ đọc |
| Mã quyền | Hằng `PERMISSIONS` (`shared/authz/permission-codes.ts`); không viết cứng mã vai trò trong mã |
| Người dùng hiện tại | `@CurrentUser()`; không đọc `req.session` trong controller |
| Kiểm thử | Đơn vị `*.spec.ts` cạnh tệp; đầu-cuối `test/*.e2e-spec.ts` dùng `configureApp` chung với `main.ts` |

### Chưa dựng

Bộ đọc phạm vi suy ra cho Giám đốc CTĐT, nhóm chuyên môn, sinh viên — F-03, F-06, F-17. Nhật ký kiểm toán hoãn (F01-07, `docs/planning/deferred-scope.md` §2).

---

## 3. Giao diện — `source/frontend`

```
src/
├── main.tsx               ConfigProvider (vi_VN) → AntApp → QueryClientProvider → RouterProvider
├── router.tsx             createBrowserRouter; /login ngoài khung; RequireAuth → AppLayout → các trang (lazy, trừ Login)
├── routes.ts              ROUTES — mọi đường dẫn
├── features/<f>/
│   ├── api/               hàm gọi + khóa truy vấn của tài nguyên
│   ├── hooks/             useQuery / useMutation
│   ├── pages/<Name>Page.tsx   một tệp cho mỗi màn hình, test cạnh tệp
│   └── schema/            `rules` cho AntD Form
│   (auth, health, home, users, permissions)
├── shared/
│   ├── api/               client.ts (getJson, sendJson, ApiError, header CSRF), queryClient.ts, errorCodes.ts, schema.d.ts (sinh từ OpenAPI, có trong git)
│   ├── auth/              me.ts, useMe, useLogout, RequireAuth, permissions.ts, useCan, RequirePermission
│   ├── org-units/         orgUnits.ts, useOrgUnits, OrgUnitSelect — dùng chung cho mọi ô chọn đơn vị
│   └── layout/            AppLayout.tsx (Header, Sider, Content), menuItems.tsx (mục menu kèm quyền cần)
└── test/setup.ts          jest-dom, bản giả ResizeObserver cho Vitest
```

| Quy tắc | Cách làm hiện tại |
|---|---|
| Dữ liệu từ máy chủ | TanStack Query; khóa truy vấn đặt cạnh hàm gọi trong `api/` |
| Phiên phía giao diện | Chỉ truy vấn `GET /api/auth/me`; 401 `SESSION_REQUIRED` ở bất kỳ đâu đặt `me` về `null` (`queryClient.ts`); `RequireAuth` chuyển về `/login` kèm trang đang mở, `mustChangePassword` ép về `/account` |
| Quyền phía giao diện | `MeDto.permissions` là union kiểu (enum OpenAPI); `useCan(code)` đọc từ `useMe`; menu chỉ hiện mục người dùng có quyền; route bọc `RequirePermission`. Chỉ để ẩn hiện — máy chủ vẫn kiểm |
| Phân trang | `withQuery` + `shared/api/pagination.ts` khớp `PageQueryDto`/`Page<T>` |
| Lỗi API | `ApiError` mang `ErrorResponseDto`; hiển thị `message` của máy chủ |
| Biểu mẫu | AntD `Form` với `rules` |
| Kiểu API | `components['schemas'][...]` từ `schema.d.ts`; không viết tay |
| Đường dẫn | Lấy từ `ROUTES` |
| Thành phần giao diện | Ant Design 6; ngôn ngữ `vi_VN`, dayjs `vi` |
| Phát triển | Vite chuyển `/api` sang `http://localhost:3000` — cùng một nguồn như khi Caddy phục vụ |

---

## 4. Luồng một yêu cầu

```
Trình duyệt ──/api/...──► (Vite proxy | Caddy) ──► NestJS
                                                   ├─ ValidationPipe (DTO)
                                                   ├─ Controller → Service
                                                   ├─ PrismaService ──► PostgreSQL 18 (ICU vi-VN)
                                                   └─ Queue ──► Redis 8 ──► Worker BullMQ
```
