import { UserRepository } from '@application/ports/UserRepository'
import { AdminUserRow } from './AdminUserRow'

// Tabla del panel de admin: todos los usuarios registrados con sus métricas.
// El repo ordena por createdAt desc (los más nuevos primero).
export class ListUsersForAdminUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  execute(): Promise<AdminUserRow[]> {
    return this.userRepo.listForAdmin()
  }
}
