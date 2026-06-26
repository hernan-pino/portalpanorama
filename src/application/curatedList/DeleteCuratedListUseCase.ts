import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { CuratedListRepository } from '../ports/CuratedListRepository'

// Borrado duro de una lista curada (irreversible). Los destacados (CuratedListPin)
// caen por Cascade. No toca los Place. Para esconderla sin borrar está despublicar.
export class DeleteCuratedListUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.listRepo.findById(id)
    if (!existing) throw new CuratedListNotFoundError(id)
    await this.listRepo.delete(id)
  }
}
