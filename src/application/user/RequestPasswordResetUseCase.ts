import { EmailService } from '../ports/EmailService'
import { UserRepository } from '../ports/UserRepository'
import { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository'
import { TokenGenerator } from '../ports/TokenGenerator'

export interface RequestPasswordResetInput {
  email: string
  /** Base absoluta de la app (la provee presentation), p.ej. https://panorama.cl */
  appBaseUrl: string
}

const TOKEN_TTL_MS = 60 * 60_000 // 1 hora

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly tokens: TokenGenerator,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Siempre resuelve sin revelar si el email existe (anti-enumeración). Si existe,
   * genera un token de un uso, guarda su hash y manda el correo con el enlace.
   */
  async execute(input: RequestPasswordResetInput): Promise<void> {
    const user = await this.userRepo.findByEmail(input.email.trim().toLowerCase())
    if (!user) return

    // Un pedido nuevo invalida los anteriores.
    await this.tokenRepo.deleteAllForUser(user.id)

    const rawToken = this.tokens.generate()
    await this.tokenRepo.create({
      userId: user.id,
      tokenHash: this.tokens.hash(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    })

    const resetUrl = `${input.appBaseUrl.replace(/\/$/, '')}/recuperar/nueva?token=${encodeURIComponent(rawToken)}`
    await this.emailService.sendPasswordReset(user.email.value, user.name, resetUrl)
  }
}
