# TỪ ĐIỂN DỮ LIỆU v0.1

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-11 |
| Đi kèm | `docs/design/erd.md` (quan hệ, quyết định mô hình M-1..M-9, điểm hở E-1..E-11) |
| Nguồn | `docs/requirement/REQUIREMENTS.md` mục 4.2, 4.3, 6, 7, 11 |
| Mức | Logic — kiểu dữ liệu ở đây là kiểu nghiệp vụ, không phải kiểu của hệ quản trị cơ sở dữ liệu |

---

## Quy ước

- **Khóa.** Mọi thực thể có một khóa đại diện `id`, không liệt kê trong bảng. Dòng "Duy nhất" dưới mỗi thực thể ghi khóa tự nhiên.
- **Tên thuộc tính** theo cách viết của SRS mục 4.3: không dấu, chữ thường đầu, viết liền (`maHocPhan`, `soTinChi`).
- **Cột BB:** `C` = bắt buộc · `K` = được để trống.
- **Dấu ⊕** trước tên: thuộc tính không có trong SRS mục 4.2, được thêm ở mô hình này.
- **Kiểu:**

| Kiểu | Nghĩa |
|---|---|
| Chuỗi | Văn bản ngắn một dòng |
| Văn bản | Văn bản dài, có thể có định dạng (FR-46) |
| Số nguyên · Số thực | Số thực dùng cho tín chỉ và điểm; **cấm lưu tín chỉ bằng số nguyên** (EC-02) |
| Logic | Có / không |
| Ngày · Thời điểm | Ngày lịch · ngày kèm giờ |
| Liệt kê | Một giá trị trong danh sách cố định; danh sách ghi ở cột mô tả |
| JSON | Dữ liệu có cấu trúc lưu nguyên khối |
| → `X` | Tham chiếu tới một dòng của thực thể `X` |

---

## 1. Tổ chức và người dùng

### `DonVi`

Đơn vị trong cây tổ chức Trường → Phòng Đào tạo, Trường → Khoa (FR-01). Nhóm chuyên môn là thực thể riêng.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maDonVi | Chuỗi | C | |
| tenDonVi | Chuỗi | C | |
| loaiDonVi | Liệt kê | C | Trường · Khoa · Phòng |
| donViCha | → `DonVi` | K | Chỉ nút Trường được để trống |
| ⊕ trangThai | Liệt kê | C | Đang hoạt động · Ngừng hoạt động. Không xóa đơn vị đã có dữ liệu |

Duy nhất: `maDonVi`.

### `NhomChuyenMon`

Nhóm chuyên môn thuộc khoa (FR-02). Người điều phối không lưu ở đây — xem `ThanhVienNhomCM`.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maNhom | Chuỗi | C | |
| tenNhom | Chuỗi | C | |
| khoa | → `DonVi` | C | Đơn vị loại Khoa |
| ⊕ trangThai | Liệt kê | C | Đang sử dụng · Ngừng sử dụng |

Duy nhất: `maNhom`.

### `NguoiDung`

Tài khoản của mọi vai trò, kể cả sinh viên. Không xóa cứng tài khoản đã phát sinh giao dịch (FR-06, EC-51).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maNguoiDung | Chuỗi | C | Mã cán bộ hoặc mã sinh viên |
| hoTen | Chuỗi | C | |
| email | Chuỗi | K | Bắt buộc với người nhận thông báo qua email (FR-64) |
| donVi | → `DonVi` | K | Trống với sinh viên |
| trangThai | Liệt kê | C | Hoạt động · Vô hiệu hóa |
| ⊕ tenDangNhap | Chuỗi | C | Tài khoản nội bộ (quyết định tạm của Q-13) |
| ⊕ matKhauBam | Chuỗi | C | Không lưu mật khẩu dạng rõ (NFR-06) |

Duy nhất: `maNguoiDung`; `tenDangNhap`.

### `VaiTro`

Sáu vai trò R1..R6 của SRS mục 3.1.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maVaiTro | Chuỗi | C | |
| tenVaiTro | Chuỗi | C | |
| moTa | Chuỗi | K | |

Duy nhất: `maVaiTro`.

### `PhanQuyen`

Một người dùng giữ một vai trò trong một phạm vi, có thời hạn (FR-07). Mọi thay đổi ở đây ghi nhật ký (FR-10).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nguoiDung | → `NguoiDung` | C | |
| vaiTro | → `VaiTro` | C | |
| loaiPhamVi | Liệt kê | C | Toàn hệ thống · Đơn vị · Theo phân công. "Theo phân công" nghĩa là phạm vi đọc từ `PhanCongGiamDoc` hoặc `ThanhVienNhomCM` (M-7) |
| donViPhamVi | → `DonVi` | K | Bắt buộc khi `loaiPhamVi` = Đơn vị |
| tuNgay | Ngày | C | |
| denNgay | Ngày | K | Trống = không thời hạn |

