import { HttpStatus } from '@nestjs/common';
import { MEMBERSHIP_ERRORS } from '../../shared/subject-groups/membership.errors.js';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const SUBJECT_GROUP_ERRORS = {
  ...MEMBERSHIP_ERRORS,
  GROUP_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'GROUP_CODE_TAKEN',
    message: 'Mã nhóm chuyên môn đã tồn tại.',
  },
  FACULTY_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'FACULTY_INVALID',
    message: 'Nhóm chuyên môn phải thuộc một Khoa đang hoạt động.',
  },
  MEMBER_HAS_COORDINATOR: {
    status: HttpStatus.CONFLICT,
    code: 'MEMBER_HAS_COORDINATOR',
    message:
      'Dòng thành viên này còn dòng Điều phối dựa vào; hãy thu hồi dòng Điều phối trước.',
  },
} as const satisfies Record<string, ErrorDefinition>;
