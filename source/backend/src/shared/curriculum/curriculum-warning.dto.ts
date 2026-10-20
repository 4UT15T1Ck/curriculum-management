import { ApiProperty } from '@nestjs/swagger';
import {
  CURRICULUM_WARNING,
  WARNING_SEVERITY,
  type CurriculumWarning,
} from './curriculum-warnings.js';

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
  @ApiProperty({ nullable: true, type: String }) groupId!: string | null;
}
