# 📋 Các Điểm Cần Xác Nhận Với Giảng Viên
## Sau buổi khảo sát lần 2 — Cần verify lại với thầy Bình

> **Nguồn:** Ghi chú khảo sát lần 2 đối chiếu với REQUIREMENTS.md
> **Ngày lập:** 03/09/2026

---

## 🔴 NHÓM 1 — Mâu thuẫn / Khác biệt so với REQUIREMENTS.md (Ưu tiên cao nhất)

### 1.1. Quy trình điều chỉnh đề cương vs. điều chỉnh khung CTĐT — Có phải cùng một luồng không?

**Ghi chú khảo sát lần 2 nói:**
- Khoa điều chỉnh đề cương học phần → phải làm **tờ trình + biên bản**
- Điều chỉnh thời gian/kỳ của học phần (chuyển từ kỳ 1 sang kỳ 2) → cũng phải làm **tờ trình + biên bản**
- Điều chỉnh khung CTĐT 5 năm 1 lần → phải có **biên bản họp hội đồng + biên bản thẩm định**

**REQUIREMENTS.md hiện tại nói:**
- Tất cả thay đổi đi chung một luồng phê duyệt 3 cấp: Trưởng nhóm CM → Giám đốc CTĐT → Phòng Đào tạo (FR-57, DEC-04)
- Không phân biệt loại thay đổi nào cần biên bản, loại nào không

**Câu hỏi cần xác nhận:**
1. Hệ thống có cần số hoá **tờ trình** và **biên bản** không, hay chỉ cần ghi nhận số quyết định như hiện tại?
2. Loại thay đổi nào cần **biên bản họp hội đồng thẩm định** — chỉ khi rà soát 5 năm hay cả khi chỉnh đề cương hàng năm?
3. Hệ thống có cần đính kèm file biên bản/tờ trình vào đề xuất không?

---

### 1.2. Ai có quyền khởi tạo đề xuất thay đổi — Khoa hay chỉ giảng viên?

**Ghi chú khảo sát lần 2 nói:**
- Có **2 nguồn** yêu cầu thay đổi: từ **Trường** và từ **Khoa**
- Khoa (sau 1 năm) có quyền cập nhật đề cương
- Trường yêu cầu Khoa thay đổi CTĐT (ví dụ: 5 năm rà soát 1 lần)

**REQUIREMENTS.md hiện tại nói:**
- Người tạo đề xuất: Phòng ĐT, Ban LĐ khoa, Giám đốc CTĐT, Trưởng nhóm CM, Giảng viên (FR-55, ma trận mục 3.4)
- Chưa mô hình hoá rõ trường hợp Trường ra công văn → Khoa phải thực hiện

**Câu hỏi cần xác nhận:**
1. Khi Trường ra công văn yêu cầu thay đổi CTĐT, ai trong hệ thống sẽ là người tạo đề xuất? (Phòng Đào tạo? Giám đốc CTĐT?)
2. Công văn của Trường có cần được lưu vào hệ thống làm căn cứ đề xuất không?
3. Khi Khoa tự chủ điều chỉnh sau 1 năm — quy trình trong hệ thống khác gì so với khi Trường yêu cầu?

---

### 1.3. Phân tầng quyền quản lý — Trường vs Khoa vs Giảng viên

**Ghi chú khảo sát lần 2 nói:**
- **Trường** quản lý toàn bộ khung CTĐT
- **Khoa** quản lý khung CT của mình
- **Giảng viên** quản lý học phần do mình soạn đề cương

**REQUIREMENTS.md hiện tại nói (mục 3.3):**
- Phòng Đào tạo = cấp Trường, quyền cao nhất → đúng
- Giám đốc CTĐT quản lý CTĐT được phân công → đúng
- Giảng viên chỉ được đề xuất, không tự sửa → đúng

**Câu hỏi cần xác nhận:**
1. "Khoa quản lý khung CT của mình" nghĩa là **Ban lãnh đạo khoa** hay **Giám đốc CTĐT** là người chịu trách nhiệm chính?
2. "Giảng viên quản lý học phần do mình soạn đề cương" — giảng viên có quyền chỉnh trực tiếp không, hay phải qua đề xuất? (REQUIREMENTS.md hiện tại yêu cầu qua đề xuất — FR-55)

---

### 1.4. Luồng phê duyệt — Có cần thêm bước "trình" trước khi vào hệ thống không?

**Ghi chú khảo sát lần 2 nói:**
- Khoa phải **làm tờ trình** và **biên bản** TRƯỚC khi điều chỉnh
- Sau khi có tờ trình được duyệt **mới được điều chỉnh** trên hệ thống

**REQUIREMENTS.md hiện tại:**
- Luồng phê duyệt hoàn toàn trong hệ thống (FR-57)
- Không đề cập đến tờ trình giấy trước khi vào hệ thống

