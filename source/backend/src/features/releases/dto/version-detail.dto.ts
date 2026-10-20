import { ApiProperty } from '@nestjs/swagger';
import {
  ProgramVersionStatus,
  SyllabusStatus,
} from '../../../generated/prisma/client.js';
import { UserRefDto } from '../../../shared/dtos/ref.dto.js';
import {
  CohortDto,
  SemesterDto,
} from '../../../shared/releases/semester.dto.js';

export class VersionLinkDto {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true, type: String }) versionNumber!: string | null;
}

export class VersionOriginRequestDto {
  @ApiProperty() id!: string;
  @ApiProperty() requestCode!: string;
}

// One line of MH-46.
export class VersionRefDto {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true, type: String }) versionNumber!: string | null;
  @ApiProperty({ enum: ProgramVersionStatus, enumName: 'ProgramVersionStatus' })
  status!: ProgramVersionStatus;
  @ApiProperty({ nullable: true, type: String }) decisionNumber!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'date' })
  signedDate!: string | null;
  @ApiProperty({ nullable: true, type: String }) publishedAt!: string | null;
  @ApiProperty({ type: SemesterDto, nullable: true })
  effectiveSemester!: SemesterDto | null;
  @ApiProperty({ type: [CohortDto] }) cohorts!: CohortDto[];
  @ApiProperty({ type: VersionOriginRequestDto, nullable: true })
  originRequest!: VersionOriginRequestDto | null;
  @ApiProperty({
    type: VersionLinkDto,
    nullable: true,
    description: 'Phiên bản đính chính đã ban hành thay cho phiên bản này.',
  })
  correctedBy!: VersionLinkDto | null;
}

export class VersionListDto {
  @ApiProperty({ type: [VersionRefDto] }) versions!: VersionRefDto[];
}

export class SyllabusPinDto {
  @ApiProperty() id!: string;
  @ApiProperty() revisionNumber!: number;
  @ApiProperty({ enum: SyllabusStatus, enumName: 'SyllabusStatus' })
  status!: SyllabusStatus;
}

// A curriculum row as the version froze it: the name and credits it was released with and the revision it pins.
export class VersionRowDto {
  @ApiProperty() itemId!: string;
  @ApiProperty() plannedSemester!: number;
  @ApiProperty() courseId!: string;
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty({ example: '3' }) credits!: string;
  @ApiProperty({ type: SyllabusPinDto, nullable: true })
  syllabus!: SyllabusPinDto | null;
}

export class VersionDetailDto extends VersionRefDto {
  @ApiProperty() programId!: string;
  @ApiProperty() programCode!: string;
  @ApiProperty() programName!: string;
  @ApiProperty() majorCode!: string;
  @ApiProperty() majorName!: string;
  @ApiProperty() semesterCount!: number;
  @ApiProperty({ example: '150' }) totalCredits!: string;
  @ApiProperty({ example: '120' }) compulsoryCredits!: string;
  @ApiProperty({ example: '30' }) electiveCredits!: string;
  @ApiProperty({ type: UserRefDto, nullable: true })
  publishedBy!: UserRefDto | null;
  @ApiProperty({ type: VersionLinkDto, nullable: true })
  previousVersion!: VersionLinkDto | null;
  @ApiProperty({ type: VersionLinkDto, nullable: true })
  correctionOf!: VersionLinkDto | null;
  @ApiProperty({ nullable: true, type: String }) correctionReason!:
    string | null;
  @ApiProperty({ description: 'Bản nháp đính chính chưa ban hành.' })
  isCorrectionDraft!: boolean;
  @ApiProperty({
    type: VersionLinkDto,
    nullable: true,
    description:
      'Bản nháp đính chính đang mở của phiên bản này (chỉ người có quyền đính chính thấy).',
  })
  openCorrection!: VersionLinkDto | null;
  @ApiProperty({
    description: 'Người xem được phép bắt đầu đính chính phiên bản này.',
  })
  canCorrect!: boolean;
  @ApiProperty({ type: [VersionRowDto] }) rows!: VersionRowDto[];
}
