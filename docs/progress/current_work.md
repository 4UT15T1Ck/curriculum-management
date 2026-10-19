# Current Work — In Progress

## Session Context

- **Last updated**: 2026-10-19
- **Active area**: dựng bản MVP (`docs/planning/epics.md` §0)
- **Start here**: dựng F-15 (ban hành, ảnh chụp phiên bản; xem `docs/implementation/` và README). F-14 đã xong mã: `ApprovalRecorder` / `RequestNotifier` dùng chung cho phê duyệt cuối, đề xuất dữ liệu ở cấp 3 đang trả `FINAL_APPROVAL_REQUIRED` chờ MH-43 của F-15; F-15 thêm `REQUEST_EFFECTIVE` và `canFinalApprove`. Chi tiết hook ở báo cáo dựng F-14.

---

## Active Item: Dựng bản MVP

**Status**: F-01 xong 2026-10-18; F-02..F-08, F-10, F-11, F-13 và F-14 mã xong 2026-10-19, còn nợ đi thử bằng trình duyệt; F-15 còn lại chưa dựng.

### Còn nợ
- F-02: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (chọn để sau) — `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md`.

- F-03: người dùng đi thử bằng trình duyệt (kế hoạch §7) và áp migration `20261019024639_subject_groups` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-03-org-units-subject-groups-implement-report.md`.

- F-04: người dùng đi thử bằng trình duyệt (kế hoạch §7) và áp migration `20261019072717_courses` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-04-course-catalog-implement-report.md`.

- F-05: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (A–B tiên quyết kèm ngưỡng, vòng A → B → C → A, song hành hai chiều, ngừng mở lớp kèm học phần thay thế, nhóm tương đương và gộp nhóm) và áp migration `20261019075207_course_relations` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate`) — `docs/implement-report/f-05-course-relations-equivalence-implement-report.md`.

- F-06: người dùng đi thử 6 bước kế hoạch §7 bằng trình duyệt (danh sách 1024034 với "Nháp", thêm chương trình lệch tín chỉ thấy chênh lệch rồi sửa, phân công Giám đốc rồi đăng nhập bằng người đó, kết thúc phân công hôm qua, nhân bản, ngừng sử dụng), áp migration `20261019082727_programs` lên cơ sở dữ liệu phát triển (`pnpm prisma:migrate` rồi `pnpm prisma:seed`), và thay giá trị giữ chỗ của 1024034 bằng số liệu từ tệp Excel khung của Khoa — `docs/implement-report/f-06-programs-directors-implement-report.md`.

- F-07: người dùng đi thử 9 bước kế hoạch §7 bằng trình duyệt (khung theo dòng và theo học kỳ, lọc, thêm trùng / học kỳ 9, điều kiện xếp sau và vòng, kéo thả kể cả bàn phím, nhóm tự chọn, "Chương trình đang sử dụng" ở học phần, đăng nhập R4), áp migration `20261019085325_curriculum` (`pnpm prisma:migrate` rồi `pnpm prisma:seed`), nạp danh mục khối kiến thức khi có tệp Excel và thay sáu học phần mẫu DEMO* của 1024034 — `docs/implement-report/f-07-curriculum-elective-groups-implement-report.md`.
- F-08: người dùng đi thử 8 bước kế hoạch §7 bằng trình duyệt (thẻ credit, chấp nhận chênh lệch kèm lý do, xóa dòng thấy cảnh báo trở lại, vòng danh mục–khung, "Tới chỗ sửa", dòng tổng chương trình, thẻ ở tổng quan, đăng nhập R2) và áp migration `20261019092846_credit_mismatch_acceptance` (`pnpm prisma:migrate`) — `docs/implement-report/f-08-consistency-check-implement-report.md`.
- F-11: người dùng đi thử bằng trình duyệt (PLO thêm / trùng mã / xóa có đếm, ma trận học phần–PLO nhập `0,5` và `1,5`, xóa ô có liên kết CLO, ma trận CLO–PLO cột bị khóa, kiểm tra phủ đăng nhập R4, tab CLO và bật EN, nhân bản chương trình, R6) và áp migration `20261019102707_outcomes` (`pnpm prisma:migrate`) — `docs/implement-report/f-11-plo-clo-matrices-implement-report.md`.
- F-13: người dùng đi thử bằng trình duyệt NT-B4-01/03/09 với R1–R5 (tạo đề xuất từng loại, sửa bản nháp làm việc, so sánh, gửi duyệt, rút) và áp migration `20261019110535_change_requests` (`pnpm prisma:migrate` rồi `pnpm prisma:seed`) — `docs/implement-report/f-13-change-requests-implement-report.md`.
- F-14: người dùng đi thử NT-B4-04 bằng trình duyệt (R5 gửi, R4 và R3 đồng ý, R1 Trả lại ở cấp 3, gửi lại, Duyệt thay, bình luận, chuông, MH-42, đề xuất tổ chức, tab mở 61 phút); migration `20261019122753_approval_comments_notifications` đã áp lên `ctdt-dev-pg` — `docs/implement-report/f-14-three-level-approval-notifications-implement-report.md`.
- F-10: người dùng đi thử 7 bước kế hoạch §7 bằng trình duyệt (tạo Nháp, soạn đậm / danh sách / bảng, dán `<script>`, tuần kéo thả, bật EN và "Chưa dịch", tệp PDF tên tiếng Việt và tệp bị từ chối, hai chương trình cùng đề cương, R5 khác nhóm, R6) và áp migration `20261019095730_syllabi` (`pnpm prisma:migrate`); đặt `FILES_ROOT` vào ổ bền — `docs/implement-report/f-10-syllabus-implement-report.md`.

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

1. **Dựng F-15** — theo thứ tự trong README.
2. **Template** — sửa bốn lỗi của `E:\claude-code-templates` đã ghi ở báo cáo khởi tạo (hook chỉ dùng jq, sai đường dẫn migration, agent dùng npm/Biome, trùng tên agent giữa hai stack); cần người dùng đồng ý.
3. **Volta** — `volta install pnpm@10.23.0` để pnpm chạy trên Node 22; cần người dùng đồng ý.
