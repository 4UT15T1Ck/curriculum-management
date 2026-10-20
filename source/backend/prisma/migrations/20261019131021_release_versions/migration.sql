-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REQUEST_EFFECTIVE';

-- AlterTable
ALTER TABLE "ChangeRequest" ADD COLUMN     "decisionNumber" TEXT,
ADD COLUMN     "effectiveSemesterId" TEXT,
ADD COLUMN     "pastSemesterAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signedDate" DATE;

-- AlterTable
ALTER TABLE "CurriculumItem" ADD COLUMN     "courseNameSnapshot" TEXT,
ADD COLUMN     "creditsSnapshot" DECIMAL(5,2),
ADD COLUMN     "syllabusId" TEXT;

-- AlterTable
ALTER TABLE "ProgramVersion" ADD COLUMN     "correctionOfId" TEXT,
ADD COLUMN     "correctionReason" TEXT,
ADD COLUMN     "decisionNumber" TEXT,
ADD COLUMN     "effectiveSemesterId" TEXT,
ADD COLUMN     "originRequestId" TEXT,
ADD COLUMN     "previousVersionId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "publishedById" TEXT,
ADD COLUMN     "signedDate" DATE;

-- AlterTable
ALTER TABLE "Syllabus" ADD COLUMN     "originRequestId" TEXT;

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "semesterCode" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "termInYear" INTEGER NOT NULL,
    "startDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "cohortCode" TEXT NOT NULL,
    "intakeYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortVersion" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "fromSemesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_semesterCode_key" ON "Semester"("semesterCode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_academicYear_termInYear_key" ON "Semester"("academicYear", "termInYear");

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_cohortCode_key" ON "Cohort"("cohortCode");

-- CreateIndex
CREATE INDEX "CohortVersion_programVersionId_idx" ON "CohortVersion"("programVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "CohortVersion_cohortId_programVersionId_key" ON "CohortVersion"("cohortId", "programVersionId");

-- CreateIndex
CREATE INDEX "CurriculumItem_syllabusId_idx" ON "CurriculumItem"("syllabusId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramVersion_correctionOfId_key" ON "ProgramVersion"("correctionOfId");

-- CreateIndex
CREATE INDEX "ProgramVersion_originRequestId_status_idx" ON "ProgramVersion"("originRequestId", "status");

-- CreateIndex
CREATE INDEX "ProgramVersion_status_effectiveSemesterId_createdAt_idx" ON "ProgramVersion"("status", "effectiveSemesterId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_effectiveSemesterId_fkey" FOREIGN KEY ("effectiveSemesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_originRequestId_fkey" FOREIGN KEY ("originRequestId") REFERENCES "ChangeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_correctionOfId_fkey" FOREIGN KEY ("correctionOfId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortVersion" ADD CONSTRAINT "CohortVersion_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortVersion" ADD CONSTRAINT "CohortVersion_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortVersion" ADD CONSTRAINT "CohortVersion_fromSemesterId_fkey" FOREIGN KEY ("fromSemesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_originRequestId_fkey" FOREIGN KEY ("originRequestId") REFERENCES "ChangeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_effectiveSemesterId_fkey" FOREIGN KEY ("effectiveSemesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Hand-written. A correction Draft (correctionOfId set) lives beside the plain Draft; only plain Drafts stay one per program.
DROP INDEX "ProgramVersion_one_draft";
CREATE UNIQUE INDEX "ProgramVersion_one_draft" ON "ProgramVersion" ("programId")
  WHERE "status" = 'DRAFT' AND "sourceRequestId" IS NULL AND "correctionOfId" IS NULL;

-- A version that left Draft has a publication time; rows already past Draft get theirs from their last update.
UPDATE "ProgramVersion" SET "publishedAt" = "updatedAt" WHERE "status" <> 'DRAFT' AND "publishedAt" IS NULL;
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_published_has_time"
  CHECK (("status" = 'DRAFT') = ("publishedAt" IS NULL));
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_term_positive" CHECK ("termInYear" >= 1);
