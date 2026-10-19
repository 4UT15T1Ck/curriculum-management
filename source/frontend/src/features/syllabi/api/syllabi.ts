import {
  downloadFile,
  getJson,
  sendForm,
  sendJson,
} from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type CourseSyllabus = components['schemas']['CourseSyllabusDto'];
export type Syllabus = components['schemas']['SyllabusDto'];
export type WeeklyContent = components['schemas']['WeeklyContentDto'];
export type SyllabusAttachment = components['schemas']['SyllabusAttachmentDto'];
export type AttachmentRules = components['schemas']['AttachmentRulesDto'];
export type AttachmentFileType = components['schemas']['AttachmentFileType'];
export type UpdateSyllabusRequest = components['schemas']['UpdateSyllabusDto'];
export type CreateWeeklyContentRequest =
  components['schemas']['CreateWeeklyContentDto'];
export type UpdateWeeklyContentRequest =
  components['schemas']['UpdateWeeklyContentDto'];
export type SyllabusSectionField = keyof UpdateSyllabusRequest;

const coursePath = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}/syllabus`;
const syllabusPath = (syllabusId: string) =>
  `/syllabi/${encodeURIComponent(syllabusId)}`;
const weekPath = (weeklyContentId: string) =>
  `/weekly-contents/${encodeURIComponent(weeklyContentId)}`;
const attachmentPath = (attachmentId: string) =>
  `/syllabus-attachments/${encodeURIComponent(attachmentId)}`;
const ATTACHMENT_FIELD = 'file';

export const fetchCourseSyllabus = (courseId: string) =>
  getJson<CourseSyllabus>(coursePath(courseId));
export const createSyllabus = (courseId: string) =>
  sendJson<CourseSyllabus>('POST', coursePath(courseId));
export const updateSyllabus = (
  syllabusId: string,
  body: UpdateSyllabusRequest,
) => sendJson<Syllabus>('PATCH', syllabusPath(syllabusId), body);
export const createWeek = (
  syllabusId: string,
  body: CreateWeeklyContentRequest,
) =>
  sendJson<WeeklyContent>(
    'POST',
    `${syllabusPath(syllabusId)}/weekly-contents`,
    body,
  );
export const updateWeek = (
  weeklyContentId: string,
  body: UpdateWeeklyContentRequest,
) => sendJson<WeeklyContent>('PATCH', weekPath(weeklyContentId), body);
export const deleteWeek = (weeklyContentId: string) =>
  sendJson<void>('DELETE', weekPath(weeklyContentId));
export const reorderWeeks = (syllabusId: string, ids: string[]) =>
  sendJson<WeeklyContent[]>(
    'PUT',
    `${syllabusPath(syllabusId)}/weekly-contents/order`,
    { ids },
  );
export function uploadAttachment(
  syllabusId: string,
  file: File,
): Promise<SyllabusAttachment> {
  const form = new FormData();
  form.append(ATTACHMENT_FIELD, file);
  return sendForm<SyllabusAttachment>(
    `${syllabusPath(syllabusId)}/attachments`,
    form,
  );
}
export const deleteAttachment = (attachmentId: string) =>
  sendJson<void>('DELETE', attachmentPath(attachmentId));
export const downloadAttachment = (attachment: SyllabusAttachment) =>
  downloadFile(`${attachmentPath(attachment.id)}/file`, attachment.fileName);
