import {
  type Prisma,
  SubjectGroupStatus,
} from '../../generated/prisma/client.js';
import { coversDay } from '../time/validity.js';

export function activeMemberRowWhere(today: Date) {
  return {
    revokedAt: null,
    ...coversDay(today),
  } satisfies Prisma.SubjectGroupMemberWhereInput;
}

export function activeMembershipWhere(today: Date) {
  return {
    ...activeMemberRowWhere(today),
    subjectGroup: { status: SubjectGroupStatus.ACTIVE },
  } satisfies Prisma.SubjectGroupMemberWhereInput;
}