Duy nhất: (`nguoiDung`, `vaiTro`, `donViPhamVi`, `tuNgay`).

### `ThanhVienNhomCM`

Giảng viên thuộc nhóm chuyên môn, quan hệ n–n (FR-03). Dòng có vai trò "Điều phối" chính là việc chỉ định Điều phối nhóm chuyên môn (FR-04).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nhomChuyenMon | → `NhomChuyenMon` | C | |
| giangVien | → `NguoiDung` | C | |
| vaiTroTrongNhom | Liệt kê | C | Thành viên · Điều phối |
| ⊕ tuNgay | Ngày | C | Thời gian hiệu lực mà FR-04 yêu cầu |
| ⊕ denNgay | Ngày | K | |

Ràng buộc: tại một thời điểm, mỗi nhóm có nhiều nhất một dòng "Điều phối" đang hiệu lực.

### `PhanCongGiamDoc`

Giám đốc CTĐT phụ trách 1..n chương trình (FR-08, FR-26).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| giamDoc | → `NguoiDung` | C | |
| chuongTrinh | → `ChuongTrinhDaoTao` | C | |
| ngayBatDau | Ngày | C | |
| ngayKetThuc | Ngày | K | |

### `UyQuyenDuyet`

Ủy quyền phê duyệt có thời hạn; hết hạn tự thu hồi (FR-09, EC-25).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nguoiUyQuyen | → `NguoiDung` | C | |
| nguoiDuocUyQuyen | → `NguoiDung` | C | Khác `nguoiUyQuyen` |
| phamVi | → `CauHinhCapDuyet` | K | Cấp duyệt được ủy quyền. Trống = mọi cấp mà người ủy quyền đang duyệt |
| ⊕ tuNgay | Ngày | C | |
| denNgay | Ngày | C | "Thời hạn" trong SRS |
| ⊕ trangThai | Liệt kê | C | Hiệu lực · Hết hạn · Đã thu hồi |

---

## 2. Học phần

### `HocPhan`

Học phần trong danh mục dùng chung (FR-11..16). Không gắn phiên bản; thông tin của học phần tại thời điểm ban hành được chép vào dòng khung (M-5).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maHocPhan | Chuỗi | C | Ví dụ 3190111 |
| tenHocPhan | Chuỗi | C | Tên tiếng Việt (FR-13) |
| tenTiengAnh | Chuỗi | K | |
| soTinChi | Số thực | C | ≥ 0; nhận 0 và số lẻ như 2.5 (BR-01) |
| khoaPhuTrach | → `DonVi` | C | Có thể là khoa khác (FR-05) |
| nhomPhuTrach | → `NhomChuyenMon` | K | Trống với học phần của khoa khác |
| loaiHocPhan | Liệt kê | C | Lý thuyết · Thực hành · Thí nghiệm · Đồ án · Đồ án tốt nghiệp · Thực tập · Học phần điều kiện |
| trangThai | Liệt kê | C | Đang sử dụng · Ngừng mở lớp · Đã hủy. "Ngừng mở lớp" đòi một quan hệ QH5 trỏ tới học phần thay thế (FR-15) |
| ⊕ nhomTuongDuong | → `NhomHocPhanTuongDuong` | K | Một học phần thuộc nhiều nhất một nhóm (M-4) |

Duy nhất: `maHocPhan`.

### `QuanHeHocPhan`

Quan hệ có hướng giữa hai học phần ở cấp danh mục (FR-18..20).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| hocPhanNguon | → `HocPhan` | C | Học phần phải học trước / đạt trước / học cùng; hoặc học phần ngừng mở lớp (QH5) |
| hocPhanDich | → `HocPhan` | C | Khác `hocPhanNguon` |
| loaiQuanHe | Liệt kê | C | QH1 Học trước · QH2 Tiên quyết · QH3 Song hành · QH5 Thay thế |
| nguongDiem | Số thực | K | "Điều kiện điểm kèm theo"; chỉ dùng với QH2 (FR-19). Xem E-1 |

Duy nhất: (`hocPhanNguon`, `hocPhanDich`, `loaiQuanHe`). Ràng buộc: đồ thị QH1 và QH2 không có chu trình (BR-11).

### `NhomHocPhanTuongDuong`

Nhóm học phần thay thế được cho nhau khi xét tốt nghiệp (FR-21, DEC-06). Thành viên là các học phần có `nhomTuongDuong` trỏ tới nhóm. Không gắn phiên bản (EC-16; xem E-11).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maNhom | Chuỗi | C | |
| ghiChu | Chuỗi | K | |

