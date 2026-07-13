import { Slug } from '@domain/shared/Slug'
import { PlaceAlreadyExistsError } from '@domain/place/errors/PlaceAlreadyExistsError'
import { InvalidCommuneError } from '@domain/place/errors/InvalidCommuneError'
import { PlaceRepository } from '../ports/PlaceRepository'
import { LocationRepository } from '../ports/LocationRepository'
import { CreatePlaceUseCase } from '../place/CreatePlaceUseCase'
import { CreateBusinessClaimUseCase } from './CreateBusinessClaimUseCase'

// Lo mínimo que el dueño sabe de memoria. La ficha final NO sale de aquí: esto es
// un lead: el admin la investiga con la skill `ficha-lugar` (fotos, rating, tags,
// descripción) antes de publicarla.
export interface OwnedPlaceSeedInput {
  submitterId: string
  submitterName: string
  submitterEmail: string
  name: string
  address: string
  communeId: string
  categoryId: string
  subcategoryId: string
  role?: string
  phone?: string
  instagram?: string
}

// Tercera puerta de entrada de un Place (las otras dos: carga del admin y reclamo de
// una ficha existente). La ficha nace PENDING_REVIEW y **SIN dueño**: quien la manda
// no queda como dueño por el solo hecho de mandarla — se le abre un BusinessClaim que
// el admin aprueba como cualquier otro reclamo, y recién ahí se le asigna el ownerId
// y el BusinessProfile verificado.
//
// Que la propiedad NO se asigne aquí es lo que impide el squatting: si alguien manda
// la semilla de un local ajeno, el dueño real todavía puede reclamarlo (dos reclamos
// compiten y decide el admin) en vez de encontrarse la ficha ya "con dueño".
export class CreateOwnedPlaceSeedUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly locationRepo: LocationRepository,
    private readonly createPlace: CreatePlaceUseCase,
    private readonly createClaim: CreateBusinessClaimUseCase,
  ) {}

  async execute(input: OwnedPlaceSeedInput): Promise<{ placeId: string }> {
    // Si el local ya está en el directorio, la puerta correcta es el reclamo, no una
    // ficha nueva: cortamos antes de chocar con el slug único y la action lo deriva.
    const slug = Slug.generate(input.name).value
    if (await this.placeRepo.findBySlug(slug)) throw new PlaceAlreadyExistsError(slug)

    // La comuna es del catálogo, no texto libre: un id inventado moriría como error de
    // FK en Prisma. (Categoría y subcategoría las valida CreatePlaceUseCase.)
    const communes = await this.locationRepo.listCommunes()
    if (!communes.some((c) => c.id === input.communeId)) throw new InvalidCommuneError(input.communeId)

    const { placeId } = await this.createPlace.execute({
      name: input.name,
      address: input.address,
      communeId: input.communeId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      phone: input.phone,
      instagram: input.instagram,
      // El resto de la ficha lo completa el admin con la skill; la semilla no los pide.
      paymentMethods: [],
      socialLinks: [],
      tagIds: [],
      images: [],
      points: [],
    })

    // El reclamo es lo que convierte al remitente en dueño (cuando el admin lo aprueba):
    // deja la solicitud en la bandeja de siempre y le manda el correo con el paso de
    // verificación. Si fallara, la ficha queda igual como lead sin dueño en el admin.
    await this.createClaim.execute({
      claimantId: input.submitterId,
      claimantName: input.submitterName,
      claimantEmail: input.submitterEmail,
      placeId,
      targetName: input.name,
      claimantRole: input.role,
      message: 'Ficha creada por el dueño desde “Publica tu negocio”.',
      contactPhone: input.phone,
    })

    return { placeId }
  }
}
