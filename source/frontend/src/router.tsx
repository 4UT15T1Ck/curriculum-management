import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ROUTES } from './routes';
import { RequireAuth } from './shared/auth/RequireAuth';
import { AppLayout } from './shared/layout/AppLayout';
import { RequirePermission } from './shared/auth/RequirePermission';
import { PERMISSIONS } from './shared/auth/permissions';

const UserListPage = lazy(() =>
  import('./features/users/pages/UserListPage').then((module) => ({
    default: module.UserListPage,
  })),
);
const UserDetailPage = lazy(() =>
  import('./features/users/pages/UserDetailPage').then((module) => ({
    default: module.UserDetailPage,
  })),
);
const PermissionMatrixPage = lazy(() =>
  import('./features/permissions/pages/PermissionMatrixPage').then(
    (module) => ({ default: module.PermissionMatrixPage }),
  ),
);
const OrgUnitTreePage = lazy(() =>
  import('./features/org-units/pages/OrgUnitTreePage').then((module) => ({
    default: module.OrgUnitTreePage,
  })),
);
const SubjectGroupListPage = lazy(() =>
  import('./features/subject-groups/pages/SubjectGroupListPage').then(
    (module) => ({ default: module.SubjectGroupListPage }),
  ),
);
const SubjectGroupDetailPage = lazy(() =>
  import('./features/subject-groups/pages/SubjectGroupDetailPage').then(
    (module) => ({ default: module.SubjectGroupDetailPage }),
  ),
);
const CourseListPage = lazy(() =>
  import('./features/courses/pages/CourseListPage').then((module) => ({
    default: module.CourseListPage,
  })),
);
const CourseDetailPage = lazy(() =>
  import('./features/courses/pages/CourseDetailPage').then((module) => ({
    default: module.CourseDetailPage,
  })),
);
const CourseFormPage = lazy(() =>
  import('./features/courses/pages/CourseFormPage').then((module) => ({
    default: module.CourseFormPage,
  })),
);
const EquivalenceGroupsPage = lazy(() =>
  import('./features/equivalence-groups/pages/EquivalenceGroupsPage').then(
    (module) => ({ default: module.EquivalenceGroupsPage }),
  ),
);
const ProgramListPage = lazy(() =>
  import('./features/programs/pages/ProgramListPage').then((module) => ({
    default: module.ProgramListPage,
  })),
);
const ProgramOverviewPage = lazy(() =>
  import('./features/programs/pages/ProgramOverviewPage').then((module) => ({
    default: module.ProgramOverviewPage,
  })),
);
const ProgramFormPage = lazy(() =>
  import('./features/programs/pages/ProgramFormPage').then((module) => ({
    default: module.ProgramFormPage,
  })),
);

const HomePage = lazy(() =>
  import('./features/home/pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
);
const AccountPage = lazy(() =>
  import('./features/auth/pages/AccountPage').then((module) => ({
    default: module.AccountPage,
  })),
);
const HealthPage = lazy(() =>
  import('./features/health/pages/HealthPage').then((module) => ({
    default: module.HealthPage,
  })),
);

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.home,
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ROUTES.account, element: <AccountPage /> },
          { path: ROUTES.health, element: <HealthPage /> },
          {
            path: ROUTES.users,
            element: (
              <RequirePermission code={PERMISSIONS.userManage}>
                <UserListPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.userDetail,
            element: (
              <RequirePermission code={PERMISSIONS.userManage}>
                <UserDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.permissionMatrix,
            element: (
              <RequirePermission code={PERMISSIONS.permissionView}>
                <PermissionMatrixPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.orgUnits,
            element: (
              <RequirePermission code={PERMISSIONS.orgUnitManage}>
                <OrgUnitTreePage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.subjectGroups,
            element: (
              <RequirePermission code={PERMISSIONS.subjectGroupView}>
                <SubjectGroupListPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.subjectGroupDetail,
            element: (
              <RequirePermission code={PERMISSIONS.subjectGroupView}>
                <SubjectGroupDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.courses,
            element: (
              <RequirePermission code={PERMISSIONS.courseView}>
                <CourseListPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.courseNew,
            element: (
              <RequirePermission code={PERMISSIONS.courseEdit}>
                <CourseFormPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.courseDetail,
            element: (
              <RequirePermission code={PERMISSIONS.courseView}>
                <CourseDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.courseEdit,
            element: (
              <RequirePermission code={PERMISSIONS.courseEdit}>
                <CourseFormPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.equivalenceGroups,
            element: (
              <RequirePermission code={PERMISSIONS.courseView}>
                <EquivalenceGroupsPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.programs,
            element: (
              <RequirePermission code={PERMISSIONS.programView}>
                <ProgramListPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.programNew,
            element: (
              <RequirePermission code={PERMISSIONS.programEditInfo}>
                <ProgramFormPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.programDetail,
            element: (
              <RequirePermission code={PERMISSIONS.programView}>
                <ProgramOverviewPage />
              </RequirePermission>
            ),
          },
          {
            path: ROUTES.programEdit,
            element: (
              <RequirePermission code={PERMISSIONS.programEditInfo}>
                <ProgramFormPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
]);
