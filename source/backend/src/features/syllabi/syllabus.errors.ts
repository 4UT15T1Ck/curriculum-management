import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const SYLLABUS_LIMITS = {
  RICH_TEXT_MAX: 100_000,
  WEEK_LABEL_MAX: 50,
  WEEKLY_ROWS_MAX: 60,
  ATTACHMENTS_MAX: 10,
  FIRST_REVISION: 1,
} as const;

export const SYLLABUS_ERRORS = {
  // Same code as COURSE_ERRORS.COURSE_NOT_FOUND; repeated because features do not import each other.
  COURSE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COURSE_NOT_FOUND',
    message: 'Không tìm thấy học phần.',
  },
  COURSE_CANCELLED: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_CANCELLED',
    message: 'Học phần đã hủy, không sửa đề cương được.',
  },
  SYLLABUS_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SYLLABUS_NOT_FOUND',
    message: 'Không tìm thấy đề cương.',
  },
  SYLLABUS_ALREADY_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'SYLLABUS_ALREADY_EXISTS',
    message: 'Học phần đã có đề cương. Tải lại trang để xem bản hiện có.',
  },
  SYLLABUS_NOT_DRAFT: {
    status: HttpStatus.CONFLICT,
    code: 'SYLLABUS_NOT_DRAFT',
    message: 'Chỉ sửa được bản đề cương đang ở trạng thái Nháp.',
  },
  WEEKLY_CONTENT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'WEEKLY_CONTENT_NOT_FOUND',
    message: 'Không tìm thấy dòng nội dung theo tuần.',
  },
  WEEKLY_ROWS_LIMIT: {
    status: HttpStatus.CONFLICT,
    code: 'SYLLABUS_WEEKLY_ROWS_LIMIT',
    message: `Đề cương có tối đa ${SYLLABUS_LIMITS.WEEKLY_ROWS_MAX} dòng nội dung theo tuần.`,
  },
  ORDER_MISMATCH: {
    status: HttpStatus.CONFLICT,
    code: 'SYLLABUS_ORDER_MISMATCH',
    message:
      'Danh sách sắp xếp không khớp các dòng hiện có; tải lại trang rồi thử lại.',
  },
  ATTACHMENT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ATTACHMENT_NOT_FOUND',
    message: 'Không tìm thấy tệp đính kèm.',
  },
  ATTACHMENT_FILE_REQUIRED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ATTACHMENT_FILE_REQUIRED',
    message: 'Hãy chọn một tệp để đính kèm.',
  },
  ATTACHMENT_TYPE_NOT_ALLOWED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ATTACHMENT_TYPE_NOT_ALLOWED',
    message: 'Chỉ nhận tệp PDF, Word (.docx), Excel (.xlsx) hoặc ảnh PNG/JPEG.',
  },
  ATTACHMENT_LIMIT_REACHED: {
    status: HttpStatus.CONFLICT,
    code: 'ATTACHMENT_LIMIT_REACHED',
    message: `Mỗi bản đề cương có tối đa ${SYLLABUS_LIMITS.ATTACHMENTS_MAX} tệp đính kèm.`,
  },
  ATTACHMENT_NOT_UPLOADER: {
    status: HttpStatus.FORBIDDEN,
    code: 'ATTACHMENT_NOT_UPLOADER',
    message: 'Chỉ người đã tải tệp lên mới gỡ được tệp này.',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Field-level detail names for VALIDATION_FAILED.
export const SYLLABUS_FIELD = { CONTENT: 'content' } as const;
export const WEEKLY_CONTENT_REQUIRED = 'Nội dung tuần không được để trống.';
