-- AlterTable
ALTER TABLE "ProgramVersion" ADD COLUMN     "creditMismatchAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "creditMismatchAcceptedById" TEXT,
ADD COLUMN     "creditMismatchCompulsoryGap" DECIMAL(5,2),
ADD COLUMN     "creditMismatchElectiveGap" DECIMAL(5,2),
ADD COLUMN     "creditMismatchReason" TEXT;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_creditMismatchAcceptedById_fkey" FOREIGN KEY ("creditMismatchAcceptedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma does not model CHECK constraints; do not remove it when tidying this file (database_and_models.md).
-- A credit-mismatch acceptance is all five columns or none.
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_credit_acceptance_complete"
  CHECK (num_nulls("creditMismatchReason", "creditMismatchCompulsoryGap", "creditMismatchElectiveGap", "creditMismatchAcceptedById", "creditMismatchAcceptedAt") IN (0, 5));
