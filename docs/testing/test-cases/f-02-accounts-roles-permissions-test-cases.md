# F-02 Tài khoản, vai trò, phạm vi quyền — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-004 (5 AC), US-005 (7 AC), US-006 (3 AC); tổng 15 AC |
| Màn hình | MH-05 `/users`; MH-06 `/users/:userId`; MH-15 `/permissions` |
| Vai trò/tài khoản | R1 admin; R2, R3/R3b, R4/R4b, R5/R5b, R6 theo `source/e2e/fixtures/accounts.ts`; R4/R5 KHMT, vai b CNPM. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | Giữ nguyên chín tài khoản demo, phiên và ma trận quyền. Không reset DB. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex ngẫu nhiên; username `e2e.<suffix>`; mã `E2EU<suffix>`; email `<username>@example.test`. Mỗi ca ghi tự tạo tài khoản riêng. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-004..006; `docs/planning/test-plan.md` §6.1 KB-009/054, §7.1 NT-B1-02/07, §9 EC-29/51; `docs/requirement/REQUIREMENTS.md` FR-06/07/10, EC-29/51, NFR-09/20. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-05/06/15; `docs/design/data-dictionary.md` §9; `docs/implementation/f-02-accounts-roles-permissions-implementation-plan.md` §1/§2c/D3/D7/§7; `docs/implement-report/f-02-accounts-roles-permissions-implement-report.md` Summary, Incident 3, Còn nợ. |
| Nguồn mã | `source/frontend/src/features/users/`, `features/permissions/`; `source/backend/src/features/users/`, `features/permissions/`, `features/auth/auth.errors.ts`; `source/backend/prisma/seed-data/permission-catalog.ts`, `roles.ts`, `demo/accounts.ts`. |
| Playwright spec | `source/e2e/specs/f-02-accounts-roles-permissions.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 22 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 35 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính mục Vai trò/Bao phủ.

| AC | TC |
|---|---|
| US-004 AC1 | F02-TC_001; F02-TC_002 |
| NT-B1-02 | F02-TC_001 |
| US-004 AC2 | F02-TC_003 |
| US-004 AC3 | F02-TC_005; F02-TC_006 |
| KB-009 | F02-TC_005; F02-TC_006 |
| EC-51 | F02-TC_005; F02-TC_006; F02-TC_010 |
| US-004 AC4 | F02-TC_007; F02-TC_008 |
| US-004 AC5 | F02-TC_009 |
| KB-054 | F02-TC_009; F02-TC_010 |
| EC-29 | F02-TC_009 |
| US-005 AC1 | F02-TC_028 |
| US-005 AC2 | F02-TC_029 |
| US-005 AC3 | F02-TC_030 |
| NT-B1-07 | F02-TC_030 |
| US-005 AC4 | F02-TC_031; F02-TC_032; F02-TC_033 |
| US-005 AC5 | F02-TC_034; F02-TC_035 |
| US-005 AC6 | F02-TC_036 |
| US-005 AC7 | F02-TC_037; F02-TC_038 |
| US-006 AC1 | F02-TC_039 |
| US-006 AC2 | F02-TC_040; F02-TC_041 |
| US-006 AC3 | F02-TC_042 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; để No và trống kết quả cho đến khi người dùng thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F02-TC_001 | Tài khoản (MH-05) | Thêm | US-004 AC1; NT-B1-02 | Kiểm tra tạo tài khoản hoạt động và mật khẩu tạm | R1 | 1. Thêm tài khoản; 2. Nhập mã, username, họ tên, email, đơn vị; 3. Đồng ý | e2e.<suffix>; E2EU<suffix> | Hiện “Mật khẩu tạm thời — <username>”; chi tiết ghi Hoạt động và Cần đổi khi đăng nhập | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_001 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_002 |  |  | US-004 AC1 | Kiểm tra đăng nhập tài khoản mới | Tài khoản riêng có mật khẩu tạm | 1. Đăng nhập cửa sổ riêng | Tài khoản riêng | Vào tài khoản của tôi; được yêu cầu đổi mật khẩu | No | | | |  |
| F02-TC_003 | Tài khoản (MH-05) | Trùng | US-004 AC2 | Kiểm tra trùng username | R1; tài khoản riêng vừa tạo | 1. Thêm tài khoản; 2. Dùng lại username, mã mới; 3. Đồng ý | Username riêng | Dưới Tên đăng nhập hiện “Tên đăng nhập đã được dùng.”; không tạo tài khoản mới | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_003 trong specs/f-02-accounts-roles-permissions.spec.ts. Form hiện message tiếng Việt của backend dưới trường trùng. |
| F02-TC_004 |  |  | Bổ sung | Kiểm tra trùng mã người dùng | R1; tài khoản riêng vừa tạo | 1. Thêm tài khoản; 2. Username mới, dùng lại mã; 3. Đồng ý | Mã riêng | Dưới Mã người dùng hiện “Mã người dùng đã được dùng.”; dialog không đóng | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_004 trong specs/f-02-accounts-roles-permissions.spec.ts. Form hiện message tiếng Việt của backend dưới trường trùng. |
| F02-TC_005 | Chi tiết (MH-06) | Lịch sử | US-004 AC3; KB-009; EC-51 | Kiểm tra không có xóa tài khoản | R1; tài khoản riêng | 1. Mở chi tiết | Tài khoản riêng | Không có nút Xóa; có Vô hiệu hóa | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_005 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_006 |  |  | US-004 AC3; KB-009; EC-51 | Kiểm tra vô hiệu hóa giữ tên lịch sử duyệt | R1; tài khoản riêng đã duyệt đề xuất riêng | 1. Vô hiệu hóa tài khoản riêng; 2. Mở lịch sử duyệt | Tài khoản riêng | Tên người đó còn trong lịch sử | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_007 | Chi tiết (MH-06) | Phiên | US-004 AC4 | Kiểm tra vô hiệu hóa buộc đăng nhập lại | R1; cửa sổ khác đang dùng tài khoản riêng | 1. Vô hiệu hóa tài khoản riêng; 2. Cửa sổ đó mở trang bảo vệ | Tài khoản riêng | Cửa sổ người dùng trở về đăng nhập | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_008 |  |  | US-004 AC4 | Kiểm tra chặn đăng nhập khi vô hiệu hóa | Tài khoản riêng vô hiệu hóa | 1. Đăng nhập với mật khẩu đúng | Tài khoản riêng | Hiện “Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Phòng Đào tạo.” | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_009 | Chi tiết (MH-06) | Quy trình | US-004 AC5; KB-054; EC-29 | Kiểm tra đề xuất tiếp tục khi người tạo vô hiệu hóa | R1; tài khoản riêng tạo đề xuất riêng đang cấp 2 | 1. Vô hiệu hóa người tạo; 2. Duyệt cấp 2 và 3 | Đề xuất riêng | Tới Đã duyệt; giữ tên người tạo kèm nhãn tài khoản đã vô hiệu hóa | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_010 |  |  | KB-054; EC-51 | Kiểm tra đề xuất tiếp tục khi người duyệt trước vô hiệu hóa | R1; tài khoản riêng đã duyệt cấp 1 đề xuất riêng | 1. Vô hiệu hóa người duyệt cấp 1; 2. Duyệt cấp 2 và 3 | Đề xuất riêng | Tới Đã duyệt; lịch sử giữ người duyệt cấp 1 | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_011 | Tài khoản (MH-05) | Kiểm dữ liệu | Bổ sung | Kiểm tra username bắt buộc | R1 | 1. Thêm tài khoản; 2. Để trống username; 3. Đồng ý | — | Hiện “Nhập tên đăng nhập” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_011 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_012 |  |  | Bổ sung | Kiểm tra username dưới 3 ký tự | R1 | 1. Thêm tài khoản; 2. Nhập username; 3. Đồng ý | ab | Hiện “Tên đăng nhập dài 3–64 ký tự” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_012 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_013 |  |  | Bổ sung | Kiểm tra username trên 64 ký tự | R1 | 1. Thêm tài khoản; 2. Nhập username; 3. Đồng ý | a lặp 65 lần | Hiện “Tên đăng nhập dài 3–64 ký tự” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_013 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_014 |  |  | Bổ sung | Kiểm tra username sai ký tự | R1 | 1. Thêm tài khoản; 2. Nhập username; 3. Đồng ý | giảng viên | Hiện “Chỉ dùng chữ không dấu, số và . _ -” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_014 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_015 |  |  | Bổ sung | Kiểm tra username 3 ký tự hợp lệ | R1; username 3 ký tự chưa tồn tại | 1. Nhập đủ dữ liệu hợp lệ; 2. Đồng ý | Ba chữ/số riêng | Hiện Mật khẩu tạm thời | No | | | |  |
| F02-TC_016 |  |  | Bổ sung | Kiểm tra username 64 ký tự hợp lệ | R1 | 1. Thêm tài khoản với username riêng 64 ký tự; 2. Đồng ý | Username 64 ký tự | Hiện Mật khẩu tạm thời | No | | | |  |
| F02-TC_017 |  |  | Bổ sung | Kiểm tra mã người dùng bắt buộc | R1 | 1. Thêm tài khoản; 2. Để trống mã; 3. Đồng ý | — | Hiện “Nhập mã người dùng” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_017 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_018 |  |  | Bổ sung | Kiểm tra họ tên bắt buộc | R1 | 1. Thêm tài khoản; 2. Để trống họ tên; 3. Đồng ý | — | Hiện “Nhập họ tên” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_018 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_019 |  |  | Bổ sung | Kiểm tra email sai định dạng | R1 | 1. Thêm tài khoản; 2. Nhập email; 3. Đồng ý | not-an-email | Hiện “Email không hợp lệ” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_019 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_020 |  |  | Bổ sung | Kiểm tra mã người dùng 33 ký tự | R1 | 1. Nhập mã 33 ký tự; 2. Đồng ý | U lặp 33 lần | Form báo lỗi độ dài tại Mã người dùng; không lưu | No | | | |  |
| F02-TC_021 |  |  | Bổ sung | Kiểm tra họ tên 201 ký tự | R1 | 1. Nhập họ tên 201 ký tự; 2. Đồng ý | Tên 201 ký tự | Form báo lỗi độ dài tại Họ tên; không lưu | No | | | |  |
| F02-TC_022 |  |  | Bổ sung | Kiểm tra chấp nhận mã 32 và tên 200 ký tự | R1 | 1. Nhập đủ dữ liệu tại biên; 2. Đồng ý | Mã riêng 32; tên 200 ký tự | Hiện Mật khẩu tạm thời | No | | | |  |
| F02-TC_023 |  |  | Bổ sung | Kiểm tra email vượt 254 ký tự | R1 | 1. POST /api/users với email đúng dạng dài 255 ký tự | Username và mã riêng | HTTP 400; lỗi validation email; không tạo tài khoản | No | | | |  |
| F02-TC_024 | Tài khoản (MH-05) | Tra cứu | Bổ sung | Kiểm tra tìm không có kết quả | R1 | 1. Nhập từ khóa riêng; 2. Enter | NO<suffix> | Hiện “Chưa có tài khoản” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_024 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_025 | Chi tiết (MH-06) | Sửa | Bổ sung | Kiểm tra đổi họ tên tài khoản riêng | R1; tài khoản riêng | 1. Sửa; 2. Đổi Họ tên; 3. Đồng ý | Tên đổi <suffix> | Chi tiết hiện họ tên mới; username không đổi | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_025 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_026 |  |  | Bổ sung | Kiểm tra vô hiệu hóa tài khoản riêng | R1; tài khoản riêng Hoạt động | 1. Vô hiệu hóa; 2. Đồng ý | Tài khoản riêng | Hiện Vô hiệu hóa và nút Kích hoạt lại | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_026 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_027 |  |  | Bổ sung | Kiểm tra kích hoạt lại tài khoản riêng | R1; tự tạo rồi vô hiệu hóa tài khoản riêng | 1. Kích hoạt lại; 2. Xác nhận | Tài khoản riêng | Trạng thái Hoạt động | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_028 | Vai trò (MH-06) | Nhiều vai | US-005 AC1 | Kiểm tra hợp quyền hai vai có phạm vi riêng | R1; tài khoản riêng là thành viên nhóm riêng | 1. Gán thêm R2 khoa riêng; 2. Đăng nhập tài khoản riêng | R5 suy ra, R2 Đơn vị | Có quyền cả hai vai trong phạm vi từng vai | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_029 |  |  | US-005 AC2 | Kiểm tra vai hết hạn không còn quyền | R1; tài khoản riêng chỉ có R2 hết hôm qua | 1. Đăng nhập tài khoản riêng; 2. Thử xem nhóm | Kết thúc hôm qua | Không còn quyền R2; thao tác cần R2 bị từ chối | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_030 | Vai trò (MH-06) | Phân quyền | US-005 AC3; NT-B1-07 | Kiểm tra R5 gọi thẳng quản trị bị từ chối | R5 | 1. POST /api/users; 2. R1 tìm username đó | e2e.denied.<suffix> | HTTP 403 PERMISSION_DENIED, “Bạn không có quyền thực hiện thao tác này.”; R1 tìm không thấy tài khoản đó | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_030 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_031 | Vai trò (MH-06) | Phạm vi | US-005 AC4 | Kiểm tra gán Toàn hệ thống | R1; tài khoản riêng | 1. Gán vai trò; 2. Chọn R2, Toàn hệ thống; 3. Đồng ý | R2 | Bảng có R2 và Toàn hệ thống | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_031 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_032 |  |  | US-005 AC4 | Kiểm tra gán Đơn vị | R1; tài khoản riêng | 1. Gán R2; 2. Chọn Đơn vị, khoa; 3. Đồng ý | Khoa Công nghệ Thông tin | Hiện “Đơn vị: Khoa Công nghệ Thông tin” | No | | | |  |
| F02-TC_033 |  |  | US-005 AC4 | Kiểm tra Theo phân công chỉ suy ra từ thành viên | R1; tài khoản riêng thuộc nhóm riêng | 1. Xem vai trò; 2. Mở Gán vai trò | R5 suy ra | Dòng R5 ghi Theo phân công; form chỉ có Toàn hệ thống, Đơn vị và không gán tay R3–R6 | No | | | | Lệch US-005 AC4: ASSIGNMENT chỉ suy ra. Kế hoạch §1/§2c D3; báo cáo Summary BE-04..BE-08, FE-05..FE-07. |
| F02-TC_034 | Ma trận (MH-15) | Hiệu lực | US-005 AC5 | Kiểm tra quyền xem không suy thành quyền quản trị | R2 | 1. Mở /courses; 2. POST /api/users | Username mới riêng | Danh mục mở được; POST trả 403 | No | | | |  |
| F02-TC_035 |  |  | US-005 AC5 | Kiểm tra gỡ ô làm mất quyền tương ứng | R1; chỉ môi trường kiểm riêng | 1. Gỡ R2 × course.view; 2. R2 mở danh mục; 3. Khôi phục ô | R2 | R2 bị từ chối quyền xem học phần | No | | | | Thủ công: ma trận toàn cục dùng chung; không sửa trong suite. |
| F02-TC_036 | Vai trò (MH-06) | Phạm vi | US-005 AC6 | Kiểm tra R4 không xem nhóm ngoài phạm vi | R4 KHMT; R1 lấy trước URL CNPM | 1. Mở KHMT; 2. Mở URL CNPM | KHMT/CNPM | KHMT xem được; CNPM hiện “Nhóm này nằm ngoài phạm vi của bạn” | No | | | |  |
| F02-TC_037 | Ma trận (MH-15) | Tra cứu | US-005 AC7 | Kiểm tra R1 thấy mọi vai trò và quyền | R1 | 1. Mở /permissions | R1..R6 | Hiện Ma trận quyền, sáu cột vai trò và mã quyền | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_037 trong specs/f-02-accounts-roles-permissions.spec.ts. Lệch US-005 AC7: R1 sửa ô không khóa theo F02-02 A. Kế hoạch §1/§2c; báo cáo Incident 3, Summary FE-08 (không có mục Lệch kế hoạch riêng). |
| F02-TC_038 |  |  | US-005 AC7 | Kiểm tra mở xác nhận thay đổi ô không khóa | R1; chỉ môi trường kiểm riêng | 1. Mở ô không khóa; 2. Chọn chế độ | R2 × course.view | Hiện “Xác nhận thay đổi quyền” và “Thay đổi có hiệu lực ngay.” | No | | | | Thủ công: ma trận toàn cục dùng chung; không sửa trong suite. Lệch US-005 AC7: R1 sửa ô không khóa theo F02-02 A. Kế hoạch §1/§2c; báo cáo Incident 3, Summary FE-08 (không có mục Lệch kế hoạch riêng). |
| F02-TC_039 | Vai trò (MH-06) | Lịch sử | US-006 AC1 | Kiểm tra lưu người gán và thời hạn | R1; tài khoản riêng | 1. Gán R2 có thời hạn; 2. Xem bảng | Hôm nay tới ngày mai | Dòng mới có Vai trò, Phạm vi, Thời hạn, Người gán | No | | | | Lệch US-006 AC1: lịch sử domain MH-06 thay nhật ký AuditLog. Kế hoạch §1/§2c D7; báo cáo Summary BE-04..BE-08, FE-05..FE-07. |
| F02-TC_040 |  |  | US-006 AC2 | Kiểm tra thu hồi giữ lịch sử | R1; tài khoản riêng có R2 riêng | 1. Thu hồi; 2. Xác nhận | R2 riêng | Dòng còn, trạng thái Đã thu hồi, có Người thu hồi | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. Lệch US-006 AC2: xem dòng đã thu hồi thay bảng diff trước/sau; kế hoạch D7/§2c, báo cáo Summary FE-05..FE-07. |
| F02-TC_041 |  |  | US-006 AC2 | Kiểm tra đổi phạm vi bằng thu hồi rồi gán mới | R1; tài khoản riêng có vai trò tay | 1. Thu hồi cũ; 2. Gán mới khác phạm vi | Đơn vị sang Toàn hệ thống | Giữ cả hai dòng với hai phạm vi | No | | | | Lệch US-006 AC2: thu hồi rồi gán mới thay bảng diff. Kế hoạch D7/§2c; báo cáo Summary BE-04..BE-08, FE-05..FE-07. |
| F02-TC_042 |  |  | US-006 AC3 | Kiểm tra xem lịch sử theo tài khoản | R1; tài khoản riêng có dòng cũ và mới | 1. Tìm tài khoản; 2. Mở chi tiết | Tài khoản riêng | Bảng Vai trò và phạm vi hiển thị toàn bộ dòng gán/thu hồi của người đó | No | | | | Lệch US-006 AC3: dùng MH-06 thay lọc nhật ký phân quyền. Kế hoạch §1/§2c FE-07; báo cáo Summary FE-05..FE-07. |
| F02-TC_043 | Vai trò (MH-06) | Kiểm dữ liệu | Bổ sung | Kiểm tra vai trò bắt buộc | R1; tài khoản riêng | 1. Gán vai trò; 2. Không chọn vai; 3. Đồng ý | — | Hiện “Chọn vai trò” | No | | | |  |
| F02-TC_044 |  |  | Bổ sung | Kiểm tra Đơn vị phải chọn đơn vị | R1; tài khoản riêng | 1. Chọn R2, Đơn vị; 2. Không chọn đơn vị; 3. Đồng ý | — | Hiện “Chọn đơn vị” | No | | | |  |
| F02-TC_045 |  |  | Bổ sung | Kiểm tra ngày kết thúc trước ngày bắt đầu | R1; tài khoản riêng | 1. Gán vai kết thúc trước bắt đầu; 2. Đồng ý | Hôm qua/hôm nay | Hiện “Ngày kết thúc không trước ngày bắt đầu” | No | | | |  |
| F02-TC_046 |  |  | Bổ sung | Kiểm tra vai trùng phạm vi chồng thời hạn | R1; tài khoản riêng có R2 hiệu lực | 1. Gán lại R2 cùng phạm vi, thời hạn | R2 Toàn hệ thống | Hiện “Người dùng đã có vai trò này với cùng phạm vi trong khoảng thời gian đó.” | No | | | | Thủ công: cần tài khoản, phiên, đề xuất hoặc phân công riêng; không thay trạng thái, vai trò, phạm vi hay nhóm tài khoản demo dùng chung. |
| F02-TC_047 | Tài khoản (MH-05) | Phân quyền | Bổ sung | Kiểm tra R2 không quản lý tài khoản | R2 | 1. Mở /users | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_047 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_048 |  |  | Bổ sung | Kiểm tra R3 không quản lý tài khoản | R3 | 1. Mở /users | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_048 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_049 |  |  | Bổ sung | Kiểm tra R4 không quản lý tài khoản | R4 | 1. Mở /users | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_049 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_050 |  |  | Bổ sung | Kiểm tra R5 không quản lý tài khoản | R5 | 1. Mở /users | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_050 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_051 |  |  | Bổ sung | Kiểm tra R6 không quản lý tài khoản | R6 | 1. Mở /users | — | Hiện “Bạn không có quyền truy cập trang này” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F02-TC_051 trong specs/f-02-accounts-roles-permissions.spec.ts. |
| F02-TC_052 | Ma trận (MH-15) | Phân quyền | Bổ sung | Kiểm tra R2 không xem ma trận | R2 | 1. Mở /permissions | — | Hiện “Bạn không có quyền truy cập trang này” | No | | | |  |
| F02-TC_053 |  |  | Bổ sung | Kiểm tra R3 không xem ma trận | R3 | 1. Mở /permissions | — | Hiện “Bạn không có quyền truy cập trang này” | No | | | |  |
| F02-TC_054 |  |  | Bổ sung | Kiểm tra R4 không xem ma trận | R4 | 1. Mở /permissions | — | Hiện “Bạn không có quyền truy cập trang này” | No | | | |  |
| F02-TC_055 |  |  | Bổ sung | Kiểm tra R5 không xem ma trận | R5 | 1. Mở /permissions | — | Hiện “Bạn không có quyền truy cập trang này” | No | | | |  |
| F02-TC_056 |  |  | Bổ sung | Kiểm tra R6 không xem ma trận | R6 | 1. Mở /permissions | — | Hiện “Bạn không có quyền truy cập trang này” | No | | | |  |
| F02-TC_057 | Vai trò (MH-06) | Rỗng | Bổ sung | Kiểm tra tài khoản mới chưa có vai | R1; tài khoản riêng mới tạo | 1. Mở chi tiết; 2. Xem bảng vai trò | Tài khoản riêng | Bảng chưa có dòng | No | | | |  |

## Ghi chú

- Mã thắng AC: Theo phân công chỉ suy ra; ma trận R1 sửa được theo F02-02 A; lịch sử quyền dùng domain MH-06 theo D7, không giả định AuditLog. Kế hoạch ghi rõ quyết định; báo cáo Summary ghi các phần triển khai, Incident 3 ghi thao tác thay ô ma trận; không có mục Lệch kế hoạch riêng.
- Ca 003 và 004 từng khẳng định form hiện mã constraint “unique” thay message tiếng Việt của backend; đó là lỗi của `UserFormModal.tsx`, đã sửa ngày 10/21/26 (`docs/troubleshooting/error_log.md`). Expected Result nay trích message thật.
- Ca lịch sử duyệt/người tạo vô hiệu hóa cần đề xuất và tài khoản riêng; không làm mất phiên hoặc đổi phạm vi demo. Ca ma trận giữ thủ công trên môi trường kiểm riêng vì ảnh hưởng quyền toàn suite.
- Mật khẩu tạm chỉ xem trong cửa sổ riêng khi kiểm tay, không đưa vào log/báo cáo. Biên username 3 ký tự kiểm tay với giá trị chưa tồn tại để tránh trùng sau nhiều lần chạy.
- Yêu cầu ghi HTTP trực tiếp dùng phiên người đang kiểm và header `X-Requested-With: XMLHttpRequest`; phân biệt lỗi quyền với `CSRF_HEADER_MISSING`.
