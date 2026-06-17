import { loadEnvFile } from 'node:process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

try { loadEnvFile('.env.local') } catch { }

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ──────────────────────────────────────────────────────────────────────────────
// Seed Fase 9 — solo CATÁLOGOS + admin. Los lugares (Place) entran por CSV en la
// Etapa 5; los eventos están apagados. Idempotente: upsert por slug.
// Orden obligatorio: catálogos ANTES que cualquier lugar (FKs por slug).
// ──────────────────────────────────────────────────────────────────────────────

/** lowercase, sin tildes (ñ→n), kebab-case. "Ñuñoa" → "nunoa", "Irarrázaval" → "irarrazaval" */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Metro de Santiago (red operativa, 7 líneas) ────────────────────────────────
// Colores corregidos (decisión 2.6): L3 café, L6 morada. lat/lng = null en MVP
// (la estación se elige a mano por slug; nearest-station automático = v2).
// Las combinaciones (Baquedano = L1+L5) se resuelven por dedup: la estación que
// aparece en varias líneas queda conectada a todas.

const METRO_LINES: { code: string; name: string; color: string; stations: string[] }[] = [
  {
    code: 'L1', name: 'Línea 1', color: '#E1251B',
    stations: ['San Pablo', 'Neptuno', 'Pajaritos', 'Las Rejas', 'Ecuador', 'San Alberto Hurtado', 'Universidad de Santiago', 'Estación Central', 'Unión Latinoamericana', 'República', 'Los Héroes', 'La Moneda', 'Universidad de Chile', 'Santa Lucía', 'Universidad Católica', 'Baquedano', 'Salvador', 'Manuel Montt', 'Pedro de Valdivia', 'Los Leones', 'Tobalaba', 'El Golf', 'Alcántara', 'Escuela Militar', 'Manquehue', 'Hernando de Magallanes', 'Los Dominicos'],
  },
  {
    code: 'L2', name: 'Línea 2', color: '#F5A800',
    stations: ['Vespucio Norte', 'Zapadores', 'Dorsal', 'Einstein', 'Cementerios', 'Cerro Blanco', 'Patronato', 'Puente Cal y Canto', 'Santa Ana', 'Los Héroes', 'Toesca', 'Parque O\'Higgins', 'Rondizzoni', 'Franklin', 'El Llano', 'San Miguel', 'Lo Vial', 'Departamental', 'Ciudad del Niño', 'Lo Ovalle', 'El Parrón', 'La Cisterna', 'El Bosque', 'Observatorio', 'Copa Lo Martínez', 'Hospital El Pino'],
  },
  {
    code: 'L3', name: 'Línea 3', color: '#8B4513',
    stations: ['Plaza Quilicura', 'Lo Cruzat', 'Ferrocarril', 'Cardenal Caro', 'Vivaceta', 'Conchalí', 'Plaza Chacabuco', 'Hospitales', 'Puente Cal y Canto', 'Plaza de Armas', 'Parque Almagro', 'Matta', 'Irarrázaval', 'Monseñor Eyzaguirre', 'Ñuñoa', 'Chile España', 'Villa Frei', 'Plaza Egaña', 'Fernando Castillo Velasco'],
  },
  {
    code: 'L4', name: 'Línea 4', color: '#004F9F',
    stations: ['Tobalaba', 'Cristóbal Colón', 'Francisco Bilbao', 'Príncipe de Gales', 'Simón Bolívar', 'Plaza Egaña', 'Los Orientales', 'Grecia', 'Los Presidentes', 'Quilín', 'Las Torres', 'Macul', 'Vicuña Mackenna', 'Vicente Valdés', 'Rojas Magallanes', 'Trinidad', 'San José de la Estrella', 'Los Quillayes', 'Elisa Correa', 'Hospital Sótero del Río', 'Protectora de la Infancia', 'Las Mercedes', 'Plaza de Puente Alto'],
  },
  {
    code: 'L4A', name: 'Línea 4A', color: '#009CDE',
    stations: ['La Cisterna', 'San Ramón', 'Santa Rosa', 'La Granja', 'Santa Julia', 'Vicuña Mackenna'],
  },
  {
    code: 'L5', name: 'Línea 5', color: '#00A651',
    stations: ['Plaza de Maipú', 'Santiago Bueras', 'Del Sol', 'Monte Tabor', 'Las Parcelas', 'Laguna Sur', 'Barrancas', 'Pudahuel', 'San Pablo', 'Lo Prado', 'Blanqueado', 'Gruta de Lourdes', 'Quinta Normal', 'Cumming', 'Santa Ana', 'Plaza de Armas', 'Bellas Artes', 'Baquedano', 'Parque Bustamante', 'Santa Isabel', 'Irarrázaval', 'Ñuble', 'Rodrigo de Araya', 'Carlos Valdovinos', 'Camino Agrícola', 'San Joaquín', 'Pedrero', 'Mirador', 'Bellavista de La Florida', 'Vicente Valdés'],
  },
  {
    code: 'L6', name: 'Línea 6', color: '#943C93',
    stations: ['Cerrillos', 'Lo Valledor', 'Presidente Pedro Aguirre Cerda', 'Franklin', 'Bío Bío', 'Ñuble', 'Estadio Nacional', 'Ñuñoa', 'Inés de Suárez', 'Los Leones'],
  },
]

