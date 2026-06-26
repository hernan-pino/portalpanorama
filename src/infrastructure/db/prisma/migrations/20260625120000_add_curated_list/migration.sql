-- CreateEnum
CREATE TYPE "CuratedListKind" AS ENUM ('GUIDE', 'OCCASION');

-- DropIndex
DROP INDEX "Collection_slug_key";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "isCurated",
DROP COLUMN "slug",
ALTER COLUMN "ownerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "CuratedList" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CuratedListKind" NOT NULL DEFAULT 'GUIDE',
    "description" TEXT,
    "intro" TEXT,
    "coverImageUrl" TEXT,
    "rule" JSONB NOT NULL,
    "sort" TEXT NOT NULL DEFAULT 'score_desc',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuratedListPin" (
    "listId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "blurb" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CuratedListPin_pkey" PRIMARY KEY ("listId","placeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuratedList_slug_key" ON "CuratedList"("slug");

-- CreateIndex
CREATE INDEX "CuratedList_isPublished_idx" ON "CuratedList"("isPublished");

-- CreateIndex
CREATE INDEX "CuratedListPin_placeId_idx" ON "CuratedListPin"("placeId");

-- AddForeignKey
ALTER TABLE "CuratedListPin" ADD CONSTRAINT "CuratedListPin_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CuratedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuratedListPin" ADD CONSTRAINT "CuratedListPin_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
