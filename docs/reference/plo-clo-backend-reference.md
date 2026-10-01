# Tài liệu tham chiếu: Hệ thống Quản lý kết quả học tập theo chuẩn đầu ra (PLO/CLO)

> **Mục đích của tài liệu này.** Đây là bản mô tả **tự chứa** về một hệ thống backend đã tồn tại và đang chạy thật tại Trường ĐH Bách khoa — ĐH Đà Nẵng, phục vụ việc quản lý điểm, đánh giá theo chuẩn đầu ra học phần (CLO) và chuẩn đầu ra chương trình (PLO), và xét hoàn thành chương trình đào tạo. Tài liệu được viết để người đọc **không cần mở mã nguồn** vẫn nắm được: hệ thống làm gì, mô hình dữ liệu đến từng cột, các công thức tính điểm chính xác, luồng nghiệp vụ và phân quyền, cùng toàn bộ khiếm khuyết đã biết. Không có đường dẫn nào trỏ vào repo.
>
> **Vì sao đây là hệ thống quan trọng nhất trong ba hệ thống được khảo sát.** Nó **đã hiện thực hóa** chính các khái niệm trung tâm của bài toán quản lý chương trình đào tạo: chương trình đào tạo, khung chương trình, học phần cốt lõi, PLO, CLO, ma trận học phần–PLO, và xét hoàn thành chương trình. Mọi quyết định thiết kế ở đây là một tiền lệ cần đối chiếu, không phải một gợi ý tùy chọn.
>
> **Thời điểm khảo sát:** 01/10/2026. Các giá trị bí mật đều ghi `[redacted]`.

---

## 1. Tóm tắt điều hành

| Hạng mục | Nội dung |
|---|---|
| Bài toán giải quyết | Quản lý toàn bộ vòng đời điểm: tạo cấu trúc đánh giá cho lớp → nhập điểm theo câu hỏi → xác nhận → tính CLO → tính PLO → xét hoàn thành chương trình đào tạo, kèm quy trình đính chính và phúc khảo |
| Kiến trúc | Monolith API theo lớp (controller mỏng – service – DbContext), 29 controller, 40 service |
| Điểm khác biệt lớn nhất so với một hệ thống điểm thông thường | Điểm được nhập **ở mức từng câu hỏi**, không phải mức bài thi. CLO gắn vào câu hỏi, PLO gắn vào học phần, nên mọi chỉ số chuẩn đầu ra được **tính dẫn xuất từ dữ liệu điểm thô** chứ không nhập tay |
| Hỗ trợ hai hệ CSDL | Chạy được trên cả PostgreSQL và SQL Server, chọn bằng cấu hình; có công cụ di trú và kiểm chứng giữa hai bên |
| Mức độ hoàn thiện | Cao nhất trong ba hệ thống: **có bộ test thật** (242 test đơn vị, 26 test theo bảng dữ liệu, dùng container CSDL thật) và **có một bản kiểm toán bảo mật nội bộ** |
| Khiếm khuyết nổi bật | Lỗ hổng tham chiếu đối tượng trực tiếp trên các API đọc dữ liệu, và bí mật bị đóng gói vào ảnh container |

**Bốn điều đáng học nhất:**

1. **Chuỗi dẫn xuất chỉ số chất lượng đào tạo từ điểm câu hỏi** — mô hình `Câu hỏi → CLO → PLO → hoàn thành chương trình`, mỗi bậc là một công thức xác định, không có số liệu nhập tay ở giữa.
2. **Mọi thay đổi điểm sau khi đã xác nhận đều đi qua MỘT hàm duy nhất.** Đính chính và phúc khảo không tự ghi điểm; cả hai gọi chung một điểm phát tán. Đây là cách duy nhất giữ cho điểm thành phần, bảng điểm lớp và điểm học phần phụ thuộc không lệch nhau.
3. **Chỉ số duy nhất trên bảng chữ ký là chốt chặn cuối chống ký đôi** — một ràng buộc CSDL thay cho một chuỗi kiểm tra ở tầng ứng dụng.
4. **Kết quả tính PLO được lưu thành bản ghi có phiên bản**, không tính lại mỗi lần đọc: vô hiệu bản cũ rồi chèn bản mới, đọc chỉ lấy bản đang hiệu lực.

---

## 2. Nền tảng công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Runtime | .NET 8, ASP.NET Core Web API dạng controller |
| ORM | Entity Framework Core 8 |
| CSDL chính | **PostgreSQL hoặc SQL Server**, chọn bằng một khóa cấu hình. Mặc định là SQL Server |
| CSDL nguồn ngoài | SQL Server của hệ thống học vụ toàn trường, truy cập **chỉ đọc**, không theo dõi thay đổi |
| Băm mật khẩu | **Argon2id** |
| Xuất tài liệu | QuestPDF (PDF), DocX (Word), EPPlus (Excel), SkiaSharp (đồ họa) |
| Xác thực ngoài | Azure AD / Microsoft Identity |
| Kiểm thử | xUnit, Moq, FluentAssertions, **Testcontainers** (dựng CSDL thật trong container để test) |

### 2.1 Mô hình hai hệ CSDL — một lựa chọn kiến trúc hiếm, đáng phân tích

Hệ thống duy trì **hai tập migration song song**, một cho SQL Server (55 migration, tích lũy từ đầu) và một cho PostgreSQL (một migration nền cộng 6 migration tiếp theo). Bộ nhớ đệm mô hình EF được khóa theo nhà cung cấp CSDL, vì sơ đồ hai bên khác nhau ở các chi tiết sau:

| Khác biệt | SQL Server | PostgreSQL |
|---|---|---|
| Điều kiện lọc của chỉ số | Cú pháp dấu ngoặc vuông, so sánh boolean bằng `= 1` | Cú pháp dấu ngoặc kép, so sánh boolean trực tiếp |
| Kiểu thời gian | Thời gian không múi giờ | **Thời gian có múi giờ** (`timestamptz`), qua một bộ chuyển đổi |
| Cột kèm theo trong chỉ số | Gọi qua lớp tiện ích riêng của mỗi nhà cung cấp | Như trên |
| Quy tắc so sánh chuỗi | Mặc định của hệ | **Bắt buộc dùng quy tắc so sánh tiếng Việt (ICU vi-VN)** |

> **Chi tiết quan trọng nhất của toàn mục này:** trên PostgreSQL, CSDL **phải** được tạo với quy tắc so sánh tiếng Việt, và ứng dụng **kiểm tra điều này khi khởi động, ném lỗi và dừng hẳn nếu sai**. Lý do: việc hạ chữ hoa/thường và so sánh thứ tự chữ cái tiếng Việt có dấu phụ thuộc hoàn toàn vào quy tắc so sánh. Nếu CSDL dùng quy tắc mặc định, tính năng tìm kiếm tên sinh viên và tên học phần không phân biệt hoa thường sẽ **sai một cách im lặng** — không lỗi, chỉ là thiếu kết quả.
>
> **Đây là mẫu thiết kế đáng sao chép:** một giả định môi trường mà nếu sai thì gây lỗi dữ liệu âm thầm, phải được **kiểm tra ở lúc khởi động và làm sập ứng dụng**, không được để nó im lặng.
>
> Vì cùng lý do, ảnh container PostgreSQL phải là bản dựng trên Debian chứ không phải bản Alpine, vì bản Alpine thiếu thư viện quốc tế hóa cần cho tiếng Việt.

### 2.2 Phân rã project

| Project | Vai trò |
|---|---|
| API chính | Controller, service, DTO, bộ chuyển đổi, template tài liệu, xác thực |
| Lớp miền | Thực thể, ngữ cảnh CSDL, enum, giao diện lấy thông tin người dùng hiện hành |
| Migration cho SQL Server | 55 migration, có nhà máy thiết kế đọc chuỗi kết nối từ biến môi trường |
| Migration cho PostgreSQL | 1 migration nền + 6 migration, biến môi trường riêng |
| Công cụ di trú dữ liệu | Ứng dụng dòng lệnh sao chép SQL Server sang PostgreSQL, **có lệnh `verify` đối chiếu kết quả** |
| Project test | xUnit |

> Việc công cụ di trú **tự tắt cơ chế ghi vết kiểm toán** khi chạy là đúng: nếu không, mỗi dòng sao chép sẽ sinh một bản ghi nhật ký, làm phình CSDL đích và làm nhật ký kiểm toán mất ý nghĩa (ghi lại một lần nhập liệu máy móc, không phải hành vi người dùng).

---

## 3. Mô hình dữ liệu — chi tiết đến từng cột

**Quy ước toàn cục:** mọi khóa ngoại mặc định hành vi **chặn xóa** (`Restrict`); các ngoại lệ được ghi rõ ở từng bảng. Đây là lựa chọn đúng cho dữ liệu học vụ: **không dòng nào bị xóa lan truyền ngoài ý muốn**, và việc xóa một học phần đang được tham chiếu sẽ thất bại chứ không âm thầm kéo theo điểm của sinh viên.

### 3.1 Các kiểu liệt kê

| Enum | Giá trị |
|---|---|
| Loại kỳ đánh giá | Đánh giá quá trình = 1, Giữa kỳ = 2, Cuối kỳ = 3 |
| Trạng thái đơn phúc khảo | Chờ xử lý = 1, Đã phân công = 2, Đã chấm = 3, Đã áp dụng = 4, Bị từ chối = 5 |
| Trạng thái sinh viên | Buộc thôi học = 0, Đang học = 1, Đã tốt nghiệp = 2 (mặc định Đang học) |

### 3.2 Nhóm bảng tài khoản và phân quyền

**Bảng Tài khoản**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | int | Khóa chính |
| `Username` | varchar(100) | |
| `Password` | varchar(300) | Lưu dạng `base64(muối):base64(giá trị băm)` theo Argon2id |
| `Name` | varchar(300) | |
| `IsActive` | bool, mặc định true | **Xóa tài khoản là xóa mềm bằng cột này** |
| `RoleId` | int | Khóa ngoại tới Vai trò, chặn xóa |
| `FacultyId` | int, nullable | Khóa ngoại tới Khoa, **đặt null khi khoa bị xóa**. Chỉ dùng cho vai trò Người phụ trách Khoa |
| `MicrosoftEmail` | varchar(320), nullable | Dùng cho đăng nhập qua Microsoft |

**Bảng Vai trò** — 6 vai trò dữ liệu mồi:

| Mã | Tên hệ thống | Tên hiển thị |
|---|---|---|
| 1 | Admin | Quản trị viên |
| 2 | AcademicAffairs | Phòng Đào tạo |
| 3 | ProgrammeManager | Người phụ trách Chương trình đào tạo |
| 4 | Teacher | Giảng viên |
| 5 | Student | Sinh viên |
| 6 | FacultyManager | Người phụ trách Khoa |

> **Mô hình phân quyền ở đây tốt hơn hệ thống đăng ký học phần:** một bảng tài khoản duy nhất với một cột vai trò, thay vì mỗi vai trò một bảng. Nhược điểm còn lại: **một tài khoản chỉ có đúng một vai trò**, nên một giảng viên đồng thời phụ trách chương trình đào tạo không biểu diễn được trực tiếp. Nếu yêu cầu nghiệp vụ cần một người giữ nhiều vai trò, cần một bảng nối tài khoản–vai trò.

**Bảng Phiên làm mới (refresh token)**

| Cột | Ghi chú |
|---|---|
| `AccountId` | Khóa ngoại, xóa lan truyền |
| `SlotIndex` | int — **chỉ số khe phiên**, cho phép một người đăng nhập nhiều tài khoản song song trên cùng trình duyệt |
| `TokenHash` | varchar(100), có chỉ số. **CSDL chỉ lưu giá trị băm SHA-256, không bao giờ lưu token thô** |
| `CreatedAt`, `ExpiresAt` | |
| `RevokedAt` | nullable |
| `ReplacedByTokenHash` | nullable — token nào đã thay thế token này |
| `IsActive` | Cột tính toán |

**Bảng Nhật ký hoạt động người dùng**

| Cột | Ghi chú |
|---|---|
| `UserId`, `UserName`, `UserRole` | Sao chép giá trị tại thời điểm hành động, **không phải khóa ngoại** |
| `Action` | Chuỗi dạng `Tên bảng.Trạng thái` |
| `EntityBefore`, `EntityAfter` | JSON trạng thái trước và sau |
| `Timestamp`, `IpAddress` | |

> **Hai nhận xét về cơ chế ghi vết.** Thứ nhất, việc **sao chép tên và vai trò người dùng vào bản ghi** thay vì chỉ lưu khóa ngoại là đúng: nhật ký phải phản ánh sự thật tại thời điểm xảy ra, và không được thay đổi khi người dùng đổi tên hay đổi vai trò về sau. Thứ hai, cơ chế này được gắn vào lớp lưu dữ liệu, tự động ghi mọi thay đổi với JSON trước/sau — rất mạnh, nhưng **lỗi khi ghi nhật ký bị nuốt và chỉ in ra luồng lỗi chuẩn**. Nghĩa là nhật ký kiểm toán có thể mất bản ghi mà không ai biết. Với một hệ thống điểm, nhật ký là bằng chứng; mất bản ghi phải là lỗi lớn tiếng, không phải một dòng in ra màn hình.

### 3.3 Nhóm bảng cấu trúc đào tạo — phần trung tâm

**Bảng Khoa:** `Id`, `Name` varchar(300), `Code` varchar(100).

**Bảng Ngành:** `Id`, `Code` varchar(100), `OfficialCode` varchar(100), `Name` varchar(300), `FacultyId`. Có **hai mã**: mã nội bộ và mã chính thức (theo quy định của Bộ) — một yêu cầu dữ liệu thật mà hệ thống mới cần tính đến.

**Bảng Chương trình đào tạo**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | int | Khóa chính |
| `Name`, `Code` | | |
| `IsConfirmed` | bool | **Cờ xác nhận chương trình. Đây là cờ quan trọng nhất trong hệ thống** — xem ghi chú dưới |
| `MajorId` | int, nullable | Đặt null khi ngành bị xóa |
| `AccountId` | int, nullable | **Người phụ trách chương trình đào tạo**, đặt null khi tài khoản bị xóa |

