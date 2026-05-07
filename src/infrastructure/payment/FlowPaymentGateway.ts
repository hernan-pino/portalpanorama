import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { Money } from '@domain/shared/Money'
import {
  PaymentGateway,
  CreateSubscriptionParams,
  CreateSubscriptionResult,
  WebhookEvent,
} from '@application/ports/PaymentGateway'
import { WebhookValidationError } from '@application/errors'

// Máxima antigüedad permitida para un webhook (D13: anti-replay)
const MAX_WEBHOOK_AGE_SECONDS = 300

export class FlowPaymentGateway implements PaymentGateway {
  private readonly apiKey: string
  private readonly secretKey: string
  private readonly baseUrl: string

  constructor() {
    this.apiKey = process.env.FLOW_API_KEY ?? ''
    this.secretKey = process.env.FLOW_SECRET_KEY ?? ''
    this.baseUrl = process.env.FLOW_API_URL ?? 'https://www.flow.cl/api'

    if (!this.apiKey || !this.secretKey) {
      throw new Error('FLOW_API_KEY y FLOW_SECRET_KEY son requeridos')
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
    const body = new URLSearchParams({
      apiKey: this.apiKey,
      planId: params.flowPlanId,
      returnUrl: params.returnUrl,
    })

    const signed = this.sign(body)

    const response = await fetch(`${this.baseUrl}/subscription/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: signed.toString(),
    })

    if (!response.ok) {
      throw new Error(`Flow API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as { url: string; token: string }
    return { paymentUrl: `${data.url}?token=${data.token}` }
  }

  async cancelSubscription(flowSubId: string): Promise<void> {
    const body = new URLSearchParams({
      apiKey: this.apiKey,
      subscriptionId: flowSubId,
    })

    const signed = this.sign(body)

    const response = await fetch(`${this.baseUrl}/subscription/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: signed.toString(),
    })

    if (!response.ok) {
      throw new Error(`Flow cancel error: ${response.status} ${response.statusText}`)
    }
  }

  async parseWebhookEvent(
    rawBody: string,
    signature: string,
    timestampHeader: string,
  ): Promise<WebhookEvent> {
    // D13: validar que el webhook no es un replay (timestamp < 5 min)
    // Math.abs previene que timestamps futuros burlen la ventana
    const eventTimestamp = parseInt(timestampHeader, 10)
    const nowSeconds = Math.floor(Date.now() / 1000)

    if (isNaN(eventTimestamp) || Math.abs(nowSeconds - eventTimestamp) > MAX_WEBHOOK_AGE_SECONDS) {
      throw new WebhookValidationError('Webhook rechazado: timestamp expirado o inválido')
    }

    // Verificar firma HMAC-SHA256 sobre el raw body (D20: anti timing attack)
    // Rechazar firmas que no sean exactamente 64 hex chars antes de construir el Buffer
    if (!/^[0-9a-f]{64}$/i.test(signature)) {
      throw new WebhookValidationError('Webhook rechazado: firma inválida')
    }
    const expectedSig = createHmac('sha256', this.secretKey).update(rawBody).digest('hex')
    const expectedBuf = Buffer.from(expectedSig, 'hex')
    const actualBuf = Buffer.from(signature, 'hex')

    if (!timingSafeEqual(expectedBuf, actualBuf)) {
      throw new WebhookValidationError('Webhook rechazado: firma inválida')
    }

    // Parsear JSON solo después de verificar la firma
    let event: Record<string, unknown>
    try {
      event = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      throw new WebhookValidationError('Webhook rechazado: body JSON inválido')
    }
    const eventType = event.event as string
    const subscriptionData = event.subscription as Record<string, unknown>

    const type = this.mapEventType(eventType)
    const flowSubId = String(subscriptionData.subscriptionId)
    const flowPlanId = String(subscriptionData.planId)
    const listingId = String(subscriptionData.customField ?? event.commerceOrder)
    const rawAmount = Number(subscriptionData.amount)
    if (isNaN(rawAmount)) throw new WebhookValidationError('Monto inválido en webhook de Flow')
    const amount = Math.round(rawAmount)
    const periodEnd = subscriptionData.periodEnd
      ? new Date(String(subscriptionData.periodEnd))
      : undefined

    return {
      type,
      flowSubId,
      flowPlanId,
      listingId,
      pricePerMonth: Money.create(amount),
      currentPeriodEnd: periodEnd,
    }
  }

  private mapEventType(
    flowEvent: string,
  ): 'subscription.activated' | 'payment.failed' | 'subscription.cancelled' {
    switch (flowEvent) {
      case 'subscription_created':
      case 'subscription_renewal':
        return 'subscription.activated'
      case 'payment_rejected':
        return 'payment.failed'
      case 'subscription_cancelled':
        return 'subscription.cancelled'
      default:
        throw new WebhookValidationError(`Evento de Flow desconocido: ${flowEvent}`)
    }
  }

  private sign(params: URLSearchParams): URLSearchParams {
    // Flow firma concatenando los params ordenados + secretKey
    const keys = Array.from(params.keys()).sort()
    const toSign = keys.map((k) => `${k}${params.get(k)}`).join('') + this.secretKey

    const sig = createHash('sha256').update(toSign).digest('hex')

    const signed = new URLSearchParams(params)
    signed.append('s', sig)
    return signed
  }
}
