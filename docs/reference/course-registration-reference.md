# Tài liệu tham chiếu: Hệ thống Đăng ký học phần (course-registration)

> **Mục đích của tài liệu này.** Đây là bản mô tả **tự chứa** về một hệ thống backend đăng ký học phần đã tồn tại và đang chạy thật tại Khoa CNTT, Trường ĐH Bách khoa — ĐH Đà Nẵng. Tài liệu được viết để người đọc **không cần mở mã nguồn** vẫn nắm được: hệ thống làm gì, lưu dữ liệu ra sao (đến từng cột), phơi ra những API nào, các quy tắc nghiệp vụ nào đang thực sự được thi hành, và những chỗ nào đã từng gây sự cố. Không có đường dẫn nào trỏ vào repo; mọi thông tin cần thiết đã được nêu trực tiếp tại đây.
>
> **Phạm vi.** Đây là tài liệu *mô tả hiện trạng*, không phải đặc tả yêu cầu và không phải hướng dẫn thiết kế. Một số chi tiết được ghi lại chính xác **vì chúng là lỗi** — những phần đó được gắn nhãn rõ ràng và tuyệt đối không được sao chép lại vào hệ thống mới.
>
> **Thời điểm khảo sát:** 01/10/2026.

---

## 1. Tóm tắt điều hành

| Hạng mục | Nội dung |
|---|---|
| Bài toán giải quyết | Đăng ký học phần trực tuyến cho sinh viên, có kiểm tra điều kiện tiên quyết, giới hạn tín chỉ, trùng lịch, sức chứa lớp, và danh sách dự bị (đăng ký chờ) |
| Quy mô thực tế | Khoảng 3.000 lớp học phần trong một học kỳ; đã vận hành qua nhiều học kỳ với các đợt đăng ký cao điểm |
| Kiến trúc | Monolith theo lớp, tách thành 8 project, cộng thêm 2 tiến trình consumer đọc message queue |
| Đặc trưng kỹ thuật nổi bật | Đăng ký **bất đồng bộ**: API trả về `202 PENDING` ngay, việc ghi thật do consumer thực hiện, kết quả đẩy về client qua WebSocket |
| Mức độ hoàn thiện | Chức năng đầy đủ và đã chạy production, nhưng **không có một dòng unit test nào** và có nhiều lỗ hổng phân quyền nghiêm trọng |
| Giá trị tham khảo chính | Mô hình dữ liệu học vụ (chương trình đào tạo, học phần, điều kiện tiên quyết, học phần tương đương) và cơ chế chống bán quá sức chứa |

**Ba điều đáng học nhất từ hệ thống này:**

1. **Đếm lại từ bảng dữ liệu, không tin cột đếm sẵn.** Cột `RegisteredCount` trên bảng lớp học phần bị lệch ở 323/2999 lớp trong một học kỳ. Hệ thống buộc phải đếm lại số dòng thật mỗi lần kiểm tra sức chứa.
2. **Khóa dòng ở mức lớp học phần (`FOR UPDATE`) là đủ** để chống bán quá chỗ, mà vẫn cho các lớp khác chạy song song.
3. **Một migration tạo bảng mới mà quên cấp quyền cho user ứng dụng đã làm sập toàn bộ chức năng đăng nhập** — và vì khối try/catch nuốt lỗi, người dùng chỉ thấy thông báo "sai mật khẩu".

---

## 2. Nền tảng công nghệ

| Thành phần | Phiên bản / lựa chọn |
|---|---|
| Runtime | .NET 8 |
| ORM | Entity Framework Core 8.0.11 |
| CSDL chính | PostgreSQL 16, truy cập qua Npgsql 8.0.11 |
| CSDL phụ (chỉ đọc) | SQL Server (hệ thống học vụ cũ), qua Microsoft.Data.SqlClient 5.2.2 |
| Cache / khóa phân tán | Redis, qua StackExchange.Redis 2.8.37 |
| Message queue | Apache Kafka, qua Confluent.Kafka 2.10.0 |
| Realtime | SignalR (WebSocket) |
| Băm mật khẩu | BCrypt.Net-Next 4.1.0, work factor 11 |
| Đọc/ghi Excel | NPOI 2.7.3 |
| Quy mô mã nguồn | Khoảng 391 file `.cs` |
| Kiểm thử | **Không có project test nào** |

**Hai điểm cấu hình toàn cục cần biết, vì chúng ảnh hưởng mọi thứ:**

- `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` được bật ở **mọi** entry point. Thiếu dòng này, ứng dụng sẽ ném lỗi `Cannot apply binary operation on types 'timestamp with time zone' and 'timestamp without time zone'` ngay khi so sánh thời gian.
- **Thời gian nghiệp vụ được tính bằng `DateTime.Now.AddHours(7)`.** Nghĩa là hệ thống *giả định đồng hồ máy chủ đang ở UTC* và tự cộng 7 giờ để ra giờ Việt Nam. Nếu máy chủ được cấu hình múi giờ địa phương, mọi mốc thời gian đăng ký sẽ lệch 7 giờ. Đây là một quy ước giòn, không nên lặp lại; cách đúng là dùng kiểu thời gian có múi giờ và chuyển đổi ở biên hiển thị.

Thư viện `MathNet.Numerics` được khai báo nhưng không dùng ở đâu. Tài liệu README của hệ thống đã lỗi thời — vẫn ghi CSDL là SQL Server, trong khi thực tế đã chuyển sang PostgreSQL từ lâu.

---

## 3. Phân rã project

| Project | Vai trò |
|---|---|
| Common | Tiện ích dùng chung, nổi bật là lớp trợ giúp đọc/ghi Excel |
| ViewModels | Khoảng 150 lớp DTO cho request/response |
| Data | Định nghĩa thực thể, cấu hình EF Core, 23 migration, file Excel dữ liệu mồi |
| Application | Toàn bộ tầng nghiệp vụ (service) |
| BackendAPI | API cho sinh viên |
| AdminAPI | API cho quản trị và phòng đào tạo, kèm một hub realtime |
| RegistrationConsumer | Tiến trình đọc Kafka, thực hiện việc đăng ký thật, kèm hub realtime riêng |
| LogConsumer | Tiến trình đọc Kafka, ghi nhật ký đăng ký |

Việc tách **BackendAPI** (sinh viên) và **AdminAPI** (quản trị) thành hai tiến trình riêng là một lựa chọn đáng chú ý: hai bên có thời hạn token khác nhau (2 giờ so với 12 giờ) và có thể scale độc lập — trong môi trường mô phỏng production, BackendAPI chạy 3 bản sao còn AdminAPI chỉ 1.

---

## 4. Mô hình dữ liệu — chi tiết đến từng cột

### 4.1 Quy ước hạ tầng áp dụng cho mọi bảng

- **Xóa mềm:** mọi thực thể kế thừa một lớp cơ sở có cột `IsDeleted` kiểu boolean. Không có dòng nào bị xóa thật; mọi truy vấn đều phải lọc `IsDeleted = false`.
- **Gần như không có khóa ngoại.** Trong toàn bộ CSDL chỉ có **2 khóa ngoại thật**: từ bảng chương trình đào tạo tới bảng khoa, và từ bảng khung giờ đợt đăng ký tới bảng đợt đăng ký. Cả hai đều CASCADE. **Mọi quan hệ còn lại chỉ là chuỗi ký tự trùng nhau, không có ràng buộc nào ở tầng CSDL.**

  > **Hệ quả thực tế:** CSDL không thể tự bảo vệ tính toàn vẹn. Có thể tồn tại bản ghi điểm của một học phần không còn trong danh mục, hoặc sinh viên trỏ tới một chương trình đào tạo đã bị xóa. Toàn bộ trách nhiệm toàn vẹn dồn lên tầng ứng dụng. Đây là một đánh đổi **đổi an toàn dữ liệu lấy tốc độ nhập liệu hàng loạt và tự do khi đồng bộ từ hệ thống cũ** — chấp nhận được trong bối cảnh di trú dữ liệu, nhưng là một món nợ thật.

### 4.2 Nhóm bảng tài khoản — mỗi vai trò một bảng riêng

Hệ thống **không có bảng người dùng hợp nhất**. Có 5 bảng tài khoản tách biệt:

| Bảng | Khóa chính | Ghi chú |
|---|---|---|
| Quản trị viên | `MicrosoftId` | Có một tài khoản mồi với cột băm mật khẩu **để trống** |
| Phòng đào tạo | — | Bảng được thêm sau, bằng migration; xem mục 11 về sự cố liên quan |
| Giảng viên | `Id` kiểu varchar(10) | Cột `MicrosoftId` là unique |
| Sinh viên (tài khoản) | Khóa chính tổ hợp `UserId` + `MicrosoftId` | Tách khỏi bảng thông tin sinh viên |
| Người xem (chỉ đọc) | — | Vai trò tra cứu |

