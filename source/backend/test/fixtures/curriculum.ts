import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ProgramVersionStatus } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

export interface ItemInput {
  courseId: string;
  plannedSemester: number;
  isElective?: boolean;
  blockSymbol?: string;
}

export function postItem(agent: Agent, versionId: string, input: ItemInput) {
  return agent
    .post(`/api/program-versions/${versionId}/curriculum-items`)
    .set(CSRF)
    .send({ isElective: false, ...input });
}

export async function addCurriculumItem(
  agent: Agent,
  versionId: string,
  input: ItemInput,
) {
  const response = await postItem(agent, versionId, input).expect(201);
  return response.body as { id: string; plannedSemester: number };
}

export async function readCurriculum(agent: Agent, versionId: string) {
  const response = await agent
    .get(`/api/program-versions/${versionId}/curriculum`)
    .expect(200);
  return response.body;
}

// Test-only: writes the released state directly. F-15 replaces it with the real release flow; delete it then.
export async function releaseVersionForTest(
  app: NestExpressApplication,
  versionId: string,
) {
  return app.get(PrismaService).programVersion.update({
    where: { id: versionId },
    data: { status: ProgramVersionStatus.ACTIVE, versionNumber: '1.0' },
  });
}
