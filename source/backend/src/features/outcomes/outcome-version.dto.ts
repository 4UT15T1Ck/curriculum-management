import { ApiProperty } from '@nestjs/swagger';
import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { EDIT_PATHS, type EditPath } from '../../shared/authz/edit-path.js';
import type { OutcomeVersionRow } from './outcome-access.js';

export class OutcomeVersionDto {
  @ApiProperty() id!: string;
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty({ nullable: true, type: String }) versionNumber!: string | null;
  @ApiProperty({ enum: ProgramVersionStatus, enumName: 'ProgramVersionStatus' })
  status!: ProgramVersionStatus;
}

export class PloHeaderDto {
  @ApiProperty() id!: string;
  @ApiProperty() ploCode!: string;
  @ApiProperty() description!: string;
}

// Shared by the matrix and coverage screens: who may edit, and by which path.
export class EditAccessDto {
  @ApiProperty({ enum: EDIT_PATHS, enumName: 'EditPath', nullable: true })
  editPath!: EditPath | null;
  @ApiProperty({ description: 'Draft version and a direct edit path' })
  canEdit!: boolean;
}

export const PLO_HEADER_SELECT = {
  id: true,
  ploCode: true,
  description: true,
} as const satisfies Prisma.PLOSelect;

export const PLO_ORDER = [
  { sortOrder: 'asc' },
  { id: 'asc' },
] as const satisfies Prisma.PLOOrderByWithRelationInput[];

// Same order as the curriculum screen (semester, then the row's place in it).
export const OUTCOME_ITEM_ORDER = [
  { plannedSemester: 'asc' },
  { sortOrder: 'asc' },
  { id: 'asc' },
] as const satisfies Prisma.CurriculumItemOrderByWithRelationInput[];

export function toOutcomeVersionDto(row: OutcomeVersionRow): OutcomeVersionDto {
  return {
    id: row.id,
    programId: row.programId,
    programCode: row.program.programCode,
    programName: row.programName,
    versionNumber: row.versionNumber,
    status: row.status,
  };
}
