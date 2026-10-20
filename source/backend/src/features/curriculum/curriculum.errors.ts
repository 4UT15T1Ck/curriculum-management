import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const CURRICULUM_ERRORS = {
  VERSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_VERSION_NOT_FOUND',
    message: 'Không tìm thấy phiên bản chương trình.',
  },
  VERSION_NOT_EDITABLE: {
    status: HttpStatus.CONFLICT,
    code: 'VERSION_NOT_EDITABLE',
    message: 'Chỉ sửa được khung của phiên bản nháp.',
  },
  ITEM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'CURRICULUM_ITEM_NOT_FOUND',
    message: 'Không tìm thấy dòng khung chương trình.',
  },
  COURSE_NOT_FOUND: {
    status: HttpStatus.BAD_REQUEST,
    code: 'COURSE_NOT_FOUND',
    message: 'Không tìm thấy học phần.',
  },
  COURSE_NOT_ACTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_NOT_ACTIVE',
    message: 'Chỉ thêm được học phần đang sử dụng vào khung.',
  },
  COURSE_ALREADY_IN_CURRICULUM: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_ALREADY_IN_CURRICULUM',
    message: 'Học phần đã có trong khung',
  },
  SEMESTER_OUT_OF_RANGE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'SEMESTER_OUT_OF_RANGE',
    message: 'Học kỳ vượt quá số học kỳ của chương trình',
  },
  ITEM_IN_ELECTIVE_GROUP: {
    status: HttpStatus.CONFLICT,
    code: 'ITEM_IN_ELECTIVE_GROUP',
    message:
      'Học phần đang thuộc một nhóm tự chọn; gỡ khỏi nhóm trước khi đổi thành bắt buộc.',
  },
  ORDER_MISMATCH: {
    status: HttpStatus.CONFLICT,
    code: 'CURRICULUM_ORDER_MISMATCH',
    message:
      'Danh sách sắp xếp không khớp các học phần của học kỳ; tải lại trang rồi thử lại.',
  },
  ELECTIVE_GROUP_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ELECTIVE_GROUP_NOT_FOUND',
    message: 'Không tìm thấy nhóm tự chọn.',
  },
  GROUP_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'ELECTIVE_GROUP_CODE_TAKEN',
    message: 'Mã nhóm tự chọn đã có trong phiên bản này.',
  },
  GROUP_MINIMUM_REQUIRED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'GROUP_MINIMUM_REQUIRED',
    message:
      'Nhóm tự chọn cần ít nhất một yêu cầu tối thiểu: số tín chỉ hoặc số học phần.',
  },
  GROUP_REQUIRES_ELECTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'GROUP_REQUIRES_ELECTIVE',
    message: 'Học phần bắt buộc không được đưa vào nhóm tự chọn',
  },
  ITEM_IN_OTHER_GROUP: {
    status: HttpStatus.CONFLICT,
    code: 'ITEM_IN_OTHER_GROUP',
    message: 'Học phần đã thuộc nhóm tự chọn khác',
  },
  ITEM_NOT_IN_VERSION: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ITEM_NOT_IN_VERSION',
    message: 'Có dòng không thuộc phiên bản của nhóm.',
  },
  REQUISITE_SELF: {
    status: HttpStatus.BAD_REQUEST,
    code: 'REQUISITE_SELF',
    message: 'Học phần không thể là điều kiện của chính nó.',
  },
  REQUISITE_COURSE_CANCELLED: {
    status: HttpStatus.CONFLICT,
    code: 'REQUISITE_COURSE_CANCELLED',
    message: 'Không dùng học phần đã hủy làm điều kiện.',
  },
  REQUISITE_DUPLICATE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'REQUISITE_DUPLICATE',
    message: 'Một điều kiện được khai báo hai lần.',
  },
  // Same code as the catalog relations on purpose: the client handles one code for both screens.
  MIN_SCORE_NOT_ALLOWED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'MIN_SCORE_NOT_ALLOWED',
    message: 'Chỉ quan hệ tiên quyết mới có ngưỡng điểm.',
  },
  REQUISITE_CYCLE: {
    status: HttpStatus.CONFLICT,
    code: 'REQUISITE_CYCLE',
    message:
      'Điều kiện này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Constraint keys in `details`, the same style as class-validator keys (FieldErrorDto).
export const CURRICULUM_CONSTRAINT = {
  SEMESTER_RANGE: 'semesterRange',
  UNIQUE_COURSE: 'uniqueCourse',
  GROUP_MINIMUM: 'groupMinimum',
} as const;
