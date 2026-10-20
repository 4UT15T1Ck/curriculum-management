import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const CONSISTENCY_FEATURE_ERRORS = {
  VERSION_NOT_EDITABLE: {
    status: HttpStatus.CONFLICT,
    code: 'VERSION_NOT_EDITABLE',
    message: 'Chỉ chấp nhận chênh lệch tín chỉ trên phiên bản nháp.',
  },
  NO_CREDIT_MISMATCH: {
    status: HttpStatus.CONFLICT,
    code: 'NO_CREDIT_MISMATCH',
    message:
      'Số tín chỉ khai báo đã khớp với khung; không có chênh lệch để chấp nhận.',
  },
  CREDIT_GAP_CHANGED: {
    status: HttpStatus.CONFLICT,
    code: 'CREDIT_GAP_CHANGED',
    message:
      'Chênh lệch tín chỉ đã thay đổi; chạy lại kiểm tra rồi chấp nhận lại.',
  },
} as const satisfies Record<string, ErrorDefinition>;
