import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'

export const metadata: Metadata = {
  title: 'Mi negocio',
  robots: { index: false },
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publicada',
  PENDING_REVIEW: 'En revisión',
  ARCHIVED: 'Archivada',
}
const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: 'published',
  PENDING_REVIEW: 'pending_review',
  ARCHIVED: 'archived',
}

// Panel de negocio (etapa 4): las fichas que el dueño verificado gestiona, con su
// engagement, y el acceso a editarlas. Requiere sesión.
export default async function MiNegocioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-negocio')

  const { places } = await container.getGetBusinessDashboardUseCase().execute(session.user.id)
  const firstName = (session.user.name ?? '').split(' ')[0]

  return (
    <div className="biz-panel container">
      <header className="biz-panel__head">
        <div>
          <p className="eyebrow">Panel de negocio</p>
          <h1 className="biz-panel__title">Hola{firstName ? `, ${firstName}` : ''}</h1>
          <p className="biz-panel__sub">
            {places.length === 0
              ? 'Aquí verás y gestionarás las fichas de tu negocio.'
              : `Gestionas ${places.length} ${places.length === 1 ? 'ficha' : 'fichas'}.`}
          </p>
        </div>
      </header>

      {places.length === 0 ? (
        <div className="biz-panel__empty">
          <p>Todavía no gestionas ninguna ficha.</p>
          <p className="biz-panel__empty-sub">
            Si tu local ya está en Portal Panorama, búscalo y reclámalo. Revisamos cada reclamo a
            mano y, al aprobarlo, aparecerá aquí.
          </p>
          <div className="biz-panel__empty-actions">
            <Link href="/explorar" className="btn btn--primary btn--sm">Buscar mi local</Link>
            <Link href="/para-negocios" className="btn btn--ghost btn--sm">Cómo funciona</Link>
          </div>
        </div>
      ) : (
        <div className="biz-panel__grid">
          {places.map((p) => (
            <article key={p.id} className="biz-card">
              <div className="biz-card__media">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.name} loading="lazy" />
                ) : (
                  <div className="biz-card__media-empty" aria-hidden="true" />
                )}
                <span className={`admin-badge admin-badge--${STATUS_CLASS[p.status] ?? 'archived'} biz-card__badge`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              <div className="biz-card__body">
                <h2 className="biz-card__name">{p.name}</h2>
                <p className="biz-card__meta">{p.categoryName} · {p.communeName}</p>

                <div className="biz-card__stats">
                  <div className="biz-stat">
                    <span className="biz-stat__num">{p.visitCount}</span>
                    <span className="biz-stat__label">Visitas</span>
                  </div>
                  <div className="biz-stat">
                    <span className="biz-stat__num">{p.saveCount}</span>
                    <span className="biz-stat__label">Guardados</span>
                  </div>
                  <div className="biz-stat">
                    <span className="biz-stat__num">{p.googleRating ? p.googleRating.toFixed(1) : '—'}</span>
                    <span className="biz-stat__label">Google</span>
                  </div>
                </div>

                <div className="biz-card__actions">
                  <Link href={`/mi-negocio/${p.slug}/editar`} className="btn btn--primary btn--sm">
                    Editar ficha
                  </Link>
                  <Link href={`/lugar/${p.slug}`} className="btn btn--ghost btn--sm" target="_blank">
                    Ver ficha ↗
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="biz-panel__foot">
        Las visitas y guardados son de usuarios registrados. Muy pronto sumaremos más estadísticas
        y la gestión de fotos. ¿Necesitas cambiar el nombre, la categoría o la dirección? Escríbenos
        a <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>.
      </p>
    </div>
  )
}
