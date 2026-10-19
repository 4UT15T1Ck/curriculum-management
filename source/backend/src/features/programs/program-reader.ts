import type { Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { todayDate } from '../../shared/time/today.js';
import { programInclude, type ProgramRow } from './program.dto.js';
import { PROGRAM_ERRORS } from './programs.errors.js';

type ProgramReadClient = Pick<
  PrismaService | Prisma.TransactionClient,
  'program'
>;

export async function findProgramOrThrow(
  client: ProgramReadClient,
  programId: string,
): Promise<ProgramRow> {
  const row = await client.program.findUnique({
    where: { id: programId },
    include: programInclude(todayDate()),
  });
  if (!row) {
    throw new AppException(PROGRAM_ERRORS.PROGRAM_NOT_FOUND);
  }
  return row;
}
