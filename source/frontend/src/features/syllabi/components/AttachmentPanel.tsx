import { App, Flex } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import { useDeleteAttachment } from '../hooks/useSyllabus';
import type { EditorTabProps } from '../types';
import { AttachmentList } from './AttachmentList';
import { AttachmentUploader } from './AttachmentUploader';

export function AttachmentPanel({
  courseId,
  syllabus,
  attachmentRules,
}: EditorTabProps) {
  const { message } = App.useApp();
  const remove = useDeleteAttachment(courseId);
  return (
    <Flex vertical gap="middle">
      <AttachmentUploader
        courseId={courseId}
        syllabusId={syllabus.id}
        attachmentRules={attachmentRules}
      />
      <AttachmentList
        attachments={syllabus.attachments}
        onDelete={(attachment) =>
          remove.mutate(attachment.id, {
            onError: (reason) =>
              void message.error(errorMessage(reason, 'Không gỡ được tệp.')),
          })
        }
      />
    </Flex>
  );
}
