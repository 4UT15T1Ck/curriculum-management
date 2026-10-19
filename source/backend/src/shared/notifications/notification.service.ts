import { Injectable } from '@nestjs/common';
import type {
  NotificationType,
  Prisma,
} from '../../generated/prisma/client.js';

export interface NotifyInput {
  recipientIds: readonly string[];
  type: NotificationType;
  content: string;
  changeRequestId: string | null;
  actorId: string;
}

@Injectable()
export class NotificationService {
  // Written on the caller's transaction: an event that rolls back leaves no notification behind (D14).
  // Recipients are deduplicated and the actor is never told about their own click.
  async notify(
    tx: Prisma.TransactionClient,
    input: NotifyInput,
  ): Promise<number> {
    const recipients = [...new Set(input.recipientIds)].filter(
      (id) => id !== input.actorId,
    );
    if (recipients.length === 0) return 0;
    const { count } = await tx.notification.createMany({
      data: recipients.map((recipientId) => ({
        recipientId,
        notificationType: input.type,
        content: input.content,
        changeRequestId: input.changeRequestId,
      })),
    });
    return count;
  }
}
