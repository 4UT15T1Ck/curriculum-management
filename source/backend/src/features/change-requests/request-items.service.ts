import { Injectable } from '@nestjs/common';
import {
  ChangeRequestStatus,
  type ChangeRequestType,
  type ChangeTargetType,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import type { ChangeDiffDto } from '../../shared/change-requests/diff/change-diff.dto.js';
import { toDiffSections } from '../../shared/change-requests/diff/diff-presenter.js';
import { readProgramSnapshot } from '../../shared/change-requests/diff/program-snapshot.reader.js';
import { diffSnapshots } from '../../shared/change-requests/diff/snapshot-differ.js';
import type {
  ChangeItemDraft,
  ItemValue,
} from '../../shared/change-requests/diff/snapshot-entry.js';
import { readSyllabusSnapshot } from '../../shared/change-requests/diff/syllabus-snapshot.reader.js';
import {
  WORKSPACE_KIND,
  workspaceKindFor,
  type WorkspaceKind,
} from '../../shared/change-requests/request-kinds.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { findVisibleRequest } from './request-visibility.js';

type Db = PrismaService | Prisma.TransactionClient;

export interface ItemSource {
  id: string;
  requestType: ChangeRequestType;
  targetType: ChangeTargetType;
  status: ChangeRequestStatus;
}

// The changes of a request: computed from the working copy while it is a Draft (D4), stored items otherwise.
@Injectable()
export class RequestItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(
    db: Db,
    request: ItemSource,
  ): Promise<{ live: boolean; items: ChangeItemDraft[] }> {
    const kind = workspaceKindFor(request.requestType, request.targetType);
    if (request.status !== ChangeRequestStatus.DRAFT || !kind) {
      return { live: false, items: await this.stored(db, request.id) };
    }
    return { live: true, items: await this.liveItems(db, request, kind) };
  }

  async liveItems(
    db: Db,
    request: Pick<ItemSource, 'id'>,
    kind: WorkspaceKind,
  ): Promise<ChangeItemDraft[]> {
    if (kind === WORKSPACE_KIND.PROGRAM_VERSION) {
      const copy = await db.programVersion.findUniqueOrThrow({
        where: { sourceRequestId: request.id },
        select: { id: true, baseVersionId: true },
      });
      const base = copy.baseVersionId!;
      return diffSnapshots(
        await readProgramSnapshot(db, base),
        await readProgramSnapshot(db, copy.id),
        base,
      );
    }
    const copy = await db.syllabus.findUniqueOrThrow({
      where: { sourceRequestId: request.id },
      select: { id: true, baseRevisionId: true },
    });
    const base = copy.baseRevisionId!;
    return diffSnapshots(
      await readSyllabusSnapshot(db, base),
      await readSyllabusSnapshot(db, copy.id),
      base,
    );
  }

  async diff(id: string, access: AccessContext): Promise<ChangeDiffDto> {
    const request = await findVisibleRequest(this.prisma, id, access);
    const { live, items } = await this.current(this.prisma, request);
    return { live, sections: toDiffSections(items) };
  }

  private async stored(db: Db, requestId: string): Promise<ChangeItemDraft[]> {
    const rows = await db.changeItem.findMany({
      where: { changeRequestId: requestId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => ({
      sortOrder: row.sortOrder,
      entityType: row.entityType,
      itemKey: row.itemKey,
      label: row.label,
      recordId: row.recordId,
      oldValue: row.oldValue as ItemValue | null,
      newValue: row.newValue as ItemValue | null,
      baseVersion: row.baseVersion,
    }));
  }
}
