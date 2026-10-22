# F-13 Đề xuất thay đổi — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-053 (4 AC), US-054 (6 AC), US-055 (4 AC), US-056 (4 AC), US-057 (7 AC), US-058 (3 AC), US-059 (4 AC), US-060 (4 AC); tổng 36 AC |
| Màn hình | MH-38 danh sách; MH-39 tạo/soạn; MH-40 tổ chức; MH-41 chi tiết |
| Vai trò/tài khoản | R1, R2, R3/R3b, R4/R4b, R5/R5b, R6 theo source/e2e/fixtures/accounts.ts. |
| Môi trường | Frontend http://localhost:5173, proxy /api tới http://localhost:3000; seed nền rồi demo. |
| Dữ liệu demo | Chỉ đọc; không sửa 1024034, DEMO*, tổ chức, phân công, quyền hoặc phiên tài khoản demo. |
| Dữ liệu tự tạo | <suffix> là 16 ký tự hex uniqueSuffix(); chương trình EP<suffix>, học phần E2E<suffix>, đề xuất và hồ sơ riêng mỗi test. Giao R3 làm Giám đốc chỉ trên chương trình riêng. |
| Nguồn nghiệp vụ | user-stories.md US-053..060; test-plan.md §6 KB-039..046/048, §7 NT-B4-01/02/03/09, §8 NFR-01/09/16/20; REQUIREMENTS.md FR-55..57/60/68/108/109, BR-23/27/29/30, EC-21..24/27/38/40. |
| Nguồn thiết kế/triển khai | docs/design/state-diagrams.md, sequence-diagrams.md, screen-inventory.md, data-dictionary.md §9; F-13 implementation plan §7/8 và implement report; F-14 report về dọn bản sao. |
| Nguồn mã | source/frontend/src/features/change-requests/; source/backend/src/features/change-requests/; permission-catalog.ts; seed-data/demo/, seed-data/semesters.ts. |
| Playwright spec | source/e2e/specs/f-13-change-requests.spec.ts; fixture chung fixtures/change-requests.ts; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 28 ca tự động đã chạy bằng Playwright ngày 10/22/26, tất cả Passed; 32 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính Vai trò/Bao phủ.
| AC | TC |
|---|---|
| US-053 AC1 | F13-TC_001 |
| KB-039 | F13-TC_001; F13-TC_002; F13-TC_004 |
| NT-B4-01 | F13-TC_001 |
| BR-23 | F13-TC_001; F13-TC_002 |
| US-053 AC2 | F13-TC_002 |
| US-053 AC3 | F13-TC_003 |
| US-053 AC4 | F13-TC_004 |
| US-054 AC1 | F13-TC_005; F13-TC_037 |
| NT-B4-02 | F13-TC_005 |
| US-054 AC2 | F13-TC_006 |
| US-054 AC3 | F13-TC_007 |
| NFR-20 | F13-TC_007; F13-TC_029 |
| US-054 AC4 | F13-TC_008 |
| KB-048 | F13-TC_008; F13-TC_024 |
| US-054 AC5 | F13-TC_009 |
| NFR-09 | F13-TC_009; F13-TC_010; F13-TC_035; F13-TC_036; F13-TC_049; F13-TC_050; F13-TC_051; F13-TC_060 |
| US-054 AC6 | F13-TC_010 |
| US-055 AC1 | F13-TC_011 |
| US-055 AC2 | F13-TC_012 |
| US-055 AC3 | F13-TC_013 |
| BR-27 | F13-TC_013; F13-TC_031; F13-TC_048 |
| US-055 AC4 | F13-TC_014 |
| US-056 AC1 | F13-TC_015 |
| US-056 AC2 | F13-TC_016 |
| US-056 AC3 | F13-TC_017 |
| US-056 AC4 | F13-TC_018 |
| US-057 AC1 | F13-TC_019 |
| KB-040 | F13-TC_019 |
| EC-21 | F13-TC_019 |
| US-057 AC2 | F13-TC_020 |
| KB-041 | F13-TC_020 |
| EC-22 | F13-TC_020 |
| US-057 AC3 | F13-TC_021 |
| KB-042 | F13-TC_021 |
| EC-23 | F13-TC_021 |
| US-057 AC4 | F13-TC_022 |
| KB-043 | F13-TC_022 |
| EC-24 | F13-TC_022 |
| US-057 AC5 | F13-TC_023 |
| KB-044 | F13-TC_023 |
| EC-40 | F13-TC_023 |
| US-057 AC6 | F13-TC_024 |
| BR-29 | F13-TC_024 |
| US-057 AC7 | F13-TC_025 |
| KB-045 | F13-TC_025 |
| EC-38 | F13-TC_025 |
| US-058 AC1 | F13-TC_026 |
| KB-046 | F13-TC_026; F13-TC_027 |
| NT-B4-03 | F13-TC_026 |
| BR-30 | F13-TC_026 |
| US-058 AC2 | F13-TC_027 |
| EC-27 | F13-TC_027 |
| US-058 AC3 | F13-TC_028 |
| US-059 AC1 | F13-TC_029 |
| NT-B4-09 | F13-TC_029 |
| US-059 AC2 | F13-TC_030 |
| US-059 AC3 | F13-TC_031 |
| US-059 AC4 | F13-TC_032 |
| US-060 AC1 | F13-TC_033 |
| US-060 AC2 | F13-TC_034 |
| US-060 AC3 | F13-TC_035 |
| US-060 AC4 | F13-TC_036 |
| NFR-01 | F13-TC_059 |
| NFR-16 | F13-TC_059 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; chỉ người thực thi cập nhật trạng thái và kết quả.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F13-TC_001 | Đề xuất thay đổi (MH-38..41) | Khóa sửa | US-053 AC1; KB-039; NT-B4-01; BR-23 | Kiểm tra lối tạo đề xuất thay sửa trực tiếp khung đã ban hành | R1; chương trình riêng Đang hiệu lực | 1. Mở khung; 2. Bấm Tạo đề xuất | EP<suffix> | Mở “Tạo đề xuất thay đổi”, chọn sẵn “Khung chương trình” và chương trình riêng. | No |  |  |  | Thủ công: kiểm thêm lối PLO/thông tin, giới hạn ngân sách. |
| F13-TC_002 |  |  | US-053 AC2; KB-039; BR-23 | Kiểm tra R1 không ghi thẳng đề cương đã ban hành | R1; đề cương riêng đã ban hành | 1. Thử lưu thay đổi trực tiếp đề cương đã ban hành | Mô tả mới | Máy chủ từ chối “Dữ liệu này chỉ thay đổi được qua đề xuất thay đổi.”; đề cương cũ không đổi. | No |  |  |  | Thủ công: gọi thẳng thao tác ghi; automation ưu tiên UI. |
| F13-TC_003 |  |  | US-053 AC3 | Kiểm tra sửa trực tiếp chương trình chưa ban hành | R1; chương trình Nháp riêng | 1. Mở chương trình; 2. Sửa tên; 3. Lưu | Tên riêng mới | Tên mới được lưu, không cần đề xuất. | No |  |  |  | Thủ công: đường sửa trực tiếp đã có suite F-06. |
| F13-TC_004 |  |  | US-053 AC4; KB-039 | Kiểm tra thông tin học phần đã dùng phải qua đề xuất | R1; học phần riêng trong khung đã ban hành | 1. Mở học phần; 2. Thử sửa tín chỉ, quan hệ | 2.5 TC | Có lối “Tạo đề xuất”; dữ liệu đã ban hành không bị sửa trực tiếp. | No |  |  |  | Thủ công: kiểm đường học phần và quan hệ, ngân sách. |
| F13-TC_005 | Đề xuất thay đổi (MH-38..41) | Soạn Nháp | US-054 AC1; NT-B4-02 | Kiểm tra tạo Nháp có mã riêng | R1; chương trình riêng đã ban hành | 1. Tạo đề xuất thông tin; 2. Nhập tiêu đề, lý do; 3. Tạo đề xuất | Đề xuất <suffix> | Tiêu đề mang mã riêng; trạng thái “Nháp”; có “Soạn thay đổi”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_005 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_006 |  |  | US-054 AC2 | Kiểm tra bản sao tách dữ liệu đang áp dụng | R1; đề xuất thông tin riêng Nháp | 1. Sửa thông tin chương trình trong bản sao; 2. Lưu; 3. Mở chương trình gốc | Điều chỉnh EP<suffix> | Đề xuất hiện thay đổi; chương trình gốc giữ nguyên tên. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_006 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_007 |  |  | US-054 AC3; NFR-20 | Kiểm tra xóa Nháp chưa gửi có xác nhận | R1; đề xuất riêng chưa gửi | 1. Bấm Xóa; 2. Đọc xác nhận; 3. Xác nhận Xóa; 4. Mở lại URL | Đề xuất <suffix> | Có “Xóa đề xuất Nháp này? Bản nháp dữ liệu và hồ sơ đính kèm cũng bị xóa.”; sau xóa hiện “Không tìm thấy đề xuất”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_007 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_008 |  |  | US-054 AC4; KB-048 | Kiểm tra Nháp trả lại không được xóa | R5; đề xuất riêng đã bị trả lại | 1. Mở trang soạn; 2. Xem hành động | Lần gửi 1 | Không có nút “Xóa”; còn “Gửi duyệt”, “Rút đề xuất”. | No |  |  |  | Thủ công: fixture qua cấp duyệt, ngân sách. |
| F13-TC_009 |  |  | US-054 AC5; NFR-09 | Kiểm tra R5 ngoài nhóm bị từ chối | R5b CNPM; học phần riêng thuộc KHMT | 1. Mở form có sẵn đối tượng; 2. Tạo đề xuất | Học phần E2E<suffix> | Hiện “Đối tượng này nằm ngoài phạm vi được phân công của bạn.”; không tạo đề xuất. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_009 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_010 |  |  | US-054 AC6; NFR-09 | Kiểm tra không sửa Nháp của người khác | R3; Nháp riêng do R1 tạo | 1. Mở URL sửa Nháp của R1 | ID Nháp riêng | Hiện “Không tìm thấy đề xuất”; không có form sửa. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_010 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_011 | Đề xuất thay đổi (MH-38..41) | Nguồn phát sinh | US-055 AC1 | Kiểm tra nguồn Trường bắt buộc văn bản | R1; form đề xuất riêng | 1. Chọn Theo yêu cầu của Trường; 2. Để trống căn cứ; 3. Tạo đề xuất | Căn cứ trống | Lỗi inline “Nhập số văn bản căn cứ của Trường.”; không rời form. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_011 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_012 |  |  | US-055 AC2 | Kiểm tra nguồn Khoa không cần văn bản | R1; chương trình riêng đã ban hành | 1. Chọn Khoa đề xuất; 2. Để trống căn cứ; 3. Tạo đề xuất | Căn cứ trống | Lưu “Nháp”; nguồn “Khoa đề xuất”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_012 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_013 |  |  | US-055 AC3; BR-27 | Kiểm tra nguồn Trường không tự nâng quyền duyệt | R3 là Giám đốc chương trình riêng | 1. Tạo đề xuất nguồn Trường có căn cứ; 2. Sửa bản sao; 3. Xem trước gửi | 123/QĐ-ĐHBK | Nguồn Trường không đổi tuyến; dòng cấp của chính người tạo được bỏ qua, cấp 3 vẫn cần người khác. | No |  |  |  | Lệch US-055 AC3 “đủ ba cấp”: bỏ qua tự duyệt theo docs/implementation/f-13-change-requests-implementation-plan.md:2137 và F-14 plan mục định tuyến; không phải bug. Thủ công: ngân sách. |
| F13-TC_014 |  |  | US-055 AC4 | Kiểm tra lọc nguồn giữ đúng đề xuất riêng | R1; đề xuất riêng nguồn Khoa | 1. Mở danh sách; 2. Lọc Nguồn Khoa đề xuất | Tiêu đề riêng | Hàng đề xuất riêng hiện “Khoa đề xuất”; không đổi nguồn của đề xuất. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_014 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_015 | Đề xuất thay đổi (MH-38..41) | Hồ sơ | US-056 AC1 | Kiểm tra tải hồ sơ căn cứ lên Nháp | R1; Nháp riêng | 1. Tải hồ sơ lên; 2. Chọn Công văn; 3. Chọn PNG; 4. Tải lên | can-cu-<suffix>.png | Hàng hồ sơ có tên tệp, “Công văn”, người tải và thời điểm. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_015 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_016 |  |  | US-056 AC2 | Kiểm tra người duyệt tải hồ sơ đã gửi | R4; đề xuất KHMT riêng chờ cấp 1 có hồ sơ | 1. Mở đề xuất; 2. Bấm tên tệp | can-cu-<suffix>.png | Tải được tệp có đúng tên của đề xuất riêng. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_016 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_017 |  |  | US-056 AC3 | Kiểm tra hồ sơ đã gửi không có nút xóa | R5; đề xuất riêng đã gửi, có hồ sơ | 1. Mở đề xuất; 2. Xem hàng hồ sơ | can-cu-<suffix>.png | Hàng ghi “Đã gửi kèm lần 1”; không có “Xóa”; vẫn có “Tải hồ sơ lên”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_017 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_018 |  |  | US-056 AC4 | Kiểm tra hồ sơ chỉ lưu bản quét | R1; hồ sơ riêng đã tải | 1. Xem thao tác hồ sơ | PNG/PDF | Chỉ tải lên/tải xuống/xóa theo quyền; không có thao tác ký số. | No |  |  |  | Thủ công: rà giao diện, không suy ra từ việc không tìm một nhãn giả định. |
| F13-TC_019 | Đề xuất thay đổi (MH-38..41) | Gửi duyệt | US-057 AC1; KB-040; EC-21 | Kiểm tra tuyến theo nhóm phụ trách học phần | Giảng viên thử riêng thuộc hai nhóm thử; học phần do nhóm thứ nhất phụ trách | 1. Gửi đề xuất; 2. Đọc tuyến và hàng đợi | Hai nhóm riêng | Chỉ Điều phối nhóm phụ trách nhận bước duyệt. | No |  |  |  | Thủ công: không đổi thành viên/nhóm seed; cần bộ tổ chức riêng. |
| F13-TC_020 |  |  | US-057 AC2; KB-041; EC-22 | Kiểm tra tiến độ từng Điều phối khi chạm hai nhóm | Đề xuất khung riêng chạm học phần thuộc hai nhóm | 1. Gửi; 2. Điều phối thứ nhất đồng ý; 3. Đọc tiến độ | Hai nhóm | Vẫn “Chờ Điều phối duyệt”; hiện tiến độ từng người cho tới khi đủ cả hai. | No |  |  |  | Thủ công: nhiều phiên/người duyệt, ngân sách. |
| F13-TC_021 |  |  | US-057 AC3; KB-042; EC-23 | Kiểm tra đủ ba Giám đốc trước khi qua cấp 2 | Học phần riêng trong ba chương trình riêng có ba Giám đốc | 1. Gửi; 2. Duyệt cấp 1; 3. Hai Giám đốc duyệt | Ba chương trình riêng | Vẫn “Chờ Giám đốc CTĐT duyệt”; Giám đốc thứ ba đồng ý mới sang “Chờ Phòng Đào tạo duyệt”. | No |  |  |  | Thủ công: cần người thứ ba riêng, không thay phân công seed. |
| F13-TC_022 |  |  | US-057 AC4; KB-043; EC-24 | Kiểm tra học phần khoa khác tới thẳng Phòng Đào tạo | Học phần riêng do khoa khác phụ trách; người đề xuất có quyền | 1. Gửi; 2. Xem tuyến | Học phần ngoài Khoa CNTT | Cấp 1/2 ghi không áp dụng; trạng thái “Chờ Phòng Đào tạo duyệt”. | No |  |  |  | Thủ công: dựng quyền riêng, không sửa quyền seed. |
| F13-TC_023 |  |  | US-057 AC5; KB-044; EC-40 | Kiểm tra giới hạn CLO chưa được đánh giá của MVP | Đề xuất nội dung riêng có CLO chưa gắn đánh giá | 1. Mở xem trước gửi | CLO3 | MVP chưa dựng thành phần đánh giá/công thức; không có chặn riêng theo CLO chưa được đánh giá. | No |  |  |  | Lệch US-057 AC5: hoãn F-12, docs/implementation/f-13-change-requests-implementation-plan.md:3013. Thủ công: giới hạn đã ghi nhận, không phải nghi lỗi. |
| F13-TC_024 |  |  | US-057 AC6; KB-048; BR-29 | Kiểm tra gửi lại tăng lần và đi lại từ cấp 1 | R5; đề xuất riêng được trả lại, đã sửa | 1. Bấm Gửi duyệt; 2. Xác nhận; 3. Xem tiến độ | Lần 1 → lần 2 | “Chờ Điều phối duyệt”, lần gửi 2; lượt trước vẫn tra cứu được. | No |  |  |  | Thủ công: F-14 kiểm vòng lặp tự động; ngân sách F-13. |
| F13-TC_025 |  |  | US-057 AC7; KB-045; EC-38 | Kiểm tra danh sách chương trình ảnh hưởng trước gửi | R5; đề cương riêng dùng ở nhiều chương trình riêng | 1. Sửa bản sao; 2. Bấm Gửi duyệt; 3. Chưa xác nhận | Hai mã EP<suffix> | Hộp “Gửi đề xuất đi duyệt” hiện “Chương trình bị ảnh hưởng” với từng chương trình; chưa gửi khi chưa bấm “Gửi”. | No |  |  |  | Thủ công: fixture chia sẻ nhiều chương trình, ngân sách; F-15 kiểm lan truyền. |
| F13-TC_026 | Đề xuất thay đổi (MH-38..41) | Xung đột | US-058 AC1; KB-046; NT-B4-03; BR-30 | Kiểm tra cảnh báo không chặn đề xuất song song | R1; đề cương riêng có đề xuất R5 chờ duyệt | 1. Tạo đề xuất thứ hai cùng đề cương; 2. Đọc cảnh báo; 3. Lưu | Hai tiêu đề riêng | Hiện “Đối tượng này đang có đề xuất khác chưa kết thúc”, mã/người tạo/trạng thái đề xuất kia; vẫn lưu Nháp mới. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_026 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_027 |  |  | US-058 AC2; KB-046; EC-27 | Kiểm tra đề xuất dựa bản cũ không được chấp thuận cuối | Hai đề xuất riêng cùng đề cương; một cái đã sinh bản mới | 1. Đưa đề xuất thứ hai tới chấp thuận cuối; 2. Xem lỗi | Bản gốc cũ | Hiện “Dữ liệu gốc đã thay đổi sau khi đề xuất được soạn; hãy làm lại bản nháp trên dữ liệu mới.”; không sinh phiên bản thứ hai từ bản cũ. | No |  |  |  | Thủ công: hai quy trình đầy đủ, ngân sách. |
| F13-TC_028 |  |  | US-058 AC3 | Kiểm tra hai đối tượng riêng không cảnh báo xung đột | R1; hai chương trình riêng | 1. Tạo Nháp cho chương trình A; 2. Mở tạo Nháp cho B | EP A/B riêng | Không có “Đối tượng này đang có đề xuất khác chưa kết thúc” ở form B. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_028 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_029 | Đề xuất thay đổi (MH-38..41) | Thu hồi | US-059 AC1; NT-B4-09; NFR-20 | Kiểm tra rút khi chưa người nào duyệt | R5; đề xuất riêng vừa gửi | 1. Bấm Rút đề xuất; 2. Xác nhận Rút | Đề xuất riêng | Trạng thái “Đã rút”; không còn trong hàng đợi của người duyệt. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_029 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_030 |  |  | US-059 AC2 | Kiểm tra không rút sau một đồng ý thực | R5; đề xuất riêng đã được R4 đồng ý | 1. Mở đề xuất; 2. Thử rút trực tiếp | Một lượt đồng ý | Không có nút “Rút đề xuất”; gọi thẳng bị từ chối “Không rút được: đã có người phê duyệt đề xuất ở lần gửi này, hoặc đề xuất đã kết thúc.” | No |  |  |  | Thủ công: nhánh máy chủ; ngân sách. |
| F13-TC_031 |  |  | US-059 AC3; BR-27 | Kiểm tra bước tự bỏ qua không ngăn rút | R3; đề xuất thông tin chương trình mình phụ trách riêng đã gửi | 1. Mở đề xuất; 2. Rút; 3. Xác nhận | Cấp 2 tự bỏ qua | Đề xuất sang “Đã rút” dù bước cấp của người tạo đã tự bỏ qua. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_031 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_032 |  |  | US-059 AC4 | Kiểm tra đã rút chỉ còn tra cứu | R5; đề xuất riêng đã rút | 1. Mở URL sửa; 2. Xem chi tiết | Đề xuất riêng | Chuyển về chi tiết “Đã rút”; không có “Tiếp tục soạn”/“Gửi duyệt” hoặc lối sửa bản sao. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_032 trong specs/f-13-change-requests.spec.ts. Hành vi dọn bản sao theo F-14 report:28,53; đang chờ xác nhận của người dùng. |
| F13-TC_033 | Đề xuất thay đổi (MH-38..41) | Tổ chức | US-060 AC1 | Kiểm tra đề xuất tổ chức đi thẳng cấp 3 | R4 trên nhóm thử riêng, không phải nhóm seed | 1. Đề xuất thêm thành viên; 2. Gửi; 3. Đọc tuyến | Tổ chức riêng | Chỉ có cấp Phòng Đào tạo, không tạo bước cấp 1/2. | No |  |  |  | Thủ công: không dùng tổ chức hoặc phân công demo làm đối tượng thay đổi. |
| F13-TC_034 |  |  | US-060 AC2 | Kiểm tra duyệt tổ chức áp dụng ngay và có nhật ký | R1; đề xuất tổ chức riêng chờ cấp 3 | 1. Đồng ý; 2. Mở tổ chức riêng; 3. Xem lịch sử | Thành viên riêng | Thành viên/phân công được áp dụng; có lịch sử; không sinh phiên bản chương trình. | No |  |  |  | Thủ công: không được thay đổi thành viên/phân công seed. |
| F13-TC_035 |  |  | US-060 AC3; NFR-09 | Kiểm tra R2 không có lựa chọn tạo dữ liệu đào tạo | R2 | 1. Mở danh sách; 2. Mở thẳng /change-requests/new | — | Không có “Tạo đề xuất”; mở thẳng hiện “Bạn không có quyền truy cập trang này”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_035 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_036 |  |  | US-060 AC4; NFR-09 | Kiểm tra R4 không đề xuất tổ chức ngoài nhóm | R4 KHMT; nhóm thử riêng ngoài phạm vi | 1. Mở tạo tổ chức; 2. Chọn nhóm ngoài phạm vi; 3. Tạo | Nhóm thử ngoài phạm vi | Hiện “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | No |  |  |  | Thủ công: cần tổ chức riêng; không ghi lên nhóm seed. |
| F13-TC_037 | Đề xuất thay đổi (MH-38..41) | Biên dữ liệu | US-054 AC1 | Kiểm tra công thức điểm hiển thị chưa hỗ trợ | R1; form tạo dữ liệu | 1. Mở Loại đề xuất | Công thức tính điểm | “Công thức tính điểm — Chưa hỗ trợ” bị vô hiệu hóa; năm loại còn lại theo quyền. | No |  |  |  | Lệch US-054 AC1: docs/implementation/f-13-change-requests-implementation-plan.md:3013 hoãn F-12; mã requestTypes.ts. Thủ công: rà mọi loại, ngân sách. |
| F13-TC_038 |  |  | Bổ sung | Kiểm tra tiêu đề bắt buộc | R1; form riêng đủ đối tượng | 1. Xóa tiêu đề; 2. Tạo đề xuất | Chuỗi rỗng | Lỗi inline “Nhập tiêu đề đề xuất.”; không gửi tới máy chủ. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_038 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_039 |  |  | Bổ sung | Kiểm tra lý do bắt buộc | R1; form riêng đủ đối tượng | 1. Xóa lý do; 2. Tạo đề xuất | Chuỗi rỗng | Lỗi inline “Nhập lý do đề xuất.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_039 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_040 |  |  | Bổ sung | Kiểm tra tiêu đề đúng 200 ký tự | R1; form riêng | 1. Nhập 200 ký tự; 2. Tạo đề xuất | 200 ký tự | Lưu Nháp và hiện đầy đủ tiêu đề. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_040 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_041 |  |  | Bổ sung | Kiểm tra tiêu đề vượt 200 ký tự | R1; form riêng | 1. Nhập 201 ký tự; 2. Tạo đề xuất | 201 ký tự | Lỗi inline “Tối đa 200 ký tự.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_041 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_042 |  |  | Bổ sung | Kiểm tra số căn cứ đúng 100 ký tự | R1; nguồn Trường | 1. Nhập căn cứ 100 ký tự; 2. Tạo đề xuất | 100 ký tự | Lưu Nháp; hiện đủ số văn bản căn cứ. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_042 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_043 |  |  | Bổ sung | Kiểm tra số căn cứ vượt 100 ký tự | R1; nguồn Trường | 1. Nhập căn cứ 101 ký tự; 2. Tạo đề xuất | 101 ký tự | Lỗi inline “Tối đa 100 ký tự.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_043 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_044 |  |  | Bổ sung | Kiểm tra lý do tối đa 4000 ký tự | R1; form riêng | 1. Nhập lý do 4000 ký tự; 2. Tạo | 4000 ký tự | Lưu Nháp, không cắt mất nội dung hợp lệ. | No |  |  |  | Thủ công: ca độ dài lớn, ngân sách. |
| F13-TC_045 |  |  | Bổ sung | Kiểm tra không nhập quá giới hạn lý do | R1; form riêng | 1. Dán lý do 4001 ký tự | 4001 ký tự | Ô Lý do giữ tối đa 4000 ký tự; không tạo thêm ký tự ngoài giới hạn. | No |  |  |  | Thủ công: Input.TextArea maxLength, ngân sách. |
| F13-TC_046 |  |  | Bổ sung | Kiểm tra hồ sơ rỗng trên Nháp | R1; Nháp riêng chưa tải hồ sơ | 1. Mở trang soạn | — | Hiện “Chưa có hồ sơ đính kèm”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_046 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_047 |  |  | Bổ sung | Kiểm tra không gửi đề xuất chưa thay đổi | R3; Nháp thông tin riêng chưa sửa bản sao | 1. Bấm Gửi duyệt | Không thay đổi | Hộp xem trước nêu “Đề xuất chưa có thay đổi nào so với bản đang áp dụng.”; nút “Gửi” bị vô hiệu hóa. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_047 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_048 |  |  | Bổ sung; BR-27 | Kiểm tra R1 không có người R1 khác để duyệt | Chỉ một R1 hoạt động; Nháp riêng R1 có thay đổi | 1. Bấm Gửi duyệt | R1 admin | Hiện “Không có cán bộ Phòng Đào tạo nào khác để phê duyệt đề xuất do bạn tạo.”; không gửi được. | No |  |  |  | Thủ công: không giả định số R1 trên DB dùng chung; không tạo/đổi vai người khác. |
| F13-TC_049 | Đề xuất thay đổi (MH-38..41) | Phân quyền | Bổ sung; NFR-09 | Kiểm tra R3 không phải Giám đốc bị từ chối | R3b; chương trình riêng chỉ giao R3 | 1. Mở form chọn sẵn chương trình; 2. Tạo | EP<suffix> | Hiện “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_049 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_050 |  |  | Bổ sung; NFR-09 | Kiểm tra R4 ngoài nhóm học phần bị từ chối | R4b CNPM; học phần riêng KHMT | 1. Mở form nội dung; 2. Tạo | E2E<suffix> | Hiện “Đối tượng này nằm ngoài phạm vi được phân công của bạn.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_050 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_051 |  |  | Bổ sung; NFR-09 | Kiểm tra R6 không được mở tạo đề xuất | R6 | 1. Mở /change-requests/new | — | Hiện “Bạn không có quyền truy cập trang này”; không có form. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F13-TC_051 trong specs/f-13-change-requests.spec.ts. |
| F13-TC_052 | Đề xuất thay đổi (MH-38..41) | Rỗng và biên hồ sơ | Bổ sung | Kiểm tra danh sách hoàn toàn rỗng | Người thử riêng chưa có đề xuất trong phạm vi | 1. Mở danh sách | — | Hiện “Chưa có đề xuất”. | No |  |  |  | Thủ công: DB dùng chung không được xóa dữ liệu để tạo rỗng. |
| F13-TC_053 |  |  | Bổ sung | Kiểm tra lọc không có kết quả | R1; danh sách có dữ liệu | 1. Lọc số ngày chờ lớn hơn mọi đề xuất thử | 100000 ngày | Hiện “Chưa có đề xuất”; bỏ lọc xem lại được dữ liệu. | No |  |  |  | Thủ công: không giả định dữ liệu của người khác, ngân sách. |
| F13-TC_054 |  |  | Bổ sung | Kiểm tra tải hồ sơ thiếu loại hoặc tệp | R1; Nháp riêng | 1. Tải hồ sơ lên; 2. Không chọn loại/tệp; 3. Tải lên | — | Hiện “Chọn loại hồ sơ và tệp cần tải lên.”; hộp vẫn mở. | No |  |  |  | Thủ công: validation hồ sơ, ngân sách. |
| F13-TC_055 |  |  | Bổ sung | Kiểm tra tệp sai định dạng hoặc giả chữ ký | R1; Nháp riêng | 1. Tải tệp TXT đổi đuôi PNG | Tệp giả | Hiện “Chỉ nhận tệp PDF, DOCX, XLSX hoặc ảnh PNG/JPG.”; không thêm hàng. | No |  |  |  | Thủ công: nhánh tệp bất hợp lệ, ngân sách. |
| F13-TC_056 |  |  | Bổ sung | Kiểm tra giới hạn 20 hồ sơ | R1; Nháp riêng có 20 hồ sơ | 1. Tải thêm hồ sơ thứ 21 | 21 tệp nhỏ | Hiện “Đề xuất đã đủ số hồ sơ tối đa.”; 20 hàng cũ giữ nguyên. | No |  |  |  | Thủ công: không tạo hàng loạt tệp trên DB dùng chung, ngân sách. |
| F13-TC_057 |  |  | Bổ sung | Kiểm tra xóa hồ sơ chưa gửi | R1; hồ sơ riêng chưa gửi | 1. Bấm Xóa trên đúng hàng; 2. Xác nhận | can-cu-<suffix>.png | Hộp “Xóa hồ sơ này?”; xác nhận xong chỉ hàng riêng biến mất. | No |  |  |  | Thủ công: ngân sách. |
| F13-TC_058 |  |  | Bổ sung | Kiểm tra biên dung lượng cấu hình tải lên | R1; Nháp riêng | 1. Tải tệp đúng giới hạn cấu hình; 2. Tải tệp vượt một byte | Giới hạn attachment hiện hành | Tệp trong giới hạn nhận; tệp vượt bị từ chối, không có hàng hồ sơ mới. | No |  |  |  | Thủ công: không tạo tệp lớn/đổi cấu hình máy dùng chung. |
| F13-TC_059 |  |  | NFR-01; NFR-16 | Kiểm tra phản hồi danh sách và thông báo lỗi kết nối | R1; dữ liệu riêng; môi trường đo riêng | 1. Đo mở danh sách; 2. Ngắt kết nối ở môi trường thử; 3. Tải lại | — | Đáp ứng mục tiêu NFR-01 trong điều kiện đo; lỗi hiện “Không thể tải danh sách đề xuất”, không mất dữ liệu. | No |  |  |  | Thủ công: không ngắt dịch vụ người dùng; NFR-16 chỉ giao điểm thông báo lỗi. |
| F13-TC_060 |  |  | Bổ sung; NFR-09 | Kiểm tra người ngoài phạm vi không tải hồ sơ | R5b; hồ sơ thuộc đề xuất KHMT riêng | 1. Mở URL hồ sơ riêng đã gửi | ID hồ sơ riêng | Không tải được hồ sơ ngoài phạm vi; không lộ nội dung tệp. | No |  |  |  | Thủ công: gọi trực tiếp endpoint và kiểm scope, ngân sách. |
## Ghi chú

- Tự động chỉ tương tác UI cho hành vi cần kiểm; API dùng phiên cookie tương ứng để dựng dữ liệu riêng nhanh. Mỗi test độc lập; không dựa số lượng thông báo/hàng đợi toàn hệ thống.
- Công thức điểm và chặn CLO chưa được đánh giá hoãn F-12 theo F-13 plan §8; là lệch đã chấp nhận, không phải bug mới. KB-044/NT-B4-02 chỉ bao phủ phần MVP đã dựng.
- Từ chối/thu hồi dọn bản sao làm việc theo F-14 implement report:28,53; hành vi đang chờ xác nhận của người dùng. Không coi banner cũ về bản nháp là bằng chứng bản sao còn tồn tại.
- Ca tổ chức chỉ dùng bản ghi tổ chức thử; nếu cần đổi nhóm/phân công tài khoản demo thì giữ thủ công. Ca nhiều người duyệt, dung lượng lớn, tổ chức và lỗi dịch vụ giữ thủ công vì an toàn DB/ngân sách.
- Không chạy trình duyệt trong lần viết này; không suy ra kết quả thực thi từ typecheck.
