import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import type { VersionActivator } from '../../shared/releases/version.activator.js';
import { ReleaseActivationProcessor } from './release-activation.processor.js';

const TODAY = new Date('2026-10-19T00:00:00.000Z');

describe('ReleaseActivationProcessor', () => {
  let due: { id: string }[];
  let activate: ReturnType<typeof vi.fn>;
  let findMany: ReturnType<typeof vi.fn>;
  let processor: ReleaseActivationProcessor;

  beforeEach(() => {
    due = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    findMany = vi.fn(() => Promise.resolve(due));
    activate = vi.fn().mockResolvedValue(true);
    const prisma = {
      programVersion: { findMany },
      $transaction: vi.fn((run: (tx: unknown) => unknown) => run('tx')),
    };
    processor = new ReleaseActivationProcessor(
      prisma as unknown as PrismaService,
      { activate } as unknown as VersionActivator,
    );
  });

  it('asks for Pending versions whose semester has begun, oldest first, and activates each in its own transaction', async () => {
    expect(await processor.reconcile(TODAY)).toBe(3);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        status: 'PENDING',
        effectiveSemester: { startDate: { lte: TODAY } },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });
    expect(activate.mock.calls.map((call) => call[1])).toEqual(['a', 'b', 'c']);
    expect(activate).toHaveBeenCalledWith('tx', 'a', TODAY);
  });

  it('counts only what it really activated, so a rerun that finds nothing to do reports zero (K-7)', async () => {
    activate.mockResolvedValueOnce(true).mockResolvedValue(false);

    expect(await processor.reconcile(TODAY)).toBe(1);
    due = [];
    expect(await processor.reconcile(TODAY)).toBe(0);
  });

  it('carries on after a failing version and then fails the job so it is retried', async () => {
    activate.mockImplementation((_tx: unknown, id: string) =>
      id === 'b' ? Promise.reject(new Error('boom')) : Promise.resolve(true),
    );

    await expect(processor.reconcile(TODAY)).rejects.toThrow(/b/);

    expect(activate).toHaveBeenCalledTimes(3);
  });

  it('answers only its own job name', async () => {
    expect(await processor.process({ name: 'something-else' })).toBe(0);
    expect(findMany).not.toHaveBeenCalled();
    expect(await processor.process({ name: 'reconcile-due-versions' })).toBe(3);
  });

  describe('shutdown', () => {
    const attachWorker = (close: ReturnType<typeof vi.fn>) =>
      Object.defineProperty(processor, 'worker', { value: { close } });

    it('closes its worker by force, so app.close() returns even when Redis is gone', async () => {
      const close = vi.fn().mockResolvedValue(undefined);
      attachWorker(close);

      await processor.onModuleDestroy();

      expect(close).toHaveBeenCalledWith(true);
    });

    it('lets the running job finish its transaction first', async () => {
      const order: string[] = [];
      let release!: () => void;
      activate.mockImplementation(
        () =>
          new Promise<boolean>((resolve) => {
            release = () => {
              order.push('job done');
              resolve(true);
            };
          }),
      );
      const close = vi.fn(() => {
        order.push('worker closed');
        return Promise.resolve();
      });
      attachWorker(close);
      due = [{ id: 'a' }];

      const running = processor.process({ name: 'reconcile-due-versions' });
      await vi.waitFor(() => expect(activate).toHaveBeenCalled());
      const stopping = processor.onModuleDestroy();
      await Promise.resolve();
      expect(close).not.toHaveBeenCalled();
      release();
      await running;
      await stopping;

      expect(order).toEqual(['job done', 'worker closed']);
    });
  });
});
