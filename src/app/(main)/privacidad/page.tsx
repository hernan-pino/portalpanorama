import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo Portal Panorama trata tus datos personales (Ley N° 19.628).',
}

// Fecha de última revisión del texto. Actualizar al editar el contenido legal.
const VIGENCIA = '30 de junio de 2026'
const CONTACTO = 'hola@portalpanorama.cl'

export default function PrivacidadPage() {
  return (
    <div className="legal container">
      <p className="eyebrow">Legal</p>
      <h1 className="display legal__title">Política de Privacidad</h1>
      <p className="legal__meta">Última actualización: {VIGENCIA}</p>

      <p className="legal__lead">
        En Portal Panorama nos tomamos en serio tu privacidad. Esta política explica qué datos
        personales tratamos, con qué fin y qué derechos tienes sobre ellos, conforme a la
        <strong> Ley N° 19.628 sobre Protección de la Vida Privada</strong> de Chile.
      </p>

      <section className="legal__section">
        <h2>1. Quién es el responsable</h2>
        <p>
          Portal Panorama es el responsable del tratamiento de los datos personales que recopilamos
          a través de este sitio. Para cualquier consulta sobre tus datos, escríbenos a{' '}
          <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
        </p>
      </section>

      <section className="legal__section">
        <h2>2. Qué datos recopilamos</h2>
        <ul>
          <li>
            <strong>Datos de cuenta:</strong> nombre y correo electrónico que ingresas al registrarte.
            Tu contraseña se almacena siempre <strong>cifrada</strong> (hash); nunca la guardamos ni la
            vemos en texto plano.
          </li>
          <li>
            <strong>Datos de uso:</strong> los lugares que guardas en tus listas, tu historial de
            lugares visitados dentro del sitio y, opcionalmente, tu comuna de preferencia.
          </li>
          <li>
            <strong>Datos técnicos:</strong> cookies estrictamente necesarias para mantener tu sesión
            iniciada.
          </li>
          <li>
            <strong>Datos de analítica:</strong> usamos herramientas de medición para entender cómo se
            usa el sitio y mejorarlo. <strong>Google Analytics</strong> recopila datos de uso de forma
            agregada (páginas vistas, origen del tráfico, tipo de dispositivo) y <strong>Microsoft
            Clarity</strong> genera mapas de calor y grabaciones anónimas de la navegación (clics y
            desplazamientos), que excluyen automáticamente lo que escribes en campos sensibles como las
            contraseñas. Estos datos no se usan para identificarte personalmente.
          </li>
        </ul>
      </section>

      <section className="legal__section">
        <h2>3. Para qué usamos tus datos</h2>
        <ul>
          <li>Crear y gestionar tu cuenta, y mantener tu sesión iniciada.</li>
          <li>Guardar tus listas y tu historial para personalizar tu experiencia.</li>
          <li>Enviarte correos transaccionales (por ejemplo, el de bienvenida).</li>
          <li>Mejorar el contenido y el funcionamiento del sitio.</li>
        </ul>
        <p>No vendemos tus datos personales a terceros.</p>
      </section>

      <section className="legal__section">
        <h2>4. Cookies</h2>
        <p>
          Usamos cookies estrictamente necesarias para autenticarte y mantener tu sesión. Sin ellas,
          el inicio de sesión no funciona. No usamos cookies de publicidad. Nuestras herramientas de
          analítica (Google Analytics y Microsoft Clarity) pueden usar cookies o identificadores para
          medir el uso del sitio de forma agregada; nunca con fines publicitarios.
        </p>
      </section>

      <section className="legal__section">
        <h2>5. Con quién compartimos datos</h2>
        <p>
          Compartimos datos únicamente con proveedores que nos permiten operar el servicio (por
          ejemplo, alojamiento del sitio, envío de correos y analítica de uso —Google Analytics y
          Microsoft Clarity—), quienes los tratan por nuestra cuenta y bajo confidencialidad. Las calificaciones y reseñas de lugares que ves provienen de Google y
          se muestran con fines informativos.
        </p>
      </section>

      <section className="legal__section">
        <h2>6. Tus derechos</h2>
        <p>
          Conforme a la Ley N° 19.628, tienes derecho a <strong>acceder</strong> a tus datos,{' '}
          <strong>rectificarlos</strong> si son inexactos, <strong>cancelarlos</strong> (eliminarlos) y{' '}
          <strong>oponerte</strong> a su tratamiento. Para ejercer cualquiera de estos derechos,
          escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> y responderemos en los plazos que
          establece la ley.
        </p>
      </section>

      <section className="legal__section">
        <h2>7. Seguridad</h2>
        <p>
          Aplicamos medidas razonables para proteger tus datos, incluido el cifrado de contraseñas y
          conexiones seguras. Ningún sistema es infalible, pero trabajamos para resguardar tu
          información.
        </p>
      </section>

      <section className="legal__section">
        <h2>8. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios en el servicio o en la normativa.
          Publicaremos la versión vigente en esta página con su fecha de actualización.
        </p>
      </section>

      <section className="legal__section">
        <h2>9. Contacto</h2>
        <p>
          Si tienes dudas sobre esta política o sobre el tratamiento de tus datos, escríbenos a{' '}
          <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
        </p>
      </section>
    </div>
  )
}
