# BẢNG ĐỐI CHIẾU TÊN v0.1

**Hệ thống Quản lý Chương trình đào tạo — PBL6**

| | |
|---|---|
| Ngày lập | 2026-10-15 |
| Mục đích | Tra nhanh tên lập trình tiếng Anh từ tên trong SRS và ngược lại |
| Nguồn | Sinh từ `docs/design/data-dictionary.md`. Khi hai tài liệu khác nhau, từ điển dữ liệu đúng |
| Phạm vi | Tài liệu thiết kế (`docs/design/`) và kế hoạch (`docs/planning/`) dùng tên lập trình. SRS (`docs/requirement/`) và bộ use case giữ tên SRS |

---

## Quy tắc

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Thực thể | Tiếng Anh, viết hoa chữ đầu mỗi từ; từ viết tắt giữ chữ hoa | `ProgramVersion`, `CLOPLOMapping` |
| Thuộc tính | Tiếng Anh, viết thường chữ đầu | `courseCode`, `effectiveSemester` |
| Giá trị liệt kê | Mã tiếng Anh chữ hoa, nối bằng gạch dưới; nhãn tiếng Việt giữ nguyên để hiển thị. Giá trị vốn đã là mã thì giữ nguyên | `PENDING_DIRECTOR` Chờ Giám đốc CTĐT; `I` · `R` · `M` |
| Mã quyền | `đốiTượng.hànhĐộng`, tiếng Anh | `syllabus.edit`, `version.publish` |
| Một từ SRS, một tên | Một tên thuộc tính SRS ứng với đúng một tên lập trình ở mọi thực thể | trangThai → `status` ở mọi thực thể có trạng thái |
| Không đổi | Mã tài liệu và mã định danh (FR-, UC-, BR-, EC-, DEC-, Q-, DX-, MH-, CV-, KB-, NT-, SP- …); tên chức năng SRS trong sơ đồ tuần tự | `XacDinhDieuKienDangKy`, `XetTotNghiep` |
| Văn xuôi | Lời giải thích viết tiếng Việt. Trong câu, trạng thái gọi bằng nhãn tiếng Việt; trong bảng và sơ đồ, bằng mã | "đề xuất đang ở Nháp" · `DRAFT` |

`—` ở cột Tên SRS: thực thể được thêm ở mô hình này, SRS không có (dấu ⊕ ở từ điển dữ liệu).

## 1. Thực thể

47 thực thể, 37 có tên SRS.

