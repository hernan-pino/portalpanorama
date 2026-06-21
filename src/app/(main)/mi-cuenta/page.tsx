import Link from 'next/link'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { Collection } from '@domain/collection/Collection'
import type { SaveContext } from '@components/place/PlaceCard'
import { getUserDashboard } from '@lib/userDashboardCache'
import { TabGuardados } from './tabs/Guardados'
import { TabListaDetalle } from './tabs/ListaDetalle'
import { TabListas } from './tabs/Listas'
import { TabHistorial } from './tabs/Historial'
import { TabResenas } from './tabs/Resenas'
import { TabEventos } from './tabs/Eventos'
import { TabPerfil } from './tabs/Perfil'
import { TabConfig } from './tabs/Config'

const VALID_TABS = ['guardados', 'listas', 'historial', 'resenas', 'eventos', 'perfil', 'config'] as const
type Tab = typeof VALID_TABS[number]

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; lista?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { tab: rawTab, lista } = await searchParams
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'guardados'

  const userId = session.user.id

  // Detalle de una lista guardada (Guardados › abrir lista).
  if (tab === 'guardados' && lista) {
    const collection = await container.getGetUserCollectionUseCase().execute({ userId, collectionId: lista })
    if (!collection) return <ListaNoEncontrada />

    const ctx = await container.getGetSaveContextUseCase().execute(userId)
    const save: SaveContext = {
      isLoggedIn: true,
      collections: ctx.collections.map((c) => ({ id: c.id, name: c.name, itemCount: c.itemCount })),
      savedPlaceIds: ctx.savedPlaceIds,
      defaultCollectionId: ctx.defaultCollectionId,
      defaultName: Collection.DEFAULT_NAME,
    }
    return <TabListaDetalle collection={collection} save={save} />
  }

  if (tab === 'guardados' || tab === 'perfil' || tab === 'historial') {
    const data = await getUserDashboard(userId)
    if (tab === 'guardados') return <TabGuardados collections={data.collections} />
    if (tab === 'perfil') return <TabPerfil user={data.user} />
    if (tab === 'historial') return <TabHistorial history={data.history} />
  }

  if (tab === 'listas') return <TabListas />
  if (tab === 'resenas') return <TabResenas />
  if (tab === 'eventos') return <TabEventos />
  if (tab === 'config') return <TabConfig />

  return null
}

function ListaNoEncontrada() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <Link
        href="/mi-cuenta?tab=guardados"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--s-1)',
          color: 'var(--fg-muted)',
          fontSize: 'var(--t-body-sm)',
          textDecoration: 'none',
          marginBottom: 'var(--s-6)',
        }}
      >
        ← Guardados
      </Link>
      <div
        style={{
          border: '1px dashed var(--surface-line)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--s-10)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Esta lista no existe o no es tuya.
        </p>
      </div>
    </div>
  )
}
