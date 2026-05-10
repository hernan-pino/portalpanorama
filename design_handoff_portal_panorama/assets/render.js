// Reusable render helpers — return HTML strings
window.PP_R = (() => {
  const I = window.PP_ICON;
  const D = window.PP_DATA;

  function topbar(active) {
    const link = (href, label, key, icon) =>
      `<a href="${href}" class="mobile-nav__link ${active === key ? 'active' : ''}" ${active === key ? 'aria-current="page"' : ''}>${I(icon||'arrowR',18)} ${label}</a>`;
    const navLink = (href, label, key) =>
      `<a href="${href}" ${active === key ? 'aria-current="page"' : ''}>${label}</a>`;
    return `
      <header class="topbar">
        <div class="container topbar__inner">
          <a href="#/" class="brand" aria-label="Portal Panorama, inicio">
            <span class="brand__mark"></span>Portal <em>Panorama</em>
            <small>Santiago, CL</small>
          </a>
          <nav class="topbar__nav">
            ${navLink("#/buscar", "Explorar", "buscar")}
            ${navLink("#/buscar?cat=eventos", "Eventos", "eventos")}
            ${navLink("#/planes", "Para tu negocio", "planes")}
            ${navLink("#/dashboard-negocio", "Mi negocio", "dashboard-negocio")}
          </nav>
          <div class="topbar__actions">
            <a href="#/buscar" class="icon-btn" title="Buscar">${I("search")}</a>
            <a href="#/dashboard-usuario" class="icon-btn" title="Mi cuenta">${I("user")}</a>
            <a href="#/login" class="btn btn--ghost btn--sm">Iniciar sesión</a>
            <a href="#/checkout" class="btn btn--primary btn--sm">Listar mi local</a>
            <button class="topbar__hamburger icon-btn" id="mob-menu-open" aria-label="Menú">${I("menu")}</button>
          </div>
        </div>
      </header>

      <!-- Mobile nav drawer -->
      <div class="mobile-nav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menú principal">
        <div class="mobile-nav__overlay" id="mob-nav-overlay"></div>
        <nav class="mobile-nav__drawer">
          <button class="mobile-nav__close" id="mob-menu-close" aria-label="Cerrar menú">${I("close")}</button>
          <div class="brand" style="margin-bottom:var(--s-4);font-size:20px">
            <span class="brand__mark"></span>Portal <em>Panorama</em>
          </div>
          ${link("#/buscar",             "Explorar",        "buscar",           "search")}
          ${link("#/buscar?cat=eventos", "Eventos",         "eventos",          "catEvt")}
          ${link("#/planes",             "Para tu negocio", "planes",           "sparkle")}
          ${link("#/dashboard-usuario",  "Mi cuenta",       "dashboard-usuario","user")}
          ${link("#/dashboard-negocio",  "Mi negocio",      "dashboard-negocio","grid")}
          <hr class="hairline" style="margin:var(--s-3) 0">
          <a href="#/login"   class="mobile-nav__link">${I("user",18)} Iniciar sesión</a>
          <a href="#/checkout" class="mobile-nav__link cta">${I("sparkle",18)} Listar mi local</a>
        </nav>
      </div>
      <script>
        (function(){
          var btn = document.getElementById('mob-menu-open');
          var nav = document.getElementById('mobile-nav');
          var cls = document.getElementById('mob-menu-close');
          var ovl = document.getElementById('mob-nav-overlay');
          if(!btn||!nav) return;
          btn.onclick = function(){ nav.classList.add('open'); document.body.style.overflow='hidden'; };
          var close = function(){ nav.classList.remove('open'); document.body.style.overflow=''; };
          if(cls) cls.onclick = close;
          if(ovl) ovl.onclick = close;
        })();
      </script>`;
  }

  function placeholder(label, h = null) {
    const styleAttr = h ? `style="height:${h}"` : "";
    return `<div class="placeholder-stripe" data-label="${label}" ${styleAttr}></div>`;
  }

  function placeCard(p, opts = {}) {
    const isFav = window.PP_FAVS.has(p.id);
    return `
      <a class="place-card ${p.premium ? 'is-premium' : ''}" href="#/lugar?id=${p.id}" data-id="${p.id}">
        <div class="place-card__media placeholder-stripe" data-label="${p.cover}">
          ${p.premium ? `<span class="premium-badge" style="position:absolute;top:12px;left:12px;z-index:3;background:var(--paper-00);">Premium</span>` : ""}
          <button class="place-card__fav ${isFav ? 'active' : ''}" aria-label="Guardar" data-fav="${p.id}" onclick="event.preventDefault(); event.stopPropagation(); window.PP_APP.toggleFav('${p.id}', this)">
            ${isFav ? I("heartF", 14) : I("heart", 14)}
          </button>
        </div>
        <div class="place-card__body">
          <div class="place-card__meta">
            <span>${p.category}</span><span class="dot"></span><span>${p.neighborhood}</span>
          </div>
          <h3 class="place-card__title">${p.name}</h3>
          <div class="place-card__row">
            <span class="rating">${I("starF", 14)}<span class="rating__num">${p.rating.toFixed(1)}</span><span class="rating__count">·&nbsp;${p.reviews}</span></span>
            <span>${p.price} · ${p.hours.split('·')[0].trim()}</span>
          </div>
        </div>
      </a>`;
  }

  function eventCard(ev) {
    const [day, month] = (ev.date.match(/(\d{2})\s(\w+)/) || [null, "", ""]).slice(1);
    return `
      <a class="event-card" href="#/buscar?cat=eventos">
        <div class="event-card__date">
          <span class="day">${day || "—"}</span>
          <span class="month">${month || "Mayo"}</span>
        </div>
        <div>
          <h3 class="event-card__title">${ev.title}</h3>
          <div class="event-card__sub">${ev.where} · ${ev.tag}</div>
        </div>
        <span class="event-card__cta">${I("arrowR", 18)}</span>
      </a>`;
  }

  function sectionHead(num, title, ctaLabel, ctaHref) {
    return `
      <div class="sec-head">
        <span class="sec-head__num">${num}</span>
        <h2 class="sec-head__title">${title}</h2>
        ${ctaLabel ? `<a class="sec-head__cta" href="${ctaHref}">${ctaLabel} ${I("arrowR", 14)}</a>` : ""}
      </div>`;
  }

  function footer() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer__top">
            <div>
              <div class="footer__brand-display">Portal<br>Panorama.</div>
              <p style="max-width:340px;margin-top:24px;color:var(--paper-30);font-size:14px;line-height:1.5">
                Una guía editorial de panoramas, restaurantes y vida cultural en Santiago de Chile.
                Curada por gente que vive la ciudad.
              </p>
            </div>
            <div>
              <h4>Explorar</h4>
              <ul>
                <li><a href="#/buscar">Restaurantes</a></li>
                <li><a href="#/buscar">Bares</a></li>
                <li><a href="#/buscar">Cafés</a></li>
                <li><a href="#/buscar">Museos</a></li>
                <li><a href="#/buscar?cat=eventos">Eventos</a></li>
              </ul>
            </div>
            <div>
              <h4>Para negocios</h4>
              <ul>
                <li><a href="#/planes">Planes</a></li>
                <li><a href="#/planes">Lista tu local</a></li>
                <li><a href="#/login">Panel admin</a></li>
                <li><a href="#/sistema">Recursos</a></li>
              </ul>
            </div>
            <div>
              <h4>Empresa</h4>
              <ul>
                <li><a href="#/">Sobre nosotros</a></li>
                <li><a href="#/">Editorial</a></li>
                <li><a href="#/">Contacto</a></li>
                <li><a href="#/">Términos · Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© 2026 Portal Panorama · Santiago de Chile</span>
            <span>Versión 0.1 — Beta</span>
          </div>
        </div>
      </footer>`;
  }

  return { topbar, placeCard, eventCard, sectionHead, footer, placeholder };
})();
