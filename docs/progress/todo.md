# Project TODO

Legend: ✅ Done | 🔄 In Progress | ⚠️ Stub/Partial | ❌ Not Started

ENTRY FORMAT: `| XX | Item description | ❌ | Short approach note — what the implementation should do |`

**MVP (2026-10-18):** F-01..F-08, F-10, F-11, F-13, F-14, F-15 làm trước (`docs/planning/epics.md` §0); các tính năng khác ghi `sau MVP`.

Một dòng cho mỗi tính năng; việc chi tiết (CV-xxx) ở `docs/planning/task-breakdown.md`, câu hỏi ở `docs/planning/feature-questions.md`, kế hoạch ở `docs/implementation/`.

---

## Core / Infrastructure

| # | Item | Status | Notes |
|---|---|---|---|
| F-00 | Khung backend + frontend, trạng thái hệ thống | ✅ | `GET /api/health`, `HealthPage`; kiểm thử đơn vị và đầu-cuối |
| C-01 | Thiết lập Claude Code + tài liệu dự án | ✅ | `.claude/`, `CLAUDE.md`, `docs/architecture`, `docs/progress` |
| C-02 | Câu hỏi theo tính năng | ✅ | Trả lời 2026-10-18; câu trống nhận A; bốn trả lời khác A đã sửa vào tài liệu nguồn |
| C-04 | Kế hoạch triển khai tính năng | ✅ | F-01..F-11, F-13, F-14, F-15 — đủ 13 kế hoạch MVP; tính năng sau MVP viết kế hoạch khi tới lượt |
| C-03 | Sửa lỗi mẫu `claude-code-templates` | ❌ | Bốn lỗi; sửa ở mẫu và bản đang dùng cùng lúc; cần đồng ý |

## B1 — Nền tảng và danh mục học phần

| # | Item | Status | Notes |
|---|---|---|---|
| F-01 | Đăng nhập, phiên | ✅ | Dựng 2026-10-18; kiểm thử xanh, seed đã chạy, người dùng đi thử 6 bước bằng trình duyệt đạt |
| F-02 | Tài khoản, vai trò, phạm vi quyền | 🔄 | Mã xong 2026-10-19, kiểm thử xanh, migration `access_control` + seed đã chạy; còn nợ đi thử bằng trình duyệt (kế hoạch §7) |
| F-03 | Đơn vị và nhóm chuyên môn | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 101, đầu-cuối 69; frontend 44); còn nợ đi thử bằng trình duyệt và áp migration `subject_groups` lên cơ sở dữ liệu phát triển — `docs/implement-report/f-03-org-units-subject-groups-implement-report.md` |
| F-04 | Danh mục học phần | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 149, đầu-cuối 97; frontend 65); còn nợ đi thử bằng trình duyệt (kế hoạch §7) và áp migration `courses` lên cơ sở dữ liệu phát triển — `docs/implement-report/f-04-course-catalog-implement-report.md` |
| F-05 | Quan hệ học phần, nhóm tương đương | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 223, đầu-cuối 130; frontend 93); chống chu trình (BR-11), nhóm tương đương (DEC-06), ngừng mở lớp đi được đường thành công (KB-008); còn nợ đi thử bằng trình duyệt (kế hoạch §7) và áp migration `course_relations` lên cơ sở dữ liệu phát triển — `docs/implement-report/f-05-course-relations-equivalence-implement-report.md` |

## B2 — Chương trình đào tạo và khung

| # | Item | Status | Notes |
|---|---|---|---|
| F-06 | Thông tin chương trình, Giám đốc CTĐT | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 269, đầu-cuối 158; frontend 119); `Program`/`ProgramVersion` ở Nháp, Giám đốc CTĐT có thời hạn và lịch sử, phạm vi R3 thật, nhân bản qua `VersionContentCopier`; còn nợ đi thử bằng trình duyệt (kế hoạch §7), áp migration `programs` lên cơ sở dữ liệu phát triển và thay giá trị giữ chỗ của 1024034 — `docs/implement-report/f-06-programs-directors-implement-report.md` |
| F-07 | Khung chương trình, nhóm tự chọn | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 358, đầu-cuối 193; frontend 173); khung có điều kiện riêng, nhóm tự chọn, kéo thả, nhân bản chép khung, chặn giảm số học kỳ; còn nợ đi thử bằng trình duyệt (kế hoạch §7, 9 bước), áp migration `curriculum` lên cơ sở dữ liệu phát triển, nạp danh mục khối kiến thức và thay dữ liệu mẫu DEMO* của 1024034 — `docs/implement-report/f-07-curriculum-elective-groups-implement-report.md` |
| F-08 | Kiểm tra nhất quán | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 391, đầu-cuối 207; frontend 190); tổng tín chỉ theo mức tối thiểu của nhóm, chấp nhận chênh lệch kèm lý do, `ConsistencyChecker.assertPasses` cho F-13/F-15; còn nợ đi thử bằng trình duyệt (kế hoạch §7, 8 bước) và áp migration `credit_mismatch_acceptance` — `docs/implement-report/f-08-consistency-check-implement-report.md` |
| F-09 | Nhập, xuất Excel | ❌ | Sau MVP. ExcelJS trong worker; chạy thử → xác nhận |

