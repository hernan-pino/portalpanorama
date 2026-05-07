---
description: Cierre formal de una fase del proyecto. Corre tests, audita arquitectura, actualiza docs y resume el estado.
---

Antes de cerrar esta fase:

1. Confirma que todos los tests pasan. Usa el subagente test-runner.
2. Pasa el subagente architecture-guardian sobre los archivos modificados
   en esta fase.
3. Si hubo cambios sensibles (auth, pagos, webhooks, queries, file uploads),
   pasa también el subagente security-reviewer.
4. Actualiza project-brief/OPEN_QUESTIONS.md con las dudas que surgieron
   en esta fase y cómo se resolvieron. Si hay decisiones técnicas
   importantes (ej: elección de cuid vs uuid, estructura de un agregado),
   documéntalas también ahí.
5. Hazme un resumen claro de:
   - Qué se construyó en esta fase (archivos clave, decisiones importantes).
   - Qué deuda técnica o pendientes quedaron documentados.
   - Qué sigue en la siguiente fase según ARCHITECTURE.md y PROJECT_BRIEF.md.
6. Sugiere un mensaje de commit descriptivo siguiendo conventional commits
   (ej: "feat(domain): complete phase 1 - entities and value objects").

NO hagas el commit tú. Yo lo reviso y lo hago después.
NO avances a la siguiente fase. Espera mi OK explícito.