import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, List, Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ROUTES } from '../../routes';
import { BELL_PREVIEW_SIZE } from './notificationConstants';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useUnreadCount } from './useNotifications';

// Unread count in the header; the count polls, the preview loads only while the popover is open.
export function NotificationBell() {
  const { pathname } = useLocation();
  const { data, refetch } = useUnreadCount();
  const [open, setOpen] = useState(false);
  const preview = useNotifications(
    { page: 1, pageSize: BELL_PREVIEW_SIZE },
    open,
  );

  // A page change is the moment a user looks up; the interval only covers a page left open.
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    void refetch();
  }, [pathname, refetch]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      content={
        <List
          style={{ width: 360 }}
          loading={preview.isLoading}
          dataSource={preview.data?.items}
          locale={{ emptyText: 'Không có thông báo.' }}
          renderItem={(notification) => (
            <NotificationItem
              notification={notification}
              onOpen={() => setOpen(false)}
            />
          )}
          footer={
            <Link to={ROUTES.notifications} onClick={() => setOpen(false)}>
              Xem tất cả
            </Link>
          }
        />
      }
    >
      <Badge count={data?.count ?? 0} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ color: '#fff' }}
          aria-label="Thông báo"
        />
      </Badge>
    </Popover>
  );
}
