---
name: tests
description: Corre la suite de tests de Portal Panorama (Vitest) y reporta el resultado de forma concisa. Úsala cuando el usuario diga "corre los tests", "testea", "pasa la suite", "están verdes?", o después de tocar dominio (domain/) o use cases (application/) para confirmar que las invariantes siguen intactas antes de commitear.
---

# Correr los tests — Portal Panorama

La suite son **tests unitarios de dominio puros** (sin BD, sin red): validan las invariantes
de negocio críticas — el cálculo del `score` bayesiano (orden por defecto de toda búsqueda),
los topes de tags por capa, el anti-ciclo de lugares contenedores, las transiciones de estado
de `Place`, el ownership de colecciones (defensa anti-IDOR), los VOs `Slug`/`Email` y el
matching tolerante de la búsqueda. Corren en menos de 1 segundo.

## Cuándo correrla

- **Siempre antes de commitear** cambios en `src/domain/` o `src/application/`.
- Después de modificar una regla de negocio (fórmula del score, límites de tags, transiciones,
  ownership), para confirmar que el test correspondiente sigue pasando o actualizarlo a conciencia.
- Cuando el usuario lo pida explícitamente.

No hace falta correrla para cambios solo de presentación (`components/`, CSS, `page.tsx` sin lógica).

## Pasos

1. Ejecuta la suite completa:

   ```
   npm test
   ```

   (equivale a `vitest run`; config en `vitest.config.ts`, env `node`, paths del tsconfig resueltos).

2. **Reporta solo lo relevante:**
   - Si **todo pasa**: `✅ N tests pasados en Xs` y nada más.
   - Si **algo falla**, por cada fallo: nombre del test, archivo:línea y el mensaje de error en
     **una línea**. Sin stack traces completos salvo que el usuario los pida.

3. **Si hay fallos, diagnostica antes de tocar nada.** Un test rojo puede significar dos cosas
   muy distintas: (a) el cambio rompió una invariante de verdad → se arregla el código; (b) la
   regla de negocio cambió a propósito → se actualiza el test. **No reescribas el test para que
   pase sin entender cuál de las dos es.** Si no está claro, pregúntale al usuario.

## Agregar tests

Los tests viven **colocados** junto al archivo que prueban, con sufijo `.test.ts`
(ej. `src/domain/place/Place.test.ts`). Al sumar una regla de negocio nueva al dominio o un
use case con lógica no trivial, agrega su test en el mismo movimiento. Mantén el estilo de los
existentes: factory mínima de props + casos por comportamiento, comentarios en español.

## Reglas

- Esta skill **no modifica código de producción**; solo corre y reporta (y, si corresponde,
  ayuda a decidir si un fallo es un bug o un test desactualizado).
- Si `npm test` no encuentra el comando o falla por configuración (no por un test), dilo tal cual
  en vez de inventar un resultado verde.
