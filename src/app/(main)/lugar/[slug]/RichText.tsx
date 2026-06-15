// Render mínimo de la descripción: respeta saltos de línea (vía CSS white-space:
// pre-line en .ficha__lead) y convierte **negrita** en <strong> para poder resaltar
// frases clave y hacer el texto escaneable. No es markdown completo a propósito —
// solo negrita, que es lo único que se necesita en una descripción.
export function RichText({ text, className }: { text: string; className?: string }) {
  // split por **…**: en el array, los índices impares son el contenido en negrita.
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <p className={className}>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p))}
    </p>
  )
}
