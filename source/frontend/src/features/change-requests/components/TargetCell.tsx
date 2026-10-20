import { Typography } from 'antd';
import type { ChangeRequestSummary } from '../api/changeRequests';
import { TARGET_TYPE_LABELS } from '../constants/changeRequestLabels';

interface TargetCellProps {
  target: ChangeRequestSummary['target'];
}

export function TargetCell({ target }: TargetCellProps) {
  return (
    <>
      <Typography.Text type="secondary">
        {TARGET_TYPE_LABELS[target.targetType]}:{' '}
      </Typography.Text>
      {target.code} — {target.name}
    </>
  );
}
