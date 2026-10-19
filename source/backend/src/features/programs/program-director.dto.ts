import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from '../../generated/prisma/client.js';
import { UserRefDto, USER_REF_SELECT } from '../../shared/dtos/ref.dto.js';
import { toIsoDay } from '../../shared/time/today.js';
import {
  VALIDITY_STATES,
  validityState,
  type ValidityState,
} from '../../shared/time/validity.js';

export const DIRECTOR_SELECT = {
  id: true,
  validFrom: true,
  validTo: true,
  revokedAt: true,
  director: { select: USER_REF_SELECT },
  assignedBy: { select: USER_REF_SELECT },
  revokedBy: { select: USER_REF_SELECT },
} as const satisfies Prisma.ProgramDirectorAssignmentSelect;

export type DirectorRow = Prisma.ProgramDirectorAssignmentGetPayload<{
  select: typeof DIRECTOR_SELECT;
}>;

export class ProgramDirectorDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: UserRefDto }) director!: UserRefDto;
  @ApiProperty({ format: 'date' }) validFrom!: string;
  @ApiProperty({ format: 'date', nullable: true, type: String })
  validTo!: string | null;
  @ApiProperty({ enum: VALIDITY_STATES, enumName: 'ValidityState' })
  state!: ValidityState;
  @ApiProperty({ type: UserRefDto, nullable: true })
  assignedBy!: UserRefDto | null;
  @ApiProperty({ nullable: true, type: String }) revokedAt!: string | null;
  @ApiProperty({ type: UserRefDto, nullable: true })
  revokedBy!: UserRefDto | null;
}

export function toProgramDirectorDto(
  row: DirectorRow,
  today: Date,
): ProgramDirectorDto {
  return {
    id: row.id,
    director: row.director,
    validFrom: toIsoDay(row.validFrom),
    validTo: row.validTo ? toIsoDay(row.validTo) : null,
    state: validityState(row, today),
    assignedBy: row.assignedBy,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    revokedBy: row.revokedBy,
  };
}