Duy nhất: `maNhom`.

---

## 3. Chương trình đào tạo

### `ChuongTrinhDaoTao`

Danh tính của một chương trình. Phần mô tả nằm ở `PhienBanCTDT` (M-3).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maChuongTrinh | Chuỗi | C | Ví dụ 1024034 |
| ⊕ khoa | → `DonVi` | C | Khoa quản lý |
| trinhDo | Liệt kê | C | Kỹ sư · Cử nhân (FR-24) |
| trangThai | Liệt kê | C | Đang sử dụng · Ngừng sử dụng. Cấm xóa cứng (EC-50) |
| ⊕ nhanBanTu | → `PhienBanCTDT` | K | Phiên bản được dùng làm nền khi nhân bản (FR-25) |

Duy nhất: `maChuongTrinh`.

### `PhienBanCTDT`

Một phiên bản của chương trình. Bất biến từ khi rời trạng thái Nháp (FR-71, BR-23).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| chuongTrinh | → `ChuongTrinhDaoTao` | C | |
| soPhienBan | Chuỗi | K | Dạng `<Chính>.<Phụ>` (BR-24). Trống khi còn Nháp |
| trangThai | Liệt kê | C | Nháp · Chờ hiệu lực · Đang hiệu lực · Lịch sử (M-2) |
| tenChuongTrinh | Chuỗi | C | |
| maNganh | Chuỗi | C | Ví dụ 7480201 |
| tenNganh | Chuỗi | C | |
| soHocKy | Số nguyên | C | Ví dụ 8 |
| tongTinChi | Số thực | C | Tổng tín chỉ yêu cầu, ví dụ 130 |
| tinChiBatBuoc | Số thực | C | Ví dụ 122 |
| tinChiTuChon | Số thực | C | Ví dụ 8. `tinChiBatBuoc` + `tinChiTuChon` = `tongTinChi` (BR-03) |
| soQuyetDinh | Chuỗi | K | Số quyết định ban hành. Bắt buộc khi rời Nháp |
| ngayKy | Ngày | K | Bắt buộc khi rời Nháp |
| hocKyHieuLuc | → `HocKy` | K | Bắt buộc khi rời Nháp; hiệu lực từ đầu học kỳ (BR-25) |
| nguoiBanHanh | → `NguoiDung` | K | Bắt buộc khi rời Nháp |
| ⊕ thoiDiemBanHanh | Thời điểm | K | |
| ⊕ phienBanTruoc | → `PhienBanCTDT` | K | Phiên bản làm nền; trống ở phiên bản đầu tiên |
| ⊕ dinhChinhCho | → `PhienBanCTDT` | K | Phiên bản ban hành nhầm mà bản này đính chính (FR-75) |
| ⊕ lyDoDinhChinh | Chuỗi | K | Bắt buộc khi có `dinhChinhCho` (DEC-08) |
| ⊕ deXuatNguon | → `DeXuatThayDoi` | K | Trống ở phiên bản khởi tạo và bản đính chính. Xem E-3 |
| ⊕ lyDoChapNhanLechTC | Chuỗi | K | Lý do ghi đè khi tổng tín chỉ tính được khác số khai báo (FR-78) |

Duy nhất: (`chuongTrinh`, `soPhienBan`). Ràng buộc: mỗi chương trình có nhiều nhất một phiên bản Đang hiệu lực (BR-22) và nhiều nhất một phiên bản Nháp. Khóa áp dụng ghi ở `ApDungPhienBan`.

### `DongKhungCTDT`

Một dòng của khung chương trình, tương ứng một dòng trong bảng Excel hiện hành (FR-27). Đồng thời là cặp (phiên bản chương trình, học phần) mà các ma trận chuẩn đầu ra bám vào (M-6).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| phienBan | → `PhienBanCTDT` | C | |
| thuTu | Số nguyên | C | Cột TT |
| hocKyDuKien | Số nguyên | C | 1..`soHocKy` của phiên bản (EC-08) |
| hocPhan | → `HocPhan` | C | |
| kyHieu | Chuỗi | K | Mã khối kiến thức, giữ nguyên giá trị gốc (DEC-05). Xem E-2 |
| laTuChon | Logic | C | Cột Tự chọn |
| nhomTuChon | → `NhomTuChon` | K | Chỉ có khi `laTuChon` (EC-05); cùng phiên bản với dòng khung |
| htDA | Logic | C | Cột HT ĐA. Lưu nguyên trạng, chưa gắn logic (Q-04) |
| tqDA | Logic | C | Cột TQ ĐA. Như trên |
| diemHoc | Số thực | K | Cột Điểm học. Giá trị mẫu 3 · 3.5 · 4 |
| diemChuyen | Số thực | K | Cột Điểm chuyển |
| ghiChu | Chuỗi | K | |
| ⊕ deCuong | → `DeCuongChiTiet` | K | Bản đề cương được ghim (M-1); phải thuộc đúng `hocPhan`. Bắt buộc khi phiên bản rời Nháp (EC-44) |
| ⊕ tenHocPhanChup | Chuỗi | K | Tên học phần tại thời điểm ban hành (M-5). Ghi khi phiên bản rời Nháp |
| ⊕ soTinChiChup | Số thực | K | Số tín chỉ tại thời điểm ban hành (M-5). Ghi khi phiên bản rời Nháp |

