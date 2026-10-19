import { describe, expect, it, vi } from 'vitest';
import {
  CourseRelationType,
  CourseStatus,
  ProgramStatus,
  ProgramVersionStatus,
} from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CourseUsageReader } from './course-usage.reader.js';

function readerWith(found: { id: string } | null) {
  const findFirst = vi.fn().mockResolvedValue(found);
  const reader = new CourseUsageReader({
    courseRelation: { findFirst },
  } as unknown as PrismaService);
  return { reader, findFirst };
}

describe('CourseUsageReader.hasActiveReplacement', () => {
  it('asks for a REPLACEMENT from the course to an ACTIVE course', async () => {
    const { reader, findFirst } = readerWith({ id: 'relation' });
    await expect(reader.hasActiveReplacement('course')).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        sourceCourseId: 'course',
        relationType: CourseRelationType.REPLACEMENT,
        targetCourse: { status: CourseStatus.ACTIVE },
      },
      select: { id: true },
    });
  });

  it('is false when the only replacement is not active (no row matches)', async () => {
    const { reader } = readerWith(null);
    await expect(reader.hasActiveReplacement('course')).resolves.toBe(false);
  });

  it('reads through the given transaction client', async () => {
    const { reader, findFirst } = readerWith(null);
    const inTransaction = vi.fn().mockResolvedValue({ id: 'written' });
    await expect(
      reader.hasActiveReplacement('course', {
        courseRelation: { findFirst: inTransaction },
      } as never),
    ).resolves.toBe(true);
    expect(inTransaction).toHaveBeenCalledOnce();
    expect(findFirst).not.toHaveBeenCalled();
  });
});

function curriculumReader(rows: object[]) {
  const findMany = vi.fn().mockResolvedValue(rows);
  const findFirst = vi.fn().mockResolvedValue(rows[0] ?? null);
  const reader = new CourseUsageReader({
    curriculumItem: { findMany, findFirst },
  } as unknown as PrismaService);
  return { reader, findMany, findFirst };
}

describe('CourseUsageReader.programsUsing', () => {
  it('maps one entry per program version with its planned semester (KB-026)', async () => {
    const program = { id: 'p1', programCode: '1024034' };
    const { reader, findMany } = curriculumReader([
      {
        plannedSemester: 3,
        version: {
          programName: 'Kỹ thuật máy tính',
          versionNumber: null,
          program,
        },
      },
      {
        plannedSemester: 4,
        version: {
          programName: 'Kỹ thuật máy tính',
          versionNumber: '1.0',
          program,
        },
      },
    ]);

    await expect(reader.programsUsing('course')).resolves.toEqual([
      {
        programId: 'p1',
        programCode: '1024034',
        programName: 'Kỹ thuật máy tính',
        versionLabel: null,
        plannedSemester: 3,
      },
      {
        programId: 'p1',
        programCode: '1024034',
        programName: 'Kỹ thuật máy tính',
        versionLabel: '1.0',
        plannedSemester: 4,
      },
    ]);
    expect(findMany.mock.calls[0][0].where).toEqual({
      courseId: 'course',
      version: {
        status: { not: ProgramVersionStatus.HISTORICAL },
        program: { status: ProgramStatus.ACTIVE },
      },
    });
  });

  it('is empty when no row matches', async () => {
    const { reader } = curriculumReader([]);
    await expect(reader.programsUsing('course')).resolves.toEqual([]);
  });
});

describe('CourseUsageReader.inReleasedVersion', () => {
  it('looks only at versions that left Draft', async () => {
    const { reader, findFirst } = curriculumReader([{ id: 'item' }]);
    await expect(reader.inReleasedVersion('course')).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        courseId: 'course',
        version: { status: { not: ProgramVersionStatus.DRAFT } },
      },
      select: { id: true },
    });
  });

  it('is false with only Draft rows (no row matches)', async () => {
    const { reader } = curriculumReader([]);
    await expect(reader.inReleasedVersion('course')).resolves.toBe(false);
  });
});
