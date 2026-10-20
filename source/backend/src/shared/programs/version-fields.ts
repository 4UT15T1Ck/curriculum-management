import type { ProgramVersion } from '../../generated/prisma/client.js';

// The facts a copy of a version starts with: its info, declared credits and any accepted credit mismatch.
// Used by a request's working copy, a fan-out shell and a correction Draft.
export function versionCopyFields(base: ProgramVersion) {
  return {
    programName: base.programName,
    majorCode: base.majorCode,
    majorName: base.majorName,
    semesterCount: base.semesterCount,
    totalCredits: base.totalCredits,
    compulsoryCredits: base.compulsoryCredits,
    electiveCredits: base.electiveCredits,
    creditMismatchReason: base.creditMismatchReason,
    creditMismatchCompulsoryGap: base.creditMismatchCompulsoryGap,
    creditMismatchElectiveGap: base.creditMismatchElectiveGap,
    creditMismatchAcceptedById: base.creditMismatchAcceptedById,
    creditMismatchAcceptedAt: base.creditMismatchAcceptedAt,
  };
}
