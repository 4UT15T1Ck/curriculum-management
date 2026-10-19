# Database & Models

<!--
  FILE PURPOSE   : Schema definitions, entity columns, relationships, domain models, and DAO/
                   repository contracts for local storage.

  WHAT BELONGS   : DB engine config, entity/table specs, column specs, enums, DAOs, seed
                   strategy, non-trivial domain model design, and migration rules.

  WHAT DOES NOT  : Implementation status (→ todo.md), feature-level screen design
                   (→ features_architecture.md), tech library config (→ technical_reference.md).

  UPDATE WHEN    : Any entity column, relationship, enum value, DAO method, or domain model
                   changes. Always write a migration alongside the schema change — never drop
                   and recreate in production.

  FORMAT:
            ### `EntityName` — table `table_name`
            | Column | Type | Notes |
            |---|---|---|
            FK / relationship note if any.
-->

Tệp này ghi những gì **đã có migration** trong `source/backend/prisma/`. Lược đồ đích (toàn bộ thực thể, cột, liệt kê) ở `docs/design/data-dictionary.md` và `docs/design/erd.md`; tên tiếng Anh ở `docs/design/naming-map.md`. Một bảng chỉ được chép vào đây khi migration tạo ra nó đã chạy.

---

## Database Configuration

| Mục | Giá trị |
|---|---|
| Hệ quản trị | PostgreSQL 18, ảnh Debian |
| Quy tắc so sánh | ICU `vi-VN`, đặt lúc tạo cơ sở dữ liệu; `PrismaService` dừng ứng dụng nếu sai |
| Truy cập | Prisma 7.10.0, `@prisma/adapter-pg` |
| Lược đồ | `source/backend/prisma/schema.prisma` |
| Migration | `source/backend/prisma/migrations/` (`prisma.config.ts`) |
| Phiên bản lược đồ hiện tại | `20261018151319_access_control` |

### Migration Rule

Không xóa tạo lại cơ sở dữ liệu khi đổi lược đồ. Mỗi thay đổi:
1. Sửa `schema.prisma`.
2. `pnpm prisma:migrate` sinh và áp một migration có tên; đưa thư mục migration vào git.
3. Ghi thay đổi vào tệp này.

Nhật ký kiểm toán (NFR-10, bảng `AuditLog`) hoãn theo F01-07 — `docs/planning/deferred-scope.md` §2; quy định quyền trên bảng đó viết lại khi làm.

### Quy ước lược đồ (quyết định, áp từ migration đầu tiên)

| Mục | Quy ước | Nguồn |
|---|---|---|
| Khóa chính | `id String @id @default(cuid(2))`; khóa do Prisma Client sinh, `INSERT` thô phải tự cấp `id` | F00-10 |
| Tên bảng, cột | Model PascalCase số ít, trường camelCase, không `@map` (trừ bảng `session` của `connect-pg-simple`) | `source/backend/README.md` |
| Dấu thời gian | Mọi bảng nghiệp vụ có `createdAt @default(now())`, `updatedAt @updatedAt` | F-01 D11 |
| Khóa ngoại | Cột vô hướng `<quanHệ>Id` cạnh trường quan hệ đặt tên như từ điển dữ liệu (`parentUnit` + `parentUnitId`); mặc định `onDelete: Restrict` | F-02 D1 |
| Ngày không giờ | `@db.Date`, gửi `YYYY-MM-DD`, so với hôm nay theo `Asia/Ho_Chi_Minh` (`todayDate()`) | F-02 D13 |
| Liệt kê | `enum` của Prisma, giá trị `SCREAMING_SNAKE` | F00-12 |
| Tín chỉ, điểm | `Decimal(5,2)` tín chỉ, `Decimal(4,2)` điểm; trả JSON dạng chuỗi | F00-11 |

---

## Entities

Migration `20261018141101_auth_session` (F-01) sinh bằng `prisma migrate diff --from-empty` vì lúc dựng không có cơ sở dữ liệu chạy sẵn; đã áp trên PostgreSQL 18 của Testcontainers trong kiểm thử đầu-cuối (`test/migrations.ts`), đã áp trên cơ sở dữ liệu phát triển ngày 2026-10-18.

Migration `20261018151319_access_control` (F-02) sinh bằng `prisma migrate dev --create-only --name access_control`; đã áp trên cơ sở dữ liệu phát triển. Thêm `OrgUnit` tối thiểu, `Role`, `Permission`, `RolePermission`, `RoleAssignment` và `User.orgUnitId`.

### `User` — table `User`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `userCode` | `String` | Duy nhất (`User_userCode_key`) |
| `fullName` | `String` | |
| `email` | `String?` | |
| `status` | `UserStatus` | Mặc định `ACTIVE`; `DISABLED` không đăng nhập được và mất phiên ở yêu cầu kế tiếp |
| `username` | `String` | Duy nhất (`User_username_key`); lưu dạng đã chuẩn hóa (`shared/auth/username.ts`) |
| `passwordHash` | `String` | Argon2id |
| `mustChangePassword` | `Boolean` | Mặc định `false`; `true` thì chỉ gọi được `me`, đổi mật khẩu, đăng xuất |
| `orgUnitId` | `String?` | FK `OrgUnit`; chỉ mục |
| `createdAt` / `updatedAt` | `DateTime` | `now()` / `@updatedAt` |


### `OrgUnit` — table `OrgUnit`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `unitCode` | `String` | Duy nhất |
| `unitName` | `String` | |
| `unitType` | `OrgUnitType` | |
| `parentUnitId` | `String?` | FK `OrgUnit` (cây), chỉ mục |
| `status` | `OrgUnitStatus` | Mặc định `ACTIVE` |
| `createdAt` / `updatedAt` | `DateTime` | |

