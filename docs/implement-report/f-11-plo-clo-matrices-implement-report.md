# F-11 PLO, CLO và ma trận — Implement Report

Kế hoạch: `docs/implementation/f-11-plo-clo-matrices-implementation-plan.md`. Tệp này ghi những gì **đã dựng**.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-08, FE-01..FE-07 xong (2026-10-19) |
| Migration | `20261019102707_outcomes` (sinh bằng `migrate dev --create-only` trên `ctdt-dev-pg`, nối tay `CHECK "CoursePLOMapping_weight_range"`); đã áp, `migrate dev` lần hai báo "Already in sync" |
| Còn nợ | Đi thử bằng trình duyệt (USER ACTIONS) |

| Dự án | tsc | Lint | Đơn vị | Đầu-cuối |
|---|---|---|---|---|
| backend | 0 lỗi | oxlint 0 | 543/543 | 267/267 |
| frontend | 0 lỗi | oxlint 0 | 291/291 | — |

Prettier và build sạch ở cả hai.

## Lệch kế hoạch

1. Mã lỗi version dùng mã có sẵn của curriculum: `PROGRAM_VERSION_NOT_FOUND` (kế hoạch ghi `VERSION_NOT_FOUND`).
2. Fixture ở `test/fixtures/outcomes.ts` (không phải `test/support/fixtures.ts`); ca nhân bản nằm trong `test/outcomes.e2e-spec.ts` thay vì sửa `programs.e2e-spec.ts`.
3. Bảng cài đặt: không dùng `Map.groupBy` (target ES2023), thêm `src/shared/collections/group-by.ts`; thêm `touchSyllabus` vào `syllabus-access.ts` dùng chung cho tuần và CLO.
4. Bảng ma trận học phần–PLO không dùng `virtual`: chỉ một ô là `Input` tại một thời điểm (bấm để sửa), đủ nhẹ cho 200 × 30 ô và kiểm thử được trong jsdom.
5. `ProgramSectionLinks` nằm ở `features/programs/components/` (đã có sẵn), không phải `shared/programs/`; thêm bốn thẻ, ẩn ba thẻ ma trận khi mọi vai trò là R6 (`useSeesMatrices`).
6. Không thêm mục menu: các màn hình theo từng phiên bản, vào từ thẻ ở tổng quan chương trình. Không sửa seed (quyền `outcome.view`, `plo.edit`, `clo.edit` có từ F-02).
7. Tab CLO hiện nhưng bị vô hiệu khi `canEditClos` sai (`EDITOR_TABS` có thêm `enabled`, `disabledHint`).
8. Đổi `useWeeklyReorder` thành lớp mỏng trên `useSortableReorder` dùng chung (cho tuần, CLO, PLO); test `reorderedWeekIds` chuyển thành `reorderedIds`.
9. Sửa nhỏ ngoài kế hoạch: bỏ import thừa ở `curriculum-access.ts`, thêm chú thích tắt `no-control-regex` có chủ đích ở `uploaded-file-name.ts` để lint 0 cảnh báo.
10. Mặc định theo kế hoạch: F11-02 B (trọng số nhập trực tiếp), F11-03 không có mức, F11-05 R6 chỉ xem PLO; `assertDraftWrite` giữ ở `features/syllabi` với tham số quyền (D1, D2). Các điểm gọi cũ của F-10 để nguyên mặc định `syllabus.edit`: `syllabi.service` `update`, `weekly-contents.service` (4), `syllabus-attachments.service` (2).

## Possible enhancements

- Bảng ma trận ảo hóa (`virtual`) nếu một chương trình vượt 200 dòng thực tế.
- Nhập hàng loạt trọng số (dán từ Excel) cho ma trận học phần–PLO; xuất Excel là F-25.
- Hoàn tác khi xóa PLO hoặc ô có liên kết CLO.

## USER ACTIONS

- Xác nhận các mặc định: CLO theo bản đề cương đã ban hành, chưa có thì Nháp (D6); R5 vào được báo cáo phủ có lọc theo nhóm (lệch BE-07); R6 xem PLO của mọi phiên bản thuộc chương trình mình.
- Áp migration: `pnpm prisma:migrate` trong `source/backend` (đã áp lên `ctdt-dev-pg` khi dựng).
- Đi thử: (1) thêm PLO1, thêm lại `plo1` thấy trùng mã, xóa PLO đã dùng thấy số ô và liên kết; (2) ma trận học phần–PLO: `0,5` lưu, `1,5` báo lỗi, xóa ô có liên kết CLO có hỏi lại; (3) tab CLO trong đề cương, gắn CLO vào tuần, bật EN; (4) ma trận CLO–PLO một học phần: cột chưa gắn bị khóa, lưu; (5) ma trận cả chương trình lọc học kỳ và PLO; (6) kiểm tra phủ, đăng nhập R4 thấy chỉ học phần nhóm mình; (7) nhân bản chương trình, sửa PLO bản sao; (8) R6 chỉ thấy PLO.
- Hạn chế giao diện: chưa đo hiệu năng với 200 × 30 ô; bảng ma trận chưa có thanh tìm học phần.

## Hooks cho tính năng sau

- F-13: thêm đường VIA_REQUEST cho `PlosService`, `CoursePloMatrixService`, `CloPloMatrixService`, `ClosService` (hiện trả `CHANGE_REQUEST_REQUIRED`); gọi qua `assertOutcomeWrite` / `assertDraftWrite(…, permission)`.
- F-15: thay `currentRevisionByCourse` (`src/shared/syllabi/current-revision.ts`) bằng bản ghim theo `CurriculumItem`; khi ban hành gán lại liên kết CLO theo `cloCode` và không để liên kết trỏ vào CLO của Nháp; `VersionContentCopier` đã chép PLO và hai ma trận.
- F-12: thêm số lần dùng ở đánh giá vào `CLO_INCLUDE` và `cloDeleteConfirm`; thêm tab sau tab CLO ở `EDITOR_TABS`.
- F-24 / F-26: tiêm `OutcomeGapsReader` (`OutcomesSharedModule`); F-21 dùng dạng `PloListDto`; F-25 đọc qua cùng các service.
