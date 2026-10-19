import { Injectable } from '@nestjs/common';

export interface CourseUsage {
  programId: string;
  programCode: string;
  programName: string;
  versionLabel: string | null;
}

// Answers questions about a course whose facts live in other features' tables.
// Each method returns "none" until the table it reads exists:
// F-05 fills hasActiveReplacement, F-07 programsUsing, F-15 inReleasedVersion, F-17 hasStudyResults.
@Injectable()
export class CourseUsageReader {
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
  async hasActiveReplacement(_courseId: string): Promise<boolean> {
    return false;
  }
}
