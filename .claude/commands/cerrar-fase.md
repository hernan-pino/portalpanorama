---
description: Cierre formal de un paso de la Fase 7. Corre tests, audita arquitectura y seguridad, actualiza ROADMAP.md y resume el estado.
---

Antes de cerrar este paso:

1. **Tests:** Usa el subagente `test-runner` para confirmar que todos los tests pasan.

2. **Arquitectura:** Usa el subagente `architecture-guardian` sobre los archivos modificados en este paso.
   Verifica que no haya violaciones de la regla de dependencias (domain ← application ← infrastructure/presentation)
   ni antipatrones listados en CLAUDE.md.

3. **Seguridad:** Usa el subagente `security-reviewer` SIEMPRE que el paso haya tocado:
   - Auth / registro / sesiones
   - Pagos o webhooks (Flow)
   - Inputs de usuario que van a la BD (forms, server actions)
   - Queries SQL directas (PostgresFTSSearchService, etc.)
   - Upload de archivos
   Si el paso no tocó nada de eso, omite este subagente y menciona el motivo.

4. **Actualiza ROADMAP.md:**
   - Cambia el estado del paso de 🔄 EN CURSO a ✅ COMPLETADO
   - Registra el commit hash en la columna "Commit de cierre"
   - Si surgieron preguntas nuevas durante el paso, agrégalas en "Preguntas abiertas"

5. **Resumen:** Dime:
   - Qué se construyó exactamente (archivos creados/modificados clave).
   - Decisiones técnicas importantes tomadas en este paso.
   - Deuda técnica o pendientes que quedaron fuera del scope.
   - Qué sigue (próximo paso según ROADMAP.md).

6. **Commit:** Sugiere un mensaje de commit siguiendo Conventional Commits:
   `feat(paso-8.X): descripción breve del paso`

NO hagas el commit tú. Yo lo reviso y lo hago después.
NO avances al siguiente paso. Espera mi OK explícito.