Duy nhất: (`phienBan`, `hocPhan`) — một học phần không xuất hiện hai lần trong một khung (EC-06, FR-81).

### `NhomTuChon`

Nhóm học phần tự chọn của một phiên bản (FR-29).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| phienBan | → `PhienBanCTDT` | C | |
| maNhom | Chuỗi | C | |
| tenNhom | Chuỗi | C | |
| soTinChiToiThieu | Số thực | K | |
| soHocPhanToiThieu | Số nguyên | K | |

Duy nhất: (`phienBan`, `maNhom`). Ràng buộc: có ít nhất một trong hai mức tối thiểu. Tổng tín chỉ các học phần trong nhóm được phép lớn hơn mức tối thiểu (BR-04).

### `KhoiKienThuc`

Danh mục khối kiến thức. Xem E-2.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maKhoi | Chuỗi | C | Khớp với `DongKhungCTDT.kyHieu` khi có |
| tenKhoi | Chuỗi | C | |
| soTinChiYeuCau | Số thực | K | |

Duy nhất: `maKhoi`.

### ⊕ `RangBuocKhung`

Ràng buộc học trước / tiên quyết / song hành của một dòng khung, chép từ `QuanHeHocPhan` khi ban hành (M-5). Ở phiên bản Nháp, bảng này tương ứng ba cột "HP cần học trước", "HP song hành", "Cần HP tiên quyết" của file Excel.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| dongKhung | → `DongKhungCTDT` | C | Dòng của học phần đích |
| hocPhanNguon | → `HocPhan` | C | Có thể không nằm trong khung (EC-13) |
| loaiQuanHe | Liệt kê | C | QH1 · QH2 · QH3 |
| nguongDiem | Số thực | K | Chỉ dùng với QH2. Xem E-1 |

Duy nhất: (`dongKhung`, `hocPhanNguon`, `loaiQuanHe`).

### ⊕ `KhoaTuyenSinh`

Khóa sinh viên, ví dụ K2023.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maKhoa | Chuỗi | C | |
| namNhapHoc | Số nguyên | C | |

Duy nhất: `maKhoa`.

### ⊕ `HocKy`

Học kỳ, ví dụ HK1 2023-2024.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maHocKy | Chuỗi | C | |
| namHoc | Chuỗi | C | Ví dụ 2023-2024 |
| thuTuTrongNam | Số nguyên | C | 1, 2, hoặc học kỳ hè |
| ngayBatDau | Ngày | K | Mốc để chuyển phiên bản Chờ hiệu lực → Đang hiệu lực (DEC-07) |

Duy nhất: `maHocKy`; (`namHoc`, `thuTuTrongNam`).

### ⊕ `ApDungPhienBan`

Ánh xạ Khóa sinh viên → Phiên bản CTĐT áp dụng (FR-74).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| khoaTuyenSinh | → `KhoaTuyenSinh` | C | |
| phienBan | → `PhienBanCTDT` | C | Không ở trạng thái Nháp |
| tuHocKy | → `HocKy` | C | Học kỳ bắt đầu áp dụng cho khóa này |

Duy nhất: (`khoaTuyenSinh`, `phienBan`). Ràng buộc: với một khóa và một chương trình, dòng có `tuHocKy` muộn nhất chưa vượt quá học kỳ đang xét là dòng có hiệu lực. Xem E-9.

---

## 4. Chuẩn đầu ra

### `PLO`

Chuẩn đầu ra của chương trình, khai báo theo phiên bản (FR-38, BR-17).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| phienBan | → `PhienBanCTDT` | C | |
| maPLO | Chuỗi | C | Ổn định qua các phiên bản để so sánh được |
| moTa | Văn bản | C | Tiếng Việt |
| moTaTiengAnh | Văn bản | K | |
| nhomNangLuc | Chuỗi | K | |
| thuTu | Số nguyên | C | |

Duy nhất: (`phienBan`, `maPLO`).

