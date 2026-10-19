import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ProgramVersionStatus } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';
import { createCourse } from './courses.js';
import { addCurriculumItem, releaseVersionForTest } from './curriculum.js';
import { createProgram } from './programs.js';
import { createSyllabusDraft, publishSyllabusForTest } from './syllabi.js';

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

// A course with a published syllabus, written by the admin (R1) and published the way F-15 will.
export async function publishedCourse(
  app: NestExpressApplication,
  admin: Agent,
  courseCode: string,
  groupId: string | null,
  facultyCode?: string,
) {
  const course = await createCourse(app, { courseCode, groupId, facultyCode });
  const draft = await createSyllabusDraft(admin, course.id);
  await admin
    .patch(`/api/syllabi/${draft.id}`)
    .set(CSRF)
    .send({ objectives: '<p>Mục tiêu gốc</p>' })
    .expect(200);
  await publishSyllabusForTest(app, draft.id);
  return course;
}

export interface ReleasedProgram {
  programId: string;
  versionId: string;
}

// A program whose only version is Active, with the given courses planned in semester 1.
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
  await releaseVersionForTest(app, versionId);
  return { programId: program.id, versionId };
}

// A newer version that has left Draft: the base of every open request on the program is now stale.
export async function releaseAnotherVersionForTest(
  app: NestExpressApplication,
  programId: string,
) {
  const prisma = app.get(PrismaService);
  const newest = await prisma.programVersion.findFirstOrThrow({
    where: { programId, sourceRequestId: null },
    orderBy: { createdAt: 'desc' },
  });
  return prisma.programVersion.create({
    data: {
      programId,
      status: ProgramVersionStatus.PENDING,
      versionNumber: '1.1',
      programName: newest.programName,
      majorCode: newest.majorCode,
      majorName: newest.majorName,
      semesterCount: newest.semesterCount,
      totalCredits: newest.totalCredits,
      compulsoryCredits: newest.compulsoryCredits,
      electiveCredits: newest.electiveCredits,
    },
  });
}