| Tên SRS | Tên lập trình | Nhóm ở từ điển dữ liệu |
|---|---|---|
| DonVi | `OrgUnit` | 1. Tổ chức và người dùng |
| NhomChuyenMon | `SubjectGroup` | 1. Tổ chức và người dùng |
| NguoiDung | `User` | 1. Tổ chức và người dùng |
| VaiTro | `Role` | 1. Tổ chức và người dùng |
| — | `Permission` | 1. Tổ chức và người dùng |
| — | `RolePermission` | 1. Tổ chức và người dùng |
| PhanQuyen | `RoleAssignment` | 1. Tổ chức và người dùng |
| ThanhVienNhomCM | `SubjectGroupMember` | 1. Tổ chức và người dùng |
| PhanCongGiamDoc | `ProgramDirectorAssignment` | 1. Tổ chức và người dùng |
| UyQuyenDuyet | `ApprovalDelegation` | 1. Tổ chức và người dùng |
| HocPhan | `Course` | 2. Học phần |
| QuanHeHocPhan | `CourseRelation` | 2. Học phần |
| NhomHocPhanTuongDuong | `EquivalentCourseGroup` | 2. Học phần |
| ChuongTrinhDaoTao | `Program` | 3. Chương trình đào tạo |
| PhienBanCTDT | `ProgramVersion` | 3. Chương trình đào tạo |
| DongKhungCTDT | `CurriculumItem` | 3. Chương trình đào tạo |
| NhomTuChon | `ElectiveGroup` | 3. Chương trình đào tạo |
| KhoiKienThuc | `KnowledgeBlock` | 3. Chương trình đào tạo |
| — | `CurriculumRequisite` | 3. Chương trình đào tạo |
| — | `Cohort` | 3. Chương trình đào tạo |
| — | `Semester` | 3. Chương trình đào tạo |
| — | `CohortVersion` | 3. Chương trình đào tạo |
| PLO | `PLO` | 4. Chuẩn đầu ra |
| CLO | `CLO` | 4. Chuẩn đầu ra |
| MaTranCLO_PLO | `CLOPLOMapping` | 4. Chuẩn đầu ra |
| MaTranHP_PLO | `CoursePLOMapping` | 4. Chuẩn đầu ra |
| DeCuongChiTiet | `Syllabus` | 5. Đề cương chi tiết |
| NoiDungTheoTuan | `WeeklyContent` | 5. Đề cương chi tiết |
| — | `WeeklyContentCLO` | 5. Đề cương chi tiết |
| ThanhPhanDanhGia | `AssessmentComponent` | 5. Đề cương chi tiết |
| MapThanhPhan_CLO | `AssessmentCLOMapping` | 5. Đề cương chi tiết |
| TaiLieuDinhKem | `SyllabusAttachment` | 5. Đề cương chi tiết |
| DeXuatThayDoi | `ChangeRequest` | 6. Quy trình phê duyệt |
| NoiDungThayDoi | `ChangeItem` | 6. Quy trình phê duyệt |
| BuocDuyet | `ApprovalStep` | 6. Quy trình phê duyệt |
| — | `ApprovalLevelConfig` | 6. Quy trình phê duyệt |
| BinhLuan | `Comment` | 6. Quy trình phê duyệt |
| ThongBao | `Notification` | 6. Quy trình phê duyệt |
| HoSoDeXuat | `ChangeRequestDocument` | 6. Quy trình phê duyệt |
| SinhVien | `Student` | 7. Sinh viên và kết quả học tập |
| — | `ProgramEnrollment` | 7. Sinh viên và kết quả học tập |
| KetQuaHocTap | `AcademicResult` | 7. Sinh viên và kết quả học tập |
| KetQuaXetTotNghiep | `GraduationAudit` | 7. Sinh viên và kết quả học tập |
| NhatKyHeThong | `AuditLog` | 8. Hệ thống |
| PhienNhapLieu | `ImportBatch` | 8. Hệ thống |
| LogDongBo | `SyncLog` | 8. Hệ thống |
| — | `IntegrationClient` | 8. Hệ thống |

## 2. Thuộc tính

153 tên thuộc tính SRS, xếp theo tên SRS. Thuộc tính thêm ở mô hình không có tên SRS, chỉ ghi ở từ điển dữ liệu.

