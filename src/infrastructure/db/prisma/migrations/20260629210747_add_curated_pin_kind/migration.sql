-- CreateEnum
CREATE TYPE "CuratedPinKind" AS ENUM ('FEATURED', 'MENTION');

-- AlterTable
ALTER TABLE "CuratedListPin" ADD COLUMN     "kind" "CuratedPinKind" NOT NULL DEFAULT 'FEATURED';
