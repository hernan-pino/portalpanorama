import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'

export const metadata: Metadata = { title: 'Cobertura — Admin' }

// Vista de cobertura del catálogo: cuántos lugares hay por categoría › subcategoría,
// resaltando las vacías. Guía la carga ("¿cuáles me faltan?"). El guard ADMIN lo da
// el layout de /admin.
export default async function CoberturaPage() {
  const coverage = await container.getGetCatalogCoverageUseCase().execute()
  const totalPlaces = coverage.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Cobertura del catálogo</h1>
          <p className="admin-page__sub">
            {totalPlaces} lugares cargados · las subcategorías en <strong>0</strong> son las que faltan
          </p>
        </div>
        <Link href="/admin/lugares/nuevo" className="btn btn--primary">+ Nuevo lugar</Link>
      </header>

      <div className="coverage">
        {coverage.map((cat) => (
          <section key={cat.name} className="coverage__cat">
            <h2 className="coverage__cat-title">
              {cat.name} <span className="coverage__cat-count">{cat.total}</span>
            </h2>
            <ul className="coverage__list">
              {cat.subcategories.map((s) => (
                <li
                  key={s.name}
                  className={`coverage__row${s.total === 0 ? ' coverage__row--empty' : ''}`}
                >
                  <span className="coverage__name">{s.name}</span>
                  <span className="coverage__num">
                    {s.total === 0 ? (
                      <span className="coverage__badge-empty">falta</span>
                    ) : (
                      <>
                        {s.total} {s.total === 1 ? 'lugar' : 'lugares'}
                        {s.published < s.total && (
                          <span className="coverage__draft"> · {s.published} publicado{s.published === 1 ? '' : 's'}</span>
                        )}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
