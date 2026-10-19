# Progress Log

Append-only. Each entry records what was completed for a task, with a timestamp.
Never edit or delete past entries. Newest entries go at the bottom.

Format:
```
## [TASK_ID] Task Name
**Date**: YYYY-MM-DD
**Files changed**: list of files
- bullet: what was done / added / decided
```

---

## [DOCS] Yêu cầu, thiết kế, kế hoạch
**Date**: 2026-10-01 .. 2026-10-15
**Files changed**: `docs/requirement/REQUIREMENTS.md`, `docs/Bo_so_do_Use_Case_CTDT/*`, `docs/design/*`, `docs/planning/*`, `docs/notes/*`, `docs/reference/*`
- Gộp yêu cầu về một SRS (`REQUIREMENTS.md`): 109 FR, NFR, BR, EC, câu hỏi Q-01..Q-28.
- Thiết kế: ERD, từ điển dữ liệu, sơ đồ trạng thái, sơ đồ tuần tự, danh mục màn hình, bảng tên SRS ↔ tên lập trình (`naming-map.md`).
- RBAC theo từng quyền: `Permission`, `RolePermission` (ghi thẳng / qua đề xuất, toàn bộ / theo phạm vi), 40 quyền khởi tạo; vai trò tự định nghĩa để sau (E-13).
- Kế hoạch: sáu bậc B1..B6, 116 story, 277 việc, kế hoạch sprint, kế hoạch kiểm thử.
- Quy định của Trường (tệp docx mới): các yêu cầu chưa làm ghi ở `docs/planning/deferred-scope.md` (R-1..R-7).

## [F-00] Khung mã nguồn
**Date**: 2026-10-15
**Files changed**: `source/backend/**`, `source/frontend/**`, `docs/design/tech-stack.md`, `docs/requirement/REQUIREMENTS.md`
- Chốt công nghệ (Q-16): TypeScript, Node.js 22, NestJS + Prisma + PostgreSQL 18, BullMQ trên Redis 8, React + Vite + Ant Design.
- Backend: cấu hình kiểm khi khởi động, PrismaService kiểm ICU `vi-VN`, QueueModule, `GET /api/health`, Swagger; kiểm thử đơn vị và đầu-cuối bằng Testcontainers.
- Frontend: Ant Design `vi_VN`, TanStack Query, React Router, kiểu sinh từ OpenAPI, trang Trạng thái hệ thống kèm kiểm thử.
- Hai dự án pnpm độc lập, mỗi bên `node_modules` riêng.

## [INIT] Thiết lập Claude Code và tài liệu dự án
**Date**: 2026-10-17
**Files changed**: `.claude/settings.json`, `.claude/agents/*`, `.claude/hooks/*`, `.claude/commands/sync-docs.md`, `.claude/rules/*`, `CLAUDE.md`, `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/implementation/README.md`, `docs/progress/*`, `docs/testing/*`, `docs/troubleshooting/error_log.md`, `docs/planning/feature-questions.md`
- Áp mẫu `claude-code-templates` (universal + nestjs + react-vite). Ba agent build-verifier, architecture-reviewer, debugger gộp hai phía, dùng lệnh pnpm và đường dẫn `source/*`.
- `CLAUDE.md` ghi các điểm lệch đã chốt so với rule của stack (Ant Design, pnpm, oxlint, Vitest, phiên cookie thay JWT).
- Tài liệu kiến trúc ghi đúng khung đã dựng; danh sách 27 tính năng ở `docs/implementation/README.md`.
- Câu hỏi của từng tính năng kèm phương án đề xuất: `docs/planning/feature-questions.md`.

## [Q-FEAT] Trả lời câu hỏi theo tính năng
**Date**: 2026-10-18
**Files changed**: `docs/planning/feature-questions.md`, `docs/progress/current_work.md`, `docs/progress/todo.md`
- 22 câu trả lời trực tiếp; các câu còn lại nhận phương án A.
- Khác đề xuất: khóa chính `cuid`; chưa làm nhật ký kiểm toán (US-002, US-003); Học phần–PLO nhập trực tiếp kèm trọng số, CLO–PLO không mang mức.

## [PLANS] Kế hoạch triển khai F-01..F-11
**Date**: 2026-10-18
**Files changed**: `docs/implementation/f-01..f-11-*-implementation-plan.md`, `docs/implementation/README.md`, `docs/planning/test-plan.md`, `docs/planning/user-stories.md`, `docs/design/naming-map.md`
- Mười một kế hoạch, mỗi kế hoạch phủ cả backend và frontend, kèm hợp đồng API, quyết định, ràng buộc cho tính năng sau (§8).
- Sửa tài liệu theo trả lời F11-02, F11-03: US-044, US-046, US-048; KB-033, NT-B3-03, NT-B3-04; `mucDoDongGop` → `weight`.

## [MVP] Chốt bản MVP
**Date**: 2026-10-18
**Files changed**: `docs/planning/epics.md`, `docs/implementation/README.md`, `docs/progress/todo.md`, `docs/progress/current_work.md`
- MVP = F-01..F-08, F-10, F-11, F-13, F-14, F-15 (298 / 519 điểm); phần còn lại làm sau, phạm vi không đổi.
- F-08 được thêm vào đề xuất ban đầu vì F-13, F-15 phải gọi `ConsistencyChecker.assertPasses`.

