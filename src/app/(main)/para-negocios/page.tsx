import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Para negocios — reclama tu ficha gratis',
  description:
    'Si tu local aparece en Portal Panorama, reclama tu ficha gratis: mantén tu información al día y accede a las herramientas para negocios. Sin costos ocultos: la ficha completa es gratis para siempre.',
}

// Beneficios de la cuenta de negocio. `soon` = todavía no está construido (se
// muestra como "Pronto" para ser honestos sobre qué existe hoy).
const PERKS: { title: string; body: string; soon?: boolean }[] = [
  {
    title: 'Reclama tu ficha',
    body: 'Queda asociada a tu cuenta como dueño verificado. Nadie más puede gestionarla.',
  },
  {
    title: 'Corrige lo que esté mal',
    body: 'La ficha la escribimos nosotros con datos públicos, así que algo puede quedar mal. ¿El horario cambió, el teléfono no es ese, el precio no calza? Lo arreglas tú mismo y se publica al tiro.',
  },
  {
    title: 'Publica tu negocio nuevo',
    body: '¿No está en la guía? Cuéntanos lo básico y nosotros investigamos y armamos su ficha completa.',
  },
  {
    title: 'Sube y ordena tus fotos',
    body: 'Muestra tu local como quieres que se vea, con tus propias imágenes.',
  },
  {
    title: 'Estadísticas de tu ficha',
    body: 'Cuánta gente la visita, cuántos la guardan y cuántos piden cómo llegar, tu web o tus redes.',
  },
  {
    title: 'Responde a la comunidad',
    body: 'Contesta los reportes y comentarios que dejan sobre tu local.',
    soon: true,
  },
]

const STEPS = [
  { n: 1, title: 'Busca tu local', body: 'Encuéntralo en Portal Panorama y abre su ficha. Si todavía no está, publícalo tú: te pedimos solo lo básico.' },
  { n: 2, title: 'Reclámalo o publícalo', body: 'Al final de la ficha, haz clic en “Reclamar esta ficha”. Necesitas una cuenta — tarda un minuto.' },
  { n: 3, title: 'Verificamos y listo', body: 'Revisamos todo a mano y te respondemos por correo. Si era un local nuevo, armamos su ficha completa antes de publicarla.' },
]

const FAQ = [
  {
    q: '¿Por qué mi local aparece sin que yo lo subiera?',
    a: 'Somos una guía editorial: nuestro equipo carga los lugares que valen la pena con datos públicos, como tu calificación de Google. Reclamar la ficha te da el control sobre ella.',
  },
  {
    q: '¿Y si la ficha tiene datos incorrectos?',
    a: 'Nosotros escribimos la ficha, pero el que sabe eres tú: al reclamarla (o al publicar tu negocio nuevo) puedes corregir directamente el horario, el teléfono, la descripción, el rango de precio, la carta, el sitio web y tus redes, además de subir tus propias fotos. Los cambios se publican al tiro, sin esperar aprobación. El nombre, la categoría y la dirección los ajustamos nosotros: escríbenos a hola@portalpanorama.cl.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Nada. Reclamar tu ficha y gestionar tu información es gratis, y lo va a seguir siendo. Más adelante ofreceremos opciones pagadas de visibilidad (siempre opcionales y claramente marcadas), pero la información de tu local es gratis para todos, siempre.',
  },
  {
    q: '¿Tengo varios locales o una cadena?',
    a: 'Si tu negocio tiene varias sucursales agrupadas bajo una misma marca, puedes reclamar la marca completa desde su página (el botón “¿Esta marca es tuya?”) y gestionar todos sus locales desde una sola cuenta. ¿Reclamaste un local suelto y después te diste cuenta de que es parte de una cadena? Reclama también la marca, o escríbenos a hola@portalpanorama.cl y lo unimos por ti.',
  },
  {
    q: '¿Puedo pedir que saquen mi local?',
    a: 'Sí. Escríbenos a hola@portalpanorama.cl y lo conversamos.',
  },
  {
    q: '¿Qué pasa si otra persona reclama mi ficha?',
    a: 'Verificamos cada reclamo a mano antes de aprobarlo. Si detectas un error, escríbenos y lo corregimos.',
  },
  {
    q: '¿Mi local todavía no aparece?',
    a: 'Publícalo tú: cuéntanos lo básico (nombre, dirección, comuna, rubro y un contacto) y nosotros investigamos tu negocio y armamos su ficha completa —fotos, descripción, horario, cómo llegar— antes de publicarla. Es gratis y la revisamos a mano, así que puede tardar unos días.',
  },
]

