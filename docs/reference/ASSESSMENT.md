# Đánh giá đối chiếu: Yêu cầu PBL6 ↔ 3 hệ thống đang tồn tại

**Ngày**: 2026-09-25
**Nguồn plan**: `Requirements.pdf` (51 trang, 107 FR / 31 BR / 27 NFR / 12 DEC / ~35 thực thể)
**Nguồn hiện trạng**: khảo sát 3 repo bằng 3 agent độc lập (`plo-clo-backend`, `course-registration`, `tkb-be`)
**Phạm vi tài liệu này**: (1) có gì rồi, (2) schema từng hệ, (3) lệch giữa plan và hiện trạng, (4) hệ quả cho quyết định kiến trúc.

---

## 0. Kết luận trước (TL;DR)

| Câu hỏi | Trả lời |
|---|---|
| Có repo nào là nền để build hệ CTĐT lên không? | **`plo-clo-backend` (srms)** — gần nhất, đã có PLO/CLO/Curriculum/6 role/audit log. Nhưng chỉ phủ **M4 một phần + M10/M11 một phần**. |
| `course-registration` là gì so với plan? | Chính là **"hệ thống ĐKHP hiện hành"** mà §12 mục 3 **loại khỏi phạm vi**. Là **hệ tiêu thụ API** (vai trò gần dDUT) + **nguồn dữ liệu chỉ đọc** (SV, KQHT). Không phải nền để build. |
| `tkb-be` là gì so với plan? | Chính là **"hệ xếp thời khóa biểu"** mà §12 mục 2 **loại khỏi phạm vi**. Không liên quan, trừ vài bảng org/auth. |
| Phần lõi của plan đã có ở đâu chưa? | **Chưa có ở bất kỳ repo nào**: phê duyệt 3 cấp (M6), versioning snapshot (M7), đề cương chi tiết (M5), rules engine + phát hiện chu trình (M8), phân quyền theo phạm vi đối tượng (M1). Đây là phần khiến hệ này *là* hệ quản lý CTĐT. |
| Rủi ro kiến trúc lớn nhất | **Ba repo, ba DB engine, ba cách auth, ba mô hình `Course` khác nhau** — và plan bắt buộc monolith (RB-01). Xem §6. |

---

## 1. Ba hệ thống — ảnh chụp nhanh

| | `plo-clo-backend` ("srms") | `course-registration` | `tkb-be` (SmartSchedule.API) |
|---|---|---|---|
| Mục đích | Theo dõi PLO/CLO + quản trị điểm/ca thi | Đăng ký học phần (production, live) | Xếp thời khóa biểu tự động |
| .NET | 8 | 8 | 9 |
| DB | **SQL Server → PostgreSQL** (dual-provider, đang cutover) | **PostgreSQL 16** | **SQL Server** (`DUT_Smart_Schedule`) |
| Migration | EF Core, 2 assembly/provider, `Migrate()` lúc boot | EF Core, 11 migration | **KHÔNG CÓ** — schema sửa tay bằng ALTER script |
| Auth | JWT (4 scheme: CustomJWT/DDUT_JWT/Microsoft/ApiKey), **Argon2id**, refresh token multi-slot | JWT + Microsoft SSO, **BCrypt** | JWT + Microsoft SSO (id_token **không verify chữ ký**), **mật khẩu plaintext** |
| Role | 6: Admin, AcademicAffairs, ProgrammeManager, Teacher, Student, FacultyManager | 5: Admin, Lecturer, AcademicAffairs, Viewer, Student — **mỗi role một bảng riêng** | DB-driven, string tự do |
| Phân quyền | `[Authorize(Roles=…)]` + 1 chỗ row-level (`TeacherClassAuthorization`) | `[Authorize(Roles=…)]` + policy `ActiveStudent` | **Gần như không có** — chỉ 3 endpoint có `[Authorize]` |
| Hạ tầng thêm | QuestPDF/EPPlus/DocX, CA DUT chữ ký số | **Kafka + Redis + SignalR**, 3 replica BackendAPI | Google OR-Tools CP-SAT, Redis optional |
| Test | **40 tệp, ~9.5k LOC, Testcontainers** | **Không có** | **Không có** |
| Docs | CLAUDE.md, SECURITY_AUDIT.md (38KB, có audit lại), runbook cutover | CI-CD.md, `db-migration/readme.md` (550 dòng runbook production) | README = template GitLab rỗng |
| LOC nghiệp vụ | Services ~23k | Application ~14.5k | Services ~8k (ScheduleService ~5.8k) |
| Độ chín | **Cao** — production, có security audit, có test | **Cao** — production, có sự cố thật đã log, có load test | Solver rất chín; phần còn lại mỏng |

---

## 2. Schema hiện có — theo từng repo

### 2.1 `plo-clo-backend` (srms) — 28 DbSet
Thực thể thật ở `src/srms.Domain/Models/` (thư mục `Models/` gốc chỉ là mirror của SIS cũ).

