import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseRelationType,
  Prisma,
  ProgramVersionStatus,
} from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { ConsistencyChecker } from './consistency-checker.js';

const dec = (value: string) => new Prisma.Decimal(value);

function version(patch: Record<string, unknown> = {}) {
  return {
    id: 'v1',
    programId: 'p1',
    versionNumber: null,
    status: ProgramVersionStatus.DRAFT,
    programName: 'Chương trình',
    semesterCount: 1,
    totalCredits: dec('6'),
    compulsoryCredits: dec('6'),
    electiveCredits: dec('0'),
    program: { id: 'p1', facultyId: 'f1', programCode: '1024034' },
    creditMismatchReason: null,
    creditMismatchCompulsoryGap: null,
    creditMismatchElectiveGap: null,
    creditMismatchAcceptedAt: null,
    creditMismatchAcceptedBy: null,
    ...patch,
  };
}

function row(
  code: string,
  patch: Record<string, unknown> = {},
  requisites: Array<{ code: string; type: CourseRelationType }> = [],
) {
  return {
    id: `item-${code}`,
    courseId: `course-${code}`,
    plannedSemester: 1,
    isElective: false,
    electiveGroupId: null,
    course: { courseCode: code, credits: dec('3') },
    requisites: requisites.map((requisite) => ({
      sourceCourseId: `course-${requisite.code}`,
      relationType: requisite.type,
      sourceCourse: { courseCode: requisite.code },
    })),
    ...patch,
  };
}

