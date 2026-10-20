import { Typography } from 'antd';
import type { Clo } from '../api/syllabi';

interface CloCodesProps {
  cloIds: readonly string[];
  clos: readonly Clo[];
}

// "CLO1, CLO3" for the CLOs a weekly row covers; ids arrive in CLO order.
export function CloCodes({ cloIds, clos }: CloCodesProps) {
  const codes = cloIds
    .map((id) => clos.find((clo) => clo.id === id)?.cloCode)
    .filter((code): code is string => code !== undefined);
  return codes.length === 0 ? (
    <Typography.Text type="secondary">—</Typography.Text>
  ) : (
    <span>{codes.join(', ')}</span>
  );
}
