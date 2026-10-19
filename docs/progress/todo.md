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
| F-05 | Quan hệ học phần, nhóm tương đương | ❌ | Chống chu trình (BR-11), nhóm tương đương (DEC-06) |

## B2 — Chương trình đào tạo và khung

| # | Item | Status | Notes |
|---|---|---|---|
| F-06 | Thông tin chương trình, Giám đốc CTĐT | ❌ | `Program`, `ProgramVersion` ở Nháp, nhân bản |
| F-07 | Khung chương trình, nhóm tự chọn | ❌ | `CurriculumItem`, `ElectiveGroup` |
| F-08 | Kiểm tra nhất quán | ❌ | Quy tắc trên khung Nháp |
| F-09 | Nhập, xuất Excel | ❌ | Sau MVP. ExcelJS trong worker; chạy thử → xác nhận |

## B3 — Đề cương và chuẩn đầu ra

| # | Item | Status | Notes |
|---|---|---|---|
| F-10 | Đề cương | ❌ | Một đề cương dùng chung cho một học phần, chuỗi bản |
| F-11 | PLO, CLO, ma trận | ❌ | CLO–PLO theo chương trình, chỉ tới PLO học phần đã gắn; Học phần–PLO nhập trực tiếp kèm trọng số |
| F-12 | Công thức điểm, đánh giá–CLO | ❌ | Sau MVP |

## B4 — Đề xuất thay đổi và phiên bản

| # | Item | Status | Notes |
|---|---|---|---|
| F-13 | Đề xuất thay đổi | ❌ | Bảy loại đề xuất, hồ sơ đính kèm |
| F-14 | Duyệt ba cấp, thông báo | ❌ | Trả lại / Từ chối, bỏ lượt người tạo |
| F-15 | Ban hành, ảnh chụp phiên bản | ❌ | Ban hành khởi tạo (H-1), kích hoạt đầu học kỳ |
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
