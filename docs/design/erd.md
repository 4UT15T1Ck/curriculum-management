# SƠ ĐỒ THỰC THỂ – QUAN HỆ (ERD) v0.1

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-11 |
| Mức mô hình | **Logic** — thực thể, quan hệ, bản số. Chưa chọn hệ quản trị cơ sở dữ liệu, chưa có kiểu dữ liệu vật lý, chưa có chỉ mục |
| Nguồn | `docs/requirement/REQUIREMENTS.md` mục 4.2 (37 thực thể), mục 6, 7, 10, 11 |
| Thuộc tính | Xem `docs/design/data-dictionary.md` |
| Trạng thái | v0.1 — dựng trên các quyết định tạm của SRS (Q-03..Q-28 chưa trả lời). Các điểm mô hình phải tự quyết được ghi ở mục 3; các điểm còn hở ở mục 5 |

Sơ đồ viết bằng Mermaid, tách theo nhóm để đọc được. Một thực thể có thể xuất hiện ở nhiều sơ đồ; nó được định nghĩa ở nhóm ghi trong mục 1.

---

## 1. Danh sách thực thể

45 thực thể: 37 lấy từ SRS mục 4.2, 8 bổ sung (đánh dấu **mới**, lý do ở mục 4).

| Nhóm | Thực thể |
|---|---|
| Tổ chức và người dùng | `DonVi` · `NhomChuyenMon` · `NguoiDung` · `VaiTro` · `PhanQuyen` · `ThanhVienNhomCM` · `PhanCongGiamDoc` · `UyQuyenDuyet` |
| Học phần | `HocPhan` · `QuanHeHocPhan` · `NhomHocPhanTuongDuong` |
| Chương trình đào tạo | `ChuongTrinhDaoTao` · `PhienBanCTDT` · `DongKhungCTDT` · `NhomTuChon` · `KhoiKienThuc` · `RangBuocKhung` **mới** · `KhoaTuyenSinh` **mới** · `HocKy` **mới** · `ApDungPhienBan` **mới** |
| Chuẩn đầu ra | `PLO` · `CLO` · `MaTranCLO_PLO` · `MaTranHP_PLO` |
| Đề cương chi tiết | `DeCuongChiTiet` · `NoiDungTheoTuan` · `NoiDungTuan_CLO` **mới** · `ThanhPhanDanhGia` · `MapThanhPhan_CLO` · `TaiLieuDinhKem` |
| Quy trình phê duyệt | `DeXuatThayDoi` · `NoiDungThayDoi` · `BuocDuyet` · `CauHinhCapDuyet` **mới** · `BinhLuan` · `ThongBao` · `HoSoDeXuat` |
| Sinh viên và kết quả học tập | `SinhVien` · `GhiDanhCTDT` **mới** · `KetQuaHocTap` · `KetQuaXetTotNghiep` |
| Hệ thống | `NhatKyHeThong` · `PhienNhapLieu` · `LogDongBo` · `BenTichHop` **mới** |

---

## 2. Sơ đồ theo nhóm

Ký hiệu bản số: `||` đúng một · `|o` không hoặc một · `o{` không hoặc nhiều.

### 2.1. Tổ chức và người dùng

```mermaid
erDiagram
    DonVi |o--o{ DonVi : "là đơn vị cha của"
    DonVi ||--o{ NhomChuyenMon : "là khoa chủ quản của"
    DonVi |o--o{ NguoiDung : "là nơi công tác của"
    NguoiDung ||--o{ PhanQuyen : "được cấp"
    VaiTro ||--o{ PhanQuyen : "được gán qua"
    DonVi |o--o{ PhanQuyen : "là phạm vi của"
    NhomChuyenMon ||--o{ ThanhVienNhomCM : "gồm"
    NguoiDung ||--o{ ThanhVienNhomCM : "tham gia"
    NguoiDung ||--o{ PhanCongGiamDoc : "làm Giám đốc theo"
    ChuongTrinhDaoTao ||--o{ PhanCongGiamDoc : "được phụ trách theo"
    NguoiDung ||--o{ UyQuyenDuyet : "ủy quyền"
    NguoiDung ||--o{ UyQuyenDuyet : "nhận ủy quyền"
    CauHinhCapDuyet |o--o{ UyQuyenDuyet : "giới hạn cấp của"
```

