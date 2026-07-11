import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import {
  BusinessClaimRepository,
  ClaimAdminRow,
  ClaimNotificationContext,
} from '@application/ports/BusinessClaimRepository'
import { BusinessClaim } from '@domain/business/BusinessClaim'
import { ClaimStatus } from '@domain/business/ClaimStatus'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'

export class PrismaBusinessClaimRepository implements BusinessClaimRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(claim: BusinessClaim): Promise<void> {
    await this.prisma.businessClaim.create({ data: this.toRow(claim) })
  }

  async findById(claimId: string): Promise<BusinessClaim | null> {
    const row = await this.prisma.businessClaim.findUnique({ where: { id: claimId } })
    if (!row) return null
    return BusinessClaim.create({
      id: row.id,
      claimantId: row.claimantId,
      placeId: row.placeId ?? undefined,
      brandId: row.brandId ?? undefined,
      claimantRole: row.claimantRole ?? undefined,
      message: row.message ?? undefined,
      evidenceUrl: row.evidenceUrl ?? undefined,
      contactPhone: row.contactPhone ?? undefined,
      contactEmail: row.contactEmail ?? undefined,
      status: row.status as ClaimStatus,
      reviewedById: row.reviewedById ?? undefined,
      reviewNotes: row.reviewNotes ?? undefined,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt ?? undefined,
    })
  }

  async hasPending(
    claimantId: string,
    target: { placeId?: string; brandId?: string },
  ): Promise<boolean> {
    const count = await this.prisma.businessClaim.count({
      where: {
        claimantId,
        status: ClaimStatus.PENDING,
        ...(target.placeId ? { placeId: target.placeId } : {}),
        ...(target.brandId ? { brandId: target.brandId } : {}),
      },
    })
    return count > 0
  }

  async targetState(target: {
    placeId?: string
    brandId?: string
  }): Promise<'MISSING' | 'OWNED' | 'FREE'> {
    if (target.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { id: target.placeId },
        select: { ownerId: true },
      })
      if (!place) return 'MISSING'
      return place.ownerId ? 'OWNED' : 'FREE'
    }
    if (target.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: target.brandId },
        select: { ownerId: true },
      })
      if (!brand) return 'MISSING'
      return brand.ownerId ? 'OWNED' : 'FREE'
    }
    return 'MISSING'
  }

  async listForAdmin(): Promise<ClaimAdminRow[]> {
    const rows = await this.prisma.businessClaim.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        claimantRole: true,
        message: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        reviewNotes: true,
        createdAt: true,
        reviewedAt: true,
        claimant: { select: { name: true, email: true } },
        place: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      targetType: r.place ? ('PLACE' as const) : ('BRAND' as const),
      targetName: r.place?.name ?? r.brand?.name ?? '—',
      targetSlug: r.place?.slug ?? r.brand?.slug ?? '',
      claimantName: r.claimant.name,
      claimantEmail: r.claimant.email,
      claimantRole: r.claimantRole,
      message: r.message,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      status: r.status as ClaimStatus,
      reviewNotes: r.reviewNotes,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
    }))
  }

  async countPending(): Promise<number> {
    return this.prisma.businessClaim.count({ where: { status: ClaimStatus.PENDING } })
  }

  // Aprobación = una transacción: reclamo decidido + ownerId del objetivo +
  // BusinessProfile del reclamante (se crea si falta; se marca verificado).
  async persistApproval(claim: BusinessClaim): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.businessClaim.update({ where: { id: claim.id }, data: this.decisionData(claim) })

      // Setea el owner SOLO si el objetivo sigue libre. Si otro reclamo del mismo
      // lugar/marca ya fue aprobado (ownerId ≠ null), `count === 0` → abortamos la
      // transacción para no pisar al dueño legítimo (evita el TOCTOU aprobar-dos-veces).
      if (claim.placeId) {
        const { count } = await tx.place.updateMany({
          where: { id: claim.placeId, ownerId: null },
          data: { ownerId: claim.claimantId },
        })
        if (count === 0) throw new TargetAlreadyOwnedError()
      }
      if (claim.brandId) {
        const { count } = await tx.brand.updateMany({
          where: { id: claim.brandId, ownerId: null },
          data: { ownerId: claim.claimantId },
        })
        if (count === 0) throw new TargetAlreadyOwnedError()
      }

      const existing = await tx.businessProfile.findUnique({
        where: { userId: claim.claimantId },
        select: { id: true, verifiedAt: true },
      })
      if (!existing) {
        await tx.businessProfile.create({
          data: {
            id: createId(),
            userId: claim.claimantId,
            contactEmail: claim.contactEmail ?? null,
            contactPhone: claim.contactPhone ?? null,
            verifiedAt: claim.reviewedAt ?? new Date(),
          },
        })
      } else if (!existing.verifiedAt) {
        await tx.businessProfile.update({
          where: { id: existing.id },
          data: { verifiedAt: claim.reviewedAt ?? new Date() },
        })
      }
    })
  }

  async persistRejection(claim: BusinessClaim): Promise<void> {
    await this.prisma.businessClaim.update({
      where: { id: claim.id },
      data: this.decisionData(claim),
    })
  }

  async notificationContext(claimId: string): Promise<ClaimNotificationContext | null> {
    const row = await this.prisma.businessClaim.findUnique({
      where: { id: claimId },
      select: {
        claimant: { select: { name: true, email: true } },
        place: { select: { name: true } },
        brand: { select: { name: true } },
      },
    })
    if (!row) return null
    return {
      claimantEmail: row.claimant.email,
      claimantName: row.claimant.name,
      targetName: row.place?.name ?? row.brand?.name ?? 'tu negocio',
    }
  }

  private toRow(claim: BusinessClaim) {
    return {
      id: claim.id,
      claimantId: claim.claimantId,
      placeId: claim.placeId ?? null,
      brandId: claim.brandId ?? null,
      claimantRole: claim.claimantRole ?? null,
      message: claim.message ?? null,
      evidenceUrl: claim.evidenceUrl ?? null,
      contactPhone: claim.contactPhone ?? null,
      contactEmail: claim.contactEmail ?? null,
      status: claim.status,
      reviewedById: claim.reviewedById ?? null,
      reviewNotes: claim.reviewNotes ?? null,
      createdAt: claim.createdAt,
      reviewedAt: claim.reviewedAt ?? null,
    }
  }

  private decisionData(claim: BusinessClaim) {
    return {
      status: claim.status,
      reviewedById: claim.reviewedById ?? null,
      reviewNotes: claim.reviewNotes ?? null,
      reviewedAt: claim.reviewedAt ?? null,
    }
  }
}
