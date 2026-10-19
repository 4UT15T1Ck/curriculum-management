import { Card, Typography } from 'antd';
import { useMe } from '../../../shared/auth/useMe';

export function HomePage() {
  const { data: me } = useMe();
  return (
    <Card>
      <Typography.Title level={4}>Xin chào, {me?.fullName}</Typography.Title>
      <Typography.Text type="secondary">
        Chọn một mục ở thanh bên để bắt đầu.
      </Typography.Text>
    </Card>
  );
}
