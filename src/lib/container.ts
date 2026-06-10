import { prisma } from './db'

// ── Infrastructure adapters ─────────────────────────────────────────────
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { PrismaPlaceRepository } from '@infrastructure/db/PrismaPlaceRepository'
import { PrismaCategoryRepository } from '@infrastructure/db/PrismaCategoryRepository'
import { PrismaTagRepository } from '@infrastructure/db/PrismaTagRepository'
import { PrismaCollectionRepository } from '@infrastructure/db/PrismaCollectionRepository'
import { PrismaVisitHistoryRepository } from '@infrastructure/db/PrismaVisitHistoryRepository'
import { PrismaReportRepository } from '@infrastructure/db/PrismaReportRepository'
import { PostgresFTSSearchService } from '@infrastructure/search/PostgresFTSSearchService'
import { BcryptPasswordHasher } from '@infrastructure/auth/BcryptPasswordHasher'
import { ResendEmailService } from '@infrastructure/email/ResendEmailService'

// ── Use cases ───────────────────────────────────────────────────────────
import { SearchPlacesUseCase } from '@application/place/SearchPlacesUseCase'
import { GetPlaceFacetsUseCase } from '@application/place/GetPlaceFacetsUseCase'
import { GetPlaceBySlugUseCase } from '@application/place/GetPlaceBySlugUseCase'
import { CreatePlaceUseCase } from '@application/place/CreatePlaceUseCase'
import { UpdatePlaceUseCase } from '@application/place/UpdatePlaceUseCase'
import { PublishPlaceUseCase } from '@application/place/PublishPlaceUseCase'
import { ArchivePlaceUseCase } from '@application/place/ArchivePlaceUseCase'
import { RecalculateScoresUseCase } from '@application/place/RecalculateScoresUseCase'
import { CreateReportUseCase } from '@application/place/CreateReportUseCase'
import { GetCategoriesUseCase } from '@application/catalog/GetCategoriesUseCase'
import { GetCuratedCollectionUseCase } from '@application/collection/GetCuratedCollectionUseCase'
import { CreateCollectionUseCase } from '@application/collection/CreateCollectionUseCase'
import { RenameCollectionUseCase } from '@application/collection/RenameCollectionUseCase'
import { DeleteCollectionUseCase } from '@application/collection/DeleteCollectionUseCase'
import { AddPlaceToCollectionUseCase } from '@application/collection/AddPlaceToCollectionUseCase'
import { RemovePlaceFromCollectionUseCase } from '@application/collection/RemovePlaceFromCollectionUseCase'
import { RegisterUserUseCase } from '@application/user/RegisterUserUseCase'
import { UpdateUserProfileUseCase } from '@application/user/UpdateUserProfileUseCase'
import { GetUserDashboardUseCase } from '@application/user/GetUserDashboardUseCase'
import { RecordVisitUseCase } from '@application/user/RecordVisitUseCase'

// Los adapters son stateless sobre el cliente Prisma compartido: una instancia basta.
const userRepo = new PrismaUserRepository(prisma)
const placeRepo = new PrismaPlaceRepository(prisma)
const categoryRepo = new PrismaCategoryRepository(prisma)
const tagRepo = new PrismaTagRepository(prisma)
const collectionRepo = new PrismaCollectionRepository(prisma)
const historyRepo = new PrismaVisitHistoryRepository(prisma)
const reportRepo = new PrismaReportRepository(prisma)
const searchService = new PostgresFTSSearchService(prisma)
const passwordHasher = new BcryptPasswordHasher()
const emailService = new ResendEmailService()

export const container = {
  // ── Discovery (público) ─────────────────────────────────────────────
  getSearchPlacesUseCase() {
    return new SearchPlacesUseCase(searchService)
  },

  getGetPlaceFacetsUseCase() {
    return new GetPlaceFacetsUseCase(searchService)
  },

  getGetPlaceBySlugUseCase() {
    return new GetPlaceBySlugUseCase(placeRepo)
  },

  getGetCategoriesUseCase() {
    return new GetCategoriesUseCase(categoryRepo)
  },

  getGetCuratedCollectionUseCase() {
    return new GetCuratedCollectionUseCase(collectionRepo)
  },

  // ── Usuario ─────────────────────────────────────────────────────────
  getRegisterUserUseCase() {
    return new RegisterUserUseCase(userRepo, passwordHasher, emailService)
  },

  getUpdateUserProfileUseCase() {
    return new UpdateUserProfileUseCase(userRepo)
  },

  getGetUserDashboardUseCase() {
    return new GetUserDashboardUseCase(userRepo, collectionRepo, historyRepo)
  },

  getRecordVisitUseCase() {
    return new RecordVisitUseCase(historyRepo)
  },

  // ── Colecciones / listas ────────────────────────────────────────────
  getCreateCollectionUseCase() {
    return new CreateCollectionUseCase(collectionRepo)
  },

  getRenameCollectionUseCase() {
    return new RenameCollectionUseCase(collectionRepo)
  },

  getDeleteCollectionUseCase() {
    return new DeleteCollectionUseCase(collectionRepo)
  },

  getAddPlaceToCollectionUseCase() {
    return new AddPlaceToCollectionUseCase(collectionRepo)
  },

  getRemovePlaceFromCollectionUseCase() {
    return new RemovePlaceFromCollectionUseCase(collectionRepo)
  },

  // ── Reportes ────────────────────────────────────────────────────────
  getCreateReportUseCase() {
    return new CreateReportUseCase(reportRepo)
  },

  // ── Admin (CRUD de lugares) ─────────────────────────────────────────
  getCreatePlaceUseCase() {
    return new CreatePlaceUseCase(placeRepo, tagRepo)
  },

  getUpdatePlaceUseCase() {
    return new UpdatePlaceUseCase(placeRepo, tagRepo)
  },

  getPublishPlaceUseCase() {
    return new PublishPlaceUseCase(placeRepo)
  },

  getArchivePlaceUseCase() {
    return new ArchivePlaceUseCase(placeRepo)
  },

  getRecalculateScoresUseCase() {
    return new RecalculateScoresUseCase(placeRepo)
  },
}
