import { Injectable } from '@nestjs/common';
import {
  ScopeSource,
  SubjectGroupMemberRole,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { activeMembershipWhere } from '../subject-groups/active-membership.js';
import type { ScopeTarget } from './access-context.js';

@Injectable()
export class ScopeSourceReader {
  constructor(private readonly prisma: PrismaService) {}

  async activeTargets(
    source: Exclude<ScopeSource, 'NONE'>,
    userId: string,
    today: Date,
  ): Promise<ScopeTarget> {
    switch (source) {
      case ScopeSource.PROGRAM_DIRECTOR:
      case ScopeSource.OWN_ENROLLMENT:
        return {};
      case ScopeSource.SUBJECT_GROUP_COORDINATOR:
        return {
          subjectGroupIds: await this.activeGroupIds(
            userId,
            today,
            SubjectGroupMemberRole.COORDINATOR,
          ),
        };
      case ScopeSource.SUBJECT_GROUP_MEMBER:
        return { subjectGroupIds: await this.activeGroupIds(userId, today) };
    }
  }

  private async activeGroupIds(
    lecturerId: string,
    today: Date,
    memberRole?: SubjectGroupMemberRole,
  ): Promise<string[]> {
    const rows = await this.prisma.subjectGroupMember.findMany({
      where: {
        lecturerId,
        ...(memberRole && { memberRole }),
        ...activeMembershipWhere(today),
      },
      select: { subjectGroupId: true },
      distinct: ['subjectGroupId'],
    });
    return rows.map((row) => row.subjectGroupId);
  }
}
