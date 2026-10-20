-- CreateTable
CREATE TABLE "PLO" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ploCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "englishDescription" TEXT,
    "competencyGroup" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PLO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CLO" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "cloCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "englishDescription" TEXT,
    "cognitiveLevel" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CLO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyContentCLO" (
    "id" TEXT NOT NULL,
    "weeklyContentId" TEXT NOT NULL,
    "cloId" TEXT NOT NULL,

    CONSTRAINT "WeeklyContentCLO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePLOMapping" (
    "id" TEXT NOT NULL,
    "curriculumItemId" TEXT NOT NULL,
    "ploId" TEXT NOT NULL,
    "weight" DECIMAL(3,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePLOMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CLOPLOMapping" (
    "id" TEXT NOT NULL,
    "curriculumItemId" TEXT NOT NULL,
    "ploId" TEXT NOT NULL,
    "cloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CLOPLOMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PLO_versionId_sortOrder_idx" ON "PLO"("versionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PLO_versionId_ploCode_key" ON "PLO"("versionId", "ploCode");

-- CreateIndex
CREATE INDEX "CLO_syllabusId_sortOrder_idx" ON "CLO"("syllabusId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CLO_syllabusId_cloCode_key" ON "CLO"("syllabusId", "cloCode");

-- CreateIndex
CREATE INDEX "WeeklyContentCLO_cloId_idx" ON "WeeklyContentCLO"("cloId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyContentCLO_weeklyContentId_cloId_key" ON "WeeklyContentCLO"("weeklyContentId", "cloId");

-- CreateIndex
CREATE INDEX "CoursePLOMapping_ploId_idx" ON "CoursePLOMapping"("ploId");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePLOMapping_curriculumItemId_ploId_key" ON "CoursePLOMapping"("curriculumItemId", "ploId");

-- CreateIndex
CREATE INDEX "CLOPLOMapping_cloId_idx" ON "CLOPLOMapping"("cloId");

-- CreateIndex
CREATE UNIQUE INDEX "CLOPLOMapping_curriculumItemId_cloId_ploId_key" ON "CLOPLOMapping"("curriculumItemId", "cloId", "ploId");

-- AddForeignKey
ALTER TABLE "PLO" ADD CONSTRAINT "PLO_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProgramVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLO" ADD CONSTRAINT "CLO_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyContentCLO" ADD CONSTRAINT "WeeklyContentCLO_weeklyContentId_fkey" FOREIGN KEY ("weeklyContentId") REFERENCES "WeeklyContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyContentCLO" ADD CONSTRAINT "WeeklyContentCLO_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePLOMapping" ADD CONSTRAINT "CoursePLOMapping_curriculumItemId_fkey" FOREIGN KEY ("curriculumItemId") REFERENCES "CurriculumItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePLOMapping" ADD CONSTRAINT "CoursePLOMapping_ploId_fkey" FOREIGN KEY ("ploId") REFERENCES "PLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLOPLOMapping" ADD CONSTRAINT "CLOPLOMapping_curriculumItemId_ploId_fkey" FOREIGN KEY ("curriculumItemId", "ploId") REFERENCES "CoursePLOMapping"("curriculumItemId", "ploId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLOPLOMapping" ADD CONSTRAINT "CLOPLOMapping_cloId_fkey" FOREIGN KEY ("cloId") REFERENCES "CLO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Weight in (0, 1]; Decimal(3,2) already limits it to two decimals. Prisma cannot express a CHECK.
ALTER TABLE "CoursePLOMapping"
  ADD CONSTRAINT "CoursePLOMapping_weight_range" CHECK ("weight" > 0 AND "weight" <= 1);
