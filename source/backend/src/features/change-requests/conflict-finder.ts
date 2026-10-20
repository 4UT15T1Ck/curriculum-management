import { Injectable } from '@nestjs/common';
import { ChangeRequestStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { OPEN_REQUEST_STATUSES } from '../../shared/change-requests/request-kinds.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { toConflictDto } from './change-request.mapper.js';
import type { ConflictDto } from './change-request-response.dto.js';
import { pickTargetKey, type targetKey } from './request-target.resolver.js';

@Injectable()
export class ConflictFinder {
  constructor(private readonly prisma: PrismaService) {}

  // BR-30 warns, never blocks. Another person's unsubmitted draft stays private (D10): the list holds open requests,
  // returned drafts (round > 0, visible to approvers anyway) and the caller's own drafts.
  async find(
    key: ReturnType<typeof targetKey>,
    access: AccessContext,
    excludeId?: string,
  ): Promise<ConflictDto[]> {
    const rows = await this.prisma.changeRequest.findMany({
      where: {
        ...pickTargetKey(key),
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          { status: { in: [...OPEN_REQUEST_STATUSES] } },
          { status: ChangeRequestStatus.DRAFT, submissionRound: { gt: 0 } },
          { status: ChangeRequestStatus.DRAFT, createdById: access.userId },
        ],
      },
      select: {
        id: true,
        requestCode: true,
        title: true,
        status: true,
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toConflictDto);
  }
}
