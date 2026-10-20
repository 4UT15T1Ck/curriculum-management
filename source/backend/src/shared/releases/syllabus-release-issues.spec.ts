import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import {
  assertNoSyllabusIssues,
  collectSyllabusIssues,
  syllabusPublishIssues,
} from './syllabus-release-issues.js';

function dbWith(
  items: { courseId: string; code: string }[],
  revisions: Record<string, unknown>[],
) {
  return {
    curriculumItem: {
      findMany: vi.fn().mockResolvedValue(
        items.map((item) => ({
          courseId: item.courseId,
          course: { courseCode: item.code },
        })),
      ),
    },
    syllabus: { findMany: vi.fn().mockResolvedValue(revisions) },
  } as unknown as PrismaService;
}

const FULL = { courseDescription: '<p>a</p>', objectives: '<p>b</p>' };

describe('syllabusPublishIssues', () => {
  it('reads empty rich text as missing', () => {
    expect(syllabusPublishIssues(FULL)).toEqual([]);
    expect(
      syllabusPublishIssues({ courseDescription: '<p></p>', objectives: null }),
    ).toEqual(['COURSE_DESCRIPTION_EMPTY', 'OBJECTIVES_EMPTY']);
  });
});

describe('collectSyllabusIssues', () => {
  it('skips pinned rows, published courses and complete Drafts; names the rest per course', async () => {
    const db = dbWith(
      [
        { courseId: 'pub', code: 'PUB' },
        { courseId: 'ok', code: 'OK' },
        { courseId: 'half', code: 'HALF' },
        { courseId: 'none', code: 'NONE' },
      ],
      [
        {
          courseId: 'pub',
          status: 'PUBLISHED',
          courseDescription: null,
          objectives: null,
        },
        { courseId: 'ok', status: 'DRAFT', ...FULL },
        {
          courseId: 'half',
          status: 'DRAFT',
          courseDescription: null,
          objectives: '<p>b</p>',
        },
      ],
    );

    expect(await collectSyllabusIssues(db, 'v1')).toEqual([
      {
        courseId: 'half',
        courseCode: 'HALF',
        code: 'SYLLABUS_INCOMPLETE',
        details: ['COURSE_DESCRIPTION_EMPTY'],
      },
      {
        courseId: 'none',
        courseCode: 'NONE',
        code: 'MISSING_SYLLABUS',
        details: [],
      },
    ]);
    expect(
      (db.curriculumItem.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0]
        .where,
    ).toEqual({ versionId: 'v1', syllabusId: null });
  });

  it('does not query syllabi for a frame whose rows are all pinned', async () => {
    const db = dbWith([], []);

    expect(await collectSyllabusIssues(db, 'v1')).toEqual([]);
    expect(
      (db.syllabus.findMany as ReturnType<typeof vi.fn>).mock.calls,
    ).toHaveLength(0);
  });

  it('raises one error that carries every course, by code', async () => {
    const db = dbWith([{ courseId: 'none', code: 'NONE' }], []);

    await expect(assertNoSyllabusIssues(db, 'v1')).rejects.toMatchObject({
      code: 'SYLLABUS_INCOMPLETE',
      details: [{ field: 'NONE', constraints: ['MISSING_SYLLABUS'] }],
    });
  });
});
