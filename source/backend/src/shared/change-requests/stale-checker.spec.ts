import { describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import { StaleChecker, type StaleSubject } from './stale-checker.js';

const checker = new StaleChecker();

function db(parts: Record<string, unknown>) {
  return parts as unknown as Prisma.TransactionClient;
}

const PROGRAM_REQUEST: StaleSubject = {
  id: 'cr1',
  requestType: 'CURRICULUM',
  targetType: 'PROGRAM',
  programId: 'p1',
  courseId: null,
};
const SYLLABUS_REQUEST: StaleSubject = {
  id: 'cr2',
  requestType: 'SYLLABUS_CONTENT',
  targetType: 'COURSE',
  programId: null,
  courseId: 'c1',
};
const COURSE_REQUEST: StaleSubject = {
  id: 'cr3',
  requestType: 'COURSE_RELATION',
  targetType: 'COURSE',
  programId: null,
  courseId: 'c1',
};

describe('StaleChecker', () => {
  describe('program copies', () => {
    const copy = (baseVersionId: string) => ({
      programVersion: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ baseVersionId }),
        findFirst: vi.fn().mockResolvedValue({ id: 'v2' }),
      },
    });

    it('is fresh while the base is the newest released version', async () => {
      await expect(
        checker.isStale(db(copy('v2')), PROGRAM_REQUEST),
      ).resolves.toBe(false);
    });

    it('is stale when a newer version, even a Pending one, has appeared', async () => {
      await expect(
        checker.isStale(db(copy('v1')), PROGRAM_REQUEST),
      ).resolves.toBe(true);
    });
  });

  describe('syllabus copies', () => {
    const copy = (baseRevisionId: string, published: string | null) => ({
      syllabus: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ baseRevisionId }),
        findFirst: vi.fn().mockResolvedValue(published && { id: published }),
      },
    });

    it('compares the base with the published revision', async () => {
      await expect(
        checker.isStale(db(copy('s1', 's1')), SYLLABUS_REQUEST),
      ).resolves.toBe(false);
      await expect(
        checker.isStale(db(copy('s1', 's2')), SYLLABUS_REQUEST),
      ).resolves.toBe(true);
      await expect(
        checker.isStale(db(copy('s1', null)), SYLLABUS_REQUEST),
      ).resolves.toBe(true);
    });
  });

  describe('authored items', () => {
    function authored(
      item: Record<string, unknown>,
      parts: Record<string, unknown> = {},
    ) {
      return db({
        changeItem: {
          findMany: vi
            .fn()
            .mockResolvedValue([{ changeRequestId: 'cr3', ...item }]),
        },
        ...parts,
      });
    }

    it('is stale when the course field changed since the item was written', async () => {
      const item = {
        oldValue: { value: '3' },
        newValue: {
          operation: 'SET_COURSE_FIELD',
          field: 'credits',
          value: '4',
        },
      };
      const course = (credits: string) => ({
        course: { findUnique: vi.fn().mockResolvedValue({ credits }) },
      });
      await expect(
        checker.isStale(authored(item, course('3')), COURSE_REQUEST),
      ).resolves.toBe(false);
      await expect(
        checker.isStale(authored(item, course('5')), COURSE_REQUEST),
      ).resolves.toBe(true);
    });

    it('is stale when a relation to add already exists or one to change is gone or moved', async () => {
      const add = {
        oldValue: null,
        newValue: {
          operation: 'ADD_RELATION',
          sourceCourseId: 'a',
          targetCourseId: 'b',
          relationType: 'PREREQUISITE',
          minScore: null,
        },
      };
      const relations = (found: unknown) => ({
        courseRelation: {
          findFirst: vi.fn().mockResolvedValue(found),
          findUnique: vi.fn().mockResolvedValue(found),
        },
      });
      await expect(
        checker.isStale(authored(add, relations(null)), COURSE_REQUEST),
      ).resolves.toBe(false);
      await expect(
        checker.isStale(authored(add, relations({ id: 'r' })), COURSE_REQUEST),
      ).resolves.toBe(true);
      const update = {
        oldValue: { minScore: '2' },
        newValue: {
          operation: 'UPDATE_RELATION',
          relationId: 'r',
          minScore: '3',
        },
      };
      await expect(
        checker.isStale(
          authored(update, relations({ minScore: '2' })),
          COURSE_REQUEST,
        ),
      ).resolves.toBe(false);
      await expect(
        checker.isStale(
          authored(update, relations({ minScore: '2.5' })),
          COURSE_REQUEST,
        ),
      ).resolves.toBe(true);
      await expect(
        checker.isStale(authored(update, relations(null)), COURSE_REQUEST),
      ).resolves.toBe(true);
    });

    it('is stale when a membership to end was revoked or already ends elsewhere, and never for an addition', async () => {
      const end = {
        oldValue: { validTo: null },
        newValue: {
          operation: 'END_MEMBERSHIP',
          memberRowId: 'm1',
          validTo: '2026-12-31',
        },
      };
      const member = (row: unknown) => ({
        subjectGroupMember: { findUnique: vi.fn().mockResolvedValue(row) },
      });
      const orgRequest = {
        ...COURSE_REQUEST,
        requestType: 'ORGANIZATION' as const,
        targetType: 'SUBJECT_GROUP' as const,
      };
      await expect(
        checker.isStale(
          authored(end, member({ revokedAt: null, validTo: null })),
          orgRequest,
        ),
      ).resolves.toBe(false);
      await expect(
        checker.isStale(
          authored(end, member({ revokedAt: new Date(), validTo: null })),
          orgRequest,
        ),
      ).resolves.toBe(true);
      await expect(
        checker.isStale(
          authored(
            end,
            member({
              revokedAt: null,
              validTo: new Date('2026-12-01T00:00:00Z'),
            }),
          ),
          orgRequest,
        ),
      ).resolves.toBe(true);
      const add = {
        oldValue: null,
        newValue: {
          operation: 'ADD_MEMBER',
          lecturerId: 'u',
          memberRole: 'MEMBER',
          validFrom: '2026-11-01',
          validTo: null,
        },
      };
      await expect(checker.isStale(authored(add), orgRequest)).resolves.toBe(
        false,
      );
    });
  });
});
