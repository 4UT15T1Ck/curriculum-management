import type {
  CoursePloMatrix,
  ItemCloPloMatrix,
  OutcomeCoverage,
  OutcomeVersion,
  Plo,
  PloList,
  ProgramCloPloMatrix,
} from './api/outcomes';

export const VERSION: OutcomeVersion = {
  id: 'v1',
  programId: 'p1',
  programCode: '1024034',
  programName: 'Kỹ thuật máy tính',
  versionNumber: null,
  status: 'DRAFT',
};

export const ME = {
  id: 'u1',
  username: 'giamdoc',
  userCode: 'GD',
  fullName: 'Giám đốc',
  email: null,
  mustChangePassword: false,
  orgUnit: null,
  roles: [{ roleCode: 'R3' }],
  permissions: ['outcome.view', 'plo.edit', 'clo.edit'],
};

export function plo(code: string, patch: Partial<Plo> = {}): Plo {
  return {
    id: `p-${code}`,
    ploCode: code,
    description: `Mô tả ${code}`,
    englishDescription: null,
    competencyGroup: null,
    sortOrder: 1,
    courseCount: 0,
    cloLinkCount: 0,
    ...patch,
  };
}

export function ploList(patch: Partial<PloList> = {}): PloList {
  return {
    version: VERSION,
    plos: [plo('PLO1', { courseCount: 3, cloLinkCount: 5 }), plo('PLO2')],
    editPath: 'DIRECT',
    canEdit: true,
    ...patch,
  };
}

const header = (code: string) => ({
  id: `p-${code}`,
  ploCode: code,
  description: `Mô tả ${code}`,
});

export function coursePloMatrix(
  patch: Partial<CoursePloMatrix> = {},
): CoursePloMatrix {
  return {
    version: VERSION,
    plos: [header('PLO1'), header('PLO2')],
    rows: [
      {
        itemId: 'i1',
        plannedSemester: 1,
        course: {
          id: 'c1',
          courseCode: 'IT001',
          courseName: 'Nhập môn',
          credits: '3',
        },
        cells: [{ ploId: 'p-PLO1', weight: '0.5', cloLinkCount: 2 }],
      },
      {
        itemId: 'i2',
        plannedSemester: 2,
        course: {
          id: 'c2',
          courseCode: 'IT002',
          courseName: 'Cấu trúc dữ liệu',
          credits: '3',
        },
        cells: [],
      },
    ],
    editPath: 'DIRECT',
    canEdit: true,
    ...patch,
  };
}

const cloRef = (code: string) => ({
  id: `c-${code}`,
  cloCode: code,
  description: `Mô tả ${code}`,
  englishDescription: null,
});

export function itemCloPloMatrix(
  patch: Partial<ItemCloPloMatrix> = {},
): ItemCloPloMatrix {
  return {
    version: VERSION,
    item: {
      id: 'i1',
      plannedSemester: 1,
      course: { id: 'c1', courseCode: 'IT001', courseName: 'Nhập môn' },
    },
    revision: { id: 's1', revisionNumber: 1, status: 'PUBLISHED' },
    clos: [cloRef('CLO1'), cloRef('CLO2')],
    plos: [
      { ...header('PLO1'), weight: '0.5' },
      { ...header('PLO2'), weight: null },
    ],
    links: [],
    editPath: 'DIRECT',
    canEdit: true,
    ...patch,
  };
}

export function programCloPloMatrix(
  patch: Partial<ProgramCloPloMatrix> = {},
): ProgramCloPloMatrix {
  return {
    version: VERSION,
    plos: [header('PLO1'), header('PLO2')],
    rows: [
      {
        itemId: 'i1',
        plannedSemester: 1,
        course: { id: 'c1', courseCode: 'IT001', courseName: 'Nhập môn' },
        revisionNumber: 1,
        clos: [cloRef('CLO1')],
        mappedPloIds: ['p-PLO1'],
        links: [{ cloId: 'c-CLO1', ploId: 'p-PLO1' }],
      },
      {
        itemId: 'i2',
        plannedSemester: 2,
        course: {
          id: 'c2',
          courseCode: 'IT002',
          courseName: 'Cấu trúc dữ liệu',
        },
        revisionNumber: null,
        clos: [],
        mappedPloIds: [],
        links: [],
      },
    ],
    ...patch,
  };
}

export function coverage(
  patch: Partial<OutcomeCoverage> = {},
): OutcomeCoverage {
  return {
    version: VERSION,
    plosWithoutCourse: [header('PLO6')],
    closWithoutPlo: [
      {
        itemId: 'i1',
        courseCode: 'IT001',
        courseName: 'Nhập môn',
        cloId: 'c-CLO2',
        cloCode: 'CLO2',
        cloDescription: 'Mô tả CLO2',
      },
    ],
    coursesWithoutPlo: [
      {
        itemId: 'i2',
        courseCode: 'IT002',
        courseName: 'Cấu trúc dữ liệu',
        plannedSemester: 2,
      },
    ],
    coursesWithoutSyllabus: 1,
    filteredToGroups: false,
    ...patch,
  };
}
