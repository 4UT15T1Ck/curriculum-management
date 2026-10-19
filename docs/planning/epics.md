# DANH MỤC EPIC VÀ PHÂN BẬC PHÁT HÀNH

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-11 |
| Nguồn yêu cầu | `docs/requirement/REQUIREMENTS.md` — 109 FR (90 BẮT BUỘC · 17 NÊN CÓ · 2 TÙY CHỌN) |
| Nguồn use case | `docs/Bo_so_do_Use_Case_CTDT/Thuyet_minh_Use_Case.md` — UC-01..UC-84 |
| Phạm vi | **Toàn bộ 109 FR**, không cắt giảm yêu cầu nào. Giao trước một bản MVP (mục 0); phần còn lại giao sau, phạm vi giữ nguyên |
| Không gồm | Công nghệ, ước lượng thời gian, phân công người, user story, kế hoạch sprint — thuộc các tài liệu sau |

---

## 0. Bản MVP

Chốt 2026-10-18. MVP là **thứ tự giao hàng**, không thu hẹp phạm vi: mọi tính năng ngoài MVP vẫn làm, sau MVP.

MVP khép kín một vòng: dựng chương trình và khung → viết đề cương, PLO, CLO → tạo đề xuất thay đổi → duyệt ba cấp → ban hành phiên bản.

| Bậc | Tính năng trong MVP | Điểm |
|---|---|---|
| B1 | F-01 Đăng nhập, phiên · F-02 Tài khoản, vai trò, phạm vi quyền · F-03 Đơn vị và nhóm chuyên môn · F-04 Danh mục học phần · F-05 Quan hệ học phần, nhóm tương đương | 79 |
| B2 | F-06 Thông tin chương trình · F-07 Khung chương trình, nhóm tự chọn · F-08 Kiểm tra nhất quán | 57 |
| B3 | F-10 Đề cương · F-11 PLO, CLO, ma trận | 47 |
| B4 | F-13 Đề xuất thay đổi · F-14 Duyệt ba cấp, thông báo · F-15 Ban hành, ảnh chụp phiên bản | 115 |
| | **13 tính năng** | **298 / 519** |

Giao sau MVP: F-09 Nhập, xuất Excel; F-12 Công thức điểm, đánh giá–CLO; F-16 So sánh phiên bản, gán khóa; F-26 Sao lưu; toàn bộ B5, B6.

Hệ quả:
- B2, B3 giao thiếu (F-09, F-12), nên nguyên tắc 2 (mỗi bậc kết thúc bằng một phiên bản chạy được) áp cho cả MVP thay vì từng bậc. Kịch bản nghiệm thu B2, B3 ở mục 3 chạy đủ khi F-09, F-12 xong.
- Không có F-09: dữ liệu MVP nhập tay qua giao diện.
- F-08 nằm trong MVP vì F-13 (gửi đề xuất) và F-15 (ban hành) phải chặn khung còn lỗi (`ConsistencyChecker.assertPasses`).
- Không có F-26: sao lưu cơ sở dữ liệu và thư mục tệp làm tay cho tới khi F-26 xong.

---

## 1. Nguyên tắc chia bậc

1. **Làm hết, không cắt.** Bậc là thứ tự giao hàng, không phải ranh giới phạm vi. Bậc cuối cùng (B6) đóng lại đủ 109 FR.
2. **Mỗi bậc kết thúc bằng một phiên bản chạy được.** Người dùng thật đăng nhập và làm trọn một việc có ích mà không cần bậc sau. Mỗi bậc có một kịch bản nghiệm thu ở mục 3.
3. **Bậc sau chỉ cộng thêm, không làm lại.** Thứ tự đi theo phụ thuộc dữ liệu: tổ chức → học phần → khung → đề cương và chuẩn đầu ra → đề xuất và phiên bản → sinh viên → tích hợp và báo cáo.
4. **Yêu cầu NÊN CÓ / TÙY CHỌN:** nếu nó quyết định hình dạng dữ liệu (ví dụ trường song ngữ, tệp đính kèm theo phiên bản) thì đi cùng epic gốc; nếu chỉ là lớp trình bày, xuất tệp hoặc tiện ích thêm thì dồn về B6.
5. **Mỗi FR thuộc đúng một epic, mỗi epic thuộc đúng một bậc.** Các FR phải giao thành nhiều đợt được liệt kê riêng ở mục 5.
6. **Trước B4 dữ liệu ở trạng thái chưa ban hành.** FR-55 chỉ ràng buộc "dữ liệu đã ban hành", nên ở B1–B3 dữ liệu được sửa trực tiếp (ai được sửa: xem H-4, mục 6). Từ B4, mọi thay đổi trên dữ liệu đã ban hành phải đi qua Đề xuất thay đổi. Cách chuyển từ dữ liệu chưa ban hành sang phiên bản đầu tiên là điểm hở H-1 (mục 6).
7. **Nhật ký là nghĩa vụ của mọi epic.** Cơ chế ghi nhật ký (FR-105) có từ B1; mọi epic về sau phải ghi thao tác của mình vào đó, không xây nhật ký riêng.

