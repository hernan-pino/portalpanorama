// Serializa datos para incrustarlos en un <script type="application/ld+json">.
//
// JSON.stringify NO escapa "<", asi que un "</script>" contenido en cualquier
// campo (p.ej. la description o el phone que el dueno verificado edita desde su
// panel) cerraria el bloque <script> y permitiria inyectar HTML que se ejecuta en
// el navegador de TODO visitante de la ficha publica (XSS almacenado). Reemplazar
// "<" por su escape JSON "<" neutraliza tanto "</script>" como "<!--" (los
// unicos vectores de ruptura del bloque) sin alterar el dato: el parser JSON-LD lo
// vuelve a decodificar a "<". Es la mitigacion estandar para JSON-LD embebido.
const JSON_LT_ESCAPE = String.fromCharCode(92) + 'u003c' // "<"

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, JSON_LT_ESCAPE)
}
