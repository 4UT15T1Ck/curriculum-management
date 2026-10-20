import request from 'supertest';

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
