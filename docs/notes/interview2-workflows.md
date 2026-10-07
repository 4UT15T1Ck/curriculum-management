# 🔄 Minh Hoạ Quy Trình Nghiệp Vụ
## Workflows rút ra từ buổi khảo sát lần 2

> **Mục đích:** Trình giảng viên xem, xác nhận các quy trình này có đúng với thực tế không
> **Ngày lập:** 03/09/2026

---

## 📌 Bức tranh tổng quan — Ai quản lý cái gì?

```mermaid
graph TD
    PDT["🏫 Phòng Đào tạo<br/>(Cấp Trường — Quyền cao nhất)"]

    BLD["👥 Ban Lãnh đạo Khoa<br/>(Trưởng khoa, Phó khoa)"]
    GDCT["🎓 Giám đốc CTĐT<br/>(phụ trách 1..n chương trình)"]
    TNM["📚 Trưởng nhóm Chuyên môn<br/>(04 nhóm)"]
    GV["🧑‍🏫 Giảng viên<br/>(1 GV thuộc nhiều nhóm)"]

    PDT -->|"Ra công văn / yêu cầu"| BLD
    PDT -->|"Phê duyệt & ban hành"| GDCT
    BLD -->|"Giám sát"| GDCT
    GDCT -->|"Quản lý khung CTĐT"| TNM
    TNM -->|"Quản lý chuyên môn HP"| GV

    style PDT fill:#fff3e0,stroke:#e65100,color:#000
    style BLD fill:#e3f2fd,stroke:#1565c0,color:#000
    style GDCT fill:#e8f5e9,stroke:#2e7d32,color:#000
    style TNM fill:#f3e5f5,stroke:#6a1b9a,color:#000
    style GV fill:#fce4ec,stroke:#880e4f,color:#000
```

**Phạm vi quản lý theo tầng:**

| Tầng | Vai trò | Quản lý |
|---|---|---|
| Cấp Trường | Phòng Đào tạo | Toàn bộ khung CTĐT của tất cả khoa |
| Cấp Khoa | Ban LĐ Khoa + Giám đốc CTĐT | Khung CTĐT của Khoa CNTT |
| Cấp Giảng viên | Giảng viên | Học phần do mình soạn đề cương |

---

## 🔄 WORKFLOW 1 — Điều chỉnh Đề cương Học phần (Thường niên)

> Khoa có quyền cập nhật đề cương sau mỗi năm học, không cần chờ rà soát 5 năm

```mermaid
flowchart TD
    A(["GV muốn sửa đề cương"])
    A --> B["Soạn tờ trình + biên bản"]
    B --> C["Khoa nhận tờ trình"]
    C --> D["Trưởng nhóm CM duyệt chuyên môn"]

    D -->|"Đồng ý"| E["GĐ CTĐT duyệt chương trình"]
    D -->|"Từ chối"| Z1(["❌ Kết thúc"])

    E -->|"Đồng ý"| F["Phòng Đào tạo duyệt cuối"]
    E -->|"Trả lại"| B

    F -->|"Đồng ý"| G["Cập nhật đề cương trên HT"]
    F -->|"Trả lại"| B

    G --> H["Sinh phiên bản CTĐT mới"]
    H --> I(["✅ Có hiệu lực từ kỳ tiếp theo"])

    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style I fill:#e8f5e9,stroke:#2e7d32,color:#000
    style Z1 fill:#ffebee,stroke:#c62828,color:#000
```

**❓ Điểm cần xác nhận về Workflow 1:**
- [ ] Giảng viên có phải làm **tờ trình vật lý (giấy)** không, hay hệ thống số hoá hoàn toàn bước này?
- [ ] Bước "Trưởng nhóm CM duyệt" có bắt buộc không, hay thay đổi nhỏ được bỏ qua bước đó?
- [ ] Phiên bản mới sinh ngay khi **Phòng ĐT duyệt**, hay phải chờ đến **đầu kỳ học mới**?

---

## 🔄 WORKFLOW 2 — Rà soát & Điều chỉnh CTĐT 5 năm (Theo yêu cầu Trường)

