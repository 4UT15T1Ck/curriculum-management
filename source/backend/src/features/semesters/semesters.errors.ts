import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const SEMESTER_ERRORS = {
  SEMESTER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SEMESTER_NOT_FOUND',
    message: 'Không tìm thấy học kỳ.',
  },
  COHORT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COHORT_NOT_FOUND',
    message: 'Không tìm thấy khóa tuyển sinh.',
  },
  SEMESTER_IN_USE: {
    status: HttpStatus.CONFLICT,
    code: 'SEMESTER_IN_USE',
    message:
      'Không đổi được ngày bắt đầu của học kỳ đã có phiên bản ban hành hiệu lực.',
  },
  SEMESTER_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'SEMESTER_EXISTS',
    message: 'Mã học kỳ hoặc cặp năm học - học kỳ đã tồn tại.',
  },
  COHORT_EXISTS: {
    status: HttpStatus.CONFLICT,
    code: 'COHORT_EXISTS',
    message: 'Mã khóa tuyển sinh đã tồn tại.',
  },
} as const satisfies Record<string, ErrorDefinition>;
