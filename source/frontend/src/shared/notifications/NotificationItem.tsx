import { List, Typography } from 'antd';
import dayjs from 'dayjs';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../routes';
import { useMarkNotificationRead } from './useNotifications';
import type { Notification } from './types';

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

interface NotificationItemProps {
  notification: Notification;
  onOpen?: () => void;
}

// Opening marks it read before navigating, so the badge has dropped by the time the detail renders (US-068 AC4).
export function NotificationItem({
  notification,
  onOpen,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const unread = notification.readStatus === 'UNREAD';

  async function open() {
    if (unread)
      await markRead.mutateAsync(notification.id).catch(() => undefined);
    onOpen?.();
    if (notification.changeRequestId) {
      void navigate(
        generatePath(ROUTES.changeRequestDetail, {
          requestId: notification.changeRequestId,
        }),
      );
    }
  }

  return (
    <List.Item onClick={() => void open()} style={{ cursor: 'pointer' }}>
      <List.Item.Meta
        title={
          <Typography.Text strong={unread}>
            {notification.content}
          </Typography.Text>
        }
        description={dayjs(notification.createdAt).format(DATE_TIME_FORMAT)}
      />
    </List.Item>
  );
}
