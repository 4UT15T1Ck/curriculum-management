import {
  ProgramStatus,
  UserStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { USER_REF_SELECT } from '../dtos/ref.dto.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { fromIsoDay } from '../time/today.js';
import { overlapsPeriod, parsePeriod } from '../time/validity.js';
import { DIRECTOR_CONSTRAINT, DIRECTOR_ERRORS } from './director.errors.js';

type Db = PrismaService | Prisma.TransactionClient;

export interface DirectorInput {
  directorId: string;
  validFrom: string;
  validTo?: string | null;
}

export const DIRECTOR_SELECT = {
  id: true,
  validFrom: true,
  validTo: true,
  revokedAt: true,
  director: { select: USER_REF_SELECT },
  assignedBy: { select: USER_REF_SELECT },
  revokedBy: { select: USER_REF_SELECT },
} as const satisfies Prisma.ProgramDirectorAssignmentSelect;

export type DirectorRow = Prisma.ProgramDirectorAssignmentGetPayload<{
  select: typeof DIRECTOR_SELECT;
}>;

// The one place a director assignment is written, for the program screen (F-06) and an approved organisational request (F-14).
export async function assignDirector(
  db: Db,
  programId: string,
  input: DirectorInput,
  actorId: string,
): Promise<DirectorRow> {
  const program = await db.program.findUnique({
    where: { id: programId },
    select: { status: true },
  });
  if (!program) throw new AppException(DIRECTOR_ERRORS.PROGRAM_NOT_FOUND);
  if (program.status !== ProgramStatus.ACTIVE) {
    throw new AppException(DIRECTOR_ERRORS.PROGRAM_INACTIVE);
  }
  const director = await db.user.findUnique({
    where: { id: input.directorId },
    select: { status: true },
  });
  if (!director || director.status !== UserStatus.ACTIVE) {
    throw new AppException(DIRECTOR_ERRORS.DIRECTOR_INVALID, [
      { field: 'directorId', constraints: [DIRECTOR_CONSTRAINT.ACTIVE_USER] },
    ]);
  }
  const period = parsePeriod(input.validFrom, input.validTo);
  // Different people may direct at the same time (US-020 AC3); only the same person cannot overlap themselves.
  const overlap = await db.programDirectorAssignment.findFirst({
    where: {
      programId,
      directorId: input.directorId,
      revokedAt: null,
      ...overlapsPeriod(period),
    },
    select: { id: true },
  });
  if (overlap) throw new AppException(DIRECTOR_ERRORS.DIRECTOR_PERIOD_OVERLAP);
  return db.programDirectorAssignment.create({
    data: {
      programId,
      directorId: input.directorId,
      ...period,
      assignedById: actorId,
    },
    select: DIRECTOR_SELECT,
  });
}

// End only shortens; extending means a new assignment.
export async function endDirector(
  db: Db,
  programId: string,
  assignmentId: string,
  validToDay: string,
): Promise<DirectorRow> {
  const row = await findLiveAssignment(db, programId, assignmentId);
  const validTo = fromIsoDay(validToDay);
  if (validTo < row.validFrom) {
    throw new AppException(COMMON_ERRORS.VALIDITY_INVALID);
  }
  if (row.validTo && validTo >= row.validTo) {
    throw new AppException(DIRECTOR_ERRORS.END_DATE_NOT_EARLIER);
  }
  return db.programDirectorAssignment.update({
    where: { id: row.id },
    data: { validTo },
    select: DIRECTOR_SELECT,
  });
}

export async function findLiveAssignment(
  db: Db,
  programId: string,
  assignmentId: string,
) {
  const row = await db.programDirectorAssignment.findFirst({
    where: { id: assignmentId, programId, revokedAt: null },
    select: { id: true, validFrom: true, validTo: true },
  });
  if (!row) {
    throw new AppException(DIRECTOR_ERRORS.DIRECTOR_ASSIGNMENT_NOT_FOUND);
  }
  return row;
}