| Nhóm | Thực thể |
|---|---|
| Tổ chức | `Faculty` · `Major` · `Programme`(Name, Code, **IsConfirmed**, MajorId, AccountId) · `WorkUnit` · `Cohort` |
| Học phần/CTĐT | `Course`(Code, Name, **Credits decimal(3,1)**, IsConfirmed, IsDoctoral, FacultyId, **DependentCourseId self-FK**) · **`Curriculum`**(ProgrammeId, CourseId, **IsCore**, **AcademicSemester int**) · `StudentCourse`(HP thay thế theo từng SV) |
| Chuẩn đầu ra | **`PLO`**(ProgrammeId) · **`CLO`**(CourseId, **SemesterId**) · **`CoursePLO`**(CourseId, PLOId, **Weight decimal(5,2)**) · PLO↔CLO M:M · Question↔CLO M:M |
| Lớp/thi/điểm | `Class` · `Exam`(Type, **Category** CA/Midterm/Final, **Weight**, bộ deadline) · `Question`(**Weight, Scale**) · `Result`(StudentId, QuestionId, Score) · `StudentExam`(điểm tổng cached) · `ParentExamSession`/`ChildExamSession`/`StudentChildExamSession` |
| Phúc khảo/đính chính | `ScoreAppeal` + **`ScoreAppealStatus` enum** (Pending→Assigned→Marked→Applied/Rejected) · `AppealedResult` · `CorrectedResult` |
| Người dùng | `Account`(RoleId, FacultyId, MicrosoftEmail) · `Role` (6 seeded) · `RefreshToken`(SlotIndex) · `Student`(**Status** Dismissed/Active/Graduated, DecisionNumber/Date) · `Teacher` |
| Tính toán | **`StudentPLO`**(Score, CalculatedAt, **IsActive**) · **`StudentProgrammeCompletion`**(IsCompleted, **FailureReasons List\<string\>**, PloScoreThreshold, IsActive) |
| Hệ thống | `Setting`(CurrentSemesterId, CLOScoreThreshold, PLOScoreThreshold) · **`UserActivityLog`**(EntityBefore/After JSON, tự ghi trong `SaveChanges`) · `SignedScoreSheet` |

**Công thức điểm đã hiện thực** (`ResultService.cs`):
- `StudentExam.Score = Σ(Result.Score × Question.Weight / Question.Scale)`
- `CLO score = Σ(Score/Scale × Question.Weight × Exam.Weight)` · `CLO max = Σ(Question.Weight × Exam.Weight)`
- `Pk = 10 × Σ(CLO score) / Σ(CLO max)` cho các CLO của HP map vào 1 PLO
- `PLO score = Σ(MaxPk × Course.Credits) / Σ(Course.Credits)` — bình quân theo tín chỉ
- **Xét tốt nghiệp**: `StudentProgrammeCompletion.IsCompleted` theo ngưỡng PLO, kèm `FailureReasons`

### 2.2 `course-registration` — PostgreSQL, 8 project
| Nhóm | Thực thể |
|---|---|
| Tổ chức | `Faculty`(IsDUT) · `Major` · **`Program`**(Credits float, **ElectiveCredits float**, **Semesters int**, EducationLevel, StartDate/EndDate) · `Class`(lớp sinh hoạt) · `ClassRoom` |
| Học phần/CTĐT | **`Course`**(Credits + **TheoryCredits/PracticeCredits/ProjectCredits/AssignmentCredits/InternshipCredits** float) · **`CourseInProgram`**(CourseId, ProgramId, **Order**, **Semester**, **IsElectiveCourse**, IsPreProjectRequired, IsProjectPrerequisite) · **`CourseRequirement`**(ProgramId, MainCourseId, RequiredCourseId, **RequirementTypeId**) · `CourseRequirementType` · **`AlternativeCourse`** |
| Đăng ký | `CourseSection`(Capacity, RegisteredCount, ReservedCapacity, **Schedule** string mã hóa, StudyWeeks) · `StudentInCourseSection`(IsReserved, IsConfirmed) · `CourseRegistrationDemand` · **`RegistrationPhase`** + `RegistrationPhaseTime` (8 PhaseType) · `Settings` k/v |
| SV/điểm | `Student`(ProgramId, MaxCreditsAllowed, IsWebsiteLocked/IsSuspended/IsOverdue/IsProfileComplete) · `StudentCreditLimit` · **`StudentGrade`**(Score10Scale, LetterGrade, Score4Scale, Retake) · **`CourseExemption`**(miễn/chuyển điểm) |
| Người dùng | `Admin` · `AcademicAffairs` · `Lecturer` · `Viewer` · `User` — **5 bảng phẳng, mỗi role một bảng** · `AdminActionLog` · `CourseRegistrationLog` |

**Logic đã hiện thực** (`CourseRegistrationService.cs` ~1550 dòng):
- Tiên quyết/song hành: `RequirementTypeId` 1 = đã học qua (mọi điểm), 2 = đã đạt (≠F/I), 3 = song hành, 4 = khai báo nhưng **chưa hiện thực**
- **Tương đương bằng union-find** trên `AlternativeCourse` (`Canonical()`/`Mapping()`) — đã có tính bắc cầu
- Nhóm tiên quyết tự chọn: `IsRequiredCourseElective` → chỉ cần 1 trong nhóm thỏa
- **BFS đồ thị phụ thuộc ngược** → tính HP nào mất điều kiện nếu SV rút 1 HP
- `SELECT … FOR UPDATE` + đếm lại thật khi ghi → chống oversell
- Ngoại lệ hardcode GDTC (`FacultyId=="013"`): bỏ qua kiểm tra CTĐT + tiên quyết
- `db-migration/` = pipeline pgloader đồng bộ 10 bảng từ **SQL Server `tmHoSoSV`/`tmKhungCT`** (SIS cũ của trường)

### 2.3 `tkb-be` — SQL Server, không migration
| Nhóm | Thực thể |
|---|---|
| Org/Auth | `Account`(**Password plaintext**) · `Role` · `Account_Role` · `Faculty`(FacultyCode bị `Ignore()`, fake = ID) · `Lecturer`(FacultyID thêm bằng ALTER, **không cấu hình Fluent API**) |
| Xếp TKB | `Classroom`(Capacity, Building, IsSpecialized) · `ClassroomPeriodLock` · **`CourseSection`**(CourseID PK = mã lớp HP, CourseCode, Credits double, IsPFIEV/IsLanguage/IsSpecial) · **`Timetable`**(ScheduleBatchId, Week, DayOfWeek, Session, StartLesson, SolverStatus, ObjectiveValue) · `SystemConfigs` k/v (28 tham số solver) |

Không có `Student`, không có `Program`, không có `Course` catalog tách rời, không có `Semester` entity. `LecturerAvailability` bị comment toàn bộ (feature bỏ dở).

---

## 3. Đối chiếu theo module M1–M11

Thang: ✅ có, dùng được · 🟡 có một phần / sai mục đích · ❌ không có

