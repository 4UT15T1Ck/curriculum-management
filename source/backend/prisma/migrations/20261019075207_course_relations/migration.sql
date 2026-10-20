-- CreateEnum
CREATE TYPE "CourseRelationType" AS ENUM ('PRIOR', 'PREREQUISITE', 'COREQUISITE', 'REPLACEMENT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "equivalenceGroupId" TEXT;

-- CreateTable
CREATE TABLE "CourseRelation" (
    "id" TEXT NOT NULL,
    "sourceCourseId" TEXT NOT NULL,
    "targetCourseId" TEXT NOT NULL,
    "relationType" "CourseRelationType" NOT NULL,
    "minScore" DECIMAL(4,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquivalentCourseGroup" (
    "id" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquivalentCourseGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseRelation_targetCourseId_idx" ON "CourseRelation"("targetCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRelation_sourceCourseId_targetCourseId_relationType_key" ON "CourseRelation"("sourceCourseId", "targetCourseId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "EquivalentCourseGroup_groupCode_key" ON "EquivalentCourseGroup"("groupCode");

-- CreateIndex
CREATE INDEX "Course_equivalenceGroupId_idx" ON "Course"("equivalenceGroupId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_equivalenceGroupId_fkey" FOREIGN KEY ("equivalenceGroupId") REFERENCES "EquivalentCourseGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRelation" ADD CONSTRAINT "CourseRelation_sourceCourseId_fkey" FOREIGN KEY ("sourceCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRelation" ADD CONSTRAINT "CourseRelation_targetCourseId_fkey" FOREIGN KEY ("targetCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma does not model CHECK constraints; do not remove them when tidying this file (database_and_models.md).
ALTER TABLE "CourseRelation" ADD CONSTRAINT "CourseRelation_not_self" CHECK ("sourceCourseId" <> "targetCourseId");
ALTER TABLE "CourseRelation" ADD CONSTRAINT "CourseRelation_minScore_prerequisite_only" CHECK ("minScore" IS NULL OR "relationType" = 'PREREQUISITE');
