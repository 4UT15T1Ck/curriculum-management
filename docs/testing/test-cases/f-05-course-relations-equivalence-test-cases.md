# F-05 Quan hệ học phần, nhóm tương đương — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-015 (4 AC), US-016 (3 AC), US-017 (4 AC); tổng 11 AC |
| Màn hình | MH-17 Chi tiết `/courses/:courseId`; MH-19 Nhóm tương đương `/equivalence-groups` |
| Vai trò/tài khoản | R1, R2, R3/R3b, R4/R4b, R5/R5b, R6 lấy từ `fixtures/accounts.ts`; R4/R5 KHMT, vai b CNPM. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | PRG101 chỉ dùng để xem quyền; không thêm/xóa quan hệ hoặc đổi nhóm tương đương của học phần seed. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex mới mỗi lần. Học phần `E2E<suffix>` qua `fixtures/courses.ts`, mặc định 2.5 TC; nhóm `EQ<suffix>` dài 18. A/B/C/D trong ca là mã riêng, không phải seed. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-015..017; `docs/planning/test-plan.md` §6.1 KB-004..007, §7.1 NT-B1-04, §9 EC-09/15/16/18; `docs/requirement/REQUIREMENTS.md` FR-18..21, BR-09/11. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-17/19; `docs/design/data-dictionary.md` §9; `docs/implementation/f-05-course-relations-equivalence-implementation-plan.md` §1, §7–8; `docs/implement-report/f-05-course-relations-equivalence-implement-report.md` Hiệu lực lúc chạy, Lệch kế hoạch 7/10, Còn nợ. |
| Nguồn mã | `source/frontend/src/features/courses/components/`, `constants/relationLabels.ts`, `features/equivalence-groups/`, `shared/courses/`; `source/backend/src/features/course-relations/`, `features/equivalence-groups/`, `shared/courses/`; `source/backend/prisma/seed-data/permission-catalog.ts`, `demo/catalog.ts`. |
| Playwright spec | `source/e2e/specs/f-05-course-relations-equivalence.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 26 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 27 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính mục Vai trò/Bao phủ.

| AC | TC |
|---|---|
| US-015 AC1 | F05-TC_001; F05-TC_002; F05-TC_003 |
| US-015 AC2 | F05-TC_004; F05-TC_005 |
| NT-B1-04 | F05-TC_004; F05-TC_008; F05-TC_009 |
| US-015 AC3 | F05-TC_006 |
| US-015 AC4 | F05-TC_007 |
| US-016 AC1 | F05-TC_008 |
| KB-005 | F05-TC_008; F05-TC_011 |
| EC-09 | F05-TC_008; F05-TC_009 |
| KB-004 | F05-TC_009 |
| US-016 AC2 | F05-TC_010 |
| US-016 AC3 | F05-TC_011; F05-TC_012 |
| US-017 AC1 | F05-TC_022 |
| US-017 AC2 | F05-TC_023 |
| KB-006 | F05-TC_023; F05-TC_024 |
| EC-15 | F05-TC_023 |
| US-017 AC3 | F05-TC_024 |
| US-017 AC4 | F05-TC_025 |
| KB-007 | F05-TC_025; F05-TC_026 |
| EC-16 | F05-TC_025; F05-TC_026 |
| EC-18 | F05-TC_025; F05-TC_026 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; để No và trống kết quả cho đến khi người dùng thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F05-TC_001 | Quan hệ học phần (MH-17) | Thêm quan hệ | US-015 AC1 | Kiểm tra học trước hiện ở hai đầu | R1; hai học phần riêng A/B | 1. Mở A; 2. Thêm quan hệ, chọn Là học phần học trước của B; 3. Lưu; 4. Mở B | A/B riêng | A hiện “Là học phần học trước của”; B hiện “Cần học trước học phần” và liên kết A | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_001 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_002 |  |  | US-015 AC1 | Kiểm tra song hành hiện ở hai đầu | R1; A/B riêng | 1. Thêm A Học song hành với B; 2. Mở B | A/B riêng | Cả hai đầu hiện “Học song hành với” và liên kết đầu kia | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_002 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_003 |  |  | US-015 AC1 | Kiểm tra thay thế đúng chiều ở hai đầu | R1; A/B riêng | 1. Thêm A Được thay thế bởi B; 2. Mở B | A/B riêng | A hiện “Được thay thế bởi”; B hiện “Thay thế cho” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_003 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_004 | Quan hệ học phần (MH-17) | Tiên quyết | US-015 AC2; NT-B1-04 | Kiểm tra lưu ngưỡng điểm 2.5 | R1; A/B riêng | 1. Thêm A Cần đạt tiên quyết học phần B; 2. Nhập ngưỡng; 3. Lưu | 2.5 | Quan hệ hiện B và Ngưỡng điểm 2.5 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_004 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_005 |  |  | US-015 AC2 | Kiểm tra ngưỡng bỏ trống | R1; A/B riêng | 1. Thêm tiên quyết; 2. Để trống ngưỡng; 3. Lưu | — | Quan hệ lưu được; ngưỡng hiện “—” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_005 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_006 | Quan hệ học phần (MH-17) | Trùng | US-015 AC3 | Kiểm tra quan hệ cùng loại trùng cặp | R1; A/B riêng có PRIOR | 1. Thêm lại cùng quan hệ | A/B riêng | Hiện “Hai học phần này đã có quan hệ loại này.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_006 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_007 | Quan hệ học phần (MH-17) | Tự tham chiếu | US-015 AC4 | Kiểm tra chặn quan hệ với chính nó ở máy chủ | R1; A riêng | 1. POST /api/course-relations với source và target là A | PRIOR; A/A | HTTP 400; “Không khai báo được quan hệ của một học phần với chính nó.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_007 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_008 | Quan hệ học phần (MH-17) | Chu trình | US-016 AC1; KB-005; EC-09; NT-B1-04 | Kiểm tra chặn vòng ba học phần trộn loại | R1; A/B/C riêng, A tiên quyết B, B học trước C | 1. Thêm C tiên quyết A; 2. Lưu | A/B/C riêng | Hiện “Quan hệ này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng: A → B → C → A.” (thay A/B/C bằng mã riêng) | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_008 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_009 |  |  | KB-004; EC-09; NT-B1-04 | Kiểm tra chặn vòng hai học phần | R1; A/B riêng, A tiên quyết B | 1. Thêm B tiên quyết A; 2. Lưu | A/B riêng | Thông báo vòng hiển thị A → B → A; không lưu cạnh mới | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_009 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_010 |  |  | US-016 AC2 | Kiểm tra đồ thị không vòng lưu được | R1; A/B/C riêng, A tiên quyết B | 1. Thêm B học trước C; 2. Lưu | A/B/C riêng | Quan hệ học trước lưu, hiện liên kết C | No | | | |  |
| F05-TC_011 |  |  | US-016 AC3; KB-005 | Kiểm tra song hành hai chiều không bị chặn vòng | R1; A/B riêng | 1. Thêm A song hành B; 2. Thêm B song hành A | A/B riêng | Cả hai quan hệ lưu được; không thông báo vòng tiên quyết | No | | | |  |
| F05-TC_012 |  |  | US-016 AC3 | Kiểm tra thay thế hai chiều không bị kiểm vòng tiên quyết | R1; A/B riêng | 1. Thêm A được thay thế bởi B; 2. Thêm B được thay thế bởi A | A/B riêng | Cả hai lưu được, không bị quy tắc vòng học trước/tiên quyết chặn | No | | | |  |
| F05-TC_013 | Quan hệ học phần (MH-17) | Kiểm dữ liệu | Bổ sung | Kiểm tra ngưỡng thấp hơn 0 | R1; A/B riêng | 1. Thêm tiên quyết; 2. Nhập ngưỡng; 3. Lưu | -0.01 | Hiện “Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_013 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_014 |  |  | Bổ sung | Kiểm tra ngưỡng vượt 4 | R1; A/B riêng | 1. Thêm tiên quyết; 2. Nhập ngưỡng; 3. Lưu | 4.01 | Hiện “Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_014 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_015 |  |  | Bổ sung | Kiểm tra ngưỡng quá hai chữ số thập phân | R1; A/B riêng | 1. Thêm tiên quyết; 2. Nhập ngưỡng; 3. Lưu | 2.555 | Hiện “Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_015 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_016 |  |  | Bổ sung | Kiểm tra ngưỡng biên 0 | R1; A/B riêng | 1. Thêm tiên quyết; 2. Nhập 0; 3. Lưu | 0 | Lưu được; hiện ngưỡng 0 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_016 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_017 |  |  | Bổ sung | Kiểm tra ngưỡng biên 4 | R1; A/B riêng | 1. Thêm tiên quyết; 2. Nhập 4; 3. Lưu | 4 | Lưu được; hiện ngưỡng 4 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_017 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_018 |  |  | Bổ sung | Kiểm tra loại quan hệ bắt buộc | R1; A riêng | 1. Thêm quan hệ; 2. Không chọn loại; 3. Lưu | — | Hiện “Chọn loại quan hệ.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_018 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_019 |  |  | Bổ sung | Kiểm tra học phần bắt buộc | R1; A riêng | 1. Thêm quan hệ; 2. Chọn loại, không chọn học phần; 3. Lưu | — | Hiện “Chọn học phần.” | No | | | |  |
| F05-TC_020 | Quan hệ học phần (MH-17) | Rỗng | Bổ sung | Kiểm tra học phần riêng chưa có quan hệ | R1; A riêng vừa tạo | 1. Mở A | A riêng | Hiện “Chưa có quan hệ nào”; “Chưa thuộc nhóm tương đương nào” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_020 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_021 | Quan hệ học phần (MH-17) | Xóa | Bổ sung | Kiểm tra xóa quan hệ riêng | R1; A/B riêng có một quan hệ | 1. Xóa tại dòng; 2. Xác nhận Xóa | Quan hệ riêng | Dòng mất; hiện “Chưa có quan hệ nào” | No | | | |  |
| F05-TC_022 | Nhóm tương đương (MH-19) | Tạo | US-017 AC1 | Kiểm tra tạo nhóm hai học phần | R1; A/B riêng chưa nhóm | 1. Tạo nhóm; 2. Nhập mã, chọn A/B; 3. Lưu; 4. Mở A và B | EQ<suffix> | Mỗi học phần hiện học phần kia ở Học phần tương đương | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_022 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_023 | Nhóm tương đương (MH-19) | Thành viên | US-017 AC2; KB-006; EC-15 | Kiểm tra thêm C tạo tương đương bắc cầu | R1; nhóm riêng A/B; C riêng chưa nhóm | 1. Thêm học phần C; 2. Lưu; 3. Mở A và C | C riêng | A hiện B/C; C hiện A/B là tương đương | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_023 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_024 | Nhóm tương đương (MH-19) | Trùng nhóm | US-017 AC3; KB-006 | Kiểm tra học phần đã nhóm bị chặn và đề nghị gộp | R1; hai nhóm riêng A/B và C/D | 1. Thêm A vào nhóm C/D; 2. Lưu | A riêng | Lỗi “Học phần đã thuộc một nhóm tương đương khác; hãy gộp hai nhóm” kèm mã A và nhóm; hiện nút Gộp nhóm | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_024 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_025 | Nhóm tương đương (MH-19) | Khác khoa | US-017 AC4; KB-007; EC-16; EC-18 | Kiểm tra nhóm cho phép khác khoa và tín chỉ | R1; A/B riêng ở hai khoa, 2.5 và 3 tín chỉ | 1. Tạo nhóm gồm A/B; 2. Mở chi tiết hai học phần | Khoa CNTT/Khoa Khoa học cơ bản | Lưu được; nhóm tương đương hiện ở cả hai đầu | No | | | |  |
| F05-TC_026 |  |  | KB-007; EC-16; EC-18 | Kiểm tra nhóm độc lập chương trình và phiên bản | R1; học phần riêng thuộc hai chương trình/phiên bản riêng | 1. Tạo nhóm tương đương từ học phần của hai phiên bản; 2. Mở chi tiết | Học phần khung cũ và mới | Cùng nhóm hiện ở cả hai; form không yêu cầu chọn chương trình/phiên bản | No | | | | Thủ công: cần fixture chương trình/phiên bản riêng; không đổi nhóm hoặc quan hệ học phần seed dùng chung. |
| F05-TC_027 | Nhóm tương đương (MH-19) | Kiểm dữ liệu | Bổ sung | Kiểm tra mã nhóm bắt buộc | R1 | 1. Tạo nhóm; 2. Để trống mã; 3. Lưu | — | Hiện “Nhập mã nhóm.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_027 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_028 |  |  | Bổ sung | Kiểm tra mã nhóm vượt 20 ký tự | R1 | 1. Tạo nhóm; 2. Nhập mã 21 ký tự; 3. Lưu | E lặp 21 lần | Hiện “Mã nhóm tối đa 20 ký tự.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_028 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_029 |  |  | Bổ sung | Kiểm tra ghi chú vượt 500 ký tự | R1 | 1. Tạo nhóm; 2. Nhập ghi chú 501 ký tự; 3. Lưu | N lặp 501 lần | Hiện “Ghi chú tối đa 500 ký tự.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_029 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_030 |  |  | Bổ sung | Kiểm tra không chọn thành viên | R1 | 1. Tạo nhóm; 2. Nhập mã, không chọn học phần; 3. Lưu | EQ<suffix> | Hiện “Chọn ít nhất 2 học phần.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_030 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_031 |  |  | Bổ sung | Kiểm tra chỉ chọn một thành viên | R1; A riêng | 1. Tạo nhóm; 2. Chọn chỉ A; 3. Lưu | A riêng | Hiện “Chọn ít nhất 2 học phần.” | No | | | |  |
| F05-TC_032 |  |  | Bổ sung | Kiểm tra trùng mã nhóm riêng | R1; nhóm riêng A/B đã tồn tại, C/D riêng chưa nhóm | 1. Tạo nhóm mới cùng mã với C/D; 2. Lưu | Mã nhóm riêng | Hiện “Mã nhóm tương đương đã tồn tại.” ở form | No | | | |  |
| F05-TC_033 |  |  | Bổ sung | Kiểm tra chấp nhận mã 20 và ghi chú 500 ký tự | R1; A/B riêng chưa nhóm | 1. Tạo nhóm tại biên; 2. Lưu | Mã riêng 20; ghi chú 500 | Nhóm hiện trong danh sách | No | | | |  |
| F05-TC_034 |  |  | Bổ sung | Kiểm tra chấp nhận 50 học phần | R1; 50 học phần riêng chưa nhóm | 1. Tạo nhóm chọn đủ 50; 2. Lưu | 50 học phần riêng | Nhóm lưu được với đủ 50 học phần | No | | | |  |
| F05-TC_035 |  |  | Bổ sung | Kiểm tra từ chối 51 học phần | R1; 51 học phần riêng chưa nhóm | 1. Tạo nhóm chọn 51; 2. Lưu | 51 học phần riêng | Hiện “Một nhóm có tối đa 50 học phần.” | No | | | |  |
| F05-TC_036 | Nhóm tương đương (MH-19) | Tra cứu | Bổ sung | Kiểm tra tìm không có kết quả | R1 | 1. Nhập từ khóa mới; 2. Enter | NO<suffix> | Hiện “Chưa có nhóm tương đương” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_036 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_037 | Nhóm tương đương (MH-19) | Gộp | Bổ sung | Kiểm tra gộp hai nhóm riêng | R1; hai nhóm riêng | 1. Gộp với nhóm…; 2. Chọn nhóm kia và mã giữ; 3. Gộp nhóm | Hai nhóm riêng | Nhóm giữ có toàn bộ thành viên; nhóm còn lại không còn trong danh sách | No | | | |  |
| F05-TC_038 |  |  | Bổ sung | Kiểm tra không bỏ thành viên làm nhóm dưới hai | R1; nhóm riêng chỉ A/B | 1. Bỏ A; 2. Xác nhận | A riêng | Hiện “Nhóm tương đương cần ít nhất 2 học phần; hãy giải thể nhóm nếu không cần nữa.” | No | | | |  |
| F05-TC_039 |  |  | Bổ sung | Kiểm tra giải thể nhóm riêng | R1; nhóm riêng A/B | 1. Giải thể; 2. Đọc cảnh báo; 3. Giải thể nhóm; 4. Mở A | Nhóm riêng | Nhóm không còn; A hiện “Chưa thuộc nhóm tương đương nào” | No | | | |  |
| F05-TC_040 | Quan hệ học phần (MH-17) | Phân quyền | Bổ sung | Kiểm tra R2 chỉ xem quan hệ | R2; PRG101 seed | 1. Mở PRG101 | PRG101 | Không có nút Thêm quan hệ | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_040 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_041 |  |  | Bổ sung | Kiểm tra R6 chỉ xem quan hệ | R6; PRG101 seed | 1. Mở PRG101 | PRG101 | Không có nút Thêm quan hệ | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F05-TC_041 trong specs/f-05-course-relations-equivalence.spec.ts. |
| F05-TC_042 |  |  | Bổ sung | Kiểm tra R3 ngoài khoa không sửa trực tiếp | R3; A/B riêng thuộc Khoa Khoa học cơ bản do R1 tạo | 1. Thử thêm quan hệ sở hữu bởi A | A ngoài khoa | HTTP 409 CHANGE_REQUEST_REQUIRED; “Dữ liệu này chỉ thay đổi được qua đề xuất thay đổi.” | No | | | |  |
| F05-TC_043 |  |  | Bổ sung | Kiểm tra R4 ngoài nhóm bị từ chối | R4 KHMT; A/B riêng CNPM do R1 tạo | 1. Thử thêm quan hệ sở hữu bởi A | A CNPM | HTTP 403 OUT_OF_SCOPE; “Đối tượng này nằm ngoài phạm vi được phân công của bạn.”; không có quan hệ mới | No | | | |  |
| F05-TC_044 |  |  | Bổ sung | Kiểm tra R5 ngoài nhóm bị từ chối | R5 KHMT; A/B riêng CNPM do R1 tạo | 1. Thử thêm quan hệ sở hữu bởi A | A CNPM | HTTP 403 OUT_OF_SCOPE; “Đối tượng này nằm ngoài phạm vi được phân công của bạn.”; không có quan hệ mới | No | | | |  |
| F05-TC_045 | Nhóm tương đương (MH-19) | Phân quyền | Bổ sung | Kiểm tra R2 không tạo nhóm | R2 | 1. Mở /equivalence-groups | — | Xem danh sách được; không có nút Tạo nhóm | No | | | |  |
| F05-TC_046 |  |  | Bổ sung | Kiểm tra R3 không lưu nhóm dù thấy nút | R3; A/B riêng do R1 tạo chưa nhóm | 1. Tạo nhóm gồm A/B; 2. Lưu | EQ<suffix> | HTTP 403 PERMISSION_DENIED; “Bạn không có quyền thực hiện thao tác này.”; nhóm không tạo | No | | | | Lệch hiển thị quyền: R3–R5 thấy nút nhưng máy chủ chỉ cho R1; báo cáo Lệch kế hoạch 10, kế hoạch §8. Không sửa quyền toàn cục để né 403. |
| F05-TC_047 |  |  | Bổ sung | Kiểm tra R4 không lưu nhóm dù thấy nút | R4; A/B riêng do R1 tạo chưa nhóm | 1. Tạo nhóm gồm A/B; 2. Lưu | EQ<suffix> | HTTP 403 PERMISSION_DENIED; “Bạn không có quyền thực hiện thao tác này.”; nhóm không tạo | No | | | | Lệch hiển thị quyền: R3–R5 thấy nút nhưng máy chủ chỉ cho R1; báo cáo Lệch kế hoạch 10, kế hoạch §8. Không sửa quyền toàn cục để né 403. |
| F05-TC_048 |  |  | Bổ sung | Kiểm tra R5 không lưu nhóm dù thấy nút | R5; A/B riêng do R1 tạo chưa nhóm | 1. Tạo nhóm gồm A/B; 2. Lưu | EQ<suffix> | HTTP 403 PERMISSION_DENIED; “Bạn không có quyền thực hiện thao tác này.”; nhóm không tạo | No | | | | Lệch hiển thị quyền: R3–R5 thấy nút nhưng máy chủ chỉ cho R1; báo cáo Lệch kế hoạch 10, kế hoạch §8. Không sửa quyền toàn cục để né 403. |
| F05-TC_049 |  |  | Bổ sung | Kiểm tra R6 không tạo nhóm | R6 | 1. Mở /equivalence-groups | — | Xem danh sách được; không có nút Tạo nhóm | No | | | |  |
| F05-TC_050 | Quan hệ học phần (MH-17) | Trạng thái | Bổ sung | Kiểm tra chặn quan hệ với học phần đã hủy | R1; A riêng đã hủy, B riêng | 1. POST quan hệ A/B | A đã hủy | HTTP 409; “Không khai báo quan hệ với học phần đã hủy.” | No | | | |  |
| F05-TC_051 | Nhóm tương đương (MH-19) | Trạng thái | Bổ sung | Kiểm tra chặn thành viên đã hủy | R1; A riêng đã hủy; nhóm riêng | 1. POST thêm A vào nhóm riêng | A đã hủy | HTTP 409; “Không đưa học phần đã hủy vào nhóm tương đương.” | No | | | |  |
| F05-TC_052 | Quan hệ học phần (MH-17) | Ngưỡng | Bổ sung | Kiểm tra chặn ngưỡng ở quan hệ không tiên quyết | R1; A/B riêng | 1. POST PRIOR với minScore | 2.5 | HTTP 400; “Chỉ quan hệ tiên quyết mới có ngưỡng điểm.” | No | | | |  |
| F05-TC_053 | Quan hệ học phần (MH-17) | Thay thế | Bổ sung | Kiểm tra không xóa thay thế duy nhất khi ngừng mở lớp | R1; A riêng Ngừng mở lớp và chỉ B riêng thay thế | 1. Xóa quan hệ thay thế; 2. Xác nhận | A/B riêng | Hiện “Đây là học phần thay thế duy nhất của một học phần đang Ngừng mở lớp; hãy thêm học phần thay thế khác hoặc mở lại học phần đó trước.” | No | | | |  |

## Ghi chú

- Chỉ dùng học phần/nhóm tự tạo cho quan hệ, ngưỡng, tương đương, gộp, hủy, giải thể. PRG101 chỉ xem. Tất cả test độc lập thứ tự và không dọn seed.
- Lệch kế hoạch 10: nút quản lý tương đương hiện với R3–R5 vì me thiếu mode/scope; expected giữ 403 từ máy chủ, không coi nút hiện là quyền được cấp.
- KB-007/EC-16/18 chỉ kiểm khai báo cấp danh mục, không suy ra đã kiểm công nhận tín chỉ/xét tốt nghiệp. EC-17 và KB-073/076/091 thuộc các luồng sau, không phải coverage toàn KB ở đây. KB-008/NT-B1-05 của US-014 giữ ở F-04; ca bảo vệ quan hệ thay thế ở đây chỉ kiểm phần giao điểm xóa quan hệ.
- Select nhiều không tự đóng sau chọn; helper `fixtures/multiselect.ts` chọn mục hiển thị rồi Escape, không dùng ARIA option ẩn.
- Yêu cầu ghi HTTP trực tiếp dùng phiên người đang kiểm và header `X-Requested-With: XMLHttpRequest`; kiểm mã lỗi cụ thể, không nhận nhầm 403 do CSRF là từ chối quyền.
