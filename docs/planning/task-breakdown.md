# PHÂN RÃ CÔNG VIỆC v0.1

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-12 |
| Đi kèm | `docs/planning/user-stories.md` (US-001..US-116), `docs/planning/epics.md` (bậc B1..B6, EP-01..EP-25) |
| Nguồn | `docs/design/data-dictionary.md` (45 thực thể), `docs/design/state-diagrams.md`, `docs/design/sequence-diagrams.md`, `docs/requirement/REQUIREMENTS.md` |
| Phạm vi | Việc phải làm cho từng user story. Không nêu ngôn ngữ, bộ khung, hệ quản trị cơ sở dữ liệu: công nghệ chưa chốt, ràng buộc duy nhất là ứng dụng một khối phân module |
| Điểm còn hở của tài liệu này | K-1..K-8, mục 11 |

---

## 1. Quy ước

| Mục | Quy ước |
|---|---|
| Mã | CV-001..CV-276, đánh số liên tục theo thứ tự story. Mã không đổi khi việc bị dời |
| Loại | **Dữ liệu**: lập thực thể, ràng buộc, dữ liệu nạp sẵn · **Nghiệp vụ**: quy tắc, thuật toán, kiểm quyền, máy trạng thái · **Giao diện**: màn hình và thao tác của người dùng · **Tích hợp**: tệp Excel, PDF, API cho dDUT, cơ sở dữ liệu có sẵn, email, lưu tệp · **Kiểm thử**: ca kiểm và phép đo · **Tài liệu**: đặc tả, hướng dẫn, quy trình vận hành |
| Cỡ | S, M, L là cỡ tương đối, không phải giờ công. Tỷ lệ quy ước S : M : L = 1 : 2 : 4 điểm; kế hoạch sprint dùng đúng tỷ lệ này (K-3) |
| Phụ thuộc | Việc phải xong trước. Chỉ ghi phụ thuộc trực tiếp. Một việc không bao giờ phụ thuộc việc của bậc sau |
| Story | Story mà việc phục vụ. Mỗi việc đúng một story; mỗi story có ít nhất một việc |
| Việc ngang | Việc phục vụ cả một bậc hoặc một yêu cầu phi chức năng, không riêng story nào. Được gắn vào story đầu hoặc cuối của phần liên quan và mở đầu bằng chữ "Ngang:" (K-2). Danh sách ở mục 9 |
| Tên thực thể | Tên trong dấu `` ` `` là thực thể hoặc thuộc tính của từ điển dữ liệu |
| Mã chuyển trạng thái | DX, HP, GD, DB, UQ kèm số là mã dòng trong `docs/design/state-diagrams.md` |
| Điều không lặp lại | Mọi việc Nghiệp vụ và Giao diện ngầm định: kiểm quyền ở máy chủ, ghi nhật ký cho thao tác ghi, danh sách dài có phân trang. Ba điều này được dựng một lần ở CV-015, CV-007, CV-032 |

## 2. Tổng hợp

Số liệu trong mục này được tính từ các bảng ở mục 3..8.

### 2.1. Số việc theo bậc và loại

| Bậc | Story | Việc | Dữ liệu | Nghiệp vụ | Giao diện | Tích hợp | Kiểm thử | Tài liệu |
|---|---|---|---|---|---|---|---|---|
| B1 | 17 | 52 | 10 | 16 | 16 | 0 | 9 | 1 |
| B2 | 20 | 45 | 5 | 16 | 14 | 3 | 6 | 1 |
| B3 | 15 | 37 | 9 | 10 | 13 | 1 | 4 | 0 |
| B4 | 28 | 65 | 6 | 22 | 24 | 0 | 12 | 1 |
| B5 | 21 | 45 | 4 | 12 | 13 | 3 | 11 | 2 |
| B6 | 15 | 32 | 2 | 7 | 9 | 6 | 7 | 1 |
| **Tổng** | **116** | **276** | **36** | **83** | **89** | **13** | **49** | **6** |

### 2.2. Khối lượng theo bậc

| Bậc | S | M | L | Điểm (S=1, M=2, L=4) | Tỷ lệ |
|---|---|---|---|---|---|
| B1 | 26 | 23 | 3 | 84 | 16% |
| B2 | 17 | 22 | 6 | 85 | 16% |
| B3 | 16 | 18 | 3 | 64 | 12% |
| B4 | 18 | 37 | 10 | 132 | 25% |
| B5 | 13 | 25 | 7 | 91 | 17% |
| B6 | 8 | 18 | 6 | 68 | 13% |
| **Tổng** | **98** | **143** | **35** | **524** | **100%** |

### 2.3. Khối lượng theo epic

| Bậc | Epic | Việc | Điểm |
|---|---|---|---|
| B1 | EP-01 Nền tảng, đăng nhập và nhật ký | 10 | 17 |
| B1 | EP-02 Tài khoản, vai trò, phạm vi quyền | 9 | 16 |
| B1 | EP-03 Cơ cấu tổ chức và nhóm chuyên môn | 11 | 16 |
| B1 | EP-04 Danh mục học phần | 12 | 17 |
| B1 | EP-05 Quan hệ học phần và nhóm tương đương | 10 | 18 |
| B2 | EP-06 Thông tin CTĐT và Giám đốc CTĐT | 12 | 21 |
| B2 | EP-07 Khung chương trình và nhóm tự chọn | 13 | 25 |
| B2 | EP-08 Kiểm tra nhất quán khung | 7 | 11 |
| B2 | EP-09 Nhập và xuất Excel | 13 | 28 |
| B3 | EP-10 Đề cương chi tiết | 9 | 17 |
| B3 | EP-11 Chuẩn đầu ra: PLO, CLO, ma trận | 18 | 30 |
| B3 | EP-12 Công thức điểm và ánh xạ đánh giá–CLO | 10 | 17 |
| B4 | EP-13 Đề xuất: soạn, gửi, thu hồi, xung đột | 21 | 42 |
| B4 | EP-14 Phê duyệt ba cấp và thông báo | 20 | 37 |
| B4 | EP-15 Ban hành và ảnh chụp bất biến | 17 | 36 |
| B4 | EP-16 Tra cứu, so sánh phiên bản, gán khóa | 7 | 17 |
| B5 | EP-17 Hồ sơ sinh viên và kết quả học tập | 11 | 19 |
| B5 | EP-18 Tính điều kiện đăng ký | 3 | 10 |
| B5 | EP-19 Xét tốt nghiệp | 11 | 23 |
| B5 | EP-20 Cổng sinh viên | 11 | 22 |
| B5 | EP-21 API cho dDUT | 9 | 17 |
| B6 | EP-22 Đồng bộ cơ sở dữ liệu có sẵn | 10 | 22 |
| B6 | EP-23 Báo cáo và xuất kiểm định | 8 | 16 |
| B6 | EP-24 Trực quan hóa và xuất bản | 5 | 14 |
| B6 | EP-25 Tiện ích quy trình duyệt | 9 | 16 |

---

## 3. Bậc B1 — Nền tảng và danh mục học phần (phiên bản 0.1)

### EP-01 — Nền tảng, đăng nhập và nhật ký

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-001 | Lập `NguoiDung` ở mức tối thiểu cho đăng nhập: `tenDangNhap`, `matKhauBam`, `trangThai`; mật khẩu chỉ lưu dạng băm (NFR-06) | Dữ liệu | — | S | US-001 |
| CV-002 | Đăng nhập, đăng xuất, phiên hết hạn sau 60 phút lấy từ cấu hình; ghi nhật ký lần đăng nhập sai, không khóa tài khoản (L-1) | Nghiệp vụ | CV-001 | M | US-001 |
| CV-003 | Màn hình đăng nhập, khung trang và menu hiện theo vai trò; toàn bộ giao diện bằng tiếng Việt có dấu (NFR-16) | Giao diện | CV-002 | M | US-001 |
| CV-004 | Ngang: Dựng bộ khung một khối phân module, tài liệu quy ước đặt tên, cơ chế nâng cấp lược đồ theo từng bước, tệp cấu hình tham số nghiệp vụ (NFR-21..24) | Tài liệu | — | L | US-001 |
| CV-005 | Kiểm thử đăng nhập đúng và sai, hết phiên, tài khoản bị vô hiệu hóa, chỉ chấp nhận kết nối mã hóa (NFR-07, NFR-08) | Kiểm thử | CV-002 | S | US-001 |
| CV-006 | Lập `NhatKyHeThong` theo kiểu chỉ thêm: không có đường sửa, không có đường xóa | Dữ liệu | — | S | US-002 |
| CV-007 | Cơ chế tự ghi nhật ký cho mọi thao tác ghi: người thực hiện, hành động, thực thể, mã bản ghi, giá trị cũ, giá trị mới, địa chỉ IP, thời điểm | Nghiệp vụ | CV-002, CV-006 | M | US-002 |
| CV-008 | Kiểm thử: mọi vai trò gọi sửa hoặc xóa nhật ký đều bị từ chối (NFR-10) | Kiểm thử | CV-007 | S | US-002 |
| CV-009 | Truy vấn nhật ký theo người, loại thực thể, mã bản ghi, khoảng thời gian; phân trang và sắp xếp | Nghiệp vụ | CV-007 | S | US-003 |
| CV-010 | Màn hình tra cứu nhật ký cho R1 và R2, xem giá trị trước và sau của từng dòng | Giao diện | CV-009, CV-015 | M | US-003 |

### EP-02 — Tài khoản, vai trò, phạm vi quyền

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-011 | Hoàn thiện `NguoiDung`: `hoTen`, `email`, `donVi` | Dữ liệu | CV-001, CV-020 | S | US-004 |
| CV-012 | Thêm, sửa, vô hiệu hóa, kích hoạt lại, đặt lại mật khẩu; không xóa cứng (EC-51); công việc của người bị vô hiệu hóa vẫn còn (EC-29) | Nghiệp vụ | CV-011 | M | US-004 |
| CV-013 | Màn hình danh sách tài khoản và form tài khoản, thao tác vô hiệu hóa có hộp xác nhận (NFR-20) | Giao diện | CV-012 | M | US-004 |
| CV-014 | Lập `VaiTro`, `PhanQuyen` và nạp sáu vai trò R1..R6 | Dữ liệu | CV-011 | S | US-005 |
| CV-015 | Bộ kiểm quyền và phạm vi ở máy chủ: ba loại phạm vi, hợp quyền của nhiều vai trò, hiệu lực theo `tuNgay`..`denNgay` (NFR-09) | Nghiệp vụ | CV-014 | L | US-005 |
| CV-016 | Màn hình gán vai trò và phạm vi cho người dùng | Giao diện | CV-015 | M | US-005 |
| CV-017 | Bảng kiểm ma trận quyền SRS mục 3.4 phần B1: mỗi ô một lời gọi được phép và một lời gọi bị từ chối | Kiểm thử | CV-015 | M | US-005 |
| CV-018 | Ghi nhật ký riêng cho thay đổi phân quyền: ai cấp, cho ai, vai trò, phạm vi, giá trị trước và sau | Nghiệp vụ | CV-007, CV-015 | S | US-006 |
| CV-019 | Mục lịch sử phân quyền trong hồ sơ người dùng | Giao diện | CV-018 | S | US-006 |

### EP-03 — Cơ cấu tổ chức và nhóm chuyên môn

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-020 | Lập `DonVi` dạng cây và nạp Trường, Khoa, Phòng Đào tạo | Dữ liệu | — | S | US-007 |
| CV-021 | Thêm, sửa, ngừng hoạt động đơn vị; chặn vòng cha–con; không xóa đơn vị đang được tham chiếu | Nghiệp vụ | CV-020 | S | US-007 |
| CV-022 | Màn hình cây đơn vị | Giao diện | CV-021 | M | US-007 |
| CV-023 | Lập `NhomChuyenMon` và nạp 04 nhóm chuyên môn của Khoa | Dữ liệu | CV-020 | S | US-008 |
| CV-024 | Màn hình quản lý nhóm chuyên môn: thêm, sửa, ngừng sử dụng có hộp xác nhận | Giao diện | CV-023 | M | US-008 |
| CV-025 | Lập `ThanhVienNhomCM` | Dữ liệu | CV-011, CV-023 | S | US-009 |
| CV-026 | Gán giảng viên vào nhiều nhóm theo khoảng thời gian; suy ra phạm vi của R5 từ các nhóm đang là thành viên (M-7) | Nghiệp vụ | CV-015, CV-025 | M | US-009 |
| CV-027 | Màn hình thành viên của nhóm và các nhóm của một giảng viên | Giao diện | CV-026 | M | US-009 |
| CV-028 | Chỉ định Điều phối có thời gian hiệu lực; suy ra vai trò R4 và phạm vi theo nhóm; hết hạn thì quyền tự mất | Nghiệp vụ | CV-026 | M | US-010 |
| CV-029 | Form chỉ định Điều phối và lịch sử các lần chỉ định | Giao diện | CV-028 | S | US-010 |
| CV-030 | Kiểm thử giảng viên thuộc hai nhóm và Điều phối đã hết hạn | Kiểm thử | CV-028 | S | US-010 |

### EP-04 — Danh mục học phần

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-031 | Lập `HocPhan` với đủ thuộc tính; `soTinChi` là số thực | Dữ liệu | CV-020, CV-023 | M | US-011 |
| CV-032 | Truy vấn danh mục: tìm theo mã và tên, lọc theo khoa, nhóm, loại, trạng thái; phân trang, sắp xếp (NFR-18) | Nghiệp vụ | CV-031 | S | US-011 |
| CV-033 | Màn hình danh mục học phần và trang chi tiết học phần cho mọi vai trò | Giao diện | CV-032 | M | US-011 |
| CV-034 | Đo thời gian tra cứu danh mục dưới 2 giây trên bộ dữ liệu mẫu cỡ thật (NFR-01) | Kiểm thử | CV-032 | S | US-011 |
| CV-035 | Thêm và sửa học phần: mã duy nhất, tín chỉ số thực không âm, tên Việt và Anh, 7 loại, khoa và nhóm phụ trách; R3..R5 chỉ trong phạm vi (H-4) | Nghiệp vụ | CV-015, CV-026, CV-031 | M | US-012 |
| CV-036 | Form học phần; thông báo lỗi nêu nguyên nhân và cách xử lý (NFR-19) | Giao diện | CV-035 | M | US-012 |
| CV-037 | Kiểm thử BR-01, EC-01, EC-02: tín chỉ 0, tín chỉ 2.5, tín chỉ âm | Kiểm thử | CV-035 | S | US-012 |
| CV-038 | Học phần do khoa khác phụ trách: `khoaPhuTrach` ngoài Khoa, không có nhóm phụ trách, chỉ R1 nhập và sửa | Nghiệp vụ | CV-035 | S | US-013 |
| CV-039 | Nhãn và bộ lọc "học phần khoa khác" trong danh mục | Giao diện | CV-033, CV-038 | S | US-013 |
| CV-040 | Chuyển trạng thái học phần theo HP-01..HP-04: Ngừng mở lớp đòi học phần thay thế, Đã hủy chỉ khi chưa từng dùng, không xóa (EC-50) | Nghiệp vụ | CV-035, CV-043 | M | US-014 |
| CV-041 | Thao tác đổi trạng thái học phần có hộp xác nhận và ô chọn học phần thay thế | Giao diện | CV-040 | S | US-014 |
| CV-042 | Kiểm thử bốn chuyển trạng thái của học phần và các trường hợp bị chặn | Kiểm thử | CV-040 | S | US-014 |

### EP-05 — Quan hệ học phần và nhóm tương đương

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-043 | Lập `QuanHeHocPhan`: học trước, tiên quyết, song hành, thay thế; `nguongDiem` cho tiên quyết | Dữ liệu | CV-031 | S | US-015 |
| CV-044 | Khai báo quan hệ: chặn tự trỏ, chặn trùng, ngưỡng chỉ dùng cho tiên quyết | Nghiệp vụ | CV-035, CV-043 | M | US-015 |
| CV-045 | Mục quan hệ trong trang chi tiết học phần | Giao diện | CV-044 | M | US-015 |
| CV-046 | Phát hiện chu trình trên đồ thị học trước và tiên quyết, trả về đường đi của vòng | Nghiệp vụ | CV-043 | M | US-016 |
| CV-047 | Hiển thị đường đi của chu trình khi lưu quan hệ bị chặn | Giao diện | CV-045, CV-046 | S | US-016 |
| CV-048 | Kiểm thử BR-11, EC-09: vòng hai nút, vòng ba nút, song hành không bị tính là vòng | Kiểm thử | CV-046 | S | US-016 |
| CV-049 | Lập `NhomHocPhanTuongDuong` và liên kết `nhomTuongDuong` trên học phần | Dữ liệu | CV-031 | S | US-017 |
| CV-050 | Tạo nhóm, thêm bớt học phần, gộp hai nhóm khi nối bắc cầu; mỗi học phần thuộc tối đa một nhóm | Nghiệp vụ | CV-049 | M | US-017 |
| CV-051 | Màn hình nhóm tương đương | Giao diện | CV-050 | M | US-017 |
| CV-052 | Ngang: Chạy 7 kịch bản chấp nhận của bậc B1 trên Chrome, Firefox, Edge (NFR-26), sửa lỗi, chốt phiên bản 0.1 | Kiểm thử | CV-017, CV-034, CV-042, CV-048 | L | US-017 |

---

## 4. Bậc B2 — Chương trình đào tạo và khung (phiên bản 0.2)

### EP-06 — Thông tin CTĐT và Giám đốc CTĐT

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-053 | Truy vấn danh sách chương trình kèm phiên bản hiện hành và Giám đốc CTĐT | Nghiệp vụ | CV-055 | S | US-018 |
| CV-054 | Màn hình danh sách chương trình và trang tổng quan một chương trình | Giao diện | CV-053 | M | US-018 |
| CV-055 | Lập `ChuongTrinhDaoTao` và `PhienBanCTDT`; chương trình mới sinh kèm một phiên bản Nháp (M-3) | Dữ liệu | CV-020 | M | US-019 |
| CV-056 | Thêm và sửa thông tin chương trình: tổng tín chỉ bằng bắt buộc cộng tự chọn, hai trình độ, chỉ ngừng sử dụng chứ không xóa | Nghiệp vụ | CV-015, CV-055 | M | US-019 |
| CV-057 | Form thông tin chương trình | Giao diện | CV-056 | M | US-019 |
| CV-058 | Lập `PhanCongGiamDoc` | Dữ liệu | CV-011, CV-055 | S | US-020 |
| CV-059 | Phân công Giám đốc cho nhiều chương trình có thời hạn; suy ra vai trò R3 | Nghiệp vụ | CV-015, CV-058 | M | US-020 |
| CV-060 | Mục Giám đốc CTĐT trong trang chương trình, kèm lịch sử phân công | Giao diện | CV-059 | S | US-020 |
| CV-061 | Mở rộng bộ kiểm quyền: phạm vi "Theo phân công" tính theo chương trình đang được phân công | Nghiệp vụ | CV-015, CV-059 | M | US-021 |
| CV-062 | Bảng kiểm ma trận quyền phần B2: R3 trong phạm vi, ngoài phạm vi, phân công hết hạn | Kiểm thử | CV-061 | S | US-021 |
| CV-063 | Nhân bản đợt 1: chép thông tin, dòng khung, nhóm tự chọn, ràng buộc sang chương trình mới ở Nháp; ghi `nhanBanTu` | Nghiệp vụ | CV-065, CV-071 | L | US-022 |
| CV-064 | Hộp thoại nhân bản chương trình | Giao diện | CV-063 | S | US-022 |

### EP-07 — Khung chương trình và nhóm tự chọn

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-065 | Lập `DongKhungCTDT`, `RangBuocKhung`, `KhoiKienThuc` | Dữ liệu | CV-031, CV-055 | M | US-023 |
| CV-066 | Thêm, sửa, bỏ dòng khung: chặn trùng học phần, chặn học kỳ vượt số học kỳ, ràng buộc riêng của khung, chép tên và tín chỉ vào dòng (M-5) | Nghiệp vụ | CV-061, CV-065 | L | US-023 |
| CV-067 | Màn hình soạn khung dạng dòng với đủ cột của bảng Excel hiện dùng (DEC-05) | Giao diện | CV-066 | L | US-023 |
| CV-068 | Gom khung theo học kỳ, tính tổng tín chỉ từng học kỳ, cảnh báo học kỳ trống | Nghiệp vụ | CV-065 | S | US-024 |
| CV-069 | Chế độ xem khung theo học kỳ | Giao diện | CV-068 | M | US-024 |
| CV-070 | Bộ lọc theo học kỳ, khối kiến thức, bắt buộc hay tự chọn và ô tìm trong khung | Giao diện | CV-069 | M | US-025 |
| CV-071 | Lập `NhomTuChon` và liên kết `nhomTuChon` trên dòng khung | Dữ liệu | CV-065 | S | US-026 |
| CV-072 | Quy tắc nhóm tự chọn: tối thiểu theo tín chỉ hoặc theo số học phần, chặn dòng bắt buộc, mỗi dòng một nhóm | Nghiệp vụ | CV-071 | M | US-026 |
| CV-073 | Màn hình nhóm tự chọn | Giao diện | CV-072 | M | US-026 |
| CV-074 | Đổi thứ tự dòng, chuyển học kỳ, tính lại tổng tín chỉ | Nghiệp vụ | CV-066 | S | US-027 |
| CV-075 | Thao tác sắp xếp và chuyển học kỳ trên màn hình khung | Giao diện | CV-067, CV-074 | M | US-027 |
| CV-076 | Truy vấn các chương trình và phiên bản đang dùng một học phần | Nghiệp vụ | CV-065 | S | US-028 |
| CV-077 | Hộp danh sách chương trình hiện trước khi sửa học phần và mục "được dùng ở" | Giao diện | CV-033, CV-076 | S | US-028 |

### EP-08 — Kiểm tra nhất quán khung

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-078 | Tính tổng tín chỉ theo SRS mục 7.1, theo học kỳ, theo khối, theo bắt buộc và tự chọn; không lưu kết quả (M-9) | Nghiệp vụ | CV-065, CV-071 | M | US-029 |
| CV-079 | Kiểm thử BR-02, BR-03, EC-01, EC-04 bằng khung mẫu có học phần 0 tín chỉ và nhóm tự chọn dư tín chỉ | Kiểm thử | CV-078 | S | US-029 |
| CV-080 | So tổng tính được với tổng khai báo; chấp nhận kèm `lyDoChapNhanLechTC`; chấp nhận mất hiệu lực khi chênh lệch đổi | Nghiệp vụ | CV-078 | S | US-030 |
| CV-081 | Cảnh báo lệch tín chỉ và form chấp nhận có lý do | Giao diện | CV-080 | S | US-030 |
| CV-082 | Bộ kiểm nhất quán khung: tiên quyết xếp sau, tiên quyết ngoài khung, trùng lặp, chu trình trên ràng buộc của khung | Nghiệp vụ | CV-046, CV-066 | M | US-031 |
| CV-083 | Màn hình kết quả kiểm tra nhất quán, tách lỗi chặn và cảnh báo | Giao diện | CV-081, CV-082 | M | US-031 |
| CV-084 | Kiểm thử EC-06, EC-09, EC-10, EC-13 và trường hợp khung sạch | Kiểm thử | CV-082 | M | US-031 |

### EP-09 — Nhập và xuất Excel

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-085 | Đặc tả cột của tệp mẫu danh mục học phần và tệp mẫu khung, theo đúng bảng Excel hiện dùng | Tài liệu | — | S | US-032 |
| CV-086 | Sinh và cho tải hai tệp mẫu đợt 1 | Tích hợp | CV-085 | S | US-032 |
| CV-087 | Lập `PhienNhapLieu` | Dữ liệu | CV-011 | S | US-033 |
| CV-088 | Bộ đọc tệp Excel và kiểm cấu trúc cột dùng chung cho mọi loại nhập; sai cấu trúc thì từ chối ngay, nêu cột sai | Tích hợp | CV-085 | M | US-033 |
| CV-089 | Kiểm từng dòng danh mục học phần, phân loại LỖI và CẢNH BÁO, lập báo cáo từng dòng | Nghiệp vụ | CV-035, CV-088 | M | US-033 |
| CV-090 | Kiểm từng dòng khung: mã học phần tồn tại, dòng trùng, học kỳ hợp lệ, chu trình, ký hiệu | Nghiệp vụ | CV-066, CV-082, CV-088 | L | US-034 |
| CV-091 | Màn hình nhập liệu: chọn loại, tải tệp, chạy thử, báo cáo từng dòng, nút xác nhận ghi | Giao diện | CV-089, CV-090 | M | US-034 |
| CV-092 | Ghi toàn bộ hoặc không gì cả trong một giao dịch; kiểm lại cả tệp lúc ghi (S-12); từ chối khi chương trình đã có phiên bản rời Nháp (L-2) | Nghiệp vụ | CV-087, CV-089, CV-090 | L | US-035 |
| CV-093 | Kiểm thử hoàn tác khi lỗi giữa lúc ghi và tệp 1000 dòng dưới 60 giây (NFR-05) | Kiểm thử | CV-092 | M | US-035 |
| CV-094 | Màn hình lịch sử phiên nhập và chi tiết báo cáo của từng phiên, lọc theo phạm vi người xem | Giao diện | CV-087, CV-091 | M | US-036 |
| CV-095 | Xuất khung ra Excel với cùng cột, cùng thứ tự dòng, cùng ký hiệu | Tích hợp | CV-065, CV-085 | M | US-037 |
| CV-096 | Kiểm thử vòng nhập, xuất, nhập lại không phát sinh LỖI | Kiểm thử | CV-092, CV-095 | S | US-037 |
| CV-097 | Ngang: Chạy 9 kịch bản chấp nhận của bậc B2 với khung chương trình mã 1024034, sửa lỗi, chốt phiên bản 0.2 | Kiểm thử | CV-062, CV-084, CV-093 | L | US-037 |

---

## 5. Bậc B3 — Đề cương và chuẩn đầu ra (phiên bản 0.3)

### EP-10 — Đề cương chi tiết

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-098 | Lập `DeCuongChiTiet` và `NoiDungTheoTuan`; mỗi học phần một dòng đề cương dùng chung (DEC-02) | Dữ liệu | CV-031 | M | US-038 |
| CV-099 | Màn hình xem đề cương, mở được từ danh mục và từ khung của mọi chương trình | Giao diện | CV-098, CV-102 | M | US-038 |
| CV-100 | Soạn các phần của đề cương và nội dung theo tuần; loại mã nhúng khỏi văn bản có định dạng; kiểm phạm vi theo nhóm | Nghiệp vụ | CV-026, CV-098 | M | US-039 |
| CV-101 | Trình soạn đề cương có định dạng: in đậm, danh sách, bảng | Giao diện | CV-100 | L | US-039 |
| CV-102 | Liên kết `deCuong` trên dòng khung để ghim bản đề cương vào từng phiên bản (M-1) | Dữ liệu | CV-065, CV-098 | S | US-039 |
| CV-103 | Ô nhập bản tiếng Anh cho mô tả và CLO; chuyển ngôn ngữ hiển thị, đánh dấu phần chưa dịch | Giao diện | CV-101 | M | US-040 |
| CV-104 | Lập `TaiLieuDinhKem` | Dữ liệu | CV-098 | S | US-041 |
| CV-105 | Tải tệp lên và tải xuống; kiểm loại tệp PDF hoặc Word và dung lượng theo cấu hình | Tích hợp | CV-104 | M | US-041 |
| CV-106 | Mục đính kèm trong màn hình đề cương | Giao diện | CV-099, CV-105 | S | US-041 |

### EP-11 — Chuẩn đầu ra: PLO, CLO, ma trận

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-107 | Lập `PLO` gắn với phiên bản chương trình | Dữ liệu | CV-055 | S | US-042 |
| CV-108 | Thêm, sửa, xóa PLO: mã duy nhất trong phiên bản, xóa thì báo số ô ma trận bị ảnh hưởng | Nghiệp vụ | CV-061, CV-107 | S | US-042 |
| CV-109 | Màn hình PLO của chương trình | Giao diện | CV-108 | M | US-042 |
| CV-110 | Lập `CLO` và `NoiDungTuan_CLO` | Dữ liệu | CV-098 | S | US-043 |
| CV-111 | Thêm, sửa, xóa CLO: mã duy nhất trong đề cương, xóa thì báo nơi đang dùng | Nghiệp vụ | CV-100, CV-110 | S | US-043 |
| CV-112 | Mục CLO trong trình soạn đề cương | Giao diện | CV-101, CV-111 | M | US-043 |
| CV-113 | Lập `MaTranCLO_PLO` treo trên dòng khung (M-6) | Dữ liệu | CV-065, CV-107, CV-110 | S | US-044 |
| CV-114 | Quy tắc ma trận theo cặp chương trình và học phần; thang mức đóng góp lấy từ cấu hình | Nghiệp vụ | CV-113 | M | US-044 |
| CV-115 | Lưới ma trận CLO–PLO sửa được cho một học phần trong một chương trình | Giao diện | CV-114 | L | US-044 |
| CV-116 | Màn hình tra cứu PLO, CLO và ma trận toàn chương trình, lọc theo học kỳ và theo PLO | Giao diện | CV-109, CV-114 | M | US-045 |
| CV-117 | Lập `MaTranHP_PLO` với cờ `laGhiDe` | Dữ liệu | CV-113 | S | US-046 |
| CV-118 | Suy diễn mức học phần–PLO bằng mức cao nhất của các CLO; ghi đè và bỏ ghi đè từng ô | Nghiệp vụ | CV-114, CV-117 | M | US-046 |
| CV-119 | Lưới ma trận học phần–PLO có dấu ghi đè | Giao diện | CV-116, CV-118 | M | US-046 |
| CV-120 | Báo cáo độ bao phủ: PLO chưa có học phần đóng góp, CLO chưa gắn PLO, học phần chưa đóng góp PLO; lọc theo phạm vi | Nghiệp vụ | CV-114 | M | US-047 |
| CV-121 | Màn hình báo cáo độ bao phủ chuẩn đầu ra | Giao diện | CV-120 | M | US-047 |
| CV-122 | Kiểm thử BR-20, EC-41 và trường hợp không còn lỗ hổng | Kiểm thử | CV-120 | S | US-047 |
| CV-123 | Nhân bản đợt 2: chép thêm PLO, ô ma trận, ô ghi đè; đề cương vẫn dùng chung, không chép | Nghiệp vụ | CV-063, CV-113, CV-117 | M | US-048 |
| CV-124 | Kiểm thử bản nhân bản độc lập với nguồn ở PLO và ma trận | Kiểm thử | CV-123 | S | US-048 |

### EP-12 — Công thức điểm và ánh xạ đánh giá–CLO

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-125 | Lập `ThanhPhanDanhGia` | Dữ liệu | CV-098 | S | US-049 |
| CV-126 | Quy tắc công thức điểm: tổng trọng số 100%, từng trọng số trong khoảng trên 0 tới 100, mã duy nhất trong đề cương | Nghiệp vụ | CV-100, CV-125 | M | US-049 |
| CV-127 | Bảng công thức điểm trong trình soạn đề cương, hiện chênh lệch so với 100% | Giao diện | CV-101, CV-126 | M | US-049 |
| CV-128 | Thành phần điều kiện bắt buộc có ngưỡng; điểm liệt chung và riêng từng thành phần | Nghiệp vụ | CV-126 | S | US-050 |
| CV-129 | Ô điều kiện, ngưỡng, điểm liệt và câu diễn giải quy tắc | Giao diện | CV-127, CV-128 | S | US-050 |
| CV-130 | Lập `MapThanhPhan_CLO` | Dữ liệu | CV-110, CV-125 | S | US-051 |
| CV-131 | Lưới ánh xạ thành phần đánh giá với CLO, có tỷ trọng tùy chọn | Giao diện | CV-127, CV-130 | M | US-051 |
| CV-132 | Kiểm độ bao phủ đánh giá: cảnh báo khi lưu nháp, chặn ở bước ban hành và bước gửi duyệt | Nghiệp vụ | CV-130 | M | US-052 |
| CV-133 | Kiểm thử BR-12..15, EC-39, EC-40, EC-42 | Kiểm thử | CV-126, CV-128, CV-132 | S | US-052 |
| CV-134 | Ngang: Chạy 8 kịch bản chấp nhận của bậc B3, sửa lỗi, chốt phiên bản 0.3 | Kiểm thử | CV-122, CV-124, CV-133 | L | US-052 |

---

## 6. Bậc B4 — Đề xuất thay đổi và phiên bản (phiên bản 0.4)

### EP-13 — Đề xuất: soạn, gửi, thu hồi, xung đột

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-135 | Khóa ghi trực tiếp ở máy chủ lên phiên bản, đề cương, học phần đã ban hành; dẫn người dùng sang form đề xuất | Nghiệp vụ | CV-015, CV-055, CV-098 | L | US-053 |
| CV-136 | Kiểm thử mọi đường ghi lên dữ liệu đã ban hành bị từ chối với cả sáu vai trò | Kiểm thử | CV-135 | M | US-053 |
| CV-137 | Lập `DeXuatThayDoi` và `NoiDungThayDoi` | Dữ liệu | CV-031, CV-055 | M | US-054 |
| CV-138 | Tạo, sửa, xóa đề xuất nháp; ghi từng thay đổi với giá trị cũ, giá trị mới và `phienBanGoc`; chỉ xóa được nháp chưa từng gửi (S-2) | Nghiệp vụ | CV-135, CV-137 | L | US-054 |
| CV-139 | Form đề xuất: chọn loại, chọn đối tượng, soạn thay đổi trên bản sao của dữ liệu đang hiệu lực | Giao diện | CV-138 | L | US-054 |
| CV-140 | Danh sách đề xuất của tôi và danh sách chung, lọc theo trạng thái, loại, nguồn | Giao diện | CV-138 | M | US-054 |
| CV-141 | Ô nguồn phát sinh và số văn bản căn cứ, bắt buộc khi nguồn là Trường; bộ lọc theo nguồn | Giao diện | CV-139 | S | US-055 |
| CV-142 | Lập `HoSoDeXuat` | Dữ liệu | CV-137 | S | US-056 |
| CV-143 | Mục hồ sơ căn cứ: tải lên theo loại hồ sơ, tải xuống, không bỏ được sau khi đã gửi | Giao diện | CV-105, CV-139, CV-142 | M | US-056 |
| CV-144 | Lập `BuocDuyet` và `CauHinhCapDuyet`, nạp ba cấp duyệt | Dữ liệu | CV-137 | S | US-057 |
| CV-145 | Định tuyến người duyệt: Điều phối theo nhóm phụ trách học phần, Giám đốc theo chương trình chứa học phần, học phần khoa khác đi thẳng cấp 3 | Nghiệp vụ | CV-028, CV-059, CV-076, CV-144 | L | US-057 |
| CV-146 | Máy trạng thái đề xuất DX-01..DX-14, tăng `lanGui` khi gửi lại, chạy kiểm độ bao phủ trước khi gửi | Nghiệp vụ | CV-132, CV-145 | M | US-057 |
| CV-147 | Hộp xác nhận gửi: danh sách chương trình bị ảnh hưởng và người duyệt dự kiến | Giao diện | CV-139, CV-146 | S | US-057 |
| CV-148 | Kiểm thử định tuyến EC-21, EC-22, EC-23, EC-24 | Kiểm thử | CV-145 | M | US-057 |
| CV-149 | Phát hiện đề xuất mở trên cùng đối tượng; khóa lạc quan theo `phienBanGoc` lúc chấp thuận cuối | Nghiệp vụ | CV-138, CV-146 | M | US-058 |
| CV-150 | Cảnh báo xung đột trên form đề xuất và màn hình chấp thuận | Giao diện | CV-139, CV-149 | S | US-058 |
| CV-151 | Kiểm thử EC-27: hai đề xuất song song cùng một đề cương | Kiểm thử | CV-149 | S | US-058 |
| CV-152 | Thu hồi đề xuất khi chưa có lượt Đồng ý nào; cấp tự bỏ qua không tính (S-3) | Nghiệp vụ | CV-146 | S | US-059 |
| CV-153 | Nút thu hồi có hộp xác nhận | Giao diện | CV-152 | S | US-059 |
| CV-154 | Loại đề xuất tổ chức và phân công: đi thẳng Phòng Đào tạo, đồng ý thì áp vào dữ liệu tổ chức, không sinh phiên bản (E-4) | Nghiệp vụ | CV-026, CV-059, CV-146 | M | US-060 |
| CV-155 | Form đề xuất tổ chức và phân công cho R2 và R4 | Giao diện | CV-154 | M | US-060 |

### EP-14 — Phê duyệt ba cấp và thông báo

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-156 | Truy vấn hàng đợi theo người duyệt và số ngày đã chờ | Nghiệp vụ | CV-145 | M | US-061 |
| CV-157 | Màn hình hàng đợi chờ duyệt | Giao diện | CV-156 | M | US-061 |
| CV-158 | Tính khác biệt trước và sau theo từng thực thể, kể cả văn bản dài và dòng thêm, bỏ | Nghiệp vụ | CV-138 | M | US-062 |
| CV-159 | Màn hình chi tiết đề xuất với bảng so sánh trước và sau | Giao diện | CV-158 | L | US-062 |
| CV-160 | Xử lý cấp 1: qua cấp khi mọi Điều phối đồng ý; Trả lại và Từ chối đòi lý do từ 20 ký tự (S-6) | Nghiệp vụ | CV-146 | M | US-063 |
| CV-161 | Thanh xử lý Đồng ý, Trả lại, Từ chối dùng chung cho ba cấp | Giao diện | CV-159, CV-160 | M | US-063 |
| CV-162 | Xử lý cấp 2: cần mọi Giám đốc của các chương trình bị chạm; một người trả lại là về Nháp ngay | Nghiệp vụ | CV-160 | M | US-064 |
| CV-163 | Trả lại và từ chối ở cấp 3; gửi lại thì đi từ cấp 1 | Nghiệp vụ | CV-162 | S | US-065 |
| CV-164 | Kiểm thử BR-28, BR-29, EC-26 và chuỗi trả lại rồi gửi lại | Kiểm thử | CV-160, CV-162, CV-163 | M | US-065 |
| CV-165 | Tự bỏ qua lượt duyệt của chính người tạo (L-4, L-5); chặn tự duyệt ở máy chủ | Nghiệp vụ | CV-160, CV-162 | M | US-066 |
| CV-166 | Kiểm thử BR-27, EC-19, EC-20 và trường hợp người tạo là Phòng Đào tạo | Kiểm thử | CV-165 | M | US-066 |
| CV-167 | Lập `BinhLuan` | Dữ liệu | CV-137 | S | US-067 |
| CV-168 | Mục bình luận trên đề xuất; chỉ thêm, không sửa, không xóa | Giao diện | CV-159, CV-167 | M | US-067 |
| CV-169 | Lập `ThongBao` | Dữ liệu | CV-137 | S | US-068 |
| CV-170 | Sinh thông báo theo sự kiện: tới cấp mới, trả lại, từ chối, duyệt, bình luận | Nghiệp vụ | CV-146, CV-169 | M | US-068 |
| CV-171 | Biểu tượng số thông báo chưa đọc và danh sách thông báo | Giao diện | CV-170 | M | US-068 |
| CV-172 | Dòng lịch sử phê duyệt nhóm theo lần gửi, có nhãn tự bỏ qua, ủy quyền, can thiệp | Giao diện | CV-159, CV-160 | M | US-069 |
| CV-173 | Phòng Đào tạo can thiệp ở cấp 1 và cấp 2: cờ `laCanThiep`, lý do bắt buộc, ghi người lẽ ra phải duyệt | Nghiệp vụ | CV-160, CV-162 | M | US-070 |
| CV-174 | Bộ lọc đề xuất tồn đọng và nút can thiệp cho R1 | Giao diện | CV-140, CV-173 | S | US-070 |
| CV-175 | Kiểm thử BR-31, EC-25, EC-28 phần can thiệp | Kiểm thử | CV-173 | S | US-070 |

### EP-15 — Ban hành và ảnh chụp bất biến

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-176 | Lập `HocKy`, `KhoaTuyenSinh`, `ApDungPhienBan` | Dữ liệu | CV-055 | S | US-071 |
| CV-177 | Ban hành khởi tạo: kiểm chặn học phần thiếu đề cương, lỗi nhất quán, CLO chưa bao phủ; ghi số quyết định, học kỳ, khóa; chuyển trạng thái phiên bản và đề cương | Nghiệp vụ | CV-082, CV-098, CV-132, CV-176 | L | US-071 |
| CV-178 | Màn hình ban hành khởi tạo có danh sách lỗi chặn và hộp xác nhận | Giao diện | CV-177 | M | US-071 |
| CV-179 | Màn hình học kỳ và khóa tuyển sinh | Giao diện | CV-176 | S | US-071 |
| CV-180 | Sinh ảnh chụp: chép cả phiên bản nguồn rồi áp `NoiDungThayDoi`; đánh số Chính và Phụ; cùng một giao dịch với chấp thuận cuối | Nghiệp vụ | CV-146, CV-176 | L | US-072 |
| CV-181 | Form chấp thuận cuối: số quyết định, ngày ký, học kỳ hiệu lực, khóa áp dụng | Giao diện | CV-161, CV-180 | M | US-072 |
| CV-182 | Kiểm thử đối chiếu ảnh chụp với nguồn và quy tắc đánh số BR-24 | Kiểm thử | CV-180 | M | US-072 |
| CV-183 | Tác vụ kích hoạt đầu học kỳ: chạy lại cho cùng kết quả, kích hoạt theo thứ tự tạo, không bao giờ có hai bản Đang hiệu lực | Nghiệp vụ | CV-180 | M | US-073 |
| CV-184 | Kiểm thử BR-16, BR-22, BR-25, EC-30 bằng cách dời ngày bắt đầu học kỳ | Kiểm thử | CV-183 | M | US-073 |
| CV-185 | Bộ kiểm bất biến: mọi đường ghi bị từ chối; đổi danh mục không làm đổi bản đã chụp | Kiểm thử | CV-135, CV-180 | M | US-074 |
| CV-186 | Ngang: Quy trình sao lưu hằng ngày giữ ít nhất 30 bản, diễn tập phục hồi, kiểm phiên bản đã ban hành còn nguyên sau nâng cấp (NFR-12..14) | Tài liệu | CV-180 | M | US-074 |
| CV-187 | Lan sửa đề cương: một bản đề cương mới và một phiên bản mới cho mỗi chương trình có học phần trong bản Đang hiệu lực hoặc Chờ hiệu lực; lỗi một nơi thì không sinh gì | Nghiệp vụ | CV-076, CV-180 | L | US-075 |
| CV-188 | Danh sách chương trình sẽ sinh phiên bản trên form chấp thuận cuối | Giao diện | CV-181, CV-187 | S | US-075 |
| CV-189 | Kiểm thử EC-38 với học phần dùng ở ba chương trình | Kiểm thử | CV-187 | M | US-075 |
| CV-190 | Đính chính: tạo bản mới từ bản sai, lý do bắt buộc, ghi `dinhChinhCho`, bản sai sang Lịch sử, hỏi chuyển khóa | Nghiệp vụ | CV-180 | M | US-076 |
| CV-191 | Màn hình ban hành đính chính | Giao diện | CV-190 | M | US-076 |
| CV-192 | Đính kèm gắn theo từng bản đề cương; bản đã ban hành chỉ thêm được tệp | Giao diện | CV-106, CV-180 | S | US-077 |

### EP-16 — Tra cứu, so sánh phiên bản, gán khóa

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-193 | So sánh hai phiên bản bất kỳ theo nhóm: thông tin, khung, nhóm tự chọn, PLO, ma trận, đề cương được ghim | Nghiệp vụ | CV-158, CV-180 | L | US-078 |
| CV-194 | Màn hình so sánh hai phiên bản | Giao diện | CV-193 | M | US-078 |
| CV-195 | Màn hình lịch sử phiên bản và chế độ chỉ đọc cho một phiên bản | Giao diện | CV-180 | M | US-079 |
| CV-196 | Gán phiên bản cho khóa từ một học kỳ; hàm xác định phiên bản áp dụng cho một khóa tại một học kỳ | Nghiệp vụ | CV-176, CV-180 | M | US-080 |
| CV-197 | Màn hình gán phiên bản cho khóa | Giao diện | CV-196 | M | US-080 |
| CV-198 | Kiểm thử BR-26 bằng ví dụ SRS mục 6.2.3 với chương trình mã 1024034 | Kiểm thử | CV-196 | S | US-080 |
| CV-199 | Ngang: Chạy 12 kịch bản chấp nhận của bậc B4, sửa lỗi, chốt phiên bản 0.4 | Kiểm thử | CV-136, CV-164, CV-166, CV-184, CV-189, CV-198 | L | US-080 |

---

## 7. Bậc B5 — Sinh viên, điều kiện đăng ký và xét tốt nghiệp (phiên bản 0.5)

### EP-17 — Hồ sơ sinh viên và kết quả học tập

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-200 | Đặc tả cột của tệp mẫu danh sách sinh viên và tệp mẫu kết quả học tập | Tài liệu | CV-085 | S | US-081 |
| CV-201 | Sinh và cho tải hai tệp mẫu đợt 2 | Tích hợp | CV-086, CV-200 | S | US-081 |
| CV-202 | Lập `SinhVien` và `GhiDanhCTDT` | Dữ liệu | CV-011, CV-176 | M | US-082 |
| CV-203 | Kiểm dòng và ghi danh sách sinh viên: tạo hoặc cập nhật hồ sơ, ghi danh Chính theo khóa, tự tạo tài khoản R6 (H-2) | Nghiệp vụ | CV-088, CV-092, CV-196, CV-202 | L | US-082 |
| CV-204 | Mở rộng màn hình nhập liệu cho hai loại dữ liệu đợt 2, chỉ R1 thấy | Giao diện | CV-091, CV-203 | S | US-082 |
| CV-205 | Lập `KetQuaHocTap` | Dữ liệu | CV-031, CV-202 | S | US-083 |
| CV-206 | Kiểm dòng và ghi kết quả học tập: ba thang điểm, giữ mọi lần học | Nghiệp vụ | CV-088, CV-092, CV-205 | M | US-083 |
| CV-207 | Kiểm thử EC-36, EC-45 và tệp kết quả 1000 dòng | Kiểm thử | CV-206 | M | US-083 |
| CV-208 | Ghi danh riêng từng sinh viên theo GD-01..GD-04: chuyển chương trình, song ngành, ngoại lệ có căn cứ | Nghiệp vụ | CV-196, CV-202 | M | US-084 |
| CV-209 | Màn hình hồ sơ sinh viên và các ghi danh | Giao diện | CV-208 | M | US-084 |
| CV-210 | Kiểm thử EC-33, EC-34, EC-35, EC-37 | Kiểm thử | CV-208 | S | US-084 |

### EP-18 — Tính điều kiện đăng ký

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-211 | Thuật toán điều kiện đăng ký theo SRS mục 7.3: năm bước, nhóm tương đương, học phần thay thế, đệ quy song hành có tập đã thăm và giới hạn 20 cấp | Nghiệp vụ | CV-049, CV-065, CV-196, CV-205 | L | US-085 |
| CV-212 | Bảng ca kiểm BR-06, BR-07, BR-08, EC-11, EC-12 và đo toàn khung một sinh viên dưới 3 giây (NFR-02) | Kiểm thử | CV-211 | L | US-085 |
| CV-213 | Cột "Đăng ký được?" có màu trên khung; ô chọn sinh viên cho R1 và R3 trong phạm vi | Giao diện | CV-069, CV-211 | M | US-086 |

### EP-19 — Xét tốt nghiệp

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-214 | Lập `KetQuaXetTotNghiep` | Dữ liệu | CV-202 | S | US-087 |
| CV-215 | Thuật toán xét tốt nghiệp theo SRS mục 7.4: bốn kiểm tra, xét riêng từng ghi danh, lưu kết quả lần xét của cán bộ | Nghiệp vụ | CV-078, CV-205, CV-214 | L | US-087 |
| CV-216 | Màn hình kết quả xét tốt nghiệp của một sinh viên | Giao diện | CV-215 | M | US-087 |
| CV-217 | Công nhận tương đương khi xét: theo nhóm, tín chỉ theo học phần đã học, mỗi yêu cầu tính một lần, phần dư là tín chỉ tự do | Nghiệp vụ | CV-049, CV-215 | L | US-088 |
| CV-218 | Kiểm thử BR-09, BR-10, EC-14..18 | Kiểm thử | CV-217 | M | US-088 |
| CV-219 | Danh sách hạng mục còn thiếu chia bốn loại, kèm số đã có và số còn thiếu | Giao diện | CV-216 | M | US-089 |
| CV-220 | Xét lô theo khóa hoặc chương trình; lỗi của một sinh viên không dừng cả lô | Nghiệp vụ | CV-215 | M | US-090 |
| CV-221 | Bảng kết quả xét lô, lọc, xuất Excel | Giao diện | CV-220 | M | US-090 |
| CV-222 | Đo xét lô 500 sinh viên dưới 5 phút (NFR-03) | Kiểm thử | CV-220 | S | US-090 |
| CV-223 | Xét lại khi kết quả học tập của sinh viên đã xét bị đổi; thông báo Phòng Đào tạo khi kết luận đổi | Nghiệp vụ | CV-170, CV-215 | M | US-091 |
| CV-224 | Kiểm thử EC-43 | Kiểm thử | CV-223 | S | US-091 |

### EP-20 — Cổng sinh viên

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-225 | Xác định ghi danh và phiên bản của sinh viên đang đăng nhập; chặn ở máy chủ mọi truy cập dữ liệu của sinh viên khác | Nghiệp vụ | CV-015, CV-196, CV-202 | M | US-092 |
| CV-226 | Trang chủ cổng sinh viên, chuyển giữa chương trình Chính và Song ngành | Giao diện | CV-225 | M | US-092 |
| CV-227 | Kiểm thử NFR-11: sinh viên A gọi dữ liệu sinh viên B | Kiểm thử | CV-225 | S | US-092 |
| CV-228 | Trạng thái từng học phần theo kết quả học tập, kể cả đạt nhờ tương đương | Nghiệp vụ | CV-205, CV-217 | S | US-093 |
| CV-229 | Khung của sinh viên kèm trạng thái và điểm | Giao diện | CV-226, CV-228 | M | US-093 |
| CV-230 | Tính tiến độ: tín chỉ tích lũy theo tổng, theo bắt buộc và tự chọn, theo khối; học lại tính một lần | Nghiệp vụ | CV-078, CV-205 | M | US-094 |
| CV-231 | Màn hình tiến độ học tập | Giao diện | CV-226, CV-230 | M | US-094 |
| CV-232 | Danh sách học phần đủ điều kiện và lý do của học phần chưa đủ | Giao diện | CV-211, CV-226 | M | US-095 |
| CV-233 | Sinh viên xem bản đề cương được ghim và công thức điểm; không lộ nháp, đề xuất, bình luận | Giao diện | CV-099, CV-225 | M | US-096 |
| CV-234 | Bố cục co giãn từ 360px cho mọi màn hình của cổng sinh viên | Giao diện | CV-226, CV-229, CV-231, CV-232, CV-233 | L | US-097 |
| CV-235 | Kiểm ở 360px và trên Chrome, Firefox, Edge (NFR-17, NFR-26) | Kiểm thử | CV-234 | M | US-097 |

### EP-21 — API cho dDUT

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-236 | Lập `BenTichHop`, chỉ lưu `khoaBam` | Dữ liệu | — | S | US-098 |
| CV-237 | Xác thực khóa truy cập, giới hạn tần suất theo `gioiHanTanSuat`, ghi nhật ký từng lời gọi kèm mã sinh viên | Nghiệp vụ | CV-007, CV-236 | M | US-098 |
| CV-238 | Màn hình quản lý bên tích hợp: cấp khóa hiện một lần, khóa và mở lại | Giao diện | CV-237 | S | US-098 |
| CV-239 | Ba đường dẫn của SRS mục 8 cho chương trình của sinh viên, một phiên bản cụ thể, đề cương của học phần | Tích hợp | CV-098, CV-196, CV-237 | M | US-099 |
| CV-240 | Ba đường dẫn của SRS mục 8 cho tiến độ, học phần đủ điều kiện, xét tốt nghiệp | Tích hợp | CV-211, CV-215, CV-230, CV-237 | M | US-100 |
| CV-241 | Kiểm thử đối chiếu kết quả API với cổng sinh viên trên cùng dữ liệu | Kiểm thử | CV-239, CV-240 | M | US-100 |
| CV-242 | Tài liệu API theo API-02 cho đủ sáu đường dẫn | Tài liệu | CV-239, CV-240 | M | US-101 |
| CV-243 | Kiểm thử phản hồi thật khớp tài liệu API | Kiểm thử | CV-242 | S | US-101 |
| CV-244 | Ngang: Chạy 9 kịch bản chấp nhận của bậc B5, sửa lỗi, chốt phiên bản 0.5 | Kiểm thử | CV-207, CV-212, CV-218, CV-227, CV-235, CV-241 | L | US-101 |

---

## 8. Bậc B6 — Tích hợp trường, báo cáo và hoàn thiện (phiên bản 1.0)

### EP-22 — Đồng bộ cơ sở dữ liệu có sẵn

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-245 | Lập `LogDongBo` và nơi lưu cấu hình kết nối, lịch chạy (E-7) | Dữ liệu | — | S | US-102 |
| CV-246 | Kết nối chỉ đọc tới cơ sở dữ liệu có sẵn và chức năng kiểm tra kết nối | Tích hợp | CV-245 | M | US-102 |
| CV-247 | Màn hình cấu hình kết nối và lịch đồng bộ; không hiện lại mật khẩu kết nối | Giao diện | CV-246 | M | US-102 |
| CV-248 | Ngang: Triển khai lên máy chủ của Khoa, tài liệu cài đặt, hướng dẫn sử dụng theo từng vai trò (NFR-25, NFR-27) | Tài liệu | — | L | US-102 |
| CV-249 | Ngang: Đo 200 người dùng đồng thời và thiết lập theo dõi thời gian hoạt động (NFR-04, NFR-15) | Kiểm thử | CV-248 | M | US-102 |
| CV-250 | Tác vụ đồng bộ theo lịch theo DB-01..DB-04: đọc sinh viên và kết quả, một giao dịch, hoàn tác khi lỗi, không chạy chồng, quá hạn thì Thất bại | Tích hợp | CV-202, CV-205, CV-246 | L | US-103 |
| CV-251 | Màn hình nhật ký đồng bộ, lọc theo trạng thái, chạy lại thủ công | Giao diện | CV-250 | M | US-103 |
| CV-252 | Kiểm thử EC-49 bằng cách ngắt kết nối giữa lúc đồng bộ | Kiểm thử | CV-250 | M | US-103 |
| CV-253 | Quy tắc ưu tiên nguồn theo SRS mục 8.2; đếm `soMauThuan`; cảnh báo khi Excel đụng bản ghi có nguồn là cơ sở dữ liệu có sẵn | Nghiệp vụ | CV-206, CV-250 | M | US-104 |
| CV-254 | Kiểm thử EC-48 theo cả hai chiều ưu tiên | Kiểm thử | CV-253 | S | US-104 |

### EP-23 — Báo cáo và xuất kiểm định

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-255 | Đối sánh hai chương trình: phần chung, phần riêng, cặp tương đương, khác học kỳ và tính chất | Nghiệp vụ | CV-049, CV-065 | M | US-105 |
| CV-256 | Màn hình đối sánh và xuất Excel | Giao diện | CV-255 | M | US-105 |
| CV-257 | Phân bổ tín chỉ theo khối, học kỳ, loại học phần; đánh dấu khối lệch `soTinChiYeuCau` | Nghiệp vụ | CV-078 | S | US-106 |
| CV-258 | Màn hình báo cáo phân bổ tín chỉ và xuất Excel | Giao diện | CV-257 | M | US-106 |
| CV-259 | Xuất ma trận CLO–PLO và ma trận học phần–PLO ra Excel, có chú thích ô ghi đè | Tích hợp | CV-118 | M | US-107 |
| CV-260 | Bộ xuất kiểm định của một phiên bản: khung, PLO, hai ma trận, phân bổ tín chỉ, đề cương kèm công thức điểm, trang lỗ hổng | Tích hợp | CV-095, CV-120, CV-257, CV-259 | L | US-108 |
| CV-261 | Thống kê đề xuất theo trạng thái, loại, nguồn và thời gian xử lý trung bình từng cấp; giới hạn theo phạm vi | Nghiệp vụ | CV-146 | S | US-109 |
| CV-262 | Màn hình thống kê đề xuất | Giao diện | CV-261 | M | US-109 |

### EP-24 — Trực quan hóa và xuất bản

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-263 | Đồ thị quan hệ học phần xếp theo học kỳ, làm nổi chuỗi phụ thuộc của một nút | Giao diện | CV-043, CV-065 | L | US-110 |
| CV-264 | Xuất một phiên bản chương trình ra PDF theo mẫu tổng quát; bản Nháp có dấu "BẢN NHÁP" | Tích hợp | CV-180 | L | US-111 |
| CV-265 | Dòng thời gian phiên bản, có nhãn đính chính | Giao diện | CV-194, CV-195 | M | US-112 |
| CV-266 | Gom cảnh báo của một chương trình từ các bộ kiểm đã có | Nghiệp vụ | CV-082, CV-120, CV-132 | M | US-113 |
| CV-267 | Bảng sức khỏe chương trình, mỗi dòng dẫn tới màn hình xử lý | Giao diện | CV-266 | M | US-113 |

### EP-25 — Tiện ích quy trình duyệt

| Mã | Việc | Loại | Phụ thuộc | Cỡ | Story |
|---|---|---|---|---|---|
| CV-268 | Lập `UyQuyenDuyet` | Dữ liệu | CV-144 | S | US-114 |
| CV-269 | Ủy quyền theo UQ-01..UQ-04: hàng đợi và xử lý tính cả người được ủy quyền, hết hạn và thu hồi tự động, vẫn chặn tự duyệt | Nghiệp vụ | CV-156, CV-160, CV-268 | M | US-114 |
| CV-270 | Màn hình ủy quyền của tôi | Giao diện | CV-269 | M | US-114 |
| CV-271 | Kiểm thử ủy quyền hết hạn, thu hồi, tài khoản bị vô hiệu hóa | Kiểm thử | CV-269 | S | US-114 |
| CV-272 | Gửi email qua dịch vụ email ngoài; lỗi gửi không làm hỏng thao tác duyệt; cờ `daGuiEmail`; người dùng tắt nhận được | Tích hợp | CV-170 | M | US-115 |
| CV-273 | Kiểm thử dịch vụ email không phản hồi (L-6) | Kiểm thử | CV-272 | S | US-115 |
| CV-274 | Tác vụ nhắc hạn theo số ngày và chu kỳ trong cấu hình; bật tắt được | Nghiệp vụ | CV-156, CV-170 | M | US-116 |
| CV-275 | Kiểm thử nhắc hạn: quá hạn, đã xử lý, tính năng tắt | Kiểm thử | CV-274 | S | US-116 |
| CV-276 | Ngang: Chạy 9 kịch bản chấp nhận của bậc B6, sửa lỗi, chốt phiên bản 1.0 | Kiểm thử | CV-249, CV-252, CV-254, CV-271, CV-273, CV-275 | L | US-116 |

---

## 9. Việc ngang

Các việc dưới đây không thuộc riêng story nào. Bỏ một việc ngang không làm story nào "chưa xong" trên giấy, nên chúng được liệt kê riêng để không bị sót khi xếp sprint.

| Mã | Bậc | Việc | Cỡ | Gắn vào story |
|---|---|---|---|---|
| CV-004 | B1 | Dựng bộ khung một khối phân module, tài liệu quy ước đặt tên, cơ chế nâng cấp lược đồ theo từng bước, tệp cấu hình tham số nghiệp vụ (NFR-21..24) | L | US-001 |
| CV-052 | B1 | Chạy 7 kịch bản chấp nhận của bậc B1 trên Chrome, Firefox, Edge (NFR-26), sửa lỗi, chốt phiên bản 0.1 | L | US-017 |
| CV-097 | B2 | Chạy 9 kịch bản chấp nhận của bậc B2 với khung chương trình mã 1024034, sửa lỗi, chốt phiên bản 0.2 | L | US-037 |
| CV-134 | B3 | Chạy 8 kịch bản chấp nhận của bậc B3, sửa lỗi, chốt phiên bản 0.3 | L | US-052 |
| CV-186 | B4 | Quy trình sao lưu hằng ngày giữ ít nhất 30 bản, diễn tập phục hồi, kiểm phiên bản đã ban hành còn nguyên sau nâng cấp (NFR-12..14) | M | US-074 |
| CV-199 | B4 | Chạy 12 kịch bản chấp nhận của bậc B4, sửa lỗi, chốt phiên bản 0.4 | L | US-080 |
| CV-244 | B5 | Chạy 9 kịch bản chấp nhận của bậc B5, sửa lỗi, chốt phiên bản 0.5 | L | US-101 |
| CV-248 | B6 | Triển khai lên máy chủ của Khoa, tài liệu cài đặt, hướng dẫn sử dụng theo từng vai trò (NFR-25, NFR-27) | L | US-102 |
| CV-249 | B6 | Đo 200 người dùng đồng thời và thiết lập theo dõi thời gian hoạt động (NFR-04, NFR-15) | M | US-102 |
| CV-276 | B6 | Chạy 9 kịch bản chấp nhận của bậc B6, sửa lỗi, chốt phiên bản 1.0 | L | US-116 |

---

## 10. Bảng truy vết

### 10.1. Story → việc

| Story | Tên story | Việc | Điểm |
|---|---|---|---|
| US-001 | Đăng nhập và kết thúc phiên | CV-001, CV-002, CV-003, CV-004, CV-005 | 10 |
| US-002 | Ghi nhật ký bất biến cho mọi thay đổi | CV-006, CV-007, CV-008 | 4 |
| US-003 | Tra cứu nhật ký hệ thống | CV-009, CV-010 | 3 |
| US-004 | Quản lý tài khoản người dùng | CV-011, CV-012, CV-013 | 5 |
| US-005 | Gán vai trò và phạm vi quyền (đợt 1) | CV-014, CV-015, CV-016, CV-017 | 9 |
| US-006 | Nhật ký thay đổi phân quyền | CV-018, CV-019 | 2 |
| US-007 | Quản lý cây đơn vị | CV-020, CV-021, CV-022 | 4 |
| US-008 | Quản lý nhóm chuyên môn | CV-023, CV-024 | 3 |
| US-009 | Gán giảng viên vào nhiều nhóm chuyên môn | CV-025, CV-026, CV-027 | 5 |
| US-010 | Chỉ định Điều phối nhóm chuyên môn | CV-028, CV-029, CV-030 | 4 |
| US-011 | Tra cứu danh mục học phần | CV-031, CV-032, CV-033, CV-034 | 6 |
| US-012 | Thêm và sửa học phần | CV-035, CV-036, CV-037 | 5 |
| US-013 | Ghi nhận học phần của khoa khác | CV-038, CV-039 | 2 |
| US-014 | Đổi trạng thái sử dụng học phần | CV-040, CV-041, CV-042 | 4 |
| US-015 | Khai báo quan hệ giữa các học phần | CV-043, CV-044, CV-045 | 5 |
| US-016 | Chặn chu trình học trước và tiên quyết | CV-046, CV-047, CV-048 | 4 |
| US-017 | Khai báo nhóm học phần tương đương | CV-049, CV-050, CV-051, CV-052 | 9 |
| US-018 | Tra cứu danh sách chương trình đào tạo | CV-053, CV-054 | 3 |
| US-019 | Soạn thông tin chương trình đào tạo | CV-055, CV-056, CV-057 | 6 |
| US-020 | Phân công Giám đốc CTĐT | CV-058, CV-059, CV-060 | 4 |
| US-021 | Phạm vi quyền theo chương trình được phân công (đợt 2) | CV-061, CV-062 | 3 |
| US-022 | Nhân bản chương trình cho khóa mới (đợt 1) | CV-063, CV-064 | 5 |
| US-023 | Soạn dòng khung chương trình | CV-065, CV-066, CV-067 | 10 |
| US-024 | Xem khung theo học kỳ | CV-068, CV-069 | 3 |
| US-025 | Lọc và tìm trong khung | CV-070 | 2 |
| US-026 | Khai báo nhóm học phần tự chọn | CV-071, CV-072, CV-073 | 5 |
| US-027 | Sắp xếp dòng và chuyển học phần giữa các học kỳ | CV-074, CV-075 | 3 |
| US-028 | Xem các chương trình đang dùng một học phần | CV-076, CV-077 | 2 |
| US-029 | Tính tổng tín chỉ theo cấu trúc | CV-078, CV-079 | 3 |
| US-030 | Cảnh báo lệch tổng tín chỉ và chấp nhận có lý do | CV-080, CV-081 | 2 |
| US-031 | Kiểm tra tiên quyết xếp sau, chu trình và trùng lặp | CV-082, CV-083, CV-084 | 6 |
| US-032 | Tải tệp mẫu nhập liệu (đợt 1) | CV-085, CV-086 | 2 |
| US-033 | Nhập danh mục học phần từ Excel (đợt 1) | CV-087, CV-088, CV-089 | 5 |
| US-034 | Nhập khung chương trình từ Excel: chạy thử | CV-090, CV-091 | 6 |
| US-035 | Xác nhận ghi: toàn bộ hoặc không gì cả | CV-092, CV-093 | 6 |
| US-036 | Xem lịch sử phiên nhập liệu | CV-094 | 2 |
| US-037 | Xuất khung chương trình ra Excel | CV-095, CV-096, CV-097 | 7 |
| US-038 | Tra cứu đề cương dùng chung của học phần | CV-098, CV-099 | 4 |
| US-039 | Soạn nội dung đề cương | CV-100, CV-101, CV-102 | 7 |
| US-040 | Đề cương song ngữ | CV-103 | 2 |
| US-041 | Đính kèm bản đề cương đã ký (đợt 1) | CV-104, CV-105, CV-106 | 4 |
| US-042 | Soạn PLO của chương trình | CV-107, CV-108, CV-109 | 4 |
| US-043 | Soạn CLO của học phần | CV-110, CV-111, CV-112 | 4 |
| US-044 | Soạn ma trận CLO–PLO theo cặp chương trình, học phần | CV-113, CV-114, CV-115 | 7 |
| US-045 | Tra cứu PLO, CLO và ma trận | CV-116 | 2 |
| US-046 | Ma trận học phần–PLO suy diễn và ghi đè | CV-117, CV-118, CV-119 | 5 |
| US-047 | Cảnh báo lỗ hổng chuẩn đầu ra | CV-120, CV-121, CV-122 | 5 |
| US-048 | Nhân bản chương trình kèm PLO và ma trận (đợt 2) | CV-123, CV-124 | 3 |
| US-049 | Khai báo thành phần đánh giá và trọng số | CV-125, CV-126, CV-127 | 5 |
| US-050 | Thành phần điều kiện và điểm liệt | CV-128, CV-129 | 2 |
| US-051 | Ánh xạ thành phần đánh giá với CLO | CV-130, CV-131 | 3 |
| US-052 | Cảnh báo CLO chưa được đánh giá | CV-132, CV-133, CV-134 | 7 |
| US-053 | Khóa sửa trực tiếp dữ liệu đã ban hành | CV-135, CV-136 | 6 |
| US-054 | Tạo, sửa, xóa đề xuất nháp | CV-137, CV-138, CV-139, CV-140 | 12 |
| US-055 | Ghi nguồn phát sinh của đề xuất | CV-141 | 1 |
| US-056 | Đính kèm hồ sơ căn cứ | CV-142, CV-143 | 3 |
| US-057 | Gửi duyệt và định tuyến người duyệt | CV-144, CV-145, CV-146, CV-147, CV-148 | 10 |
| US-058 | Cảnh báo xung đột giữa các đề xuất | CV-149, CV-150, CV-151 | 4 |
| US-059 | Thu hồi đề xuất | CV-152, CV-153 | 2 |
| US-060 | Đề xuất thay đổi tổ chức và phân công | CV-154, CV-155 | 4 |
| US-061 | Hàng đợi đề xuất chờ duyệt | CV-156, CV-157 | 4 |
| US-062 | Xem đề xuất và bảng so sánh trước–sau | CV-158, CV-159 | 6 |
| US-063 | Xử lý ở cấp chuyên môn (cấp 1) | CV-160, CV-161 | 4 |
| US-064 | Xử lý ở cấp chương trình (cấp 2) | CV-162 | 2 |
| US-065 | Trả lại hoặc từ chối ở cấp cuối | CV-163, CV-164 | 3 |
| US-066 | Tự động bỏ qua cấp của chính người tạo | CV-165, CV-166 | 4 |
| US-067 | Bình luận trên đề xuất | CV-167, CV-168 | 3 |
| US-068 | Thông báo trong ứng dụng | CV-169, CV-170, CV-171 | 5 |
| US-069 | Lịch sử phê duyệt của đề xuất | CV-172 | 2 |
| US-070 | Phòng Đào tạo can thiệp ở cấp dưới | CV-173, CV-174, CV-175 | 4 |
| US-071 | Ban hành phiên bản đầu tiên của chương trình | CV-176, CV-177, CV-178, CV-179 | 8 |
| US-072 | Chấp thuận cuối và sinh phiên bản mới | CV-180, CV-181, CV-182 | 8 |
| US-073 | Kích hoạt phiên bản vào đầu học kỳ | CV-183, CV-184 | 4 |
| US-074 | Phiên bản đã ban hành là bất biến | CV-185, CV-186 | 4 |
| US-075 | Sửa đề cương dùng chung sinh phiên bản ở mọi chương trình | CV-187, CV-188, CV-189 | 7 |
| US-076 | Ban hành phiên bản đính chính | CV-190, CV-191 | 4 |
| US-077 | Đính kèm đề cương đã ký theo phiên bản (đợt 2) | CV-192 | 1 |
| US-078 | So sánh hai phiên bản | CV-193, CV-194 | 6 |
| US-079 | Xem lại phiên bản lịch sử | CV-195 | 2 |
| US-080 | Gán phiên bản cho khóa tuyển sinh | CV-196, CV-197, CV-198, CV-199 | 9 |
| US-081 | Tải tệp mẫu sinh viên và kết quả học tập (đợt 2) | CV-200, CV-201 | 2 |
| US-082 | Nhập danh sách sinh viên và tự tạo tài khoản (đợt 2) | CV-202, CV-203, CV-204 | 7 |
| US-083 | Nhập kết quả học tập (đợt 2) | CV-205, CV-206, CV-207 | 5 |
| US-084 | Ghi danh riêng cho từng sinh viên và các ngoại lệ | CV-208, CV-209, CV-210 | 5 |
| US-085 | Tính điều kiện đăng ký của từng học phần | CV-211, CV-212 | 8 |
| US-086 | Cột "Đăng ký được?" trên khung | CV-213 | 2 |
| US-087 | Xét điều kiện tốt nghiệp cho một sinh viên | CV-214, CV-215, CV-216 | 7 |
| US-088 | Công nhận học phần tương đương khi xét | CV-217, CV-218 | 6 |
| US-089 | Danh sách hạng mục còn thiếu | CV-219 | 2 |
| US-090 | Xét tốt nghiệp hàng loạt | CV-220, CV-221, CV-222 | 5 |
| US-091 | Tính lại khi điểm bị sửa sau lúc xét | CV-223, CV-224 | 3 |
| US-092 | Sinh viên xem đúng phiên bản chương trình của mình | CV-225, CV-226, CV-227 | 5 |
| US-093 | Sinh viên xem khung kèm trạng thái từng học phần | CV-228, CV-229 | 3 |
| US-094 | Sinh viên xem tiến độ học tập | CV-230, CV-231 | 4 |
| US-095 | Sinh viên xem học phần đủ điều kiện và lý do | CV-232 | 2 |
| US-096 | Sinh viên xem đề cương và công thức điểm | CV-233 | 2 |
| US-097 | Cổng sinh viên dùng được trên điện thoại | CV-234, CV-235 | 6 |
| US-098 | Cấp và quản lý khóa truy cập cho bên tích hợp | CV-236, CV-237, CV-238 | 4 |
| US-099 | API chương trình và đề cương | CV-239 | 2 |
| US-100 | API tiến độ, điều kiện đăng ký và xét tốt nghiệp | CV-240, CV-241 | 4 |
| US-101 | Tài liệu API theo chuẩn OpenAPI | CV-242, CV-243, CV-244 | 7 |
| US-102 | Cấu hình kết nối và lịch đồng bộ | CV-245, CV-246, CV-247, CV-248, CV-249 | 11 |
| US-103 | Đồng bộ theo lịch và nhật ký đồng bộ | CV-250, CV-251, CV-252 | 8 |
| US-104 | Quy tắc ưu tiên khi hai nguồn mâu thuẫn | CV-253, CV-254 | 3 |
| US-105 | Đối sánh hai chương trình | CV-255, CV-256 | 4 |
| US-106 | Báo cáo phân bổ tín chỉ | CV-257, CV-258 | 3 |
| US-107 | Xuất ma trận chuẩn đầu ra ra Excel | CV-259 | 2 |
| US-108 | Xuất bộ báo cáo kiểm định | CV-260 | 4 |
| US-109 | Thống kê đề xuất thay đổi | CV-261, CV-262 | 3 |
| US-110 | Xem đồ thị quan hệ học phần | CV-263 | 4 |
| US-111 | Xuất chương trình ra PDF | CV-264 | 4 |
| US-112 | Xem dòng thời gian phiên bản | CV-265 | 2 |
| US-113 | Bảng sức khỏe chương trình | CV-266, CV-267 | 4 |
| US-114 | Ủy quyền phê duyệt | CV-268, CV-269, CV-270, CV-271 | 6 |
| US-115 | Gửi thông báo qua email | CV-272, CV-273 | 3 |
| US-116 | Nhắc hạn đề xuất tồn đọng | CV-274, CV-275, CV-276 | 7 |

### 10.2. Thực thể → việc lập thực thể

Mỗi thực thể của từ điển dữ liệu được lập ở đúng một việc loại Dữ liệu. Bậc ghi ở đây là bậc thực thể xuất hiện lần đầu.

| Thực thể | Việc lập | Bậc | Story |
|---|---|---|---|
| `ApDungPhienBan` | CV-176 | B4 | US-071 |
| `BenTichHop` | CV-236 | B5 | US-098 |
| `BinhLuan` | CV-167 | B4 | US-067 |
| `BuocDuyet` | CV-144 | B4 | US-057 |
| `CLO` | CV-110 | B3 | US-043 |
| `CauHinhCapDuyet` | CV-144 | B4 | US-057 |
| `ChuongTrinhDaoTao` | CV-055 | B2 | US-019 |
| `DeCuongChiTiet` | CV-098 | B3 | US-038 |
| `DeXuatThayDoi` | CV-137 | B4 | US-054 |
| `DonVi` | CV-020 | B1 | US-007 |
| `DongKhungCTDT` | CV-065 | B2 | US-023 |
| `GhiDanhCTDT` | CV-202 | B5 | US-082 |
| `HoSoDeXuat` | CV-142 | B4 | US-056 |
| `HocKy` | CV-176 | B4 | US-071 |
| `HocPhan` | CV-031 | B1 | US-011 |
| `KetQuaHocTap` | CV-205 | B5 | US-083 |
| `KetQuaXetTotNghiep` | CV-214 | B5 | US-087 |
| `KhoaTuyenSinh` | CV-176 | B4 | US-071 |
| `KhoiKienThuc` | CV-065 | B2 | US-023 |
| `LogDongBo` | CV-245 | B6 | US-102 |
| `MaTranCLO_PLO` | CV-113 | B3 | US-044 |
| `MaTranHP_PLO` | CV-117 | B3 | US-046 |
| `MapThanhPhan_CLO` | CV-130 | B3 | US-051 |
| `NguoiDung` | CV-001 | B1 | US-001 |
| `NhatKyHeThong` | CV-006 | B1 | US-002 |
| `NhomChuyenMon` | CV-023 | B1 | US-008 |
| `NhomHocPhanTuongDuong` | CV-049 | B1 | US-017 |
| `NhomTuChon` | CV-071 | B2 | US-026 |
| `NoiDungThayDoi` | CV-137 | B4 | US-054 |
| `NoiDungTheoTuan` | CV-098 | B3 | US-038 |
| `NoiDungTuan_CLO` | CV-110 | B3 | US-043 |
| `PLO` | CV-107 | B3 | US-042 |
| `PhanCongGiamDoc` | CV-058 | B2 | US-020 |
| `PhanQuyen` | CV-014 | B1 | US-005 |
| `PhienBanCTDT` | CV-055 | B2 | US-019 |
| `PhienNhapLieu` | CV-087 | B2 | US-033 |
| `QuanHeHocPhan` | CV-043 | B1 | US-015 |
| `RangBuocKhung` | CV-065 | B2 | US-023 |
| `SinhVien` | CV-202 | B5 | US-082 |
| `TaiLieuDinhKem` | CV-104 | B3 | US-041 |
| `ThanhPhanDanhGia` | CV-125 | B3 | US-049 |
| `ThanhVienNhomCM` | CV-025 | B1 | US-009 |
| `ThongBao` | CV-169 | B4 | US-068 |
| `UyQuyenDuyet` | CV-268 | B6 | US-114 |
| `VaiTro` | CV-014 | B1 | US-005 |

---

## 11. Điểm còn hở

Mỗi điểm là một chỗ tài liệu nguồn bỏ trống hoặc một quy ước riêng của tài liệu này. Lựa chọn tạm đã được dùng để lập bảng; đổi lựa chọn thì phải sửa các việc ở cột "Ảnh hưởng tới".

| Mã | Vấn đề | Lựa chọn tạm | Ảnh hưởng tới | Phụ thuộc vào |
|---|---|---|---|---|
| K-1 | Sáu loại việc được giao không có loại cho hạ tầng và vận hành: dựng bộ khung ứng dụng, sao lưu và phục hồi, triển khai lên máy chủ Khoa | Xếp ba việc này vào loại Tài liệu, vì thứ bàn giao kiểm được là quy ước, quy trình và hướng dẫn. Khối lượng thật của chúng phụ thuộc công nghệ, nên cỡ L là ước lượng thô | CV-004, CV-186, CV-248; tải của sprint đầu và sprint cuối | Quyết định công nghệ (Q-16) |
| K-2 | Quy ước "mỗi việc phục vụ đúng một story" không khớp với việc ngang: chạy kịch bản chấp nhận của cả bậc, đo hiệu năng, sao lưu | Gắn việc ngang vào story đầu hoặc cuối của phần liên quan và đánh dấu "Ngang:". Một story được coi là xong khi các việc không ngang của nó xong | Mục 9; cách đọc cột Điểm ở mục 10.1 | Không cần hỏi |
| K-3 | Cỡ S, M, L chưa được hiệu chỉnh bằng số liệu thật: chưa có nhóm, chưa có công nghệ, chưa có sprint nào đã chạy | Dùng tỷ lệ 1 : 2 : 4 và không quy ra giờ. Sau sprint đầu, đo lại và chỉnh hệ số trong kế hoạch sprint, không sửa cỡ từng việc | Mục 2.2, 2.3; `docs/planning/sprint-plan.md` | Số liệu của sprint đầu |
| K-4 | `HocKy` và `KhoaTuyenSinh` chỉ được lập ở B4 (CV-176) trong khi `PhienBanCTDT.hocKyHieuLuc` đã có từ B2 (CV-055) | Chấp nhận: ở B2 và B3 mọi phiên bản đều ở Nháp nên `hocKyHieuLuc` còn trống. Phương án khác là dời CV-176 và CV-179 về B2 | CV-055, CV-176, CV-179 | Không cần hỏi; đổi nếu B2 cần hiển thị học kỳ |
| K-5 | Tham số nghiệp vụ (thời hạn phiên, thang mức đóng góp, dung lượng tệp, số ngày nhắc hạn) và cấu hình đồng bộ không có thực thể trong từ điển dữ liệu (E-7) | Tham số nghiệp vụ nằm trong tệp cấu hình dựng ở CV-004; cấu hình kết nối và lịch đồng bộ có nơi lưu riêng dựng ở CV-245, sửa được trên màn hình | CV-004, CV-114, CV-105, CV-245, CV-274 | Quyết định công nghệ (Q-16); E-7 |
| K-6 | Nơi lưu tệp đính kèm và hồ sơ căn cứ (`TaiLieuDinhKem.duongDan`, `HoSoDeXuat.duongDan`) chưa được nêu | Một cơ chế tải lên và tải xuống dùng chung, dựng ở CV-105, dùng lại ở CV-143. Tệp nằm trên máy chủ của Khoa cùng với ứng dụng và thuộc phạm vi sao lưu của CV-186 | CV-105, CV-143, CV-186 | Quyết định công nghệ (Q-16); dung lượng máy chủ Khoa |
| K-7 | Bốn việc cần chạy theo lịch (kích hoạt đầu học kỳ, đồng bộ, nhắc hạn, hết hạn ủy quyền) nhưng chưa có mô tả cơ chế chạy định kỳ | Một cơ chế chạy định kỳ dùng chung nằm trong khối ứng dụng, dựng lần đầu ở CV-183; ba việc sau dùng lại. Mỗi tác vụ phải chạy lại được mà không sinh kết quả kép | CV-183, CV-250, CV-269, CV-274 | Quyết định công nghệ (Q-16) |
| K-8 | Chưa có bộ dữ liệu mẫu cho kiểm thử: khung thật của chương trình mã 1024034, 500 sinh viên kèm kết quả học tập, tệp 1000 dòng | Khung lấy từ tệp Excel Khoa đang dùng; sinh viên và kết quả học tập là dữ liệu giả tự sinh. Việc chuẩn bị dữ liệu nằm trong các việc chạy kịch bản chấp nhận của từng bậc | CV-052, CV-097, CV-199, CV-244, CV-222, CV-093 | Khoa cung cấp tệp Excel khung; Phòng Đào tạo cho phép dùng dữ liệu thật hay không |
