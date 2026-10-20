import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SyllabusStatus, type Prisma } from '../../generated/prisma/client.js';
import { OUTCOME_LIMITS } from './outcome.errors.js';
import {
  EditAccessDto,
  OutcomeVersionDto,
  PloHeaderDto,
} from './outcome-version.dto.js';

export class CloPloLinkDto {
  @ApiProperty() @IsString() cloId!: string;
  @ApiProperty() @IsString() ploId!: string;
}

export class ReplaceCloPloLinksDto {
  @ApiProperty({ type: [CloPloLinkDto] })
  @IsArray()
  @ArrayMaxSize(OUTCOME_LIMITS.LINKS_MAX)
  @ValidateNested({ each: true })
  @Type(() => CloPloLinkDto)
  links!: CloPloLinkDto[];
}

export const CLO_REF_SELECT = {
  id: true,
  cloCode: true,
  description: true,
  englishDescription: true,
} as const satisfies Prisma.CLOSelect;

export class CloRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() cloCode!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ nullable: true, type: String }) englishDescription!:
    string | null;
}

export class ItemCloPloRevisionDto {
  @ApiProperty() id!: string;
  @ApiProperty() revisionNumber!: number;
  @ApiProperty({ enum: SyllabusStatus, enumName: 'SyllabusStatus' })
  status!: SyllabusStatus;
}

export class MatrixCourseRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
}

export class ItemRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() plannedSemester!: number;
  @ApiProperty({ type: MatrixCourseRefDto }) course!: MatrixCourseRefDto;
}

export class ItemPloColumnDto extends PloHeaderDto {
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'null = the course does not map this PLO; the column is off',
  })
  weight!: string | null;
}

export class ItemCloPloMatrixDto extends EditAccessDto {
  @ApiProperty({ type: OutcomeVersionDto }) version!: OutcomeVersionDto;
  @ApiProperty({ type: ItemRefDto }) item!: ItemRefDto;
  @ApiProperty({
    type: ItemCloPloRevisionDto,
    nullable: true,
    description: 'null = the course has no syllabus',
  })
  revision!: ItemCloPloRevisionDto | null;
  @ApiProperty({ type: [CloRefDto] }) clos!: CloRefDto[];
  @ApiProperty({ type: [ItemPloColumnDto] }) plos!: ItemPloColumnDto[];
  @ApiProperty({ type: [CloPloLinkDto] }) links!: CloPloLinkDto[];
}

export class ProgramCloPloRowDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() plannedSemester!: number;
  @ApiProperty({ type: MatrixCourseRefDto }) course!: MatrixCourseRefDto;
  @ApiProperty({ nullable: true, type: Number }) revisionNumber!: number | null;
  @ApiProperty({ type: [CloRefDto] }) clos!: CloRefDto[];
  @ApiProperty({ type: [String] }) mappedPloIds!: string[];
  @ApiProperty({ type: [CloPloLinkDto] }) links!: CloPloLinkDto[];
}

export class ProgramCloPloMatrixDto {
  @ApiProperty({ type: OutcomeVersionDto }) version!: OutcomeVersionDto;
  @ApiProperty({ type: [PloHeaderDto] }) plos!: PloHeaderDto[];
  @ApiProperty({ type: [ProgramCloPloRowDto] }) rows!: ProgramCloPloRowDto[];
}
