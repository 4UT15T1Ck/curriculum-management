# HẠNG MỤC HOÃN v0.1

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-15 |
| Mục đích | Ghi những việc đã biết là cần nhưng **chưa làm ở phiên bản này**, kèm chỗ mô hình sẽ phải đổi khi làm |
| Trạng thái | Hoãn. Không có trong ERD, từ điển dữ liệu, story, việc, màn hình, kiểm thử hay kế hoạch sprint hiện tại |

---

## 1. Theo Quy định xây dựng, thẩm định, ban hành CTĐT

Nguồn: `docs/requirement/Quy dinh Xay dung cap nhat CTDT_02-07-2024_Quy trinh.docx` — Quy định ban hành kèm Quyết định 2674/QĐ-ĐHBK ngày 02/07/2024, Điều 10–15. SRS chưa nhắc tới văn bản này.

### 1.1. Thiếu trong mô hình

| Mã | Quy định nói | Hiện trạng | Khi làm thì đổi gì | Cỡ |
|---|---|---|---|---|
| R-1 | Mỗi chuẩn đầu ra chương trình được cụ thể thành các **chỉ số đo lường hiệu quả PI** (Performance Indicator); ma trận học phần–chuẩn đầu ra phải cho thấy PLO được truyền tải xuống học phần qua PI (Điều 11.5, 12.3a, 12.4a) | Chỉ có `PLO`, `CLO`, `CLOPLOMapping`, `CoursePLOMapping`; không có PI. Repo PLO-CLO hiện cũng không có bảng PI, nhưng còn dấu vết cũ (chú thích trong `CourseService.cs`, thông báo "Mã PI" ở `UpdateCoursePLODTO.cs`) — chưa xác nhận đã bỏ hay đổi tên | Thêm `PerformanceIndicator` (một `PLO` có nhiều PI); `CLO` và học phần ánh xạ tới PI, độ phủ PLO suy ra từ PI. Đổi ERD, từ điển dữ liệu, màn hình chuẩn đầu ra (MH-31..MH-35), story, việc, kiểm thử, xuất báo cáo kiểm định | Lớn |
| R-2 | Chương trình có **mục tiêu chung và mục tiêu cụ thể**, được thông qua và công bố cùng chuẩn đầu ra (Điều 12.3) | Không có. Ghi chú của thầy Bình có câu "1 CTDT sẽ có 1 mục tiêu chuẩn đầu ra PLO, CLO" — chưa rõ có phải ý này | Thêm `ProgramObjective` gắn với `ProgramVersion` | Nhỏ |
| R-3 | Hồ sơ cần có báo cáo thu thập và lấy ý kiến các bên liên quan (Điều 12, bước 2 và 7), báo cáo đánh giá CTĐT (Điều 15.3a), quyết định ban hành do Hiệu trưởng ký | `ChangeRequestDocument.documentType` chỉ có Tờ trình · Biên bản · Biên bản họp hội đồng · Biên bản thẩm định · Công văn | Thêm `SURVEY_REPORT` Báo cáo lấy ý kiến · `EVALUATION_REPORT` Báo cáo đánh giá CTĐT · `DECISION` Quyết định ban hành | Nhỏ |
| R-4 | Chu kỳ đánh giá tổng thể CTĐT **tối đa 5 năm** (Điều 14.3) | Đính kèm được hồ sơ rà soát nhưng không theo dõi hạn rà soát | Ngày rà soát tổng thể gần nhất trên `Program` và thông báo khi sắp tới hạn | Nhỏ |

### 1.2. Cần hỏi Khoa trước khi làm

| Mã | Câu hỏi |
|---|---|
| R-5 | Sau đánh giá tổng thể, Hiệu trưởng công bố "CTĐT mới" hoặc "CTĐT sửa đổi, bổ sung" (Điều 14.3, 15.5). Hệ thống không có luồng tạo chương trình mới (DEC-12, thay bằng nhân bản FR-25), và số phiên bản tách Chính/Phụ (BR-24). "CTĐT mới" là nhân bản thành chương trình khác, hay một phiên bản Chính mới của cùng chương trình? |
| R-6 | Mỗi chuẩn đầu ra phải được đánh giá mức độ đạt **tối thiểu hai lần** trong một chu kỳ (Điều 14.2b). Đo mức đạt PLO từ kết quả của sinh viên là việc của repo PLO-CLO; đề nghị ghi là ngoài phạm vi hệ thống này |
| R-7 | Mục tiêu và chuẩn đầu ra phải **công khai trên website của Trường** (Điều 12.3g, 14.2d). API hiện đòi khóa truy cập (FR-94). Cần trang xem công khai không đăng nhập, hay website Trường tự lấy qua API? |

### 1.3. Đã khớp, không phải đổi

| Quy định | Chỗ đã có |
|---|---|
| Mọi học phần trong CTĐT phải có đề cương chi tiết (Điều 11.7) | Chặn ban hành khi dòng khung thiếu đề cương (EC-44, PB-03) |
| Đối sánh với chương trình cùng ngành (Điều 11.4; Điều 12, bước 5) | Quyền `report.benchmark` |
| Hội đồng Khoa, Hội đồng thẩm định, Hội đồng KH&ĐT Trường họp ngoài hệ thống (Điều 10, 12, 13, 15) | Phương án tạm của Q-20: đi chung luồng ba cấp; biên bản là hồ sơ đính kèm (FR-109); thành viên hội đồng không phải người dùng. Vì vậy quy định về thành phần hội đồng không ảnh hưởng hệ thống |
| Hiệu trưởng ký quyết định ban hành (Điều 12.3e, 13.6) | `ProgramVersion.decisionNumber`, `signedDate` |
