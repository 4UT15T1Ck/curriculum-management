import { App, Button } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import {
  PROGRAM_STATUS_ACTION,
  type ProgramDetail,
  type ProgramStatusAction,
} from '../api/programs';
import { useChangeProgramStatus } from '../hooks/usePrograms';

interface ProgramStatusActionsProps {
  program: ProgramDetail;
}

const DEACTIVATE_TEXT =
  'Chương trình ngừng sử dụng không còn trong danh sách mặc định và các Giám đốc CTĐT của chương trình mất quyền sửa; vẫn xem được và dùng lại được.';

// Programs are never deleted (EC-50): only set to "Ngừng sử dụng" and back.
export function ProgramStatusActions({ program }: ProgramStatusActionsProps) {
  const { modal, message } = App.useApp();
  const mutation = useChangeProgramStatus();
  const active = program.status === 'ACTIVE';
  const action: ProgramStatusAction = active
    ? PROGRAM_STATUS_ACTION.DEACTIVATE
    : PROGRAM_STATUS_ACTION.REACTIVATE;
  const label = active ? 'Ngừng sử dụng' : 'Dùng lại';
  const run = () =>
    mutation.mutateAsync(
      { programId: program.id, action },
      {
        onSuccess: () =>
          void message.success(
            active
              ? 'Đã ngừng sử dụng chương trình.'
              : 'Đã dùng lại chương trình.',
          ),
        onError: (error) =>
          void message.error(
            errorMessage(error, 'Không đổi được trạng thái chương trình.'),
          ),
      },
    );
  return (
    <Button
      danger={active}
      loading={mutation.isPending}
      onClick={() =>
        modal.confirm({
          title: `${label} ${program.programCode}?`,
          content: active ? DEACTIVATE_TEXT : undefined,
          okText: label,
          okButtonProps: { danger: active },
          onOk: () => run().catch(() => undefined),
        })
      }
    >
      {label}
    </Button>
  );
}