| Module | Plan yêu cầu | plo-clo | course-reg | tkb-be | Đánh giá |
|---|---|:--:|:--:|:--:|---|
| **M1** Tổ chức & phân quyền | DonVi cây cha-con, **NhomChuyenMon**, ThanhVienNhomCM n-n, PhanQuyen **có phạm vi đối tượng + thời hạn**, UyQuyenDuyet, PhanCongGiamDoc | 🟡 | 🟡 | ❌ | Cả 3 chỉ có `Faculty` phẳng. **Không repo nào có Nhóm chuyên môn / Bộ môn** — mà đây là cấp duyệt Cấp 1 của plan. Không repo nào có phân quyền theo phạm vi hay có thời hạn. srms gần nhất (6 role trùng tên vai trò plan + `Programme.AccountId` ≈ PhanCongGiamDoc). |
| **M2** Danh mục học phần | HocPhan (TC số thực, tên VI/EN, 8 loại, trạng thái), **QuanHeHocPhan 5 loại**, NhomHocPhanTuongDuong, **phát hiện chu trình** | 🟡 | ✅🟡 | ❌ | **course-reg mạnh nhất**: `CourseRequirement` 3/5 loại chạy thật + `AlternativeCourse` + union-find bắc cầu (khớp BR-09) + TC số thực có chia nhỏ. Thiếu: QH5 thay thế cấp CTĐT, tên EN, 8 loại HP, trạng thái HP, **phát hiện chu trình (FR-20/BR-11) — không repo nào có**. srms chỉ có `DependentCourseId`, dùng để chuyển điểm TN/TH, **không phải tiên quyết**. |
| **M3** CTĐT & khung | ChuongTrinhDaoTao + **PhienBanCTDT** + DongKhungCTDT (kyHieu, htDA, tqDA, diemHoc, diemChuyen) + **NhomTuChon(min TC)** + KhoiKienThuc; nhân bản CTĐT; nhập/xuất Excel dry-run | 🟡 | 🟡 | ❌ | Cả hai có bảng join CTĐT↔HP: srms `Curriculum`(IsCore, AcademicSemester), course-reg `CourseInProgram`(Order, Semester, IsElectiveCourse). **Cả hai đều KHÔNG có phiên bản, KHÔNG có nhóm tự chọn với ngưỡng TC tối thiểu, KHÔNG có khối kiến thức, KHÔNG có kyHieu/htDA/tqDA/diemHoc/diemChuyen**. srms có `CopyProgrammeStructureAsync` (≈FR-25 nhân bản) nhưng one-shot. course-reg `SyncProgramCoursesAsync` **xóa rồi chèn lại** — phá hủy, trái hoàn toàn BR-23. |
| **M4** PLO/CLO | PLO theo CTĐT, CLO theo đề cương, **ma trận CLO-PLO theo cặp (CTĐT,HP)**, suy diễn HP-PLO, cảnh báo lỗ hổng, xuất Excel kiểm định | ✅🟡 | ❌ | ❌ | **Đây là giá trị lớn nhất của srms.** `PLO`(ProgrammeId) khớp BR-17. Nhưng `CLO` gắn `CourseId` **+ `SemesterId`** (plan gắn đề cương, BR-18) và **`CoursePLO` chỉ khóa (Course, PLO) — KHÔNG có ProgrammeId** → **vi phạm trực tiếp BR-19/DEC-03**. Xem §4.1: lệch nghiêm trọng nhất. |
| **M5** Đề cương & công thức điểm | DeCuongChiTiet **1 HP = 1 đề cương** (DEC-02), NoiDungTheoTuan, ThanhPhanDanhGia (**tổng trọng số = 100%**), MapThanhPhan_CLO, TaiLieuDinhKem, điểm liệt | 🟡 | ❌ | ❌ | **Không repo nào có thực thể đề cương.** srms có "công thức điểm" ở mức **lớp học phần** (`Exam.Weight` + `Question.Weight/Scale` + `Question↔CLO`) — tương tự ThanhPhanDanhGia + MapThanhPhan_CLO nhưng **gắn `Class`, không gắn đề cương**, nên mỗi lớp mỗi kỳ phải khai lại. **Không có ràng buộc tổng = 100% (BR-12)**, không có cờ điều kiện/ngưỡng (BR-15). |
| **M6** Phê duyệt 3 cấp | DeXuatThayDoi + NoiDungThayDoi(JSON cũ/mới) + BuocDuyet 3 cấp + diff + Trả lại/Từ chối + thu hồi + tự bỏ qua cấp + thông báo + hàng đợi | ❌ | ❌ | ❌ | **Không có ở bất kỳ repo nào.** srms có 2 workflow bespoke nhưng cho **điểm**, không cho CTĐT: `ScoreAppeal` (enum 5 trạng thái, gán người chấm — pattern gần nhất, tham khảo được) và `CorrectedResult`. `Programme.IsConfirmed` chỉ là **1 boolean**, không phải state machine. Không repo nào có DeXuat/diff/notification/work queue. |
| **M7** Phiên bản | Ảnh chụp bất biến toàn bộ khi duyệt cuối, metadata QĐ, so sánh 2 PB, ánh xạ Khóa SV→PB, thu hồi = PB đính chính | ❌ | ❌ | ❌ | **Không có ở bất kỳ repo nào cho nội dung CTĐT.** srms chỉ versioning **kết quả tính toán** (`StudentPLO`/`StudentProgrammeCompletion` có `IsActive`+`CalculatedAt`) — pattern soft-version tham khảo được nhưng không phải versioning cấu trúc. course-reg dùng `Student.EnrollmentYear` để gate đợt đăng ký, không phải ánh xạ khóa→phiên bản. |
| **M8** Rules engine | Tự tính tổng TC, cảnh báo lệch + ghi đè có lý do, **phát hiện chu trình**, tiên quyết xếp sau HP phụ thuộc, HP trùng, dashboard sức khỏe, **"Đăng ký được?" 3 trạng thái**, **xét tốt nghiệp** | 🟡 | ✅🟡 | ❌ | Chia hai nửa. **Điều kiện đăng ký → course-reg đã có gần trọn §7.3** (tiên quyết theo ngưỡng, học trước, song hành, tương đương bắc cầu, BFS phụ thuộc). **Xét tốt nghiệp → srms đã có nhưng KHÁC HẲN**: srms xét theo **ngưỡng điểm PLO**, plan §7.4 xét theo **tín chỉ bắt buộc + nhóm tự chọn + HP điều kiện 0 TC**. Không repo nào có: phát hiện chu trình, kiểm tra nhất quán tổng TC, dashboard sức khỏe. |
| **M9** Cổng SV & API | SV thấy đúng PB của khóa, tiến độ, HP đủ ĐK + lý do, đề cương, **REST + OpenAPI cho dDUT**, responsive | 🟡 | ✅🟡 | ❌ | Cả hai có endpoint self-service (srms `my-plo-scores`, `my-programme-completion`, `student-plo-scores-by-code` qua **DDUT_JWT — tức đã tích hợp dDUT thật**; course-reg `me/*`, `available` + lý do không đủ ĐK). Nhưng **không endpoint nào theo phiên bản CTĐT** (chưa có phiên bản). 6 endpoint `/api/v1/…` của plan chưa tồn tại. |
| **M10** Tích hợp | Nhập Excel 4 loại + **dry-run + all-or-nothing**, kết nối CSDL có sẵn **chỉ đọc**, đồng bộ định kỳ + log, quy tắc ưu tiên | ✅🟡 | 🟡 | ❌ | **srms mạnh nhất và đúng pattern plan**: `SourceDbContext` = **read-only NoTracking tới SQL Server `DHBK_CDS`** (khớp §8.1 "CSDL có sẵn chỉ đọc"); `DataTransferController` **~44 endpoint cặp preview(dry-run)+transfer(commit)** = đúng FR-34; import Excel có preview cho điểm/phân công GV. Thiếu: **đồng bộ định kỳ — không repo nào có hosted service/scheduler**, `LogDongBo`, quy tắc ưu tiên §8.2 dạng cấu hình. course-reg có pgloader nhưng là script vận hành tay. |
| **M11** Báo cáo & kiểm định | Đối sánh 2 CTĐT, thống kê TC theo khối, **xuất ma trận PLO/CLO cho AUN-QA + Bộ**, nhật ký bất biến, tra cứu nhật ký | 🟡 | 🟡 | ❌ | **srms `UserActivityLog` khớp gần trọn FR-105/NFR-10** (tự ghi EntityBefore/After JSON trong `SaveChanges`, có API tra cứu theo khoảng ngày + phân trang). Xuất Excel/Word/PDF ma trận CLO/PLO **đã có** (EPPlus/DocX/QuestPDF + CA DUT chữ ký số). Thiếu: đối sánh 2 CTĐT, thống kê TC theo khối kiến thức (chưa có khối). |

