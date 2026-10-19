import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  CourseStatus,
  CourseType,
  OrgUnitType,
  Prisma,
} from '../../src/generated/prisma/client.js';
import { ORG_UNIT_CODES } from '../../prisma/seed-data/org-units.js';
import { HOME_FACULTY_CODE } from '../../src/shared/org-units/home-faculty.js';
import { PrismaService } from '../../src/shared/prisma/prisma.service.js';

export interface CourseFixture {
  courseCode: string;
  credits?: string;
  courseType?: CourseType;
  facultyCode?: string;
  groupId?: string | null;
  status?: CourseStatus;
}

// Writes through Prisma, bypassing validation; tests of validation must go through HTTP.
export async function createCourse(
  app: NestExpressApplication,
  fixture: CourseFixture,
) {
  const prisma = app.get(PrismaService);
  const faculty = await prisma.orgUnit.findUniqueOrThrow({
    where: { unitCode: fixture.facultyCode ?? HOME_FACULTY_CODE },
  });
  return prisma.course.create({
    data: {
      courseCode: fixture.courseCode,
      courseName: `Học phần ${fixture.courseCode}`,
      credits: new Prisma.Decimal(fixture.credits ?? '3'),
      courseType: fixture.courseType ?? CourseType.THEORY,
      status: fixture.status ?? CourseStatus.ACTIVE,
      ownerFacultyId: faculty.id,
      ownerGroupId: fixture.groupId ?? null,
    },
  });
}

// A FACULTY under the university root, created through Prisma to keep course tests independent of MH-07.
export async function createForeignFaculty(
  app: NestExpressApplication,
  unitCode: string,
) {
  const prisma = app.get(PrismaService);
  const root = await prisma.orgUnit.findUniqueOrThrow({
    where: { unitCode: ORG_UNIT_CODES.UNIVERSITY },
  });
  return prisma.orgUnit.create({
    data: {
      unitCode,
      unitName: `Khoa ${unitCode}`,
      unitType: OrgUnitType.FACULTY,
      parentUnitId: root.id,
    },
  });
}
