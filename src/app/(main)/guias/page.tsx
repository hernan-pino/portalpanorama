import type { Metadata } from 'next'
import { container } from '@lib/container'
import { GuideCard } from '@components/curated/GuideCard'

// Índice público de guías + listas de ocasión. Reúne todas las listas curadas
// publicadas en una sola página navegable (antes solo se llegaba desde el home).
// Reusa el read-model liviano `listPublished()` y las tarjetas del home.

export const metadata: Metadata = {
  title: 'Guías y listas de Santiago',
  description:
    'Guías curadas y listas por ocasión para descubrir los mejores panoramas de Santiago: museos, cafeterías, librerías, primera cita y más.',
  alternates: { canonical: '/guias' },
  openGraph: {
    type: 'website',
    title: 'Guías y listas de Santiago',
    description:
      'Guías curadas y listas por ocasión para descubrir los mejores panoramas de Santiago.',
    url: '/guias',
  },
}

export default async function GuiasPage() {
  const lists = await container.getListPublishedCuratedListsUseCase().execute()

  return (
    <div className="container page-enter" style={{ paddingBlock: 'var(--s-10)' }}>
      <header className="curated-page__head-body" style={{ marginBottom: 'var(--s-8)' }}>
        <p className="eyebrow">Guías</p>
        <h1 className="curated-page__title">Guías y listas para explorar Santiago</h1>
        <p className="curated-page__intro">
          Selecciones curadas por tema y por ocasión —los mejores museos, dónde tomar
          buen café, panoramas para una primera cita— con rating real de Google.
        </p>
      </header>

      {lists.length > 0 ? (
        <div className="home-guides__grid">
          {lists.map((l) => (
            <GuideCard key={l.slug} list={l} />
          ))}
        </div>
      ) : (
        <p className="curated-page__empty">Pronto vamos a publicar nuestras primeras guías.</p>
      )}
    </div>
  )
}