### 2.2. Học phần

```mermaid
erDiagram
    DonVi ||--o{ HocPhan : "là khoa phụ trách của"
    NhomChuyenMon |o--o{ HocPhan : "phụ trách"
    NhomHocPhanTuongDuong |o--o{ HocPhan : "gồm"
    HocPhan ||--o{ QuanHeHocPhan : "là học phần nguồn của"
    HocPhan ||--o{ QuanHeHocPhan : "là học phần đích của"
    HocPhan ||--o{ DeCuongChiTiet : "có các bản đề cương"
```

### 2.3. Chương trình đào tạo, khung và phiên bản

```mermaid
erDiagram
    DonVi ||--o{ ChuongTrinhDaoTao : "là khoa quản lý của"
    PhienBanCTDT |o--o{ ChuongTrinhDaoTao : "là bản gốc nhân bản của"
    ChuongTrinhDaoTao ||--o{ PhienBanCTDT : "có"
    PhienBanCTDT |o--o{ PhienBanCTDT : "là phiên bản trước của"
    PhienBanCTDT |o--o{ PhienBanCTDT : "được đính chính bởi"
    HocKy |o--o{ PhienBanCTDT : "là học kỳ hiệu lực của"
    NguoiDung |o--o{ PhienBanCTDT : "ban hành"
    DeXuatThayDoi |o--o{ PhienBanCTDT : "sinh ra"
    PhienBanCTDT ||--o{ DongKhungCTDT : "gồm"
    PhienBanCTDT ||--o{ NhomTuChon : "gồm"
    NhomTuChon |o--o{ DongKhungCTDT : "chứa"
    HocPhan ||--o{ DongKhungCTDT : "được xếp vào"
    KhoiKienThuc |o..o{ DongKhungCTDT : "khớp theo ký hiệu"
    DeCuongChiTiet |o--o{ DongKhungCTDT : "là bản đề cương được chụp của"
    DongKhungCTDT ||--o{ RangBuocKhung : "có ràng buộc"
    HocPhan ||--o{ RangBuocKhung : "là học phần nguồn của"
    PhienBanCTDT ||--o{ ApDungPhienBan : "áp dụng theo"
    KhoaTuyenSinh ||--o{ ApDungPhienBan : "được gán theo"
    HocKy ||--o{ ApDungPhienBan : "là mốc bắt đầu của"
```

Đường nét đứt giữa `KhoiKienThuc` và `DongKhungCTDT` không phải tham chiếu: dòng khung giữ ký hiệu khối dưới dạng chuỗi (`kyHieu`), khớp với `maKhoi` khi có và không bị ép phải khớp (E-2).

### 2.4. Đề cương chi tiết và chuẩn đầu ra

```mermaid
erDiagram
    DeCuongChiTiet |o--o{ DeCuongChiTiet : "là bản trước của"
    DeXuatThayDoi |o--o{ DeCuongChiTiet : "sinh ra"
    DeCuongChiTiet ||--o{ CLO : "khai báo"
    DeCuongChiTiet ||--o{ NoiDungTheoTuan : "gồm"
    NoiDungTheoTuan ||--o{ NoiDungTuan_CLO : "hướng tới"
    CLO ||--o{ NoiDungTuan_CLO : "được dạy ở"
    DeCuongChiTiet ||--o{ ThanhPhanDanhGia : "đánh giá bằng"
    ThanhPhanDanhGia ||--o{ MapThanhPhan_CLO : "đo"
    CLO ||--o{ MapThanhPhan_CLO : "được đo bởi"
    DeCuongChiTiet ||--o{ TaiLieuDinhKem : "kèm"
    NguoiDung ||--o{ TaiLieuDinhKem : "tải lên"
    PhienBanCTDT ||--o{ PLO : "khai báo"
    DongKhungCTDT ||--o{ MaTranCLO_PLO : "là cặp chương trình và học phần của"
    CLO ||--o{ MaTranCLO_PLO : "đóng góp qua"
    PLO ||--o{ MaTranCLO_PLO : "nhận đóng góp qua"
    DongKhungCTDT ||--o{ MaTranHP_PLO : "đóng góp qua"
    PLO ||--o{ MaTranHP_PLO : "nhận đóng góp qua"
```