**Tổng hợp mức phủ**: M5/M6/M7 gần như 0%; M1/M3 ~20%; M2/M8 ~50% nhưng nằm ở repo bị plan loại khỏi phạm vi; M4 ~60% nhưng sai khóa; M10/M11 ~50% ở srms.

---

## 4. Các lệch nghiêm trọng (mismatch) — xếp theo mức chặn

### 4.1 🔴 `CoursePLO` không có `ProgrammeId` → vi phạm BR-19 / DEC-03
| | |
|---|---|
| Plan | `MaTranCLO_PLO(CTĐT, HocPhan, CLO, PLO, mức đóng góp)` — ma trận **tách theo từng CTĐT** (BR-19, DEC-03, FR-40) |
| srms | `CoursePLO(CourseId, PLOId, Weight)` — **không có ProgrammeId** |
| Vì sao vẫn "chạy" hiện nay | `PLO.ProgrammeId` tồn tại, nên suy được CTĐT *gián tiếp* qua PLO. Đúng khi một HP chỉ nằm trong 1 CTĐT. |
| Vỡ khi nào | HP dùng chung 2 CTĐT (chính là tình huống plan mô tả ở Q-01) và một CLO cần đóng góp khác nhau vào PLO của từng CTĐT → không biểu diễn được. Thêm nữa `CLO` gắn `SemesterId`, tức CLO theo *lần mở lớp*, còn plan là CLO theo *đề cương* (BR-18). |
| Hệ quả | Migration đổi khóa: `CoursePLO` → (ProgrammeId, CourseId, CLOId, PLOId). Ảnh hưởng `CoursePLOService`, `ResultService.CalculatePkScore`, `CalculatePLOScore`. **Không phải sửa nhỏ.** |
| Liên quan | Chính là **Q-01 §13** của plan còn treo. Nếu chốt "CLO phải khác theo CTĐT" thì DEC-02 (1 HP = 1 đề cương) sai và phải tách đề cương theo cặp — thay đổi lớn hơn nữa. **Phải chốt Q-01 trước khi thiết kế M4/M5.** |

### 4.2 🔴 Hai định nghĩa "tốt nghiệp" xung đột
| | |
|---|---|
| Plan §7.4 | ĐỦ ⟺ (mọi HP bắt buộc đạt, có tính tương đương) ∧ (mỗi nhóm tự chọn ≥ `tinChiToiThieu`) ∧ (ΣTC tích lũy ≥ `tongTinChiYeuCau`) ∧ (mọi HP điều kiện 0 TC hoàn thành) |
| srms | `StudentProgrammeCompletion.IsCompleted` ⟺ mọi **điểm PLO ≥ PloScoreThreshold** (+ CTĐT đã confirm, đủ kết quả) |
| Bản chất | Plan xét **tín chỉ/cấu trúc khung**; srms xét **chất lượng đầu ra**. Không cái nào bao hàm cái kia. |
| Hệ quả | Không tái dùng được `StudentProgrammeCompletion` cho FR-84. Phải viết `XetTotNghiep` mới. Nhưng `FailureReasons List<string>` + soft-version `IsActive` là pattern rất đúng cho `KetQuaXetTotNghiep(kết luận, thiếu hụt JSON)` → **giữ pattern, đổi logic**. |
| Lưu ý | srms **không có tín chỉ tích lũy, không có nhóm tự chọn, không có HP 0 TC** → 3/4 điều kiện của plan hiện không tính được với schema srms. |

