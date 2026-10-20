import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App } from 'antd';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import type { VersionDetail, VersionRef } from './api/releases';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

export interface Write {
  method: string;
  url: string;
  body: unknown;
}

interface RenderOptions {
  path: string;
  entry: string;
  element: ReactElement;
  // GET url -> body; anything else answers 404.
  reads?: Record<string, unknown>;
  permissions?: string[];
  writeResponse?: (write: Write) => Response | undefined;
  // Other routes the page may navigate to; each renders its path so a test can see where it landed.
  extraRoutes?: { path: string; element: ReactElement }[];
}

export const ME = (permissions: string[]) => ({
  id: 'u1',
  username: 'phongdaotao',
  userCode: 'PDT',
  fullName: 'Phòng Đào tạo',
  email: null,
  mustChangePassword: false,
  orgUnit: null,
  roles: [],
  permissions,
});

// Renders a page at `entry` with fetch stubbed: reads come from `reads`, writes are recorded and answered by
// `writeResponse` (or 200 with `{}`).
export function renderReleasePage(options: RenderOptions) {
  const writes: Write[] = [];
  const reads: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method && init.method !== 'GET') {
        const write = {
          method: init.method,
          url,
          body:
            typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
        };
        writes.push(write);
        return Promise.resolve(options.writeResponse?.(write) ?? json({}));
      }
      reads.push(url);
      if (url === '/api/auth/me')
        return Promise.resolve(json(ME(options.permissions ?? [])));
      if (options.reads && url in options.reads)
        return Promise.resolve(json(options.reads[url]));
      return Promise.resolve(json({ message: 'Not found' }, 404));
    }),
  );
  const router = createMemoryRouter(
    [
      { path: options.path, element: options.element },
      ...(options.extraRoutes ?? []),
    ],
    { initialEntries: [options.entry] },
  );
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <App>
        <RouterProvider router={router} />
      </App>
    </QueryClientProvider>,
  );
  return { writes, reads, router };
}

export const SEMESTER = {
  id: 's1',
  semesterCode: '2026-2027-2',
  academicYear: '2026-2027',
  termInYear: 2,
  startDate: '2027-01-18',
};

export function versionRef(patch: Partial<VersionRef> = {}): VersionRef {
  return {
    id: 'v1',
    versionNumber: '1.0',
    status: 'ACTIVE',
    decisionNumber: 'QĐ-100/2026',
    signedDate: '2026-09-01',
    publishedAt: '2026-09-02T03:00:00.000Z',
    effectiveSemester: SEMESTER,
    cohorts: [{ id: 'k1', cohortCode: 'K2026', intakeYear: 2026 }],
    originRequest: null,
    correctedBy: null,
    ...patch,
  };
}

export function versionDetail(
  patch: Partial<VersionDetail> = {},
): VersionDetail {
  return {
    ...versionRef(),
    programId: 'p1',
    programCode: '1024034',
    programName: 'Kỹ thuật máy tính',
    majorCode: '7480106',
    majorName: 'Kỹ thuật máy tính',
    semesterCount: 10,
    totalCredits: '150',
    compulsoryCredits: '140',
    electiveCredits: '10',
    publishedBy: { id: 'u9', fullName: 'Phòng Đào tạo' },
    previousVersion: null,
    correctionOf: null,
    correctionReason: null,
    isCorrectionDraft: false,
    openCorrection: null,
    canCorrect: false,
    rows: [
      {
        itemId: 'i1',
        plannedSemester: 1,
        courseId: 'c1',
        courseCode: 'IT001',
        courseName: 'Nhập môn lập trình (tên khi ban hành)',
        credits: '3',
        syllabus: { id: 'sy1', revisionNumber: 1, status: 'HISTORICAL' },
      },
    ],
    ...patch,
  };
}
