# 01 · Mercado y modelo de negocio
> Directorio de panoramas Chile — notas de trabajo  
> Estado: borrador / sugerencias para definir en producción

---

## Contexto del proyecto

Plataforma web tipo directorio que centraliza lugares, eventos y experiencias en Chile. Apunta a resolver la fragmentación actual del descubrimiento de panoramas (Instagram/TikTok, blogs desactualizados, Google Maps genérico). El MVP inicia con 2-3 comunas de Santiago y se expande gradualmente.

---

## Análisis de competidores

| Plataforma | Qué hace bien | Vacío principal |
|---|---|---|
| **panoramas.app** | Diseño limpio, eventos actualizados diariamente, buenas categorías | Solo eventos con ticket. Sin lugares permanentes, sin filtros de contexto, sin regiones |
| **keai.cl** | Algoritmo de preferencias, mapa de eventos, redirige a ticketeras | Solo eventos. Requiere app descargada. Sin lugares ni contexto social |
| **panorama-chile.cl** | Directorio turístico con experiencias y hospedajes | Enfocado en turismo, no panoramas cotidianos. En etapa piloto |
| **bookstore.cl / chileestuyo.cl** | Contenido editorial de calidad | Son medios, no directorios. Info dispersa en artículos, no en fichas buscables |

**Conclusión:** ninguno cobra de forma visible y estructurada a negocios pequeños. El mercado está abierto para quien llegue con precios transparentes y propuesta de valor clara para el lado negocio.

---

## Vacíos de mercado identificados

1. **Lugares permanentes + eventos en un solo directorio filtrable** — nadie los mezcla bien
2. **Filtros de contexto social** — con niños, en pareja, gratis, pet friendly, por comuna
3. **Info operacional centralizada** — horarios reales, precio, reserva, cómo llegar
4. **Eventos locales pequeños sin canal** — ferias de barrio, talleres, pop-ups invisibles
5. **Cobertura regional** — 90% del contenido existente es Santiago

---

## Pain points

### Usuarios que buscan panoramas

| Pain point | Descripción |
|---|---|
| No sé qué hay de nuevo | TikTok muestra lo masivo o fotogénico. Sin filtros propios por contexto |
| Info insuficiente para decidir | El reel no dice precio, horario, si requiere reserva, si es apto para niños |
| Info desactualizada | Artículos con horarios del 2022, eventos que ya terminaron, locales cerrados |
| Nada cerca de mi barrio | Todo es Santiago centro. El resto del país no existe en el contenido |

### Negocios que quieren promocionarse

| Pain point | Descripción |
|---|---|
| Meta Ads caro e inmedible | $300K–$1.5M CLP/mes en agencia. Sin ROI claro para negocios pequeños |
| Invisibles para búsqueda activa | Solo aparecen si alguien los sigue o los etiqueta |
| Sin canal para evento puntual | Pop-up, taller, feria pequeña — dependen de que cuentas de panoramas respondan el DM |
| Google My Business incompleto | No permite contexto: "ideal para primera cita", "reserva recomendada los fines de semana" |

---

## Modelo de precios

### Fichas de negocios (lugares permanentes)

| Tier | Precio | Qué incluye |
|---|---|---|
| **Gratis** | $0 | Ficha básica: nombre, dirección, horario, 1 foto, link externo. Sin CTA directo. Sin posición garantizada |
| **Destacado** | $9.990–$14.990/mes | Galería, descripción larga, botones CTA, etiquetas personalizadas, estadísticas, posición mejorada, mención newsletter |
| **Patrocinio zona/categoría** | $29.990–$49.990/mes | Posición fija al tope de una categoría o zona. Para negocios con más presupuesto |

> **Argumento de venta clave:** el botón de reserva/WhatsApp está bloqueado en la ficha gratuita. El negocio ve visitas llegando pero no puede convertirlas. Ese dolor es el argumento solo.

> **⚠️ Por definir:** ¿a partir de qué mes se empieza a cobrar? Se sugiere ofrecer Tier Destacado gratis los primeros 3-6 meses a cambio de que completen bien la ficha.

### Eventos

| Tier | Precio | Qué incluye |
|---|---|---|
| **Gratis** | $0 | Ficha básica de evento. Aparece en listados sin posición garantizada. Considerar limitar a 1 evento gratis por cuenta después de 6 meses |
| **Evento destacado** | $4.990–$6.990 por evento | Aparece en home, "Esta semana", categoría. Badge, galería, CTA directo, vigente hasta fecha del evento |
| **Plan productora** | $29.990–$39.990/mes | Shows ilimitados ese mes, todos destacados, página de productora propia, badge verificado, estadísticas |
| **Plan venue / recinto** | $49.990–$69.990/mes | Todo del plan productora + página de venue con agenda integrada, notificación a seguidores |

