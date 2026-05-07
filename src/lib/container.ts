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

export const container = {
  // ── Auth ──────────────────────────────────────────────────────────────
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

  getReviewRepository() {
    return new PrismaReviewRepository(prisma)
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

  getListingRepository() {
    return new PrismaListingRepository(prisma)
  },

  getSubscriptionRepository() {
    return new PrismaSubscriptionRepository(prisma)
  },

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },
}
