import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const EQUIVALENCE_ERRORS = {
  GROUP_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'EQUIVALENCE_GROUP_NOT_FOUND',
    message: 'Không tìm thấy nhóm học phần tương đương.',
  },
  GROUP_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'EQUIVALENCE_GROUP_CODE_TAKEN',
    message: 'Mã nhóm tương đương đã tồn tại.',
  },
  MEMBER_COURSE_NOT_FOUND: {
    status: HttpStatus.BAD_REQUEST,
    code: 'MEMBER_COURSE_NOT_FOUND',
    message: 'Không tìm thấy học phần cần đưa vào nhóm.',
  },
  MEMBER_COURSE_CANCELLED: {
    status: HttpStatus.CONFLICT,
    code: 'MEMBER_COURSE_CANCELLED',
    message: 'Không đưa học phần đã hủy vào nhóm tương đương.',
  },
  COURSE_ALREADY_GROUPED: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_ALREADY_GROUPED',
    message: 'Học phần đã thuộc một nhóm tương đương khác; hãy gộp hai nhóm',
  },
  GROUP_MIN_MEMBERS: {
    status: HttpStatus.CONFLICT,
    code: 'GROUP_MIN_MEMBERS',
    message:
      'Nhóm tương đương cần ít nhất 2 học phần; hãy giải thể nhóm nếu không cần nữa.',
  },
  MERGE_SAME_GROUP: {
    status: HttpStatus.BAD_REQUEST,
    code: 'MERGE_SAME_GROUP',
    message: 'Không gộp một nhóm với chính nó.',
  },
  NOT_A_MEMBER: {
    status: HttpStatus.NOT_FOUND,
    code: 'EQUIVALENCE_NOT_A_MEMBER',
    message: 'Học phần không thuộc nhóm này.',
  },
} as const satisfies Record<string, ErrorDefinition>;
