import { Injectable, Logger } from '@nestjs/common';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { todayDate } from '../../shared/time/today.js';
import {
  parsePeriod,
  overlapsPeriod,
  type Period,
} from '../../shared/time/validity.js';
import { ScopeService } from '../../shared/authz/scope.service.js';
import { CreateRoleAssignmentDto } from './create-role-assignment.dto.js';
import {
  RoleAssignmentDto,
  ROLE_ASSIGNMENT_SELECT,
  toDerivedRoleAssignmentDto,
  toRoleAssignmentDto,
} from './role-assignment.dto.js';
import { USER_ERRORS } from './users.errors.js';

@Injectable()
export class RoleAssignmentsService {
  private readonly logger = new Logger(RoleAssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scopes: ScopeService,
  ) {}

  async history(userId: string): Promise<RoleAssignmentDto[]> {
    const rows = await this.prisma.roleAssignment.findMany({
      where: { userId },
      select: ROLE_ASSIGNMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    const today = todayDate();
    const access = await this.scopes.loadAccess(userId);
    const derived = access.assignments.filter(
      (assignment) => assignment.assignmentId === null,
    );
    return [
      ...rows.map((row) => toRoleAssignmentDto(row, today)),
      ...derived.map(toDerivedRoleAssignmentDto),
    ];
  }

  async assign(
    userId: string,
    dto: CreateRoleAssignmentDto,
    actorId: string,
  ): Promise<RoleAssignmentDto> {
    if (userId === actorId) {
      throw new AppException(USER_ERRORS.CANNOT_CHANGE_OWN_ROLES);
    }
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role || role.scopeSource !== ScopeSource.NONE) {
      throw new AppException(USER_ERRORS.ROLE_NOT_ASSIGNABLE);
    }
    const scopeUnitId =
      dto.scopeType === ScopeType.UNIT ? dto.scopeUnitId : null;
    if (dto.scopeType === ScopeType.UNIT && !scopeUnitId) {
      throw new AppException(USER_ERRORS.SCOPE_INVALID);
    }
    if (
      scopeUnitId &&
      !(await this.prisma.orgUnit.findUnique({ where: { id: scopeUnitId } }))
    ) {
      throw new AppException(USER_ERRORS.SCOPE_INVALID);
    }
    const period = parsePeriod(dto.validFrom, dto.validTo);
    await this.assertNoOverlap(userId, role.id, scopeUnitId ?? null, period);
    const row = await this.prisma.roleAssignment.create({
      data: {
        userId,
        roleId: role.id,
        scopeType: dto.scopeType,
        scopeUnitId: scopeUnitId ?? null,
        ...period,
        assignedById: actorId,
      },
      select: ROLE_ASSIGNMENT_SELECT,
    });
    this.logger.log(
      `Role ${role.roleCode} (${dto.scopeType} ${scopeUnitId ?? '-'}, ${dto.validFrom}..${dto.validTo ?? '∞'}) granted to ${userId} by ${actorId}`,
    );
    return toRoleAssignmentDto(row, todayDate());
  }

  async revoke(
    userId: string,
    assignmentId: string,
    actorId: string,
  ): Promise<RoleAssignmentDto> {
    if (userId === actorId) {
      throw new AppException(USER_ERRORS.CANNOT_CHANGE_OWN_ROLES);
    }
    const existing = await this.prisma.roleAssignment.findFirst({
      where: { id: assignmentId, userId },
    });
    if (!existing) {
      throw new AppException(USER_ERRORS.ASSIGNMENT_NOT_FOUND);
    }
    if (existing.revokedAt) {
      throw new AppException(USER_ERRORS.ASSIGNMENT_ALREADY_REVOKED);
    }
    const row = await this.prisma.roleAssignment.update({
      where: { id: assignmentId },
      data: { revokedAt: new Date(), revokedById: actorId },
      select: ROLE_ASSIGNMENT_SELECT,
    });
    this.logger.log(
      `Role assignment ${assignmentId} of ${userId} revoked by ${actorId}`,
    );
    return toRoleAssignmentDto(row, todayDate());
  }

  private async assertNoOverlap(
    userId: string,
    roleId: string,
    scopeUnitId: string | null,
    period: Period,
  ): Promise<void> {
    const clash = await this.prisma.roleAssignment.findFirst({
      where: {
        userId,
        roleId,
        scopeUnitId,
        revokedAt: null,
        ...overlapsPeriod(period),
      },
    });
    if (clash) {
      throw new AppException(USER_ERRORS.ASSIGNMENT_OVERLAP);
    }
  }
}
