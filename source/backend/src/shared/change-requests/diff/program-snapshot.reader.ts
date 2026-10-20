import type { Prisma } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { RELATION_TYPE_LABELS, VERSION_INFO_LABELS } from './diff-labels.js';
import { SNAPSHOT_ENTITY, type SnapshotEntry } from './snapshot-entry.js';
import { entry, scalar } from './snapshot-scalar.js';

const VERSION_INFO_FIELDS = [
  'programName',
  'majorCode',
  'majorName',
  'semesterCount',
  'totalCredits',
  'compulsoryCredits',
  'electiveCredits',
  'creditMismatchReason',
] as const;

// Everything a program version's working copy can change, keyed by what a reader recognises — never by row id (D5).
// One query with includes: a large program is not read item by item.
export async function readProgramSnapshot(
  db: PrismaService | Prisma.TransactionClient,
  versionId: string,
): Promise<SnapshotEntry[]> {
  const version = await db.programVersion.findUniqueOrThrow({
    where: { id: versionId },
    include: {
      electiveGroups: true,
      curriculumItems: {
        include: {
          course: { select: { courseCode: true, courseName: true } },
          electiveGroup: { select: { groupCode: true } },
          requisites: {
            include: { sourceCourse: { select: { courseCode: true } } },
          },
          ploMappings: {
            include: {
              plo: { select: { ploCode: true } },
              cloLinks: { include: { clo: { select: { cloCode: true } } } },
            },
          },
        },
      },
      plos: true,
    },
  });
  const entries: SnapshotEntry[] = [];
  for (const field of VERSION_INFO_FIELDS) {
    entries.push(
      entry(
        SNAPSHOT_ENTITY.VERSION_INFO,
        field,
        VERSION_INFO_LABELS[field],
        version.id,
        { value: scalar(version[field]) },
      ),
    );
  }
  for (const group of version.electiveGroups) {
    entries.push(
      entry(
        SNAPSHOT_ENTITY.ELECTIVE_GROUP,
        group.groupCode,
        `${group.groupCode} ${group.groupName}`,
        group.id,
        {
          groupName: group.groupName,
          minCredits: scalar(group.minCredits),
          minCourses: scalar(group.minCourses),
        },
      ),
    );
  }
  for (const item of version.curriculumItems) {
    const code = item.course.courseCode;
    entries.push(
      entry(
        SNAPSHOT_ENTITY.CURRICULUM_ITEM,
        code,
        `${code} ${item.course.courseName}`,
        item.id,
        {
          plannedSemester: scalar(item.plannedSemester),
          sortOrder: scalar(item.sortOrder),
          blockSymbol: item.blockSymbol,
          isElective: scalar(item.isElective),
          electiveGroup: item.electiveGroup?.groupCode ?? null,
          htDa: scalar(item.htDa),
          tqDa: scalar(item.tqDa),
          minStudiedScore: scalar(item.minStudiedScore),
          minTransferScore: scalar(item.minTransferScore),
          note: item.note,
        },
      ),
    );
    for (const requisite of item.requisites) {
      const source = requisite.sourceCourse.courseCode;
      entries.push(
        entry(
          SNAPSHOT_ENTITY.CURRICULUM_REQUISITE,
          `${code}|${source}|${requisite.relationType}`,
          `${code} ← ${source} (${RELATION_TYPE_LABELS[requisite.relationType]})`,
          requisite.id,
          { minScore: scalar(requisite.minScore) },
        ),
      );
    }
    for (const mapping of item.ploMappings) {
      const plo = mapping.plo.ploCode;
      entries.push(
        entry(
          SNAPSHOT_ENTITY.COURSE_PLO,
          `${code}|${plo}`,
          `${code} — ${plo}`,
          mapping.id,
          { weight: scalar(mapping.weight) },
        ),
      );
      for (const link of mapping.cloLinks) {
        entries.push(
          entry(
            SNAPSHOT_ENTITY.CLO_PLO,
            `${code}|${link.clo.cloCode}|${plo}`,
            `${code} — ${link.clo.cloCode} → ${plo}`,
            link.id,
            { linked: 'true' },
          ),
        );
      }
    }
  }
  for (const plo of version.plos) {
    entries.push(
      entry(SNAPSHOT_ENTITY.PLO, plo.ploCode, plo.ploCode, plo.id, {
        description: plo.description,
        englishDescription: plo.englishDescription,
        competencyGroup: plo.competencyGroup,
        sortOrder: scalar(plo.sortOrder),
      }),
    );
  }
  return entries;
}
