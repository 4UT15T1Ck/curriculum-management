import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

export const COURSE_RELATION_ERRORS = {
  RELATION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'RELATION_NOT_FOUND',
    message: 'Không tìm thấy quan hệ học phần.',
  },
  // Same code as the courses feature on purpose: the client sees one code for "no such course".
  COURSE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COURSE_NOT_FOUND',
    message: 'Không tìm thấy học phần.',
  },
  RELATION_COURSE_NOT_FOUND: {
    status: HttpStatus.BAD_REQUEST,
    code: 'RELATION_COURSE_NOT_FOUND',
    message: 'Không tìm thấy một trong hai học phần của quan hệ.',
  },
  RELATION_SELF: {
    status: HttpStatus.BAD_REQUEST,
    code: 'RELATION_SELF',
    message: 'Không khai báo được quan hệ của một học phần với chính nó.',
  },
  RELATION_COURSE_CANCELLED: {
    status: HttpStatus.CONFLICT,
    code: 'RELATION_COURSE_CANCELLED',
    message: 'Không khai báo quan hệ với học phần đã hủy.',
  },
  RELATION_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'RELATION_EXISTS',
    message: 'Hai học phần này đã có quan hệ loại này.',
  },
  MIN_SCORE_NOT_ALLOWED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'MIN_SCORE_NOT_ALLOWED',
    message: 'Chỉ quan hệ tiên quyết mới có ngưỡng điểm.',
  },
  REQUISITE_CYCLE: {
    status: HttpStatus.CONFLICT,
    code: 'REQUISITE_CYCLE',
    message:
      'Quan hệ này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng',
  },
  REPLACEMENT_STILL_NEEDED: {
    status: HttpStatus.CONFLICT,
    code: 'REPLACEMENT_STILL_NEEDED',
    message:
      'Đây là học phần thay thế duy nhất của một học phần đang Ngừng mở lớp; hãy thêm học phần thay thế khác hoặc mở lại học phần đó trước.',
  },
} as const satisfies Record<string, ErrorDefinition>;