> **Về cờ xác nhận.** Một chương trình đào tạo chưa xác nhận thì **không được dùng để xét hoàn thành** (đây là lý do thất bại đầu tiên trong danh sách ở mục 5.4), và **không được dùng để xác định lớp cốt lõi**. Nghĩa là cờ này là ranh giới giữa "đang soạn thảo" và "đang có hiệu lực pháp lý". Một hệ thống quản lý chương trình đào tạo **bắt buộc** phải có khái niệm này; đây là tiền lệ trực tiếp.

**Bảng Học phần**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | int | |
| `Code` | varchar(100) | |
| `Name` | varchar(300) | |
| `IsConfirmed` | bool | Cờ xác nhận riêng cho học phần |
| `IsDoctoral` | bool | Phân biệt hệ đào tạo |
| `Credits` | **decimal(3,1)** | Số tín chỉ |
| `FacultyId` | int, nullable | |
| `DependentCourseId` | int, nullable | **Khóa ngoại tự trỏ**, chặn xóa — xem ghi chú dưới |

> **Hai điểm cần chú ý.**
>
> 1. **Số tín chỉ dùng `decimal(3,1)`, không dùng số thực dấu phẩy động.** Đây là lựa chọn **đúng** và khác với hệ thống đăng ký học phần (dùng số thực). Vì tín chỉ được **cộng dồn và dùng làm trọng số trong công thức tính PLO** (mục 5.3), sai số dấu phẩy động sẽ tích lũy. Hệ thống mới nên theo mẫu này.
> 2. **Quan hệ "học phần phụ thuộc" là một khóa ngoại tự trỏ.** Nó biểu diễn mối quan hệ *học phần lý thuyết – học phần thí nghiệm/thực hành tách rời*: khi điểm cuối kỳ của học phần lý thuyết được xác nhận, điểm sẽ **tự động chuyển sang** kỳ đánh giá thí nghiệm/thực hành của học phần phụ thuộc (mục 5.6). Đây là một quy tắc nghiệp vụ rất đặc thù của trường, và nó tồn tại ở tầng dữ liệu chứ không phải hằng số trong mã — cách làm đúng.

**Bảng Khung chương trình** (bảng nối chương trình đào tạo ↔ học phần)

| Cột | Ghi chú |
|---|---|
| Khóa chính | Tổ hợp (mã chương trình, mã học phần) |
| `IsCore` | bool — **học phần cốt lõi của chương trình** |
| `AcademicSemester` | int — học kỳ dự kiến học |

> Cờ "cốt lõi" quyết định rất nhiều thứ: chỉ học phần cốt lõi mới được gắn PLO, chỉ lớp của học phần cốt lõi mới được tính vào chỉ số chất lượng, và việc xét hoàn thành chương trình hiện **chỉ xét học phần cốt lõi** (mục 5.4).

**Bảng Chuẩn đầu ra chương trình (PLO):** `Id`, `Name` varchar(300), `Description` varchar(2000), `ProgrammeId`.

**Bảng Chuẩn đầu ra học phần (CLO):** `Id`, `Name` varchar(300), `Description` varchar(2000), `CourseId`, `SemesterId`. Quan hệ nhiều-nhiều với PLO và với Câu hỏi qua hai bảng nối.

**Bảng Ma trận Học phần – PLO**

| Cột | Ghi chú |
|---|---|
| Khóa chính | Tổ hợp (mã học phần, mã PLO) |
| `Weight` | **decimal(5,2) — trọng số đóng góp của học phần vào PLO** |

> **PHÁT HIỆN QUAN TRỌNG: cột trọng số này KHÔNG được dùng trong công thức tính điểm PLO.** Hệ thống lưu trọng số, cho phép người dùng nhập và sửa trọng số, nhưng công thức thực tế (mục 5.3) dùng **số tín chỉ của học phần** làm trọng số thay vì cột này. Nghĩa là **mọi giá trị trọng số người dùng nhập vào đều không có tác dụng gì**. Đây là một trong những khoảng cách nghiêm trọng nhất giữa mô hình dữ liệu và hành vi thật của hệ thống; nó dẫn tới việc người dùng tin rằng họ đang điều chỉnh cách tính PLO trong khi không có gì thay đổi. Hệ thống mới phải **hoặc dùng trọng số, hoặc không lưu nó**.

**Bảng Khóa/Niên khóa:** `Id`, `Name`, `Code`, `ProgrammeId` nullable, `TeacherId` nullable (giáo viên chủ nhiệm, đặt null khi xóa).

**Bảng Học phần thay thế:** khóa chính tổ hợp (mã sinh viên, mã học phần thay thế), kèm cột mã học phần gốc. Biểu diễn việc một sinh viên được học học phần B thay cho học phần A trong khung chương trình. *(Bảng này có một cột dư thừa do cấu hình ORM — một khiếm khuyết nhỏ, xem mục 8.)*

### 3.4 Nhóm bảng giảng dạy và kỳ đánh giá

**Bảng Đơn vị công tác:** `Id`, `Name`, `Code`.

**Bảng Giảng viên:** `Id`, `Name`, `Code`, `WorkUnitId` nullable, `AccountId` nullable — **quan hệ một-một có ràng buộc duy nhất với tài khoản**.

**Bảng Sinh viên**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id`, `Name`, `Code` | | |
| `EnrollmentYear` | | Năm nhập học |
| `Status` | enum | Đang học / Buộc thôi học / Đã tốt nghiệp |
| `DecisionNumber` | varchar(100), nullable | **Số quyết định** liên quan tới việc đổi trạng thái |
| `DecisionDate` | DateOnly, nullable | Ngày quyết định |
| `DecisionReason` | varchar(500), nullable | Lý do |
| `IsDoctoral` | bool | |
| `ProgrammeId`, `CohortId` | nullable | |
| `AccountId` | nullable | Một-một với tài khoản |

> **Nhóm ba cột quyết định là một chi tiết nghiệp vụ đáng chú ý.** Việc một sinh viên bị buộc thôi học hay được công nhận tốt nghiệp **luôn gắn với một văn bản hành chính**. Hệ thống lưu số, ngày và lý do của quyết định ngay trên bản ghi sinh viên. Đây là yêu cầu bắt buộc trong môi trường đại học Việt Nam, và là điều mà một mô hình dữ liệu chỉ có cột trạng thái sẽ bỏ sót.
>
> **Tính duy nhất của sinh viên là cặp (mã sinh viên, cờ hệ tiến sĩ)** — tức một mã có thể lặp giữa hai hệ đào tạo. Ràng buộc này **được kiểm tra ở tầng ứng dụng, không phải ở CSDL**; đây là một chỗ dữ liệu trùng có thể lọt qua khi có hai yêu cầu đồng thời.

**Bảng Lớp học phần**

| Cột | Ghi chú |
|---|---|
| `Id`, `Name`, `Code` | |
| `IsCore` | Lớp cốt lõi — xem quy tắc ở mục 5.9 |
| `IsDoctoral` | |
| `CourseId`, `SemesterId` | |
| `ParentExamSessionId` | nullable — lớp có thể thuộc một **ca thi tổng** |
| `TeacherId` | nullable, đặt null khi xóa |
| `Teacher2Id` | nullable, **không hành động khi xóa** — giảng viên thứ hai |
| `IsConfirmed` | **Không lưu trong CSDL**, tính từ trạng thái xác nhận của các kỳ đánh giá |

> **Hai giảng viên trên một lớp là một thực tế nghiệp vụ**, nhưng hệ thống xử lý hai giảng viên **không nhất quán giữa các chức năng**: quyền ký bảng điểm chấp nhận cả hai, còn quyền sửa điểm **chỉ chấp nhận giảng viên thứ nhất** (mục 4.5). Đây là lỗi thật.

**Bảng Sinh viên trong lớp:** khóa chính tổ hợp, **xóa lan truyền cả hai phía** — đây là ngoại lệ duy nhất đáng kể của quy tắc chặn xóa, và hợp lý vì dòng này chỉ là quan hệ, không chứa dữ liệu riêng.

**Bảng Ca thi tổng**

| Cột | Ghi chú |
|---|---|
| `Id`, `Name`, `Code` | |
| `CourseId` | nullable |
| `SemesterId` | |
| `QuestionSetterAccountId` | nullable — **người ra đề** |
| `IsAnonymousMarking`, `IsConfirmed` | **Không lưu trong CSDL**, tính từ các ca con |

Quan hệ: một ca thi tổng có **đúng một** kỳ đánh giá (quan hệ một-một, chặn xóa), **nhiều ca thi con**, và **nhiều lớp học phần** tham gia.

> **Khái niệm ca thi tổng là trung tâm của mô hình thi tập trung.** Nhiều lớp học phần của cùng một học phần thi cùng một đề, trong nhiều phòng (ca con). Điểm được nhập **ở mức ca con**, rồi **nhân bản xuống các lớp thành viên** (mục 5.6). Mô hình này cho phép chấm chéo và chấm ẩn danh — điều không thể làm nếu điểm chỉ gắn với lớp.

**Bảng Ca thi con**

| Cột | Ghi chú |
|---|---|
| `Id`, `Name`, `Code` | |
| `AnonymizedBagNumber` | int, nullable — **số túi bài thi đã ẩn danh** |
| `IsAnonymousMarking` | bool — ca này có chấm ẩn danh hay không |
| `ConfirmedAt` | nullable — thời điểm xác nhận điểm |
| `CorrectedResultsConfirmedAt` | nullable — thời điểm xác nhận các đính chính |
| `ParentExamSessionId` | |
| `ScoreEntryUserAccountId` | nullable — **tài khoản được phân công nhập điểm cho ca này** |

**Bảng Sinh viên trong ca thi con:** khóa chính tổ hợp, kèm cột `AnonymousMarkingCode` varchar(100) — **mã phách ẩn danh của sinh viên trong ca đó**. Đây là cơ chế chấm ẩn danh: người chấm thấy mã phách, không thấy danh tính.

### 3.5 Nhóm bảng điểm

**Bảng Kỳ đánh giá** (một thành phần điểm của một lớp, ví dụ giữa kỳ, cuối kỳ, bài tập)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | int | |
| `Type` | varchar(100) | **Mã loại, ví dụ `CK` (cuối kỳ), `GK` (giữa kỳ), `TN` (thí nghiệm)**. Xem mục 5.8 |
| `Category` | enum | Đánh giá quá trình / Giữa kỳ / Cuối kỳ |
| `Weight` | decimal(5,2) | **Trọng số trong điểm tổng của lớp. Tổng trọng số các kỳ của một lớp phải bằng đúng 1** |
| `ScoreEntryStartDate` | | Thời điểm mở nhập điểm |
| `ScoreEntryDeadline` | | Hạn nhập điểm |
| `ScoreCorrectionDeadline` | | Hạn đính chính điểm |
| `ExtendedScoreEntryDeadline` | nullable | **Hạn nhập điểm gia hạn** |
| `ExtendedScoreCorrectionDeadline` | nullable | Hạn đính chính gia hạn |
| `ConfirmedAt` | nullable | Thời điểm xác nhận điểm |
| `CorrectedResultsConfirmedAt` | nullable | Thời điểm xác nhận các đính chính |
| `ClassId` | nullable | Gắn với một lớp |
| `ParentExamSessionId` | nullable | **Hoặc** gắn với một ca thi tổng |
| `IsQuestionLocked` | bool, mặc định false | Khóa không cho sửa cấu trúc câu hỏi |
| `IsScoreLocked` | bool, mặc định false | Khóa không cho sửa điểm |
| `EffectiveScoreEntryDeadline` | **không lưu** | = hạn gia hạn nếu có, ngược lại hạn gốc |
| `EffectiveScoreCorrectionDeadline` | **không lưu** | Tương tự |

> **Ba điểm thiết kế đáng học ở bảng này.**
>
> 1. **Một kỳ đánh giá gắn với lớp HOẶC gắn với ca thi tổng, không bao giờ cả hai** — ràng buộc này được kiểm tra khi tạo. Nó cho phép cùng một mô hình điểm phục vụ cả thi theo lớp và thi tập trung.
> 2. **Mô hình hạn gốc + hạn gia hạn, với một thuộc tính dẫn xuất "hạn hiệu lực".** Việc *không* ghi đè hạn gốc khi gia hạn giữ lại bằng chứng rằng đã có gia hạn, và ai gia hạn bao nhiêu — thông tin quan trọng cho kiểm toán học vụ. Mọi chỗ kiểm tra thời hạn đều dùng thuộc tính dẫn xuất, nên không có chỗ nào quên áp dụng gia hạn.
> 3. **Hai cờ khóa riêng biệt** cho cấu trúc câu hỏi và cho điểm. Khóa cấu trúc sau khi đề đã ra, khóa điểm sau khi đã công bố — hai sự kiện khác nhau, cần hai cờ.
>
> Có một **chỉ số lọc** trên các kỳ đánh giá chưa xác nhận theo lớp — tối ưu cho truy vấn "lớp nào còn thiếu điểm", là truy vấn chạy thường xuyên nhất trong kỳ thi.

**Bảng Câu hỏi**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Name` | varchar(2000) | Nội dung hoặc nhãn câu hỏi |
| `Weight` | decimal(5,2) | Trọng số trong kỳ đánh giá |
| `Scale` | decimal(5,2) | **Thang điểm của câu hỏi** |
| `ExamId` | | |

Quan hệ nhiều-nhiều với CLO qua một bảng nối (phía câu hỏi xóa lan truyền).

> **Việc tách `Weight` (trọng số) và `Scale` (thang điểm) là chi tiết làm cho toàn bộ mô hình chuẩn đầu ra hoạt động được.** Một câu hỏi có thể được chấm trên thang 20 điểm nhưng chỉ chiếm trọng số 0.1 trong kỳ đánh giá. Điểm thô được chuẩn hóa bằng `Score / Scale` rồi mới nhân trọng số. Nếu chỉ có một con số, không thể vừa chấm theo thang tự nhiên của câu hỏi vừa gộp theo trọng số.

**Bảng Kết quả** (điểm của một sinh viên cho một câu hỏi — **đơn vị dữ liệu nhỏ nhất của toàn hệ thống**)

