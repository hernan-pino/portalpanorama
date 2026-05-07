import { Resend } from 'resend'
import { ClaimReceivedParams, EmailService } from '@application/ports/EmailService'

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

  async sendClaimReceived(adminEmail: string, params: ClaimReceivedParams): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to: adminEmail,
      subject: `Claim pendiente: ${escapeHtml(params.listingName)}`,
      html: `
        <p><strong>${escapeHtml(params.claimantName)}</strong> solicita reclamar el listing <strong>${escapeHtml(params.listingName)}</strong>.</p>
        ${params.message ? `<p>Mensaje: ${escapeHtml(params.message)}</p>` : ''}
        <p>Listing ID: ${escapeHtml(params.listingId)}</p>
      `,
    })
  }

  async sendClaimApproved(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Tu solicitud para "${escapeHtml(listingName)}" fue aprobada`,
      html: `<p>¡Felicitaciones! Tu solicitud de reclamar <strong>${escapeHtml(listingName)}</strong> fue aprobada. Ya puedes administrar tu listing.</p>`,
    })
  }

  async sendClaimRejected(to: string, listingName: string, reviewNote?: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Tu solicitud para "${escapeHtml(listingName)}" fue rechazada`,
      html: `
        <p>Tu solicitud para reclamar <strong>${escapeHtml(listingName)}</strong> fue rechazada.</p>
        ${reviewNote ? `<p>Motivo: ${escapeHtml(reviewNote)}</p>` : ''}
      `,
    })
  }

  async sendPaymentFailed(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Pago fallido para "${escapeHtml(listingName)}"`,
      html: `<p>El pago de tu suscripción Premium para <strong>${escapeHtml(listingName)}</strong> no pudo procesarse. Por favor actualiza tu método de pago.</p>`,
    })
  }

  async sendSubscriptionCancelled(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Suscripción cancelada para "${escapeHtml(listingName)}"`,
      html: `<p>Tu suscripción Premium para <strong>${escapeHtml(listingName)}</strong> ha sido cancelada. Tu listing vuelve al plan Free.</p>`,
    })
  }
}
