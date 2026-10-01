# Sơ đồ Use Case - Quản lý Chương trình đào tạo

Nguồn: SRS PBL6 người dùng cung cấp. Mô hình bao phủ 107/107 FR, gồm BẮT BUỘC, NÊN CÓ và TÙY CHỌN. Những điểm chưa nhất quán được diễn giải công khai, không coi là quyết định đã được Khoa phê duyệt.

## Tệp sử dụng

- `So_do_Use_Case_Quan_ly_CTDT.drawio`: mở bằng diagrams.net / draw.io (File → Open From → Device). Toàn bộ hình, chữ, đường nối chỉnh sửa được; chọn tab trang ở dưới. Không phải ảnh nhúng.
- `So_do_Use_Case_Quan_ly_CTDT.pdf`: bản vector có bookmark, sơ đồ và phụ lục thẩm định/catalog/truy vết.
- `Thuyet_minh_Use_Case.md`: giải thích và bảng truy vết dạng văn bản.
- `Mo_hinh_Use_Case.json`: dữ liệu UC, actor, quan hệ và đối chiếu FR để bảo trì.

## Tác nhân

| Mã | Tác nhân |
|---|---|
| R1 | Phòng Đào tạo |
| R2 | Ban lãnh đạo khoa |
| R3 | Giám đốc CTĐT |
| R4 | Trưởng nhóm chuyên môn |
| R5 | Giảng viên |
| R6 | Sinh viên |
| E1 | Hệ thống dữ liệu trường (nguồn chỉ đọc) |
| E2 | Dịch vụ email (tích hợp giả định) |
| E3 | Ứng dụng dDUT |

## Danh sách trang sơ đồ

- 00A · Tổng quan nghiệp vụ
- 00B · Tổng quan tích hợp
- 01 · Tài khoản và phân quyền
- 02 · Tổ chức và phân công
- 03 · Danh mục học phần
- 04 · Quan hệ học phần
- 05 · Chương trình và khung
- 06 · Chuẩn đầu ra và ma trận
- 07 · Đề cương và đánh giá
- 08 · Đề xuất thay đổi
- 09 · Xử lý phê duyệt
- 10 · Thông báo và ủy quyền
- 11 · Phiên bản và hiệu lực
- 12 · Kiểm tra tính nhất quán
- 13 · Tra cứu học tập và tốt nghiệp
- 14 · Hành vi tính toán dùng chung
- 15 · Tích hợp ứng dụng dDUT
- 16 · Nhập liệu Excel
- 17 · Đồng bộ nguồn dữ liệu
- 18 · Báo cáo và kiểm định
- 19 · Xuất tài liệu
- 20 · Kiểm tra khi soạn dữ liệu
- 21 · Ban hành và nhập liệu
- 22 · Hành vi mở rộng có điều kiện
- 23 · Tính toán dùng chung: cổng tra cứu
- 24 · Tính toán dùng chung: API và theo lô
- 25 · Chuyên biệt use case tra cứu
- 26 · Tổng hợp tín chỉ và ảnh hưởng

## Quy ước và nguyên tắc UML

### Ranh giới và tác nhân

R1-R6 ở ngoài hệ thống; E1 nguồn dữ liệu trường chỉ đọc; E3 dDUT là ứng dụng gọi API; E2 email chỉ là giả định tích hợp của FR-64. CSDL nội bộ, file Excel, module, rules engine, bộ hẹn giờ và chính hệ thống không phải actor.

### Ký pháp UML

Association: đường liền không mũi tên. Include: nét đứt, đầu mũi tên mở trỏ tới hành vi bắt buộc. Extend: nét đứt trỏ từ hành vi mở rộng tới use case cơ sở, nêu điều kiện và extension point. Generalization: đường liền tam giác rỗng trỏ về use case tổng quát. Tham chiếu OMG UML 2.5.1, chương 18: https://www.omg.org/spec/UML/2.5.1

### Mục tiêu và mức phân rã

OV-01..08 là góc nhìn mục tiêu tổng quan. UC-01..84 là danh mục chi tiết. Một FR có thể là thuộc tính/ràng buộc/nhánh xử lý của UC, không nhất thiết một ellipse. Các trang là góc nhìn một mô hình, không phải các hệ thống độc lập.

### Quy tắc quyền dùng chung

Mọi nghiệp vụ yêu cầu xác thực và kiểm quyền máy chủ theo vai trò × phạm vi, trừ chính bước đăng nhập. Không include Đăng nhập từ tất cả UC vì người dùng có thể đã đăng nhập. R1 cũng không sửa trực tiếp dữ liệu đã ban hành. R2 góp ý và giám sát, không phải cấp duyệt.

### Phạm vi loại trừ

Không tạo mới CTĐT từ đầu, không xếp thời khóa biểu, không đăng ký HP thực tế, không nhập/quản lý điểm, không quản lý lớp/phân công giảng dạy, học phí, hồ sơ nhân sự, không xây ứng dụng di động riêng.

### Chất lượng và vận hành

NFR-01..05: thời gian phản hồi/tính toán/nhập liệu. NFR-06..11: hash mật khẩu, HTTPS, hết phiên, quyền máy chủ, audit bất biến, riêng tư SV. NFR-12..15: sao lưu/khôi phục/toàn vẹn/sẵn sàng. NFR-16..20: tiếng Việt, responsive, phân trang/tìm/sắp xếp, lỗi dễ hiểu, xác nhận thao tác không hoàn tác. NFR-21..27: monolith, bảo trì, migration, tham số cấu hình, triển khai/trình duyệt/tài liệu. Đây là ràng buộc hệ thống, không được biến thành actor hoặc use case CRUD tùy tiện.

### Giới hạn xác nhận

Tất cả 107 FR đã được gắn vị trí trong mô hình, gồm NC/TC. Điều này không có nghĩa các mâu thuẫn SRS đã được chủ nghiệp vụ phê duyệt; cần xác nhận các mục C01..C12 trước khi chốt triển khai.

## Thẩm định SRS và giả định cần xác nhận

### C01 · Thời điểm snapshot

FR-69 và 6.2.1: tạo khi duyệt cuối; 6.1.1/6.1.4: đến hiệu lực mới sinh bản. Mô hình chọn tạo snapshot khi R1 đồng ý, giữ chờ hiệu lực và kích hoạt đầu học kỳ. Cần Khoa xác nhận.

### C02 · Từ chối hay trả lại

6.1.1/2: TỪ CHỐI đóng; BR-29: TRẢ LẠI về nháp. EC-26 dùng “từ chối” nhưng lại về nháp. Mô hình theo định nghĩa trạng thái: trả lại mới được sửa/gửi lại.

### C03 · Người đề xuất là R1

FR-61/BR-27 yêu cầu bỏ cấp tự duyệt, nhưng R1 là cấp cuối. Không tự suy ra được phép ban hành không có người kiểm soát. Tạm yêu cầu một R1 khác xử lý cuối; đây là giả định cần chốt, không phải yêu cầu đã xác nhận.

### C04 · Tuyến duyệt tổ chức / PLO / khung

3.4 có đề xuất tổ chức/nhân bản nhưng FR-56 chưa liệt kê đủ. Đề xuất PLO/thông tin CTĐT không gắn HP thì chưa rõ cấp 1. Tạm đề xuất tổ chức về R1; đề xuất CTĐT không có nhóm bị tác động bỏ cấp 1 có log, cần xác nhận.

### C05 · Ba hay bốn kết quả đăng ký

FR-83 nói ba trạng thái; 7.3 có thêm “Đã hoàn thành”. Mô hình giữ ba kết quả đủ điều kiện và một trạng thái hoàn thành riêng, không làm mất thông tin.

### C06 · Song hành và chống lặp

BR-11 chỉ cấm chu trình học trước/tiên quyết, không chứng minh đệ quy song hành kết thúc. SRS còn dùng “đã hoàn thành” khác “đã học trước” ở phần thuật ngữ. Cần thống nhất ngữ nghĩa và visited-set/nhóm song hành; không thêm use case đăng ký thực tế.

