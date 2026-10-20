import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import type { Prisma } from '../../generated/prisma/client.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import {
  EditAccessDto,
  OutcomeVersionDto,
  PloHeaderDto,
} from './outcome-version.dto.js';

// (0, 1] with at most two decimals: 0.01 ... 0.99, 1, 1.0, 1.00.
export const WEIGHT_PATTERN = /^(?:0\.(?:0[1-9]|[1-9]\d?)|1(?:\.00?)?)$/;
export const WEIGHT_MESSAGE =
  'Trọng số phải lớn hơn 0, không quá 1 và có tối đa hai chữ số thập phân.';

export class SetPloWeightDto {
  @ApiProperty({ example: '0.5' })
  @IsString()
  @Matches(WEIGHT_PATTERN, { message: WEIGHT_MESSAGE })
  weight!: string;
}

export class CoursePloCellDto {
  @ApiProperty() ploId!: string;
  @ApiProperty({ example: '0.5' }) weight!: string;
  @ApiProperty({ description: 'CLO links that go with the cell if cleared' })
  cloLinkCount!: number;
}

export class CoursePloCourseDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty({ example: '3' }) credits!: string;
}

export class CoursePloRowDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() plannedSemester!: number;
  @ApiProperty({ type: CoursePloCourseDto }) course!: CoursePloCourseDto;
  @ApiProperty({ type: [CoursePloCellDto], description: 'Mapped PLOs only' })
  cells!: CoursePloCellDto[];
}

export class CoursePloMatrixDto extends EditAccessDto {
  @ApiProperty({ type: OutcomeVersionDto }) version!: OutcomeVersionDto;
  @ApiProperty({ type: [PloHeaderDto] }) plos!: PloHeaderDto[];
  @ApiProperty({ type: [CoursePloRowDto] }) rows!: CoursePloRowDto[];
}

export function toCellDto(
  cell: { ploId: string; weight: Prisma.Decimal },
  cloLinkCount: number,
): CoursePloCellDto {
  return {
    ploId: cell.ploId,
    weight: toWireDecimal(cell.weight),
    cloLinkCount,
  };
}