// ─── Comunas de la Región Metropolitana (52) ────────────────────────────────────
const COMMUNES = [
  'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura', 'Ñuñoa',
]

// ─── Barrios reconocidos (lista del usuario) → comuna(s) ─────────────────────────
// M2M: un barrio puede caer en varias comunas (Bellavista, Barrio Italia). El Place
// se filtra independiente por barrio o por comuna.
const NEIGHBORHOODS: { name: string; communeNames: string[] }[] = [
  { name: 'Barrio Lastarria', communeNames: ['Santiago'] },
  { name: 'Bellas Artes', communeNames: ['Santiago'] },
  { name: 'Bellavista', communeNames: ['Recoleta', 'Providencia'] },
  { name: 'Barrio Italia', communeNames: ['Providencia', 'Ñuñoa'] },
  { name: 'Barrio París-Londres', communeNames: ['Santiago'] },
  { name: 'Isidora Goyenechea', communeNames: ['Las Condes'] },
  { name: 'Estación Central', communeNames: ['Estación Central'] },
  { name: 'Patronato', communeNames: ['Recoleta'] },
  { name: 'Barrio Yungay', communeNames: ['Santiago'] },
  { name: 'Barrio Brasil', communeNames: ['Santiago'] },
  { name: 'Parque Forestal', communeNames: ['Santiago'] },
  { name: 'Centro Histórico', communeNames: ['Santiago'] },
  { name: 'Barrio Mapocho', communeNames: ['Santiago'] },
  { name: 'Pedro de Valdivia', communeNames: ['Providencia'] },
  { name: 'Manuel Montt', communeNames: ['Providencia'] },
  { name: 'Barrio Suecia', communeNames: ['Providencia'] },
]

