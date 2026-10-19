import { Button } from 'antd';
import { Link } from 'react-router';
import { PERMISSIONS } from '../auth/permissions';
import { useCan } from '../auth/useCan';
import { requestFormLink, type RequestPrefill } from './requestFormLink';

interface CreateRequestButtonProps {
  prefill: RequestPrefill;
  label?: string;
  size?: 'small' | 'middle';
}

// Shown where the edit path is VIA_REQUEST; the request form decides what the user may actually create.
// A holder of the organisational permission only (R2) files no data request, so the button hides for them.
export function CreateRequestButton({
  prefill,
  label = 'Tạo đề xuất',
  size,
}: CreateRequestButtonProps) {
  const canCreate = useCan(PERMISSIONS.changeRequestCreate);
  if (!canCreate) return null;
  return (
    <Link to={requestFormLink(prefill)}>
      <Button size={size}>{label}</Button>
    </Link>
  );
}
