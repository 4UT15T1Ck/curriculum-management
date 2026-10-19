import type {
  AttachmentFileType,
  Syllabus,
  SyllabusSectionField,
} from '../api/syllabi';

export const SYLLABUS_STATUS_LABELS: Record<Syllabus['status'], string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Ban hành',
  HISTORICAL: 'Lịch sử',
};
export const ATTACHMENT_TYPE_LABELS: Record<AttachmentFileType, string> = {
  PDF: 'PDF',
  DOCX: 'Word',
  XLSX: 'Excel',
  IMAGE: 'Ảnh',
};
export const SECTION_LABELS: Record<SyllabusSectionField, string> = {
  courseDescription: 'Mô tả học phần',
  englishDescription: 'Mô tả học phần (tiếng Anh)',
  objectives: 'Mục tiêu học phần',
  teachingMethods: 'Phương pháp giảng dạy',
  assessmentMethods: 'Phương pháp đánh giá',
  references: 'Tài liệu tham khảo',
};
export const WEEKLY_SECTION_LABEL = 'Nội dung theo tuần';
export const ATTACHMENTS_SECTION_LABEL = 'Tệp đính kèm';
export const NO_SYLLABUS = 'Học phần chưa có đề cương';
export const NOT_TRANSLATED = 'Chưa dịch';
export const EMPTY_SECTION = 'Chưa có nội dung';
export const NO_ATTACHMENTS = 'Chưa có tệp đính kèm';
export const NO_WEEKS = 'Chưa có dòng nội dung theo tuần';
export const LANGUAGE_OPTIONS = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
] as const;
export type SyllabusLanguage = (typeof LANGUAGE_OPTIONS)[number]['value'];
// Hint for the file picker and the pre-check only; the server decides (extension and file signature).
export const ACCEPTED_EXTENSIONS: Record<
  AttachmentFileType,
  readonly string[]
> = {
  PDF: ['.pdf'],
  DOCX: ['.docx'],
  XLSX: ['.xlsx'],
  IMAGE: ['.png', '.jpg', '.jpeg'],
};

export const CREATE_SYLLABUS = 'Tạo đề cương';
export const EDIT_SYLLABUS = 'Sửa đề cương';
export const SYLLABUS_LINK = 'Đề cương';
export const BACK_TO_COURSE = 'Về học phần';
export const BACK_TO_SYLLABUS = 'Về trang đề cương';
export const NOT_DIRECTLY_EDITABLE =
  'Bản đề cương này không sửa trực tiếp được. Sau khi đề cương đã ban hành, mọi thay đổi đi qua đề xuất thay đổi.';
export const PROGRAMS_USING_NOTICE =
  'Đề cương này dùng chung cho các chương trình sau; thay đổi áp dụng cho tất cả:';
export const SAVE_SECTIONS = 'Lưu nội dung';
export const NOTHING_CHANGED = 'Chưa có thay đổi để lưu.';
export const SAVED = 'Đã lưu.';
export const ATTACHED = 'Đã đính kèm tệp.';
export const UPLOAD_PROMPT =
  'Kéo tệp vào đây hoặc bấm để chọn tệp (bản đề cương đã ký)';
export const ADD_WEEK = 'Thêm tuần';
export const CONTENT_REQUIRED = 'Nội dung tuần không được để trống.';
export const WEEK_LABEL_REQUIRED = 'Nhập nhãn tuần.';
export const WEEK_LABEL_MAX = 50;
export const CLO_SECTION_LABEL = 'Chuẩn đầu ra học phần (CLO)';
export const NO_CLOS = 'Chưa có CLO';
export const ADD_CLO = 'Thêm CLO';
export const CLO_CODE_REQUIRED = 'Nhập mã CLO.';
export const CLO_DESCRIPTION_REQUIRED = 'Nhập mô tả CLO.';
export const CLO_CODE_MAX = 20;
export const CLO_TEXT_MAX = 2000;
export const COGNITIVE_LEVEL_MAX = 50;
// Suggestions only (Bloom's levels); the field is free text.
export const COGNITIVE_LEVEL_SUGGESTIONS = [
  'Nhớ',
  'Hiểu',
  'Áp dụng',
  'Phân tích',
  'Đánh giá',
  'Sáng tạo',
] as const;
export const CLO_TAB_DISABLED_TOOLTIP =
  'Bạn không có quyền sửa CLO của bản đề cương này.';
export const WEEKLY_CLO_COLUMN = 'CLO';
export const cloDeleteConfirm = (programs: readonly string[]) =>
  programs.length === 0
    ? 'Xóa CLO này khỏi đề cương?'
    : `CLO này đang gắn PLO ở chương trình ${programs.join(', ')}; xóa sẽ xóa các liên kết đó.`;
export const EDITOR_TAB_LABELS = {
  content: 'Nội dung',
  weekly: WEEKLY_SECTION_LABEL,
  attachments: ATTACHMENTS_SECTION_LABEL,
  clos: 'CLO',
} as const;
