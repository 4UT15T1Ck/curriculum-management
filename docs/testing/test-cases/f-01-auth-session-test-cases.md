# F-01 Đăng nhập, phiên — Test Cases

| Mục | Nội dung |
|---|---|
| User stories | US-001 (5 AC); tổng 5 AC |
| Màn hình | MH-01 `/login`; MH-02 `/`; MH-03 `/account` |
| Vai trò/tài khoản | R1 admin; R2, R3/R3b, R4/R4b, R5/R5b, R6 theo `source/e2e/fixtures/accounts.ts`. |
| Môi trường | Frontend `http://localhost:5173`, proxy `/api` tới backend `http://localhost:3000`; seed nền rồi demo. |
| Dữ liệu demo | Chỉ đọc danh tính bằng phiên đã lưu; không gửi mật khẩu sai, đổi mật khẩu hoặc đăng xuất phiên demo. |
| Dữ liệu tự tạo | `<suffix>` là 16 ký tự hex ngẫu nhiên; tài khoản `e2e.<suffix>` do R1 tạo, lấy mật khẩu một lần từ dialog. Mỗi ca tự tạo tài khoản, đăng nhập trong context mới không có storageState. |
| Nguồn nghiệp vụ | `docs/planning/user-stories.md` US-001; `docs/planning/test-plan.md` §7.1 NT-B1-01, §8 NFR-06/07/08; `docs/requirement/REQUIREMENTS.md` NFR-06/07/08, Q-13, L-1. |
| Nguồn thiết kế/triển khai | `docs/design/screen-inventory.md` MH-01/02/03; `docs/design/data-dictionary.md` §9; `docs/implementation/f-01-auth-session-implementation-plan.md` §7/§8; `docs/implement-report/f-01-auth-session-implement-report.md` Summary, Deviations, Status. |
| Nguồn mã | `source/frontend/src/features/auth/`, `shared/auth/RequireAuth.tsx`, `shared/layout/AppLayout.tsx`; `source/backend/src/features/auth/`; `source/backend/prisma/seed.ts`, `seed-data/permission-catalog.ts`, `seed-data/demo/accounts.ts`. |
| Playwright spec | `source/e2e/specs/f-01-auth-session.spec.ts`; [hướng dẫn](../playwright-guide.md) |
| Trạng thái | 17 ca tự động đã chạy bằng Playwright ngày 10/21/26, tất cả Passed; 13 ca thủ công chưa thực thi. |

## Truy vết

AC1 là dòng Cho/Khi/Thì đầu tiên dưới story, AC2 dòng thứ hai, …; không tính mục Vai trò/Bao phủ.

| AC | TC |
|---|---|
| US-001 AC1 | F01-TC_001; F01-TC_010; F01-TC_020; F01-TC_021; F01-TC_022; F01-TC_023; F01-TC_024; F01-TC_025; F01-TC_030 |
| US-001 AC2 | F01-TC_002; F01-TC_003 |
| US-001 AC3 | F01-TC_004 |
| US-001 AC4 | F01-TC_005; F01-TC_006 |
| US-001 AC5 | F01-TC_019 |
| NT-B1-01 | F01-TC_020 |
| NFR-06 | F01-TC_019 |
| NFR-07 | F01-TC_029 |
| NFR-08 | F01-TC_005; F01-TC_006 |

## Test cases

Năm cột cuối thuộc nhóm **Developer**; để No và trống kết quả cho đến khi người dùng thực thi.

