// Plantilla branded compartida por todos los correos. HTML con tablas e inline
// styles a propósito: es lo único que renderiza consistente en Gmail/Outlook/Apple Mail
// (no hay CSS externo ni fuentes custom fiables). Los colores son hex literales
// equivalentes a los tokens del sitio (no se pueden usar var() en email).

const BRAND = {
  paper: '#FBF8F2', // --paper-00
  paperSoft: '#F6F2EA', // --paper-05
  line: '#E4DDCF', // --paper-20
  ink: '#14110F', // --ink-100
  muted: '#6B6557', // --paper-50
  accent: '#C8623C', // ~ --accent-60 (sunset)
  accentDark: '#A24A2C', // ~ --accent-70
} as const

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export interface EmailButton {
  label: string
  url: string
}

interface EmailLayoutParams {
  /** Texto previo que muchos clientes muestran junto al asunto en la bandeja. */
  preheader: string
  /** Cuerpo ya como HTML (párrafos, etc.). Usar `paragraph()` para armarlo. */
  bodyHtml: string
  /** CTA opcional, renderizado como botón. */
  button?: EmailButton
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.ink};">${html}</p>`
}

export function muted(html: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.muted};">${html}</p>`
}

export function renderEmail({ preheader, bodyHtml, button }: EmailLayoutParams): string {
  const buttonHtml = button
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
        <tr>
          <td style="border-radius:10px;background:${BRAND.accent};">
            <a href="${escapeHtml(button.url)}"
               style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:10px;">
              ${escapeHtml(button.label)}
            </a>
          </td>
        </tr>
      </table>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>Portal Panorama</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.paperSoft};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paperSoft};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.paper};border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;">
          <!-- Header / wordmark -->
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${BRAND.line};">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:-0.01em;color:${BRAND.ink};">
                Portal <span style="color:${BRAND.accent};font-style:italic;">Panorama</span>
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px 8px;font-family:Helvetica,Arial,sans-serif;">
              ${bodyHtml}
              ${buttonHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${BRAND.line};font-family:Helvetica,Arial,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                Portal Panorama — descubre los mejores lugares de Chile.<br>
                <a href="https://portalpanorama.cl" style="color:${BRAND.accentDark};text-decoration:none;">portalpanorama.cl</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
