# F-11 PLO, CLO, ma trận — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-042 (4 AC), US-043 (4 AC), US-044 (4 AC), US-045 (3 AC), US-046 (3 AC), US-047 (5 AC), US-048 (3 AC); tổng 26 AC; giao điểm US-039 AC2, US-040 AC1 |
| Màn hình | MH-31 PLO; MH-32 ma trận CLO–PLO toàn chương trình; MH-33 CLO–PLO một học phần; MH-34 học phần–PLO; MH-35 Kiểm tra phủ; MH-36/37 CLO/tuần trong đề cương |
| Vai trò/tài khoản | R1, R2, R3/R3b, R4 KHMT/R4b CNPM, R5 KHMT/R5b CNPM, R6 PDT theo `source/e2e/fixtures/accounts.ts`. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | Không sửa chương trình 1024034, DEMO*, PLO/CLO/ma trận/đề cương seed; không đổi vai, nhóm, enrollment hoặc phạm vi demo. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex ngẫu nhiên; EP<suffix>/EC<suffix> là chương trình nguồn/bản sao riêng, E2E<suffix> là học phần riêng. PLO1/CLO1 nằm trong chính bản ghi riêng mỗi ca, không phải bản ghi seed. Scope test dùng KHMT/CNPM sẵn có, không đổi thành viên. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-042..048; `docs/planning/test-plan.md` §6 KB-031..035, §7 NT-B3-03/04/05, §8 NFR-01/09/16/18/20/24, §9 EC-41; `docs/requirement/REQUIREMENTS.md` FR-38..42, FR-25 đợt 2, BR-17..21, DEC-02/03. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-31..37; `docs/design/data-dictionary.md` §9; `docs/implementation/f-11-plo-clo-matrices-implementation-plan.md` §1/7; `docs/implement-report/f-11-plo-clo-matrices-implement-report.md` Lệch 4/7/10, USER ACTIONS, Hooks cho tính năng sau. |
| Nguồn mã | `source/frontend/src/features/outcomes/`, `features/syllabi/components/Clo*`, `WeeklyContentModal.tsx`; `source/backend/src/features/outcomes/`, `features/syllabi/clos.service.ts`, `shared/outcomes/`, `shared/curriculum/item-target.ts`, `shared/programs/version-content.copier.ts`; `source/backend/prisma/seed-data/permission-catalog.ts`, `demo/accounts.ts`, `demo/outcomes.ts`. |
| Playwright spec | `source/e2e/specs/f-11-plo-clo-matrices.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 49 ca tự động đã chạy bằng Playwright: 49 Passed (47 ngày 10/21/26; F11-TC_026, F11-TC_063 Passed ngày 10/22/26 sau khi sửa lỗi ứng dụng, cả suite chạy lại ngày 10/22/26); 32 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính Vai trò/Bao phủ. KB dùng chung chỉ bao phủ phần giao điểm nêu trong ca.
| AC | TC |
|---|---|
| US-042 AC1 | F11-TC_001; F11-TC_061; F11-TC_067 |
| NT-B3-03 | F11-TC_001; F11-TC_010; F11-TC_011 |
| US-042 AC2 | F11-TC_002 |
| KB-031 | F11-TC_002; F11-TC_003 |
| US-042 AC3 | F11-TC_003 |
| BR-17 | F11-TC_003 |
| US-042 AC4 | F11-TC_004 |
| NFR-20 | F11-TC_004; F11-TC_026 |
| US-043 AC1 | F11-TC_005; F11-TC_062; F11-TC_063; F11-TC_064; F11-TC_081 |
| BR-18 | F11-TC_005 |
| US-043 AC2 | F11-TC_006 |
| KB-032 | F11-TC_006; F11-TC_007 |
| US-043 AC3 | F11-TC_007 |
| NT-B3-02 | F11-TC_007 |
| US-043 AC4 | F11-TC_008; F11-TC_009 |
| US-044 AC1 | F11-TC_010; F11-TC_072; F11-TC_073 |
| KB-033 | F11-TC_010; F11-TC_011; F11-TC_012; F11-TC_013 |
| BR-19 | F11-TC_010 |
| US-044 AC2 | F11-TC_011 |
| DEC-03 | F11-TC_011 |
| US-044 AC3 | F11-TC_012; F11-TC_013 |
| BR-21 | F11-TC_012 |
| NFR-09 | F11-TC_013; F11-TC_065; F11-TC_066; F11-TC_067; F11-TC_068; F11-TC_069; F11-TC_070; F11-TC_071; F11-TC_072; F11-TC_073; F11-TC_074; F11-TC_075; F11-TC_076 |
| US-044 AC4 | F11-TC_014 |
| US-045 AC1 | F11-TC_015 |
| US-045 AC2 | F11-TC_016; F11-TC_017; F11-TC_040 |
| US-045 AC3 | F11-TC_018 |
| US-046 AC1 | F11-TC_019 |
| NT-B3-04 | F11-TC_019; F11-TC_020; F11-TC_026 |
| US-046 AC2 | F11-TC_020; F11-TC_021; F11-TC_022; F11-TC_023; F11-TC_024; F11-TC_025 |
| US-046 AC3 | F11-TC_026; F11-TC_027 |
| US-047 AC1 | F11-TC_028 |
| KB-034 | F11-TC_028; F11-TC_031 |
| BR-20 | F11-TC_028; F11-TC_031 |
| EC-41 | F11-TC_028 |
| NT-B3-05 | F11-TC_028; F11-TC_029 |
| US-047 AC2 | F11-TC_029 |
| US-047 AC3 | F11-TC_030 |
| US-047 AC4 | F11-TC_031 |
| US-047 AC5 | F11-TC_032; F11-TC_077 |
| US-048 AC1 | F11-TC_033 |
| KB-035 | F11-TC_033; F11-TC_034; F11-TC_035 |
| US-048 AC2 | F11-TC_034 |
| US-048 AC3 | F11-TC_035 |
| DEC-02 | F11-TC_035 |
| US-039 AC2 | F11-TC_063; F11-TC_081 |
| US-040 AC1 | F11-TC_064 |
| NFR-01 | F11-TC_078 |
| NFR-16 | F11-TC_079 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; có spec không đồng nghĩa đã thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F11-TC_001 | Chuẩn đầu ra (MH-31..35/37) | PLO | US-042 AC1; NT-B3-03 | Kiểm tra thêm PLO tối thiểu | R1; chương trình Nháp riêng | 1. Mở PLO; 2. Thêm PLO; 3. Nhập mã và mô tả Việt; 4. Lưu | PLO1, Mô tả PLO1 | Dòng PLO1 được lưu; tiếng Anh và nhóm năng lực để trống không bị chặn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_001 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_002 |  |  | US-042 AC2; KB-031 | Kiểm tra trùng mã không phân biệt hoa thường | R1; chương trình riêng đã có PLO1 | 1. Thêm plo1; 2. Lưu | plo1 | Hiện “Mã PLO đã có trong phiên bản này.”; không thêm dòng. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_002 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_003 |  |  | US-042 AC3; KB-031; BR-17 | Kiểm tra PLO cùng mã độc lập giữa hai chương trình | R1; hai chương trình riêng đều có PLO1 | 1. Sửa mô tả ở A; 2. Mở PLO của B | A: Mô tả đã sửa, B: Mô tả B | B giữ mô tả cũ; sửa A không đổi B. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_003 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_004 |  |  | US-042 AC4; NFR-20 | Kiểm tra xác nhận số ô và liên kết khi xóa PLO | R1; PLO1 riêng có một ô học phần–PLO và một liên kết CLO | 1. Bấm Xóa ở dòng PLO1; 2. Đọc xác nhận; 3. Xác nhận Xóa | 1 ô, 1 liên kết | Hiện “Xóa PLO này sẽ xóa 1 ô học phần–PLO và 1 liên kết CLO.”; xác nhận xong dòng PLO1 không còn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_004 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_005 | Chuẩn đầu ra (MH-31..35/37) | CLO | US-043 AC1; BR-18 | Kiểm tra thêm CLO có mức nhận thức | R1; đề cương Nháp riêng | 1. Mở tab CLO; 2. Thêm CLO; 3. Nhập mã, mô tả, mức nhận thức; 4. Lưu | CLO1, Mô tả CLO1, Áp dụng | Dòng CLO1 hiện đúng mô tả và “Áp dụng”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_005 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_006 |  |  | US-043 AC2; KB-032 | Kiểm tra trùng mã CLO trong đề cương | R1; đề cương riêng đã có CLO1 | 1. Thêm clo1; 2. Lưu | clo1 | Hiện “Mã CLO đã có trong đề cương này.”; không thêm dòng. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_006 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_007 |  |  | US-043 AC3; KB-032; NT-B3-02 | Kiểm tra hai chương trình thấy cùng CLO | R1; một học phần riêng nằm trong hai khung riêng, có CLO1 | 1. Mở ma trận một học phần ở A; 2. Mở ở B | CLO1, Mô tả CLO1 | Cả hai hiện cùng CLO1 và mô tả từ đề cương dùng chung. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_007 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_008 |  |  | US-043 AC4 | Kiểm tra xóa CLO nêu chương trình đang dùng | R1; CLO1 riêng đang gắn PLO ở chương trình EP<suffix> | 1. Mở tab CLO; 2. Bấm Xóa ở CLO1; 3. Đọc xác nhận; 4. Xóa | Một chương trình riêng | Hiện “CLO này đang gắn PLO ở chương trình EP<suffix>; xóa sẽ xóa các liên kết đó.”; dòng CLO1 không còn sau xác nhận. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_008 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_009 |  |  | US-043 AC4 | Kiểm tra phần đánh giá đang dùng CLO | R1; đề cương riêng; cần chức năng đánh giá–CLO của F-12 | 1. Đối chiếu nơi đang dùng khi xóa CLO | CLO dùng trong đánh giá | Hiện tại xác nhận xóa chỉ liệt kê chương trình có liên kết PLO; chưa có nơi dùng ở thành phần đánh giá. | No | | | | Lệch US-043 AC4: implement report F-11 “Hooks cho tính năng sau”, dòng 50, giao F-12 thêm số lần dùng ở đánh giá vào CLO_INCLUDE và cloDeleteConfirm. Thủ công, không giả dữ liệu đánh giá seed. |
| F11-TC_010 | Chuẩn đầu ra (MH-31..35/37) | Ma trận CLO–PLO | US-044 AC1; KB-033; BR-19; NT-B3-03 | Kiểm tra lưu liên kết sau khi học phần đã gắn PLO | R1; khung, đề cương, CLO1, PLO1 riêng; ô học phần–PLO1 có trọng số | 1. Mở ma trận một học phần; 2. Chọn CLO1–PLO1; 3. Lưu; 4. Tải lại | Trọng số 0,5 | Checkbox “CLO1 – PLO1” còn được chọn; hiện “Đã lưu.”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_010 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_011 |  |  | US-044 AC2; KB-033; DEC-03; NT-B3-03 | Kiểm tra ánh xạ khác nhau ở hai chương trình | R1; cùng học phần/CLO1 ở hai khung riêng; A có PLO1, B có PLO5 | 1. Gắn CLO1 với PLO1 của A; 2. Gắn CLO1 với PLO5 của B; 3. Mở lại A | Hai ô học phần–PLO đã có trọng số | A giữ liên kết với PLO1; B giữ liên kết riêng với PLO5. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_011 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_012 |  |  | US-044 AC3; KB-033; BR-21 | Kiểm tra khóa checkbox khi học phần chưa gắn PLO | R1; ma trận riêng có CLO1, PLO1 nhưng chưa có ô học phần–PLO | 1. Mở ma trận một học phần | CLO1–PLO1 | Checkbox bị vô hiệu; không có trường mức độ cho liên kết CLO–PLO. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_012 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_013 |  |  | US-044 AC3; KB-033; NFR-09 | Kiểm tra máy chủ chặn liên kết không có ô học phần–PLO | R1; dữ liệu riêng như ca 012 | 1. PUT /api/curriculum-items/:id/clo-plo-links kèm header AJAX | links=[CLO1,PLO1] | Trả 409 “Học phần chưa gắn PLO này trong ma trận học phần–PLO; gắn ở đó trước.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_013 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_014 |  |  | US-044 AC4 | Kiểm tra khai báo cho học phần khoa khác | R1; học phần khoa khác, đề cương và khung đều riêng | 1. Nhập trọng số; 2. Gắn CLO1–PLO1; 3. Lưu | Khoa Khoa học cơ bản | Liên kết lưu được; tải lại checkbox còn được chọn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_014 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_015 | Chuẩn đầu ra (MH-31..35/37) | Tra cứu | US-045 AC1 | Kiểm tra xem PLO và ma trận toàn chương trình | R1; chương trình riêng có PLO, CLO và liên kết | 1. Xem PLO; 2. Mở Ma trận CLO–PLO; 3. Mở panel học phần riêng | PLO1, CLO1 | Có dòng CLO1, cột PLO1 và dấu ✓ tại liên kết đã lưu. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_015 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_016 |  |  | US-045 AC2 | Kiểm tra lọc theo học kỳ | R1; chương trình riêng có hai học phần ở kỳ 1 và 2 | 1. Mở Ma trận CLO–PLO; 2. Lọc theo học kỳ = Học kỳ 1 | Hai học phần riêng | Chỉ panel học phần kỳ 1 còn hiện, kỳ 2 không còn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_016 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_017 |  |  | US-045 AC2 | Kiểm tra lọc cột PLO | R1; chương trình riêng có PLO1/PLO2, học phần góp PLO1 | 1. Lọc theo PLO = PLO1; 2. Mở panel học phần | PLO1 được gắn | Bảng của học phần còn cột PLO1, không có cột PLO2. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_017 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_018 |  |  | US-045 AC3 | Kiểm tra R2 xem ma trận không sửa | R2; R1 tạo chương trình, PLO và học phần riêng | 1. Mở ma trận học phần–PLO; 2. Xem ô riêng | Vai chỉ đọc | Ô không có nút nhập trọng số hay textbox chỉnh sửa. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_018 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_019 | Chuẩn đầu ra (MH-31..35/37) | Trọng số | US-046 AC1; NT-B3-04 | Kiểm tra nhập số thập phân bằng dấu phẩy | R1; chương trình, học phần và PLO riêng | 1. Bấm đúng ô; 2. Nhập 0,5; 3. Enter; 4. Tải lại | 0,5 | Ô hiển thị “0,5” sau tải lại. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_019 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_020 |  |  | US-046 AC2; NT-B3-04 | Kiểm tra chặn trọng số 1,5 | R1; ô riêng chưa gắn | 1. Nhập 1,5; 2. Enter | 1,5 | Hiện “Trọng số phải lớn hơn 0, không quá 1 và có tối đa hai chữ số thập phân.”; input giữ trạng thái lỗi. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_020 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_021 |  |  | US-046 AC2 | Kiểm tra chặn trọng số bằng không | R1; ô riêng | 1. Nhập 0; 2. Enter | 0 | Hiện “Trọng số phải lớn hơn 0, không quá 1 và có tối đa hai chữ số thập phân.” | No | | | | Thủ công; không coi 0 là xóa ô, muốn xóa phải để trống. |
| F11-TC_022 |  |  | US-046 AC2 | Kiểm tra chặn trọng số âm | R1; ô riêng | 1. Nhập -0,5; 2. Enter | -0,5 | Hiện thông báo trọng số lớn hơn 0, không quá 1, tối đa hai chữ số thập phân. | No | | | | Thủ công. |
| F11-TC_023 |  |  | US-046 AC2 | Kiểm tra chặn quá hai chữ số thập phân | R1; ô riêng | 1. Nhập 0,001; 2. Enter | 0,001 | Hiện thông báo trọng số hợp lệ; không lưu thành 0 hay làm tròn tự động. | No | | | | Thủ công; biên WEIGHT_PATTERN. |
| F11-TC_024 |  |  | US-046 AC2 | Kiểm tra nhận trọng số bằng một | R1; ô riêng | 1. Nhập 1; 2. Enter; 3. Tải lại | 1 | Ô hiển thị “1”, không có lỗi. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_024 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_025 |  |  | US-046 AC2 | Kiểm tra nhận trọng số nhỏ nhất hai chữ số lẻ | R1; ô riêng | 1. Nhập 0,01; 2. Enter | 0,01 | Ô hiển thị “0,01”. | No | | | | Thủ công. |
| F11-TC_026 | Chuẩn đầu ra (MH-31..35/37) | Xóa ô | US-046 AC3; NT-B3-04; NFR-20 | Kiểm tra xóa ô kéo theo liên kết CLO | R1; ô riêng có một liên kết CLO–PLO | 1. Mở sửa trọng số; 2. Xóa nội dung; 3. Enter; 4. Đọc xác nhận; 5. Xóa; 6. Mở ma trận CLO | Một liên kết | Hiện “Xóa ô này sẽ xóa 1 liên kết CLO–PLO của học phần với PLO này.”; sau xác nhận ô trống, checkbox liên kết bỏ chọn và bị khóa. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F11-TC_026 trong specs/f-11-plo-clo-matrices.spec.ts. Failed ngày 10/21/26: Enter mở xác nhận trong lúc keydown, xác nhận lấy focus cho nút Hủy và hành động mặc định của Enter bấm Hủy; đã sửa `WeightCell.tsx` (`preventDefault` trong `onPressEnter`) ngày 10/22/26 — `docs/troubleshooting/error_log.md`. |
| F11-TC_027 |  |  | US-046 AC3 | Kiểm tra hủy xác nhận không xóa ô | R1; ô riêng có một liên kết | 1. Để trống trọng số; 2. Enter; 3. Chọn Hủy | 0,5 | Trọng số và checkbox CLO–PLO vẫn giữ sau tải lại. | No | | | | Thủ công. |
| F11-TC_028 | Chuẩn đầu ra (MH-31..35/37) | Kiểm tra phủ | US-047 AC1; KB-034; BR-20; EC-41; NT-B3-05 | Kiểm tra PLO chưa có học phần đóng góp | R1; PLO1 riêng chưa có ô học phần–PLO | 1. Mở Kiểm tra phủ | PLO1 | PLO1 nằm trong mục “PLO chưa có học phần”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_028 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_029 |  |  | US-047 AC2; NT-B3-05 | Kiểm tra CLO chưa gắn PLO | R1; CLO1 riêng chưa có liên kết trong chương trình | 1. Mở Kiểm tra phủ | Học phần riêng, CLO1 | Dòng đúng học phần/CLO1 có trong mục “CLO chưa gắn PLO”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_029 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_030 |  |  | US-047 AC3 | Kiểm tra học phần chưa đóng góp PLO | R1; dòng khung riêng chưa có ô trọng số | 1. Mở Kiểm tra phủ | E2E<suffix> | Học phần có trong mục “Học phần chưa gắn PLO”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_030 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_031 |  |  | US-047 AC4; KB-034; BR-20 | Kiểm tra thiếu sót không chặn lưu | R1; chương trình riêng có PLO1 được dùng và PLO2 chưa dùng | 1. Lưu trọng số cho PLO1; 2. Mở Kiểm tra phủ | PLO2 vẫn thiếu | Trọng số lưu được; PLO2 vẫn trong mục thiếu; hiện “Chỉ để theo dõi: thiếu sót không chặn việc lưu.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_031 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_032 |  |  | US-047 AC5 | Kiểm tra R4 chỉ thấy học phần nhóm mình trong báo cáo | R4 KHMT; chương trình riêng có một học phần KHMT và một CNPM | 1. Mở Kiểm tra phủ | Hai học phần riêng chưa góp PLO | Hiện “Chỉ hiện học phần thuộc nhóm của bạn”; mục học phần thiếu chỉ có KHMT, không có CNPM. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_032 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_033 | Chuẩn đầu ra (MH-31..35/37) | Nhân bản | US-048 AC1; KB-035 | Kiểm tra bản sao mang PLO và hai ma trận | R1; chương trình nguồn riêng có ô và liên kết CLO | 1. Nhân bản bằng mã riêng; 2. Xem PLO, trọng số và ma trận CLO của bản sao | EC<suffix> | Bản sao có PLO1, trọng số “0,5” và CLO1–PLO1 được chọn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_033 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_034 |  |  | US-048 AC2; KB-035 | Kiểm tra sửa PLO bản sao không đổi nguồn | R1; nguồn và bản sao đều riêng | 1. Sửa mô tả PLO1 bản sao; 2. Mở nguồn | Mô tả bản sao | Nguồn giữ “Mô tả PLO1”, bản sao giữ mô tả mới. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_034 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_035 |  |  | US-048 AC3; KB-035; DEC-02 | Kiểm tra đề cương bản sao vẫn dùng chung | R1; chương trình nguồn riêng có đề cương | 1. Nhân bản; 2. Mở Đề cương từ khung bản sao | Cùng học phần riêng | URL và bộ CLO của đề cương giống nguồn, không có đề cương sao riêng. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_035 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_036 | Chuẩn đầu ra (MH-31..35/37) | Trạng thái rỗng | Bổ sung | Kiểm tra danh sách PLO trống | R1; chương trình riêng mới tạo | 1. Mở PLO | Chưa có PLO | Hiện “Phiên bản này chưa có PLO”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_036 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_037 |  |  | Bổ sung | Kiểm tra danh sách CLO trống | R1; đề cương riêng mới tạo | 1. Mở tab CLO | Chưa có CLO | Hiện “Chưa có CLO”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_037 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_038 |  |  | Bổ sung | Kiểm tra ma trận khi học phần chưa có đề cương | R1; khung riêng có học phần riêng chưa có đề cương | 1. Mở ma trận CLO của dòng | E2E<suffix> | Hiện “Học phần chưa có đề cương” và liên kết “Mở đề cương”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_038 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_039 |  |  | Bổ sung | Kiểm tra ma trận khi đề cương chưa có CLO | R1; học phần/khung/đề cương riêng chưa có CLO | 1. Mở ma trận CLO của dòng | CLO trống | Hiện “Đề cương chưa có CLO”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_039 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_040 | Chuẩn đầu ra (MH-31..35/37) | Bộ lọc | US-045 AC2 | Kiểm tra lọc PLO không có học phần khớp | R1; PLO2 riêng chưa được học phần nào gắn | 1. Mở ma trận toàn chương trình; 2. Lọc theo PLO2 | PLO2 | Không có panel học phần; không hiển thị lại tất cả dữ liệu khi kết quả rỗng. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_040 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_041 | Chuẩn đầu ra (MH-31..35/37) | Validation PLO | Bổ sung | Kiểm tra bắt buộc mã PLO | R1; modal Thêm PLO ở chương trình riêng | 1. Để trống mã; 2. Nhập mô tả; 3. Lưu | Mã rỗng | Hiện “Nhập mã PLO.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_041 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_042 |  |  | Bổ sung | Kiểm tra bắt buộc mô tả PLO | R1; modal Thêm PLO ở chương trình riêng | 1. Nhập mã; 2. Để trống mô tả; 3. Lưu | PLO1 | Hiện “Nhập mô tả PLO.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_042 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_043 | Chuẩn đầu ra (MH-31..35/37) | Validation CLO | Bổ sung | Kiểm tra bắt buộc mã CLO | R1; modal Thêm CLO ở đề cương riêng | 1. Để trống mã; 2. Nhập mô tả; 3. Lưu | Mã rỗng | Hiện “Nhập mã CLO.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_043 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_044 |  |  | Bổ sung | Kiểm tra bắt buộc mô tả CLO | R1; modal Thêm CLO ở đề cương riêng | 1. Nhập mã; 2. Để trống mô tả; 3. Lưu | CLO1 | Hiện “Nhập mô tả CLO.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_044 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_045 | Chuẩn đầu ra (MH-31..35/37) | Biên PLO | Bổ sung | Kiểm tra mã dài đúng 20 ký tự | R1; chương trình riêng | 1. Thêm PLO mã 20 ký tự; 2. Lưu | 20 chữ A | PLO được thêm. | No | | | | Thủ công; CODE_MAX=20. |
| F11-TC_046 |  |  | Bổ sung | Kiểm tra mã dài 21 ký tự | R1; chương trình riêng | 1. Thêm PLO mã 21 ký tự; 2. Lưu | 21 chữ A | Form chặn lưu, modal còn mở và trường mã có lỗi độ dài. | No | | | | Thủ công; rule max trên form chạy trước máy chủ. |
| F11-TC_047 |  |  | Bổ sung | Kiểm tra mô tả đúng 2000 ký tự | R1; chương trình riêng | 1. Nhập mô tả 2000 ký tự; 2. Lưu | 2000 chữ á | Lưu được, không cắt mô tả. | No | | | | Thủ công; cùng giới hạn cho mô tả tiếng Anh. |
| F11-TC_048 |  |  | Bổ sung | Kiểm tra mô tả 2001 ký tự | R1; chương trình riêng | 1. Nhập mô tả 2001 ký tự; 2. Lưu | 2001 chữ á | Form chặn lưu; modal còn mở. | No | | | | Thủ công; không trích thông báo lỗi default của backend thay lỗi form. |
| F11-TC_049 |  |  | Bổ sung | Kiểm tra PLO thứ 30 được nhận | R1; chương trình riêng có 29 PLO | 1. Thêm PLO thứ 30 | PLO30 | PLO30 hiện trong danh sách. | No | | | | Thủ công; chuẩn bị riêng, không thêm PLO vào 1024034. |
| F11-TC_050 |  |  | Bổ sung | Kiểm tra PLO thứ 31 bị chặn | R1; chương trình riêng có 30 PLO | 1. Thêm PLO thứ 31 | PLO31 | Hiện “Mỗi phiên bản có tối đa 30 PLO.” | No | | | | Thủ công; không dùng chương trình seed làm fixture giới hạn. |
| F11-TC_051 | Chuẩn đầu ra (MH-31..35/37) | Biên CLO | Bổ sung | Kiểm tra CLO thứ 30 được nhận | R1; đề cương riêng có 29 CLO | 1. Thêm CLO thứ 30 | CLO30 | CLO30 hiện trong danh sách. | No | | | | Thủ công. |
| F11-TC_052 |  |  | Bổ sung | Kiểm tra CLO thứ 31 bị chặn | R1; đề cương riêng có 30 CLO | 1. Thêm CLO thứ 31 | CLO31 | Hiện “Đề cương có tối đa 30 CLO.” | No | | | | Thủ công; không sửa bộ CLO seed. |
| F11-TC_053 |  |  | Bổ sung | Kiểm tra mã CLO đúng 20 ký tự | R1; đề cương riêng | 1. Nhập mã 20 ký tự và mô tả; 2. Lưu | 20 chữ C | CLO được thêm. | No | | | | Thủ công. |
| F11-TC_054 |  |  | Bổ sung | Kiểm tra mã CLO 21 ký tự | R1; đề cương riêng | 1. Nhập mã 21 ký tự và mô tả; 2. Lưu | 21 chữ C | Form chặn lưu, modal còn mở. | No | | | | Thủ công. |
| F11-TC_055 |  |  | Bổ sung | Kiểm tra mô tả CLO đúng 2000 ký tự | R1; đề cương riêng | 1. Nhập mô tả 2000 ký tự; 2. Lưu | 2000 chữ á | Lưu được và giữ nội dung. | No | | | | Thủ công; cùng giới hạn cho bản Anh. |
| F11-TC_056 |  |  | Bổ sung | Kiểm tra mô tả CLO 2001 ký tự | R1; đề cương riêng | 1. Nhập mô tả 2001 ký tự; 2. Lưu | 2001 chữ á | Form chặn lưu. | No | | | | Thủ công. |
| F11-TC_057 | Chuẩn đầu ra (MH-31..35/37) | Nhóm năng lực | Bổ sung | Kiểm tra nhóm năng lực đúng 100 ký tự | R1; chương trình riêng | 1. Nhập nhóm 100 ký tự; 2. Lưu PLO hợp lệ | 100 chữ A | Lưu được nhóm năng lực. | No | | | | Thủ công. |
| F11-TC_058 |  |  | Bổ sung | Kiểm tra nhóm năng lực 101 ký tự | R1; chương trình riêng | 1. Nhập nhóm 101 ký tự; 2. Lưu | 101 chữ A | Form chặn lưu; modal còn mở. | No | | | | Thủ công. |
| F11-TC_059 | Chuẩn đầu ra (MH-31..35/37) | Mức nhận thức | Bổ sung | Kiểm tra mức nhận thức đúng 50 ký tự | R1; đề cương riêng | 1. Nhập mức nhận thức 50 ký tự; 2. Lưu CLO hợp lệ | 50 chữ A | Lưu được văn bản tự do, không bắt buộc chọn gợi ý Bloom. | No | | | | Thủ công; AutoComplete là ô gợi ý, không phải enum bắt buộc. |
| F11-TC_060 |  |  | Bổ sung | Kiểm tra mức nhận thức 51 ký tự | R1; đề cương riêng | 1. Nhập mức nhận thức 51 ký tự; 2. Lưu | 51 chữ A | Form chặn lưu. | No | | | | Thủ công. |
| F11-TC_061 | Chuẩn đầu ra (MH-31..35/37) | Thứ tự | US-042 AC1 | Kiểm tra đổi thứ tự PLO | R1; chương trình riêng có PLO1, PLO2 | 1. Focus tay nắm PLO2; 2. Space, ArrowUp, Space; 3. Tải lại | PLO2 lên đầu | PLO2 đứng trước PLO1 sau tải lại. | No | | | | Thủ công; dùng bàn phím, không tọa độ chuột. |
| F11-TC_062 |  |  | US-043 AC1 | Kiểm tra đổi thứ tự CLO | R1; đề cương riêng có CLO1, CLO2 | 1. Dùng tay nắm bàn phím đưa CLO2 lên trước; 2. Tải lại | CLO2 lên đầu | CLO2 đứng trước CLO1. | No | | | | Thủ công. |
| F11-TC_063 | Chuẩn đầu ra (MH-31..35/37) | Tuần–CLO | US-039 AC2; US-043 AC1 | Kiểm tra tìm CLO theo mã trong đa chọn | R1; đề cương riêng có CLO1 | 1. Thêm tuần; 2. Mở CLO đạt được; 3. Gõ CLO1 | CLO1 | Dropdown hiển thị lựa chọn “CLO1” khớp mã vừa gõ, không hiện “Trống”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F11-TC_063 trong specs/f-11-plo-clo-matrices.spec.ts. Failed ngày 10/21/26: ô chọn CLO lọc theo cuid; đã thêm `optionFilterProp="label"` ở `WeeklyContentModal.tsx` ngày 10/22/26 — `docs/troubleshooting/error_log.md`. Đường lưu không gõ được tách sang 081. |
| F11-TC_064 | Chuẩn đầu ra (MH-31..35/37) | Song ngữ | US-040 AC1; US-043 AC1 | Kiểm tra CLO hai ngôn ngữ | R1; CLO1 riêng | 1. Sửa mô tả Anh thành Analyse; 2. Lưu; 3. Về trang đọc; 4. Chuyển English | Mô tả Việt / Analyse | Phần CLO hiện Analyse khi chọn English và bản Việt khi chuyển lại. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_064 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_065 | Chuẩn đầu ra (MH-31..35/37) | Phân quyền | NFR-09 | Kiểm tra R2 không ghi trọng số | R2; R1 tạo khung/PLO riêng | 1. PUT trọng số kèm header AJAX | 0.5 vào ô riêng | Trả 403 “Bạn không có quyền thực hiện thao tác này.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_065 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_066 |  |  | NFR-09 | Kiểm tra R3 không là giám đốc không sửa PLO | R3b không được phân công trên chương trình riêng | 1. POST PLO hợp lệ kèm header AJAX | PLO2 ở chương trình riêng | Trả 403 “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_066 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_067 |  |  | US-042 AC1; NFR-09 | Kiểm tra R3 được phân công sửa PLO | R1 phân công R3 làm giám đốc chương trình riêng | 1. R3 mở PLO; 2. Thêm PLO | PLO riêng | PLO lưu được trên chương trình được phân công. | No | | | | Thủ công; chỉ phân công trên throwaway, không đổi chương trình demo và không kiểm danh sách đầy đủ R3 thấy. |
| F11-TC_068 |  |  | NFR-09 | Kiểm tra R4 ngoài nhóm không ghi CLO–PLO | R4b CNPM; học phần KHMT trên khung riêng | 1. PUT clo-plo-links hợp lệ kèm header AJAX | links rỗng | Trả 403 “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_068 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_069 |  |  | NFR-09 | Kiểm tra R5 ngoài nhóm không ghi CLO–PLO | R5b CNPM; học phần KHMT riêng | 1. PUT clo-plo-links kèm header AJAX | links rỗng | Trả 403 “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_069 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_070 |  |  | NFR-09 | Kiểm tra R6 không đọc ma trận | R6 PDT; chương trình riêng | 1. Mở ma trận học phần–PLO; 2. Gọi GET ma trận | URL của R1 | Hiện “Bạn không có quyền xem ma trận này”; yêu cầu đọc bị từ chối 403. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_070 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_071 |  |  | NFR-09 | Kiểm tra R6 chỉ đọc PLO chương trình thuộc phạm vi | R6 có chương trình áp dụng cho mình do người vận hành chuẩn bị | 1. Mở PLO của chương trình thuộc phạm vi | Không đổi enrollment/phạm vi R6 trong suite | Xem được PLO, không có Thêm/Sửa/Xóa; không xem được ma trận. | No | | | | Thủ công vì không đổi phạm vi/enrollment của tài khoản demo để tạo điều kiện dương tính. |
| F11-TC_072 |  |  | US-044 AC1; NFR-09 | Kiểm tra R4 cùng nhóm ghi liên kết | R4 KHMT; R1 tạo ô trọng số cho học phần KHMT riêng | 1. Mở ma trận CLO; 2. Chọn liên kết; 3. Lưu | CLO1–PLO1 | Hiện “Đã lưu.”; tải lại liên kết vẫn được chọn. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_072 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_073 |  |  | US-044 AC1; NFR-09 | Kiểm tra R5 cùng nhóm ghi liên kết | R5 KHMT; R1 tạo ô trọng số cho học phần KHMT riêng | 1. Chọn liên kết; 2. Lưu và tải lại | CLO1–PLO1 | Liên kết được lưu; không có quyền tự sửa trọng số học phần–PLO. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_073 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_074 |  |  | NFR-09 | Kiểm tra R6 không đọc PLO chương trình ngoài phạm vi | R6 PDT; chương trình riêng | 1. Mở PLO bằng URL của R1 | Chương trình Nháp riêng | Hiện “Bạn không có quyền xem PLO này”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_074 trong specs/f-11-plo-clo-matrices.spec.ts. |
| F11-TC_075 |  |  | NFR-09 | Kiểm tra R4 không sửa danh sách PLO | R4; chương trình riêng | 1. POST PLO kèm header AJAX | PLO2 | Trả 403 “Bạn không có quyền thực hiện thao tác này.” | No | | | | Thủ công; quyền CLO khác quyền PLO. |
| F11-TC_076 |  |  | NFR-09 | Kiểm tra R5 không sửa trọng số | R5; học phần KHMT cùng nhóm trên khung riêng | 1. PUT trọng số kèm header AJAX | 0.5 | Trả 403 “Bạn không có quyền thực hiện thao tác này.” | No | | | | Thủ công; cùng nhóm chỉ cho CLO–PLO, không cho học phần–PLO. |
| F11-TC_077 | Chuẩn đầu ra (MH-31..35/37) | Phạm vi báo cáo | US-047 AC5 | Kiểm tra R5 xem báo cáo theo nhóm | R5 KHMT; khung riêng có học phần KHMT và CNPM | 1. Mở Kiểm tra phủ | Hai học phần riêng | Hiện ghi chú lọc nhóm; các bảng thiếu theo học phần không có CNPM; danh sách PLO thiếu vẫn toàn chương trình. | No | | | | Thủ công; implement report USER ACTIONS ghi R5 vào được báo cáo phủ có lọc nhóm (lệch BE-07). |
| F11-TC_078 | Chuẩn đầu ra (MH-31..35/37) | Hiệu năng | NFR-01 | Kiểm tra ma trận 200 học phần và 30 PLO | R1; chương trình benchmark riêng | 1. Mở ma trận; 2. Đo thao tác tra cứu 10 lần | 200 × 30 ô | Ít nhất 9/10 lần tra cứu dưới 2 giây theo test-plan §8; ghi cấu hình máy và kết quả thật. | No | | | | Thủ công; implement report Lệch 4/USER ACTIONS chưa đo, không suy ra từ typecheck. |
| F11-TC_079 | Chuẩn đầu ra (MH-31..35/37) | Ngôn ngữ | NFR-16 | Kiểm tra nhãn ma trận có dấu | R1; chương trình riêng tên có dấu | 1. Đi qua PLO, hai ma trận và Kiểm tra phủ | Mô tả và tên học phần tiếng Việt | Các nhãn tiếng Việt và dấu phẩy thập phân đúng; tên riêng không lỗi mã hóa. | No | | | | Thủ công; ký hiệu PLO/CLO giữ nguyên. |
| F11-TC_080 | Chuẩn đầu ra (MH-31..35/37) | Phiên bản | Bổ sung | Kiểm tra không sửa thẳng chuẩn đầu ra đã ban hành | R1/R3; chương trình riêng đã ban hành | 1. Mở PLO hoặc trọng số; 2. Thử ghi thẳng | Phiên bản không Nháp | Không có chỉnh trực tiếp; máy chủ báo “Chỉ sửa được chuẩn đầu ra của phiên bản nháp.” | No | | | | Thủ công; không ban hành/sửa chương trình seed để dựng fixture. |
| F11-TC_081 | Chuẩn đầu ra (MH-31..35/37) | Tuần–CLO | US-039 AC2; US-043 AC1 | Kiểm tra lưu CLO vào tuần không nhập tìm kiếm | R1; đề cương riêng có CLO1 do chính ca tạo | 1. Thêm tuần 1 và nội dung; 2. Mở CLO đạt được, không gõ tìm kiếm; 3. Bấm lựa chọn CLO1 trong dropdown đang hiện; 4. Lưu; 5. Tải lại, mở Nội dung theo tuần | Tuần 1; CLO1 | Dòng tuần 1 hiện “CLO1” trong cột “CLO” sau tải lại. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F11-TC_081 trong specs/f-11-plo-clo-matrices.spec.ts. Chỉ kiểm đường chọn/lưu không tìm kiếm; không thay thế kiểm lỗi tìm theo mã ở 063. |

## Ghi chú

- 81 ca: 49 có test (026/063 từng là test.fixme, bỏ sau khi sửa lỗi ứng dụng ngày 2026-10-22), 32 thủ công.
- US-043 AC4 phần nơi dùng ở đánh giá còn giao F-12 theo implement report Hooks; ca 009 ghi đúng giới hạn, không tạo fixme cho phần đã được báo cáo hoãn. Các liên kết PLO hiện tại được kiểm ở 008.
- US-047 AC1/AC3 giữ đúng ý nghĩa nhưng nhãn UI là PLO chưa có học phần / Học phần chưa gắn PLO, không dùng nguyên câu AC làm locator. R4/R5 chỉ lọc bảng theo học phần; PLO thiếu vẫn là thông tin toàn chương trình.
- Trọng số nhập bằng dấu phẩy; UI hiển thị 0,5, wire dùng dấu chấm. Liên kết CLO–PLO không có mức; không coi trọng số học phần là mức của CLO.
- Ma trận dùng một input Trọng số khi bấm ô. Helper tìm hàng bằng mã riêng và cột bằng tiêu đề PLO, suy ra cellIndex rồi chọn ô tương ứng; không chọn đại bản ghi bằng first/nth. CLO checkbox có aria-label gồm mã CLO, dấu – và mã PLO.
- Bộ lọc ma trận có nhãn truy cập và dùng chooseOption. Select CLO đạt được bị lỗi tìm theo mã ở 063; ca 081 dùng chooseMultipleOption với skipSearch để chọn nhãn CLO1 trong dropdown hiện. Không xem title mô tả là cách sửa lỗi lọc, không dùng ARIA option ẩn.
- Nhân bản chỉ từ chương trình riêng; đề cương/CLO vẫn dùng chung. Những ca giới hạn, R6 trong phạm vi và phiên bản đã ban hành giữ thủ công để không đổi phạm vi hoặc dữ liệu seed.
- NFR-18 được kiểm ở phạm vi hai bộ lọc và kết quả rỗng (016/017/040), không khẳng định đã có tìm kiếm/phân trang: implement report USER ACTIONS ghi bảng chưa có thanh tìm học phần. Xuất Excel thuộc F-25, không thêm test F-25.