> **Đánh giá:** mô hình "mỗi vai trò một bảng" buộc luồng đăng nhập phải **thử lần lượt qua từng bảng** (xem mục 6.3), và khiến việc một người giữ nhiều vai trò trở nên không biểu diễn được. Một hệ thống mới nên dùng một bảng tài khoản và một bảng gán vai trò nhiều-nhiều.

### 4.3 Nhóm bảng cấu trúc đào tạo

**Bảng Khoa**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | varchar(3) | Khóa chính, mã khoa 3 ký tự, ví dụ `013` là Giáo dục thể chất |
| `IsDUT` | boolean | Phân biệt khoa thuộc trường và đơn vị ngoài |

**Bảng Ngành** — thuộc một khoa, liên kết bằng chuỗi mã khoa.

**Bảng Chương trình đào tạo**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | varchar(7) | Khóa chính |
| `Credits` | real | Tổng số tín chỉ của chương trình |
| `ElectiveCredits` | real | Số tín chỉ tự chọn yêu cầu |
| `Semesters` | int | Số học kỳ thiết kế |
| `EducationLevel` | varchar(4) | Bậc đào tạo |
| `FacultyId` | varchar(3) | **Khóa ngoại thật** tới bảng Khoa, CASCADE |

> Lưu ý: số tín chỉ dùng kiểu `real` (số thực) chứ không phải số nguyên hay decimal, vì học phần có thể mang giá trị như 1.5 tín chỉ. Dùng `real` (dấu phẩy động 4 byte) cho dữ liệu sẽ bị **cộng dồn và so sánh với ngưỡng** là một lựa chọn rủi ro — sai số dấu phẩy động có thể làm phép so sánh "tổng tín chỉ ≤ giới hạn" cho kết quả sai ở biên. Hệ thống mới nên dùng `decimal`.

**Bảng Lớp sinh hoạt**

| Cột | Ghi chú |
|---|---|
| `ScheduleGroup` | **Nhiều nhóm trong một ô, phân cách bằng dấu `;`**. Khi dùng phải tách chuỗi và trim |
| `EnrollmentYear` | Khóa tuyển sinh, dùng để xác định phạm vi đợt đăng ký |

> `ScheduleGroup` là ví dụ điển hình của việc **nhồi danh sách vào một ô văn bản**. Nó khiến mọi truy vấn lọc theo nhóm phải xử lý chuỗi, không thể dùng index, và không thể ràng buộc giá trị hợp lệ. Hệ thống mới nên tách thành bảng quan hệ.

**Bảng Sinh viên**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | varchar(10) | Khóa chính, mã sinh viên |
| `StudentCardNumber` | — | **UNIQUE** |
| `MaxCreditsAllowed` | real | Mặc định 30 |
| `AcademicProgramId` | — | Chương trình đào tạo của sinh viên. **Tên cột này là `AcademicProgramId`, không phải `ProgramId`** — một nhầm lẫn đã từng gây lỗi |
| `IsHighQuality` | boolean | Chương trình chất lượng cao |
| `IsWebsiteLocked` | boolean | Bị khóa truy cập |
| `IsSuspended` | boolean | Bị đình chỉ |
| `IsOverdue` | boolean | Nợ học phí / quá hạn |
| `IsProfileComplete` | boolean | Đã hoàn thiện hồ sơ |

**Cấu trúc mã sinh viên — một quy ước ngầm quan trọng:**

| Vị trí ký tự | Ý nghĩa |
|---|---|
| 0–2 (3 ký tự đầu) | Mã khoa |
| 3–4 (2 ký tự tiếp) | Khóa tuyển sinh |

Hệ thống **giải mã mã sinh viên để xác định quyền đăng ký** theo khoa và theo khóa. Đây là một phụ thuộc ngầm vào định dạng mã: nếu quy ước đánh mã thay đổi, logic phân quyền đợt đăng ký sẽ sai mà không báo lỗi. Tệ hơn, có chỗ trong mã nguồn cắt `Substring(0, 9)` trên mã sinh viên trong khi cột khai báo là varchar(10) — một mã 10 ký tự sẽ bị cắt mất ký tự cuối.

**Bảng Giới hạn tín chỉ theo năm học** — ràng buộc UNIQUE trên cặp (mã sinh viên, mã năm học), cho phép đặt giới hạn riêng cho từng sinh viên từng năm, ghi đè giá trị mặc định.

