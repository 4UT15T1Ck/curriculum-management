export interface GapPlo {
  id: string;
  ploCode: string;
  description: string;
}

export interface GapItem {
  itemId: string;
  plannedSemester: number;
  courseCode: string;
  courseName: string;
  ownerGroupId: string | null;
  // null = the course has no syllabus revision
  clos: { id: string; cloCode: string; description: string }[] | null;
}

export interface OutcomeGapInput {
  plos: readonly GapPlo[];
  items: readonly GapItem[];
  cells: readonly { curriculumItemId: string; ploId: string }[];
  links: readonly { curriculumItemId: string; cloId: string }[];
}

export interface CourseGap {
  itemId: string;
  plannedSemester: number;
  courseCode: string;
  courseName: string;
  ownerGroupId: string | null;
}

export interface CloGap extends CourseGap {
  cloId: string;
  cloCode: string;
  cloDescription: string;
}

export interface OutcomeGaps {
  plosWithoutCourse: GapPlo[];
  closWithoutPlo: CloGap[];
  coursesWithoutPlo: CourseGap[];
  coursesWithoutSyllabus: CourseGap[];
}

const courseGap = ({ clos: _clos, ...item }: GapItem): CourseGap => item;

// Pure: the three coverage lists of US-047 plus the courses skipped for lack of a syllabus.
// A CLO is a gap per curriculum row, not per CLO: the same CLO can be linked in program A and loose in B (DEC-03).
export function outcomeGaps({
  plos,
  items,
  cells,
  links,
}: OutcomeGapInput): OutcomeGaps {
  const mappedPlos = new Set(cells.map((cell) => cell.ploId));
  const mappedItems = new Set(cells.map((cell) => cell.curriculumItemId));
  const linkedClos = new Set(
    links.map((link) => `${link.curriculumItemId}:${link.cloId}`),
  );
  return {
    plosWithoutCourse: plos.filter((plo) => !mappedPlos.has(plo.id)),
    closWithoutPlo: items.flatMap((item) =>
      (item.clos ?? [])
        .filter((clo) => !linkedClos.has(`${item.itemId}:${clo.id}`))
        .map((clo) => ({
          ...courseGap(item),
          cloId: clo.id,
          cloCode: clo.cloCode,
          cloDescription: clo.description,
        })),
    ),
    coursesWithoutPlo: items
      .filter((item) => !mappedItems.has(item.itemId))
      .map(courseGap),
    coursesWithoutSyllabus: items
      .filter((item) => item.clos === null)
      .map(courseGap),
  };
}