### 2.5. Đề xuất thay đổi và phê duyệt

```mermaid
erDiagram
    NguoiDung ||--o{ DeXuatThayDoi : "tạo"
    HocKy |o--o{ DeXuatThayDoi : "là học kỳ hiệu lực của"
    DeXuatThayDoi ||--o{ NoiDungThayDoi : "gồm"
    DeXuatThayDoi ||--o{ BuocDuyet : "trải qua"
    CauHinhCapDuyet ||--o{ BuocDuyet : "là cấp của"
    VaiTro ||--o{ CauHinhCapDuyet : "duyệt ở"
    NguoiDung ||--o{ BuocDuyet : "phải duyệt"
    NguoiDung |o--o{ BuocDuyet : "thực hiện thay"
    UyQuyenDuyet |o--o{ BuocDuyet : "là căn cứ duyệt thay của"
    DeXuatThayDoi ||--o{ BinhLuan : "nhận"
    NguoiDung ||--o{ BinhLuan : "viết"
    DeXuatThayDoi ||--o{ HoSoDeXuat : "kèm"
    NguoiDung ||--o{ HoSoDeXuat : "tải lên"
    NguoiDung ||--o{ ThongBao : "nhận"
    DeXuatThayDoi |o--o{ ThongBao : "là chủ đề của"
```

### 2.6. Sinh viên và kết quả học tập

```mermaid
erDiagram
    KhoaTuyenSinh ||--o{ SinhVien : "gồm"
    NguoiDung |o--o| SinhVien : "là tài khoản của"
    SinhVien ||--o{ GhiDanhCTDT : "theo học"
    PhienBanCTDT ||--o{ GhiDanhCTDT : "là phiên bản áp dụng của"
    HocKy |o--o{ GhiDanhCTDT : "là mốc bắt đầu của"
    SinhVien ||--o{ KetQuaHocTap : "có"
    HocPhan ||--o{ KetQuaHocTap : "được ghi điểm ở"
    HocKy ||--o{ KetQuaHocTap : "diễn ra"
    GhiDanhCTDT ||--o{ KetQuaXetTotNghiep : "được xét"
    NguoiDung |o--o{ KetQuaXetTotNghiep : "chạy xét"
```

### 2.7. Hệ thống

```mermaid
erDiagram
    NguoiDung |o--o{ NhatKyHeThong : "thực hiện"
    NguoiDung ||--o{ PhienNhapLieu : "thực hiện"
    LogDongBo
    BenTichHop
```

`NhatKyHeThong` trỏ tới đối tượng bị tác động bằng cặp (loại thực thể, mã bản ghi), không bằng quan hệ cứng, nên không có đường nối tới các thực thể nghiệp vụ.

---

## 3. Quyết định mô hình

SRS mục 4.2 liệt kê thực thể và thuộc tính nhưng không nói ảnh chụp phiên bản được lưu thế nào. Các quyết định dưới đây lấp chỗ đó. Mỗi quyết định ghi phương án đã bỏ để có thể đảo lại.

### M-1 — Ảnh chụp: dòng gắn phiên bản, đề cương được ghim bằng tham chiếu