| Cột | Ghi chú |
|---|---|
| `StudentId`, `QuestionId` | |
| `Score` | decimal(5,2), **nullable** — null nghĩa là chưa có điểm |
| Ràng buộc | **Duy nhất trên cặp (sinh viên, câu hỏi)** |

**Bảng Điểm kỳ đánh giá của sinh viên** (giá trị tổng hợp, dẫn xuất)

| Cột | Ghi chú |
|---|---|
| Khóa chính | Tổ hợp (mã sinh viên, mã kỳ đánh giá), **xóa lan truyền cả hai phía** |
| `Note` | varchar(4000) |
| `Score` | decimal(5,2), nullable — **giá trị tính được từ các câu hỏi** |

**Bảng Đính chính điểm**

| Cột | Ghi chú |
|---|---|
| `StudentId`, `QuestionId` | |
| `OldScore` | decimal(5,2), **không null** |
| `NewScore` | decimal(5,2) |
| `OpenAt` | Thời điểm mở đính chính |
| `ApproveAt` | nullable |
| `ApproveByUserId`, `ApproveByUserName`, `ApproveByUserRole` | **Sao chép danh tính người duyệt tại thời điểm duyệt** |

> **Việc sao chép tên và vai trò người duyệt** (thay vì chỉ lưu khóa ngoại) là chủ ý và đúng — giống cơ chế nhật ký. Một bản ghi đính chính điểm là chứng từ; nó phải nói đúng ai đã duyệt với chức danh gì **vào lúc đó**.
>
> **Khiếm khuyết:** khi câu hỏi chưa có điểm, `OldScore` được đặt bằng **0** thay vì để trống. Điều này làm mất khả năng phân biệt "trước đây 0 điểm" với "trước đây chưa nhập điểm" — hai tình huống rất khác nhau về mặt khiếu nại.

**Bảng Đơn phúc khảo**

| Cột | Ghi chú |
|---|---|
| `StudentId`, `ExamId` | |
| `RequestedAt` | |
| `Reason` | varchar(2000) |
| `ReceiptNumber` | varchar(100), nullable — **số biên lai thu phí** |
| `Fee` | decimal(10,2), nullable — **phí phúc khảo** |
| `Status` | enum, mặc định Chờ xử lý |
| `AssignedMarkerTeacherId` | nullable — **giảng viên được phân công chấm lại** |
| `AssignedAt`, `DecidedAt` | nullable |
| `DecidedByAccountId`, `DecidedByUserName`, `DecidedByUserRole` | Sao chép danh tính người quyết định |
| `DecisionNote` | varchar(2000) |

**Bảng Kết quả chấm phúc khảo:** `ScoreAppealId` (xóa lan truyền), `QuestionId`, `OldScore` nullable, `NewScore`. Ràng buộc **duy nhất trên cặp (đơn, câu hỏi)**.

**Bảng Bảng điểm đã ký**

| Cột | Ghi chú |
|---|---|
| `ClassId` | **CÓ RÀNG BUỘC DUY NHẤT** — xem ghi chú |
| `CaDocumentId` | varchar(100) — mã tài liệu ở hệ thống chứng thực số bên ngoài |
| `CreatedAt`, `CreatedByAccountId` | |
| `ExaminerSignedAt`, `ExaminerAccountId` | Chữ ký giảng viên |
| `FacultyHeadSignedAt`, `FacultyHeadAccountId` | Chữ ký phụ trách khoa |

> **Ràng buộc duy nhất trên mã lớp là chốt chặn cuối chống ký đôi một bảng điểm.** Dù mọi kiểm tra ở tầng ứng dụng thất bại hay bị hai yêu cầu đồng thời vượt qua, CSDL vẫn từ chối dòng thứ hai. **Đây là mẫu đáng sao chép nguyên vẹn:** với một bất biến mà việc vi phạm gây hậu quả pháp lý, hãy đặt nó thành ràng buộc CSDL, không chỉ là một câu lệnh `if`.

### 3.6 Hai bảng cache bền — kết quả tính toán được lưu có phiên bản

**Bảng Điểm PLO của sinh viên:** `StudentId` (xóa lan truyền), `PLOId` (chặn xóa), `Score` decimal(5,2) nullable, `CalculatedAt`, `IsActive`. **Ràng buộc duy nhất có lọc trên (sinh viên, PLO) chỉ xét các dòng đang hiệu lực.**

**Bảng Hoàn thành chương trình của sinh viên:** `StudentId` (xóa lan truyền), `ProgrammeId`, `IsCompleted`, `FailureReasons` (**danh sách chuỗi**), `PloScoreThreshold` decimal(5,2), `CalculatedAt`, `IsActive`. **Ràng buộc duy nhất có lọc trên (sinh viên, ngưỡng điểm) chỉ xét các dòng đang hiệu lực.**

> **Đây là mẫu "cache bền có phiên bản", đáng phân tích kỹ.**
>
> Quy trình tính lại gồm **hai pha trong cùng một lần lưu**: pha 1 đặt `IsActive = false` cho mọi dòng cũ; pha 2 chèn các dòng mới với `IsActive = true` và thời điểm tính. Mọi truy vấn đọc **chỉ lấy dòng đang hiệu lực**.
>
> **Vì sao không xóa dòng cũ:** lịch sử được giữ lại. Có thể trả lời câu hỏi "ngày đó hệ thống tính PLO của sinh viên này là bao nhiêu" — cần thiết khi sinh viên khiếu nại về kết quả xét tốt nghiệp.
>
> **Vì sao ràng buộc duy nhất phải có điều kiện lọc:** nếu không lọc, chỉ có thể tồn tại một dòng cho mỗi cặp, và không lưu được lịch sử. Có lọc, thì tại mọi thời điểm chỉ có đúng một dòng hiệu lực, mà lịch sử vẫn còn.
>
> **Điểm cần lưu ý:** ngưỡng điểm là **một phần của khóa duy nhất**, và được **so sánh bằng phép bằng nhau trên số decimal**. Nghĩa là kết quả xét với ngưỡng 5.0 và với ngưỡng 5.00 là hai dòng khác nhau nếu phép so sánh decimal coi chúng khác nhau. Đây là một chỗ nhạy cảm cần chuẩn hóa giá trị ngưỡng trước khi ghi.

**Bảng Cấu hình hệ thống:** `CurrentSemesterId`, `CurrentYear`, `CLOScoreThreshold`, `PLOScoreThreshold`. **Không có khóa ngoại tới bảng Học kỳ** — một dòng dữ liệu mồi duy nhất.

**Bảng Học kỳ:** `Id`, `Name`, `Year`, `IsActive`, và một cột **`Code` không lưu trong CSDL** được tính theo quy tắc:

| Tên học kỳ | Hậu tố mã |
|---|---|
| Học kỳ 1 | `10` |
| Học kỳ 2 | `20` |
| Học kỳ hè | `21` |
| Khác | `00` |

Mã đầy đủ = hai chữ số cuối của năm + hậu tố. Đây là định dạng mã học kỳ dùng chung với hệ thống học vụ toàn trường.

> **Cảnh báo:** cột `Code` được **suy ra từ TÊN học kỳ bằng cách so khớp chuỗi**. Nếu ai đó đặt tên học kỳ là "HK1" hay "Học kỳ I", mã sẽ rơi về `00` — sai, và sai im lặng. Mã học kỳ nên là một cột dữ liệu thật hoặc suy từ một enum, không bao giờ suy từ tên do người dùng nhập.

---

## 4. Xác thực và phân quyền

### 4.1 Bốn cơ chế xác thực song song

| Cơ chế | Cách hoạt động |
|---|---|
| **Token nội bộ** (mặc định) | JWT ký HMAC-SHA512, **có kiểm tra issuer và audience** |
| **Khóa API** | Header `X-Api-Key` so với giá trị cấu hình. Thành công thì **được quyền tương đương Quản trị viên** |
| **Token của hệ thống toàn trường** | JWT riêng, **không kiểm tra issuer và audience** |
| **Microsoft / Azure AD** | Xác thực qua nhà cung cấp danh tính của trường |

> **So sánh với hệ thống đăng ký học phần:** ở đây issuer và audience **được kiểm tra thật** cho token chính — tốt hơn. Nhưng vẫn còn ba vấn đề:
> - **Khóa API tĩnh có quyền tương đương Quản trị viên**, và được **so sánh chuỗi thông thường, không phải so sánh thời gian cố định**. So sánh thông thường dừng ngay khi gặp ký tự khác nhau, nên thời gian phản hồi tiết lộ thông tin về khóa — cho phép dò khóa từng ký tự. Mọi phép so sánh giá trị bí mật **phải** dùng so sánh thời gian cố định (chính hệ thống này **đã làm đúng** điều đó cho mật khẩu, xem 4.3 — nên đây là sự không nhất quán, không phải thiếu hiểu biết).
> - **Token của hệ thống toàn trường không kiểm tra issuer/audience**, nên bất kỳ token nào ký bằng cùng khóa đều được chấp nhận.
> - Khi đăng nhập qua Microsoft, **mã định danh tổ chức và mã định danh người dùng được đọc nhưng KHÔNG được kiểm tra** (có ghi chú việc-cần-làm ngay trong mã). Nghĩa là một token Azure AD hợp lệ từ **tổ chức khác** cũng có thể được chấp nhận nếu địa chỉ thư điện tử trùng.

### 4.2 Token truy cập và token làm mới

| Hạng mục | Giá trị |
|---|---|
| Thời hạn token truy cập | **150 phút** — trong mã có ghi chú việc-cần-làm nói phải trả về 15 phút |
| Thời hạn token làm mới | 30 ngày |
| Dạng token làm mới | 32 byte ngẫu nhiên; **CSDL chỉ lưu giá trị băm SHA-256** |
| Số khe phiên tối đa | 5 |

**Thông tin trong token truy cập:** mã định danh token, mã người dùng, họ tên, vai trò, mã giảng viên, mã sinh viên, mã người phụ trách, mã khoa (chỉ với vai trò phụ trách khoa), vai trò hiển thị. Các mã không áp dụng được ghi `"0"`.

**Cơ chế luân chuyển token làm mới — đáng học:**

| Tình huống | Hành vi |
|---|---|
| Dùng token hợp lệ | Cấp token mới; token cũ được đánh dấu đã thu hồi và ghi lại token nào đã thay thế nó |
| **Dùng lại token đã bị thu hồi** | **Thu hồi TOÀN BỘ token đang hiệu lực của cặp (tài khoản, khe phiên)** |
| Token hết hạn, hoặc sai khe phiên | Từ chối |

> **Phản ứng với việc dùng lại token đã thu hồi là điểm sáng.** Nếu một token làm mới đã dùng xuất hiện lần nữa, chỉ có hai khả năng: hoặc client bị lỗi, hoặc token đã bị đánh cắp. Hệ thống xử lý theo khả năng xấu hơn và **thu hồi cả chuỗi**, buộc đăng nhập lại. Đây là cách làm đúng theo chuẩn, và là mẫu nên sao chép.
>
> **Cơ chế khe phiên** cho phép một người đăng nhập nhiều tài khoản song song trên cùng trình duyệt (ví dụ vừa là giảng viên vừa là người phụ trách chương trình), mỗi tài khoản một cookie riêng theo chỉ số khe. Đây là giải pháp thông minh cho hạn chế "một tài khoản một vai trò" nêu ở mục 3.2.

**Khiếm khuyết của tầng token:**
- Thời hạn token được tính bằng **giờ địa phương của máy chủ** thay vì giờ chuẩn quốc tế.
- **Đổi mật khẩu hoặc reset mật khẩu KHÔNG thu hồi các phiên và token làm mới đang hoạt động.** Nghĩa là sau khi phát hiện mật khẩu bị lộ và đổi mật khẩu, kẻ đã đăng nhập **vẫn giữ quyền truy cập tới 30 ngày**. Đây là lỗ hổng cần vá trước tiên trong nhóm này.
- Cờ bảo mật của cookie được đặt theo giao thức của **chính request đó**, nên nếu có một đường truy cập không mã hóa, cookie sẽ được gửi không bảo vệ.
- **Không có giới hạn tần suất đăng nhập, không có khóa tài khoản sau nhiều lần sai.**

### 4.3 Băm mật khẩu — phần làm tốt nhất về bảo mật

| Thông số | Giá trị |
|---|---|
| Thuật toán | **Argon2id** |
| Độ dài muối | 16 byte |
| Mức song song | 8 |
| Bộ nhớ | 65.536 KB (64 MB) |
| Số vòng lặp | 4 |
| Độ dài giá trị băm | 32 byte |
| So khớp | **Vòng lặp thời gian cố định** |

> Argon2id với 64 MB bộ nhớ là lựa chọn **tốt hơn hẳn** BCrypt (mà hệ thống đăng ký học phần dùng): nó kháng cả tấn công bằng GPU và tấn công đánh đổi bộ nhớ–thời gian. Đây là cấu hình nên dùng cho hệ thống mới.

**Nhưng chính sách mật khẩu thì có lỗ hổng nghiêm trọng:** mật khẩu cấp hàng loạt và mật khẩu reset đều **suy ra từ tên đăng nhập** theo công thức cố định (tiền tố theo vai trò ghép với tên đăng nhập; vai trò khác thì dùng một mật khẩu chung cố định), và **không có cờ nào bắt người dùng đổi mật khẩu khi đăng nhập lần đầu**. Biết mã sinh viên là biết mật khẩu. Thuật toán băm mạnh nhất cũng không cứu được một mật khẩu đoán được.

### 4.4 Phân quyền theo vai trò

Mỗi API khai báo danh sách vai trò được phép. Các nhóm quyền thường gặp:

| Nhóm | Vai trò |
|---|---|
| Quản trị dữ liệu nền | Quản trị viên, Phòng Đào tạo |
| Quản lý chương trình đào tạo | Thêm Người phụ trách Chương trình đào tạo |
| Nhập và sửa điểm | Quản trị viên, Phòng Đào tạo, Giảng viên |
| Xem báo cáo chất lượng | Thêm Người phụ trách Khoa |
| Ký bảng điểm | **Chỉ Giảng viên và Người phụ trách Khoa** |
| Xem bảng điểm đã ký | Quản trị viên, Giảng viên, Người phụ trách Khoa |
| Toàn bộ chức năng chuyển dữ liệu từ hệ thống cũ | **Chỉ Quản trị viên** |

