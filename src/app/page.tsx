import Link from 'next/link'
import { SearchBar } from '@components/search/SearchBar'
import { ListingCard } from '@components/listing/ListingCard'
import { container } from '@lib/container'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

const CATEGORIES = [
  { slug: 'restaurantes', name: 'Restaurantes', glyph: '01', icon: 'utensils' },
  { slug: 'cafes',        name: 'Cafés',        glyph: '02', icon: 'coffee' },
  { slug: 'bares',        name: 'Bares',        glyph: '03', icon: 'wine' },
  { slug: 'museos',       name: 'Museos',       glyph: '04', icon: 'museum' },
  { slug: 'tiendas',      name: 'Tiendas',      glyph: '05', icon: 'shopping' },
  { slug: 'servicios',    name: 'Servicios',    glyph: '06', icon: 'scissors' },
  { slug: 'parques',      name: 'Parques',      glyph: '07', icon: 'tree' },
  { slug: 'eventos',      name: 'Eventos',      glyph: '08', icon: 'calendar' },
]

const STATIC_EVENTS = [
  { day: '09', month: 'May', title: 'Jazz en Thelonious', sub: 'Bellavista · Desde 21:00' },
  { day: '11', month: 'May', title: 'Feria del Libro Usado', sub: 'Lastarria · Todo el día' },
  { day: '14', month: 'May', title: 'Mercado de Diseño Chileno', sub: 'Italia · 10:00 – 19:00' },
  { day: '17', month: 'May', title: 'Cata de Vinos Naturales', sub: 'Providencia · 19:30' },
]

const FEATURED_NEIGHBORHOODS = NEIGHBORHOODS.slice(0, 8)

