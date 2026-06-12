import { PrismaClient } from '@prisma/client'
import {
  CommuneOption,
  LocationRepository,
  MetroStationOption,
  NeighborhoodOption,
} from '@application/ports/LocationRepository'

// Catálogo geográfico para los selectores del form de admin (comunas, barrios,
// estaciones de metro). Solo lectura: se siembra.
export class PrismaLocationRepository implements LocationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listCommunes(): Promise<CommuneOption[]> {
    const rows = await this.prisma.commune.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
    return rows.map((r) => ({ id: r.id, name: r.name }))
  }

  // El barrio puede caer en varias comunas (M2M): se trae `communeIds` para que el
  // form acote la lista de barrios a la comuna elegida.
  async listNeighborhoods(): Promise<NeighborhoodOption[]> {
    const rows = await this.prisma.neighborhood.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, communes: { select: { id: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      communeIds: r.communes.map((c) => c.id),
    }))
  }

  async listMetroStations(): Promise<MetroStationOption[]> {
    const rows = await this.prisma.metroStation.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, lines: { select: { code: true, color: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      lines: r.lines.map((l) => ({ code: l.code, color: l.color })),
    }))
  }
}
