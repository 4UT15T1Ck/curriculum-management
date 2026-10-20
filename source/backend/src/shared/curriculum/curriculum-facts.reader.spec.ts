import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CurriculumFactsReader } from './curriculum-facts.reader.js';

function readerWith(max: number | null) {
  const aggregate = vi
    .fn()
    .mockResolvedValue({ _max: { plannedSemester: max } });
  const reader = new CurriculumFactsReader({
    curriculumItem: { aggregate },
  } as unknown as PrismaService);
  return { reader, aggregate };
}

describe('CurriculumFactsReader.maxPlannedSemester', () => {
  it('returns the highest planned semester of the version', async () => {
    const { reader, aggregate } = readerWith(8);
    await expect(reader.maxPlannedSemester('v1')).resolves.toBe(8);
    expect(aggregate).toHaveBeenCalledWith({
      where: { versionId: 'v1' },
      _max: { plannedSemester: true },
    });
  });

  it('returns null for an empty curriculum', async () => {
    const { reader } = readerWith(null);
    await expect(reader.maxPlannedSemester('v1')).resolves.toBeNull();
  });
});
