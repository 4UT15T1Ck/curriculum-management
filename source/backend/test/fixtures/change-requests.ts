import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createCourse } from './courses.js';
import { addCurriculumItem } from './curriculum.js';
import { createProgram } from './programs.js';
import { publishSyllabusViaRelease, releaseViaApi } from './releases.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

export interface RequestInput {
  requestType: string;
  targetType: string;
  targetId: string;
  title?: string;
  reason?: string;
  origin?: string;
  basisDocumentNumber?: string;
}

export function postRequest(agent: Agent, input: RequestInput) {
  return agent
    .post('/api/change-requests')
    .set(CSRF)
    .send({
      title: 'Đề xuất thử',
      reason: 'Lý do thử nghiệm',
      origin: 'FACULTY',
      ...input,
    });
}

// Creates a request through the API and returns the detail DTO.
export async function openRequest(agent: Agent, input: RequestInput) {
  const response = await postRequest(agent, input).expect(201);
  return response.body as RequestDetail;
}

export interface RequestStep {
  approvalLevel: number;
  approver: { id: string; fullName: string } | null;
  forSubjectGroup: { groupCode: string } | null;
  forProgram: { programCode: string } | null;
  action: string;
  isSkipped: boolean;
  skipReason: string | null;
  remark: string | null;
  recordedAt: string | null;
  isOverride: boolean;
  kind: string;
  performedBy: { id: string; fullName: string } | null;
}

export interface RequestDetail {
  id: string;
  requestCode: string;
  status: string;
  submissionRound: number;
  workspace: {
    kind: string;
    copyId: string;
    programId: string | null;
    courseId: string | null;
    isStale: boolean;
  } | null;
  steps: RequestStep[];
  conflicts: { requestCode: string; status: string }[];
  documents: { id: string; seenInRound: number | null; canRemove: boolean }[];
  authoredItems: { entityType: string; itemKey: string }[];
  permissions: Record<string, boolean>;
}

export async function readRequest(agent: Agent, id: string) {
  const response = await agent.get(`/api/change-requests/${id}`).expect(200);
  return response.body as RequestDetail;
}

export function submitRequest(agent: Agent, id: string) {
  return agent.post(`/api/change-requests/${id}/submit`).set(CSRF);
}

export const VALID_REMARK = 'Cần bổ sung minh chứng cho thay đổi này.';

// The decision routes (F-14), called as whoever the agent is logged in as.
export function decide(
  agent: Agent,
  requestId: string,
  action: 'approve' | 'return' | 'reject',
  remark: string = VALID_REMARK,
) {
  return agent
    .post(`/api/change-requests/${requestId}/${action}`)
    .set(CSRF)
    .send(action === 'approve' ? {} : { remark });
}

export async function returnAs(
  agent: Agent,
  requestId: string,
  remark = VALID_REMARK,
): Promise<void> {
  await decide(agent, requestId, 'return', remark).expect(200);
}

export async function approveAs(agent: Agent, requestId: string) {
  const response = await decide(agent, requestId, 'approve').expect(200);
  return response.body as RequestDetail;
}

// A course with a published syllabus, written by the admin (R1). A syllabus is published only by a program release
// (DC-03), so the course is released in a program of its own, which is then switched off: the course keeps its
// published revision while no program "uses" it, and requests on it fan out to nobody until a test releases a program.
export async function publishedCourse(
  app: NestExpressApplication,
  admin: Agent,
  courseCode: string,
  groupId: string | null,
  facultyCode?: string,
) {
  const course = await createCourse(app, { courseCode, groupId, facultyCode });
  await publishSyllabusViaRelease(app, admin, course.id, {
    content: { objectives: '<p>Mục tiêu gốc</p>' },
    deactivate: true,
  });
  return course;
}

export interface ReleasedProgram {
  programId: string;
  versionId: string;
}

// A program whose only version is Active (released for real, by R1), with the given courses planned in semester 1.
export async function releasedProgram(
  app: NestExpressApplication,
  admin: Agent,
  programCode: string,
  courseIds: string[],
): Promise<ReleasedProgram> {
  const program = await createProgram(app, { programCode });
  const versionId = program.versions[0].id;
  for (const courseId of courseIds) {
    await addCurriculumItem(admin, versionId, { courseId, plannedSemester: 1 });
  }
  await releaseViaApi(app, admin, { programId: program.id, versionId });
  return { programId: program.id, versionId };
}

// A newer version that has left Draft: the base of every open request on the program is now stale.
// A correction (US-076) is the quickest real release: it needs no request and no approver.
export async function releaseAnotherVersion(
  admin: Agent,
  programId: string,
  versionId: string,
) {
  const draft = await admin
    .post(`/api/programs/${programId}/versions/${versionId}/corrections`)
    .set(CSRF)
    .expect(201);
  const issued = await admin
    .post(
      `/api/programs/${programId}/versions/${versionId}/corrections/${draft.body.id}/issue`,
    )
    .set(CSRF)
    .send({ reason: 'Đính chính để làm cũ các bản nháp.' })
    .expect(201);
  return issued.body as { id: string; versionNumber: string };
}