| | |
|---|---|
| **Chọn** | `DongKhungCTDT`, `NhomTuChon`, `PLO`, `RangBuocKhung`, `MaTranCLO_PLO`, `MaTranHP_PLO` thuộc về một `PhienBanCTDT` và được sao chép sang phiên bản mới. Đề cương **không** sao chép theo chương trình: mỗi bản đề cương là một dòng `DeCuongChiTiet` bất biến sau khi ban hành, và mỗi dòng khung ghim đúng bản đề cương của học phần đó (`DongKhungCTDT.deCuong`) |
| **Bỏ** | Sao chép vật lý toàn bộ đề cương vào từng phiên bản của từng chương trình (cách hiểu sát chữ nhất của DEC-01 "sao chép toàn bộ dữ liệu") |
| **Vì sao** | DEC-02 yêu cầu một đề cương dùng chung cho mọi chương trình. Sao chép theo chương trình tạo ra N bản của cùng một đề cương, đúng thứ DEC-02 muốn tránh. Ghim bằng tham chiếu vẫn cho đúng kết quả của DEC-01: mở một phiên bản cũ luôn thấy đúng bản đề cương tại thời điểm ban hành, vì bản đó không sửa được |
| **Hệ quả** | Sửa một đề cương → một dòng `DeCuongChiTiet` mới → mỗi chương trình có học phần đó sinh một `PhienBanCTDT` mới, dòng khung trỏ sang bản đề cương mới (EC-38). `CLO` được sao chép theo bản đề cương, nên `maCLO` phải ổn định qua các bản để ghép lại ma trận và để so sánh phiên bản |

### M-2 — Dữ liệu chưa ban hành là một phiên bản ở trạng thái NHÁP

| | |
|---|---|
| **Chọn** | `PhienBanCTDT.trangThai` có bốn giá trị: Nháp · Chờ hiệu lực · Đang hiệu lực · Lịch sử. `DeCuongChiTiet.trangThai`: Nháp · Đã ban hành · Lịch sử. Dữ liệu nhập từ Excel đi vào một phiên bản Nháp; chỉ bản Nháp sửa trực tiếp được |
| **Bỏ** | Một bộ bảng "bản làm việc" riêng, tách khỏi bảng phiên bản |
| **Vì sao** | Một bộ bảng thay cho hai; "ban hành phiên bản khởi tạo" (điểm hở H-1 trong `docs/planning/epics.md`) trở thành một lần đổi trạng thái Nháp → Đang hiệu lực kèm số quyết định. Trạng thái "Chờ hiệu lực" là chỗ đứng của phiên bản đã duyệt nhưng chưa tới học kỳ hiệu lực (DEC-07) |
| **Hệ quả** | Sau khi một chương trình có phiên bản đầu tiên, thay đổi không tạo bản Nháp mới để sửa trực tiếp: thay đổi nằm trong `NoiDungThayDoi` của đề xuất, và phiên bản mới chỉ được sinh ra khi đề xuất được duyệt |

### M-3 — `ChuongTrinhDaoTao` giữ danh tính, `PhienBanCTDT` giữ mô tả

| | |
|---|---|
| **Chọn** | `ChuongTrinhDaoTao` chỉ có mã chương trình, khoa, trình độ, trạng thái. Tên chương trình, mã ngành, tên ngành, số học kỳ và ba số tín chỉ nằm ở `PhienBanCTDT` |
| **Bỏ** | Để toàn bộ thuộc tính mô tả ở `ChuongTrinhDaoTao` như SRS mục 4.2.3 và bảng ánh xạ Excel mục 4.3 |
| **Vì sao** | "Sửa thông tin chương trình" là một loại đề xuất (FR-56) và ảnh chụp phải chứa "toàn bộ trường dữ liệu mô tả tại thời điểm ban hành" (mục 6.2.2). Thuộc tính sửa được qua đề xuất thì phải nằm trong phiên bản, nếu không phiên bản cũ sẽ hiển thị giá trị mới |
| **Hệ quả** | Bảng ánh xạ Excel ở SRS mục 4.3 ghi `ChuongTrinhDaoTao.tenChuongTrinh`, `.soHocKy`, `.tongTinChi`, `.tinChiBatBuoc`, `.tinChiTuChon`, `.maNganh`; ở mô hình này sáu trường đó thuộc `PhienBanCTDT`. Chỉ `maChuongTrinh` còn ở `ChuongTrinhDaoTao` |

