# Hướng dẫn cài đặt và kiểm thử — bản MVP

Một chỗ để bắt đầu: dựng hệ thống trên máy, chạy kiểm thử tự động, rồi đi thử bằng trình duyệt theo từng tính năng. Kịch bản chi tiết không chép lại ở đây — tài liệu này **trỏ tới** nơi chúng đã có.

| Cần gì | Ở đâu |
|---|---|
| Bước đi thử từng tính năng (nguồn chính) | §7 "Kiểm chứng" của `docs/implementation/f-xx-*-implementation-plan.md`, tóm tắt lại ở mục USER ACTIONS / đi thử của `docs/implement-report/f-xx-*-implement-report.md` |
| Kịch bản nghiệm thu theo bậc (NT-Bx-yy) | `docs/planning/test-plan.md` §7 |
| Kịch bản quy tắc nghiệp vụ và trường hợp biên (KB-xxx) | `docs/planning/test-plan.md` §6 |
| Kiểm chứng yêu cầu phi chức năng | `docs/planning/test-plan.md` §8 |
| Mẫu ghi kết quả kiểm thử tay | `docs/testing/_TEMPLATE.md`, quy ước ở `docs/testing/README.md` |

---

## 1. Cài đặt lần đầu

**Cần có:** Node.js 22 (≥ 22.22), pnpm 10, Docker.

### 1.1. Backend — `source/backend`

1. `pnpm install` (tự chạy `prisma generate`).
2. `pnpm services:up` — dựng PostgreSQL 18 (ICU `vi-VN`) và Redis 8. Nếu cổng 6379 đã bị chiếm, đặt `REDIS_PORT` khác trước khi chạy.
3. Tạo `.env` cạnh `package.json`:

   ```env
   DATABASE_URL=postgresql://ctdt:ctdt@localhost:5432/ctdt
   REDIS_HOST=localhost
   REDIS_PORT=6379
   SESSION_SECRET=<chuỗi ngẫu nhiên ≥ 32 ký tự>
   FILES_ROOT=files
   ```

   Các biến tùy chọn (`PORT`, `SESSION_IDLE_MINUTES`, `ATTACHMENT_MAX_MB`, `BULLMQ_PREFIX`): `docs/technical/technical_reference.md`.
4. `pnpm prisma:migrate` — áp 13 migration (`auth_session` … `release_versions`).
5. `SEED_ADMIN_PASSWORD=<≥ 8 ký tự, có chữ và số> pnpm prisma:seed` — chạy lại nhiều lần không sinh trùng.
6. `pnpm dev` → API `http://localhost:3000/api`, tài liệu API `http://localhost:3000/api/docs`.
7. Kiểm tra: `GET /api/health` trả `{"status":"ok","database":"up","redis":"up"}`.

### 1.2. Frontend — `source/frontend`

1. `pnpm install`
2. `pnpm dev` → `http://localhost:5173` (Vite chuyển `/api` sang `localhost:3000`).
3. Đăng nhập `admin` / mật khẩu seed → hệ thống buộc đổi mật khẩu lần đầu.

Khi API đổi: chạy backend rồi `pnpm api:types` để sinh lại `src/shared/api/schema.d.ts`.

### 1.3. Seed tạo sẵn gì

| Dữ liệu | Ghi chú |
|---|---|
| Tài khoản `admin` (R1) | Tài khoản duy nhất; các vai khác tạo ở §3.1 |
| 3 đơn vị: Trường ĐHBK (`DHBK`), Khoa CNTT, Phòng Đào tạo (`PDT`) | |
| 6 vai trò R1..R6, 43 quyền, ma trận quyền | |
| Cấp duyệt, danh mục khối kiến thức (rỗng) | |
| CTĐT 1024034 (bản Nháp) + 6 học phần `DEMO*` + khung mẫu | **Dữ liệu giữ chỗ** — thay bằng Excel thật của Khoa |
| Học kỳ, khóa | **Giữ chỗ** — thay bằng lịch thật |

---

## 2. Kiểm thử tự động

| Lệnh | Ở đâu | Ghi chú |
|---|---|---|
| `pnpm exec tsc --noEmit -p tsconfig.json` · `pnpm lint` · `pnpm format:check` | backend | |
| `pnpm test` | backend | Đơn vị, không cần Docker (853 ca lúc bàn giao) |
| `pnpm test:e2e` | backend | Cần Docker đang chạy. Dựng một PostgreSQL + một Redis cho cả lượt (`test/global-setup.ts`), mỗi tệp một cơ sở dữ liệu riêng (391 ca, ~1–2 phút) |
| `pnpm exec tsc -b` · `pnpm lint` · `pnpm format:check` · `pnpm build` | frontend | |
| `pnpm -s test --run` | frontend | 411 ca |

Ma trận quyền được kiểm tự động ở `source/backend/test/permission-table.ts` (mỗi ô: một lời gọi được phép, một lời gọi bị từ chối).

---

## 3. Đi thử bằng trình duyệt

### 3.1. Chuẩn bị tài khoản cho các vai

Đăng nhập `admin`, vào **Tài khoản** (MH-05) tạo các tài khoản dưới đây. R3, R4, R5 là vai **suy ra** — chúng chỉ có hiệu lực khi có phân công tương ứng.

