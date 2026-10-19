# Current Work — In Progress

## Session Context

- **Last updated**: 2026-10-19
- **Active area**: dựng bản MVP (`docs/planning/epics.md` §0)
- **Start here**: dựng F-03 (`docs/implementation/f-03-org-units-subject-groups-implementation-plan.md`) — mở rộng `OrgUnit` tối thiểu của F-02 và dựng nhóm chuyên môn mà các vai trò suy ra (R4, R5) cần.

---

## Active Item: Dựng bản MVP

**Status**: F-01 xong 2026-10-18; F-02 mã xong 2026-10-19, còn nợ đi thử bằng trình duyệt; F-03 đang dựng; 10 tính năng MVP còn lại chưa dựng.

### Còn nợ
- F-02: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (chọn để sau) — `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md`.

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

1. **Dựng F-04..F-08, F-10, F-11, F-13, F-14, F-15** — theo thứ tự trong README, sau F-03.
2. **Template** — sửa bốn lỗi của `E:\claude-code-templates` đã ghi ở báo cáo khởi tạo (hook chỉ dùng jq, sai đường dẫn migration, agent dùng npm/Biome, trùng tên agent giữa hai stack); cần người dùng đồng ý.
3. **Volta** — `volta install pnpm@10.23.0` để pnpm chạy trên Node 22; cần người dùng đồng ý.
