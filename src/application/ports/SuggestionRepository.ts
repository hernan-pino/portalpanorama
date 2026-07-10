import { SuggestionKind } from '@domain/suggestion/SuggestionKind'
import { SuggestionStatus } from '@domain/suggestion/SuggestionStatus'

export interface NewSuggestion {
  kind: SuggestionKind
  message: string
  email?: string // contacto opcional para responder
  userId?: string // si estaba logueado
}

// Fila del buzón de admin para una sugerencia.
export interface SuggestionAdminRow {
  id: string
  kind: SuggestionKind
  message: string
  email: string | null // contacto que dejó en el form
  userEmail: string | null // email de la cuenta, si estaba logueado
  status: SuggestionStatus
  createdAt: Date
}

export interface SuggestionRepository {
  create(suggestion: NewSuggestion): Promise<void>
  /** Buzón de admin: todas las sugerencias, recientes primero. */
  listForAdmin(): Promise<SuggestionAdminRow[]>
  /** Sugerencias OPEN (sin revisar) → badge "nuevo" en la navegación del admin. */
  countOpen(): Promise<number>
  /** Cambia el estado (resolver / reabrir). */
  setStatus(suggestionId: string, status: SuggestionStatus): Promise<void>
  /** Borrado duro (spam). */
  delete(suggestionId: string): Promise<void>
}
