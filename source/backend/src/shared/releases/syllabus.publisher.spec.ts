import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import { SyllabusPublisher } from './syllabus.publisher.js';

const NOW = new Date('2026-10-19T03:00:00.000Z');
const COMPLETE = {
  courseDescription: '<p>Mô tả</p>',
  objectives: '<p>Mục tiêu</p>',
};

describe('SyllabusPublisher', () => {
  let calls: string[];
  let syllabus: {
    findFirst: ReturnType<typeof vi.fn>;
    findUniqueOrThrow: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let tx: Prisma.TransactionClient;
  const publisher = new SyllabusPublisher();

  beforeEach(() => {
    calls = [];
    syllabus = {
      findFirst: vi.fn().mockResolvedValue(null),
      findUniqueOrThrow: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _max: { revisionNumber: 2 } }),
      update: vi.fn(
        (args: { where: { id: string }; data: { status?: string } }) => {
          calls.push(`${args.where.id}:${args.data.status}`);
          return Promise.resolve({ id: args.where.id, ...args.data });
        },
      ),
    };
    tx = { syllabus } as unknown as Prisma.TransactionClient;
  });

  describe('publishDraftForFirstPin', () => {
    it('reuses the published revision and writes nothing', async () => {
      syllabus.findFirst.mockResolvedValueOnce({ id: 'pub' });

      expect(await publisher.publishDraftForFirstPin(tx, 'c1', NOW)).toBe(
        'pub',
      );
      expect(syllabus.update).not.toHaveBeenCalled();
    });

    it('publishes a complete Draft with the publication time', async () => {
      syllabus.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'draft', courseId: 'c1', ...COMPLETE });

      expect(await publisher.publishDraftForFirstPin(tx, 'c1', NOW)).toBe(
        'draft',
      );
      expect(syllabus.update).toHaveBeenCalledWith({
        where: { id: 'draft' },
        data: { status: 'PUBLISHED', publishedAt: NOW },
      });
    });

    it('names a course with no revision at all', async () => {
      await expect(
        publisher.publishDraftForFirstPin(tx, 'c1', NOW),
      ).rejects.toMatchObject({
        code: 'MISSING_SYLLABUS',
        details: [{ field: 'c1' }],
      });
    });

    it.each([
      [
        { courseDescription: null, objectives: '<p>x</p>' },
        ['COURSE_DESCRIPTION_EMPTY'],
      ],
      [
        { courseDescription: '<p> </p>', objectives: null },
        ['COURSE_DESCRIPTION_EMPTY', 'OBJECTIVES_EMPTY'],
      ],
    ])(
      'refuses an incomplete Draft and lists every missing condition (DC-03)',
      async (content, missing) => {
        syllabus.findFirst
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'draft', courseId: 'c1', ...content });

        const error = await publisher
          .publishDraftForFirstPin(tx, 'c1', NOW)
          .catch((e: unknown) => e);

        expect(error).toMatchObject({ code: 'SYLLABUS_INCOMPLETE' });
        expect(
          (error as { details: { constraints: string[] }[] }).details.map(
            (detail) => detail.constraints[0],
          ),
        ).toEqual(missing);
        expect(syllabus.update).not.toHaveBeenCalled();
      },
    );
  });

  describe('publishFromRequest', () => {
    const copy = {
      id: 'copy',
      courseId: 'c1',
      sourceRequestId: 'r1',
      baseRevisionId: 'base',
      ...COMPLETE,
    };

    beforeEach(() => {
      syllabus.findUniqueOrThrow.mockImplementation(
        ({ where }: { where: { id: string } }) =>
          Promise.resolve(
            where.id === 'copy' ? copy : { id: 'base', status: 'PUBLISHED' },
          ),
      );
    });

    it('moves the published revision to Historical before the copy becomes Published', async () => {
      const result = await publisher.publishFromRequest(tx, 'copy', 'r1', NOW);

      expect(calls).toEqual(['base:HISTORICAL', 'copy:PUBLISHED']);
      expect(syllabus.update).toHaveBeenLastCalledWith({
        where: { id: 'copy' },
        data: expect.objectContaining({
          sourceRequestId: null,
          originRequestId: 'r1',
          baseRevisionId: null,
          revisionNumber: 3,
          previousVersionId: 'base',
          publishedAt: NOW,
        }),
      });
      expect(result.previous).toMatchObject({ id: 'base' });
    });

    it('refuses a copy of another request, and a base that is no longer the published revision', async () => {
      await expect(
        publisher.publishFromRequest(tx, 'copy', 'other', NOW),
      ).rejects.toMatchObject({
        code: 'ITEM_APPLY_FAILED',
      });
      syllabus.findUniqueOrThrow.mockImplementation(
        ({ where }: { where: { id: string } }) =>
          Promise.resolve(
            where.id === 'copy' ? copy : { id: 'base', status: 'HISTORICAL' },
          ),
      );
      await expect(
        publisher.publishFromRequest(tx, 'copy', 'r1', NOW),
      ).rejects.toMatchObject({
        code: 'ITEM_APPLY_FAILED',
      });
      expect(syllabus.update).not.toHaveBeenCalled();
    });

    it('refuses an incomplete copy before touching any row', async () => {
      syllabus.findUniqueOrThrow.mockImplementation(
        ({ where }: { where: { id: string } }) =>
          Promise.resolve(
            where.id === 'copy'
              ? { ...copy, objectives: null }
              : { id: 'base', status: 'PUBLISHED' },
          ),
      );

      await expect(
        publisher.publishFromRequest(tx, 'copy', 'r1', NOW),
      ).rejects.toMatchObject({
        code: 'SYLLABUS_INCOMPLETE',
      });
      expect(syllabus.update).not.toHaveBeenCalled();
    });
  });
});
