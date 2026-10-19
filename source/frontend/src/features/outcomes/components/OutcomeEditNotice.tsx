import { Alert } from 'antd';
import type { components } from '../../../shared/api/schema';
import { CreateRequestButton } from '../../../shared/change-requests/CreateRequestButton';

interface OutcomeEditNoticeProps {
  editPath: components['schemas']['EditPath'] | null;
  programId: string;
}

export const OUTCOME_VIA_REQUEST_NOTE =
  'Dữ liệu đã ban hành chỉ sửa qua đề xuất thay đổi.';

// A holder of the edit permission whose edits must go through a change request (FR-55) is told why the controls are off,
// and offered the request form with the program already chosen.
export function OutcomeEditNotice({
  editPath,
  programId,
}: OutcomeEditNoticeProps) {
  if (editPath !== 'VIA_REQUEST') return null;
  return (
    <Alert
      type="info"
      showIcon
      title={OUTCOME_VIA_REQUEST_NOTE}
      action={
        <CreateRequestButton
          prefill={{
            type: 'OUTCOME',
            targetType: 'PROGRAM',
            targetId: programId,
          }}
        />
      }
    />
  );
}
