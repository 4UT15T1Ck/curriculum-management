import { describe, expect, it, vi } from 'vitest';
import {
  CourseRelationType,
  CourseStatus,
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
