import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import {
  openRequest,
  publishedCourse,
  releasedProgram,
  submitRequest,
  type RequestDetail,
} from './change-requests.js';
import { assignDirector } from './programs.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

export interface NotificationRow {
  id: string;
  notificationType: string;
  content: string;
  changeRequestId: string | null;
  readStatus: string;
}

export async function notificationsOf(agent: Agent, query = '') {
  const response = await agent
    .get(`/api/notifications?pageSize=50${query}`)
    .expect(200);
  return response.body.items as NotificationRow[];
}

export async function unreadCount(agent: Agent) {
  const response = await agent
    .get('/api/notifications/unread-count')
    .expect(200);
  return response.body.count as number;
}

// A published course in `groupId`, put into a new released program whose director is `directorId`.
export async function courseInProgram(
  app: NestExpressApplication,
  admin: Agent,
  codePrefix: string,
  groupId: string,
  directorId: string | null,
) {
  const course = await publishedCourse(app, admin, `${codePrefix}C`, groupId);
  const program = await releasedProgram(app, admin, `${codePrefix}P`, [
    course.id,
  ]);
  if (directorId) {
    await assignDirector(app, {
      programId: program.programId,
      userId: directorId,
    });
  }
  return { course, program };
}

// The creator edits the syllabus copy of a request on `courseId` and submits it.
export async function submitSyllabusRequest(
  creator: Agent,
  courseId: string,
): Promise<RequestDetail> {
  const created = await openRequest(creator, {
    requestType: 'SYLLABUS_CONTENT',
    targetType: 'COURSE',
    targetId: courseId,
  });
  await creator
    .patch(`/api/syllabi/${created.workspace!.copyId}`)
    .set(CSRF)
    .send({ objectives: '<p>Mục tiêu mới</p>' })
    .expect(200);
  return (await submitRequest(creator, created.id).expect(200)).body;
}
