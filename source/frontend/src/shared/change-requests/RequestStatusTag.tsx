import { Tag } from 'antd';
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  type ChangeRequestStatus,
} from './requestStatus';

interface RequestStatusTagProps {
  status: ChangeRequestStatus;
}

export function RequestStatusTag({ status }: RequestStatusTagProps) {
  return (
    <Tag color={REQUEST_STATUS_COLORS[status]}>
      {REQUEST_STATUS_LABELS[status]}
    </Tag>
  );
}
