import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { getUserDashboard } from '@lib/userDashboardCache'
import { TabGuardados } from './tabs/Guardados'
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
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { tab: rawTab } = await searchParams
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'guardados'

  const userId = session.user.id

  if (tab === 'guardados' || tab === 'resenas' || tab === 'perfil') {
    const data = await getUserDashboard(userId)
    if (tab === 'guardados') return <TabGuardados favoriteListings={data.favoriteListings} />
    if (tab === 'resenas') return <TabResenas reviews={data.reviews} />
    if (tab === 'perfil') return <TabPerfil user={data.user} />
  }

  if (tab === 'listas') return <TabListas />
  if (tab === 'historial') return <TabHistorial />
  if (tab === 'eventos') return <TabEventos />
  if (tab === 'config') return <TabConfig />

  return null
}
