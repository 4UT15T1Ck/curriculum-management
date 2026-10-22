# F-08 Kiểm tra nhất quán — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-029 (3 AC), US-030 (4 AC), US-031 (5 AC); tổng 12 AC |
| Màn hình | MH-27 `/programs/:programId/versions/:versionId/consistency`; MH-25 khung chương trình |
| Vai trò/tài khoản | R1, R2, R3/R3b, R4/R4b, R5/R5b, R6 theo `source/e2e/fixtures/accounts.ts`. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | Chỉ đọc; không sửa chương trình 1024034, DEMO*, phân công hay nhóm demo. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex từ uniqueSuffix(); EP<suffix>, E2E<suffix>, EG<suffix> là chương trình, học phần và nhóm riêng. Mỗi test tự dựng dữ liệu, không phụ thuộc thứ tự. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-029..031; `docs/planning/test-plan.md` §6 KB-012/013/015/018..021, §7 NT-B2-06, §8 NFR-09/16, §9 EC-01/03/06/09/10/13; `docs/requirement/REQUIREMENTS.md` FR-77..81, BR-02/03/05/11. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-27; `docs/design/data-dictionary.md` §9; `docs/implementation/f-08-consistency-check-implementation-plan.md` §7/8; `docs/implement-report/f-08-consistency-check-implement-report.md` Lệch 8/9, USER ACTIONS. |
| Nguồn mã | `source/frontend/src/features/consistency/`; `source/backend/src/features/consistency/`, `shared/curriculum/consistency-checker.ts`, `shared/curriculum/curriculum-warnings.ts`; `source/backend/prisma/seed-data/permission-catalog.ts`, `demo/`. |
| Playwright spec | `source/e2e/specs/f-08-consistency-check.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 13 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 21 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính Vai trò/Bao phủ.
| AC | TC |
|---|---|
| US-029 AC1 | F08-TC_001 |
| KB-013 | F08-TC_001 |
| BR-03 | F08-TC_001 |
| US-029 AC2 | F08-TC_002 |
| KB-012 | F08-TC_002 |
| EC-01 | F08-TC_002 |
| BR-02 | F08-TC_002 |
| US-029 AC3 | F08-TC_003; F08-TC_029; F08-TC_030 |
| US-030 AC1 | F08-TC_004 |
| KB-018 | F08-TC_004; F08-TC_005; F08-TC_007; F08-TC_008 |
| BR-05 | F08-TC_004 |
| EC-03 | F08-TC_004 |
| NT-B2-06 | F08-TC_004; F08-TC_009; F08-TC_010; F08-TC_011; F08-TC_012 |
| US-030 AC2 | F08-TC_005; F08-TC_006 |
| US-030 AC3 | F08-TC_007; F08-TC_028 |
| US-030 AC4 | F08-TC_008; F08-TC_019 |
| US-031 AC1 | F08-TC_009 |
| KB-019 | F08-TC_009 |
| EC-10 | F08-TC_009 |
| US-031 AC2 | F08-TC_010 |
| KB-020 | F08-TC_010 |
| EC-09 | F08-TC_010 |
| BR-11 | F08-TC_010 |
| US-031 AC3 | F08-TC_011 |
| KB-021 | F08-TC_011 |
| EC-13 | F08-TC_011 |
| US-031 AC4 | F08-TC_012 |
| KB-015 | F08-TC_012 |
| EC-06 | F08-TC_012 |
| US-031 AC5 | F08-TC_013 |
| NFR-09 | F08-TC_021; F08-TC_022; F08-TC_023; F08-TC_024; F08-TC_025; F08-TC_026; F08-TC_027; F08-TC_028 |
| NFR-16 | F08-TC_032 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; chưa thực thi không ghi Passed.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F08-TC_001 | Kiểm tra nhất quán (MH-27) | Tổng tín chỉ | US-029 AC1; KB-013; BR-03 | Kiểm tra tổng chỉ cộng tối thiểu của hai nhóm | R1; chương trình riêng có một dòng bắt buộc 2.5 TC, hai dòng tự chọn 2.5 TC thuộc hai nhóm | 1. Mở Kiểm tra nhất quán; 2. Đọc dòng Tổng | Tối thiểu hai nhóm 1 và 1.5 | Dòng “Tổng” có “Khai báo” 10, “Tính từ khung” 5, “Chênh lệch” -5. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_001 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_002 |  |  | US-029 AC2; KB-012; EC-01; BR-02 | Kiểm tra 0 tín chỉ không cộng và giữ phần lẻ | R1; chương trình riêng, hai dòng bắt buộc 0 và 2.5 TC | 1. Mở Kiểm tra nhất quán; 2. Đọc dòng Tổng | Khai báo 2.5 bắt buộc, 0 tự chọn | “Tổng” tính từ khung là 2.5; chênh lệch 0. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_002 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_003 |  |  | US-029 AC3 | Kiểm tra tính lại tổng sau thêm dòng | R1; chương trình riêng trống | 1. Xem tổng; 2. Thêm học phần 2.5 TC; 3. Mở lại kiểm tra | Học phần riêng E2E<suffix> | “Tổng” tính từ khung đổi từ 0 thành 2.5. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_003 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_004 | Kiểm tra nhất quán (MH-27) | Chênh lệch | US-030 AC1; KB-018; BR-05; EC-03; NT-B2-06 | Kiểm tra cảnh báo không ngăn lưu khung | R1; chương trình riêng khai báo 10, bắt buộc 5, tự chọn 5 | 1. Thêm dòng bắt buộc 2.5 TC; 2. Mở kết quả kiểm tra | Tính từ khung 2.5 | Dòng được lưu; hiện “Tín chỉ khai báo: 10 (bắt buộc 5, tự chọn 5); tính từ khung: 2.5 (bắt buộc 2.5, tự chọn 0); chênh lệch 7.5.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_004 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_005 |  |  | US-030 AC2; KB-018 | Kiểm tra chặn lý do bỏ trống | R1; chương trình riêng lệch tín chỉ | 1. Bấm Chấp nhận chênh lệch; 2. Để trống Lý do; 3. Bấm Chấp nhận | Lý do rỗng | Hiện “Nhập lý do chấp nhận chênh lệch.”; modal còn mở. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_005 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_006 |  |  | US-030 AC2 | Kiểm tra chặn lý do chỉ khoảng trắng | R1; chương trình riêng lệch tín chỉ | 1. Mở modal; 2. Nhập ba dấu cách; 3. Bấm Chấp nhận | Lý do = ba khoảng trắng | Hiện “Nhập lý do chấp nhận chênh lệch.”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_006 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_007 |  |  | US-030 AC3; KB-018 | Kiểm tra lưu và xem lại chấp nhận | R1; chương trình riêng lệch tín chỉ | 1. Nhập lý do; 2. Chấp nhận; 3. Tải lại trang | Ngoại lệ đào tạo EP<suffix> | Hiện “Đã chấp nhận chênh lệch.”; thẻ “Đã chấp nhận chênh lệch” giữ lý do và mục “Người chấp nhận”; không còn nút chấp nhận. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_007 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_008 |  |  | US-030 AC4; KB-018 | Kiểm tra hết hiệu lực khi chênh lệch đổi | R1; chương trình riêng đã chấp nhận | 1. Thêm dòng bắt buộc 2.5 TC; 2. Mở lại kiểm tra | Học phần riêng | Hiện “Đã hết hiệu lực — chênh lệch đã đổi” và nút “Chấp nhận chênh lệch”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_008 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_009 | Kiểm tra nhất quán (MH-27) | Cấu trúc khung | US-031 AC1; KB-019; EC-10; NT-B2-06 | Kiểm tra tiên quyết xếp sau | R1; hai học phần riêng A kỳ 3, B kỳ 2 | 1. Đặt A là tiên quyết của B; 2. Lưu; 3. Mở kiểm tra | A, B là E2E<suffix> riêng | Lưu được; mục “Cảnh báo” có “B (học kỳ 2) cần A trước, nhưng A xếp ở học kỳ 3.”, thay A/B bằng mã thật. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_009 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_010 |  |  | US-031 AC2; KB-020; EC-09; BR-11; NT-B2-06 | Kiểm tra chặn vòng điều kiện | R1; khung riêng có A cần B trước | 1. Đặt B cần A trước; 2. Lưu | Hai học phần riêng | Không lưu; hiện “Điều kiện này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng” kèm mã hai học phần. | No | | | | Thủ công: dựng ràng buộc riêng; không tiêm vòng vào dữ liệu seed. Kiểm phát hiện vòng tồn tại sẵn cần fixture dữ liệu riêng theo kế hoạch §8. |
| F08-TC_011 |  |  | US-031 AC3; KB-021; EC-13; NT-B2-06 | Kiểm tra tiên quyết ngoài khung | R1; danh mục riêng B cần A, khung riêng chỉ có B | 1. Mở kết quả kiểm tra | A không có trong khung | Có “B cần A (tiên quyết), nhưng A không có trong khung.” với mã thật. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_011 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_012 |  |  | US-031 AC4; KB-015; EC-06; NT-B2-06 | Kiểm tra báo hai dòng học phần trùng | R1; fixture biệt lập có cùng học phần hai dòng | 1. Mở kết quả kiểm tra | Cùng mã ở kỳ 1 và 2 | Mục “Lỗi” nêu “xuất hiện 2 lần trong khung (học kỳ 1, 2).”; hiện “Còn lỗi: chưa gửi duyệt hoặc ban hành được phiên bản này.” | No | | | | Thủ công: ràng buộc duy nhất chặn tạo trùng qua UI; cần fixture biệt lập do người vận hành chuẩn bị, không sửa DB dùng chung. Kế hoạch BE-02/§8 nêu kiểm này dùng cả preview nhập liệu. |
| F08-TC_013 |  |  | US-031 AC5 | Kiểm tra khung sạch | R1; chương trình riêng khớp tín chỉ, mỗi kỳ có học phần và đề cương, không điều kiện sai, không nhóm thiếu | 1. Mở kiểm tra; 2. Bấm Chạy lại | Khai báo khớp cả bắt buộc và tự chọn | Hiện “Không có lỗi, không có cảnh báo.” | No | | | | Thủ công: phải chuẩn bị cả đề cương và lấp đủ học kỳ; không dùng 1024034 làm fixture ghi. MH-27 hiện kiểm cả thiếu đề cương từ F-10. |
| F08-TC_014 | Kiểm tra nhất quán (MH-27) | Trạng thái rỗng | Bổ sung | Kiểm tra khung trống | R1; chương trình riêng chưa có dòng | 1. Mở kiểm tra | Khai báo 10 | Tổng tính từ khung 0; hiện “Học kỳ 1 chưa có học phần nào.” dưới “Lưu ý”. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_014 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_015 | Kiểm tra nhất quán (MH-27) | Nhóm tự chọn | Bổ sung | Kiểm tra nhóm không đạt tối thiểu | R1; nhóm riêng EG<suffix> tối thiểu 6, chưa có thành viên | 1. Mở kiểm tra | 0 tín chỉ, 0 học phần | Có “Nhóm EG<suffix> yêu cầu tối thiểu 6 tín chỉ, nhưng các học phần trong nhóm chỉ có 0 tín chỉ (0 học phần).”; có thông báo chặn gửi duyệt/ban hành. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_015 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_016 |  |  | Bổ sung | Kiểm tra dòng tự chọn chưa thuộc nhóm | R1; khung riêng có một dòng tự chọn 2.5 TC chưa thuộc nhóm | 1. Mở kiểm tra | E2E<suffix> | Có “E2E<suffix> là học phần tự chọn nhưng chưa thuộc nhóm nào nên không được tính vào tổng tín chỉ.”; tổng tính từ khung vẫn 0. | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F08-TC_016 trong specs/f-08-consistency-check.spec.ts. |
| F08-TC_017 | Kiểm tra nhất quán (MH-27) | Biên lý do | Bổ sung | Kiểm tra lý do đúng 500 ký tự | R1; chương trình riêng lệch tín chỉ | 1. Mở modal; 2. Nhập 500 ký tự có dấu; 3. Chấp nhận | 500 chữ á | Hiện “Đã chấp nhận chênh lệch.”; xem lại đủ lý do. | No | | | | Thủ công; giới hạn REASON_MAX=500 ở cả form và DTO. |
| F08-TC_018 |  |  | Bổ sung | Kiểm tra không nhập quá 500 ký tự | R1; chương trình riêng lệch tín chỉ | 1. Mở modal; 2. Dán 501 ký tự | 501 chữ á | Ô “Lý do” chỉ giữ tối đa 500 ký tự; bộ đếm không vượt 500. | No | | | | Thủ công; Input.TextArea maxLength, không chờ lỗi máy chủ cho form này. |
| F08-TC_019 | Kiểm tra nhất quán (MH-27) | Cập nhật đồng thời | US-030 AC4 | Kiểm tra modal chấp nhận bị lỗi thời | R1; hai tab trên cùng chương trình riêng | 1. Tab A mở modal; 2. Tab B thêm dòng; 3. Tab A chấp nhận | Chênh lệch đổi 2.5 | Hiện “Chênh lệch tín chỉ đã thay đổi; chạy lại kiểm tra rồi chấp nhận lại.”; nút Chấp nhận bị khóa; đóng/mở lại để xem chênh lệch mới. | No | | | | Thủ công; implement report Lệch 9 mô tả chủ đích không gửi chênh lệch chưa xem. |
| F08-TC_020 | Kiểm tra nhất quán (MH-27) | Điều hướng | Bổ sung | Kiểm tra đi tới dòng cần sửa | R1; cảnh báo riêng gắn học phần | 1. Bấm Tới chỗ sửa ở cảnh báo của mã riêng | Bộ lọc đang ẩn dòng | Về Khung chương trình và nhìn thấy dòng cần sửa; bộ lọc có thể bị xóa. | No | | | | Thủ công; implement report USER ACTIONS: chế độ Theo học kỳ chỉ cuộn tới, không tô sáng. |
| F08-TC_021 | Kiểm tra nhất quán (MH-27) | Phân quyền | NFR-09 | Kiểm tra R2 không chấp nhận | R2; chương trình riêng lệch tín chỉ do R1 tạo | 1. Mở MH-27; 2. Thử gọi thao tác chấp nhận bằng phiên R2, kèm header AJAX | Lý do hợp lệ | Xem được báo cáo nhưng không có nút “Chấp nhận chênh lệch”; yêu cầu ghi bị từ chối quyền, không đổi chấp nhận. | No | | | | Thủ công; program.view cho mọi nhân viên, không nhầm quyền xem với quyền sửa. |
| F08-TC_022 |  |  | NFR-09 | Kiểm tra R3 ngoài chương trình không chấp nhận | R3b không làm giám đốc chương trình riêng | 1. Mở MH-27; 2. Gửi thao tác chấp nhận bằng phiên R3b kèm header AJAX | Lý do hợp lệ | Xem được báo cáo; không có nút chấp nhận; máy chủ từ chối ngoài phạm vi. | No | | | | Thủ công; không sửa phân công trên chương trình seed. |
| F08-TC_023 |  |  | NFR-09 | Kiểm tra R4 không chấp nhận dù cùng nhóm | R4 KHMT; chương trình riêng | 1. Mở MH-27; 2. Thử chấp nhận trực tiếp kèm header AJAX | Lệch tín chỉ | Xem được; không có nút chấp nhận; máy chủ từ chối quyền. | No | | | | Thủ công; R4 không có program.editInfo. |
| F08-TC_024 |  |  | NFR-09 | Kiểm tra R4 ngoài nhóm không chấp nhận | R4b CNPM; chương trình riêng có dòng KHMT | 1. Mở MH-27; 2. Thử chấp nhận kèm header AJAX | Lệch tín chỉ | Xem được; máy chủ từ chối ghi. | No | | | | Thủ công; không sửa nhóm demo. |
| F08-TC_025 |  |  | NFR-09 | Kiểm tra R5 không chấp nhận | R5 KHMT; chương trình riêng | 1. Mở MH-27; 2. Thử chấp nhận kèm header AJAX | Lệch tín chỉ | Xem được; không có nút chấp nhận; máy chủ từ chối quyền. | No | | | | Thủ công. |
| F08-TC_026 |  |  | NFR-09 | Kiểm tra R5 ngoài nhóm không chấp nhận | R5b CNPM; chương trình riêng có dòng KHMT | 1. Mở MH-27; 2. Thử chấp nhận kèm header AJAX | Lệch tín chỉ | Xem được; máy chủ từ chối ghi. | No | | | | Thủ công; quyền program.view không giới hạn nhóm nhân viên. |
| F08-TC_027 |  |  | NFR-09 | Kiểm tra R6 không xem nháp ngoài phạm vi | R6 không thuộc chương trình riêng Nháp | 1. Truy cập thẳng MH-27 bằng URL của R1 | Chương trình riêng | Hiện “Bạn không có quyền xem kiểm tra này”; không lộ báo cáo. | No | | | | Thủ công; không đổi lớp/chương trình của sinh viên demo. |
| F08-TC_028 |  |  | US-030 AC3; NFR-09 | Kiểm tra R3 được phân công chấp nhận | R1 phân công R3 làm giám đốc chương trình riêng; R3 mở báo cáo lệch | 1. Chấp nhận với lý do; 2. Tải lại | Ngoại lệ có phê duyệt | Hiện thẻ “Đã chấp nhận chênh lệch”, lý do, người chấp nhận. | No | | | | Thủ công; chỉ phân công trên chương trình throwaway, không khẳng định danh sách đầy đủ R3 thấy. |
| F08-TC_029 | Kiểm tra nhất quán (MH-27) | Tính lại | US-029 AC3 | Kiểm tra tổng giảm sau bỏ dòng | R1; chương trình riêng có dòng 2.5 | 1. Xóa dòng; 2. Quay lại MH-27 | Dòng duy nhất | “Tổng” tính từ khung từ 2.5 còn 0. | No | | | | Thủ công. |
| F08-TC_030 |  |  | US-029 AC3 | Kiểm tra tổng theo kỳ đổi sau chuyển kỳ | R1; dòng 2.5 TC kỳ 1 trên khung riêng | 1. Sửa dòng sang kỳ 2; 2. Xem tổng từng kỳ và tổng chương trình | Kỳ 1 → 2 | Kỳ 1 giảm 2.5, kỳ 2 tăng 2.5; tổng chương trình không đổi. | No | | | | Thủ công; tổng từng kỳ nằm ở MH-25, không lấy tổng mỗi dòng tự chọn làm tổng yêu cầu. |
| F08-TC_031 | Kiểm tra nhất quán (MH-27) | Tổng nhóm | Bổ sung | Kiểm tra nhóm chỉ đặt số học phần | R1; nhóm riêng hai thành viên 2.5 và 3 TC, tối thiểu một học phần | 1. Mở kiểm tra | minCourses=1 | “Tính vào tổng” là 2.5 TC theo thành viên rẻ nhất. | No | | | | Thủ công; implement report Lệch 8 và USER ACTIONS xác nhận D3. |
| F08-TC_032 | Kiểm tra nhất quán (MH-27) | Thông báo | NFR-16 | Kiểm tra tiếng Việt có dấu | R1; chương trình riêng tên có dấu | 1. Đọc tiêu đề, thẻ tín chỉ, cảnh báo và modal | Chương trình thử nghiệm tiếng Việt | Các nhãn “Tín chỉ”, “Chênh lệch”, “Lý do”, “Chạy lại” có dấu đúng. | No | | | | Thủ công; không yêu cầu dịch mã học phần. |
| F08-TC_033 | Kiểm tra nhất quán (MH-27) | Tải lại | Bổ sung | Kiểm tra Chạy lại sau thay đổi ở tab khác | R1; hai tab trên khung riêng | 1. Tab B thêm dòng 2.5; 2. Tab A bấm Chạy lại | Dòng riêng | Tổng và thời điểm “Kiểm tra lúc” cập nhật. | No | | | | Thủ công. |
| F08-TC_034 | Kiểm tra nhất quán (MH-27) | Phiên bản | Bổ sung | Kiểm tra không chấp nhận ở phiên bản đã ban hành | R1; phiên bản riêng đã ban hành có chấp nhận lịch sử | 1. Mở MH-27; 2. Thử ghi chấp nhận trực tiếp kèm header AJAX | Phiên bản không Nháp | Không có nút chấp nhận; máy chủ báo “Chỉ chấp nhận chênh lệch tín chỉ trên phiên bản nháp.” | No | | | | Thủ công; cần fixture riêng qua quy trình ban hành; không đổi trạng thái chương trình seed. |

## Ghi chú

- 34 ca: 13 tự động, 21 thủ công; không chạy trình duyệt trong đợt viết này.
- Không đổi seed để tái hiện KB-015/020: fixture trùng/vòng phải biệt lập; kiểm UI chặn vòng và checker phát hiện vòng là hai lớp khác nhau.
- Chấp nhận chỉ hạ cảnh báo chênh lệch thành Lưu ý, không xóa các lỗi khác; khung sạch phải không có cả Lưu ý kỳ trống/thiếu đề cương.
- R2/R3/R4/R5 đều có program.view toàn bộ theo seed; ngoài nhóm không bị từ chối đọc MH-27. R3 cần phân công trên chương trình riêng để chấp nhận; R4/R5 không được chấp nhận dù cùng nhóm.
- Không có lệch AC chưa được báo cáo xác nhận; các giới hạn tương tác ghi tại ca 019/020/031.
