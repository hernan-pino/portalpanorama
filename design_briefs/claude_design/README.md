# Paquete para Claude Design — Portal Panorama

Todo lo que Claude Design necesita para rediseñar el producto. **Claude Design no puede navegar a una
URL** (limitación confirmada en su documentación oficial): solo ve lo que se le sube. Por eso este
paquete son **capturas + documentos**.

## Contenido

| Archivo | Qué es |
|---|---|
| **`00_PROMPT.md`** | Los prompts listos para pegar, en orden (auditoría → sistema → pantallas). **Empieza acá.** |
| **`01_BRIEF.md`** | El producto, el usuario ideal ("el organizador"), el tono, el problema de diseño y qué se espera de vuelta |
| **`02_INVENTARIO_PANTALLAS.md`** | Las 35 pantallas, los 4 flujos y los 10 componentes que se repiten |
| **`03_SISTEMA_ACTUAL.md`** | Los tokens que existen hoy + las restricciones técnicas que el diseño debe respetar |
| **`capturas/movil/`** | 37 pantallas a 390px — **las que mandan** (el producto es mobile-first) |
| **`capturas/desktop/`** | Las mismas 37 a 1440px |

## Cómo se generaron las capturas

Con el sitio corriendo en local sobre la base de datos real (384 lugares publicados), en Playwright,
página completa, en los 4 estados de sesión: **sin sesión · consumidor · dueño de negocio · admin**.
Las cuentas de prueba usadas se sembraron y se borraron al terminar.

**Las capturas no están en git** (19 MB de binarios regenerables). Para rehacerlas:

```bash
npx tsx --env-file=.env.local scripts/design-shots-setup.ts    # cuentas de prueba
npx next dev                                                   # en otra terminal
npx tsx --env-file=.env.local scripts/design-shots.ts          # las 74 capturas (--solo=05,23 para algunas)
npx tsx scripts/design-shots-compress.ts                       # PNG → JPEG (90 MB → 19 MB)
npx tsx --env-file=.env.local scripts/design-shots-setup.ts --clean   # ⚠️ revertir SIEMPRE
```

⚠️ **Gotcha del script:** en el form de login, el primer `button[type=submit]` es el de **Google**
(va arriba porque es el método preferido). Hay que apuntar al botón "Ingresar con email" o el
navegador se va a `accounts.google.com` y todas las capturas con sesión salen como pantalla de login.

## El camino de vuelta

Cuando el sistema esté diseñado, **no hay que copiar nada a mano**: Claude Code puede leer el proyecto
de Claude Design con la herramienta `DesignSync` y traducir los tokens y componentes al repo.
