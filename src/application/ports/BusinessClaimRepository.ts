import { BusinessClaim } from '@domain/business/BusinessClaim'
import { ClaimStatus } from '@domain/business/ClaimStatus'

// Fila de la bandeja de reclamos del admin: el reclamo con su objetivo resuelto
// (nombre/slug del lugar o la marca) y quién lo pide.
export interface ClaimAdminRow {
  id: string
  targetType: 'PLACE' | 'BRAND'
  targetId: string
  targetName: string
  targetSlug: string
  /**
   * ¿El objetivo tiene ficha pública? Las fichas que llegan por "publica tu negocio"
   * nacen PENDING_REVIEW: no tienen /lugar/{slug} todavía y linkearlas daba 404.
   */
  targetIsPublic: boolean
  claimantName: string
  claimantEmail: string
  claimantRole: string | null
  message: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: ClaimStatus
  reviewNotes: string | null
  createdAt: Date
  reviewedAt: Date | null
}

// Solicitud en curso del propio usuario (su panel): mientras el admin no la decide,
// la ficha todavía no es suya y no aparece entre las que gestiona — pero tiene que
// poder ver que la mandó y en qué va.
export interface PendingClaimRow {
  id: string
  targetName: string
  targetType: 'PLACE' | 'BRAND'
  createdAt: Date
}

// Datos mínimos para notificar por correo al reclamante una decisión.
export interface ClaimNotificationContext {
  claimantEmail: string
  claimantName: string
  targetName: string
}

export interface BusinessClaimRepository {
  create(claim: BusinessClaim): Promise<void>
  findById(claimId: string): Promise<BusinessClaim | null>
  /** ¿El usuario ya tiene un reclamo PENDING sobre este objetivo? (anti-duplicados) */
  hasPending(claimantId: string, target: { placeId?: string; brandId?: string }): Promise<boolean>
  /** Estado del objetivo reclamado: no existe, ya tiene dueño, o está libre. */
  targetState(target: { placeId?: string; brandId?: string }): Promise<'MISSING' | 'OWNED' | 'FREE'>
  /**
   * Dueño actual del objetivo (null si no existe, ownerId null si está libre). Permite
   * decidir ANTES de mostrar el formulario si tiene sentido reclamar.
   */
  targetOwnership(target: { placeId?: string; brandId?: string }): Promise<{ ownerId: string | null } | null>
  /** Bandeja del admin: todos los reclamos con su objetivo, recientes primero. */
  listForAdmin(): Promise<ClaimAdminRow[]>
  /** Solicitudes PENDING del propio usuario, para su panel. */
  findPendingByClaimant(claimantId: string): Promise<PendingClaimRow[]>
  /** ¿Tiene solicitudes en curso? (liviano: decide si ve la puerta al panel). */
  countPendingByClaimant(claimantId: string): Promise<number>
  /** Reclamos PENDING → badge "nuevo" en la navegación del admin. */
  countPending(): Promise<number>
  /**
   * Persiste una APROBACIÓN en una sola transacción: el reclamo decidido + el
   * ownerId del Place/Brand reclamado + el BusinessProfile del reclamante
   * (se crea si no existe; se marca verificado). Espejo de la spec §3.
   */
  persistApproval(claim: BusinessClaim): Promise<void>
  /** Persiste un RECHAZO: solo actualiza el reclamo. */
  persistRejection(claim: BusinessClaim): Promise<void>
  /** Contexto para el correo de decisión (null si el reclamo no existe). */
  notificationContext(claimId: string): Promise<ClaimNotificationContext | null>
}