---

## 2. Tổng quan các bậc

| Bậc | Phiên bản | Tên | Khi xong, người dùng làm được | Epic | FR (BB · NC · TC) |
|---|---|---|---|---|---|
| B1 | 0.1 | Nền tảng và danh mục học phần | Đăng nhập theo vai trò; quản trị đơn vị, nhóm chuyên môn, tài khoản; quản lý danh mục học phần và quan hệ giữa các học phần | EP-01..05 | 20 · 0 · 0 |
| B2 | 0.2 | Chương trình đào tạo và khung | Nhập file Excel khung hiện hành, xem và soạn khung theo học kỳ, nhận cảnh báo nhất quán, xuất lại Excel — thay được file Excel đang dùng | EP-06..09 | 23 · 0 · 0 |
| B3 | 0.3 | Đề cương và chuẩn đầu ra | Soạn đề cương, CLO, công thức điểm cho từng học phần; PLO và ma trận CLO–PLO cho từng chương trình; nhận cảnh báo lỗ hổng chuẩn đầu ra | EP-10..12 | 12 · 4 · 0 |
| B4 | 0.4 | Đề xuất thay đổi và phiên bản | Tạo đề xuất, duyệt ba cấp có bảng so sánh trước/sau, ban hành phiên bản bất biến, so sánh phiên bản, gán phiên bản cho khóa | EP-13..16 | 19 · 2 · 0 |
| B5 | 0.5 | Sinh viên, điều kiện đăng ký và xét tốt nghiệp | Sinh viên xem chương trình đúng phiên bản, tiến độ, học phần đăng ký được và lý do; Phòng Đào tạo xét tốt nghiệp; dDUT gọi API | EP-17..21 | 13 · 1 · 0 |
| B6 | 1.0 | Tích hợp trường, báo cáo và hoàn thiện | Đồng bộ định kỳ với cơ sở dữ liệu có sẵn; báo cáo kiểm định; đồ thị, PDF, timeline, bảng sức khỏe; ủy quyền, email, nhắc hạn | EP-22..25 | 3 · 10 · 2 |
| | | **Tổng** | | **25 epic** | **90 · 17 · 2 = 109** |

---

## 3. Chi tiết từng bậc

Cột "UC" ghi use case **chính** của epic; mỗi use case chỉ xuất hiện ở một epic. Cột "Cần trước" ghi epic phải xong trước.

### B1 — Nền tảng và danh mục học phần (phiên bản 0.1)

**Mục tiêu.** Dựng bộ khung hệ thống và hai danh mục gốc mà mọi bậc sau dựa vào: tổ chức – con người, và học phần.

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-01 | Nền tảng, đăng nhập và nhật ký hệ thống | M11 | FR-105, FR-106 | UC-01, UC-82 | — |
| EP-02 | Tài khoản, vai trò và phạm vi quyền | M1 | FR-06, FR-07, FR-10 | UC-05, UC-06 | EP-01 |
| EP-03 | Cơ cấu tổ chức và nhóm chuyên môn | M1 | FR-01, FR-02, FR-03, FR-04 | UC-02, UC-03, UC-04 | EP-02 |
| EP-04 | Danh mục học phần | M2, M1 | FR-05, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16 | UC-10, UC-11, UC-12 | EP-03 |
| EP-05 | Quan hệ học phần và nhóm tương đương | M2 | FR-18, FR-19, FR-20, FR-21 | UC-13, UC-14, UC-17 | EP-04 |

**Kịch bản nghiệm thu.**

