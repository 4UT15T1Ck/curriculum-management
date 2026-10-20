/*
  Warnings:

  - A unique constraint covering the columns `[sourceRequestId]` on the table `ProgramVersion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceRequestId]` on the table `Syllabus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChangeRequestType" AS ENUM ('GRADING_FORMULA', 'OUTCOME', 'SYLLABUS_CONTENT', 'CURRICULUM', 'COURSE_RELATION', 'PROGRAM_INFO', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "ChangeTargetType" AS ENUM ('COURSE', 'PROGRAM', 'SUBJECT_GROUP');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('DRAFT', 'PENDING_COORDINATOR', 'PENDING_DIRECTOR', 'PENDING_ACADEMIC_OFFICE', 'APPROVED', 'EFFECTIVE', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RequestOrigin" AS ENUM ('UNIVERSITY', 'FACULTY');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('PENDING', 'APPROVE', 'RETURN', 'REJECT');

-- CreateEnum
CREATE TYPE "ChangeDocumentType" AS ENUM ('SUBMISSION', 'MINUTES', 'COUNCIL_MINUTES', 'REVIEW_MINUTES', 'OFFICIAL_LETTER');

-- AlterTable
ALTER TABLE "ProgramVersion" ADD COLUMN     "baseVersionId" TEXT,
ADD COLUMN     "sourceRequestId" TEXT;

-- AlterTable
ALTER TABLE "Syllabus" ADD COLUMN     "baseRevisionId" TEXT,
ADD COLUMN     "sourceRequestId" TEXT,
ALTER COLUMN "revisionNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "requestType" "ChangeRequestType" NOT NULL,
    "targetType" "ChangeTargetType" NOT NULL,
    "targetCode" TEXT NOT NULL,
    "courseId" TEXT,
    "programId" TEXT,
    "subjectGroupId" TEXT,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "origin" "RequestOrigin" NOT NULL,
    "basisDocumentNumber" TEXT,
    "submissionRound" INTEGER NOT NULL DEFAULT 0,
    "createdByAcademicOffice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeItem" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "recordId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "baseVersion" TEXT,

    CONSTRAINT "ChangeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevelConfig" (
    "id" TEXT NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "levelName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalLevelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalStep" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "submissionRound" INTEGER NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "approverId" TEXT,
    "forSubjectGroupId" TEXT,
    "forProgramId" TEXT,
    "action" "ApprovalAction" NOT NULL DEFAULT 'PENDING',
    "remark" TEXT,
    "recordedAt" TIMESTAMP(3),
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "skipReason" TEXT,
    "performedById" TEXT,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequestDocument" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "documentType" "ChangeDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "AttachmentFileType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "seenInRound" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeRequestDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChangeRequest_requestCode_key" ON "ChangeRequest"("requestCode");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ChangeRequest_createdById_idx" ON "ChangeRequest"("createdById");

-- CreateIndex
CREATE INDEX "ChangeRequest_courseId_idx" ON "ChangeRequest"("courseId");

-- CreateIndex
CREATE INDEX "ChangeRequest_programId_idx" ON "ChangeRequest"("programId");

-- CreateIndex
CREATE INDEX "ChangeRequest_subjectGroupId_idx" ON "ChangeRequest"("subjectGroupId");

-- CreateIndex
CREATE INDEX "ChangeItem_changeRequestId_sortOrder_idx" ON "ChangeItem"("changeRequestId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeItem_changeRequestId_entityType_itemKey_key" ON "ChangeItem"("changeRequestId", "entityType", "itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevelConfig_approvalLevel_key" ON "ApprovalLevelConfig"("approvalLevel");

-- CreateIndex
CREATE INDEX "ApprovalStep_changeRequestId_submissionRound_approvalLevel_idx" ON "ApprovalStep"("changeRequestId", "submissionRound", "approvalLevel");

-- CreateIndex
CREATE INDEX "ApprovalStep_approverId_action_idx" ON "ApprovalStep"("approverId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeRequestDocument_filePath_key" ON "ChangeRequestDocument"("filePath");

-- CreateIndex
CREATE INDEX "ChangeRequestDocument_changeRequestId_createdAt_idx" ON "ChangeRequestDocument"("changeRequestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramVersion_sourceRequestId_key" ON "ProgramVersion"("sourceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_sourceRequestId_key" ON "Syllabus"("sourceRequestId");

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_sourceRequestId_fkey" FOREIGN KEY ("sourceRequestId") REFERENCES "ChangeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_baseVersionId_fkey" FOREIGN KEY ("baseVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_sourceRequestId_fkey" FOREIGN KEY ("sourceRequestId") REFERENCES "ChangeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_baseRevisionId_fkey" FOREIGN KEY ("baseRevisionId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_subjectGroupId_fkey" FOREIGN KEY ("subjectGroupId") REFERENCES "SubjectGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeItem" ADD CONSTRAINT "ChangeItem_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelConfig" ADD CONSTRAINT "ApprovalLevelConfig_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_forSubjectGroupId_fkey" FOREIGN KEY ("forSubjectGroupId") REFERENCES "SubjectGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_forProgramId_fkey" FOREIGN KEY ("forProgramId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequestDocument" ADD CONSTRAINT "ChangeRequestDocument_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequestDocument" ADD CONSTRAINT "ChangeRequestDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Hand-written (not modelled by Prisma): the request code sequence, CHECKs and the copy-aware Draft indexes.
CREATE SEQUENCE "change_request_code_seq";

ALTER TABLE "ChangeRequest"
  ADD CONSTRAINT "ChangeRequest_target_key" CHECK (
    ("targetType" = 'COURSE'        AND "courseId" IS NOT NULL AND "programId" IS NULL AND "subjectGroupId" IS NULL) OR
    ("targetType" = 'PROGRAM'       AND "programId" IS NOT NULL AND "courseId" IS NULL AND "subjectGroupId" IS NULL) OR
    ("targetType" = 'SUBJECT_GROUP' AND "subjectGroupId" IS NOT NULL AND "courseId" IS NULL AND "programId" IS NULL)
  ),
  ADD CONSTRAINT "ChangeRequest_basis_required" CHECK ("origin" <> 'UNIVERSITY' OR "basisDocumentNumber" IS NOT NULL),
  ADD CONSTRAINT "ChangeRequest_round_nonneg" CHECK ("submissionRound" >= 0);

ALTER TABLE "ApprovalStep"
  ADD CONSTRAINT "ApprovalStep_level_range" CHECK ("approvalLevel" BETWEEN 1 AND 3),
  ADD CONSTRAINT "ApprovalStep_skip_reason" CHECK (NOT "isSkipped" OR "skipReason" IS NOT NULL);

ALTER TABLE "ChangeRequestDocument"
  ADD CONSTRAINT "ChangeRequestDocument_size_positive" CHECK ("sizeBytes" > 0);

ALTER TABLE "Syllabus"
  ADD CONSTRAINT "Syllabus_number_unless_copy" CHECK ("revisionNumber" IS NOT NULL OR "sourceRequestId" IS NOT NULL);

-- A request's working copy is not the program's / course's own Draft.
DROP INDEX "ProgramVersion_one_draft";
CREATE UNIQUE INDEX "ProgramVersion_one_draft" ON "ProgramVersion" ("programId") WHERE "status" = 'DRAFT' AND "sourceRequestId" IS NULL;

DROP INDEX "Syllabus_one_draft";
CREATE UNIQUE INDEX "Syllabus_one_draft" ON "Syllabus" ("courseId") WHERE "status" = 'DRAFT' AND "sourceRequestId" IS NULL;
