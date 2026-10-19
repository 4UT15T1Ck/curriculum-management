import { getJson, sendJson, withQuery } from '../api/client';
import type {
  Notification,
  NotificationPage,
  NotificationQuery,
  UnreadCount,
} from './types';

const NOTIFICATIONS = '/notifications';

export const getUnreadCount = () =>
  getJson<UnreadCount>(`${NOTIFICATIONS}/unread-count`);
export const listNotifications = (query: NotificationQuery) =>
  getJson<NotificationPage>(withQuery(NOTIFICATIONS, { ...query }));
export const markNotificationRead = (id: string) =>
  sendJson<Notification>(
    'POST',
    `${NOTIFICATIONS}/${encodeURIComponent(id)}/read`,
  );
export const markAllNotificationsRead = () =>
  sendJson<UnreadCount>('POST', `${NOTIFICATIONS}/read-all`);
