import { describe, it, expect, vi } from 'vitest'
import { DeleteUserUseCase } from './DeleteUserUseCase'
import { UserRepository } from '@application/ports/UserRepository'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { Email } from '@domain/shared/Email'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { CannotDeleteSelfError } from '@domain/user/errors/CannotDeleteSelfError'

function makeUser(id: string): User {
  return User.create({
    id,
    email: Email.create(`${id}@test.cl`),
    name: id,
    role: UserRole.USER,
    createdAt: new Date('2026-01-01'),
  })
}

function deps(target: User | null) {
  const del = vi.fn(async () => {})
  const userRepo = { findById: async () => target, delete: del } as unknown as UserRepository
  return { userRepo, del }
}

describe('DeleteUserUseCase', () => {
  it('impide que un admin se borre a sí mismo', async () => {
    const { userRepo, del } = deps(makeUser('u1'))
    const uc = new DeleteUserUseCase(userRepo)
    await expect(
      uc.execute({ actingUserId: 'u1', targetUserId: 'u1' }),
    ).rejects.toBeInstanceOf(CannotDeleteSelfError)
    expect(del).not.toHaveBeenCalled()
  })

  it('lanza UserNotFoundError si el usuario objetivo no existe', async () => {
    const { userRepo, del } = deps(null)
    const uc = new DeleteUserUseCase(userRepo)
    await expect(
      uc.execute({ actingUserId: 'u1', targetUserId: 'x' }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
    expect(del).not.toHaveBeenCalled()
  })

  it('borra a otro usuario existente', async () => {
    const { userRepo, del } = deps(makeUser('u2'))
    const uc = new DeleteUserUseCase(userRepo)
    await uc.execute({ actingUserId: 'u1', targetUserId: 'u2' })
    expect(del).toHaveBeenCalledWith('u2')
  })
})
