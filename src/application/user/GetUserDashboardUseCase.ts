import { User } from '@domain/user/User'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { CollectionRepository, CollectionSummary } from '../ports/CollectionRepository'
import { PlaceCardView } from '../ports/PlaceRepository'
import { VisitHistoryRepository } from '../ports/VisitHistoryRepository'
import { UserRepository } from '../ports/UserRepository'

export interface UserDashboardOutput {
  user: User
  collections: CollectionSummary[]
  history: PlaceCardView[]
}

// Datos de "Mi cuenta": listas múltiples + historial de visitados. Las secciones
// "Mis reseñas" y "Mis eventos guardados" existen vacías en el MVP (sin datos aún).
export class GetUserDashboardUseCase {
  private static readonly HISTORY_LIMIT = 20

  constructor(
    private readonly userRepo: UserRepository,
    private readonly collectionRepo: CollectionRepository,
    private readonly historyRepo: VisitHistoryRepository,
  ) {}

  async execute(userId: string): Promise<UserDashboardOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const [collections, history] = await Promise.all([
      this.collectionRepo.findByOwnerId(userId),
      this.historyRepo.findRecentByUserId(userId, GetUserDashboardUseCase.HISTORY_LIMIT),
    ])

    return { user, collections, history }
  }
}