### M-4 — Tương đương là nhóm, không phải dòng quan hệ

| | |
|---|---|
| **Chọn** | Học phần trỏ tới nhiều nhất một `NhomHocPhanTuongDuong`. `QuanHeHocPhan` chỉ chứa QH1 (học trước), QH2 (tiên quyết), QH3 (song hành), QH5 (thay thế) |
| **Bỏ** | Dòng `QuanHeHocPhan` loại QH4 cho từng cặp |
| **Vì sao** | DEC-06 và BR-09: tương đương là hai chiều và bắc cầu, tức là các nhóm rời nhau. Một học phần thuộc đúng một nhóm thì chỉ cần một tham chiếu, không cần bảng thành viên |
| **Hệ quả** | Người dùng vẫn khai báo đủ "05 loại quan hệ" (FR-18); loại thứ tư được lưu bằng việc đưa học phần vào nhóm. Nhóm tương đương không nằm trong ảnh chụp và áp dụng cho mọi phiên bản (EC-16) |

### M-5 — Khung chụp cả ràng buộc và thông tin học phần

| | |
|---|---|
| **Chọn** | Khi ban hành, quan hệ QH1–QH3 của các học phần trong khung được chép sang `RangBuocKhung`; tên và số tín chỉ của học phần được chép vào dòng khung (`tenHocPhanChup`, `soTinChiChup`) |
| **Bỏ** | Phiên bản cũ đọc quan hệ và số tín chỉ hiện tại từ danh mục học phần |
| **Vì sao** | Mục 6.2.2 ghi ảnh chụp khung "kèm ràng buộc học trước/tiên quyết/song hành"; FR-71 cấm phiên bản đã ban hành thay đổi dưới bất kỳ hình thức nào. Nếu đọc từ danh mục, đổi số tín chỉ hay sửa một quan hệ sẽ làm đổi nội dung mọi phiên bản cũ |
| **Hệ quả** | Điều kiện đăng ký và xét tốt nghiệp của một sinh viên được tính trên `RangBuocKhung` và số tín chỉ chụp của phiên bản áp dụng cho sinh viên đó, không trên danh mục hiện tại |

### M-6 — Ma trận CLO–PLO bám vào dòng khung

| | |
|---|---|
| **Chọn** | `MaTranCLO_PLO` trỏ tới `DongKhungCTDT`, `CLO`, `PLO`. Dòng khung chính là cặp (phiên bản chương trình, học phần) mà BR-19 nói tới |
| **Bỏ** | Bốn cột rời (chương trình, học phần, CLO, PLO) như liệt kê ở SRS mục 4.2.4 |
| **Vì sao** | Ràng buộc bổ sung của DEC-03: khi học phần bị gỡ khỏi khung, các dòng ma trận của cặp đó không được sang phiên bản mới. Bám vào dòng khung thì điều này tự xảy ra — không còn dòng khung thì không còn chỗ để ma trận bám |
| **Hệ quả** | Hai ràng buộc phải kiểm: CLO của một dòng ma trận phải thuộc bản đề cương mà dòng khung đang ghim; PLO phải thuộc cùng phiên bản với dòng khung |

### M-7 — Phạm vi quyền không lưu hai nơi

