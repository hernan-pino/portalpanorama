import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Para negocios — reclama tu ficha gratis',
  description:
    'Si tu local aparece en Portal Panorama, reclama tu ficha gratis: mantén tu información al día y accede a las herramientas para negocios. Sin costos ocultos: la ficha completa es gratis para siempre.',
}

// Landing del lado negocio (decisión s28): qué es la cuenta de negocio, qué
// incluye hoy (gratis), y transparencia de lo que viene (herramientas + publicidad
// interna declarada). El copy promete solo lo que existe; lo demás va como "pronto".
export default function ParaNegociosPage() {
  return (
    <div className="legal container">
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">Tu negocio, en su mejor versión</h1>

      <p className="legal__lead">
        Portal Panorama es una guía editorial de lugares que valen la pena en Santiago. Si tu
        local ya aparece aquí, es porque la gente lo recomienda — y puedes{' '}
        <strong>reclamar tu ficha gratis</strong> para tomar el control de tu presencia.
      </p>

      <section className="legal__section">
        <h2>Qué es una cuenta de negocio</h2>
        <p>
          Es tu misma cuenta de Portal Panorama, con un rol extra: acredita que eres parte del
          equipo de un local (dueño/a, representante o encargado/a) y te da la gestión de su
          ficha. Revisamos cada solicitud a mano, para que nadie pueda quedarse con la ficha de
          un negocio que no es suyo.
        </p>
      </section>

      <section className="legal__section">
        <h2>Qué incluye hoy (gratis)</h2>
        <ul>
          <li>
            <strong>Reclamar tu ficha.</strong> Queda asociada a tu cuenta como dueño verificado.
          </li>
          <li>
            <strong>Tu información al día.</strong> ¿Cambió el horario, el teléfono o la carta?
            Nos escribes y lo actualizamos contigo mientras construimos el panel de autogestión.
          </li>
        </ul>
        <p>
          Y esto es lo que viene <strong>pronto</strong>, también gratis: un panel de negocio
          para editar tu ficha directamente, subir fotos, ver estadísticas de visitas y
          guardados, y responder los reportes que la comunidad deja sobre tu local. Si
          reclamas tu ficha ahora, te avisaremos por correo cuando esté disponible.
        </p>
      </section>

      <section className="legal__section">
        <h2>Cuánto cuesta</h2>
        <p>
          <strong>Nada.</strong> Reclamar tu ficha y gestionar tu información es gratis, y lo va
          a seguir siendo. Nuestro principio es simple: <strong>la información completa de un
          lugar es gratis para todos, siempre</strong> — nunca vamos a esconder tu horario o tu
          dirección detrás de un cobro, ni a cobrarte por “completar” tu ficha.
        </p>
        <p>
          Más adelante ofreceremos opciones pagadas de <strong>visibilidad</strong> — por
          ejemplo, aparecer destacado en una zona de publicidad claramente marcada como tal.
          Siempre será opcional, siempre estará declarado, y{' '}
          <Link href="/como-ordenamos">nadie podrá pagar para alterar el orden del ranking</Link>.
        </p>
      </section>

      <section className="legal__section">
        <h2>Cómo reclamar tu ficha</h2>
        <ul>
          <li>
            <strong>1.</strong> <Link href="/explorar">Busca tu local</Link> y abre su ficha.
          </li>
          <li>
            <strong>2.</strong> Al final de la ficha, haz clic en{' '}
            <strong>“Reclamar esta ficha”</strong> (necesitas una cuenta, tarda un minuto).
          </li>
          <li>
            <strong>3.</strong> Cuéntanos tu rol y déjanos un contacto. Revisamos a mano y te
            respondemos por correo.
          </li>
        </ul>
        <p>
          ¿Tu local todavía no aparece en Portal Panorama? Pronto podrás crear su ficha desde tu
          cuenta de negocio. Mientras tanto, escríbenos a{' '}
          <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a> y lo evaluamos para
          el catálogo.
        </p>
      </section>

      <section className="legal__section">
        <h2>Preguntas frecuentes</h2>
        <p>
          <strong>¿Por qué mi local aparece sin que yo lo subiera?</strong> Somos una guía
          editorial: nuestro equipo carga los lugares que valen la pena, con datos públicos
          (como tu calificación de Google). Reclamar la ficha te da el control sobre ella.
        </p>
        <p>
          <strong>¿Puedo pedir que saquen mi local?</strong> Sí — escríbenos y lo conversamos.
        </p>
        <p>
          <strong>¿Qué pasa si otra persona reclama mi ficha?</strong> Verificamos cada reclamo
          a mano antes de aprobarlo. Si detectas un error, escríbenos y lo corregimos.
        </p>
      </section>

      <p style={{ marginTop: 'var(--s-8)' }}>
        <Link href="/explorar" className="btn btn--primary">Busca tu local y reclama tu ficha</Link>
      </p>
    </div>
  )
}