**Bảng Học phần**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Credits` | real | Tổng tín chỉ |
| `TheoryCredits` | real | Tín chỉ lý thuyết |
| `PracticeCredits` | real | Tín chỉ thực hành |
| `ProjectCredits` | real | Tín chỉ đồ án |
| `AssignmentCredits` | real | Tín chỉ bài tập lớn |
| `InternshipCredits` | real | Tín chỉ thực tập |

**Bảng Học phần trong chương trình** (bảng nối giữa chương trình và học phần — **không có khóa ngoại nào**)

| Cột | Ghi chú |
|---|---|
| `Order` | Thứ tự hiển thị trong khung chương trình |
| `Semester` | Học kỳ dự kiến học |
| `IsElectiveCourse` | Là học phần tự chọn |
| `IsPreProjectRequired` | Yêu cầu học phần tiền đồ án |
| `IsProjectPrerequisite` | Là điều kiện tiên quyết của đồ án |

### 4.4 Nhóm bảng điều kiện và tương đương

**Bảng Loại điều kiện** — chứa 4 dòng dữ liệu mồi, mã 1 đến 4. Ý nghĩa thực thi của từng loại xem mục 7.3; **đây là chỗ dễ hiểu sai nhất của toàn hệ thống.**

**Bảng Điều kiện học phần** — mỗi dòng nói "học phần A yêu cầu học phần B theo loại điều kiện N".

**Bảng Học phần tương đương** — mỗi dòng nói "học phần A tương đương học phần B". Quan hệ này được xử lý bằng thuật toán **hợp-tìm (union-find)**; xem mục 7.4. Một lần nhập dữ liệu thực tế: 10.551 bộ ba dữ liệu nguồn cho ra 10.550 dòng.

**Bảng Miễn học phần** — ghi nhận sinh viên được miễn một học phần. **Dữ liệu miễn được hợp nhất với bảng điểm khi kiểm tra điều kiện tiên quyết** (mục 7.6), nên về mặt kiểm tra điều kiện, "được miễn" tương đương "đã học qua".

**Bảng Điểm sinh viên** — chứa điểm số và điểm chữ theo từng học phần, từng học kỳ, từng lớp học phần.

### 4.5 Nhóm bảng lớp học phần và đăng ký

**Bảng Lớp học phần**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `Id` | varchar(16) | Khóa chính. **Ký tự thứ 8–11 (vị trí 7, dài 4) là mã học kỳ** — hệ thống cắt chuỗi này để suy ra học kỳ |
| `Capacity` | int | Sức chứa chính thức |
| `RegisteredCount` | int | Số đã đăng ký — **cột này bị lệch trong thực tế, không được tin** |
| `ReservedCapacity` | int | Sức chứa danh sách dự bị |
| `ReservedCount` | int | Số đang chờ trong danh sách dự bị |
| `Schedule` | varchar(128) | Lịch học, định dạng ở mục 7.1 |
| `StudyWeeks` | — | Các tuần học, ví dụ `"12-18;20-27"` |
| `AcademicYearCode` | — | Mã học kỳ |

> **Mã học kỳ mã hóa cả loại học kỳ.** Mã kết thúc bằng ký tự `0` nghĩa là học kỳ chính; mọi giá trị khác là học kỳ phụ (hè). Quy tắc này quyết định giới hạn tín chỉ (mục 7.7). Lại là một quy ước ngầm nhúng trong chuỗi, không có cột riêng diễn đạt nó.

**Bảng Sinh viên trong lớp học phần** — đây là bảng ghi nhận đăng ký thật.

| Cột | Ghi chú |
|---|---|
| (khóa chính tổ hợp) | Mã sinh viên + mã lớp học phần |
| `IsReserved` | `false` = đăng ký chính thức; `true` = đang ở danh sách dự bị |
| `IsConfirmed` | Chỉ có nghĩa với dòng dự bị: `null` = chờ xét, `true` = được duyệt, `false` = bị từ chối |
| `AcademicYearCode` | Mã học kỳ, sao chép từ lớp học phần khi tạo |
| `Notes` | Ghi chú của quản trị khi duyệt/từ chối |

**Định nghĩa chính xác "một sinh viên đã đăng ký lớp này":**

```
IsDeleted = false  AND  (IsReserved = false  OR  IsConfirmed = true)
```

Ba cột boolean phối hợp để biểu diễn một máy trạng thái bốn trạng thái (chính thức / chờ xét / đã duyệt / bị từ chối). Nó hoạt động, nhưng **mọi truy vấn đều phải nhớ đúng biểu thức trên** — bỏ sót một nhánh là ra số sai. Một cột enum trạng thái duy nhất sẽ rõ ràng hơn nhiều.

**Các bảng còn lại**

| Bảng | Nội dung |
|---|---|
| Nhu cầu đăng ký học phần | Khảo sát nhu cầu trước khi mở lớp |
| Nhật ký đăng ký | Lịch sử mọi thao tác đăng ký của sinh viên |
| Nhật ký hành động quản trị | Lịch sử thao tác của quản trị viên |
| Cấu hình đăng ký | Bảng khóa-giá trị cho cấu hình toàn hệ thống (mục 8) |
| Học kỳ | Danh mục học kỳ |
| Đợt đăng ký | Các đợt mở đăng ký, có loại và khung thời gian |
| Khung giờ đợt đăng ký | Khung giờ chi tiết theo khoa/khóa trong một đợt. **Khóa ngoại thật** tới Đợt đăng ký, CASCADE |
| Phòng học | Danh mục phòng và sức chứa phòng |

### 4.6 Các kiểu liệt kê (enum)

**Loại đợt đăng ký**

| Giá trị | Mã | Ý nghĩa |
|---|---|---|
| Group | 1 | Theo nhóm lớp sinh hoạt |
| Cohort | 2 | Theo khóa tuyển sinh |
| Global | 3 | Mở cho tất cả |
| Adjustment | 4 | Đợt điều chỉnh |
| Withdrawal | 5 | Đợt rút học phần |
| CrossCohort | 6 | Liên khóa |
| Supplementary | 7 | Bổ sung |
| DemandSurvey | 8 | Khảo sát nhu cầu |

**Phạm vi đợt đăng ký:** Group = 0, Cohort = 1, Global = 2.

**Hành động đăng ký:** Register = 0, Unregister = 1, Reserve = 2, CancelReservation = 3.

> **Cảnh báo cho người đọc:** hai enum trên đều nói về "phạm vi" nhưng **đánh số lệch nhau** — Group là 1 trong enum thứ nhất và 0 trong enum thứ hai. Đây là bẫy chờ sẵn cho bất kỳ ai gán số thô giữa hai enum. Khi thiết kế lại, dùng một enum duy nhất hoặc đặt giá trị số trùng nhau.

---

## 5. Bề mặt API

Hệ thống phơi ra hai nhóm API riêng biệt trên hai tiến trình khác nhau.

### 5.1 API cho sinh viên

| Nhóm | Chức năng |
|---|---|
| Tài khoản | Đăng nhập, đổi mật khẩu, đăng nhập qua SSO của trường |
| Hồ sơ sinh viên | Xem thông tin cá nhân, chương trình đào tạo, lớp sinh hoạt |
| Khung chương trình | Xem danh sách học phần theo chương trình, kèm trạng thái đã học / đang học / chưa đủ điều kiện |
| Bảng điểm | Xem điểm theo học kỳ, kể cả các học phần được miễn |
| Tra cứu lớp học phần | Danh sách lớp mở trong học kỳ, có phân trang và lọc |
| Đăng ký | Đăng ký, hủy đăng ký, đăng ký dự bị, hủy dự bị |
| Tra trạng thái | Hỏi kết quả của một yêu cầu đăng ký bất đồng bộ |
| Đợt đăng ký | Xem các đợt của học kỳ hiện tại kèm trạng thái riêng của mình |
| Khảo sát nhu cầu | Khai báo nhu cầu học phần |

### 5.2 API cho quản trị

Khoảng 18 nhóm controller, bao gồm: quản lý khoa, ngành, chương trình đào tạo, lớp sinh hoạt, học phần, học phần trong chương trình, điều kiện tiên quyết, học phần tương đương, miễn học phần, sinh viên, giảng viên, phòng đào tạo, người xem, lớp học phần, học kỳ, đợt đăng ký và khung giờ, cấu hình hệ thống, duyệt danh sách dự bị, nhật ký, nhập liệu từ Excel, và đồng bộ từ hệ thống học vụ cũ.

### 5.3 Giao thức đăng ký bất đồng bộ — điểm thiết kế cốt lõi

Đây là phần đáng tham khảo nhất về mặt kiến trúc:

| Bước | Diễn biến |
|---|---|
| 1 | Sinh viên gọi API đăng ký |
| 2 | API kiểm tra sơ bộ, đẩy một message vào Kafka, rồi **trả về ngay `202` với trạng thái `PENDING`** |
| 3 | Nếu sinh viên đã có một yêu cầu đang chờ cho cùng lớp, API trả `409 DUPLICATE` |
| 4 | Nếu vượt ngưỡng tần suất, API trả `429` kèm header `Retry-After: 30` |
| 5 | Consumer đọc message, thực hiện toàn bộ kiểm tra nghiệp vụ và ghi CSDL trong một giao dịch có khóa dòng |
| 6 | Consumer đẩy kết quả về client qua WebSocket, tới nhóm riêng của sinh viên đó |
| 7 | Song song, client có thể chủ động hỏi trạng thái qua API tra cứu |

**Chi tiết hàng đợi:** topic `order-registration`, 12 partition, 6 consumer song song. **Khóa message là mã sinh viên** — điều này đảm bảo mọi yêu cầu của cùng một sinh viên rơi vào cùng một partition và **được xử lý đúng thứ tự**, trong khi các sinh viên khác nhau vẫn chạy song song. Đây là cách dùng partition key rất đúng mực.

> **Khiếm khuyết nghiêm trọng của luồng này:** khi consumer gặp lỗi khi xử lý một message, **message bị bỏ qua, không thử lại, không có hàng đợi chết (dead-letter queue)**. Một lỗi tạm thời của CSDL sẽ làm yêu cầu đăng ký của sinh viên biến mất im lặng — sinh viên thấy trạng thái treo ở `PENDING` cho tới khi hết hạn cache. Bất kỳ hệ thống mới nào theo mô hình này **bắt buộc** phải có cơ chế thử lại và một nơi chứa message thất bại.

---

## 6. Xác thực và phân quyền

### 6.1 Cơ chế token

| Hạng mục | Giá trị |
|---|---|
| Loại | JWT, thuật toán ký HS256 (khóa đối xứng) |
| Khóa ký | `[redacted]` — **được lưu trong file cấu hình nằm trong mã nguồn** |
| Thời hạn, phía sinh viên | 2 giờ |
| Thời hạn, phía quản trị | 12 giờ |
| Kiểm tra issuer | **Tắt** |
| Kiểm tra audience | **Tắt** |

> Issuer và audience *có* được khai báo trong cấu hình nhưng **không được kiểm tra**. Nghĩa là một token do bất kỳ hệ thống nào khác dùng cùng khóa ký tạo ra đều được chấp nhận. Kết hợp với việc khóa ký nằm trong mã nguồn, đây là lỗ hổng nghiêm trọng.

### 6.2 Chỉ một phiên đăng nhập

Mỗi lần đăng nhập ghi token hiện hành vào Redis dưới khóa dạng `ActiveToken:{vai trò}:{mã người dùng}`. Mọi request sau đó so token trong header với giá trị trong Redis; không khớp thì bị từ chối. Kết quả: **đăng nhập ở máy thứ hai sẽ đẩy máy thứ nhất ra**. Đây là một mẫu thiết kế hữu ích, đáng tham khảo nếu nghiệp vụ cần chống chia sẻ tài khoản.

### 6.3 Thứ tự thử đăng nhập — và cái bẫy bên trong

Vì mỗi vai trò một bảng, hàm đăng nhập **thử lần lượt** theo thứ tự: Quản trị viên → Phòng đào tạo → Giảng viên → Sinh viên → Người xem.

> **BẪY ĐÃ GÂY SỰ CỐ THẬT:** toàn bộ chuỗi thử này nằm **trong một khối try/catch duy nhất nuốt mọi lỗi CSDL**. Khi một bảng tài khoản không truy vấn được, hàm không báo lỗi hệ thống mà rơi xuống nhánh "không tìm thấy tài khoản" và trả về **"sai mật khẩu"**. Xem mục 11 để biết hậu quả thực tế.
>
> **Bài học tổng quát:** không bao giờ bắt lỗi rộng quanh một chuỗi truy vấn rồi quy mọi thất bại về một nguyên nhân nghiệp vụ. Lỗi hạ tầng phải nổi lên như lỗi hạ tầng. Một ngoại lệ phân quyền CSDL bị hiểu thành "sai mật khẩu" đã khiến việc chẩn đoán sự cố mất nhiều thời gian hơn hẳn mức cần thiết.

### 6.4 Chính sách trạng thái sinh viên

Có 4 chính sách đơn lẻ và 1 chính sách tổng hợp:

| Chính sách | Yêu cầu |
|---|---|
| Không bị khóa website | `IsWebsiteLocked = false` |
| Không bị đình chỉ | `IsSuspended = false` |
| Không quá hạn | `IsOverdue = false` |
| Đã hoàn thiện hồ sơ | `IsProfileComplete = true` |
| **Sinh viên hợp lệ** | Cả 4 điều kiện trên |

> **Lỗ hổng:** các API **đăng ký / hủy đăng ký / đăng ký dự bị chỉ yêu cầu "đã đăng nhập", KHÔNG áp dụng chính sách "Sinh viên hợp lệ"**. Nghĩa là sinh viên đang bị đình chỉ, bị khóa website, hoặc nợ học phí **vẫn đăng ký được học phần**. Toàn bộ 4 cột trạng thái trên trở thành trang trí ở đúng chỗ chúng cần có hiệu lực nhất.

### 6.5 Mật khẩu

- Băm bằng BCrypt, work factor 11 — đây là phần làm đúng.
- **Mật khẩu mặc định khi reset là đoán được**, theo công thức tiền tố vai trò ghép với mã người dùng. Biết mã sinh viên là biết mật khẩu mặc định.
- SSO của trường: khi thiếu cấu hình khóa, mã nguồn **dùng một chuỗi hằng dự phòng** làm khóa ký thay vì từ chối khởi động. Một hệ thống thiếu cấu hình phải **dừng lại**, không được tự hạ xuống một khóa ai cũng biết.

### 6.6 Những lỗ hổng phân quyền cụ thể — KHÔNG ĐƯỢC SAO CHÉP

> **Toàn bộ mục này là danh sách lỗi.** Nó được ghi lại để người thiết kế hệ thống mới biết chính xác những gì phải tránh, và để người tiếp quản hệ thống cũ biết chỗ cần vá trước.

| Lỗ hổng | Mức độ |
|---|---|
| API reset mật khẩu của một người dùng bất kỳ **không có yêu cầu đăng nhập nào** (trong mã có ghi chú "//Test" cho thấy nó là mã thử nghiệm bị để lại), và **trả về mật khẩu mới trong response** | Nghiêm trọng |
| API reset mật khẩu **toàn bộ giảng viên** được đánh dấu cho phép truy cập vô danh | Nghiêm trọng |
| Các nhóm API quản lý lớp sinh hoạt, khoa, giảng viên, ngành, học kỳ, chương trình đào tạo (**bao gồm cả API tải lên file**), đợt đăng ký, và cấu hình hệ thống **không có kiểm tra đăng nhập** | Nghiêm trọng |
| API đăng ký không áp chính sách trạng thái sinh viên (mục 6.4) | Cao |
| Tiến trình consumer cấu hình CORS mở hoàn toàn | Trung bình |

**Mẫu lỗi chung đứng sau danh sách này:** phân quyền được gắn **từng endpoint một bằng thuộc tính**, nên bỏ sót là mặc định an toàn bị tắt. Cách đúng là **chặn mặc định toàn bộ** rồi mở từng chỗ có chủ đích — khi đó bỏ sót dẫn tới "không truy cập được", một lỗi lộ ra ngay, thay vì "ai cũng truy cập được", một lỗi không ai thấy.

---

## 7. Quy tắc nghiệp vụ đang thực sự được thi hành

Đây là phần có giá trị tham khảo nghiệp vụ cao nhất của tài liệu.

### 7.1 Biểu diễn lịch học và phát hiện trùng lịch

**Định dạng chuỗi lịch:** đúng **7 đoạn** phân cách bằng `;`, mỗi đoạn ứng với một ngày trong tuần, nội dung `tiết_bắt_đầu-tiết_kết_thúc,phòng` (phần phòng có thể thiếu). Đoạn rỗng hoặc không phân tích được cho ra `(-1, -1)`, nghĩa là ngày đó không có tiết.

**Tuần học:** chuỗi dạng `"12-18;20-27"`, phân tích thành tập số tuần. Một số đơn lẻ cũng hợp lệ.

**Thuật toán so trùng giữa hai lớp:**

| Thứ tự | Điều kiện | Kết luận |
|---|---|---|
| 1 | Hai tập tuần học **không giao nhau** | Không trùng |
| 2 | Một trong hai bên **không có đúng 7 ngày** | Không trùng *(xem cảnh báo bên dưới)* |
| 3 | Có một ngày mà cả hai đều có tiết và hai khoảng tiết giao nhau | **Trùng** |

> **BẪY:** điều kiện 2 làm việc kiểm tra trùng lịch **bị bỏ qua trong im lặng** khi dữ liệu lịch không đúng định dạng 7 đoạn. Một lớp có chuỗi lịch sai định dạng sẽ **không bao giờ bị báo trùng với bất kỳ lớp nào** — sinh viên đăng ký được hai lớp học cùng giờ mà hệ thống không phản đối. Dữ liệu xấu cần **báo lỗi**, không được âm thầm vô hiệu hóa một quy tắc an toàn.
>
> Ngoài ra hàm phân tích tuần học dùng chuyển đổi số **ném ngoại lệ** khi gặp dữ liệu sai, nên cùng một loại dữ liệu xấu gây hai hành vi trái ngược nhau ở hai hàm cạnh nhau.
>
> **Hai lỗi đã từng xảy ra ở chính hàm này** (đã sửa, ghi lại để người đọc nhận ra mẫu lỗi): hàm từng thêm phần tử `(-1,-1)` hai lần, làm danh sách có 8 ngày thay vì 7 — và theo đúng điều kiện 2 ở trên, điều đó **vô hiệu hóa toàn bộ việc kiểm tra trùng lịch mà không báo gì**. Hàm cũng từng trả về ngay tại ngày trùng đầu tiên, bỏ sót các ngày trùng phía sau.

### 7.2 Chuỗi 9 bước kiểm tra trước khi cho đăng ký

Thực hiện **theo đúng thứ tự** này:

| Bước | Kiểm tra |
|---|---|
| 1 | Lớp học phần thuộc đúng học kỳ hiện hành |
| 2 | **Miễn trừ Giáo dục thể chất:** nếu học phần thuộc khoa mã `013`, nhiều bước sau được bỏ qua |
| 3 | Học phần có trong chương trình đào tạo của sinh viên, hoặc là học phần tương đương với một học phần trong đó |
| 4 | Phạm vi đợt đăng ký cho phép (xem bảng dưới) |
| 5 | Quy tắc nhất quán tiền tố nhóm, áp dụng riêng cho đợt theo nhóm |
| 6 | Không đăng ký trùng học phần — so theo **lớp tương đương chuẩn hóa**, không so theo mã học phần thô |
| 7 | Điều kiện tiên quyết (**bỏ qua hoàn toàn với Giáo dục thể chất**) |
| 8 | Giới hạn tín chỉ |
| 9 | Không trùng lịch với các lớp đã đăng ký |

**Phạm vi đợt đăng ký ở bước 4:**

| Loại phạm vi | Điều kiện khớp |
|---|---|
| Theo nhóm | 2 ký tự đầu của nhóm lớp sinh hoạt **và** khóa tuyển sinh phải khớp |
| Theo khóa | Chỉ khóa tuyển sinh phải khớp |
| Toàn trường | Không ràng buộc |

> **Về bước 6 — đây là chi tiết quan trọng nhất của toàn bộ chuỗi.** Chống đăng ký trùng **không** so sánh mã học phần; nó so sánh **đại diện chuẩn hóa của nhóm học phần tương đương**. Nếu học phần A và A' là tương đương, sinh viên đã đăng ký A thì không đăng ký được A'. Nếu so theo mã thô, sinh viên sẽ học và trả tiền hai lần cho cùng một nội dung. Xem mục 7.4 về cách tính đại diện này.

### 7.3 Ngữ nghĩa 4 loại điều kiện — chỗ dễ hiểu sai nhất

| Loại | Tên thường gọi | Điều kiện thực tế được thi hành |
|---|---|---|
| 1 | Học trước | **Chỉ cần tồn tại một bản ghi điểm** cho học phần đó — **kể cả điểm F**. Nghĩa là học và trượt vẫn thỏa |
| 2 | Tiên quyết | Tồn tại bản ghi điểm với điểm chữ **khác `F` và khác `I`** (tức đã qua) |
| 3 | Song hành | Đang đăng ký cùng kỳ **hoặc** đã học qua |
| 4 | — | **Luôn trả về đúng — không được thi hành gì cả.** Mọi giá trị loại không nằm trong 1–3 cũng vậy |

> **Ba điều phải nhớ:**
>
> 1. **Loại 4 có trong dữ liệu mồi nhưng không có hiệu lực nào.** Bất kỳ điều kiện nào được gắn loại 4 đều là điều kiện *bị bỏ qua*. Nếu người nhập dữ liệu tin rằng nó có tác dụng, họ đang nhập một ràng buộc không tồn tại.
> 2. **Loại 1 coi điểm F là đã thỏa.** Đây có thể là chủ ý (đã học qua một lần là đủ) nhưng cái tên "học trước" không nói lên điều đó, và không có ghi chú nào trong mã xác nhận đây là chủ ý.
> 3. **Loại 2 được kiểm tra KHÔNG NHẤT QUÁN giữa hai hướng.** Khi *đăng ký*, loại 2 loại trừ cả `F` và `I`. Khi *hủy đăng ký* (kiểm tra ảnh hưởng ngược), cùng loại 2 chỉ loại trừ `F`, **không loại trừ `I`**. Cùng một điều kiện cho hai câu trả lời khác nhau tùy theo hướng thao tác. Đây là lỗi thật, chưa sửa.

### 7.4 Thuật toán hợp-tìm cho học phần tương đương

Quan hệ tương đương giữa các học phần được gom thành các **nhóm liên thông** bằng thuật toán hợp-tìm có nén đường đi. Mỗi nhóm có một **đại diện duy nhất**, và mọi phép so sánh "đã học môn này chưa" đều thực hiện trên đại diện thay vì mã gốc.

**Chi tiết then chốt:** khi hợp hai nhóm, đại diện được chọn là **mã nhỏ hơn theo so sánh chuỗi thứ tự byte (ordinal)**, không phải theo thứ tự xuất hiện trong dữ liệu.

> **Vì sao chi tiết này quan trọng — một lỗi thật đã xảy ra.** Phiên bản trước dùng một bản đồ ánh xạ đơn giản, nên đại diện của nhóm **phụ thuộc thứ tự dòng trả về từ CSDL**. Một cặp học phần tương đương bị ánh xạ ghi đè lẫn nhau tùy thứ tự dòng, khiến hệ thống báo sai rằng sinh viên **chưa đạt điều kiện tiên quyết** dù họ đã học học phần tương đương. Chuyển sang hợp-tìm với tiêu chí chọn đại diện **tất định** đã sửa lỗi này.
>
> **Bài học tổng quát:** bất cứ khi nào kết quả logic phụ thuộc vào thứ tự dòng do CSDL trả về mà không có `ORDER BY`, đó là một lỗi đang chờ xảy ra. Phép hợp nhất nhóm phải có một quy tắc chọn đại diện tất định.

### 7.5 Nhóm học phần tự chọn

Các điều kiện được gom nhóm theo cặp (loại điều kiện, có phải tự chọn hay không):

| Loại nhóm | Điều kiện thỏa |
|---|---|
| Nhóm tự chọn | **Ít nhất một** học phần trong nhóm thỏa |
| Nhóm bắt buộc | **Toàn bộ** học phần trong nhóm phải thỏa |

Cờ "có phải tự chọn" được suy ra bằng phép nối trái với bảng học phần trong chương trình. **Hệ quả của phép nối trái: một học phần điều kiện mà không có trong khung chương trình sẽ được coi là bắt buộc.** Dữ liệu thiếu vì thế làm điều kiện *nghiêm ngặt hơn* ý định — hướng sai an toàn hơn chiều ngược lại, nhưng vẫn là sai.

Kết quả tính toán được cache 30 phút theo mã chương trình đào tạo.

### 7.6 Hợp nhất điểm và miễn học phần

Khi kiểm tra điều kiện tiên quyết, hệ thống dùng một danh sách **hợp của bảng điểm và bảng miễn học phần**. Bản ghi miễn được đưa vào danh sách như một bản ghi điểm (với mã lớp học phần để rỗng).

**Hai hệ quả:**
- Học phần được miễn thỏa điều kiện tiên quyết **như đã học qua** — đây là chủ ý và đúng nghiệp vụ.
- Vì loại 1 chỉ cần "tồn tại bản ghi", **một bản ghi miễn mang điểm trượt vẫn thỏa điều kiện loại 1**.

### 7.7 Giới hạn tín chỉ

| Quy tắc | Giá trị |
|---|---|
| Mặc định | 30 tín chỉ |
| Ghi đè theo từng sinh viên từng năm học | Lấy từ bảng giới hạn tín chỉ riêng |
| Học kỳ phụ (mã học kỳ **không** kết thúc bằng `0`) | 10 tín chỉ |

> **Hai lỗi trong phép tính tổng tín chỉ:**
> 1. Tổng tín chỉ cộng **cả các lớp đang ở danh sách dự bị**, dù chúng chưa chắc được duyệt. Sinh viên bị chặn bởi tín chỉ họ chưa thực sự có.
> 2. Tổng tín chỉ **không lọc theo học kỳ**. Tín chỉ của các học kỳ trước vẫn được cộng vào. Càng học nhiều kỳ, giới hạn càng siết lại — rõ ràng không phải ý định thiết kế.
>
> Ngoài ra có một cột `IsCreditLoadRestricted` trên dữ liệu **không được đọc ở bất kỳ đâu** trong mã.

### 7.8 Kiểm tra phụ thuộc ngược khi hủy đăng ký

Khi sinh viên hủy một lớp, hệ thống phải xác định việc hủy đó có làm vỡ điều kiện của các lớp khác đang đăng ký. Cách làm: **tính lại toàn bộ điều kiện với học phần bị hủy được loại khỏi danh sách**, rồi xem lớp nào trở thành không thỏa.

Đồ thị phụ thuộc ngược **chỉ bao gồm điều kiện loại 3 (song hành)**. Và như đã nêu ở 7.3, kiểm tra loại 2 ở hướng này **không nhất quán** với hướng đăng ký.

### 7.9 Các ngoại lệ gán cứng trong mã

| Hằng số gán cứng | Hiệu lực |
|---|---|
| Khoa mã `013` (Giáo dục thể chất) | Bỏ qua toàn bộ kiểm tra điều kiện tiên quyết. Ở các đợt không theo nhóm, bỏ qua luôn cả lọc theo chương trình và theo phạm vi. Không áp quy tắc tiền tố nhóm |
| Học phần mã `1021263` | Điều kiện song hành của học phần này **buộc phải đăng ký cùng kỳ** — đã học qua là không đủ |
| Giới hạn tín chỉ học kỳ phụ | 10 |
| Mã học kỳ hiện hành mặc định | Một giá trị cố định trong cấu hình |

> **Đây là một mẫu nợ kỹ thuật cần nhận diện.** Bốn ngoại lệ nghiệp vụ được nhúng thành hằng số trong mã logic. Khi mã khoa Giáo dục thể chất thay đổi, hoặc khi một học phần khác cần quy tắc giống `1021263`, phải sửa mã và triển khai lại. Một hệ thống mới nên biểu diễn các ngoại lệ này thành **cột cấu hình trên dữ liệu** — ví dụ cột "miễn kiểm tra tiên quyết" trên bảng khoa, cột "buộc song hành" trên bảng điều kiện — để người vận hành tự điều chỉnh được.

---

## 8. Chống bán quá sức chứa — phần làm tốt nhất của hệ thống

Đây là phần đáng sao chép nguyên vẹn về mặt ý tưởng.

### 8.1 Cơ chế khóa

Mọi thao tác đăng ký, hủy, dự bị và hủy dự bị đều thực hiện trong một **giao dịch CSDL** bắt đầu bằng việc **khóa dòng của lớp học phần**:

```sql
SELECT * FROM "CourseSections" WHERE "Id" = {mã lớp} FOR UPDATE
```

**Hệ quả:** các yêu cầu vào **cùng một lớp** bị xếp hàng tuần tự; các yêu cầu vào **các lớp khác nhau** chạy song song hoàn toàn. Đây là mức hạt khóa đúng: nhỏ nhất đủ để đảm bảo đúng đắn, không chặn nhau quá mức.

### 8.2 Trình tự bên trong giao dịch đăng ký

| Bước | Hành động |
|---|---|
| 1 | Khóa dòng lớp học phần |
| 2 | Nếu đã tồn tại dòng đăng ký của sinh viên này cho lớp này → báo lỗi "đã đăng ký" |
| 3 | **Đếm lại số dòng** đăng ký chính thức (`IsReserved = false`) từ bảng dữ liệu |
| 4 | Nếu số đếm ≥ sức chứa → báo lỗi "lớp đã đầy" |
| 5 | Chèn dòng đăng ký mới |
| 6 | Lưu, **đếm lại lần nữa**, ghi kết quả vào cột số lượng |
| 7 | Kết thúc giao dịch |

Luồng dự bị giống hệt, chỉ đổi sang đếm các dòng `IsReserved = true` so với sức chứa dự bị.

### 8.3 Nguyên tắc quan trọng nhất: cột đếm không phải nguồn sự thật

> **Nguồn sự thật là số dòng trong bảng đăng ký. Cột `RegisteredCount` chỉ là giá trị dẫn xuất và nó CÓ BỊ LỆCH.**
>
> **Bằng chứng từ vận hành thật:** trong một học kỳ, **323 trên 2.999 lớp học phần có cột đếm bị lệch**, trong đó chỉ 131 lớp là thật sự đầy. Nghĩa là nếu tin vào cột đếm, hệ thống sẽ từ chối sinh viên ở gần 200 lớp còn chỗ trống.
>
> Chính vì vậy bước 3 ở trên **đếm lại từ bảng** chứ không đọc cột. Số đếm trong Redis cũng chỉ được dùng làm **bộ lọc sơ bộ rẻ tiền** ở tầng API, không bao giờ dùng để quyết định.
>
> **Bài học tổng quát:** bất kỳ cột tổng hợp nào được duy trì bằng tay (biến đếm, tổng tiền, số lượng tồn) đều sẽ lệch — vì luôn có một đường ghi nào đó quên cập nhật nó. Hãy coi nó là cache, luôn có cách tính lại, và đừng để quyết định đúng/sai phụ thuộc vào nó.

### 8.4 Những đường ghi bỏ qua cơ chế an toàn

> **Phần này là lỗi, ghi lại để biết chỗ phải vá.**

| Đường ghi | Vấn đề |
|---|---|
| Đăng ký hàng loạt (quản trị) | **Không khóa dòng, không kiểm tra sức chứa.** Chỉ chèn dòng rồi cộng dồn thẳng vào cột đếm bằng phép `+ n` |
| Duyệt danh sách dự bị hàng loạt | **Không khóa dòng, không kiểm tra sức chứa.** Có thể duyệt vượt sức chứa lớp |

**Mẫu lỗi:** khi một hệ thống có cả đường ghi "một bản ghi" và đường ghi "hàng loạt", **mọi bất biến phải được thi hành ở cả hai**. Trên thực tế đường hàng loạt luôn được viết sau, dưới áp lực thời gian, và bỏ qua các kiểm tra. Cách phòng là đặt bất biến ở chỗ cả hai đều phải đi qua — ràng buộc CSDL, hoặc một hàm ghi duy nhất.

### 8.5 Các cờ được lưu nhưng không được thi hành

Bốn cờ sau **được lưu trong CSDL và trả về cho giao diện, nhưng tầng server KHÔNG kiểm tra chúng**: đã đóng đăng ký, đã vô hiệu hóa đăng ký, cho phép chương trình khác, mở cho ngành khác. Thêm vào đó, luồng dự bị bỏ qua cờ cho phép dự bị.

> Nghĩa là **toàn bộ việc thi hành bốn quy tắc này nằm ở giao diện người dùng**. Ai gọi API trực tiếp đều bỏ qua được. Đây là mẫu lỗi "kiểm tra ở client" kinh điển: giao diện là trợ giúp trải nghiệm, không bao giờ là biên an toàn.

---

## 9. Máy trạng thái đợt đăng ký

### 9.1 Cách xác định đợt đang có hiệu lực

| Thứ tự ưu tiên | Nguồn |
|---|---|
| 1 | Giá trị ghi đè thủ công trong cấu hình (nếu phân tích được thành một loại đợt hợp lệ) |
| 2 | Đợt của học kỳ hiện hành có khung thời gian chứa thời điểm hiện tại, ưu tiên đợt có thời điểm bắt đầu muộn nhất |
| 3 | Không có đợt nào đang mở → mặc định phạm vi toàn trường |

Kết quả được cache 1 phút.

**Quy đổi loại đợt sang phạm vi:** đợt theo nhóm → phạm vi nhóm; đợt theo khóa → phạm vi khóa; **mọi loại còn lại (toàn trường, điều chỉnh, rút, liên khóa, bổ sung...) → phạm vi toàn trường**.

> Cần chú ý: bước 1 là một **giá trị ghi đè thủ công có quyền cao hơn cả thời gian thực**. Nếu người vận hành đặt giá trị này rồi quên xóa, các khung thời gian đợt trong CSDL trở nên vô nghĩa. Và vì khóa cấu hình này **không có thời hạn hết hạn** (xem 10.2), nó sẽ tồn tại vô thời hạn.

### 9.2 Kiểm tra quyền đăng ký theo thời điểm

Một đợt cho phép một sinh viên đăng ký khi **đồng thời**:

1. Loại đợt nằm trong danh sách được phép cho thao tác đó;
2. Thời điểm hiện tại nằm trong khung thời gian của đợt;
3. **Hoặc** đợt không khai báo khung giờ chi tiết nào (khi đó áp dụng cho mọi người), **hoặc** có một khung giờ khớp với sinh viên.

**Điều kiện khớp của một khung giờ chi tiết:**

| Trường | Khớp khi |
|---|---|
| Khoa | Để trống (áp cho mọi khoa), hoặc bằng 3 ký tự đầu mã sinh viên |
| Khóa | Để trống (áp cho mọi khóa), hoặc bằng 2 ký tự thứ 4–5 mã sinh viên |
| Thời gian | Thời điểm hiện tại nằm trong khung giờ đó |

**Thao tác nào bị chặn ở loại đợt nào:**

| Thao tác | Bị chặn ở |
|---|---|
| Đăng ký, đăng ký dự bị | Đợt khảo sát nhu cầu, đợt rút học phần |
| Hủy đăng ký, hủy dự bị | Chỉ đợt khảo sát nhu cầu (**đợt rút vẫn cho hủy** — đúng theo nghĩa của nó) |

### 9.3 Trạng thái hiển thị cho sinh viên

Trạng thái của **đợt**: đã qua / đang mở / sắp tới, tính theo thời gian hiện tại so với khung thời gian của đợt.

Trạng thái của **sinh viên trong đợt đó**, xét trên các khung giờ khớp với sinh viên:

| Trạng thái | Khi |
|---|---|
| Đang mở | Có khung giờ chứa thời điểm hiện tại |
| Sắp tới | Không có, nhưng có khung giờ ở tương lai → lấy khung sớm nhất |
| Đã qua | Chỉ còn khung giờ trong quá khứ → lấy khung muộn nhất |
| **Bị khóa** | **Không có khung giờ nào khớp với sinh viên này** |
| (bằng trạng thái đợt) | Đợt không khai báo khung giờ nào |

Trạng thái đợt được tính **tươi mỗi lần gọi**, chỉ dữ liệu thô mới được cache — một lựa chọn đúng, vì trạng thái phụ thuộc thời gian hiện tại và không được cache.

### 9.4 Quản lý đợt phía quản trị

- Sửa một đợt sẽ **thay thế toàn bộ** danh sách khung giờ của nó, không sửa từng khung.
- Mọi thay đổi xóa cache theo tiền tố.
- **Giá trị loại đợt được phân tích bỏ qua chữ hoa/thường, và khi không hợp lệ thì mặc định về 0.** Vì 0 không nằm trong dải hợp lệ (1–8), một giá trị gõ sai sẽ tạo ra một đợt có loại không xác định thay vì bị từ chối. Cần kiểm tra tính hợp lệ và báo lỗi, không nuốt thành giá trị mặc định.

---

## 10. Tầng cache và cấu hình

### 10.1 Các nhóm khóa cache

| Nhóm khóa | Nội dung | Thời hạn |
|---|---|---|
| Token đang hoạt động theo vai trò và người dùng | Token hiện hành (cơ chế một phiên) | 2 giờ / 12 giờ |
| Hồ sơ sinh viên | Thông tin cá nhân | 1 ngày |
| Thông tin học vụ của sinh viên | Chương trình, lớp, khóa, nhóm | 1 ngày |
| Danh sách lớp đã đăng ký của sinh viên | — | 1 ngày |
| Thông tin lớp học phần | — | 1 ngày |
| Danh sách sinh viên trong một lớp | Tập có thứ tự, điểm số là thời điểm đăng ký | 30 phút, nạp lại từ CSDL khi thiếu |
| Số lượng đã đăng ký / đang dự bị của lớp | Biến đếm, giá trị `-1` nghĩa là chưa có | 30 phút |
| Trạng thái một yêu cầu đăng ký | `PENDING` 5 phút; `SUCCESS`/`FAILED` 1 ngày | — |
| Tập lớp đang trong hàng đợi của sinh viên | Chống gửi trùng yêu cầu | 15 phút |
| Danh mục lớp theo khoa và học kỳ | Dùng cho giao diện quản trị | — |
| Điều kiện học phần theo chương trình | Kết quả gom nhóm điều kiện | 30 phút |
| Danh sách lớp học phần theo phiên bản cache | — | 30 phút |
| Bộ đếm phiên bản cache | Tăng dần để vô hiệu hóa cache hàng loạt | — |
| Chi tiết bảng điểm sinh viên | — | 1 ngày |
| Chỉ số theo dõi tần suất và số lượng | — | 5 giây / không hạn |

### 10.2 Hai mẫu vô hiệu hóa cache — một tốt, một xấu

**Mẫu tốt: phiên bản hóa khóa (cache versioning).** Thay vì đi xóa từng khóa liên quan khi dữ liệu đổi, hệ thống **tăng một bộ đếm phiên bản** và nhúng số phiên bản vào tên khóa. Mọi khóa cũ lập tức trở nên không ai tra tới và tự hết hạn. Cách này tránh hẳn việc phải liệt kê đúng tập khóa cần xóa — nguồn lỗi phổ biến nhất của invalidation.

Tương tự, các khóa danh sách lớp **nhúng mã băm của tập học phần vào tên khóa**, nên khi tập học phần đổi, khóa tự khác đi và **tự chữa lành** mà không cần xóa gì.

**Chiến lược vô hiệu hóa theo loại thay đổi:**

| Thay đổi | Hành động |
|---|---|
| Danh sách học phần của một chương trình đổi | Xóa khóa điều kiện của chương trình đó, tăng bộ đếm phiên bản của chương trình, xóa thông tin học vụ của mọi sinh viên thuộc chương trình đó |
| Chỉ điều kiện tiên quyết đổi | Xóa khóa điều kiện của chương trình |
| Thuộc tính một học phần đổi | Tăng bộ đếm phiên bản danh sách lớp |
| Một đăng ký thay đổi | **Xóa** (không ghi đè) các khóa liên quan tới cặp sinh viên–lớp đó |

> Nguyên tắc "**xóa, không ghi đè**" ở dòng cuối là đúng: ghi đè cache bằng giá trị vừa tính được tạo ra một cửa sổ đua, trong đó một tiến trình khác có thể ghi giá trị cũ hơn lên sau. Xóa thì lần đọc sau luôn lấy từ nguồn sự thật.

**Mẫu xấu: quét toàn bộ không gian khóa.** Khi đổi mã học kỳ hiện hành, hệ thống xóa các khóa danh sách đăng ký bằng cách **quét toàn bộ khóa trên server Redis theo mẫu**, và lỗi phát sinh thì bị ghi log rồi bỏ qua. Lệnh quét toàn bộ này **chặn Redis** trong lúc chạy; trên một instance có nhiều khóa, nó làm treo mọi client. Cách đúng là dùng lệnh quét tăng dần (SCAN), và quy trình vận hành của hệ thống **đã ghi rõ điều đó** (xem 11.3) — nhưng chính mã nguồn lại không tuân theo.

### 10.3 Bảng cấu hình hệ thống

Cấu hình nằm trong một bảng khóa-giá trị, được nhân bản sang Redis. Các khóa chính:

| Khóa | Vai trò | Thời hạn cache |
|---|---|---|
| Mã học kỳ hiện hành | Quyết định học kỳ mọi thao tác áp vào | **Không có** |
| Đợt đăng ký hiện hành (ghi đè thủ công) | Ưu tiên cao hơn khung thời gian thật (mục 9.1) | **Không có** |
| Tiêu đề hiển thị | Văn bản trên giao diện | **Không có** |
| Ghi chú khảo sát nhu cầu | Văn bản | 5 phút |

> **Việc các khóa quan trọng không có thời hạn** nghĩa là một giá trị sai ghi vào Redis sẽ **ở đó mãi** cho tới khi có người xóa tay. Khóa cấu hình nên có thời hạn ngắn để tự đồng bộ lại từ CSDL — nguồn sự thật là bảng, Redis chỉ là bản sao.

### 10.4 Cấu hình triển khai

| Nhóm khóa cấu hình | Nội dung |
|---|---|
| Kết nối CSDL chính | PostgreSQL, thông tin đăng nhập `[redacted]` |
| Kết nối Redis | — |
| Kết nối Kafka | — |
| Kết nối CSDL học vụ cũ | Chỉ phía quản trị, SQL Server, thông tin đăng nhập `[redacted]` |
| Khóa ký JWT và khóa ký SSO | `[redacted]` |
| Issuer và audience JWT | Có khai báo nhưng **không được kiểm tra** |
| Mã học kỳ hiện hành mặc định | — |
| Cờ bật đăng ký theo nhóm | — |
| Số consumer và số partition Kafka | Mặc định 6 và 12 |
| Địa chỉ SSO và địa chỉ callback | **Đang gán cứng địa chỉ môi trường phát triển trong mã** |

**Hạ tầng chạy:**

| Thành phần | Cấu hình |
|---|---|
| Ảnh container | Multi-stage, chạy bằng user không phải root, cổng 8080/8081 |
| API sinh viên | 3 bản sao, 2 GB bộ nhớ mỗi bản |
| Consumer đăng ký | 1 bản, 3 GB, 6 consumer, 12 partition |
| Consumer nhật ký | 1 bản, 2 GB |
| API quản trị | 1 bản |
| Redis, Kafka, PostgreSQL 16 | Mỗi thứ một container |

**Quy trình CI/CD:** chỉ có **một giai đoạn build ảnh container**. **Không có giai đoạn chạy test (vì không có test), không có giai đoạn triển khai** — việc triển khai làm bằng tay. Tài liệu CI/CD đi kèm đã lỗi thời.

---

## 11. Lịch sử vận hành — những sự cố thật và bài học

### 11.1 Sự cố mất đăng nhập toàn hệ thống (22/07/2026)

| Mục | Nội dung |
|---|---|
| **Hiện tượng** | Sau khi chạy một migration thêm bảng tài khoản Phòng đào tạo, **mọi vai trò trừ Quản trị viên đều không đăng nhập được**. Người dùng nhận thông báo "sai mật khẩu" |
| **Nguyên nhân** | Migration tạo bảng mới nhưng **không cấp quyền truy cập cho user mà ứng dụng dùng để kết nối CSDL**. PostgreSQL trả về lỗi phân quyền. **Khối try/catch nuốt mọi lỗi** trong chuỗi thử đăng nhập (mục 6.3) đã biến lỗi hạ tầng này thành kết luận nghiệp vụ "không tìm thấy tài khoản" |
| **Phạm vi** | Bảng nhật ký hành động quản trị cũng thiếu quyền tương tự |
| **Cách sửa** | Chạy script cấp quyền với tư cách người dùng quản trị CSDL |
| **Bài học 1** | **Mỗi migration tạo bảng đều phải kèm bước cấp quyền cho user ứng dụng.** Đây là một bước thủ công bắt buộc trong quy trình triển khai — và vì là thủ công, nó sẽ bị quên lần nữa. Giải pháp bền là cấp quyền mặc định ở mức schema, hoặc để migration tự cấp quyền |
| **Bài học 2** | **Không nuốt lỗi CSDL trong luồng xác thực.** Một lỗi hạ tầng bị báo thành lỗi nghiệp vụ đã làm việc chẩn đoán đi sai hướng hoàn toàn: người ta đi kiểm tra mật khẩu người dùng trong khi vấn đề nằm ở quyền trên bảng |

### 11.2 Lệch cột đếm số đăng ký

Đã nêu ở mục 8.3: 323/2.999 lớp lệch trong một học kỳ. Đây là lý do mọi kiểm tra sức chứa phải đếm lại từ bảng.

### 11.3 Quy trình đồng bộ và vận hành dữ liệu

Dữ liệu được di trú từ hệ thống SQL Server cũ sang PostgreSQL bằng một bộ script. Các nhóm script chính: nạp toàn bộ, nạp từ bản sao lưu, đồng bộ một nhóm bảng, **đặt lại chuỗi sinh khóa tự tăng** (bắt buộc sau mọi lần nạp), sinh script đồng bộ môi trường production, xuất dữ liệu lớp học phần, **cấp quyền cho user ứng dụng**, các script dọn dẹp cho đợt điều chỉnh, xuất báo cáo CSV, và tạo index tăng hiệu năng.

**Những cảnh báo vận hành được ghi lại trong chính bộ script:**

| Cảnh báo | Nội dung |
|---|---|
| **Nguy hiểm nhất** | Script đồng bộ production **xóa dữ liệu 9 bảng rồi nạp lại**. Nếu bảng nguồn rỗng, **bảng production bị xóa trắng**. Bắt buộc sao lưu trước khi chạy |
| An toàn một phần | Riêng bảng lớp học phần chỉ chèn thêm, bỏ qua dòng đã có — không xóa |
| Chạy an toàn | Toàn bộ trong một giao dịch, chạy với tùy chọn dừng ngay khi có lỗi |
| Cấp quyền | Script cấp quyền phải chạy **sau mỗi migration tạo bảng**, với tư cách người dùng quản trị CSDL |
| Redis | **Chỉ dùng lệnh quét tăng dần để xóa. Tuyệt đối không dùng lệnh liệt kê toàn bộ khóa, không xóa toàn bộ CSDL Redis** |
| Redis | Tăng bộ đếm phiên bản cache sau khi thay đổi dữ liệu lớp học phần |
| Dữ liệu | Một lần đối soát chương trình đào tạo của sinh viên đã sửa dữ liệu cho 297 sinh viên — kèm theo phải xóa cache hồ sơ và thông tin học vụ của họ |

**Quy tắc đặt sức chứa dự bị trong đợt điều chỉnh** (ví dụ về nghiệp vụ được thực hiện bằng script, không phải bằng chức năng):

| Loại lớp | Quy tắc |
|---|---|
| Giáo dục thể chất | Tăng sức chứa thêm 5, đặt sức chứa dự bị về 0 |
| Lớp thí nghiệm (nhận diện theo tiền tố tên) | Tối đa 2 |
| Các lớp khác | Phần trống còn lại của phòng, tối đa 5; không biết phòng thì mặc định 5 |

> **Nhận xét:** việc một quy tắc nghiệp vụ như trên tồn tại dưới dạng script SQL chạy tay cho thấy hệ thống **thiếu chức năng cấu hình tương ứng**. Mỗi đợt điều chỉnh lại phải có người chạy script đúng thứ tự — một rủi ro vận hành lặp lại.

### 11.4 Thống kê migration

23 migration, trải từ lần khởi tạo PostgreSQL tới lần bổ sung cột lịch cho bảng nhu cầu đăng ký, trong khoảng tháng 7 đến tháng 8 năm 2026.

---

## 12. Đánh giá chất lượng tổng hợp

### 12.1 Những điểm làm tốt, đáng kế thừa

| Điểm mạnh | Lý do đáng học |
|---|---|
| Đăng ký bất đồng bộ qua hàng đợi | API phản hồi tức thì ngay trong giờ cao điểm; việc ghi nặng được dồn vào consumer có thể scale riêng |
| Khóa message theo mã sinh viên | Giữ đúng thứ tự cho từng sinh viên mà không mất tính song song |
| Khóa dòng ở mức lớp học phần | Mức hạt khóa chính xác — đủ chặt để đúng, đủ lỏng để nhanh |
| Đếm lại từ bảng thay vì tin cột đếm | Giải pháp đúng cho một vấn đề đã xảy ra thật, có số liệu chứng minh |
| Hợp-tìm có tiêu chí đại diện tất định | Khử hẳn một lớp lỗi phụ thuộc thứ tự dòng |
| Phiên bản hóa khóa cache | Tránh được sai sót khi phải liệt kê khóa cần xóa |
| Xóa cache thay vì ghi đè | Khử cửa sổ đua khi vô hiệu hóa cache |
| Cơ chế một phiên đăng nhập | Chống chia sẻ tài khoản một cách đơn giản và hiệu quả |
| Tách tiến trình sinh viên và quản trị | Scale độc lập, chính sách bảo mật độc lập |

### 12.2 Những điểm phải tránh

| Khiếm khuyết | Mức độ | Mục chi tiết |
|---|---|---|
| Nhiều API quản trị và API phá hoại không yêu cầu đăng nhập | **Nghiêm trọng** | 6.6 |
| API reset mật khẩu vô danh và trả về mật khẩu | **Nghiêm trọng** | 6.6 |
| Khóa ký JWT nằm trong mã nguồn, không kiểm tra issuer/audience | **Nghiêm trọng** | 6.1 |
| Khóa dự phòng gán cứng khi thiếu cấu hình SSO | **Nghiêm trọng** | 6.5 |
| Mật khẩu mặc định đoán được | Cao | 6.5 |
| Luồng đăng ký không áp chính sách trạng thái sinh viên | Cao | 6.4 |
| Lỗi consumer bị bỏ qua, không thử lại, không hàng đợi chết | Cao | 5.3 |
| Try/catch nuốt lỗi CSDL trong luồng đăng nhập | Cao | 6.3, 11.1 |
| Kiểm tra trùng lịch tự vô hiệu hóa khi dữ liệu sai định dạng | Cao | 7.1 |
| Đường ghi hàng loạt bỏ qua khóa và kiểm tra sức chứa | Cao | 8.4 |
| Bốn cờ điều khiển đăng ký chỉ được kiểm tra ở giao diện | Cao | 8.5 |
| Loại điều kiện 4 không được thi hành | Trung bình | 7.3 |
| Loại điều kiện 2 kiểm tra không nhất quán hai hướng | Trung bình | 7.3 |
| Tổng tín chỉ cộng cả lớp dự bị và cả học kỳ cũ | Trung bình | 7.7 |
| Lệnh quét toàn bộ khóa Redis trong mã ứng dụng | Trung bình | 10.2 |
| Khóa cấu hình quan trọng không có thời hạn | Trung bình | 10.3 |
| Ngoại lệ nghiệp vụ gán cứng trong mã | Trung bình | 7.9 |
| Hai enum phạm vi đánh số lệch nhau | Trung bình | 4.6 |
| Thời gian nghiệp vụ phụ thuộc đồng hồ máy chủ ở UTC | Trung bình | 2 |
| Cột tín chỉ dùng số thực dấu phẩy động | Thấp | 4.3 |
| Cắt chuỗi 9 ký tự trên mã sinh viên 10 ký tự | Thấp | 4.3 |
| CORS mở hoàn toàn ở tiến trình consumer | Thấp | 6.6 |
| **Không có một test nào** | Cao | 2 |
| Tài liệu đi kèm lỗi thời (CSDL, CI/CD) | Thấp | 2, 10.4 |

### 12.3 Về tình trạng kiểm thử

Hệ thống **không có project test nào**, và quy trình CI **không có bước chạy test**. Chỉ có vài script kiểm tra tải. Một lần rà soát toàn bộ mã nguồn không tìm thấy bất kỳ ghi chú việc-cần-làm nào — nghĩa là các khiếm khuyết nêu trong tài liệu này **không được ghi nhận ở đâu trong mã**; chúng chỉ lộ ra khi đọc kỹ từng hàm.

> Đây là điều đáng lưu tâm nhất về mặt quy trình: phần lớn lỗi liệt kê ở 12.2 là loại lỗi mà **một bộ test đơn vị cho tầng kiểm tra điều kiện sẽ phát hiện trong vài phút** — đặc biệt là sự không nhất quán của loại điều kiện 2, việc loại 4 không có hiệu lực, và việc tổng tín chỉ cộng sai phạm vi.

---

## 13. Hàm ý cho hệ thống quản lý Chương trình đào tạo đang thiết kế

Những điểm giao thoa trực tiếp giữa hệ thống này và bài toán quản lý chương trình đào tạo:

| Chủ đề | Hàm ý |
|---|---|
| **Khung chương trình đào tạo** | Hệ thống này **đã có** mô hình chương trình – học phần – thứ tự – học kỳ – tự chọn. Nó là nơi *tiêu thụ* khung chương trình. Hệ thống mới là nơi *sản xuất* khung chương trình, nên cần thống nhất cấu trúc dữ liệu đầu ra với cấu trúc đầu vào mà hệ thống này cần |
| **Điều kiện tiên quyết** | Mô hình 4 loại điều kiện ở đây là mô hình thực tế đang chạy. Hệ thống mới nếu định nghĩa điều kiện phải dùng **cùng bộ ngữ nghĩa**, và nên **sửa** hai khiếm khuyết đã biết: loại 4 phải có nghĩa hoặc bị bỏ, và loại 2 phải nhất quán hai hướng |
| **Học phần tương đương** | Đây là quan hệ **bắt buộc phải có** khi quản lý nhiều phiên bản chương trình đào tạo qua các năm. Thuật toán hợp-tìm với đại diện tất định (7.4) là cách làm đúng, nên tái sử dụng |
| **Tín chỉ phân loại** | Việc tách tín chỉ thành lý thuyết / thực hành / đồ án / bài tập lớn / thực tập là một yêu cầu dữ liệu thật, hệ thống mới phải biểu diễn được |
| **Toàn vẹn dữ liệu** | Hệ thống này gần như không có khóa ngoại. Hệ thống mới, nếu là nguồn sự thật của chương trình đào tạo, **phải** có ràng buộc đầy đủ — vì dữ liệu sai ở đây sẽ lan sang mọi hệ thống tiêu thụ |
| **Mã hóa ngữ nghĩa trong chuỗi** | Mã sinh viên, mã lớp học phần, mã học kỳ đều **chứa thông tin cấu trúc được cắt chuỗi để dùng**. Hệ thống mới nên lưu các thành phần này thành cột riêng, và chỉ coi chuỗi mã là nhãn hiển thị |
| **Phân quyền** | Bài học rõ nhất: **chặn mặc định, mở có chủ đích**. Mô hình gắn quyền từng endpoint của hệ thống này đã thất bại ở quy mô |
| **Kiểm thử** | Logic điều kiện tiên quyết và điều kiện tốt nghiệp là loại logic **phải có test**. Hệ thống này không có, và giá phải trả là một danh sách khiếm khuyết không ai phát hiện trong vận hành |

---

## 14. Giới hạn của bản khảo sát này

Để người đọc biết đâu là chỗ cần tự kiểm tra thêm, những phần sau **chưa được đọc kỹ** khi lập tài liệu:

- Danh sách trường chi tiết của các DTO phía quản trị và DTO khảo sát nhu cầu.
- Toàn bộ logic nghiệp vụ của chức năng khảo sát nhu cầu học phần và lịch khảo sát.
- Tầng dịch vụ quản lý khung giờ chi tiết của đợt đăng ký.
- Phần thân của bộ xử lý hủy đăng ký dự bị.
- Nội dung các script kiểm tra tải.

Mọi thông tin khác trong tài liệu này được ghi trực tiếp từ mã nguồn, cấu hình, script vận hành và ghi chú trong mã, tại thời điểm 01/10/2026. **Các giá trị bí mật (mật khẩu, chuỗi kết nối có thông tin đăng nhập, khóa ký) đều được ghi `[redacted]`; tài liệu nêu loại bí mật và nơi nó tồn tại, không bao giờ nêu giá trị.**
