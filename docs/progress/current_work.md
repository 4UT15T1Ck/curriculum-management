# Current Work — In Progress

## Session Context

- **Last updated**: 2026-10-19
- **Active area**: dựng bản MVP (`docs/planning/epics.md` §0)
- **Start here**: dựng F-06 (`docs/implementation/f-06-programs-directors-implementation-plan.md`) — thông tin chương trình, Giám đốc CTĐT; F-06 dùng lại `assertSchoolWideDirect` và `useCanEditSchoolWide` do F-05 thêm, và điền bộ đọc phạm vi "CTĐT tôi phụ trách" cho R3.

---

## Active Item: Dựng bản MVP

**Status**: F-01 xong 2026-10-18; F-02, F-03, F-04, F-05 mã xong 2026-10-19, còn nợ đi thử bằng trình duyệt; 8 tính năng MVP còn lại chưa dựng.

### Còn nợ
- F-02: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (chọn để sau) — `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md`.

- F-03: người dùng đi thử bằng trình duyệt (kế hoạch §7) và áp migration `20261019024639_subject_groups` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-03-org-units-subject-groups-implement-report.md`.

- F-04: người dùng đi thử bằng trình duyệt (kế hoạch §7) và áp migration `20261019072717_courses` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-04-course-catalog-implement-report.md`.

- F-05: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (A–B tiên quyết kèm ngưỡng, vòng A → B → C → A, song hành hai chiều, ngừng mở lớp kèm học phần thay thế, nhóm tương đương và gộp nhóm) và áp migration `20261019075207_course_relations` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-05-course-relations-equivalence-implement-report.md`.

### Agreed Approach
- MVP = F-01..F-08, F-10, F-11, F-13, F-14, F-15 (13 tính năng, 298 điểm); F-09, F-12, F-16, F-26, B5, B6 làm sau.
- F-08 trong MVP vì gửi đề xuất và ban hành phải chặn khung còn lỗi.
- F-13 không mở đường nhập Excel vào bản Nháp của đề xuất (F-09 sau MVP).
- Dựng theo thứ tự phụ thuộc ở `docs/implementation/README.md`; mỗi kế hoạch ghi ràng buộc cho tính năng sau ở §8.

### Lưu ý khi chạy trên máy
- Cổng 6379 đang bị container valkey của dự án khác giữ: `docker compose up` cần đặt `REDIS_PORT` khác.
- Seed cần `SEED_ADMIN_PASSWORD` (≥ 8 ký tự, có chữ và số): `pnpm prisma:migrate` rồi `pnpm prisma:seed` trong `source/backend`.

### Cần người dùng xem khi duyệt F-15
- F-15 thêm cột `ChangeRequest.createdByAcademicOffice` (sửa mô hình của F-13) để chỉ đề xuất do Phòng Đào tạo tạo mới được ban hành vào học kỳ đã bắt đầu — `f-15-release-version-snapshots-implementation-plan.md` §8.

## Up Next

1. **Dựng F-06..F-08, F-10, F-11, F-13, F-14, F-15** — theo thứ tự trong README.
2. **Template** — sửa bốn lỗi của `E:\claude-code-templates` đã ghi ở báo cáo khởi tạo (hook chỉ dùng jq, sai đường dẫn migration, agent dùng npm/Biome, trùng tên agent giữa hai stack); cần người dùng đồng ý.
3. **Volta** — `volta install pnpm@10.23.0` để pnpm chạy trên Node 22; cần người dùng đồng ý.