> **Regla clave:** nunca cobrar por show suelto a quien tiene agenda recurrente (ej: Noverland). El plan mensual es más barato para ellos y más predecible para ti.

### Newsletter / Broadcast semanal

| Slot | Precio | Descripción |
|---|---|---|
| Mención de categoría | $9.990/envío | Aparece en sección de su categoría con nombre, descripción corta y link |
| Destacado principal | $24.990/envío | 1 slot al inicio del newsletter. Máximo 1 por semana |
| Patrocinio por keyword | $14.990/mes | Cada vez que el newsletter menciona una categoría (ej: "stand-up"), aparece tu nombre asociado |
| Pack mensual (4 envíos) | $34.990/mes | Mención en los 4 newsletters del mes en categoría elegida |

> **⚠️ Por definir:** no cobrar newsletter hasta tener 500 suscriptores con tasa de apertura sobre 35-40%.

---

## Estrategia de marketing

### Fase 1 — Tracción (mes 1–4)
- Subir 50-80 fichas bien completadas manualmente (2-3 comunas)
- Crear cuenta TikTok/IG propia con contenido de nicho: "5 lugares en Ñuñoa con tu perro", "qué hacer en Santiago con menos de $5K". Termina cada video con la URL de la plataforma
- Newsletter desde el día 1, aunque tenga 30 suscriptores. Construir hábito antes de tener audiencia
- DM directo a 5-10 negocios por semana para onboarding (no venta)

### Fase 2 — Primera monetización (mes 4–8)
- Newsletter semanal como producto de adquisición de usuarios y argumento de venta para negocios
- Colabs con creadores de 5K–50K seguidores (más efectivo que grandes por audiencia comprometida)
- Posicionarse en Reddit r/chile, grupos de Facebook de barrios, comunidades de senderismo
- Primera venta: promo de evento ($4.990–$6.990), no suscripción

### Fase 3 — Escala inicial (mes 8–12)
- Vender con datos propios: "tu ficha tuvo 340 vistas este mes de personas buscando panoramas en tu comuna"
- Rankings semanales por categoría — los negocios los comparten solos en sus redes
- PR orgánico: newsletters de startups chilenas, Radio Duna Tendencias, El Definido

> **Lo que NO hacer al inicio:** Google Ads, Meta Ads, influencers grandes. El canal orgánico es la ventaja real como founder solo.

---

## Proyección de ingresos año 1

> Escenario conservador. Solo yo, tiempo completo. Sin presupuesto de ads.

| Período | Fichas activas | Pagando | Ingresos estimados |
|---|---|---|---|
| Mes 1–2 | 20–40 fichas | 0 | $0 |
| Mes 3–4 | 80–120 fichas | 0 (aún gratis) + 3–5 eventos | $18.000–$30.000 |
| Mes 5–6 | 150–200 fichas | 10–15 destacadas | $168.000–$252.000 |
| Mes 7–8 | 250–350 fichas | 20–30 destacadas | $330.000–$480.000 |
| Mes 9–10 | 400–500 fichas | 35–50 destacadas | $540.000–$780.000 |
| Mes 11–12 | 600–800 fichas | 60–90 + 2–3 patrocinios | $970.000–$1.450.000 |
| **Acumulado año 1** | — | — | **$2.000.000–$3.000.000 CLP** |

### Fast track a $200K mensuales en 3 meses

| Fuente | Cantidad | Total |
|---|---|---|
| Fichas destacadas ($12.000/mes) | 10 | $120.000 |
| Plan productora ($34.990/mes) | 1 | $34.990 |
| Eventos destacados sueltos ($5.990) | 4 | $23.960 |
| Menciones newsletter ($9.990) | 2 | $19.980 |
| **Total** | | **~$198.930 CLP** |

> La palanca crítica son las 10 fichas destacadas. Todo lo demás es complementario.

---

## Pendientes de definir

- [ ] ¿Desde qué mes exacto se empieza a cobrar?
- [ ] ¿Cuántos meses gratis de Tier Destacado para early adopters?
- [ ] ¿Límite de eventos gratis por cuenta?
- [ ] ¿El newsletter va por email, WhatsApp broadcast, o ambos?
- [ ] ¿Cuándo se activa el patrocinio por keyword del newsletter?
