import { createId } from '@paralleldrive/cuid2'
import { Email } from '@domain/shared/Email'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { EmailAlreadyInUseError } from '@domain/user/errors/EmailAlreadyInUseError'
import { EmailService } from '../ports/EmailService'
import { PasswordHasher } from '../ports/PasswordHasher'
import { UserRepository } from '../ports/UserRepository'

export interface RegisterUserInput {
  email: string
  name: string
  password: string
  homeCommuneId?: string
}

export interface RegisterUserOutput {
  user: User
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email)

    const existing = await this.userRepo.findByEmail(email.value)
    if (existing) throw new EmailAlreadyInUseError(email.value)

    const passwordHash = await this.passwordHasher.hash(input.password)

    const user = User.create({
      id: createId(),
      email,
      name: input.name,
      role: UserRole.USER,
      homeCommuneId: input.homeCommuneId,
      createdAt: new Date(),
    })

    await this.userRepo.create(user, passwordHash)

    // El correo de bienvenida es cortesía, no parte del registro: si falla
    // (key ausente, proveedor caído), el usuario igual queda registrado y puede
    // iniciar sesión. Antes este await tumbaba el registro DESPUÉS de crear la
    // cuenta → 500 + "email ya registrado" al reintentar.
    try {
      await this.emailService.sendWelcome(email.value, input.name)
    } catch (err) {
      console.error('Registro OK pero falló el correo de bienvenida:', err)
    }

    return { user }
  }
}
