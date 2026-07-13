'use client'
import { Fragment, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { approveClaimAction, rejectClaimAction } from './actions'

export interface ClaimTargetDetailView {
  address: string | null
  communeName: string | null
  categoryName: string | null
  subcategoryName: string | null
  phone: string | null
  instagram: string | null
  isPublished: boolean
}

export interface ClaimView {
  id: string
  targetType: 'PLACE' | 'BRAND'
  targetId: string
  targetName: string
  targetSlug: string
  targetIsPublic: boolean
  targetDetail: ClaimTargetDetailView | null
  claimantName: string
  claimantEmail: string
  claimantRole: string | null
  message: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNotes: string | null
  createdAt: string
}

const STATUS_LABELS: Record<ClaimView['status'], string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

const STATUS_CLASS: Record<ClaimView['status'], string> = {
  PENDING: 'pending_review',
  APPROVED: 'published',
  REJECTED: 'archived',
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

export function ClaimsInbox({ claims }: { claims: ClaimView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // Reclamo con el panel de decisión abierto (para escribir el motivo/nota).
  const [deciding, setDeciding] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function run(action: typeof approveClaimAction, id: string) {
    setError(null)
    startTransition(async () => {
      const result = await action(id, notes || undefined)
      if ('error' in result) { setError(result.error); return }
      setDeciding(null)
      setNotes('')
      router.refresh()
    })
  }

  return (
    <>
      {error && <p className="admin-row-actions__error" role="alert">{error}</p>}
      <div className="admin-table">
        <table>
          <thead>
            {/* Rol, mensaje y contacto salieron de la tabla: viven en el panel de revisión.
                Con 8 columnas la bandeja no cabía y se leía de lado. */}
            <tr>
              <th>Ficha reclamada</th>
              <th>Quién</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <Fragment key={c.id}>
              <tr>
                <td>
                  {/* El nombre lleva al editor del admin, que es donde se trabaja la ficha.
                      La ficha pública solo se ofrece si existe: las que llegan por "publica
                      tu negocio" nacen PENDING_REVIEW y /lugar/{slug} daría 404. */}
                  <Link
                    href={
                      c.targetType === 'PLACE'
                        ? `/admin/lugares/${c.targetId}`
                        : `/admin/marcas/${c.targetId}`
                    }
                    className="admin-table__name"
                  >
                    {c.targetName}
                  </Link>
                  {c.targetType === 'BRAND' && <span className="admin-table__hint"> (marca)</span>}
                  {c.targetIsPublic ? (
                    <>
                      <br />
                      <Link
                        href={c.targetType === 'PLACE' ? `/lugar/${c.targetSlug}` : `/marca/${c.targetSlug}`}
                        className="admin-table__hint"
                        target="_blank"
                      >
                        Ver ficha pública ↗
                      </Link>
                    </>
                  ) : (
                    <>
                      <br />
                      <span className="admin-table__hint">Ficha en revisión (sin página pública)</span>
                    </>
                  )}
                </td>
                <td>
                  {c.claimantName}
                  <br />
                  <span style={{ color: 'var(--fg-muted)' }}>{c.claimantEmail}</span>
                </td>
                <td>{dateFmt.format(new Date(c.createdAt))}</td>
                <td>
                  <span className={`admin-badge admin-badge--${STATUS_CLASS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                  {c.reviewNotes && (
                    <div style={{ color: 'var(--fg-muted)', marginTop: 4, maxWidth: 200 }}>{c.reviewNotes}</div>
                  )}
                </td>
                <td>
                  {c.status === 'PENDING' && (
                    <button
                      className="btn btn--ghost btn--sm"
                      disabled={isPending}
                      onClick={() => {
                        if (deciding === c.id) { setDeciding(null); return }
                        setDeciding(c.id)
                        setNotes('')
                      }}
                    >
                      {deciding === c.id ? 'Cerrar' : 'Revisar'}
                    </button>
                  )}
                </td>
              </tr>

              {/* Panel de revisión: los datos que el dueño declaró viven en la ficha, no
                  en el reclamo — sin esto había que saltar al editor y volver para poder
                  decidir. Se abren acá, junto a los botones de aprobar/rechazar. */}
              {deciding === c.id && (
                <tr className="claim-review__row">
                  <td colSpan={5}>
                    <div className="claim-review">
                      <div className="claim-review__cols">
                        <section>
                          <h3 className="claim-review__h">Lo que declaró del negocio</h3>
                          {c.targetDetail ? (
                            <dl className="claim-review__dl">
                              <div><dt>Nombre</dt><dd>{c.targetName}</dd></div>
                              <div><dt>Dirección</dt><dd>{c.targetDetail.address || '—'}</dd></div>
                              <div><dt>Comuna</dt><dd>{c.targetDetail.communeName || '—'}</dd></div>
                              <div>
                                <dt>Rubro</dt>
                                <dd>
                                  {c.targetDetail.categoryName || '—'}
                                  {c.targetDetail.subcategoryName && ` › ${c.targetDetail.subcategoryName}`}
                                </dd>
                              </div>
                              <div><dt>Teléfono</dt><dd>{c.targetDetail.phone || '—'}</dd></div>
                              <div><dt>Instagram</dt><dd>{c.targetDetail.instagram || '—'}</dd></div>
                              <div>
                                <dt>Ficha</dt>
                                <dd>
                                  {c.targetDetail.isPublished
                                    ? 'Publicada'
                                    : 'En revisión — hay que completarla y publicarla'}
                                </dd>
                              </div>
                            </dl>
                          ) : (
                            <p className="claim-review__empty">
                              Es una marca: no tiene ubicación propia. Sus locales cuelgan de ella.
                            </p>
                          )}
                        </section>

                        <section>
                          <h3 className="claim-review__h">Quién lo pide</h3>
                          <dl className="claim-review__dl">
                            <div><dt>Persona</dt><dd>{c.claimantName}</dd></div>
                            <div><dt>Cuenta</dt><dd>{c.claimantEmail}</dd></div>
                            <div><dt>Rol</dt><dd>{c.claimantRole ?? '—'}</dd></div>
                            <div>
                              <dt>Contacto</dt>
                              <dd>
                                {c.contactEmail ?? '—'}
                                {c.contactPhone && (<><br />{c.contactPhone}</>)}
                              </dd>
                            </div>
                            <div><dt>Mensaje</dt><dd>{c.message || '—'}</dd></div>
                          </dl>
                          <p className="claim-review__note">
                            <strong>Lo que estás aprobando es la identidad,</strong> no los datos: que te haya
                            escrito desde el Instagram oficial del local o desde su correo. Los datos de la ficha
                            los corriges tú en el editor.
                          </p>
                        </section>
                      </div>

                      <div className="claim-review__actions">
                        <Link
                          href={
                            c.targetType === 'PLACE'
                              ? `/admin/lugares/${c.targetId}`
                              : `/admin/marcas/${c.targetId}`
                          }
                          className="btn btn--ghost btn--sm"
                        >
                          Abrir en el editor ↗
                        </Link>
                        <textarea
                          className="form-input"
                          rows={2}
                          maxLength={1000}
                          placeholder="Nota o motivo (viaja en el correo al reclamante)…"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="claim-review__btns">
                          <button className="btn btn--primary btn--sm" disabled={isPending}
                            onClick={() => run(approveClaimAction, c.id)}>
                            {isPending ? '…' : 'Aprobar'}
                          </button>
                          <button className="btn btn--ghost btn--sm" disabled={isPending}
                            onClick={() => run(rejectClaimAction, c.id)}>
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