### `CLO`

Chuẩn đầu ra của học phần, thuộc một bản đề cương (FR-39, BR-18). Dùng chung cho mọi chương trình có học phần đó (DEC-03).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deCuong | → `DeCuongChiTiet` | C | |
| maCLO | Chuỗi | C | Ổn định qua các bản đề cương (M-1) |
| moTa | Văn bản | C | Tiếng Việt |
| moTaTiengAnh | Văn bản | K | FR-48 |
| mucNhanThuc | Chuỗi | K | |
| thuTu | Số nguyên | C | |

Duy nhất: (`deCuong`, `maCLO`).

### `MaTranCLO_PLO`

Mức đóng góp của một CLO vào một PLO, khai báo theo cặp (chương trình, học phần) (FR-40, BR-19).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| dongKhung | → `DongKhungCTDT` | C | Cặp (phiên bản chương trình, học phần) |
| clo | → `CLO` | C | Thuộc bản đề cương mà `dongKhung` đang ghim |
| plo | → `PLO` | C | Cùng phiên bản với `dongKhung` |
| mucDoDongGop | Liệt kê | C | I · R · M, hoặc 1 · 2 · 3 (BR-21) |

Duy nhất: (`dongKhung`, `clo`, `plo`).

### `MaTranHP_PLO`

Mức đóng góp của một học phần vào một PLO, suy diễn từ `MaTranCLO_PLO` và ghi đè được (FR-41). Xem E-5.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| dongKhung | → `DongKhungCTDT` | C | |
| plo | → `PLO` | C | Cùng phiên bản với `dongKhung` |
| mucDoDongGop | Liệt kê | C | Cùng thang với `MaTranCLO_PLO` |
| ⊕ laGhiDe | Logic | C | Có = người dùng nhập tay, không tính lại |

Duy nhất: (`dongKhung`, `plo`).

---

## 5. Đề cương chi tiết

### `DeCuongChiTiet`

Một bản đề cương của một học phần. Mỗi học phần có một đề cương dùng chung (FR-44, DEC-02), được lưu thành chuỗi các bản đánh số; bản đã ban hành là bất biến (M-1).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| hocPhan | → `HocPhan` | C | |
| soPhienBanNoiBo | Số nguyên | C | Tăng dần theo học phần |
| trangThai | Liệt kê | C | Nháp · Đã ban hành · Lịch sử (M-2) |
| moTaHocPhan | Văn bản | K | Bắt buộc khi ban hành |
| ⊕ moTaTiengAnh | Văn bản | K | FR-48 |
| mucTieu | Văn bản | K | Bắt buộc khi ban hành |
| phuongPhapGiangDay | Văn bản | K | |
| ⊕ phuongPhapDanhGia | Văn bản | K | Phần "phương pháp đánh giá" của FR-45 |
| taiLieuThamKhao | Văn bản | K | |
| ⊕ diemLiet | Số thực | K | Điểm liệt của học phần (FR-52) |
| ⊕ phienBanTruoc | → `DeCuongChiTiet` | K | Bản làm nền |
| ⊕ deXuatNguon | → `DeXuatThayDoi` | K | Đề xuất sinh ra bản này |
| ⊕ thoiDiemBanHanh | Thời điểm | K | |

Duy nhất: (`hocPhan`, `soPhienBanNoiBo`). Ràng buộc: mỗi học phần có nhiều nhất một bản Nháp và nhiều nhất một bản Đã ban hành. Phần "thông tin chung" của FR-45 lấy từ `HocPhan`.

### `NoiDungTheoTuan`

Nội dung giảng dạy theo tuần hoặc chương (FR-45).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deCuong | → `DeCuongChiTiet` | C | |
| tuanChuong | Chuỗi | C | Nhãn tuần hoặc chương |
| ⊕ thuTu | Số nguyên | C | |
| noiDung | Văn bản | C | |
| hoatDongDayHoc | Văn bản | K | |

### ⊕ `NoiDungTuan_CLO`

CLO mà một tuần / chương hướng tới.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| noiDungTheoTuan | → `NoiDungTheoTuan` | C | |
| clo | → `CLO` | C | Cùng bản đề cương |

Duy nhất: (`noiDungTheoTuan`, `clo`).

### `ThanhPhanDanhGia`

Một thành phần của công thức điểm (FR-49..52).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deCuong | → `DeCuongChiTiet` | C | |
| maThanhPhan | Chuỗi | C | |
| tenThanhPhan | Chuỗi | C | Ví dụ Chuyên cần, Giữa kỳ |
| trongSo | Số thực | C | Thuộc (0, 100] (BR-13). Tổng theo đề cương bằng đúng 100 (BR-12) |
| hinhThucDanhGia | Chuỗi | K | |
| laDieuKien | Logic | C | Thành phần điều kiện (FR-51) |
| nguongDieuKien | Số thực | K | Bắt buộc khi `laDieuKien` (BR-15) |
| ⊕ diemLiet | Số thực | K | Điểm liệt của thành phần (FR-52) |

