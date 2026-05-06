import { Listing } from '@domain/listing/Listing'
import { ListingClaim, ClaimStatus } from '@domain/listing/ListingClaim'
import { ListingPlan } from '@domain/listing/ListingPlan'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { Review } from '@domain/review/Review'
import { Email } from '@domain/shared/Email'
import { Money } from '@domain/shared/Money'
import { Slug } from '@domain/shared/Slug'
import { Subscription } from '@domain/subscription/Subscription'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'

export function makeListing(overrides: Partial<Parameters<typeof Listing.create>[0]> = {}): Listing {
  return Listing.create({
    id: 'listing-1',
    slug: Slug.fromExisting('mi-listing'),
    name: 'Mi Listing',
    plan: ListingPlan.FREE,
    status: ListingStatus.DRAFT,
    categoryId: 'cat-1',
    neighborhood: 'Lastarria',
    ownerId: 'user-1',
    images: [],
    tags: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  })
}

export function makePublishedListing(
  overrides: Partial<Parameters<typeof Listing.create>[0]> = {},
): Listing {
  return makeListing({ status: ListingStatus.PUBLISHED, ...overrides })
}

export function makeUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}): User {
  return User.create({
    id: 'user-1',
    email: Email.create('owner@example.com'),
    name: 'Owner User',
    role: UserRole.CONSUMER,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  })
}

export function makeAdminUser(): User {
  return makeUser({ id: 'admin-1', role: UserRole.ADMIN })
}

export function makeReview(overrides: Partial<Parameters<typeof Review.create>[0]> = {}): Review {
  return Review.create({
    id: 'review-1',
    listingId: 'listing-1',
    userId: 'user-2',
    rating: 8,
    body: 'Muy bueno',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  })
}

export function makeClaim(
  overrides: Partial<Parameters<typeof ListingClaim.create>[0]> = {},
): ListingClaim {
  return ListingClaim.create({
    id: 'claim-1',
    listingId: 'listing-1',
    claimantId: 'user-2',
    status: ClaimStatus.PENDING,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  })
}

export function makeSubscription(
  overrides: Partial<Parameters<typeof Subscription.create>[0]> = {},
): Subscription {
  return Subscription.create({
    id: 'sub-1',
    listingId: 'listing-1',
    userId: 'user-1',
    status: SubscriptionStatus.ACTIVE,
    flowPlanId: 'plan-123',
    flowSubId: 'sub-flow-123',
    pricePerMonth: Money.create(9990),
    createdAt: new Date('2026-01-01'),
    ...overrides,
  })
}
