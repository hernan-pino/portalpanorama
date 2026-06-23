import { User } from '@domain/user/User'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User, passwordHash: string): Promise<void>
  save(user: User): Promise<void>
  updatePassword(userId: string, passwordHash: string): Promise<void>
}
