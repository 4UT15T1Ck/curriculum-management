import type { NestExpressApplication } from '@nestjs/platform-express';
import { SubjectGroupMemberRole } from '../../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from '../../prisma/seed-data/org-units.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';
import { todayDate } from '../../src/shared/time/today.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function createSubjectGroup(
  app: NestExpressApplication,
  groupCode: string,
  facultyCode: string = ORG_UNIT_CODES.FACULTY_IT,
) {
  const prisma = app.get(PrismaService);
  const faculty = await prisma.orgUnit.findUniqueOrThrow({
    where: { unitCode: facultyCode },
  });
  return prisma.subjectGroup.create({
    data: { groupCode, groupName: groupCode, facultyId: faculty.id },
  });
}

export interface MembershipFixture {
  groupId: string;
  userId: string;
  memberRole?: SubjectGroupMemberRole;
  validFrom?: Date;
  validTo?: Date | null;
}

export async function addMembership(
  app: NestExpressApplication,
  fixture: MembershipFixture,
) {
  return app.get(PrismaService).subjectGroupMember.create({
    data: {
      subjectGroupId: fixture.groupId,
      lecturerId: fixture.userId,
      memberRole: fixture.memberRole ?? SubjectGroupMemberRole.MEMBER,
      validFrom: fixture.validFrom ?? todayDate(),
      validTo: fixture.validTo ?? null,
    },
  });
}

export function daysFromToday(days: number): Date {
  return new Date(todayDate().getTime() + days * MS_PER_DAY);
}