### 4.5 Phân quyền cấp đối tượng — điểm mạnh và lỗi bên trong

Ngoài vai trò, hệ thống còn kiểm tra **quyền trên từng đối tượng cụ thể**. Phần này **chỉ áp dụng cho vai trò Giảng viên**; các vai trò khác không bị giới hạn theo đối tượng.

| Kiểm tra | Điều kiện |
|---|---|
| Giảng viên sở hữu lớp | Lớp có mã giảng viên trùng với người gọi |
| Giảng viên sở hữu lớp của một kỳ đánh giá | Qua lớp của kỳ đánh giá đó |
| Giảng viên là người nhập điểm của ca thi con | Tài khoản được phân công nhập điểm trùng với người gọi |
| Giảng viên được sửa điểm | Với kỳ đánh giá gắn ca thi: ca con phải chứa sinh viên đó **và** người gọi phải là người được phân công nhập điểm. Với kỳ đánh giá gắn lớp: phải sở hữu lớp |

**Quyền ký bảng điểm:**

| Vai trò | Điều kiện | Ký với tư cách |
|---|---|---|
| Giảng viên | Là giảng viên **thứ nhất hoặc thứ hai** của lớp | Giảng viên phụ trách |
| Người phụ trách Khoa | Mã khoa của người ký trùng mã khoa của học phần | Trưởng khoa |
| Vai trò khác | — | **Bị từ chối** |

> **LỖI THẬT, CHƯA SỬA: hai chức năng xử lý giảng viên thứ hai khác nhau.** Quyền **ký** bảng điểm chấp nhận cả giảng viên thứ nhất và thứ hai. Quyền **sửa điểm** chỉ chấp nhận giảng viên thứ nhất. Hệ quả thực tế: **giảng viên thứ hai của một lớp có thể ký bảng điểm nhưng không thể nhập hay sửa điểm trên chính lớp đó.**
>
> **Bài học tổng quát:** khi một thực thể có hai vai trò tương đương (ở đây là hai giảng viên), **tư cách "người phụ trách" phải được định nghĩa MỘT lần ở một chỗ** và mọi chức năng gọi vào định nghĩa đó. Để mỗi chức năng tự kiểm tra là bảo đảm chúng sẽ lệch nhau.

### 4.6 Lỗ hổng tham chiếu đối tượng trực tiếp — vấn đề bảo mật lớn nhất

> **Phần này là lỗi. Ghi lại để biết chỗ phải vá và mẫu phải tránh.**

Hệ thống bảo vệ **đường ghi** rất tốt (toàn bộ mục 4.5), nhưng **đường đọc thì chỉ yêu cầu "đã đăng nhập"**. Các nhóm API sau cho phép **bất kỳ người dùng đã đăng nhập nào** đọc dữ liệu của **bất kỳ ai**:

| Nhóm API | Dữ liệu bị lộ |
|---|---|
| Toàn bộ nhóm API kết quả và chỉ số | Điểm, điểm CLO, điểm PLO, trạng thái hoàn thành chương trình của mọi sinh viên |
| Đọc danh sách và chi tiết sinh viên | Hồ sơ mọi sinh viên |
| Đọc chi tiết tài khoản theo mã | Thông tin tài khoản bất kỳ |
| Đọc danh sách và chi tiết đơn phúc khảo | Mọi đơn phúc khảo (riêng vai trò Giảng viên **có** bị giới hạn ở đơn được phân công) |
| Vài API xuất Excel điểm theo lớp | Bảng điểm của lớp bất kỳ, cho mọi giảng viên |

Thêm vào đó, ba nhóm API sau **không giới hạn vai trò nào ngoài việc đăng nhập**, dù chúng ghi dữ liệu hoặc đọc dữ liệu nhạy cảm: **ghi cấu hình hệ thống** (bao gồm ngưỡng điểm CLO và PLO), **ghi điểm kỳ đánh giá của sinh viên**, và **đọc nhật ký hoạt động người dùng**.

> **Điểm đáng chú ý nhất:** sinh viên là một vai trò có tài khoản trong hệ thống này. Nghĩa là **một sinh viên đăng nhập bằng tài khoản của mình có thể đọc điểm và trạng thái tốt nghiệp của toàn bộ sinh viên khác**, và có thể **sửa ngưỡng điểm PLO của toàn hệ thống**.
>
> Hệ thống *có* một nhóm API `my-*` tự giới hạn theo tài khoản người gọi — đúng mẫu. Vấn đề là các API chung vẫn mở, nên nhóm `my-*` không bảo vệ được gì.
>
> **Mẫu lỗi và cách phòng:** phân quyền được gắn **từng endpoint một**, và **không có chính sách dự phòng toàn cục**. Khi không gắn gì, mặc định là "ai đăng nhập cũng được". Cách đúng: đặt **chính sách dự phòng chặn tất cả**, rồi mở từng endpoint có chủ đích. Khi đó bỏ sót gây lỗi "không truy cập được" — lộ ra ngay — thay vì "ai cũng đọc được" — không ai thấy.

### 4.7 Xử lý lỗi

| Loại ngoại lệ | Mã HTTP |
|---|---|
| Không có quyền | 403 |
| Không tìm thấy | 404 |
| Lỗi nghiệp vụ | 400 |
| Còn lại | 500 |

Thân phản hồi là **văn bản thuần**, nội dung là thông điệp lỗi — nên các thông điệp tiếng Việt ở mục 5.4 đi thẳng tới người dùng. Khiếm khuyết: **thông điệp ngoại lệ chi tiết bị trả ra ngoài**, có thể tiết lộ cấu trúc nội bộ.

---

## 5. Logic nghiệp vụ

### 5.1 Chuỗi công thức tính điểm — phần quan trọng nhất của toàn tài liệu

Toàn bộ hệ thống chỉ số chất lượng đào tạo được dẫn xuất từ **một loại dữ liệu nhập tay duy nhất: điểm của một sinh viên cho một câu hỏi**. Mọi con số còn lại là tính được. Dưới đây là chuỗi công thức theo đúng thứ tự dẫn xuất.

**Bậc 1 — Điểm một kỳ đánh giá của sinh viên**

```
Điểm_kỳ = làm_tròn( Σ_câu_hỏi ( Điểm_câu × Trọng_số_câu / Thang_điểm_câu ), 1 chữ số )
```

Làm tròn theo quy tắc **làm tròn ra xa số 0** (ví dụ 0.25 → 0.3), không phải quy tắc làm tròn về số chẵn mặc định của .NET.

> **Chi tiết này quan trọng.** Quy tắc làm tròn mặc định của .NET là "làm tròn về số chẵn gần nhất", nên 0.25 thành 0.2 và 0.35 thành 0.4 — không nhất quán theo cảm nhận của người dùng. Hệ thống chỉ định rõ quy tắc **làm tròn ra xa số 0**, khớp với cách làm tròn trong quy chế học vụ. Một hệ thống mới **phải chỉ định rõ quy tắc làm tròn ở mọi chỗ tính điểm**; để mặc định là nguồn tranh chấp điểm.

**Bậc 2 — Điểm một CLO của sinh viên trong một lớp**

```
Điểm_CLO     = Σ ( Điểm_câu / Thang_điểm_câu × Trọng_số_câu × Trọng_số_kỳ )
Điểm_CLO_max = Σ ( Trọng_số_câu × Trọng_số_kỳ )
```

Tổng lấy trên **mọi câu hỏi được gắn với CLO đó** trong lớp.

> Lưu ý điểm tối đa **không phải một hằng số** mà được tính theo đúng tập câu hỏi đã gắn CLO. Nếu một CLO chỉ được đánh giá bởi vài câu hỏi nhỏ, điểm tối đa của nó nhỏ tương ứng. Nhờ đó tỉ lệ `Điểm_CLO / Điểm_CLO_max` luôn có nghĩa, không phụ thuộc việc CLO được đánh giá nhiều hay ít.

**Bậc 3 — Điểm Pk: mức đạt chuẩn đầu ra của một PLO trong phạm vi MỘT học phần**

```
Pk = 10 × ( Σ Điểm_CLO ) / ( Σ Điểm_CLO_max )
```

Tổng lấy trên **các CLO của học phần đó có liên kết tới PLO đang xét**. Kết quả quy về thang 10.

**Bậc 4 — Chọn lớp đại diện cho mỗi học phần**

Một sinh viên có thể học lại một học phần nhiều lần, ở nhiều lớp. Hệ thống chọn **một lớp duy nhất** làm đại diện:

| Tiêu chí | Quy tắc |
|---|---|
| Chính | Lớp có **điểm tổng lớp cao nhất**, với điểm tổng lớp = `Σ_kỳ ( Σ_câu (Điểm_câu/Thang × Trọng_số_câu) × Trọng_số_kỳ )` |
| Phá hòa | Nếu bằng điểm, chọn lớp có **Pk cao nhất** |

**Bậc 5 — Điểm một PLO của sinh viên**

```
Điểm_PLO = Σ ( Pk_của_lớp_đại_diện × Số_tín_chỉ_học_phần ) / Σ Số_tín_chỉ_học_phần
```

> **ĐÂY LÀ CHỖ TRỌNG SỐ HỌC PHẦN–PLO BỊ BỎ QUA.** Công thức dùng **số tín chỉ** làm trọng số. Cột trọng số trong ma trận Học phần–PLO (mục 3.3) **không xuất hiện trong công thức**. Người dùng nhập trọng số, hệ thống lưu trọng số, và kết quả không thay đổi.
>
> Về mặt phương pháp luận, dùng tín chỉ làm trọng số là **một lựa chọn hợp lý** (học phần nhiều tín chỉ đóng góp nhiều hơn vào chuẩn đầu ra). Vấn đề không phải là công thức sai, mà là **giao diện hứa một điều mà hệ thống không làm**. Hệ thống mới phải chọn một trong hai: dùng trọng số đã nhập, hoặc không cho nhập trọng số và nói rõ rằng tín chỉ là trọng số.

**Bậc 6 — Đạt hay không đạt**

| Đối tượng | Điều kiện đạt |
|---|---|
| CLO | `Điểm_CLO ≥ Điểm_CLO_max × ngưỡng` |
| PLO | `Điểm_PLO ≥ 10 × ngưỡng` |

Ngưỡng lấy từ bảng cấu hình hệ thống (có ngưỡng riêng cho CLO và cho PLO). Tỉ lệ phần trăm đạt được làm tròn 2 chữ số. *(Một hàm tính tỉ lệ CLO không làm tròn, trong khi biến thể khác của cùng hàm có làm tròn — một sự không nhất quán nhỏ.)*

### 5.2 Thang điểm quy đổi

Điểm tổng hệ 10 của một lớp = `làm_tròn( Σ (Điểm_kỳ × Trọng_số_kỳ), 1 chữ số )`, và **chỉ được tính khi MỌI thành phần đã có điểm**. Quy đổi:

| Điểm hệ 10 | Hệ 4 | Điểm chữ |
|---|---|---|
| ≥ 9.5 | 4.0 | A+ |
| ≥ 8.5 | 4.0 | A |
| ≥ 8.0 | 3.5 | B+ |
| ≥ 7.0 | 3.0 | B |
| ≥ 6.5 | 2.5 | C+ |
| ≥ 5.5 | 2.0 | C |
| ≥ 5.0 | 1.5 | D+ |
| ≥ 4.0 | 1.0 | D |
| < 4.0 | 0.0 | F |

> Lưu ý **A+ và A đều quy về 4.0 hệ 4** — A+ chỉ khác ở điểm chữ, không khác ở điểm trung bình tích lũy. Đây là quy định thật của trường, cần giữ nguyên.
>
> Nguyên tắc "**chỉ tính điểm tổng khi mọi thành phần đã có điểm**" là đúng và quan trọng: một điểm tổng tính trên dữ liệu thiếu sẽ thấp giả, và nếu được hiển thị, sinh viên sẽ khiếu nại về một con số mà hệ thống chưa có đủ dữ liệu để tính.

### 5.3 Quy trình tính lại và lưu kết quả

Chức năng tính lại **chỉ dành cho Quản trị viên** (và Phòng Đào tạo, Người phụ trách chương trình với một số phạm vi), hoạt động theo mẫu cache bền có phiên bản đã nêu ở mục 3.6: vô hiệu toàn bộ dòng cũ, chèn dòng mới, đọc chỉ lấy dòng hiệu lực.

> **Vì sao điểm PLO không được tính mỗi lần đọc.** Công thức bậc 5 cần: toàn bộ điểm câu hỏi của toàn bộ lớp mà sinh viên từng học, nhân với toàn bộ liên kết CLO–PLO. Với một chương trình đào tạo đầy đủ, đây là hàng chục nghìn dòng cho **một** sinh viên. Tính khi đọc là không khả thi cho một báo cáo toàn khóa. Lưu kết quả là bắt buộc — và khi đã lưu, phải có cơ chế phiên bản để biết kết quả cũ hay mới.

### 5.4 Xét hoàn thành chương trình đào tạo — các lý do thất bại

Khi một sinh viên **không** được xác định là hoàn thành chương trình, hệ thống sinh **danh sách lý do bằng tiếng Việt**, lưu trực tiếp vào bản ghi kết quả. Toàn bộ các lý do có thể xuất hiện:

| Lý do | Ý nghĩa |
|---|---|
| "Chương trình đào tạo chưa được xác nhận" | Cờ xác nhận chương trình chưa bật — **chặn trước mọi thứ khác** |
| "Chưa học N học phần trong chương trình" | Thiếu học phần trong khung chương trình |
| "Chưa có đầy đủ kết quả cho học phần {mã}" | Đã học nhưng chưa đủ điểm các thành phần |
| "Không thể tính điểm Pk cho các học phần: ..." | Học phần có điểm nhưng thiếu liên kết CLO–PLO nên không tính được |
| "Chưa có điểm PLO: {tên}" | PLO chưa có kết quả |
| "PLO dưới ngưỡng {ngưỡng}: {tên}" | Có điểm nhưng không đạt |
| "Thiếu điểm cho N PLO" | Dạng tổng hợp của lý do trên |
| "Chưa có điểm PLO nào" | Không có dữ liệu PLO |
| "Chưa được tính toán" | **Không có dòng kết quả nào trong cache bền** |

