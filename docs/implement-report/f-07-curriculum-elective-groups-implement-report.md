# F-07 Khung chương trình, nhóm tự chọn — Implement Report

Kế hoạch: `docs/implementation/f-07-curriculum-elective-groups-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-06, FE-01..FE-06, DOC-01 xong (2026-10-19) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Cơ sở dữ liệu | Migration `20261019085325_curriculum` sinh bằng `prisma migrate dev --create-only --name curriculum` trên PostgreSQL 18 thật (ICU `vi-VN`, container Docker), nối tay sáu `CHECK`, áp bằng `prisma migrate dev`; chạy lại báo "Already in sync". `\d "CurriculumItem"` cho ba `CHECK`; ba bảng còn lại được ca đầu-cuối chạm thẳng từng `CHECK`. Áp được lên cơ sở dữ liệu trống trong bộ kiểm thử đầu-cuối (7 migration). `prisma db seed` chạy hai lần: `Program` 1, `ProgramVersion` 1, `Course` 6, `CurriculumItem` 6, `CurriculumRequisite` 1, `ElectiveGroup` 1 |
| Hiệu lực lúc chạy | R1 và R3 (chương trình mình phụ trách) thêm, sửa, xóa, sắp xếp dòng khung, sửa điều kiện riêng, tạo nhóm tự chọn ở bản Nháp chưa từng ban hành; R4/R5 thêm, sửa, xóa dòng của học phần thuộc nhóm mình (không sắp xếp, không đụng nhóm tự chọn); sau khi chương trình có phiên bản rời Nháp mọi ghi trả 409 `CHANGE_REQUEST_REQUIRED`; phiên bản không phải Nháp trả 409 `VERSION_NOT_EDITABLE` |
| Còn nợ | Đi thử 9 bước bằng trình duyệt (kế hoạch §7, chưa làm); chưa áp migration lên cơ sở dữ liệu phát triển của người dùng; danh mục khối kiến thức còn rỗng; thay sáu học phần mẫu `DEMO*` của 1024034 bằng số liệu thật |

### Kết quả kiểm tra (2026-10-19)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc --noEmit` 0 lỗi | oxlint 0 | 358/358 (41 tệp) | 193/193 (12 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 173/173 (35 tệp) | — | `vite build` ổn; Prettier sạch |

So với F-06: backend đơn vị +89, đầu-cuối +35 (21 ca của `curriculum.e2e-spec.ts`, 10 dòng bảng kiểm tuyến, 2 ca `courses`, 2 ca `programs`); frontend đơn vị +54.

---

## Summary

| ID | Phạm vi | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01 | `prisma/schema.prisma`, migration `20261019085325_curriculum` | tsc, đầu-cuối (áp migration + chạm từng `CHECK`), `\d` | Không lệch |
| BE-02 | `shared/curriculum/*`, `shared/programs/version-content.copier.ts`, `shared/courses/course-usage.reader.ts`, `shared/dtos/transforms.ts`, `courses` (`status` danh sách), `programs` (chặn `semesterCount`) | đơn vị (warnings 6, facts 2, copier 3, reader +5, transforms 3, courses +1, programs +4) | Xem Lệch 3, 4 |
| BE-03 | `features/curriculum/{curriculum-read,curriculum}.service.ts`, controller, DTO, `curriculum-access.ts`, `curriculum-totals.ts` | đơn vị (read 9, service 19, totals 5), đầu-cuối | Xem Lệch 3 |
| BE-04 | `curriculum-requisites.service.ts`, `replace-requisites.dto.ts` | đơn vị (14), đầu-cuối (vòng với danh mục, hai yêu cầu song song) | Xem Lệch 7 |
| BE-05 | `elective-groups.service.ts`, controller, `elective-group.dto.ts` | đơn vị (16), đầu-cuối | Không lệch |
| BE-06 | `seed-data/{knowledge-blocks,programs}.ts`, `seed.ts`, `test/fixtures/curriculum.ts`, `test/curriculum.e2e-spec.ts`, `permission-table.ts` (+10 dòng), `programs`/`courses` e2e | `pnpm test:e2e` 193/193 | Xem Lệch 1, 2, 12 |
| FE-01 | `schema.d.ts` (sinh lại + Prettier), `permissions.ts`, `routes.ts`, `router.tsx` | tsc, `vite build` | Xem Lệch 6 |
| FE-02 | `features/curriculum/{api,hooks,constants,schema}`, `shared/api/client.ts` (mảng), `shared/decimal`, `shared/courses/{gradePoint,courseQueryKeys}` | đơn vị (filters 4, decimal 4, `withQuery` 3) | Xem Lệch 8, 9 |
| FE-03 | `CurriculumPage` và `CurriculumTable`, `SemesterBoard`, `CurriculumFiltersBar`, `CurriculumTotals`, `CurriculumWarningsPanel`, `RequisiteTags`, `CurriculumAddButton`, `CurriculumItemActions` | đơn vị (12 ca) | Xem Lệch 5, 10 |
| FE-04 | `CurriculumItemModal`, `RequisitesModal`, `SortableRow`, `useSemesterReorder`, `@dnd-kit/*` | đơn vị (modal 8, điều kiện 6, kéo thả 4) | Xem Lệch 5 |
| FE-05 | `ElectiveGroupsPage`, `ElectiveGroupTable`, `ElectiveGroupFormModal`, `AssignItemsModal` | đơn vị (10 ca) | Không lệch |
| FE-06 | `courseSearch.ts`, `CourseSelect.tsx` (`statuses`, `initialLabels`), `ProgramsUsingList`, `CourseFormPage`, `CourseDetailPage`, `CourseFilters`, `ProgramSectionLinks` | đơn vị (+2 form, +1 chi tiết, +2 tổng quan) | Xem Lệch 9 |
| DOC-01 | `docs/architecture/*`, `docs/technical/technical_reference.md`, `docs/progress/*`, `docs/implementation/README.md`, trạng thái kế hoạch, tệp này | đối chiếu đường dẫn với mã | `data-dictionary.md` đã mang các ghi chú của F-07 từ lúc viết kế hoạch nên không đổi thêm |

### Cách điền các móc đã để lại

- **`VersionContentCopier.copy`** (F-06): ba bước nhóm tự chọn → dòng khung → điều kiện. `createMany` không trả hàng nên id mới tra ngược qua khóa tự nhiên `(versionId, groupCode)` và `(versionId, courseId)`; hàm trả ánh xạ id cũ → mới ở nội bộ để F-11 nối tiếp. Bỏ các dòng `void`. Ca đầu-cuối nhân bản một chương trình có 3 dòng, một nhóm, một điều kiện: bản sao có đủ, id mới, xóa dòng ở bản sao không đụng nguồn.
- **Kiểm `semesterCount`** trong `ProgramsService.update`: hàm `assertSemestersCoverCurriculum` (`features/programs/semester-check.ts`) gọi `CurriculumFactsReader.maxPlannedSemester(draft.id)`; 409 `SEMESTERS_BELOW_CURRICULUM`, thông điệp nêu học kỳ lớn nhất, `details` trỏ `semesterCount`. Không gọi khi DTO không có `semesterCount`.
- **Seed 1024034**: mở rộng `prisma/seed-data/programs.ts` (không phải `prisma/seed/program-1024034.ts` của kế hoạch). Sáu học phần mẫu `DEMO101..DEMO302`, một quan hệ tiên quyết trong danh mục và trong khung, nhóm `TC1` (tối thiểu 6 TC, hai dòng tự chọn), sáu dòng ở học kỳ 1, 2, 3, 5 — nằm trong 10 học kỳ giữ chỗ và trong 140 + 10 tín chỉ; chỉ ghi khi bản Nháp chưa có dòng nào.
- **Thẻ ở tổng quan chương trình (MH-22)**: "Khung chương trình" và "Nhóm tự chọn" thành liên kết tới bản Nháp (không có Nháp thì phiên bản hiện hành); "Kiểm tra nhất quán" vẫn vô hiệu với chú thích "kiểm tra nhất quán" (F-08).
- **`CourseUsageReader`** (F-04): `programsUsing` và `inReleasedVersion` đọc từ `CurriculumItem`; `CourseUsage.plannedSemester` mới; `inReleasedVersion` nay sống nên ca đầu-cuối sửa học phần sau khi khung được phát hành thử trả 409 `CHANGE_REQUEST_REQUIRED`.
- **`lockRequisiteGraph` / `findRequisiteCycle`** (F-05): `PUT …/requisites` mở giao dịch, khóa trước mọi đọc/ghi, xóa cạnh cũ của dòng rồi kiểm từng cạnh mới trên hợp cạnh danh mục `PRIOR`/`PREREQUISITE` và cạnh của cùng phiên bản. Ca song song: đúng một bên 200, một bên 409.
- **`CourseSelect`** (F-05): thêm prop `statuses`; `withQuery` ghi mảng thành khóa lặp lại.
- **`activeDirectorWhere` / `programTarget`** (F-06): `programTarget` là gốc của đối tượng quyền một dòng khung; R3 của chương trình sửa trực tiếp, R3 chương trình khác bị 403 `OUT_OF_SCOPE`.

---

## Lệch kế hoạch

1. **Seed ở `prisma/seed-data/`**, không phải `prisma/seed/`: `knowledge-blocks.ts` mới và `programs.ts` mở rộng. **Danh mục khối kiến thức để rỗng** (kế hoạch cho phép: tệp Excel của Khoa chưa có); ký hiệu trên dòng vẫn là chuỗi tự do. Sáu học phần `DEMO*` là dữ liệu mẫu vì bản cơ sở dữ liệu mới không có học phần nào để xếp vào khung.
2. **Ma trận quyền không đổi.** Kế hoạch ghi ô `curriculum.edit` R4, R5 là `Đ` rồi đổi thành `Đ(P)`; `permission-catalog.ts` do F-02 dựng đã là `R1 X, R3 DP, R4 DP, R5 DP` nên không có gì để đổi, `permission-catalog.spec.ts` đã kiểm R3 và R4. Thêm 10 dòng vào bảng kiểm tuyến (`test/permission-table.ts`) và nhánh đếm ghi cho ba gốc tuyến mới.
3. **Năm service thay vì ba.** Thêm `CurriculumReadService` (đọc khung, `itemDto`, `findVersion`, `findItem`) để `CurriculumService` chỉ giữ ghi dòng và sắp xếp, ba service ghi còn lại dùng chung các tra cứu mà không lặp (kế hoạch đã dự liệu `curriculum-item.reader.ts` "khi bản sao thứ hai xuất hiện"). Ca đơn vị vì thế tách `curriculum-read.service.spec.ts` khỏi `curriculum.service.spec.ts`.
4. **`ProgramsService.clone` tách sang `ProgramCloneService`**, cộng `program-reader.ts` (`findProgramOrThrow`), `semester-check.ts`, `version-data.ts`: F-06 đã ghi `programs.service.ts` 329 dòng và dặn tách khi F-07 thêm kiểm `semesterCount`; sau tách còn 257 dòng. `ProgramsService` có thêm `detailOf`; ca nhân bản chuyển sang `program-clone.service.spec.ts`, điều kiện kiểm không đổi.
5. **Bảng một `SortableContext` thay vì mỗi học kỳ một cái**, và không có dòng tiêu đề học kỳ hay sọc màu: một `Table` AntD chỉ có một thân; thả sang hàng của học kỳ khác bị hook bỏ qua (`reorderedSemester` trả `null`), người dùng đổi học kỳ qua hộp thoại. Thuộc tính của dnd-kit (`role="button"`, `tabIndex`, `aria-*`) đặt trên **tay cầm**, không trên `<tr>` như ví dụ của AntD, vì chúng ghi đè vai trò `row` của hàng bảng.
6. **Không có mục menu** (đúng kế hoạch FE-01, ghi lại vì đề bài nhắc "routes và menu"): hai trang cần `versionId`, vào từ thẻ ở tổng quan chương trình.
7. **`RELATION_CONSTRAINT` dời** từ `features/course-relations/course-relations.errors.ts` sang `shared/courses/requisite-graph.ts` (cạnh `CYCLE_CHECKED_TYPES`); chỗ gọi cũ: `course-relations.service.ts` (một import, hai lần dùng). Kế hoạch nêu ba chỗ; thực tế DTO không dùng.
8. **Lọc theo khối**: `blockSymbol` có ba giá trị (`undefined` mọi khối, `null` dòng chưa gán khối, chuỗi) thay vì `string | null` của kế hoạch, để lọc được "(Chưa gán khối)" như bảng tổng theo khối đang liệt kê; ô chọn dùng giá trị mốc cho `null`.
9. **Hằng dùng chung dời sang `shared/`**: `GRADE_POINT_PATTERN/MESSAGE` → `shared/courses/gradePoint.ts` (`courseRules.ts` xuất lại; chỗ gọi `MinScoreCell`, `AddRelationModal` và kiểm thử cũ không đổi đường dẫn); `DRAFT_VERSION_LABEL`, `versionLabel` → `shared/constants/versionLabels.ts` (`programLabels.ts` xuất lại); `COURSE_QUERY_ROOT` → `shared/courses/courseQueryKeys.ts` (`COURSE_QUERY_KEYS` của F-04 và `courseSearchQueryKey` của F-05 trải nó). `courseSearchQueryKey(q, statuses)` có thêm tham số mặc định `['ACTIVE']`; chỗ gọi: `CourseSelect` và `CourseMultiSelect` (qua `useCourseOptions`), không kiểm thử nào dựng khóa. `CourseFilters` gửi `[status]`. Thêm `initialLabels` cho `CourseSelect` để điều kiện đã lưu hiện "MÃ — tên" thay vì id.
10. **Không có `PageContainer`, `ApiErrorAlert`** (đã ghi từ F-04): dùng `Flex`, `Typography.Title`, `Skeleton`, `Result`, và liên kết "←" thay `backTo`. `Card` ở chi tiết học phần đổi tiêu đề thành "Chương trình đang sử dụng" cho khớp bước đi thử.
11. **Ba câu hỏi nhỏ dùng mặc định của kế hoạch**: nhóm có cả hai mức tối thiểu thì phải đạt cả hai; tổng theo học kỳ cộng mọi dòng, bắt buộc lẫn tự chọn (chưa có Excel để đối chiếu); danh mục khối rỗng.
12. **Ca đo 60 dòng** ngưỡng 2 giây (kế hoạch: 1 giây "không phải cổng") để không chớp trên máy chậm. Ca "hai `PUT` song song" cần `app.listen(0)` như F-05. Không dừng ở các điểm dừng P1..P3 của kế hoạch.

Không có lệch về hợp đồng API, tên lỗi hay thứ tự tuyến.

## Còn nợ

- Đi thử 9 bước bằng trình duyệt (§7) chưa làm; ghi ở `docs/progress/todo.md`.
- Áp migration `20261019085325_curriculum` lên cơ sở dữ liệu phát triển: `pnpm prisma:migrate` rồi `pnpm prisma:seed` trong `source/backend`.
- Nạp `KnowledgeBlock` từ tệp Excel của Khoa; thay sáu học phần `DEMO*` và dữ liệu giữ chỗ của 1024034 (Q-11).
- `releaseVersionForTest` (`test/fixtures/curriculum.ts`) ghi trạng thái ban hành trực tiếp; xóa khi F-15 có luồng ban hành thật.
- Ràng buộc cho tính năng sau (đã nằm ở kế hoạch §8): F-08 mở rộng `curriculumWarnings` và chạy lại kiểm vòng trên cả phiên bản; F-09 gọi cùng quy tắc dòng; F-11 thêm bước vào `VersionContentCopier` sau điều kiện; F-13 bật nút "Tạo đề xuất"; F-15 ghi ảnh chụp tên/tín chỉ và thay `releaseVersionForTest`.
- `/api/auth/me` chưa có chế độ và phạm vi: máy khách dựa vào `canAddItems`, `canEditStructure`, `canEdit` do máy chủ tính.

---

## Incidents

### 1. Hàng bảng mất vai trò `row` khi bật kéo thả
- **Triệu chứng**: ca trang đếm hàng của bảng khung thấy 0 hàng khi bảng sắp xếp được.
- **Cơ chế**: `useSortable().attributes` có `role="button"`; trải lên `<tr>` (như ví dụ của AntD) thay vai trò `row` — cũng làm hỏng trình đọc màn hình.
- **Sửa**: mã — thuộc tính đi theo tay cầm qua ngữ cảnh (`SortableRow.tsx`).

### 2. Đường đi của vòng trong ca đầu-cuối
- **Triệu chứng**: ca KB-020 kỳ vọng `B → A → B`, nhận `A → B → A`.
- **Cơ chế**: `findRequisiteCycle` trả vòng bắt đầu và kết thúc ở học phần đích của cạnh mới (dòng đang sửa); ca viết ngược.
- **Sửa**: kiểm thử — đổi chuỗi kỳ vọng; mã không đổi.

### 3. Lệnh `pkill -f` giết cả vỏ lệnh
- **Triệu chứng**: sau `pnpm api:types`, lệnh dọn máy chủ thoát với mã 144.
- **Cơ chế**: mẫu khớp cả dòng lệnh của chính vỏ đang chạy.
- **Sửa**: quy trình — dừng máy chủ bằng pid; không đổi mã.

---

## Lessons worth keeping

- Thuộc tính trợ năng của thư viện kéo thả thuộc về phần tử kích hoạt (tay cầm), không thuộc hàng bảng.
- Sinh `schema.d.ts` cần máy chủ thật đang chạy trên cơ sở dữ liệu đã áp migration (`nest build`, `node dist/main.js`, `pnpm api:types`, rồi Prettier).
- Tách service khi nó vượt ~250 dòng ngay lúc thêm tính năng, không để dồn cho tính năng sau; chia theo "đọc + tra cứu dùng chung" và "ghi" giữ được các service ghi dưới ngưỡng.
- Dữ liệu mẫu cần học phần mẫu: seed khung của một chương trình không chạy được trên cơ sở dữ liệu chưa có học phần.
