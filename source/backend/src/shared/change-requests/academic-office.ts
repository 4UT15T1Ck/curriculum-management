import { UserStatus, type Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { coversDay } from '../time/validity.js';

// R1 (Phòng Đào tạo) is the role of level-3 approvers; the role code is the seeded one (prisma/seed-data/roles.ts).
export const ACADEMIC_OFFICE_ROLE_CODE = 'R1';

type Db = PrismaService | Prisma.TransactionClient;

// One definition of "academic-office holder today": the level-3 routing and the creator's stored credential agree.
export function activeAcademicOfficeWhere(today: Date) {
  return {
    revokedAt: null,
    ...coversDay(today),
    role: { roleCode: ACADEMIC_OFFICE_ROLE_CODE },
    user: { status: UserStatus.ACTIVE },
  } satisfies Prisma.RoleAssignmentWhereInput;
}

export async function isAcademicOfficeHolder(
  db: Db,
  userId: string,
  today: Date,
): Promise<boolean> {
  const row = await db.roleAssignment.findFirst({
    where: { userId, ...activeAcademicOfficeWhere(today) },
    select: { id: true },
  });
  return row !== null;
}

// Level 3 has no named approver: any active holder other than the creator acts on it (D8).
export async function otherAcademicOfficeHolderExists(
  db: Db,
  creatorId: string,
  today: Date,
): Promise<boolean> {
  const row = await db.roleAssignment.findFirst({
    where: { userId: { not: creatorId }, ...activeAcademicOfficeWhere(today) },
    select: { id: true },
  });
  return row !== null;
}
