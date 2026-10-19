import request from 'supertest';

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' };

type Agent = ReturnType<typeof request.agent>;

// Creates revision 1 through the API and returns the Draft.
export async function createSyllabusDraft(agent: Agent, courseId: string) {
  const response = await agent
    .post(`/api/courses/${courseId}/syllabus`)
    .set(CSRF)
    .expect(201);
  return response.body.draft as { id: string; revisionNumber: number };
}

// Minimal bodies that pass the signature check.
export const PDF_BYTES = Buffer.concat([
  Buffer.from('%PDF-1.4\n'),
  Buffer.from('test pdf body'),
]);
export const EXE_BYTES = Buffer.from('MZ\x90\x00 not a pdf');
