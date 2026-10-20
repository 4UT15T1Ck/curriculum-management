import type { AttachmentRules, Syllabus } from './api/syllabi';

// What every tab of the editor receives.
export interface EditorTabProps {
  courseId: string;
  syllabus: Syllabus;
  attachmentRules: AttachmentRules;
  // A Draft exists and the caller edits CLOs on it directly (clo.edit).
  canEditClos: boolean;
}
