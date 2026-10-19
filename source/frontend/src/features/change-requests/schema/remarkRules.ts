import type { Rule } from 'antd/es/form';
import { REMARK_MIN } from '../constants/approvalLimits';

// Counted after trimming (BR-28): twenty spaces are not a reason.
export const REMARK_RULES: Rule[] = [
  { required: true, whitespace: true, message: 'Nhập lý do.' },
  {
    validator: (_rule, value: string | undefined) =>
      (value ?? '').trim().length >= REMARK_MIN
        ? Promise.resolve()
        : Promise.reject(new Error(`Lý do cần ít nhất ${REMARK_MIN} ký tự.`)),
  },
];
