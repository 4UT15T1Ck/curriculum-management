import { App, Button, Popconfirm, Space } from 'antd';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../routes';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { ChangeRequestDetail } from '../api/changeRequests';
import {
  DELETE_REQUEST_CONFIRM,
  WITHDRAW_CONFIRM,
} from '../constants/changeRequestLabels';
import {
  useDeleteChangeRequest,
  useWithdrawChangeRequest,
} from '../hooks/useChangeRequests';

interface RequestDraftActionsProps {
  request: ChangeRequestDetail;
  onSubmit: () => void;
}

// The creator's buttons for a Draft: submit, delete a never-submitted one, withdraw a returned one.
export function RequestDraftActions({
  request,
  onSubmit,
}: RequestDraftActionsProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const remove = useDeleteChangeRequest();
  const withdraw = useWithdrawChangeRequest(request.id);
  const { permissions } = request;
  const fail = (fallback: string) => (error: unknown) =>
    void message.error(errorMessage(error, fallback));
  return (
    <Space wrap>
      {permissions.canSubmit && (
        <Button type="primary" onClick={onSubmit}>
          Gửi duyệt
        </Button>
      )}
      {permissions.canWithdraw && (
        <Popconfirm
          title={WITHDRAW_CONFIRM}
          okText="Rút"
          cancelText="Hủy"
          onConfirm={() =>
            withdraw
              .mutateAsync()
              .then(() =>
                navigate(
                  generatePath(ROUTES.changeRequestDetail, {
                    requestId: request.id,
                  }),
                ),
              )
              .catch(fail('Không rút được đề xuất.'))
          }
        >
          <Button>Rút đề xuất</Button>
        </Popconfirm>
      )}
      {permissions.canDelete && (
        <Popconfirm
          title={DELETE_REQUEST_CONFIRM}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() =>
            remove
              .mutateAsync(request.id)
              .then(() => navigate(ROUTES.changeRequests))
              .catch(fail('Không xóa được đề xuất.'))
          }
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      )}
    </Space>
  );
}
