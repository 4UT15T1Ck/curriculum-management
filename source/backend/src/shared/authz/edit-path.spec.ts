import { describe, expect, it } from 'vitest';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import { AccessContext, type ActiveAssignment } from './access-context.js';
import {
  assertDirectEdit,
  editPathFor,
  EDIT_PATH,
  resolveEditPath,
} from './edit-path.js';
import { PERMISSIONS } from './permission-codes.js';

const CODE = PERMISSIONS.COURSE_EDIT;
const TARGET = { orgUnitIds: ['unit-1'] };
const OPEN = { released: false, draftOpenToRequestHolders: true };

function access(
  mode: 'DIRECT' | 'VIA_REQUEST' | null,
  orgUnitIds: string[] = ['unit-1'],
): AccessContext {
  const assignment: ActiveAssignment = {
    assignmentId: 'a',
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.UNIT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(orgUnitIds),
      subjectGroupIds: new Set(),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map(
      mode ? [[CODE, { mode, scope: 'SCOPED' as const }]] : [],
    ),
  };
  return new AccessContext('user', mode ? [assignment] : []);
}

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}

describe('edit path', () => {
  it('has no path without a cell, and refuses with PERMISSION_DENIED', () => {
    expect(editPathFor(access(null), CODE, TARGET, OPEN)).toBeNull();
    expect(
      codeOf(() => resolveEditPath(access(null), CODE, TARGET, OPEN)),
    ).toBe('PERMISSION_DENIED');
  });

  it('refuses a held cell outside its scope with OUT_OF_SCOPE', () => {
    const outside = access('DIRECT', ['unit-2']);
    expect(editPathFor(outside, CODE, TARGET, OPEN)).toBeNull();
    expect(codeOf(() => resolveEditPath(outside, CODE, TARGET, OPEN))).toBe(
      'OUT_OF_SCOPE',
    );
  });

  it('lets DIRECT edit directly until the object is released', () => {
    expect(resolveEditPath(access('DIRECT'), CODE, TARGET, OPEN)).toBe(
      EDIT_PATH.DIRECT,
    );
    expect(
      resolveEditPath(access('DIRECT'), CODE, TARGET, {
        ...OPEN,
        released: true,
      }),
    ).toBe(EDIT_PATH.VIA_REQUEST);
  });

  it('lets VIA_REQUEST edit directly only while draft is open to them', () => {
    expect(resolveEditPath(access('VIA_REQUEST'), CODE, TARGET, OPEN)).toBe(
      EDIT_PATH.DIRECT,
    );
    expect(
      resolveEditPath(access('VIA_REQUEST'), CODE, TARGET, {
        released: false,
        draftOpenToRequestHolders: false,
      }),
    ).toBe(EDIT_PATH.VIA_REQUEST);
    expect(
      resolveEditPath(access('VIA_REQUEST'), CODE, TARGET, {
        released: true,
        draftOpenToRequestHolders: true,
      }),
    ).toBe(EDIT_PATH.VIA_REQUEST);
  });

  it('asserts a direct edit with CHANGE_REQUEST_REQUIRED otherwise', () => {
    expect(() =>
      assertDirectEdit(access('DIRECT'), CODE, TARGET, OPEN),
    ).not.toThrow();
    expect(
      codeOf(() =>
        assertDirectEdit(access('VIA_REQUEST'), CODE, TARGET, {
          released: true,
          draftOpenToRequestHolders: true,
        }),
      ),
    ).toBe('CHANGE_REQUEST_REQUIRED');
  });
});