Duy nhất: (`deCuong`, `maThanhPhan`).

### `MapThanhPhan_CLO`

Thành phần đánh giá đo CLO nào (FR-53). Mỗi CLO phải có ít nhất một dòng (BR-14).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| thanhPhanDanhGia | → `ThanhPhanDanhGia` | C | |
| clo | → `CLO` | C | Cùng bản đề cương |
| tyTrong | Số thực | K | |

Duy nhất: (`thanhPhanDanhGia`, `clo`).

### `TaiLieuDinhKem`

Bản đề cương đã ký, đính kèm theo bản đề cương (FR-47).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deCuong | → `DeCuongChiTiet` | C | |
| tenTep | Chuỗi | C | |
| loaiTep | Liệt kê | C | PDF · Word |
| duongDan | Chuỗi | C | Đường dẫn lưu trữ |
| nguoiTaiLen | → `NguoiDung` | C | |
| thoiDiem | Thời điểm | C | |

---

## 6. Quy trình phê duyệt

### `DeXuatThayDoi`

Đề xuất thay đổi dữ liệu đã ban hành (FR-55..60, FR-108).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maDeXuat | Chuỗi | C | |
| loaiDeXuat | Liệt kê | C | Sửa công thức điểm · Sửa PLO/CLO · Sửa nội dung đề cương · Sửa khung chương trình · Sửa quan hệ học phần · Sửa thông tin chương trình (FR-56) · ⊕ Thay đổi tổ chức / phân công (UC-09; xem E-4) |
| loaiDoiTuong | Liệt kê | C | Học phần · Chương trình đào tạo · Nhóm chuyên môn. Nửa đầu của "đối tượng tác động" (E-4) |
| maDoiTuong | Chuỗi | C | `maHocPhan`, `maChuongTrinh` hoặc `maNhom` của đối tượng chính |
| nguoiTao | → `NguoiDung` | C | |
| tieuDe | Chuỗi | C | |
| lyDo | Văn bản | C | |
| trangThai | Liệt kê | C | Nháp · Chờ Điều phối nhóm CM · Chờ Giám đốc CTĐT · Chờ Phòng Đào tạo · Đã duyệt · Đang hiệu lực · Từ chối · Thu hồi (SRS mục 6.1.2) |
| thoiDiemTao | Thời điểm | C | |
| nguonPhatSinh | Liệt kê | C | Trường · Khoa (FR-108) |
| soVanBanCanCu | Chuỗi | K | Số công văn / quyết định căn cứ (FR-108) |
| ⊕ lanGui | Số nguyên | C | Số lần đã gửi duyệt; tăng mỗi lần gửi lại sau khi bị trả (BR-29) |
| ⊕ soQuyetDinh | Chuỗi | K | Phòng Đào tạo nhập khi duyệt cấp cuối (SRS mục 6.1.4) |
| ⊕ ngayKy | Ngày | K | Như trên |
| ⊕ hocKyHieuLuc | → `HocKy` | K | Như trên |

Duy nhất: `maDeXuat`.

### `NoiDungThayDoi`

Một thay đổi trong đề xuất, lưu giá trị trước và sau để dựng bảng so sánh (FR-58).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deXuat | → `DeXuatThayDoi` | C | |
| loaiThucThe | Chuỗi | C | Tên thực thể bị tác động. Nửa đầu của "thực thể bị tác động" (E-4) |
| maBanGhi | Chuỗi | K | Dòng bị sửa hoặc xóa; trống khi thêm mới |
| giaTriCu | JSON | K | Trống khi thêm mới |
| giaTriMoi | JSON | K | Trống khi xóa |
| ⊕ phienBanGoc | Chuỗi | K | Dấu phiên bản của đối tượng lúc soạn; dùng để phát hiện đối tượng đã đổi trước khi ghi (EC-27) |

### `BuocDuyet`