### C07 · Bản đang hiệu lực và bản của khóa

BR-22/26 cho bản hiện hành toàn CTĐT và bản lịch sử vẫn áp dụng cho khóa cũ. Mô hình không tự nâng phiên bản SV. Ví dụ K2023 gắn 1.1 cần quyết định chuyển đổi nếu khác bản đầu vào.

### C08 · Quyền còn thiếu

SRS chưa chốt quyền: chỉ định trưởng nhóm, ủy quyền, xuất tài liệu, chạy xét lô, quản lý ánh xạ, ghi đè ma trận/TC, xem đồ thị và một số báo cáo chi tiết. Catalog nêu quyền tạm từng UC; không xem là chính sách đã được trường xác nhận.

### C09 · Tín chỉ và điều kiện tự chọn

FR-29 cho tối thiểu TC hoặc số HP nhưng thuật toán 7.4 mới mô tả TC. EC-17 cấm tính đôi nhóm tương đương; tổng TC phải tránh đếm trùng và xử lý TC tự do theo quy chế. UC-64 giữ cả hai loại hạn mức, cần chốt công thức triển khai.

### C10 · Phiên bản đề cương qua API

Endpoint HP/{maHP}/de-cuong chưa mang phiên bản, trong khi SV phải xem đúng bản lịch sử. Mô hình yêu cầu ngữ cảnh bản được phép; tham số/token/ngữ cảnh cụ thể cần thiết kế và chốt.

### C11 · Tương đương độc lập với phiên bản

EC-16 cho nhóm tương đương toàn trường áp dụng mọi phiên bản; snapshot lại chứa các quan hệ. Cần chốt việc xét lại lịch sử dùng quy tắc hiện tại hay quy tắc tại thời điểm xét; không tự tuyên bố kết quả cũ luôn bất biến.

### C12 · Các quyết định tạm Q-01..Q-17

Giữ DEC hiện có: CLO dùng chung; ảnh hưởng nhiều CTĐT; thang 4; tương đương hai chiều/bắc cầu; HP ngoài khoa chuyển R1; gửi lại từ cấp 1; cờ Excel giữ nguyên; DB ưu tiên; HP điều kiện trong xét; song ngữ/PDF nên có; tài khoản nội bộ; nhắc hạn tùy chọn. Các Q chưa xác nhận vẫn là rủi ro yêu cầu.

## Quan hệ chính xác trong sơ đồ

| Nguồn | Quan hệ | Đích | Điều kiện / điểm mở rộng |
|---|---|---|---|
| UC-13 | include | UC-17 | Luôn kiểm tra chu trình trước lưu quan hệ |
| UC-35 | include | UC-58 | Luôn kiểm tra trước lưu công thức |
| UC-38 | include | UC-57 | Trước chuyển trạng thái gửi duyệt |
| UC-46 | include | UC-49 | Chỉ nhánh đồng ý cuối cùng |
| UC-72 | include | UC-75 | Kiểm tra, không ghi nghiệp vụ |
| UC-73 | include | UC-75 | Kiểm tra lại trước giao dịch ghi |
| UC-30 | extend | UC-29 | EP-MT: khi xem ma trận; có quyền và chọn ghi đè |
| UC-55 | extend | UC-54 | EP-TC: có chênh lệch; có quyền và chọn chấp nhận |
| UC-60 | include | UC-63 | Tính theo sinh viên và học kỳ |
| UC-61 | include | UC-64 | Trả kết luận và chi tiết thiếu |
| UC-84 | include | UC-65 | Luôn xác định đúng phiên bản của SV |
| UC-68 | include | UC-63 | Cùng quy tắc với web |
| UC-70 | include | UC-64 | Cùng quy tắc với web |
| UC-62 | include | UC-64 | Lặp cho mỗi SV của khóa |
| UC-84 | generalization | UC-18 | Chuyên biệt mục tiêu tra cứu cho Sinh viên |
| UC-54 | include | UC-56 | Tính tổng trước khi đối chiếu cảnh báo |
| UC-33 | include | UC-16 | Xác định mọi CTĐT dùng đề cương này |

Không dùng `include` để chỉ “xảy ra trước/sau”. Không dùng `extend` chỉ vì chức năng thuộc mức NÊN CÓ. Không suy diễn kế thừa giữa các cấp tổ chức. Các trang quan hệ ghi mã vai trò trong ô chú thích; actor và association đầy đủ ở trang nghiệp vụ tương ứng.

## Danh mục use case

### UC-01 · Đăng nhập / kết thúc phiên [BS]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: Mục 3.4 / 6 / NFR / Q-13 (xem mô tả). Tài khoản nội bộ theo Q-13; hết phiên sau 60 phút không hoạt động (NFR-08). Tiền điều kiện chung của nghiệp vụ là phiên hợp lệ và quyền đúng phạm vi. Không suy diễn chức năng SSO hay quên mật khẩu.

### UC-02 · Quản lý cây đơn vị và nhóm chuyên môn [BB]

Tác nhân: R1. Nguồn: FR-01, FR-02. Thêm, sửa, ngừng hoạt động; cây Trường - Phòng/Khoa - Nhóm. Không xóa mất dấu vết lịch sử.

### UC-03 · Phân công thành viên nhóm chuyên môn [BB]

Tác nhân: R1, R2. Nguồn: FR-03. Một giảng viên có thể thuộc nhiều nhóm. R4 chỉ đề xuất thay đổi qua UC-09.

### UC-04 · Chỉ định trưởng nhóm chuyên môn [BB]

Tác nhân: R1. Nguồn: FR-04. Lưu thời gian hiệu lực. SRS không chỉ rõ quyền của R2 cho việc chỉ định trưởng nhóm; tạm dùng R1 theo quyền quản trị.

### UC-05 · Quản lý tài khoản người dùng [BB]

Tác nhân: R1. Nguồn: FR-06. Tạo, sửa, vô hiệu hóa. Cấm xóa cứng tài khoản đã phát sinh giao dịch; đề xuất đang xử lý tiếp tục tồn tại.

### UC-06 · Gán vai trò và phạm vi quyền [BB]

Tác nhân: R1. Nguồn: FR-07, FR-10. Một người nhiều vai trò; từng vai trò kèm phạm vi đối tượng, thời hạn; ghi nhật ký mọi thay đổi.

### UC-07 · Phân công Giám đốc CTĐT [BB]

Tác nhân: R1. Nguồn: FR-08, FR-26. Phân công một người phụ trách nhiều CTĐT và ghi nhận thời hạn. R2 đề xuất bằng UC-09.

### UC-08 · Ủy quyền phê duyệt có thời hạn [NC]

Tác nhân: R1, R3, R4. Nguồn: FR-09. Người có quyền duyệt ủy quyền trong phạm vi và thời hạn hợp lệ; tự hết hiệu lực khi hết hạn. Quyền thực hiện cụ thể cần xác nhận vì bảng 3.4 chưa có dòng ủy quyền.

### UC-09 · Đề xuất thay đổi tổ chức / phân công [BB]

Tác nhân: R2, R4. Nguồn: Mục 3.4 / 6 / NFR / Q-13 (xem mô tả). R2: đề xuất đơn vị, nhóm, phân công GĐ; R4: chỉ đề xuất thành viên nhóm. Đây là quyền nêu tại mục 3.4; SRS chưa định nghĩa tuyến duyệt loại đề xuất này, tạm chuyển R1 xem xét.

### UC-10 · Tra cứu danh mục học phần [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-11, FR-12, FR-13, FR-14, FR-15, FR-16. Xem/tìm học phần dùng chung; tên Việt bắt buộc, Anh tùy chọn; loại HP, trạng thái, khoa/nhóm; tín chỉ thực không âm, gồm 0 và 2.5. R6 xem dữ liệu được công bố, không mở quyền xem nháp.

