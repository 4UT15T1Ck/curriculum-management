import { Prisma as PrismaNs } from '../../generated/prisma/client.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import type { SyllabusPublisher } from './syllabus.publisher.js';
import {
  countDroppedLinks,
  repointCourseLinks,
  VersionPublisher,
  type PromoteVersionInput,
} from './version.publisher.js';

const dec = (value: string) => new PrismaNs.Decimal(value);
const NOW = new Date('2026-10-19T03:00:00.000Z');
const TODAY = new Date('2026-10-19T00:00:00.000Z');

const input: PromoteVersionInput = {
  versionId: 'v1',
  programId: 'p1',
  versionNumber: '1.0',
  decisionNumber: 'QD-1',
  signedDate: new Date('2026-10-01T00:00:00.000Z'),
  effectiveSemesterId: 'sem',
  effectiveStart: new Date('2026-09-07T00:00:00.000Z'),
  publisherId: 'u1',
  now: NOW,
  today: TODAY,
  cohortIds: [],
};

describe('VersionPublisher.promote', () => {
  let calls: string[];
  let programVersion: {
    findUniqueOrThrow: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let curriculumItem: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let cohortVersion: { createMany: ReturnType<typeof vi.fn> };
  let syllabi: { publishDraftForFirstPin: ReturnType<typeof vi.fn> };
  let tx: Prisma.TransactionClient;
  let publisher: VersionPublisher;

  beforeEach(() => {
    calls = [];
    programVersion = {
      findUniqueOrThrow: vi
        .fn()
        .mockResolvedValue({ id: 'v1', programId: 'p1', status: 'DRAFT' }),
      updateMany: vi.fn(() => {
        calls.push('demote');
        return Promise.resolve({ count: 1 });
      }),
      update: vi.fn((args: { data: { status: string } }) => {
        calls.push(`release:${args.data.status}`);
        return Promise.resolve({ id: 'v1', ...args.data });
      }),
    };
    curriculumItem = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'i1',
          courseId: 'c1',
          syllabusId: null,
          courseNameSnapshot: null,
          creditsSnapshot: null,
          course: { courseName: 'Nhập môn', credits: dec('3') },
        },
        {
          id: 'i2',
          courseId: 'c2',
          syllabusId: 'old-rev',
          courseNameSnapshot: 'Tên cũ',
          creditsSnapshot: dec('4'),
          course: { courseName: 'Tên mới', credits: dec('5') },
        },
      ]),
      update: vi.fn().mockResolvedValue({}),
    };
    cohortVersion = { createMany: vi.fn().mockResolvedValue({ count: 0 }) };
    syllabi = {
      publishDraftForFirstPin: vi.fn().mockResolvedValue('pinned-now'),
    };
    tx = {
      programVersion,
      curriculumItem,
      cohortVersion,
      $queryRaw: vi.fn().mockResolvedValue([]),
    } as unknown as Prisma.TransactionClient;
    publisher = new VersionPublisher(syllabi as unknown as SyllabusPublisher);
  });

  it('freezes a new row and keeps what an already released row froze (a copy of a version)', async () => {
    await publisher.promote(tx, input);

    expect(syllabi.publishDraftForFirstPin).toHaveBeenCalledTimes(1);
    expect(syllabi.publishDraftForFirstPin).toHaveBeenCalledWith(tx, 'c1', NOW);
    expect(curriculumItem.update).toHaveBeenCalledWith({
      where: { id: 'i1' },
      data: {
        syllabusId: 'pinned-now',
        courseNameSnapshot: 'Nhập môn',
        creditsSnapshot: dec('3'),
      },
    });
    expect(curriculumItem.update).toHaveBeenCalledWith({
      where: { id: 'i2' },
      data: {
        syllabusId: 'old-rev',
        courseNameSnapshot: 'Tên cũ',
        creditsSnapshot: dec('4'),
      },
    });
  });

  it('pins the same revision for the same course on two rows of one run', async () => {
    curriculumItem.findMany.mockResolvedValue(
      ['i1', 'i2'].map((id) => ({
        id,
        courseId: 'c1',
        syllabusId: null,
        courseNameSnapshot: null,
        creditsSnapshot: null,
        course: { courseName: 'X', credits: dec('3') },
      })),
    );

    await publisher.promote(tx, input);

    expect(syllabi.publishDraftForFirstPin).toHaveBeenCalledTimes(1);
  });

  it('retires the Active version before the release takes its place, once the semester has begun', async () => {
    const released = await publisher.promote(tx, input);

    expect(calls).toEqual(['demote', 'release:ACTIVE']);
    expect(programVersion.updateMany).toHaveBeenCalledWith({
      where: { programId: 'p1', status: 'ACTIVE', id: { not: 'v1' } },
      data: { status: 'HISTORICAL' },
    });
    expect(released.status).toBe('ACTIVE');
  });

  it('is Pending without touching the Active version while the semester lies ahead', async () => {
    await publisher.promote(tx, {
      ...input,
      effectiveStart: new Date('2027-01-18T00:00:00.000Z'),
    });

    expect(calls).toEqual(['release:PENDING']);
  });

  it('treats the semester start day itself as begun', async () => {
    await publisher.promote(tx, { ...input, effectiveStart: TODAY });

    expect(calls).toEqual(['demote', 'release:ACTIVE']);
  });

  it('keeps the status a correction asks for, whatever the date says', async () => {
    await publisher.promote(tx, { ...input, statusOverride: 'PENDING' });

    expect(calls).toEqual(['release:PENDING']);
  });

  it('writes the decision, the publisher, the provenance and clears the working-copy link', async () => {
    await publisher.promote(tx, {
      ...input,
      originRequestId: 'req',
      previousVersionId: 'prev',
      cohortIds: ['k1', 'k2'],
    });

    expect(programVersion.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: expect.objectContaining({
        sourceRequestId: null,
        baseVersionId: null,
        originRequestId: 'req',
        previousVersionId: 'prev',
        versionNumber: '1.0',
        decisionNumber: 'QD-1',
        effectiveSemesterId: 'sem',
        publishedById: 'u1',
        publishedAt: NOW,
      }),
    });
    expect(cohortVersion.createMany).toHaveBeenCalledWith({
      data: [
        { cohortId: 'k1', programVersionId: 'v1', fromSemesterId: 'sem' },
        { cohortId: 'k2', programVersionId: 'v1', fromSemesterId: 'sem' },
      ],
    });
  });

  it('assigns no cohort for an empty list', async () => {
    await publisher.promote(tx, input);

    expect(cohortVersion.createMany).not.toHaveBeenCalled();
  });

  it('refuses a version that is not a Draft of the program, writing nothing', async () => {
    for (const row of [
      { id: 'v1', programId: 'p1', status: 'ACTIVE' },
      { id: 'v1', programId: 'other', status: 'DRAFT' },
    ]) {
      programVersion.findUniqueOrThrow.mockResolvedValue(row);

      await expect(publisher.promote(tx, input)).rejects.toMatchObject({
        code: 'ALREADY_RELEASED',
      });
    }
    expect(curriculumItem.update).not.toHaveBeenCalled();
    expect(programVersion.update).not.toHaveBeenCalled();
  });

  it('maps a taken number to VERSION_NUMBER_TAKEN', async () => {
    programVersion.update.mockRejectedValue(
      new PrismaNs.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(publisher.promote(tx, input)).rejects.toMatchObject({
      code: 'VERSION_NUMBER_TAKEN',
    });
  });
});

