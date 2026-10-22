# F-03 Đơn vị và nhóm chuyên môn — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-007 (3 AC), US-008 (3 AC), US-009 (3 AC), US-010 (3 AC); tổng 12 AC |
| Màn hình | MH-07 Cây đơn vị `/org-units`; MH-08 Nhóm chuyên môn `/subject-groups`, `/subject-groups/:groupId`; liên thông MH-18 |
| Vai trò/tài khoản | R1, R2, R3, R3b, R4 (KHMT), R4b (CNPM), R5 (KHMT), R5b (CNPM), R6 theo `source/e2e/fixtures/accounts.ts`. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi seed demo. |
| Dữ liệu demo | Trường, Khoa Công nghệ thông tin, Phòng Đào tạo, Khoa Khoa học cơ bản; KHMT/CNPM/HTTT/MMT. Không sửa seed hoặc tài khoản demo. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex ngẫu nhiên mỗi lần; mã `E2EU<suffix>`, `E2EG<suffix>` dưới 32 ký tự. Thành viên/điều phối chỉ dùng tài khoản riêng. Không reset DB. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-007..010; `docs/planning/test-plan.md` §7.1 NT-B1-01/02; `docs/requirement/REQUIREMENTS.md` FR-01..04. Không có KB/EC riêng cho US-007..010; KB-009 trong NT-B1-02 thuộc US-004, truy vết ở F-02. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-07/08; `docs/design/data-dictionary.md` §9; `docs/implementation/f-03-org-units-subject-groups-implementation-plan.md` §7–8; `docs/implement-report/f-03-org-units-subject-groups-implement-report.md` Lệch kế hoạch và còn nợ. |
| Nguồn mã | `source/frontend/src/features/org-units/`, `features/subject-groups/`, `shared/org-units/OrgUnitSelect.tsx`; `source/backend/src/features/org-units/`, `features/subject-groups/`, `shared/subject-groups/`; `source/backend/prisma/seed-data/permission-catalog.ts`, `demo/accounts.ts`, `demo/catalog.ts`. |
| Playwright spec | `source/e2e/specs/f-03-org-units-subject-groups.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 20 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 27 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính các mục Vai trò/Bao phủ.

| AC | TC |
|---|---|
| US-007 AC1 | F03-TC_001 |
| US-008 AC1 | F03-TC_001; F03-TC_014 |
| NT-B1-01 | F03-TC_001 |
| US-007 AC2 | F03-TC_002; F03-TC_003 |
| US-007 AC3 | F03-TC_004 |
| US-008 AC2 | F03-TC_015 |
| US-008 AC3 | F03-TC_016; F03-TC_017 |
| US-009 AC1 | F03-TC_027 |
| NT-B1-02 | F03-TC_027; F03-TC_031 |
| US-009 AC2 | F03-TC_028 |
| US-009 AC3 | F03-TC_029 |
| US-010 AC1 | F03-TC_031 |
| US-010 AC2 | F03-TC_032 |
| US-010 AC3 | F03-TC_033 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; để No và trống kết quả cho đến khi người dùng thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F03-TC_001 | Cây đơn vị (MH-07) | Tra cứu | US-007 AC1; US-008 AC1; NT-B1-01 | Kiểm tra cây có Trường, Khoa và bốn nhóm | R1; seed nền và demo | 1. Mở /org-units; 2. Xem cây mở rộng | KHMT, CNPM, HTTT, MMT | Thấy Trường, Khoa Công nghệ Thông tin và bốn liên kết nhóm dưới Khoa | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_001 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_002 | Cây đơn vị (MH-07) | Thêm khoa | US-007 AC2 | Kiểm tra thêm khoa mới dưới Trường | R1 | 1. Bấm Thêm đơn vị; 2. Nhập mã, tên; 3. Giữ loại Khoa và cấp trên Trường; 4. Đồng ý | E2EU<suffix>; Khoa thử <suffix> | Dialog đóng; khoa mới hiện trong cây | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_002 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_003 | Cây đơn vị (MH-07) | Liên thông | US-007 AC2 | Kiểm tra khoa mới chọn được khi thêm học phần | R1; khoa riêng vừa tạo đang hoạt động | 1. Mở /courses/new; 2. Mở Khoa phụ trách; 3. Chọn khoa riêng | Khoa thử <suffix> | Ô Khoa phụ trách hiện tên khoa mới | No | | | |  |
| F03-TC_004 | Cây đơn vị (MH-07) | Ngừng hoạt động | US-007 AC3 | Kiểm tra ngừng khoa riêng không xóa bản ghi | R1; khoa riêng có tài khoản riêng, không có con/nhóm hoạt động | 1. Chọn khoa riêng; 2. Ngừng hoạt động; 3. Xác nhận; 4. Tải lại và chọn khoa | Khoa thử <suffix> | Hiện Ngừng hoạt động; vẫn xem được mã và tên; không có nút Xóa | No | | | |  |
| F03-TC_005 | Cây đơn vị (MH-07) | Kiểm dữ liệu | Bổ sung | Kiểm tra mã đơn vị bắt buộc | R1 | 1. Thêm đơn vị; 2. Để trống mã; 3. Đồng ý | — | Hiện “Nhập mã đơn vị” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_005 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_006 |  |  | Bổ sung | Kiểm tra mã đơn vị vượt 32 ký tự | R1 | 1. Thêm đơn vị; 2. Nhập mã 33 ký tự; 3. Đồng ý | U lặp 33 lần | Hiện “Mã đơn vị tối đa 32 ký tự” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_006 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_007 |  |  | Bổ sung | Kiểm tra mã đơn vị chứa ký tự không hợp lệ | R1 | 1. Thêm đơn vị; 2. Nhập mã; 3. Đồng ý | KHOA-THỬ | Hiện “Chỉ dùng chữ không dấu, số và dấu gạch dưới” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_007 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_008 |  |  | Bổ sung | Kiểm tra trùng mã đơn vị riêng | R1; tạo một khoa riêng | 1. Thêm đơn vị; 2. Dùng lại mã vừa tạo, tên khác; 3. Đồng ý | E2EU<suffix> | Hiện “Mã đơn vị đã tồn tại.”; dialog vẫn mở | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_008 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_009 |  |  | Bổ sung | Kiểm tra tên đơn vị bắt buộc | R1 | 1. Thêm đơn vị; 2. Để trống tên; 3. Đồng ý | — | Hiện “Nhập tên đơn vị” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_009 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_010 |  |  | Bổ sung | Kiểm tra chấp nhận biên mã 32 và tên 200 ký tự | R1 | 1. Thêm đơn vị; 2. Nhập đủ các trường; 3. Đồng ý | Mã 32 ký tự riêng; tên 200 ký tự | Dialog đóng; đơn vị hiện trong cây | No | | | |  |
| F03-TC_011 |  |  | Bổ sung | Kiểm tra từ chối tên đơn vị 201 ký tự | R1 | 1. Thêm đơn vị; 2. Nhập tên 201 ký tự; 3. Đồng ý | Tên 201 ký tự | Form báo lỗi độ dài tại Tên đơn vị; dialog không đóng | No | | | |  |
| F03-TC_012 | Cây đơn vị (MH-07) | Ràng buộc | Bổ sung | Kiểm tra chặn ngừng khoa còn nhóm hoạt động | R1; khoa và nhóm đều tự tạo | 1. Chọn khoa riêng; 2. Ngừng hoạt động; 3. Xác nhận | Khoa thử <suffix> | Hiện “Đơn vị còn nhóm chuyên môn đang sử dụng.” | No | | | |  |
| F03-TC_013 |  |  | Bổ sung | Kiểm tra chặn di chuyển đơn vị thành vòng | R1; đơn vị riêng | 1. Gửi yêu cầu đổi đơn vị cha thành chính nó | ID đơn vị riêng | HTTP 400; “Không thể đặt đơn vị cha là chính nó hoặc đơn vị cấp dưới của nó.” | No | | | |  |
| F03-TC_014 | Nhóm chuyên môn (MH-08) | Thêm nhóm | US-008 AC1 | Kiểm tra thêm nhóm riêng dưới Khoa CNTT | R1 | 1. Mở /subject-groups; 2. Thêm nhóm; 3. Nhập mã, tên, chọn Khoa; 4. Đồng ý | E2EG<suffix>; Nhóm thử <suffix> | Dialog đóng; nhóm mới xuất hiện trong danh sách | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_014 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_015 |  |  | US-008 AC2 | Kiểm tra trùng mã nhóm riêng | R1; một nhóm riêng đã tạo | 1. Thêm nhóm; 2. Nhập lại mã, tên khác, chọn Khoa; 3. Đồng ý | Mã nhóm riêng | Hiện “Mã nhóm chuyên môn đã tồn tại.” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_015 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_016 | Nhóm chuyên môn (MH-08) | Ngừng sử dụng | US-008 AC3 | Kiểm tra hiện học phần ảnh hưởng trước khi ngừng nhóm | R1; nhóm riêng có học phần riêng | 1. Bấm Ngừng sử dụng tại nhóm riêng | Học phần thử <suffix> | Dialog “Ngừng sử dụng nhóm” liệt kê mã và tên học phần; có nút Ngừng sử dụng | No | | | |  |
| F03-TC_017 |  |  | US-008 AC3 | Kiểm tra xác nhận ngừng nhóm riêng | R1; nhóm riêng, không sửa seed | 1. Ngừng sử dụng nhóm riêng; 2. Xác nhận | Nhóm thử <suffix> | Nhóm còn trong danh sách với trạng thái Ngừng sử dụng | No | | | |  |
| F03-TC_018 |  |  | Bổ sung | Kiểm tra hủy ngừng nhóm riêng | R1; nhóm riêng đang sử dụng | 1. Ngừng sử dụng; 2. Hủy | Nhóm thử <suffix> | Dialog đóng; nhóm vẫn Đang sử dụng | No | | | |  |
| F03-TC_019 | Nhóm chuyên môn (MH-08) | Kiểm dữ liệu | Bổ sung | Kiểm tra mã nhóm bắt buộc | R1 | 1. Thêm nhóm; 2. Để trống mã; 3. Đồng ý | — | Hiện “Nhập mã nhóm” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_019 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_020 |  |  | Bổ sung | Kiểm tra mã nhóm vượt 32 ký tự | R1 | 1. Thêm nhóm; 2. Nhập mã 33 ký tự; 3. Đồng ý | G lặp 33 lần | Hiện “Mã nhóm tối đa 32 ký tự” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_020 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_021 |  |  | Bổ sung | Kiểm tra mã nhóm sai ký tự | R1 | 1. Thêm nhóm; 2. Nhập mã; 3. Đồng ý | NHÓM-1 | Hiện “Chỉ dùng chữ không dấu, số và dấu gạch dưới” | No | | | |  |
| F03-TC_022 |  |  | Bổ sung | Kiểm tra tên nhóm bắt buộc | R1 | 1. Thêm nhóm; 2. Để trống tên; 3. Đồng ý | — | Hiện “Nhập tên nhóm” | No | | | |  |
| F03-TC_023 |  |  | Bổ sung | Kiểm tra Khoa bắt buộc | R1 | 1. Thêm nhóm; 2. Nhập mã, tên; 3. Không chọn Khoa; 4. Đồng ý | E2EG<suffix> | Hiện “Chọn khoa” | No | | | |  |
| F03-TC_024 |  |  | Bổ sung | Kiểm tra chấp nhận mã nhóm 32 và tên 200 ký tự | R1 | 1. Thêm nhóm; 2. Nhập dữ liệu hợp lệ tại biên; 3. Đồng ý | Mã 32 ký tự riêng; tên 200 ký tự | Dialog đóng; nhóm xuất hiện trong danh sách | No | | | |  |
| F03-TC_025 |  |  | Bổ sung | Kiểm tra từ chối tên nhóm 201 ký tự | R1 | 1. Thêm nhóm; 2. Nhập tên 201 ký tự; 3. Đồng ý | Tên 201 ký tự | Form báo lỗi độ dài tại Tên nhóm; dialog không đóng | No | | | |  |
| F03-TC_026 | Nhóm chuyên môn (MH-08) | Rỗng | Bổ sung | Kiểm tra lọc khoa không có nhóm | R1; khoa riêng chưa có nhóm | 1. Chọn khoa riêng ở bộ lọc | Khoa thử <suffix> | Hiện “Chưa có nhóm chuyên môn” | No | | | |  |
| F03-TC_027 | Chi tiết nhóm (MH-08) | Thành viên | US-009 AC1; NT-B1-02 | Kiểm tra gán tài khoản riêng vào hai nhóm riêng | R1; tài khoản giảng viên riêng, hai nhóm riêng, học phần riêng trong mỗi nhóm | 1. Thêm thành viên vào mỗi nhóm; 2. Đăng nhập tài khoản riêng; 3. Mở học phần từng nhóm | Ngày bắt đầu hôm nay | Cả hai nhóm có dòng thành viên; tài khoản riêng thao tác đúng quyền trên học phần cả hai nhóm | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_028 |  |  | US-009 AC2 | Kiểm tra kết thúc phạm vi nhưng giữ lịch sử thành viên | R1; tài khoản và nhóm riêng; dòng thành viên hết hạn | 1. Mở chi tiết nhóm; 2. Bật Hiện cả dòng đã hết hạn/thu hồi; 3. Đăng nhập tài khoản riêng, thử sửa học phần nhóm | Ngày kết thúc hôm qua | Dòng hết hạn còn trong lịch sử; thao tác ngoài phạm vi bị từ chối | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_029 |  |  | US-009 AC3 | Kiểm tra chặn thành viên trùng thời gian | R1; tài khoản riêng có dòng thành viên đang hiệu lực ở nhóm riêng | 1. Thêm cùng giảng viên vào cùng nhóm và thời gian; 2. Đồng ý | Ngày bắt đầu hôm nay | Hiện “Người này đã có vai trò này trong nhóm trong khoảng thời gian đó.” | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_030 |  |  | Bổ sung | Kiểm tra chặn ngày kết thúc trước bắt đầu | R1; nhóm riêng | 1. Thêm thành viên; 2. Chọn ngày kết thúc trước bắt đầu; 3. Đồng ý | Bắt đầu hôm nay; kết thúc hôm qua | Hiện “Ngày kết thúc không được trước ngày bắt đầu” | No | | | |  |
| F03-TC_031 | Chi tiết nhóm (MH-08) | Điều phối | US-010 AC1; NT-B1-02 | Kiểm tra chỉ định điều phối có thời hạn | R1; tài khoản riêng đã là thành viên nhóm riêng suốt thời hạn | 1. Chỉ định Điều phối; 2. Chọn thành viên và thời hạn; 3. Đồng ý | Hôm nay đến ngày mai | Tên người riêng hiện ở phần Điều phối; trong thời hạn có quyền cấp 1 của nhóm | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_032 |  |  | US-010 AC2 | Kiểm tra điều phối hết hạn không còn phạm vi điều phối | R1; tài khoản riêng còn dòng MEMBER hiệu lực, COORDINATOR hết hạn, không có người thay | 1. Mở nhóm; 2. Bật lịch sử; 3. Kiểm tra quyền điều phối bằng tài khoản riêng | Kết thúc hôm qua | Hiện “Chưa có Điều phối”; thành viên thường vẫn còn; quyền điều phối không còn | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_033 |  |  | US-010 AC3 | Kiểm tra không chọn được người ngoài nhóm làm điều phối | R1; nhóm riêng chưa có thành viên | 1. Chỉ định Điều phối; 2. Mở ô Giảng viên | Tài khoản riêng chưa thuộc nhóm | Không có người ngoài nhóm trong danh sách “Chỉ chọn được thành viên của nhóm”; không thể lưu khi chưa chọn | No | | | |  |
| F03-TC_034 |  |  | Bổ sung | Kiểm tra chặn thời hạn điều phối vượt thời hạn thành viên | R1; thành viên riêng kết thúc hôm nay | 1. Chỉ định Điều phối đến ngày mai; 2. Đồng ý | Ngày mai | Hiện “Hãy gán người này làm thành viên của nhóm trong suốt khoảng thời gian trước khi chỉ định Điều phối.” | No | | | | Thủ công: cần tài khoản và nhóm riêng; không đổi thành viên, điều phối hoặc phạm vi tài khoản demo dùng chung. |
| F03-TC_035 | Chi tiết nhóm (MH-08) | Rỗng | Bổ sung | Kiểm tra nhóm riêng chưa có điều phối | R1; tạo nhóm riêng | 1. Mở chi tiết nhóm vừa tạo | Nhóm thử <suffix> | Hiện “Chưa có Điều phối”; bảng thành viên chưa có dòng | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_035 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_036 | Cây đơn vị (MH-07) | Phân quyền | Bổ sung | Kiểm tra R2 không được quản lý cây | R2 | 1. Mở /org-units | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_036 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_037 |  |  | Bổ sung | Kiểm tra R3 không được quản lý cây | R3 | 1. Mở /org-units | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_037 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_038 |  |  | Bổ sung | Kiểm tra R4 không được quản lý cây | R4 | 1. Mở /org-units | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_038 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_039 |  |  | Bổ sung | Kiểm tra R5 không được quản lý cây | R5 | 1. Mở /org-units | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_039 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_040 |  |  | Bổ sung | Kiểm tra R6 không được quản lý cây | R6 | 1. Mở /org-units | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_040 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_041 | Nhóm chuyên môn (MH-08) | Phân quyền | Bổ sung | Kiểm tra R2 chỉ xem không thêm sửa nhóm | R2; phạm vi Khoa CNTT | 1. Mở /subject-groups | — | Thấy nhóm thuộc khoa; không có nút Thêm nhóm hoặc Sửa | No | | | |  |
| F03-TC_042 |  |  | Bổ sung | Kiểm tra R4 chỉ xem nhóm mình điều phối | R4; KHMT | 1. Mở /subject-groups; 2. Mở URL chi tiết CNPM lấy trước bằng R1 | CNPM | Không có CNPM trong danh sách; chi tiết hiện “Nhóm này nằm ngoài phạm vi của bạn” | No | | | |  |
| F03-TC_043 |  |  | Bổ sung | Kiểm tra R3 không vào quản lý nhóm | R3 | 1. Mở /subject-groups | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_043 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_044 |  |  | Bổ sung | Kiểm tra R5 không vào quản lý nhóm | R5 | 1. Mở /subject-groups | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_044 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_045 |  |  | Bổ sung | Kiểm tra R6 không vào quản lý nhóm | R6 | 1. Mở /subject-groups | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F03-TC_045 trong specs/f-03-org-units-subject-groups.spec.ts. |
| F03-TC_046 | Nhóm chuyên môn (MH-08) | Sửa | Bổ sung | Kiểm tra đổi tên nhóm riêng | R1; nhóm riêng | 1. Bấm Sửa; 2. Đổi Tên nhóm; 3. Đồng ý | Nhóm đổi tên <suffix> | Tên mới xuất hiện; mã nhóm không đổi | No | | | |  |
| F03-TC_047 | Cây đơn vị (MH-07) | Sửa | Bổ sung | Kiểm tra đổi tên khoa riêng | R1; khoa riêng | 1. Chọn khoa; 2. Sửa; 3. Đổi tên; 4. Đồng ý | Khoa đổi tên <suffix> | Tên mới xuất hiện trong cây; mã không đổi | No | | | |  |

## Ghi chú

- R2 và R4 đã xem được nhóm theo seed hiện hành; không áp giới hạn B4 cũ của screen inventory. Nguồn: kế hoạch §8 và báo cáo Hiệu lực lúc chạy.
- Báo cáo cũ chưa có seed nhóm; demo hiện hành đã có bốn nhóm. Không tạo trùng/sửa bốn nhóm đó.
- Thành viên, điều phối và hết hạn giữ thủ công với tài khoản/nhóm riêng; tuyệt đối không đổi phạm vi tài khoản demo. Phạm vi cấp duyệt được kiểm ở mức quyền hiện hành; không giả lập cả quy trình duyệt trong feature này.
- Rỗng kiểm bằng khoa/nhóm riêng; không xóa dữ liệu toàn hệ thống. Không có ca nghi lỗi.
- Yêu cầu ghi HTTP trực tiếp dùng phiên người đang kiểm và header `X-Requested-With: XMLHttpRequest`; không coi lỗi CSRF là kiểm thành công ràng buộc hoặc phân quyền.
