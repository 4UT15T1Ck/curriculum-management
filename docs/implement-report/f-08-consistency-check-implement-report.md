# F-08 Kiểm tra nhất quán — Implement Report

Kế hoạch: `docs/implementation/f-08-consistency-check-implementation-plan.md`. Tệp này ghi những gì **đã dựng**.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-05, FE-01..FE-04 xong (2026-10-19); DOC-01 rút gọn (xem Lệch 7) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Migration | `20261019092846_credit_mismatch_acceptance`, sinh bằng `prisma migrate dev --create-only` trên PostgreSQL 18 thật (ICU `vi-VN`), nối tay `CHECK` năm-hoặc-không; `migrate dev` lần hai báo "Already in sync" |
| Còn nợ | Đi thử 8 bước §7 bằng trình duyệt; áp migration lên cơ sở dữ liệu phát triển |

### Kết quả kiểm tra

| Dự án | tsc | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | 0 lỗi | oxlint 0 | 391/391 (45 tệp) | 207/207 (13 tệp) | Prettier sạch |
| frontend | 0 lỗi | oxlint 0 | 190/190 (38 tệp) | — | `vite build` ổn; Prettier sạch |

## API cho F-13 và F-15

`ConsistencyChecker` (`src/shared/curriculum/consistency-checker.ts`, xuất qua `CurriculumSharedModule`): `check(versionId, db?)` trả `{ version, credits, groups, issues }`; `assertPasses(versionId, db = prisma)` ném 409 `CONSISTENCY_FAILED`, `details` mỗi lỗi `{ field: <mã>, constraints: [thông điệp] }`. Gọi trong giao dịch sau `lockRequisiteGraph(tx)`.

## Lệch kế hoạch

1. `CourseRelation` lọc theo `relationType`, không phải `type` như kế hoạch.
2. Đường dẫn bảng quyền: `test/permission-table.ts` (kế hoạch ghi `permission-matrix.e2e-spec.ts`); thêm 2 dòng.
3. `totalCredits`, `compulsoryCredits`, `electiveCredits` thêm vào `VERSION_SELECT` (`curriculum-access.ts`) thay vì chỉ `findVersion`.
4. `curriculumCycleHits` thêm cạnh `curriculumCycles` để biết dòng nào khép vòng (`itemId` của `REQUISITE_CYCLE`); `curriculumCycles` giữ đúng chữ ký kế hoạch.
5. Không có `PageContainer`/`ApiErrorAlert` (như F-04..F-07): trang dùng `Flex`, `Result`, `Skeleton`; `formatDateTime` không tồn tại nên dùng `dayjs`.
6. Fixture e2e dùng số nhỏ (khai báo 10/6/16, tính từ khung 8/6/14) thay cho 150/98/148 nhưng giữ cùng hình dạng ca KB-013/KB-018; ca "xóa dòng 3 tín chỉ" cho chênh lệch -5.
7. Theo yêu cầu tiết kiệm của người dùng: không cập nhật `docs/architecture/*`, `docs/implementation/README.md`, `docs/technical/technical_reference.md` (đồng bộ một lần cuối MVP). `data-dictionary.md`, `erd.md`, `screen-inventory.md` đã mang ghi chú F-08 từ lúc viết kế hoạch.
8. Mọi câu hỏi mở dùng mặc định của kế hoạch (§F-08 toàn A, D3 nhóm chỉ có số học phần tính tín chỉ của các thành viên rẻ nhất).
9. Modal chấp nhận: khi gặp `CREDIT_GAP_CHANGED` thì khóa nút "Chấp nhận" và chạy lại báo cáo; người dùng đóng và mở lại để thấy chênh lệch mới (không gửi chênh lệch chưa xem).

`curriculumWarnings` có một chỗ gọi, đã chuyển sang chữ ký mới: `CurriculumReadService.read`; `ConsistencyChecker.check` là chỗ gọi thứ hai (mới).

## USER ACTIONS

- Xác nhận mặc định: D3 (nhóm chỉ đặt số học phần tính theo thành viên rẻ nhất), D4 (dòng tự chọn không thuộc nhóm không tính vào tổng, cảnh báo HIGH), D7 (R1, R3 chấp nhận; R4 không), R5 xem được MH-27.
- Áp migration: `pnpm prisma:migrate` trong `source/backend`.
- Đi thử 8 bước ở kế hoạch §7.
- Giới hạn giao diện: tìm lại một dòng bị lọc ẩn sẽ xóa bộ lọc; ở chế độ "Theo học kỳ" dòng được chọn chỉ cuộn tới, không tô sáng.
