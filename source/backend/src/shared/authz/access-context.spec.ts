import { describe, expect, it } from 'vitest';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { PERMISSIONS } from './permission-codes.js';
import { AccessContext, type ActiveAssignment } from './access-context.js';

function assignment(
  roleCode: string,
  mode: 'DIRECT' | 'VIA_REQUEST',
  scope: 'ALL' | 'SCOPED',
  orgUnitIds: string[] = [],
  subjectGroupIds: string[] = [],
): ActiveAssignment {
  return {
    assignmentId: roleCode,
    roleId: roleCode,
    roleCode,
    roleName: roleCode,
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.UNIT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(orgUnitIds),
      subjectGroupIds: new Set(subjectGroupIds),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([[PERMISSIONS.COURSE_VIEW, { mode, scope }]]),
  };
}

describe('AccessContext', () => {
  it('denies when no assignment holds the permission', () => {
    const context = new AccessContext('user-1', []);

    expect(context.has(PERMISSIONS.COURSE_VIEW)).toBe(false);
    expect(() =>
      context.assertCan(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-1'] }),
    ).toThrowError(AppException);
    try {
      context.assertCan(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-1'] });
    } catch (error) {
      expect((error as AppException).code).toBe('PERMISSION_DENIED');
    }
  });

  it('distinguishes a held permission outside the assigned scope', () => {
    const context = new AccessContext('user-1', [
      assignment('R2', 'DIRECT', 'SCOPED', ['unit-1']),
    ]);

    expect(() =>
      context.assertCan(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-2'] }),
    ).toThrowError(AppException);
    try {
      context.assertCan(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-2'] });
    } catch (error) {
      expect((error as AppException).code).toBe('OUT_OF_SCOPE');
    }
    expect(
      context.assertCan(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-1'] }),
    ).toBe('DIRECT');
  });

  it('applies ALL cells to scoped assignments', () => {
    const context = new AccessContext('user-1', [
      assignment('R2', 'VIA_REQUEST', 'ALL'),
    ]);

    expect(
      context.assertCan(PERMISSIONS.COURSE_VIEW, {
        studentIds: ['student-unknown'],
      }),
    ).toBe('VIA_REQUEST');
  });

  it('prefers DIRECT over VIA_REQUEST for the same target', () => {
    const context = new AccessContext('user-1', [
      assignment('R2', 'VIA_REQUEST', 'ALL'),
      assignment('R3', 'DIRECT', 'SCOPED', [], ['group-g']),
    ]);

    expect(
      context.modeFor(PERMISSIONS.COURSE_VIEW, {
        subjectGroupIds: ['group-g'],
      }),
    ).toBe('DIRECT');
    expect(
      context.modeFor(PERMISSIONS.COURSE_VIEW, {
        subjectGroupIds: ['group-x'],
      }),
    ).toBe('VIA_REQUEST');
  });

  it('keeps grants isolated to each role scope', () => {
    const first = assignment('R2', 'DIRECT', 'SCOPED', ['unit-1']);
    const second = assignment('R3', 'DIRECT', 'SCOPED', ['unit-2']);
    second.permissions = new Map([
      [PERMISSIONS.COURSE_EDIT, { mode: 'DIRECT', scope: 'SCOPED' }],
    ]);
    const context = new AccessContext('user-1', [first, second]);

    expect(
      context.modeFor(PERMISSIONS.COURSE_VIEW, { orgUnitIds: ['unit-2'] }),
    ).toBeNull();
    expect(
      context.modeFor(PERMISSIONS.COURSE_EDIT, { orgUnitIds: ['unit-1'] }),
    ).toBeNull();
    expect(
      context.modeFor(PERMISSIONS.COURSE_EDIT, { orgUnitIds: ['unit-2'] }),
    ).toBe('DIRECT');
  });

  it('unions scopes for list filters and promotes any ALL grant', () => {
    const first = assignment('R2', 'DIRECT', 'SCOPED', ['unit-1']);
    const second = assignment('R3', 'DIRECT', 'SCOPED', ['unit-2']);
    const context = new AccessContext('user-1', [first, second]);

    expect(context.scopeFor(PERMISSIONS.COURSE_VIEW)).toMatchObject({
      all: false,
      orgUnitIds: new Set(['unit-1', 'unit-2']),
    });
    second.permissions = new Map([
      [PERMISSIONS.COURSE_VIEW, { mode: 'DIRECT', scope: 'ALL' }],
    ]);
    expect(context.scopeFor(PERMISSIONS.COURSE_VIEW)).toEqual({ all: true });
  });
});