### 4.3 🔴 Không hệ nào có phiên bản CTĐT — và một hệ chủ động phá hủy dữ liệu
| | |
|---|---|
| Plan | FR-69/71, BR-22/23/26, DEC-01: ảnh chụp **bất biến** toàn bộ khi Phòng ĐT duyệt cuối; tối đa 1 PB hiệu lực; SV gắn PB lúc nhập học, giữ suốt khóa |
| srms | Sửa `Curriculum` của CTĐT đã confirm = **ghi đè tại chỗ**. `IsConfirmed` là 1 bool, không có lịch sử. |
| course-reg | `SyncProgramCoursesAsync` = **DELETE toàn bộ `CourseInProgram` + `CourseRequirement` rồi INSERT lại** |
| Hệ quả | `PhienBanCTDT` + `DongKhungCTDT` **phải là bảng mới**. Mọi FK hiện trỏ `ProgrammeId`/`ProgramId` trực tiếp sẽ phải trỏ `PhienBanId` — thay đổi lan rộng nhất trong toàn bộ phần tái dùng. `StudentPLO.IsActive` là pattern soft-version tham khảo được nhưng chỉ cho hàng tính toán, không cho snapshot cấu trúc. |
| Cảnh báo | Nếu chọn tái dùng DB course-reg, `SyncProgramCoursesAsync` phải bị **vô hiệu hóa hoặc viết lại** trước khi đưa dữ liệu CTĐT thật vào — nó trái BR-23 ở mức phá hủy. |

### 4.4 🟠 Cấp duyệt 1 không có đơn vị tổ chức tương ứng
Plan: Cấp 1 = **Trưởng nhóm chuyên môn phụ trách học phần bị tác động** (§6.1.3); Khoa CNTT có **04 nhóm**; GV thuộc nhiều nhóm (n-n).
Hiện trạng: cả 3 repo chỉ có `Faculty` (Khoa) phẳng. `tkb-be` không có cả Bộ môn. `HocPhan.nhomCM` (FR-16) không tồn tại ở đâu.
Hệ quả: `NhomChuyenMon` + `ThanhVienNhomCM` + `HocPhan.nhomChuyenMonId` là **tiền đề của toàn bộ M6** — không có nó thì không xác định được người duyệt Cấp 1. Phải làm trước M6, không thể để sau.

### 4.5 🟠 Phân quyền: plan yêu cầu (Vai trò × Phạm vi đối tượng), hiện trạng là role-string
| Plan | Hiện trạng |
|---|---|
| `PhanQuyen(người dùng, vai trò, **phạm vi đối tượng**, **thời hạn hiệu lực**)`; ma trận X/Đ/P; `UyQuyenDuyet` có thời hạn (FR-09); NFR-09 kiểm ở tầng server | srms: `[Authorize(Roles=…)]` + duy nhất 1 chỗ row-level (`TeacherClassAuthorization`); `Account.FacultyId` scope thủ công. course-reg: role-string + policy `ActiveStudent`. tkb-be: **không có** |

Kèm cảnh báo: `SECURITY_AUDIT.md` của srms ghi **SEC-002 IDOR "unchanged and spreading into new code"** — nhiều endpoint đọc/tính chỉ có `[Authorize]` trần, nên user đã đăng nhập đọc được dữ liệu SV khác bằng cách đổi ID. Trái trực tiếp **NFR-11**. Nếu tái dùng srms, đây là việc phải sửa, không phải ghi chú tích hợp.

### 4.6 🟠 Đề cương chi tiết không tồn tại; "công thức điểm" hiện gắn sai tầng
Plan: `DeCuongChiTiet` gắn **HocPhan** (1-1, DEC-02); `ThanhPhanDanhGia` thuộc đề cương, tổng trọng số **đúng 100%** (BR-12, FR-50 chặn lưu); có cờ điều kiện + ngưỡng (BR-15); `MapThanhPhan_CLO`.
srms: `Exam`(Category, Weight) gắn **`Class`** (lớp học phần của một kỳ) → mỗi lớp mỗi kỳ phải khai lại thành phần điểm; `Question↔CLO` đúng tinh thần `MapThanhPhan_CLO` nhưng ở cấp câu hỏi. Không có ràng buộc tổng 100%, không có cờ điều kiện/ngưỡng.
Hệ quả: `DeCuongChiTiet` + `NoiDungTheoTuan` + `ThanhPhanDanhGia` + `MapThanhPhan_CLO` + `TaiLieuDinhKem` = **5 bảng mới hoàn toàn**. `Exam` của srms trở thành *hiện thực hóa theo kỳ* của `ThanhPhanDanhGia` — quan hệ cần định nghĩa rõ, không phải thay thế.

### 4.7 🟠 Không hệ nào phát hiện chu trình tiên quyết
FR-20 (chặn lưu), FR-80, BR-11 (đồ thị phải acyclic) — và **§7.3 dựa vào BR-11 để đảm bảo thuật toán dừng**.
course-reg có `CourseRequirement` + BFS đồ thị ngược nhưng **chỉ dùng để tính ảnh hưởng khi rút HP**, không kiểm chu trình lúc lưu. Dry-run Excel (§6.3) cũng yêu cầu kiểm chu trình. → phải viết mới; hạ tầng đồ thị của course-reg tái dùng được phần lớn.

