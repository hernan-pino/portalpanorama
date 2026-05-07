import Link from 'next/link'
import { SearchBar } from '@components/search/SearchBar'
import { ListingCard } from '@components/listing/ListingCard'
import { container } from '@lib/container'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

const CATEGORIES = [
  { slug: 'restaurantes', name: 'Restaurantes', icon: '🍽' },
  { slug: 'cafes', name: 'Cafés', icon: '☕' },
  { slug: 'bares', name: 'Bares', icon: '🍷' },
  { slug: 'museos', name: 'Museos', icon: '🏛' },
  { slug: 'tiendas', name: 'Tiendas', icon: '🛍' },
  { slug: 'servicios', name: 'Servicios', icon: '✂' },
]

const FEATURED_NEIGHBORHOODS = NEIGHBORHOODS.slice(0, 8)

export default async function HomePage() {
  const useCase = container.getSearchListingsUseCase()
  const recent = await useCase.execute({ limit: 8 })

  return (
    <div className="page-enter">
      {/* Hero */}
      <section
        className="container"
        style={{ paddingTop: 'var(--s-20)', paddingBottom: 'var(--s-16)' }}
      >
        <div style={{ maxWidth: '800px', marginBottom: 'var(--s-10)' }}>
          <p
            className="eyebrow"
            style={{ marginBottom: 'var(--s-4)', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}
          >
            <span
              style={{ width: '24px', height: '1px', background: 'var(--paper-30)', display: 'inline-block' }}
            />
            Santiago, Chile
          </p>
          <h1
            className="display"
            style={{ fontSize: 'var(--t-display-md)', marginBottom: 'var(--s-5)' }}
          >
            Lo bueno de la ciudad, <em>curado</em> como revista.
          </h1>
          <p
            style={{
              fontSize: 'var(--t-h3)',
              color: 'var(--fg-muted)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '560px',
            }}
          >
            Restaurantes, bares, cafés y panoramas escritos por gente que sale, prueba y vuelve a contarlo.
          </p>
        </div>

        <SearchBar />

        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-4)' }}>
          {['Brunch dominical', 'Terrazas con vista', 'Después del trabajo', 'Plan en familia'].map((q) => (
            <Link key={q} href={`/explorar?q=${encodeURIComponent(q)}`} className="chip">
              {q}
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-line" />

      {/* Categorías */}
      <section className="container" style={{ paddingTop: 'var(--s-16)', paddingBottom: 'var(--s-16)' }}>
        <SectionHeader num="01" title="Categorías" ctaHref="/explorar" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 'var(--grid-gutter)',
            marginTop: 'var(--s-8)',
          }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explorar?categoria=${cat.slug}`}
              style={{
                padding: 'var(--s-5)',
                background: 'var(--bg-raised)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-3)',
                transition: 'border-color var(--d-fast)',
              }}
            >
              <span style={{ fontSize: '28px' }}>{cat.icon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--t-h4)',
                  fontWeight: 400,
                  letterSpacing: 'var(--tr-tight)',
                }}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-line" />

      {/* Barrios */}
      <section className="container" style={{ paddingTop: 'var(--s-16)', paddingBottom: 'var(--s-16)' }}>
        <SectionHeader num="02" title="Por barrio" ctaHref="/explorar" />
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-8)' }}>
          {FEATURED_NEIGHBORHOODS.map((barrio) => (
            <Link
              key={barrio}
              href={`/explorar?barrio=${encodeURIComponent(barrio)}`}
              className="chip"
              style={{ height: '40px', padding: '0 var(--s-4)', fontSize: 'var(--t-body-sm)' }}
            >
              {barrio}
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-line" />

      {/* Lugares recientes */}
      {recent.items.length > 0 && (
        <section className="container" style={{ paddingTop: 'var(--s-16)', paddingBottom: 'var(--s-16)' }}>
          <SectionHeader num="03" title="Lugares recientes" ctaHref="/explorar" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--grid-gutter)',
              marginTop: 'var(--s-8)',
            }}
          >
            {recent.items.map((item) => (
              <ListingCard
                key={item.listingId}
                listing={{
                  slug: item.slug,
                  name: item.name,
                  neighborhood: item.neighborhood,
                  averageRating: item.averageRating,
                  isPremium: false,
                  tags: [],
                }}
              />
            ))}
          </div>
        </section>
      )}

      <hr className="divider-line" />

      {/* CTA negocios */}
      <section style={{ background: 'var(--ink-100)', color: 'var(--paper-00)', padding: 'var(--s-20) 0' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--s-6)',
          }}
        >
          <p className="eyebrow" style={{ color: 'var(--paper-40)' }}>Para tu negocio</p>
          <h2
            className="display"
            style={{ fontSize: 'var(--t-display-sm)', color: 'var(--paper-00)', maxWidth: '560px' }}
          >
            Poné tu local en el <em>mapa editorial</em> de Santiago.
          </h2>
          <p style={{ color: 'var(--paper-40)', maxWidth: '400px', lineHeight: 'var(--lh-loose)' }}>
            Creá tu ficha gratis o sumá visibilidad con un plan Premium.
          </p>
          <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/planes" className="btn btn--accent btn--lg">Ver planes</Link>
            <Link
              href="/registro"
              className="btn btn--lg"
              style={{ background: 'transparent', color: 'var(--paper-00)', borderColor: 'var(--paper-40)' }}
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ num, title, ctaHref }: { num: string; title: string; ctaHref: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-4)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono)', color: 'var(--fg-subtle)', letterSpacing: 'var(--tr-wider)' }}>
          {num}
        </span>
        <h2 className="display" style={{ fontSize: 'var(--t-display-sm)', margin: 0 }}>{title}</h2>
      </div>
      <Link href={ctaHref} style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 'var(--s-1)', flexShrink: 0 }}>
        Ver todos
        <svg className="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
        </svg>
      </Link>
    </div>
  )
}
