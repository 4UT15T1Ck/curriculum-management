import { ApiProperty } from '@nestjs/swagger';

export const DIFF_CHANGES = {
  ADDED: 'ADDED',
  REMOVED: 'REMOVED',
  CHANGED: 'CHANGED',
} as const;
export type DiffChange = (typeof DIFF_CHANGES)[keyof typeof DIFF_CHANGES];

export class DiffFieldDto {
  @ApiProperty() name!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ nullable: true, type: String }) before!: string | null;
  @ApiProperty({ nullable: true, type: String }) after!: string | null;
}

export class DiffRowDto {
  @ApiProperty() itemKey!: string;
  @ApiProperty() label!: string;
  @ApiProperty({
    enum: Object.values(DIFF_CHANGES),
    enumName: 'DiffChange',
  })
  change!: DiffChange;
  @ApiProperty({ type: [DiffFieldDto] }) fields!: DiffFieldDto[];
}

export class DiffSectionDto {
  @ApiProperty() entityType!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ type: [DiffRowDto] }) rows!: DiffRowDto[];
}

export class ChangeDiffDto {
  @ApiProperty({
    description:
      'True while a Draft: computed from the working copy at read time',
  })
  live!: boolean;
  @ApiProperty({ type: [DiffSectionDto] }) sections!: DiffSectionDto[];
}
