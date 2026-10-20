import { Injectable } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { OutcomeGapsReader } from '../../shared/outcomes/outcome-gaps.reader.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { programTarget } from '../../shared/programs/program-target.js';
import {
  toCloGapDto,
  toCourseGapDto,
  type OutcomeCoverageDto,
} from './outcome-coverage.dto.js';
import {
  assertMatrixReader,
  assertVersionFound,
  OUTCOME_VERSION_SELECT,
  type OutcomeVersionRow,
} from './outcome-access.js';
import { toOutcomeVersionDto } from './outcome-version.dto.js';

// MH-35: gaps are computed on read and never block a write (US-047 AC4).
@Injectable()
export class OutcomeCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gaps: OutcomeGapsReader,
  ) {}

  async read(
    versionId: string,
    access: AccessContext,
  ): Promise<OutcomeCoverageDto> {
    const version = await this.prisma.programVersion.findUnique({
      where: { id: versionId },
      select: OUTCOME_VERSION_SELECT,
    });
    assertVersionFound(version);
    access.assertCan(PERMISSIONS.OUTCOME_VIEW, programTarget(version.program));
    assertMatrixReader(access);
    const gaps = await this.gaps.forVersion(versionId);
    const groups = courseGroupFilter(access, version);
    const visible = <T extends { ownerGroupId: string | null }>(rows: T[]) =>
      groups
        ? rows.filter(
            (row) => row.ownerGroupId !== null && groups.has(row.ownerGroupId),
          )
        : rows;
    return {
      version: toOutcomeVersionDto(version),
      plosWithoutCourse: gaps.plosWithoutCourse,
      closWithoutPlo: visible(gaps.closWithoutPlo).map(toCloGapDto),
      coursesWithoutPlo: visible(gaps.coursesWithoutPlo).map(toCourseGapDto),
      coursesWithoutSyllabus: visible(gaps.coursesWithoutSyllabus).length,
      filteredToGroups: groups !== null,
    };
  }
}

// Subject-group heads and members see the courses they can act on; whoever edits outcomes program-wide,
// or does not edit CLOs at all, sees every course (US-047 AC5).
export function courseGroupFilter(
  access: AccessContext,
  version: Pick<OutcomeVersionRow, 'programId'>,
): ReadonlySet<string> | null {
  if (!access.has(PERMISSIONS.CLO_EDIT)) {
    return null;
  }
  const scope = access.scopeFor(PERMISSIONS.CLO_EDIT);
  if (scope.all || scope.programIds.has(version.programId)) {
    return null;
  }
  return scope.subjectGroupIds;
}