> Trường ra công văn/quyết định, Khoa phải thực hiện điều chỉnh toàn bộ CTĐT

```mermaid
flowchart TD
    A(["🏫 Trường ban hành Công văn"])
    A --> B["Phòng ĐT nhận & chuyển cho Khoa"]
    B --> C["Khoa tổ chức Họp HĐ khoa học"]
    C --> D["Lập Biên bản họp hội đồng"]
    D --> E["Khoa soạn phương án điều chỉnh"]
    E --> F["Lập Biên bản thẩm định"]
    F --> G["Trình Phòng ĐT duyệt phương án"]

    G -->|"Đồng ý"| H["Cập nhật Khung CTĐT trên HT"]
    G -->|"Trả lại"| E

    H --> I["Phòng ĐT ban hành phiên bản mới"]
    I --> J(["✅ Hiệu lực cho khóa mới"])

    style A fill:#fff3e0,stroke:#e65100,color:#000
    style J fill:#e8f5e9,stroke:#2e7d32,color:#000
```

**❓ Điểm cần xác nhận về Workflow 2:**
- [ ] Hội đồng khoa học và hội đồng thẩm định gồm những **thành phần cụ thể** nào?
- [ ] Biên bản họp hội đồng và biên bản thẩm định có cần **đính kèm vào hệ thống** không?
- [ ] Có cần **số hoá bước họp hội đồng** trong hệ thống, hay chỉ lưu kết quả cuối?
- [ ] Ai trong hệ thống sẽ đóng vai trò **tạo đề xuất thay đổi** khi có công văn Trường?

---

## 🔄 WORKFLOW 3 — Chuyển Học phần sang kỳ khác

> Ví dụ: Chuyển "Mạng máy tính" từ kỳ 5 → kỳ 6

```mermaid
flowchart TD
    A(["Cần chuyển HP sang kỳ khác"])
    A --> B["Soạn tờ trình nêu lý do"]
    B --> C["Trưởng nhóm CM duyệt"]

    C -->|"Đồng ý"| D["GĐ CTĐT duyệt"]
    C -->|"Từ chối"| Z(["❌ Không thay đổi"])

    D -->|"Đồng ý"| E["Phòng Đào tạo duyệt cuối"]
    D -->|"Trả lại"| B

    E -->|"Đồng ý"| F["Cập nhật Khung CTĐT"]
    E -->|"Trả lại"| B

    F --> G["Phiên bản CTĐT mới được ban hành"]
    G --> H(["✅ HP ở kỳ mới từ kỳ tiếp theo"])

    style A fill:#f3e5f5,stroke:#6a1b9a,color:#000
    style H fill:#e8f5e9,stroke:#2e7d32,color:#000
    style Z fill:#ffebee,stroke:#c62828,color:#000
```

**❓ Điểm cần xác nhận về Workflow 3:**
- [ ] Chuyển kỳ có **ảnh hưởng đến sinh viên đang học** phiên bản cũ không?
- [ ] Phải chờ đến **đầu khóa mới** hay áp dụng ngay từ kỳ học kế tiếp?
- [ ] Việc chuyển kỳ có cần **kiểm tra lại ràng buộc tiên quyết** với các HP khác không?

---

## 📊 Luồng Phê duyệt chung cho MỌI loại thay đổi — Swimlane

> Đây là luồng **dùng chung** cho tất cả đề xuất: sửa đề cương, sửa khung CTĐT, sửa công thức điểm, sửa PLO/CLO...
> Rút ra từ REQUIREMENTS.md — nhờ giảng viên xác nhận có đúng không

