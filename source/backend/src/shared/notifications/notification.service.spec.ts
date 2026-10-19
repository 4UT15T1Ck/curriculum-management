import {
  NotificationType,
  type Prisma,
} from '../../generated/prisma/client.js';
import { NotificationService } from './notification.service.js';

describe('NotificationService', () => {
  const createMany = vi.fn();
  const tx = {
    notification: { createMany },
  } as unknown as Prisma.TransactionClient;
  const service = new NotificationService();
  const base = {
    type: NotificationType.REQUEST_COMMENTED,
    content: 'x',
    changeRequestId: 'r1',
    actorId: 'actor',
  };

  beforeEach(() => {
    createMany.mockReset();
    createMany.mockImplementation(({ data }: { data: unknown[] }) => ({
      count: data.length,
    }));
  });

  it('writes one row per distinct recipient', async () => {
    const count = await service.notify(tx, {
      ...base,
      recipientIds: ['a', 'b', 'a'],
    });
    expect(count).toBe(2);
    expect(
      createMany.mock.calls[0][0].data.map(
        (row: { recipientId: string }) => row.recipientId,
      ),
    ).toEqual(['a', 'b']);
  });

  it('never notifies the actor', async () => {
    await service.notify(tx, { ...base, recipientIds: ['actor', 'a'] });
    expect(createMany.mock.calls[0][0].data).toHaveLength(1);
  });

  it('writes nothing for an empty list', async () => {
    await expect(
      service.notify(tx, { ...base, recipientIds: ['actor'] }),
    ).resolves.toBe(0);
    expect(createMany).not.toHaveBeenCalled();
  });
});
