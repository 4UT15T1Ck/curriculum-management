import type { Rule } from 'antd/es/form';

// Mirrors EQUIVALENCE_LIMITS in source/backend/src/features/equivalence-groups/create-equivalence-group.dto.ts.
export const GROUP_CODE_MAX = 20;
export const GROUP_NOTE_MAX = 500;
export const GROUP_MEMBERS_MIN = 2;
export const GROUP_MEMBERS_MAX = 50;
export const GROUP_MEMBERS_MIN_MESSAGE = `Chọn ít nhất ${GROUP_MEMBERS_MIN} học phần.`;

export const EQUIVALENCE_GROUP_RULES = {
  groupCode: [
    { required: true, whitespace: true, message: 'Nhập mã nhóm.' },
    {
      max: GROUP_CODE_MAX,
      message: `Mã nhóm tối đa ${GROUP_CODE_MAX} ký tự.`,
    },
  ],
  note: [
    { max: GROUP_NOTE_MAX, message: `Ghi chú tối đa ${GROUP_NOTE_MAX} ký tự.` },
  ],
  courseIds: [
    {
      validator: (_rule, value: string[] | undefined) =>
        (value?.length ?? 0) >= GROUP_MEMBERS_MIN
          ? Promise.resolve()
          : Promise.reject(new Error(GROUP_MEMBERS_MIN_MESSAGE)),
    },
    {
      type: 'array',
      max: GROUP_MEMBERS_MAX,
      message: `Một nhóm có tối đa ${GROUP_MEMBERS_MAX} học phần.`,
    },
  ],
} satisfies Record<string, Rule[]>;
