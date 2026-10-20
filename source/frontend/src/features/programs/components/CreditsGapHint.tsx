import { Typography } from 'antd';
import { CREDITS_EPSILON } from '../schema/programRules';

interface CreditsGapHintProps {
  total?: string;
  compulsory?: string;
  elective?: string;
}

const formatCredits = (value: number) => String(Number(value.toFixed(2)));

// Shows the BR-03 gap while typing; the server repeats the check on save.
// Number() is for display only: the strings the user typed are what get sent.
export function CreditsGapHint({
  total,
  compulsory,
  elective,
}: CreditsGapHintProps) {
  if (!total || !compulsory || !elective) return null;
  const gap = Number(compulsory) + Number(elective) - Number(total);
  if (Number.isNaN(gap)) return null;
  if (Math.abs(gap) < CREDITS_EPSILON)
    return <Typography.Text type="success">Khớp tổng tín chỉ.</Typography.Text>;
  return (
    <Typography.Text type="danger">
      Chênh lệch {formatCredits(Math.abs(gap))} tín chỉ.
    </Typography.Text>
  );
}
