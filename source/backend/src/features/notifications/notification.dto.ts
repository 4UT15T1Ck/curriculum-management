import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, Max } from 'class-validator';
import {
  NotificationReadStatus,
  NotificationType,
  type Notification,
} from '../../generated/prisma/client.js';
import { NOTIFICATION_PAGE_SIZE_MAX } from '../../shared/notifications/notification.constants.js';
import { PageQueryDto } from '../../shared/pagination/page-query.dto.js';

export class NotificationQueryDto extends PageQueryDto {
  @Max(NOTIFICATION_PAGE_SIZE_MAX)
  declare pageSize: number;

  @ApiPropertyOptional({ type: Boolean, description: 'Only unread ones' })
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsOptional()
  @IsBoolean()
  unread?: boolean;
}

export class NotificationDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  notificationType!: NotificationType;
  @ApiProperty() content!: string;
  @ApiProperty({ nullable: true, type: String }) changeRequestId!:
    string | null;
  @ApiProperty({
    enum: NotificationReadStatus,
    enumName: 'NotificationReadStatus',
  })
  readStatus!: NotificationReadStatus;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true, type: String }) readAt!: string | null;
}

export class NotificationPageDto {
  @ApiProperty({ type: [NotificationDto] }) items!: NotificationDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}

export class UnreadCountDto {
  @ApiProperty() count!: number;
}

export function toNotificationDto(row: Notification): NotificationDto {
  return {
    id: row.id,
    notificationType: row.notificationType,
    content: row.content,
    changeRequestId: row.changeRequestId,
    readStatus: row.readStatus,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
  };
}
