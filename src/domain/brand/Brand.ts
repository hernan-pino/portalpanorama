import { Slug } from '@domain/shared/Slug'
import { BrandNameRequiredError } from './errors/BrandNameRequiredError'

// Red social extra de la marca (WhatsApp/Facebook/TikTok…). Instagram va aparte
// como campo propio. Informativo, sin invariantes (igual que en Place).
export interface BrandSocialLink {
  readonly network: string
  readonly url: string
}

export interface BrandProps {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly logoUrl?: string
  readonly description?: string
  readonly website?: string
  readonly instagram?: string
  readonly socialLinks: ReadonlyArray<BrandSocialLink>
  readonly createdAt: Date
  readonly updatedAt: Date
}

// Aggregate liviano: identidad comercial que agrupa sucursales (Place) y, a futuro,
// su cartelera (Event). No tiene ubicación propia — eso vive en cada Place. La
// relación con los lugares se resuelve por `brandId` en Place (no se carga acá).
export class Brand {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly logoUrl?: string
  readonly description?: string
  readonly website?: string
  readonly instagram?: string
  readonly socialLinks: ReadonlyArray<BrandSocialLink>
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: BrandProps) {
    this.id = props.id
    this.slug = props.slug
    this.name = props.name
    this.logoUrl = props.logoUrl
    this.description = props.description
    this.website = props.website
    this.instagram = props.instagram
    this.socialLinks = props.socialLinks
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  // Valida los invariantes al construir: lo usan tanto la carga desde BD como la
  // creación, así una marca mal formada nunca existe como objeto de dominio.
  static create(props: BrandProps): Brand {
    if (props.name.trim().length === 0) throw new BrandNameRequiredError()
    return new Brand(props)
  }
}
