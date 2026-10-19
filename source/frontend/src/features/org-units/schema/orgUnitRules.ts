import type { Rule } from 'antd/es/form';
export const UNIT_CODE_RULES: Rule[] = [
  { required: true, message: 'Nhập mã đơn vị' },
  { max: 32, message: 'Mã đơn vị tối đa 32 ký tự' },
  {
    pattern: /^[A-Za-z0-9_]+$/,
    message: 'Chỉ dùng chữ không dấu, số và dấu gạch dưới',
  },
];
export const UNIT_NAME_RULES: Rule[] = [
  { required: true, message: 'Nhập tên đơn vị' },
  { max: 200 },
];
