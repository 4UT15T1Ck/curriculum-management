import { Result, Skeleton } from 'antd';
import { useRequestDiff } from '../hooks/useChangeRequests';
import { DiffView } from './DiffView';

interface RequestDiffProps {
  requestId: string;
}

export function RequestDiff({ requestId }: RequestDiffProps) {
  const { data, isPending, isError } = useRequestDiff(requestId);
  if (isPending) return <Skeleton active />;
  if (isError || !data)
    return <Result status="error" title="Không tải được danh sách thay đổi" />;
  return <DiffView diff={data} />;
}