| TC_ID | Target item | Sub-target item | AC | Test summary | Pre-Condition | Steps | Test Data | Expected Result | Is Test? | Test Result | Executed On | Executed By | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F01-TC_001 | Đăng nhập (MH-01) | Đăng nhập đúng | US-001 AC1 | Kiểm tra đăng nhập lần đầu bị buộc đổi mật khẩu | R1 tạo tài khoản riêng Hoạt động | 1. Đăng nhập bằng mật khẩu tạm ở cửa sổ riêng; 2. Mở `/courses` | e2e.<suffix> | Đến `/account`; hiện “Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.”; mở trang khác vẫn quay về tài khoản | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_001 trong specs/f-01-auth-session.spec.ts. AC1 áp dụng sau đổi mật khẩu; đây là chốt lần đầu trong báo cáo Summary FE-06/FE-07. |
| F01-TC_002 | Đăng nhập (MH-01) | Thông tin sai | US-001 AC2 | Kiểm tra tên đăng nhập không tồn tại | Chưa đăng nhập | 1. Nhập tên chưa tồn tại; 2. Đăng nhập | absent.<suffix>; Invalid12345 | “Tên đăng nhập hoặc mật khẩu không đúng.”; vẫn ở `/login` | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_002 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_003 |  |  | US-001 AC2 | Kiểm tra mật khẩu sai có cùng thông báo | Tài khoản riêng mới tạo; context trắng | 1. Nhập username riêng và mật khẩu sai; 2. Đăng nhập | Invalid12345 | “Tên đăng nhập hoặc mật khẩu không đúng.”; không tiết lộ trường sai | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_003 trong specs/f-01-auth-session.spec.ts. Không dùng username từ accounts.ts. |
| F01-TC_004 |  |  | US-001 AC3 | Kiểm tra từ chối tài khoản vô hiệu hóa | R1 vô hiệu hóa tài khoản riêng, không phải demo | 1. Đăng nhập đúng mật khẩu trong cửa sổ riêng | Tài khoản thử Vô hiệu hóa | “Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Phòng Đào tạo.” | No | | | | Thủ công: cần chuẩn bị trạng thái tài khoản riêng; tuyệt đối không vô hiệu hóa tài khoản accounts.ts. |
| F01-TC_005 | Phiên (MH-02) | Hết hạn | US-001 AC4; NFR-08 | Kiểm tra phiên nhàn rỗi 61 phút bị từ chối | Tài khoản riêng đã đổi mật khẩu; ngừng mọi request hoạt động | 1. Để yên 61 phút; 2. Bấm lưu một thay đổi | Phiên riêng; thời hạn mặc định 60 phút | Quay về đăng nhập; thay đổi không được lưu | No | | | | Thủ công: không giả lập giờ, không sửa cấu hình thời hạn; không kết thúc phiên .auth. |
| F01-TC_006 |  |  | US-001 AC4; NFR-08 | Kiểm tra phiên nhàn rỗi 59 phút còn dùng được | Phiên riêng đã đổi mật khẩu | 1. Để yên 59 phút; 2. Mở tài khoản | 59 phút | Vẫn thấy “Tài khoản của tôi”, không buộc đăng nhập lại | No | | | | Thủ công: chờ thật trên phiên riêng; không giả lập đồng hồ. |
| F01-TC_007 | Đăng nhập (MH-01) | Bắt buộc | Bổ sung | Kiểm tra tên đăng nhập bỏ trống | Chưa đăng nhập | 1. Mở đăng nhập; 2. Bấm Đăng nhập | Tên trống | “Nhập tên đăng nhập” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_007 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_008 |  |  | Bổ sung | Kiểm tra mật khẩu bỏ trống | Chưa đăng nhập | 1. Nhập username chưa tồn tại; 2. Đăng nhập | Mật khẩu trống | “Nhập mật khẩu” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_008 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_009 | Phiên (MH-03) | Bảo vệ route | Bổ sung | Kiểm tra truy cập tài khoản khi chưa có phiên | Context trắng | 1. Mở trực tiếp `/account` | — | Chuyển về `/login`, có nút “Đăng nhập” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_009 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_010 | Tài khoản (MH-03) | Đổi mật khẩu | US-001 AC1 | Kiểm tra đổi mật khẩu rồi đăng nhập phiên mới | Tài khoản riêng có mật khẩu tạm | 1. Đăng nhập; 2. Đổi mật khẩu; 3. Đóng context; 4. Đăng nhập context trắng bằng mật khẩu mới | Next<suffix>1 | “Đã đổi mật khẩu”; cảnh báo buộc đổi biến mất; phiên mới hiển thị đúng username | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_010 trong specs/f-01-auth-session.spec.ts. Không đổi mật khẩu tài khoản demo. |
| F01-TC_011 | Phiên (MH-03) | Đăng xuất | Bổ sung | Kiểm tra đăng xuất phiên riêng và quay lại | Tài khoản riêng đăng nhập fresh, không dùng .auth | 1. Đổi mật khẩu tạm thời của tài khoản riêng; 2. Từ `/account`, bấm liên kết “Trang chính” để thêm trang được bảo vệ vào lịch sử; 3. Mở menu tài khoản, Đăng xuất; 4. Back; 5. Mở `/account` | Phiên riêng | Về `/login`; không truy cập lại tài khoản khi chưa đăng nhập | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_011 trong specs/f-01-auth-session.spec.ts. Chỉ context mới có cookies/origins rỗng bị đăng xuất. |
| F01-TC_012 | Tài khoản (MH-03) | Xác nhận | Bổ sung | Kiểm tra nhập lại không khớp | Tài khoản riêng ở MH-03 | 1. Nhập mật khẩu mới; 2. Nhập xác nhận khác; 3. Đổi mật khẩu | Newpass123; Otherpass123 | “Mật khẩu nhập lại không khớp” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_012 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_013 | Tài khoản (MH-03) | Biên độ dài | Bổ sung | Kiểm tra mật khẩu mới 7 ký tự | Tài khoản riêng ở MH-03 | 1. Nhập mật khẩu mới; 2. Xác nhận; 3. Đổi mật khẩu | Abc1234 | “Mật khẩu có ít nhất 8 ký tự” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_013 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_014 | Tài khoản (MH-03) | Độ phức tạp | Bổ sung | Kiểm tra mật khẩu mới thiếu số | Tài khoản riêng ở MH-03 | 1. Nhập mật khẩu mới; 2. Đổi mật khẩu | abcdefgh | “Mật khẩu phải có cả chữ và số” | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_014 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_015 |  |  | Bổ sung | Kiểm tra mật khẩu mới thiếu chữ | Tài khoản riêng ở MH-03 | 1. Nhập mật khẩu mới và xác nhận; 2. Đổi mật khẩu | 12345678 | “Mật khẩu phải có cả chữ và số” | No | | | | Thủ công; không đổi mật khẩu demo. |
| F01-TC_016 | Tài khoản (MH-03) | Mật khẩu hiện tại | Bổ sung | Kiểm tra mật khẩu hiện tại sai | Tài khoản riêng ở MH-03 | 1. Nhập sai mật khẩu hiện tại; 2. Nhập mật khẩu mới hợp lệ; 3. Đổi mật khẩu | Invalid12345; Nextpass123 | “Mật khẩu hiện tại không đúng.” | No | | | | Thủ công trên tài khoản riêng; không gửi mật khẩu sai cho demo. |
| F01-TC_017 |  |  | Bổ sung | Kiểm tra mật khẩu mới trùng hiện tại | Tài khoản riêng có mật khẩu hợp lệ đã biết | 1. Điền cùng mật khẩu hiện tại/mới/xác nhận; 2. Đổi mật khẩu | Mật khẩu riêng | “Mật khẩu mới phải khác mật khẩu hiện tại.” | No | | | | Thủ công trên tài khoản riêng. |
| F01-TC_018 | Tài khoản (MH-03) | Biên độ dài | Bổ sung | Kiểm tra mật khẩu mới 129 ký tự | Tài khoản riêng ở MH-03 | 1. Nhập mật khẩu mới 129 ký tự có chữ/số; 2. Đổi mật khẩu | A lặp 128 lần + 1 | Trường “Mật khẩu mới” báo vượt 128 ký tự; không hiện “Đã đổi mật khẩu” | No | | | | Thủ công; NEW_PASSWORD_RULES dùng max=128, thông báo mặc định AntD. |
| F01-TC_019 | Bảo mật | Lưu mật khẩu | US-001 AC5; NFR-06 | Kiểm tra không lưu mật khẩu rõ | Người kiểm có quyền kiểm cấu trúc và luồng ghi, không xuất bí mật | 1. Kiểm schema User và mã ghi mật khẩu; 2. Đối chiếu mã hash/verify | Tài khoản riêng | Chỉ có passwordHash, không có cột mật khẩu rõ; dùng Argon2id | No | | | | Thủ công/code review: UI không chứng minh được cách lưu; không đọc hoặc đưa giá trị hash/bí mật vào báo cáo. |
| F01-TC_020 | Tài khoản (MH-03) | Vai trò | US-001 AC1; NT-B1-01 | Kiểm tra danh tính phiên R1 | Phiên R1 đã setup | 1. Mở `/account` | accounts.R1 | Hiện đúng username R1 trong tài khoản | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_020 trong specs/f-01-auth-session.spec.ts. NT chỉ bao phủ phần đăng nhập; cây đơn vị ở F-03. |
| F01-TC_021 |  |  | US-001 AC1 | Kiểm tra danh tính phiên R2 | Phiên R2 đã setup | 1. Mở `/account` | accounts.R2 | Hiện đúng username R2 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_021 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_022 |  |  | US-001 AC1 | Kiểm tra danh tính phiên R3 | Phiên R3 đã setup | 1. Mở `/account` | accounts.R3 | Hiện đúng username R3 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_022 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_023 |  |  | US-001 AC1 | Kiểm tra danh tính phiên R4 | Phiên R4 đã setup | 1. Mở `/account` | accounts.R4 | Hiện đúng username R4 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_023 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_024 |  |  | US-001 AC1 | Kiểm tra danh tính phiên R5 | Phiên R5 đã setup | 1. Mở `/account` | accounts.R5 | Hiện đúng username R5 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_024 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_025 |  |  | US-001 AC1 | Kiểm tra danh tính phiên R6 | Phiên R6 đã setup | 1. Mở `/account` | accounts.R6 | Hiện đúng username R6 | Yes | Passed | 10/21/26 | Playwright (auto) | Tự động: F01-TC_025 trong specs/f-01-auth-session.spec.ts. |
| F01-TC_026 | Tài khoản (MH-03) | Biên độ dài | Bổ sung | Kiểm tra chấp nhận mật khẩu 8 ký tự | Tài khoản riêng đã đăng nhập | 1. Đổi mật khẩu và xác nhận | Abcdefg1 | “Đã đổi mật khẩu” | No | | | | Thủ công trên tài khoản riêng. |
| F01-TC_027 |  |  | Bổ sung | Kiểm tra chấp nhận mật khẩu 128 ký tự | Tài khoản riêng đã đăng nhập | 1. Đổi mật khẩu và xác nhận | A lặp 127 lần + 1 | “Đã đổi mật khẩu” | No | | | | Thủ công trên tài khoản riêng. |
| F01-TC_028 | Đăng nhập (MH-01) | Điều hướng | Bổ sung | Kiểm tra trở lại route sau đăng nhập | Tài khoản riêng đã đổi mật khẩu; context trắng | 1. Mở `/account`; 2. Đăng nhập đúng | Tài khoản riêng | Trở lại `/account`, hiển thị đúng tài khoản | No | | | | Thủ công; RequireAuth chỉ giữ pathname, không khẳng định giữ query/hash. |
| F01-TC_029 | Bảo mật | HTTPS và cookie | NFR-07 | Kiểm tra truyền mã hóa và cookie theo môi trường | Môi trường production HTTPS do người dùng chuẩn bị | 1. Đăng nhập fresh qua HTTPS; 2. Kiểm cờ cookie; 3. Gọi web/API qua HTTP | Phiên riêng | Cookie HttpOnly và Secure ở production; HTTP không trả dữ liệu ứng dụng mà chuyển sang HTTPS hoặc bị từ chối | No | | | | Thủ công: localhost HTTP không chứng minh NFR-07. Kế hoạch F-01 dòng 63/107 giao HTTPS termination cho F-27, F-01 chỉ đặt cờ cookie; không đổi cấu hình hay công bố giá trị cookie. |
| F01-TC_030 | Trang chính (MH-02) | Menu theo quyền | US-001 AC1 | Kiểm tra menu theo quyền sau đổi mật khẩu | Tài khoản riêng được R1 gán lần lượt vai/phạm vi cần kiểm | 1. Đăng nhập fresh; 2. Đối chiếu menu với permission-catalog và §9 data-dictionary | R1/R2/R3/R4/R5/R6 trên tài khoản riêng | Chỉ thấy mục ứng với quyền thực tế; không suy quyền ghi chỉ từ việc thấy menu | No | | | | Thủ công: không thay vai/phạm vi các tài khoản accounts.ts; kiểm quyền chi tiết tại từng feature. |

