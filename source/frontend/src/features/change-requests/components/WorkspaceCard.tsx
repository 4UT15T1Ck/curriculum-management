import { Alert, Button, Card, Flex, Popconfirm, Typography } from 'antd';
import { Link } from 'react-router';
import type { ChangeRequestDetail } from '../api/changeRequests';
import {
  REBASE_CONFIRM,
  STALE_WORKSPACE,
} from '../constants/changeRequestLabels';
import { useRebaseChangeRequest } from '../hooks/useChangeRequests';
import { workspaceLinks } from '../workspaceLinks';

interface WorkspaceCardProps {
  request: ChangeRequestDetail;
}

// "Soạn thay đổi": the copy is edited in the screens that already exist, then read back as the diff below.
export function WorkspaceCard({ request }: WorkspaceCardProps) {
  const rebase = useRebaseChangeRequest(request.id);
  const { workspace } = request;
  if (!workspace) return null;
  return (
    <Card title="Soạn thay đổi">
      <Flex vertical gap="middle">
        <Typography.Text>Dựa trên {workspace.baseLabel}</Typography.Text>
        {workspace.isStale && (
          <Alert
            type="warning"
            showIcon
            title={STALE_WORKSPACE}
            action={
              <Popconfirm
                title={REBASE_CONFIRM}
                okText="Làm lại"
                cancelText="Hủy"
                onConfirm={() => rebase.mutateAsync().catch(() => undefined)}
              >
                <Button size="small" loading={rebase.isPending}>
                  Làm lại trên bản mới
                </Button>
              </Popconfirm>
            }
          />
        )}
        <Flex gap="small" wrap>
          {workspaceLinks(request.requestType, workspace, request.id).map(
            (link) => (
              <Link key={link.to} to={link.to}>
                <Button>{link.label}</Button>
              </Link>
            ),
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
