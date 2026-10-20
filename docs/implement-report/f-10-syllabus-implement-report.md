# F-10 Đề cương — Implement Report

Kế hoạch: `docs/implementation/f-10-syllabus-implementation-plan.md`. Tệp này ghi những gì **đã dựng**.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-07, FE-01..FE-06 xong (2026-10-19); DOC-01 rút gọn (Lệch 11) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Migration | `20261019095730_syllabi`, sinh bằng `prisma migrate dev --create-only` trên PostgreSQL 18 thật (container `ctdt-dev-pg`, cổng 54329, ICU `vi-VN`), nối tay 2 chỉ mục duy nhất từng phần + 4 `CHECK`; `migrate dev` lần hai báo "Already in sync" |
| Còn nợ | Đi thử 7 bước §7 bằng trình duyệt; áp migration lên cơ sở dữ liệu phát triển của bạn |

| Dự án | tsc | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | 0 lỗi | oxlint 0 | 465/465 (53 tệp) | 238/238 (14 tệp) | Prettier sạch, `nest build` ổn |
| frontend | 0 lỗi | oxlint 0 | 240/240 (46 tệp) | — | Prettier sạch, `vite build` ổn |

## Lệch kế hoạch

1. F-09 chưa dựng (sau MVP) nên không có `sendXlsx`, `imports.service`, `sendForm`, `downloadFile`, mục 413, `@types/multer`: tạo `sendFile`, `uploadedFileName` ở `src/shared/files/` (không có chỗ gọi cũ để chuyển); thêm 413 `PAYLOAD_TOO_LARGE` vào `ERRORS_BY_STATUS`; cài `@types/multer` và thêm `"multer"` vào `types` của `tsconfig.json`; frontend thêm `sendForm`, `downloadFile`, `fileNameFromHeader` vào `client.ts` (có test). Khi dựng F-09, dùng lại các hàm này.
2. `courseTarget` đã ở `src/shared/courses/` từ F-04/F-05; chỉ chuyển `CourseUsageDto` sang `shared/courses/course-usage.dto.ts`. `ProgramsUsingList` giữ prop `programs` (kế hoạch ghi `usages`); chưa có test cũ để chuyển.
3. Multer dùng bộ nhớ theo mặc định (không truyền `storage`), tránh phải khai báo phụ thuộc `multer` mà pnpm không cho import.
4. `RICH_TEXT_POLICY` cho phép thêm `rel`, `target` trên `a` (transform chạy trước khi lọc thuộc tính; thiếu thì bị xóa mất).
5. Kiểm thử đầu-cuối: fixture ở `test/fixtures/syllabi.ts` (không phải `test/support/`), byte PDF/EXE sinh trong mã thay vì commit tệp mẫu; `FILES_ROOT` là thư mục tạm riêng mỗi tệp spec, đặt trong `test-env.ts`, xóa khi worker thoát. Học sinh R6 trong test phải có phạm vi đơn vị (`PDT`), vì R6 phạm vi hệ thống thấy bản Nháp.
6. Bảng quyền: 10 dòng (cả `GET` tệp, `POST` tuần, sắp xếp, tệp đính kèm), nhiều hơn 2 dòng của kế hoạch; `countWrites` đếm `syllabus`, `weeklyContent`.
7. `hasSyllabus` kiểm thử ở `curriculum-read.service.spec.ts` (nơi dựng `CurriculumItemDto`), không phải `curriculum.service.spec.ts`.
8. Giao diện theo mẫu hiện có: không `PageContainer`/`ApiErrorAlert` (dùng `Flex`, `Result`, `Skeleton`), `Alert` dùng `title`, nút VIA_REQUEST dùng chữ "Tạo đề xuất" như `CourseEditButton`; hàm thuần ở `utils/`, `useWeeklyReorder` ở `hooks/`; thêm `testFixtures.ts`.
9. `SyllabusContentForm` không remount theo `updatedAt`: sau khi lưu, đặt lại giá trị đã lưu của các mục vừa gửi và dời mốc so sánh; nhờ vậy tuần/tệp đổi `updatedAt` không xóa chữ người dùng đang gõ ở tab Nội dung.
10. Không thêm mục menu (kế hoạch FE-01), không sửa seed: quyền `syllabus.view/edit` đã có từ F-02.
11. Theo yêu cầu tiết kiệm: không cập nhật `docs/architecture/*`, `docs/implementation/README.md`, `technical_reference.md` (đồng bộ một lần cuối MVP). `data-dictionary.md`/`user-stories.md` mang ghi chú loại tệp từ lúc viết kế hoạch.
12. Mọi câu hỏi mở dùng mặc định kế hoạch (§F-10 toàn A). `.gitignore` backend thêm `/files/` (có dấu `/` đầu để không chặn `src/shared/files/`).

