-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WithdrawalStatus') THEN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'SENT', 'FAILED');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "reputationScore" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "trustLevel" TEXT NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "Task"
  ADD COLUMN IF NOT EXISTS "verificationPolicy" JSONB,
  ADD COLUMN IF NOT EXISTS "sponsorName" TEXT,
  ADD COLUMN IF NOT EXISTS "sponsorType" TEXT,
  ADD COLUMN IF NOT EXISTS "kpiName" TEXT,
  ADD COLUMN IF NOT EXISTS "kpiTarget" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "kpiUnit" TEXT,
  ADD COLUMN IF NOT EXISTS "audienceRules" JSONB,
  ADD COLUMN IF NOT EXISTS "cooldownSeconds" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "minReputation" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "minAccountAgeDays" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserTask"
  ADD COLUMN IF NOT EXISTS "proofData" JSONB,
  ADD COLUMN IF NOT EXISTS "deviceFingerprint" TEXT,
  ADD COLUMN IF NOT EXISTS "riskScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tonAddress" TEXT NOT NULL,
  "grossAmount" DOUBLE PRECISION NOT NULL,
  "feeAmount" DOUBLE PRECISION NOT NULL,
  "netAmount" DOUBLE PRECISION NOT NULL,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "idempotencyKey" TEXT NOT NULL,
  "externalTxId" TEXT,
  "failureReason" TEXT,
  "approvedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WithdrawalRequest_userId_idempotencyKey_key" ON "WithdrawalRequest"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WithdrawalRequest_status_createdAt_idx" ON "WithdrawalRequest"("status", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WithdrawalRequest_userId_fkey'
  ) THEN
    ALTER TABLE "WithdrawalRequest"
      ADD CONSTRAINT "WithdrawalRequest_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
