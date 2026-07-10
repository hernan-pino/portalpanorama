import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cómo ordenamos los lugares',
  description:
    'Cómo ordenamos los lugares en Portal Panorama: un puntaje transparente que combina la nota de Google, cuántas reseñas la respaldan y el promedio de su categoría. Nadie paga por aparecer más arriba.',
}

// Página de transparencia del ranking (sesión 27). Explica el score bayesiano en
// simple. Si la fórmula cambia (Score.ts), este texto debe cambiar con ella.
export default function ComoOrdenamosPage() {
  return (
    <div className="legal container">
      <p className="eyebrow">Transparencia</p>
      <h1 className="display legal__title">Cómo ordenamos los lugares</h1>

      <p className="legal__lead">
        Cuando exploras el sitio o abres una guía, los lugares aparecen ordenados por un puntaje
        que calculamos nosotros. Aquí te explicamos exactamente cómo funciona, porque creemos que
        un ranking en el que confías tiene que poder explicarse. Lo primero:{' '}
        <strong>nadie paga por aparecer más arriba</strong>.
      </p>

      <section className="legal__section">
        <h2>1. Partimos de la nota de Google</h2>
        <p>
          Cada lugar muestra su calificación real de Google Maps: la nota promedio (de 1 a 5
          estrellas) y cuántas personas la respaldan. No inventamos notas propias ni las
          editamos — lo que ves es lo que la gente opinó.
        </p>
      </section>

      <section className="legal__section">
        <h2>2. Las reseñas pesan: un 5,0 con 3 opiniones no es un 5,0</h2>
        <p>
          Una nota perfecta con 3 reseñas dice menos que un 4,7 con 2.000. Por eso no ordenamos
          por la nota a secas: usamos un <strong>promedio ponderado por confianza</strong> (los
          matemáticos le dicen promedio bayesiano). Funciona así:
        </p>
        <ul>
          <li>
            Si un lugar tiene <strong>muchas reseñas</strong>, su puntaje es prácticamente su nota
            de Google: la evidencia manda.
          </li>
          <li>
            Si tiene <strong>pocas reseñas</strong>, su puntaje se acerca al promedio de los
            lugares como él, hasta que junte evidencia propia.
          </li>
        </ul>
        <p>
          Así, un 4,7 con miles de opiniones le gana a un 5,0 con un puñado — que es lo que
          cualquiera esperaría de una recomendación honesta.
        </p>
      </section>

      <section className="legal__section">
        <h2>3. Te comparamos con tus pares, no con todo el mundo</h2>
        <p>
          Ese “promedio de los lugares como él” es el <strong>promedio de su categoría</strong>:
          una sushilería nueva se compara con el resto de la gastronomía, y un karting con los
          demás panoramas de juegos. ¿Por qué importa? Porque hay rubros donde la gente califica
          más alto y otros donde es más exigente. Si comparáramos todo contra un único promedio
          global, castigaríamos a los rubros de nota alta y les regalaríamos puntos a los duros.
        </p>
        <p>
          Cuando una categoría todavía tiene pocos lugares con reseñas, usamos el promedio general
          del sitio hasta que la categoría junte muestra suficiente.
        </p>
      </section>

      <section className="legal__section">
        <h2>4. Qué NO influye en el orden</h2>
        <ul>
          <li>
            <strong>La plata:</strong> no vendemos posiciones, no hay fichas “patrocinadas” y
            ningún lugar puede pagar para subir.
          </li>
          <li>
            <strong>Nuestro gusto personal:</strong> en las guías destacamos lugares con criterio
            editorial (y lo decimos), pero el orden de las grillas y de la exploración sale del
            puntaje, no de favoritismos.
          </li>
        </ul>
      </section>

      <section className="legal__section">
        <h2>5. Cuándo se actualiza</h2>
        <p>
          El puntaje se recalcula cada vez que actualizamos la información de un lugar o cuando
          entra contenido nuevo al catálogo. Si la nota de Google de un lugar cambia, su posición
          también puede cambiar.
        </p>
      </section>

      <section className="legal__section">
        <h2>¿Dudas o sugerencias?</h2>
        <p>
          Si crees que un lugar está mal calificado o quieres proponer uno nuevo,{' '}
          <Link href="/explorar">explora el catálogo</Link> y usa el botón de reporte en su ficha,
          o escríbenos desde el pie de página. Este sistema mejora con tu feedback.
        </p>
      </section>
    </div>
  )
}
