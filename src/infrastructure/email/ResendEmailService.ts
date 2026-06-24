import { Resend } from 'resend'
import { EmailService } from '@application/ports/EmailService'
import { renderEmail, paragraph, muted, escapeHtml } from './emailLayout'

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
    const html = renderEmail({
      preheader: 'Tu cuenta está lista. Empezá a descubrir y guardar lugares.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph('¡Gracias por sumarte a <strong>Portal Panorama</strong>! Ya podés explorar los mejores lugares de Chile, guardar tus favoritos y armar tus propias listas.') +
        paragraph('¿Por dónde empezar? Buscá por comuna, categoría o lo que tengas ganas de hacer.'),
      button: { label: 'Explorar lugares', url: 'https://portalpanorama.cl/explorar' },
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: '¡Bienvenido a Portal Panorama!',
      html,
    })
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    const html = renderEmail({
      preheader: 'Restablecé tu contraseña. El enlace vence en 1 hora.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph('Recibimos un pedido para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva. <strong>El enlace vence en 1 hora.</strong>') +
        muted('Si no pediste esto, podés ignorar este correo: tu contraseña no cambió.'),
      button: { label: 'Restablecer mi contraseña', url: resetUrl },
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: 'Recupera tu contraseña — Portal Panorama',
      html,
    })
  }
}
