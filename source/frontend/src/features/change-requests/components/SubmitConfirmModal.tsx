import { App, Modal, Skeleton } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import {
  useSubmitChangeRequest,
  useSubmitPreview,
} from '../hooks/useChangeRequests';
import { SubmitPreviewBody } from './SubmitPreviewBody';

interface SubmitConfirmModalProps {
  requestId: string;
  onClose: () => void;
}

export function SubmitConfirmModal({
  requestId,
  onClose,
}: SubmitConfirmModalProps) {
  const { message } = App.useApp();
  const preview = useSubmitPreview(requestId);
  const submit = useSubmitChangeRequest(requestId);
  const navigate = useNavigate();
  const blocked = (preview.data?.blockingIssues.length ?? 0) > 0;

  const onOk = () =>
    submit.mutate(undefined, {
      onSuccess: () =>
        void navigate(generatePath(ROUTES.changeRequestDetail, { requestId })),
      // Something changed after the preview (a release, a new error): show it and re-read the preview.
      onError: (error) => {
        void message.error(errorMessage(error, 'Không gửi được đề xuất.'));
        void preview.refetch();
      },
    });

  return (
    <Modal
      open
      title="Gửi đề xuất đi duyệt"
      okText="Gửi"
      cancelText="Đóng"
      onOk={onOk}
      onCancel={onClose}
      okButtonProps={{ disabled: preview.isPending || blocked }}
      confirmLoading={submit.isPending}
    >
      {preview.data ? (
        <SubmitPreviewBody preview={preview.data} />
      ) : (
        <Skeleton active />
      )}
    </Modal>
  );
}