> **Thiết kế này đáng sao chép.** Thay vì trả về một giá trị đúng/sai, hệ thống trả về **danh sách lý do cụ thể, bằng ngôn ngữ người dùng, nêu rõ học phần và PLO nào**. Người làm công tác xét tốt nghiệp đọc được ngay cần bổ sung gì, không phải đi tra từng bảng. Và vì danh sách được **lưu cùng kết quả**, nó phản ánh đúng lý do tại thời điểm tính.
>
> **Lý do cuối cùng — "Chưa được tính toán" — là một chi tiết quan trọng:** hệ thống phân biệt rõ *"đã xét và không đạt"* với *"chưa từng xét"*. Gộp hai trạng thái này lại là lỗi thường gặp, và nó khiến người dùng tưởng sinh viên không đủ điều kiện trong khi thực tế chỉ là chưa ai chạy tính toán.
>
> **GIỚI HẠN HIỆN TẠI, CẦN BIẾT:** việc **kiểm tra toàn bộ học phần của chương trình đã bị TẮT** trong mã (có ghi chú việc-cần-làm), vì hiện tại nghiệp vụ chỉ yêu cầu xét **học phần cốt lõi**. Nghĩa là kết quả "hoàn thành chương trình" hiện nay **chỉ xác nhận sinh viên đã đạt các học phần cốt lõi và các PLO**, không xác nhận đã học đủ toàn bộ khung chương trình. Đây là một điểm cần làm rõ về mặt yêu cầu trước khi dùng kết quả này cho việc công nhận tốt nghiệp chính thức.

### 5.5 Quy tắc nhập điểm và xác nhận

**Khi nào giảng viên bị từ chối nhập điểm** — bất kỳ một trong các điều kiện sau:

| Điều kiện |
|---|
| Kỳ đánh giá đã bị khóa điểm |
| Kỳ đánh giá **đã được xác nhận** |
| Chưa tới thời điểm mở nhập điểm |
| Đã quá **hạn nhập điểm hiệu lực** (tức đã tính cả gia hạn) |

**Nhập điểm hàng loạt cho phép thành công một phần:** phản hồi tách riêng danh sách đã lưu và danh sách thất bại. Điểm để trống nghĩa là **xóa dòng kết quả**, không phải ghi 0.

**Điều kiện để xác nhận điểm một kỳ đánh giá:**

| Điều kiện |
|---|
| Chỉ định **đúng một** trong hai: mã kỳ đánh giá hoặc mã ca thi con |
| Mọi sinh viên liên quan phải ở trạng thái **Đang học** |
| Kỳ đánh giá phải **có câu hỏi** |
| **Mọi cặp (sinh viên, câu hỏi) đều phải có điểm khác null** |

Sau khi thỏa, hệ thống tính điểm kỳ đánh giá cho từng sinh viên và đóng dấu thời điểm xác nhận.

> Yêu cầu "**mọi cặp sinh viên–câu hỏi đều phải có điểm**" là chốt chặn then chốt: nó bảo đảm không bao giờ có một kỳ đánh giá được xác nhận trên dữ liệu thiếu. Kết hợp với quy tắc ở 5.2 (chỉ tính điểm tổng khi đủ thành phần), hệ thống có hai lớp bảo vệ chống công bố điểm không hoàn chỉnh.

### 5.6 Hai luồng lan truyền điểm sau xác nhận

Đây là phần phức tạp nhất và cũng là phần thiết kế tốt nhất của hệ thống.

**Luồng A — Từ ca thi con xuống các lớp thành viên**

| Bước | Hành động |
|---|---|
| 1 | Xác nhận điểm một ca thi con |
| 2 | **Nhân bản kết quả từ ca con sang các lớp thành viên**, trong một giao dịch. Câu hỏi của ca con được **đối sánh với câu hỏi của lớp theo tên, trọng số và thang điểm** |
| 3 | Đóng dấu xác nhận cho ca con |
| 4 | **Khi và chỉ khi mọi ca con đều đã xác nhận**, đóng dấu xác nhận cho kỳ đánh giá của ca thi tổng |

> Việc đối sánh câu hỏi **theo tên + trọng số + thang điểm** thay vì theo mã là cần thiết, vì câu hỏi của lớp và câu hỏi của ca thi là hai bộ dòng khác nhau. Nhưng nó cũng là một điểm giòn: **nếu ai đó sửa tên hay trọng số một câu hỏi ở một bên, việc nhân bản sẽ không khớp**. Chính vì vậy hệ thống có cờ khóa cấu trúc câu hỏi (mục 3.5) — cờ đó tồn tại để bảo vệ chính phép đối sánh này.

**Luồng B — Từ học phần lý thuyết sang học phần thí nghiệm/thực hành**

Khi điểm **cuối kỳ** của một lớp được xác nhận, nếu học phần của lớp đó là **học phần phụ thuộc** của một học phần khác, điểm được chuyển sang các kỳ đánh giá **thí nghiệm/thực hành** của lớp học phần gốc **trong cùng học kỳ**.

| Khái niệm | Mã loại kỳ đánh giá |
|---|---|
| Kỳ cuối kỳ | `CK`, `BV` |
| Kỳ cuối kỳ phụ | `DA`, `TH` |
| Kỳ nhận điểm chuyển sang | `TN`, `TH` |
| Kỳ là nguồn của việc chuyển | `CK` |

**Điểm phát tán duy nhất cho mọi thay đổi điểm sau xác nhận**

> **Đây là quyết định kiến trúc quan trọng nhất trong toàn hệ thống, và là điều đáng sao chép nhất.**
>
> Cả **đính chính** và **phúc khảo** đều **không tự ghi điểm**. Cả hai gọi vào **một hàm duy nhất**, và hàm đó làm bốn việc theo đúng thứ tự:
>
> | Bước | Hành động |
> |---|---|
> | 1 | Ghi hoặc cập nhật dòng kết quả của câu hỏi |
> | 2 | **Tính lại** điểm kỳ đánh giá của sinh viên |
> | 3 | **Lan sang các lớp thành viên** nếu kỳ đánh giá thuộc ca thi tổng |
> | 4 | **Lan sang kỳ thí nghiệm/thực hành** của học phần phụ thuộc |
>
> **Vì sao điều này thiết yếu.** Một thay đổi điểm một câu hỏi phải lan tới: điểm kỳ đánh giá, điểm tổng lớp, điểm CLO, điểm Pk, điểm PLO, bảng điểm của các lớp thành viên ca thi, và kỳ thí nghiệm của học phần phụ thuộc. Nếu đính chính và phúc khảo mỗi bên tự viết chuỗi lan truyền này, **chúng sẽ lệch nhau** — và sự lệch đó biểu hiện thành điểm không khớp giữa hai bảng mà không ai biết nguyên nhân.
>
> **Bài học tổng quát, áp dụng cho mọi hệ thống:** khi một dữ liệu gốc có nhiều giá trị dẫn xuất và có **nhiều đường ghi** (ở đây là 3: nhập điểm, đính chính, phúc khảo), hãy đặt **một hàm ghi duy nhất** mà mọi đường phải đi qua. Đây chính xác là bài học mà hệ thống đăng ký học phần **đã không áp dụng**, và hậu quả ở đó là đường ghi hàng loạt bỏ qua toàn bộ kiểm tra an toàn.

### 5.7 Quy trình đính chính và phúc khảo

**Đính chính điểm** (sửa sai sót khi nhập, do giảng viên hoặc phòng đào tạo phát hiện)

| Bước | Quy tắc |
|---|---|
| Tạo | Kiểm cờ khóa điểm, kiểm **hạn đính chính hiệu lực**, kiểm chưa xác nhận đính chính. `NewScore` **phải khác** `OldScore` |
| Xác nhận | Đóng dấu thời điểm xác nhận các đính chính |
| Chấp nhận | Áp `NewScore` qua điểm phát tán duy nhất, đóng dấu danh tính người duyệt |
| Hoàn tác chấp nhận | Áp lại `OldScore` qua cùng hàm đó |

Có chức năng **so sánh điểm trước và sau** để xem ảnh hưởng của một đợt đính chính lên bảng điểm.

> **Hai lỗi đã biết:** (1) `OldScore` mặc định 0 khi câu hỏi chưa có điểm (mục 3.5); (2) khi xác nhận đính chính của một ca thi tổng, hệ thống kiểm tra **cờ xác nhận điểm** thay vì **cờ xác nhận đính chính** — nghĩa là kiểm tra sai cột, nên có thể cho xác nhận đính chính trong tình huống không được phép.

**Phúc khảo** (sinh viên khiếu nại điểm, có thu phí)

Luồng trạng thái: **Chờ xử lý → Đã phân công → Đã chấm → Đã áp dụng hoặc Bị từ chối**.

| Quy tắc | Nội dung |
|---|---|
| Phạm vi | **Chỉ kỳ đánh giá loại Cuối kỳ được phúc khảo** |
| Người được tạo đơn | Quản trị viên, Phòng Đào tạo, **và chính Sinh viên** |
| Phân công người chấm lại | **Không được là giảng viên thứ nhất hay thứ hai của lớp** |
| Ghi kết quả chấm lại | Chụp lại điểm cũ tại thời điểm chấm |
| Áp dụng / hoàn tác | Qua điểm phát tán duy nhất |
| Xóa đơn | **Không xóa được đơn đã áp dụng** |

> **Quy tắc "người chấm lại không được là giảng viên của lớp" là một yêu cầu liêm chính học thuật được thi hành bằng mã**, không phải bằng quy trình giấy. Đây là ví dụ tốt về việc chuyển một quy định hành chính thành một ràng buộc kỹ thuật. Tương tự với việc không cho xóa đơn đã áp dụng — bảo toàn vết của một quyết định đã có hiệu lực.

### 5.8 Quy tắc cấu trúc đánh giá

| Quy tắc | Nội dung |
|---|---|
| Tạo kỳ đánh giá | Loại phân nhóm phải là giá trị enum hợp lệ; **mã loại phải duy nhất trong lớp**; ca thi tổng **chỉ có một** kỳ đánh giá; kỳ đánh giá **không thể vừa gắn lớp vừa gắn ca thi** |
| **Tổng trọng số** | **Tổng trọng số các kỳ của một lớp phải bằng đúng 1** |
| Thứ tự thời gian | Hạn nhập điểm > thời điểm mở nhập; hạn đính chính > hạn nhập điểm |
| Gia hạn | Hạn nhập gia hạn > hạn nhập gốc; hạn đính chính gia hạn > hạn đính chính gốc; **hạn đính chính hiệu lực > hạn nhập điểm hiệu lực** |
| Sửa cấu trúc điểm | Đối sánh theo chỉ số với các kỳ hiện có; **kỳ dư chỉ bị xóa nếu chưa có câu hỏi**, ngược lại báo lỗi nghiệp vụ |
| Đặt hạn hàng loạt | Theo mã loại, hoặc theo nhóm phân loại (kiểm từng nhóm, gom toàn bộ xung đột rồi báo một lần) |

Hệ thống có **danh mục khoảng 34 mã loại kỳ đánh giá** ánh xạ sang tên tiếng Việt (bài tập, bảo vệ, chuyên cần, đồ án, đánh giá, giữa kỳ, lý thuyết, cuối kỳ, thực hành, thí nghiệm, kiểm tra, thực tập, thuyết trình, vấn đáp...). Đây là một danh mục tham chiếu có giá trị sử dụng lại trực tiếp.

> **Việc "gom toàn bộ xung đột rồi báo một lần"** ở dòng cuối là chi tiết trải nghiệm quan trọng: khi phòng đào tạo đặt hạn cho hàng trăm lớp, báo lỗi ở lớp đầu tiên rồi dừng buộc họ sửa và chạy lại hàng chục lần. Báo tất cả cùng lúc cho họ sửa một lượt.

### 5.9 Quy tắc lớp cốt lõi

> **Một lớp là lớp cốt lõi khi ĐỒNG THỜI hai điều kiện sau đúng:**
>
> 1. Học phần của lớp được đánh dấu **cốt lõi trong khung chương trình của một chương trình đào tạo ĐÃ XÁC NHẬN**;
> 2. Lớp **có sinh viên thuộc chính chương trình đào tạo đó**.
>
> Điều kiện 2 là chi tiết tinh tế và đúng: một lớp dạy học phần cốt lõi nhưng không có sinh viên nào của chương trình đó thì **không đóng góp dữ liệu nào cho việc đánh giá chuẩn đầu ra của chương trình**, nên không nên bị kéo vào báo cáo chất lượng. Nếu chỉ xét điều kiện 1, báo cáo PLO sẽ bị lẫn các lớp không liên quan.

Có một chức năng đặt lại cờ cốt lõi cho các lớp cũ (trước một năm cho trước) đã có điểm hoặc kỳ đánh giá — tức một công cụ sửa dữ liệu lịch sử sau khi quy tắc được áp dụng.

### 5.10 Các quy tắc toàn vẹn khác

