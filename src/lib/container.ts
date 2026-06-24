import { prisma } from './db'

// ── Infrastructure adapters ─────────────────────────────────────────────
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { PrismaPlaceRepository } from '@infrastructure/db/PrismaPlaceRepository'
import { PrismaBrandRepository } from '@infrastructure/db/PrismaBrandRepository'
import { PrismaCategoryRepository } from '@infrastructure/db/PrismaCategoryRepository'
import { PrismaTagRepository } from '@infrastructure/db/PrismaTagRepository'
import { PrismaCollectionRepository } from '@infrastructure/db/PrismaCollectionRepository'
import { PrismaVisitHistoryRepository } from '@infrastructure/db/PrismaVisitHistoryRepository'
import { PrismaReportRepository } from '@infrastructure/db/PrismaReportRepository'
import { PrismaSuggestionRepository } from '@infrastructure/db/PrismaSuggestionRepository'
import { PrismaLocationRepository } from '@infrastructure/db/PrismaLocationRepository'
import { PostgresFTSSearchService } from '@infrastructure/search/PostgresFTSSearchService'
import { BcryptPasswordHasher } from '@infrastructure/auth/BcryptPasswordHasher'
import { CryptoTokenGenerator } from '@infrastructure/auth/CryptoTokenGenerator'
import { PrismaPasswordResetTokenRepository } from '@infrastructure/db/PrismaPasswordResetTokenRepository'
import { ResendEmailService } from '@infrastructure/email/ResendEmailService'
import { VercelBlobStorageService } from '@infrastructure/storage/VercelBlobStorageService'
import { SharpImageProcessor } from '@infrastructure/storage/SharpImageProcessor'
import { SafeHttpImageFetcher } from '@infrastructure/storage/SafeHttpImageFetcher'
import { ApifyRatingProvider } from '@infrastructure/rating/ApifyRatingProvider'

// ── Use cases ───────────────────────────────────────────────────────────
import { SearchPlacesUseCase } from '@application/place/SearchPlacesUseCase'
import { SuggestPlacesUseCase } from '@application/place/SuggestPlacesUseCase'
import { GetPlaceFacetsUseCase } from '@application/place/GetPlaceFacetsUseCase'
import { GetPlaceBySlugUseCase } from '@application/place/GetPlaceBySlugUseCase'
import { CreatePlaceUseCase } from '@application/place/CreatePlaceUseCase'
import { UpdatePlaceUseCase } from '@application/place/UpdatePlaceUseCase'
import { PublishPlaceUseCase } from '@application/place/PublishPlaceUseCase'
import { ArchivePlaceUseCase } from '@application/place/ArchivePlaceUseCase'
import { DeletePlaceUseCase } from '@application/place/DeletePlaceUseCase'
import { RecalculateScoresUseCase } from '@application/place/RecalculateScoresUseCase'
import { EnrichPlaceRatingUseCase } from '@application/place/EnrichPlaceRatingUseCase'
import { AttachPlacePhotosUseCase } from '@application/place/AttachPlacePhotosUseCase'
import { GetSitemapEntriesUseCase } from '@application/place/GetSitemapEntriesUseCase'
import { ListPlacesForAdminUseCase } from '@application/place/ListPlacesForAdminUseCase'
import { GetPlaceForEditUseCase } from '@application/place/GetPlaceForEditUseCase'
import { GetPlaceFormOptionsUseCase } from '@application/place/GetPlaceFormOptionsUseCase'
import { GetCatalogCoverageUseCase } from '@application/place/GetCatalogCoverageUseCase'
import { GetBrandPageUseCase } from '@application/brand/GetBrandPageUseCase'
import { CreateBrandUseCase } from '@application/brand/CreateBrandUseCase'
import { UpdateBrandUseCase } from '@application/brand/UpdateBrandUseCase'
import { GetBrandForEditUseCase } from '@application/brand/GetBrandForEditUseCase'
import { ListBrandsForAdminUseCase } from '@application/brand/ListBrandsForAdminUseCase'
import { UploadPlaceImageUseCase } from '@application/place/UploadPlaceImageUseCase'
import { ImportImageFromUrlUseCase } from '@application/place/ImportImageFromUrlUseCase'
import { CreateReportUseCase } from '@application/place/CreateReportUseCase'
import { ListReportsForAdminUseCase } from '@application/report/ListReportsForAdminUseCase'
import { SetReportStatusUseCase } from '@application/report/SetReportStatusUseCase'
import { CreateSuggestionUseCase } from '@application/suggestion/CreateSuggestionUseCase'
import { ListSuggestionsForAdminUseCase } from '@application/suggestion/ListSuggestionsForAdminUseCase'
import { SetSuggestionStatusUseCase } from '@application/suggestion/SetSuggestionStatusUseCase'
import { DeleteSuggestionUseCase } from '@application/suggestion/DeleteSuggestionUseCase'
import { GetCategoriesUseCase } from '@application/catalog/GetCategoriesUseCase'
import { GetCuratedCollectionUseCase } from '@application/collection/GetCuratedCollectionUseCase'
import { CreateCollectionUseCase } from '@application/collection/CreateCollectionUseCase'
import { RenameCollectionUseCase } from '@application/collection/RenameCollectionUseCase'
import { DeleteCollectionUseCase } from '@application/collection/DeleteCollectionUseCase'
import { AddPlaceToCollectionUseCase } from '@application/collection/AddPlaceToCollectionUseCase'
import { SaveToDefaultCollectionUseCase } from '@application/collection/SaveToDefaultCollectionUseCase'
import { RemovePlaceFromCollectionUseCase } from '@application/collection/RemovePlaceFromCollectionUseCase'
import { GetSaveContextUseCase } from '@application/collection/GetSaveContextUseCase'
import { GetUserCollectionUseCase } from '@application/collection/GetUserCollectionUseCase'
import { RegisterUserUseCase } from '@application/user/RegisterUserUseCase'
import { RequestPasswordResetUseCase } from '@application/user/RequestPasswordResetUseCase'
import { ResetPasswordUseCase } from '@application/user/ResetPasswordUseCase'
import { UpdateUserProfileUseCase } from '@application/user/UpdateUserProfileUseCase'
import { ChangePasswordUseCase } from '@application/user/ChangePasswordUseCase'
import { GetUserDashboardUseCase } from '@application/user/GetUserDashboardUseCase'
import { RecordVisitUseCase } from '@application/user/RecordVisitUseCase'
import { ListUsersForAdminUseCase } from '@application/user/ListUsersForAdminUseCase'
import { SetUserRoleUseCase } from '@application/user/SetUserRoleUseCase'
import { DeleteUserUseCase } from '@application/user/DeleteUserUseCase'