### UC-11 · Soạn thay đổi thông tin học phần [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-05, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17. Thêm/sửa mã, tên, tín chỉ, loại, đơn vị phụ trách; ghi nhận HP thuộc khoa khác. R1 quản trị dữ liệu chưa ban hành; R2-R4 chỉ soạn trong đề xuất. Không cho R5 sửa danh mục. Luôn xem phạm vi CTĐT bị ảnh hưởng trước khi sửa HP hiện có.

### UC-12 · Đổi trạng thái sử dụng học phần [BB]

Tác nhân: R1. Nguồn: FR-15. Đang sử dụng / Ngừng mở lớp / Đã hủy; ngừng mở phải có HP thay thế. Có người học thì không xóa cứng (EC-50). Dữ liệu đã ban hành vẫn phải qua đề xuất.

### UC-13 · Soạn quan hệ phụ thuộc / thay thế [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-18, FR-19, FR-20. Học trước, tiên quyết có ngưỡng điểm, song hành, thay thế. Tương đương tách sang UC-14 vì quyền khác. Chặn chu trình học trước/tiên quyết khi lưu; HP ngoài khung cảnh báo.

### UC-14 · Soạn nhóm học phần tương đương [BB]

Tác nhân: R1, R2, R3. Nguồn: FR-18, FR-21. Quan hệ hai chiều và bắc cầu; nhóm dùng chung toàn trường, xuyên chương trình và phiên bản. R2/R3 chỉ đề xuất; R4 không có quyền khai báo tương đương theo 3.4.

### UC-15 · Xem đồ thị quan hệ học phần [NC]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-22. Hiển thị trực quan quan hệ; quyền tra cứu kế thừa phạm vi xem danh mục, SV chỉ xem dữ liệu công bố. Quyền xem đồ thị là diễn giải từ quyền xem danh mục.

### UC-16 · Xác định CTĐT bị ảnh hưởng [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-17. Hành vi hỗ trợ bắt buộc trước khi sửa học phần hiện có và đề cương dùng chung; chỉ rõ mọi CTĐT sử dụng HP. Không phải một tác nhân hệ thống.

### UC-17 · Kiểm tra chu trình phụ thuộc [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-20, FR-80. Kiểm tra đồ thị học trước/tiên quyết; từ chối lưu quan hệ gây chu trình và chỉ đường đi. Không suy diễn quy tắc này tự bao phủ chu trình song hành.

### UC-18 · Tra cứu chương trình và khung [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-23, FR-24, FR-28, FR-32, FR-88, FR-89. Xem thông tin Kỹ sư/Cử nhân, khung nhóm theo học kỳ, tổng TC, lọc/tìm theo học kỳ, khối, bắt buộc/tự chọn. SV: đúng phiên bản được gắn, kèm trạng thái Đã đạt/Đang học/Chưa học/Không đạt.

### UC-19 · Soạn thông tin chương trình [BB]

Tác nhân: R1, R2, R3. Nguồn: FR-23, FR-24, FR-26. Mã/tên CTĐT, ngành, trình độ, khóa, số học kỳ, tổng TC/bắt buộc/tự chọn; liên kết GĐ được phân công. R3 chỉ CTĐT phụ trách; không khởi tạo chương trình mới từ đầu.

### UC-20 · Nhân bản CTĐT cho khóa mới [BB]

Tác nhân: R1, R2, R3. Nguồn: FR-25. Chọn CTĐT nền, sao chép nội dung thành bản làm việc cho khóa mới; không tự ban hành. R2/R3 chỉ đề xuất nhân bản, R3 trong phạm vi phụ trách.

### UC-21 · Soạn và bố trí khung chương trình [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-27, FR-30. Đủ trường mục 4.3; thêm/sửa/bỏ dòng ở bản làm việc, đổi thứ tự/chuyển học kỳ. Chặn trùng HP, xung đột bắt buộc/tự chọn, học kỳ vượt số khai báo. Giữ cờ HT ĐA/TQ ĐA và Ký hiệu nguyên trạng.

### UC-22 · Khai báo nhóm học phần tự chọn [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-29. Đặt TC tối thiểu hoặc số HP tối thiểu từng nhóm; danh sách lựa chọn có thể lớn hơn hạn mức. Là một phần soạn khung, không phải sửa trực tiếp bản công bố.

### UC-23 · Xuất khung ra Excel [BB]

Tác nhân: R1, R3. Nguồn: FR-36. Xuất định dạng giống bảng gốc; các cột suy diễn được tính theo ngữ cảnh SV nếu có. Quyền xuất chưa có trong 3.4; tạm giới hạn R1/R3 như nhập liệu, cần xác nhận.

### UC-24 · Xuất CTĐT ra PDF [NC]

Tác nhân: R1, R3. Nguồn: FR-37. Xuất bản chọn theo mẫu tổng quát khi chưa có mẫu quyết định trường (Q-14). Quyền xuất tạm R1/R3; không coi là quyền công khai.

### UC-25 · Tra cứu PLO, CLO và ma trận [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-38, FR-39, FR-40. PLO theo CTĐT; CLO dùng chung theo đề cương HP; ma trận theo cặp CTĐT-HP. R6 chỉ xem dữ liệu công bố liên quan phiên bản áp dụng.

### UC-26 · Soạn PLO của chương trình [BB]

Tác nhân: R1, R2, R3. Nguồn: FR-38. Mã, mô tả Việt/Anh, nhóm năng lực; R3 theo CTĐT phụ trách, R2/R3 qua đề xuất.

### UC-27 · Soạn CLO của học phần [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-39. CLO thuộc đề cương dùng chung; R4/R5 chỉ HP thuộc nhóm, R3 theo CTĐT phụ trách; mọi thay đổi bản công bố qua đề xuất.

### UC-28 · Soạn ma trận CLO - PLO [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-40. Theo cặp CTĐT-HP, mức I/R/M hoặc 1-3; cùng HP có thể ánh xạ các PLO khác nhau. R3 trong CTĐT, R4/R5 trong HP được phân công.

### UC-29 · Xem ma trận HP - PLO suy diễn [NC]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-41. Tổng hợp từ CLO-PLO; chức năng nên có. Phạm vi xem suy ra từ quyền xem PLO/CLO; SV chỉ bản công bố.

### UC-30 · Ghi đè ma trận HP - PLO [NC]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-41. Mở rộng tùy chọn khi đang xem ma trận và người dùng có quyền soạn, cần điều chỉnh thủ công. R2-R5 thực hiện trong đề xuất; quyền này suy từ quyền sửa ma trận, cần xác nhận.

### UC-31 · Rà soát độ bao phủ chuẩn đầu ra [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-42, FR-54. Xem PLO không HP đáp ứng, CLO không PLO, HP không đóng góp PLO, CLO thiếu thành phần đánh giá. R4 trong phạm vi nhóm; R5 nhận lỗi liên quan lúc soạn/gửi duyệt, không tự có quyền báo cáo toàn khoa.

### UC-32 · Tra cứu đề cương và công thức điểm [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-44, FR-45, FR-93. Đọc đầy đủ thông tin, mô tả, mục tiêu, CLO, nội dung tuần/chương, phương pháp dạy/đánh giá, tài liệu. SV xem phiên bản áp dụng; dDUT có UC-69 riêng.

### UC-33 · Soạn nội dung đề cương [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-44, FR-45, FR-46, FR-48. Rich text, một đề cương dùng chung mỗi HP; song ngữ tên/mô tả/CLO là phần nên có FR-48. Xem các CTĐT ảnh hưởng trước sửa; ghi ở bản làm việc/đề xuất.

### UC-34 · Đính kèm đề cương đã ký [NC]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-47. Tệp PDF/Word lưu theo phiên bản. Chỉ thêm trong bản làm việc được phép, không thay tệp của bản đã ban hành. Có thể thực hiện độc lập trước gửi duyệt nên không ép thành «extend» của soạn văn bản.

### UC-35 · Soạn công thức và điều kiện điểm [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-49, FR-50, FR-51, FR-52. Thành phần, trọng số, điều kiện/ngưỡng; điểm liệt là phần nên có FR-52. Chặn lưu tổng khác 100%, từng trọng số ngoài (0,100]. Hiệu lực từ học kỳ kế tiếp; không nhập điểm SV.

