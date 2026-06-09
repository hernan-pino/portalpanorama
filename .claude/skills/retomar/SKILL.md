---
name: retomar
description: Retoma el trabajo de Portal Panorama desde donde quedó. Lee el roadmap, el documento de producto y el plan de la fase actual, y resume en qué vamos, qué se decidió y cuál es el próximo paso concreto. Úsala al empezar una sesión nueva o cuando el usuario diga "retomemos", "en qué íbamos", "ponte al día", "sigamos donde quedamos".
---

# Retomar trabajo — Portal Panorama

Tu objetivo: que el usuario pueda volver después de días sin contexto y, en menos de un
minuto, sepa exactamente en qué van, qué se decidió y qué sigue. No empieces a programar
ni a rediseñar nada — esta skill es solo para **reorientarse y proponer el próximo paso**.

## Pasos

1. **Lee los 3 documentos de estado, en este orden:**
   - `PLAN_FASE9.md` — el plan vivo de la fase actual. Aquí está la sección
     "📍 EN QUÉ VAMOS AHORA MISMO", el estado de cada etapa/sub-sesión, las respuestas
     capturadas y la bitácora de decisiones. **Esta es la fuente de verdad del avance.**
   - `ROADMAP.md` — el seguimiento general del proyecto. Mira sobre todo "ESTADO HOY",
     las fases completadas y los pasos de la fase en curso con su estado (⬜🔄✅⚠️🔁❌⏸️).
   - `PRODUCTO.md` — las preguntas de definición del producto. Mira qué bloques ya
     tienen respuesta (capturadas en PLAN_FASE9.md) y cuáles faltan.

2. **Revisa los últimos commits** para detectar avances no anotados todavía:
   `git log --oneline -8`. Si ves trabajo en commits que el plan no refleja, dilo.

3. **Detecta desalineaciones.** Si el plan, el roadmap y los commits se contradicen
   (ej: el plan dice "Etapa 2 pendiente" pero hay un commit que ya tocó el schema),
   NO asumas — señálalo al usuario y pregunta cuál refleja la realidad.

4. **Entrega un resumen corto** con esta estructura exacta:

   ```
   ## 📍 Dónde vamos
   - Fase / Etapa / Sub-sesión actual (1 línea)
   - Modo de trabajo acordado (si aplica)

   ## ✅ Qué ya está decidido / hecho
   - bullets cortos de lo cerrado relevante a la etapa actual

   ## ⬜ Qué falta en la etapa actual
   - bullets de lo pendiente inmediato

   ## ▶️ Próximo paso concreto
   - la acción exacta que toca ahora (1-3 líneas). Si la etapa es "responder
     preguntas", lista las preguntas pendientes textualmente.
   ```

5. **Termina preguntando** si retoman desde ahí o si algo cambió desde la última sesión.

## Reglas

- **No avances el trabajo en esta skill.** Solo orientas y propones. El usuario decide
  si seguir.
- **No inventes estado.** Si un documento no dice algo, dilo como "no está anotado",
  no lo deduzcas a la fuerza.
- Respeta el ritmo del proyecto: las preguntas de producto van **antes** que el código
  (ver el principio que ordena las etapas en `PLAN_FASE9.md`).
- Mantén el resumen **breve**. El usuario quiere reorientarse rápido, no releer todo.
- Después de cada avance real en una sesión, recuerda que `PLAN_FASE9.md` debe quedar
  actualizado (respuestas capturadas, estados de etapa, bitácora). Si notas que quedó
  desactualizado, ofrécete a ponerlo al día.
