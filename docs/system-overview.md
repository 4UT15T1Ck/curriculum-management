# Tổng quan hệ thống — Quản lý Chương trình đào tạo

Đọc trong 5 phút để nắm hệ thống làm gì, ai dùng, các phần ăn khớp ra sao. Chi tiết: yêu cầu ở `docs/requirement/REQUIREMENTS.md`, kiến trúc ở `docs/architecture/`, từng tính năng ở `docs/implementation/`.

## 1. Hệ thống để làm gì

Khoa CNTT – ĐHBK Đà Nẵng quản lý **chương trình đào tạo (CTĐT)** trên một chỗ thay vì file Excel rời: danh mục học phần, khung chương trình, đề cương, chuẩn đầu ra (PLO/CLO). Mọi thay đổi sau khi ban hành phải đi qua **đề xuất → duyệt ba cấp → ban hành phiên bản mới**, và mỗi phiên bản được chụp lại bất biến để tra cứu về sau.

## 2. Ai dùng

| Vai | Là ai | Làm gì chính |
|---|---|---|
| **R1** Phòng Đào tạo | Quản trị | Tài khoản, phân quyền, cơ cấu tổ chức, toàn bộ dữ liệu; duyệt cấp cuối và ban hành |
| **R2** Ban lãnh đạo khoa | Xem, góp ý | Xem mọi thứ, bình luận trên đề xuất; không duyệt |
| **R3** Giám đốc CTĐT | Phụ trách một CTĐT | Thông tin CTĐT, khung, PLO, ma trận của CTĐT mình; duyệt cấp 2 |
| **R4** Điều phối nhóm chuyên môn | Trưởng một nhóm học phần | Học phần và đề cương của nhóm; duyệt cấp 1 |
| **R5** Giảng viên | Thành viên nhóm | Soạn đề cương, CLO; tạo đề xuất thay đổi |
| **R6** Sinh viên | Người xem | Chỉ xem bản đã ban hành của CTĐT mình |

R3, R4, R5 **suy ra từ phân công** (làm Giám đốc CTĐT, điều phối hoặc thuộc nhóm chuyên môn), có thời hạn hiệu lực. Quyền kiểm ở máy chủ theo ma trận vai × quyền (MH-15), kèm phạm vi (toàn bộ / đơn vị / CTĐT / nhóm).

## 3. Vòng đời dữ liệu

```
Nháp ──(sửa trực tiếp)──► Ban hành khởi tạo ──► Đang hiệu lực ──► Lịch sử
                                                    ▲
             Đề xuất → duyệt cấp 1 → cấp 2 → cấp 3 ─┘ (phiên bản mới, kích hoạt đầu học kỳ)
```

Trước lần ban hành đầu tiên, người có quyền sửa trực tiếp. Sau đó dữ liệu đã ban hành bị khóa: mọi nút sửa thành **"Tạo đề xuất"**.

## 4. Các tính năng (bản MVP)

