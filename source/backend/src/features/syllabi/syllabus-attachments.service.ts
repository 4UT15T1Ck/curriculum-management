import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { Injectable, Logger } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { AppException } from '../../shared/exception/app.exception.js';
import {
  detectAttachmentType,
  mimeForPath,
} from '../../shared/files/attachment-types.js';
import { FileStorageService } from '../../shared/files/file-storage.service.js';
import { uploadedFileName } from '../../shared/files/uploaded-file-name.js';
import { USER_REF_SELECT } from '../../shared/dtos/ref.dto.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  assertDraftWrite,
  assertRevisionVisible,
  SYLLABUS_ACCESS_SELECT,
} from './syllabus-access.js';
import {
  toAttachmentDto,
  type SyllabusAttachmentDto,
} from './syllabus-attachment.dto.js';
import { SYLLABUS_ERRORS, SYLLABUS_LIMITS } from './syllabus.errors.js';

const SYLLABUS_FILES_DIR = 'syllabi';

// Files are written first and removed last: a failure leaves at worst an unreferenced file,
// never a row that points at nothing.
@Injectable()
export class SyllabusAttachmentsService {
  private readonly logger = new Logger(SyllabusAttachmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FileStorageService,
  ) {}

  async upload(
    syllabusId: string,
    file: Express.Multer.File | undefined,
    access: AccessContext,
  ): Promise<SyllabusAttachmentDto> {
    const revision = await assertDraftWrite(
      this.prisma,
      access,
      await this.prisma.syllabus.findUnique({
        where: { id: syllabusId },
        select: SYLLABUS_ACCESS_SELECT,
      }),
    );
    if (!file) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_FILE_REQUIRED);
    }
    const fileName = uploadedFileName(file.originalname);
    const content = new Uint8Array(file.buffer);
    const spec = detectAttachmentType(fileName, content);
    if (!spec) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_TYPE_NOT_ALLOWED);
    }
    const held = await this.prisma.syllabusAttachment.count({
      where: { syllabusId },
    });
    if (held >= SYLLABUS_LIMITS.ATTACHMENTS_MAX) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_LIMIT_REACHED);
    }
    const filePath = path.posix.join(
      SYLLABUS_FILES_DIR,
      revision.id,
      `${randomUUID()}${spec.extension}`,
    );
    await this.files.write(filePath, content);
    try {
      const row = await this.prisma.syllabusAttachment.create({
        data: {
          syllabusId,
          fileName,
          fileType: spec.type,
          filePath,
          sizeBytes: content.byteLength,
          uploadedById: access.userId,
        },
        include: { uploadedBy: { select: USER_REF_SELECT } },
      });
      return toAttachmentDto(row, true);
    } catch (error) {
      await this.files.remove(filePath);
      throw error;
    }
  }

  async open(
    attachmentId: string,
    access: AccessContext,
  ): Promise<{ stream: Readable; fileName: string; mime: string }> {
    const row = await this.prisma.syllabusAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        fileName: true,
        filePath: true,
        syllabus: { select: SYLLABUS_ACCESS_SELECT },
      },
    });
    if (!row) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_NOT_FOUND);
    }
    assertRevisionVisible(row.syllabus, access);
    const { stream } = await this.files.open(row.filePath);
    return {
      stream,
      fileName: row.fileName,
      mime: mimeForPath(row.filePath),
    };
  }

  // The uploader check comes after the draft/direct-edit checks, so a request holder on a
  // released syllabus is told to file a change request, not "not the uploader".
  async remove(attachmentId: string, access: AccessContext): Promise<void> {
    const row = await this.prisma.syllabusAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        filePath: true,
        uploadedById: true,
        syllabus: { select: SYLLABUS_ACCESS_SELECT },
      },
    });
    if (!row) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_NOT_FOUND);
    }
    await assertDraftWrite(this.prisma, access, row.syllabus);
    if (row.uploadedById !== access.userId) {
      throw new AppException(SYLLABUS_ERRORS.ATTACHMENT_NOT_UPLOADER);
    }
    await this.prisma.syllabusAttachment.delete({ where: { id: row.id } });
    await this.files
      .remove(row.filePath)
      .catch((error: unknown) =>
        this.logger.warn(
          `Orphan file left: ${row.filePath} (${String(error)})`,
        ),
      );
  }
}