```mermaid
flowchart LR
    subgraph NGUOI_TAO["👤 Người tạo đề xuất"]
        A["Soạn đề xuất"] --> B["NHÁP"]
    end

    subgraph CAP_1["📚 Cấp 1 — Trưởng nhóm CM"]
        C{"Duyệt?"}
    end

    subgraph CAP_2["🎓 Cấp 2 — Giám đốc CTĐT"]
        D{"Duyệt?"}
    end

    subgraph CAP_3["🏫 Cấp 3 — Phòng Đào tạo"]
        E{"Duyệt?"}
    end

    subgraph KET_QUA["✅ Kết quả"]
        F["ĐÃ DUYỆT"] -->|"Đến đầu kỳ"| G["HIỆU LỰC"]
    end

    B -->|"Gửi duyệt"| C
    C -->|"Đồng ý"| D
    C -->|"Trả lại"| B
    D -->|"Đồng ý"| E
    D -->|"Trả lại"| B
    E -->|"Đồng ý"| F
    E -->|"Trả lại"| B

    style B fill:#fff9c4,stroke:#f9a825,color:#000
    style F fill:#c8e6c9,stroke:#2e7d32,color:#000
    style G fill:#e8f5e9,stroke:#2e7d32,color:#000
```

> **Quy tắc đặc biệt:**
> - Cấp 1 **tự động bỏ qua** nếu người tạo = Trưởng nhóm CM
> - Cấp 2 **tự động bỏ qua** nếu người tạo = Giám đốc CTĐT
> - **Từ chối** ở bất kỳ cấp nào → đề xuất bị đóng, không thực thi
> - **Thu hồi** — người tạo tự rút lại khi chưa có cấp nào duyệt

**❓ Câu hỏi tổng hợp về luồng phê duyệt:**
- [ ] Luồng 3 cấp này có **đúng với thực tế** của Trường/Khoa không?
- [ ] Có trường hợp **bỏ qua cấp** (thay đổi nhỏ chỉ cần 2 cấp) không?
- [ ] Khi bị Trả lại từ bất kỳ cấp nào, có phải đi lại **từ cấp 1** không, hay gửi lại cấp vừa trả?

---

## 🏗️ Tổng hợp — So sánh các loại thay đổi

| Loại thay đổi | Tần suất | Hồ sơ cần có | Cấp duyệt | Trạng thái |
|---|---|---|---|---|
| Sửa đề cương HP | Hàng năm | Tờ trình + biên bản (?) | CM → GĐ CTĐT → Phòng ĐT | ❓ Cần xác nhận |
| Chuyển HP sang kỳ khác | Khi cần | Tờ trình + biên bản (?) | CM → GĐ CTĐT → Phòng ĐT | ❓ Cần xác nhận |
| Sửa công thức điểm | Khi cần | Tờ trình (?) | CM → GĐ CTĐT → Phòng ĐT | ❓ Chưa đề cập |
| Sửa PLO / CLO | Khi cần | Tờ trình (?) | CM → GĐ CTĐT → Phòng ĐT | ❓ Chưa đề cập |
| Rà soát toàn bộ CTĐT | 5 năm/lần | BB họp HĐ + BB thẩm định + CV Trường | Phòng ĐT (cuối) | ❓ Cần xác nhận thêm |

---

## 🎯 Tóm tắt — Những điểm cần confirm gấp

| Mức ưu tiên | Vấn đề | Lý do quan trọng |
|---|---|---|
| 🔴 Cao | Tờ trình/biên bản: giấy tờ hay số hoá trong hệ thống? | Quyết định phạm vi thiết kế luồng phê duyệt |
| 🔴 Cao | Luồng từ Trường xuống — ai tạo đề xuất trong hệ thống? | Ảnh hưởng đến phân quyền tạo CR |
| 🔴 Cao | Biên bản họp HĐ có cần lưu vào hệ thống không? | Ảnh hưởng đến dữ liệu đính kèm CR |
| 🟡 Trung bình | CLO có khác nhau giữa các CTĐT không? | Ảnh hưởng đến mô hình dữ liệu |
| 🟡 Trung bình | Đề xuất bị trả lại có đi lại từ cấp 1 không? | Ảnh hưởng đến logic chuyển trạng thái |
| 🟢 Thấp | Ý nghĩa chính xác của HT ĐA và TQ ĐA | Ảnh hưởng đến bộ quy tắc |
| 🟢 Thấp | Chu kỳ 5 năm được quy định ở đâu? | Tham khảo thiết kế, không chặn tiến độ |
