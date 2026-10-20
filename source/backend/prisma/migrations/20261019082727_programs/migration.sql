-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('ENGINEER', 'BACHELOR');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProgramVersionStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'HISTORICAL');

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "programCode" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "degreeLevel" "DegreeLevel" NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "clonedFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "versionNumber" TEXT,
    "status" "ProgramVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "programName" TEXT NOT NULL,
    "majorCode" TEXT NOT NULL,
    "majorName" TEXT NOT NULL,
    "semesterCount" INTEGER NOT NULL,
    "totalCredits" DECIMAL(5,2) NOT NULL,
    "compulsoryCredits" DECIMAL(5,2) NOT NULL,
    "electiveCredits" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDirectorAssignment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "validFrom" DATE NOT NULL,
    "validTo" DATE,
    "assignedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramDirectorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_programCode_key" ON "Program"("programCode");

-- CreateIndex
CREATE INDEX "Program_facultyId_idx" ON "Program"("facultyId");

-- CreateIndex
CREATE INDEX "ProgramVersion_programId_status_idx" ON "ProgramVersion"("programId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramVersion_programId_versionNumber_key" ON "ProgramVersion"("programId", "versionNumber");

-- CreateIndex
CREATE INDEX "ProgramDirectorAssignment_directorId_idx" ON "ProgramDirectorAssignment"("directorId");

-- CreateIndex
CREATE INDEX "ProgramDirectorAssignment_programId_idx" ON "ProgramDirectorAssignment"("programId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_clonedFromId_fkey" FOREIGN KEY ("clonedFromId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDirectorAssignment" ADD CONSTRAINT "ProgramDirectorAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDirectorAssignment" ADD CONSTRAINT "ProgramDirectorAssignment_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDirectorAssignment" ADD CONSTRAINT "ProgramDirectorAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDirectorAssignment" ADD CONSTRAINT "ProgramDirectorAssignment_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma does not model partial unique indexes; do not remove them when tidying this file (database_and_models.md).
-- A program has at most one Draft and at most one Active version (BR-22).
CREATE UNIQUE INDEX "ProgramVersion_one_draft" ON "ProgramVersion" ("programId") WHERE "status" = 'DRAFT';
CREATE UNIQUE INDEX "ProgramVersion_one_active" ON "ProgramVersion" ("programId") WHERE "status" = 'ACTIVE';