describe('ConsistencyChecker', () => {
  let db: {
    programVersion: { findUnique: ReturnType<typeof vi.fn> };
    curriculumItem: { findMany: ReturnType<typeof vi.fn> };
    electiveGroup: { findMany: ReturnType<typeof vi.fn> };
    courseRelation: { findMany: ReturnType<typeof vi.fn> };
    course: { findMany: ReturnType<typeof vi.fn> };
    syllabus: { findMany: ReturnType<typeof vi.fn> };
  };
  let checker: ConsistencyChecker;

  beforeEach(() => {
    db = {
      programVersion: { findUnique: vi.fn().mockResolvedValue(version()) },
      curriculumItem: {
        findMany: vi.fn().mockResolvedValue([row('A'), row('B')]),
      },
      electiveGroup: { findMany: vi.fn().mockResolvedValue([]) },
      courseRelation: { findMany: vi.fn().mockResolvedValue([]) },
      course: { findMany: vi.fn().mockResolvedValue([]) },
      // Every course has a Published revision unless a test says otherwise.
      syllabus: {
        findMany: vi
          .fn()
          .mockImplementation(
            ({ where }: { where: { courseId?: { in: string[] } } }) =>
              Promise.resolve(
                (where.courseId?.in ?? []).map((courseId) => ({
                  id: `rev-${courseId}`,
                  courseId,
                  revisionNumber: 1,
                  status: 'PUBLISHED',
                })),
              ),
          ),
      },
    };
    checker = new ConsistencyChecker(db as unknown as PrismaService);
  });

  const run = () => checker.check('v1', db as unknown as PrismaService);

  it('is clean when the curriculum matches the declared credits', async () => {
    const result = await run();
    expect(result.issues).toEqual([]);
    expect(result.credits.mismatch).toBe(false);
  });

  it('raises a credit mismatch naming declared, computed and the gap (KB-018)', async () => {
    db.programVersion.findUnique.mockResolvedValue(
      version({ totalCredits: dec('8'), compulsoryCredits: dec('8') }),
    );

    const { credits, issues } = await run();

    expect(credits.gap.total.toString()).toBe('-2');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'CREDIT_MISMATCH',
      severity: 'HIGH',
    });
    expect(issues[0].message).toContain('8');
    expect(issues[0].message).toContain('6');
    expect(issues[0].message).toContain('2.');
  });

  const accepted = (gap: string) => ({
    totalCredits: dec('8'),
    compulsoryCredits: dec('8'),
    creditMismatchReason: 'Theo quyết định',
    creditMismatchCompulsoryGap: dec(gap),
    creditMismatchElectiveGap: dec('0'),
    creditMismatchAcceptedAt: new Date('2026-10-19T00:00:00Z'),
    creditMismatchAcceptedBy: { id: 'u1', fullName: 'Nguyễn An' },
  });

  it('shows an accepted mismatch as info while the gaps are unchanged', async () => {
    db.programVersion.findUnique.mockResolvedValue(version(accepted('-2')));

    const { credits, issues } = await run();

    expect(credits.acceptanceCurrent).toBe(true);
    expect(issues).toEqual([
      expect.objectContaining({
        code: 'CREDIT_MISMATCH_ACCEPTED',
        severity: 'INFO',
      }),
    ]);
    expect(issues[0].message).toContain('Nguyễn An');
  });

  it('brings the warning back when the gap moved, keeping the stored acceptance (US-030 AC4)', async () => {
    db.programVersion.findUnique.mockResolvedValue(version(accepted('-5')));

    const { credits, issues } = await run();

    expect(credits.acceptanceCurrent).toBe(false);
    expect(credits.acceptance).not.toBeNull();
    expect(issues[0]).toMatchObject({ code: 'CREDIT_MISMATCH' });
  });

  it('raises nothing when an old acceptance is stored but nothing mismatches', async () => {
    db.programVersion.findUnique.mockResolvedValue(
      version({
        ...accepted('-2'),
        totalCredits: dec('6'),
        compulsoryCredits: dec('6'),
      }),
    );
    const { credits, issues } = await run();
    expect(issues).toEqual([]);
    expect(credits.acceptanceCurrent).toBe(false);
  });

  it('reports a loop through the catalog and the curriculum as an error (KB-020)', async () => {
    db.curriculumItem.findMany.mockResolvedValue([
      row('B', {}, [{ code: 'A', type: CourseRelationType.PREREQUISITE }]),
      row('A', { plannedSemester: 1 }),
    ]);
    db.courseRelation.findMany.mockResolvedValue([
      { sourceCourseId: 'course-B', targetCourseId: 'course-A' },
    ]);

    const { issues } = await run();

    const cycle = issues.find((issue) => issue.code === 'REQUISITE_CYCLE');
    expect(cycle).toMatchObject({ severity: 'ERROR', itemId: 'item-B' });
    expect(cycle?.message).toMatch(/A → B → A|B → A → B/);
  });

  it('asserts nothing for warnings and rejects errors with one detail each', async () => {
    db.curriculumItem.findMany.mockResolvedValue([
      row('A'),
      row('A', { id: 'dup' }),
    ]);
    db.programVersion.findUnique.mockResolvedValue(
      version({ totalCredits: dec('9'), compulsoryCredits: dec('9') }),
    );

    await expect(
      checker.assertPasses('v1', db as unknown as PrismaService),
    ).rejects.toMatchObject({
      code: 'CONSISTENCY_FAILED',
      details: [
        { field: 'DUPLICATE_COURSE', constraints: [expect.any(String)] },
      ],
    });
  });

  it('resolves when only warnings are present', async () => {
    db.programVersion.findUnique.mockResolvedValue(
      version({ totalCredits: dec('9'), compulsoryCredits: dec('9') }),
    );
    await expect(
      checker.assertPasses('v1', db as unknown as PrismaService),
    ).resolves.toBeUndefined();
  });

  it('answers 404 for an unknown version', async () => {
    db.programVersion.findUnique.mockResolvedValue(null);
    await expect(run()).rejects.toMatchObject({
      code: 'PROGRAM_VERSION_NOT_FOUND',
    });
  });

  it('names a course without any syllabus revision as an error (MISSING_SYLLABUS, D7)', async () => {
    db.syllabus.findMany.mockImplementation(
      ({ where }: { where: { courseId?: { in: string[] } } }) =>
        Promise.resolve(
          (where.courseId?.in ?? [])
            .filter((courseId) => courseId !== 'course-B')
            .map((courseId) => ({
              id: `rev-${courseId}`,
              courseId,
              revisionNumber: 1,
              status: 'PUBLISHED',
            })),
        ),
    );

    const { issues } = await run();

    expect(issues.filter((issue) => issue.code === 'MISSING_SYLLABUS')).toEqual(
      [
        expect.objectContaining({
          severity: 'ERROR',
          itemId: 'item-B',
          message: expect.stringContaining('B'),
        }),
      ],
    );
    await expect(
      checker.assertPasses('v1', db as unknown as PrismaService),
    ).rejects.toMatchObject({ code: 'CONSISTENCY_FAILED' });
  });

  it('counts a pinned row by its pin and a released row by its frozen credits', async () => {
    db.curriculumItem.findMany.mockResolvedValue([
      row('A', { syllabusId: 'old-rev', creditsSnapshot: dec('4') }),
      row('B'),
    ]);
    db.syllabus.findMany.mockImplementation(
      ({
        where,
      }: {
        where: { id?: { in: string[] }; courseId?: { in: string[] } };
      }) =>
        Promise.resolve(
          where.id
            ? [
                {
                  id: 'old-rev',
                  courseId: 'course-A',
                  revisionNumber: 1,
                  status: 'HISTORICAL',
                },
              ]
            : [
                {
                  id: 'rev-B',
                  courseId: 'course-B',
                  revisionNumber: 1,
                  status: 'PUBLISHED',
                },
              ],
        ),
    );

    const { issues, credits } = await run();

    expect(issues.some((issue) => issue.code === 'MISSING_SYLLABUS')).toBe(
      false,
    );
    expect(credits.computed.total.toString()).toBe('7');
  });
});
