import { prisma } from './db'
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { PrismaListingRepository } from '@infrastructure/db/PrismaListingRepository'
import { PrismaReviewRepository } from '@infrastructure/db/PrismaReviewRepository'
import { PrismaSubscriptionRepository } from '@infrastructure/db/PrismaSubscriptionRepository'
import { PrismaFeedRepository } from '@infrastructure/db/PrismaFeedRepository'
import { BcryptPasswordHasher } from '@infrastructure/auth/BcryptPasswordHasher'
import { ResendEmailService } from '@infrastructure/email/ResendEmailService'
import { PostgresFTSSearchService } from '@infrastructure/search/PostgresFTSSearchService'
import { PostgresAnalyticsService } from '@infrastructure/db/PostgresAnalyticsService'
import { FlowPaymentGateway } from '@infrastructure/payment/FlowPaymentGateway'
import { BecomeBusinessOwnerUseCase } from '@application/user/BecomeBusinessOwnerUseCase'
import { RegisterUserUseCase } from '@application/user/RegisterUserUseCase'
import { GetUserDashboardUseCase } from '@application/user/GetUserDashboardUseCase'
import { GetUserFeedUseCase } from '@application/user/GetUserFeedUseCase'
import { SaveFavoriteUseCase } from '@application/user/SaveFavoriteUseCase'
import { RemoveFavoriteUseCase } from '@application/user/RemoveFavoriteUseCase'
import { UpdateUserProfileUseCase } from '@application/user/UpdateUserProfileUseCase'
import { SearchListingsUseCase } from '@application/listing/SearchListingsUseCase'
import { GetListingBySlugUseCase } from '@application/listing/GetListingBySlugUseCase'
import { GetBusinessDashboardUseCase } from '@application/listing/GetBusinessDashboardUseCase'
import { CreateListingUseCase } from '@application/listing/CreateListingUseCase'
import { UpdateListingUseCase } from '@application/listing/UpdateListingUseCase'
import { PublishListingUseCase } from '@application/listing/PublishListingUseCase'
import { CreateSubscriptionUseCase } from '@application/subscription/CreateSubscriptionUseCase'
import { HandlePaymentWebhookUseCase } from '@application/subscription/HandlePaymentWebhookUseCase'
import { ClaimListingUseCase } from '@application/listing/ClaimListingUseCase'
import { ResolveListingClaimUseCase } from '@application/listing/ResolveListingClaimUseCase'
import { GetPendingClaimsUseCase } from '@application/listing/GetPendingClaimsUseCase'
import { GetPendingTagsUseCase } from '@application/listing/GetPendingTagsUseCase'
import { ResolveListingTagUseCase } from '@application/listing/ResolveListingTagUseCase'
import { GetListingWithReviewsUseCase } from '@application/listing/GetListingWithReviewsUseCase'
import { GetOwnedListingUseCase } from '@application/listing/GetOwnedListingUseCase'
import { GetListingSubscriptionsUseCase } from '@application/subscription/GetListingSubscriptionsUseCase'

export const container = {
  // ── Auth ──────────────────────────────────────────────────────────────
  getBecomeBusinessOwnerUseCase() {
    return new BecomeBusinessOwnerUseCase(
      new PrismaUserRepository(prisma),
      new PrismaListingRepository(prisma),
    )
  },

  getRegisterUserUseCase() {
    return new RegisterUserUseCase(
      new PrismaUserRepository(prisma),
      new BcryptPasswordHasher(),
      new ResendEmailService(),
    )
  },

  // ── User dashboard ────────────────────────────────────────────────────
  getGetUserDashboardUseCase() {
    return new GetUserDashboardUseCase(
      new PrismaUserRepository(prisma),
      new PrismaListingRepository(prisma),
    )
  },

  getGetUserFeedUseCase() {
    return new GetUserFeedUseCase(
      new PrismaUserRepository(prisma),
      new PrismaFeedRepository(prisma),
    )
  },

  getSaveFavoriteUseCase() {
    return new SaveFavoriteUseCase(
      new PrismaUserRepository(prisma),
      new PrismaListingRepository(prisma),
    )
  },

  getRemoveFavoriteUseCase() {
    return new RemoveFavoriteUseCase(new PrismaUserRepository(prisma))
  },

  getUpdateUserProfileUseCase() {
    return new UpdateUserProfileUseCase(new PrismaUserRepository(prisma))
  },

  // ── Public ────────────────────────────────────────────────────────────
  getSearchListingsUseCase() {
    return new SearchListingsUseCase(new PostgresFTSSearchService(prisma))
  },

  getGetListingBySlugUseCase() {
    return new GetListingBySlugUseCase(
      new PrismaListingRepository(prisma),
      new PostgresAnalyticsService(prisma),
    )
  },

  getGetListingWithReviewsUseCase() {
    return new GetListingWithReviewsUseCase(
      new PrismaListingRepository(prisma),
      new PrismaReviewRepository(prisma),
      new PostgresAnalyticsService(prisma),
    )
  },

  getGetOwnedListingUseCase() {
    return new GetOwnedListingUseCase(new PrismaListingRepository(prisma))
  },

  // ── Business dashboard ────────────────────────────────────────────────
  getGetBusinessDashboardUseCase() {
    return new GetBusinessDashboardUseCase(
      new PrismaUserRepository(prisma),
      new PrismaListingRepository(prisma),
      new PrismaReviewRepository(prisma),
      new PostgresAnalyticsService(prisma),
    )
  },

  getCreateListingUseCase() {
    return new CreateListingUseCase(new PrismaListingRepository(prisma))
  },

  getUpdateListingUseCase() {
    return new UpdateListingUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
      new PrismaFeedRepository(prisma),
    )
  },

  getPublishListingUseCase() {
    return new PublishListingUseCase(
      new PrismaListingRepository(prisma),
      new PostgresFTSSearchService(prisma),
    )
  },

  getCreateSubscriptionUseCase() {
    return new CreateSubscriptionUseCase(
      new PrismaListingRepository(prisma),
      new PrismaSubscriptionRepository(prisma),
      new FlowPaymentGateway(),
    )
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  getClaimListingUseCase() {
    return new ClaimListingUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
      new ResendEmailService(),
    )
  },

  getResolveListingClaimUseCase() {
    return new ResolveListingClaimUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
      new ResendEmailService(),
    )
  },

  getGetPendingClaimsUseCase() {
    return new GetPendingClaimsUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
    )
  },

  getGetPendingTagsUseCase() {
    return new GetPendingTagsUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
    )
  },

  getResolveListingTagUseCase() {
    return new ResolveListingTagUseCase(
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
    )
  },

  getGetListingSubscriptionsUseCase() {
    return new GetListingSubscriptionsUseCase(
      new PrismaListingRepository(prisma),
      new PrismaSubscriptionRepository(prisma),
    )
  },

  getHandlePaymentWebhookUseCase() {
    return new HandlePaymentWebhookUseCase(
      new FlowPaymentGateway(),
      new PrismaSubscriptionRepository(prisma),
      new PrismaListingRepository(prisma),
      new PrismaUserRepository(prisma),
      new ResendEmailService(),
    )
  },

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },
}