1. Phòng Đào tạo đăng nhập, tạo cây Trường → Khoa CNTT → 04 nhóm chuyên môn.
2. Tạo tài khoản giảng viên, gán một giảng viên vào hai nhóm, chỉ định Điều phối nhóm chuyên môn có thời gian hiệu lực.
3. Tạo học phần 2.5 tín chỉ và học phần 0 tín chỉ; ghi nhận một học phần thuộc khoa khác.
4. Khai báo A là tiên quyết của B với ngưỡng điểm; khai báo B là tiên quyết của A → hệ thống chặn lưu vì tạo chu trình.
5. Chuyển một học phần sang "Ngừng mở lớp" → hệ thống đòi khai báo học phần thay thế.
6. Tra nhật ký theo người dùng và theo đối tượng, thấy đủ các thao tác trên kèm giá trị trước/sau.
7. Đăng nhập bằng tài khoản giảng viên, gọi thẳng thao tác quản trị → máy chủ từ chối (NFR-09).

**Chưa có ở bậc này.** Chương trình đào tạo, nên FR-17 ("hiển thị các CTĐT đang dùng học phần trước khi sửa") và phạm vi quyền theo chương trình (FR-08) nằm ở B2. Dữ liệu học phần nhập tay; nhập từ Excel đến ở B2.

**Cần chốt trước khi làm.** Q-13 (xác thực nội bộ hay SSO); Q-27 (phạm vi của giảng viên theo nhóm chuyên môn hay theo người soạn đề cương — quyết định mô hình phạm vi quyền của EP-02); Q-06 (học phần khoa khác). Đã chốt: Q-16 (công nghệ — `docs/design/tech-stack.md`).

### B2 — Chương trình đào tạo và khung (phiên bản 0.2)

**Mục tiêu.** Đưa file Excel khung chương trình hiện hành vào hệ thống và làm việc trên đó thay cho Excel.

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-06 | Thông tin Chương trình đào tạo và Giám đốc CTĐT | M3, M1 | FR-08, FR-23, FR-24, FR-25, FR-26 | UC-07, UC-18, UC-19, UC-20 | EP-02, EP-03 |
| EP-07 | Khung chương trình và nhóm tự chọn | M3, M2 | FR-17, FR-27, FR-28, FR-29, FR-30, FR-32 | UC-16, UC-21, UC-22 | EP-04, EP-05, EP-06 |
| EP-08 | Kiểm tra nhất quán khung chương trình | M8 | FR-77, FR-78, FR-79, FR-80, FR-81 | UC-54, UC-55, UC-56 | EP-05, EP-07 |
| EP-09 | Nhập và xuất Excel | M3, M10 | FR-33, FR-34, FR-35, FR-36, FR-96, FR-97, FR-101 | UC-23, UC-71, UC-72, UC-73, UC-74, UC-75 | EP-04, EP-07, EP-08 |

**Kịch bản nghiệm thu.**

1. Tải tệp mẫu, nhập danh mục học phần từ Excel.
2. Nhập file khung của chương trình mẫu (mã 1024034) ở chế độ chạy thử; cố tình để một mã học phần không tồn tại → báo lỗi đúng dòng, không ghi gì.
3. Sửa file, nhập lại → ghi toàn bộ; lịch sử phiên nhập liệu ghi số dòng thành công và số dòng lỗi.
4. Xem khung nhóm theo học kỳ, có tổng tín chỉ từng học kỳ; lọc theo khối kiến thức và theo bắt buộc/tự chọn.
5. Khai báo một nhóm tự chọn với số tín chỉ tối thiểu; chuyển một học phần sang học kỳ khác.
6. Xếp học phần tiên quyết sau học phần phụ thuộc → có cảnh báo; tổng tín chỉ tính được lệch số khai báo → có cảnh báo, ghi đè được kèm lý do.
7. Mở màn hình sửa một học phần → thấy danh sách chương trình đang dùng học phần đó.
8. Phân công Giám đốc CTĐT; nhân bản chương trình làm nền cho khóa mới.
9. Xuất khung ra Excel, đối chiếu với file gốc: cùng cột, cùng thứ tự, cùng ký hiệu (DEC-05).

**Chưa có ở bậc này.** Cột "Đăng ký được?" (FR-31) cần kết quả học tập của sinh viên nên đến ở B5, dù FR-31 nằm trong module M3. Nhân bản mới sao chép thông tin, khung và nhóm tự chọn; PLO và ma trận được bổ sung vào nhân bản ở B3.