// ─── Categorías (7) + subcategorías (B.4 / doc 04) ───────────────────────────────
// 4 activas con lugares permanentes; 3 event-only registradas pero apagadas.
const CATEGORIES: {
  name: string; isActive: boolean; eventOnly: boolean; subcategories: string[]
}[] = [
  {
    name: 'Gastronomía', isActive: true, eventOnly: false,
    subcategories: ['Restaurante', 'Café / Cafetería', 'Bar', 'Botillería', 'Fuente de soda', 'Food truck', 'Heladería', 'Pastelería / Panadería', 'Jugería', 'Cevichería', 'Picada', 'Sushi / Asiática'],
  },
  {
    name: 'Naturaleza y aire libre', isActive: true, eventOnly: false,
    subcategories: ['Parque urbano', 'Cerro / Trekking', 'Playa / Lago / Río', 'Reserva natural', 'Mirador', 'Jardín botánico', 'Camping', 'Piscina / Balneario'],
  },
  {
    name: 'Arte y cultura', isActive: true, eventOnly: false,
    subcategories: ['Museo', 'Galería de arte', 'Exposición temporal', 'Centro cultural', 'Monumento / Patrimonio', 'Experiencia inmersiva', 'Cine / Cineteca', 'Biblioteca'],
  },
  {
    name: 'Locales y tiendas', isActive: true, eventOnly: false,
    subcategories: ['Librería', 'Disquería / Vinilería', 'Tienda de diseño', 'Vintage / Segunda mano', 'Vinoteca / Botillería premium', 'Chocolatería', 'Florería', 'Tienda de plantas', 'Juguetería', 'Tienda de mascotas'],
  },
  {
    // Venues permanentes a los que vas por una actividad/experiencia (Places, no eventos).
    // Regla: la categoría = por qué vas. Un bar/pub se queda en Gastronomía + tag "vida nocturna";
    // acá van los lugares cuyo centro es la actividad nocturna o el panorama.
    name: 'Entretenimiento', isActive: true, eventOnly: false,
    subcategories: ['Discoteca / Club', 'Karaoke', 'Escape room', 'Bowling', 'Club de jazz / blues', 'Sala de conciertos', 'Salón de juegos / Arcade', 'Mirador / Observatorio'],
  },
  {
    // event-only: tipos de SHOW (ocurren en una fecha). Se encienden con Eventos.
    // Karaoke/Escape room salieron de acá: son venues, viven en "Entretenimiento".
    name: 'Shows y espectáculos', isActive: false, eventOnly: true,
    subcategories: ['Concierto', 'Comedia / Stand-up', 'Teatro', 'Danza / Ballet', 'Ópera / Clásica', 'Festival', 'Fiesta / Club', 'Cine al aire libre', 'Trivia / Pub quiz', 'Magia / Circo'],
  },
  {
    name: 'Talleres y actividades', isActive: false, eventOnly: true,
    subcategories: ['Taller creativo', 'Clase de cocina', 'Cata de vinos / cervezas', 'Yoga / Meditación', 'Deporte / Aventura', 'Tour guiado', 'Pintura con copa', 'Cerámica', 'Fotografía', 'Baile', 'Idiomas', 'Tecnología / Código'],
  },
  {
    name: 'Ferias y mercados', isActive: false, eventOnly: true,
    subcategories: ['Feria artesanal', 'Feria gastronómica', 'Mercado de diseño', 'Feria de antigüedades', 'Farmers market', 'Pop-up', 'Feria de libro', 'Mercado navideño'],
  },
]

// ─── Tags — 6 capas (decisión 2026-06-14) ────────────────────────────────────────
// Universales (categoryId = null): AUDIENCE, OCCASION, VIBE, EXPERIENCE, SERVICE.
// Topes (solo subjetivas) y exclusiones viven en el dominio, no en el schema.
// Reserva NO es tag (enum ReservationPolicy). Precio NO es tag (enum PriceRange).
// Métodos de pago NO son tag (Place.paymentMethods String[]). Lluvia = enum RainPolicy.
// Horario NO es tag (se deriva del horario cargado). Presupuesto = PriceRange.
const TAGS_AUDIENCE = ['En pareja', 'Con familia', 'Con niños pequeños', 'Con amigos', 'Solo/a', 'Adultos mayores', 'Todo público', 'LGBT+ friendly']
const TAGS_OCCASION = ['Cita', 'Cumpleaños', 'Celebración', 'Junta de amigos', 'Reunión de trabajo', 'Trabajo remoto / Estudiar', 'Carrete / Salida nocturna', 'Panorama familiar', 'Afteroffice']
const TAGS_VIBE = ['Tranquilo', 'Animado', 'Íntimo / Romántico', 'Relajado', 'Casual', 'Elegante', 'Bohemio', 'Acogedor', 'De barrio', 'Trendy', 'Especial / Único', 'Cultural', 'Aventurero', 'Fiestero']
const TAGS_EXPERIENCE = ['Al aire libre', 'Terraza', 'Rooftop', 'Vista panorámica', 'Música en vivo', 'Vida nocturna', 'Fotogénico / Instagrameable', 'Atardecer', 'Interactivo', 'Degustaciones']
const TAGS_SERVICE = ['Cerca del metro', 'Accesible en micro', 'Requiere auto', 'Estacionamiento propio', 'Estacionamiento cercano', 'Bicicletero', 'Acceso silla de ruedas', 'Baño disponible', 'Cambiador de pañales', 'Zona de lactancia', 'Pet friendly', 'WiFi', 'Aire acondicionado', 'Para llevar', 'Delivery']