| # | Tính năng | Có gì | Ai dùng |
|---|---|---|---|
| F-01 | Đăng nhập, phiên | Đăng nhập, đổi mật khẩu lần đầu, hết phiên sau 60 phút không thao tác | Mọi người |
| F-02 | Tài khoản, vai trò, quyền | Tạo/vô hiệu hóa tài khoản, gán vai kèm phạm vi và thời hạn, xem ma trận quyền | R1 |
| F-03 | Đơn vị, nhóm chuyên môn | Cây Trường → Khoa → đơn vị; nhóm chuyên môn, thành viên, điều phối có thời hạn | R1, R4 |
| F-04 | Danh mục học phần | Thêm/sửa học phần (mã cố định), trạng thái Hoạt động / Ngừng mở lớp / Hủy, tìm kiếm | R1, R3, R4, R5 |
| F-05 | Quan hệ học phần | Tiên quyết (kèm ngưỡng điểm), học trước, song hành, thay thế; **chặn vòng lặp** A → B → A; nhóm học phần tương đương | R1 (nhóm tương đương), R3, R4 |
| F-06 | CTĐT, Giám đốc CTĐT | Thông tin CTĐT, tổng tín chỉ phải khớp, phân công Giám đốc, nhân bản CTĐT cho khóa mới | R1, R3 |
| F-07 | Khung chương trình | Học phần theo học kỳ, bắt buộc/tự chọn, nhóm tự chọn (số tín chỉ/số học phần tối thiểu), điều kiện xếp trước sau, kéo thả sắp xếp | R1, R3, R4 |
| F-08 | Kiểm tra nhất quán | So tín chỉ khai báo với tín chỉ tính được, lỗi vòng lặp, lỗi nhóm; chấp nhận chênh lệch kèm lý do. **Chặn gửi đề xuất và ban hành khi còn lỗi** | R1, R3 (chấp nhận), R2, R4, R5 (xem) |
| F-10 | Đề cương | Một đề cương dùng chung cho mọi CTĐT có học phần đó; soạn thảo định dạng, nội dung theo tuần, song ngữ Việt–Anh, tệp đính kèm; chuỗi bản sửa | R3, R4, R5 |
| F-11 | PLO, CLO, ma trận | PLO theo từng CTĐT; CLO trong đề cương; ma trận học phần–PLO (trọng số) và CLO–PLO; báo cáo độ phủ | R1, R3, R4, R5; R6 xem PLO |
| F-13 | Đề xuất thay đổi | Tạo đề xuất (khung, học phần, đề cương, PLO, …) trên **bản làm việc**, xem so sánh trước/sau, gửi duyệt, thu hồi, cảnh báo trùng | R1..R5 |
| F-14 | Duyệt ba cấp, thông báo | Điều phối (cấp 1) → Giám đốc CTĐT (cấp 2) → Phòng Đào tạo (cấp 3); đồng ý / trả lại / từ chối, bỏ qua cấp mà người tạo là người duyệt, bình luận, hàng đợi "Chờ tôi duyệt", chuông thông báo | R1..R5 |
| F-15 | Ban hành, phiên bản | Ban hành khởi tạo; duyệt cuối sinh phiên bản mới `major.minor` có ảnh chụp tên và tín chỉ; kích hoạt đầu học kỳ hiệu lực (tác vụ nền); phiên bản đính chính | R1 |

## 5. Luồng điển hình

1. **Dựng CTĐT lần đầu:** R1 tạo CTĐT, phân công Giám đốc → dựng khung từ danh mục học phần → giảng viên soạn đề cương, CLO → Giám đốc khai báo PLO và ma trận → kiểm tra nhất quán sạch → R1 **ban hành khởi tạo**.
2. **Sửa sau ban hành:** giảng viên tạo đề xuất → sửa trên bản làm việc → gửi → ba cấp duyệt (có thể trả lại để sửa) → R1 duyệt cuối, chọn học kỳ hiệu lực → tới học kỳ đó phiên bản mới có hiệu lực, bản cũ thành Lịch sử.
3. **Một học phần dùng ở nhiều CTĐT:** đề cương và CLO là của học phần, dùng chung; PLO và ma trận là của từng CTĐT. Đổi học phần thì mọi CTĐT chứa nó đều sinh phiên bản mới.

## 6. Chưa có trong MVP

Nhập/xuất Excel (F-09), công thức điểm và đánh giá–CLO (F-12), so sánh phiên bản và gán khóa (F-16), sao lưu (F-26), nhật ký kiểm toán, email và nhắc hạn (F-25); bậc B5 (sinh viên, điều kiện đăng ký, xét tốt nghiệp, API cho dDUT) và B6 (đồng bộ CSDL Trường, báo cáo kiểm định, xuất PDF, triển khai).

## 7. Công nghệ (một dòng)

NestJS + Prisma + PostgreSQL + BullMQ/Redis ở máy chủ; React + Vite + Ant Design ở giao diện; một ứng dụng duy nhất chia module. Cài đặt và kiểm thử: `docs/testing/setup-and-test-guide.md`.
