-- AlterTable
ALTER TABLE "UserTask"
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewNote" TEXT;

