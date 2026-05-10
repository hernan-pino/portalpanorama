---
description: Retoma el proyecto leyendo los documentos clave y el último commit. Reporta estado y espera confirmación antes de avanzar.
---

Estoy retomando el proyecto Portal Panorama. Antes de hacer nada:

1. Lee `ROADMAP.md` — identifica qué paso está EN CURSO o es el próximo PENDIENTE.
2. Lee `CLAUDE.md` — recuerda las reglas arquitectónicas permanentes.
3. Lee `ARCHITECTURE.md` — bounded contexts, ports y schema de BD.
4. Revisa el último commit con `git log -3 --stat` para saber exactamente dónde quedamos.
5. Revisa si hay archivos modificados sin commitear con `git status`.

Luego dime, en formato breve:

- **Fase/Paso actual:** qué paso de la Fase 7 estamos haciendo (según ROADMAP.md).
- **Último trabajo:** qué se hizo en el commit más reciente y qué archivos se tocaron.
- **Próximo paso:** qué hay que hacer según el ROADMAP, con los archivos clave.
- **Sin commitear:** si hay cambios pendientes de commit, listarlos y sugerir si commitear antes de seguir.
- **Bloqueantes:** si hay algo marcado como ⚠️ BLOQUEADO o preguntas abiertas que requieran decisión.

NO empieces a programar hasta que yo confirme explícitamente.
NO ejecutes el siguiente paso sin mi OK.
