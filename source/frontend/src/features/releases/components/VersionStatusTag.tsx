import { Tag } from 'antd';
import {
  VERSION_STATUS_COLORS,
  VERSION_STATUS_LABELS,
} from '../../../shared/constants/versionLabels';
import type { VersionRef } from '../api/releases';

interface VersionStatusTagProps {
  status: VersionRef['status'];
}

export function VersionStatusTag({ status }: VersionStatusTagProps) {
  return (
    <Tag color={VERSION_STATUS_COLORS[status]}>
      {VERSION_STATUS_LABELS[status]}
    </Tag>
  );
}
