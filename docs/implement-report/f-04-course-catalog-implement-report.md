# F-04 Danh mục học phần — Implement Report

Kế hoạch: `docs/implementation/f-04-course-catalog-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-06, FE-01..FE-05, DOC-01 xong (2026-10-19) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Cơ sở dữ liệu | Migration `20261019072717_courses` sinh bằng `prisma migrate dev --name courses` trên PostgreSQL 18 thật (ICU `vi-VN`, container Docker); áp được lên cơ sở dữ liệu trống trong bộ kiểm thử đầu-cuối (4 migration); seed chạy hai lần không đổi. `\d "Course"` cho `numeric(5,2)` và chỉ mục duy nhất trên `courseCode` |
| Hiệu lực lúc chạy | R1 thêm, sửa, đổi trạng thái mọi học phần; R3 sửa trực tiếp học phần của Khoa CNTT chưa ban hành, qua đề xuất với khoa khác; R4, R5 sửa trực tiếp học phần thuộc nhóm của mình; mọi vai trò xem danh mục, người không có `course.edit` không thấy học phần đã hủy |
| Còn nợ | Đi thử 9 bước bằng trình duyệt (kế hoạch §7, chưa làm); chưa áp migration lên cơ sở dữ liệu phát triển của người dùng |

### Kết quả kiểm tra (2026-10-19)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc --noEmit` 0 lỗi | oxlint 0 | 149/149 (24 tệp) | 97/97 (8 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 65/65 (19 tệp) | — | `vite build` ổn; Prettier sạch |

So với F-03: backend đơn vị +48, đầu-cuối +28; frontend đơn vị +21.

---

## Summary

| ID | Phạm vi | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01 | `prisma/schema.prisma`, migration `20261019072717_courses` | tsc, đầu-cuối (áp migration), `\d "Course"` | Không lệch. `prisma format` căn lại cột của `SubjectGroup` (chỉ khoảng trắng) |
| BE-02 | `shared/authz/edit-path.ts`, `shared/courses/*`, `shared/org-units/home-faculty.ts`, `shared/decimal/*`, `shared/dtos/{ref,transforms}.ts`, `CHANGE_REQUEST_REQUIRED`, seed `FACULTY_IT` | đơn vị (`edit-path.spec`, `decimal.spec`, các spec của nhóm chuyên môn) | `toWireDecimal('2.50') → '2.5'` đúng với Decimal của Prisma 7 (điểm UNVERIFIED trong kế hoạch đã được xác nhận). Xem Lệch 3 |
| BE-03 | `features/courses/*` | đơn vị service (27 ca), đầu-cuối | Xem Lệch 1, 2, 5 |
| BE-04 | `deactivationImpact` của `subject-groups.service.ts` | đơn vị, đầu-cuối | Không lệch |
| BE-05 | `test/fixtures/courses.ts` | dùng bởi BE-06 | Không lệch |
| BE-06 | `test/courses.e2e-spec.ts`, `test/permission-table.ts` (+7 dòng), `test/permission-table.e2e-spec.ts` (đếm ghi), `test/subject-groups.e2e-spec.ts` (+1 ca) | `pnpm test:e2e` 97/97 | Ca đo thời gian: 500 học phần, một lần gọi bỏ đi rồi đo một lần, ngưỡng `CATALOG_LOOKUP_BUDGET_MS = 2000` |
| FE-01 | `schema.d.ts` (sinh lại), `permissions.ts`, `routes.ts`, `router.tsx`, `menuItems.tsx` | tsc, `vite build` | Không lệch |
| FE-02 | `features/courses/{api,hooks,constants}` | tsc | Không lệch |
| FE-03 | `CourseListPage`, `CourseFilters`, `CourseStatusTag` | đơn vị (7 ca) | Xem Lệch 6 |
| FE-04 | `CourseDetailPage`, `CourseInfoCard`, `CourseStatusActions`, `CourseEditButton`, `ProgramsUsingList` | đơn vị (7 ca) | Xem Lệch 4 |
| FE-05 | `CourseFormPage`, `schema/courseRules.ts`, `shared/forms/applyFieldErrors.ts` | đơn vị (7 ca) | Xem Lệch 2, 7 |
| DOC-01 | `docs/architecture/*`, `docs/progress/*`, `docs/implementation/README.md`, trạng thái kế hoạch, tệp này | đối chiếu đường dẫn với mã | `data-dictionary.md` đã mang các ghi chú về `Course` từ lúc viết kế hoạch nên không đổi thêm; `technical_reference.md` không đổi (không thêm thư viện) |

Ràng buộc của F-01..F-03 đặt lên F-04 đều đã thực hiện: `courses` trong danh sách ảnh hưởng khi ngừng nhóm (cùng hình dạng phản hồi, thêm ca đầu-cuối), mục tiêu phạm vi học phần `{ subjectGroupIds, orgUnitIds }`, `OrgUnitSelect types={['FACULTY']}`, hàm "sửa trực tiếp hay qua đề xuất" dùng chung (F-02 §8), `SubjectGroupRefDto` và `CourseRefDto` dời sang `shared/dtos`.

---

## Lệch kế hoạch

1. **Thông điệp lỗi tín chỉ ở máy chủ.** Kế hoạch (BE-06) đòi `details[0]` kèm `CREDITS_MESSAGE`. Hạ tầng sẵn có (`validation-exception.factory.ts`) chỉ đưa **khóa ràng buộc** vào `details[].constraints` (ví dụ `matches`), không đưa câu. Theo hạ tầng sẵn có: ca KB-002 kiểm `details[0].field = 'credits'` và ràng buộc `matches`; câu nêu khoảng hợp lệ hiện ở biểu mẫu qua `COURSE_RULES.credits` (cùng chuỗi `CREDITS_MESSAGE`, có kiểm thử).
2. **Ô tín chỉ là `Input`, không phải `InputNumber stringMode`.** `InputNumber` có `min="0"` kẹp giá trị về 0 khi rời ô nên `-1` không bao giờ tới được luật kiểm, trái US-012 AC3 (phải báo khoảng hợp lệ). `Input inputMode="decimal"` gửi nguyên chuỗi, và luật `CREDITS_PATTERN` báo lỗi.
3. **`trimString` / `emptyToNull` đưa vào `src/shared/dtos/transforms.ts` nhưng chưa dời các chỗ gọi cũ.** Bản của F-02/F-03 là hàm nội tuyến ở `create-user.dto.ts`, `update-user.dto.ts`, `login.dto.ts`, `create-subject-group.dto.ts`, `update-subject-group.dto.ts`, `create-org-unit.dto.ts`, `update-org-unit.dto.ts`; chỉ DTO học phần dùng tệp chung. Dời các chỗ cũ là việc dọn dẹp không đổi hành vi, để riêng.
4. **Không có `PageContainer`, `ApiErrorAlert`, `PageSpin`, `ApiErrorResult`.** Các tên này trong kế hoạch chưa tồn tại trong mã F-01..F-03; các trang học phần dùng `Flex` + `Typography.Title`, `Skeleton`, `Result` như `SubjectGroupDetailPage`. `errorMessage` và `applyFieldErrors` tạo mới ở `shared/forms/applyFieldErrors.ts` (kế hoạch cho phép).
5. **`update` chỉ kiểm lại chủ sở hữu khi giá trị thật sự đổi.** Kế hoạch kiểm lại hễ DTO có `ownerFacultyId` hoặc `ownerGroupId`. Biểu mẫu luôn gửi cả hai nên học phần có nhóm đã ngừng sẽ không sửa được tên. So sánh với giá trị hiện tại trước khi gọi `assertOwners`; di chuyển thật vẫn kiểm đủ. `CourseUsageReader` không nhận `PrismaService` (chưa dùng).
6. **Ô lọc trạng thái** ẩn `CANCELLED` khi không có `course.edit` (kế hoạch đã nêu); nhóm lọc theo khoa đang chọn.
7. **Lỗi từ máy chủ trên biểu mẫu.** `applyFieldErrors` chỉ đặt lỗi dưới ô cho lỗi nghiệp vụ có `details.field` (`COURSE_CODE_TAKEN`, `OWNER_GROUP_INVALID`, `OWNER_FACULTY_INVALID`), dùng `message` của máy chủ làm câu; lỗi `VALIDATION_FAILED` (chỉ có khóa ràng buộc) hiện thành thông báo. Khi sửa, `ownerGroupId` chỉ gửi nếu ô nhóm được hiển thị (người không có `subjectGroup.view` không gửi), như Gotcha của kế hoạch.

Không có lệch về hợp đồng API, tên lỗi, DTO hay thứ tự tuyến.

## Còn nợ

- Đi thử 9 bước bằng trình duyệt (§7) chưa làm; ghi ở `docs/progress/todo.md`.
- Áp migration `20261019072717_courses` lên cơ sở dữ liệu phát triển: `pnpm prisma:migrate` trong `source/backend`.
- Dời các biến đổi `trim`/`emptyToNull` nội tuyến của F-02/F-03 sang `shared/dtos/transforms.ts` (Lệch 3).
- Các sự thật chờ tính năng sau: `hasActiveReplacement` (F-05; đến lúc đó không học phần nào ngừng mở lớp được), `programsUsing` (F-07), `inReleasedVersion` (F-15), `hasStudyResults` (F-17). Ràng buộc chi tiết cho từng tính năng ở §8 của kế hoạch.
- R5 không tạo được học phần (không có `subjectGroup.view` để chọn nhóm, và học phần không nhóm nằm ngoài phạm vi R5): R1 hoặc R4 tạo, R5 sửa — như ghi ở kế hoạch §8.

---

## Incidents

### 1. Ca đầu-cuối dựng nhiều yêu cầu supertest trước khi chạy
- **Triệu chứng**: `TypeError: Cannot read properties of null (reading 'address')` ở `supertest/lib/test.js` trong ca "hủy học phần".
- **Cơ chế**: ca dựng sẵn mảng hai yêu cầu `agent.post(...)`, `agent.patch(...)` rồi `await` lần lượt; supertest mở và đóng máy chủ HTTP tạm cho mỗi yêu cầu, yêu cầu thứ hai mất máy chủ khi yêu cầu thứ nhất xong.
- **Sửa**: kiểm thử — gọi tuần tự từng yêu cầu. Không đổi điều kiện kiểm.

### 2. Client Prisma phải sinh lại sau khi `migrate dev`
- **Triệu chứng**: `tsc` báo `Course`, `CourseType`, `CourseStatus` không có trong `generated/prisma/client`.
- **Cơ chế**: `migrate dev` ở môi trường này không sinh lại client vào `src/generated` (thư mục không nằm trong git).
- **Sửa**: chạy `prisma generate`; ghi vào lưu ý khi dựng lại trên máy khác.

### 3. Sinh lại `schema.d.ts` làm đổi cả tệp
- **Triệu chứng**: `pnpm api:types` cho diff ~3500 dòng.
- **Cơ chế**: `openapi-typescript` xuất không theo Prettier; tệp trong git đã định dạng bằng Prettier.
- **Sửa**: chạy `prettier --write` sau khi sinh; diff còn lại chỉ ~320 dòng thêm. Quy trình: sinh, rồi định dạng.

### 4. Lint `no-misused-spread` trên lớp DTO
- **Triệu chứng**: oxlint cảnh báo `...toCourseSummaryDto(row)` và các `...CREATE` trong spec.
- **Cơ chế**: `CourseSummaryDto` và `CreateCourseDto` là lớp; trải ra mất prototype.
- **Sửa**: mã dùng `Object.assign(toCourseSummaryDto(row), {...})` như `SubjectGroupsService.detail`; spec đặt `CREATE` là đối tượng thuần `satisfies CreateCourseDto`.

---

## Lessons worth keeping

- Quy tắc "sửa trực tiếp hay qua đề xuất" nằm ở một hàm (`shared/authz/edit-path.ts`); tính năng sau truyền `released` và `draftOpenToRequestHolders` của riêng mình, không tự viết lại.
- `details[].constraints` của lỗi kiểm dữ liệu là khóa, không phải câu: câu hướng dẫn phải nằm ở luật của biểu mẫu hoặc ở `message` của lỗi nghiệp vụ.
- Ô số có `min` trong `InputNumber` che mất giá trị âm trước khi luật kiểm chạy; với trường cần báo khoảng hợp lệ hãy dùng ô chữ và luật `pattern`.
- Sau `pnpm api:types` phải chạy Prettier trên `schema.d.ts`; sau `prisma migrate dev` phải chạy `prisma generate`.
