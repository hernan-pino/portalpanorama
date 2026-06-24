'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setSuggestionStatusAction, deleteSuggestionAction } from './actions'

export interface SuggestionView {
  id: string
  kind: 'FALTA_LUGAR' | 'FOTO' | 'INFO' | 'OTRO'
  message: string
  email: string | null
  userEmail: string | null
  status: 'OPEN' | 'RESOLVED'
  createdAt: string
}

const KIND_LABELS: Record<SuggestionView['kind'], string> = {
  FALTA_LUGAR: 'Falta un lugar',
  FOTO: 'Foto',
  INFO: 'Más info',
  OTRO: 'Otro',
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

export function SuggestionsInbox({ suggestions }: { suggestions: SuggestionView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function run(action: () => Promise<{ error: string } | { success: true }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete
    setPendingDelete(null)
    run(() => deleteSuggestionAction(id))
  }

  return (
    <>
      {error && <p className="admin-row-actions__error" role="alert">{error}</p>}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Mensaje</th>
              <th>Contacto</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => {
              const contact = s.email ?? s.userEmail
              return (
                <tr key={s.id}>
                  <td>{KIND_LABELS[s.kind]}</td>
                  <td className="admin-inbox__msg">{s.message}</td>
                  <td>{contact ? <a href={`mailto:${contact}`}>{contact}</a> : 'Anónimo'}</td>
                  <td>{dateFmt.format(new Date(s.createdAt))}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${s.status === 'RESOLVED' ? 'published' : 'pending_review'}`}>
                      {s.status === 'RESOLVED' ? 'Resuelta' : 'Abierta'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {s.status === 'OPEN' ? (
                        <button className="btn btn--ghost btn--sm" disabled={isPending}
                          onClick={() => run(() => setSuggestionStatusAction(s.id, 'RESOLVED'))}>Resolver</button>
                      ) : (
                        <button className="btn btn--ghost btn--sm" disabled={isPending}
                          onClick={() => run(() => setSuggestionStatusAction(s.id, 'OPEN'))}>Reabrir</button>
                      )}
                      <button className="btn btn--ghost btn--sm admin-row-actions__danger" disabled={isPending}
                        onClick={() => setPendingDelete(s.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className="confirm-modal__scrim" role="presentation" onClick={() => setPendingDelete(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="del-sug-title"
            onClick={(e) => e.stopPropagation()}>
            <h2 id="del-sug-title" className="confirm-modal__title">Eliminar sugerencia</h2>
            <p className="confirm-modal__lead">
              Vas a eliminar esta sugerencia de forma permanente. Úsalo para spam; si ya la
              atendiste, mejor márcala como resuelta.
            </p>
            <div className="confirm-modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPendingDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--sm confirm-modal__delete" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