Một lượt duyệt của một người ở một cấp. Một cấp có thể cần nhiều người (EC-22, EC-23), mỗi người một dòng. Là lịch sử duyệt mà FR-67 yêu cầu.

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deXuat | → `DeXuatThayDoi` | C | |
| ⊕ lanGui | Số nguyên | C | Thuộc lần gửi nào của đề xuất |
| capDuyet | → `CauHinhCapDuyet` | C | |
| nguoiDuyet | → `NguoiDung` | C | Người phải duyệt theo SRS mục 6.1.3 |
| hanhDong | Liệt kê | C | Chờ · Đồng ý · Trả lại · Từ chối (FR-59) |
| yKien | Văn bản | K | Bắt buộc, tối thiểu 20 ký tự khi Trả lại hoặc Từ chối (BR-28) |
| thoiDiem | Thời điểm | K | Trống khi còn Chờ |
| coBoQua | Logic | C | Cấp được bỏ qua vì người duyệt là người tạo đề xuất (FR-61, BR-27) |
| ⊕ lyDoBoQua | Chuỗi | K | Bắt buộc khi `coBoQua` |
| ⊕ nguoiThucHien | → `NguoiDung` | K | Người thực sự bấm duyệt khi khác `nguoiDuyet` |
| ⊕ uyQuyen | → `UyQuyenDuyet` | K | Căn cứ khi duyệt thay theo ủy quyền (FR-09) |
| ⊕ laCanThiep | Logic | C | Phòng Đào tạo duyệt thay ở cấp này (BR-31) |

### ⊕ `CauHinhCapDuyet`

Các cấp duyệt và vai trò duyệt ở từng cấp (DEC-04).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| capDuyet | Số nguyên | C | 1, 2, 3 |
| tenCap | Chuỗi | C | |
| vaiTroDuyet | → `VaiTro` | C | |
| dangDung | Logic | C | |

Duy nhất: `capDuyet`.

### `BinhLuan`

Bình luận trên đề xuất, không ảnh hưởng luồng duyệt (FR-62).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deXuat | → `DeXuatThayDoi` | C | |
| nguoiBinhLuan | → `NguoiDung` | C | |
| noiDung | Văn bản | C | |
| thoiDiem | Thời điểm | C | |

### `ThongBao`

Thông báo trong ứng dụng (FR-63).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nguoiNhan | → `NguoiDung` | C | |
| loaiThongBao | Chuỗi | C | |
| noiDung | Chuỗi | C | |
| duongDanLienKet | Chuỗi | K | |
| trangThaiDoc | Liệt kê | C | Chưa đọc · Đã đọc |
| ⊕ deXuat | → `DeXuatThayDoi` | K | Đề xuất mà thông báo nói tới |
| ⊕ thoiDiem | Thời điểm | C | |
| ⊕ daGuiEmail | Logic | C | Đã gửi kèm qua email (FR-64) |

### `HoSoDeXuat`

Hồ sơ căn cứ đính kèm đề xuất, xem được ở mọi cấp duyệt (FR-109).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| deXuat | → `DeXuatThayDoi` | C | |
| loaiHoSo | Liệt kê | C | Tờ trình · Biên bản · Biên bản họp hội đồng · Biên bản thẩm định · Công văn |
| tenTep | Chuỗi | C | |
| duongDan | Chuỗi | C | Đường dẫn lưu trữ |
| nguoiTaiLen | → `NguoiDung` | C | |
| thoiDiem | Thời điểm | C | |

---

## 7. Sinh viên và kết quả học tập

### `SinhVien`

Sinh viên, đến từ Excel hoặc cơ sở dữ liệu có sẵn (FR-96, FR-98).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| maSinhVien | Chuỗi | C | |
| hoTen | Chuỗi | C | |
| khoaTuyenSinh | → `KhoaTuyenSinh` | C | |
| nganh | Chuỗi | C | Mã ngành |
| trangThai | Liệt kê | C | Đang học · Bảo lưu · Thôi học · Đã tốt nghiệp. Xem E-10 |
| ⊕ nguoiDung | → `NguoiDung` | K | Tài khoản đăng nhập. Xem E-8 |
| ⊕ nguonDuLieu | Liệt kê | C | Excel · Cơ sở dữ liệu có sẵn (FR-100) |

Duy nhất: `maSinhVien`.

### ⊕ `GhiDanhCTDT`

Sinh viên theo một chương trình, ở một phiên bản cụ thể (FR-74, FR-88, BR-26; M-8).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| sinhVien | → `SinhVien` | C | |
| phienBanApDung | → `PhienBanCTDT` | C | "Phiên bản CTĐT áp dụng" trong SRS; không ở trạng thái Nháp |
| loaiGhiDanh | Liệt kê | C | Chính · Song ngành (EC-34) |
| tuHocKy | → `HocKy` | K | |
| laNgoaiLe | Logic | C | Có = phiên bản được gán riêng cho sinh viên, không đổi theo `ApDungPhienBan` của khóa (EC-33, EC-35, EC-37) |
| canCu | Chuỗi | K | Số quyết định chuyển đổi. Bắt buộc khi `laNgoaiLe` (BR-26) |
| trangThai | Liệt kê | C | Đang theo học · Đã chuyển · Đã kết thúc |

