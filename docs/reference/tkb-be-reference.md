# Tài liệu tham chiếu: Hệ thống xếp Thời khóa biểu (`tkb-be` / SmartSchedule.API)

> **Mục đích của tài liệu này.** Mô tả đầy đủ một hệ thống **đang tồn tại** mà dự án Quản lý CTĐT có thể phải tích hợp, tái sử dụng, hoặc cố tình bỏ qua. Tài liệu được viết để **đứng độc lập**: mọi dữ kiện cần thiết đều nằm trong đây, không cần mở mã nguồn gốc. Không có liên kết nào trỏ ra ngoài tài liệu.
>
> **Ngày khảo sát**: 2026-10-01. Mọi bí mật (mật khẩu, khóa ký, chuỗi kết nối) đã được thay bằng `[redacted]`.
>
> **Quan hệ với phạm vi dự án**: mục 12 của đặc tả yêu cầu **loại hệ xếp thời khóa biểu khỏi phạm vi**. Tài liệu này tồn tại để biết *cái bị loại ra là cái gì*, và để nhận ra phần nào của nó vẫn chạm vào hệ CTĐT.

---

## MỤC LỤC

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Nền tảng công nghệ](#2-nền-tảng-công-nghệ)
3. [Lược đồ cơ sở dữ liệu](#3-lược-đồ-cơ-sở-dữ-liệu)
4. [Sai lệch lược đồ](#4-sai-lệch-lược-đồ--phần-quan-trọng-nhất-của-mục-3)
5. [Giao diện API](#5-giao-diện-api)
6. [Xác thực và phân quyền](#6-xác-thực-và-phân-quyền)
7. [Thuật toán xếp lịch CP-SAT](#7-thuật-toán-xếp-lịch-cp-sat)
8. [Cấu hình hệ thống](#8-cấu-hình-hệ-thống)
9. [Mã chết và tính năng bỏ dở](#9-mã-chết-và-tính-năng-bỏ-dở)
10. [Chất lượng và rủi ro](#10-chất-lượng-và-rủi-ro)
11. [Hệ quả cho dự án Quản lý CTĐT](#11-hệ-quả-cho-dự-án-quản-lý-ctđt)
12. [Giới hạn của khảo sát này](#12-giới-hạn-của-khảo-sát-này)

---

## 1. Tóm tắt điều hành

| Câu hỏi | Trả lời |
|---|---|
| Hệ này làm gì? | Xếp thời khóa biểu tự động cho Trường ĐH Bách khoa bằng bộ giải ràng buộc Google OR-Tools CP-SAT |
| Tài sản thật sự của nó là gì? | **Mô hình CP-SAT** — 13 ràng buộc cứng, 11 nhóm hàm mục tiêu, đã tinh chỉnh theo thực tế DUT. Đây là phần duy nhất khó làm lại |
| Phần còn lại ra sao? | Mỏng. CRUD cơ bản, không test, không migration, bảo mật ở mức không thể đưa ra production |
| Có dùng làm nền cho hệ CTĐT không? | **Không.** Không có `Student`, không có `Program`, không có danh mục học phần tách rời, không có `Semester` |
| Rủi ro lớn nhất nếu tích hợp | Mật khẩu lưu **plaintext**; SSO **không xác minh chữ ký** → chiếm được tài khoản bất kỳ kể cả Admin; ~57 endpoint **không xác thực** |
| Quy mô | 1 project, ~8k dòng service (riêng ScheduleService ~5.8k), 5 commit, 10 bảng |

**Kết luận một dòng**: giữ mô hình solver như một tham khảo thuật toán; coi phần còn lại là hệ thống riêng biệt, không tích hợp trực tiếp ở mức mã nguồn.

---

## 2. Nền tảng công nghệ

| Hạng mục | Giá trị |
|---|---|
| Framework | .NET 9.0, Nullable bật, ImplicitUsings bật |
| Cấu trúc | **Một project duy nhất** `SmartSchedule.API.csproj`. Không có file `.sln`, không có project test |
| Namespace | `SmartSchedule_Backend`, assembly `SmartSchedule.API` |
| CSDL | SQL Server, EF Core 9, tên DB `DUT_Smart_Schedule` |
| Bộ giải | Google OR-Tools 9.15.6755, không gian tên `Google.OrTools.Sat` |
| Git | 5 commit |

### Thư viện

| Gói | Phiên bản |
|---|---|
| Google.OrTools | 9.15.6755 |
| Microsoft.EntityFrameworkCore / .SqlServer / .Design | 9.0.0 |
| Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 |
| Microsoft.IdentityModel.Tokens | 8.1.0 |
| System.IdentityModel.Tokens.Jwt | 8.1.0 |
| Microsoft.Extensions.Caching.StackExchangeRedis | 9.0.0 |
| Swashbuckle.AspNetCore | 7.2.0 |
| Microsoft.AspNetCore.OpenApi | 9.0.0 |
| DotNetEnv | 3.2.0 |

### Bố cục thư mục

`Controllers/` · `Services/` (+ `Interfaces/`) · `Models/` · `DTOs/` · `Data/SmartScheduleContext.cs` · `Helpers/` (ClassroomPriorityHelper, CourseSectionPfievHelper, ExceptionMessageHelper, ScheduleConfigDefinitions, TextEncodingHelper, WeekRangeHelper) · `Scripts/` (2 tệp SQL + 1 Python).

### Khởi động

- `DotNetEnv.Env.Load()` nạp `.env`.
- ThreadPool tối thiểu: `cpu × 4` worker, `cpu × 2` IO, với `cpu = max(4, ProcessorCount)`.
- CORS policy `AllowReact`: origin lấy từ biến môi trường `CORS_ALLOWED_ORIGINS` (mặc định `http://localhost:5173,http://localhost:5174`), kèm `AllowAnyMethod` · `AllowAnyHeader` · **`AllowCredentials`**.
- Cache: nếu `USE_REDIS == "true"` thì dùng Redis (`REDIS_CONNECTION_STRING`, mặc định `localhost:6379`, InstanceName `SmartSchedule_`, `AbortOnConnectFail=false`, timeout 1000ms, retry 1); ngược lại dùng bộ nhớ trong. `SaveChanges` của DbContext xóa 3 khóa cache `dashboard_stats`, `dashboard_room_stats`, `dashboard_sections_stats` — **lỗi khi xóa bị nuốt im lặng**.
- DI Scoped: AccountService, ClassroomService, CourseSectionService, DashboardService, FacultyService, LecturerService, ScheduleService, SystemConfigService, LookupService. `ISemesterScheduleJobService` là **Singleton**.
- **Swagger luôn bật kể cả môi trường Production**, đặt ở route gốc.
- Pipeline: Swagger → CORS → Authentication → Authorization → Controllers. **Không có HTTPS redirection.**

### Đóng gói và CI

Dockerfile **chỉ chứa runtime** (`mcr.microsoft.com/dotnet/aspnet:9.0`), sao chép thư mục `publish_output/`, cổng 8080, `ASPNETCORE_ENVIRONMENT=Production`. Phải chạy `dotnet publish -c Release -o publish_output` **thủ công trước** khi `docker build` — bản build trong kaniko từng bị OOM (exit 137).

GitLab CI có 3 stage build / deploy / docker-package, **không có stage test**, không tự động triển khai container. Thẻ ảnh: `$CI_COMMIT_TAG` + `latest` (tag), `latest` (main), `dev-latest` (dev).

`README.md` là **template GitLab mặc định, không có nội dung dự án**.

---

## 3. Lược đồ cơ sở dữ liệu

> **Cảnh báo nền tảng**: hệ này **không có migration EF Core**, **không có script CREATE TABLE**, **không có seed**. Lược đồ thật của cơ sở dữ liệu **không được mô tả ở bất kỳ đâu trong mã nguồn**. Bảng dưới đây dựng lại từ các lớp entity và cấu hình Fluent API — đó là tất cả những gì có thể biết được. Kiểu cột thật, độ dài chuỗi, khóa ngoại thật và chỉ mục trong SQL Server **không kiểm chứng được**.

Không entity nào có navigation property, `[MaxLength]`, precision số, giá trị mặc định, hay unique index.

| Entity | Bảng | Cột (kiểu CLR) | Khóa chính |
|---|---|---|---|
| `Account` | `Account` | `AccountID int?` · `Username string?` · `MicrosoftEmail string?` · `Password string?` · `IsActive bool?` | `AccountID` (**kiểu nullable**) |
| `AccountRole` | `Account_Role` | `AccountID int?` · `RoleID int?` | Tổ hợp, chỉ khai ở Fluent API |
| `Role` | `Role` | `RoleID int` · `RoleName string?` · `Description string?` | `RoleID` |
| `Classroom` | `dbo.Classroom` | `ClassroomID string` (mặc định `""`) · `Capacity int?` · `RoomType string?` · `IsSpecialized bool?` · `IsAvailable bool?` · `Building string?` | `ClassroomID` (chuỗi) |
| `ClassroomPeriodLock` | `dbo.ClassroomPeriodLock` | `ClassroomID string` · `Period int` | Tổ hợp |
| `CourseSection` | `CourseSection` | `CourseID string?` · `LecturerID int?` · `FacultyID int?` · `CourseCode string?` · `CourseName string?` · `Credits double?` · `NumberStudents int?` · `IsSpecial bool?` · `IsLanguage bool?` · `IsPFIEV bool?` | `CourseID` (**nullable**) |
| `Faculty` | `Faculty` | `FacultyID int` · `FacultyName string?` · `FacultyCode string?` **(bị `Ignore()`)** | `FacultyID` |
| `Lecturer` | `Lecturer` | `LecturerID int?` · `AccountID int?` · `FacultyID int?` · `LecturerName string?` · `MicrosoftEmail string?` · `Position string?` · `HasMeeting bool?` | `LecturerID` (**nullable**) |
| `SystemConfig` | `SystemConfigs` | `ConfigKey string` · `ConfigValue string?` | `ConfigKey` |
| `Timetable` | `Timetable` | `TimetableID int` · `ScheduleBatchId Guid?` · `CourseID string?` · `LecturerID int?` · `ClassroomID string?` · `CourseName string?` · `AcademicYear string?` · `Semester int?` · `Week string?` · `DayOfWeek int?` · `Session int?` · `StartLesson int?` · `TotalWeek int?` · `IsLocked bool` (không null, mặc định `false`) · `SolverStatus string?` · `ObjectiveValue double?` · `CreatedAt DateTime?` · `UpdatedAt DateTime?` | `TimetableID` |

### Cách hiểu bảng `Timetable`

Đây là bảng trung tâm và cách dùng nó **không trực quan**:

- Bảng được **nạp sẵn các dòng "skeleton"** cho mỗi lớp học phần, bằng quy trình import **nằm ngoài mã nguồn này**.
- Bộ giải chủ yếu **UPDATE** các dòng sẵn có (điền `DayOfWeek`, `StartLesson`, `ClassroomID`), chỉ INSERT khi bật cờ `allowNewTimetableRows`.
- **Lớp không có dòng skeleton sẽ bị bỏ qua** — hệ báo "Bỏ qua N lớp không có dòng Timetable skeleton".
- `Session` là **số tiết của khối học**, không phải buổi. DTO ánh xạ `Session` ↔ `NumberLesson`.
- `Week` là **chuỗi** mô tả tuần học: `"1-15"`, `"1-8;10-16"`, hoặc một số đơn.
- `ScheduleBatchId` gom các dòng thuộc cùng một lần chạy solver.
- **Mã học kỳ có hai hệ quy ước**: trong DB là `1`/`2`/`3`; cấu hình và giao diện dùng `10`/`20`/`21`. Controller ánh xạ qua `NormalizeSemesterQuery`: 10→1, 20→2, 21→3.

### Khóa ngoại

Chỉ **ba** quan hệ được cấu hình:

| Quan hệ | Hành vi xóa |
|---|---|
| `Account_Role.AccountID` → `Account` | Cascade |
| `Account_Role.RoleID` → `Role` | Restrict |
| `Lecturer.AccountID` → `Account` | SetNull |

**Không có khóa ngoại** cho: `CourseSection.LecturerID`, `CourseSection.FacultyID`, `Lecturer.FacultyID`, `Timetable.CourseID`, `Timetable.LecturerID`, `Timetable.ClassroomID`, `ClassroomPeriodLock.ClassroomID`.

### Enum (không lưu xuống CSDL)

| Enum | Thành viên |
|---|---|
| `LexicographicPass` | `MaxCoverage=1` · `Quality=2` · `RoomEfficiency=3` |
| `SchedulePhaseMode` | `Auto=0` · `TimeSlotsOnly=1` · `RoomsOnly=2` · `Combined=3` · `SessionOnly=4` · `PeriodOnly=5` |

---

## 4. Sai lệch lược đồ — phần quan trọng nhất của mục 3

| # | Điểm lệch | Hệ quả |
|---|---|---|
| 1 | `Faculty.FacultyCode` có trên entity nhưng bị `Ignore()` | `FacultyDTO.FacultyCode` và `FacultyLookupDTO.FacultyCode` **không bao giờ có dữ liệu** — luôn rỗng ở API |
| 2 | Khóa chính kiểu nullable: `Account.AccountID int?`, `Lecturer.LecturerID int?`, `CourseSection.CourseID string?` | EF phải suy diễn; dễ sinh lỗi runtime khó truy |
| 3 | Chỉ có 2 script SQL: `AddLecturerFacultyID.sql` và `DropLecturerFacultyID.sql` (thêm/bỏ cột `Lecturer.FacultyID` kiểu `INT NULL`) | Đây là **dấu vết duy nhất** của một thay đổi lược đồ bằng tay. Mọi thay đổi khác không để lại vết |
| 4 | Kiểu cột, độ dài, FK thật trong SQL Server không suy ra được từ mã nguồn | **Không thể tái tạo CSDL từ repo**. Phải có bản sao lưu DB thật |
| 5 | Không có unique index trên `Timetable` | Trùng dòng xảy ra thật, phải xử lý bằng mã (`RemoveDuplicateTimetableRowsAsync`) |
| 6 | Không có seed cho `SystemConfigs` | Service dùng giá trị mặc định cứng trong mã khi thiếu khóa |
| 7 | `LecturerAvailabilityDTO` còn trong `DTOs/LecturerDTO.cs` dù entity tương ứng đã bị comment toàn bộ | Tàn dư của tính năng bỏ dở (xem mục 9) |

Ngoài ra có `Scripts/ImportLecturerFacultyFromExcel.py`: đọc hai tệp Excel ở **đường dẫn Windows cứng** (`e:\CDSBK GV.xlsx`, `e:\CDSBK Khoa.xlsx`), nối SQL Server qua pyodbc bằng `Trusted_Connection`, chạy `UPDATE Lecturer SET FacultyID=? WHERE LecturerID=?`. Dùng openpyxl + pyodbc.

---

## 5. Giao diện API

Mọi route theo mẫu `api/[controller]`. **Chỉ 3 endpoint có `[Authorize]`**, tất cả thuộc `AuthController`, và cả 3 **chỉ kiểm tra token hợp lệ, không kiểm vai trò**. Toàn repo **không có** `[Authorize(Roles=...)]`, `[AllowAnonymous]`, global filter hay fallback policy.

| Controller | Verb + route | Tham số / body | Xác thực |
|---|---|---|---|
| Auth | POST `api/Auth/login` | `LoginRequest {Username, Password}` | Không |
| Auth | POST `api/Auth/login-sso` | `SsoLoginRequest {Token}` | Không |
| Auth | GET `api/Auth/profile` | — | **[Authorize]** |
| Auth | PUT `api/Auth/change-password` | `ChangePasswordRequest {CurrentPassword, NewPassword, ConfirmPassword}` | **[Authorize]** |
| Auth | POST `api/Auth/select-role` | `SelectRoleRequest {RoleName}` | **[Authorize]** |
| Account | GET `api/Account` | `accountId?`, `keyword?`, `page=1`, `pageSize=20` | **Không** |
| Account | GET `api/Account/roles` | — | **Không** |
| Account | POST `api/Account` | `AccountCreateUpdateDTO` | **Không** |
| Account | PUT `api/Account/{accountId:int}` | `AccountCreateUpdateDTO` | **Không** |
| Account | DELETE `api/Account/{accountId:int}` | — | **Không** |
| Classroom | GET `api/Classroom` | `roomId?`, `keyword?`, `page`, `pageSize` | Không |
| Classroom | GET `api/Classroom/building` | `building` | Không |
| Classroom | GET `api/Classroom/suggest` | `building`, `capacity` | Không |
| Classroom | POST `api/Classroom` · PUT/DELETE `api/Classroom/{classroomId}` | `ClassroomCreateUpdateDTO` | Không |
| CourseSection | GET `api/CourseSection` | `keyword?`, `lecturerId?`, `facultyId?`, `page?`, `pageSize?` | Không |
| CourseSection | GET/PUT/DELETE `api/CourseSection/{courseId}` · POST `api/CourseSection` | `CourseSectionCreateUpdateDTO` | Không |
| Dashboard | GET `api/Dashboard/stats` · `rooms-by-building` · `course-sections-by-building` | — | Không |
| Dashboard | GET `api/Dashboard/room-usage-by-day` · `schedule-conflicts` | `semester?`, `academicYear?` | Không |
| Faculty | GET `api/Faculty` | `keyword?`, `page?`, `pageSize=20` | Không |
| Faculty | GET/PUT/DELETE `api/Faculty/{facultyId:int}` · POST `api/Faculty` | `FacultyCreateUpdateDTO {FacultyID, FacultyName}` | Không |
| Lecturer | GET `api/Lecturer` | `lecturerId?`, `keyword?`, `page`, `pageSize` | Không |
| Lecturer | POST `api/Lecturer` · PUT/DELETE `api/Lecturer/{lecturerId:int}` | `LecturerCreateUpdateDTO` | Không |
| Lookup | GET `api/Lookup/course-section-form` | → `CourseSectionFormOptionsDTO` | Không |
| SystemConfig | GET `api/SystemConfig` | → danh sách `SystemConfigItemDTO` | **Không** |
| SystemConfig | PUT `api/SystemConfig` | `SystemConfigBulkUpdateDTO` | **Không** |
| Schedule | POST `api/Schedule/generate` | `GenerateScheduleRequestDTO` | **Không** |
| Schedule | POST `api/Schedule/save` | `SaveScheduleRequestDTO` | **Không** |
| Schedule | GET `api/Schedule/{id:int}` | — | Không |
| Schedule | GET `api/Schedule/lecturer/{lecturerId:int}` | `academicYear?`, `semester?`, `week?`, `onlyScheduled=true` | Không |
| Schedule | GET `api/Schedule` | `lecturerId?`, `academicYear?`, `semester?`, `week?`, `onlyScheduled=false` | Không |
| Schedule | GET `api/Schedule/semester-stats` | — | Không |
| Schedule | POST `api/Schedule/lock-semester` · `reset-semester` · `dedupe-semester` | `academicYear`, `semester`, `week` | **Không** |
| Schedule | POST `api/Schedule/generate-semester` | `GenerateSemesterScheduleRequestDTO` (đồng bộ) | **Không** |
| Schedule | POST `api/Schedule/generate-semester/start` | cùng DTO, trả `202 {jobId}` | **Không** |
| Schedule | POST `api/Schedule/jobs/{jobId:guid}/cancel` · GET `jobs?take=20` · GET `jobs/{jobId:guid}` | — | Không |
| Schedule | GET `api/Schedule/pending-room-assignments` | `academicYear`, `semester` | Không |
| Schedule | GET `api/Schedule/{timetableId:int}/room-candidates` | — | Không |
| Schedule | POST `api/Schedule/assign-room` | `ManualAssignRoomRequestDTO` | Không |
| Schedule | GET `api/Schedule/batch/{batchId:guid}` · GET `history` | `academicYear`, `semester`, `week` | Không |
| Schedule | POST `api/Schedule/lock/{batchId:guid}` · `unlock/{batchId:guid}` · DELETE `batch/{batchId:guid}` | — | **Không** |

**Khoảng 57 endpoint chạy ẩn danh** so với 3 endpoint có xác thực. Trong số ẩn danh có: tạo/sửa/xóa tài khoản và đặt mật khẩu, sửa cấu hình hệ thống, sinh/khóa/đặt lại/xóa toàn bộ lịch học kỳ.

### DTO chính

**Xác thực**: `LoginRequest {Username, Password}` · `UserProfileDTO {AccountID int, Username, FullName, MicrosoftEmail, ActiveRole?, Roles List<string>, IsActive, LecturerID?, LecturerName?}`.

**Tài khoản**: `AccountListItemDTO {AccountID, Username, MicrosoftEmail, IsActive, Roles, LecturerID?, LecturerName}` · `RoleOptionDTO {RoleID, RoleName, Description}` · `AccountCreateUpdateDTO {Username, Password?, MicrosoftEmail, IsActive=true, RoleIds List<int>, LecturerID?}`.

**Phòng học**: `ClassroomCreateUpdateDTO {ClassroomID, Capacity?, RoomType, IsSpecialized?, IsAvailable?, Building}` · `ClassroomDto` (tên trường **tiếng Việt**: `TenPhong, LoaiPhong, SucChua, KhuNha, IsSpecialized?, IsAvailable?, PriorityLabels, PrioritySummary`).

**Lớp học phần**: `CourseSectionDTO {CourseID, LecturerID, LecturerName, FacultyID, FacultyName, CourseCode, CourseName, Credits double?, NumberStudents, IsSpecial, IsLanguage, IsPFIEV}`.

**Lịch**: `ScheduleItemDTO {TimetableID?, ScheduleBatchId?, SolveTimeSeconds, CourseID, CourseName, LecturerID, LecturerName, ClassroomID, Building, Capacity, NumberStudents, AcademicYear, Semester, Week, DayOfWeek, StartLesson, NumberLesson, EndLesson, TotalWeek, IsLocked, SolverStatus, ObjectiveValue}`. `EndLesson` được tính `StartLesson + NumberLesson − 1`.

**Yêu cầu sinh lịch** `GenerateScheduleRequestDTO`: `AcademicYear?`, `Semester?`, `Week="1"`, `MaxTimeSeconds=30`, `MaxCourseSections=100`, `MaxRoomCandidatesPerSection=18`, `SaveResult=true`, `ClearOldGeneratedSchedule=false`, `MaxLecturerLessonsPerDay=0` (**bị ghi đè bằng hằng số 9**), `RoomWasteWeight=1`, cùng 18 trường trọng số phạt mặc định `−1` (nghĩa là lấy từ `SystemConfigs`).

**Yêu cầu sinh lịch học kỳ** `GenerateSemesterScheduleRequestDTO`: `AcademicYear`, `Semester`, `Week="1"`, `BatchSize=48`, `MaxBatches=100`, `MaxTimeSecondsPerBatch=120`, `MaxRoomCandidatesPerSection=0`, `SaveResult=true`, `UseAutomaticRunPolicy=true`, `ClearBeforeRun=false`, `LockAfterEachBatch=false`, `MaximizeCoverage=true`, `UseLhMipPipeline=true`, `LhMipTotalTimeSeconds=0` (0 = tự ước lượng).

**Phân trang**: `PagedResultDTO<T> {Items, TotalItems, Page, PageSize, TotalPages}` — và một bản **trùng lặp** `PagedResult<T>` cùng hình dạng.

---

## 6. Xác thực và phân quyền

> **Mục này mô tả các lỗ hổng bảo mật nghiêm trọng trong một hệ thống nội bộ đang tồn tại.** Ghi lại ở đây để bên tiếp nhận biết mà **không** tích hợp hoặc sao chép các khuôn mẫu này. Mọi giá trị bí mật đã được thay bằng `[redacted]`.

| Chủ đề | Thực tế |
|---|---|
| Cơ chế | Chỉ JWT Bearer (HS256). Kiểm Issuer `SmartScheduleBackend`, Audience `SmartScheduleFrontend`, chữ ký, hạn dùng, `ClockSkew=0` |
| Khóa ký | Biến môi trường `JWT_SECRET_KEY` ghi đè `JwtSettings:SecretKey`. **`appsettings.json` đã commit một SecretKey khác rỗng** — giá trị `[redacted]`, nhưng việc nó nằm trong lịch sử git là một lộ lọt thật |
| Thời hạn | 8 giờ, tính bằng `DateTime.Now.AddHours(8)` — **giờ local, không phải UTC**. **Không có refresh token** |
| Claims | `sub`=username, NameIdentifier, Name, AccountID, FullName, Jti, RequiresRoleSelection, AvailableRoles, tùy chọn Role/RoleName, LecturerID |
| **Mật khẩu** | **Lưu plaintext** trong cột `Account.Password`, so sánh bằng phép so chuỗi trực tiếp. Không hash, không salt. Khi tạo/sửa tài khoản, service lưu nguyên giá trị người dùng nhập. Đổi mật khẩu chỉ yêu cầu tối thiểu 4 ký tự |
| **SSO** | Endpoint `login-sso` **không xác minh chữ ký** id_token của Microsoft. Chỉ gọi `CanReadToken` + `ReadJwtToken` để **giải mã**, rồi lấy email từ claim `preferred_username` → `email` → `upn`. **Không kiểm issuer, audience, hạn dùng, chữ ký.** Hệ quả: bất kỳ ai cũng có thể tự tạo một JWT **không ký** chứa email của nạn nhân và nhận về token nội bộ hợp lệ — chiếm được tài khoản bất kỳ, kể cả Admin |
| Vai trò | Lấy từ `Account_Role` join `Role.RoleName`. Nhiều vai trò → `requiresRoleSelection=true`, token chưa mang role cho đến khi gọi `select-role` |
| **Thực thi phân quyền** | **Vai trò không được kiểm tra ở bất kỳ endpoint nào.** Role chỉ có ý nghĩa hiển thị trên giao diện. 3 endpoint `[Authorize]` chỉ cần token hợp lệ. Trên thực tế hệ **gần như không có phân quyền** |
| Lộ thông tin | Phân biệt rõ "Tài khoản không tồn tại" và "Mật khẩu không chính xác" → cho phép dò tên tài khoản. Không khóa tài khoản sau nhiều lần sai, không giới hạn tần suất. Thông báo lỗi 503 nêu đích danh tên biến cấu hình CSDL |
| Khác | Swagger công khai ở Production · CORS bật `AllowCredentials` · không ép HTTPS · cấu hình `AzureAd` tồn tại trong appsettings nhưng **không mã nào dùng** |

---

## 7. Thuật toán xếp lịch CP-SAT

Đây là phần có giá trị kỹ thuật thật sự của hệ thống.

### 7.1 Chuẩn bị dữ liệu

**Tập lớp cần xếp** = `CourseSection` join `Timetable` theo `CourseID`, lọc theo năm học/học kỳ, `LecturerID` khác null, distinct theo `CourseID`.

**Loại trừ** (hàm `GetSchedulableExclusionReason`):
- `Credits <= 0`
- `Session > 4` (hằng `MaxSchedulableSession`)
- Tên học phần chứa: `đồ án` · `do an` · `thực tập` · `thuc tap` · `capstone` · `internship` · `kiến tập` · `kien tap`

**Chọn và sắp thứ tự**: `SelectBalancedSections` giới hạn số lớp bằng round-robin theo hàng đợi từng giảng viên. Thứ tự giải (`OrderSectionsForSolver`): lớp Anh văn ưu tiên trước (nhận diện bằng regex `\bA2\.2\b|\bB1\.1\b|CN\s*QLCN`), rồi `Session` dài hơn → nhiều sinh viên hơn → giảng viên tải nặng hơn → `FacultyID` → `LecturerID` → `CourseID`.

**Số tiết** lấy từ `Timetable.Session` (kẹp 1..6); nếu không có thì làm tròn `Credits` (kẹp 1..6); mặc định 3.

**Tuần dạy** (`WeekRangeHelper.Parse`): chuỗi rỗng → mọi tuần; chứa `-` hoặc `;` → phân tích theo token; số đơn → 1 tuần, **riêng `"1"` kèm `TotalWeek>0` nghĩa là `1..TotalWeek`**; không phân tích được → mọi tuần. **Hai lớp chỉ xung đột nếu tập tuần giao nhau.** Mặc định: HK1/HK2 = 16 tuần, HK3 = 4 tuần.

**Phòng**: lọc `IsAvailable != false` và `Capacity > 0`. Bảng `ClassroomPeriodLock` chặn từng cặp (phòng, tiết). Số phòng ứng viên mỗi lớp tối đa 18 (chế độ phủ tối đa: 32). Các dòng `Timetable` đã xếp và đã khóa của lớp khác trở thành **ràng buộc cố định**.

### 7.2 Biến quyết định

Tất cả đều là `BoolVar`, hình dạng thay đổi theo `SchedulePhaseMode`:

| Chế độ | Tên biến | Ý nghĩa |
|---|---|---|
| `TimeSlotsOnly` | `t_s{sec}_d{day}_p{start}` | (lớp, ngày, tiết bắt đầu) |
| `RoomsOnly` | `r_s{sec}_{room}_d{day}_p{start}` | Chỉ chọn phòng; ngày và tiết lấy cố định từ kết quả đã lưu |
| `Combined` | `c_s{sec}_{room}_d{day}_p{start}` | Chọn đồng thời ngày, tiết, phòng |
| `SessionOnly` | `sess_s{sec}_d{day}_am\|pm` | Một biến cho nửa buổi, neo tại tiết 1 (sáng) hoặc 6 (chiều) |
| `PeriodOnly` | `per_s{sec}_d{day}_p{start}` | Tinh chỉnh tiết cụ thể trong nửa buổi đã chọn |
| `Auto` | — | Chạy `TimeSlotsOnly` với **55%** ngân sách thời gian (tối thiểu 5s), rồi `RoomsOnly` với phần còn lại, ghép bằng `CombineTwoPhaseResults` |

Biến bị loại ngay khi sinh nếu: `start + n − 1 > TotalLessonPerDay`, hoặc chạm tiết buổi tối (≥ 11), hoặc vắt qua nghỉ trưa (`start ≤ 5` và `end ≥ 6`).

### 7.3 Ràng buộc cứng

| # | Ràng buộc |
|---|---|
| H1 | Mỗi lớp xếp **tối đa** 1 lần: `Σ(vars) ≤ 1`. **Được phép bỏ trống** — độ phủ được thưởng trong hàm mục tiêu chứ không ép buộc |
| H2 | Cấm buổi tối: mọi biến chạm tiết ≥ 11 bị đặt bằng 0 |
| H3 | Cấm vắt qua nghỉ trưa (tiết 5 → 6) |
| H4 | Giảng viên có cờ `HasMeeting` không dạy sáng thứ Năm (tiết 1–5) |
| H5 | Xung đột phòng: cùng phòng, cùng ngày, khoảng tiết giao nhau **và tuần giao nhau** → `a + b ≤ 1` |
| H6 | Ràng buộc với lịch đã khóa: cùng ngày, tuần giao, tiết giao, cùng giảng viên (trừ khi cả hai là nhóm thực hành song song) hoặc cùng phòng → biến = 0 |
| H7 | Xung đột giảng viên: cặp lớp đơn `a + b ≤ 1`; lớp đơn và nhóm thực hành song song loại trừ nhau; tối đa **10** lớp mỗi nhóm song song mỗi tiết; tối đa **5** nhóm song song đồng thời cùng giảng viên |
| H8 | Ngân sách tiết/ngày: `Σ(slotUsed × numberLesson) ≤ 9 − tiết đã cam kết`. Hằng số **9 tiết/ngày/giảng viên** |
| H9 | Tối đa **2** lớp mỗi giảng viên mỗi nửa buổi (sáng 1–5, chiều 6–10), tính cả lớp đã khóa |
| H10 | Tối đa **5** tiết mỗi giảng viên mỗi nửa buổi |
| H11 | Giảng viên không dùng đồng thời tiết 5 và tiết 6 trong cùng ngày |
| H12 | Sức chứa khung giờ: số lớp đồng thời mỗi (ngày, tiết, tuần đại diện) ≤ số phòng khả dụng trừ lớp đã có. Chỉ áp ở một số chế độ |
| H13 | Chênh lệch tiết giữa các ngày có dạy của cùng giảng viên ≤ **1**, tính theo từng tuần. Bỏ qua khi bật cờ `SkipInterDaySpreadHard` |

### 7.4 Hàm mục tiêu

Bài toán **cực tiểu hóa** tổng các số hạng sau:

| Thành phần | Công thức / trọng số mặc định |
|---|---|
| **Thưởng phủ lớp** | **`−1 000 000`** mỗi biến được chọn. Giá trị này **luôn lấn át mọi khoản phạt** — nghĩa là xếp được thêm một lớp luôn tốt hơn mọi cải thiện chất lượng |
| Phạt cơ bản | mỗi biến: `roomWaste × RoomWasteWeight` (lãng phí chỗ = `max(0, Capacity − NumberStudents)`) + phạt thứ Bảy (**50**) + phụ phạt chiều thứ Bảy (**70**, khi `start ≥ 6`) + phạt tiết muộn (**4**, khi `start = 10`) + phạt phòng sai khu cho lớp Anh văn (**300**) |
| Mở thêm ngày dạy | `opensNewDay × 80`; nếu giảng viên đã bận ngày đó và có bonus thì thưởng `−bonus × numberLesson` (bonus mặc định 0) |
| Khoảng trống giảng viên | mỗi cặp lựa chọn cùng giảng viên, cùng ngày, cùng nửa buổi, cách nhau `gap > 0`: `bothSelected × gap × (10 × 5 [+ 5 nếu khác tòa])`. Bỏ qua nhóm có hơn **120** lựa chọn |
| Đổi tòa nhà | `(số tòa dùng − 1) × 5` |
| Gom phòng cùng học phần + giảng viên | `excessBuilding × 12 + excessFloor × max(1, 12/2)` |
| Cân bằng ngày của giảng viên | `max(0, tiết/ngày − 4) × 8` |
| Cân bằng sáng/chiều của giảng viên | `12 × excess`, với `excess ≥ \|sáng − chiều\| − 1` |
| Ngày gần kín của giảng viên | `max(0, tiết/ngày − 8) × 20` |
| Cân bằng tải toàn cục theo ngày | `\|nDays × dayLoad − totalLoad\| × 22`, cần ≥ 2 ngày |
| Cân bằng sáng/chiều toàn cục | `\|sáng − chiều\| × 35` mỗi ngày; **thứ Bảy nhân 5**; riêng thứ Bảy cộng thêm `max(0, chiều − sáng) × 35 × 4` |

Phạt liên quan đến phòng chỉ áp ở chế độ có chọn phòng; phạt liên quan đến giờ chỉ áp ở chế độ chọn giờ hoặc `Combined`.

### 7.5 Cấu hình bộ giải và kết quả

Tham số truyền cho CP-SAT: `max_time_in_seconds` = `max(5, MaxTimeSeconds)` · `num_search_workers` = `Clamp(ProcessorCount, 4, 12)` · `relative_gap_limit:0.01`. **Chỉ ba tham số này** — không đặt seed, không cấp lời giải gợi ý, không bật log tìm kiếm.

**Trạng thái**: `Feasible` hoặc `Optimal` được chấp nhận và ghi vào `Timetable.SolverStatus` kèm `ObjectiveValue`. `Infeasible`/`Unknown`/`ModelInvalid` trả về thất bại kèm chẩn đoán. Ngoại lệ → trạng thái `"ERROR"`. **`Optimal` nghĩa là tối ưu chứng minh được hoặc đạt khoảng cách 1%**; `Feasible` nghĩa là tìm được nghiệm nhưng hết thời gian trước khi chứng minh tối ưu.

**Ghi kết quả**: tìm dòng `Timetable` theo `CourseID` chuẩn hóa, cập nhật `ScheduleBatchId`, `LecturerID`, `CourseName`, `Week`, `TotalWeek`, `SolverStatus`, `ObjectiveValue`, `UpdatedAt`. Chế độ `Combined` ghi cả ngày/tiết/phòng; chế độ phòng chỉ ghi `ClassroomID`; chế độ giờ ghi ngày/tiết và **đặt `ClassroomID = null`**. Sau đó xóa dòng trùng.

### 7.6 Chạy theo học kỳ

Các hằng số điều phối: kích thước chunk 18 (combined 12, retry 6) · thời gian tối thiểu mỗi lần giải 15s · lớp Anh văn 90s · lớp đơn lẻ 45s · tối đa 12 batch rỗng liên tiếp · batch mặc định 48 lớp · tối đa 100 batch · 120s mỗi batch.

**Pipeline LH-MIP** (bật mặc định): tối đa 35 lớp mỗi lần giải, tổng thời gian mặc định 3600s, tối thiểu 120s mỗi chunk. Chạy ba lượt theo thứ tự từ điển: **MaxCoverage → Quality → RoomEfficiency**, qua 5 tầng (tầng 0 là báo cáo khả thi).

**Job nền**: `SemesterScheduleJobService` là Singleton giữ trạng thái trong `ConcurrentDictionary` **trong bộ nhớ**. Trạng thái là chuỗi tiếng Việt ("Đang chờ", "Đang chạy", "Đã hủy", "Thất bại"). **Toàn bộ job mất khi khởi động lại tiến trình** — không có hàng đợi bền vững, không giới hạn số job đồng thời.

### 7.7 Giá trị cứng theo đặc thù DUT

Những giá trị sau được viết thẳng trong mã, **phải sửa nếu dùng cho trường khác**:

- 14 tiết/ngày; nghỉ trưa giữa tiết 5 và 6; cấm tiết 11–14
- Họp giao ban sáng thứ Năm
- Nhóm thực hành song song nhận diện bằng regex `^\d{15}[A-Z]$`, tiết bắt đầu ưa thích {1, 7}
- Phòng thực hành vật lý ưu tiên: D211, D212, D207, D112; sức chứa hiệu dụng phòng thí nghiệm gọn là **30** dù CSDL ghi 25
- Khoa Kiến trúc `FacultyID = 121` với phòng đồ án F201/F202/F203
- Phòng Anh văn nhận diện bằng regex `^B[12][A-Z0-9]`
- Danh sách từ khóa riêng cho xưởng cơ khí, xưởng điện, phòng tin học, phòng thực phẩm

### 7.8 Giới hạn thực tế

- Số biến chế độ `Combined` ≈ lớp × 6 ngày × ~10 tiết × tối đa 18 phòng → có thể vượt 1000 biến mỗi lớp, nên **bắt buộc chia chunk 12–18 lớp**
- Ràng buộc xung đột phòng và giảng viên là **O(n²)** trong mỗi nhóm; phạt khoảng trống bị cắt ở 120 lựa chọn mỗi nhóm
- Thời gian: 30–60s mỗi lần giải, 120s mỗi batch, LH-MIP tổng 3600s; tối đa 12 luồng
- **Chỉ xếp được lớp đã có dòng skeleton trong `Timetable`** và có `Session ≤ 4`
- Một tiến trình, không phân tán, job không bền vững

---

## 8. Cấu hình hệ thống

Bảng `SystemConfigs` dạng khóa–giá trị. Giá trị rỗng được lưu `NULL` và hệ dùng mặc định trong mã. Thao tác cập nhật hàng loạt **từ chối khóa lạ chưa tồn tại**.

| Khóa | Mặc định | Ghi chú |
|---|---|---|
| `DefaultAcademicYear` | `2025-2026` | |
| `DefaultSemester` | `10` | Chỉ `10` hoặc `20` hợp lệ; 1→10, 2→20, 3 hoặc 21→20 |
| `TotalLessonPerDay` | `14` | |
| `TeachingDays` | `2,3,4,5,6,7` | Thứ Hai đến thứ Bảy |
| `AllowedStartLessons` | `1,…,10` | Tiết 11–14 bị cấm cứng trong mã |
| `LessonTimeConfig` | `1=07:00-07:50; … 14=19:55-20:40` | Bảng giờ 14 tiết |
| `MaxSchedulableSession` | `4` | Lớp có `Session` lớn hơn bị bỏ qua |
| `MaxTimeSeconds` | `60` | |
| `MaxCourseSections` | `100` | |
| `MaxRoomCandidatesPerSection` | `18` | |
| `RoomWasteWeight` | `1` | |
| `SaturdayPenalty` | `50` | |
| `SaturdayAfternoonExtraPenalty` | `70` | |
| `LateLessonPenalty` | `4` | |
| `EveningLessonPenalty` | `0` | **Không có tác dụng** — buổi tối đã bị cấm cứng |
| `LecturerBuildingChangePenalty` | `5` | |
| `LecturerGapPenalty` | `10` | |
| `LecturerExtraDayPenalty` | `80` | |
| `LecturerSessionBalancePenalty` | `12` | |
| `LecturerSessionBalanceTolerance` | `1` | |
| `DayLoadBalancePenalty` | `22` | |
| `DaySessionBalancePenalty` | `35` | |
| `LecturerDailyBalancePenalty` | `8` | |
| `LecturerDailyBalanceTarget` | `4` | |
| `EnglishBZoneRoomPenalty` | `300` | |
| `LecturerFullDayPenalty` | `20` | |
| `LecturerFullDayThreshold` | `8` | |
| `LecturerPackBusyDayBonus` | `0` | |
| `LecturerCourseRoomClusterPenalty` | `12` | |
| `MaxLecturerLessonsPerDay` | `9` | **Khóa tồn tại nhưng KHÔNG có hiệu lực** — mã dùng hằng số 9 và ghi đè giá trị gửi lên |

**Lệch giá trị mặc định**: lớp `ScheduleOptions` khai `LecturerGapPenalty = 2` và `LecturerExtraDayPenalty = 0`, khác với mặc định cấu hình là 10 và 80. Hàm nạp cấu hình cấp lại 10/80 nên sai lệch này thường không lộ ra — nhưng sẽ lộ nếu ai đó dùng `ScheduleOptions` trực tiếp.

**Biến môi trường**: `ConnectionStrings__DefaultConnection` · `JWT_SECRET_KEY` · `CORS_ALLOWED_ORIGINS` · `USE_REDIS` · `REDIS_CONNECTION_STRING` · `ASPNETCORE_URLS` · `ASPNETCORE_ENVIRONMENT`.

---

## 9. Mã chết và tính năng bỏ dở

**`LecturerAvailability` — đã xác nhận bị comment toàn bộ.** Entity dự kiến gồm `AvailabilityID` (khóa), `LecturerID`, `DayOfWeek`, `StartLesson`, `NumberLesson`, `IsAvailable` (mặc định true), `Note`, ánh xạ vào bảng `LecturerAvailability`. Không có DbSet, không có cấu hình, không service nào dùng. Tàn dư duy nhất còn sống là `LecturerAvailabilityDTO` trong tệp DTO giảng viên.

> **Ý nghĩa**: tính năng này nhằm cho phép **khai báo cửa sổ thời gian rảnh của từng giảng viên** để bộ giải tôn trọng. Nó chưa bao giờ hoàn thành. Trên thực tế bộ giải **chỉ có một ngoại lệ duy nhất về lịch cá nhân**: cờ `HasMeeting` chặn sáng thứ Năm. Đây là giới hạn đáng kể nếu ai đó kỳ vọng hệ tôn trọng lịch bận của giảng viên.

**Khác**: các DTO không dùng (`UserSessionDTO`, `SsoRequestDTO`, `ScheduleDTO` với trường tiếng Việt, bản trùng `PagedResult<T>`); cấu hình `AzureAd` không được mã nào đọc; hai khóa cấu hình không có hiệu lực (mục 8). **Không có TODO/FIXME nào trong mã.**

---

## 10. Chất lượng và rủi ro

| Hạng mục | Thực trạng |
|---|---|
| Kiểm thử | **Không có** — không thư mục test, không project test, CI không có stage test |
| Migration | **Không có** — lược đồ không được mã hóa trong repo, không tái tạo được CSDL từ mã nguồn |
| Tài liệu | README là template GitLab rỗng |
| Bảo mật | Mật khẩu plaintext · SSO không xác minh chữ ký (chiếm tài khoản) · khóa JWT từng commit vào repo · ~57 endpoint ẩn danh gồm CRUD tài khoản và điều khiển lịch · vai trò không bao giờ được kiểm · cho phép dò tên tài khoản · không giới hạn tần suất · Swagger công khai ở Production · không ép HTTPS |
| Tính đúng đắn | Dùng `DateTime.Now` thay vì UTC cho token và dấu thời gian · khóa chính kiểu nullable · không FK/unique ở tầng CSDL · trùng dòng xử lý bằng mã thay vì ràng buộc · job nền mất khi khởi động lại |
| Triển khai | Dockerfile yêu cầu publish thủ công trước · CI không tự triển khai · bước pre-build `taskkill` chỉ chạy được trên Windows |
| Cấu trúc mã | `ScheduleService` là partial class rất lớn · hardcode đặc thù DUT rải khắp (tên phòng, ID khoa, regex mã lớp) |

---

## 11. Hệ quả cho dự án Quản lý CTĐT

| Câu hỏi | Trả lời |
|---|---|
| Có dùng làm nền không? | **Không.** Thiếu toàn bộ khái niệm cốt lõi: không `Student`, không `Program`/CTĐT, không danh mục học phần tách rời lớp học phần, không thực thể `Semester` |
| Có thực thể nào trùng lắp cần lưu ý? | `Faculty`, `Lecturer`, `Account`/`Role` — hệ CTĐT sẽ có phiên bản riêng của các khái niệm này. `CourseSection` ở đây là **lớp học phần**, không phải học phần, nên không xung đột với danh mục học phần của hệ CTĐT |
| Có cần tích hợp dữ liệu không? | Chỉ khi hệ CTĐT cần biết lớp học phần đã mở. Khi đó `CourseSection.CourseCode` là điểm nối tự nhiên tới mã học phần — nhưng **không có khóa ngoại nào bảo đảm tính toàn vẹn của liên kết này** |
| Phần nào đáng học hỏi? | Mô hình CP-SAT ở mục 7: cách mã hóa ràng buộc xung đột theo tập tuần giao nhau, và kỹ thuật dùng phần thưởng rất lớn để biến ràng buộc "phải xếp" thành mục tiêu mềm |
| Phần nào tuyệt đối không sao chép | Toàn bộ mục 6 — cơ chế xác thực và phân quyền |
| Nếu phải tích hợp ở mức API | Coi như hệ **không đáng tin về xác thực**. Mọi lời gọi phải đi qua một lớp trung gian có kiểm soát, không phơi trực tiếp ra người dùng cuối |

---

## 12. Giới hạn của khảo sát này

Tài liệu dựa trên khảo sát mã nguồn ngày 2026-10-01. Những phần **đã đọc đầy đủ**: khởi động ứng dụng, controller xác thực, toàn bộ entity và DbContext, toàn bộ DTO, các script, định nghĩa cấu hình lịch, và các phần cốt lõi của `ScheduleService` (biến, ràng buộc, sức chứa, xung đột giảng viên, phân bố, hàm phạt).

Những phần **chỉ đọc ở mức tên hàm, hằng số và kích thước**, chưa đọc từng dòng: pipeline LH-MIP, logic nới lỏng ràng buộc khi thất bại, báo cáo khả thi, điều phối batch học kỳ, logic chọn phòng ứng viên chi tiết, xử lý slot mồ côi, gán phòng thủ công, các service dashboard và CRUD.

> **Hệ quả**: mô tả về LH-MIP, cơ chế retry khi nới lỏng, và cách tính phòng ứng viên trong tài liệu này ở **mức tổng quan, không phải đặc tả cuối cùng**. Nếu cần tái hiện chính xác các phần đó thì phải đọc lại mã nguồn.

Con số "khoảng 57 endpoint ẩn danh" là tổng hợp thủ công từ bảng ở mục 5, nên có thể lệch một vài đơn vị. Tỷ lệ áp đảo so với 3 endpoint có xác thực thì chắc chắn đúng.
