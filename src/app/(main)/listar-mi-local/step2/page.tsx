import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { UserRole } from '@domain/user/UserRole'
import { BusinessForm } from './BusinessForm'

export const metadata: Metadata = { title: 'Datos del negocio — Listar mi local' }

export default async function Step2Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  const { plan } = await searchParams
  const selectedPlan = plan === 'premium' ? 'premium' : 'free'

  if (!session?.user) {
    redirect(`/login?callbackUrl=/listar-mi-local/step2?plan=${selectedPlan}`)
  }

  const role = (session.user as { role?: string }).role
  if (role === UserRole.BUSINESS_OWNER) {
    redirect('/mi-negocio')
  }

  const categories = await container.getGetCategoriesUseCase().execute()

  return (
    <div className="checkout-step-content checkout-step-content--narrow">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 400,
          letterSpacing: 'var(--tr-tight)',
          lineHeight: 1,
          marginBottom: 'var(--s-2)',
          fontVariationSettings: '"opsz" 100',
        }}
      >
        Datos del <em>negocio</em>.
      </h1>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 'var(--s-8)' }}>
        Plan: <strong>{selectedPlan === 'premium' ? 'Premium' : 'Free'}</strong>
        {' · '}Podés completar el resto desde tu panel.
      </p>

      <BusinessForm plan={selectedPlan} categories={categories} />
    </div>
  )
}