| | |
|---|---|
| **Chọn** | `PhanQuyen` cấp vai trò. Phạm vi của Giám đốc CTĐT đọc từ `PhanCongGiamDoc`; phạm vi của Điều phối nhóm chuyên môn và Giảng viên đọc từ `ThanhVienNhomCM`. Người điều phối của một nhóm là thành viên có vai trò "Điều phối" đang trong thời gian hiệu lực; `NhomChuyenMon` không có cột người điều phối |
| **Bỏ** | Cột "người điều phối" trên `NhomChuyenMon` (SRS mục 4.2.1) và phạm vi chép lại vào `PhanQuyen` |
| **Vì sao** | FR-04 đòi ghi thời gian hiệu lực của việc chỉ định, tức là cần lịch sử — một cột đơn không giữ được. Cùng một sự thật lưu hai nơi thì sớm muộn lệch nhau |
| **Hệ quả** | Cột phạm vi của `PhanQuyen` chỉ dùng cho vai trò có phạm vi là đơn vị: Phòng Đào tạo (toàn hệ thống), Ban lãnh đạo khoa (khoa) |

### M-8 — Sinh viên gắn với chương trình qua `GhiDanhCTDT`

| | |
|---|---|
| **Chọn** | `GhiDanhCTDT` nối sinh viên với phiên bản áp dụng; một sinh viên có thể có nhiều dòng. `ApDungPhienBan` ghi quy tắc ở cấp khóa (FR-74), có mốc học kỳ để giữ lịch sử |
| **Bỏ** | Hai cột "Chương trình đào tạo" và "phiên bản CTĐT áp dụng" trên `SinhVien` (SRS mục 4.2.7) |
| **Vì sao** | EC-34: sinh viên song ngành gắn với hai chương trình và được xét tốt nghiệp độc lập theo từng chương trình. EC-33, EC-35, EC-37: chuyển ngành, chuyển trình độ, bảo lưu đều là ngoại lệ so với quy tắc của khóa |
| **Hệ quả** | `KetQuaXetTotNghiep` trỏ tới một dòng ghi danh, không trỏ thẳng tới sinh viên. Ban hành một phiên bản mới không tự đổi phiên bản của sinh viên nào. Chỉ khi Phòng Đào tạo gán phiên bản đó cho một khóa (thêm dòng `ApDungPhienBan` — "quyết định chuyển đổi" của BR-26) thì các dòng ghi danh không phải ngoại lệ của khóa đó mới chuyển theo |

### M-9 — Những thứ không lưu

Các giá trị sau được tính khi cần, không có thực thể: cột "Đăng ký được?" (SRS mục 4.3), tổng tín chỉ theo học kỳ / khối / toàn chương trình (FR-77), tiến độ học tập (FR-90), các cảnh báo nhất quán và bảng sức khỏe (FR-78..82), danh sách chương trình bị ảnh hưởng (FR-17). `KetQuaXetTotNghiep` là ngoại lệ: SRS liệt kê nó là thực thể, và EC-43 đòi tính lại rồi thông báo khi điểm bị sửa hồi tố, nên cần kết quả cũ để so.

---

## 4. Khác biệt so với SRS mục 4.2

### 4.1. Thực thể bổ sung

| Thực thể | Vì sao cần | Căn cứ |
|---|---|---|
| `RangBuocKhung` | Giữ ràng buộc học trước/tiên quyết/song hành trong ảnh chụp | Mục 6.2.2, FR-71 (M-5) |
| `KhoaTuyenSinh` | "Khóa" là một bên của ánh xạ Khóa → Phiên bản; cần là đối tượng chứ không phải chuỗi tự do | FR-74 |
| `HocKy` | Hiệu lực tính theo học kỳ; hệ thống phải biết ngày bắt đầu học kỳ để chuyển Chờ hiệu lực → Đang hiệu lực | BR-25, DEC-07 |
| `ApDungPhienBan` | Một phiên bản áp dụng cho nhiều khóa (ví dụ mục 6.2.3: phiên bản 1.1 cho K2023 và K2024) | FR-74 |
| `NoiDungTuan_CLO` | "CLO liên quan" của một tuần là danh sách | Mục 4.2.5 |
| `CauHinhCapDuyet` | Số cấp và vai trò duyệt từng cấp "khai báo trong bảng cấu hình" | DEC-04, NFR-24 |
| `GhiDanhCTDT` | Sinh viên song ngành, chuyển ngành, ngoại lệ so với khóa | EC-33, EC-34, EC-35 (M-8) |
| `BenTichHop` | "Mỗi bên tích hợp có khóa riêng", có giới hạn tần suất | API-03, API-04 |

