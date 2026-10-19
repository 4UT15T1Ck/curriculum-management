import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from '../../generated/prisma/client.js';
import { ScopeType } from '../../generated/prisma/client.js';
import {
  OrgUnitRefDto,
  RoleRefDto,
  UserRefDto,
} from '../../shared/dtos/ref.dto.js';
import { toIsoDay } from '../../shared/time/today.js';
import {
  VALIDITY_STATE,
  VALIDITY_STATES,
  validityState,
  type ValidityState,
} from '../../shared/time/validity.js';

export const ROLE_ASSIGNMENT_SELECT = {
  id: true,
  scopeType: true,
  validFrom: true,
  validTo: true,
  createdAt: true,
  revokedAt: true,
  role: { select: { id: true, roleCode: true, roleName: true } },
  scopeUnit: { select: { id: true, unitCode: true, unitName: true } },
  assignedBy: { select: { id: true, fullName: true } },
  revokedBy: { select: { id: true, fullName: true } },
} as const satisfies Prisma.RoleAssignmentSelect;

export type RoleAssignmentRow = Prisma.RoleAssignmentGetPayload<{
  select: typeof ROLE_ASSIGNMENT_SELECT;
}>;

export class RoleAssignmentDto {
  @ApiProperty({ type: String, nullable: true }) id!: string | null;
  @ApiProperty({ type: RoleRefDto }) role!: RoleRefDto;
  @ApiProperty({ enum: ScopeType }) scopeType!: ScopeType;
  @ApiProperty({ type: OrgUnitRefDto, nullable: true })
  scopeUnit!: OrgUnitRefDto | null;
  @ApiProperty({ type: String, format: 'date', nullable: true })
  validFrom!: string | null;
  @ApiProperty({ type: String, format: 'date', nullable: true })
  validTo!: string | null;
  @ApiProperty({ type: UserRefDto, nullable: true })
  assignedBy!: UserRefDto | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt!: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  revokedAt!: string | null;
  @ApiProperty({ type: UserRefDto, nullable: true })
  revokedBy!: UserRefDto | null;
  @ApiProperty({ enum: VALIDITY_STATES, enumName: 'ValidityState' })
  state!: ValidityState;
  @ApiProperty() derived!: boolean;
}

export function toRoleAssignmentDto(
  row: RoleAssignmentRow,
  today: Date,
): RoleAssignmentDto {
  return {
    id: row.id,
    role: row.role,
    scopeType: row.scopeType,
    scopeUnit: row.scopeUnit,
    validFrom: toIsoDay(row.validFrom),
    validTo: row.validTo ? toIsoDay(row.validTo) : null,
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    revokedBy: row.revokedBy,
    state: validityState(row, today),
    derived: false,
  };
}

export function toDerivedRoleAssignmentDto(assignment: {
  roleId: string;
  roleCode: string;
  roleName: string;
  scopeType: ScopeType;
  scopeUnit: { id: string; unitCode: string; unitName: string } | null;
}): RoleAssignmentDto {
  return {
    id: null,
    role: {
      id: assignment.roleId,
      roleCode: assignment.roleCode,
      roleName: assignment.roleName,
    },
    scopeType: assignment.scopeType,
    scopeUnit: assignment.scopeUnit,
    validFrom: null,
    validTo: null,
    assignedBy: null,
    createdAt: null,
    revokedAt: null,
    revokedBy: null,
    state: VALIDITY_STATE.ACTIVE,
    derived: true,
  };
}
