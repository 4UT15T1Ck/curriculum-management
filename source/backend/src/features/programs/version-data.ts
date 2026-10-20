import type { Prisma } from '../../generated/prisma/client.js';
import type { CreateProgramDto } from './create-program.dto.js';

type VersionFields = Partial<
  Omit<CreateProgramDto, 'programCode' | 'facultyId' | 'degreeLevel'>
>;

// Prisma decimals accept strings and ignores undefined, so a partial update passes through unchanged.
export function versionData(
  fields: VersionFields,
): Prisma.ProgramVersionUpdateInput {
  const {
    programName,
    majorCode,
    majorName,
    semesterCount,
    totalCredits,
    compulsoryCredits,
    electiveCredits,
  } = fields;
  return {
    programName,
    majorCode,
    majorName,
    semesterCount,
    totalCredits,
    compulsoryCredits,
    electiveCredits,
  };
}
