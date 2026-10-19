import { ApiProperty } from '@nestjs/swagger';
import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { EDIT_PATHS, type EditPath } from '../../shared/authz/edit-path.js';
import {
  RELATED_COURSE_SELECT,
  RelatedCourseDto,
  toRelatedCourseDto,
} from '../../shared/courses/related-course.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import {
  CURRICULUM_WARNING,
  WARNING_SEVERITY,
  type CurriculumWarning,
} from '../../shared/curriculum/curriculum-warnings.js';
import { ElectiveGroupDto } from './elective-group.dto.js';
import {
  CURRICULUM_REQUISITE_TYPES,
  type CurriculumRequisiteType,
} from './replace-requisites.dto.js';
import type { VersionRow } from './curriculum-access.js';

export class CurriculumVersionDto {
  @ApiProperty() id!: string;
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty({ nullable: true, type: String }) versionNumber!: string | null;
  @ApiProperty({ enum: ProgramVersionStatus, enumName: 'ProgramVersionStatus' })
  status!: ProgramVersionStatus;
  @ApiProperty() semesterCount!: number;
}

export class CurriculumRequisiteDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: RelatedCourseDto }) sourceCourse!: RelatedCourseDto;
  @ApiProperty({
    enum: CURRICULUM_REQUISITE_TYPES,
    enumName: 'CurriculumRequisiteType',
  })
  relationType!: CurriculumRequisiteType;
  @ApiProperty({ nullable: true, type: String, example: '2' })
  minScore!: string | null;
  @ApiProperty({
    nullable: true,
    type: Number,
    description:
      'Học kỳ mà học phần điều kiện đang xếp trong khung này; null khi nó không có trong khung.',
  })
  sourceSemester!: number | null;
}

export class CurriculumElectiveGroupRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() groupCode!: string;
}

export class CurriculumItemDto {
  @ApiProperty() id!: string;
  @ApiProperty({ description: 'TT: vị trí 1-based theo (học kỳ, thứ tự).' })
  displayOrder!: number;
  @ApiProperty() plannedSemester!: number;
  @ApiProperty() sortOrder!: number;
  @ApiProperty({ type: RelatedCourseDto }) course!: RelatedCourseDto;
  @ApiProperty({ nullable: true, type: String }) blockSymbol!: string | null;
  @ApiProperty({ nullable: true, type: String }) blockName!: string | null;
  @ApiProperty() isElective!: boolean;
  @ApiProperty({ type: CurriculumElectiveGroupRefDto, nullable: true })
  electiveGroup!: CurriculumElectiveGroupRefDto | null;
  @ApiProperty() htDa!: boolean;
  @ApiProperty() tqDa!: boolean;
  @ApiProperty({ nullable: true, type: String, example: '2' })
  minStudiedScore!: string | null;
  @ApiProperty({ nullable: true, type: String, example: '2' })
  minTransferScore!: string | null;
  @ApiProperty({ nullable: true, type: String }) note!: string | null;
  @ApiProperty({ type: [CurriculumRequisiteDto] })
  requisites!: CurriculumRequisiteDto[];
  @ApiProperty() canEdit!: boolean;
}

export class SemesterTotalDto {
  @ApiProperty() semester!: number;
  @ApiProperty({ example: '17' }) totalCredits!: string;
  @ApiProperty({ example: '15' }) compulsoryCredits!: string;
  @ApiProperty({ example: '2' }) electiveCredits!: string;
  @ApiProperty() itemCount!: number;
}

export class BlockTotalDto {
  @ApiProperty({ nullable: true, type: String }) symbol!: string | null;
  @ApiProperty({ nullable: true, type: String }) blockName!: string | null;
  @ApiProperty({ example: '30' }) totalCredits!: string;
  @ApiProperty() itemCount!: number;
}

export class KnowledgeBlockDto {
  @ApiProperty() blockCode!: string;
  @ApiProperty() blockName!: string;
  @ApiProperty({ nullable: true, type: String, example: '40' })
  requiredCredits!: string | null;
}

export class CurriculumWarningDto {
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
}