Chỗ gọi đã chuyển: `CourseUsageDto` (`course.dto.ts` → import từ shared); `ProgramsUsingList` (`CourseDetailPage`, `CourseFormPage`, `SyllabusEditorPage` mới); `SortableRow` (`CurriculumTable`, `WeeklyContentTable` mới); `CURRICULUM_QUERY_ROOT` (`CURRICULUM_QUERY_KEYS`, `useCreateSyllabus` mới). Không còn đường cũ.

## Có thể làm thêm

Khóa lạc quan theo `updatedAt` khi hai người sửa cùng mục; `diskStorage` nếu upload đồng thời gây áp lực RAM; quét virus tệp; xem trước PDF/ảnh; xuất đề cương ra Word/PDF; tự lưu nháp; việc dọn tệp mồ côi trên đĩa; tách chunk lớn của trình soạn thảo; xử lý dán từ Word.

## USER ACTIONS

- Xác nhận mặc định: Nháp chỉ hiện cho người có `program.view` phạm vi ALL (R1..R5); R3/R4/R5 sửa thẳng bản Nháp của học phần Khoa CNTT, học phần khoa khác chỉ R1; giới hạn 20 MB (`ATTACHMENT_MAX_MB`), 10 tệp, 60 dòng tuần, 100 000 ký tự mỗi mục.
- Áp migration: `pnpm prisma:migrate` trong `source/backend`; đặt `FILES_ROOT` (mặc định `files/`) vào ổ bền và sao lưu cùng cơ sở dữ liệu (ràng buộc cho F-26/F-27).
- Đi thử bằng trình duyệt (kế hoạch §7): R3 mở học phần chưa có đề cương, tạo Nháp; gõ đậm, danh sách, bảng 3 × 3, dán đoạn có `<script>` rồi lưu; thêm tuần 1–3, kéo tuần 3 lên đầu, tải lại; điền mô tả tiếng Anh rồi bật EN, xóa để thấy "Chưa dịch"; thả PDF tên tiếng Việt, tải về, thả `.zip` bị từ chối, R3 khác không thấy nút gỡ; mở từ hai chương trình thấy cùng đề cương và thẻ "Chưa có đề cương"; R5 nhóm khác bị từ chối; R6 không thấy Nháp.
- Giới hạn giao diện: kéo thả tuần chỉ có tay nắm (bàn phím qua tay nắm); chọn tệp một lần một tệp; chưa có mục menu riêng (vào từ học phần hoặc dòng khung).

## Cho tính năng sau

- F-11: `assertDraftWrite` ở `src/features/syllabi/syllabus-access.ts`; nếu CLO là feature riêng thì chuyển sang `src/shared/syllabi/` trước; thêm tab vào `EDITOR_TABS` (`SyllabusEditorPage.tsx`) và cột CLO vào `WeeklyContentTable`; bật EN cho mô tả CLO.
- F-13: bản N+1 sao mục, dòng tuần, dòng tệp; đặt `previousVersionId`; thêm `sourceRequestId`; mọi văn bản đi qua `sanitizeRichText`.
- F-15: công bố = chuyển PUBLISHED hiện có sang HISTORICAL **trước** khi đặt Nháp thành PUBLISHED kèm `publishedAt`; thay `publishSyllabusForTest` (`test/fixtures/syllabi.ts`); thêm `CurriculumItem.syllabusId`, đọc theo ngữ cảnh chương trình, `MISSING_SYLLABUS` ở checker (`hasSyllabus` hiện tính mọi bản).
