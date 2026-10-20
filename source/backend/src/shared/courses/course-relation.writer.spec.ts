import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import {
  createRelation,
  removeRelation,
  updateRelationMinScore,
} from './course-relation.writer.js';

const course = (id: string, patch: object = {}) => ({
  id,
  courseCode: id.toUpperCase(),
  courseName: id,
  credits: new Prisma.Decimal('3'),
  status: 'ACTIVE',
  ownerFacultyId: 'f1',
  ownerGroupId: null,
  ownerFaculty: { unitCode: 'KHOA_CNTT' },
  ...patch,
});

describe('relation writer', () => {
  let db: {
    course: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    courseRelation: Record<string, ReturnType<typeof vi.fn>>;
    $executeRaw: ReturnType<typeof vi.fn>;
  };
  let tx: Prisma.TransactionClient;
  const newRelation = {
    sourceCourseId: 'a',
    targetCourseId: 'b',
    relationType: 'PREREQUISITE' as const,
  };

  beforeEach(() => {
    db = {
      course: {
        findUnique: vi.fn(({ where }: { where: { id: string } }) =>
          Promise.resolve(course(where.id)),
        ),
        findMany: vi.fn().mockResolvedValue([]),
      },
      courseRelation: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn((args: { data: object }) =>
          Promise.resolve({ id: 'rel', ...args.data }),
        ),
        findUnique: vi.fn(),
        update: vi.fn((args: { data: object }) =>
          Promise.resolve({ id: 'rel', ...args.data }),
        ),
        delete: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
      },
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    tx = db as unknown as Prisma.TransactionClient;
  });

  describe('createRelation', () => {
    it("takes the graph lock, writes the row and hands the owning course to the caller's check first", async () => {
      const order: string[] = [];
      db.$executeRaw.mockImplementation(() => {
        order.push('lock');
        return Promise.resolve(0);
      });
      const before = vi.fn(() => {
        order.push('check');
      });

      await createRelation(tx, { ...newRelation, minScore: '2' }, before);

      expect(order).toEqual(['check', 'lock']);
      expect(before).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
      expect(
        db.courseRelation.create.mock.calls[0][0].data.minScore.toString(),
      ).toBe('2');
    });

    it('refuses a self relation, a threshold on a corequisite, an unknown or cancelled course', async () => {
      await expect(
        createRelation(tx, { ...newRelation, targetCourseId: 'a' }),
      ).rejects.toMatchObject({ code: 'RELATION_SELF' });
      await expect(
        createRelation(tx, {
          ...newRelation,
          relationType: 'COREQUISITE',
          minScore: '2',
        }),
      ).rejects.toMatchObject({ code: 'MIN_SCORE_NOT_ALLOWED' });
      db.course.findUnique.mockResolvedValueOnce(null);
      await expect(createRelation(tx, newRelation)).rejects.toMatchObject({
        code: 'RELATION_COURSE_NOT_FOUND',
      });
      db.course.findUnique.mockImplementation(
        ({ where }: { where: { id: string } }) =>
          Promise.resolve(
            course(where.id, where.id === 'a' ? { status: 'CANCELLED' } : {}),
          ),
      );
      await expect(createRelation(tx, newRelation)).rejects.toMatchObject({
        code: 'RELATION_COURSE_CANCELLED',
      });
      expect(db.courseRelation.create).not.toHaveBeenCalled();
    });

    it('refuses an edge that closes a loop, naming it', async () => {
      db.courseRelation.findMany.mockResolvedValue([
        { sourceCourseId: 'b', targetCourseId: 'a' },
      ]);
      db.course.findMany.mockResolvedValue([
        { id: 'a', courseCode: 'A' },
        { id: 'b', courseCode: 'B' },
      ]);

      await expect(createRelation(tx, newRelation)).rejects.toMatchObject({
        code: 'REQUISITE_CYCLE',
      });
    });

    it('maps a repeated relation to RELATION_EXISTS', async () => {
      db.courseRelation.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(createRelation(tx, newRelation)).rejects.toMatchObject({
        code: 'RELATION_EXISTS',
      });
    });

    it("lets a caller's refusal stop the write", async () => {
      await expect(
        createRelation(tx, newRelation, () => {
          throw new Error('not yours');
        }),
      ).rejects.toThrow('not yours');
      expect(db.courseRelation.create).not.toHaveBeenCalled();
    });
  });

  describe('updateRelationMinScore and removeRelation', () => {
    const row = (patch: object = {}) => ({
      id: 'rel',
      relationType: 'PREREQUISITE',
      sourceCourseId: 'a',
      targetCourseId: 'b',
      sourceCourse: course('a'),
      targetCourse: course('b'),
      minScore: null,
      ...patch,
    });

    it('changes a prerequisite threshold, clears it, and refuses one on another type', async () => {
      db.courseRelation.findUnique.mockResolvedValue(row());
      await updateRelationMinScore(tx, 'rel', '2.5');
      await updateRelationMinScore(tx, 'rel', null);
      expect(
        db.courseRelation.update.mock.calls[0][0].data.minScore.toString(),
      ).toBe('2.5');
      expect(
        db.courseRelation.update.mock.calls[1][0].data.minScore,
      ).toBeNull();

      db.courseRelation.findUnique.mockResolvedValue(
        row({ relationType: 'COREQUISITE' }),
      );
      await expect(
        updateRelationMinScore(tx, 'rel', '2'),
      ).rejects.toMatchObject({
        code: 'MIN_SCORE_NOT_ALLOWED',
      });
    });

    it('answers RELATION_NOT_FOUND for an unknown relation', async () => {
      db.courseRelation.findUnique.mockResolvedValue(null);

      await expect(removeRelation(tx, 'rel')).rejects.toMatchObject({
        code: 'RELATION_NOT_FOUND',
      });
    });

    it('keeps the only replacement of a discontinued course', async () => {
      db.courseRelation.findUnique.mockResolvedValue(
        row({
          relationType: 'REPLACEMENT',
          sourceCourse: course('a', { status: 'DISCONTINUED' }),
        }),
      );

      await expect(removeRelation(tx, 'rel')).rejects.toMatchObject({
        code: 'REPLACEMENT_STILL_NEEDED',
      });
      expect(db.courseRelation.delete).not.toHaveBeenCalled();

      db.courseRelation.count.mockResolvedValue(1);
      await removeRelation(tx, 'rel');
      expect(db.courseRelation.delete).toHaveBeenCalledWith({
        where: { id: 'rel' },
      });
    });

    it("runs the caller's check on the row before any write", async () => {
      db.courseRelation.findUnique.mockResolvedValue(row());
      const before = vi.fn(() => {
        throw new Error('not yours');
      });

      await expect(removeRelation(tx, 'rel', before)).rejects.toThrow(
        'not yours',
      );
      expect(db.courseRelation.delete).not.toHaveBeenCalled();
    });
  });
});
