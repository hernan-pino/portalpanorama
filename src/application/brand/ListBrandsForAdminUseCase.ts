import { BrandAdminRow, BrandRepository } from '../ports/BrandRepository'

// Tabla del panel de admin: todas las marcas con su conteo de sucursales.
export class ListBrandsForAdminUseCase {
  constructor(private readonly brandRepo: BrandRepository) {}

  async execute(): Promise<BrandAdminRow[]> {
    return this.brandRepo.listForAdmin()
  }
}
