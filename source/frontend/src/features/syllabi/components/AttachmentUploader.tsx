import { App, Typography, Upload } from 'antd';
import { ApiError } from '../../../shared/api/client';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { AttachmentRules } from '../api/syllabi';
import { ATTACHED, UPLOAD_PROMPT } from '../constants/syllabusLabels';
import { useUploadAttachment } from '../hooks/useSyllabus';
import {
  acceptedExtensions,
  attachmentHint,
  checkAttachment,
} from '../utils/attachmentRules';

const PAYLOAD_TOO_LARGE_CODE = 'PAYLOAD_TOO_LARGE';

const isPayloadTooLarge = (error: unknown) =>
  error instanceof ApiError && error.code === PAYLOAD_TOO_LARGE_CODE;

interface AttachmentUploaderProps {
  courseId: string;
  syllabusId: string;
  attachmentRules: AttachmentRules;
}

// The drop zone of the editor's attachment tab; also on a published revision, which only ever gains signed files (US-077).
export function AttachmentUploader({
  courseId,
  syllabusId,
  attachmentRules,
}: AttachmentUploaderProps) {
  const { message } = App.useApp();
  const upload = useUploadAttachment(courseId, syllabusId);
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
  );
}
