import { ProgramStatus, type Prisma } from '../../generated/prisma/client.js';
import { coversDay } from '../time/validity.js';

// One definition of "director today": scope, program summaries and level-2 approver lookups must agree.
export function activeDirectorWhere(today: Date) {
  return {
    revokedAt: null,
    ...coversDay(today),
    program: { status: ProgramStatus.ACTIVE },
  } satisfies Prisma.ProgramDirectorAssignmentWhereInput;
}
