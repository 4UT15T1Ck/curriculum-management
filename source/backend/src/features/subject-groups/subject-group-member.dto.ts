import { ApiProperty } from '@nestjs/swagger';
import {
  SubjectGroupMemberRole,
  UserStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { SubjectGroupRefDto, UserRefDto } from '../../shared/dtos/ref.dto.js';
import { toIsoDay } from '../../shared/time/today.js';
import {
  VALIDITY_STATES,
  validityState,
  type ValidityState,
} from '../../shared/time/validity.js';

export class MemberUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() userCode!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status!: UserStatus;
}

export class SubjectGroupMemberDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: MemberUserDto }) lecturer!: MemberUserDto;
  @ApiProperty({
    enum: SubjectGroupMemberRole,
    enumName: 'SubjectGroupMemberRole',
  })
  memberRole!: SubjectGroupMemberRole;
  @ApiProperty({ format: 'date' }) validFrom!: string;
  @ApiProperty({ format: 'date', nullable: true, type: String }) validTo!:
    string | null;
  @ApiProperty({ enum: VALIDITY_STATES, enumName: 'ValidityState' })
  state!: ValidityState;
  @ApiProperty({ type: UserRefDto, nullable: true })
  assignedBy!: UserRefDto | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true, type: String }) revokedAt!: string | null;
  @ApiProperty({ type: UserRefDto, nullable: true })
  revokedBy!: UserRefDto | null;
}

type SubjectGroupReference = SubjectGroupRefDto;

export class UserSubjectGroupMembershipDto extends SubjectGroupMemberDto {
  @ApiProperty({ type: () => SubjectGroupRefDto })
  subjectGroup!: SubjectGroupReference;
}

export const MEMBER_SELECT = {
  id: true,
  memberRole: true,
  validFrom: true,
  validTo: true,
  createdAt: true,
  revokedAt: true,
  lecturer: {
    select: { id: true, userCode: true, fullName: true, status: true },
  },
  assignedBy: { select: { id: true, fullName: true } },
  revokedBy: { select: { id: true, fullName: true } },
} as const satisfies Prisma.SubjectGroupMemberSelect;

export type MemberRow = Prisma.SubjectGroupMemberGetPayload<{
  select: typeof MEMBER_SELECT;
}>;

export function toSubjectGroupMemberDto(
  row: MemberRow,
  today: Date,
): SubjectGroupMemberDto {
  return {
    id: row.id,
    lecturer: row.lecturer,
    memberRole: row.memberRole,
    assignedBy: row.assignedBy,
    revokedBy: row.revokedBy,
    validFrom: toIsoDay(row.validFrom),
    validTo: row.validTo ? toIsoDay(row.validTo) : null,
    state: validityState(row, today),
    createdAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
  };
}
