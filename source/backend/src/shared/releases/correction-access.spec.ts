import { describe, expect, it, vi } from 'vitest';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../authz/access-context.js';
import { PERMISSIONS } from '../authz/permission-codes.js';
import {
  assertVersionWritePath,
  canEditCorrection,
  correctionEditPath,
  isCorrectionDraft,
} from './correction-access.js';

function holder(
  code: string,
  mode: 'DIRECT' | 'VIA_REQUEST',
  scope: 'ALL' | 'SCOPED',
) {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.SYSTEM,
    scopeUnit: null,
    scope: {
      all: scope === 'ALL',
      orgUnitIds: new Set(),
      subjectGroupIds: new Set(),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([
      [code as never, { mode, scope }],
      [PERMISSIONS.CURRICULUM_EDIT, { mode: 'DIRECT', scope: 'ALL' }],
    ]),
  };
  return new AccessContext('u', [assignment]);
}

const R1 = holder(PERMISSIONS.VERSION_CORRECT, 'DIRECT', 'ALL');
const R3 = holder(PERMISSIONS.VERSION_CORRECT, 'VIA_REQUEST', 'SCOPED');
const TARGET = { programIds: ['p1'], orgUnitIds: ['f1'] };

describe('correction Draft access (US-076)', () => {
  it('recognises a correction Draft only while it is a Draft', () => {
    expect(isCorrectionDraft({ status: 'DRAFT', correctionOfId: 'v0' })).toBe(
      true,
    );
    expect(isCorrectionDraft({ status: 'DRAFT', correctionOfId: null })).toBe(
      false,
    );
    expect(isCorrectionDraft({ status: 'ACTIVE', correctionOfId: 'v0' })).toBe(
      false,
    );
  });

  it('lets an unscoped direct holder of version.correct edit it, nobody else', () => {
    expect(canEditCorrection(R1)).toBe(true);
    expect(canEditCorrection(R3)).toBe(false);
    expect(correctionEditPath(R1)).toBe('DIRECT');
    expect(correctionEditPath(R3)).toBeNull();
  });

  describe('assertVersionWritePath', () => {
    const state = vi
      .fn()
      .mockResolvedValue({ released: true, draftOpenToRequestHolders: true });

    it('takes the R1 correction branch before the normal path, never asking the program state', async () => {
      await expect(
        assertVersionWritePath(
          R1,
          PERMISSIONS.CURRICULUM_EDIT,
          TARGET,
          {
            sourceRequest: null,
            correctionOfId: 'v0',
          },
          state,
        ),
      ).resolves.toBeUndefined();
      await expect(
        assertVersionWritePath(
          R3,
          PERMISSIONS.CURRICULUM_EDIT,
          TARGET,
          {
            sourceRequest: null,
            correctionOfId: 'v0',
          },
          state,
        ),
      ).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
      expect(state).not.toHaveBeenCalled();
    });

    it('leaves every other Draft to the edit path it had: a released program still answers CHANGE_REQUEST_REQUIRED', async () => {
      await expect(
        assertVersionWritePath(
          R1,
          PERMISSIONS.CURRICULUM_EDIT,
          TARGET,
          {
            sourceRequest: null,
            correctionOfId: null,
          },
          state,
        ),
      ).rejects.toMatchObject({ code: 'CHANGE_REQUEST_REQUIRED' });
      expect(state).toHaveBeenCalledTimes(1);
    });
  });
});
