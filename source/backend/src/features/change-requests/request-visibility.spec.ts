import { describe, expect, it } from 'vitest';
import {
  ScopeSource,
  ScopeType,
  type PermissionScope,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { visibleWhere } from './request-visibility.js';

function viewer(
  scope: PermissionScope,
  groupIds: string[] = [],
): AccessContext {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.ASSIGNMENT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(['f1']),
      subjectGroupIds: new Set(groupIds),
      programIds: new Set(['p1']),
      studentIds: new Set(),
    },
    permissions: new Map([
      [PERMISSIONS.CHANGE_REQUEST_VIEW, { mode: 'DIRECT', scope }],
    ]),
  };
  return new AccessContext('u1', [assignment]);
}

describe('visibleWhere', () => {
  it('shows an unscoped viewer their own drafts and every submitted request', () => {
    expect(visibleWhere(viewer('ALL'))).toEqual({
      OR: [{ createdById: 'u1' }, { submissionRound: { gt: 0 } }],
    });
  });

  it('shows a scoped viewer their own, what they approve and what lies in their scope, never an unsubmitted draft of others', () => {
    const where = visibleWhere(viewer('SCOPED', ['g1']));
    const [mine, submitted] = where.OR as [
      object,
      { submissionRound: object; OR: object[] },
    ];
    expect(mine).toEqual({ createdById: 'u1' });
    expect(submitted.submissionRound).toEqual({ gt: 0 });
    expect(submitted.OR).toContainEqual({
      steps: { some: { approverId: 'u1' } },
    });
    expect(JSON.stringify(submitted.OR)).toContain(
      '"ownerGroupId":{"in":["g1"]}',
    );
    expect(JSON.stringify(submitted.OR)).toContain('"id":{"in":["p1"]}');
  });
});