describe('CLO links of a changed course', () => {
  let cLOPLOMapping: {
    findMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let tx: Prisma.TransactionClient;

  beforeEach(() => {
    cLOPLOMapping = {
      findMany: vi.fn().mockResolvedValue([
        { id: 'l1', cloId: 'old1', clo: { cloCode: 'CLO1' } },
        { id: 'l2', cloId: 'old2', clo: { cloCode: 'CLO2' } },
        { id: 'l3', cloId: 'same', clo: { cloCode: 'CLO3' } },
      ]),
      delete: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    };
    tx = {
      curriculumItem: { findMany: vi.fn().mockResolvedValue([{ id: 'i1' }]) },
      cLOPLOMapping,
      cLO: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'new1', cloCode: 'CLO1' },
          { id: 'same', cloCode: 'CLO3' },
        ]),
      },
    } as unknown as Prisma.TransactionClient;
  });

  it('moves a link to the new revision by cloCode, drops one whose code is gone and leaves the rest', async () => {
    const dropped = await repointCourseLinks(tx, 'v', 'c1', 'rev2');

    expect(dropped).toBe(1);
    expect(cLOPLOMapping.update).toHaveBeenCalledTimes(1);
    expect(cLOPLOMapping.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { cloId: 'new1' },
    });
    expect(cLOPLOMapping.delete).toHaveBeenCalledWith({ where: { id: 'l2' } });
  });

  it('counts what would be dropped without writing', async () => {
    cLOPLOMapping.findMany.mockResolvedValue([
      { clo: { cloCode: 'CLO1' } },
      { clo: { cloCode: 'GONE' } },
    ]);

    expect(await countDroppedLinks(tx as never, 'v', 'c1', 'rev2')).toBe(1);
    expect(cLOPLOMapping.delete).not.toHaveBeenCalled();
  });
});