Bản tối thiểu cho F-02; F-03 mở rộng.

### `Role` — table `Role`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `roleCode` | `String` | Duy nhất (R1..R6) |
| `roleName` | `String` | |
| `description` | `String?` | |
| `isSystemRole` | `Boolean` | Mặc định `false` |
| `scopeSource` | `ScopeSource` | Mặc định `NONE`; khác `NONE` là vai trò suy ra, không có hàng `RoleAssignment` |
| `createdAt` / `updatedAt` | `DateTime` | |

### `Permission` — table `Permission`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `permissionCode` | `String` | Duy nhất; khớp hằng `PERMISSIONS` |
| `permissionName` | `String` | |
| `functionGroup` | `FunctionGroup` | |
| `description` / `source` | `String?` | |
| `createdAt` / `updatedAt` | `DateTime` | |

### `RolePermission` — table `RolePermission`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `roleId` | `String` | FK `Role` |
| `permissionId` | `String` | FK `Permission`, chỉ mục |
| `mode` | `PermissionMode` | |
| `scope` | `PermissionScope` | |
| `updatedById` | `String?` | FK `User` — người sửa ô gần nhất trên MH-15 |
| `createdAt` / `updatedAt` | `DateTime` | |

Duy nhất (`roleId`, `permissionId`). Không có hàng = vai trò không có quyền đó.

### `RoleAssignment` — table `RoleAssignment`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `userId` | `String` | FK `User`, chỉ mục |
| `roleId` | `String` | FK `Role` |
| `scopeType` | `ScopeType` | Hàng chỉ mang `SYSTEM` hoặc `UNIT`; `ASSIGNMENT` chỉ xuất hiện lúc đọc cho vai trò suy ra |
| `scopeUnitId` | `String?` | FK `OrgUnit`; có khi `UNIT` |
| `validFrom` / `validTo` | `Date` / `Date?` | `@db.Date` |
| `assignedById` | `String?` | FK `User` |
| `revokedAt` / `revokedById` | `DateTime?` / `String?` | Thu hồi chỉ ghi hai cột này |
| `createdAt` / `updatedAt` | `DateTime` | |

Duy nhất (`userId`, `roleId`, `scopeUnitId`, `validFrom`) — PostgreSQL coi `NULL` là khác nhau, nên kiểm trùng khoảng hiệu lực ở service mới là chặn thật. Hàng không bị sửa vai trò, phạm vi hay ngày; đây là lịch sử phân quyền (FR-10) thay cho bảng kiểm toán đã hoãn.

### `Session` — table `session`
| Column | Type | Notes |
|---|---|---|
| `sid` | `VARCHAR` | Khóa chính (`session_pkey`) |
| `sess` | `JSON` | Dữ liệu phiên (`userId`) |
| `expire` | `TIMESTAMP(6)` | Chỉ mục `IDX_session_expire` |

Hình dạng do `connect-pg-simple` quy định (`createTableIfMissing: false`, bảng do migration tạo); mã ứng dụng không đọc ghi bảng này qua Prisma.

---

## Supporting Enums

| Enum | Giá trị |
|---|---|
| `UserStatus` | `ACTIVE`, `DISABLED` |
| `OrgUnitType` | `UNIVERSITY`, `FACULTY`, `OFFICE` |
| `OrgUnitStatus` | `ACTIVE`, `INACTIVE` |
| `ScopeSource` | `NONE`, `PROGRAM_DIRECTOR`, `SUBJECT_GROUP_COORDINATOR`, `SUBJECT_GROUP_MEMBER`, `OWN_ENROLLMENT` |
| `FunctionGroup` | `SYSTEM_ADMIN`, `COURSE_CATALOG`, `PROGRAM`, `LEARNING_OUTCOME`, `SYLLABUS`, `APPROVAL`, `VERSION`, `DATA_REPORT`, `STUDENT_LOOKUP` |
| `PermissionMode` | `DIRECT`, `VIA_REQUEST` |
| `PermissionScope` | `ALL`, `SCOPED` |
| `ScopeType` | `SYSTEM`, `UNIT`, `ASSIGNMENT` |

Các enum sau Giá trị liệt kê lưu ở dạng `SCREAMING_SNAKE` như từ điển dữ liệu ghi (ví dụ `DRAFT`, `PENDING`, `ACTIVE`, `HISTORICAL`).

---

## Seed

`prisma/seed.ts`, chạy bằng `pnpm prisma:seed` (`prisma db seed` → `tsx prisma/seed.ts`, khai ở `prisma.config.ts`). Upsert một tài khoản R1: tên đăng nhập `SEED_ADMIN_USERNAME` (mặc định `admin`), mã `ADMIN`, mật khẩu `SEED_ADMIN_PASSWORD` (bắt buộc, theo chính sách mật khẩu), `mustChangePassword = true`; tài khoản đã có thì không đổi.

Quyền và vai trò (F-02, `prisma/seed-data/*`): đơn vị Trường → Khoa CNTT + Phòng Đào tạo, 6 vai trò, 41 quyền (từ điển dữ liệu mục 9, thêm `permission.manage`), ma trận ban đầu 123 ô, gán R1 hệ thống cho tài khoản quản trị. Ô `RolePermission` chỉ được tạo cho quyền seed chèn lần đầu, nên chạy lại seed không hoàn tác thay đổi R1 làm trên MH-15 — ô đã xóa vẫn mất. Đã chạy hai lần trên cơ sở dữ liệu phát triển: `OrgUnit` 3, `Role` 6, `Permission` 41, `RolePermission` 123, `RoleAssignment` 1.