**Cần chốt trước khi làm.** Q-11 (số chương trình thực tế; cần file Excel mẫu của cả Kỹ sư và Cử nhân để kiểm FR-24); Q-04 (ngữ nghĩa HT ĐA, TQ ĐA); Q-08 (danh mục cột Ký hiệu); C09 trong thuyết minh use case (tín chỉ và điều kiện tự chọn).

### B3 — Đề cương và chuẩn đầu ra (phiên bản 0.3)

**Mục tiêu.** Hoàn tất phần nội dung học thuật, để một chương trình có đủ mọi thành phần của một ảnh chụp phiên bản (mục 6.2.2 của SRS).

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-10 | Đề cương chi tiết học phần | M5 | FR-44, FR-45, FR-46, FR-47, FR-48 | UC-32, UC-33, UC-34 | EP-04 |
| EP-11 | Chuẩn đầu ra: PLO, CLO và ma trận CLO–PLO | M4 | FR-38, FR-39, FR-40, FR-41, FR-42 | UC-25, UC-26, UC-27, UC-28, UC-29, UC-30, UC-31 | EP-06, EP-07, EP-10 |
| EP-12 | Công thức điểm và ánh xạ đánh giá–CLO | M5 | FR-49, FR-50, FR-51, FR-52, FR-53, FR-54 | UC-35, UC-36, UC-57, UC-58 | EP-10, EP-11 |

**Kịch bản nghiệm thu.**

1. Soạn đề cương cho một học phần đủ các phần của FR-45 bằng trình soạn thảo định dạng; nhập tên, mô tả và CLO bằng cả tiếng Việt và tiếng Anh; đính kèm bản đề cương đã ký.
2. Mở học phần đó từ hai chương trình khác nhau → cùng một đề cương, cùng bộ CLO (DEC-02).
3. Khai báo PLO cho từng chương trình; lập ma trận CLO–PLO cho cùng học phần ở hai chương trình với mức đóng góp khác nhau (DEC-03).
4. Xem ma trận Học phần–PLO suy diễn, ghi đè thủ công một ô.
5. Để một PLO không có học phần nào đáp ứng và một CLO không gắn PLO nào → có cảnh báo.
6. Khai báo công thức điểm tổng 90% → bị chặn lưu; sửa thành 100% → lưu được.
7. Đánh dấu thành phần điều kiện kèm ngưỡng; khai báo điểm liệt.
8. Để một CLO chưa có thành phần đánh giá nào → có cảnh báo.

**Chưa có ở bậc này.** Dữ liệu vẫn sửa trực tiếp, chưa có duyệt và chưa có phiên bản. Phần "tệp đính kèm lưu theo phiên bản" của FR-47 chỉ đúng nghĩa khi có ảnh chụp ở B4.

**Cần chốt trước khi làm.** Q-25 (chỉ học phần cốt lõi mới đóng góp PLO?); Q-26 (ma trận Học phần–PLO suy diễn hay nhập trực tiếp — quyết định hình dạng FR-41); Q-28 (hệ thống này hay `plo-clo-backend` là nguồn chuẩn của PLO/CLO); Q-12 (song ngữ có bắt buộc không).

### B4 — Đề xuất thay đổi và phiên bản (phiên bản 0.4)

**Mục tiêu.** Đóng vòng đời điều chỉnh: thay đổi chỉ có hiệu lực sau khi qua ba cấp duyệt, và mỗi lần ban hành để lại một phiên bản không sửa được.

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-13 | Đề xuất thay đổi: soạn, gửi, thu hồi, xung đột | M6 | FR-55, FR-56, FR-60, FR-68, FR-108, FR-109 | UC-09, UC-37, UC-38, UC-39 | EP-04..EP-12 |
| EP-14 | Phê duyệt ba cấp và thông báo | M6 | FR-57, FR-58, FR-59, FR-61, FR-62, FR-63, FR-65, FR-67 | UC-40, UC-41, UC-42, UC-43, UC-44, UC-45, UC-47 | EP-13 |
| EP-15 | Ban hành và ảnh chụp phiên bản bất biến | M7 | FR-69, FR-70, FR-71, FR-75 | UC-46, UC-49, UC-53 | EP-14 |
| EP-16 | Tra cứu, so sánh phiên bản và gán khóa sinh viên | M7 | FR-72, FR-73, FR-74 | UC-50, UC-51, UC-52, UC-65 | EP-15 |

