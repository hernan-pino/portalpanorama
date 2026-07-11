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
      preheader: 'Tu cuenta está lista. Empieza a descubrir y guardar lugares.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph('¡Gracias por sumarte a <strong>Portal Panorama</strong>! Ya puedes explorar los mejores lugares de Chile, guardar tus favoritos y armar tus propias listas.') +
        paragraph('¿Por dónde empezar? Busca por comuna, categoría o lo que tengas ganas de hacer.'),
      button: { label: 'Explorar lugares', url: 'https://portalpanorama.cl/explorar' },
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: '¡Bienvenido a Portal Panorama!',
      html,
    })
  }

  async sendClaimReceived(to: string, name: string, targetName: string): Promise<void> {
    const html = renderEmail({
      preheader: 'Recibimos tu reclamo. Lo revisamos a mano y te avisamos por este correo.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph(`Recibimos tu solicitud para reclamar la ficha de <strong>${escapeHtml(targetName)}</strong> en Portal Panorama.`) +
        paragraph('Revisamos cada reclamo a mano para proteger a los negocios: puede que te contactemos al teléfono o correo que dejaste para confirmar que eres parte del equipo del local.') +
        muted('Te avisaremos por este mismo correo apenas tengamos una respuesta. No necesitas hacer nada más.'),
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: `Recibimos tu reclamo de ${targetName} — Portal Panorama`,
      html,
    })
  }

  async sendClaimApproved(to: string, name: string, targetName: string): Promise<void> {
    const html = renderEmail({
      preheader: 'Tu reclamo fue aprobado: la ficha ya está asociada a tu cuenta.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph(`¡Buenas noticias! Aprobamos tu reclamo y la ficha de <strong>${escapeHtml(targetName)}</strong> quedó asociada a tu cuenta.`) +
        paragraph('Estamos construyendo el panel de negocio (editar tu ficha, subir fotos y ver estadísticas de visitas). Te avisaremos por este correo cuando esté disponible; mientras tanto, si necesitas corregir algo de tu ficha, responde este correo y lo actualizamos nosotros.'),
      button: { label: 'Ver mi ficha', url: 'https://portalpanorama.cl/mi-cuenta' },
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: `Tu reclamo de ${targetName} fue aprobado — Portal Panorama`,
      html,
    })
  }

  async sendClaimRejected(to: string, name: string, targetName: string, reason?: string): Promise<void> {
    const html = renderEmail({
      preheader: 'No pudimos aprobar tu reclamo. Aquí te contamos por qué y cómo reintentar.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph(`Revisamos tu solicitud para reclamar la ficha de <strong>${escapeHtml(targetName)}</strong> y esta vez no pudimos aprobarla.`) +
        (reason ? paragraph(`<strong>Motivo:</strong> ${escapeHtml(reason)}`) : '') +
        paragraph('Si crees que es un error o tienes más antecedentes (por ejemplo, un documento o un teléfono del local donde podamos confirmar), responde este correo y lo vemos de nuevo.'),
    })
    await this.client().emails.send({
      from: this.from,
      to,
      subject: `Sobre tu reclamo de ${targetName} — Portal Panorama`,
      html,
    })
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    const html = renderEmail({
      preheader: 'Restablece tu contraseña. El enlace vence en 1 hora.',
      bodyHtml:
        paragraph(`Hola <strong>${escapeHtml(name)}</strong>,`) +
        paragraph('Recibimos un pedido para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva. <strong>El enlace vence en 1 hora.</strong>') +
        muted('Si no pediste esto, puedes ignorar este correo: tu contraseña no cambió.'),
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
