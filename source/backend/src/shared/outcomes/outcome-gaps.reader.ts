import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { revisionForItems } from '../syllabi/revision-for-items.js';
import { outcomeGaps, type OutcomeGaps } from './outcome-gaps.js';

type CloRef = { id: string; cloCode: string; description: string };

// The three coverage lists of a program version, for the coverage screen (F-11) and the health board (F-24).
@Injectable()
export class OutcomeGapsReader {
  constructor(private readonly prisma: PrismaService) {}

  async forVersion(versionId: string): Promise<OutcomeGaps> {
    const [plos, items, cells, links] = await Promise.all([
      this.prisma.pLO.findMany({
        where: { versionId },
        select: { id: true, ploCode: true, description: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.curriculumItem.findMany({
        where: { versionId },
        select: {
          id: true,
          plannedSemester: true,
          syllabusId: true,
          courseNameSnapshot: true,
          course: {
            select: {
              id: true,
              courseCode: true,
              courseName: true,
              ownerGroupId: true,
            },
          },
        },
        orderBy: [
          { plannedSemester: 'asc' },
          { sortOrder: 'asc' },
          { id: 'asc' },
        ],
      }),
      this.prisma.coursePLOMapping.findMany({
        where: { curriculumItem: { versionId } },
        select: { curriculumItemId: true, ploId: true },
      }),
      this.prisma.cLOPLOMapping.findMany({
        where: { coursePlo: { curriculumItem: { versionId } } },
        select: { curriculumItemId: true, cloId: true },
      }),
    ]);
    const revisions = await revisionForItems(
      this.prisma,
      items.map((item) => ({
        id: item.id,
        courseId: item.course.id,
        syllabusId: item.syllabusId,
      })),
    );
    const closByRevision = await this.closOf([
      ...new Set(
        [...revisions.values()].flatMap((revision) =>
          revision ? [revision.id] : [],
        ),
      ),
    ]);
    return outcomeGaps({
      plos,
      items: items.map(
        ({ id, plannedSemester, course, courseNameSnapshot }) => {
          const revision = revisions.get(id);
          return {
            itemId: id,
            plannedSemester,
            courseCode: course.courseCode,
            courseName: courseNameSnapshot ?? course.courseName,
            ownerGroupId: course.ownerGroupId,
            clos: revision ? (closByRevision.get(revision.id) ?? []) : null,
          };
        },
      ),
      cells,
      links,
    });
  }

  private async closOf(syllabusIds: string[]): Promise<Map<string, CloRef[]>> {
    const byRevision = new Map<string, CloRef[]>();
    if (syllabusIds.length === 0) {
      return byRevision;
    }
    const clos = await this.prisma.cLO.findMany({
      where: { syllabusId: { in: syllabusIds } },
      select: { id: true, syllabusId: true, cloCode: true, description: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    for (const { syllabusId, ...clo } of clos) {
      byRevision.set(syllabusId, [...(byRevision.get(syllabusId) ?? []), clo]);
    }
    return byRevision;
  }
}