| Tên SRS | Tên lập trình | Có ở thực thể |
|---|---|---|
| capDuyet | `approvalLevel` | `ApprovalStep` |
| chuongTrinh | `program` | `ProgramDirectorAssignment`, `ProgramVersion` |
| clo | `clo` | `CLOPLOMapping`, `AssessmentCLOMapping` |
| coBoQua | `isSkipped` | `ApprovalStep` |
| danhSachThieuHut | `shortfalls` | `GraduationAudit` |
| deCuong | `syllabus` | `CLO`, `WeeklyContent`, `AssessmentComponent`, `SyllabusAttachment` |
| denNgay | `validTo` | `RoleAssignment`, `ApprovalDelegation` |
| deXuat | `changeRequest` | `ChangeItem`, `ApprovalStep`, `Comment`, `ChangeRequestDocument` |
| diaChiIP | `ipAddress` | `AuditLog` |
| diemChu | `letterGrade` | `AcademicResult` |
| diemChuyen | `minTransferScore` | `CurriculumItem` |
| diemHoc | `minStudiedScore` | `CurriculumItem` |
| diemThang10 | `score10` | `AcademicResult` |
| diemThang4 | `score4` | `AcademicResult` |
| dongKhung | `curriculumItem` | `CLOPLOMapping`, `CoursePLOMapping` |
| donVi | `orgUnit` | `User` |
| donViCha | `parentUnit` | `OrgUnit` |
| donViPhamVi | `scopeUnit` | `RoleAssignment` |
| duongDan | `filePath` | `SyllabusAttachment`, `ChangeRequestDocument` |
| duongDanLienKet | `link` | `Notification` |
| email | `email` | `User` |
| ghiChu | `note` | `EquivalentCourseGroup`, `CurriculumItem` |
| ghiDanh | `enrollment` | `GraduationAudit` |
| giamDoc | `director` | `ProgramDirectorAssignment` |
| giangVien | `lecturer` | `SubjectGroupMember` |
| giaTriCu | `oldValue` | `ChangeItem`, `AuditLog` |
| giaTriMoi | `newValue` | `ChangeItem`, `AuditLog` |
| hanhDong | `action` | `ApprovalStep`, `AuditLog` |
| hinhThucDanhGia | `assessmentForm` | `AssessmentComponent` |
| hoatDongDayHoc | `teachingActivities` | `WeeklyContent` |
| hocKy | `semester` | `AcademicResult` |
| hocKyDuKien | `plannedSemester` | `CurriculumItem` |
| hocKyHieuLuc | `effectiveSemester` | `ProgramVersion` |
| hocPhan | `course` | `CurriculumItem`, `Syllabus`, `AcademicResult` |
| hocPhanDich | `targetCourse` | `CourseRelation` |
| hocPhanNguon | `sourceCourse` | `CourseRelation` |
| hoTen | `fullName` | `User`, `Student` |
| htDA | `htDa` | `CurriculumItem` |
| ketLuan | `conclusion` | `GraduationAudit` |
| khoa | `faculty` | `SubjectGroup` |
| khoaPhuTrach | `ownerFaculty` | `Course` |
| khoaTuyenSinh | `cohort` | `Student` |
| kyHieu | `blockSymbol` | `CurriculumItem` |
| laDieuKien | `isConditional` | `AssessmentComponent` |
| laTuChon | `isElective` | `CurriculumItem` |
| loaiDeXuat | `requestType` | `ChangeRequest` |
| loaiDoiTuong | `targetType` | `ChangeRequest` |
| loaiDonVi | `unitType` | `OrgUnit` |
| loaiHocPhan | `courseType` | `Course` |
| loaiHoSo | `documentType` | `ChangeRequestDocument` |
| loaiNhap | `importType` | `ImportBatch` |
| loaiPhamVi | `scopeType` | `RoleAssignment` |
| loaiQuanHe | `relationType` | `CourseRelation` |
| loaiTep | `fileType` | `SyllabusAttachment` |
| loaiThongBao | `notificationType` | `Notification` |
| loaiThucThe | `entityType` | `ChangeItem`, `AuditLog` |
| lyDo | `reason` | `ChangeRequest` |
| maBanGhi | `recordId` | `ChangeItem`, `AuditLog` |
| maChuongTrinh | `programCode` | `Program` |
| maCLO | `cloCode` | `CLO` |
| maDeXuat | `requestCode` | `ChangeRequest` |
| maDoiTuong | `targetCode` | `ChangeRequest` |
| maDonVi | `unitCode` | `OrgUnit` |
| maHocPhan | `courseCode` | `Course` |
| maKhoi | `blockCode` | `KnowledgeBlock` |
| maNganh | `majorCode` | `ProgramVersion` |
| maNguoiDung | `userCode` | `User` |
| maNhom | `groupCode` | `SubjectGroup`, `EquivalentCourseGroup`, `ElectiveGroup` |
| maPLO | `ploCode` | `PLO` |
| maSinhVien | `studentCode` | `Student` |
| maThanhPhan | `componentCode` | `AssessmentComponent` |
| maVaiTro | `roleCode` | `Role` |
| moTa | `description` | `Role`, `PLO`, `CLO` |
| moTaHocPhan | `courseDescription` | `Syllabus` |
| moTaTiengAnh | `englishDescription` | `PLO`, `CLO` |
| mucDoDongGop | `contributionLevel` | `CLOPLOMapping`, `CoursePLOMapping` |
| mucNhanThuc | `cognitiveLevel` | `CLO` |
| mucTieu | `objectives` | `Syllabus` |
| nganh | `major` | `Student` |
| ngayBatDau | `startDate` | `ProgramDirectorAssignment` |
| ngayKetThuc | `endDate` | `ProgramDirectorAssignment` |
| ngayKy | `signedDate` | `ProgramVersion` |
| nguoiBanHanh | `publishedBy` | `ProgramVersion` |
| nguoiBinhLuan | `author` | `Comment` |
| nguoiDung | `user` | `RoleAssignment` |
| nguoiDuocUyQuyen | `delegate` | `ApprovalDelegation` |
| nguoiDuyet | `approver` | `ApprovalStep` |
| nguoiNhan | `recipient` | `Notification` |
| nguoiTaiLen | `uploadedBy` | `SyllabusAttachment`, `ChangeRequestDocument` |
| nguoiTao | `createdBy` | `ChangeRequest` |
| nguoiThucHien | `performedBy` | `AuditLog`, `ImportBatch` |
| nguoiUyQuyen | `delegator` | `ApprovalDelegation` |
| nguonDuLieu | `dataSource` | `SyncLog` |
| nguongDiem | `minScore` | `CourseRelation` |
| nguongDieuKien | `conditionThreshold` | `AssessmentComponent` |
| nguonPhatSinh | `origin` | `ChangeRequest` |
| nhomChuyenMon | `subjectGroup` | `SubjectGroupMember` |
| nhomNangLuc | `competencyGroup` | `PLO` |
| nhomPhuTrach | `ownerGroup` | `Course` |
| nhomTuChon | `electiveGroup` | `CurriculumItem` |
| noiDung | `content` | `WeeklyContent`, `Comment`, `Notification` |
| phamVi | `scope` | `ApprovalDelegation` |
| phienBan | `programVersion` | `CurriculumItem`, `ElectiveGroup`, `PLO` |
| phuongPhapGiangDay | `teachingMethods` | `Syllabus` |
| plo | `plo` | `CLOPLOMapping`, `CoursePLOMapping` |
| sinhVien | `student` | `AcademicResult` |
| soBanGhi | `recordCount` | `SyncLog` |
| soDongLoi | `errorRows` | `ImportBatch` |
| soDongThanhCong | `successRows` | `ImportBatch` |
| soHocKy | `semesterCount` | `ProgramVersion` |
| soHocPhanToiThieu | `minCourses` | `ElectiveGroup` |
| soPhienBan | `versionNumber` | `ProgramVersion` |
| soPhienBanNoiBo | `revisionNumber` | `Syllabus` |
| soQuyetDinh | `decisionNumber` | `ProgramVersion` |
| soTinChi | `credits` | `Course` |
| soTinChiToiThieu | `minCredits` | `ElectiveGroup` |
| soTinChiYeuCau | `requiredCredits` | `KnowledgeBlock` |
| soVanBanCanCu | `basisDocumentNumber` | `ChangeRequest` |
| taiLieuThamKhao | `references` | `Syllabus` |
| tenChuongTrinh | `programName` | `ProgramVersion` |
| tenDonVi | `unitName` | `OrgUnit` |
| tenHocPhan | `courseName` | `Course` |
| tenKhoi | `blockName` | `KnowledgeBlock` |
| tenNganh | `majorName` | `ProgramVersion` |
| tenNhom | `groupName` | `SubjectGroup`, `ElectiveGroup` |
| tenTep | `fileName` | `SyllabusAttachment`, `ChangeRequestDocument`, `ImportBatch` |
| tenThanhPhan | `componentName` | `AssessmentComponent` |
| tenTiengAnh | `englishName` | `Course` |
| tenVaiTro | `roleName` | `Role` |
| thanhPhanDanhGia | `assessmentComponent` | `AssessmentCLOMapping` |
| thoiDiem | `recordedAt` | `SyllabusAttachment`, `ApprovalStep`, `Comment`, `ChangeRequestDocument`, `AuditLog` |
| thoiDiemBatDau | `startedAt` | `SyncLog` |
| thoiDiemKetThuc | `finishedAt` | `SyncLog` |
| thoiDiemTao | `createdAt` | `ChangeRequest` |
| thoiDiemXet | `auditedAt` | `GraduationAudit` |
| thongBaoLoi | `errorMessage` | `SyncLog` |
| thuTu | `sortOrder` | `CurriculumItem`, `PLO`, `CLO` |
| tieuDe | `title` | `ChangeRequest` |
| tinChiBatBuoc | `compulsoryCredits` | `ProgramVersion` |
| tinChiTuChon | `electiveCredits` | `ProgramVersion` |
| tongDong | `totalRows` | `ImportBatch` |
| tongTinChi | `totalCredits` | `ProgramVersion` |
| tqDA | `tqDa` | `CurriculumItem` |
| trangThai | `status` | `User`, `Course`, `Program`, `ProgramVersion`, `Syllabus`, `ChangeRequest`, `Student`, `AcademicResult`, `ImportBatch`, `SyncLog` |
| trangThaiDoc | `readStatus` | `Notification` |
| trinhDo | `degreeLevel` | `Program` |
| trongSo | `weight` | `AssessmentComponent` |
| tuanChuong | `weekLabel` | `WeeklyContent` |
| tuNgay | `validFrom` | `RoleAssignment` |
| tyTrong | `cloWeight` | `AssessmentCLOMapping` |
| vaiTro | `role` | `RoleAssignment` |
| vaiTroTrongNhom | `memberRole` | `SubjectGroupMember` |
| yKien | `remark` | `ApprovalStep` |

