import { App, Flex, Typography, Upload } from 'antd';
import { ApiError } from '../../../shared/api/client';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import { ATTACHED, UPLOAD_PROMPT } from '../constants/syllabusLabels';
import { useDeleteAttachment, useUploadAttachment } from '../hooks/useSyllabus';
import type { EditorTabProps } from '../types';
import {
  acceptedExtensions,
  attachmentHint,
  checkAttachment,
} from '../utils/attachmentRules';
import { AttachmentList } from './AttachmentList';

const PAYLOAD_TOO_LARGE_CODE = 'PAYLOAD_TOO_LARGE';

const isPayloadTooLarge = (error: unknown) =>
  error instanceof ApiError && error.code === PAYLOAD_TOO_LARGE_CODE;

export function AttachmentPanel({
  courseId,
  syllabus,
  attachmentRules,
}: EditorTabProps) {
  const { message } = App.useApp();
  const upload = useUploadAttachment(courseId, syllabus.id);
  const remove = useDeleteAttachment(courseId);
  const hint = attachmentHint(attachmentRules);
  // false keeps AntD from posting by itself, so the upload goes through client.ts with the CSRF header.
  const beforeUpload = (file: File) => {
    const problem = checkAttachment(file, attachmentRules);
    if (problem) {
      void message.error(problem);
      return Upload.LIST_IGNORE;
    }
    upload.mutate(file, {
      onSuccess: () => void message.success(ATTACHED),
      onError: (reason) =>
        void message.error(
          isPayloadTooLarge(reason)
            ? `${errorMessage(reason, '')} ${hint}`
            : errorMessage(reason, 'Không đính kèm được tệp.'),
        ),
    });
    return false;
  };
  return (
    <Flex vertical gap="middle">
      <Upload.Dragger
        accept={acceptedExtensions(attachmentRules).join(',')}
        beforeUpload={beforeUpload}
        showUploadList={false}
        multiple={false}
        disabled={upload.isPending}
      >
        <p>{UPLOAD_PROMPT}</p>
        <Typography.Text type="secondary">{hint}</Typography.Text>
      </Upload.Dragger>
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
