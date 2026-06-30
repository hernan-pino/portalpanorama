'use client'
import { useState } from 'react'

// Redes sociales del footer. Instagram ya tiene cuenta (@portalpanorama.cl) → enlaza
// directo. TikTok y Facebook aún no existen: al hacer clic muestran un aviso de "pronto".
export function FooterSocial() {
  const [showMsg, setShowMsg] = useState(false)

  return (
    <div className="footer-social">
      <div className="footer-social__icons">
        <a
          href="https://www.instagram.com/portalpanorama.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social__btn"
          aria-label="Instagram (@portalpanorama.cl)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <button type="button" className="footer-social__btn" aria-label="TikTok" onClick={() => setShowMsg(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9V10c-1.3 0-2.5-.4-3.5-1.1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.3V3H16z" />
          </svg>
        </button>
        <button type="button" className="footer-social__btn" aria-label="Facebook" onClick={() => setShowMsg(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 9V7c0-.9.6-1 1-1h2V3h-3c-2.2 0-3 1.5-3 3v3H9v3h2v9h3v-9h2.5l.5-3h-3z" />
          </svg>
        </button>
      </div>
      {showMsg && (
        <p className="footer-social__msg" role="status">
          Esa red aún no la tenemos. ¡Síguenos en Instagram mientras tanto! 🚧
        </p>
      )}
    </div>
  )
}