| Đối tượng | Quy tắc |
|---|---|
| Lớp học phần | Tạo cần học phần, học kỳ, giảng viên tồn tại và mã duy nhất. **Chặn xóa khi có đối tượng con**. Sao chép cấu trúc: đích phải là lớp **khác, cùng học phần, chưa có kết quả** |
| Lớp học phần | Chức năng tạo câu hỏi ban đầu **chỉ dành cho Giảng viên và bị từ chối với lớp cốt lõi** — vì cấu trúc đề của lớp cốt lõi do cấp trên quy định |
| Sinh viên | Duy nhất theo (mã, hệ tiến sĩ); tạo sinh viên **tự sinh tài khoản** vai trò Sinh viên. Xóa sinh viên thì vô hiệu tài khoản |
| Chương trình đào tạo | Mã trùng bị chặn; **chặn xóa khi có đối tượng con**; kế thừa cấu trúc từ chương trình khác bị chặn khi nguồn trùng đích hoặc đích đã có dữ liệu |
| PLO | **Tên trùng trong cùng chương trình bị chặn** |
| CLO | Trùng cặp (tên, học kỳ) trong cùng học phần bị chặn. **Liên kết CLO với PLO yêu cầu học phần của CLO đó ĐÃ được liên kết với PLO đó.** Không xóa được CLO đang có liên kết |
| Ma trận Học phần–PLO | **Học phần phải thuộc chương trình đào tạo của PLO VÀ phải là học phần cốt lõi** |
| Câu hỏi | Không sửa câu hỏi hay liên kết CLO của kỳ đánh giá thuộc ca thi tổng hoặc thuộc lớp lý thuyết phụ thuộc; **không xóa câu hỏi đã có điểm hoặc đã nối CLO**; không cập nhật danh sách câu hỏi khi đã có điểm |
| Ca thi tổng / ca con | Chặn trùng mã, chặn xóa khi có con, sao chép cấu trúc cần cùng học phần và chưa có kết quả |

> **Hai quy tắc đáng chú ý nhất về mặt mô hình chuẩn đầu ra:**
>
> - **Liên kết CLO–PLO đòi học phần đã liên kết PLO trước.** Đây là tính nhất quán theo tầng: không thể nói "CLO này góp vào PLO đó" nếu chính học phần chứa CLO không được khai báo là góp vào PLO đó. Quy tắc này giữ cho ma trận hai tầng không mâu thuẫn.
> - **Chỉ học phần cốt lõi được gắn PLO.** Hệ quả: chuẩn đầu ra chương trình chỉ được đo bằng các học phần cốt lõi, các học phần tự chọn không tham gia. Đây là một quyết định phương pháp luận cần được nêu rõ trong tài liệu yêu cầu của hệ thống mới, vì nó quyết định phạm vi dữ liệu của mọi báo cáo chất lượng.

### 5.11 Tích hợp ký số bảng điểm

Hệ thống tích hợp với một **dịch vụ chứng thực số bên ngoài** để ký bảng điểm. Luồng: tạo bản nháp PDF → tải xem → ký → lưu bảng điểm đã ký.

| Hạng mục | Chi tiết |
|---|---|
| Cấu hình bắt buộc | Địa chỉ dịch vụ, mã khách và bí mật khách (`[redacted]`, nạp qua biến môi trường hoặc kho bí mật của công cụ phát triển) |
| Tự động xin chứng thư | Bật mặc định, thời hạn 365 ngày |
| Thời hạn bản nháp | 15 phút, lưu trong bộ nhớ với giới hạn dung lượng riêng |
| Danh mục tài liệu | Tra theo mã danh mục nếu không cấu hình sẵn |
| Hai vai trò ký | Giảng viên phụ trách, và Trưởng khoa |

**Chi tiết kỹ thuật về vị trí chữ ký — một cái bẫy đáng ghi lại:**

Khổ A4 là 595 × 842 điểm. **Dịch vụ chứng thực dùng gốc tọa độ ở góc dưới–trái, trong khi tài liệu PDF được dựng theo gốc trên–trái.** Phép chuyển đổi bắt buộc:

```
posY_dịch_vụ = 842 − toạ_độ_Y_trên − chiều_cao_chữ_ký
```

Toạ độ X giữ nguyên. Hệ thống có hàm kiểm tra hợp lệ, từ chối số trang nhỏ hơn 1, kích thước không dương, hoặc hình chữ nhật vượt khỏi trang.

> **Hai nhận xét vận hành.**
>
> 1. **Cấu hình không được kiểm tra khi khởi động**, nên thông tin đăng nhập dịch vụ chứng thực **chỉ được xác minh vào lần ký đầu tiên**. Nghĩa là một cấu hình sai sẽ im lặng cho tới khi một giảng viên thật đang ký một bảng điểm thật — thời điểm tệ nhất để phát hiện. Những phụ thuộc ngoài cần được kiểm tra lúc khởi động (như hệ thống này **đã làm đúng** với quy tắc so sánh CSDL ở mục 2.1 — lại là một sự không nhất quán).
> 2. Việc hai hệ tọa độ ngược chiều nhau là loại lỗi **không gây ngoại lệ, chỉ đặt chữ ký sai chỗ** — chữ ký nằm lệch hoặc ra ngoài trang. Nó chỉ bị phát hiện bằng mắt.

---

## 6. Cấu hình và triển khai

### 6.1 Chuỗi xử lý yêu cầu HTTP

Thứ tự các tầng xử lý:

```
Bắt ngoại lệ → Tin cậy tiêu đề proxy → Chuyển hướng HTTPS → CORS
  → Bộ đệm phản hồi → Phân quyền → Định tuyến bộ điều khiển
```

| Nhận xét | Nội dung |
|---|---|
| **Tầng xác thực không được gọi tường minh** | Hệ thống dựa vào việc nền tảng tự chèn tầng xác thực. Hoạt động được, nhưng là một phụ thuộc ngầm — một nâng cấp nền tảng đổi hành vi này sẽ làm mọi phân quyền thất bại theo cách khó chẩn đoán |
| Tin cậy proxy | **Hai địa chỉ IP proxy được ghi cứng trong mã nguồn**, không phải cấu hình. Đổi hạ tầng là phải sửa mã và biên dịch lại |
| CORS | Chính sách tên là "cho phép tất cả" nhưng **thực tế dùng danh sách nguồn cấu hình được** (mặc định là máy phát triển cục bộ) và cho phép gửi kèm thông tin xác thực. **Tên gọi sai lệch so với hành vi** |
| Tài liệu API | Chỉ bật ở môi trường phát triển. Thư viện sinh tài liệu **bị đăng ký hai lần** (vô hại nhưng là dấu hiệu lắp ghép thiếu soát) |

### 6.2 Trình tự khởi động

| Bước | Hành động | Khi lỗi |
|---|---|---|
| 1 | Bảo đảm cơ sở dữ liệu tồn tại (chỉ với PostgreSQL) | Ném lỗi, **dừng ứng dụng** |
| 2 | Chạy di trú lược đồ, với thời gian chờ cấu hình được (mặc định 600 giây) | Ném lỗi, **dừng ứng dụng** |
| 3 | **Kiểm tra quy tắc so sánh tiếng Việt** | Ném lỗi, **dừng ứng dụng** |

Không có tác vụ nền hay dịch vụ chạy định kỳ nào.

> Thời gian chờ di trú **600 giây** không phải con số tùy ý: di trú trên cơ sở dữ liệu điểm nhiều năm có thể phải xây lại chỉ mục trên hàng triệu dòng. Thời gian chờ mặc định 30 giây sẽ hủy giữa chừng và để lại lược đồ ở trạng thái nửa vời. Hệ thống mới nên **cấu hình được thời gian chờ di trú và đặt nó cao**.

### 6.3 Các khóa cấu hình

| Khóa | Mục đích |
|---|---|
| Chuỗi kết nối chính | Cơ sở dữ liệu vận hành |
| Chuỗi kết nối nguồn | Cơ sở dữ liệu nghiệp vụ của trường, **chỉ đọc**, có tùy chọn tin cậy chứng thư máy chủ không kiểm tra |
| Nhà cung cấp cơ sở dữ liệu | Chọn PostgreSQL hoặc SQL Server |
| Thời gian chờ lệnh | Giây, dùng cho di trú |
| Danh sách nguồn CORS | Các địa chỉ giao diện được phép |
| Khóa ký, bên phát hành, bên nhận của chứng thực nội bộ | `[redacted]` |
| Khóa ký của chứng thực đăng nhập một lần của trường | `[redacted]` |
| Cấu hình nhà cung cấp danh tính đám mây | `[redacted]` |
| Khóa API tĩnh | `[redacted]` |
| Cấu hình dịch vụ ký số | `[redacted]` |

> **BA VẤN ĐỀ BẢO MẬT VỀ CẤU HÌNH — KHÔNG LẶP LẠI:**
>
> 1. **Tệp cấu hình bị loại khỏi quản lý phiên bản nhưng KHÔNG bị loại khỏi ngữ cảnh đóng gói ảnh hóa.** Lệnh sao chép toàn bộ thư mục khi dựng ảnh sẽ **nướng mọi bí mật vào trong ảnh**. Bất kỳ ai lấy được ảnh đều đọc được chúng — kể cả khi mã nguồn hoàn toàn sạch. Hệ thống mới phải **loại tệp cấu hình khỏi cả hai danh sách**, và nạp bí mật qua biến môi trường hoặc kho bí mật.
> 2. **Có các khóa cấu hình "chú thích" đã chết chứa thông tin đăng nhập tài khoản quản trị SQL Server** (`[redacted]`). Một bí mật được "vô hiệu" bằng cách đổi tên khóa thì **vẫn là một bí mật đã lộ** — nó nằm nguyên trong tệp và trong lịch sử.
> 3. **Tùy chọn tin cậy chứng thư máy chủ không kiểm tra** trên chuỗi kết nối tới cơ sở dữ liệu nghiệp vụ của trường vô hiệu hóa việc xác thực kênh truyền, mở đường cho tấn công chen giữa.

### 6.4 Vận hành PostgreSQL

| Hạng mục | Chi tiết |
|---|---|
| Ảnh | `postgres:16` bản Debian — **chọn có chủ ý, KHÔNG dùng bản Alpine** |
| Vì sao không Alpine | Bản Alpine dùng thư viện C tối giản **không có dữ liệu bản địa hóa đầy đủ**, nên hàm chuyển chữ thường và quy tắc so sánh tiếng Việt hoạt động sai. Đây chính xác là loại lỗi mà quy tắc kiểm tra lúc khởi động ở mục 2.1 dùng để bắt |
| Tạo cơ sở dữ liệu | **Phải tạo bằng tay với quy tắc so sánh tiếng Việt** — không tự động hóa được qua biến môi trường của ảnh |
| Tinh chỉnh | Vùng đệm chung 512MB, ước lượng bộ đệm hệ thống 1536MB, bộ nhớ sắp xếp 16MB, bộ nhớ bảo trì 256MB, tối đa 120 kết nối |
| Ghi nhật ký | **Ghi mọi câu truy vấn chạy quá 1 giây** |
| Sao lưu | Kết xuất định dạng nén của PostgreSQL |

> **Hai thực hành đáng sao chép:** (1) **ghi nhật ký truy vấn chậm** — đây là công cụ chẩn đoán hiệu năng rẻ nhất và hữu ích nhất có thể bật trên một cơ sở dữ liệu vận hành; (2) **chọn ảnh nền theo yêu cầu bản địa hóa**, không theo kích thước ảnh. Việc đánh đổi vài trăm megabyte để có quy tắc so sánh tiếng Việt đúng là lựa chọn hiển nhiên khi dữ liệu là tên người Việt.

Hệ thống có một thư mục tài liệu di trú riêng, gồm: **sổ tay chuyển đổi vận hành**, bản lược đồ gốc, tổng kiểm tra dữ liệu, bằng chứng nạp dữ liệu từ SQL Server, tài liệu chuyển đổi kiểu dấu thời gian có múi giờ, và tài liệu đối chiếu lược đồ.

> **Sự tồn tại của sổ tay chuyển đổi vận hành là dấu hiệu của một lần di trú thật đã xảy ra**, không phải một kế hoạch. Việc có **tổng kiểm tra dữ liệu và bằng chứng nạp** nghĩa là việc di trú đã được **đối chiếu, không chỉ được thực hiện** — tức có bằng chứng dữ liệu sau khi chuyển khớp với dữ liệu trước. Đây là thực hành đúng cho bất kỳ lần đổi nhà cung cấp cơ sở dữ liệu nào.

### 6.5 Quy trình tích hợp liên tục

Chỉ **một chặng dựng**, chạy trên nhánh chính và nhãn phát hành. **Không có chặng chạy kiểm thử, không có chặng rà soát lỗ hổng phụ thuộc** — mặc dù hệ thống có hơn 270 ca kiểm thử.

> **Đây là nghịch lý đáng chú ý nhất về chất lượng của hệ thống:** bộ kiểm thử rất đáng kể đã được viết, nhưng **quy trình tích hợp không chạy nó**. Nghĩa là giá trị bảo vệ của nó chỉ tồn tại khi có người chủ động chạy ở máy cá nhân. Một bộ kiểm thử không được chạy tự động sẽ phân rã: một ca hỏng sẽ nằm im nhiều tuần, và khi có người chạy lại thì không ai còn biết thay đổi nào làm hỏng nó.
>
> Với hệ thống mới, việc **thêm một chặng chạy kiểm thử vào quy trình tích hợp là công việc vài giờ và bảo toàn toàn bộ giá trị của mọi ca kiểm thử sẽ được viết về sau.** Đây là hạng mục có tỉ lệ lợi ích trên chi phí cao nhất trong toàn bộ danh sách khuyến nghị của tài liệu này.

---

## 7. Kiểm thử

### 7.1 Quy mô và công cụ

| Hạng mục | Số liệu |
|---|---|
| Số tệp kiểm thử | 40 |
| Ca kiểm thử đơn | **242** |
| Ca kiểm thử theo bộ dữ liệu | **26** |
| Ca có thể bỏ qua theo điều kiện | 4 |
| Độ phủ mã | **Không có số liệu công bố** (công cụ đo đã được cài, chưa có báo cáo) |

Công cụ: khung kiểm thử đơn vị chuẩn của .NET, thư viện tạo đối tượng giả, thư viện khẳng định dạng câu, **thư viện dựng CSDL thật trong vùng chứa**, tiện ích bỏ qua ca theo điều kiện, công cụ đo độ phủ.

### 7.2 Hai hạ tầng kiểm thử đáng sao chép

**Thứ nhất — CSDL thật trong vùng chứa, có quy tắc so sánh tiếng Việt**

Mỗi lần chạy kiểm thử dựng một **PostgreSQL 16 thật trong vùng chứa**, với **quy tắc so sánh tiếng Việt giống môi trường vận hành**, cơ sở dữ liệu riêng cho kiểm thử, mật khẩu kiểm thử `[redacted]`. Một hạ tầng khác khởi động **toàn bộ ứng dụng thật**, không phải bản mô phỏng.

