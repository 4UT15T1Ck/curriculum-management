-- CreateEnum
CREATE TYPE "SubjectGroupStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubjectGroupMemberRole" AS ENUM ('MEMBER', 'COORDINATOR');

-- CreateTable
CREATE TABLE "SubjectGroup" (
    "id" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "status" "SubjectGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectGroupMember" (
    "id" TEXT NOT NULL,
    "subjectGroupId" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "memberRole" "SubjectGroupMemberRole" NOT NULL,
    "validFrom" DATE NOT NULL,
    "validTo" DATE,
    "assignedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectGroup_groupCode_key" ON "SubjectGroup"("groupCode");

-- CreateIndex
CREATE INDEX "SubjectGroup_facultyId_idx" ON "SubjectGroup"("facultyId");

-- CreateIndex
CREATE INDEX "SubjectGroupMember_lecturerId_idx" ON "SubjectGroupMember"("lecturerId");

-- CreateIndex
CREATE INDEX "SubjectGroupMember_subjectGroupId_idx" ON "SubjectGroupMember"("subjectGroupId");

-- AddForeignKey
ALTER TABLE "SubjectGroup" ADD CONSTRAINT "SubjectGroup_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGroupMember" ADD CONSTRAINT "SubjectGroupMember_subjectGroupId_fkey" FOREIGN KEY ("subjectGroupId") REFERENCES "SubjectGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGroupMember" ADD CONSTRAINT "SubjectGroupMember_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGroupMember" ADD CONSTRAINT "SubjectGroupMember_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGroupMember" ADD CONSTRAINT "SubjectGroupMember_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
