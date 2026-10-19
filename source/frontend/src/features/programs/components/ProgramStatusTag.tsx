import { Tag } from 'antd';
import type { ProgramStatus } from '../api/programs';
import {
  PROGRAM_STATUS_COLORS,
  PROGRAM_STATUS_LABELS,
} from '../constants/programLabels';

interface ProgramStatusTagProps {
  status: ProgramStatus;
}

export function ProgramStatusTag({ status }: ProgramStatusTagProps) {
  return (
    <Tag color={PROGRAM_STATUS_COLORS[status]}>
      {PROGRAM_STATUS_LABELS[status]}
    </Tag>
  );
}
