'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { createOwnedPlaceSeedAction } from './actions'
import { trackEvent } from '@lib/analytics'

const ROLES = ['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']

interface CategoryOption {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}
interface CommuneOption {
  id: string
  name: string
}

// Form-semilla: lo mínimo que el dueño sabe de memoria. La ficha final la arma el
// admin (fotos, descripción, tags, reputación) antes de publicarla — por eso acá no
// se piden. Ver BUSINESS_ACCOUNTS_SPEC §6.
export function SeedForm({
  categories,
  communes,
}: {
  categories: CategoryOption[]
  communes: CommuneOption[]
}) {
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<{ message: string; duplicate?: boolean } | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const subcategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subcategories ?? [],
    [categories, categoryId],
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await createOwnedPlaceSeedAction(formData)
      if ('error' in res) {
        setError({ message: res.error, duplicate: res.duplicate })
        return
      }
      trackEvent('crear_ficha_negocio', {})
      setDone(true)
    })
  }

  if (done) {
    return (
      <section className="legal__section">
        <h2>¡Listo! Recibimos tu negocio</h2>
        <p>
          Ahora lo investigamos y completamos su ficha: fotos, descripción, horario y cómo
          llegar. Te enviamos un correo con el último paso para verificar que el negocio es
          tuyo — apenas lo confirmemos, la ficha queda asociada a tu cuenta y podrás
          gestionarla desde tu panel.
        </p>
        <p>
          <Link href="/mi-negocio" className="btn btn--primary btn--sm">Ir a mi panel</Link>
        </p>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 560 }}
    >
      <div>
        <label className="form-label" htmlFor="seed-name">Nombre del negocio</label>
        <input
          id="seed-name"
          name="name"
          className="form-input"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Café Altura"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-address">Dirección</label>
        <input
          id="seed-address"
          name="address"
          className="form-input"
          required
          maxLength={200}
          placeholder="Ej: Av. Italia 1234, local 2"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-commune">Comuna</label>
        <select id="seed-commune" name="communeId" className="form-input" required defaultValue="">
          <option value="" disabled>Elige la comuna</option>
          {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-category">Categoría</label>
        <select
          id="seed-category"
          name="categoryId"
          className="form-input"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="" disabled>Elige la categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-subcategory">Rubro</label>
        <select
          id="seed-subcategory"
          name="subcategoryId"
          className="form-input"
          required
          defaultValue=""
          disabled={!categoryId}
          key={categoryId}
        >
          <option value="" disabled>{categoryId ? 'Elige el rubro' : 'Elige primero la categoría'}</option>
          {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <p className="form-hint">Si ninguno calza exacto, elige el más parecido: lo afinamos nosotros.</p>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-role">¿Cuál es tu rol en el negocio?</label>
        <select id="seed-role" name="role" className="form-input" defaultValue={ROLES[0]}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-phone">Teléfono</label>
        <input id="seed-phone" name="phone" type="tel" className="form-input" maxLength={40} placeholder="+56 9 …" />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-instagram">Instagram</label>
        <input id="seed-instagram" name="instagram" className="form-input" maxLength={120} placeholder="@tunegocio" />
        <p className="form-hint">Déjanos al menos uno de los dos: nos sirve para verificar que el negocio es tuyo.</p>
      </div>

      <div className="claim-verify">
        <p className="claim-verify__title">Qué pasa después</p>
        <p className="claim-verify__body">
          Con estos datos investigamos tu negocio y armamos su ficha completa (fotos, descripción,
          horario, cómo llegar). Para confirmar que el negocio es tuyo, te vamos a pedir un mensaje{' '}
          <strong>desde su canal oficial</strong>: un mensaje directo desde el Instagram del local a{' '}
          <a href="https://instagram.com/portalpanorama.cl" target="_blank" rel="noopener noreferrer">@portalpanorama.cl</a>,
          o un correo desde el correo del negocio a{' '}
          <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>. Revisamos todo a mano,
          así que puede tardar unos días.
        </p>
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
          {error.message}{' '}
          {error.duplicate && (
            <Link href={`/explorar?q=${encodeURIComponent(name)}`}>Buscar mi local</Link>
          )}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar mi negocio'}
        </button>
        <Link href="/mi-negocio" className="btn btn--ghost">Cancelar</Link>
      </div>

      <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        Publicar tu negocio es gratis. Usaremos estos datos para armar tu ficha y verificar tu
        vínculo con el negocio (<Link href="/privacidad">privacidad</Link>).
      </p>
    </form>
  )
}