**Kịch bản nghiệm thu.**

1. Ban hành phiên bản khởi tạo cho chương trình đã nhập ở B2–B3 (xem H-1). Sau bước này, sửa trực tiếp dữ liệu đã ban hành bị từ chối.
2. Giảng viên tạo đề xuất sửa công thức điểm một học phần, ghi nguồn phát sinh và số văn bản, đính kèm tờ trình, gửi duyệt.
3. Người thứ hai tạo đề xuất trên cùng học phần → nhận cảnh báo xung đột.
4. Điều phối nhóm chuyên môn nhận thông báo, thấy đề xuất trong hàng đợi, xem bảng so sánh trước/sau, **Trả lại** kèm lý do → đề xuất về NHÁP; gửi lại → đi lại từ cấp 1.
5. Cấp 1 đồng ý → Giám đốc CTĐT đồng ý → Phòng Đào tạo đồng ý, nhập số quyết định và học kỳ hiệu lực → đề xuất ĐÃ DUYỆT.
6. Phiên bản mới được sinh ra kèm ảnh chụp bất biến — ngay khi duyệt (FR-69) hay khi đến học kỳ hiệu lực (mục 6.1.4 của SRS), tùy kết luận C01; phiên bản cũ chuyển sang Lịch sử; mọi chương trình chứa học phần đó đều sinh phiên bản mới (DEC-01 kết hợp DEC-02).
7. Ban lãnh đạo khoa xem và bình luận trên đề xuất nhưng không duyệt được.
8. Người tạo đề xuất đồng thời là người duyệt cấp 1 → cấp đó được bỏ qua, nhật ký ghi lý do.
9. Thu hồi một đề xuất chưa có cấp nào duyệt.
10. So sánh hai phiên bản, thấy mục thêm / xóa / thay đổi; mở lại đầy đủ nội dung phiên bản cũ; thử sửa phiên bản cũ → bị từ chối.
11. Gán khóa K2023 giữ phiên bản cũ, khóa mới nhận phiên bản mới.
12. Ban hành phiên bản đính chính cho một phiên bản ban hành nhầm; dữ liệu lịch sử còn nguyên.

**Chưa có ở bậc này.** Email, nhắc hạn, ủy quyền duyệt, timeline phiên bản (B6). Thông báo chỉ có trong ứng dụng.

**Cần chốt trước khi làm.** H-1 (ban hành phiên bản đầu tiên); C01 (thời điểm chụp), C02 (từ chối hay trả lại), C03 (ai được đề xuất), C04 (tuyến duyệt cho thay đổi tổ chức / PLO / khung) trong thuyết minh use case; Q-07, Q-19, Q-20, Q-21, Q-22, Q-24; Q-18 (hồ sơ giấy hay số hóa — quyết định độ lớn của FR-109); Q-23 (văn bản quy trình chính thức của Trường).

### B5 — Sinh viên, điều kiện đăng ký và xét tốt nghiệp (phiên bản 0.5)

**Mục tiêu.** Đưa sinh viên và kết quả học tập vào, chạy Bộ quy tắc trên đúng phiên bản của từng khóa, và mở dữ liệu ra cho sinh viên và dDUT.

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-17 | Hồ sơ sinh viên và kết quả học tập từ Excel | M10 | *(nhận đợt 2 của FR-96, FR-97 — xem mục 5)* | *(dùng lại UC-71..UC-75)* | EP-09, EP-16 |
| EP-18 | Tính điều kiện đăng ký học phần | M8, M3 | FR-31, FR-83 | UC-60, UC-63 | EP-05, EP-16, EP-17 |
| EP-19 | Xét tốt nghiệp | M8 | FR-84, FR-85, FR-86, FR-87 | UC-61, UC-62, UC-64 | EP-05, EP-07, EP-16, EP-17 |
| EP-20 | Cổng sinh viên | M9 | FR-88, FR-89, FR-90, FR-91, FR-92, FR-93, FR-95 | UC-59, UC-84 | EP-10, EP-17, EP-18, EP-19 |
| EP-21 | API cho ứng dụng dDUT | M9 | FR-94 | UC-66, UC-67, UC-68, UC-69, UC-70 | EP-16, EP-18, EP-19 |

