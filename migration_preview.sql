-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONSUMER', 'BUSINESS_OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLAIMED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeedItemType" AS ENUM ('NEW_PHOTO', 'HOURS_UPDATED', 'NEW_REVIEW', 'INFO_UPDATED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "rut" TEXT,
    "passwordHash" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plan" "ListingPlan" NOT NULL DEFAULT 'FREE',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "categoryId" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "priceRange" INTEGER,
    "ownerId" TEXT NOT NULL,
    "pricePerMonthAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingTag" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TagStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ListingTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingClaim" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ListingClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "flowPlanId" TEXT NOT NULL,
    "flowSubId" TEXT NOT NULL,
    "pricePerMonthAmount" INTEGER NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "FeedItemType" NOT NULL,
    "payload" JSONB NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAnalytics" (
    "listingId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingAnalytics_pkey" PRIMARY KEY ("listingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_neighborhood_idx" ON "Listing"("neighborhood");

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_order_idx" ON "ListingImage"("listingId", "order");

-- CreateIndex
CREATE INDEX "ListingTag_slug_status_idx" ON "ListingTag"("slug", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ListingTag_listingId_slug_key" ON "ListingTag"("listingId", "slug");

-- CreateIndex
CREATE INDEX "ListingClaim_listingId_idx" ON "ListingClaim"("listingId");

-- CreateIndex
CREATE INDEX "ListingClaim_status_idx" ON "ListingClaim"("status");

-- CreateIndex
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_listingId_userId_key" ON "Review"("listingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_listingId_key" ON "Subscription"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_flowSubId_key" ON "Subscription"("flowSubId");

-- CreateIndex
CREATE INDEX "FeedItem_userId_createdAt_idx" ON "FeedItem"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_listingId_idx" ON "FeedItem"("listingId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingTag" ADD CONSTRAINT "ListingTag_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingClaim" ADD CONSTRAINT "ListingClaim_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingClaim" ADD CONSTRAINT "ListingClaim_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAnalytics" ADD CONSTRAINT "ListingAnalytics_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

