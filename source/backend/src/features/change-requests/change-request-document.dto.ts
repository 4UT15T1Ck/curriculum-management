import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ChangeDocumentType } from '../../generated/prisma/client.js';

// Multipart: the file travels as `file`, the type beside it.
export class UploadChangeRequestDocumentDto {
  @ApiProperty({ enum: ChangeDocumentType, enumName: 'ChangeDocumentType' })
  @IsEnum(ChangeDocumentType)
  documentType!: ChangeDocumentType;
}

export class UploadDocumentFormDto extends UploadChangeRequestDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' }) file!: unknown;
}