> **Vì sao điều này thiết yếu với hệ thống tiếng Việt, không chỉ là "tốt hơn".** Một CSDL trong bộ nhớ hay một đối tượng giả **không có quy tắc so sánh**. Nghĩa là mọi ca kiểm thử về sắp xếp tên, tìm kiếm không phân biệt hoa thường, hay so khớp tên tiếng Việt sẽ **xanh trên bản giả và sai trên bản thật**. Toàn bộ nhóm lỗi nghiêm trọng nhất của hệ thống tiếng Việt sẽ lọt qua. Dựng CSDL thật đắt hơn về thời gian chạy và là **cái giá bắt buộc phải trả**.

**Thứ hai — Kiểm thử đối chiếu kết quả PLO giữa hai nhà cung cấp CSDL**

Có một bộ ca kiểm thử **so sánh kết quả tính PLO trên PostgreSQL với một bản chuẩn đã lưu, và với bản chuẩn lấy từ SQL Server trước khi di trú**. Bộ này chỉ chạy khi các biến môi trường tương ứng được bật.

> **Đây là cách duy nhất đúng để xác thực một lần di trú CSDL có logic tính toán phức tạp.** Việc đối chiếu lược đồ chỉ chứng minh cấu trúc khớp; việc đối chiếu số dòng chỉ chứng minh dữ liệu không mất. **Không thứ nào chứng minh rằng CÙNG một công thức trên CÙNG dữ liệu cho RA CÙNG kết quả** — và đó mới là điều quan trọng với điểm của sinh viên, vì khác biệt về quy tắc so sánh, cách làm tròn kiểu số thập phân, hay thứ tự sắp xếp đều có thể đổi kết quả cuối mà không đổi bất kỳ số liệu cấu trúc nào.
>
> **Bài học tổng quát:** khi di trú một hệ thống có công thức, hãy **chụp lại kết quả đầu ra trước khi di trú và so sánh sau khi di trú**. Bản chuẩn đó là tài sản kiểm thử giá trị nhất của toàn bộ việc di trú.

### 7.3 Các mảng đã được phủ kiểm thử

| Nhóm | Nội dung |
|---|---|
| Tài khoản & phiên | Quản lý vị trí phiên, đổi/đặt lại mật khẩu |
| Ký số | Máy khách dịch vụ, thông điệp lỗi, trạng thái chứng thư, phân quyền ký, sinh PDF bảng điểm |
| Bảng điểm | Danh sách bảng điểm theo cấp quản trị và cấp khoa |
| Xác nhận | Xác nhận lớp và xác nhận ca thi |
| Đính chính | Hàng loạt, theo ca thi con, qua học phần phụ thuộc, khi bị khóa điểm, yêu cầu PDF kèm |
| Phúc khảo | Toàn luồng trạng thái |
| Hạn chót | Gia hạn và bộ lập kế hoạch đồng bộ hạn |
| Chuyển dữ liệu | Phạm vi của việc chuyển |
| Lớp cốt lõi | Đồng bộ cờ cốt lõi, danh sách lớp cốt lõi của chương trình |
| **Bản địa hóa** | **Tìm kiếm không phân biệt hoa thường với tiếng Việt** |
| **Kiểu dữ liệu** | **Lưu dấu thời gian có múi giờ, lưu trạng thái sinh viên, phản hồi vô hướng cho phép null** |
| CLO | Kiểm thử tích hợp bộ điều khiển |

> **Việc tồn tại các ca kiểm thử riêng cho "lưu dấu thời gian có múi giờ" và "lưu trạng thái sinh viên"** cho thấy đây từng là **lỗi thật đã xảy ra** và được chốt bằng kiểm thử hồi quy. Đó là cách dùng kiểm thử đúng đắn: không phủ cho đủ chỉ tiêu, mà **đóng đinh những chỗ đã từng sai**.

Một phiên bản thay thế của tầng tính toán kết quả **là mã chết**: không được đăng ký vào hệ thống tiêm phụ thuộc, không có nơi gọi, không có ca kiểm thử.

---

## 8. Đánh giá chất lượng

### 8.1 Hệ thống có tài liệu rà soát bảo mật riêng

Hệ thống có một **tài liệu rà soát bảo mật nội bộ**, bản gốc lập giữa năm 2026 và cập nhật sau đó, với tổng kết:

| Mức | Số lượng |
|---|---|
| Nghiêm trọng | **0** |
| Cao | **3** |
| Trung bình | 6 |
| Thấp | 4 |
| Thông tin | 4 |
| Đã sửa | 1 |

> **Bản thân việc có tài liệu này là điểm cộng lớn và là điều hai hệ thống còn lại không có.** Nó cho thấy các vấn đề bên dưới là **đã biết và được theo dõi**, không phải lỗi bị bỏ sót. Với mục đích tham chiếu, điều này quý: danh sách dưới đây là một **danh mục kiểm tra bảo mật đã được kiểm chứng trên một hệ thống quản lý điểm thật** — dùng được trực tiếp làm danh mục rà soát cho hệ thống mới.

### 8.2 Danh mục phát hiện — ĐỌC NHƯ MỘT DANH SÁCH KIỂM TRA, KHÔNG SAO CHÉP

**Mức cao**

| Vấn đề | Nội dung | Bài học |
|---|---|---|
| **Truy cập đối tượng không thuộc quyền** | Nhiều điểm cuối chỉ yêu cầu "đã đăng nhập" mà **không kiểm tra người gọi có quyền trên chính đối tượng được yêu cầu** — kết quả, sinh viên, tài khoản, đơn phúc khảo. Bất kỳ ai đăng nhập đổi mã trong đường dẫn là đọc được dữ liệu người khác | **Phân quyền theo vai trò không thay được phân quyền theo đối tượng.** "Là giảng viên" khác "là giảng viên CỦA LỚP NÀY" |
| **Bí mật bị nướng vào ảnh triển khai** | Như mục 6.3 | Loại tệp cấu hình khỏi cả quản lý phiên bản và ngữ cảnh đóng gói |
| **Mật khẩu suy diễn từ mã người dùng, không bắt đổi** | Mật khẩu tạo và đặt lại hàng loạt theo một khuôn mẫu đoán được từ mã sinh viên/giảng viên, **không có cờ bắt đổi lần đầu** | Mật khẩu khởi tạo phải **ngẫu nhiên và dùng một lần**. Hệ thống đăng ký học phần có đúng lỗi này — xem tài liệu tham chiếu tương ứng |

**Mức trung bình**

| Vấn đề | Bài học |
|---|---|
| Điểm cuối tra điểm PLO mở cho mọi người đã đăng nhập | Dữ liệu chất lượng đào tạo là dữ liệu nội bộ |
| **Khóa API tĩnh tương đương quyền quản trị**, và so sánh **không dùng phép so sánh thời gian hằng** | Một khóa tĩnh = một mật khẩu quản trị không hết hạn. So sánh không hằng thời gian cho phép dò từng byte |
| **Không giới hạn tần suất, không khóa tài khoản** | Mở đường dò mật khẩu bằng máy |
| **Đổi/đặt lại mật khẩu KHÔNG thu hồi phiên và chứng thực làm mới đang hoạt động** | Hậu quả trực tiếp: sau khi phát hiện bị chiếm tài khoản, người dùng đổi mật khẩu mà **kẻ chiếm vẫn còn phiên** |
| Chứng thực đăng nhập một lần của trường: **không kiểm tra bên phát hành và bên nhận, khóa yếu, và tin vào trường tên trong chứng thực** | Một chứng thực không kiểm tra bên phát hành là một chứng thực bất kỳ ai tự ký cũng dùng được |
| Thông điệp ngoại lệ chi tiết trả về cho người gọi | Rò rỉ cấu trúc nội bộ |

**Mức thấp và thông tin**

| Vấn đề |
|---|
| Thiếu các tiêu đề bảo mật HTTP |
| Cờ an toàn của cookie suy ra từ giao thức yêu cầu (sai sau proxy) |
| Chính sách CORS rộng |
| Tin cậy chứng thư máy chủ CSDL không kiểm tra |
| Không có chính sách phân quyền mặc định toàn cục |
| Chứng thực truy cập có thời hạn dài; dùng giờ cục bộ thay vì giờ chuẩn |
| Không rà soát lỗ hổng phụ thuộc trong quy trình tích hợp |
| Điểm cuối nhập tệp **nhận mọi loại tệp, không giới hạn kiểu và kích thước** |

**Một vấn đề đã được sửa — và phần còn sót lại**

Phân quyền cho các điểm cuối xuất dữ liệu đã được bổ sung. Tuy nhiên **ba điểm cuối tra điểm theo lớp vẫn cho phép bất kỳ giảng viên nào đọc bất kỳ lớp nào** — tức việc sửa chưa phủ hết.

> **Đây là một ví dụ mẫu mực cho Quy tắc "các nơi gọi mới là sản phẩm".** Lỗi được xác định, bản sửa được viết, hạng mục được đánh dấu đã sửa — nhưng **không phải mọi điểm cuối cùng nhóm đều được di trú sang bản sửa**. Nếu chỉ đọc dòng tổng kết "Đã sửa: 1", người đọc sẽ tin vấn đề đã đóng. Khi sửa một lỗi dạng này, **hãy liệt kê mọi nơi có cùng hình dạng lỗi và ghi rõ từng nơi đã sửa hay cố ý để lại**.

### 8.3 Các điểm cuối thiếu giới hạn vai trò

Ba điểm cuối **không có giới hạn vai trò nào**: sửa cấu hình hệ thống, sửa điểm kỳ đánh giá của sinh viên, và đọc nhật ký hoạt động người dùng.

> Điểm cuối **sửa điểm kỳ đánh giá không giới hạn vai trò** là mục nguy hiểm nhất trong toàn tài liệu này: nó bỏ qua toàn bộ chuỗi quy tắc ở mục 5.5 (khóa điểm, hạn chót, xác nhận) và toàn bộ vết đính chính/phúc khảo ở mục 5.7. Nói cách khác, **tồn tại một đường ghi điểm không đi qua điểm phát tán duy nhất** mà mục 5.6 dựng ra để bảo vệ. Một hệ thống mới phải coi "mọi đường ghi vào dữ liệu điểm" là một danh sách đóng, được liệt kê và rà soát, không phải một tập hợp mọc tự nhiên theo nhu cầu từng giao diện.

### 8.4 Các việc còn dở được ghi chú trong mã

| Vị trí | Nội dung |
|---|---|
| Bộ điều khiển ca thi con | Một chức năng **bị tắt tạm vì yêu cầu nghiệp vụ chưa rõ** |
| Hai điểm trong tầng chuyển dữ liệu | **Chức năng xóa bị tắt tạm** |
| Tầng kết quả | **Liên kết CLO–PLO còn lại sau khi học phần bị gỡ khỏi chương trình** — dữ liệu mồ côi |
| Tầng kết quả | **Kiểm tra toàn bộ học phần bị tắt** (xem mục 5.4) |
| Tầng tài khoản | Chưa kiểm tra các trường danh tính đám mây |
| Hai đối tượng truyền dữ liệu | Thông điệp lỗi **không khớp với biểu thức kiểm tra** mà nó mô tả |
| Tầng chứng thực, tầng ca thi tổng | Việc còn dở chưa mô tả |

> Hạng mục **"liên kết CLO–PLO còn lại sau khi học phần bị gỡ khỏi chương trình"** là một lỗi toàn vẹn dữ liệu có hậu quả tính toán: theo công thức bậc 3 và 5 ở mục 5.1, một liên kết mồ côi có thể vẫn được tính vào điểm PLO của một học phần **không còn thuộc chương trình**. Hệ thống mới phải xử lý dọn liên kết khi gỡ học phần, như một phần của chính giao dịch gỡ.

### 8.5 Các lỗi và điểm chưa gọn khác

**Lỗi logic**

| Lỗi | Hệ quả |
|---|---|
| Điểm cũ của đính chính mặc định 0 khi câu hỏi chưa có điểm | Hoàn tác đính chính ghi 0 thay vì trả về trạng thái chưa có điểm |
| Xác nhận đính chính kiểm sai cột dấu thời gian | Cho xác nhận trong tình huống không được phép |
| **Giảng viên thứ hai bị bỏ qua khi phân quyền sửa, nhưng được chấp nhận khi ký bảng điểm** | Một người **ký được bảng điểm mà không sửa được điểm trên đó** — hai tầng phân quyền trên cùng một dữ liệu không nhất quán |
| Một chức năng đặt lại mật khẩu chỉ xử lý hai mã vai trò cố định | Vai trò khác im lặng không có hiệu lực |
| Trường giảng viên của lớp khai báo là không-null nhưng thực tế có thể null | Nguy cơ ngoại lệ tham chiếu null |
| Hàm trích năm tuyển sinh từ mã sinh viên kiểm độ dài không nhất quán | Sai năm với mã có độ dài khác thường |
| Một hàm trả về đối tượng kỳ đánh giá với **mã giả**, trong khi bộ điều khiển khai báo trả về danh sách chuỗi | Hợp đồng API không khớp hiện thực |
| Một hàm cập nhật điểm **gán dữ liệu lên một thực thể đã bị đánh dấu xóa** | Hành vi không xác định |

**Thông điệp tiếng Việt sai ngữ cảnh**

| Chỗ | Sai |
|---|---|
| Xóa sinh viên | Thông điệp nói "giảng viên" |
| Một chỗ tra điểm | Thông điệp nói "nghiên cứu sinh" |
| Một thông điệp lỗi kỳ đánh giá | Nội suy một mã lớp có thể null vào câu thông báo |

> **Thông điệp sai ngữ cảnh không phải lỗi thẩm mỹ trong hệ thống này.** Người dùng là cán bộ phòng đào tạo; một thông báo nói "giảng viên" khi họ đang xóa sinh viên khiến họ **dừng lại và tin rằng mình bấm sai chỗ**. Với hệ thống mới, nên **tập trung toàn bộ chuỗi thông điệp vào một nơi** thay vì viết rải trong từng tầng — đó cũng là cách duy nhất để rà soát chúng.

