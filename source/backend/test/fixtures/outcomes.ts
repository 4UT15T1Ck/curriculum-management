import request from 'supertest';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

export interface PloBody {
  id: string;
  ploCode: string;
  sortOrder: number;
}

export async function createPlo(
  agent: Agent,
  versionId: string,
  ploCode: string,
  patch: Record<string, unknown> = {},
) {
  const response = await agent
    .post(`/api/program-versions/${versionId}/plos`)
    .set(CSRF)
    .send({ ploCode, description: `Mô tả ${ploCode}`, ...patch })
    .expect(201);
  return response.body as PloBody;
}

export function putWeight(
  agent: Agent,
  itemId: string,
  ploId: string,
  weight: string,
) {
  return agent
    .put(`/api/curriculum-items/${itemId}/plo-weights/${ploId}`)
    .set(CSRF)
    .send({ weight });
}

export async function setPloWeight(
  agent: Agent,
  itemId: string,
  ploId: string,
  weight: string,
) {
  const response = await putWeight(agent, itemId, ploId, weight).expect(200);
  return response.body as { ploId: string; weight: string };
}

export async function createClo(
  agent: Agent,
  syllabusId: string,
  cloCode: string,
) {
  const response = await agent
    .post(`/api/syllabi/${syllabusId}/clos`)
    .set(CSRF)
    .send({ cloCode, description: `Mô tả ${cloCode}` })
    .expect(201);
  return response.body as { id: string; cloCode: string };
}

export function putLinks(
  agent: Agent,
  itemId: string,
  links: { cloId: string; ploId: string }[],
) {
  return agent
    .put(`/api/curriculum-items/${itemId}/clo-plo-links`)
    .set(CSRF)
    .send({ links });
}
