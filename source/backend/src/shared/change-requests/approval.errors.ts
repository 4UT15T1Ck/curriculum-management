import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

export const APPROVAL_ERRORS = {
  SELF_APPROVAL: {
    status: HttpStatus.FORBIDDEN,
    code: 'SELF_APPROVAL',
    message: 'Bạn không thể phê duyệt đề xuất do chính mình tạo.',
  },
  NOT_YOUR_STEP: {
    status: HttpStatus.FORBIDDEN,
    code: 'NOT_YOUR_STEP',
    message: 'Đề xuất không chờ bạn duyệt ở cấp hiện tại.',
  },
  REQUEST_STATE_CHANGED: {
    status: HttpStatus.CONFLICT,
    code: 'REQUEST_STATE_CHANGED',
    message: 'Đề xuất vừa được người khác xử lý; hãy tải lại trang.',
  },
  STEP_ALREADY_DECIDED: {
    status: HttpStatus.CONFLICT,
    code: 'STEP_ALREADY_DECIDED',
    message: 'Bước duyệt này đã có quyết định.',
  },
} as const satisfies Record<string, ErrorDefinition>;
