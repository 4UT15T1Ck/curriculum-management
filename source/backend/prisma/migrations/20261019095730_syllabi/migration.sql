-- CreateEnum
CREATE TYPE "SyllabusStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HISTORICAL');

-- CreateEnum
CREATE TYPE "AttachmentFileType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'IMAGE');

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "status" "SyllabusStatus" NOT NULL DEFAULT 'DRAFT',
    "courseDescription" TEXT,
    "englishDescription" TEXT,
    "objectives" TEXT,
    "teachingMethods" TEXT,
    "assessmentMethods" TEXT,
    "references" TEXT,
    "previousVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyContent" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "teachingActivities" TEXT,

    CONSTRAINT "WeeklyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusAttachment" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "AttachmentFileType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_previousVersionId_key" ON "Syllabus"("previousVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_courseId_revisionNumber_key" ON "Syllabus"("courseId", "revisionNumber");

-- CreateIndex
CREATE INDEX "WeeklyContent_syllabusId_sortOrder_idx" ON "WeeklyContent"("syllabusId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusAttachment_filePath_key" ON "SyllabusAttachment"("filePath");

-- CreateIndex
CREATE INDEX "SyllabusAttachment_syllabusId_recordedAt_idx" ON "SyllabusAttachment"("syllabusId", "recordedAt");

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyContent" ADD CONSTRAINT "WeeklyContent_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusAttachment" ADD CONSTRAINT "SyllabusAttachment_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusAttachment" ADD CONSTRAINT "SyllabusAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DC-01..DC-05: at most one Draft and one Published revision per course; any number of Historical.
CREATE UNIQUE INDEX "Syllabus_one_draft" ON "Syllabus" ("courseId") WHERE "status" = 'DRAFT';
CREATE UNIQUE INDEX "Syllabus_one_published" ON "Syllabus" ("courseId") WHERE "status" = 'PUBLISHED';
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_revision_positive" CHECK ("revisionNumber" >= 1);
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_published_has_time" CHECK (("status" = 'DRAFT') = ("publishedAt" IS NULL));
ALTER TABLE "WeeklyContent" ADD CONSTRAINT "WeeklyContent_order_positive" CHECK ("sortOrder" >= 1);
ALTER TABLE "SyllabusAttachment" ADD CONSTRAINT "SyllabusAttachment_size_positive" CHECK ("sizeBytes" > 0);
