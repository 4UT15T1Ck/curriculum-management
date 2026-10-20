-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('THEORY', 'PRACTICE', 'LAB', 'PROJECT', 'CAPSTONE', 'INTERNSHIP', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'DISCONTINUED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "englishName" TEXT,
    "credits" DECIMAL(5,2) NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerFacultyId" TEXT NOT NULL,
    "ownerGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE INDEX "Course_ownerFacultyId_idx" ON "Course"("ownerFacultyId");

-- CreateIndex
CREATE INDEX "Course_ownerGroupId_idx" ON "Course"("ownerGroupId");

-- CreateIndex
CREATE INDEX "Course_courseName_idx" ON "Course"("courseName");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerFacultyId_fkey" FOREIGN KEY ("ownerFacultyId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerGroupId_fkey" FOREIGN KEY ("ownerGroupId") REFERENCES "SubjectGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