### UC-36 · Ánh xạ thành phần đánh giá - CLO [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-53, FR-54. Mỗi CLO được ít nhất một thành phần bao phủ; thiếu thì cảnh báo và chặn gửi duyệt. Không nhất thiết chặn mọi lần lưu nháp chưa hoàn thiện.

### UC-37 · Tạo / sửa / xóa đề xuất nháp [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-55, FR-56, FR-68. Chọn đối tượng và loại thay đổi, lưu nội dung trước/sau. Chỉ chủ sở hữu sửa/xóa nháp (6.1.2); kiểm tra quyền từng loại tại 3.4. Cảnh báo CR đang mở cùng đối tượng; không cho R5 tạo loại sửa khung/PLO/danh mục.

### UC-38 · Gửi / gửi lại đề xuất [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-55, FR-57, FR-61, FR-63, FR-68. Chủ sở hữu gửi nháp hợp lệ; xác định các nhóm/CTĐT bị tác động, người duyệt, kiểm tra xung đột và độ bao phủ. Gửi lại sau trả lại bắt đầu cấp 1; bỏ qua cấp trùng người tạo theo điều kiện đã ghi ở phần vấn đề SRS.

### UC-39 · Thu hồi đề xuất của mình [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-60. Chỉ chủ sở hữu và chưa cấp nào phê duyệt. Sau thu hồi đề xuất chỉ đọc theo 6.1.2; không dùng «extend» gửi duyệt vì là mục tiêu độc lập ở thời điểm khác.

### UC-40 · Xem đề xuất, diff và lịch sử [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-58, FR-62, FR-67. Xem nội dung trước/sau, ai/khi nào/ý kiến/cấp duyệt và tiến độ nhiều người. R2 toàn khoa; các vai trò khác theo chủ sở hữu, phạm vi và phân công.

### UC-41 · Bình luận trên đề xuất [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-62. R2 xem/góp ý toàn khoa nhưng không chặn luồng; các vai trò khác theo phạm vi. Bình luận độc lập với quyết định đồng ý/trả lại/từ chối.

### UC-42 · Xem hàng đợi chờ duyệt [BB]

Tác nhân: R1, R3, R4. Nguồn: FR-65. Chỉ đề xuất cần người dùng xử lý trong phạm vi; hiển thị cả nhiệm vụ được ủy quyền hợp lệ.

### UC-43 · Xử lý đề xuất cấp chuyên môn [BB]

Tác nhân: R1, R4. Nguồn: FR-57, FR-58, FR-59, FR-61, FR-67. Xem diff, đồng ý/trả lại/từ chối; nhiều nhóm phải đủ tất cả trưởng nhóm. R1 có quyền can thiệp với nhật ký; không kế thừa toàn bộ vai trò R4.

### UC-44 · Xử lý đề xuất cấp chương trình [BB]

Tác nhân: R1, R3. Nguồn: FR-57, FR-58, FR-59, FR-61, FR-67. Xem diff và ảnh hưởng, đồng ý/trả lại/từ chối; nhiều CTĐT cần tất cả GĐ liên quan. R1 can thiệp có nhật ký.

### UC-45 · Trả lại / từ chối tại cấp cuối [BB]

Tác nhân: R1. Nguồn: FR-59, FR-67. Nhập lý do tối thiểu 20 ký tự. Trả lại về NHÁP và đi lại từ cấp 1; từ chối đóng đề xuất theo 6.1.1/2. EC-26 diễn đạt khác, được đánh dấu cần xác nhận.

### UC-46 · Chấp thuận cuối và ban hành phiên bản [BB]

Tác nhân: R1. Nguồn: FR-57, FR-59, FR-69, FR-70, FR-71. Chỉ quyết định đồng ý ở cấp cuối mới ban hành; kiểm tra điều kiện và metadata số QĐ/ngày ký/học kỳ/khóa/người ban hành. Tạo snapshot bất biến; chờ đầu học kỳ mới kích hoạt (diễn giải FR-69 + 6.2). Chặn thiếu đề cương EC-44.

### UC-47 · Nhận thông báo nghiệp vụ [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-63, FR-64, FR-66. Trong ứng dụng khi chuyển cấp; email sự kiện quan trọng là NÊN CÓ; nhắc tồn đọng là TÙY CHỌN, kích hoạt nội bộ theo lịch. Không vẽ đồng hồ hay bản thân hệ thống làm tác nhân.

### UC-48 · Gửi email sự kiện quan trọng [NC]

Tác nhân: E2. Nguồn: FR-64. Hành vi hỗ trợ qua dịch vụ email bên ngoài, lựa chọn triển khai giả định; chỉ chạy khi kênh email được bật. FR-64 không bắt buộc có nhà cung cấp độc lập.

### UC-49 · Tạo snapshot toàn bộ CTĐT [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-69, FR-70, FR-71. Chụp thông tin, khung/quan hệ/nhóm tự chọn, PLO, đề cương, CLO/ma trận, metadata. Tất cả CTĐT bị ảnh hưởng được tạo bản tương ứng; giữ nguyên bản cũ. Được bao gồm trong chấp thuận cuối.

### UC-50 · So sánh hai phiên bản [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-72. Chọn hai bản cùng CTĐT; xem thêm/xóa/sửa. R6 không có quyền so sánh theo 3.4.

### UC-51 · Xem lịch sử và timeline phiên bản [BB]

Tác nhân: R1, R2, R3, R4, R5. Nguồn: FR-73, FR-76. Xem đầy đủ phiên bản lịch sử trong phạm vi; timeline nên có FR-76. Sinh viên dùng UC-18/32 theo bản gắn với mình, không tự tra cứu mọi lịch sử.

### UC-52 · Gán phiên bản áp dụng cho khóa / SV [BB]

Tác nhân: R1. Nguồn: FR-74. Ánh xạ khóa - phiên bản; SV giữ bản lúc nhập học trừ quyết định chuyển đổi. Chuyển ngành/trình độ gắn lại theo quyết định, song ngành gắn hai CTĐT xét độc lập; bảo lưu giữ bản cũ (EC-33..37). Quyền quản lý ánh xạ tạm R1.

### UC-53 · Ban hành phiên bản đính chính [BB]

Tác nhân: R1. Nguồn: FR-75. Lý do ban hành nhầm, chuẩn bị thay đổi qua luồng duyệt rồi ban hành bản đính chính. Không xóa/sửa lịch sử; mục tiêu này sử dụng quy tắc ban hành của UC-46, không tự bỏ qua phê duyệt.

### UC-54 · Xem kết quả kiểm tra nhất quán [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-77, FR-78, FR-79, FR-80, FR-81, FR-82. Tổng TC theo chương trình/học kỳ/khối/bắt buộc/tự chọn; so với khai báo, tiên quyết xếp sau, chu trình, trùng HP. Dashboard là phần nên có; cảnh báo/ràng buộc bắt buộc vẫn chạy khi ghi/gửi/ban hành.

### UC-55 · Chấp nhận chênh lệch tín chỉ có lý do [BB]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-78. Mở rộng tại EP-TC của UC-54 khi có chênh lệch, người dùng có quyền soạn khung và chọn ghi đè; lý do bắt buộc. Đây là chấp nhận ngoại lệ có dấu vết, không làm sai tổng được tính tự động. R2-R4 thao tác trong đề xuất.

### UC-56 · Tính tổng tín chỉ theo cấu trúc [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-77. Bắt buộc + tổng hạn mức tối thiểu từng nhóm tự chọn; không cộng toàn bộ danh sách ứng viên tự chọn. Hỗ trợ số thực, HP 0 TC. Tổng theo học kỳ/khối vẫn thể hiện đúng ngữ cảnh.

### UC-57 · Kiểm tra độ bao phủ đánh giá [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-53, FR-54. Rà mỗi CLO có thành phần đánh giá; thiếu thì trả danh sách lỗi và chặn gửi duyệt thay đổi đề cương. Có thể kiểm tra no-op nếu đề xuất không tác động đề cương.

