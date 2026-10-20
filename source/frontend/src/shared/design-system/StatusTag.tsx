// Molecule: Status badge với màu sắc nhất quán
// Dùng thay cho <Tag color={colorMap[status]}>{labelMap[status]}</Tag> lặp rải rác trong code
//
// Ví dụ dùng:
//   import { USER_STATUS_COLORS, USER_STATUS_LABELS } from '../constants/userLabels';
//   <StatusTag status={user.status} colorMap={USER_STATUS_COLORS} labelMap={USER_STATUS_LABELS} />

import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
  colorMap: Record<string, string>;
  labelMap: Record<string, string>;
}

export function StatusTag({ status, colorMap, labelMap }: StatusTagProps) {
  return (
    <Tag color={colorMap[status] ?? 'default'}>
      {labelMap[status] ?? status}
    </Tag>
  );
}