Ràng buộc: mỗi sinh viên có nhiều nhất một dòng "Đang theo học" cho một chương trình.

### `KetQuaHocTap`

Kết quả một lần học một học phần. Hệ thống chỉ đọc, không nhập điểm (SRS mục 12).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| sinhVien | → `SinhVien` | C | |
| hocPhan | → `HocPhan` | C | |
| hocKy | → `HocKy` | C | |
| diemThang10 | Số thực | K | Trống khi Đang học hoặc Miễn |
| diemThang4 | Số thực | K | Thang dùng để so điều kiện tiên quyết (DEC-11) |
| diemChu | Chuỗi | K | |
| trangThai | Liệt kê | C | Đạt · Không đạt · Đang học · Miễn |
| ⊕ nguonDuLieu | Liệt kê | C | Excel · Cơ sở dữ liệu có sẵn (FR-100) |

Duy nhất: (`sinhVien`, `hocPhan`, `hocKy`). Học lại tạo dòng mới ở học kỳ khác; quy tắc lấy điểm cao nhất (EC-36).

### `KetQuaXetTotNghiep`

Kết quả một lần xét tốt nghiệp (FR-84..87).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| ghiDanh | → `GhiDanhCTDT` | C | Xét theo từng chương trình (EC-34) |
| thoiDiemXet | Thời điểm | C | |
| ketLuan | Liệt kê | C | Đủ điều kiện · Chưa đủ điều kiện |
| danhSachThieuHut | JSON | K | Các hạng mục còn thiếu (FR-86); trống khi đủ điều kiện |
| ⊕ nguoiXet | → `NguoiDung` | K | Trống khi hệ thống tự tính lại (EC-43) |

---

## 8. Hệ thống

### `NhatKyHeThong`

Nhật ký mọi thao tác. Chỉ ghi thêm, không sửa, không xóa (FR-105, NFR-10).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nguoiThucHien | → `NguoiDung` | K | Trống khi hệ thống tự thực hiện |
| hanhDong | Chuỗi | C | |
| loaiThucThe | Chuỗi | C | Nửa đầu của "thực thể tác động" |
| maBanGhi | Chuỗi | K | |
| giaTriCu | JSON | K | |
| giaTriMoi | JSON | K | |
| diaChiIP | Chuỗi | K | |
| thoiDiem | Thời điểm | C | |

### `PhienNhapLieu`

Một lần nhập Excel, kể cả lần chạy thử (FR-34, FR-101).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| loaiNhap | Liệt kê | C | Danh mục học phần · Khung chương trình · Danh sách sinh viên · Kết quả học tập (FR-96) |
| tenTep | Chuỗi | C | |
| nguoiThucHien | → `NguoiDung` | C | |
| tongDong | Số nguyên | C | |
| soDongThanhCong | Số nguyên | C | |
| soDongLoi | Số nguyên | C | Khác 0 thì không ghi dòng nào (FR-35) |
| trangThai | Liệt kê | C | Chạy thử · Đã ghi · Không ghi do lỗi |
| ⊕ thoiDiem | Thời điểm | C | |
| ⊕ baoCaoLoi | JSON | K | Lỗi và cảnh báo theo từng dòng (FR-34) |

### `LogDongBo`

Một lần đồng bộ với cơ sở dữ liệu có sẵn (FR-99).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| nguonDuLieu | Chuỗi | C | |
| thoiDiemBatDau | Thời điểm | C | |
| thoiDiemKetThuc | Thời điểm | K | |
| soBanGhi | Số nguyên | C | |
| trangThai | Liệt kê | C | Đang chạy · Thành công · Thất bại. Thất bại thì hoàn tác toàn bộ (EC-49) |
| thongBaoLoi | Chuỗi | K | |
| ⊕ soMauThuan | Số nguyên | C | Số bản ghi mâu thuẫn giữa hai nguồn đã xử lý theo quy tắc ưu tiên (FR-100, EC-48) |

### ⊕ `BenTichHop`

Bên gọi API, ví dụ ứng dụng dDUT (FR-94).

| Thuộc tính | Kiểu | BB | Mô tả, ràng buộc |
|---|---|---|---|
| tenBen | Chuỗi | C | |
| khoaBam | Chuỗi | C | Khóa truy cập riêng của bên này, lưu dạng băm (API-03) |
| gioiHanTanSuat | Số nguyên | K | Số lần gọi tối đa trong một đơn vị thời gian (API-04) |
| trangThai | Liệt kê | C | Hoạt động · Đã khóa |

Duy nhất: `tenBen`.
