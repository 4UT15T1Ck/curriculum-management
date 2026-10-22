# F-07 Khung chương trình, nhóm tự chọn — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-023 (5 AC), US-024 (3 AC), US-025 (3 AC), US-026 (4 AC), US-027 (3 AC), US-028 (3 AC); tổng 21 AC |
| Màn hình | MH-25 `/programs/:programId/versions/:versionId/curriculum`; MH-26 `/programs/:programId/versions/:versionId/elective-groups`; MH-17/18 chi tiết và sửa học phần |
| Vai trò/tài khoản | R1 admin; R2; R3/R3b theo chương trình; R4/R5 KHMT, R4b/R5b CNPM; R6 theo `source/e2e/fixtures/accounts.ts`. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | Không đổi khung, nhóm tự chọn, trạng thái hoặc phân công trên 1024034 hay chương trình seed khác; không đổi nhóm/phạm vi/quyền demo. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex ngẫu nhiên; EP<suffix> là chương trình riêng Nháp 8 kỳ, EG<suffix> là nhóm riêng; E2E<suffix> là học phần riêng 2.5 TC, trừ ca ghi rõ khác. Mỗi ca tự dựng dữ liệu. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-023..028; `docs/planning/test-plan.md` §6.2 KB-013/014/015/016/017/019/026, §7.2 NT-B2-04/05/07, §8 NFR-01/09/16/18, §9 EC-04/05/06/07/08/10/38; `docs/requirement/REQUIREMENTS.md` FR-17/27/28/29/30/32, BR-04/11, DEC-05, C09. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-25/26; `docs/design/data-dictionary.md` §9; `docs/implementation/f-07-curriculum-elective-groups-implementation-plan.md` §7/§8; `docs/implement-report/f-07-curriculum-elective-groups-implement-report.md` Summary FE-06, Lệch 1/5/8/11/12, Còn nợ. |
| Nguồn mã | `source/frontend/src/features/curriculum/`, `shared/courses/ProgramsUsingList.tsx`, `shared/components/SortableRow.tsx`, `features/courses/pages/CourseFormPage.tsx`; `source/backend/src/features/curriculum/`, `shared/curriculum/`, `shared/programs/version-content.copier.ts`; `source/backend/prisma/seed-data/knowledge-blocks.ts`, `programs.ts`, `permission-catalog.ts`, `demo/`. |
| Playwright spec | `source/e2e/specs/f-07-curriculum-elective-groups.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 26 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 39 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính mục Vai trò/Bao phủ.
| AC | TC |
|---|---|
| US-023 AC1 | F07-TC_001; F07-TC_026; F07-TC_027; F07-TC_047; F07-TC_048; F07-TC_052 |
| NFR-16 | F07-TC_001 |
| US-023 AC2 | F07-TC_002 |
| KB-015 | F07-TC_002; F07-TC_062 |
| EC-06 | F07-TC_002; F07-TC_062 |
| US-023 AC3 | F07-TC_003 |
| KB-017 | F07-TC_003 |
| EC-08 | F07-TC_003; F07-TC_059 |
| US-023 AC4 | F07-TC_004; F07-TC_005; F07-TC_006; F07-TC_065 |
| US-023 AC5 | F07-TC_007; F07-TC_008; F07-TC_049; F07-TC_050 |
| NFR-09 | F07-TC_007; F07-TC_008; F07-TC_045; F07-TC_046; F07-TC_049; F07-TC_050; F07-TC_051; F07-TC_053; F07-TC_054 |
| US-024 AC1 | F07-TC_009 |
| NT-B2-04 | F07-TC_009; F07-TC_012; F07-TC_013 |
| US-024 AC2 | F07-TC_010 |
| KB-016 | F07-TC_010 |
| EC-07 | F07-TC_010 |
| US-024 AC3 | F07-TC_011 |
| NFR-01 | F07-TC_011 |
| US-025 AC1 | F07-TC_012 |
| US-025 AC2 | F07-TC_013 |
| US-025 AC3 | F07-TC_014; F07-TC_044 |
| NFR-18 | F07-TC_014 |
| US-026 AC1 | F07-TC_015; F07-TC_052 |
| KB-013 | F07-TC_015 |
| EC-04 | F07-TC_015 |
| BR-04 | F07-TC_015 |
| NT-B2-05 | F07-TC_015; F07-TC_021 |
| US-026 AC2 | F07-TC_016; F07-TC_017; F07-TC_041 |
| US-026 AC3 | F07-TC_018 |
| KB-014 | F07-TC_018 |
| EC-05 | F07-TC_018 |
| US-026 AC4 | F07-TC_019 |
| US-027 AC1 | F07-TC_020; F07-TC_052 |
| US-027 AC2 | F07-TC_021 |
| US-027 AC3 | F07-TC_022 |
| KB-019 | F07-TC_022 |
| EC-10 | F07-TC_022 |
| US-028 AC1 | F07-TC_023 |
| KB-026 | F07-TC_023; F07-TC_025 |
| EC-38 | F07-TC_023 |
| NT-B2-07 | F07-TC_023; F07-TC_025 |
| US-028 AC2 | F07-TC_024 |
| US-028 AC3 | F07-TC_025 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; để No và trống kết quả cho đến khi người dùng thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F07-TC_001 | Khung (MH-25) | Thêm dòng | US-023 AC1; NFR-16 | Kiểm tra lưu đủ cột và giữ ký hiệu | R1; học phần/chương trình riêng Nháp | 1. Thêm học phần; 2. Chọn kỳ 1, nhập khối, hai cờ, điểm và ghi chú; 3. Lưu; 4. Tải lại rồi Sửa | ĐC / *; HT ĐA/TQ ĐA; 2.5/3; Ghi chú riêng | Dòng đúng học phần; ký hiệu “ĐC / *” giữ nguyên; hai cờ vẫn chọn, điểm học 2.5, điểm chuyển 3 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_001 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_002 | Khung (MH-25) | Trùng | US-023 AC2; KB-015; EC-06 | Kiểm tra không chọn lại học phần đã có | R1; học phần riêng đã ở kỳ 1 | 1. Thêm học phần; 2. Tìm đúng mã đã có | E2E<suffix> | “Không tìm thấy”; không có mục chọn trùng | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_002 trong specs/f-07-curriculum-elective-groups.spec.ts. CourseSelect loại listedCourseIds trước submit; không ép DOM để gửi trùng. Backend dự phòng COURSE_ALREADY_IN_CURRICULUM nêu học kỳ cũ. |
| F07-TC_003 | Khung (MH-25) | Học kỳ | US-023 AC3; KB-017; EC-08 | Kiểm tra không đặt dòng ở kỳ 9 của chương trình 8 kỳ | R1; chương trình riêng 8 kỳ | 1. Thêm học phần; 2. Mở Học kỳ; 3. Tìm kỳ 9 | 8/9 | Select chỉ có kỳ 1–8; không lưu được kỳ 9; yêu cầu ngoài UI bị SEMESTER_OUT_OF_RANGE, “Học kỳ vượt quá số học kỳ của chương trình (8 học kỳ).” | No | | | | Thủ công: xác nhận UI giới hạn; kiểm request trong DevTools chỉ trên chương trình riêng, không sửa frontend. |
| F07-TC_004 | Điều kiện (MH-25) | Tiên quyết | US-023 AC4 | Kiểm tra lưu tiên quyết riêng của phiên bản | R1; hai học phần riêng, A kỳ 1/B kỳ 2 | 1. Điều kiện của B; 2. Thêm A, Tiên quyết, ngưỡng 2; 3. Lưu; 4. Tải lại | A/B riêng | Dòng B có “Tiên quyết: <mã A> ≥ 2”; ràng buộc nằm trên khung riêng | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_004 trong specs/f-07-curriculum-elective-groups.spec.ts. Không ghi quan hệ danh mục của học phần seed. |
| F07-TC_005 | Điều kiện (MH-25) | Học trước | US-023 AC4 | Kiểm tra lưu học trước riêng | R1; chương trình và học phần riêng | 1. Điều kiện B; 2. Thêm A, Học trước; 3. Lưu | A/B riêng | Dòng B có “Học trước: <mã A>”; không có ngưỡng điểm | No | | | | Thủ công; không sửa quan hệ seed. |
| F07-TC_006 | Điều kiện (MH-25) | Song hành | US-023 AC4 | Kiểm tra lưu song hành riêng | R1; chương trình và học phần riêng | 1. Điều kiện B; 2. Thêm A, Song hành; 3. Lưu | A/B riêng | Dòng B có “Song hành: <mã A>”; không có ngưỡng điểm | No | | | | Thủ công. |
| F07-TC_007 | Khung (MH-25) | Phân quyền | US-023 AC5; NFR-09 | Kiểm tra R4 không sửa dòng ngoài nhóm | R1 tạo chương trình/dòng riêng, học phần do nhóm CNPM quản lý | 1. R4 KHMT mở khung; 2. Thử ghi dòng qua DevTools với header chống CSRF | R4 KHMT; dòng CNPM riêng | Không có Sửa/Điều kiện/Xóa trên dòng đó; máy chủ 403 OUT_OF_SCOPE | No | | | | Thủ công: học phần và khung riêng; không chuyển nhóm học phần seed. |
| F07-TC_008 |  |  | US-023 AC5; NFR-09 | Kiểm tra R5 không sửa dòng ngoài nhóm | Như ca 007 nhưng phiên R5 KHMT | 1. Mở khung; 2. Thử ghi đúng dòng riêng | R5 KHMT; dòng CNPM riêng | Không có nút ghi của dòng; máy chủ 403 OUT_OF_SCOPE | No | | | | Thủ công; không đổi nhóm/phạm vi demo. |
| F07-TC_009 | Khung (MH-25) | Theo học kỳ | US-024 AC1; NT-B2-04 | Kiểm tra nhóm đúng học kỳ và tính tổng | R1; hai học phần riêng 2.5 TC ở kỳ 1/2 | 1. Mở khung; 2. Chọn Theo học kỳ | Hai dòng riêng | Mỗi học phần nằm đúng thẻ; kỳ 1 có “Học kỳ 1 — 2.5 TC (BB 2.5 / TC 0)” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_009 trong specs/f-07-curriculum-elective-groups.spec.ts. Không định vị tổng TC toàn trang; scope thẻ học kỳ của chương trình đang mở. |
| F07-TC_010 | Khung (MH-25) | Học kỳ rỗng | US-024 AC2; KB-016; EC-07 | Kiểm tra hiện kỳ 7 trống và thông tin | R1; chương trình riêng 8 kỳ chưa có dòng | 1. Mở khung; 2. Chọn Theo học kỳ | Kỳ 7 | Thẻ kỳ 7 có “Chưa có học phần”; cảnh báo “Học kỳ 7 chưa có học phần nào.”; không chặn xem | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_010 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_011 | Khung (MH-25) | Hiệu năng | US-024 AC3; NFR-01 | Kiểm tra mở khung 60 dòng dưới 2 giây | Người kiểm dựng chương trình và 60 dòng riêng; backend đã sẵn sàng | 1. Đo từ mở khung đến đủ dữ liệu hiển thị; 2. Ghi số đo và môi trường | 60 dòng riêng | Khung hiện dưới 2 giây | No | | | | Thủ công: không chạy browser ở đợt viết; không thêm 60 dòng vào chương trình seed. Báo cáo F-07 dòng 70 (Lệch 12) dùng cổng 2 giây. |
| F07-TC_012 | Khung (MH-25) | Lọc kết hợp | US-025 AC1; NT-B2-04 | Kiểm tra lọc học kỳ cùng tự chọn | R1; dòng tự chọn kỳ 2 và bắt buộc kỳ 1 riêng | 1. Chọn Học kỳ 2; 2. Chọn Tự chọn | Hai dòng riêng | Chỉ còn dòng khớp đồng thời cả kỳ và loại | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_012 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_013 | Khung (MH-25) | Lọc khối | US-025 AC2; NT-B2-04 | Kiểm tra lọc ký hiệu và tổng khối | R1; hai dòng riêng thuộc K<suffix> và KHÁC | 1. Lọc Khối kiến thức bằng K<suffix> | Mỗi dòng 2.5 TC | Chỉ dòng thuộc khối đã chọn còn trong bảng; tổng đúng dòng khối riêng là 2.5 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_013 trong specs/f-07-curriculum-elective-groups.spec.ts. Danh mục khối seed rỗng nhưng symbol tự do hoạt động; không cần sửa seed. |
| F07-TC_014 | Khung (MH-25) | Tìm kiếm | US-025 AC3; NFR-18 | Kiểm tra tìm tên và xóa lọc | R1; hai dòng riêng | 1. Nhập tên riêng của dòng A; 2. Xóa lọc | Tên A | Chỉ A còn trong bảng; xóa lọc thì B hiện lại | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_014 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_015 | Nhóm tự chọn (MH-26) | Tín chỉ tối thiểu | US-026 AC1; KB-013; EC-04; BR-04; NT-B2-05 | Kiểm tra nhóm yêu cầu 6 có danh sách 15 tín chỉ | R1; 5 học phần riêng 3 TC, đã thêm vào khung dạng tự chọn | 1. Tạo nhóm tối thiểu 6; 2. Chọn đủ 5 dòng; 3. Lưu | 5×3=15 TC; yêu cầu 6 | Dòng nhóm hiện “6 TC”, tín chỉ đã liệt kê 15; không có “Ít hơn yêu cầu” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_015 trong specs/f-07-curriculum-elective-groups.spec.ts. Test có timeout riêng 120 giây cho dựng 5 học phần qua UI; không phải cổng hiệu năng. |
| F07-TC_016 | Nhóm tự chọn (MH-26) | Số học phần tối thiểu | US-026 AC2 | Kiểm tra chỉ đặt tối thiểu theo số học phần | R1; chương trình riêng | 1. Thêm nhóm; 2. Để trống tín chỉ, nhập 2 học phần; 3. Lưu | 2 HP | Nhóm lưu được, yêu cầu “2 HP” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_016 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_017 | Nhóm tự chọn (MH-26) | Thiếu tối thiểu | US-026 AC2 | Kiểm tra bỏ cả hai yêu cầu tối thiểu | R1; chương trình riêng | 1. Nhập mã/tên nhóm; 2. Để trống hai ngưỡng; 3. Lưu | Trống/trống | “Nhập ít nhất một yêu cầu tối thiểu.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_017 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_018 | Nhóm tự chọn (MH-26) | Xung đột loại | US-026 AC3; KB-014; EC-05 | Kiểm tra không chào dòng bắt buộc để chọn | R1; khung riêng có dòng bắt buộc | 1. Tạo nhóm riêng; 2. Chọn học phần | Mã bắt buộc riêng | Transfer không liệt kê dòng bắt buộc; không thể gán bằng UI | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_018 trong specs/f-07-curriculum-elective-groups.spec.ts. AssignItemsModal lọc trước submit; máy chủ dự phòng GROUP_REQUIRES_ELECTIVE với “Học phần bắt buộc không được đưa vào nhóm tự chọn”. |
| F07-TC_019 | Nhóm tự chọn (MH-26) | Một nhóm mỗi dòng | US-026 AC4 | Kiểm tra không chào dòng đã thuộc nhóm khác | R1; dòng tự chọn riêng thuộc nhóm A | 1. Tạo nhóm B; 2. Chọn học phần của B | A/B riêng | Transfer của B không liệt kê dòng thuộc A | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_019 trong specs/f-07-curriculum-elective-groups.spec.ts. Máy chủ dự phòng ITEM_IN_OTHER_GROUP, “Học phần đã thuộc nhóm tự chọn khác”; không ép request trong automation. |
| F07-TC_020 | Khung (MH-25) | Đổi thứ tự | US-027 AC1 | Kiểm tra đổi thứ tự bằng bàn phím và giữ sau reload | R1; đúng hai dòng riêng cùng kỳ 1, không lọc | 1. Focus tay cầm dòng thứ hai; 2. Space, ArrowUp, Space; 3. Tải lại | Hai mã riêng | Dòng thứ hai cũ có TT 1, dòng đầu cũ có TT 2 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_020 trong specs/f-07-curriculum-elective-groups.spec.ts. Automation kiểm lưu thứ tự qua reload; phần đối chiếu Excel giữ thủ công ở Ghi chú vì xuất thuộc US-037. |
| F07-TC_021 | Khung (MH-25) | Chuyển kỳ | US-027 AC2; NT-B2-05 | Kiểm tra chuyển từ kỳ 3 sang kỳ 5 và tính lại tổng | R1; dòng riêng bắt buộc 2.5 TC kỳ 3 | 1. Sửa dòng; 2. Chọn Học kỳ 5; 3. Lưu; 4. Theo học kỳ | 2.5 TC | Kỳ 3 còn 0 TC, kỳ 5 có 2.5 TC; không xóa rồi tạo dòng mới | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_021 trong specs/f-07-curriculum-elective-groups.spec.ts. Đổi kỳ qua dialog là đường hỗ trợ; kéo qua kỳ khác bị bỏ qua theo báo cáo F-07 dòng 63 (Lệch 5). |
| F07-TC_022 | Khung (MH-25) | Cảnh báo điều kiện | US-027 AC3; KB-019; EC-10 | Kiểm tra chuyển B trước tiên quyết A vẫn lưu | R1; A kỳ 4/B kỳ 5, A là tiên quyết B ngưỡng 2 | 1. Sửa B sang kỳ 3; 2. Lưu | A/B riêng | Cảnh báo “<mã B> (học kỳ 3) cần <mã A> trước, nhưng <mã A> xếp ở học kỳ 4.”; dòng vẫn được lưu | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_022 trong specs/f-07-curriculum-elective-groups.spec.ts. Mức HIGH dùng Alert warning; không khẳng định tag phải viết nguyên văn “tiên quyết xếp sau”. |
| F07-TC_023 | Sửa học phần (MH-18) | Nơi sử dụng | US-028 AC1; KB-026; EC-38; NT-B2-07 | Kiểm tra hiện hai chương trình đang dùng trong form | R1; học phần riêng dùng ở hai chương trình riêng kỳ 1/2 | 1. Mở sửa học phần | Hai EP<suffix> | Trong form có “Học phần đang được dùng ở các chương trình sau”; liệt kê đúng hai chương trình, Nháp và học kỳ | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_023 trong specs/f-07-curriculum-elective-groups.spec.ts. Lệch cách trình bày US-028 AC1: danh sách ở form đã mở, không có bước chặn trước mở form; báo cáo F-07 dòng 41 (Summary FE-06) và CourseFormPage.tsx:137. Không thao tác lên học phần seed. |
| F07-TC_024 | Sửa học phần (MH-18) | Chưa dùng | US-028 AC2 | Kiểm tra hiện học phần chưa được chương trình dùng | R1; học phần mới riêng chưa có dòng khung | 1. Mở sửa học phần | E2E<suffix> | “Học phần chưa được chương trình nào sử dụng”; form sửa mở được | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_024 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_025 | Chi tiết học phần (MH-17) | Nơi sử dụng | US-028 AC3; KB-026; NT-B2-07 | Kiểm tra xem nơi dùng mà không sửa | R1; học phần riêng dùng ở kỳ 2 của chương trình riêng | 1. Mở chi tiết học phần | E2E<suffix>; EP<suffix> | Mục “Chương trình đang sử dụng” có link chương trình riêng và “(Nháp, học kỳ 2)” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_025 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_026 | Khung (MH-25) | Sửa dòng | US-023 AC1 | Kiểm tra sửa ghi chú dòng | R1; dòng riêng đã lưu | 1. Sửa đúng dòng; 2. Đổi ghi chú; 3. Lưu; 4. Tải lại | Ghi chú mới có suffix | “Đã lưu học phần trong khung”; ghi chú mới còn sau tải lại | No | | | | Thủ công. |
| F07-TC_027 | Khung (MH-25) | Bỏ dòng | US-023 AC1 | Kiểm tra xóa dòng khỏi khung không xóa học phần | R1; dòng và học phần riêng | 1. Xóa đúng dòng; 2. Xác nhận; 3. Mở lại chi tiết học phần | Dòng riêng | Dòng không còn trong khung; học phần vẫn mở được trong danh mục | No | | | | Thủ công; không xóa dòng seed. |
| F07-TC_028 | Khung (MH-25) | Bắt buộc | Bổ sung | Kiểm tra chưa chọn học phần | R1; chương trình riêng | 1. Thêm học phần; 2. Chọn kỳ; 3. Lưu | Học phần trống | “Chọn học phần.” | No | | | | Thủ công. |
| F07-TC_029 | Khung (MH-25) | Giới hạn | Bổ sung | Kiểm tra ký hiệu 21 ký tự | R1; form dòng riêng | 1. Nhập ký hiệu; 2. Lưu | K lặp 21 lần | “Ký hiệu tối đa 20 ký tự.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_029 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_030 |  |  | Bổ sung | Kiểm tra ghi chú 501 ký tự | R1; form dòng riêng | 1. Nhập ghi chú; 2. Lưu | N lặp 501 lần | “Ghi chú tối đa 500 ký tự.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_030 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_031 | Khung (MH-25) | Điểm học | Bổ sung | Kiểm tra điểm học vượt 4 | R1; form dòng riêng | 1. Nhập Điểm học; 2. Lưu | 4.01 | “Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).” | No | | | | Thủ công. |
| F07-TC_032 | Khung (MH-25) | Điểm chuyển | Bổ sung | Kiểm tra điểm chuyển âm | R1; form dòng riêng | 1. Nhập Điểm chuyển; 2. Lưu | -0.01 | “Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).” | No | | | | Thủ công. |
| F07-TC_033 | Khung (MH-25) | Điểm biên | Bổ sung | Kiểm tra chấp nhận điểm 0 và 4 | R1; form dòng riêng | 1. Nhập Điểm học 0, Điểm chuyển 4; 2. Lưu; 3. Mở lại | 0;4 | Lưu được, hai giá trị còn nguyên | No | | | | Thủ công. |
| F07-TC_034 | Nhóm tự chọn (MH-26) | Bắt buộc | Bổ sung | Kiểm tra mã nhóm trống | R1; chương trình riêng | 1. Thêm nhóm; 2. Xóa mã; 3. Lưu | Trống | “Nhập mã nhóm.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_034 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_035 | Nhóm tự chọn (MH-26) | Giới hạn | Bổ sung | Kiểm tra mã nhóm 21 ký tự | R1; chương trình riêng | 1. Thêm nhóm; 2. Nhập mã; 3. Lưu | G lặp 21 lần | “Mã nhóm tối đa 20 ký tự.” | No | | | | Thủ công. |
| F07-TC_036 | Nhóm tự chọn (MH-26) | Bắt buộc | Bổ sung | Kiểm tra tên nhóm trống | R1; chương trình riêng | 1. Thêm nhóm; 2. Để trống tên; 3. Lưu | Trống | “Nhập tên nhóm.” | No | | | | Thủ công. |
| F07-TC_037 | Nhóm tự chọn (MH-26) | Giới hạn | Bổ sung | Kiểm tra tên nhóm 201 ký tự | R1; chương trình riêng | 1. Thêm nhóm; 2. Nhập tên; 3. Lưu | N lặp 201 lần | “Tên nhóm tối đa 200 ký tự.” | No | | | | Thủ công. |
| F07-TC_038 | Nhóm tự chọn (MH-26) | Trùng | Bổ sung | Kiểm tra trùng mã nhóm trong phiên bản | R1; nhóm riêng đã tạo | 1. Thêm nhóm dùng lại mã trong cùng phiên bản; 2. Lưu | EG<suffix> | Lỗi trường mã “Mã nhóm tự chọn đã có trong phiên bản này.”; không tạo thêm nhóm | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_038 trong specs/f-07-curriculum-elective-groups.spec.ts. Form hiện message tiếng Việt của máy chủ dưới trường mã. |
| F07-TC_039 | Nhóm tự chọn (MH-26) | Tín chỉ | Bổ sung | Kiểm tra tín chỉ tối thiểu âm | R1; nhóm riêng | 1. Nhập tối thiểu -1; 2. Lưu | -1 | “Số tín chỉ phải là số từ 0 đến 999.99, tối đa 2 chữ số thập phân (ví dụ 3, 2.5 hoặc 0).” | No | | | | Thủ công. |
| F07-TC_040 | Nhóm tự chọn (MH-26) | Số học phần | Bổ sung | Kiểm tra số học phần tối thiểu 0 | R1; form nhóm riêng | 1. Nhập 0; 2. Lưu | 0 | Không lưu giá trị số học phần tối thiểu dưới 1; InputNumber giới hạn hoặc máy chủ từ chối | No | | | | Thủ công, không ép DOM. |
| F07-TC_041 | Nhóm tự chọn (MH-26) | Hai ngưỡng | US-026 AC2 | Kiểm tra đặt đồng thời tín chỉ và số học phần | R1; nhóm riêng | 1. Nhập tối thiểu 6 TC và 2 HP; 2. Lưu | 6;2 | Dòng nhóm ghi “6 TC và 2 HP”; phải đáp ứng cả hai | No | | | | Theo mặc định đã chốt ở báo cáo F-07 dòng 69, Lệch 11; thủ công, không quyết lại C09. |
| F07-TC_042 | Nhóm tự chọn (MH-26) | Rỗng | Bổ sung | Kiểm tra nhóm rỗng trên chương trình riêng | R1; chương trình mới riêng | 1. Mở Nhóm tự chọn | EP<suffix> | “Chưa có nhóm tự chọn” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_042 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_043 | Khung (MH-25) | Rỗng | Bổ sung | Kiểm tra khung riêng chưa có dòng | R1; chương trình mới riêng | 1. Mở khung; 2. Xem tổng và cảnh báo | 0 dòng | Không có dòng học phần; các kỳ và tổng 0 vẫn hiện; còn nút “Thêm học phần” | No | | | | Thủ công: chỉ đòi khung của chương trình riêng rỗng, không đòi DB rỗng. |
| F07-TC_044 | Khung (MH-25) | Không kết quả | US-025 AC3 | Kiểm tra tìm không có dòng khớp | R1; khung riêng đã có dòng | 1. Tìm mã không tồn tại | NONE<suffix> | Dòng riêng biến mất; có “Xóa lọc”; không mất dữ liệu khung | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_044 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_045 | Khung (MH-25) | Phân quyền | NFR-09 | Kiểm tra R2 chỉ đọc khung | R1 tạo chương trình/dòng riêng | 1. R2 mở khung; 2. Thử yêu cầu ghi trong DevTools với X-Requested-With | R2 | Đọc được dòng; không có nút ghi hoặc tay cầm; máy chủ 403 PERMISSION_DENIED | No | | | | Thủ công; không sửa ma trận. |
| F07-TC_046 | Khung (MH-25) | Phạm vi | NFR-09 | Kiểm tra R3 ngoài chương trình không ghi khung | R1 tạo B riêng, không phân công R3 | 1. R3 mở khung B; 2. Thử thêm/sửa/đổi thứ tự/nhóm qua DevTools | B riêng | Chỉ đọc; yêu cầu ghi bị 403 OUT_OF_SCOPE | No | | | | Thủ công; không thu hồi phân công seed để ép ngoài phạm vi. |
| F07-TC_047 | Khung (MH-25) | Trong nhóm | US-023 AC1 | Kiểm tra R4 sửa được dòng thuộc nhóm mình | R1 tạo học phần riêng thuộc KHMT và dòng riêng | 1. R4 sửa ghi chú đúng dòng; 2. Lưu | Dòng KHMT riêng | “Đã lưu học phần trong khung”; ghi chú mới hiện | No | | | | Thủ công; chỉ gán nhóm cho học phần riêng, không đổi nhóm hoặc tài khoản seed. |
| F07-TC_048 |  |  | US-023 AC1 | Kiểm tra R5 sửa được dòng thuộc nhóm mình | Như ca 047 nhưng phiên R5 | 1. R5 sửa đúng dòng; 2. Lưu | Dòng KHMT riêng | Lưu được ghi chú; không suy quyền cấu trúc | No | | | | Thủ công; không đổi phạm vi demo. |
| F07-TC_049 | Khung (MH-25) | Ngoài nhóm ngược | US-023 AC5; NFR-09 | Kiểm tra R4b không sửa dòng KHMT | R1 tạo dòng KHMT riêng | 1. R4b CNPM mở khung; 2. Thử ghi với header đúng | Dòng KHMT riêng | Không có thao tác ghi dòng; 403 OUT_OF_SCOPE | No | | | | Thủ công; không chuyển nhóm seed. |
| F07-TC_050 |  |  | US-023 AC5; NFR-09 | Kiểm tra R5b không sửa dòng KHMT | R1 tạo dòng KHMT riêng | 1. R5b CNPM mở khung; 2. Thử ghi với header đúng | Dòng KHMT riêng | Không có thao tác ghi dòng; 403 OUT_OF_SCOPE | No | | | | Thủ công; không đổi nhóm tài khoản demo. |
| F07-TC_051 | Khung (MH-25) | Sinh viên | NFR-09 | Kiểm tra R6 không mở khung ngoài phạm vi | R1 cung cấp URL khung riêng | 1. R6 mở URL khung và URL Nhóm tự chọn | R6 seed ngoài khoa chương trình | “Bạn không có quyền xem khung chương trình này”; trang nhóm: “Bạn không có quyền xem nhóm tự chọn này” | No | | | | Thủ công; không mở rộng scope R6. |
| F07-TC_052 | Khung (MH-25) | Giám đốc | US-023 AC1; US-026 AC1; US-027 AC1 | Kiểm tra R3 trong chương trình ghi được cấu trúc | R1 tạo A riêng và phân công demo R3 chỉ trên A | 1. R3 thêm dòng/nhóm; 2. Đổi thứ tự | A riêng | Các thao tác trực tiếp lưu được trên Nháp chưa từng ban hành | No | | | | Thủ công; được thêm phân công trên A riêng, không thay seed hay khẳng định danh sách scope đầy đủ. |
| F07-TC_053 | Khung (MH-25) | Quyền cấu trúc | NFR-09 | Kiểm tra R4 không sắp xếp hoặc quản lý nhóm | R4 có dòng KHMT riêng sửa được | 1. Kiểm tay cầm và Nhóm tự chọn; 2. Thử PUT order/POST group với header đúng | R4 | Không có tay cầm hoặc Thêm nhóm/Sửa nhóm; yêu cầu cấu trúc 403 OUT_OF_SCOPE | No | | | | Thủ công; quyền dòng khác quyền cấu trúc. |
| F07-TC_054 |  |  | NFR-09 | Kiểm tra R5 không sắp xếp hoặc quản lý nhóm | R5 có dòng KHMT riêng sửa được | 1. Kiểm tay cầm/nhóm; 2. Thử yêu cầu cấu trúc | R5 | Không có thao tác cấu trúc; máy chủ 403 OUT_OF_SCOPE | No | | | | Thủ công; không thay quyền. |
| F07-TC_055 | Khung (MH-25) | Sắp xếp khi lọc | Bổ sung | Kiểm tra lọc tắt tay cầm | R1; khung riêng có dòng | 1. Kiểm tay cầm đúng dòng; 2. Tìm mã dòng | Mã riêng | Trước lọc có “Kéo để đổi thứ tự”; khi lọc không còn tay cầm ở dòng đó | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F07-TC_055 trong specs/f-07-curriculum-elective-groups.spec.ts. |
| F07-TC_056 | Nhóm tự chọn (MH-26) | Xóa nhóm | Bổ sung | Kiểm tra xóa nhóm giữ dòng tự chọn | R1; nhóm và dòng riêng | 1. Xóa đúng nhóm; 2. Xác nhận; 3. Mở khung | Nhóm riêng | Nhóm biến mất; các học phần trong nhóm vẫn “Tự chọn” và chưa thuộc nhóm | No | | | | Thủ công; không xóa nhóm seed. |
| F07-TC_057 | Khung (MH-25) | Tổng tín chỉ | Bổ sung | Kiểm tra học phần 0 tín chỉ vẫn là bắt buộc | R1; chương trình/học phần riêng 0 TC | 1. Thêm dòng bắt buộc; 2. Xem tổng | 0 TC | Dòng vẫn hiện Bắt buộc; tổng kỳ không tăng | No | | | | Thủ công; giao điểm BR-02/EC-01, không nhận bao phủ đầy đủ KB-012 thuộc US-029/F-08. |
| F07-TC_058 |  |  | Bổ sung | Kiểm tra giữ phần lẻ 2.5 | R1; học phần riêng 2.5 TC | 1. Thêm vào kỳ trống; 2. Xem tổng | 2.5 TC | Tổng kỳ là 2.5, không cắt thành 2 | No | | | | Thủ công; tổng đầy đủ theo nhóm thuộc US-029, không mở rộng sang F-08. |
| F07-TC_059 | Thông tin (MH-23) | Học kỳ tối đa | EC-08 | Kiểm tra chặn giảm số kỳ dưới dòng đã có | R1; chương trình riêng 8 kỳ, dòng riêng ở kỳ 8 | 1. Sửa thông tin chương trình; 2. Đổi số kỳ thành 7; 3. Lưu | 8 → 7 | Báo “Khung chương trình đã có học phần ở học kỳ 8; chuyển các học phần đó trước khi giảm số học kỳ.”; không lưu 7 | No | | | | Thủ công, chỉ chương trình riêng; chốt F-07 đã bổ sung vào semester-check.ts. |
| F07-TC_060 | Khung (MH-25) | Phiên bản không Nháp | Bổ sung | Kiểm tra không ghi trực tiếp phiên bản đóng | Người kiểm dựng phiên bản riêng không phải DRAFT | 1. Mở khung; 2. Thử lưu dòng qua DevTools | Phiên bản riêng | Không sửa trực tiếp; VERSION_NOT_EDITABLE, “Chỉ sửa được khung của phiên bản nháp.” | No | | | | Thủ công: không ban hành/đóng chương trình seed, không đổi trạng thái bằng DB trong suite. |
| F07-TC_061 | Khung (MH-25) | Sau ban hành | Bổ sung | Kiểm tra sửa qua đề xuất sau ban hành | Người kiểm dựng chương trình riêng đã từng ban hành | 1. Mở Nháp làm việc; 2. Kiểm đường sửa | Chương trình riêng | Dẫn qua đề xuất thay vì ghi trực tiếp vào khung gốc; máy chủ bảo vệ CHANGE_REQUEST_REQUIRED | No | | | | Thủ công: không ban hành hoặc đổi phiên bản seed chỉ để kiểm; không xây luồng F-13/F-15 trong automation này. |
| F07-TC_062 | Khung (MH-25) | Mã khác nhau | KB-015; EC-06 | Kiểm tra hai đồ án mã khác được thêm cùng khung | R1; hai học phần tự tạo tên Đồ án 1/Đồ án 2, mã khác | 1. Thêm cả hai vào khung riêng | Hai mã E2E<suffix> | Cả hai dòng lưu được; không bị coi là trùng học phần | No | | | | Thủ công; không chỉ đổi tên cùng một mã. |
| F07-TC_063 | Nhóm tự chọn (MH-26) | Biên tín chỉ | Bổ sung | Kiểm tra tối thiểu 0 tín chỉ vẫn là một ngưỡng | R1; nhóm riêng | 1. Nhập Số tín chỉ tối thiểu 0; 2. Lưu | 0; số HP trống | Nhóm lưu được, hiện “0 TC” | No | | | | Thủ công; trường tín chỉ cho phép 0, không tự đặt quy tắc >0. |
| F07-TC_064 | Khung (MH-25) | Biên hợp lệ | Bổ sung | Kiểm tra lưu ký hiệu 20 và ghi chú 500 ký tự | R1; dòng riêng | 1. Nhập ký hiệu 20 ký tự và ghi chú 500 ký tự; 2. Lưu; 3. Mở lại | 20;500 | Giữ đủ giá trị, không báo lỗi giới hạn | No | | | | Thủ công; dùng suffix để phân biệt dữ liệu. |
| F07-TC_065 | Điều kiện (MH-25) | Chu trình | US-023 AC4 | Kiểm tra chặn vòng điều kiện riêng | R1; A/B riêng, B cần A | 1. Mở điều kiện A; 2. Thêm B là tiên quyết; 3. Lưu | A → B → A | “Điều kiện này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng” kèm đường đi; dialog không đóng | No | | | | Thủ công; giao điểm BR-11/EC-09, không nhận bao phủ toàn bộ KB-020 thuộc US-031. |

## Ghi chú

- Ca 038 và 059 trích thông báo tiếng Việt thực tế thay vì mã constraint trong mock/chi tiết lỗi.

- Ký hiệu là chuỗi tự do, danh mục khối seed còn rỗng (báo cáo F-07 dòng 59, Lệch 1). Ca 013 dùng khối tự nhập; không sửa seed hoặc tạo danh mục khối ngoài UI được hỗ trợ. Ký hiệu chưa gán lọc bằng “(Chưa gán khối)” theo Lệch 8.
- US-028 AC1: danh sách dùng ở form đã mở thay vì bước trước mở; kế hoạch §7 bước 8 và báo cáo Summary FE-06 mô tả `ProgramsUsingList` ở `CourseFormPage`. Ca 023 bám mã hiện tại, không suy ra có modal xác nhận. Phiên bản/học kỳ kiểm theo từng list item chứa mã riêng.
- Ca 020 tự động phần lưu thứ tự và reload bằng bàn phím (Space/ArrowUp/Space), không dùng tọa độ. Người kiểm tiếp tục xuất Excel và đối chiếu TT cho cùng hai mã để hoàn tất phần xuất của US-027 AC1; không tuyên bố automation đã kiểm file Excel. Chuyển kỳ ở ca 021 dùng form vì hook không kéo qua học kỳ (báo cáo Lệch 5).
- Các ca 007–008, 047–050 cần học phần tự tạo có nhóm phù hợp; helper courses mặc định chưa gán nhóm. Giữ thủ công các fixture phạm vi này; tuyệt đối không đổi nhóm học phần seed hoặc tài khoản demo để thử quyền. Phân công R3 chỉ thêm trên chương trình riêng (ca 052).
- Ca 059–061 cần trạng thái chương trình/phiên bản riêng, không giảm số kỳ hoặc ban hành chương trình seed. Ca 011 cần đo bằng trình duyệt trên 60 dòng riêng; không nhận kết quả unit/in-memory thay cho số đo UI.
- Ca 015/018/019 chứng minh Transfer chỉ cho chọn dòng hợp lệ. Học phần bắt buộc hoặc đã thuộc nhóm khác bị lọc ngay ở UI; không ép DOM, không gắn hai nhóm rồi mới mong lỗi. Backend vẫn kiểm GROUP_REQUIRES_ELECTIVE/ITEM_IN_OTHER_GROUP.
- KB-012/018/020/021 thuộc US-029..031/F-08, không mở rộng ca nghiệm thu của chúng ở đây; chỉ ca biên tổng 0/thập phân và vòng điều kiện chạm phần mã dùng chung. KB-019, NT-B2-04/05/07 và KB-026 có story thuộc phạm vi nên đã truy vết; tác động sinh phiên bản vì sửa đề cương ở EC-38 thuộc F-15, không giả định đã kiểm bằng danh sách nơi dùng.
- NFR-18: khung hiện đọc/lọc phía client, bảng `pagination=false`, thứ tự TT là thứ tự có nghĩa nghiệp vụ. Ca 014 kiểm tìm và khôi phục, không coi đó là đủ mọi yêu cầu phân trang/sắp cột của NFR chung.
- Không có nghi lỗi mới cần `test.fixme`; các lệch trình bày/mặc định đã có nguồn. Chưa chạy trình duyệt, mọi cột thực thi trống. Dữ liệu thử tích lũy, không xóa dọn hoặc reset DB.
