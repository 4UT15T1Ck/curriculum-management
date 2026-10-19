import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const OUTCOME_LIMITS = {
  PLOS_MAX: 30,
  PLO_CODE_MAX: 20,
  TEXT_MAX: 2000,
  GROUP_MAX: 100,
  LINKS_MAX: 900, // CLOS_MAX x PLOS_MAX
} as const;

export const OUTCOME_ERRORS = {
  // Same codes as CURRICULUM_ERRORS; repeated because features do not import each other.
  VERSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_VERSION_NOT_FOUND',
    message: 'Không tìm thấy phiên bản chương trình.',
  },
  VERSION_NOT_EDITABLE: {
    status: HttpStatus.CONFLICT,
    code: 'VERSION_NOT_EDITABLE',
    message: 'Chỉ sửa được chuẩn đầu ra của phiên bản nháp.',
  },
  ITEM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CURRICULUM_ITEM_NOT_FOUND',
    message: 'Không tìm thấy dòng khung chương trình.',
  },
  PLO_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PLO_NOT_FOUND',
    message: 'Không tìm thấy PLO.',
  },
  PLO_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'PLO_CODE_TAKEN',
    message: 'Mã PLO đã có trong phiên bản này.',
  },
  PLOS_LIMIT: {
    status: HttpStatus.CONFLICT,
    code: 'PLOS_LIMIT',
    message: `Mỗi phiên bản có tối đa ${OUTCOME_LIMITS.PLOS_MAX} PLO.`,
  },
  ORDER_MISMATCH: {
    status: HttpStatus.CONFLICT,
    code: 'OUTCOME_ORDER_MISMATCH',
    message:
      'Danh sách sắp xếp không khớp các PLO hiện có; tải lại trang rồi thử lại.',
  },
  PLO_NOT_IN_VERSION: {
    status: HttpStatus.CONFLICT,
    code: 'PLO_NOT_IN_VERSION',
    message: 'PLO không thuộc phiên bản của học phần này.',
  },
  CELL_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COURSE_PLO_CELL_NOT_FOUND',
    message: 'Học phần chưa gắn PLO này.',
  },
  PLO_NOT_MAPPED_TO_COURSE: {
    status: HttpStatus.CONFLICT,
    code: 'PLO_NOT_MAPPED_TO_COURSE',
    message:
      'Học phần chưa gắn PLO này trong ma trận học phần–PLO; gắn ở đó trước.',
  },
  CLO_NOT_IN_REVISION: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CLO_NOT_IN_REVISION',
    message:
      'CLO không thuộc bản đề cương đang dùng của học phần; tải lại trang rồi thử lại.',
  },
} as const satisfies Record<string, ErrorDefinition>;
