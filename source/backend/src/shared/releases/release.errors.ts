import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

export const RELEASE_ERRORS = {
  VERSION_NUMBER_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'VERSION_NUMBER_INVALID',
    message: 'Số phiên bản phải có dạng Chính.Phụ (ví dụ 1.0).',
  },
  VERSION_NUMBER_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'VERSION_NUMBER_TAKEN',
    message:
      'Số phiên bản đã tồn tại trong chương trình; kiểm tra lại rồi thử lại.',
  },
  ALREADY_RELEASED: {
    status: HttpStatus.CONFLICT,
    code: 'ALREADY_RELEASED',
    message:
      'Chương trình đã có phiên bản ban hành; thay đổi tiếp theo đi qua đề xuất.',
  },
  PROGRAM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_NOT_FOUND',
    message: 'Không tìm thấy chương trình đào tạo.',
  },
  VERSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_VERSION_NOT_FOUND',
    message: 'Không tìm thấy phiên bản chương trình.',
  },
  VERSION_NOT_CORRECTABLE: {
    status: HttpStatus.CONFLICT,
    code: 'VERSION_NOT_CORRECTABLE',
    message:
      'Chỉ đính chính được phiên bản Đang hiệu lực hoặc Chờ hiệu lực chưa có bản đính chính.',
  },
  CORRECTION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CORRECTION_NOT_FOUND',
    message: 'Không tìm thấy bản nháp đính chính.',
  },
  MISSING_SYLLABUS: {
    status: HttpStatus.CONFLICT,
    code: 'MISSING_SYLLABUS',
    message: 'Học phần trong khung chưa có đề cương.',
  },
  SYLLABUS_INCOMPLETE: {
    status: HttpStatus.CONFLICT,
    code: 'SYLLABUS_INCOMPLETE',
    message: 'Có đề cương chưa đủ điều kiện ban hành.',
  },
  ITEM_APPLY_FAILED: {
    status: HttpStatus.CONFLICT,
    code: 'ITEM_APPLY_FAILED',
    message: 'Không áp dụng được nội dung đề xuất; đề xuất vẫn chờ duyệt.',
  },
  SEMESTER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SEMESTER_NOT_FOUND',
    message: 'Không tìm thấy học kỳ.',
  },
  SEMESTER_START_UNKNOWN: {
    status: HttpStatus.CONFLICT,
    code: 'SEMESTER_START_UNKNOWN',
    message:
      'Học kỳ chưa có ngày bắt đầu; nhập ngày ở màn hình Học kỳ rồi chọn lại.',
  },
  SEMESTER_ALREADY_STARTED: {
    status: HttpStatus.CONFLICT,
    code: 'SEMESTER_ALREADY_STARTED',
    message:
      'Học kỳ đã bắt đầu; chỉ đề xuất do Phòng Đào tạo tạo mới được ban hành vào học kỳ đã qua.',
  },
  EFFECTIVE_BEFORE_BASE: {
    status: HttpStatus.CONFLICT,
    code: 'EFFECTIVE_BEFORE_BASE',
    message:
      'Học kỳ hiệu lực sớm hơn học kỳ của phiên bản đang chờ hiệu lực; chọn học kỳ muộn hơn.',
  },
  COHORT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COHORT_NOT_FOUND',
    message: 'Không tìm thấy khóa tuyển sinh.',
  },
  COHORTS_NOT_ALLOWED: {
    status: HttpStatus.CONFLICT,
    code: 'COHORTS_NOT_ALLOWED',
    message:
      'Chỉ gán khóa tuyển sinh khi đề xuất tạo đúng một phiên bản; gán sau ở màn hình phân bổ khóa.',
  },
} as const satisfies Record<string, ErrorDefinition>;
