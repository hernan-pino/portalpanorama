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

// Desglose de la intención de contacto. Es lo accionable para el dueño: el rating
// de Google no va — ya se ve en su propia ficha y él no lo mueve desde acá.
const CLICK_BREAKDOWN = [
  { key: 'directions', label: 'Cómo llegar' },
  { key: 'website', label: 'Sitio web' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'menu', label: 'Carta' },
  { key: 'social', label: 'Otras redes' },
] as const

// Lo que todavía no existe pero viene: se muestra honesto como "pronto", nunca
// como si ya funcionara.
const SOON_ITEMS = ['Reseñas', 'Estadísticas avanzadas', 'Eventos', 'Publicidad']

// Panel de negocio (etapa 4): las fichas que el dueño verificado gestiona, con su
// engagement real y el estado de completitud de cada ficha. Requiere sesión.
export default async function MiNegocioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-negocio')

  const { places, totals } = await container.getGetBusinessDashboardUseCase().execute(session.user.id)
  const firstName = (session.user.name ?? '').split(' ')[0]
  const hasPlaces = places.length > 0

  return (
    <div className="biz-shell container">
      {/* ── Sidebar ── */}
      <aside className="biz-side">
        <p className="eyebrow">Panel de negocio</p>
        <nav className="biz-nav" aria-label="Secciones del panel">
          <span className="biz-nav__item biz-nav__item--active" aria-current="page">Resumen</span>
          {SOON_ITEMS.map((label) => (
            <span key={label} className="biz-nav__item biz-nav__item--soon">
              {label}
              <span className="biz-tag biz-tag--soon">Pronto</span>
            </span>
          ))}
          <Link href="/mi-cuenta" className="biz-nav__item biz-nav__item--link">
            Mi cuenta personal <span aria-hidden="true">↗</span>
          </Link>
        </nav>
        <div className="biz-side__note">
          <p>¿Necesitas cambiar el nombre, la categoría o la dirección?</p>
          <p>Esos datos los ajustamos nosotros: escríbenos a{' '}
            <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>.
          </p>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <main className="biz-main">
        <header className="biz-main__head">
          <div>
            <h1 className="biz-main__title">Hola{firstName ? `, ${firstName}` : ''}</h1>
            <p className="biz-main__sub">
              {hasPlaces
                ? `Gestionas ${places.length} ${places.length === 1 ? 'ficha' : 'fichas'}. Mantenla completa para aparecer mejor.`
                : 'Aquí verás y gestionarás las fichas de tu negocio.'}
            </p>
          </div>
          {hasPlaces && (
            <Link href="/mi-negocio/nuevo" className="btn btn--ghost btn--sm">+ Publicar otro negocio</Link>
          )}
        </header>

        {!hasPlaces ? (
          <div className="biz-panel__empty">
            <p>Todavía no gestionas ninguna ficha.</p>
            <p className="biz-panel__empty-sub">
              Si tu local ya está en Portal Panorama, búscalo y reclámalo. Si todavía no está,
              publícalo tú y armamos su ficha. Revisamos todo a mano y, al aprobarlo, aparecerá aquí.
            </p>
            <div className="biz-panel__empty-actions">
              <Link href="/explorar" className="btn btn--primary btn--sm">Buscar mi local</Link>
              <Link href="/mi-negocio/nuevo" className="btn btn--ghost btn--sm">Publicar mi negocio</Link>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs agregados (datos reales) */}
            <section className="biz-kpis" aria-label="Resumen">
              <div className="biz-kpi">
                <span className="biz-kpi__num">{totals.placeCount}</span>
                <span className="biz-kpi__label">{totals.placeCount === 1 ? 'Ficha' : 'Fichas'}</span>
              </div>
              <div className="biz-kpi">
                <span className="biz-kpi__num">{totals.visits}</span>
                <span className="biz-kpi__label">Visitas</span>
              </div>
              <div className="biz-kpi">
                <span className="biz-kpi__num">{totals.saves}</span>
                <span className="biz-kpi__label">Guardados</span>
              </div>
              <div className="biz-kpi">
                <span className="biz-kpi__num">{totals.clicks}</span>
                <span className="biz-kpi__label">Clics de contacto</span>
              </div>
            </section>

            {/* Fichas: estado de completitud + desglose real */}
            <section aria-label="Tus fichas" className="biz-fiches">
              {places.map((p) => (
                <article key={p.id} className="biz-fiche">
                  <div className="biz-fiche__media">
                    {p.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverUrl} alt={p.name} loading="lazy" />
                    ) : (
                      <div className="biz-fiche__media-empty" aria-hidden="true" />
                    )}
                    <span className={`admin-badge admin-badge--${STATUS_CLASS[p.status] ?? 'archived'} biz-fiche__badge`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>

                  <div className="biz-fiche__body">
                    <div className="biz-fiche__top">
                      <div>
                        <h2 className="biz-fiche__name">{p.name}</h2>
                        <p className="biz-fiche__meta">{p.categoryName} · {p.communeName}</p>
                      </div>
                      <div className="biz-fiche__actions">
                        <Link href={`/mi-negocio/${p.slug}/editar`} className="btn btn--primary btn--sm">Editar</Link>
                        {/* Una ficha no publicada no tiene página pública: el link daría 404. */}
                        {p.status === 'PUBLISHED' && (
                          <Link href={`/lugar/${p.slug}`} className="btn btn--ghost btn--sm" target="_blank">Ver ↗</Link>
                        )}
                      </div>
                    </div>

                    {p.status === 'PENDING_REVIEW' && (
                      <p className="biz-fiche__note">
                        La estamos completando: investigamos tu negocio y le sumamos fotos, descripción
                        y horario antes de publicarla. Te avisamos por correo cuando esté en línea.
                      </p>
                    )}

                    {/* Desglose real por ficha */}
                    <div className="biz-fiche__stats">
                      <div className="biz-stat">
                        <span className="biz-stat__num">{p.visitCount}</span>
                        <span className="biz-stat__label">Visitas</span>
                      </div>
                      <div className="biz-stat">
                        <span className="biz-stat__num">{p.saveCount}</span>
                        <span className="biz-stat__label">Guardados</span>
                      </div>
                      <div className="biz-stat">
                        <span className="biz-stat__num">{p.clicks.total}</span>
                        <span className="biz-stat__label">Clics</span>
                      </div>
                    </div>

                    {/* Qué hace la gente al llegar a tu ficha (intención de contacto) */}
                    <ul className="biz-clicks" aria-label="Clics de contacto">
                      {CLICK_BREAKDOWN.map(({ key, label }) => (
                        <li key={key} className="biz-clicks__item">
                          <span className="biz-clicks__label">{label}</span>
                          <span className="biz-clicks__num">{p.clicks[key]}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Estado de la ficha (completitud) */}
                    <div className="biz-meter">
                      <div className="biz-meter__head">
                        <span className="biz-meter__title">Estado de tu ficha</span>
                        <span className="biz-meter__pct">
                          {p.completedCount}/{p.totalCount} · {p.completenessPct}%
                        </span>
                      </div>
                      <div className="biz-meter__bar" role="progressbar" aria-valuenow={p.completenessPct} aria-valuemin={0} aria-valuemax={100}>
                        <span className="biz-meter__fill" style={{ width: `${p.completenessPct}%` }} />
                      </div>
                      <ul className="biz-check">
                        {p.checklist.map((item) => (
                          <li key={item.label} className={`biz-check__item ${item.done ? 'is-done' : 'is-todo'}`}>
                            <span className="biz-check__mark" aria-hidden="true">{item.done ? '✓' : '○'}</span>
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <p className="biz-main__foot">
          Las visitas y guardados son de usuarios registrados en Portal Panorama. Muy pronto
          sumaremos más estadísticas, la gestión de fotos y los eventos.
        </p>
      </main>
    </div>
  )
}