### UC-58 · Kiểm tra trọng số và ngưỡng điểm [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-50, FR-51, FR-52. Tổng đúng 100%, mỗi trọng số >0 và <=100; thành phần điều kiện có ngưỡng. Điểm liệt nếu triển khai FR-52; lỗi chặn lưu công thức.

### UC-59 · Xem tiến độ học tập [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-89, FR-90. Hiển thị trạng thái HP, TC tích lũy, tỷ lệ hoàn thành, TC thiếu. SV chỉ chính mình; cán bộ bị giới hạn phạm vi nghiệp vụ, không suy từ dấu X thành quyền xem mọi SV (NFR-11, mục 3.3).

### UC-60 · Xem điều kiện đăng ký học phần [BB]

Tác nhân: R1, R2, R3, R4, R5, R6. Nguồn: FR-31, FR-83, FR-91, FR-92. Theo SV, học kỳ xét, phiên bản áp dụng: Được / Được nếu kèm song hành / Không được + lý do; Đã hoàn thành là trạng thái riêng ở 7.3. Chỉ tư vấn, không đăng ký thực tế.

### UC-61 · Xem kết quả xét tốt nghiệp [BB]

Tác nhân: R1, R2, R3, R6. Nguồn: FR-84, FR-85, FR-86. Kết luận và danh mục thiếu: HP bắt buộc, từng nhóm tự chọn, tổng TC, HP điều kiện; tương đương và thay thế. R3 theo CTĐT, R6 chính mình; R4/R5 không có quyền.

### UC-62 · Xét tốt nghiệp theo lô một khóa [NC]

Tác nhân: R1, R3. Nguồn: FR-87. Chọn khóa/CTĐT, tính từng SV và tổng hợp. Quyền tạm R1/R3 vì SRS chỉ quy định quyền xem kết quả, chưa phân quyền chạy lô; cần xác nhận R2.

### UC-63 · Tính điều kiện đăng ký [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-83. Lấy điểm cao nhất; đã hoàn thành, tiên quyết đủ ngưỡng thang 4, học trước có kết quả, song hành. Trả lý do thiếu. Cần chống chu trình song hành riêng, không chỉ dựa BR-11.

### UC-64 · Đánh giá điều kiện tốt nghiệp [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-84, FR-85, FR-86. Kiểm tra bắt buộc, hạn mức từng nhóm (TC hoặc số HP), tổng TC, điều kiện 0TC; công nhận tương đương theo tín chỉ thực học, không đếm đôi cùng yêu cầu. Dùng điểm cao nhất; trả hạng mục thiếu.

### UC-65 · Xác định phiên bản áp dụng [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-74, FR-88. Từ khóa và các quyết định chuyển đổi/SV; song ngành xác định từng CTĐT; không mặc định lấy bản mới nhất.

### UC-66 · Lấy CTĐT / phiên bản qua API [BB]

Tác nhân: E3. Nguồn: FR-88, FR-94. CTĐT đúng phiên bản SV và nội dung bản cụ thể; endpoint CTĐT của SV và endpoint phiên bản mục 8.3. Kiểm tra token, khóa ứng dụng và phạm vi dữ liệu, không tự mở mọi phiên bản.

### UC-67 · Lấy tiến độ học tập qua API [BB]

Tác nhân: E3. Nguồn: FR-90, FR-94. GET tiến độ của SV được phép truy cập; JSON, không cho thay đổi dữ liệu.

### UC-68 · Lấy điều kiện đăng ký qua API [BB]

Tác nhân: E3. Nguồn: FR-83, FR-91, FR-92, FR-94. Danh sách HP đủ điều kiện và lý do; cùng bộ quy tắc với cổng SV.

### UC-69 · Lấy đề cương qua API [BB]

Tác nhân: E3. Nguồn: FR-93, FR-94. Theo HP và ngữ cảnh phiên bản được phép. SRS endpoint chưa có tham số phiên bản; cần xác nhận cách chọn đề cương lịch sử.

### UC-70 · Lấy kết quả tốt nghiệp qua API [BB]

Tác nhân: E3. Nguồn: FR-84, FR-85, FR-86, FR-94. GET kết quả SV trong phạm vi token/ủy quyền. Không cho dDUT cập nhật hay ban hành dữ liệu.

### UC-71 · Tải tệp mẫu nhập liệu [BB]

Tác nhân: R1, R3. Nguồn: FR-97. Mẫu cho danh mục HP, khung, SV, kết quả học tập. R3 chỉ loại dữ liệu thuộc CTĐT được giao; chưa suy thành quyền nhập toàn trường.

### UC-72 · Chạy thử nhập Excel (dry-run) [BB]

Tác nhân: R1, R3. Nguồn: FR-33, FR-34, FR-96. Chọn loại dữ liệu và tệp; kiểm tra cột/kiểu, mã HP, dòng trùng, quan hệ và quy tắc. Báo lỗi từng dòng; không ghi dữ liệu nghiệp vụ. Không coi tệp Excel là actor.

### UC-73 · Xác nhận nhập dữ liệu Excel [BB]

Tác nhân: R1, R3. Nguồn: FR-33, FR-34, FR-35, FR-96, FR-101. Xác nhận tệp đã chạy thử thành công; kiểm tra lại dữ liệu còn hợp lệ để tránh thay đổi giữa hai bước. Ghi toàn bộ hoặc không ghi gì, lưu lịch sử phiên. Nhập vào bản công bố không được vượt FR-55.

### UC-74 · Xem lịch sử phiên nhập liệu [BB]

Tác nhân: R1, R3. Nguồn: FR-101. Ai nhập, loại dữ liệu, số dòng thành công/lỗi, kết quả; trong phạm vi được giao.

### UC-75 · Kiểm tra tệp và dữ liệu nhập [BB]

Tác nhân: Không trực tiếp; được gọi từ nghiệp vụ. Nguồn: FR-34, FR-35. Kiểm định định dạng/tham chiếu/trùng/chu trình; kết quả dry-run và trước commit dùng cùng quy tắc. Có lỗi: không ghi bất kỳ dòng nghiệp vụ nào.

### UC-76 · Cấu hình kết nối và lịch đồng bộ [BB]

Tác nhân: R1. Nguồn: FR-98, FR-99, FR-100. Nguồn SV/kết quả/lớp, kết nối chỉ đọc, lịch và quy tắc ưu tiên. Không cho ghi ngược dữ liệu trường. Quy tắc nguồn phải tôn trọng 8.2: DB ưu tiên SV/điểm, CMS ưu tiên HP/khung.

### UC-77 · Đồng bộ dữ liệu theo lịch [BB]

Tác nhân: E1. Nguồn: FR-98, FR-99, FR-100. Kích hoạt bởi lịch nội bộ (không vẽ actor Scheduler); E1 cung cấp dữ liệu. Ghi dữ liệu cục bộ theo giao dịch; mất kết nối rollback, ghi lỗi, thử theo lịch; mâu thuẫn ghi cảnh báo.

### UC-78 · Xem nhật ký và lỗi đồng bộ [BB]

Tác nhân: R1. Nguồn: FR-99, FR-100. Xem từng lần chạy, mâu thuẫn, lỗi kết nối. Quyền mặc định quản trị tích hợp R1; quyền tra cứu audit tổng quát theo UC-82.

### UC-79 · Đối sánh hai chương trình [NC]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-102. So sánh phần chung/khác của hai CTĐT, ví dụ Kỹ sư-Cử nhân. Giới hạn theo phạm vi báo cáo 3.4; R4 chỉ phần HP/nhóm được giao.

### UC-80 · Xem phân bổ tín chỉ [NC]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-103. Bảng/biểu đồ theo khối kiến thức; phân biệt danh sách HP tự chọn và hạn mức yêu cầu.

### UC-81 · Xuất ma trận phục vụ kiểm định [NC]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-43, FR-104. Excel PLO/CLO/HP theo bản lựa chọn, phục vụ AUN-QA/Bộ. Quyền suy từ báo cáo; R3/R4 theo phạm vi, cần xác nhận phạm vi xuất R4.

