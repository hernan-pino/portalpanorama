import { PlaceClickRepository } from '../ports/PlaceClickRepository'
import { PlaceClickKind } from '@domain/place/PlaceClickKind'

// Registra la intención de contacto (clic en cómo llegar / web / IG / teléfono /
// carta / otra red) para las métricas del panel del dueño. Es fire-and-forget desde
// la ficha: no debe romper la navegación del usuario si falla la escritura.
export class RecordPlaceClickUseCase {
  constructor(private readonly clickRepo: PlaceClickRepository) {}

  async execute(placeId: string, kind: PlaceClickKind): Promise<void> {
    await this.clickRepo.record(placeId, kind)
  }
}