| Vai | Ai | Cách cấp |
|---|---|---|
| R1 | Phòng Đào tạo | Gán vai R1 (MH-06) — `admin` đã có |
| R2 | Ban lãnh đạo khoa | Gán vai R2 |
| R3 | Giám đốc CTĐT | Phân công Giám đốc trên trang CTĐT (MH-22) |
| R4 | Điều phối nhóm chuyên môn | Thêm vào nhóm chuyên môn với vai Điều phối (cần F-03: tạo nhóm trước) |
| R5 | Giảng viên | Thêm vào nhóm chuyên môn làm thành viên |
| R6 | Sinh viên | Gán vai R6, phạm vi đơn vị (không gán phạm vi toàn hệ thống — sẽ thấy cả bản Nháp) |

Nên tạo thêm **một giảng viên ở nhóm khác** và **một Giám đốc của CTĐT khác** để thử các trường hợp bị từ chối do ngoài phạm vi.

### 3.2. Thứ tự đi thử

Đi theo thứ tự dưới đây — mỗi tính năng dùng dữ liệu tạo ở tính năng trước. Bước cụ thể nằm trong báo cáo dựng của tính năng (cột cuối). Xong tính năng nào thì đổi 🔄 → ✅ ở `docs/progress/todo.md`.

| # | Tính năng | Vai | Nghiệm thu | Bước chi tiết |
|---|---|---|---|---|
| 1 | F-02 Tài khoản, vai trò, quyền | R1, R5 | NT-B1-02, NT-B1-07 | `implement-report/f-02-*` (6 bước) |
| 2 | F-03 Đơn vị, nhóm chuyên môn | R1, R4 | NT-B1-01, NT-B1-02 | `implement-report/f-03-*` |
| 3 | F-04 Danh mục học phần | R1, R4, R5 | NT-B1-03 | `implement-report/f-04-*` (9 bước) |
| 4 | F-05 Quan hệ học phần, nhóm tương đương | R1, R4 | NT-B1-04, NT-B1-05 | `implement-report/f-05-*` (6 bước) |
| 5 | F-06 CTĐT, Giám đốc CTĐT | R1, R3 | NT-B2-08 | `implement-report/f-06-*` (6 bước) |
| 6 | F-07 Khung, nhóm tự chọn | R1, R4 | NT-B2-04, NT-B2-05, NT-B2-07 | `implement-report/f-07-*` (9 bước) |
| 7 | F-08 Kiểm tra nhất quán | R1, R2, R3 | NT-B2-06 | `implement-report/f-08-*` (8 bước) |
| 8 | F-10 Đề cương | R3, R5, R6 | NT-B3-01, NT-B3-02 | `implement-report/f-10-*` (7 bước) |
| 9 | F-11 PLO, CLO, ma trận | R1, R3, R4, R6 | NT-B3-03, NT-B3-04, NT-B3-05 | `implement-report/f-11-*` (8 bước) |
| 10 | F-15 phần 1 — ban hành khởi tạo | R1 | NT-B4-01 | `implement-report/f-15-*` |
| 11 | F-13 Đề xuất thay đổi | R1..R5 | NT-B4-03, NT-B4-09 | `implement-report/f-13-*` |
| 12 | F-14 Duyệt ba cấp, thông báo | R1, R2, R3, R4, R5 | NT-B4-04, NT-B4-07, NT-B4-08 | `implement-report/f-14-*` |
| 13 | F-15 phần 2 — duyệt cuối, kích hoạt, đính chính | R1, R3 | NT-B4-05, NT-B4-06, NT-B4-10, NT-B4-12 | `implement-report/f-15-*` |

**Không kiểm ở MVP** (tính năng sau MVP): NT-B1-06 (nhật ký kiểm toán), NT-B2-01..03, NT-B2-09 (Excel, F-09), NT-B3-06..08 (công thức điểm, F-12), NT-B4-02 (đề xuất sửa công thức điểm, F-12), NT-B4-11 (gán khóa, F-16), toàn bộ B5, B6.

### 3.3. Luồng xuyên suốt (kiểm tra chức năng tổng thể)

Sau khi từng tính năng đạt, chạy một lượt nối liền để thấy các tính năng ăn khớp:

1. R1 tạo CTĐT, phân công Giám đốc (R3).
2. R1/R4 dựng khung, nhóm tự chọn, điều kiện tiên quyết; R5 soạn đề cương và CLO; R3 khai báo PLO và ma trận.
3. Kiểm tra nhất quán sạch lỗi (hoặc chấp nhận chênh lệch tín chỉ kèm lý do).
4. R1 ban hành phiên bản khởi tạo → sửa trực tiếp dữ liệu đã ban hành bị từ chối, nút đổi thành "Tạo đề xuất".
5. R5 tạo đề xuất sửa đề cương / khung, sửa bản làm việc, xem so sánh, gửi duyệt.
6. R4 → R3 → R1 duyệt (thử Trả lại một lần, gửi lại); chuông thông báo đếm đúng.
7. R1 duyệt cuối, chọn học kỳ hiệu lực → phiên bản mới chờ kích hoạt; khi tới học kỳ, phiên bản cũ thành Lịch sử.
8. R6 chỉ thấy bản đã ban hành.

### 3.4. Ghi kết quả

Mỗi lượt kiểm tay ghi một tệp `docs/testing/feature__<slug>.md` theo `_TEMPLATE.md`. Lỗi tìm thấy: ghi vào `docs/troubleshooting/error_log.md` khi đã sửa.