**Điểm chưa gọn về mã nguồn**

| Hạng mục | Nội dung |
|---|---|
| **Tệp chết** | Một phiên bản thay thế của tầng kết quả; **hai tệp mã nguồn bị đổi đuôi thành `.txt` để vô hiệu**; một bản sao lưu tệp dự án; tệp bộ đệm và tệp cấu hình cá nhân bị đưa vào quản lý phiên bản |
| Khối mã bị chú thích | Nhiều khối lớn còn trong tệp |
| Lệnh in gỡ lỗi | Còn trong mã vận hành |
| Trả về thực thể trực tiếp | Hai tầng trả thực thể CSDL thay vì đối tượng truyền dữ liệu |
| **Lỗi ghi nhật ký kiểm toán bị nuốt** | Chỉ ghi ra luồng lỗi chuẩn — **một vết kiểm toán thất bại trong im lặng** |
| Một hàm móc của tầng dữ liệu | Tham chiếu một biến giao dịch không rõ nguồn |
| Cột bóng dư | Một cột khóa ngoại trùng lặp do quy ước đặt tên |
| **Lỗi chính tả trong tên lớp dịch vụ băm mật khẩu** | Sai chính tả nằm trong tên kiểu, lan ra mọi nơi dùng |
| Tệp thử API | Vẫn là mẫu sinh tự động mặc định, chưa thay nội dung |
| Tài liệu hướng dẫn nội bộ | **Ghi sai tên khóa cấu hình nhà cung cấp CSDL** so với mã thật |

> **Hai hạng mục cần nhấn mạnh.**
>
> 1. **"Vô hiệu một tệp mã nguồn bằng cách đổi đuôi thành `.txt`" là một mẫu cần tránh tuyệt đối.** Tệp vẫn nằm trong cây mã, vẫn hiện ra khi tìm kiếm, không được biên dịch nên **không bao giờ bị phát hiện là đã lỗi thời**, và người đọc sau không có cách nào biết nó còn đúng hay không. Mã không dùng thì xóa — lịch sử quản lý phiên bản đã giữ nó.
> 2. **Lỗi ghi nhật ký kiểm toán bị nuốt** là một mâu thuẫn tự thân: mục đích của vết kiểm toán là chứng minh ai đã làm gì, nên **một vết kiểm toán có thể thất bại trong im lặng thì không chứng minh được gì**. Nếu việc ghi vết là bắt buộc về mặt nghiệp vụ, lỗi ghi vết phải làm thất bại cả giao dịch; nếu không bắt buộc, thì đừng gọi nó là vết kiểm toán.

---

## 9. Ý nghĩa đối với dự án Quản lý Chương trình đào tạo

Đây là hệ thống **gần nhất về nghiệp vụ** trong ba hệ thống được khảo sát: nó đã hiện thực chương trình đào tạo, khung chương trình, học phần cốt lõi, PLO, CLO, ma trận liên kết, và xét hoàn thành chương trình. Vì vậy phần này dài hơn và cụ thể hơn hai tài liệu còn lại.

### 9.1 Những gì nên tiếp nhận nguyên vẹn

| Hạng mục | Vì sao |
|---|---|
| **Chuỗi công thức sáu bậc (mục 5.1)** | Đã chạy trên dữ liệu thật, đã được đối chiếu qua hai nhà cung cấp CSDL. Đây là tài sản giá trị nhất của toàn bộ khảo sát. Không nên thiết kế lại từ đầu |
| **Danh sách lý do không hoàn thành chương trình (mục 5.4)** | Mẫu thiết kế phản hồi đúng: danh sách lý do cụ thể bằng tiếng Việt, lưu cùng kết quả, phân biệt "không đạt" với "chưa xét" |
| **Điểm phát tán duy nhất cho mọi thay đổi điểm (mục 5.6)** | Quyết định kiến trúc quan trọng nhất. Mọi đường ghi phải đi qua một hàm |
| **Cache bền có phiên bản (mục 3.6)** | Mẫu hai pha với chỉ mục duy nhất có điều kiện: giữ lịch sử mà vẫn bảo đảm một dòng hiệu lực |
| **Quy tắc lớp cốt lõi hai điều kiện (mục 5.9)** | Điều kiện thứ hai (lớp phải có sinh viên của chương trình) là chi tiết đúng mà một thiết kế mới dễ bỏ sót |
| **Kiểm tra quy tắc so sánh tiếng Việt lúc khởi động (mục 2.1)** | Chống sai lệch dữ liệu âm thầm. Rẻ, và chặn đúng loại lỗi nguy hiểm nhất |
| **Hai tầng quy tắc nhất quán ma trận (mục 5.10)** | CLO chỉ nối PLO khi học phần đã nối PLO; chỉ học phần cốt lõi được nối PLO |
| **Danh mục ~34 mã loại kỳ đánh giá (mục 5.8)** | Dùng lại trực tiếp |
| **Thang quy đổi điểm (mục 5.2)** | Là quy định của trường, phải khớp |
| **Kiểm thử trên CSDL thật có quy tắc so sánh tiếng Việt (mục 7.2)** | Bắt buộc với hệ thống tiếng Việt, không phải tùy chọn |
| **Kiểm thử đối chiếu kết quả trước–sau di trú (mục 7.2)** | Cách duy nhất đúng để xác thực di trú hệ thống có công thức |
| **Ghi nhật ký truy vấn chậm (mục 6.4)** | Công cụ chẩn đoán hiệu năng rẻ nhất |
| **Chống ký trùng bằng chỉ mục duy nhất (mục 3.5)** | Chốt chặn ở tầng CSDL, không chỉ ở tầng ứng dụng |
| **Chấm thi ẩn danh (mục 3.4)** | Mã phách sinh tại tầng dữ liệu, không ở giao diện |
| **Người chấm phúc khảo không được là giảng viên của lớp (mục 5.7)** | Quy định liêm chính học thuật thi hành bằng mã |

### 9.2 Những quyết định hệ thống mới BẮT BUỘC phải chốt lại

| Câu hỏi | Vì sao phải chốt |
|---|---|
| **Trọng số trong ma trận Học phần–PLO: dùng hay bỏ?** | Hệ thống hiện tại lưu và cho sửa trọng số nhưng **không dùng** — công thức lấy tín chỉ làm trọng số. Phải chọn một và làm đúng theo lựa chọn đó. Để nguyên là lừa người dùng |
| **Xét hoàn thành chương trình: chỉ học phần cốt lõi, hay toàn bộ khung chương trình?** | Việc kiểm tra toàn bộ học phần **đang bị tắt** trong hệ thống hiện tại. Nếu kết quả dùng cho công nhận tốt nghiệp chính thức, câu trả lời phải là toàn bộ khung |
| **Phạm vi đọc dữ liệu của Sinh viên** | Hệ thống hiện tại **không thống nhất giữa mã nguồn và tài liệu rà soát bảo mật** về việc sinh viên đọc được gì (xem mục 10) |
| **Mọi đường ghi vào dữ liệu điểm** | Phải là một danh sách **đóng, liệt kê được, rà soát được**. Hệ thống hiện tại có một điểm cuối sửa điểm không giới hạn vai trò, nằm ngoài toàn bộ chuỗi bảo vệ |
| **Dọn liên kết CLO–PLO khi gỡ học phần khỏi chương trình** | Hệ thống hiện tại để lại liên kết mồ côi, và liên kết đó có thể vẫn tham gia công thức |
| **Quy tắc làm tròn ở mọi nơi tính điểm** | Phải chỉ định rõ, không để mặc định ngôn ngữ |
| **Hệ thống mới có cần hỗ trợ hai nhà cung cấp CSDL không?** | Hệ thống hiện tại trả giá đáng kể cho việc này (cú pháp chỉ mục có điều kiện khác nhau, bộ đệm mô hình theo nhà cung cấp). Nếu chỉ chạy một CSDL, đừng trả giá đó |

### 9.3 Những gì KHÔNG được sao chép

| Hạng mục | Thay bằng |
|---|---|
| **Phân quyền chỉ theo vai trò, không theo đối tượng** | Mọi điểm cuối nhận mã đối tượng phải kiểm tra người gọi có quyền trên **chính đối tượng đó** |
| **Bí mật trong tệp cấu hình, lọt vào ảnh triển khai** | Biến môi trường hoặc kho bí mật; loại tệp cấu hình khỏi **cả hai** danh sách loại trừ |
| **Mật khẩu khởi tạo suy diễn từ mã người dùng** | Ngẫu nhiên, dùng một lần, bắt đổi lần đầu |
| **Đổi mật khẩu không thu hồi phiên** | Thu hồi toàn bộ phiên và chứng thực làm mới |
| **Khóa API tĩnh tương đương quyền quản trị** | Nếu cần truy cập máy-sang-máy, dùng tài khoản dịch vụ có vai trò hẹp, có thể thu hồi |
| **So sánh bí mật không dùng phép so sánh thời gian hằng** | Luôn dùng so sánh thời gian hằng |
| **Không giới hạn tần suất, không khóa tài khoản** | Thêm cả hai |
| **Chứng thực ngoài không kiểm tra bên phát hành và bên nhận** | Kiểm tra đầy đủ, không tin trường tên trong chứng thực |
| **Điểm cuối nhập tệp không giới hạn kiểu và kích thước** | Giới hạn cả hai |
| **IP proxy ghi cứng trong mã** | Đưa vào cấu hình |
| **Vô hiệu mã bằng cách đổi đuôi tệp** | Xóa |
| **Nuốt lỗi ghi vết kiểm toán** | Hoặc làm thất bại giao dịch, hoặc đừng gọi là vết kiểm toán |
| **Phụ thuộc ngoài không kiểm tra lúc khởi động** | Kiểm tra lúc khởi động, như hệ thống này đã làm đúng với quy tắc so sánh CSDL |
| **Quy trình tích hợp không chạy kiểm thử** | Thêm chặng chạy kiểm thử — hạng mục có lợi ích trên chi phí cao nhất |
| **Thông điệp người dùng viết rải trong từng tầng** | Tập trung một nơi để rà soát được |

### 9.4 Ba bài học tổng quát, ngoài phạm vi nghiệp vụ

> **Một — Khi một dữ liệu gốc có nhiều giá trị dẫn xuất và nhiều đường ghi, phải có một hàm ghi duy nhất.** Hệ thống này làm đúng với điểm (mục 5.6) và được lợi; hệ thống đăng ký học phần làm sai với chỗ trong lớp và hậu quả là một đường ghi bỏ qua mọi kiểm tra an toàn. Cùng một bài học, hai kết cục.
>
> **Hai — Sửa một lỗi là di trú mọi nơi gọi, không phải viết xong bản sửa.** Hạng mục bảo mật "đã sửa" ở mục 8.2 vẫn còn ba điểm cuối chưa được sửa, nhưng dòng tổng kết đọc như đã xong. Khi sửa một lỗi có nhiều nơi cùng hình dạng, **liệt kê mọi nơi và ghi rõ từng nơi đã sửa hay cố ý để lại**.
>
> **Ba — Kiểm thử phải chạy trên hạ tầng giống vận hành ở đúng những điểm quyết định tính đúng đắn.** Với hệ thống tiếng Việt, điểm đó là quy tắc so sánh. Một bộ kiểm thử xanh trên hạ tầng giả không nói gì về nhóm lỗi nghiêm trọng nhất.

---

## 10. Giới hạn của khảo sát này

Tài liệu này được viết từ một lần khảo sát mã nguồn có giới hạn thời gian. Những phần **chưa được đọc**, nêu ra để người đọc không coi tài liệu này là đầy đủ:

| Phần chưa đọc | Hệ quả với tài liệu này |
|---|---|
| **Nội dung tầng chuyển dữ liệu (rất lớn)** | Mục 3 chỉ mô tả hình dạng giao diện xem trước/chuyển, **không mô tả logic đối sánh và gộp dữ liệu bên trong** |
| **Định dạng tệp nhập và xuất Excel** | **Không có mô tả cột nào của các tệp nhập/xuất.** Đây là khoảng trống đáng kể nếu hệ thống mới cần tương thích tệp cũ |
| **Bố cục tài liệu xuất bản Word và PDF** | Không mô tả hình thức bảng điểm xuất ra |
| **Chi tiết cột của 13 mô hình đọc từ CSDL nghiệp vụ của trường** | Biết tên và vai trò, **không biết cột**. Cần đọc lại nếu hệ thống mới phải kết nối cùng nguồn |
| Nội dung công cụ di trú dữ liệu | Chỉ biết sự tồn tại và các tài liệu kèm theo |
| Tài liệu giới thiệu của hệ thống | Không đọc |
| Một tệp quy trình tự động hóa thứ hai | Chỉ đọc quy trình chính |

**Một điểm được xác định là CHƯA GIẢI QUYẾT, không phải chưa đọc:**

> **Phạm vi đọc đơn phúc khảo của Sinh viên là MÂU THUẪN giữa mã nguồn và tài liệu rà soát bảo mật của chính hệ thống.** Mã nguồn và tài liệu rà soát nói khác nhau về việc một sinh viên đọc được những đơn phúc khảo nào. Tài liệu này **không chọn bên nào** — vì cả hai đều là nguồn nội bộ của hệ thống và việc chọn sai sẽ ghi một hành vi không tồn tại thành đặc tả.
>
> Với hệ thống mới, đây là một **quyết định yêu cầu phải chốt tường minh** (đã ghi ở mục 9.2), không phải một chi tiết kỹ thuật cần tra lại.

**Về số liệu:** các con số đếm trong tài liệu (số bảng, số ca kiểm thử, số điểm cuối, số phát hiện bảo mật) là số đếm tại thời điểm khảo sát. Chúng dùng để chỉ **quy mô tương đối**, không phải để kiểm kê chính xác.

**Về các giá trị bí mật:** mọi mật khẩu, khóa ký, bí mật khách và thông tin đăng nhập xuất hiện trong hệ thống được ghi là `[redacted]` trong toàn bộ tài liệu này. Tài liệu nêu **loại bí mật và nơi nó nằm** — vì đó là thông tin cần cho việc thiết kế lại — và **không bao giờ nêu giá trị**.
