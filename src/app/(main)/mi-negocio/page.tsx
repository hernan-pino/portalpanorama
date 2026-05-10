import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { TabResumen } from './tabs/Resumen'
import { TabFichas } from './tabs/Fichas'
import { TabResenas } from './tabs/Resenas'
import { TabEstadisticas } from './tabs/Estadisticas'
import { TabEventos } from './tabs/Eventos'
import { TabPlan } from './tabs/Plan'
import { TabGuardados } from './tabs/Guardados'
import { TabListas } from './tabs/Listas'
import { TabPerfil } from './tabs/Perfil'

const VALID_TABS = ['resumen', 'fichas', 'estadisticas', 'resenas', 'plan', 'guardados', 'listas', 'perfil', 'eventos'] as const
type Tab = typeof VALID_TABS[number]

export default async function MiNegocioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { tab: rawTab } = await searchParams
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'resumen'

  const userId = session.user.id

  if (tab === 'resumen' || tab === 'fichas' || tab === 'estadisticas' || tab === 'resenas') {
    const data = await container.getGetBusinessDashboardUseCase().execute(userId)
    if (tab === 'resumen') return <TabResumen data={data} />
    if (tab === 'fichas') return <TabFichas data={data} />
    if (tab === 'estadisticas') return <TabEstadisticas data={data} />
    if (tab === 'resenas') return <TabResenas data={data} />
  }

  if (tab === 'plan') {
    const subscriptions = await container.getGetListingSubscriptionsUseCase().execute(userId)
    return <TabPlan subscriptions={subscriptions} />
  }

  if (tab === 'guardados' || tab === 'perfil') {
    const data = await container.getGetUserDashboardUseCase().execute(userId)
    if (tab === 'guardados') return <TabGuardados favoriteListings={data.favoriteListings} />
    if (tab === 'perfil') return <TabPerfil user={data.user} />
  }

  if (tab === 'listas') return <TabListas />
  if (tab === 'eventos') return <TabEventos />

  return null
}
