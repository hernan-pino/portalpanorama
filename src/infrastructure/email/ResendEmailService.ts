import { Resend } from 'resend'
import { EmailService } from '@application/ports/EmailService'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export class ResendEmailService implements EmailService {
  private resend?: Resend
  private readonly from: string

  // No se valida la API key al construir: un servicio de email no debe tumbar
  // rutas que no mandan correo (el container instancia todos los adapters al cargar).
  // La key se exige recién al enviar (lazy), donde sí importa.
  constructor() {
    this.from = process.env.EMAIL_FROM ?? 'Portal Panorama <hola@portalpanorama.cl>'
  }

  private client(): Resend {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) throw new Error('RESEND_API_KEY is not set')
      this.resend = new Resend(apiKey)
    }
    return this.resend
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.client().emails.send({
      from: this.from,
      to,
      subject: '¡Bienvenido a Portal Panorama!',
      html: `<p>Hola ${escapeHtml(name)}, gracias por registrarte en Portal Panorama.</p>`,
    })
  }
}
