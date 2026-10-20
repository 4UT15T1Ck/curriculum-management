import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { ScopeTarget } from '../authz/access-context.js';
import type { EditState } from '../authz/edit-path.js';
import type { PrismaService } from '../prisma/prisma.service.js';

// The scope a program occupies: its own id (R3's scope) and its faculty (a unit-scoped manual assignment).
export function programTarget(program: {
  id: string;
  facultyId: string;
}): ScopeTarget {
  return { programIds: [program.id], orgUnitIds: [program.facultyId] };
}

// Released = any version has left Draft (FR-55); until F-15 builds release, no version ever does.
export async function programEditState(
  prisma: Pick<Prisma.TransactionClient, 'programVersion'> | PrismaService,
  programId: string,
): Promise<EditState> {
  const released = await prisma.programVersion.findFirst({
    where: { programId, status: { not: ProgramVersionStatus.DRAFT } },
    select: { id: true },
  });
  return { released: released !== null, draftOpenToRequestHolders: true };
}
