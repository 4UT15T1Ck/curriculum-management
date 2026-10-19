import type { Rule } from 'antd/es/form';
export const GROUP_CODE_RULES: Rule[] = [
  { required: true, message: 'Nhập mã nhóm' },
  { max: 32, message: 'Mã nhóm tối đa 32 ký tự' },
  {
    pattern: /^[A-Za-z0-9_]+$/,
    message: 'Chỉ dùng chữ không dấu, số và dấu gạch dưới',
  },
];
export const GROUP_NAME_RULES: Rule[] = [
  { required: true, message: 'Nhập tên nhóm' },
  { max: 200 },
];
export const FACULTY_RULES: Rule[] = [{ required: true, message: 'Chọn khoa' }];
