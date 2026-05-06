# Open Questions — Portal Panorama

Dudas sobre dominio, flujos, prioridades y diseño. Se mantiene vivo durante todo el proyecto.
Estado: ✅ Respondida | ⏳ Pendiente

---

## Dominio y Modelo de Negocio

**Q1. ¿Planes para usuarios consumidores en scope?**
El handoff muestra "Planes para ti" (Plus $3.990/mes, Pro $9.990/mes) además de planes para negocios.
✅ **Respondida:** Solo listings premium para negocios. Usuarios son siempre gratis (favoritos/listas). Un usuario puede publicar un listing y convertirse en dueño de negocio — el rol "business owner" no es exclusivo.

**Q2. ¿"Mi feed" del dashboard de usuario está en scope para MVP?**
El handoff muestra un tab "Mi feed" con timeline de updates de lugares guardados. El brief no lo menciona explícitamente.
✅ **Respondida (ver Q19):** Sí, va en el MVP. Los usuarios ven novedades de sus lugares guardados (FeedItem generado por evento ListingUpdated).

**Q3. ¿El catálogo de barrios es fijo o configurable?**
El handoff hardcodea 10 barrios: Lastarria, Bellavista, Providencia, Italia, Ñuñoa, Vitacura, Las Condes, Yungay, Brasil, Centro.
⏳ **Pendiente** — ¿Es ese el catálogo definitivo? ¿Se agregan más comunas? ¿Es configurable desde un panel admin?

**Q4. ¿Un listing puede pertenecer a más de una categoría?**
✅ **Respondida:** Una categoría principal + tags de subcategorías (ej: categoría "Cafés" + tag "Heladería"). Ambos deben ser filtrables en búsqueda. Un café con tag "heladería" debe aparecer al buscar cualquiera de las dos keywords.

**Q5. ¿Los tags son libres o de un catálogo predefinido?**
✅ **Respondida:** Híbrido. El dueño elige del catálogo predefinido, pero puede proponer tags nuevos que quedan pendientes de aprobación por el equipo admin. Los tags aprobados pasan al catálogo general.

**Q6. ¿El flujo de "reclamar un listing" es verificación manual o automática?**
✅ **Respondida:** Revisión manual por el equipo (el usuario + posiblemente un amigo). El claim queda en estado PENDIENTE hasta que sea APROBADO o RECHAZADO. Necesita alguna forma de ver y gestionar claims pendientes (ver Q14 actualizada).

**Q7. ¿Los "eventos" son listings especiales o una entidad separada?**
✅ **Respondida:** Entidad separada. Un evento es algo puntual (aunque puede repetirse), mientras que un listing es el perfil permanente de un negocio. Un evento puede estar vinculado opcionalmente a un listing (ej: "Jazz en Thelonious" → Listing de Thelonious). Campos específicos de Event por definir más adelante.

**Q8. ¿Los negocios pueden tener múltiples fotos? ¿Hay límite free vs premium?**
✅ **Respondida (ver Q18):** Free: hasta 3 fotos. Premium: ilimitado. Regla implementada en `Listing.canAddImage()`.

---

## Técnico

**Q9. ¿IDs: CUID2 o UUID?**
✅ **Respondida por defecto:** CUID2 — más cortos, URL-friendly, sin guiones. Se aplica a todas las entidades.

**Q10. ¿Búsqueda facetada (Meilisearch) necesaria en MVP?**
La búsqueda con filtros facetados puede implementarse con Postgres full-text en MVP y enchufar Meilisearch después sin cambiar use cases (está detrás de un port).
⏳ **Pendiente** — Recomendación: empezar con Postgres FTS, migrar a Meilisearch en Fase 3 si el volumen lo justifica.

**Q11. ¿Social auth (Google, Apple) en scope para MVP?**
✅ **Respondida:** Solo email + contraseña para MVP. Google y Apple se agregan después.

**Q12. ¿Los precios del handoff ($3.990 / $9.990 CLP/mes) son definitivos?**
✅ **Respondida:** No definidos aún. Valores placeholder hasta producción.

**Q13. ¿Storage de imágenes?**
✅ **Respondida:** UploadThing para MVP. Migrable a Cloudflare R2 después sin tocar el dominio (detrás de port StorageService).

