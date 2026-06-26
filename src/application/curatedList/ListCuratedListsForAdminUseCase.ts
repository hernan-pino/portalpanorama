import { CuratedListAdminRow, CuratedListRepository } from '../ports/CuratedListRepository'

// Tabla del panel de admin: todas las listas curadas (cualquier estado).
export class ListCuratedListsForAdminUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  execute(): Promise<CuratedListAdminRow[]> {
    return this.listRepo.listForAdmin()
  }
}
