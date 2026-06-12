// Catálogo geográfico (comunas, barrios, estaciones de metro) para los selectores
// del form de admin. Solo lectura: se siembra. Devuelve ids porque las FK del
// Place se guardan por id. El barrio puede caer en varias comunas (M2M), por eso
// trae `communeIds` para que el form pueda acotar la lista al elegir comuna.

export interface CommuneOption {
  id: string
  name: string
}

export interface NeighborhoodOption {
  id: string
  name: string
  communeIds: string[]
}

export interface MetroStationOption {
  id: string
  name: string
  lines: { code: string; color: string }[]
}

export interface LocationRepository {
  listCommunes(): Promise<CommuneOption[]>
  listNeighborhoods(): Promise<NeighborhoodOption[]>
  listMetroStations(): Promise<MetroStationOption[]>
}
