-- CreateTable
CREATE TABLE "KnowledgeBlock" (
    "id" TEXT NOT NULL,
    "blockCode" TEXT NOT NULL,
    "blockName" TEXT NOT NULL,
    "requiredCredits" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectiveGroup" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "minCredits" DECIMAL(5,2),
    "minCourses" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectiveGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumItem" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "plannedSemester" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "blockSymbol" TEXT,
    "isElective" BOOLEAN NOT NULL,
    "electiveGroupId" TEXT,
    "htDa" BOOLEAN NOT NULL DEFAULT false,
    "tqDa" BOOLEAN NOT NULL DEFAULT false,
    "minStudiedScore" DECIMAL(4,2),
    "minTransferScore" DECIMAL(4,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumRequisite" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sourceCourseId" TEXT NOT NULL,
    "relationType" "CourseRelationType" NOT NULL,
    "minScore" DECIMAL(4,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumRequisite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBlock_blockCode_key" ON "KnowledgeBlock"("blockCode");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveGroup_versionId_groupCode_key" ON "ElectiveGroup"("versionId", "groupCode");

-- CreateIndex
CREATE INDEX "CurriculumItem_versionId_plannedSemester_sortOrder_idx" ON "CurriculumItem"("versionId", "plannedSemester", "sortOrder");

-- CreateIndex
CREATE INDEX "CurriculumItem_courseId_idx" ON "CurriculumItem"("courseId");

-- CreateIndex
CREATE INDEX "CurriculumItem_electiveGroupId_idx" ON "CurriculumItem"("electiveGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumItem_versionId_courseId_key" ON "CurriculumItem"("versionId", "courseId");

-- CreateIndex
CREATE INDEX "CurriculumRequisite_sourceCourseId_idx" ON "CurriculumRequisite"("sourceCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumRequisite_itemId_sourceCourseId_relationType_key" ON "CurriculumRequisite"("itemId", "sourceCourseId", "relationType");

-- AddForeignKey
ALTER TABLE "ElectiveGroup" ADD CONSTRAINT "ElectiveGroup_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProgramVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProgramVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_electiveGroupId_fkey" FOREIGN KEY ("electiveGroupId") REFERENCES "ElectiveGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumRequisite" ADD CONSTRAINT "CurriculumRequisite_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CurriculumItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumRequisite" ADD CONSTRAINT "CurriculumRequisite_sourceCourseId_fkey" FOREIGN KEY ("sourceCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma does not model CHECK constraints; do not remove them when tidying this file (database_and_models.md).
-- A grouped row is elective; semester and order start at 1; a group has at least one minimum; curriculum requisites are never REPLACEMENT and only PREREQUISITE has a threshold.
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_group_needs_elective" CHECK ("electiveGroupId" IS NULL OR "isElective");
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_semester_positive" CHECK ("plannedSemester" >= 1);
ALTER TABLE "CurriculumItem" ADD CONSTRAINT "CurriculumItem_sort_positive" CHECK ("sortOrder" >= 1);
ALTER TABLE "ElectiveGroup" ADD CONSTRAINT "ElectiveGroup_has_minimum" CHECK ("minCredits" IS NOT NULL OR "minCourses" IS NOT NULL);
ALTER TABLE "CurriculumRequisite" ADD CONSTRAINT "CurriculumRequisite_not_replacement" CHECK ("relationType" <> 'REPLACEMENT');
ALTER TABLE "CurriculumRequisite" ADD CONSTRAINT "CurriculumRequisite_min_score_prerequisite" CHECK ("minScore" IS NULL OR "relationType" = 'PREREQUISITE');
