# F-02 Tài khoản, vai trò, phạm vi quyền — Implement Report

Kế hoạch: `docs/implementation/f-02-accounts-roles-permissions-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-10, FE-01..FE-08, DOC-01 xong (2026-10-19) |
| Nhánh | `main`, chưa commit |
| Cơ sở dữ liệu | Migration `20261018151319_access_control` đã áp trên cơ sở dữ liệu phát triển; seed chạy hai lần → `OrgUnit` 3, `Role` 6, `Permission` 41, `RolePermission` 123, `RoleAssignment` 1 (chạy lại không đổi; ô ma trận đã xóa không bị seed tạo lại) |
| Hiệu lực lúc chạy | Mọi route không `@Public` phải có `@RequirePermission(...)` hoặc `@AnyAuthenticated()`, thiếu thì bị từ chối; menu và trang giao diện lọc theo quyền |
| Còn nợ | Người dùng đi thử 6 bước của §7 bằng trình duyệt — người dùng chọn để sau |

### Kết quả kiểm tra (2026-10-19)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc` 0 lỗi | oxlint 0 | 66/66 (15 tệp) | 39/39 (5 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 35/35 (10 tệp) | — | `vite build` ổn; Prettier sạch |

### Cách dựng

Giao cho Codex (gpt-6-luna) qua bốn lượt chạy:

| Lượt | Phạm vi | Token đầu vào |
|---|---|---|
| A | Lược đồ + hàm dùng chung (BE-01..BE-03) | ~0,5M |
| B | BE-04..BE-10 | 9,59M (phần lớn từ bộ nhớ đệm) |
| C | Giao diện FE-01..FE-08 | 1,94M |
| C2 | Sửa kiểm thử + thêm kiểm thử hành vi còn thiếu | 2,99M |

Sandbox của Codex không tạo được tiến trình con (`spawn EPERM`), nên không chạy được Prisma CLI lẫn Vitest. Bộ điều phối sinh migration bằng `prisma migrate dev --create-only --name access_control`, rồi tự chạy mọi kiểm thử.

---

## Summary

| ID | Phạm vi | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01..BE-03 | `prisma/schema.prisma`, `prisma/migrations/20261018151319_access_control/`, `src/shared/{pagination,time}/*`, `src/shared/password/temporary-password.ts` | tsc, đơn vị, đầu-cuối | Sửa kiểm thử — xem Incident 1 |
| BE-04..BE-08 | `src/shared/authz/*`, `src/app.module.ts` | đơn vị guard, `AccessContext`, `ScopeService` | Không lệch |
| BE-06 | `prisma/seed.ts`, `prisma/seed-data/*` | đơn vị catalog, seed chạy hai lần | Xem Incident 3 |
| BE-09 | `src/features/{users,permissions,org-units}/*` | đơn vị service | Không lệch |
| BE-10 | `test/*.e2e-spec.ts` | `pnpm test:e2e` 39/39 | Không lệch |
| FE-01..FE-03 | `src/shared/api/{schema.d.ts,pagination.ts,client.ts}`, `src/shared/auth/{permissions.ts,useCan.ts,RequirePermission.tsx}`, `src/shared/org-units/*` | tsc, đơn vị | Không lệch |
| FE-04 | `src/shared/layout/{menuItems.tsx,AppLayout.tsx}`, `src/router.tsx`, `src/routes.ts` | tsc, `vite build` | Không lệch |
| FE-05..FE-07 | `src/features/users/*` | đơn vị | Sửa kiểm thử — xem Incident 2 |
| FE-08 | `src/features/permissions/*` | đơn vị | Sửa kiểm thử — xem Incident 2 |
| DOC-01 | `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/implementation/*`, `docs/progress/*`, tệp này | đối chiếu đường dẫn với mã | Mục §2c đã có sẵn trong `docs/design/*` |

---

## Incidents

### 1. Kiểm thử mật khẩu tạm cấm chữ `L` hoa
- **Triệu chứng**: `temporary-password.spec.ts` của Codex đòi mật khẩu tạm không chứa `L` hoa.
- **Cơ chế**: bảng chữ của kế hoạch chỉ bỏ ký tự dễ nhầm `0 O 1 l I`; Codex thêm `L` vào danh sách cấm.
- **Sửa**: biểu thức kiểm đổi thành `/[0O1lI]/`, khớp kế hoạch.

### 2. Kiểm thử giao diện Codex viết mà không chạy được
- **Triệu chứng**: lần chạy thật đầu tiên 4/4 rồi 5/35 ca thất bại.
- **Cơ chế và sửa**:
  - jsdom không có `ResizeObserver`, AntD `Select` cần → thêm bản giả vào `source/frontend/src/test/setup.ts`.
  - AntD `Typography.Link` không có `href` thì không mang vai trò `link` → tìm bằng `td a` hoặc chữ.
  - Ca chặn tự vô hiệu hóa cần `vi.waitFor`, vì tài khoản và `/auth/me` nạp độc lập.
  - Ca phạm vi đơn vị trong `AssignRoleModal` phải bấm radio theo vai trò.
- **Lesson**: kiểm thử Codex viết chỉ được tính khi đã chạy ngoài sandbox.

### 3. Kiểm tra P1 để lại cơ sở dữ liệu phát triển ở 122 `RolePermission`
- **Cơ chế**: kiểm tra "xóa một ô rồi seed lại" xác nhận seed không tạo lại ô đã xóa (D9), nên ô đó vẫn mất sau kiểm tra.
- **Sửa**: xóa sạch `RolePermission` và `Permission` rồi seed lại → 123.

---

## Lessons worth keeping

- Mã và kiểm thử do tác tử không chạy được kiểm thử viết ra là chưa kiểm; chỉ tính khi đã chạy thật (Incident 2).
- Kiểm tra tính bất biến của seed trên cơ sở dữ liệu phát triển làm thay đổi dữ liệu; khôi phục ngay sau khi kiểm (Incident 3).
