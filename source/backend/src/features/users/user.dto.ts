import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from '../../generated/prisma/client.js';
import { UserStatus } from '../../generated/prisma/client.js';
import { OrgUnitRefDto } from '../../shared/dtos/ref.dto.js';

export const USER_DETAIL_SELECT = {
  id: true,
  username: true,
  userCode: true,
  fullName: true,
  email: true,
  status: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
  orgUnit: { select: { id: true, unitCode: true, unitName: true } },
  roleAssignments: {
    where: { revokedAt: null },
    select: {
      validFrom: true,
      validTo: true,
      role: { select: { roleCode: true } },
    },
  },
} as const satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{
  select: typeof USER_DETAIL_SELECT;
}>;

export class UserSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() username!: string;
  @ApiProperty() userCode!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty({ type: OrgUnitRefDto, nullable: true })
  orgUnit!: OrgUnitRefDto | null;
  @ApiProperty({ enum: UserStatus }) status!: UserStatus;
  @ApiProperty({ type: [String] }) activeRoleCodes!: string[];
}

export class UserDetailDto extends UserSummaryDto {
  @ApiProperty() mustChangePassword!: boolean;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class UserPageDto {
  @ApiProperty({ type: [UserSummaryDto] }) items!: UserSummaryDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}

export class TemporaryPasswordDto {
  @ApiProperty() temporaryPassword!: string;
}

export class CreatedUserDto {
  @ApiProperty({ type: UserDetailDto }) user!: UserDetailDto;
  @ApiProperty() temporaryPassword!: string;
}

export function toUserSummaryDto(row: UserRow, today: Date): UserSummaryDto {
  return {
    id: row.id,
    username: row.username,
    userCode: row.userCode,
    fullName: row.fullName,
    email: row.email,
    orgUnit: row.orgUnit,
    status: row.status,
    activeRoleCodes: row.roleAssignments
      .filter(
        (assignment) =>
          assignment.validFrom <= today &&
          (!assignment.validTo || assignment.validTo >= today),
      )
      .map((assignment) => assignment.role.roleCode),
  };
}

export function toUserDetailDto(row: UserRow, today: Date): UserDetailDto {
  return {
    id: row.id,
    username: row.username,
    userCode: row.userCode,
    fullName: row.fullName,
    email: row.email,
    orgUnit: row.orgUnit,
    status: row.status,
    activeRoleCodes: row.roleAssignments
      .filter(
        (assignment) =>
          assignment.validFrom <= today &&
          (!assignment.validTo || assignment.validTo >= today),
      )
      .map((assignment) => assignment.role.roleCode),
    mustChangePassword: row.mustChangePassword,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
