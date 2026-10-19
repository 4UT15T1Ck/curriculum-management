import { Injectable, Logger } from '@nestjs/common';
import {
  SubjectGroupMemberRole,
  SubjectGroupStatus,
  UserStatus,
} from '../../generated/prisma/client.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { fromIsoDay, todayDate } from '../../shared/time/today.js';
import {
  overlapsPeriod,
  parsePeriod,
  type Period,
} from '../../shared/time/validity.js';
import { AddSubjectGroupMemberDto } from './add-subject-group-member.dto.js';
import { EndSubjectGroupMemberDto } from './end-subject-group-member.dto.js';
import {
  MEMBER_SELECT,
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
    const group = await this.prisma.subjectGroup.findUnique({
      where: { id: groupId },
    });
    if (!group)
      throw new AppException(SUBJECT_GROUP_ERRORS.SUBJECT_GROUP_NOT_FOUND);
    if (group.status !== SubjectGroupStatus.ACTIVE)
      throw new AppException(SUBJECT_GROUP_ERRORS.SUBJECT_GROUP_INACTIVE);
    const lecturer = await this.prisma.user.findUnique({
      where: { id: dto.lecturerId },
    });
    if (!lecturer || lecturer.status !== UserStatus.ACTIVE)
      throw new AppException(SUBJECT_GROUP_ERRORS.LECTURER_INVALID);
    const period = parsePeriod(dto.validFrom, dto.validTo);
    await this.assertNoOverlap(group.id, lecturer.id, dto.memberRole, period);
    if (dto.memberRole === SubjectGroupMemberRole.COORDINATOR)
      await this.assertCoveredByMembership(group.id, lecturer.id, period);
    const row = await this.prisma.subjectGroupMember.create({
      data: {
        subjectGroupId: group.id,
        lecturerId: lecturer.id,
        memberRole: dto.memberRole,
        ...period,
        assignedById: actorId,
      },
      select: MEMBER_SELECT,
    });
    this.logger.log(
      `${dto.memberRole} ${lecturer.id} added to ${group.groupCode} by ${actorId}`,
    );
    return toSubjectGroupMemberDto(row, todayDate());
  }

  async end(
    groupId: string,
    memberId: string,
    dto: EndSubjectGroupMemberDto,
    actorId: string,
  ): Promise<SubjectGroupMemberDto[]> {
    const row = await this.findLiveOrThrow(groupId, memberId);
    const validTo = fromIsoDay(dto.validTo);
    if (validTo < row.validFrom)
      throw new AppException(COMMON_ERRORS.VALIDITY_INVALID);
    if (row.validTo && validTo >= row.validTo)
      throw new AppException(SUBJECT_GROUP_ERRORS.END_DATE_NOT_EARLIER);
    const dependants =
      row.memberRole === SubjectGroupMemberRole.MEMBER
        ? await this.coordinatorRowsInside(row)
        : [];
    const now = new Date();
    const changed = await this.prisma.$transaction([
      this.prisma.subjectGroupMember.update({
        where: { id: row.id },
        data: { validTo },
        select: MEMBER_SELECT,
      }),
      ...dependants
        .filter((coordinator) => coordinator.validFrom > validTo)
        .map((coordinator) =>
          this.prisma.subjectGroupMember.update({
            where: { id: coordinator.id },
            data: { revokedAt: now, revokedById: actorId },
            select: MEMBER_SELECT,
          }),
        ),
      ...dependants
        .filter(
          (coordinator) =>
            coordinator.validFrom <= validTo &&
            (!coordinator.validTo || coordinator.validTo > validTo),
        )
        .map((coordinator) =>
          this.prisma.subjectGroupMember.update({
            where: { id: coordinator.id },
            data: { validTo },
            select: MEMBER_SELECT,
          }),
        ),
    ]);
    this.logger.log(
      `Member row ${row.id} ended ${dto.validTo} by ${actorId}; ${changed.length - 1} coordinator row(s) adjusted`,
    );
    const today = todayDate();
    return changed.map((member) => toSubjectGroupMemberDto(member, today));
  }

  async revoke(
    groupId: string,
    memberId: string,
    actorId: string,
  ): Promise<SubjectGroupMemberDto> {
    const row = await this.findLiveOrThrow(groupId, memberId);
    if (
      row.memberRole === SubjectGroupMemberRole.MEMBER &&
      (await this.coordinatorRowsInside(row)).length > 0
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

  private async findLiveOrThrow(groupId: string, memberId: string) {
    const row = await this.prisma.subjectGroupMember.findFirst({
      where: { id: memberId, subjectGroupId: groupId },
    });
    if (!row) throw new AppException(SUBJECT_GROUP_ERRORS.MEMBER_NOT_FOUND);
    if (row.revokedAt)
      throw new AppException(SUBJECT_GROUP_ERRORS.MEMBER_ALREADY_REVOKED);
    return row;
  }

  private async assertNoOverlap(
    groupId: string,
    lecturerId: string,
    memberRole: SubjectGroupMemberRole,
    period: Period,
  ): Promise<void> {
    const clash = await this.prisma.subjectGroupMember.findFirst({
      where: {
        subjectGroupId: groupId,
        lecturerId,
        memberRole,
        revokedAt: null,
        ...overlapsPeriod(period),
      },
    });
    if (clash) throw new AppException(SUBJECT_GROUP_ERRORS.MEMBERSHIP_OVERLAP);
  }

  private async assertCoveredByMembership(
    groupId: string,
    lecturerId: string,
    period: Period,
  ): Promise<void> {
    const cover = await this.prisma.subjectGroupMember.findFirst({
      where: {
        subjectGroupId: groupId,
        lecturerId,
        memberRole: SubjectGroupMemberRole.MEMBER,
        revokedAt: null,
        validFrom: { lte: period.validFrom },
        ...(period.validTo
          ? { OR: [{ validTo: null }, { validTo: { gte: period.validTo } }] }
          : { validTo: null }),
      },
    });
    if (!cover)
      throw new AppException(SUBJECT_GROUP_ERRORS.COORDINATOR_NOT_MEMBER);
  }

  private coordinatorRowsInside(member: {
    subjectGroupId: string;
    lecturerId: string;
    validFrom: Date;
    validTo: Date | null;
  }) {
    return this.prisma.subjectGroupMember.findMany({
      where: {
        subjectGroupId: member.subjectGroupId,
        lecturerId: member.lecturerId,
        memberRole: SubjectGroupMemberRole.COORDINATOR,
        revokedAt: null,
        validFrom: {
          gte: member.validFrom,
          ...(member.validTo && { lte: member.validTo }),
        },
      },
    });
  }
}
