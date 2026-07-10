-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "legalName" TEXT,
    "rut" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessClaim" (
    "id" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "placeId" TEXT,
    "brandId" TEXT,
    "claimantRole" TEXT,
    "message" TEXT,
    "evidenceUrl" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "BusinessClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");

-- CreateIndex
CREATE INDEX "BusinessClaim_status_idx" ON "BusinessClaim"("status");

-- CreateIndex
CREATE INDEX "BusinessClaim_claimantId_idx" ON "BusinessClaim"("claimantId");

-- CreateIndex
CREATE INDEX "BusinessClaim_placeId_idx" ON "BusinessClaim"("placeId");

-- CreateIndex
CREATE INDEX "BusinessClaim_brandId_idx" ON "BusinessClaim"("brandId");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessClaim" ADD CONSTRAINT "BusinessClaim_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessClaim" ADD CONSTRAINT "BusinessClaim_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessClaim" ADD CONSTRAINT "BusinessClaim_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessClaim" ADD CONSTRAINT "BusinessClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