**Kịch bản nghiệm thu.**

1. Nhập danh sách sinh viên và kết quả học tập từ Excel theo tệp mẫu, qua chạy thử rồi mới ghi.
2. Sinh viên khóa K2023 đăng nhập trên điện thoại màn hình 360px, thấy chương trình đúng phiên bản của khóa mình, không phải phiên bản đang hiệu lực mới nhất.
3. Khung theo học kỳ hiển thị trạng thái từng học phần: Đã học đạt · Đang học · Chưa học · Không đạt; có số tín chỉ tích lũy, tỷ lệ hoàn thành, số tín chỉ còn thiếu.
4. Danh sách học phần đủ điều kiện đăng ký cho học kỳ tới; mỗi học phần chưa đủ điều kiện có lý do cụ thể. Cột "Đăng ký được?" trả ba trạng thái như bảng Excel hiện hành.
5. Sinh viên mở đề cương và công thức điểm của một học phần, đúng bản thuộc phiên bản của mình.
6. Sinh viên A gọi dữ liệu của sinh viên B → bị từ chối (NFR-11).
7. Phòng Đào tạo xét tốt nghiệp một sinh viên đã học một học phần tương đương thay cho học phần trong khung → được tính; sinh viên thiếu một nhóm tự chọn → liệt kê đúng hạng mục thiếu.
8. Xét tốt nghiệp theo lô cho cả một khóa.
9. Gọi API theo tài liệu OpenAPI, lấy được chương trình, tiến độ, điều kiện đăng ký, đề cương, kết quả xét tốt nghiệp.

**Chưa có ở bậc này.** Kết nối cơ sở dữ liệu có sẵn và đồng bộ định kỳ (B6); dữ liệu sinh viên chỉ đến từ Excel.

**Cần chốt trước khi làm.** H-2 (cấp tài khoản cho sinh viên); Q-03 (thang điểm); Q-05 (tương đương hai chiều, bắc cầu); Q-10 (điều kiện tốt nghiệp ngoài tín chỉ); C05 (ba hay bốn kết quả đăng ký), C06 (song hành và chống lặp), C07 (bản đang hiệu lực và bản của khóa), C10 (phiên bản đề cương qua API), C11 (tương đương độc lập với phiên bản).

### B6 — Tích hợp trường, báo cáo và hoàn thiện (phiên bản 1.0)

**Mục tiêu.** Nối nguồn dữ liệu chính thức của Trường và hoàn tất các yêu cầu báo cáo, trình bày, tiện ích còn lại. Xong bậc này là đủ 109 FR.

| Mã | Epic | Module | FR | UC | Cần trước |
|---|---|---|---|---|---|
| EP-22 | Đồng bộ với cơ sở dữ liệu có sẵn | M10 | FR-98, FR-99, FR-100 | UC-76, UC-77, UC-78 | EP-17 |
| EP-23 | Báo cáo và xuất dữ liệu kiểm định | M11, M4 | FR-43, FR-102, FR-103, FR-104, FR-107 | UC-79, UC-80, UC-81, UC-83 | EP-07, EP-11, EP-14 |
| EP-24 | Trực quan hóa và xuất bản | M2, M3, M7, M8 | FR-22, FR-37, FR-76, FR-82 | UC-15, UC-24 | EP-05, EP-08, EP-11, EP-16 |
| EP-25 | Tiện ích quy trình duyệt | M1, M6 | FR-09, FR-64, FR-66 | UC-08, UC-48 | EP-14 |

**Kịch bản nghiệm thu.**

1. Cấu hình kết nối chỉ đọc và lịch đồng bộ; chạy đồng bộ, xem nhật ký từng lần.
2. Tạo mâu thuẫn giữa kết quả học tập trong Excel và trong cơ sở dữ liệu → hệ thống lấy theo nguồn ưu tiên đã cấu hình và ghi cảnh báo.
3. Ngắt kết nối giữa lúc đồng bộ → hoàn tác toàn bộ, ghi lỗi, thử lại theo lịch (EC-49).
4. Đối sánh chương trình Kỹ sư và Cử nhân cùng ngành; xem phân bổ tín chỉ theo khối kiến thức dạng bảng và biểu đồ.
5. Xuất ma trận chuẩn đầu ra ra Excel; xuất ma trận PLO/CLO phục vụ kiểm định.
6. Xem thống kê đề xuất theo trạng thái và thời gian xử lý trung bình từng cấp.
7. Xem đồ thị quan hệ học phần; xuất chương trình ra PDF; xem timeline phiên bản; mở bảng sức khỏe liệt kê mọi cảnh báo của một chương trình.
8. Người duyệt ủy quyền có thời hạn; hết hạn → ủy quyền tự thu hồi.
9. Nhận email khi đề xuất chuyển cấp; nhận nhắc hạn khi đề xuất tồn quá số ngày cấu hình.

