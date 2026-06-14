import { DomainError } from '@domain/shared/DomainError'

// Un lugar no puede ser su propio ancestro: el contenedor padre-hijo es un árbol,
// no un grafo con ciclos. El caso trivial (ser su propio padre) lo detecta el
// dominio; el transitivo (A→B→A) lo valida el use case con el repositorio.
export class PlaceCycleError extends DomainError {
  readonly code = 'PLACE_CYCLE'
  constructor() {
    super('Un lugar no puede contenerse a sí mismo ni a uno de sus contenedores.')
  }
}