### 4.8 🟡 Ba mô hình `Course` không tương thích nhau
| Nguồn | Tên | Khóa & ngữ nghĩa |
|---|---|---|
| plan | `HocPhan` | PK = **mã HP** (chuỗi, ví dụ 3190111), TC **số thực**, có tên EN, 8 loại, trạng thái |
| srms | `Course` | PK = `Id` int, `Code` riêng; `Credits decimal(3,1)` ✅ số thực |
| course-reg | `Course` | PK = `Id` **string = mã HP** ✅ khớp plan; `Credits float` + 5 cột TC chia nhỏ |
| tkb-be | `CourseSection` | PK = **mã lớp học phần**, gộp lẫn HP và lớp; `CourseCodeExtracted` là mã HP tách chuỗi |

Hệ quả: nếu hợp nhất, phải chọn 1 khóa chính và ánh xạ 2 cái còn lại. **course-reg gần plan nhất** (PK = mã HP, khớp FR-11). EC-02 (TC 2.5, **cấm kiểu số nguyên mọi tầng**): cả 3 đều đạt. Nhưng **float cho tín chỉ dùng để so sánh tổng là rủi ro** (0.1+0.2) — plan không cấm nhưng `decimal` của srms an toàn hơn cho FR-77.

### 4.9 🟡 Ba DB engine, ba cơ chế auth — và plan bắt buộc monolith
RB-01/NFR-21: **monolith**, phân tách theo module.
Hiện trạng: srms (SQL Server→PG, đang cutover), course-reg (PG), tkb-be (SQL Server, **không migration**). Hash mật khẩu: Argon2id / BCrypt / **plaintext**.
→ NFR-06 (hash mật khẩu): `tkb-be` **vi phạm trực tiếp**. NFR-23 (migration tool): `tkb-be` **vi phạm trực tiếp**.
Không thể "gộp 3 repo". Lựa chọn thực tế ở §6.

### 4.10 🟡 Thiếu đồng bộ định kỳ
FR-99 (đồng bộ định kỳ + nhật ký), `LogDongBo`, EC-49 (mất kết nối → hủy giao dịch, thử lại theo lịch).
**Không repo nào có `IHostedService`/`BackgroundService` cho đồng bộ dữ liệu**: srms không có hosted service nào; course-reg có Kafka consumer nhưng cho đăng ký; tkb-be có job tracker in-memory, mất khi restart.

### 4.11 🟡 Ký hiệu Excel gốc (DEC-05) chưa có chỗ chứa
`kyHieu`, `htDA`, `tqDA`, `diemHoc`, `diemChuyen`, `laTuChon`, `thuTu`, `hocKy` — DEC-05 yêu cầu **giữ nguyên ký hiệu gốc**.
Hiện có: `CourseInProgram.Order`/`Semester`/`IsElectiveCourse` (3/8); `Curriculum.AcademicSemester`/`IsCore` (2/8, và `IsCore` là **nghịch** của `laTuChon`). `kyHieu`/`diemHoc`/`diemChuyen` **không có ở đâu**. course-reg có `IsPreProjectRequired`/`IsProjectPrerequisite` — **có thể chính là htDA/tqDA**, cần đối chiếu file Excel gốc trước khi kết luận.

### 4.12 ℹ️ Những chỗ hiện trạng **vượt** plan (nên cân nhắc giữ)
| Hiện có | Plan | Ghi chú |
|---|---|---|
| srms `UserActivityLog` tự ghi before/after JSON trong `SaveChanges` | FR-105, NFR-10 | **Vượt yêu cầu, dùng luôn** |
| srms `DataTransferController` 44 cặp preview/transfer | FR-34 dry-run | **Đúng pattern, tái dùng cấu trúc** |
| srms `SourceDbContext` read-only NoTracking | FR-98 kết nối CSDL chỉ đọc | **Khớp chính xác** |
| srms Argon2id + refresh token rotation | NFR-06 | Vượt |
| srms CA DUT chữ ký số + QuestPDF | FR-37 xuất PDF | Vượt (có chữ ký số hợp pháp) |
| srms 40 tệp test Testcontainers | — | Plan không yêu cầu; là tài sản |
| course-reg union-find tương đương bắc cầu | BR-09, DEC-06 | **Khớp chính xác, tái dùng thuật toán** |
| course-reg `Course` 5 cột TC chia nhỏ | FR-12 chỉ cần 1 số | Vượt |
| course-reg `CourseExemption` | `KetQuaHocTap` trạng thái "Miễn" | Tương đương |

---

## 5. Ba repo ↔ §12 Ngoài phạm vi: bản đồ vai trò

Điểm quan trọng nhất về kiến trúc: **hai trong ba repo là những hệ mà plan cố tình loại khỏi phạm vi**.

| §12 loại trừ | Repo tương ứng | Vai trò đúng với hệ mới |
|---|---|---|
| Mục 2: Xếp thời khóa biểu — "thuộc hệ thống khác" | **`tkb-be`** | **Không tích hợp gì** trong phạm vi plan. Chỉ đáng lưu ý vì cùng chạy trên hạ tầng Khoa và cùng có `Faculty`/`Lecturer` → có thể trùng lặp dữ liệu giảng viên. |
| Mục 3: Đăng ký học phần thực tế — "thuộc hệ ĐKHP hiện hành; hệ này **chỉ tính điều kiện**" | **`course-registration`** | **Hệ tiêu thụ** (vai trò như dDUT §8.3): gọi `/hoc-phan-du-dieu-kien`. Đồng thời là **nguồn chỉ đọc** (§8.1): SV, KQHT, lớp học phần. |
| Mục 4: Nhập/quản lý điểm — "hệ này **chỉ đọc** kết quả" | **`plo-clo-backend`** (một phần) + course-reg `StudentGrade` | srms *là* hệ quản lý điểm/ca thi → phần `Exam`/`Result`/`ScoreAppeal`/`CorrectedResult`/`SignedScoreSheet` của srms **nằm ngoài phạm vi hệ mới**. |
| Mục 5: Quản lý lớp học phần, phân công giảng dạy | srms `Class`/`Teacher`, course-reg `CourseSection`, tkb-be toàn bộ | Ngoài phạm vi |

