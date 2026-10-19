import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { SyllabusStatus } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';

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

// Test-only: stands in for DC-03 until a program release publishes syllabi (F-15); delete it then.
export function publishSyllabusForTest(
  app: NestExpressApplication,
  syllabusId: string,
) {
  return app.get(PrismaService).syllabus.update({
    where: { id: syllabusId },
    data: { status: SyllabusStatus.PUBLISHED, publishedAt: new Date() },
  });
}

// Minimal bodies that pass the signature check.
export const PDF_BYTES = Buffer.concat([
  Buffer.from('%PDF-1.4\n'),
  Buffer.from('test pdf body'),
]);
export const EXE_BYTES = Buffer.from('MZ\x90\x00 not a pdf');
