import { describe, expect, it, vi } from 'vitest';
import { SyllabusStatus } from '../../generated/prisma/client.js';
import { revisionForItems } from './revision-for-items.js';

interface Row {
  id: string;
  courseId: string;
  revisionNumber: number;
  status: SyllabusStatus;
}

// findMany answers by the shape of the filter: a pin lookup is by id, the fallback by course.
function prismaWith(rows: Row[]) {
  const findMany = vi.fn(
    ({
      where,
    }: {
      where: { id?: { in: string[] }; courseId?: { in: string[] } };
    }) =>
      Promise.resolve(
        rows.filter((row) =>
          where.id
            ? where.id.in.includes(row.id)
            : where.courseId!.in.includes(row.courseId),
        ),
      ),
  );
  return { db: { syllabus: { findMany } } as never, findMany };
}

const draft: Row = {
  id: 'd',
  courseId: 'c1',
  revisionNumber: 2,
  status: 'DRAFT',
};
const published: Row = {
  id: 'p',
  courseId: 'c1',
  revisionNumber: 1,
  status: 'PUBLISHED',
};
const historical: Row = {
  id: 'h',
  courseId: 'c1',
  revisionNumber: 0,
  status: 'HISTORICAL',
};

describe('revisionForItems', () => {
  it('reads the Draft when nothing is published and the row is not pinned', async () => {
    const { db } = prismaWith([draft]);
    const result = await revisionForItems(db, [
      { id: 'i1', courseId: 'c1', syllabusId: null },
    ]);
    expect(result.get('i1')).toEqual({
      id: 'd',
      revisionNumber: 2,
      status: 'DRAFT',
    });
  });

  it('prefers the published revision over a Draft, whatever the row order', async () => {
    for (const rows of [
      [draft, published],
      [published, draft],
    ]) {
      const { db } = prismaWith(rows);
      const result = await revisionForItems(db, [
        { id: 'i1', courseId: 'c1', syllabusId: null },
      ]);
      expect(result.get('i1')?.id).toBe('p');
    }
  });

  it('keeps a pinned row on its revision even when it is historical and another is published', async () => {
    const { db } = prismaWith([published, historical]);
    const result = await revisionForItems(db, [
      { id: 'old', courseId: 'c1', syllabusId: 'h' },
      { id: 'new', courseId: 'c1', syllabusId: null },
    ]);
    expect(result.get('old')?.id).toBe('h');
    expect(result.get('new')?.id).toBe('p');
  });

  it('maps a row without any revision to null and skips queries for no rows', async () => {
    const { db, findMany } = prismaWith([]);
    expect(
      (
        await revisionForItems(db, [
          { id: 'i1', courseId: 'c1', syllabusId: null },
        ])
      ).get('i1'),
    ).toBeNull();
    findMany.mockClear();
    await revisionForItems(db, []);
    expect(findMany).not.toHaveBeenCalled();
  });
});