**Điều này sinh một câu hỏi kiến trúc mà plan chưa trả lời** — quan trọng hơn mọi lệch schema ở §4:

> `plo-clo-backend` vừa chứa phần **trong** phạm vi (PLO/CLO/Curriculum, M4) vừa chứa phần **ngoài** phạm vi (Exam/Result/phúc khảo/chữ ký số, §12 mục 4). Hệ mới **tách ra khỏi srms** (rồi đọc PLO/điểm qua API) hay **mở rộng srms** thành hệ CTĐT (khi đó srms không còn là "hệ quản lý điểm bên ngoài" nữa)?

Chưa chốt câu này thì không quyết được §6.

---

## 6. Ba lựa chọn kiến trúc (đối chiếu RB-01 monolith)

| | A. Greenfield monolith | B. Mở rộng `plo-clo-backend` | C. Mở rộng `course-registration` |
|---|---|---|---|
| Khối lượng mới | M1–M11 toàn bộ; ~35 thực thể | M1/M3/M5/M6/M7 + sửa khóa M4; tái dùng M4 một phần/M10/M11 | M4/M5/M6/M7 toàn bộ + M1/M3 phần lớn |
| Tái dùng được | 0 (chỉ pattern) | PLO/CLO/Curriculum, UserActivityLog, SourceDbContext, DataTransfer preview/commit, xuất Excel/Word/PDF, Argon2id, 40 test | Course PK=mã HP, CourseRequirement + union-find tương đương, BFS phụ thuộc, ExcelHelper, Redis |
| Phải sửa phá vỡ | — | `CoursePLO` thêm ProgrammeId (§4.1); mọi FK `ProgrammeId`→`PhienBanId` (§4.3); sửa SEC-002 IDOR (§4.5) | Vô hiệu `SyncProgramCoursesAsync` (§4.3); gộp 5 bảng role về 1 mô hình identity; `Program`→phiên bản |
| Xung đột §12 | Không — sạch | **Có**: kéo Exam/Result/phúc khảo/chữ ký số (ngoài phạm vi) vào cùng monolith | **Có**: kéo Kafka/Redis/SignalR/đăng ký thực tế (ngoài phạm vi mục 3) vào cùng monolith |
| Rủi ro | Viết lại logic tiên quyết/tương đương đã chạy production ở course-reg | Đụng vào hệ production đang cutover SQL Server→PG | Đụng vào hệ production đang phục vụ đợt đăng ký thật |
| RB-01 monolith | ✅ | ✅ về kỹ thuật, nhưng monolith đó phủ cả việc ngoài phạm vi | ✅ tương tự, nặng hơn |

**Khuyến nghị**: **A (greenfield monolith) + tái dùng có chọn lọc ở mức mã nguồn, không ở mức DB**:
- Port thuật toán **tương đương union-find + BFS phụ thuộc + đánh giá tiên quyết** từ `CourseRegistrationService` (đã chạy production, khớp BR-06..BR-11).
- Port pattern **preview/commit** và **`SourceDbContext` read-only** từ srms (khớp FR-34/FR-98 gần nguyên vẹn).
- Port `UserActivityLog` interceptor trong `SaveChanges` từ srms (khớp NFR-10/FR-105).
- Coi `course-registration` là **hệ tiêu thụ API** (§8.3) và **nguồn chỉ đọc** (§8.1) — đúng như §12 mục 3 mô tả. Không gộp.
- Coi `plo-clo-backend` là **hệ quản lý điểm bên ngoài** (§12 mục 4) → hệ mới **đọc** KQHT/điểm PLO, không sở hữu `Exam`/`Result`.
- Coi `tkb-be` là **không liên quan**.

Lý do A hơn B/C: cả B và C đều phải phá vỡ khóa chính hoặc xóa luồng ghi của một **hệ production đang chạy**, để lấy về phần tái dùng mà phần lớn có thể port ở mức mã nguồn. Đồng thời B/C đều làm monolith mới bao trùm việc mà §12 nói rõ là ngoài phạm vi — tức vi phạm ranh giới nghiệp vụ, không chỉ ranh giới kỹ thuật.

---

## 7. Việc phải chốt trước khi thiết kế CSDL

| # | Câu hỏi | Chặn cái gì | Vì sao gấp |
|---|---|---|---|
| 1 | **Q-01 §13**: HP dùng chung 2 CTĐT — CLO có phải khác theo CTĐT không? | M4 **và** M5 **và** M7 | Nếu "có" → DEC-02 sai, đề cương phải tách theo cặp (CTĐT,HP) → khóa chính của `DeCuongChiTiet`, `CLO`, `MaTranCLO_PLO` và cả kích thước snapshot M7 đều đổi. Không chốt thì mọi thiết kế M4/M5 sẽ phải làm lại. |
| 2 | Hệ mới **tách khỏi** hay **mở rộng** `plo-clo-backend`? | Toàn bộ §6 | §5: srms nằm vắt qua ranh giới §12 mục 4. |
| 3 | Định nghĩa tốt nghiệp: theo **tín chỉ/khung** (plan §7.4), theo **ngưỡng PLO** (srms), hay **cả hai**? | M8 FR-84..87 | §4.2. Nếu "cả hai" thì `KetQuaXetTotNghiep` cần 2 nhóm kết luận. |
| 4 | Nguồn chân lý cho SV/KQHT: DB nào? `course-registration` PG, `DHBK_CDS` SQL Server mà srms đang đọc, hay SIS `tmHoSoSV`/`tmKhungCT`? | M10, §8.2 | Plan §8.2 nói "CSDL có sẵn" nhưng có **≥3 ứng viên** trong 3 repo. Quy tắc ưu tiên không viết được khi chưa biết là DB nào. |
| 5 | `IsPreProjectRequired`/`IsProjectPrerequisite` của course-reg **có phải** `htDA`/`tqDA`? | M3 FR-27, DEC-05 | §4.11. Đúng → tái dùng ngữ nghĩa; sai → thêm cột mới. Cần đối chiếu file Excel gốc. |
| 6 | Nhóm chuyên môn: lấy danh sách 04 nhóm + thành viên ở đâu? | M1 → chặn M6 | §4.4. Không repo nào có dữ liệu này. Nếu nhập tay/Excel thì là một luồng nhập nữa của M10. |
| 7 | DB engine: PostgreSQL hay SQL Server? | Toàn bộ | srms đang cutover sang PG, course-reg đã PG, tkb-be SQL Server. |