### UC-82 · Tra cứu nhật ký hệ thống [BB]

Tác nhân: R1, R2, R3. Nguồn: FR-10, FR-105, FR-106. Lọc người dùng/đối tượng/thời gian; người/hành động/giá trị trước-sau/thời điểm. R1 toàn hệ thống, R2 khoa, R3 CTĐT. Chỉ đọc log; lưu bất biến là ràng buộc toàn cục.

### UC-83 · Thống kê xử lý đề xuất [TC]

Tác nhân: R1, R2, R3, R4. Nguồn: FR-107. Số CR theo trạng thái, thời gian trung bình từng cấp; theo quyền báo cáo. Chức năng tùy chọn.

### UC-84 · Xem CTĐT áp dụng cho bản thân [BB]

Tác nhân: R6. Nguồn: FR-88, FR-89. Chuyên biệt của UC-18 cho SV; xác định bản được gắn trước khi hiển thị khung/trạng thái. Không cấp quyền tra cứu các CTĐT ngoài phạm vi.

## Truy vết đầy đủ FR

| FR | Mức | Use case / ràng buộc | Nội dung SRS |
|---|---|---|---|
| FR-01 | BẮT BUỘC | UC-02 | Hệ thống cho phép quản lý cây đơn vị: Trường → Phòng Đào tạo, Trường → Khoa → Nhóm chuyên môn |
| FR-02 | BẮT BUỘC | UC-02 | Hệ thống cho phép quản lý 04 nhóm chuyên môn của Khoa Công nghệ Thông tin, cho phép thêm/sửa/ngừng hoạt động nhóm |
| FR-03 | BẮT BUỘC | UC-03 | Hệ thống cho phép gán một giảng viên vào nhiều nhóm chuyên môn đồng thời (quan hệ n–n) |
| FR-04 | BẮT BUỘC | UC-04 | Hệ thống cho phép chỉ định Trưởng nhóm chuyên môn cho từng nhóm, ghi nhận thời gian hiệu lực |
| FR-05 | BẮT BUỘC | UC-11 | Hệ thống cho phép ghi nhận học phần thuộc khoa khác (Toán, Vật lý, Lý luận chính trị, Ngoại ngữ) |
| FR-06 | BẮT BUỘC | UC-05 | Hệ thống cho phép tạo, sửa, vô hiệu hóa tài khoản người dùng. Không cho phép xóa cứng tài khoản đã phát sinh giao dịch |
| FR-07 | BẮT BUỘC | UC-06 | Hệ thống cho phép gán một người dùng nhiều vai trò đồng thời, mỗi vai trò gắn với một phạm vi đối tượng cụ thể |
| FR-08 | BẮT BUỘC | UC-07 | Hệ thống cho phép phân công Giám đốc CTĐT phụ trách một hoặc nhiều Chương trình đào tạo |
| FR-09 | NÊN CÓ | UC-08 | Hệ thống cho phép ủy quyền phê duyệt có thời hạn khi người duyệt vắng mặt; hết thời hạn tự động thu hồi ủy quyền |
| FR-10 | BẮT BUỘC | UC-06, UC-82 | Hệ thống ghi nhật ký toàn bộ thao tác thay đổi phân quyền |
| FR-11 | BẮT BUỘC | UC-10, UC-11 | Hệ thống quản lý danh mục học phần dùng chung, khóa chính là mã học phần |
| FR-12 | BẮT BUỘC | UC-10, UC-11 | Số tín chỉ lưu ở kiểu số thực, hỗ trợ giá trị 0 và giá trị lẻ (0 · 1 · 2.5 · 3 · 4\) |
| FR-13 | BẮT BUỘC | UC-10, UC-11 | Học phần có tên tiếng Việt (bắt buộc) và tên tiếng Anh (tùy chọn) |
| FR-14 | BẮT BUỘC | UC-10, UC-11 | Hệ thống phân loại học phần: Lý thuyết · Thực hành · Thí nghiệm · Đồ án · Đồ án tốt nghiệp · Thực tập · Học phần điều kiện |
| FR-15 | BẮT BUỘC | UC-10, UC-11, UC-12 | Học phần có trạng thái: Đang sử dụng · Ngừng mở lớp · Đã hủy. Học phần ngừng mở lớp phải khai báo học phần thay thế |
| FR-16 | BẮT BUỘC | UC-10, UC-11 | Học phần ghi nhận khoa phụ trách và nhóm chuyên môn phụ trách |
| FR-17 | BẮT BUỘC | UC-11, UC-16 | Hệ thống hiển thị danh sách Chương trình đào tạo đang sử dụng một học phần trước khi cho phép sửa |
| FR-18 | BẮT BUỘC | UC-13, UC-14 | Hệ thống cho phép khai báo 05 loại quan hệ: học trước · tiên quyết · song hành · tương đương · thay thế |
| FR-19 | BẮT BUỘC | UC-13 | Quan hệ tiên quyết cho phép khai báo ngưỡng điểm kèm theo |
| FR-20 | BẮT BUỘC | UC-13, UC-17 | Hệ thống tự động phát hiện chu trình trong đồ thị quan hệ học trước/tiên quyết và chặn thao tác lưu |
| FR-21 | BẮT BUỘC | UC-14 | Hệ thống cho phép khai báo nhóm học phần tương đương (nhiều học phần cùng một nhóm, thay thế được cho nhau) |
| FR-22 | NÊN CÓ | UC-15 | Hệ thống hiển thị đồ thị quan hệ học phần dưới dạng sơ đồ trực quan |
| FR-23 | BẮT BUỘC | UC-18, UC-19 | Hệ thống quản lý thông tin CTĐT gồm: mã chương trình, tên chương trình, mã ngành, tên ngành, trình độ (Kỹ sư / Cử nhân), khóa áp dụng, số học kỳ, tổng tín chỉ yêu cầu, số tín chỉ bắt buộc, số tín chỉ tự chọn |
| FR-24 | BẮT BUỘC | UC-18, UC-19 | Hệ thống hỗ trợ đồng thời chương trình đào tạo Kỹ sư và Cử nhân với cấu trúc tín chỉ khác nhau |
| FR-25 | BẮT BUỘC | UC-20 | Hệ thống cho phép nhân bản một CTĐT hiện có làm nền cho chương trình khóa mới |
| FR-26 | BẮT BUỘC | UC-07, UC-19 | Hệ thống liên kết CTĐT với Giám đốc CTĐT phụ trách |
| FR-27 | BẮT BUỘC | UC-21 | Hệ thống quản lý khung chương trình dưới dạng danh sách dòng, mỗi dòng gồm đầy đủ các trường tương ứng với bảng Excel hiện tại (xem mục 4.3) |
| FR-28 | BẮT BUỘC | UC-18 | Hệ thống hiển thị khung chương trình nhóm theo học kỳ, có tổng tín chỉ từng học kỳ |
| FR-29 | BẮT BUỘC | UC-22 | Hệ thống cho phép khai báo nhóm học phần tự chọn, quy định số tín chỉ tối thiểu hoặc số học phần tối thiểu phải chọn trong nhóm |
| FR-30 | BẮT BUỘC | UC-21 | Hệ thống cho phép sắp xếp lại thứ tự dòng và chuyển học phần giữa các học kỳ |
| FR-31 | BẮT BUỘC | UC-60 | Hệ thống hiển thị cột "Đăng ký được?" như bảng Excel hiện tại, giá trị được tính tự động |
| FR-32 | BẮT BUỘC | UC-18 | Hệ thống cho phép lọc và tìm kiếm học phần trong khung theo học kỳ, khối kiến thức, trạng thái bắt buộc/tự chọn |
| FR-33 | BẮT BUỘC | UC-72, UC-73 | Hệ thống cho phép nhập khung chương trình từ file Excel theo đúng định dạng bảng hiện hành |
| FR-34 | BẮT BUỘC | UC-72, UC-73, UC-75 | Chức năng nhập liệu có chế độ chạy thử (dry-run), hiển thị báo cáo lỗi theo từng dòng trước khi ghi vào cơ sở dữ liệu |
| FR-35 | BẮT BUỘC | UC-73, UC-75 | Chức năng nhập liệu áp dụng nguyên tắc toàn vẹn: hoặc ghi toàn bộ, hoặc không ghi gì |
| FR-36 | BẮT BUỘC | UC-23 | Hệ thống cho phép xuất khung chương trình ra Excel với định dạng giống bản gốc |
| FR-37 | NÊN CÓ | UC-24 | Hệ thống cho phép xuất Chương trình đào tạo ra PDF phục vụ in ấn và lưu trữ |
| FR-38 | BẮT BUỘC | UC-25, UC-26 | Hệ thống quản lý danh sách PLO thuộc từng Chương trình đào tạo, gồm mã, mô tả tiếng Việt, mô tả tiếng Anh, nhóm năng lực |
| FR-39 | BẮT BUỘC | UC-25, UC-27 | Hệ thống quản lý danh sách CLO thuộc đề cương của từng học phần |
| FR-40 | BẮT BUỘC | UC-25, UC-28 | Hệ thống quản lý ma trận CLO – PLO theo từng cặp (Chương trình đào tạo, Học phần), với mức độ đóng góp theo thang I/R/M hoặc thang 1–3 |
| FR-41 | NÊN CÓ | UC-29, UC-30 | Hệ thống tự động suy diễn ma trận Học phần – PLO từ ma trận CLO – PLO, cho phép người dùng ghi đè thủ công |
| FR-42 | BẮT BUỘC | UC-31 | Hệ thống cảnh báo các lỗ hổng: PLO không được học phần nào đáp ứng · CLO không liên kết PLO nào · Học phần không đóng góp vào PLO nào |
| FR-43 | NÊN CÓ | UC-81 | Hệ thống cho phép xuất ma trận chuẩn đầu ra ra Excel phục vụ công tác kiểm định |
| FR-44 | BẮT BUỘC | UC-32, UC-33 | Mỗi học phần có duy nhất một đề cương chi tiết dùng chung cho mọi Chương trình đào tạo |
| FR-45 | BẮT BUỘC | UC-32, UC-33 | Đề cương gồm các phần: thông tin chung · mô tả học phần · mục tiêu · danh sách CLO · nội dung theo tuần/chương · phương pháp giảng dạy · phương pháp đánh giá · tài liệu tham khảo |
| FR-46 | BẮT BUỘC | UC-33 | Hệ thống cho phép soạn thảo nội dung bằng trình soạn thảo văn bản định dạng (rich text) |
| FR-47 | NÊN CÓ | UC-34 | Hệ thống cho phép đính kèm tệp (PDF, Word) làm bản đề cương đã ký; tệp đính kèm được lưu theo phiên bản |
| FR-48 | NÊN CÓ | UC-33 | Đề cương hỗ trợ song ngữ Việt – Anh ở các trường: tên học phần, mô tả, CLO |
| FR-49 | BẮT BUỘC | UC-35 | Hệ thống cho phép khai báo danh sách thành phần đánh giá kèm trọng số (ví dụ: Chuyên cần 10%, Bài tập 20%, Giữa kỳ 20%, Cuối kỳ 50%) |
| FR-50 | BẮT BUỘC | UC-35, UC-58 | Hệ thống kiểm tra tổng trọng số bằng 100% và chặn lưu nếu không thỏa mãn |
| FR-51 | BẮT BUỘC | UC-35, UC-58 | Hệ thống cho phép đánh dấu thành phần điều kiện kèm ngưỡng (ví dụ: chuyên cần dưới ngưỡng thì không được dự thi) |
| FR-52 | NÊN CÓ | UC-35, UC-58 | Hệ thống cho phép khai báo điểm liệt của thành phần và của học phần |
| FR-53 | BẮT BUỘC | UC-36, UC-57 | Hệ thống cho phép ánh xạ thành phần đánh giá – CLO, đảm bảo mỗi CLO được đánh giá bởi ít nhất một thành phần |
| FR-54 | BẮT BUỘC | UC-31, UC-36, UC-57 | Hệ thống cảnh báo khi có CLO chưa được thành phần đánh giá nào bao phủ |
| FR-55 | BẮT BUỘC | UC-37, UC-38 | Mọi thay đổi đối với dữ liệu đã ban hành phải được thực hiện thông qua Đề xuất thay đổi; không cho phép sửa trực tiếp |
| FR-56 | BẮT BUỘC | UC-37 | Hệ thống hỗ trợ các loại đề xuất: sửa công thức điểm · sửa PLO/CLO · sửa nội dung đề cương · sửa khung chương trình · sửa quan hệ học phần · sửa thông tin chương trình |
| FR-57 | BẮT BUỘC | UC-38, UC-43, UC-44, UC-46 | Đề xuất luân chuyển qua ba cấp duyệt: Trưởng nhóm chuyên môn → Giám đốc CTĐT → Phòng Đào tạo |
| FR-58 | BẮT BUỘC | UC-40, UC-43, UC-44 | Hệ thống hiển thị bảng so sánh trước/sau (diff) của nội dung thay đổi tại mọi cấp duyệt |
| FR-59 | BẮT BUỘC | UC-43, UC-44, UC-45, UC-46 | Người duyệt có ba lựa chọn: Đồng ý · Trả lại (kèm lý do bắt buộc) · Từ chối (kèm lý do bắt buộc) |
| FR-60 | BẮT BUỘC | UC-39 | Người tạo đề xuất được phép thu hồi đề xuất khi chưa có cấp nào phê duyệt |
| FR-61 | BẮT BUỘC | UC-38, UC-43, UC-44 | Khi người tạo đề xuất đồng thời là người duyệt của một cấp, hệ thống tự động bỏ qua cấp đó và ghi nhật ký lý do bỏ qua |
| FR-62 | BẮT BUỘC | UC-40, UC-41 | Ban lãnh đạo khoa có quyền xem và bình luận trên mọi đề xuất thuộc khoa, không tham gia chuỗi phê duyệt |
| FR-63 | BẮT BUỘC | UC-38, UC-47 | Hệ thống gửi thông báo trong ứng dụng cho người duyệt tiếp theo khi đề xuất chuyển cấp |
| FR-64 | NÊN CÓ | UC-47, UC-48 | Hệ thống gửi thông báo qua email cho các sự kiện quan trọng |
| FR-65 | BẮT BUỘC | UC-42 | Hệ thống hiển thị hàng đợi công việc (danh sách đề xuất chờ duyệt) cho từng người duyệt |
| FR-66 | TÙY CHỌN | UC-47 | Hệ thống nhắc hạn khi đề xuất tồn đọng quá số ngày quy định |
| FR-67 | BẮT BUỘC | UC-40, UC-43, UC-44, UC-45 | Hệ thống lưu lịch sử đầy đủ các bước duyệt: ai duyệt, khi nào, ý kiến gì |
| FR-68 | BẮT BUỘC | UC-37, UC-38 | Hệ thống phát hiện và cảnh báo khi có hai đề xuất đang mở cùng tác động lên một đối tượng |
| FR-69 | BẮT BUỘC | UC-46, UC-49 | Khi Phòng Đào tạo phê duyệt cấp cuối, hệ thống tạo ảnh chụp bất biến toàn bộ Chương trình đào tạo (khung chương trình \+ đề cương liên quan \+ PLO/CLO \+ ma trận) |
| FR-70 | BẮT BUỘC | UC-46, UC-49 | Mỗi phiên bản ghi nhận: số phiên bản, số quyết định ban hành, ngày ký, học kỳ hiệu lực, khóa áp dụng, người ban hành |
| FR-71 | BẮT BUỘC | UC-46, UC-49 | Dữ liệu của phiên bản đã ban hành không được phép sửa hoặc xóa dưới bất kỳ hình thức nào |
| FR-72 | BẮT BUỘC | UC-50 | Hệ thống cho phép so sánh hai phiên bản bất kỳ của cùng một Chương trình đào tạo, hiển thị các mục thêm mới / bị xóa / bị thay đổi |
| FR-73 | BẮT BUỘC | UC-51 | Hệ thống cho phép xem lại nội dung đầy đủ của bất kỳ phiên bản lịch sử nào |
| FR-74 | BẮT BUỘC | UC-52, UC-65 | Hệ thống duy trì ánh xạ Khóa sinh viên → Phiên bản CTĐT áp dụng |
| FR-75 | BẮT BUỘC | UC-53 | Việc thu hồi phiên bản ban hành nhầm được thực hiện bằng cách ban hành phiên bản đính chính, không xóa dữ liệu lịch sử |
| FR-76 | NÊN CÓ | UC-51 | Hệ thống hiển thị dòng thời gian (timeline) các phiên bản của một Chương trình đào tạo |
| FR-77 | BẮT BUỘC | UC-54, UC-56 | Hệ thống tự động tính tổng tín chỉ theo: toàn chương trình · từng học kỳ · từng khối kiến thức · bắt buộc và tự chọn |
| FR-78 | BẮT BUỘC | UC-54, UC-55 | Hệ thống cảnh báo khi tổng tín chỉ tính được khác với số khai báo, cho phép ghi đè kèm lý do |
| FR-79 | BẮT BUỘC | UC-54 | Hệ thống phát hiện học phần tiên quyết được xếp ở học kỳ sau học phần phụ thuộc |
| FR-80 | BẮT BUỘC | UC-17, UC-54 | Hệ thống phát hiện chu trình trong đồ thị học trước/tiên quyết |
| FR-81 | BẮT BUỘC | UC-54 | Hệ thống phát hiện học phần xuất hiện trùng lặp trong khung chương trình |
| FR-82 | NÊN CÓ | UC-54 | Hệ thống hiển thị bảng điều khiển kiểm tra sức khỏe của Chương trình đào tạo, liệt kê toàn bộ cảnh báo hiện có |
| FR-83 | BẮT BUỘC | UC-60, UC-63, UC-68 | Hệ thống tính cột "Đăng ký được?" cho từng học phần dựa trên kết quả học tập của sinh viên, trả về ba trạng thái như bảng Excel hiện hành |
| FR-84 | BẮT BUỘC | UC-61, UC-64, UC-70 | Hệ thống thực hiện xét tốt nghiệp cho sinh viên: kiểm tra đủ tín chỉ bắt buộc, đủ từng nhóm tự chọn, đủ các học phần điều kiện |
| FR-85 | BẮT BUỘC | UC-61, UC-64, UC-70 | Quá trình xét tốt nghiệp có tính đến học phần tương đương |
| FR-86 | BẮT BUỘC | UC-61, UC-64, UC-70 | Hệ thống liệt kê chi tiết các hạng mục còn thiếu khi sinh viên chưa đủ điều kiện tốt nghiệp |
| FR-87 | NÊN CÓ | UC-62 | Hệ thống cho phép xét tốt nghiệp theo lô cho toàn bộ một khóa |
| FR-88 | BẮT BUỘC | UC-18, UC-65, UC-66, UC-84 | Sinh viên xem được Chương trình đào tạo đúng phiên bản áp dụng cho khóa của mình |
| FR-89 | BẮT BUỘC | UC-18, UC-59, UC-84 | Sinh viên xem được khung chương trình bố trí theo học kỳ, kèm trạng thái từng học phần: Đã học đạt · Đang học · Chưa học · Không đạt |
| FR-90 | BẮT BUỘC | UC-59, UC-67 | Sinh viên xem được tiến độ học tập: số tín chỉ tích lũy, tỷ lệ hoàn thành, số tín chỉ còn thiếu |
| FR-91 | BẮT BUỘC | UC-60, UC-68 | Sinh viên xem được danh sách học phần đủ điều kiện đăng ký cho học kỳ tới |
| FR-92 | BẮT BUỘC | UC-60, UC-68 | Sinh viên xem được lý do cụ thể khi một học phần chưa đủ điều kiện đăng ký |
| FR-93 | BẮT BUỘC | UC-32, UC-69 | Sinh viên xem được đề cương chi tiết và công thức điểm của từng học phần |
| FR-94 | BẮT BUỘC | UC-66, UC-67, UC-68, UC-69, UC-70 | Hệ thống cung cấp REST API kèm tài liệu OpenAPI phục vụ tích hợp với ứng dụng dDUT |
| FR-95 | BẮT BUỘC | UC-18, UC-59, UC-60, UC-61, UC-32, UC-84 (responsive) | Giao diện cổng sinh viên hoạt động tốt trên thiết bị di động (responsive) |
| FR-96 | BẮT BUỘC | UC-72, UC-73 | Hệ thống nhập dữ liệu từ file Excel cho: danh mục học phần · khung chương trình · danh sách sinh viên · kết quả học tập |
| FR-97 | BẮT BUỘC | UC-71 | Hệ thống cung cấp tệp mẫu cho từng loại dữ liệu nhập |
| FR-98 | BẮT BUỘC | UC-76, UC-77 | Hệ thống kết nối cơ sở dữ liệu có sẵn ở chế độ chỉ đọc để lấy dữ liệu sinh viên và kết quả học tập |
| FR-99 | BẮT BUỘC | UC-76, UC-77, UC-78 | Hệ thống có tác vụ đồng bộ định kỳ, ghi nhật ký từng lần đồng bộ |
| FR-100 | BẮT BUỘC | UC-76, UC-77, UC-78 | Khi hai nguồn dữ liệu mâu thuẫn, hệ thống áp dụng quy tắc ưu tiên đã cấu hình và ghi nhận cảnh báo |
| FR-101 | BẮT BUỘC | UC-73, UC-74 | Hệ thống lưu lịch sử các phiên nhập liệu kèm kết quả (số dòng thành công, số dòng lỗi) |
| FR-102 | NÊN CÓ | UC-79 | Hệ thống cho phép đối sánh hai Chương trình đào tạo (ví dụ Kỹ sư và Cử nhân cùng ngành), hiển thị phần chung và phần khác biệt |
| FR-103 | NÊN CÓ | UC-80 | Hệ thống thống kê phân bổ tín chỉ theo khối kiến thức dưới dạng bảng và biểu đồ |
| FR-104 | NÊN CÓ | UC-81 | Hệ thống xuất ma trận PLO/CLO phục vụ kiểm định AUN-QA và báo cáo Bộ Giáo dục và Đào tạo |
| FR-105 | BẮT BUỘC | UC-82 | Hệ thống ghi nhật ký bất biến toàn bộ thao tác: người thực hiện, hành động, đối tượng, giá trị trước/sau, thời điểm |
| FR-106 | BẮT BUỘC | UC-82 | Hệ thống cho phép tra cứu nhật ký theo người dùng, theo đối tượng, theo khoảng thời gian |
| FR-107 | TÙY CHỌN | UC-83 | Hệ thống thống kê tình hình xử lý đề xuất: số đề xuất theo trạng thái, thời gian xử lý trung bình từng cấp |

## Các tình huống biên

| Nhóm EC | Được xử lý ở |
|---|---|
| EC-01..08: tín chỉ và khung | UC-10/11/21/22/54/55/56/64 |
| EC-09..13: quan hệ | UC-13/17/54/60/63 |
| EC-14..18: tương đương | UC-14/63/64 |
| EC-19..29: phân quyền và duyệt | UC-05/08/37..48; C02/C03/C04 |
| EC-30..38: phiên bản | UC-35/46/49..53/64/65; C01/C07 |
| EC-39..44: đề cương/điểm | UC-35/36/38/46/57/58/64/77; EC-43 tính lại và báo R1 |
| EC-45..52: dữ liệu và vận hành | UC-05/12/18/59/71..78 |

## Nguồn quy tắc UML

[OMG UML 2.5.1, chương 18 UseCases](https://www.omg.org/spec/UML/2.5.1). Cách thể hiện actor, association, include, extend và generalization dựa trên UML; màu/mã trang chỉ phục vụ đọc tài liệu.