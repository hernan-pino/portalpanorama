-- CreateEnum
CREATE TYPE "PlaceClickType" AS ENUM ('DIRECTIONS', 'WEBSITE', 'INSTAGRAM', 'PHONE', 'MENU', 'SOCIAL');

-- CreateTable
CREATE TABLE "PlaceClick" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "type" "PlaceClickType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaceClick_placeId_type_idx" ON "PlaceClick"("placeId", "type");

-- CreateIndex
CREATE INDEX "PlaceClick_placeId_createdAt_idx" ON "PlaceClick"("placeId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "PlaceClick" ADD CONSTRAINT "PlaceClick_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
