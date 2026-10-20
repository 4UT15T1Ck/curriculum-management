import {
  SubjectGroupMemberRole,
  SubjectGroupStatus,
  UserStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { fromIsoDay } from '../time/today.js';
import { overlapsPeriod, parsePeriod, type Period } from '../time/validity.js';
import { MEMBERSHIP_ERRORS } from './membership.errors.js';

type Db = PrismaService | Prisma.TransactionClient;

export interface MembershipInput {
  lecturerId: string;
  memberRole: SubjectGroupMemberRole;
  validFrom: string;
  validTo?: string | null;
}

export const MEMBER_SELECT = {
  id: true,
  memberRole: true,
  validFrom: true,
  validTo: true,
  createdAt: true,
  revokedAt: true,
  lecturer: {
    select: { id: true, userCode: true, fullName: true, status: true },
  },
  assignedBy: { select: { id: true, fullName: true } },
  revokedBy: { select: { id: true, fullName: true } },
} as const satisfies Prisma.SubjectGroupMemberSelect;

export type MemberRow = Prisma.SubjectGroupMemberGetPayload<{
  select: typeof MEMBER_SELECT;
}>;

// The one place a membership row is written, for the members screen (F-03) and an approved organisational request (F-14).
export async function addMembership(
  db: Db,
  groupId: string,
  input: MembershipInput,
  actorId: string,
): Promise<MemberRow> {
  const group = await db.subjectGroup.findUnique({ where: { id: groupId } });
  if (!group) throw new AppException(MEMBERSHIP_ERRORS.SUBJECT_GROUP_NOT_FOUND);
  if (group.status !== SubjectGroupStatus.ACTIVE) {
    throw new AppException(MEMBERSHIP_ERRORS.SUBJECT_GROUP_INACTIVE);
  }
  const lecturer = await db.user.findUnique({
    where: { id: input.lecturerId },
  });
  if (!lecturer || lecturer.status !== UserStatus.ACTIVE) {
    throw new AppException(MEMBERSHIP_ERRORS.LECTURER_INVALID);
  }
  const period = parsePeriod(input.validFrom, input.validTo);
  await assertNoOverlap(db, group.id, lecturer.id, input.memberRole, period);
  if (input.memberRole === SubjectGroupMemberRole.COORDINATOR) {
    await assertCoveredByMembership(db, group.id, lecturer.id, period);
  }
  return db.subjectGroupMember.create({
    data: {
      subjectGroupId: group.id,
      lecturerId: lecturer.id,
      memberRole: input.memberRole,
      ...period,
      assignedById: actorId,
    },
    select: MEMBER_SELECT,
  });
}

// Returns the ended row first, then the coordinator rows it trimmed or revoked.
export async function endMembership(
  db: Db,
  groupId: string,
  memberId: string,
  validToDay: string,
  actorId: string,
): Promise<MemberRow[]> {
  const row = await findLiveMember(db, groupId, memberId);
  const validTo = fromIsoDay(validToDay);
  if (validTo < row.validFrom) {
    throw new AppException(COMMON_ERRORS.VALIDITY_INVALID);
  }
  if (row.validTo && validTo >= row.validTo) {
    throw new AppException(MEMBERSHIP_ERRORS.END_DATE_NOT_EARLIER);
  }
  const dependants =
    row.memberRole === SubjectGroupMemberRole.MEMBER
      ? await coordinatorRowsInside(db, row)
      : [];
  const now = new Date();
  const ended = await db.subjectGroupMember.update({
    where: { id: row.id },
    data: { validTo },
    select: MEMBER_SELECT,
  });
  const changed: MemberRow[] = [ended];
  for (const coordinator of dependants) {
    if (coordinator.validFrom > validTo) {
      changed.push(
        await db.subjectGroupMember.update({
          where: { id: coordinator.id },
          data: { revokedAt: now, revokedById: actorId },
          select: MEMBER_SELECT,
        }),
      );
    }
  }
  for (const coordinator of dependants) {
    if (
      coordinator.validFrom <= validTo &&
      (!coordinator.validTo || coordinator.validTo > validTo)
    ) {
      changed.push(
        await db.subjectGroupMember.update({
          where: { id: coordinator.id },
          data: { validTo },
          select: MEMBER_SELECT,
        }),
      );
    }
  }
  return changed;
}

export async function findLiveMember(
  db: Db,
  groupId: string,
  memberId: string,
) {
  const row = await db.subjectGroupMember.findFirst({
    where: { id: memberId, subjectGroupId: groupId },
  });
  if (!row) throw new AppException(MEMBERSHIP_ERRORS.MEMBER_NOT_FOUND);
  if (row.revokedAt) {
    throw new AppException(MEMBERSHIP_ERRORS.MEMBER_ALREADY_REVOKED);
  }
  return row;
}

export function coordinatorRowsInside(
  db: Db,
  member: {
    subjectGroupId: string;
    lecturerId: string;
    validFrom: Date;
    validTo: Date | null;
  },
) {
  return db.subjectGroupMember.findMany({
    where: {
      subjectGroupId: member.subjectGroupId,
      lecturerId: member.lecturerId,
      memberRole: SubjectGroupMemberRole.COORDINATOR,
      revokedAt: null,
      validFrom: {
        gte: member.validFrom,
        ...(member.validTo && { lte: member.validTo }),
      },
    },
  });
}

async function assertNoOverlap(
  db: Db,
  groupId: string,
  lecturerId: string,
  memberRole: SubjectGroupMemberRole,
  period: Period,
): Promise<void> {
  const clash = await db.subjectGroupMember.findFirst({
    where: {
      subjectGroupId: groupId,
      lecturerId,
      memberRole,
      revokedAt: null,
      ...overlapsPeriod(period),
    },
  });
  if (clash) throw new AppException(MEMBERSHIP_ERRORS.MEMBERSHIP_OVERLAP);
}

async function assertCoveredByMembership(
  db: Db,
  groupId: string,
  lecturerId: string,
  period: Period,
): Promise<void> {
  const cover = await db.subjectGroupMember.findFirst({
    where: {
      subjectGroupId: groupId,
      lecturerId,
      memberRole: SubjectGroupMemberRole.MEMBER,
      revokedAt: null,
      validFrom: { lte: period.validFrom },
      ...(period.validTo
        ? { OR: [{ validTo: null }, { validTo: { gte: period.validTo } }] }
        : { validTo: null }),
    },
  });
  if (!cover) {
    throw new AppException(MEMBERSHIP_ERRORS.COORDINATOR_NOT_MEMBER);
  }
}
