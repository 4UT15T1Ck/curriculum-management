import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { Injectable, Logger } from '@nestjs/common';
import {
  ChangeRequestStatus,
  type AttachmentFileType,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { REQUEST_DRAFT_ERRORS } from '../../shared/change-requests/change-request.errors.js';
import { AppException } from '../../shared/exception/app.exception.js';
import {
  detectAttachmentType,
  mimeForPath,
} from '../../shared/files/attachment-types.js';
import { FileStorageService } from '../../shared/files/file-storage.service.js';
import { uploadedFileName } from '../../shared/files/uploaded-file-name.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { DOCUMENT_ERRORS } from './change-request-feature.errors.js';
import {
  CHANGE_REQUEST_LIMITS,
  DOCUMENT_DIR,
  UPLOAD_STATUSES,
} from './change-request.constants.js';
import { DOCUMENT_INCLUDE, toDocumentDto } from './change-request.mapper.js';
import type { UploadChangeRequestDocumentDto } from './change-request-document.dto.js';
import type { ChangeRequestDocumentDto } from './change-request-response.dto.js';
import { findVisibleRequest } from './request-visibility.js';

// Scanned supporting documents of a request (US-056). Files are written first and removed last: a failure leaves at
// worst an unreferenced file, never a row that points at nothing (the same order as syllabus attachments).
@Injectable()
export class ChangeRequestDocumentsService {
  private readonly logger = new Logger(ChangeRequestDocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FileStorageService,
  ) {}

  async upload(
    requestId: string,
    dto: UploadChangeRequestDocumentDto,
    file: Express.Multer.File | undefined,
    access: AccessContext,
  ): Promise<ChangeRequestDocumentDto> {
    const request = await findVisibleRequest(this.prisma, requestId, access);
    if (request.createdById !== access.userId) {
      throw new AppException(REQUEST_DRAFT_ERRORS.NOT_CREATOR);
    }
    if (!UPLOAD_STATUSES.includes(request.status)) {
      throw new AppException(DOCUMENT_ERRORS.REQUEST_CLOSED);
    }
    if (!file) {
      throw new AppException(DOCUMENT_ERRORS.ATTACHMENT_FILE_REQUIRED);
    }
    const fileName = uploadedFileName(file.originalname);
    const content = new Uint8Array(file.buffer);
    const spec = detectAttachmentType(fileName, content);
    if (!spec) {
      throw new AppException(DOCUMENT_ERRORS.ATTACHMENT_TYPE_NOT_ALLOWED);
    }
    const held = await this.prisma.changeRequestDocument.count({
      where: { changeRequestId: requestId },
    });
    if (held >= CHANGE_REQUEST_LIMITS.DOCUMENTS_MAX) {
      throw new AppException(DOCUMENT_ERRORS.DOCUMENTS_LIMIT);
    }
    const filePath = path.posix.join(
      DOCUMENT_DIR,
      requestId,
      `${randomUUID()}${spec.extension}`,
    );
    await this.files.write(filePath, content);
    try {
      const row = await this.prisma.changeRequestDocument.create({
        data: {
          changeRequestId: requestId,
          documentType: dto.documentType,
          fileName,
          fileType: spec.type as AttachmentFileType,
          filePath,
          sizeBytes: content.byteLength,
          uploadedById: access.userId,
          // Uploaded while pending: the approvers of this round already see it.
          seenInRound:
            request.status === ChangeRequestStatus.DRAFT
              ? null
              : request.submissionRound,
        },
        include: DOCUMENT_INCLUDE,
      });
      this.logger.log(
        `Document ${row.id} added to change request ${requestId} by ${access.userId}`,
      );
      return toDocumentDto(row, request.status === ChangeRequestStatus.DRAFT);
    } catch (error) {
      await this.files.remove(filePath);
      throw error;
    }
  }

  async open(
    documentId: string,
    access: AccessContext,
  ): Promise<{ stream: Readable; fileName: string; mime: string }> {
    const row = await this.prisma.changeRequestDocument.findUnique({
      where: { id: documentId },
      select: { changeRequestId: true, filePath: true, fileName: true },
    });
    if (!row) {
      throw new AppException(DOCUMENT_ERRORS.DOCUMENT_NOT_FOUND);
    }
    await findVisibleRequest(this.prisma, row.changeRequestId, access);
    const { stream } = await this.files.open(row.filePath);
    return {
      stream,
      fileName: row.fileName,
      mime: mimeForPath(row.filePath),
    };
  }

  async remove(documentId: string, access: AccessContext): Promise<void> {
    const row = await this.prisma.changeRequestDocument.findUnique({
      where: { id: documentId },
      select: { id: true, changeRequestId: true, filePath: true },
    });
    if (!row) {
      throw new AppException(DOCUMENT_ERRORS.DOCUMENT_NOT_FOUND);
    }
    const request = await findVisibleRequest(
      this.prisma,
      row.changeRequestId,
      access,
    );
    if (request.createdById !== access.userId) {
      throw new AppException(REQUEST_DRAFT_ERRORS.NOT_CREATOR);
    }
    // The lock is the conditional delete: a submit that stamps seenInRound between the read and the delete wins.
    const { count } = await this.prisma.changeRequestDocument.deleteMany({
      where: {
        id: documentId,
        seenInRound: null,
        changeRequest: { status: ChangeRequestStatus.DRAFT },
      },
    });
    if (count === 0) {
      throw new AppException(DOCUMENT_ERRORS.DOCUMENT_LOCKED);
    }
    await this.files.remove(row.filePath);
    this.logger.log(
      `Document ${documentId} removed from change request ${row.changeRequestId} by ${access.userId}`,
    );
  }
}
