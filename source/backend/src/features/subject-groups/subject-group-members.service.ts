import { Injectable, Logger } from '@nestjs/common';
import { SubjectGroupMemberRole } from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  addMembership,
  coordinatorRowsInside,
  endMembership,
  findLiveMember,
  MEMBER_SELECT,
} from '../../shared/subject-groups/membership.writer.js';
import { todayDate } from '../../shared/time/today.js';
import { AddSubjectGroupMemberDto } from './add-subject-group-member.dto.js';
import { EndSubjectGroupMemberDto } from './end-subject-group-member.dto.js';
import {
  SubjectGroupMemberDto,
  toSubjectGroupMemberDto,
  UserSubjectGroupMembershipDto,
} from './subject-group-member.dto.js';
import { SUBJECT_GROUP_ERRORS } from './subject-groups.errors.js';

@Injectable()
export class SubjectGroupMembersService {
  private readonly logger = new Logger(SubjectGroupMembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async add(
    groupId: string,
    dto: AddSubjectGroupMemberDto,
    actorId: string,
  ): Promise<SubjectGroupMemberDto> {
    const row = await addMembership(this.prisma, groupId, dto, actorId);
    this.logger.log(
      `${dto.memberRole} ${dto.lecturerId} added to group ${groupId} by ${actorId}`,
    );
    return toSubjectGroupMemberDto(row, todayDate());
  }

  async end(
    groupId: string,
    memberId: string,
    dto: EndSubjectGroupMemberDto,
    actorId: string,
  ): Promise<SubjectGroupMemberDto[]> {
    const changed = await this.prisma.$transaction((tx) =>
      endMembership(tx, groupId, memberId, dto.validTo, actorId),
    );
    this.logger.log(
      `Member row ${memberId} ended ${dto.validTo} by ${actorId}; ${changed.length - 1} coordinator row(s) adjusted`,
    );
    const today = todayDate();
    return changed.map((member) => toSubjectGroupMemberDto(member, today));
  }

  async revoke(
    groupId: string,
    memberId: string,
    actorId: string,
  ): Promise<SubjectGroupMemberDto> {
    const row = await findLiveMember(this.prisma, groupId, memberId);
    if (
      row.memberRole === SubjectGroupMemberRole.MEMBER &&
      (await coordinatorRowsInside(this.prisma, row)).length > 0
    )
      throw new AppException(SUBJECT_GROUP_ERRORS.MEMBER_HAS_COORDINATOR);
    const updated = await this.prisma.subjectGroupMember.update({
      where: { id: row.id },
      data: { revokedAt: new Date(), revokedById: actorId },
      select: MEMBER_SELECT,
    });
    this.logger.log(`Member row ${row.id} revoked by ${actorId}`);
    return toSubjectGroupMemberDto(updated, todayDate());
  }

  async membershipsOf(
    userId: string,
  ): Promise<UserSubjectGroupMembershipDto[]> {
    const rows = await this.prisma.subjectGroupMember.findMany({
      where: { lecturerId: userId },
      select: {
        ...MEMBER_SELECT,
        subjectGroup: {
          select: { id: true, groupCode: true, groupName: true, status: true },
        },
      },
      orderBy: { validFrom: 'desc' },
    });
    const today = todayDate();
    return rows.map((row) =>
      Object.assign(toSubjectGroupMemberDto(row, today), {
        subjectGroup: row.subjectGroup,
      }),
    );
  }
}
