import { ApiProperty } from '@nestjs/swagger';
import { AttachmentFileType } from '../../generated/prisma/client.js';
import { UserRefDto } from '../../shared/dtos/ref.dto.js';

export class UploadAttachmentFormDto {
  @ApiProperty({ type: 'string', format: 'binary' }) file!: unknown;
}

export class AttachmentRulesDto {
  @ApiProperty() maxBytes!: number;
  @ApiProperty({
    enum: AttachmentFileType,
    enumName: 'AttachmentFileType',
    isArray: true,
  })
  fileTypes!: AttachmentFileType[];
}

export class SyllabusAttachmentDto {
  @ApiProperty() id!: string;
  @ApiProperty({ description: 'Original name, UTF-8 decoded' })
  fileName!: string;
  @ApiProperty({ enum: AttachmentFileType, enumName: 'AttachmentFileType' })
  fileType!: AttachmentFileType;
  @ApiProperty() sizeBytes!: number;
  @ApiProperty({ type: UserRefDto }) uploadedBy!: UserRefDto;
  @ApiProperty() recordedAt!: string;
  @ApiProperty() canDelete!: boolean;
}

export interface AttachmentRow {
  id: string;
  fileName: string;
  fileType: AttachmentFileType;
  sizeBytes: number;
  recordedAt: Date;
  uploadedBy: { id: string; fullName: string };
}

export function toAttachmentDto(
  row: AttachmentRow,
  canDelete: boolean,
): SyllabusAttachmentDto {
  return {
    id: row.id,
    fileName: row.fileName,
    fileType: row.fileType,
    sizeBytes: row.sizeBytes,
    uploadedBy: row.uploadedBy,
    recordedAt: row.recordedAt.toISOString(),
    canDelete,
  };
}