// Landing del lado negocio (decisión s28; rediseño con estructura visual s28-cont).
export default function ParaNegociosPage() {
  return (
    <div className="biz">
      {/* Hero */}
      <section className="biz-hero container">
        <p className="eyebrow">Para negocios</p>
        <h1 className="display biz-hero__title">Tu negocio, en su mejor versión</h1>
        <p className="biz-hero__lead">
          Portal Panorama es una guía editorial de los lugares que valen la pena en Santiago.
          Las fichas las escribimos nosotros, con datos reales — y su dueño puede tomar el control
          para corregirlas y mantenerlas al día. Gratis.
        </p>
        <p className="biz-hero__note">Gratis · sin tarjeta · verificación a cargo de nuestro equipo</p>
      </section>

      {/* Los dos caminos: cada uno con su puerta, para que nadie tenga que adivinar cuál es el suyo. */}
      <section className="biz-section container">
        <h2 className="biz-section__title">Empieza por acá</h2>
        <div className="biz-paths">
          <article className="biz-path">
            <p className="biz-path__eyebrow">Tu local YA está en Portal Panorama</p>
            <h3 className="biz-path__title">Reclama tu ficha</h3>
            <p className="biz-path__body">
              Búscalo, entra a su ficha y haz clic en <strong>“¿Este negocio es tuyo?”</strong>.
              Verificamos que eres parte del equipo y la ficha queda asociada a tu cuenta: desde
              ahí corriges lo que esté mal y subes tus fotos.
            </p>
            <Link href="/explorar" className="btn btn--primary">Busca tu local</Link>
          </article>

          <article className="biz-path">
            <p className="biz-path__eyebrow">Tu local NO aparece todavía</p>
            <h3 className="biz-path__title">Publica tu negocio</h3>
            <p className="biz-path__body">
              Creas tu cuenta, nos cuentas lo básico (nombre, dirección, rubro y un contacto) y{' '}
              <strong>nosotros armamos la ficha completa</strong>: fotos, descripción, horario y
              cómo llegar. Después la corriges tú si algo nos quedó mal.
            </p>
            <Link href="/mi-negocio/nuevo" className="btn btn--primary">Publica tu negocio</Link>
          </article>
        </div>
        <p className="biz-paths__foot">
          ¿Prefieres entender antes cómo funciona? <Link href="#como">Te lo explicamos paso a paso</Link>.
        </p>
      </section>

      {/* Beneficios */}
      <section className="biz-section container">
        <h2 className="biz-section__title">Qué obtienes al reclamar tu ficha</h2>
        <div className="biz-perks">
          {PERKS.map((p) => (
            <article key={p.title} className={`biz-perk${p.soon ? ' biz-perk--soon' : ''}`}>
              <div className="biz-perk__head">
                <h3 className="biz-perk__title">{p.title}</h3>
                <span className={`biz-tag${p.soon ? ' biz-tag--soon' : ' biz-tag--live'}`}>
                  {p.soon ? 'Pronto' : 'Ya disponible'}
                </span>
              </div>
              <p className="biz-perk__body">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Precio */}
      <section className="biz-section container">
        <div className="biz-price">
          <div>
            <p className="biz-price__eyebrow">Cuánto cuesta</p>
            <p className="biz-price__amount">Gratis</p>
          </div>
          <p className="biz-price__body">
            Reclamar tu ficha y mantener tu información es gratis, y lo va a seguir siendo. Nuestro
            principio es simple: <strong>la información completa de un lugar es gratis para todos,
            siempre</strong>. Más adelante habrá opciones pagadas de <strong>visibilidad</strong> —
            siempre opcionales, siempre declaradas, y{' '}
            <Link href="/como-ordenamos">nadie podrá pagar para alterar el ranking</Link>.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="biz-section container">
        <h2 className="biz-section__title">Cómo reclamar tu ficha</h2>
        <ol className="biz-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="biz-step">
              <span className="biz-step__num">{s.n}</span>
              <div>
                <h3 className="biz-step__title">{s.title}</h3>
                <p className="biz-step__body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ con toggle (details nativo, accesible, sin JS) */}
      <section className="biz-section container">
        <h2 className="biz-section__title">Preguntas frecuentes</h2>
        <div className="biz-faq">
          {FAQ.map((f) => (
            <details key={f.q} className="biz-faq__item">
              <summary className="biz-faq__q">{f.q}</summary>
              <p className="biz-faq__a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="biz-cta container">
        <h2 className="biz-cta__title">¿Listo para tomar el control de tu ficha?</h2>
        <div className="biz-hero__actions">
          <Link href="/explorar" className="btn btn--primary">Busca tu local y reclámalo</Link>
          <Link href="/mi-negocio/nuevo" className="btn btn--ghost">Mi local no está</Link>
        </div>
      </section>
    </div>
  )
}