### 4.2. Thuộc tính chuyển chỗ hoặc bỏ

| Trong SRS | Ở mô hình này | Quyết định |
|---|---|---|
| `NhomChuyenMon` — người điều phối | Suy ra từ `ThanhVienNhomCM` | M-7 |
| `NhomHocPhanTuongDuong` — danh sách học phần thành viên | `HocPhan.nhomTuongDuong` | M-4 |
| `ChuongTrinhDaoTao` — tên, mã ngành, tên ngành, số học kỳ, ba số tín chỉ | `PhienBanCTDT` | M-3 |
| `ChuongTrinhDaoTao`, `PhienBanCTDT` — khóa áp dụng | `ApDungPhienBan` | M-8 |
| `PLO` — thuộc Chương trình đào tạo | Thuộc `PhienBanCTDT`; BR-17 vẫn đúng vì mỗi phiên bản thuộc đúng một chương trình | M-1 |
| `MaTranCLO_PLO`, `MaTranHP_PLO` — Chương trình đào tạo, học phần | `dongKhung` | M-6 |
| `NoiDungTheoTuan` — CLO liên quan | `NoiDungTuan_CLO` | — |
| `SinhVien` — Chương trình đào tạo, phiên bản CTĐT áp dụng | `GhiDanhCTDT` | M-8 |
| `KetQuaXetTotNghiep` — sinh viên | `ghiDanh` | M-8 |
| `QuanHeHocPhan` — loại quan hệ QH4 | Không dùng; thay bằng nhóm tương đương | M-4 |

---

## 5. Điểm còn hở của mô hình

Mô hình v0.1 chạy được với phương án tạm ở cột cuối. Đổi phương án thì đổi phần mô hình ghi ở cột "Ảnh hưởng".

Nơi định nghĩa các mã ở cột "Liên quan": `Q-xx` — SRS mục 13; `C01`..`C12` — phần "Thẩm định SRS và giả định cần xác nhận" của `docs/Bo_so_do_Use_Case_CTDT/Thuyet_minh_Use_Case.md`; `H-x` — mục 6 của `docs/planning/epics.md`.

