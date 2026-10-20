import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

// The newest version that left Draft — Pending counts: a request builds on what will be in force.
// Working copies (sourceRequestId set) are never a base.
export function newestReleasedVersion(
  db: PrismaService | Prisma.TransactionClient,
  programId: string,
) {
  return db.programVersion.findFirst({
    where: {
      programId,
      sourceRequestId: null,
      status: { not: ProgramVersionStatus.DRAFT },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}
