import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  DegreeLevel,
  ProgramVersionStatus,
} from '../../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from '../../prisma/seed-data/org-units.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';
import { todayDate } from '../../src/shared/time/today.js';

export interface ProgramFixture {
  programCode: string;
  degreeLevel?: DegreeLevel;
  facultyCode?: string;
  versionStatus?: ProgramVersionStatus;
  versionNumber?: string | null;
}

// Writes through Prisma, bypassing validation; tests of validation must go through HTTP.
export async function createProgram(
  app: NestExpressApplication,
  fixture: ProgramFixture,
) {
  const prisma = app.get(PrismaService);
  const faculty = await prisma.orgUnit.findUniqueOrThrow({
    where: { unitCode: fixture.facultyCode ?? ORG_UNIT_CODES.FACULTY_IT },
  });
  return prisma.program.create({
    data: {
      programCode: fixture.programCode,
      facultyId: faculty.id,
      degreeLevel: fixture.degreeLevel ?? DegreeLevel.ENGINEER,
      versions: {
        create: {
          programName: `Chương trình ${fixture.programCode}`,
          majorCode: 'M01',
          majorName: 'Ngành mẫu',
          semesterCount: 8,
          totalCredits: '120',
          compulsoryCredits: '110',
          electiveCredits: '10',
          status: fixture.versionStatus ?? ProgramVersionStatus.DRAFT,
          versionNumber: fixture.versionNumber ?? null,
          // A version past Draft carries its publication time (ProgramVersion_published_has_time).
          publishedAt:
            (fixture.versionStatus ?? ProgramVersionStatus.DRAFT) ===
            ProgramVersionStatus.DRAFT
              ? null
              : new Date(),
        },
      },
    },
    include: { versions: true },
  });
}

export interface DirectorFixture {
  programId: string;
  userId: string;
  validFrom?: Date;
  validTo?: Date | null;
}

export function assignDirector(
  app: NestExpressApplication,
  fixture: DirectorFixture,
) {
  return app.get(PrismaService).programDirectorAssignment.create({
    data: {
      programId: fixture.programId,
      directorId: fixture.userId,
      validFrom: fixture.validFrom ?? todayDate(),
      validTo: fixture.validTo ?? null,
    },
  });
}
