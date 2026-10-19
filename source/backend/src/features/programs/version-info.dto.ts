import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';
import { DegreeLevel, type Prisma } from '../../generated/prisma/client.js';
import { RequestRefDto } from '../../shared/change-requests/request-ref.dto.js';
import {
  REQUEST_DRAFT_SELECT,
  toRequestRef,
} from '../../shared/change-requests/request-draft.js';
import {
  ProgramVersionInfoDto,
  toVersionInfo,
  VERSION_INFO_SELECT,
} from './program.dto.js';
import { UpdateProgramDto } from './update-program.dto.js';

// The version fields of UpdateProgramDto: degreeLevel lives on the program, not on a version (D15).
export class UpdateVersionInfoDto extends PickType(UpdateProgramDto, [
  'programName',
  'majorCode',
  'majorName',
  'semesterCount',
  'totalCredits',
  'compulsoryCredits',
  'electiveCredits',
] as const) {}

export class VersionInfoProgramDto {
  @ApiProperty() id!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty({ enum: DegreeLevel, enumName: 'DegreeLevel' })
  degreeLevel!: DegreeLevel;
}

export class VersionInfoEditDto extends ProgramVersionInfoDto {
  @ApiProperty({ type: VersionInfoProgramDto }) program!: VersionInfoProgramDto;
  @ApiProperty({ type: RequestRefDto, nullable: true })
  sourceRequest!: RequestRefDto | null;
  @ApiProperty() canEdit!: boolean;
}

export const VERSION_INFO_ROW_SELECT = {
  ...VERSION_INFO_SELECT,
  programId: true,
  program: {
    select: { id: true, facultyId: true, programCode: true, degreeLevel: true },
  },
  ...REQUEST_DRAFT_SELECT,
} as const satisfies Prisma.ProgramVersionSelect;
export type VersionInfoRowWithProgram = Prisma.ProgramVersionGetPayload<{
  select: typeof VERSION_INFO_ROW_SELECT;
}>;

export function toVersionInfoEditDto(
  row: VersionInfoRowWithProgram,
  canEdit: boolean,
): VersionInfoEditDto {
  return Object.assign(toVersionInfo(row), {
    program: {
      id: row.program.id,
      programCode: row.program.programCode,
      degreeLevel: row.program.degreeLevel,
    },
    sourceRequest: toRequestRef(row.sourceRequest),
    canEdit,
  });
}