## B3 — Đề cương và chuẩn đầu ra

| # | Item | Status | Notes |
|---|---|---|---|
| F-10 | Đề cương | 🔄 | Mã xong 2026-10-19; còn nợ: đi thử bằng trình duyệt (kế hoạch §7) và áp migration `20261019095730_syllabi` |
| F-11 | PLO, CLO, ma trận | 🔄 | Mã xong 2026-10-19; còn nợ: đi thử bằng trình duyệt (báo cáo dựng) và áp migration `20261019102707_outcomes` lên cơ sở dữ liệu phát triển |
| F-12 | Công thức điểm, đánh giá–CLO | ❌ | Sau MVP |

## B4 — Đề xuất thay đổi và phiên bản

| # | Item | Status | Notes |
|---|---|---|---|
| F-13 | Đề xuất thay đổi | 🔄 | Mã xong 2026-10-19 (bản nháp làm việc, so sánh, định tuyến ba cấp, gửi duyệt); còn nợ: đi thử bằng trình duyệt NT-B4-01/03/09 với R1–R5 và áp migration `20261019110535_change_requests` (`pnpm prisma:migrate` rồi `pnpm prisma:seed`) — `docs/implement-report/f-13-change-requests-implement-report.md` |
| F-14 | Duyệt ba cấp, thông báo | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 707, đầu-cuối 330; frontend 376); Đồng ý / Trả lại / Từ chối / Duyệt thay, hàng chờ, thông báo trong ứng dụng, bình luận, lịch sử; còn nợ: đi thử bằng trình duyệt NT-B4-04 (migration đã áp lên `ctdt-dev-pg`) — `docs/implement-report/f-14-three-level-approval-notifications-implement-report.md` |
| F-15 | Ban hành, ảnh chụp phiên bản | 🔄 | Mã xong 2026-10-19, kiểm thử xanh (backend đơn vị 853, đầu-cuối 391; frontend 411); ban hành khởi tạo, phê duyệt cuối, kích hoạt đầu học kỳ, đính chính; còn nợ: đi thử bằng trình duyệt NT-B4-01/05/06/10/12 (migration đã áp lên `ctdt-dev-pg`) — `docs/implement-report/f-15-release-version-snapshots-implement-report.md` |
| F-16 | So sánh phiên bản, gán khóa | ❌ | Sau MVP |
| F-26 | Sao lưu, diễn tập phục hồi | ❌ | Sau MVP. `pg_dump` hằng ngày + thư mục tệp |

## B5 — Sinh viên, điều kiện đăng ký, xét tốt nghiệp

| # | Item | Status | Notes |
|---|---|---|---|
| F-17 | Hồ sơ sinh viên, kết quả học tập | ❌ | |
| F-18 | Điều kiện đăng ký học phần | ❌ | |
| F-19 | Xét tốt nghiệp | ❌ | Xét hàng loạt trong worker |
| F-20 | Cổng sinh viên | ❌ | |
| F-21 | API cho dDUT | ❌ | Khóa API, nhật ký từng lời gọi |

## B6 — Tích hợp, báo cáo, hoàn thiện

| # | Item | Status | Notes |
|---|---|---|---|
| F-22 | Đồng bộ cơ sở dữ liệu Trường | ❌ | `mssql`, chỉ đọc, theo lịch |
| F-23 | Báo cáo kiểm định | ❌ | |
| F-24 | Đồ thị, PDF, dòng thời gian, bảng sức khỏe | ❌ | Puppeteer |
| F-25 | Ủy quyền, email, nhắc hạn | ❌ | Nodemailer |
| F-27 | Triển khai, thử tải, theo dõi hoạt động | ❌ | Docker Compose + Caddy |
