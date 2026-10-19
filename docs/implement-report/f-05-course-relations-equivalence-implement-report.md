# F-05 Quan hệ học phần, nhóm tương đương — Implement Report

Kế hoạch: `docs/implementation/f-05-course-relations-equivalence-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-06, FE-01..FE-05, DOC-01 xong (2026-10-19) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Cơ sở dữ liệu | Migration `20261019075207_course_relations` sinh bằng `prisma migrate dev --create-only --name course_relations` trên PostgreSQL 18 thật (ICU `vi-VN`, container Docker), nối tay hai `CHECK` rồi `prisma migrate dev` áp; chạy lại báo "Already in sync". `\d "CourseRelation"` cho `numeric(4,2)`, chỉ mục duy nhất của bộ ba, và hai ràng buộc `CourseRelation_not_self`, `CourseRelation_minScore_prerequisite_only`. Áp được lên cơ sở dữ liệu trống trong bộ kiểm thử đầu-cuối (5 migration). Seed không đổi (xem Lệch 1) |
| Hiệu lực lúc chạy | R1 khai báo và xóa quan hệ ở mọi học phần, quản lý nhóm tương đương; R3 khai báo quan hệ của học phần Khoa CNTT chưa ban hành, qua đề xuất với học phần khoa khác; R4, R5 khai báo trực tiếp quan hệ của học phần thuộc nhóm của mình; mọi vai trò xem quan hệ và nhóm tương đương. Ngừng mở lớp đi được đường thành công: chọn học phần thay thế ngay trong hộp thoại |
| Còn nợ | Đi thử 6 bước bằng trình duyệt (kế hoạch §7, chưa làm); chưa áp migration lên cơ sở dữ liệu phát triển của người dùng |

### Kết quả kiểm tra (2026-10-19)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc --noEmit` 0 lỗi | oxlint 0 | 223/223 (28 tệp) | 130/130 (10 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 93/93 (24 tệp) | — | `vite build` ổn; Prettier sạch |

So với F-04: backend đơn vị +74, đầu-cuối +33; frontend đơn vị +28.

---

## Summary

| ID | Phạm vi | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01 | `prisma/schema.prisma`, migration `20261019075207_course_relations` | tsc, đầu-cuối (áp migration), `\d "CourseRelation"`, hai ca đầu-cuối chạm thẳng ràng buộc `CHECK` | Không lệch. `prisma format` căn lại cột của `Course` |
| BE-02 | `shared/courses/requisite-graph.ts`, `shared/decimal/decimal.ts` | đơn vị (`requisite-graph.spec`, `decimal.spec`) | Xem Lệch 2 (`$executeRaw`) |
| BE-03 | `features/course-relations/*`, `shared/courses/{related-course,course-edit-state,course-target}.ts` | đơn vị service (21 ca), đầu-cuối | Xem Lệch 2, 3 |
| BE-04 | `features/equivalence-groups/*`, `assertSchoolWideDirect` | đơn vị service (20 ca), `edit-path.spec` (+4), đầu-cuối | Không lệch |
| BE-05 | `CourseUsageReader`, `CoursesService.transition`, `DiscontinueCourseDto`, `CourseDetailDto.equivalenceGroup` | đơn vị (reader 3 ca, courses +3 ca), đầu-cuối | Xem Lệch 4 |
| BE-06 | `test/{course-relations,equivalence-groups}.e2e-spec.ts`, `test/courses.e2e-spec.ts` (+2 ca, KB-008), `test/permission-table.ts` (+12 dòng), `test/permission-table.e2e-spec.ts` (đếm ghi) | `pnpm test:e2e` 130/130 | Ca song song B→A và A→B: đúng một 201 và một 409 |
| FE-01 | `schema.d.ts` (sinh lại), `permissions.ts`, `routes.ts`, `router.tsx`, `menuItems.tsx`, `AppLayout.tsx` | tsc, `vite build`, `menuItems.test.tsx` (3 ca) | Xem Lệch 6 |
| FE-02 | `shared/courses/*`, `shared/hooks/useDebouncedValue.ts`, `features/courses/{api,hooks,constants}`, `features/equivalence-groups/{api,hooks}` | tsc, `CourseSelect.test.tsx` (3 ca) | Xem Lệch 5, 7 |
| FE-03 | `CourseRelationsSection`, `AddRelationModal`, `MinScoreCell`, `EquivalentCoursesCard`, `CourseDetailPage` | đơn vị (`AddRelationModal.test` 5 ca, `CourseDetailPage.test` +6 ca) | Xem Lệch 8 |
| FE-04 | `DiscontinueCourseModal`, `CourseStatusActions`, `changeCourseStatus` | đơn vị (3 ca) | Xem Lệch 8 |
| FE-05 | `EquivalenceGroupsPage`, `EquivalenceGroupFormModal`, `AddMemberModal`, `MergeGroupsModal`, `schema/equivalenceGroupRules.ts` | đơn vị (8 ca) | Xem Lệch 9, 10 |
| DOC-01 | `docs/architecture/*`, `docs/progress/*`, `docs/implementation/README.md`, trạng thái kế hoạch, tệp này | đối chiếu đường dẫn với mã | `data-dictionary.md` đã mang các ghi chú về `CourseRelation`, `EquivalentCourseGroup` từ lúc viết kế hoạch nên không đổi thêm; `technical_reference.md` không đổi (không thêm thư viện) |

### Cách điền hai móc của F-04

- **`CourseUsageReader.hasActiveReplacement(courseId, client = this.prisma)`** đọc `CourseRelation` có `sourceCourseId = courseId`, `relationType = REPLACEMENT`, đích `status = ACTIVE`. Tham số `client` nhận `Prisma.TransactionClient` để thấy quan hệ vừa ghi trong cùng giao dịch. Reader nay nhận `PrismaService` qua constructor (F-04 chưa cần).
- **Ngừng mở lớp** (`CoursesService.transition(..., { replacementCourseId })`, thân `DiscontinueCourseDto` tùy chọn): trong một giao dịch `upsert` quan hệ `REPLACEMENT` (nếu có `replacementCourseId`), gọi `hasActiveReplacement(courseId, tx)` (không có → 409 `REPLACEMENT_REQUIRED`, giao dịch lùi), rồi đổi trạng thái sang `DISCONTINUED`. Học phần thay thế là chính nó, không có hoặc không `ACTIVE` → 400 `REPLACEMENT_INVALID`, không ghi gì. Mở lại giữ nguyên quan hệ. Giao diện: `CourseStatusActions` mở `DiscontinueCourseModal` thay hộp xác nhận cho "Ngừng mở lớp"; "Mở lại" và "Hủy" giữ hộp xác nhận của F-04.
- `CourseDetailDto.equivalenceGroup` (`{ id, groupCode, members }`, `members` không gồm chính học phần) nạp bằng một truy vấn thêm chỉ khi học phần thuộc nhóm.

Ràng buộc F-04 và F-01..F-03 đặt lên F-05 đều đã thực hiện: `hasActiveReplacement`, cột `Course.equivalenceGroupId` cùng bảng nhóm, KB-008 trong đầu-cuối của F-05, nâng hộp xác nhận ngừng mở lớp, dùng lại `resolveEditPath`/`assertDirectEdit`, `CourseRefDto`, `trimUpperCase`/`emptyToNull`, `applyFieldErrors`.

---

## Lệch kế hoạch

1. **Seed không đổi.** Kế hoạch liệt kê "seed" trong nhiệm vụ, nhưng mã quyền `courseRelation.edit` (`PERMISSIONS.COURSE_RELATION_EDIT`) và các ô R1 `X`, R3 `Đ`, R4 `Đ(P)`, R5 `Đ(P)` đã có trong `prisma/seed-data/permission-catalog.ts` từ F-02 (41 quyền, `permission-catalog.spec.ts` giữ nguyên). F-05 không có dữ liệu mồi riêng. Bảng kiểm tuyến (`permission-table.ts`) được thêm 12 dòng như kế hoạch.
2. **Khóa đồ thị dùng `$executeRaw`, không phải `$queryRaw`.** Kế hoạch viết ``tx.$queryRaw`SELECT pg_advisory_xact_lock(…)` ``. `pg_advisory_xact_lock` trả kiểu `void`, bộ điều hợp `@prisma/adapter-pg` không đọc được cột `void` (`UnsupportedNativeDataType`) nên mọi yêu cầu tạo quan hệ trả 500. `$executeRaw` chạy câu lệnh và chỉ trả số hàng nên bỏ qua kiểu đó; hành vi khóa không đổi (giữ tới hết giao dịch).
3. **`courseTarget` dời sang `shared/courses/course-target.ts`.** F-04 để hàm trong `features/courses/course.dto.ts`; `course-relations` cần nó mà tính năng không được import tính năng khác (`nestjs-rules.md` §1). Dời, không đổi chữ ký; `courses.service.ts` import từ chỗ mới.
4. **`CoursesService.editState` thay bằng `courseEditState` dùng chung** (đã đúng kế hoạch) và `transition` nhận tham số thứ tư `options`, controller truyền `dto?.replacementCourseId`. Phần kiểm "dùng rồi" (`COURSE_IN_USE`) của hủy chạy trước khi ghi, như cũ.
5. **`useDebouncedValue`** chưa có hook dùng chung (ô `UserSelect` của F-03 tự viết bộ trễ). Tạo `src/shared/hooks/useDebouncedValue.ts` và chuyển `UserSelect` sang dùng (một chỗ gọi cũ); hằng `USER_SEARCH_DEBOUNCE_MS` và kiểm thử của `UserSelect` giữ nguyên, đều xanh.
6. **Menu có nhóm con.** `AppMenuItem` của F-02/F-03 chưa có `children` (kế hoạch cho phép mở rộng): thêm `children?`, `path?` tùy chọn; mục "Học phần" thành nhóm với "Danh mục học phần" và "Nhóm tương đương", cùng `selectedMenuPath` và `openMenuGroups` để chọn đúng lá và mở nhóm khi vào trang. Có `menuItems.test.tsx` mới. Kết quả: mục "Học phần" không còn tự dẫn tới `/courses` mà là nhóm đóng/mở.
7. **`CourseSelect` có thêm `id`, nhớ nhãn đã chọn và `CourseMultiSelect`.** Form.Item tiêm `id` vào ô để gắn nhãn (không có thì `getByLabelText` không tìm thấy ô và trình đọc màn hình không đọc được nhãn); nhãn của lựa chọn lưu lại từ sự kiện `onChange` để không biến thành mã khi kết quả tìm mới thay thế danh sách. Ô chọn nhiều là hàm anh em `CourseMultiSelect` (kế hoạch FE-05 chọn phương án này).
8. **Không có `PageContainer`, `ApiErrorAlert`, `ApiErrorResult`** (đã ghi từ F-04): các thành phần mới dùng `Card`, `Alert`, `Result` như `SubjectGroupListPage`. `DiscontinueCourseModal` luôn hiện ô chọn học phần (kể cả khi đã có học phần thay thế) để thêm học phần thay thế khác; có sẵn thì nút OK bật ngay.
9. **Hộp thoại "Gộp nhóm" lấy nhóm của học phần bằng hàm riêng** (`fetchCourseGroup` + `useCourseGroup` trong `features/equivalence-groups`) thay vì `useCourse` của `features/courses`, để không import chéo tính năng (`react-vite-rules.md` §4). Cùng đường `GET /courses/:id`. `MergeGroupsModal` nhận nhóm hiện tại và (tùy chọn) nhóm kia chọn sẵn; từ nút "Gộp với nhóm…" người dùng chọn nhóm kia trong danh sách.
10. **`useCanEditSchoolWide` bằng `useCan`.** `/api/auth/me` chỉ liệt kê mã quyền, không có chế độ và phạm vi, nên máy khách không phân biệt được R1 với R3..R5: nút sửa hiện cho mọi người có `courseRelation.edit` và máy chủ trả 403 `PERMISSION_DENIED` khi không phải R1 (đúng phương án dự phòng của kế hoạch, §8). Hàm đặt ở `shared/auth/useCan.ts` để F-06 dùng lại; thêm `mode`/`scope` vào `me` rồi thu hẹp là việc nhỏ về sau.
11. **Kiểm thử cũ phải đổi phần dựng**, không đổi điều kiện kiểm: trang chi tiết học phần nay gọi `GET /auth/me` và `GET /courses/:id/relations`, nên bộ giả `fetch` của `CourseDetailPage.test.tsx` trả `me` và danh sách quan hệ cho hai đường đó (trước đó trả học phần cho mọi `GET`). Ca "ngừng mở lớp bị từ chối" đi qua hộp thoại mới với học phần thay thế sẵn có (OK bật) và vẫn kiểm thông điệp `REPLACEMENT_REQUIRED` của máy chủ.
12. **`POST /equivalence-groups/:groupId/members` trả 201** (mặc định của Nest cho `POST`), kế hoạch không ghi mã. Máy khách chấp nhận mọi 2xx.

Không có lệch về hợp đồng API, tên lỗi, DTO hay thứ tự tuyến.

## Còn nợ

- Đi thử 6 bước bằng trình duyệt (§7) chưa làm; ghi ở `docs/progress/todo.md`.
- Áp migration `20261019075207_course_relations` lên cơ sở dữ liệu phát triển: `pnpm prisma:migrate` trong `source/backend`.
- Ràng buộc cho tính năng sau (đã nằm ở kế hoạch §8): F-07 và F-09 gọi `lockRequisiteGraph` + `findRequisiteCycle` trên hợp cạnh danh mục và cạnh của khung; F-07 thêm prop `statuses` cho `CourseSelect`; F-13 quyết định đường sửa quan hệ sau khi ban hành; F-18 làm phép dự phòng ngưỡng; F-24 cảnh báo học phần ngừng mở lớp mất học phần thay thế.
- `/api/auth/me` chưa có chế độ và phạm vi (Lệch 10).
- `trim`/`emptyToNull` nội tuyến của F-02/F-03 vẫn chưa dời sang `shared/dtos/transforms.ts` (còn từ F-04).

---

## Incidents

### 1. Tạo quan hệ trả 500 vì khóa tư vấn trả `void`
- **Triệu chứng**: mọi `POST /api/course-relations` trả 500; nhật ký: `Failed to deserialize column of type 'void'` (`UnsupportedNativeDataType`).
- **Cơ chế**: `$queryRaw` cố đọc cột kết quả của `SELECT pg_advisory_xact_lock(…)`, mà kiểu `void` không có trong bộ điều hợp `@prisma/adapter-pg`. Kiểm thử đơn vị với Prisma giả không thể thấy.
- **Sửa**: mã — `$executeRaw`; ghi vào `general_architecture.md` để F-07 và F-09 dùng đúng cách. Không đổi kiểm thử.

### 2. Hai yêu cầu supertest song song làm sập nhau
- **Triệu chứng**: ca song song B→A / A→B (và lần dựng sẵn mảng yêu cầu ở ca quyền) lỗi `Cannot read properties of null (reading 'address')`.
- **Cơ chế**: không có `listen`, mỗi yêu cầu supertest tự mở rồi đóng máy chủ HTTP tạm trên cùng `http.Server`; yêu cầu thứ nhất xong thì đóng máy chủ dưới chân yêu cầu thứ hai (cùng gốc với Incident 1 của F-04).
- **Sửa**: kiểm thử — `await app.listen(0)` một lần cho tệp có ca song song, và gọi tuần tự (hàm trả yêu cầu, không dựng sẵn) ở ca nhiều yêu cầu.

### 3. Ca đầu-cuối "R3 và học phần khoa khác" tự tạo vòng
- **Triệu chứng**: bước thứ hai trả 409 `REQUISITE_CYCLE` thay vì 201.
- **Cơ chế**: ca khai báo math→home rồi home→math cùng loại `PREREQUISITE` — đúng là một vòng. Mã chạy đúng, dữ liệu ca sai.
- **Sửa**: kiểm thử — dùng cặp học phần thứ ba; điều kiện kiểm không đổi.

### 4. Cảnh báo lint `set-state-in-effect` ở `CourseSelect`
- **Triệu chứng**: oxlint cảnh báo `setState` trong `useEffect` khi nhớ nhãn.
- **Cơ chế**: nhãn được đồng bộ từ kết quả truy vấn bằng effect.
- **Sửa**: mã — nhãn lấy từ sự kiện `onChange` của ô chọn (đối số `option`), không còn effect.

---

## Lessons worth keeping

- `pg_advisory_xact_lock` (và mọi hàm trả `void`) phải chạy bằng `$executeRaw`; `$queryRaw` ném lỗi khi đọc kiểu `void` với bộ điều hợp `pg`.
- Ca đầu-cuối có yêu cầu song song cần `app.listen(0)` trước; không dựng sẵn nhiều yêu cầu supertest.
- Quan hệ thuộc về một học phần (đích; nguồn với `REPLACEMENT`): quyền, phạm vi, đường sửa luôn kiểm trên học phần đó, và nhãn hiển thị luôn suy từ loại **cùng** phía của học phần đang xem.
- Dữ liệu không thuộc đơn vị hay nhóm nào kiểm bằng `assertSchoolWideDirect` (ô `DIRECT` + `ALL`); máy khách chưa phân biệt được vì `me` thiếu chế độ và phạm vi.
- Trang thêm lời gọi API mới thì bộ giả `fetch` của các kiểm thử trang cũ phải trả đúng hình dạng cho đường mới — nếu không, `useMe` nhận một đối tượng học phần và hỏng ở chỗ không liên quan.
