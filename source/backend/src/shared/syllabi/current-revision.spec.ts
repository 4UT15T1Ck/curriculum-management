import { describe, expect, it, vi } from 'vitest';
import { SyllabusStatus } from '../../generated/prisma/client.js';
import { currentRevisionByCourse } from './current-revision.js';

function prismaWith(
  rows: {
    id: string;
    courseId: string;
    revisionNumber: number;
    status: SyllabusStatus;
  }[],
) {
  return { syllabus: { findMany: vi.fn().mockResolvedValue(rows) } } as never;
}

describe('currentRevisionByCourse', () => {
  it('uses the Draft when nothing is published', async () => {
    const result = await currentRevisionByCourse(
      prismaWith([
        { id: 's1', courseId: 'c1', revisionNumber: 1, status: 'DRAFT' },
      ]),
      ['c1'],
    );
    expect(result.get('c1')).toEqual({
      id: 's1',
      revisionNumber: 1,
      status: 'DRAFT',
    });
  });

  it('prefers the published revision over a Draft, whatever the row order', async () => {
    for (const rows of [
      [
        { id: 'd', courseId: 'c1', revisionNumber: 2, status: 'DRAFT' },
        { id: 'p', courseId: 'c1', revisionNumber: 1, status: 'PUBLISHED' },
      ],
      [
        { id: 'p', courseId: 'c1', revisionNumber: 1, status: 'PUBLISHED' },
        { id: 'd', courseId: 'c1', revisionNumber: 2, status: 'DRAFT' },
      ],
    ] as const) {
      const result = await currentRevisionByCourse(
        prismaWith([...rows] as never),
        ['c1'],
      );
      expect(result.get('c1')?.id).toBe('p');
    }
  });

  it('leaves a course without a revision out and skips the query for no courses', async () => {
    const prisma = prismaWith([]);
    expect((await currentRevisionByCourse(prisma, ['c1'])).has('c1')).toBe(
      false,
    );
    const empty = prismaWith([]);
    await currentRevisionByCourse(empty, []);
    expect(
      (empty as unknown as { syllabus: { findMany: unknown } }).syllabus
        .findMany,
    ).not.toHaveBeenCalled();
  });
});