**Câu hỏi cần xác nhận:**
1. Tờ trình/biên bản là **thủ tục ngoài hệ thống** (giấy tờ vật lý) hay hệ thống cần **số hoá luôn**?
2. Nếu phải có tờ trình trước — thì luồng duyệt trong hệ thống có thể bỏ bớt cấp không (vì đã duyệt ngoài rồi)?
3. Hay mô hình đúng là: hệ thống **thay thế** tờ trình giấy, số hoá toàn bộ quy trình?

---

## 🟡 NHÓM 2 — Thông tin còn thiếu, cần bổ sung

### 2.1. Quy trình cụ thể của Trường (tài liệu quy định)

**Ghi chú nói:** "Cần cái quy trình của Trường, cái tài liệu, cần verify lại với thầy Bình"

**Câu hỏi:**
1. Trường/Khoa có văn bản quy định chính thức về quy trình điều chỉnh CTĐT không?
2. Có thể cung cấp tài liệu quy trình đó để nhóm tham khảo thiết kế hệ thống không?
3. Chu kỳ rà soát 5 năm được quy định ở đâu — văn bản cấp Trường hay Bộ GD&ĐT?

---

### 2.2. Biên bản họp hội đồng và biên bản thẩm định

**Ghi chú nói:** "Biên bản họp hội đồng, biên bản thẩm định" khi rà soát 5 năm

**Câu hỏi:**
1. Hội đồng thẩm định gồm những ai? (Có phải tất cả đều là người dùng trong hệ thống?)
2. Hệ thống có cần lưu biên bản này không, hay chỉ lưu số quyết định kết quả cuối cùng?
3. Quy trình thẩm định 5 năm có gì khác về người duyệt so với điều chỉnh thông thường hàng năm?

---

### 2.3. Thủ tục chi tiết cần được làm rõ thêm

**Ghi chú nói:** "Thủ tục phải hỏi rõ hơn"

**Câu hỏi:**
1. Để chuyển một học phần từ kỳ 1 sang kỳ 2 cụ thể, thủ tục là:
   - Ai tạo đề xuất?
   - Ai duyệt cấp 1, cấp 2, cấp 3?
   - Tài liệu đi kèm là gì (tờ trình, biên bản...)?
   - Thời gian xử lý thông thường là bao lâu?
2. Để sửa đề cương học phần (ví dụ: cập nhật tài liệu tham khảo), thủ tục có nhẹ hơn không, hay vẫn đầy đủ như trên?

---

## 🟢 NHÓM 3 — Xác nhận lại giả định trong REQUIREMENTS.md

### 3.1. Vấn đề còn treo Q-04 — Ý nghĩa của `HT ĐA` và `TQ ĐA`

Trong bảng Excel hiện hành có 2 cột `HT ĐA` và `TQ ĐA`. REQUIREMENTS.md hiện lưu nguyên trạng, chưa gắn logic nghiệp vụ.

**Câu hỏi:** Hai cột này có nghĩa là gì chính xác? Có liên quan đến điều kiện đăng ký đồ án không?

---

### 3.2. Vấn đề còn treo Q-07 — Đề xuất bị trả lại có đi lại từ cấp 1?

REQUIREMENTS.md tạm thời quy định: bị trả lại → về NHÁP → gửi lại từ cấp 1.

**Câu hỏi:** Trong thực tế, nếu Phòng Đào tạo trả lại, có cần Trưởng nhóm CM và Giám đốc CTĐT duyệt lại không, hay chỉ người tạo sửa rồi gửi thẳng lên Phòng ĐT?

---

### 3.3. Vấn đề còn treo Q-01 — CLO có khác nhau giữa các CTĐT không?

Một học phần có thể thuộc nhiều CTĐT khác nhau. Hiện tại thiết kế: CLO dùng chung, chỉ ma trận CLO-PLO khác nhau.

**Câu hỏi:** Trên thực tế, khi một học phần nằm trong 2 CTĐT, bộ CLO (chuẩn đầu ra học phần) có giống nhau không?

---

### 3.4. Chu kỳ và tần suất điều chỉnh

**Ghi chú nói:** Khoa sau 1 năm có quyền cập nhật đề cương; 5 năm rà soát CTĐT 1 lần.

**Câu hỏi:**
1. Hàng năm, đề cương được cập nhật tự do (không cần chờ 5 năm) — đúng không?
2. "Rà soát 5 năm" = thay đổi cấu trúc khung CTĐT, còn cập nhật đề cương = thay đổi nhỏ — cách hiểu này có đúng không?
3. Có hạn chót nào trong năm để nộp đề cương điều chỉnh (ví dụ: trước kỳ học mới) không?

---

## 📝 Ghi chú cho buổi phỏng vấn tiếp theo

- Xin **văn bản/quy định quy trình** chính thức của Trường về điều chỉnh CTĐT
- Nhờ giảng viên **xem workflows** trong file `interview2-workflows.md` để xác nhận đúng/sai
- Ưu tiên xác nhận **Nhóm 1** trước vì ảnh hưởng đến thiết kế hệ thống
