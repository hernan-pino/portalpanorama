import { Resend } from 'resend'
import { ClaimReceivedParams, EmailService } from '@application/ports/EmailService'

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
      html: `<p>Hola ${name}, gracias por registrarte en Portal Panorama.</p>`,
    })
  }

  async sendClaimReceived(adminEmail: string, params: ClaimReceivedParams): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to: adminEmail,
      subject: `Claim pendiente: ${params.listingName}`,
      html: `
        <p><strong>${params.claimantName}</strong> solicita reclamar el listing <strong>${params.listingName}</strong>.</p>
        ${params.message ? `<p>Mensaje: ${params.message}</p>` : ''}
        <p>Listing ID: ${params.listingId}</p>
      `,
    })
  }

  async sendClaimApproved(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Tu solicitud para "${listingName}" fue aprobada`,
      html: `<p>¡Felicitaciones! Tu solicitud de reclamar <strong>${listingName}</strong> fue aprobada. Ya puedes administrar tu listing.</p>`,
    })
  }

  async sendClaimRejected(to: string, listingName: string, reviewNote?: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Tu solicitud para "${listingName}" fue rechazada`,
      html: `
        <p>Tu solicitud para reclamar <strong>${listingName}</strong> fue rechazada.</p>
        ${reviewNote ? `<p>Motivo: ${reviewNote}</p>` : ''}
      `,
    })
  }

  async sendPaymentFailed(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Pago fallido para "${listingName}"`,
      html: `<p>El pago de tu suscripción Premium para <strong>${listingName}</strong> no pudo procesarse. Por favor actualiza tu método de pago.</p>`,
    })
  }

  async sendSubscriptionCancelled(to: string, listingName: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Suscripción cancelada para "${listingName}"`,
      html: `<p>Tu suscripción Premium para <strong>${listingName}</strong> ha sido cancelada. Tu listing vuelve al plan Free.</p>`,
    })
  }
}
