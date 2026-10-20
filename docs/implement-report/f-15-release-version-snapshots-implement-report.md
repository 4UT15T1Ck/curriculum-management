# F-15 Ban hành, ảnh chụp phiên bản — Implement Report

Kế hoạch: `docs/implementation/f-15-release-version-snapshots-implementation-plan.md`. Đây là tính năng MVP cuối cùng; mã MVP đã đủ.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-xx, FE-xx xong (2026-10-19); DOC theo yêu cầu: báo cáo, nhật ký, todo, current_work, dòng Status của kế hoạch |
| Migration | `20261019131021_release_versions` (bảng `Semester`, `Cohort`, `CohortVersion`; cột ban hành, ảnh chụp, `correctionOfId`; ràng buộc tay: một Nháp thường mỗi chương trình, `ProgramVersion_published_has_time`, `Semester_term_positive`); đã áp lên `ctdt-dev-pg`, `migrate dev` lần hai "in sync" |
| Còn nợ | Đi thử bằng trình duyệt (USER ACTIONS) |

| Dự án | tsc | Lint | Đơn vị | Đầu-cuối |
|---|---|---|---|---|
| backend | 0 lỗi | oxlint 0 | 853/853 | 391/391 |
| frontend | 0 lỗi | oxlint 0 | 411/411 | — |

Prettier và build sạch ở cả hai.

## Đã dựng

- Backend: ban hành khởi tạo (H-1) và phê duyệt cuối (`FinalApprovalService`, `FinalApprovalApplier`, `canFinalApprove`, `REQUEST_EFFECTIVE`); `VersionPublisher`, `VersionActivator`, `SyllabusPublisher`; đánh số `major.minor`; ảnh chụp tên, tín chỉ, ghim đề cương (`CurriculumItem.syllabusId`); hàng đợi `release-activation` (BullMQ, cron 00:05 theo `APP_TIME_ZONE`, tác vụ lúc khởi động, idempotent); đính chính phiên bản (Nháp riêng, R1); lịch sử phiên bản; học kỳ và khóa tuyển sinh; `MISSING_SYLLABUS` ở `ConsistencyChecker`; `revisionForItems` thay `currentRevisionByCourse`; `course.writer` / `course-relation.writer` dùng chung; biến `BULLMQ_PREFIX`.
- Frontend: MH-10/43/45/46/47/49 (học kỳ và khóa, ban hành khởi tạo, phê duyệt cuối, lịch sử, chi tiết, đính chính), `ReleaseCard`, `ProgramVersionsSection`, banner phiên bản ở đề cương, menu "Học kỳ và khóa tuyển sinh".
- Đã xóa fixture chỉ dùng cho test: `releaseVersionForTest`, `publishSyllabusForTest`, `releaseAnotherVersionForTest`.

## Lệch kế hoạch

1. Ảnh chụp chỉ ghi khi còn null (kế hoạch ghi đè mỗi lần nâng); MVP chưa có đường làm mới ảnh chụp.
2. DC-03 chỉ kiểm điều kiện hiện có (mô tả, mục tiêu); điều kiện đánh giá thuộc F-12.
3. Chi tiết phiên bản trả bảng dòng đã đóng băng và liên kết tới màn hình chỉ đọc sẵn có, không nhúng lại trình đọc; `versions` của chi tiết chương trình giữ dạng tối thiểu, dữ liệu giàu ở endpoint lịch sử.
4. Không thêm query `correctionId` cho PATCH chương trình; sửa thông tin qua `PATCH /program-versions/:id/info`.
5. Bỏ `ApprovedWriteContext`; writer không biết quyền, nơi gọi tự chặn.
6. Fan-out bỏ qua chương trình INACTIVE; thêm kiểm tra `EFFECTIVE_BEFORE_BASE`; đính chính thừa kế `originRequestId`.
7. Sửa học kỳ kích hoạt ngay các bản PENDING đến hạn; menu là mục lá, không lập nhóm "Quản trị".
8. Worker đóng: chờ tác vụ đang chạy tối đa 10 giây rồi `close(true)` (đóng nhẹ treo vô hạn khi Redis chết).
9. Tên DTO `FinalApprovalProgramDto` (trùng `AffectedProgramDto`); `SemesterSelect`, `CohortSelect` đặt ở `shared/` của frontend.
10. e2e `publishedCourse` dùng chương trình mang rồi ngừng sử dụng.

Test cũ đã sửa: thêm `correctionOfId: null` vào fixture của 5 spec; `program-clone.service.spec` (`carryRelease: false`); `syllabus-attachments.service.spec` (`ATTACHMENT_LOCKED`); `consistency-checker.spec`; `permission-catalog.spec` (41 thành 43); e2e curriculum, courses, consistency, syllabi, syllabus-clos, outcomes, programs, change-requests, permission-table, users chuyển sang `releaseViaApi` / `publishSyllabusViaRelease` hoặc thêm `publishedAt`.

## Possible enhancements

- Hành động làm mới ảnh chụp; banner riêng cho Nháp đính chính; `ProgramDetailDto.versions` giàu như kế hoạch; điều kiện đánh giá DC-03 khi có F-12.

## USER ACTIONS

- Chạy `pnpm prisma:seed` (học kỳ và khóa giữ chỗ); thay bằng lịch thật.
- Đi thử NT-B4-01/05/06/10/12 bằng trình duyệt với R1 và R3.
- Đặt `BULLMQ_PREFIX` chỉ khi dùng chung Redis.
- Xem ghi chú §8 của kế hoạch về `createdByAcademicOffice`.
