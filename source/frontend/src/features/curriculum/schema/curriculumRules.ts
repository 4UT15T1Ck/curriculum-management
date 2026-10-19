// Mirrors CURRICULUM_LIMITS in source/backend/src/features/curriculum/create-curriculum-item.dto.ts.
export const CURRICULUM_FORM_LIMITS = {
  BLOCK_SYMBOL_MAX: 20,
  NOTE_MAX: 500,
  REQUISITES_MAX: 20,
  GROUP_CODE_MAX: 20,
  GROUP_NAME_MAX: 200,
} as const;