export class CurriculumDto {
  @ApiProperty({ type: CurriculumVersionDto }) version!: CurriculumVersionDto;
  @ApiProperty({ enum: EDIT_PATHS, enumName: 'EditPath', nullable: true })
  editPath!: EditPath | null;
  @ApiProperty() canEditStructure!: boolean;
  @ApiProperty() canAddItems!: boolean;
  @ApiProperty({ type: [CurriculumItemDto] }) items!: CurriculumItemDto[];
  @ApiProperty({ type: [SemesterTotalDto] }) semesters!: SemesterTotalDto[];
  @ApiProperty({ type: [BlockTotalDto] }) blocks!: BlockTotalDto[];
  @ApiProperty({ type: [KnowledgeBlockDto] })
  knowledgeBlocks!: KnowledgeBlockDto[];
  @ApiProperty({ type: [ElectiveGroupDto] })
  electiveGroups!: ElectiveGroupDto[];
  @ApiProperty({ type: [CurriculumWarningDto] })
  warnings!: CurriculumWarningDto[];
}

export const ITEM_INCLUDE = {
  course: { select: { ...RELATED_COURSE_SELECT, ownerGroupId: true } },
  electiveGroup: { select: { id: true, groupCode: true } },
  requisites: {
    include: { sourceCourse: { select: RELATED_COURSE_SELECT } },
    orderBy: [
      { relationType: 'asc' },
      { sourceCourse: { courseCode: 'asc' } },
      { id: 'asc' },
    ],
  },
} as const satisfies Prisma.CurriculumItemInclude;
export type ItemRow = Prisma.CurriculumItemGetPayload<{
  include: typeof ITEM_INCLUDE;
}>;

// The id breaks ties between rows that share an order (two concurrent adds to one semester).
export const ITEM_ORDER = [
  { plannedSemester: 'asc' },
  { sortOrder: 'asc' },
  { id: 'asc' },
] as const satisfies Prisma.CurriculumItemOrderByWithRelationInput[];

export interface ItemContext {
  displayOrder: number;
  semesterOfCourse: ReadonlyMap<string, number>;
  blockNames: ReadonlyMap<string, string>;
  canEdit: boolean;
}

export function toCurriculumItemDto(
  row: ItemRow,
  context: ItemContext,
): CurriculumItemDto {
  return {
    id: row.id,
    displayOrder: context.displayOrder,
    plannedSemester: row.plannedSemester,
    sortOrder: row.sortOrder,
    course: toRelatedCourseDto(row.course),
    blockSymbol: row.blockSymbol,
    blockName: row.blockSymbol
      ? (context.blockNames.get(row.blockSymbol) ?? null)
      : null,
    isElective: row.isElective,
    electiveGroup: row.electiveGroup,
    htDa: row.htDa,
    tqDa: row.tqDa,
    minStudiedScore:
      row.minStudiedScore === null ? null : toWireDecimal(row.minStudiedScore),
    minTransferScore:
      row.minTransferScore === null
        ? null
        : toWireDecimal(row.minTransferScore),
    note: row.note,
    requisites: row.requisites.map((requisite) => ({
      id: requisite.id,
      sourceCourse: toRelatedCourseDto(requisite.sourceCourse),
      relationType: requisite.relationType as CurriculumRequisiteType,
      minScore:
        requisite.minScore === null ? null : toWireDecimal(requisite.minScore),
      sourceSemester:
        context.semesterOfCourse.get(requisite.sourceCourseId) ?? null,
    })),
    canEdit: context.canEdit,
  };
}

export function toCurriculumVersionDto(
  version: VersionRow,
): CurriculumVersionDto {
  return {
    id: version.id,
    programId: version.programId,
    programCode: version.program.programCode,
    programName: version.programName,
    versionNumber: version.versionNumber,
    status: version.status,
    semesterCount: version.semesterCount,
  };
}

export function toKnowledgeBlockDto(block: {
  blockCode: string;
  blockName: string;
  requiredCredits: Prisma.Decimal | null;
}): KnowledgeBlockDto {
  return {
    blockCode: block.blockCode,
    blockName: block.blockName,
    requiredCredits:
      block.requiredCredits === null
        ? null
        : toWireDecimal(block.requiredCredits),
  };
}
