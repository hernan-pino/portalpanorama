import type { Metadata } from 'next'
import { container } from '@lib/container'
import { ReportsInbox, type ReportView } from './ReportsInbox'
import { SuggestionsInbox, type SuggestionView } from './SuggestionsInbox'

export const metadata: Metadata = { title: 'Reportes y sugerencias — Admin' }

export default async function ReportesPage() {
  const [reports, suggestions] = await Promise.all([
    container.getListReportsForAdminUseCase().execute(),
    container.getListSuggestionsForAdminUseCase().execute(),
  ])

  const reportRows: ReportView[] = reports.map((r) => ({
    id: r.id,
    placeName: r.placeName,
    placeSlug: r.placeSlug,
    reason: r.reason,
    message: r.message,
    status: r.status,
    reporterEmail: r.reporterEmail,
    createdAt: r.createdAt.toISOString(),
  }))

  const suggestionRows: SuggestionView[] = suggestions.map((s) => ({
    id: s.id,
    kind: s.kind,
    message: s.message,
    email: s.email,
    userEmail: s.userEmail,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  }))

  const openReports = reportRows.filter((r) => r.status === 'OPEN').length
  const openSuggestions = suggestionRows.filter((s) => s.status === 'OPEN').length

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Reportes y sugerencias</h1>
          <p className="admin-page__sub">
            {openReports} reporte{openReports === 1 ? '' : 's'} sin resolver · {openSuggestions}{' '}
            sugerencia{openSuggestions === 1 ? '' : 's'} sin revisar
          </p>
        </div>
      </header>

      <section className="admin-inbox-section">
        <h2 className="admin-inbox-section__title">Reportes de lugares</h2>
        <p className="admin-page__sub">Llegan desde el botón “Reportar dato incorrecto o lugar cerrado” en cada ficha.</p>
        {reportRows.length === 0 ? (
          <p className="admin-empty">Aún no hay reportes.</p>
        ) : (
          <ReportsInbox reports={reportRows} />
        )}
      </section>

      <section className="admin-inbox-section">
        <h2 className="admin-inbox-section__title">Sugerencias del público</h2>
        <p className="admin-page__sub">Llegan desde el formulario de sugerencias del footer.</p>
        {suggestionRows.length === 0 ? (
          <p className="admin-empty">Aún no hay sugerencias.</p>
        ) : (
          <SuggestionsInbox suggestions={suggestionRows} />
        )}
      </section>
    </div>
  )
}
