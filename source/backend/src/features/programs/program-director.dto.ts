import { ApiProperty } from '@nestjs/swagger';
import { UserRefDto } from '../../shared/dtos/ref.dto.js';
import {
  DIRECTOR_SELECT,
  type DirectorRow,
} from '../../shared/programs/director.writer.js';
import { toIsoDay } from '../../shared/time/today.js';
import {
  VALIDITY_STATES,
  validityState,
  type ValidityState,
} from '../../shared/time/validity.js';

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

export { DIRECTOR_SELECT };
