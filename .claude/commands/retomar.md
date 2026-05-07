---
description: Retoma el proyecto leyendo los documentos clave y el último commit. Reporta estado y espera confirmación antes de avanzar.
---

Estoy retomando el proyecto. Antes de hacer nada:

1. Lee project-brief/PROJECT_BRIEF.md
2. Lee CLAUDE.md
3. Lee ARCHITECTURE.md
4. Lee project-brief/OPEN_QUESTIONS.md
5. Lee project-brief/DESIGN_NOTES.md si existe.
6. Revisa el último commit con `git log -1 --stat` para saber dónde
   quedamos y qué archivos se tocaron.
7. Revisa si hay archivos modificados sin commitear con `git status`.

Luego dime, en formato breve:
- En qué fase estamos.
- Qué quedó terminado en la fase anterior.
- Qué sigue según el plan.
- Si hay preguntas abiertas en OPEN_QUESTIONS.md que requieren mi
  respuesta antes de avanzar.
- Si hay cambios sin commitear, qué son y si conviene commitearlos
  antes de seguir.

NO empieces a programar hasta que yo confirme explícitamente.
NO ejecutes el siguiente paso del plan sin mi OK.