export const ROUTES = {
  home: '/',
  login: '/login',
  account: '/account',
  health: '/health',
  users: '/users',
  userDetail: '/users/:userId',
  permissionMatrix: '/permissions',
  orgUnits: '/org-units',
  subjectGroups: '/subject-groups',
  subjectGroupDetail: '/subject-groups/:groupId',
  courses: '/courses',
  courseNew: '/courses/new',
  courseDetail: '/courses/:courseId',
  courseEdit: '/courses/:courseId/edit',
  syllabus: '/courses/:courseId/syllabus',
  syllabusEdit: '/courses/:courseId/syllabus/edit',
  equivalenceGroups: '/equivalence-groups',
  programs: '/programs',
  programNew: '/programs/new',
  programDetail: '/programs/:programId',
  programEdit: '/programs/:programId/edit',
  curriculum: '/programs/:programId/versions/:versionId/curriculum',
  electiveGroups: '/programs/:programId/versions/:versionId/elective-groups',
  consistency: '/programs/:programId/versions/:versionId/consistency',
} as const;

// Row or group to scroll to and highlight on arrival; set by the consistency result list.
export const FOCUS_PARAM = 'focus';
