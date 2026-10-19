import { Injectable } from '@nestjs/common';
import {
  CourseRelationType,
  CourseStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CourseUsage {
  programId: string;
  programCode: string;
  programName: string;
  versionLabel: string | null;
}

// Answers questions about a course whose facts live in other features' tables.
// Each method returns "none" until the table it reads exists:
// F-07 fills programsUsing, F-15 inReleasedVersion, F-17 hasStudyResults. F-05 filled hasActiveReplacement.
@Injectable()
export class CourseUsageReader {
  constructor(private readonly prisma: PrismaService) {}

  async inReleasedVersion(_courseId: string): Promise<boolean> {
    return false;
  }

  async hasStudyResults(_courseId: string): Promise<boolean> {
    return false;
  }

  async programsUsing(_courseId: string): Promise<CourseUsage[]> {
    return [];
  }

  // A REPLACEMENT relation from this course to an ACTIVE course (HP-02).
  // `client` lets the caller read inside its own transaction and see rows it has just written.
  async hasActiveReplacement(
    courseId: string,
    client: Pick<Prisma.TransactionClient, 'courseRelation'> = this.prisma,
  ): Promise<boolean> {
    const found = await client.courseRelation.findFirst({
      where: {
        sourceCourseId: courseId,
        relationType: CourseRelationType.REPLACEMENT,
        targetCourse: { status: CourseStatus.ACTIVE },
      },
      select: { id: true },
    });
    return found !== null;
  }
}
