# Features Architecture

<!--
  FILE PURPOSE   : Per-feature breakdown of layers, contracts, components, and design decisions.

  WHAT BELONGS   : Backend module, endpoints, services, screens and key design decisions per
                   feature.

  WHAT DOES NOT  : Implementation status (→ todo.md), active work detail (→ current_work.md),
                   tech configuration (→ technical_reference.md), overall layer rules
                   (→ general_architecture.md).

  UPDATE WHEN    : A new module, endpoint, screen, or contract is added or changed.

  FORMAT:
            ## N. <Feature Name>
            ### Backend — `src/<module>/`
            ### Frontend
            #### `<Page>` — Screen Name
            - bullet: key behavior or contract
-->

Ghi những gì **đã dựng**. Danh sách 27 tính năng dự kiến và thứ tự ở `docs/implementation/README.md`; thiết kế màn hình đích ở `docs/design/screen-inventory.md`.

---

## 0. Trạng thái hệ thống (F-00, khung)

### Backend — `src/features/health/`
- `GET /api/health` → `HealthDto { status: 'ok' | 'error', database: 'up' | 'down', redis: 'up' | 'down' }`.
- `@Public()` — gọi được khi chưa đăng nhập.
- 200 khi cả hai phụ thuộc hoạt động; 503 kèm cùng thân khi một trong hai mất kết nối — controller đặt mã qua `response.status(...)`, không ném lỗi, nên thân vẫn là `HealthDto` chứ không phải `ErrorResponseDto`.
- `HealthService` hỏi PostgreSQL bằng `SELECT 1` và Redis bằng `PING` trên một kết nối `ioredis` riêng (hết giờ sau 1 giây), không qua kết nối của BullMQ.

### Frontend
#### `HealthPage` — Trạng thái hệ thống (`/health`)
- Gọi `fetchHealth` (`src/features/health/api/health.ts`), nhận cả 503 như một kết quả có thân.
- Mỗi phụ thuộc một dòng: thẻ "Hoạt động" hoặc "Mất kết nối"; lỗi khác hiện "Không kết nối được máy chủ ứng dụng".
- Nằm sau `RequireAuth` như mọi trang trong khung; `/` là `HomePage`, không còn chuyển hướng về `/health`.

---

## 1. Đăng nhập, phiên (F-01)

Kế hoạch: `docs/implementation/f-01-auth-session-implementation-plan.md`; báo cáo dựng: `docs/implement-report/f-01-auth-session-implement-report.md`. Hạ tầng dùng chung (phiên, guard, mật khẩu, lỗi) tả ở `general_architecture.md` §2.

### Backend — `src/features/auth/`
- `POST /api/auth/login` (`@Public`) — `LoginDto { username, password }` → 200 `MeDto`. Tên đăng nhập chuẩn hóa (`shared/auth/username.ts`) trước khi tìm. Sai tên hoặc sai mật khẩu cùng một lỗi 401 `INVALID_CREDENTIALS`; tài khoản DISABLED → 403 `ACCOUNT_DISABLED`. Thành công thì `regenerate` phiên rồi lưu `userId`.
- `POST /api/auth/logout` (`@Public`) — 204; hủy phiên nếu có, xóa cookie `ctdt.sid`.
- `GET /api/auth/me` (`@AllowPendingPasswordChange`) — `MeDto` của người dùng hiện tại, gồm `mustChangePassword`.
- `POST /api/auth/change-password` (`@AllowPendingPasswordChange`) — `ChangePasswordDto { currentPassword, newPassword }` → 204. Mật khẩu hiện tại sai → 400 `CURRENT_PASSWORD_WRONG`; trùng mật khẩu cũ → 400 `PASSWORD_UNCHANGED`; thành công thì xóa `mustChangePassword`.
- Chính sách mật khẩu (`shared/password/password-policy.ts`): 8..128 ký tự, có chữ và số; băm Argon2id.
- Mã lỗi của tính năng ở `auth.errors.ts`; đăng nhập thất bại chỉ ghi nhật ký ứng dụng, chưa có `AuditLog` (F01-07).
- Seed `prisma/seed.ts`: upsert tài khoản R1 (`SEED_ADMIN_USERNAME`, mặc định `admin`; `SEED_ADMIN_PASSWORD` bắt buộc) với `mustChangePassword = true`.

