import { ApiProperty } from '@nestjs/swagger';
import { ProgramVersionStatus } from '../../generated/prisma/client.js';
import type {
  CheckedVersion,
  ConsistencyResult,
  CreditAcceptance,
  GroupRequirement,
} from '../../shared/curriculum/consistency-checker.js';
import {
  CreditBreakdownDto,
  toCreditBreakdownDto,
} from '../../shared/curriculum/credit-breakdown.dto.js';
import {
  CURRICULUM_WARNING,
  WARNING_SEVERITY,
  type CurriculumWarning,
} from '../../shared/curriculum/curriculum-warnings.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';

export class ConsistencyVersionDto {
  @ApiProperty() id!: string;
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty({ nullable: true, type: String }) versionNumber!: string | null;
  @ApiProperty({ enum: ProgramVersionStatus, enumName: 'ProgramVersionStatus' })
  status!: ProgramVersionStatus;
}

export class CreditAcceptedByDto {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
}

export class CreditAcceptanceDto {
  @ApiProperty() reason!: string;
  @ApiProperty({ example: '-2' }) compulsoryGap!: string;
  @ApiProperty({ example: '0' }) electiveGap!: string;
  @ApiProperty({ type: CreditAcceptedByDto }) acceptedBy!: CreditAcceptedByDto;
  @ApiProperty() acceptedAt!: string;
}

export class CreditCheckDto {
  @ApiProperty({ type: CreditBreakdownDto }) declared!: CreditBreakdownDto;
  @ApiProperty({ type: CreditBreakdownDto }) computed!: CreditBreakdownDto;
  @ApiProperty({
    type: CreditBreakdownDto,
    description: 'Tính từ khung trừ khai báo; có thể âm.',
  })
  gap!: CreditBreakdownDto;
  @ApiProperty() mismatch!: boolean;
  @ApiProperty({ type: CreditAcceptanceDto, nullable: true })
  acceptance!: CreditAcceptanceDto | null;
  @ApiProperty() acceptanceCurrent!: boolean;
}

export class GroupRequirementDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
  @ApiProperty() groupName!: string;
  @ApiProperty({ nullable: true, type: String }) minCredits!: string | null;
  @ApiProperty({ nullable: true, type: Number }) minCourses!: number | null;
  @ApiProperty({ example: '6', description: 'Phần nhóm cộng vào tổng.' })
  requiredCredits!: string;
  @ApiProperty({ example: '15' }) listedCredits!: string;
  @ApiProperty() itemCount!: number;
}

export class ConsistencyIssueDto {
  @ApiProperty({
    enum: Object.values(CURRICULUM_WARNING),
    enumName: 'CurriculumWarningCode',
  })
  code!: CurriculumWarning['code'];
  @ApiProperty({
    enum: Object.values(WARNING_SEVERITY),
    enumName: 'WarningSeverity',
  })
  severity!: CurriculumWarning['severity'];
  @ApiProperty() message!: string;
  @ApiProperty({ nullable: true, type: Number }) semester!: number | null;
  @ApiProperty({ nullable: true, type: String }) itemId!: string | null;
  @ApiProperty({ nullable: true, type: String }) groupId!: string | null;
}

export class ConsistencyReportDto {
  @ApiProperty({ type: ConsistencyVersionDto })
  version!: ConsistencyVersionDto;
  @ApiProperty() checkedAt!: string;
  @ApiProperty({ type: CreditCheckDto }) credits!: CreditCheckDto;
  @ApiProperty({ type: [GroupRequirementDto] })
  groups!: GroupRequirementDto[];
  @ApiProperty({ type: [ConsistencyIssueDto] })
  issues!: ConsistencyIssueDto[];
  @ApiProperty() errorCount!: number;
  @ApiProperty() warningCount!: number;
  @ApiProperty({ description: 'errorCount === 0: what assertPasses decides.' })
  passes!: boolean;
  @ApiProperty() canAcceptMismatch!: boolean;
}

function toVersionDto(version: CheckedVersion): ConsistencyVersionDto {
  return {
    id: version.id,
    programId: version.programId,
    programCode: version.program.programCode,
    programName: version.programName,
    versionNumber: version.versionNumber,
    status: version.status,
  };
}

function toAcceptanceDto(acceptance: CreditAcceptance): CreditAcceptanceDto {
  return {
    reason: acceptance.reason,
    compulsoryGap: toWireDecimal(acceptance.compulsoryGap),
    electiveGap: toWireDecimal(acceptance.electiveGap),
    acceptedBy: acceptance.acceptedBy,
    acceptedAt: acceptance.acceptedAt.toISOString(),
  };
}

function toGroupDto(group: GroupRequirement): GroupRequirementDto {
  return {
    id: group.id,
    groupCode: group.groupCode,
    groupName: group.groupName,
    minCredits:
      group.minCredits === null ? null : toWireDecimal(group.minCredits),
    minCourses: group.minCourses,
    requiredCredits: toWireDecimal(group.requiredCredits),
    listedCredits: toWireDecimal(group.listedCredits),
    itemCount: group.itemCount,
  };
}

export function toConsistencyReportDto(
  result: ConsistencyResult,
  checkedAt: Date,
  canAcceptMismatch: boolean,
): ConsistencyReportDto {
  const { credits } = result;
  const errorCount = result.issues.filter(
    (issue) => issue.severity === WARNING_SEVERITY.ERROR,
  ).length;
  return {
    version: toVersionDto(result.version),
    checkedAt: checkedAt.toISOString(),
    credits: {
      declared: toCreditBreakdownDto(credits.declared),
      computed: toCreditBreakdownDto(credits.computed),
      gap: toCreditBreakdownDto(credits.gap),
      mismatch: credits.mismatch,
      acceptance: credits.acceptance && toAcceptanceDto(credits.acceptance),
      acceptanceCurrent: credits.acceptanceCurrent,
    },
    groups: result.groups.map(toGroupDto),
    issues: result.issues,
    errorCount,
    warningCount: result.issues.length - errorCount,
    passes: errorCount === 0,
    canAcceptMismatch,
  };
}
