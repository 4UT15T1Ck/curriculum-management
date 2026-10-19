# Bàn giao — bản MVP

**Ngày**: 2026-10-19 · **Nhánh**: `claude/keen-meitner-2y7yf1` (chưa gộp vào `main`, chưa mở PR)

Đọc kèm: `docs/progress/todo.md` (trạng thái từng tính năng), `docs/implement-report/f-*-implement-report.md` (chi tiết, lệch kế hoạch, bước đi thử của từng tính năng).

## 1. Đã xong

Mã của cả 13 tính năng MVP đã dựng: F-01..F-08, F-10, F-11, F-13, F-14, F-15. F-01 đã đi thử bằng trình duyệt (✅); F-02..F-15 mã xong, kiểm thử xanh, **còn nợ đi thử bằng trình duyệt** (🔄).

| Kiểm tra (2026-10-19, sau F-15) | Backend | Frontend |
|---|---|---|
| tsc, oxlint (0 cảnh báo), Prettier | sạch | sạch |
| Kiểm thử đơn vị | 853/853 | 411/411 |
| Kiểm thử đầu-cuối (Testcontainers) | 391/391 | — |
| Build | ok | ok |

Kiểm thử đầu-cuối dùng chung một PostgreSQL + một Redis cho cả lượt (`test/global-setup.ts`); mỗi tệp nhận một cơ sở dữ liệu sao từ mẫu đã migrate.

## 2. Chạy trên máy

Trong `source/backend`: `pnpm install` → `pnpm services:up` (đặt `REDIS_PORT` khác nếu 6379 bận) → tạo `.env` (README backend) → `pnpm prisma:migrate` → `SEED_ADMIN_PASSWORD=... pnpm prisma:seed` → `pnpm dev`. Trong `source/frontend`: `pnpm install` → `pnpm dev`.

Biến mới so với README: `FILES_ROOT` (tệp đính kèm đề cương, mặc định `files/`), `BULLMQ_PREFIX` (chỉ khi dùng chung Redis), `SESSION_IDLE_MINUTES`.

## 3. Việc của người dùng

### 3.1. Đi thử bằng trình duyệt (bước cụ thể ở §7 kế hoạch / báo cáo dựng)
F-02 (6 bước) · F-03 · F-04 (9) · F-05 (6) · F-06 (6) · F-07 (9) · F-08 (8) · F-10 (7) · F-11 (8) · F-13 (NT-B4-01/03/09, vai R1..R5) · F-14 (NT-B4-04) · F-15 (NT-B4-01/05/06/10/12, vai R1, R3).

### 3.2. Xác nhận các lựa chọn mặc định đã lấy
- **F-06**: số học kỳ tối đa 12; mọi tài khoản không phải sinh viên làm được Giám đốc CTĐT; nhân bản lấy phiên bản hiện hành.
- **F-06 — cần quyết định**: US-021 AC3 bỏ nửa "học phần ngoài nhóm → 403" vì ma trận quyền cho R3 `course.edit` Đ trên mọi học phần trước khi ban hành. Sửa ma trận hay sửa tiêu chí?
- **F-07**: nhóm có cả hai mức tối thiểu thì đòi cả hai; tổng học kỳ tính cả học phần tự chọn; ký hiệu khối kiến thức nhập tự do.
- **F-08**: D3 (nhóm chỉ có số học phần → tính tín chỉ các học phần ít tín chỉ nhất), D4 (tự chọn ngoài nhóm cộng 0 + cảnh báo), D7 (R1, R3 chấp nhận chênh lệch; R4 không), R5 mở được MH-27.
- **F-10**: bản Nháp hiện cho R1..R5; R3/R4/R5 sửa trực tiếp Nháp học phần của Khoa, học phần Khoa khác chỉ R1; giới hạn 20 MB, 10 tệp/bản, 60 tuần, 100.000 ký tự/mục.
- **F-11**: CTĐT lấy CLO từ bản đề cương đã ban hành, chưa có thì bản Nháp; R5 xem báo cáo độ phủ trong nhóm mình; R6 chỉ xem PLO CTĐT của mình.
- **F-13, F-14, F-15**: các câu hỏi mở của từng kế hoạch nhận phương án mặc định (xem báo cáo dựng).
- **F-14 — cần quyết định**: bản làm việc bị **xóa** khi đề xuất bị Từ chối hoặc Thu hồi (kế hoạch để F-15 chọn); phần so sánh vẫn giữ trong `ChangeItem`.
- **F-15**: xem lại ghi chú §8 kế hoạch về `ChangeRequest.createdByAcademicOffice`.

### 3.3. Dữ liệu và môi trường
- Thay dữ liệu giả bằng dữ liệu thật từ Excel của Khoa (Q-11): CTĐT 1024034 trong `prisma/seed-data/programs.ts`, học phần `DEMO101..DEMO302`, danh mục `KnowledgeBlock`, học kỳ và khóa trong `prisma/seed-data/semesters.ts`.
- Áp các migration mới lên cơ sở dữ liệu phát triển của mình (`pnpm prisma:migrate`).
- Triển khai: `FILES_ROOT` nằm trên ổ bền và được sao lưu cùng cơ sở dữ liệu.
- Xóa thư mục thừa `source/node_modules/` (không theo dõi bởi git, do một lượt dựng tạo nhầm).
- Thư viện thêm ngoài kế hoạch: `@dnd-kit` (kéo thả, F-07). Tiptap, `sanitize-html` có trong kế hoạch F-10.

## 4. Giới hạn đã biết

- `/api/auth/me` chỉ trả mã quyền, không trả chế độ và phạm vi → nút sửa hiện cho cả người giữ quyền có phạm vi (R3..R5), máy chủ trả 403 (F-05, F-06, F-15).
- Tên các cấp duyệt là hằng số, chưa có bảng `ApprovalLevelConfig`.
- Ảnh chụp tên/tín chỉ chỉ ghi khi còn trống, chưa có thao tác làm mới.
- CTĐT ngừng hoạt động bị bỏ qua khi lan truyền thay đổi.
- Chưa đo hiệu năng ma trận 200 × 30 ô; sắp xếp lại khung không cập nhật lạc quan; tên tiếng Anh trong trình sửa dòng khung không xóa trắng được.
- Tuyến `/program-versions/:id/info` lặp lại kiểm tra tín chỉ/học kỳ của `ProgramsService.update`.
- Bảy DTO của F-02, F-03 còn bản sao `trim`/`emptyToNull` riêng, chưa chuyển sang `shared/dtos/transforms.ts`.

## 5. Tiếp theo

1. **Kiểm tra chức năng xuyên tính năng** (chưa làm): chạy trọn luồng tạo CTĐT → khung → kiểm tra nhất quán → đề xuất → duyệt ba cấp → ban hành → kích hoạt đầu học kỳ, qua API và trình duyệt (Playwright), với từng vai R1..R6; sửa lỗi thật, ghi lỗi dọn dẹp để sau.
2. **Đồng bộ tài liệu** một lượt: `docs/architecture/*`, `docs/implementation/README.md`, `docs/technical/technical_reference.md` (đã bỏ qua từ F-08 để tiết kiệm).
3. Đi thử bằng trình duyệt (§3.1), rồi đổi 🔄 → ✅ trong `todo.md`.
4. Sau MVP: F-09 (Excel), F-12 (công thức điểm — bổ sung điều kiện đánh giá vào DC-03), F-16 (so sánh phiên bản, gán khóa), F-26 (sao lưu), rồi B5, B6.
5. Gộp nhánh vào `main` (mở PR) khi đã đi thử xong.