### Frontend
#### `LoginPage` — MH-01 Đăng nhập (`/login`)
- Nạp ngay (không lazy). Đã đăng nhập thì chuyển đi; đăng nhập xong quay về trang trong `state.from` hoặc `/`.
- Lỗi hiện `message` của máy chủ trong `Alert`.

#### `AccountPage` — MH-03 Tài khoản của tôi (`/account`)
- Thông tin người dùng và biểu mẫu đổi mật khẩu (`rules` ở `features/auth/schema/authRules.ts`); thành công báo "Đã đổi mật khẩu".
- Khi `mustChangePassword`, `RequireAuth` giữ người dùng ở trang này và hiện cảnh báo; mọi trang khác trả về đây.

#### `HomePage` — MH-02 Trang chính (`/`)
- "Xin chào, <họ tên>"; menu lọc theo quyền từ F-02.

#### Dùng chung — `src/shared/auth/`
- `useMe` — trạng thái phiên duy nhất phía giao diện; `useLogout` gọi đăng xuất rồi `queryClient.clear()`.
- `RequireAuth` bọc `AppLayout`; chưa đăng nhập → `/login` kèm `state.from`.

---

## 2. Tài khoản, vai trò, phạm vi quyền (F-02)

Kế hoạch: `docs/implementation/f-02-accounts-roles-permissions-implementation-plan.md`; báo cáo dựng: `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md`. Guard, `AccessContext` và quyền phía giao diện tả ở `general_architecture.md` §2, §3. Mã xong, chưa đi thử bằng trình duyệt.

### Backend — `src/features/users/`
- Cả controller cần `user.manage`.
- `GET /api/users` (`PageQueryDto` + lọc) → `UserPageDto`; `GET /api/users/:userId` → `UserDto`.
- `POST /api/users` → tài khoản mới kèm mật khẩu tạm do máy chủ sinh, trả một lần; `mustChangePassword = true`. Trùng tên đăng nhập → 409 `USERNAME_TAKEN`, trùng mã → 409 `USER_CODE_TAKEN`; đơn vị không có → 400 `ORG_UNIT_NOT_FOUND`.
- `PATCH /api/users/:userId`; `POST .../disable`, `.../enable` (lặp lại không lỗi); `POST .../reset-password` → mật khẩu tạm mới. Tự vô hiệu hóa → 400 `CANNOT_DISABLE_SELF`.
- `GET|POST /api/users/:userId/role-assignments`, `POST .../role-assignments/:assignmentId/revoke` — chỉ gán vai trò `scopeSource = NONE`, phạm vi `SYSTEM` hoặc `UNIT`; kiểm trùng khoảng hiệu lực; thu hồi ghi `revokedAt`/`revokedBy`, không sửa hàng; không tự thu hồi vai trò của mình.

### Backend — `src/features/permissions/`
- `GET /api/roles` (`user.manage` hoặc `permission.view`).
- `GET /api/permissions/matrix` (`permission.view`) — 6 vai trò × 41 quyền, mỗi ô `mode` + `scope`, kèm ô khóa.
- `PUT|DELETE /api/roles/:roleCode/permissions/:permissionCode` (`permission.manage`) — đặt hoặc bỏ ô; ghi `updatedBy` và một dòng nhật ký ứng dụng. Ô khóa (`LOCKED_CELLS`: R1 × `permission.manage`, R1 × `user.manage`) không đổi được.

### Backend — `src/features/org-units/`
- `GET /api/org-units` (`@AnyAuthenticated`) — đơn vị đang hoạt động cho ô chọn. Màn hình cây đơn vị là F-03.

### Frontend
#### `UserListPage` — MH-05 Danh sách tài khoản (`/users`)
- Bảng phân trang, lọc; tạo, sửa qua `UserFormModal`; mật khẩu tạm hiện một lần trong `TemporaryPasswordModal`.

#### `UserDetailPage` — MH-06 Chi tiết tài khoản (`/users/:userId`)
- `UserInfoCard` (sửa, vô hiệu hóa/mở lại, đặt lại mật khẩu; nút tự vô hiệu hóa bị tắt); `RoleAssignmentsCard` liệt kê cả hàng đã thu hồi làm lịch sử; `AssignRoleModal` chọn vai trò, phạm vi, ngày hiệu lực.

#### `PermissionMatrixPage` — MH-15 Ma trận quyền (`/permissions`)
- Cần `permission.view`; `MatrixCell` sửa được khi có `permission.manage` và ô không khóa.
