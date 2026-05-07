import { NextRequest, NextResponse } from 'next/server'
import { container } from '@lib/container'
import { WebhookValidationError } from '@application/errors'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('x-flow-signature') ?? ''
  const timestampHeader = req.headers.get('x-flow-timestamp') ?? ''

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Webhook rechazado' }, { status: 400 })
  }

  if (!rawBody) {
    return NextResponse.json({ error: 'Webhook rechazado' }, { status: 400 })
  }

  try {
    const useCase = container.getHandlePaymentWebhookUseCase()
    await useCase.execute(rawBody, signature, timestampHeader)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof WebhookValidationError) {
      // Firma inválida, timestamp expirado, JSON malformado — Flow no debe reintentar
      return NextResponse.json({ error: 'Webhook rechazado' }, { status: 400 })
    }

    // Error de negocio o infraestructura — Flow reintentará
    console.error('[webhook/flow]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
