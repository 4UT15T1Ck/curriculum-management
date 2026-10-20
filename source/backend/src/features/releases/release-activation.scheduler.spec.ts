import type { Queue } from 'bullmq';
import { ReleaseActivationScheduler } from './release-activation.scheduler.js';

function queueWith(overrides: Partial<Queue>): Queue {
  return {
    upsertJobScheduler: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Queue;
}

describe('ReleaseActivationScheduler', () => {
  it('returns from bootstrap without waiting for Redis', () => {
    const never = new Promise<never>(() => undefined);
    const upsertJobScheduler = vi.fn().mockReturnValue(never);

    const result = new ReleaseActivationScheduler(
      queueWith({ upsertJobScheduler }),
    ).onApplicationBootstrap();

    expect(result).toBeUndefined();
    expect(upsertJobScheduler).toHaveBeenCalledOnce();
  });

  it('schedules the daily job and one start-up run', async () => {
    const upsertJobScheduler = vi.fn().mockResolvedValue(undefined);
    const add = vi.fn().mockResolvedValue(undefined);

    await new ReleaseActivationScheduler(
      queueWith({ upsertJobScheduler, add }),
    ).schedule();

    expect(upsertJobScheduler).toHaveBeenCalledOnce();
    expect(add).toHaveBeenCalledOnce();
  });

  it('logs instead of throwing when Redis refuses the job', async () => {
    const add = vi.fn();
    const queue = queueWith({
      upsertJobScheduler: vi.fn().mockRejectedValue(new Error('down')),
      add,
    });

    await expect(
      new ReleaseActivationScheduler(queue).schedule(),
    ).resolves.toBeUndefined();
    expect(add).not.toHaveBeenCalled();
  });
});
