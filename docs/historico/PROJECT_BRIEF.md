# Proyecto: Directorio web de negocios (Chile)

Voy a construir una plataforma de directorio/listings tipo Yelp enfocada en
el mercado chileno. Te adjunto un handoff de Claude Designer con los estilos,
componentes y flujos de usuario. Úsalo como referencia de COMPORTAMIENTO y
DISEÑO, no como guía de arquitectura de código.

## Handoff de Claude Designer

El handoff está en la carpeta:

  design_handoff_portal_panorama/

Contiene:
- README.md   → instrucciones del handoff. LÉELO PRIMERO, define cómo
                interpretar el resto.
- un archivo HTML con el mockup funcional (flujos, pantallas, navegación).
- una carpeta/archivo de assets (estilos, imágenes, tokens visuales).

Orden de lectura:
1. Lee design_handoff_portal_panorama/README.md completo.
2. Abre el HTML y revisa todas las pantallas y flujos. Si tiene navegación
   funcional, recorre los flujos end-to-end (registro, crear listing,
   reclamar, upgrade a premium, búsqueda, dashboard, etc.).
3. Inspecciona los assets para extraer design tokens (colores, tipografía,
   espaciados, componentes) que después vas a respetar en presentation/.

Si algo del handoff es ambiguo o no calza con lo que describo más abajo,
NO improvises: agrégalo a OPEN_QUESTIONS.md y pregúntame.

## Qué ES esta plataforma

- Un directorio público de negocios con búsqueda y filtros.
- Los negocios pueden tener listings GRATUITOS o PREMIUM (con suscripción
  recurrente).
- Usuarios pueden registrarse, guardar favoritos, dejar reviews y tener un
  dashboard personal.
- Dueños de negocio tienen un dashboard separado con analíticas de sus
  listings (vistas, clicks, conversiones).
- Un usuario puede tener múltiples listings.
- Listings pueden ser RECLAMADOS: si alguien crea un listing de un negocio
  ajeno, el dueño real puede reclamarlo con verificación.
- Los listings premium pueden además PROMOCIONARSE (publicidad interna,
  prioridad en resultados de búsqueda).
- Mercado: Chile. Moneda CLP, validación de RUT, integración con Flow
  para pagos recurrentes.
- Fase 2 (después): blogs, contenido editorial.

## Qué NO es

- No es un marketplace (no se transan productos/servicios dentro de la
  plataforma, solo se conectan usuarios con negocios).
- No es una red social (no hay feed, follows, mensajería entre usuarios).
- No es un sistema de reservas ni de booking.
- No es un CMS genérico.
- No tiene multi-tenancy a nivel de organización: cada usuario gestiona
  sus propios listings, no hay "espacios de trabajo" compartidos.

## Stack (DECIDIDO — ver STACK_DECISION.md)

Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind CSS + Auth.js v5

## Arquitectura: Pragmática con separación clara de responsabilidades

Separación clara de responsabilidades, pero sin abstracción innecesaria.
La regla de dependencias es real: domain ← application ← infrastructure/presentation.

Capas:
1. domain/         → entidades, value objects, eventos, errores. Cero
                     imports externos.
2. application/    → use cases + ports (interfaces de repos y servicios).
3. infrastructure/ → implementaciones concretas (Prisma, Flow, email, etc.).
4. presentation/   → HTTP, Next.js routes/server actions, controllers.
5. main/           → src/lib/container.ts, inyección de dependencias.

Reglas que SÍ aplicamos siempre:
- Lógica de negocio no va en page.tsx ni server actions.
- Prisma nunca se importa en domain/ ni application/.
- Money como Value Object (CLP, sin decimales).
- RUT como Value Object con validación de dígito verificador.
- Pagos detrás de un port PaymentGateway.

Reglas que aplicamos con criterio:
- Result<T,E>: solo en use cases con flujos de error complejos.
- Mappers: solo cuando la entidad de dominio difiere genuinamente del modelo BD.
- Un use case puede retornar el objeto Prisma si solo es transporte de datos.

## Cómo quiero que trabajes

CRÍTICO: no escribas todo de una. Vamos por fases. En cada fase:
1. Me explicas qué vas a hacer y por qué.
2. Me haces TODAS las preguntas que tengas antes de empezar.
3. Implementas SOLO esa fase.
4. Corres tests si aplica y me muestras el resultado.
5. Esperas mi OK antes de pasar a la siguiente fase.

Las fases son:

Fase 0 — Documentos fundacionales (COMPLETADA)
Fase 1 — Domain layer
Fase 2 — Application layer
Fase 3 — Infrastructure
Fase 4 — Presentation
Fase 5 — Composition root

## Antipatrones prohibidos

- Importar Prisma o cualquier ORM en domain/ o application/.
- Retornar objetos del ORM desde un use case con lógica de negocio encima.
- Lógica de negocio dentro de un controller, route handler o server action.
- Llamar a APIs externas (Flow, email, etc.) directamente desde un use
  case sin pasar por un port.
- Crear archivos de "helpers" o "utils" genéricos.
- Devolver `any` o `unknown` desde un use case.
- Usar `number` para representar dinero.

## Sobre el handoff de Designer

Úsalo para entender flujos de usuario, componentes visuales y design tokens.
NO lo uses como guía de estructura de carpetas del backend, modelado de
entidades, o decisiones de arquitectura.
NO copies el HTML del handoff como código de producción.

## Subagentes disponibles

Este proyecto tiene subagentes definidos en .claude/agents/. Úsalos cuando
corresponda, sin pedir permiso:

- architecture-guardian → después de cada modificación de código no trivial.
- security-reviewer → después de cambios en auth, pagos, webhooks, queries, file uploads.
- test-runner → después de implementar o modificar tests.
- chile-domain-expert → en código que toque RUT, CLP, Flow o normativa CL.
- db-migration-reviewer → ANTES de aplicar cualquier migración.
- domain-modeler → durante Fases 1 y 2, al diseñar entidades y VOs.