**Q14. ¿Cómo gestionan los claims pendientes tú y tu amigo?**
✅ **Respondida:** Ruta `/admin` en la misma app, protegida por rol ADMIN. Lista de claims pendientes con acciones de aprobar/rechazar. El rol ADMIN ya está en el enum `UserRole`.

---

## UX / Diseño

**Q15. ¿Qué muestra /planes?**
✅ **Respondida:** Sin toggle. La página muestra directamente la comparativa Free vs. Premium para negocios — qué incluye cada plan, con tabla comparativa. Sin sección "Para ti" separada.

**Q16. ¿Hay mapa en la ficha de lugar para MVP?**
✅ **Respondida:** No. Solo dirección en texto para MVP. Mapa OpenStreetMap queda para Fase 2.

**Q17. ¿Barrios: catálogo fijo o configurable?**
✅ **Respondida:** Catálogo fijo en código — las subdivisiones de la Región Metropolitana de Santiago más los barrios más emblemáticos. No configurable desde admin.

**Q18. ¿Límite de fotos por listing?**
✅ **Respondida:** Free: hasta 3 fotos. Premium: ilimitado. Esta regla vive en el dominio (Listing valida el límite según su plan).

**Q19. ¿"Mi feed" del dashboard de usuario va en MVP?**
✅ **Respondida:** Sí, va en el MVP. Los usuarios ven novedades de sus lugares guardados.

---

---

## Decisiones técnicas — Fase 1

**D1. Bootstrapping manual en lugar de create-next-app**
`create-next-app` rechaza directorios con mayúsculas en el nombre (restricción npm). Se optó por scaffoldear manualmente `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` y `eslint.config.mjs`. Resultado equivalente con más control sobre las dependencias iniciales.

**D2. `Money.format()` removida del dominio**
El architecture-guardian detectó que `Intl.NumberFormat('es-CL', ...)` en el VO es un concern de presentación. Se extrajo a `src/lib/formatMoney.ts` que recibe `MoneyProps` (plain object). El dominio no sabe cómo luce el dinero en pantalla.

**D3. `TagStatus` como enum separado**
El tipo de `ListingTag.status` se definió inicialmente como string union inline `'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED'`. Se extrajo a `src/domain/listing/TagStatus.ts` para consistencia con el resto de enums y para evitar divergencia silenciosa si los valores cambian.

**D4. `ClaimStatus` vive en `ListingClaim.ts`, no en archivo propio**
A diferencia de `ListingPlan` y `ListingStatus`, `ClaimStatus` está declarado en el mismo archivo que la entidad que lo usa. Es el único enum del dominio sin archivo propio. Justificación: `ClaimStatus` solo tiene sentido junto a `ListingClaim`; extraerlo sería sobreingeniería sin beneficio real.

**D5. `DuplicateReviewError` existe en dominio pero se lanza desde infrastructure**
La clase del error vive en `src/domain/review/errors/`. Sin embargo, quien lo lanza será `PrismaReviewRepository` (Fase 3) al capturar el error de constraint único de Postgres. El dominio define el tipo; infrastructure lo materializa.

**D6. Sin test runner en Fase 1**
No se configuró Jest ni Vitest. El tipo de verificación en esta fase fue `tsc --noEmit` (cero errores de tipos, modo strict). Tests unitarios del dominio se agregarán en Fase 2 cuando los use cases pongan las entidades en movimiento.

**D7. `rating` en Review como `number`, no VO**
Decisión confirmada de ARCHITECTURE.md: la validación de rango (1-10) pertenece a Zod en presentation. El dominio acepta el `number` ya validado. No se creó un VO `Rating` por no tener lógica de negocio encima del número.

---

## Historial de actualizaciones

| Fecha | Cambio |
|-------|--------|
| 2026-05-05 | Creación inicial con preguntas detectadas en Fase 0 |
| 2026-05-05 | Ronda de preguntas pre-Fase 1: Q4-Q8, Q11-Q16, Q17-Q19 respondidas |
| 2026-05-06 | Fase 1 completada: decisiones técnicas D1-D7 documentadas |
