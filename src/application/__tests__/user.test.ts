import { describe, it, expect, vi } from 'vitest'
import { EmailAlreadyInUseError } from '@domain/user/errors/EmailAlreadyInUseError'
import { InvalidEmailError } from '@domain/shared/Email'
import { RegisterUserUseCase } from '../user/RegisterUserUseCase'
import { UserRepository } from '../ports/UserRepository'
import { PasswordHasher } from '../ports/PasswordHasher'
import { EmailService } from '../ports/EmailService'
import { makeUser } from './fixtures'

function mockUserRepo(partial: Partial<UserRepository> = {}): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    addFavorite: vi.fn().mockResolvedValue(undefined),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
    isFavorite: vi.fn().mockResolvedValue(false),
    findFavoriteListings: vi.fn().mockResolvedValue([]),
    findUserIdsWithFavorite: vi.fn().mockResolvedValue([]),
    ...partial,
  }
}

function mockPasswordHasher(): PasswordHasher {
  return {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    verify: vi.fn().mockResolvedValue(true),
  }
}

function mockEmailService(): EmailService {
  return {
    sendWelcome: vi.fn().mockResolvedValue(undefined),
    sendClaimReceived: vi.fn().mockResolvedValue(undefined),
    sendClaimApproved: vi.fn().mockResolvedValue(undefined),
    sendClaimRejected: vi.fn().mockResolvedValue(undefined),
    sendPaymentFailed: vi.fn().mockResolvedValue(undefined),
    sendSubscriptionCancelled: vi.fn().mockResolvedValue(undefined),
  }
}

describe('RegisterUserUseCase', () => {
  it('registra un usuario nuevo y envía email de bienvenida', async () => {
    const userRepo = mockUserRepo()
    const hasher = mockPasswordHasher()
    const email = mockEmailService()
    const useCase = new RegisterUserUseCase(userRepo, hasher, email)

    const { user } = await useCase.execute({
      email: 'nuevo@example.com',
      name: 'Nuevo Usuario',
      password: 'secret123',
    })

    expect(user.email.value).toBe('nuevo@example.com')
    expect(user.name).toBe('Nuevo Usuario')
    expect(hasher.hash).toHaveBeenCalledWith('secret123')
    expect(userRepo.create).toHaveBeenCalledWith(user, 'hashed-password')
    expect(email.sendWelcome).toHaveBeenCalledWith('nuevo@example.com', 'Nuevo Usuario')
  })

  it('lanza error si el email ya está en uso', async () => {
    const existingUser = makeUser()
    const userRepo = mockUserRepo({ findByEmail: vi.fn().mockResolvedValue(existingUser) })
    const useCase = new RegisterUserUseCase(userRepo, mockPasswordHasher(), mockEmailService())

    await expect(
      useCase.execute({ email: 'owner@example.com', name: 'Otro', password: '123456' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError)
  })

  it('lanza error si el email tiene formato inválido', async () => {
    const useCase = new RegisterUserUseCase(
      mockUserRepo(),
      mockPasswordHasher(),
      mockEmailService(),
    )

    await expect(
      useCase.execute({ email: 'no-es-un-email', name: 'Test', password: '123456' }),
    ).rejects.toBeInstanceOf(InvalidEmailError)
  })
})