// Los adapters son stateless sobre el cliente Prisma compartido: una instancia basta.
const userRepo = new PrismaUserRepository(prisma)
const placeRepo = new PrismaPlaceRepository(prisma)
const brandRepo = new PrismaBrandRepository(prisma)
const categoryRepo = new PrismaCategoryRepository(prisma)
const tagRepo = new PrismaTagRepository(prisma)
const collectionRepo = new PrismaCollectionRepository(prisma)
const historyRepo = new PrismaVisitHistoryRepository(prisma)
const reportRepo = new PrismaReportRepository(prisma)
const suggestionRepo = new PrismaSuggestionRepository(prisma)
const locationRepo = new PrismaLocationRepository(prisma)
const searchService = new PostgresFTSSearchService(prisma)
const passwordHasher = new BcryptPasswordHasher()
const emailService = new ResendEmailService()
const passwordResetTokenRepo = new PrismaPasswordResetTokenRepository(prisma)
const tokenGenerator = new CryptoTokenGenerator()

export const container = {
  // ── Discovery (público) ─────────────────────────────────────────────
  getSearchPlacesUseCase() {
    return new SearchPlacesUseCase(searchService)
  },

  getSuggestPlacesUseCase() {
    return new SuggestPlacesUseCase(searchService)
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

  getGetSitemapEntriesUseCase() {
    return new GetSitemapEntriesUseCase(placeRepo)
  },

  // ── Usuario ─────────────────────────────────────────────────────────
  getRegisterUserUseCase() {
    return new RegisterUserUseCase(userRepo, passwordHasher, emailService)
  },

  getRequestPasswordResetUseCase() {
    return new RequestPasswordResetUseCase(userRepo, passwordResetTokenRepo, tokenGenerator, emailService)
  },

  getResetPasswordUseCase() {
    return new ResetPasswordUseCase(passwordResetTokenRepo, userRepo, passwordHasher, tokenGenerator)
  },

  getUpdateUserProfileUseCase() {
    return new UpdateUserProfileUseCase(userRepo)
  },

  getChangePasswordUseCase() {
    return new ChangePasswordUseCase(userRepo, passwordHasher)
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

  getSaveToDefaultCollectionUseCase() {
    return new SaveToDefaultCollectionUseCase(collectionRepo)
  },

  getRemovePlaceFromCollectionUseCase() {
    return new RemovePlaceFromCollectionUseCase(collectionRepo)
  },

  getGetSaveContextUseCase() {
    return new GetSaveContextUseCase(collectionRepo)
  },

  getGetUserCollectionUseCase() {
    return new GetUserCollectionUseCase(collectionRepo)
  },

  // ── Reportes ────────────────────────────────────────────────────────
  getCreateReportUseCase() {
    return new CreateReportUseCase(reportRepo)
  },

  getListReportsForAdminUseCase() {
    return new ListReportsForAdminUseCase(reportRepo)
  },

  getSetReportStatusUseCase() {
    return new SetReportStatusUseCase(reportRepo)
  },

  // ── Sugerencias (footer) + buzón ────────────────────────────────────
  getCreateSuggestionUseCase() {
    return new CreateSuggestionUseCase(suggestionRepo)
  },

  getListSuggestionsForAdminUseCase() {
    return new ListSuggestionsForAdminUseCase(suggestionRepo)
  },

  getSetSuggestionStatusUseCase() {
    return new SetSuggestionStatusUseCase(suggestionRepo)
  },

  getDeleteSuggestionUseCase() {
    return new DeleteSuggestionUseCase(suggestionRepo)
  },

  // ── Admin (usuarios) ────────────────────────────────────────────────
  getListUsersForAdminUseCase() {
    return new ListUsersForAdminUseCase(userRepo)
  },

  getSetUserRoleUseCase() {
    return new SetUserRoleUseCase(userRepo)
  },

  getDeleteUserUseCase() {
    return new DeleteUserUseCase(userRepo)
  },

  // ── Admin (CRUD de lugares) ─────────────────────────────────────────
  getListPlacesForAdminUseCase() {
    return new ListPlacesForAdminUseCase(placeRepo)
  },

  getGetPlaceForEditUseCase() {
    return new GetPlaceForEditUseCase(placeRepo)
  },

  getGetPlaceFormOptionsUseCase() {
    return new GetPlaceFormOptionsUseCase(categoryRepo, tagRepo, locationRepo, placeRepo, brandRepo)
  },

  getGetCatalogCoverageUseCase() {
    return new GetCatalogCoverageUseCase(categoryRepo, placeRepo)
  },

  // ── Marcas / Negocios ───────────────────────────────────────────────
  getGetBrandPageUseCase() {
    return new GetBrandPageUseCase(brandRepo)
  },

  getCreateBrandUseCase() {
    return new CreateBrandUseCase(brandRepo)
  },

  getUpdateBrandUseCase() {
    return new UpdateBrandUseCase(brandRepo)
  },

  getGetBrandForEditUseCase() {
    return new GetBrandForEditUseCase(brandRepo)
  },

  getListBrandsForAdminUseCase() {
    return new ListBrandsForAdminUseCase(brandRepo)
  },

  // Lazy: el adapter de Blob exige BLOB_READ_WRITE_TOKEN; se instancia recién al subir.
  getUploadPlaceImageUseCase() {
    return new UploadPlaceImageUseCase(new SharpImageProcessor(), new VercelBlobStorageService())
  },

  getImportImageFromUrlUseCase() {
    return new ImportImageFromUrlUseCase(
      new SafeHttpImageFetcher(),
      new SharpImageProcessor(),
      new VercelBlobStorageService(),
    )
  },

  getCreatePlaceUseCase() {
    return new CreatePlaceUseCase(placeRepo, tagRepo, categoryRepo)
  },

  getUpdatePlaceUseCase() {
    return new UpdatePlaceUseCase(placeRepo, tagRepo, categoryRepo)
  },

  getPublishPlaceUseCase() {
    return new PublishPlaceUseCase(placeRepo)
  },

  getArchivePlaceUseCase() {
    return new ArchivePlaceUseCase(placeRepo)
  },

  getDeletePlaceUseCase() {
    return new DeletePlaceUseCase(placeRepo)
  },

  getRecalculateScoresUseCase() {
    return new RecalculateScoresUseCase(placeRepo)
  },

  // Lazy: el adapter de Apify exige APIFY_TOKEN; se instancia recién al enriquecer.
  getEnrichPlaceRatingUseCase() {
    return new EnrichPlaceRatingUseCase(placeRepo, locationRepo, new ApifyRatingProvider())
  },

  // Adjunta fotos externas (Google Maps vía Apify) rehospedándolas con el pipeline
  // de "Traer". Reusa ImportImageFromUrlUseCase (SSRF + compresión + Blob).
  getAttachPlacePhotosUseCase() {
    return new AttachPlacePhotosUseCase(placeRepo, this.getImportImageFromUrlUseCase())
  },
}