// Específicos (condicionales por categoría). Primer paso, refinable. Solo las 4
// categorías activas; los específicos de las event-only se seedearán al encender eventos.
// Los que se promovieron a capas universales (Terraza, Música en vivo, Vista panorámica,
// Para llevar, Delivery) salieron de acá para no duplicar slug.
const TAGS_SPECIFIC: Record<string, string[]> = {
  'Gastronomía': ['Happy hour', 'Menú del día', 'Menú infantil', 'Opciones veganas', 'Vegetariano', 'Sin gluten', 'Pantalla deportes', 'Sillas para bebés', 'Cocina chilena', 'Cocina peruana', 'Cocina italiana', 'Cocina japonesa', 'Cocina china', 'Cocina árabe', 'Cocina mexicana'],
  'Naturaleza y aire libre': ['Dificultad baja', 'Dificultad media', 'Dificultad alta', 'Con zona de picnic', 'Con sombra', 'Señal de celular', 'Apto coche guagua', 'Solo verano', 'Abierto todo el año'],
  'Arte y cultura': ['Visita guiada disponible', 'Audioguía', 'Fotografía permitida', 'Cafetería interna', 'Tienda interna', 'Exposición permanente', 'Exposición temporal', 'Talleres asociados'],
  'Locales y tiendas': ['Solo para llevar', 'Con zona de estar', 'Productos nacionales', 'Productos importados', 'Artesanal / Local', 'Envío disponible'],
}