**Cần chốt trước khi làm.** Q-09 (cơ sở dữ liệu có sẵn là của Trường hay do nhóm tự tạo — quyết định EP-22 có làm được với dữ liệu thật hay không; nên hỏi ngay từ đầu vì việc xin quyền truy cập mất thời gian); Q-14 (mẫu PDF theo quyết định của Trường); Q-17 (nhắc hạn).

---

## 4. Yêu cầu phi chức năng: bắt đầu ràng buộc từ bậc nào

NFR không thuộc epic nào; một NFR ràng buộc mọi epic kể từ bậc ghi dưới đây.

| Từ bậc | NFR | Lý do gắn ở đây |
|---|---|---|
| B1 | NFR-06, NFR-07, NFR-08, NFR-09, NFR-10 | Mật khẩu, HTTPS, hết phiên, kiểm quyền ở máy chủ, nhật ký chỉ ghi thêm — sai từ đầu thì phải làm lại mọi màn hình |
| B1 | NFR-16, NFR-18, NFR-19, NFR-20 | Tiếng Việt, phân trang/tìm kiếm/sắp xếp, thông báo lỗi, hộp xác nhận — quy ước giao diện chung |
| B1 | NFR-21, NFR-22, NFR-23, NFR-24 | Monolith theo module, quy ước đặt tên, migration, tham số nghiệp vụ nằm trong cấu hình |
| B1 | NFR-01, NFR-26 | Tra cứu dưới 2 giây; Chrome, Firefox, Edge |
| B2 | NFR-05 | Nhập 1000 dòng Excel dưới 60 giây |
| B4 | NFR-12, NFR-13, NFR-14 | Từ khi có phiên bản đã ban hành, dữ liệu không được phép mất: sao lưu hằng ngày, phục hồi đã kiểm thử, nâng cấp không mất phiên bản |
| B5 | NFR-02, NFR-03, NFR-11, NFR-17 | Tính điều kiện đăng ký dưới 3 giây; xét lô 500 sinh viên dưới 5 phút; sinh viên chỉ thấy dữ liệu của mình; màn hình từ 360px |
| B6 | NFR-04, NFR-15, NFR-25, NFR-27 | 200 người đồng thời, 99% giờ làm việc, triển khai trên máy chủ của Khoa, tài liệu cài đặt và hướng dẫn theo vai trò |

---

## 5. Các FR giao nhiều đợt

Mỗi FR dưới đây thuộc một epic (cột "Epic sở hữu") nhưng chỉ đủ nghĩa sau đợt cuối.

| FR | Epic sở hữu | Đợt 1 | Đợt sau |
|---|---|---|---|
| FR-96 | EP-09 (B2) | B2: nhập danh mục học phần, khung chương trình | B5 (EP-17): nhập danh sách sinh viên, kết quả học tập |
| FR-97 | EP-09 (B2) | B2: tệp mẫu học phần, khung | B5 (EP-17): tệp mẫu sinh viên, kết quả học tập |
| FR-25 | EP-06 (B2) | B2: nhân bản thông tin, khung, nhóm tự chọn | B3 (EP-11): nhân bản thêm PLO và ma trận CLO–PLO |
| FR-07 | EP-02 (B1) | B1: phạm vi theo khoa, nhóm chuyên môn | B2 (EP-06): phạm vi theo Chương trình đào tạo |
| FR-47 | EP-10 (B3) | B3: đính kèm tệp vào đề cương | B4 (EP-15): tệp đi theo ảnh chụp phiên bản |

---

## 6. Điểm hở phát hiện khi chia bậc

Những điểm này không có trong danh sách Q-01..Q-28 của SRS và chưa được ghi vào SRS.