export default async function HomePage() {
  const useCase = container.getSearchListingsUseCase()
  const recent = await useCase.execute({ limit: 6 })

  return (
    <div className="page-enter">

      {/* ── Hero ── */}
      <section className="hero container">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="line" aria-hidden="true" />
            <span className="eyebrow">Edición · Otoño en Santiago</span>
          </p>
          <h1 className="hero__title">
            Lo bueno de la ciudad, <em>curado</em> como revista.
          </h1>
          <p className="hero__sub">
            Restaurantes, bares, museos y panoramas escritos por gente
            que sale, prueba y vuelve a contarlo.
          </p>
        </div>

        <div className="hero__tools">
          <SearchBar />
          <div className="chip-row">
            {['Brunch dominical', 'Terrazas con vista', 'Después del trabajo', 'Plan en familia'].map((q) => (
              <Link key={q} href={`/explorar?q=${encodeURIComponent(q)}`} className="chip">{q}</Link>
            ))}
          </div>
        </div>

        <div className="hero__bottom">
          <div className="hero__stats">
            <div><strong>1.247</strong>Lugares verificados</div>
            <div><strong>32</strong>Barrios cubiertos</div>
            <div><strong>{recent.total ?? recent.items.length}+</strong>Publicados este mes</div>
          </div>
        </div>
      </section>

      <hr className="divider-line" />

      {/* ── Categorías ── */}
      <section className="container" style={{ marginTop: 'var(--s-24)' }}>
        <SecHead num="01 / 06" title={<><em>Categorías</em> para empezar</>} ctaHref="/explorar" ctaLabel="Ver todas" />
        <div className="cat-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/explorar?categoria=${cat.slug}`} className="cat-card">
              <div className="cat-card__top">
                <span className="cat-card__icon">
                  <CatIcon name={cat.icon} />
                </span>
                <span className="cat-card__num">{cat.glyph} / 08</span>
              </div>
              <h3 className="cat-card__title">{cat.name}</h3>
              <span className="cat-card__count">
                Ver lugares
                <span className="arrow" aria-hidden="true">
                  <ArrowIcon size={14} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Lugares recientes / Destacados ── */}
      {recent.items.length > 0 && (
        <section className="container" style={{ marginTop: 'var(--s-24)' }}>
          <SecHead num="02 / 06" title={<>Lo más <em>recomendado</em></>} ctaHref="/explorar" ctaLabel="Ver todo el listado" />
          <div className={recent.items.length >= 3 ? 'featured-grid' : 'results-grid'}>
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

      {/* ── Eventos ── */}
      <section className="container" style={{ marginTop: 'var(--s-24)' }}>
        <SecHead num="03 / 06" title={<>Esta <em>semana</em> en la ciudad</>} ctaHref="/explorar" ctaLabel="Ver agenda" />
        <div>
          {STATIC_EVENTS.map((ev) => (
            <div key={ev.title} className="event-card">
              <div className="event-card__date">
                <span className="day">{ev.day}</span>
                <span className="month">{ev.month}</span>
              </div>
              <div>
                <p className="event-card__title">{ev.title}</p>
                <p className="event-card__sub">{ev.sub}</p>
              </div>
              <span className="event-card__cta" aria-hidden="true">
                <ArrowIcon size={18} />
              </span>
            </div>
          ))}
          <div className="event-card" style={{ borderBottom: '1px solid var(--surface-line)' }} />
        </div>
      </section>

      {/* ── Barrios ── */}
      <section className="container" style={{ marginTop: 'var(--s-24)' }}>
        <SecHead num="04 / 06" title={<>Panoramas por <em>barrio</em></>} ctaHref="/explorar" ctaLabel="Explorar todos" />
        <div className="chip-row" style={{ marginTop: 'var(--s-2)' }}>
          {FEATURED_NEIGHBORHOODS.map((barrio) => (
            <Link
              key={barrio}
              href={`/explorar?barrio=${encodeURIComponent(barrio)}`}
              className="chip"
              style={{ height: '40px', padding: '0 var(--s-4)' }}
            >
              {barrio}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Pull quote editorial ── */}
      <section className="container" style={{ marginTop: 'var(--s-24)' }}>
        <blockquote style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 72px)',
          lineHeight: 1.05,
          fontWeight: 400,
          letterSpacing: 'var(--tr-tight)',
          fontVariationSettings: "'opsz' 144, 'SOFT' 50",
          margin: 0,
          maxWidth: '1000px',
          textWrap: 'balance',
        } as React.CSSProperties}>
          <span style={{ fontStyle: 'italic', color: 'var(--accent-60)', fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>«</span>
          {' '}Santiago se descubre caminando, mirando hacia arriba y preguntando dónde almuerzan los locales.{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--accent-60)', fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>»</span>
        </blockquote>
        <div style={{ marginTop: 'var(--s-6)', display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <span className="eyebrow">— Editorial</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--surface-line)' }} />
          <span className="eyebrow">Otoño · Santiago 2026</span>
        </div>
      </section>

      {/* ── BIZ CTA ── */}
      <section className="container">
        <div className="biz-cta">
          <div className="biz-cta__copy">
            <span className="eyebrow" style={{ color: 'var(--paper-30)' }}>Para tu negocio</span>
            <h2 className="biz-cta__title">
              ¿Tienes un local?<br /><em>Lístalo gratis</em>,<br />sin sorpresas.
            </h2>
            <p style={{ color: 'var(--paper-30)', maxWidth: '420px', lineHeight: 1.5, fontSize: '15px' }}>
              Aparece en Portal Panorama en menos de 5 minutos. Sin comisiones — porque acá no hacemos reservas. Pasa a Premium si quieres más visibilidad.
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
              <Link href="/registro" className="btn btn--accent">
                Listar mi local gratis <ArrowIcon size={14} />
              </Link>
              <Link href="/planes" className="btn btn--ghost" style={{ color: 'var(--paper-05)', borderColor: 'rgba(246,242,234,0.3)' }}>
                Ver planes
              </Link>
            </div>
          </div>
          <div className="biz-cta__art">
            <div className="biz-cta__art-card">
              <div className="placeholder-stripe" style={{ height: '140px' }} aria-hidden="true" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500 }}>Tu Local</span>
                <span className="premium-badge">Premium</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--paper-50)' }}>
                Categoría · Barrio · ★ 4.8
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ── Sub-components ── */

function SecHead({ num, title, ctaHref, ctaLabel }: {
  num: string
  title: React.ReactNode
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <div className="sec-head">
      <span className="sec-head__num">{num}</span>
      <h2 className="sec-head__title">{title}</h2>
      <Link href={ctaHref} className="sec-head__cta">
        {ctaLabel} <ArrowIcon size={12} />
      </Link>
    </div>
  )
}

function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function CatIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    utensils: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
    coffee:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>,
    wine:     <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>,
    museum:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
    shopping: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    scissors: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>,
    tree:     <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7l-2-2"/><path d="M17 8h.01"/><path d="M5 8h.01"/><path d="m7 11-2-3 2.5-3.5L12 3l4.5 1.5L19 8l-2 3"/><path d="m12 22-3-3 3-3 3 3-3 3Z"/></svg>,
    calendar: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  }
  return <>{icons[name] ?? icons.calendar}</>
}
