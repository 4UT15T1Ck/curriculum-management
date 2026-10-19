import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import type { ApprovalRecorder } from '../change-requests/approval-recorder.js';
import type { RequestNotifier } from '../change-requests/request-notifier.js';
import { VersionActivator } from './version.activator.js';

const TODAY = new Date('2026-10-19T00:00:00.000Z');
const PAST = new Date('2026-09-07T00:00:00.000Z');
const FUTURE = new Date('2027-01-18T00:00:00.000Z');

function setup() {
  const calls: string[] = [];
  const version = {
    id: 'v2',
    programId: 'p1',
    status: 'PENDING',
    effectiveSemesterId: 'sem',
    originRequestId: 'req',
    publishedById: 'office',
  };
  const db = {
    programVersion: {
      findUniqueOrThrow: vi.fn((args: { select?: unknown }) =>
        Promise.resolve(args.select ? { status: version.status } : version),
      ),
      updateMany: vi.fn((args: { data: { status: string } }) => {
        calls.push(`updateMany:${args.data.status}`);
        return Promise.resolve({ count: 1 });
      }),
      count: vi.fn().mockResolvedValue(0),
    },
    semester: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ startDate: PAST }),
    },
    changeRequest: {
      updateMany: vi.fn(() => {
        calls.push('claim-request');
        return Promise.resolve({ count: 1 });
      }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: 'req',
        requestCode: 'DX-1',
        createdById: 'creator',
      }),
    },
    $queryRaw: vi.fn(() => {
      calls.push('lock');
      return Promise.resolve([]);
    }),
  };
  const recorder = {
    close: vi.fn(() => {
      calls.push('close');
      return Promise.resolve();
    }),
  };
  const notifier = {
    effective: vi.fn(() => {
      calls.push('notify');
      return Promise.resolve();
    }),
  };
  const activator = new VersionActivator(
    recorder as unknown as ApprovalRecorder,
    notifier as unknown as RequestNotifier,
  );
  return {
    db,
    version,
    calls,
    recorder,
    notifier,
    activator,
    tx: db as unknown as Prisma.TransactionClient,
  };
}

describe('VersionActivator', () => {
  let s: ReturnType<typeof setup>;
  beforeEach(() => {
    s = setup();
  });

  it('retires the Active version, then activates, then closes the request once and tells its creator once', async () => {
    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(true);

    expect(s.calls).toEqual([
      'lock',
      'claim-request',
      'lock',
      'updateMany:HISTORICAL',
      'updateMany:ACTIVE',
      'close',
      'notify',
    ]);
    expect(s.recorder.close).toHaveBeenCalledWith(s.tx, 'req', 'EFFECTIVE');
    expect(s.notifier.effective).toHaveBeenCalledWith(
      s.tx,
      expect.objectContaining({ id: 'req' }),
      'sem',
      'office',
    );
  });

  it('takes the semester, then the request, then the program lock (the order a date edit uses)', async () => {
    await s.activator.activate(s.tx, 'v2', TODAY);

    const order = s.calls.filter(
      (call) => call === 'lock' || call === 'claim-request',
    );
    expect(order).toEqual(['lock', 'claim-request', 'lock']);
  });

  it('does nothing before the semester starts, and nothing for a version that is no longer Pending', async () => {
    s.db.semester.findUniqueOrThrow.mockResolvedValue({ startDate: FUTURE });
    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(false);

    s.db.semester.findUniqueOrThrow.mockResolvedValue({ startDate: PAST });
    s.version.status = 'ACTIVE';
    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(false);

    expect(s.db.programVersion.updateMany).not.toHaveBeenCalled();
    expect(s.notifier.effective).not.toHaveBeenCalled();
  });

  it('is a no-op on the second run: Active is not Pending, so no demotion, no second notice (K-7)', async () => {
    await s.activator.activate(s.tx, 'v2', TODAY);
    s.version.status = 'ACTIVE';
    s.calls.length = 0;

    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(false);

    expect(s.calls).toEqual([]);
    expect(s.notifier.effective).toHaveBeenCalledTimes(1);
  });

  it('leaves the request open while another of its versions still waits', async () => {
    s.db.programVersion.count.mockResolvedValue(1);

    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(true);

    expect(s.recorder.close).not.toHaveBeenCalled();
    expect(s.notifier.effective).not.toHaveBeenCalled();
  });

  it('does not close or notify a request that is no longer Approved (already Effective)', async () => {
    s.db.changeRequest.updateMany.mockResolvedValue({ count: 0 });

    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(true);

    expect(s.recorder.close).not.toHaveBeenCalled();
    expect(s.notifier.effective).not.toHaveBeenCalled();
  });

  it('activates a version released without a request and sends nothing', async () => {
    s.version.originRequestId = null as never;

    expect(await s.activator.activate(s.tx, 'v2', TODAY)).toBe(true);

    expect(s.db.changeRequest.updateMany).not.toHaveBeenCalled();
    expect(s.notifier.effective).not.toHaveBeenCalled();
  });

  it('rolls back when a racing writer already moved the version (the conditional write finds nothing)', async () => {
    s.db.programVersion.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(s.activator.activate(s.tx, 'v2', TODAY)).rejects.toMatchObject(
      {
        code: 'REQUEST_STATE_CHANGED',
      },
    );
    expect(s.notifier.effective).not.toHaveBeenCalled();
  });
});