---

## 8. Ma trận nguồn tái dùng (mức mã nguồn)

| Cần cho | Lấy từ | Tệp | Mức khớp plan |
|---|---|---|---|
| Đánh giá tiên quyết/học trước/song hành (§7.3, BR-06..08) | course-reg | `Application/CourseRegistration/CourseRegistrationService.cs` | Cao — thiếu ngưỡng điểm cấu hình được và QH5 |
| Tương đương bắc cầu (BR-09, DEC-06) | course-reg | cùng tệp, `Canonical()`/`Mapping()` union-find | **Rất cao** |
| Ảnh hưởng dây chuyền khi đổi HP (FR-17, FR-68) | course-reg | BFS đồ thị ngược, cùng tệp | Trung bình — đang dùng cho rút HP, cần đổi mục đích |
| Nhập Excel dry-run rồi commit (FR-33/34/35) | srms | `DataTransferController` + `DataTransferService.cs`, `ExcelHandler.cs` | **Rất cao** về pattern |
| Đọc CSDL có sẵn chỉ đọc (FR-98) | srms | `Data/SourceDbContext` (NoTracking) | **Rất cao** |
| Nhật ký bất biến (FR-105, NFR-10) | srms | `SaveChanges` override → `UserActivityLog` | **Rất cao** |
| Ma trận CLO-PLO + tính điểm PLO | srms | `CoursePLOService`, `ResultService.cs` | Trung bình — **phải thêm ProgrammeId** (§4.1) |
| Soft-version hàng tính toán (`IsActive`+`CalculatedAt`) | srms | `StudentPLO`, `StudentProgrammeCompletion` | Cao cho `KetQuaXetTotNghiep`; **không** dùng cho M7 |
| Xuất Excel/Word/PDF + chữ ký số (FR-36/37/104) | srms | EPPlus/DocX/QuestPDF, `SignedScoreSheetService` | Cao |
| Hash mật khẩu + refresh token (NFR-06/08) | srms | Argon2id, `RefreshToken` multi-slot | Cao |
| Trạng thái duyệt kiểu state machine (M6) | srms | `ScoreAppealStatus` + `ScoreAppealService` | Thấp-trung bình — là **pattern tham khảo**, không phải engine |
| **Không có nguồn nào** | — | — | Phát hiện chu trình (FR-20/80, BR-11) · DeXuatThayDoi/BuocDuyet/diff (M6 toàn bộ) · PhienBanCTDT snapshot (M7 toàn bộ) · DeCuongChiTiet + ThanhPhanDanhGia (M5 toàn bộ) · NhomChuyenMon + PhanQuyen theo phạm vi (M1) · NhomTuChon/KhoiKienThuc + kiểm tra nhất quán tổng TC (M3/M8) · đồng bộ định kỳ (FR-99) |

---

## 9. Ghi chú bảo mật phát hiện trong quá trình khảo sát

Không phải yêu cầu của tài liệu này, nhưng liên quan trực tiếp tới NFR-06/09/11 nếu tái dùng:

| Repo | Phát hiện | NFR bị ảnh hưởng |
|---|---|---|
| plo-clo-backend | `SECURITY_AUDIT.md`: **SEC-002 IDOR** trên endpoint đọc/tính kết quả SV, ghi rõ "unchanged and spreading into new code" | **NFR-11** (SV chỉ xem dữ liệu của mình), NFR-09 |
| plo-clo-backend | SEC-003 secret trong `appsettings.json` đóng vào Docker image; SEC-017 mật khẩu cấp sẵn theo quy tắc `"Sv@"+mã SV`, không buộc đổi | NFR-06 |
| course-registration | `GET api/Account/temp-setup-lecturer-passwords` **`[AllowAnonymous]`** — endpoint setup một lần còn sống | NFR-06/09 |
| tkb-be | **Mật khẩu plaintext**, so sánh `==`; Microsoft id_token **không verify chữ ký** với JWKS; phần lớn endpoint **không có `[Authorize]`** | **NFR-06, NFR-09** |

---

## 10. Nguồn dữ liệu của tài liệu này

| Nguồn | Cách lấy |
|---|---|
| `Requirements.pdf` | pypdf (text layer: heading, pseudocode, sơ đồ ASCII) + pymupdf render 51 trang @140dpi rồi đọc trực quan 32 trang bảng — **mọi bảng trong PDF là ảnh**, không phải text |
| `plo-clo-backend` | Agent Explore độc lập, 32 tool call |
| `course-registration` | Agent Explore độc lập, 33 tool call |
| `tkb-be` | Agent Explore độc lập, 74 tool call (đã yêu cầu ẩn secret) |
| `y-l-nh-ng-c-i-tranquil-squid.md` | Là **kế hoạch sinh ra** `Requirements.pdf`; nhất quán với PDF, không thêm dữ kiện mới |

**Giới hạn của tài liệu này**: các con số LOC, danh sách endpoint và mô tả hành vi lấy từ báo cáo agent, chưa đọc lại từng tệp nguồn. Ba điểm dùng để ra quyết định phá vỡ — **§4.1 `CoursePLO` không có ProgrammeId**, **§4.3 `SyncProgramCoursesAsync` xóa-rồi-chèn**, **§4.11 `IsPreProjectRequired`/`IsProjectPrerequisite`** — nên xác nhận lại trực tiếp tại nguồn trước khi chốt thiết kế CSDL.
