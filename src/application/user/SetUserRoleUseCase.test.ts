import { describe, it, expect, vi } from 'vitest'
import { SetUserRoleUseCase } from './SetUserRoleUseCase'
import { UserRepository } from '@application/ports/UserRepository'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { Email } from '@domain/shared/Email'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { CannotDemoteSelfError } from '@domain/user/errors/CannotDemoteSelfError'

function makeUser(id: string, role: UserRole): User {
  return User.create({
    id,
    email: Email.create(`${id}@test.cl`),
    name: id,
    role,
    createdAt: new Date('2026-01-01'),
  })
}

function deps(target: User | null) {
  const setRole = vi.fn(async () => {})
  const userRepo = { findById: async () => target, setRole } as unknown as UserRepository
  return { userRepo, setRole }
}

describe('SetUserRoleUseCase', () => {
  it('impide que un admin se quite el rol a sí mismo', async () => {
    const { userRepo, setRole } = deps(makeUser('u1', UserRole.ADMIN))
    const uc = new SetUserRoleUseCase(userRepo)
    await expect(
      uc.execute({ actingUserId: 'u1', targetUserId: 'u1', role: UserRole.USER }),
    ).rejects.toBeInstanceOf(CannotDemoteSelfError)
    expect(setRole).not.toHaveBeenCalled()
  })

  it('permite que un admin degrade a OTRO admin', async () => {
    const { userRepo, setRole } = deps(makeUser('u2', UserRole.ADMIN))
    const uc = new SetUserRoleUseCase(userRepo)
    await uc.execute({ actingUserId: 'u1', targetUserId: 'u2', role: UserRole.USER })
    expect(setRole).toHaveBeenCalledWith('u2', UserRole.USER)
  })

  it('promueve un usuario a admin', async () => {
    const { userRepo, setRole } = deps(makeUser('u2', UserRole.USER))
    const uc = new SetUserRoleUseCase(userRepo)
    await uc.execute({ actingUserId: 'u1', targetUserId: 'u2', role: UserRole.ADMIN })
    expect(setRole).toHaveBeenCalledWith('u2', UserRole.ADMIN)
  })

  it('lanza UserNotFoundError si el usuario objetivo no existe', async () => {
    const { userRepo, setRole } = deps(null)
    const uc = new SetUserRoleUseCase(userRepo)
    await expect(
      uc.execute({ actingUserId: 'u1', targetUserId: 'x', role: UserRole.ADMIN }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
    expect(setRole).not.toHaveBeenCalled()
  })

  it('es no-op si el usuario ya tiene ese rol', async () => {
    const { userRepo, setRole } = deps(makeUser('u2', UserRole.ADMIN))
    const uc = new SetUserRoleUseCase(userRepo)
    await uc.execute({ actingUserId: 'u1', targetUserId: 'u2', role: UserRole.ADMIN })
    expect(setRole).not.toHaveBeenCalled()
  })
})
