import {
  CourseRelationType,
  CourseType,
  DegreeLevel,
  type PrismaClient,
} from '../../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from './org-units.js';

export const SEED_PROGRAM_CODES = { COMPUTER_ENGINEERING: '1024034' } as const;

// Placeholder description until the Khoa's Excel file for 1024034 (Q-11, F00-24) is read at build time;
// the program code is real, the name, major and credit totals are not.
export const SEED_PROGRAMS = [
  {
    programCode: SEED_PROGRAM_CODES.COMPUTER_ENGINEERING,
    facultyCode: ORG_UNIT_CODES.FACULTY_IT,
    degreeLevel: DegreeLevel.ENGINEER,
    draft: {
      programName: 'Kỹ thuật máy tính',
      majorCode: '7480106',
      majorName: 'Kỹ thuật máy tính',
      semesterCount: 10,
      totalCredits: '150',
      compulsoryCredits: '140',
      electiveCredits: '10',
    },
  },
] as const;

// Placeholder curriculum for the 1024034 Draft, consistent with the placeholder description above (10 semesters, 140 + 10 credits)
// and with the courses it needs: DEMO* courses stand in for the Khoa's real courses until its Excel file is imported (Q-11, F-09).
// Replace or delete them with the rest of the placeholders; nothing else depends on these codes.
export const SEED_DEMO_COURSES = [
  {
    courseCode: 'DEMO101',
    courseName: 'Học phần mẫu: Giải tích 1',
    credits: '3',
  },
  {
    courseCode: 'DEMO102',
    courseName: 'Học phần mẫu: Vật lý 1',
    credits: '2.5',
  },
  {
    courseCode: 'DEMO201',
    courseName: 'Học phần mẫu: Lập trình cơ bản',
    credits: '3',
  },
  {
    courseCode: 'DEMO202',
    courseName: 'Học phần mẫu: Cấu trúc dữ liệu',
    credits: '3',
  },
  {
    courseCode: 'DEMO301',
    courseName: 'Học phần mẫu: Mạng máy tính (tự chọn)',
    credits: '3',
  },
  {
    courseCode: 'DEMO302',
    courseName: 'Học phần mẫu: Hệ điều hành (tự chọn)',
    credits: '3',
  },
] as const;

const DEMO_GROUP = {
  groupCode: 'TC1',
  groupName: 'Tự chọn chuyên ngành 1 (mẫu)',
  minCredits: '6',
} as const;

// plannedSemester <= 10; sortOrder counts inside the semester; blockSymbol is free text (F07-02).
const DEMO_ROWS = [
  {
    courseCode: 'DEMO101',
    plannedSemester: 1,
    sortOrder: 1,
    blockSymbol: 'DC',
    isElective: false,
  },
  {
    courseCode: 'DEMO102',
    plannedSemester: 1,
    sortOrder: 2,
    blockSymbol: 'DC',
    isElective: false,
  },
  {
    courseCode: 'DEMO201',
    plannedSemester: 2,
    sortOrder: 1,
    blockSymbol: 'CSN',
    isElective: false,
  },
  {
    courseCode: 'DEMO202',
    plannedSemester: 3,
    sortOrder: 1,
    blockSymbol: 'CSN',
    isElective: false,
  },
  {
    courseCode: 'DEMO301',
    plannedSemester: 5,
    sortOrder: 1,
    blockSymbol: 'CN',
    isElective: true,
    inGroup: true,
  },
  {
    courseCode: 'DEMO302',
    plannedSemester: 5,
    sortOrder: 2,
    blockSymbol: 'CN',
    isElective: true,
    inGroup: true,
  },
] as const;

// DEMO201 must be studied before DEMO202 with at least 2.0, in the catalog and in the curriculum (the row copy of the catalog edge).
const DEMO_REQUISITE = {
  sourceCourseCode: 'DEMO201',
  targetCourseCode: 'DEMO202',
  relationType: CourseRelationType.PREREQUISITE,
  minScore: '2',
} as const;

// Safe to run twice: the program is upserted by code and its Draft is written only when the program has no version.
export async function seedPrograms(prisma: PrismaClient): Promise<void> {
  for (const seed of SEED_PROGRAMS) {
    const faculty = await prisma.orgUnit.findUniqueOrThrow({
      where: { unitCode: seed.facultyCode },
    });
    const program = await prisma.program.upsert({
      where: { programCode: seed.programCode },
      create: {
        programCode: seed.programCode,
        facultyId: faculty.id,
        degreeLevel: seed.degreeLevel,
      },
      update: {},
    });
    const hasVersion = await prisma.programVersion.findFirst({
      where: { programId: program.id },
      select: { id: true },
    });
    if (!hasVersion) {
      await prisma.programVersion.create({
        data: { programId: program.id, ...seed.draft },
      });
    }
  }
  await seedDemoCurriculum(prisma);
}

// Written only while the 1024034 Draft has no row, so a curriculum the user has begun editing is never touched.
async function seedDemoCurriculum(prisma: PrismaClient): Promise<void> {
  const draft = await prisma.programVersion.findFirst({
    where: {
      status: 'DRAFT',
      program: { programCode: SEED_PROGRAM_CODES.COMPUTER_ENGINEERING },
    },
    select: { id: true, semesterCount: true },
  });
  if (
    !draft ||
    (await prisma.curriculumItem.count({ where: { versionId: draft.id } })) > 0
  ) {
    return;
  }
  const faculty = await prisma.orgUnit.findUniqueOrThrow({
    where: { unitCode: ORG_UNIT_CODES.FACULTY_IT },
  });
  const courseIds = new Map<string, string>();
  for (const course of SEED_DEMO_COURSES) {
    const row = await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      create: {
        ...course,
        courseType: CourseType.THEORY,
        ownerFacultyId: faculty.id,
      },
      update: {},
    });
    courseIds.set(course.courseCode, row.id);
  }
  const requisite = {
    sourceCourseId: courseIds.get(DEMO_REQUISITE.sourceCourseCode)!,
    targetCourseId: courseIds.get(DEMO_REQUISITE.targetCourseCode)!,
    relationType: DEMO_REQUISITE.relationType,
  };
  await prisma.courseRelation.upsert({
    where: {
      sourceCourseId_targetCourseId_relationType: requisite,
    },
    create: { ...requisite, minScore: DEMO_REQUISITE.minScore },
    update: {},
  });
  const group = await prisma.electiveGroup.upsert({
    where: {
      versionId_groupCode: {
        versionId: draft.id,
        groupCode: DEMO_GROUP.groupCode,
      },
    },
    create: { versionId: draft.id, ...DEMO_GROUP },
    update: {},
  });
  const itemIds = new Map<string, string>();
  for (const demo of DEMO_ROWS.filter(
    (row) => row.plannedSemester <= draft.semesterCount,
  )) {
    const item = await prisma.curriculumItem.create({
      data: {
        versionId: draft.id,
        courseId: courseIds.get(demo.courseCode)!,
        plannedSemester: demo.plannedSemester,
        sortOrder: demo.sortOrder,
        blockSymbol: demo.blockSymbol,
        isElective: demo.isElective,
        electiveGroupId: 'inGroup' in demo ? group.id : null,
      },
    });
    itemIds.set(demo.courseCode, item.id);
  }
  await prisma.curriculumRequisite.create({
    data: {
      itemId: itemIds.get(DEMO_REQUISITE.targetCourseCode)!,
      sourceCourseId: requisite.sourceCourseId,
      relationType: DEMO_REQUISITE.relationType,
      minScore: DEMO_REQUISITE.minScore,
    },
  });
}
