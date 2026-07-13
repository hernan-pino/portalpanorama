import { PlaceRepository } from '../ports/PlaceRepository'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'

// ¿Mostrarle al usuario la puerta al panel de negocio (header + sidebar de mi-cuenta)?
// No basta con "gestiona alguna ficha": quien acaba de mandar su negocio (o de reclamar
// uno) todavía no gestiona nada —la propiedad se asigna al aprobar el reclamo— y si
// escondiéramos el panel se quedaría sin ver en qué va su solicitud.
export class HasBusinessAccessUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly claimRepo: BusinessClaimRepository,
  ) {}

  async execute(userId: string): Promise<boolean> {
    const [managed, pending] = await Promise.all([
      this.placeRepo.countManagedByUser(userId),
      this.claimRepo.countPendingByClaimant(userId),
    ])
    return managed > 0 || pending > 0
  }
}
