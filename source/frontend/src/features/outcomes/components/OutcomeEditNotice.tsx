import { Alert } from 'antd';
import { CHANGE_REQUEST_PENDING_TOOLTIP } from '../../../shared/constants/editPath';
import type { components } from '../../../shared/api/schema';

interface OutcomeEditNoticeProps {
  editPath: components['schemas']['EditPath'] | null;
}

// A holder of the edit permission whose edits must go through a change request (FR-55) is told why the controls are off.
export function OutcomeEditNotice({ editPath }: OutcomeEditNoticeProps) {
  if (editPath !== 'VIA_REQUEST') return null;
  return <Alert type="info" showIcon title={CHANGE_REQUEST_PENDING_TOOLTIP} />;
}
