import {
  DegreeLevel,
  type PrismaClient,
} from '../../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from './org-units.js';

export const SEED_PROGRAM_CODES = { COMPUTER_ENGINEERING: '1024034' } as const;

// Placeholder description until the Khoa's Excel file for 1024034 (Q-11, F00-24) is read at build time;
// the program code is real, the name, major and credit totals are not.
export const SEED_PROGRAMS = [
  {
    programCode: SEED_PROGRAM_CODES.COMPUTER_ENGINEERING,
    facultyCode: ORG_UNIT_CODES.FACULTY_IT,
    degreeLevel: DegreeLevel.ENGINEER,
    draft: {
      programName: 'Kỹ thuật máy tính',
      majorCode: '7480106',
      majorName: 'Kỹ thuật máy tính',
      semesterCount: 10,
      totalCredits: '150',
      compulsoryCredits: '140',
      electiveCredits: '10',
    },
  },
] as const;

// Safe to run twice: the program is upserted by code and its Draft is written only when the program has no version.
export async function seedPrograms(prisma: PrismaClient): Promise<void> {
  for (const seed of SEED_PROGRAMS) {
    const faculty = await prisma.orgUnit.findUniqueOrThrow({
      where: { unitCode: seed.facultyCode },
    });
    const program = await prisma.program.upsert({
      where: { programCode: seed.programCode },
      create: {
        programCode: seed.programCode,
        facultyId: faculty.id,
        degreeLevel: seed.degreeLevel,
      },
      update: {},
    });
    const hasVersion = await prisma.programVersion.findFirst({
      where: { programId: program.id },
      select: { id: true },
    });
    if (!hasVersion) {
      await prisma.programVersion.create({
        data: { programId: program.id, ...seed.draft },
      });
    }
  }
}