## 3. Giá trị liệt kê

39 thuộc tính liệt kê. Mỗi giá trị ghi mã rồi nhãn tiếng Việt.

| Thuộc tính | Giá trị |
|---|---|
| `OrgUnit.unitType` | `UNIVERSITY` Trường · `FACULTY` Khoa · `OFFICE` Phòng |
| `OrgUnit.status` | `ACTIVE` Đang hoạt động · `INACTIVE` Ngừng hoạt động |
| `SubjectGroup.status` | `ACTIVE` Đang sử dụng · `INACTIVE` Ngừng sử dụng |
| `User.status` | `ACTIVE` Hoạt động · `DISABLED` Vô hiệu hóa |
| `Permission.functionGroup` | `SYSTEM_ADMIN` Quản trị hệ thống · `COURSE_CATALOG` Danh mục học phần · `PROGRAM` Chương trình đào tạo · `LEARNING_OUTCOME` Chuẩn đầu ra · `SYLLABUS` Đề cương chi tiết · `APPROVAL` Quy trình phê duyệt · `VERSION` Phiên bản · `DATA_REPORT` Dữ liệu và báo cáo · `STUDENT_LOOKUP` Tra cứu sinh viên |
| `RolePermission.mode` | `DIRECT` Trực tiếp · `VIA_REQUEST` Qua đề xuất |
| `RolePermission.scope` | `ALL` Toàn bộ · `SCOPED` Theo phạm vi |
| `RoleAssignment.scopeType` | `SYSTEM` Toàn hệ thống · `UNIT` Đơn vị · `ASSIGNMENT` Theo phân công |
| `SubjectGroupMember.memberRole` | `MEMBER` Thành viên · `COORDINATOR` Điều phối |
| `ApprovalDelegation.status` | `ACTIVE` Hiệu lực · `EXPIRED` Hết hạn · `REVOKED` Đã thu hồi |
| `Course.courseType` | `THEORY` Lý thuyết · `PRACTICE` Thực hành · `LAB` Thí nghiệm · `PROJECT` Đồ án · `CAPSTONE` Đồ án tốt nghiệp · `INTERNSHIP` Thực tập · `CONDITIONAL` Học phần điều kiện |
| `Course.status` | `ACTIVE` Đang sử dụng · `DISCONTINUED` Ngừng mở lớp · `CANCELLED` Đã hủy |
| `CourseRelation.relationType` | `PRIOR` QH1 Học trước · `PREREQUISITE` QH2 Tiên quyết · `COREQUISITE` QH3 Song hành · `REPLACEMENT` QH5 Thay thế |
| `Program.degreeLevel` | `ENGINEER` Kỹ sư · `BACHELOR` Cử nhân |
| `Program.status` | `ACTIVE` Đang sử dụng · `INACTIVE` Ngừng sử dụng |
| `ProgramVersion.status` | `DRAFT` Nháp · `PENDING` Chờ hiệu lực · `ACTIVE` Đang hiệu lực · `HISTORICAL` Lịch sử |
| `CurriculumRequisite.relationType` | `PRIOR` QH1 · `PREREQUISITE` QH2 · `COREQUISITE` QH3 |
| `CLOPLOMapping.contributionLevel` | `I` · `R` · `M`, hoặc `1` · `2` · `3` |
| `CoursePLOMapping.contributionLevel` | Cùng thang với `CLOPLOMapping` |
| `Syllabus.status` | `DRAFT` Nháp · `PUBLISHED` Đã ban hành · `HISTORICAL` Lịch sử |
| `SyllabusAttachment.fileType` | `PDF` · `WORD` Word |
| `ChangeRequest.requestType` | `GRADING_FORMULA` Sửa công thức điểm · `OUTCOME` Sửa PLO/CLO · `SYLLABUS_CONTENT` Sửa nội dung đề cương · `CURRICULUM` Sửa khung chương trình · `COURSE_RELATION` Sửa quan hệ học phần · `PROGRAM_INFO` Sửa thông tin chương trình · `ORGANIZATION` Thay đổi tổ chức / phân công |
| `ChangeRequest.targetType` | `COURSE` Học phần · `PROGRAM` Chương trình đào tạo · `SUBJECT_GROUP` Nhóm chuyên môn |
| `ChangeRequest.status` | `DRAFT` Nháp · `PENDING_COORDINATOR` Chờ Điều phối nhóm CM · `PENDING_DIRECTOR` Chờ Giám đốc CTĐT · `PENDING_ACADEMIC_OFFICE` Chờ Phòng Đào tạo · `APPROVED` Đã duyệt · `EFFECTIVE` Đang hiệu lực · `REJECTED` Từ chối · `WITHDRAWN` Thu hồi |
| `ChangeRequest.origin` | `UNIVERSITY` Trường · `FACULTY` Khoa |
| `ApprovalStep.action` | `PENDING` Chờ · `APPROVE` Đồng ý · `RETURN` Trả lại · `REJECT` Từ chối |
| `Notification.readStatus` | `UNREAD` Chưa đọc · `READ` Đã đọc |
| `ChangeRequestDocument.documentType` | `SUBMISSION` Tờ trình · `MINUTES` Biên bản · `COUNCIL_MINUTES` Biên bản họp hội đồng · `REVIEW_MINUTES` Biên bản thẩm định · `OFFICIAL_LETTER` Công văn |
| `Student.status` | `STUDYING` Đang học · `ON_LEAVE` Bảo lưu · `WITHDRAWN` Thôi học · `GRADUATED` Đã tốt nghiệp |
| `Student.dataSource` | `EXCEL` Excel · `SCHOOL_DB` Cơ sở dữ liệu có sẵn |
| `ProgramEnrollment.enrollmentType` | `PRIMARY` Chính · `SECOND_MAJOR` Song ngành |
| `ProgramEnrollment.status` | `ACTIVE` Đang theo học · `TRANSFERRED` Đã chuyển · `ENDED` Đã kết thúc |
| `AcademicResult.status` | `PASSED` Đạt · `FAILED` Không đạt · `IN_PROGRESS` Đang học · `EXEMPT` Miễn |
| `AcademicResult.dataSource` | `EXCEL` Excel · `SCHOOL_DB` Cơ sở dữ liệu có sẵn |
| `GraduationAudit.conclusion` | `ELIGIBLE` Đủ điều kiện · `NOT_ELIGIBLE` Chưa đủ điều kiện |
| `ImportBatch.importType` | `COURSE_CATALOG` Danh mục học phần · `CURRICULUM` Khung chương trình · `STUDENT_LIST` Danh sách sinh viên · `ACADEMIC_RESULT` Kết quả học tập |
| `ImportBatch.status` | `DRY_RUN` Chạy thử · `COMMITTED` Đã ghi · `ABORTED` Không ghi do lỗi |
| `SyncLog.status` | `RUNNING` Đang chạy · `SUCCEEDED` Thành công · `FAILED` Thất bại |
| `IntegrationClient.status` | `ACTIVE` Hoạt động · `LOCKED` Đã khóa |

## 4. Mã quyền

40 mã quyền và chức năng tiếng Việt tương ứng (theo tên dòng ở SRS mục 3.4) nằm ở cột Mã quyền và Chức năng của từ điển dữ liệu mục 9; không chép lại ở đây.
