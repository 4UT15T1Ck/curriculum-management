import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Popconfirm, Space, Typography } from 'antd';
import { useState } from 'react';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '../../../routes';
import { CHANGE_REQUEST_QUERY_ROOT } from '../../../shared/change-requests/changeRequestQueryRoot';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import { ApiError } from '../../../shared/api/client';
import type { ChangeRequestDetail } from '../api/changeRequests';
import {
  APPROVE_CONFIRM,
  DECISION_TITLES,
  FINAL_APPROVAL_BUTTON,
} from '../constants/approvalLabels';
import {
  useApproveChangeRequest,
  useOverrideChangeRequest,
  useRejectChangeRequest,
  useReturnChangeRequest,
} from '../hooks/useApprovals';
import { OverrideModal } from './OverrideModal';
import { RemarkModal } from './RemarkModal';

interface ApprovalPanelProps {
  request: ChangeRequestDetail;
}

const STATE_CHANGED = 'REQUEST_STATE_CHANGED';

type OpenModal = 'RETURN' | 'REJECT' | 'OVERRIDE' | null;

// MH-41: the buttons come only from `permissions`; the server decides, the page shows (US-062 AC4).
export function ApprovalPanel({ request }: ApprovalPanelProps) {
  const { canApprove, canFinalApprove, canReturn, canReject, canOverride } =
    request.permissions;
  const [modal, setModal] = useState<OpenModal>(null);
  const approve = useApproveChangeRequest(request.id);
  const returnRequest = useReturnChangeRequest(request.id);
  const reject = useRejectChangeRequest(request.id);
  const override = useOverrideChangeRequest(request.id);
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  if (
    !canApprove &&
    !canFinalApprove &&
    !canReturn &&
    !canReject &&
    !canOverride
  )
    return null;

  // A 409 means someone decided first; the failed call changed nothing, and the next read of the page hides what no longer applies.
  const fail = (error: unknown) => {
    if (error instanceof ApiError && error.code === STATE_CHANGED) {
      setModal(null);
      void queryClient.invalidateQueries({
        queryKey: CHANGE_REQUEST_QUERY_ROOT,
      });
    }
    const labels =
      error instanceof ApiError
        ? (error.details ?? []).map((detail) => detail.field).join('; ')
        : '';
    void message.error(
      [errorMessage(error, 'Không xử lý được đề xuất.'), labels]
        .filter(Boolean)
        .join(' — '),
    );
  };
  const done = (text: string) => () => {
    setModal(null);
    void message.success(text);
  };

  return (
    <Card size="small" title="Xử lý đề xuất">
      <Space wrap>
        {canApprove && (
          <Popconfirm
            title={APPROVE_CONFIRM}
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() =>
              approve.mutateAsync(undefined).then(done('Đã đồng ý.'), fail)
            }
          >
            <Button type="primary" loading={approve.isPending}>
              Đồng ý
            </Button>
          </Popconfirm>
        )}
        {canFinalApprove && (
          <Link
            to={generatePath(ROUTES.finalApproval, { requestId: request.id })}
          >
            <Button type="primary">{FINAL_APPROVAL_BUTTON}</Button>
          </Link>
        )}
        {canReturn && (
          <Button onClick={() => setModal('RETURN')}>Trả lại</Button>
        )}
        {canReject && (
          <Button danger onClick={() => setModal('REJECT')}>
            Từ chối
          </Button>
        )}
        {canOverride && (
          <Button onClick={() => setModal('OVERRIDE')}>Duyệt thay</Button>
        )}
      </Space>
      {canReturn && !canApprove && !canFinalApprove && (
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          Phê duyệt cuối của đề xuất dữ liệu được thực hiện ở màn hình ban hành.
        </Typography.Paragraph>
      )}
      <RemarkModal
        open={modal === 'RETURN' || modal === 'REJECT'}
        title={
          modal === 'REJECT' ? DECISION_TITLES.REJECT : DECISION_TITLES.RETURN
        }
        pending={returnRequest.isPending || reject.isPending}
        onCancel={() => setModal(null)}
        onSubmit={(remark) =>
          (modal === 'REJECT' ? reject : returnRequest)
            .mutateAsync(remark)
            .then(
              done(modal === 'REJECT' ? 'Đã từ chối.' : 'Đã trả lại.'),
              fail,
            )
        }
      />
      <OverrideModal
        open={modal === 'OVERRIDE'}
        pending={override.isPending}
        onCancel={() => setModal(null)}
        onSubmit={(values) =>
          override.mutateAsync(values).then(done('Đã duyệt thay.'), fail)
        }
      />
    </Card>
  );
}
