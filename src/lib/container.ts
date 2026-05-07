import { prisma } from './db'
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { PrismaListingRepository } from '@infrastructure/db/PrismaListingRepository'
import { PrismaReviewRepository } from '@infrastructure/db/PrismaReviewRepository'
import { BcryptPasswordHasher } from '@infrastructure/auth/BcryptPasswordHasher'
import { ResendEmailService } from '@infrastructure/email/ResendEmailService'
import { PostgresFTSSearchService } from '@infrastructure/search/PostgresFTSSearchService'
import { PostgresAnalyticsService } from '@infrastructure/db/PostgresAnalyticsService'
import { RegisterUserUseCase } from '@application/user/RegisterUserUseCase'
import { SearchListingsUseCase } from '@application/listing/SearchListingsUseCase'
import { GetListingBySlugUseCase } from '@application/listing/GetListingBySlugUseCase'

export const container = {
  getRegisterUserUseCase() {
    return new RegisterUserUseCase(
      new PrismaUserRepository(prisma),
      new BcryptPasswordHasher(),
      new ResendEmailService(),
    )
  },

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
}