## [PLANS] Kế hoạch triển khai F-13, F-14, F-15 — đủ MVP
**Date**: 2026-10-18
**Files changed**: `docs/implementation/f-13-change-requests-implementation-plan.md`, `docs/implementation/f-14-three-level-approval-notifications-implementation-plan.md`, `docs/implementation/f-15-release-version-snapshots-implementation-plan.md`, `docs/implementation/README.md`, `docs/progress/todo.md`, `docs/progress/current_work.md`
- Đủ 13 kế hoạch MVP; chưa dựng mã.
- F-15: bảng `Semester`, `Cohort`, `CohortVersion`; số phiên bản `major.minor`; ảnh chụp tên và tín chỉ học phần lúc ban hành; kích hoạt đầu học kỳ bằng hàng đợi `release-activation`; đính chính phiên bản.
- F-15 thêm `ChangeRequest.createdByAcademicOffice` vào mô hình F-13 và đổi vài hành vi của F-13, F-14 (ghi ở §2c của kế hoạch F-15).

## [F-01] Đăng nhập, phiên — dựng mã
**Date**: 2026-10-18
**Files changed**: `source/backend/src/features/{auth,health}/*`, `source/backend/src/shared/{config,prisma,queue,exception,dtos,filter,session,password,auth}/*`, `source/backend/prisma/{schema.prisma,seed.ts,migrations/20261018141101_auth_session}`, `source/backend/test/*`, `source/backend/package.json`, `source/frontend/src/features/{auth,health,home}/*`, `source/frontend/src/shared/{api,auth,layout}/*`, `source/frontend/src/{main.tsx,router.tsx,routes.ts}`, `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/implementation/{README.md,f-01-auth-session-implementation-plan.md}`, `docs/implement-report/f-01-auth-session-implement-report.md`, `docs/progress/*`
- Chuyển cả hai dự án sang bố cục `features/` + `shared/`; bộ lọc lỗi toàn cục `ErrorResponseDto`; `CsrfGuard`, `AuthenticatedGuard` toàn cục; phiên cookie `ctdt.sid` trong bảng `session` (PostgreSQL), hết hạn sau `SESSION_IDLE_MINUTES`.
- `User`, `session`, `UserStatus` — migration `20261018141101_auth_session` sinh bằng `migrate diff --from-empty`; seed tài khoản R1 (`pnpm prisma:seed`, chưa chạy trên cơ sở dữ liệu thật).
- API `/api/auth/{login,logout,me,change-password}`; màn hình MH-01, MH-02, MH-03; `RequireAuth` và ép đổi mật khẩu lần đầu.
- Kiểm tra: backend tsc 0, oxlint 0, đơn vị 26/26, đầu-cuối 14/14; frontend tsc 0, oxlint 0, đơn vị 20/20, `vite build` ổn; Prettier sạch. Dựng qua Codex (6 lượt), bộ điều phối chạy Vitest/Prisma.
- Còn nợ: đi thử bằng trình duyệt (kế hoạch §7). Sự cố lúc dựng và lệch kế hoạch ở báo cáo dựng.

## [2026-10-18] [F-01] Đi thử bằng trình duyệt — xong

- Áp migration `20261018141101_auth_session` lên cơ sở dữ liệu phát triển, chạy seed (`admin`); người dùng đi thử 6 bước của kế hoạch §7, đạt. F-01 ✅.

## [F-02] Tài khoản, vai trò, phạm vi quyền — dựng mã
**Date**: 2026-10-19
**Files changed**: `source/backend/prisma/{schema.prisma,seed.ts,seed-data/*,migrations/20261018151319_access_control}`, `source/backend/src/shared/{authz,pagination,time,password,dtos}/*`, `source/backend/src/features/{users,permissions,org-units}/*`, `source/backend/src/app.module.ts`, `source/backend/test/*`, `source/frontend/src/shared/{api,auth,org-units,layout}/*`, `source/frontend/src/features/{users,permissions}/*`, `source/frontend/src/{router.tsx,routes.ts,test/setup.ts}`, `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/implementation/{README.md,f-02-accounts-roles-permissions-implementation-plan.md}`, `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md`, `docs/progress/*`
- `PermissionGuard` toàn cục, từ chối mặc định; `@RequirePermission` / `@AnyAuthenticated`; `AccessContext` nạp mỗi yêu cầu qua `ScopeService`; vai trò suy ra theo `Role.scopeSource`.
- Bảng `OrgUnit` (tối thiểu), `Role`, `Permission`, `RolePermission`, `RoleAssignment`, `User.orgUnitId` — migration `access_control` đã áp; seed 3 đơn vị, 6 vai trò, 41 quyền, 123 ô, chạy lại không đổi.
- API tài khoản, gán/thu hồi vai trò, ma trận quyền; màn hình MH-05, MH-06, MH-15; menu và route lọc theo quyền.
- Kiểm tra: backend tsc 0, oxlint 0, đơn vị 66/66, đầu-cuối 39/39; frontend tsc 0, oxlint 0, đơn vị 35/35, `vite build` ổn; Prettier sạch. Dựng qua Codex (4 lượt), bộ điều phối sinh migration và chạy kiểm thử.
- Còn nợ: đi thử bằng trình duyệt (kế hoạch §7). Sự cố lúc dựng ở báo cáo dựng; không có lỗi đã phát hành nên không ghi `error_log.md`.
