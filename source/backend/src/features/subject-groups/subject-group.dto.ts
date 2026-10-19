import { ApiProperty } from '@nestjs/swagger';
import {
  SubjectGroupMemberRole,
  SubjectGroupStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { OrgUnitRefDto, UserRefDto } from '../../shared/dtos/ref.dto.js';
import { activeMemberRowWhere } from '../../shared/subject-groups/active-membership.js';
import { SubjectGroupMemberDto } from './subject-group-member.dto.js';

export class SubjectGroupRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
  @ApiProperty() groupName!: string;
  @ApiProperty({ enum: SubjectGroupStatus, enumName: 'SubjectGroupStatus' })
  status!: SubjectGroupStatus;
}

export class SubjectGroupSummaryDto extends SubjectGroupRefDto {
  @ApiProperty({ type: OrgUnitRefDto }) faculty!: OrgUnitRefDto;
  @ApiProperty() activeMemberCount!: number;
  @ApiProperty({ type: [UserRefDto] }) activeCoordinators!: UserRefDto[];
  @ApiProperty() hasActiveCoordinator!: boolean;
}

export class SubjectGroupDetailDto extends SubjectGroupSummaryDto {
  @ApiProperty({ type: () => [SubjectGroupMemberDto] })
  members!: SubjectGroupMemberDto[];
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class SubjectGroupCourseRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
}

export class SubjectGroupDeactivationImpactDto {
  @ApiProperty() activeMemberCount!: number;
  @ApiProperty({ type: [UserRefDto] }) activeCoordinators!: UserRefDto[];
  @ApiProperty({ type: [SubjectGroupCourseRefDto] })
  courses!: SubjectGroupCourseRefDto[];
}

export function summaryInclude(today: Date) {
  return {
    faculty: { select: { id: true, unitCode: true, unitName: true } },
    members: {
      where: activeMemberRowWhere(today),
      select: {
        memberRole: true,
        lecturer: { select: { id: true, fullName: true } },
      },
    },
  } satisfies Prisma.SubjectGroupInclude;
}

export type SubjectGroupWithActiveMembers = Prisma.SubjectGroupGetPayload<{
  include: ReturnType<typeof summaryInclude>;
}>;

export function toSubjectGroupSummaryDto(
  row: SubjectGroupWithActiveMembers,
): SubjectGroupSummaryDto {
  const live = row.status === SubjectGroupStatus.ACTIVE ? row.members : [];
  const coordinators = live
    .filter(
      (member) => member.memberRole === SubjectGroupMemberRole.COORDINATOR,
    )
    .map((member) => member.lecturer);
  const activeCoordinators = [
    ...new Map(
      coordinators.map((lecturer) => [lecturer.id, lecturer]),
    ).values(),
  ];
  return {
    id: row.id,
    groupCode: row.groupCode,
    groupName: row.groupName,
    status: row.status,
    faculty: row.faculty,
    activeMemberCount: new Set(live.map((member) => member.lecturer.id)).size,
    activeCoordinators,
    hasActiveCoordinator: activeCoordinators.length > 0,
  };
}
