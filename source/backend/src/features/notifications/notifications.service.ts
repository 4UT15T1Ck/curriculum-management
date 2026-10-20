import { Injectable } from '@nestjs/common';
import {
  NotificationReadStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { toPage, toSkipTake, type Page } from '../../shared/pagination/page.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  toNotificationDto,
  type NotificationDto,
  type NotificationQueryDto,
  type UnreadCountDto,
} from './notification.dto.js';
import { NOTIFICATION_ERRORS } from './notifications.errors.js';

// Own rows only: another user's id answers 404, so existence is not revealed.
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<Page<NotificationDto>> {
    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
      ...(query.unread && { readStatus: NotificationReadStatus.UNREAD }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.notification.count({ where }),
    ]);
    return toPage(rows.map(toNotificationDto), total, query);
  }

  async unreadCount(userId: string): Promise<UnreadCountDto> {
    return {
      count: await this.prisma.notification.count({
        where: {
          recipientId: userId,
          readStatus: NotificationReadStatus.UNREAD,
        },
      }),
    };
  }

  // Idempotent: reading a read notification returns it unchanged.
  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const row = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });
    if (!row) {
      throw new AppException(NOTIFICATION_ERRORS.NOTIFICATION_NOT_FOUND);
    }
    if (row.readStatus === NotificationReadStatus.READ) {
      return toNotificationDto(row);
    }
    return toNotificationDto(
      await this.prisma.notification.update({
        where: { id },
        data: { readStatus: NotificationReadStatus.READ, readAt: new Date() },
      }),
    );
  }

  async markAllRead(userId: string): Promise<UnreadCountDto> {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, readStatus: NotificationReadStatus.UNREAD },
      data: { readStatus: NotificationReadStatus.READ, readAt: new Date() },
    });
    return { count: 0 };
  }
}
