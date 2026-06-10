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
  private readonly resend: Resend
  private readonly from: string

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not set')
    this.resend = new Resend(apiKey)
    this.from = process.env.EMAIL_FROM ?? 'Portal Panorama <hola@portalpanorama.cl>'
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: '¡Bienvenido a Portal Panorama!',
      html: `<p>Hola ${escapeHtml(name)}, gracias por registrarte en Portal Panorama.</p>`,
    })
  }
}
