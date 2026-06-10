import { PlaceCardView } from './PlaceRepository'

export interface VisitHistoryRepository {
  // Registra una visita (combustible para la IA post-MVP). Idempotencia/dedup
  // por ventana de tiempo = decisión de implementación.
  record(userId: string, placeId: string): Promise<void>
  // Historial reciente del usuario, más nuevo primero.
  findRecentByUserId(userId: string, limit: number): Promise<PlaceCardView[]>
}