async function main() {
  console.log('Seeding catálogos (Fase 9)…')

  // ── Metro: líneas → estaciones (dedup de combinaciones) ──
  const lineIdByCode: Record<string, string> = {}
  for (const line of METRO_LINES) {
    const rec = await prisma.metroLine.upsert({
      where: { code: line.code },
      update: { name: line.name, color: line.color },
      create: { id: createId(), code: line.code, name: line.name, color: line.color },
    })
    lineIdByCode[line.code] = rec.id
  }
  console.log(`  ✓ ${METRO_LINES.length} líneas de Metro`)

  // estación → set de líneas a las que pertenece
  const stationLines = new Map<string, { name: string; lineCodes: Set<string> }>()
  for (const line of METRO_LINES) {
    for (const name of line.stations) {
      const slug = slugify(name)
      if (!stationLines.has(slug)) stationLines.set(slug, { name, lineCodes: new Set() })
      stationLines.get(slug)!.lineCodes.add(line.code)
    }
  }
  for (const [slug, { name, lineCodes }] of stationLines) {
    const connectLines = [...lineCodes].map((c) => ({ id: lineIdByCode[c] }))
    await prisma.metroStation.upsert({
      where: { slug },
      update: { name, lines: { set: connectLines } },
      create: { id: createId(), slug, name, lines: { connect: connectLines } },
    })
  }
  console.log(`  ✓ ${stationLines.size} estaciones de Metro`)

  // ── Comunas ──
  const communeIdByName: Record<string, string> = {}
  for (const name of COMMUNES) {
    const slug = slugify(name)
    const rec = await prisma.commune.upsert({
      where: { slug },
      update: { name },
      create: { id: createId(), slug, name },
    })
    communeIdByName[name] = rec.id
  }
  console.log(`  ✓ ${COMMUNES.length} comunas`)

  // ── Barrios (M2M con comunas) ──
  for (const n of NEIGHBORHOODS) {
    const communeIds = n.communeNames.map((name) => {
      const id = communeIdByName[name]
      if (!id) throw new Error(`Comuna no encontrada para barrio ${n.name}: ${name}`)
      return { id }
    })
    const slug = slugify(n.name)
    await prisma.neighborhood.upsert({
      where: { slug },
      update: { name: n.name, communes: { set: communeIds } },
      create: { id: createId(), slug, name: n.name, communes: { connect: communeIds } },
    })
  }
  console.log(`  ✓ ${NEIGHBORHOODS.length} barrios`)

  // ── Categorías + subcategorías ──
  const categoryIdByName: Record<string, string> = {}
  let sortOrder = 1
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name === 'Naturaleza y aire libre' ? 'naturaleza'
      : cat.name === 'Arte y cultura' ? 'arte-cultura'
      : cat.name === 'Locales y tiendas' ? 'locales-tiendas'
      : cat.name === 'Shows y espectáculos' ? 'shows'
      : cat.name === 'Talleres y actividades' ? 'talleres'
      : cat.name === 'Ferias y mercados' ? 'ferias'
      : cat.name) // Gastronomía → gastronomia
    const rec = await prisma.category.upsert({
      where: { slug },
      update: { name: cat.name, isActive: cat.isActive, eventOnly: cat.eventOnly, sortOrder },
      create: { id: createId(), slug, name: cat.name, isActive: cat.isActive, eventOnly: cat.eventOnly, sortOrder },
    })
    categoryIdByName[cat.name] = rec.id
    sortOrder++

    for (const sub of cat.subcategories) {
      const subSlug = slugify(sub)
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: rec.id, slug: subSlug } },
        update: { name: sub },
        create: { id: createId(), slug: subSlug, name: sub, categoryId: rec.id },
      })
    }
  }
  console.log(`  ✓ ${CATEGORIES.length} categorías + subcategorías`)

  // ── Tags ──
  type Layer = 'AUDIENCE' | 'OCCASION' | 'VIBE' | 'EXPERIENCE' | 'SERVICE' | 'SPECIFIC'
  async function upsertTag(name: string, layer: Layer, categoryId: string | null) {
    const slug = slugify(name)
    await prisma.tag.upsert({
      where: { slug },
      update: { name, layer, categoryId },
      create: { id: createId(), slug, name, layer, categoryId },
    })
  }
  for (const name of TAGS_AUDIENCE) await upsertTag(name, 'AUDIENCE', null)
  for (const name of TAGS_OCCASION) await upsertTag(name, 'OCCASION', null)
  for (const name of TAGS_VIBE) await upsertTag(name, 'VIBE', null)
  for (const name of TAGS_EXPERIENCE) await upsertTag(name, 'EXPERIENCE', null)
  for (const name of TAGS_SERVICE) await upsertTag(name, 'SERVICE', null)
  let specificCount = 0
  for (const [catName, tags] of Object.entries(TAGS_SPECIFIC)) {
    const categoryId = categoryIdByName[catName]
    for (const name of tags) { await upsertTag(name, 'SPECIFIC', categoryId); specificCount++ }
  }
  console.log(`  ✓ tags: ${TAGS_AUDIENCE.length} audience · ${TAGS_OCCASION.length} occasion · ${TAGS_VIBE.length} vibe · ${TAGS_EXPERIENCE.length} experience · ${TAGS_SERVICE.length} service · ${specificCount} específicos`)

  // ── Admin ──
  const passwordHash = await bcrypt.hash('admin1234', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portalpanorama.cl' },
    update: { role: 'ADMIN' },
    create: { id: createId(), email: 'admin@portalpanorama.cl', name: 'Admin', role: 'ADMIN', passwordHash },
  })
  console.log(`  ✓ Usuario admin: ${admin.email}`)

  // ── Usuario de prueba (consumidor) ──
  const userHash = await bcrypt.hash('usuario1234', 10)
  await prisma.user.upsert({
    where: { email: 'usuario@portalpanorama.cl' },
    update: { role: 'USER' },
    create: { id: createId(), email: 'usuario@portalpanorama.cl', name: 'Camila Torres', role: 'USER', passwordHash: userHash },
  })
  console.log(`  ✓ Usuario de prueba: usuario@portalpanorama.cl`)

  console.log('Seed completo ✅')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
