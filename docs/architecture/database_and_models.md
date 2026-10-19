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
| Phiên bản lược đồ hiện tại | `20261019024639_subject_groups` |

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

Migration `20261019024639_subject_groups` (F-03) thêm `SubjectGroup`, `SubjectGroupMember` và hai enum; chỉ thêm, không đụng hàng của F-02.

Migration `20261019072717_courses` (F-04) sinh bằng `prisma migrate dev --name courses` trên PostgreSQL 18 thật (ICU `vi-VN`); thêm `Course` và hai enum `CourseType`, `CourseStatus`; chỉ thêm, không đụng bảng cũ. Đã áp trên PostgreSQL của Testcontainers trong kiểm thử đầu-cuối (4 migration); chưa áp lên cơ sở dữ liệu phát triển của người dùng.

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

Cột không đổi từ F-02; F-03 thêm quan hệ ngược `subjectGroups`, F-04 thêm `ownedCourses`. Loại đơn vị cha hợp lệ là hằng `ALLOWED_PARENT_TYPES` (`features/org-units/org-unit-hierarchy.ts`): `FACULTY` và `OFFICE` chỉ nằm dưới `UNIVERSITY`; đổi cha chạy kiểm chu trình ở service. Không có thao tác xóa đơn vị — chỉ `INACTIVE` / `ACTIVE`.

### `SubjectGroup` — table `SubjectGroup`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `groupCode` | `String` | Duy nhất, không sửa sau khi tạo |
| `groupName` | `String` | |
| `facultyId` | `String` | FK `OrgUnit`, chỉ mục; phải là đơn vị `FACULTY` (kiểm ở service) |
| `status` | `SubjectGroupStatus` | Mặc định `ACTIVE` |
| `createdAt` / `updatedAt` | `DateTime` | |

### `SubjectGroupMember` — table `SubjectGroupMember`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `subjectGroupId` | `String` | FK `SubjectGroup`, chỉ mục |
| `lecturerId` | `String` | FK `User`, chỉ mục |
| `memberRole` | `SubjectGroupMemberRole` | `MEMBER` hoặc `COORDINATOR` — hai hàng riêng |
| `validFrom` / `validTo` | `Date` / `Date?` | `@db.Date` |
| `assignedById` | `String?` | FK `User` |
| `revokedAt` / `revokedById` | `DateTime?` / `String?` | Thu hồi chỉ ghi hai cột này |
| `createdAt` / `updatedAt` | `DateTime` | |

Không có ràng buộc duy nhất hay loại trừ ở cơ sở dữ liệu: service chặn hai hàng chưa thu hồi cùng (nhóm, người, vai trò) chồng thời gian (`MEMBERSHIP_OVERLAP`) và đòi hàng `COORDINATOR` nằm trọn trong một hàng `MEMBER` cùng người, cùng nhóm (`COORDINATOR_NOT_MEMBER`). Một nhóm có thể có nhiều Điều phối. Kết thúc thành viên chỉ rút ngắn `validTo` và cắt các hàng Điều phối bên trong; hàng không bị xóa hay kéo dài.

### `Course` — table `Course`
| Column | Type | Notes |
|---|---|---|
| `id` | `String` | `cuid(2)` |
| `courseCode` | `String` | Duy nhất (`Course_courseCode_key`); cắt khoảng trắng, viết hoa khi ghi; không sửa sau khi tạo (DTO sửa không có trường này) |
| `courseName` | `String` | Tiếng Việt; chỉ mục (`Course_courseName_idx`) cho sắp xếp |
| `englishName` | `String?` | Rỗng lưu `null` |
| `credits` | `Decimal(5,2)` | `numeric(5,2)`; gửi và nhận dạng chuỗi (`"2.5"`, `"0"`), `toWireDecimal` bỏ số 0 thừa |
| `courseType` | `CourseType` | |
| `status` | `CourseStatus` | Mặc định `ACTIVE`; `CANCELLED` là trạng thái cuối |
| `ownerFacultyId` | `String` | FK `OrgUnit` (`Restrict`), chỉ mục; phải là `FACULTY` đang hoạt động (kiểm ở service) |
| `ownerGroupId` | `String?` | FK `SubjectGroup` (`Restrict`), chỉ mục; nếu có phải là nhóm `ACTIVE` của chính `ownerFaculty` (kiểm ở service) |
| `createdAt` / `updatedAt` | `DateTime` | |

Không có thao tác xóa học phần — chỉ chuyển trạng thái. Quan hệ ngược: `OrgUnit.ownedCourses`, `SubjectGroup.ownedCourses`. "Học phần khoa khác" = `ownerFaculty.unitCode` khác `HOME_FACULTY_CODE` (`KHOA_CNTT`, `src/shared/org-units/home-faculty.ts`); không lưu thành cột. Cột `equivalenceGroup` chưa có — F-05 thêm cùng bảng nhóm tương đương. Tìm kiếm: `ILIKE '%q%'` trên mã và tên không dùng được chỉ mục; chấp nhận ở quy mô vài trăm dòng (đo 500 dòng trong đầu-cuối).

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
| `SubjectGroupStatus` | `ACTIVE`, `INACTIVE` |
| `SubjectGroupMemberRole` | `MEMBER`, `COORDINATOR` |
| `CourseType` | `THEORY`, `PRACTICE`, `LAB`, `PROJECT`, `CAPSTONE`, `INTERNSHIP`, `CONDITIONAL` |
| `CourseStatus` | `ACTIVE`, `DISCONTINUED`, `CANCELLED` |

Các enum sau Giá trị liệt kê lưu ở dạng `SCREAMING_SNAKE` như từ điển dữ liệu ghi (ví dụ `DRAFT`, `PENDING`, `ACTIVE`, `HISTORICAL`).

---

## Seed

`prisma/seed.ts`, chạy bằng `pnpm prisma:seed` (`prisma db seed` → `tsx prisma/seed.ts`, khai ở `prisma.config.ts`). Upsert một tài khoản R1: tên đăng nhập `SEED_ADMIN_USERNAME` (mặc định `admin`), mã `ADMIN`, mật khẩu `SEED_ADMIN_PASSWORD` (bắt buộc, theo chính sách mật khẩu), `mustChangePassword = true`; tài khoản đã có thì không đổi.

Quyền và vai trò (F-02, `prisma/seed-data/*`): đơn vị Trường → Khoa CNTT + Phòng Đào tạo, 6 vai trò, 41 quyền (từ điển dữ liệu mục 9, thêm `permission.manage`), ma trận ban đầu 123 ô, gán R1 hệ thống cho tài khoản quản trị. Ô `RolePermission` chỉ được tạo cho quyền seed chèn lần đầu, nên chạy lại seed không hoàn tác thay đổi R1 làm trên MH-15 — ô đã xóa vẫn mất. Đã chạy hai lần trên cơ sở dữ liệu phát triển: `OrgUnit` 3, `Role` 6, `Permission` 41, `RolePermission` 123, `RoleAssignment` 1.