| Mã | Điểm hở | Chặn | Đề xuất tạm |
|---|---|---|---|
| H-1 | **Ban hành phiên bản đầu tiên.** SRS chỉ tạo ảnh chụp khi Phòng Đào tạo duyệt cấp cuối một đề xuất (FR-69); quy trình nhập Excel (mục 6.3) dừng ở "ghi nhật ký phiên nhập liệu". Không có mô tả nào về việc dữ liệu vừa nhập trở thành phiên bản 1.0 | B4 | Phòng Đào tạo thực hiện một thao tác "ban hành phiên bản khởi tạo" cho từng chương trình, nhập số quyết định, học kỳ hiệu lực, khóa áp dụng; thao tác chỉ dùng được khi chương trình chưa có phiên bản nào. Lưu ý EC-44 chặn ban hành khi còn học phần chưa có đề cương — tức phải nhập đủ đề cương của mọi học phần trong khung trước khi có phiên bản đầu tiên |
| H-2 | **Cấp tài khoản cho sinh viên.** FR-06 chỉ nói tạo tài khoản; SRS không nêu tài khoản sinh viên sinh ra thế nào khi nhập danh sách hàng trăm sinh viên | B5 | Tạo tài khoản tự động khi nhập danh sách sinh viên, tên đăng nhập là mã sinh viên; cách phát mật khẩu ban đầu cần hỏi Khoa |
| H-3 | **FR-108, FR-109 chưa có use case.** Bảng truy vết của thuyết minh use case dừng ở FR-107 | B4 | Gắn tạm vào UC-37 (tạo/sửa đề xuất nháp) và UC-40 (xem đề xuất); cập nhật mô hình use case khi Q-18, Q-19 được trả lời |
| H-4 | **Quyền sửa trực tiếp ở B1–B3.** Ma trận phân quyền mục 3.4 của SRS chỉ cho Phòng Đào tạo quyền sửa trực tiếp (`X`); Giám đốc CTĐT, Điều phối nhóm chuyên môn và Giảng viên chỉ có `Đ` (đề xuất, phải qua duyệt). Trước B4 chưa có luồng duyệt, nên đọc đúng ma trận thì chỉ Phòng Đào tạo nhập được đề cương, CLO, công thức điểm | B1, B3 | Với chương trình chưa có phiên bản nào, ô `Đ` được hiểu là sửa trực tiếp trong đúng phạm vi của vai trò (mục 3.3); khi chương trình có phiên bản đầu tiên, `Đ` trở lại nghĩa gốc |

---

## 7. Tra ngược FR → epic

| Module | FR → epic (bậc) |
|---|---|
| M1 | FR-01..04 → EP-03 (B1) · FR-05 → EP-04 (B1) · FR-06, 07, 10 → EP-02 (B1) · FR-08 → EP-06 (B2) · FR-09 → EP-25 (B6) |
| M2 | FR-11..16 → EP-04 (B1) · FR-17 → EP-07 (B2) · FR-18..21 → EP-05 (B1) · FR-22 → EP-24 (B6) |
| M3 | FR-23..26 → EP-06 (B2) · FR-27..30, 32 → EP-07 (B2) · FR-31 → EP-18 (B5) · FR-33..36 → EP-09 (B2) · FR-37 → EP-24 (B6) |
| M4 | FR-38..42 → EP-11 (B3) · FR-43 → EP-23 (B6) |
| M5 | FR-44..48 → EP-10 (B3) · FR-49..54 → EP-12 (B3) |
| M6 | FR-55, 56, 60, 68, 108, 109 → EP-13 (B4) · FR-57, 58, 59, 61, 62, 63, 65, 67 → EP-14 (B4) · FR-64, 66 → EP-25 (B6) |
| M7 | FR-69, 70, 71, 75 → EP-15 (B4) · FR-72, 73, 74 → EP-16 (B4) · FR-76 → EP-24 (B6) |
| M8 | FR-77..81 → EP-08 (B2) · FR-82 → EP-24 (B6) · FR-83 → EP-18 (B5) · FR-84..87 → EP-19 (B5) |
| M9 | FR-88..93, 95 → EP-20 (B5) · FR-94 → EP-21 (B5) |
| M10 | FR-96, 97, 101 → EP-09 (B2) · FR-98, 99, 100 → EP-22 (B6) |
| M11 | FR-102, 103, 104, 107 → EP-23 (B6) · FR-105, 106 → EP-01 (B1) |
