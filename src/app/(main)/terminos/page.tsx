import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Uso',
  description: 'Condiciones de uso de Portal Panorama.',
}

const VIGENCIA = '15 de junio de 2026'
const CONTACTO = 'hola@portalpanorama.cl'

export default function TerminosPage() {
  return (
    <div className="legal container">
      <p className="eyebrow">Legal</p>
      <h1 className="display legal__title">Términos de Uso</h1>
      <p className="legal__meta">Última actualización: {VIGENCIA}</p>

      <p className="legal__lead">
        Estos términos regulan el uso de Portal Panorama. Al acceder al sitio y usar sus funciones,
        aceptas estas condiciones. Si no estás de acuerdo, te pedimos no utilizar el servicio.
      </p>

      <section className="legal__section">
        <h2>1. Qué es Portal Panorama</h2>
        <p>
          Portal Panorama es una guía editorial de lugares de Santiago, Chile. Reunimos y organizamos
          información sobre lugares para ayudarte a descubrir y elegir dónde ir. El contenido tiene
          fines informativos.
        </p>
      </section>

      <section className="legal__section">
        <h2>2. Tu cuenta</h2>
        <p>
          Para guardar listas e historial necesitas una cuenta. Eres responsable de mantener la
          confidencialidad de tu contraseña y de la actividad que ocurra en tu cuenta. Debes entregar
          información veraz al registrarte y ser mayor de edad o contar con autorización de tu
          representante legal.
        </p>
      </section>

      <section className="legal__section">
        <h2>3. Uso aceptable</h2>
        <p>Al usar el sitio, te comprometes a no:</p>
        <ul>
          <li>Usar el servicio con fines ilícitos o que infrinjan derechos de terceros.</li>
          <li>Intentar vulnerar la seguridad del sitio o acceder a datos de otras personas.</li>
          <li>Extraer datos de forma automatizada (scraping) sin nuestra autorización.</li>
          <li>Reportar información falsa de manera deliberada.</li>
        </ul>
      </section>

      <section className="legal__section">
        <h2>4. Contenido y propiedad intelectual</h2>
        <p>
          El contenido editorial, el diseño y las marcas del sitio pertenecen a Portal Panorama o se
          usan con autorización. Las calificaciones y reseñas de lugares provienen de Google y se
          muestran con fines informativos; sus derechos pertenecen a sus respectivos titulares.
        </p>
      </section>

      <section className="legal__section">
        <h2>5. Exactitud de la información</h2>
        <p>
          Trabajamos para que la información sea correcta y esté al día, pero los lugares cambian
          (horarios, precios, disponibilidad) y puede haber errores. La información se entrega «tal
          cual», sin garantía de exactitud. Si detectas un dato incorrecto o un lugar cerrado, puedes
          reportarlo desde su ficha para ayudarnos a corregirlo.
        </p>
      </section>

      <section className="legal__section">
        <h2>6. Limitación de responsabilidad</h2>
        <p>
          Portal Panorama no se responsabiliza por tu experiencia en los lugares listados ni por
          decisiones tomadas a partir de la información del sitio. La relación con cada lugar es entre
          tú y dicho establecimiento.
        </p>
      </section>

      <section className="legal__section">
        <h2>7. Cambios en el servicio y en los términos</h2>
        <p>
          Podemos modificar o discontinuar funciones del sitio, y actualizar estos términos. La
          versión vigente estará siempre publicada en esta página con su fecha de actualización.
        </p>
      </section>

      <section className="legal__section">
        <h2>8. Ley aplicable y contacto</h2>
        <p>
          Estos términos se rigen por las leyes de la República de Chile. Para cualquier consulta,
          escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
        </p>
      </section>
    </div>
  )
}
