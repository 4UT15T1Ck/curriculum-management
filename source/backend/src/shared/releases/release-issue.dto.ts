import { ApiProperty } from '@nestjs/swagger';

export const SYLLABUS_ISSUE_CODE = {
  MISSING_SYLLABUS: 'MISSING_SYLLABUS',
  SYLLABUS_INCOMPLETE: 'SYLLABUS_INCOMPLETE',
} as const;
export type SyllabusIssueCode =
  (typeof SYLLABUS_ISSUE_CODE)[keyof typeof SYLLABUS_ISSUE_CODE];

// What stops a course's syllabus from being published with a version (DC-03), one entry per course.
export class SyllabusReleaseIssueDto {
  @ApiProperty() courseId!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty({
    enum: Object.values(SYLLABUS_ISSUE_CODE),
    enumName: 'SyllabusIssueCode',
  })
  code!: SyllabusIssueCode;
  @ApiProperty({
    type: [String],
    description: 'Điều kiện chưa đạt, theo mã (rỗng khi chưa có đề cương).',
  })
  details!: string[];
}