| Mã | Điểm hở | Liên quan | Ảnh hưởng | Tạm chọn |
|---|---|---|---|---|
| E-1 | **Hai chỗ lưu ngưỡng điểm tiên quyết.** FR-19 đặt ngưỡng trên quan hệ; BR-07 và mục 7.3 dùng "Điểm học" của dòng khung (`DongKhungCTDT.diemHoc`) | Q-03, Q-04 | `QuanHeHocPhan.nguongDiem`, `RangBuocKhung.nguongDiem`, `DongKhungCTDT.diemHoc` | Dùng ngưỡng trên ràng buộc nếu có; nếu trống, dùng `diemHoc` của dòng khung chứa học phần nguồn |
| E-2 | **Khối kiến thức.** `KhoiKienThuc.soTinChiYeuCau` trong SRS không gắn với chương trình nào, trong khi yêu cầu tín chỉ theo khối là của từng chương trình. Cột Ký hiệu đang lưu tự do | Q-08 | `KhoiKienThuc`, `DongKhungCTDT.kyHieu` | Giữ `KhoiKienThuc` là danh mục chung; `kyHieu` là chuỗi, khớp với `maKhoi` nếu có, không ép buộc |
| E-3 | **Nhiều đề xuất cùng học kỳ hiệu lực.** Hai đề xuất đã duyệt trên cùng một chương trình, cùng học kỳ: sinh hai phiên bản hay gộp một? Ảnh chụp tạo lúc duyệt (FR-69) hay lúc tới học kỳ (mục 6.1.4)? | C01 | `PhienBanCTDT.deXuatNguon` (hiện là một tham chiếu) | Mỗi đề xuất sinh một phiên bản, tạo ngay khi duyệt ở trạng thái Chờ hiệu lực. Nếu phải gộp, đổi thành quan hệ nhiều–nhiều |
| E-4 | **Đối tượng của đề xuất là tham chiếu đa hình.** `DeXuatThayDoi` và `NoiDungThayDoi` trỏ tới đối tượng bằng (loại, mã), không có ràng buộc toàn vẹn. FR-56 liệt kê sáu loại đề xuất, trong khi ma trận 3.4 và UC-09 có thêm đề xuất thay đổi tổ chức / phân công | C04, UC-09 | `DeXuatThayDoi.loaiDeXuat`, `.loaiDoiTuong`, `NoiDungThayDoi.loaiThucThe` | Bảy loại: sáu loại của FR-56 và loại "Thay đổi tổ chức / phân công". Tuyến duyệt của loại thứ bảy (C04 tạm chọn: chuyển thẳng Phòng Đào tạo) không nằm trong mô hình dữ liệu |
| E-5 | **Ma trận Học phần–PLO** suy diễn hay nhập trực tiếp | Q-26 | `MaTranHP_PLO` | Lưu dòng kèm cờ `laGhiDe`; dòng không ghi đè được tính lại từ `MaTranCLO_PLO` |
| E-6 | **Người soạn đề cương** không có trong mô hình | Q-27 | `DeCuongChiTiet` | Phạm vi của giảng viên theo nhóm chuyên môn (SRS mục 3.3); không thêm cột người soạn |
| E-7 | **Tham số nghiệp vụ và cấu hình đồng bộ** (ngưỡng, số ngày nhắc hạn, lịch đồng bộ, quy tắc ưu tiên nguồn) lưu ở bảng hay ở tệp cấu hình | Q-16, NFR-24 | Có thể thêm thực thể cấu hình | Không mô hình hóa; quyết ở bước kiến trúc. Riêng cấp duyệt có `CauHinhCapDuyet` vì DEC-04 ghi rõ là bảng |
| E-8 | **Tài khoản của sinh viên** sinh ra thế nào (H-2 trong `docs/planning/epics.md`) | Q-13 | `SinhVien.nguoiDung` | Tham chiếu không bắt buộc; sinh viên chưa có tài khoản vẫn có dữ liệu và vẫn xét tốt nghiệp được |
| E-9 | **Khóa cũ có nhận phiên bản mới không.** BR-26 nói sinh viên giữ nguyên phiên bản lúc nhập học; ví dụ mục 6.2.3 lại chuyển K2023 từ 1.0 sang 1.1 | C07 | `ApDungPhienBan.tuHocKy`, `GhiDanhCTDT.laNgoaiLe` | Mô hình cho phép cả hai; Phòng Đào tạo chọn khóa áp dụng khi ban hành |
| E-10 | **Danh mục trạng thái của sinh viên** không có trong SRS | — | `SinhVien.trangThai` | Đang học · Bảo lưu · Thôi học · Đã tốt nghiệp |
| E-11 | **Nhóm tương đương nằm ngoài ảnh chụp.** Sửa một nhóm tương đương làm đổi kết quả khi xét lại theo phiên bản cũ; chưa chốt xét lại dùng nhóm hiện tại hay nhóm tại thời điểm ban hành | C11, EC-16 | `HocPhan.nhomTuongDuong`, `KetQuaXetTotNghiep` | Theo EC-16: dùng nhóm hiện tại. Mỗi lần xét lưu một dòng `KetQuaXetTotNghiep` riêng nên kết quả đã xét không bị ghi đè. Nếu phải dùng nhóm tại thời điểm ban hành, thêm bảng chụp thành viên nhóm theo phiên bản |
