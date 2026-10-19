import type {
  PermissionMode,
  PermissionScope,
  ScopeSource,
  ScopeType,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import type { PermissionCode } from './permission-codes.js';

export interface ScopeTarget {
  orgUnitIds?: readonly string[];
  subjectGroupIds?: readonly string[];
  programIds?: readonly string[];
  studentIds?: readonly string[];
}

export interface ScopeIds {
  orgUnitIds: ReadonlySet<string>;
  subjectGroupIds: ReadonlySet<string>;
  programIds: ReadonlySet<string>;
  studentIds: ReadonlySet<string>;
}

export type ResolvedScope = { all: true } | ({ all: false } & ScopeIds);

export interface PermissionGrant {
  mode: PermissionMode;
  scope: PermissionScope;
}

export interface ActiveAssignment {
  assignmentId: string | null;
  roleId: string;
  roleCode: string;
  roleName: string;
  scopeSource: ScopeSource;
  scopeType: ScopeType;
  scopeUnit: { id: string; unitCode: string; unitName: string } | null;
  scope: ResolvedScope;
  permissions: ReadonlyMap<PermissionCode, PermissionGrant>;
}

const NOTHING: ResolvedScope = {
  all: false,
  orgUnitIds: new Set(),
  subjectGroupIds: new Set(),
  programIds: new Set(),
  studentIds: new Set(),
};

export class AccessContext {
  constructor(
    readonly userId: string,
    readonly assignments: readonly ActiveAssignment[],
  ) {}

  has(code: PermissionCode): boolean {
    return this.assignments.some((assignment) =>
      assignment.permissions.has(code),
    );
  }

  heldPermissions(): PermissionCode[] {
    return [
      ...new Set(
        this.assignments.flatMap((assignment) => [
          ...assignment.permissions.keys(),
        ]),
      ),
    ];
  }

  modeFor(code: PermissionCode, target: ScopeTarget): PermissionMode | null {
    let found: PermissionMode | null = null;
    for (const assignment of this.assignments) {
      const grant = assignment.permissions.get(code);
      if (!grant || !covers(effectiveScope(assignment, grant), target)) {
        continue;
      }
      if (grant.mode === 'DIRECT') {
        return 'DIRECT';
      }
      found = grant.mode;
    }
    return found;
  }

  assertCan(code: PermissionCode, target: ScopeTarget): PermissionMode {
    const mode = this.modeFor(code, target);
    if (mode === null) {
      throw new AppException(
        this.has(code)
          ? COMMON_ERRORS.OUT_OF_SCOPE
          : COMMON_ERRORS.PERMISSION_DENIED,
      );
    }
    return mode;
  }

  scopeFor(code: PermissionCode): ResolvedScope {
    const scopes = this.assignments
      .filter((assignment) => assignment.permissions.has(code))
      .map((assignment) =>
        effectiveScope(assignment, assignment.permissions.get(code)!),
      );
    if (scopes.some((scope) => scope.all)) {
      return { all: true };
    }
    return scopes.reduce<ResolvedScope>(unite, NOTHING);
  }
}

function effectiveScope(
  assignment: ActiveAssignment,
  grant: PermissionGrant,
): ResolvedScope {
  return grant.scope === 'ALL' ? { all: true } : assignment.scope;
}

function covers(scope: ResolvedScope, target: ScopeTarget): boolean {
  if (scope.all) {
    return true;
  }
  return (
    intersects(scope.orgUnitIds, target.orgUnitIds) ||
    intersects(scope.subjectGroupIds, target.subjectGroupIds) ||
    intersects(scope.programIds, target.programIds) ||
    intersects(scope.studentIds, target.studentIds)
  );
}

function intersects(
  held: ReadonlySet<string>,
  wanted: readonly string[] | undefined,
): boolean {
  return (wanted ?? []).some((id) => held.has(id));
}

function unite(left: ResolvedScope, right: ResolvedScope): ResolvedScope {
  if (left.all || right.all) {
    return { all: true };
  }
  return {
    all: false,
    orgUnitIds: new Set([...left.orgUnitIds, ...right.orgUnitIds]),
    subjectGroupIds: new Set([
      ...left.subjectGroupIds,
      ...right.subjectGroupIds,
    ]),
    programIds: new Set([...left.programIds, ...right.programIds]),
    studentIds: new Set([...left.studentIds, ...right.studentIds]),
  };
}

export const EMPTY_SCOPE_IDS = NOTHING;
