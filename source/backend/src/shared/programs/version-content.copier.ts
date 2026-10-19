import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';

// Copies everything that hangs off a program version into another version, inside the caller's transaction.
// Each feature that adds version-owned tables adds its step here: clone (FR-25) and the Draft of a change request depend on it.
// F-07 adds the curriculum, F-11 the PLO and matrices. Until then there is nothing to copy.
@Injectable()
export class VersionContentCopier {
  async copy(
    tx: Prisma.TransactionClient,
    fromVersionId: string,
    toVersionId: string,
  ): Promise<void> {
    void tx;
    void fromVersionId;
    void toVersionId;
  }
}