## Ghi chú

- Không có lệch AC chưa được báo cáo cần `test.fixme`. US-001 AC1 có chốt buộc đổi mật khẩu lần đầu theo báo cáo Summary FE-06/FE-07; ca 001 kiểm chốt, ca 010 kiểm đăng nhập sau đổi.
- AC5 là kiểm lưu trữ, không thể suy từ UI. Ca 019 chỉ kiểm cấu trúc/mã, không đọc hoặc xuất credential/hash.
- Ca 005–006 giữ thủ công đúng NFR-08; không giả thời gian hay sửa SESSION_IDLE_MINUTES. Lưu ý poll không được tính là hoạt động theo kế hoạch §8/F-14.
- Ca 004, 015–018, 026–028, 030 dùng tài khoản riêng; mọi tình huống chỉ có thể tái hiện bằng thay tài khoản demo phải giữ thủ công và xin fixture riêng. Không thử lockout trên demo; mã auth hiện không có nhánh khóa do số lần sai, không tự đặt kỳ vọng số lần khóa.
- Automation không đăng xuất hay đổi mật khẩu context dùng `.auth`. Ca 011 đăng xuất một context mới với cookies/origins rỗng; context R1 tạo tài khoản không bị kết thúc.
- Mỗi test độc lập, dữ liệu riêng được giữ lại; không reset, seed lại hay khẳng định tổng số bản ghi. Is Test? luôn No cho đến khi người dùng thực thi.
