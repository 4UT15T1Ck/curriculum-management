# F-14 Duyệt ba cấp, bình luận, thông báo — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-061 (4 AC), US-062 (4 AC), US-063 (6 AC), US-064 (4 AC), US-065 (3 AC), US-066 (5 AC), US-067 (4 AC), US-068 (4 AC), US-069 (4 AC), US-070 (4 AC); tổng 42 AC |
| Màn hình | MH-41 chi tiết, MH-42 Chờ tôi duyệt, MH-04 Thông báo; bộ lọc MH-38 |
| Vai trò/tài khoản | R1, R2, R3/R3b, R4/R4b, R5/R5b, R6 từ fixtures/accounts.ts; R2 chỉ xem/bình luận. |
| Môi trường | Frontend http://localhost:5173 proxy /api; seed nền rồi demo; múi giờ Việt Nam. |
| Dữ liệu demo | Không sửa tài khoản, vai, quyền, phân công, nhóm seed; không xử lý đề xuất của người khác. |
| Dữ liệu tự tạo | <suffix> là 16 ký tự hex uniqueSuffix(); mọi chương trình/học phần/đề xuất riêng. Thông báo/hàng đợi/lịch sử chỉ kiểm đúng mã riêng. |
| Nguồn nghiệp vụ | user-stories.md US-061..070; test-plan.md §6 KB-041/042/047..053, §7 NT-B4-02/04/05/07/08, §8 NFR-09/10/18; REQUIREMENTS.md FR-57..59/61..63/65/67, BR-27..29/31, EC-19/20/22/23/25/26/28. |
| Nguồn thiết kế/triển khai | state-diagrams.md; sequence-diagrams.md §6..9; screen-inventory.md MH-04/41/42; data-dictionary.md §9; F-14 plan §7/8 và implement report; F-13 plan về diff/visibility. |
| Nguồn mã | features/change-requests/ BE/FE; shared/change-requests/approval*, request-notifier.ts; shared/notifications/; permission-catalog.ts và seed-data/demo/. |
| Playwright spec | source/e2e/specs/f-14-three-level-approval-notifications.spec.ts; fixture chung fixtures/change-requests.ts |
| Trạng thái | 31 ca tự động đã chạy bằng Playwright ngày 10/22/26, tất cả Passed; 27 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính Vai trò/Bao phủ.
| AC | TC |
|---|---|
| US-061 AC1 | F14-TC_001 |
| NT-B4-04 | F14-TC_001; F14-TC_012 |
| US-061 AC2 | F14-TC_002 |
| US-061 AC3 | F14-TC_003 |
| NFR-18 | F14-TC_003; F14-TC_053; F14-TC_058 |
| US-061 AC4 | F14-TC_004 |
| US-062 AC1 | F14-TC_005 |
| NT-B4-02 | F14-TC_005 |
| US-062 AC2 | F14-TC_006 |
| US-062 AC3 | F14-TC_007 |
| US-062 AC4 | F14-TC_008 |
| NFR-09 | F14-TC_008; F14-TC_014; F14-TC_018; F14-TC_043; F14-TC_044; F14-TC_045; F14-TC_054 |
| US-063 AC1 | F14-TC_009 |
| US-067 AC4 | F14-TC_009; F14-TC_030 |
| NT-B4-05 | F14-TC_009; F14-TC_015 |
| US-063 AC2 | F14-TC_010 |
| KB-041 | F14-TC_010 |
| EC-22 | F14-TC_010 |
| US-063 AC3 | F14-TC_011; F14-TC_047 |
| KB-047 | F14-TC_011; F14-TC_047 |
| BR-28 | F14-TC_011; F14-TC_013; F14-TC_048 |
| US-063 AC4 | F14-TC_012 |
| KB-048 | F14-TC_012 |
| BR-29 | F14-TC_012; F14-TC_017; F14-TC_019; F14-TC_036 |
| US-063 AC5 | F14-TC_013 |
| US-063 AC6 | F14-TC_014 |
| US-064 AC1 | F14-TC_015 |
| US-064 AC2 | F14-TC_016 |
| KB-042 | F14-TC_016 |
| EC-23 | F14-TC_016 |
| US-064 AC3 | F14-TC_017 |
| US-064 AC4 | F14-TC_018 |
| US-065 AC1 | F14-TC_019 |
| KB-049 | F14-TC_019 |
| EC-26 | F14-TC_019 |
| US-065 AC2 | F14-TC_020 |
| US-065 AC3 | F14-TC_021 |
| US-068 AC2 | F14-TC_021; F14-TC_032 |
| US-066 AC1 | F14-TC_022 |
| KB-050 | F14-TC_022 |
| EC-20 | F14-TC_022 |
| NT-B4-08 | F14-TC_022 |
| US-066 AC2 | F14-TC_023 |
| KB-051 | F14-TC_023 |
| EC-19 | F14-TC_023 |
| US-066 AC3 | F14-TC_024 |
| BR-27 | F14-TC_024; F14-TC_025; F14-TC_026; F14-TC_041 |
| US-066 AC4 | F14-TC_025 |
| KB-052 | F14-TC_025; F14-TC_026 |
| US-066 AC5 | F14-TC_026 |
| US-067 AC1 | F14-TC_027 |
| NT-B4-07 | F14-TC_027 |
| US-067 AC2 | F14-TC_028 |
| US-067 AC3 | F14-TC_029 |
| US-068 AC1 | F14-TC_031 |
| US-068 AC3 | F14-TC_033 |
| US-068 AC4 | F14-TC_034 |
| US-069 AC1 | F14-TC_035 |
| NFR-10 | F14-TC_035; F14-TC_038 |
| US-069 AC2 | F14-TC_036 |
| US-069 AC3 | F14-TC_037 |
| BR-31 | F14-TC_037; F14-TC_039 |
| US-069 AC4 | F14-TC_038 |
| US-070 AC1 | F14-TC_039 |
| KB-053 | F14-TC_039; F14-TC_040; F14-TC_042 |
| EC-25 | F14-TC_039 |
| EC-28 | F14-TC_039 |
| US-070 AC2 | F14-TC_040 |
| US-070 AC3 | F14-TC_041 |
| US-070 AC4 | F14-TC_042 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; chưa có kết quả thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F14-TC_001 | Duyệt và thông báo (MH-04/41/42) | Hàng đợi | US-061 AC1; NT-B4-04 | Kiểm tra hàng đợi cấp 1 đúng người | R4 KHMT; đề xuất riêng R5 vừa gửi | 1. Mở Chờ tôi duyệt; 2. Tìm đúng mã riêng | DX riêng | Có hàng riêng ở “Chờ Điều phối duyệt”, người tạo đúng R5. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_001 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_002 |  |  | US-061 AC2 | Kiểm tra hàng đợi cấp 2 đúng Giám đốc | R3; đề xuất riêng đã qua R4 | 1. Mở Chờ tôi duyệt | DX riêng | Có hàng riêng ở “Chờ Giám đốc CTĐT duyệt”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_002 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_003 |  |  | US-061 AC3; NFR-18 | Kiểm tra cột và bộ lọc loại hàng đợi | R4; đề xuất nội dung riêng đang chờ | 1. Lọc Nội dung đề cương; 2. Đọc hàng riêng; 3. Bấm sắp Số ngày chờ | DX riêng | Hàng có mã, tiêu đề, loại, người tạo, ngày gửi, số ngày chờ; bộ lọc không loại nhầm hàng riêng. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_003 trong specs/f-14-three-level-approval-notifications.spec.ts. NFR-18 chỉ giao điểm lọc/sắp; phân trang hàng đợi hoãn theo F-14 report mục Possible enhancements. |
| F14-TC_004 |  |  | US-061 AC4 | Kiểm tra xử lý xong rời hàng đợi | R4; đề xuất riêng chờ cấp 1 | 1. Đồng ý đề xuất riêng; 2. Quay lại hàng đợi | DX riêng | Hàng riêng không còn trong Chờ tôi duyệt của R4. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_004 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_005 | Duyệt và thông báo (MH-04/41/42) | So sánh | US-062 AC1; NT-B4-02 | Kiểm tra giới hạn so sánh trọng số công thức điểm | Người duyệt; đề xuất công thức chưa hỗ trợ trong MVP | 1. Mở tạo dữ liệu | Công thức tính điểm | “Công thức tính điểm — Chưa hỗ trợ” bị vô hiệu hóa; chưa có so sánh trọng số. | No |  |  |  | Lệch US-062 AC1: hoãn công thức F-12 theo F-13 plan:3013. Thủ công: phần chưa dựng, không phải bug mới. |
| F14-TC_006 |  |  | US-062 AC2 | Kiểm tra nhãn thêm và xóa trong so sánh khung | Đề xuất khung riêng thêm một dòng và bỏ một dòng | 1. Mở chi tiết; 2. Mở Khung chương trình | Hai học phần riêng | Dòng thêm mang nhãn “Thêm”, dòng bỏ mang nhãn “Xóa”; cột “Trước”/“Sau” đúng dữ liệu. | No |  |  |  | Thủ công: fixture hai học phần, ngân sách. |
| F14-TC_007 |  |  | US-062 AC3 | Kiểm tra cách MVP so sánh đoạn văn dài | Đề xuất đề cương riêng sửa đoạn dài | 1. Mở chi tiết; 2. Đọc Trước/Sau | Đoạn trên 80 ký tự | Văn bản cũ/mới hiển thị thành cặp vùng cuộn; nhãn “Sửa” cho dòng đổi, không tô phần thêm/bớt bên trong đoạn. | No |  |  |  | Lệch US-062 AC3: cặp pre dài được quy định F-13 plan:2677; F-14 plan:96 dùng lại DiffView. Thủ công: rà trình bày. |
| F14-TC_008 |  |  | US-062 AC4; NFR-09 | Kiểm tra người ngoài nhóm không đọc đề xuất | R5b CNPM; đề xuất KHMT riêng đã gửi | 1. Mở thẳng URL chi tiết | DX riêng | Hiện “Không tìm thấy đề xuất”; không có thao tác duyệt. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_008 trong specs/f-14-three-level-approval-notifications.spec.ts. Lệch US-062 AC4 “xem được ngoài nhóm”: F-13 plan:175, D9 giới hạn người đọc theo phạm vi. |
| F14-TC_009 | Duyệt và thông báo (MH-04/41/42) | Cấp 1 | US-063 AC1; US-067 AC4; NT-B4-05 | Kiểm tra Điều phối duy nhất đồng ý | R4; đề xuất riêng không có bình luận R2 | 1. Bấm Đồng ý; 2. Xác nhận | DX riêng | Hiện “Đã đồng ý.”; chuyển “Chờ Giám đốc CTĐT duyệt”; không đòi bình luận R2. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_009 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_010 |  |  | US-063 AC2; KB-041; EC-22 | Kiểm tra một trong hai Điều phối chưa qua cấp | Hai Điều phối thử riêng cùng cần duyệt | 1. Một người đồng ý; 2. Đọc tiến độ | Hai người duyệt | Vẫn “Chờ Điều phối duyệt”; ghi người đã duyệt, người còn chờ. | No |  |  |  | Thủ công: không đổi thành viên/Điều phối nhóm demo; cần tổ chức riêng. |
| F14-TC_011 |  |  | US-063 AC3; KB-047; BR-28 | Kiểm tra Trả lại lý do 19 ký tự bị chặn | R4; đề xuất riêng chờ | 1. Trả lại; 2. Nhập 19 ký tự; 3. Xác nhận | 19 ký tự | Inline “Lý do cần ít nhất 20 ký tự.”; hộp chưa đóng. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_011 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_012 |  |  | US-063 AC4; KB-048; BR-29; NT-B4-04 | Kiểm tra Trả lại với lý do đúng 20 ký tự | R4; đề xuất riêng chờ | 1. Trả lại; 2. Nhập 20 ký tự; 3. Xác nhận | 20 ký tự | Trạng thái “Nháp”; lịch sử giữ lý do; bản sao tiếp tục soạn được. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_012 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_013 |  |  | US-063 AC5; BR-28 | Kiểm tra Từ chối với lý do đủ dài | R4; đề xuất riêng chờ | 1. Từ chối; 2. Nhập lý do; 3. Xác nhận | 20 ký tự | Trạng thái “Bị từ chối”; không gửi lại; không còn lối sửa bản sao. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_013 trong specs/f-14-three-level-approval-notifications.spec.ts. Bản sao bị dọn theo F-14 report:28,53; chờ xác nhận của người dùng. |
| F14-TC_014 |  |  | US-063 AC6; NFR-09 | Kiểm tra R4 ngoài nhóm không xử lý | R4b CNPM; đề xuất KHMT riêng | 1. Mở chi tiết theo URL | DX riêng | “Không tìm thấy đề xuất”; không có nút xử lý. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_014 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_015 | Duyệt và thông báo (MH-04/41/42) | Cấp 2 | US-064 AC1; NT-B4-05 | Kiểm tra Giám đốc duy nhất đồng ý | R3; đề xuất riêng đã qua cấp 1 | 1. Đồng ý; 2. Xác nhận | DX riêng | “Chờ Phòng Đào tạo duyệt”; “Đã đồng ý.” | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_015 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_016 |  |  | US-064 AC2; KB-042; EC-23 | Kiểm tra hai trong ba Giám đốc chưa qua cấp 2 | Ba chương trình riêng có ba Giám đốc | 1. Hai người đồng ý; 2. Đọc trạng thái | Ba người duyệt | Vẫn “Chờ Giám đốc CTĐT duyệt” cho tới người cuối. | No |  |  |  | Thủ công: cần tài khoản thử thứ ba, không đổi phân công seed. |
| F14-TC_017 |  |  | US-064 AC3; BR-29 | Kiểm tra một Giám đốc trả lại kết thúc ngay vòng | Ba Giám đốc cần duyệt, một người đã đồng ý | 1. Người thứ hai Trả lại kèm lý do | Lý do đủ 20 ký tự | Về “Nháp” ngay; không cần quyết định người thứ ba. | No |  |  |  | Thủ công: nhiều Giám đốc riêng, ngân sách/an toàn phân công. |
| F14-TC_018 |  |  | US-064 AC4; NFR-09 | Kiểm tra Giám đốc không được phân công không xử lý | R3b; chương trình riêng chỉ có R3 | 1. Mở URL đề xuất đang chờ cấp 2 | DX riêng | Hiện “Không tìm thấy đề xuất”; không có Đồng ý/Trả lại/Từ chối. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_018 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_019 | Duyệt và thông báo (MH-04/41/42) | Cấp cuối | US-065 AC1; KB-049; EC-26; BR-29 | Kiểm tra cấp cuối trả lại rồi gửi lại từ cấp 1 | R1; đề xuất R5 riêng đã qua R4/R3 | 1. Trả lại có lý do; 2. R5 gửi lại; 3. Đọc trạng thái | Lần 1 → 2 | Về Nháp rồi “Chờ Điều phối duyệt”; lịch sử vẫn có Lần gửi 1 và Lần gửi 2. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_019 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_020 |  |  | US-065 AC2 | Kiểm tra cấp cuối từ chối đóng đề xuất | R1; đề xuất riêng chờ cấp 3 | 1. Từ chối có lý do; 2. Mở lại bằng người tạo | Lý do riêng | “Bị từ chối”; người tạo không có “Tiếp tục soạn”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_020 trong specs/f-14-three-level-approval-notifications.spec.ts. Bản sao dọn theo F-14 report:28,53; chờ xác nhận của người dùng. |
| F14-TC_021 |  |  | US-065 AC3; US-068 AC2 | Kiểm tra lý do cấp cuối tới người tạo và người đã duyệt | Đề xuất riêng bị R1 trả lại sau R4/R3 | 1. Mở Thông báo bằng R5, R4, R3 | Mã DX riêng, lý do riêng | Mỗi người có thông báo đúng mã và lý do trả lại/từ chối; không so tổng số thông báo. | No |  |  |  | Thủ công: ba phiên thông báo, ngân sách. |
| F14-TC_022 | Duyệt và thông báo (MH-04/41/42) | Tự bỏ qua | US-066 AC1; KB-050; EC-20; NT-B4-08 | Kiểm tra Điều phối tạo tự bỏ qua cấp 1 | R4; học phần riêng thuộc KHMT | 1. Gửi đề xuất riêng; 2. Đọc trạng thái/tiến độ | DX riêng | “Chờ Giám đốc CTĐT duyệt”; nhãn “Bỏ qua”, lý do “Người duyệt là người tạo đề xuất”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_022 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_023 |  |  | US-066 AC2; KB-051; EC-19 | Kiểm tra Giám đốc tạo tự bỏ qua cấp 2 | R3; đề xuất thông tin chương trình mình phụ trách riêng | 1. Gửi; 2. Đọc tuyến | DX riêng | “Chờ Phòng Đào tạo duyệt”; cấp 2 ghi “Bỏ qua” với lý do người tạo. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_023 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_024 |  |  | US-066 AC3; BR-27 | Kiểm tra chỉ bỏ qua lượt người tạo | R4 thử riêng là một trong hai Điều phối | 1. Tạo và gửi; 2. Đọc tiến độ | Hai người duyệt | Chỉ lượt người tạo có “Bỏ qua”; người còn lại vẫn chờ. | No |  |  |  | Thủ công: không thay nhóm/Điều phối demo. |
| F14-TC_025 |  |  | US-066 AC4; KB-052; BR-27 | Kiểm tra R1 tạo vẫn cần R1 khác duyệt cuối | Hai R1 thử hợp lệ; đề xuất riêng do một R1 tạo | 1. Gửi; 2. Tới cấp 3; 3. Đọc quyền | Hai R1 | Cấp 3 không bị bỏ qua; chỉ R1 không phải người tạo xử lý. | No |  |  |  | Thủ công: không bổ sung/đổi vai tài khoản demo; chưa có phiên R1 thứ hai trong accounts.ts. |
| F14-TC_026 |  |  | US-066 AC5; KB-052; BR-27 | Kiểm tra gọi duyệt chính đề xuất mình bị từ chối | Người tạo là người có vai duyệt; đề xuất riêng | 1. Gọi thẳng thao tác Đồng ý | DX riêng | Máy chủ từ chối “Bạn không thể phê duyệt đề xuất do chính mình tạo.” | No |  |  |  | Thủ công: gọi trực tiếp endpoint; UI không cung cấp thao tác. |
| F14-TC_027 | Duyệt và thông báo (MH-04/41/42) | Bình luận | US-067 AC1; NT-B4-07 | Kiểm tra R2 bình luận không duyệt | R2; đề xuất riêng trong Khoa đã gửi | 1. Mở chi tiết; 2. Gửi bình luận | Bình luận <suffix> | Bình luận được lưu; không có Đồng ý/Trả lại/Từ chối. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_027 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_028 |  |  | US-067 AC2 | Kiểm tra tên, thời điểm và thứ tự bình luận | R2; đề xuất riêng | 1. Gửi bình luận A; 2. Gửi B; 3. Xem danh sách | Hai nội dung riêng | Mỗi nội dung có tên người viết, ngày giờ; A đứng trước B. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_028 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_029 |  |  | US-067 AC3 | Kiểm tra bình luận không sửa hoặc xóa | R2; bình luận riêng đã gửi | 1. Tải lại chi tiết; 2. Xem đúng mục bình luận | Nội dung riêng | Nội dung còn nguyên; mục đó không có thao tác Sửa/Xóa; vẫn gửi bình luận mới được. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_029 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_030 |  |  | US-067 AC4 | Kiểm tra bình luận không phải cấp duyệt | R4; đề xuất riêng chưa có bình luận R2 | 1. Đồng ý | DX riêng | Chuyển cấp bình thường; không có yêu cầu bình luận R2. | No |  |  |  | Thủ công bổ sung; tự động cùng hành vi ở F14-TC_009. |
| F14-TC_031 | Duyệt và thông báo (MH-04/41/42) | Thông báo | US-068 AC1 | Kiểm tra thông báo tới người duyệt cấp hiện tại | R4; đề xuất KHMT riêng vừa tới cấp 1 | 1. Mở Thông báo; 2. Tìm mục đúng mã | DX riêng | Có thông báo chưa đọc “Đề xuất … đang chờ bạn duyệt (Điều phối nhóm chuyên môn).” dẫn tới đề xuất riêng. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_031 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_032 |  |  | US-068 AC2 | Kiểm tra người tạo nhận lý do trả lại | R5; đề xuất riêng vừa bị R4 trả lại | 1. Mở Thông báo | DX riêng, lý do riêng | Mục đúng mã nêu người trả lại và lý do; không so số thông báo chung. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_032 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_033 |  |  | US-068 AC3 | Kiểm tra bình luận thông báo tới người tạo và người duyệt | R2 bình luận đề xuất riêng chờ R4 | 1. Gửi bình luận; 2. R5/R4 mở thông báo | DX riêng | Mỗi người có thông báo “… đã bình luận về đề xuất …”; không gửi trùng cho người thực hiện. | No |  |  |  | Thủ công: nhiều phiên thông báo, ngân sách. |
| F14-TC_034 |  |  | US-068 AC4 | Kiểm tra mở thông báo riêng đánh dấu đã đọc | R4; thông báo riêng chưa đọc | 1. Lọc Chưa đọc; 2. Mở thông báo riêng; 3. Quay lại lọc Chưa đọc | DX riêng | Mở đúng đề xuất; thông báo riêng không còn ở Chưa đọc. Bộ đếm giảm tương ứng trong môi trường không có phát sinh mới. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_034 trong specs/f-14-three-level-approval-notifications.spec.ts. Không khẳng định tổng đếm hoặc số đếm tuyệt đối trên DB dùng chung. |
| F14-TC_035 | Duyệt và thông báo (MH-04/41/42) | Lịch sử | US-069 AC1; NFR-10 | Kiểm tra lịch sử giữ người xử lý và lý do | R4 vừa trả lại đề xuất riêng | 1. Mở Lịch sử phê duyệt | Lý do riêng | Có Lần gửi 1, cấp, người xử lý, “Trả lại”, lý do, ngày giờ. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_035 trong specs/f-14-three-level-approval-notifications.spec.ts. NFR-10 chỉ giao điểm lịch sử duyệt append-only; audit log tổng quát ngoài F-14. |
| F14-TC_036 |  |  | US-069 AC2; BR-29 | Kiểm tra lịch sử giữ mọi lần gửi | R5; đề xuất riêng bị trả lại rồi gửi lại | 1. Gửi lại; 2. Mở lịch sử | Lần 1/2 | Hiện cả “Lần gửi 1” và “Lần gửi 2”; lượt cũ không bị ghi đè. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_036 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_037 |  |  | US-069 AC3; BR-31 | Kiểm tra nhãn duyệt thay và người được thay | R1 vừa duyệt thay cấp 1 đề xuất riêng | 1. Mở Lịch sử phê duyệt | R4 là người được thay | Có “Phòng Đào tạo duyệt thay”, tên người thực hiện và tên người duyệt được thay. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_037 trong specs/f-14-three-level-approval-notifications.spec.ts. Phần ủy quyền B6 chưa dựng theo F-14 plan:87; nhãn Bỏ qua tự động ở F14-TC_022/023. |
| F14-TC_038 |  |  | US-069 AC4; NFR-10 | Kiểm tra không sửa hoặc xóa bước lịch sử | Người xem hợp lệ; lịch sử riêng có bước | 1. Mở Lịch sử phê duyệt; 2. Tìm thao tác trên bước | — | Không có thao tác Sửa/Xóa bước. | No |  |  |  | Thủ công: rà thao tác lịch sử, ngân sách. |
| F14-TC_039 | Duyệt và thông báo (MH-04/41/42) | Can thiệp | US-070 AC1; KB-053; BR-31; EC-25; EC-28 | Kiểm tra R1 đồng ý thay cấp dưới | R1; đề xuất riêng đang chờ R4 | 1. Duyệt thay; 2. Chọn Đồng ý thay; 3. Nhập lý do; 4. Xác nhận | Lý do riêng | “Đã duyệt thay.”; sang “Chờ Giám đốc CTĐT duyệt”; ghi rõ R4 được thay. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_039 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_040 |  |  | US-070 AC2; KB-053 | Kiểm tra duyệt thay thiếu lý do bị chặn | R1; đề xuất riêng chờ cấp 1 | 1. Duyệt thay; 2. Để trống Lý do; 3. Xác nhận | Chuỗi rỗng | Inline “Nhập lý do.”; hộp vẫn mở, trạng thái chưa đổi. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_040 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_041 |  |  | US-070 AC3; BR-27 | Kiểm tra R1 không can thiệp đề xuất chính mình | R1 tạo đề xuất riêng có R1 khác xử lý | 1. Gọi thẳng Duyệt thay trên đề xuất của mình | DX riêng | Bị từ chối “Bạn không thể phê duyệt đề xuất do chính mình tạo.” | No |  |  |  | Thủ công: cần người R1 thứ hai, không đổi vai demo/ma trận quyền. |
| F14-TC_042 |  |  | US-070 AC4; KB-053 | Kiểm tra lọc tồn đọng theo ngày lịch Việt Nam | R1; đề xuất riêng đã chờ N ngày | 1. Lọc Chờ từ N ngày; 2. Tăng ngưỡng N+1 | N, N+1 | Hàng riêng có ở ngưỡng N và không có ở N+1 nếu chưa sang ngày mới. | No |  |  |  | Thủ công: phụ thuộc thời gian; không sửa ngày DB hoặc đồng hồ máy dùng chung. Mốc theo F-14 report:31. |
| F14-TC_043 | Duyệt và thông báo (MH-04/41/42) | Phân quyền và biên | Bổ sung; NFR-09 | Kiểm tra R2 không có hàng chờ cá nhân | R2 chỉ giám sát | 1. Mở Chờ tôi duyệt | — | Hiện “Không có đề xuất nào chờ bạn duyệt.” | No |  |  |  | Thủ công: giữ ngân sách; menu cho R2 theo F-14 report:34, không phải bug. |
| F14-TC_044 |  |  | Bổ sung; NFR-09 | Kiểm tra người tạo R5 không có thao tác xử lý | R5; đề xuất riêng chờ cấp 1 | 1. Mở đề xuất của mình | DX riêng | Không có Đồng ý/Trả lại/Từ chối/Duyệt thay; còn Rút đề xuất khi chưa ai duyệt. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_044 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_045 |  |  | Bổ sung; NFR-09 | Kiểm tra R6 không xem chi tiết đề xuất | R6; đề xuất riêng hợp lệ | 1. Mở URL chi tiết | DX riêng | “Bạn không có quyền truy cập trang này”. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_045 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_046 |  |  | Bổ sung | Kiểm tra hàng đợi hoàn toàn rỗng | Người duyệt thử riêng không có đề xuất | 1. Mở Chờ tôi duyệt | — | “Không có đề xuất nào chờ bạn duyệt.” | No |  |  |  | Thủ công: không xóa/duyệt hàng của người dùng để tạo rỗng. |
| F14-TC_047 |  |  | US-063 AC3; KB-047 | Kiểm tra Từ chối lý do 19 ký tự bị chặn | R4; đề xuất riêng chờ | 1. Từ chối; 2. Nhập 19 ký tự; 3. Xác nhận | 19 ký tự | “Lý do cần ít nhất 20 ký tự.”; không đóng đề xuất. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_047 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_048 |  |  | Bổ sung; BR-28 | Kiểm tra lý do toàn khoảng trắng không hợp lệ | R4; đề xuất riêng chờ | 1. Trả lại; 2. Nhập 20 dấu cách; 3. Xác nhận | 20 dấu cách | “Nhập lý do.” hoặc “Lý do cần ít nhất 20 ký tự.”; không xử lý. | No |  |  |  | Thủ công: validation trim, ngân sách. |
| F14-TC_049 |  |  | Bổ sung | Kiểm tra bình luận trống bị chặn | R2; đề xuất riêng đã gửi | 1. Để trống bình luận; 2. Gửi bình luận | Chuỗi rỗng | Inline “Nhập nội dung bình luận.”; không thêm mục. | Yes | Passed | 10/22/26 | Playwright (auto) | Tự động: F14-TC_049 trong specs/f-14-three-level-approval-notifications.spec.ts. |
| F14-TC_050 |  |  | Bổ sung | Kiểm tra bình luận đúng 2000 ký tự | R2; đề xuất riêng | 1. Nhập 2000 ký tự; 2. Gửi | 2000 ký tự | Bình luận được lưu đầy đủ. | No |  |  |  | Thủ công: dữ liệu dài, ngân sách. |
| F14-TC_051 |  |  | Bổ sung | Kiểm tra bình luận không vượt 2000 ký tự | R2; đề xuất riêng | 1. Dán 2001 ký tự | 2001 ký tự | Ô giữ tối đa 2000 ký tự; không phát sinh phần dư. | No |  |  |  | Thủ công: biên maxLength, ngân sách. |
| F14-TC_052 |  |  | Bổ sung | Kiểm tra lý do tối đa 2000 ký tự | R4; đề xuất riêng | 1. Dán lý do 2001 ký tự | 2001 ký tự | Ô giữ tối đa 2000 ký tự; không gửi vượt giới hạn. | No |  |  |  | Thủ công: biên maxLength, ngân sách. |
| F14-TC_053 |  |  | Bổ sung; NFR-18 | Kiểm tra bộ lọc hàng đợi không kết quả | Người duyệt có đề xuất riêng | 1. Lọc loại không có đề xuất của người thử | Loại khác | Hiện “Không có đề xuất nào chờ bạn duyệt.” khi thực sự không có kết quả. | No |  |  |  | Thủ công: không giả định hàng của người dùng khác. |
| F14-TC_054 |  |  | Bổ sung; NFR-09 | Kiểm tra polling không giữ phiên quá hạn | Tài khoản thử riêng; không dùng phiên .auth demo | 1. Để tab chỉ polling quá hạn; 2. Thao tác | 61 phút | Phải đăng nhập lại; polling không gia hạn hoạt động người dùng. | No |  |  |  | Thủ công: không vô hiệu hóa phiên demo hoặc sửa bảng session. |
| F14-TC_055 |  |  | Bổ sung | Kiểm tra hai người xử lý cùng lúc không ghi hai kết quả | Hai phiên thử có quyền cùng cấp; đề xuất riêng | 1. Cùng xử lý | Một đề xuất | Chỉ quyết định hợp lệ được ghi; người thua nhận lỗi trạng thái đã đổi, trang cập nhật quyền. | No |  |  |  | Thủ công: cạnh tranh phiên, ngân sách. |
| F14-TC_056 |  |  | Bổ sung | Kiểm tra lỗi tải hàng đợi có thông báo | Môi trường thử riêng | 1. Làm lỗi tải hàng đợi; 2. Tải lại | Lỗi mạng | Hiện “Không thể tải hàng chờ duyệt”; không thay dữ liệu. | No |  |  |  | Thủ công: không ngắt backend của người dùng. |
| F14-TC_057 |  |  | Bổ sung | Kiểm tra chưa có bình luận | Người xem hợp lệ; đề xuất riêng chưa bình luận | 1. Mở chi tiết | — | Hiện “Chưa có bình luận.” | No |  |  |  | Thủ công: trạng thái rỗng cục bộ, ngân sách. |
| F14-TC_058 |  |  | NFR-18 | Kiểm tra giới hạn hàng đợi chưa phân trang/tìm kiếm | Người duyệt có nhiều đề xuất thử | 1. Mở hàng đợi; 2. Rà điều khiển | Nhiều hàng | MVP có lọc loại/sắp số ngày; chưa phân trang/tìm kiếm văn bản. | No |  |  |  | Lệch NFR-18: F-14 report mục Possible enhancements “phân trang hàng chờ”; F-14 plan FE-05 dùng Table pagination=false. Thủ công: không tạo tải lớn DB chung. |
## Ghi chú

- Từ chối và Rút hiện xóa bản làm việc theo F-14 implement report:28,53; hành vi đang chờ người dùng xác nhận, không đưa thành escalation.
- Tự bỏ qua không là tự duyệt; giữ nhãn Bỏ qua/lý do. Ủy quyền ở US-069 AC3 hoãn B6 theo plan; không giả lập bằng đổi quyền demo.
- Công thức điểm hoãn F-12, đoạn văn dài dùng cặp Trước/Sau theo F-13 plan; ngoài phạm vi không được đọc theo D9. Các lệch này là chủ đích trong kế hoạch, không phải bug mới.
- Mọi hành vi duyệt cần kiểm được bấm UI. API chỉ dựng dữ liệu/trạng thái trước test, không làm thay thao tác đang kiểm. Context vai khác đóng trong finally, không đăng xuất.
- Không bấm Đánh dấu tất cả đã đọc vì làm thay đổi thông báo dùng chung; chỉ mở mục của mã riêng. Không khẳng định tổng số chưa đọc.
- Tài khoản vô hiệu hóa/ủy quyền, cạnh tranh nhiều Giám đốc và thời gian chờ giữ thủ công, không vô hiệu hóa demo hay sửa clock/session. Chưa chạy trình duyệt.
