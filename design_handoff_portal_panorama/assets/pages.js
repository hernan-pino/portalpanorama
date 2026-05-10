// Page renderers — return HTML string for #app
window.PP_PAGES = (() => {
  const I = window.PP_ICON;
  const D = window.PP_DATA;
  const R = window.PP_R;

  // ---------- HOME ----------
  function home() {
    const featured = D.places.filter(p => p.premium).slice(0, 3);
    const nearby = D.places.slice(0, 6);
    const cats = D.categories;
    return `
      ${R.topbar("home")}
      <main class="page-enter">
        <section class="hero container">
          <div class="hero__copy">
            <div class="hero__eyebrow">
              <span class="line"></span>
              <span class="eyebrow">Edición #04 · Otoño en Santiago</span>
            </div>
            <h1 class="hero__title">
              Lo bueno de la ciudad, <em>curado</em> como revista.
            </h1>
            <p class="hero__sub">
              Restaurantes, bares, museos y panoramas escritos por gente
              que sale, prueba y vuelve a contarlo. Sin ranking automático,
              sin reservas, sin ruido.
            </p>
          </div>
          <div class="hero__tools">
          <form class="hero-search" id="hero-search" onsubmit="event.preventDefault(); window.PP_APP.searchSubmit(this);">
            <div class="hero-search__field">
              <label>Qué</label>
              <input type="text" name="q" placeholder="Restaurante, café, bar…" autocomplete="off">
            </div>
            <div class="hero-search__field">
              <label>Dónde</label>
              <select name="where">
                <option value="">Todo Santiago</option>
                ${D.neighborhoods.map(n => `<option>${n}</option>`).join("")}
              </select>
            </div>
            <div class="hero-search__field">
              <label>Cuándo</label>
              <select name="when">
                <option>Ahora abierto</option>
                <option>Esta noche</option>
                <option>Este fin de semana</option>
                <option>Cualquier momento</option>
              </select>
            </div>
            <button class="hero-search__btn" aria-label="Buscar">${I("arrowR", 22)}</button>
          </form>
            <div class="chip-row">
              ${["Brunch dominical", "Terrazas con vista", "Después del trabajo", "Plan en familia"].map(t =>
                `<button class="chip" onclick="window.PP_ROUTER.go('/buscar', {q: '${t}'})">${t}</button>`
              ).join("")}
            </div>
          </div>
          <div class="hero__bottom">
            <div class="hero__stats">
              <div><strong>1.247</strong>Lugares verificados</div>
              <div><strong>118</strong>Eventos esta semana</div>
              <div><strong>32</strong>Barrios cubiertos</div>
            </div>
          </div>
        </section>

        <!-- Categorías -->
        <section class="container" style="margin-top: var(--s-24)">
          ${R.sectionHead("01 / 06", `<em>Categorías</em> para empezar`, "Ver todas", "#/buscar")}
          <div class="cat-grid">
            ${cats.slice(0, 8).map(c => `
              <a class="cat-card" href="#/buscar?cat=${c.id}">
                <div class="cat-card__top">
                  <span class="cat-card__icon">${I(c.icon, 22)}</span>
                  <span class="cat-card__num">${c.glyph} / 08</span>
                </div>
                <h3 class="cat-card__title">${c.label.replace(/(s)$/, '<em>$1</em>')}</h3>
                <span class="cat-card__count">
                  ${c.count} lugares
                  <span class="arrow">${I("arrowR", 14)}</span>
                </span>
              </a>
            `).join("")}
          </div>
        </section>

        <!-- Destacados -->
        <section class="container" style="margin-top: var(--s-24)">
          ${R.sectionHead("02 / 06", `Lo más <em>recomendado</em>`, "Ver todo el listado", "#/buscar")}
          <div class="featured-grid">
            ${featured.map(p => R.placeCard(p)).join("")}
          </div>
        </section>

        <!-- Eventos -->
        <section class="container" style="margin-top: var(--s-24)">
          ${R.sectionHead("03 / 06", `Esta <em>semana</em> en la ciudad`, "Ver agenda completa", "#/buscar?cat=eventos")}
          <div>
            ${D.events.map(R.eventCard).join("")}
            <div class="event-card" style="border-bottom: 1px solid var(--surface-line);"></div>
          </div>
        </section>

        <!-- Panoramas cerca -->
        <section class="container" style="margin-top: var(--s-24)">
          ${R.sectionHead("04 / 06", `Panoramas <em>nuevos</em> y bien evaluados`, "Explorar más", "#/buscar")}
          <div class="results-grid">
            ${nearby.map(p => R.placeCard(p)).join("")}
          </div>
        </section>

        <!-- Editorial pull-quote -->
        <section class="container" style="margin-top: var(--s-24)">
          <blockquote style="
            font-family: var(--font-display);
            font-size: clamp(36px, 5vw, 72px);
            line-height: 1.05;
            font-weight: 400;
            letter-spacing: var(--tr-tight);
            font-variation-settings: 'opsz' 144, 'SOFT' 50;
            margin: 0;
            max-width: 1000px;
            text-wrap: balance;
          ">
            <span style="font-style:italic; color: var(--accent-60); font-variation-settings: 'opsz' 144, 'SOFT' 100;">«</span>
            Santiago se descubre caminando, mirando hacia arriba y preguntando dónde almuerzan los locales.
            <span style="font-style:italic; color: var(--accent-60); font-variation-settings: 'opsz' 144, 'SOFT' 100;">»</span>
          </blockquote>
          <div style="margin-top: var(--s-6); display: flex; gap: var(--s-3); align-items: center;">
            <span class="eyebrow">— Editorial</span>
            <span style="flex:1; height:1px; background: var(--surface-line);"></span>
            <span class="eyebrow">Nº 04 · Mayo 2026</span>
          </div>
        </section>

        <!-- CTA negocios -->
        <section class="container">
          <div class="biz-cta">
            <div class="biz-cta__copy">
              <span class="eyebrow" style="color: var(--paper-30)">Para tu negocio</span>
              <h2 class="biz-cta__title">¿Tienes un local?<br><em>Lístalo gratis</em>,<br>sin sorpresas.</h2>
              <p style="color: var(--paper-30); max-width: 420px; line-height: 1.5; font-size: 15px;">
                Aparece en Portal Panorama en menos de 5 minutos. Sin comisiones por reservas
                — porque acá no las hacemos. Pasa a Premium si quieres más visibilidad.
              </p>
              <div style="display:flex; gap: var(--s-3); flex-wrap: wrap">
                <a href="#/planes" class="btn btn--accent">Listar mi local gratis ${I("arrowR", 14)}</a>
                <a href="#/planes" class="btn btn--ghost" style="color:var(--paper-05); border-color: rgba(246,242,234,0.3)">Ver planes</a>
              </div>
            </div>
            <div class="biz-cta__art">
              <div class="biz-cta__art-card">
                <div class="placeholder-stripe" style="height: 140px" data-label="TU LOGO"></div>
                <div style="display:flex; justify-content: space-between; align-items: center;">
                  <span style="font-family: var(--font-display); font-size: 22px; font-weight: 500;">Tu Local</span>
                  <span class="premium-badge">Premium</span>
                </div>
                <div style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--paper-50);">
                  Categoría · Barrio · ★ 4.8
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      ${R.footer()}
    `;
  }

  // ---------- BUSCAR ----------
  function buscar(params) {
    const cat    = params.cat  || "";
    const q      = (params.q   || "").toLowerCase();
    const view   = params.view || "grid";
    let list = D.places.slice();
    if (cat && cat !== "eventos") {
      const catLabel = D.categories.find(c => c.id === cat)?.label;
      if (catLabel) list = list.filter(p => p.category === catLabel);
    }
    if (q) list = list.filter(p =>
      (p.name + p.category + p.neighborhood + p.tags.join(" ")).toLowerCase().includes(q));

    const isEvents = cat === "eventos";
    // Default: eventos → list, resto → grid. Param ?view= sobreescribe.
    const view2   = params.view || (isEvents ? "list" : "grid");
    const isList  = view2 === "list";

    const searchBar = `
      <form class="hero-search search-head__bar" id="search-bar" onsubmit="event.preventDefault(); window.PP_APP.searchSubmit(this);">
        <div class="hero-search__field">
          <label>Qué</label>
          <input type="text" name="q" value="${q}" placeholder="Buscar…">
        </div>
        <div class="hero-search__field">
          <label>Dónde</label>
          <select name="where">
            <option value="">Todo Santiago</option>
            ${D.neighborhoods.map(n => `<option>${n}</option>`).join("")}
          </select>
        </div>
        <div class="hero-search__field">
          <label>Cuándo</label>
          <select name="when">
            <option>Ahora abierto</option>
            <option>Esta noche</option>
            <option>Este fin de semana</option>
          </select>
        </div>
        <button class="hero-search__btn" aria-label="Buscar">${I("arrowR", 22)}</button>
      </form>`;

    const filterRail = `
      <aside class="filter-rail">
        <h5>Categoría</h5>
        ${D.categories.map(c => `
          <label>
            <input type="checkbox" ${cat === c.id ? 'checked' : ''} data-cat="${c.id}">
            <span>${c.label}</span>
            <span class="filter-rail__count">${c.count}</span>
          </label>
        `).join("")}
        <h5>Barrio</h5>
        ${D.neighborhoods.slice(0, 6).map(n => `
          <label><input type="checkbox"><span>${n}</span></label>
        `).join("")}
        <h5>Valoración</h5>
        ${[5,4,3].map(r => `
          <label><input type="radio" name="rating"><span>${"★".repeat(r)}${"☆".repeat(5-r)} y más</span></label>
        `).join("")}
        <h5>Precio</h5>
        ${["$", "$$", "$$$", "$$$$"].map(p => `
          <label><input type="checkbox"><span>${p}</span></label>
        `).join("")}
        <h5>Horario</h5>
        <label><input type="checkbox" checked><span>Abierto ahora</span></label>
        <label><input type="checkbox"><span>Abierto domingos</span></label>
        <label><input type="checkbox"><span>Hasta tarde (post 22:00)</span></label>
      </aside>`;

    const resultsBar = `
      <div class="results-bar">
        <div class="results-bar__count">
          <strong>${list.length}</strong> ${list.length === 1 ? 'lugar' : 'lugares'}
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--fg-muted);letter-spacing:0.08em;text-transform:uppercase;margin-left:8px">ordenado por relevancia</span>
        </div>
        <div class="results-bar__tools">
          <button class="chip" id="filter-toggle-btn">${I("filter", 14)} Filtros</button>
          <div class="toggle-group">
            <a href="#/buscar?${new URLSearchParams({...params, view:'grid'}).toString()}" class="btn" aria-pressed="${!isList}" style="height:32px;padding:0 12px;border-radius:999px;font-size:13px;display:inline-flex;align-items:center;gap:6px;${!isList?'background:var(--ink-100);color:var(--paper-00)':'color:var(--fg-muted)'}">${I("grid", 14)} Grid</a>
            <a href="#/buscar?${new URLSearchParams({...params, view:'list'}).toString()}" class="btn" aria-pressed="${isList}" style="height:32px;padding:0 12px;border-radius:999px;font-size:13px;display:inline-flex;align-items:center;gap:6px;${isList?'background:var(--ink-100);color:var(--paper-00)':'color:var(--fg-muted)'}">${I("filter", 14)} Lista</a>
          </div>
        </div>
      </div>`;

    // Mobile filters drawer
    const filtersDrawer = `
      <div id="filter-drawer" style="display:none;position:fixed;inset:0;z-index:150">
        <div style="position:absolute;inset:0;background:rgba(20,17,15,0.4)" onclick="document.getElementById('filter-drawer').style.display='none'"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;background:var(--bg);border-radius:var(--r-lg) var(--r-lg) 0 0;padding:var(--s-6);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
            <span style="font-family:var(--font-display);font-size:24px;font-weight:500">Filtros</span>
            <button onclick="document.getElementById('filter-drawer').style.display='none'">${I("close")}</button>
          </div>
          ${filterRail.replace(/class="filter-rail"/,'')}
          <button class="btn btn--primary" style="width:100%;justify-content:center;margin-top:var(--s-4)" onclick="document.getElementById('filter-drawer').style.display='none'">Ver ${list.length} resultados</button>
        </div>
      </div>
      <script>
        (function(){
          var btn = document.getElementById('filter-toggle-btn');
          var drawer = document.getElementById('filter-drawer');
          if(btn && drawer) btn.onclick = function(){ drawer.style.display = 'block'; };
        })();
      </script>`;

    // Render de cada item: card grande para grid, fila ancha para list.
    const listRow = p => `
      <a class="place-row" href="#/lugar?id=${p.id}">
        <div class="place-row__media placeholder-stripe" data-label="${p.cover}"></div>
        <div class="place-row__body">
          <div class="place-card__meta">
            <span>${p.category}</span><span class="dot"></span><span>${p.neighborhood}</span>
            ${p.premium ? `<span class="dot"></span><span class="premium-badge" style="font-size:10px;padding:2px 6px">Premium</span>` : ''}
          </div>
          <h3 class="place-row__title">${p.name}</h3>
          <p class="place-row__blurb">${(p.blurb || '').slice(0, 140)}${(p.blurb||'').length > 140 ? '…' : ''}</p>
          <div class="place-row__foot">
            <span class="rating">${I("starF", 14)}<span class="rating__num" style="margin-left:4px">${p.rating.toFixed(1)}</span><span class="rating__count">·&nbsp;${p.reviews}</span></span>
            <span>${p.price}</span>
            <span style="color:var(--success)">${p.hours}</span>
          </div>
        </div>
        <span class="place-row__cta">${I("arrowR", 18)}</span>
      </a>`;

    // ── VISTA GRID / LISTA ───────────────────────────────
    return `
      ${R.topbar("buscar")}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-8) 0 0">
          <div class="search-shell">
            <!-- Columna izquierda: filtros (con spacer para alinear) -->
            <div class="search-shell__rail">
              <div class="search-shell__rail-head">
                <span class="eyebrow" style="display:block;margin-bottom:var(--s-2)">Filtros</span>
                <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}</span>
              </div>
              ${filterRail}
            </div>

            <!-- Columna derecha: header + buscador + resultados -->
            <div class="search-shell__main">
              <div class="search-head">
                <div class="hero__eyebrow" style="margin:0">
                  <span class="line"></span>
                  <span class="eyebrow">${isEvents ? "Agenda · Eventos" : "Explorar · Lugares"}</span>
                </div>
                <h1 class="search-head__title">
                  ${q ? `Resultados para <em style="color:var(--accent-60);font-style:italic">"${q}"</em>`
                      : isEvents ? `Eventos <em style="color:var(--accent-60);font-style:italic">esta semana</em>`
                      : `Todo <em style="color:var(--accent-60);font-style:italic">Santiago</em>`}
                </h1>
                ${searchBar}
              </div>
              ${resultsBar}
              ${isList ? `
                <div class="results-list" style="margin-top:var(--s-5)">
                  ${list.length ? list.map(listRow).join("") : `
                    <div style="padding:var(--s-16) 0;text-align:center;color:var(--fg-muted)">
                      Sin resultados. <a href="#/buscar" style="color:var(--accent-60);border-bottom:1px solid">Limpiar filtros</a>
                    </div>`}
                </div>
              ` : `
                <div class="results-grid" style="margin-top:var(--s-5)">
                  ${list.length ? list.map(p => R.placeCard(p)).join("") : `
                    <div style="grid-column:1/-1;padding:var(--s-16) 0;text-align:center;color:var(--fg-muted)">
                      Sin resultados. <a href="#/buscar" style="color:var(--accent-60);border-bottom:1px solid">Limpiar filtros</a>
                    </div>`}
                </div>
              `}
            </div>
          </div>
        </section>
        ${filtersDrawer}
      </main>
      ${R.footer()}`;
  }

  // ---------- LUGAR ----------
  function lugar(params) {
    const p = D.places.find(x => x.id === params.id) || D.places[0];
    const isFav = window.PP_FAVS.has(p.id);
    return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding-top: var(--s-8)">
          <nav style="font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: var(--s-5);">
            <a href="#/" style="color: inherit;">Inicio</a> &nbsp;/&nbsp;
            <a href="#/buscar" style="color: inherit;">${p.category}</a> &nbsp;/&nbsp;
            <span style="color: var(--fg)">${p.neighborhood}</span>
          </nav>

          <div class="place-hero">
            <div class="placeholder-stripe" data-label="${p.cover}"></div>
            <div class="placeholder-stripe" data-label="INTERIOR"></div>
            <div class="placeholder-stripe" data-label="DETALLE"></div>
          </div>

          <div class="place-info">
            <div>
              <div class="place-headline">
                <div style="display: flex; gap: var(--s-3); align-items: center; flex-wrap: wrap;">
                  <span class="eyebrow">${p.category} · ${p.neighborhood}</span>
                  ${p.premium ? `<span class="premium-badge">Premium</span>` : ""}
                </div>
                <h1>${p.name.split(" ").slice(0, -1).join(" ")} <em>${p.name.split(" ").slice(-1)[0]}</em></h1>
                <div style="display: flex; gap: var(--s-5); align-items: center; color: var(--fg-muted); font-size: 14px;">
                  <span class="rating">${I("starF", 16)}<strong style="color:var(--fg); margin-left: 4px">${p.rating.toFixed(1)}</strong> &nbsp; <span>${p.reviews} reseñas</span></span>
                  <span>·</span>
                  <span>${p.price}</span>
                  <span>·</span>
                  <span style="color: var(--success)">${p.hours}</span>
                </div>
              </div>

              <div style="display: flex; gap: var(--s-2); margin-bottom: var(--s-8); flex-wrap: wrap;">
                <button class="btn btn--primary">${I("pin", 14)} Cómo llegar</button>
                <button class="btn btn--ghost" onclick="window.PP_APP.toggleFav('${p.id}', this); this.classList.toggle('active');">
                  ${isFav ? I("heartF", 14) : I("heart", 14)} ${isFav ? 'Guardado' : 'Guardar'}
                </button>
                <button class="btn btn--ghost">${I("share", 14)} Compartir</button>
              </div>

              <h3 style="font-family: var(--font-display); font-weight: 400; font-size: 32px; letter-spacing: var(--tr-tight); margin: 0 0 var(--s-3); font-variation-settings: 'opsz' 100;">Sobre el lugar</h3>
              <p style="font-size: 17px; line-height: 1.6; color: var(--ink-95); margin: 0 0 var(--s-6); max-width: 620px;">
                ${p.blurb}
              </p>

              <div class="chip-row" style="margin-bottom: var(--s-10)">
                ${p.tags.map(t => `<span class="chip" style="cursor: default">${t}</span>`).join("")}
              </div>

              <h3 style="font-family: var(--font-display); font-weight: 400; font-size: 32px; letter-spacing: var(--tr-tight); margin: 0 0 var(--s-4); font-variation-settings: 'opsz' 100;">Cómo llegar</h3>
              <div class="map-placeholder">
                <div class="map-pin"></div>
                <div style="position: absolute; bottom: 16px; left: 16px; background: var(--paper-00); border: 1px solid var(--ink-100); padding: 10px 14px; font-size: 13px;">
                  <div style="font-weight: 500;">${p.name}</div>
                  <div style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--fg-muted); text-transform: uppercase;">${p.address}</div>
                </div>
              </div>

              <div style="display: flex; align-items: end; justify-content: space-between; margin: var(--s-12) 0 var(--s-3); padding-bottom: var(--s-3); border-bottom: 1px solid var(--ink-100);">
                <h3 style="font-family: var(--font-display); font-weight: 400; font-size: 32px; letter-spacing: var(--tr-tight); margin: 0; font-variation-settings: 'opsz' 100;">
                  Reseñas <em style="font-style:italic; color: var(--accent-60)">(${p.reviews})</em>
                </h3>
                <a href="#" class="btn--link" style="font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted);">Escribir una reseña ${I("arrowR", 12)}</a>
              </div>

              ${[
                {n: "Camila R.", w: "Hace 2 días", r: 5, t: "Lo mejor del barrio. La carta cambia con la temporada y siempre encontramos algo nuevo. La atención es impecable y el espacio invita a quedarse."},
                {n: "Tomás P.", w: "Hace 1 semana", r: 4, t: "Buen ambiente y producto. La sobremesa se hace larga (en el mejor sentido). Reservar con tiempo los viernes."},
                {n: "Florencia M.", w: "Hace 2 semanas", r: 5, t: "Volví por tercera vez en el mes. El equipo te atiende como si fueras parte de la casa."}
              ].map(rev => `
                <div class="review">
                  <div class="review__avatar">${rev.n[0]}</div>
                  <div>
                    <div class="review__head">
                      <span class="review__name">${rev.n}</span>
                      <span class="rating">${I("starF", 12)}<span style="margin-left: 2px; font-size: 13px;">${rev.r}.0</span></span>
                      <span class="review__when">${rev.w}</span>
                    </div>
                    <p style="margin: 0; line-height: 1.55;">${rev.t}</p>
                  </div>
                </div>
              `).join("")}
            </div>

            <aside class="place-info__sidebar">
              <div>
                <span class="eyebrow">Información</span>
              </div>
              <div class="place-info__row">${I("pin", 18)}<span><strong>${p.address}</strong><br><span style="color:var(--fg-muted)">Santiago, Chile</span></span></div>
              <div class="place-info__row">${I("clock", 18)}<span><strong>${p.hours.split('·')[0].trim()}</strong><br><span style="color:var(--fg-muted)">${p.hours.includes('·') ? p.hours.split('·')[1].trim() : ''}</span></span></div>
              <div class="place-info__row">${I("phone", 18)}<span>${p.phone}</span></div>
              <div class="place-info__row">${I("web", 18)}<a href="#" style="color: var(--accent-60); border-bottom: 1px solid;">${p.web}</a></div>
              <hr class="hairline">
              <div style="display: flex; gap: var(--s-2); flex-wrap: wrap;">
                ${[I("heart", 14), I("share", 14)].map((s, i) => `
                  <button class="btn btn--ghost btn--sm" style="flex:1">${s} ${i ? 'Compartir' : 'Guardar'}</button>
                `).join("")}
              </div>
              ${p.premium
                ? `<div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent-60);display:flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;background:var(--accent-60);border-radius:50%"></span>Verificado por el local</div>`
                : `<a href="#/checkout?step=1" class="btn btn--accent" style="justify-content:center;">${I("sparkle", 14)} ¿Es tu local? Reclamarlo</a>`
              }
              <hr class="hairline">
              ${(() => {
                const ownerId = D.placeOwner[p.id];
                const owner = D.owners.find(o => o.id === ownerId);
                if (!owner) return '';
                const isEditorial = owner.id === 'o3';
                return `
                  <div>
                    <span class="eyebrow" style="display:block;margin-bottom:var(--s-3)">${isEditorial ? 'Ficha creada por' : 'Gestionado por'}</span>
                    <a href="#/perfil-negocio?id=${owner.id}" style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3);border-radius:var(--r-sm);border:1px solid var(--surface-line);background:var(--bg-sunken);transition:border-color var(--d-fast)" onmouseover="this.style.borderColor='var(--ink-100)'" onmouseout="this.style.borderColor='var(--surface-line)'">
                      <div style="width:40px;height:40px;border-radius:50%;background:var(--ink-100);color:var(--paper-00);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;font-size:14px;flex-shrink:0">${owner.avatar}</div>
                      <div style="min-width:0">
                        <div style="font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${owner.name}</div>
                        <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--fg-muted);margin-top:2px">${owner.places.length} local${owner.places.length!==1?'es':''} · ${owner.events.length} evento${owner.events.length!==1?'s':''}</div>
                      </div>
                      <span style="color:var(--fg-muted);flex-shrink:0">${I("arrowR",14)}</span>
                    </a>
                  </div>
                `;
              })()}
            </aside>
          </div>
        </section>

        ${!p.premium ? `
        <!-- FICHA NO RECLAMADA: banner -->
        <section class="container" style="margin:var(--s-10) 0">
          <div style="
            display:grid;grid-template-columns:auto 1fr auto;gap:var(--s-6);align-items:center;
            border:1px solid var(--ink-100);border-radius:var(--r-md);
            padding:var(--s-6);background:var(--paper-00);
          ">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--paper-10);border:1px solid var(--surface-line);display:inline-flex;align-items:center;justify-content:center;color:var(--fg-muted);flex-shrink:0">
              ${I("user",20)}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:4px;">
                <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:var(--paper-10);border:1px solid var(--surface-line);padding:3px 8px;border-radius:var(--r-xs);color:var(--fg-muted)">Sin reclamar</span>
              </div>
              <p style="margin:0;font-size:14px;line-height:1.5;color:var(--ink-90);">
                Esta ficha fue creada por el equipo editorial de Portal Panorama.
                Si eres el dueño o representante, puedes reclamarla para editarla y mejorarla.
              </p>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--s-2);flex-shrink:0;">
              <a href="#/checkout?step=1" class="btn btn--primary btn--sm">Reclamar ficha ${I("arrowR",12)}</a>
              <a href="#/checkout?step=1&plan=free" class="btn btn--ghost btn--sm" style="text-align:center;justify-content:center">Solo mejorarla (gratis)</a>
            </div>
          </div>
        </section>
        ` : ''}

        <!-- TAMBIÉN TE PUEDE GUSTAR -->
        <section class="container" style="margin:var(--s-10) 0 var(--s-16)">
          ${R.sectionHead("", `También te puede <em>gustar</em>`,
            "Ver más en " + p.neighborhood, "#/buscar?where=" + encodeURIComponent(p.neighborhood))}
          ${p.premium ? `
          <div style="display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3) var(--s-4);background:var(--bg-raised);border:1px solid var(--surface-line);border-radius:var(--r-sm);margin-bottom:var(--s-5);font-size:13px;color:var(--fg-muted);">
            ${I("sparkle",14)}
            <span>Como dueño Premium puedes <a href="#/dashboard-negocio?tab=fichas" style="color:var(--accent-60);border-bottom:1px solid;">personalizar o desactivar estas recomendaciones</a> desde tu panel.</span>
          </div>` : ''}
          <div class="results-grid">
            ${D.places
              .filter(x => x.id !== p.id && (x.category === p.category || x.neighborhood === p.neighborhood))
              .slice(0, 3)
              .map(x => R.placeCard(x))
              .join("")}
          </div>
        </section>
      </main>
      ${R.footer()}
    `;
  }

  // ---------- PLANES ----------
  function planes() {
    const free = [
      { ok: true, t: "Ficha completa con foto, dirección y horario" },
      { ok: true, t: "Hasta 3 fotos en galería" },
      { ok: true, t: "Aparece en búsquedas y categorías" },
      { ok: true, t: "Recibes reseñas de visitantes" },
      { ok: false, t: "Posición prioritaria en listados" },
      { ok: false, t: "Galería ilimitada y video de portada" },
      { ok: false, t: "Estadísticas avanzadas y exportables" },
      { ok: false, t: "Aparición en home y newsletter editorial" },
    ];
    const premium = free.map(f => ({ ...f, ok: true }));

    return `
      ${R.topbar("planes")}
      <main class="page-enter">
        <section class="container" style="padding: var(--s-12) 0 var(--s-8)">
          <div class="hero__eyebrow">
            <span class="line"></span><span class="eyebrow">Planes para negocios</span>
          </div>
          <h1 style="font-family: var(--font-display); font-size: clamp(48px, 8vw, 120px); font-weight: 400; line-height: 0.95; letter-spacing: -0.035em; margin: 0 0 var(--s-6); max-width: 12ch; font-variation-settings: 'opsz' 144, 'SOFT' 50;">
            Aparece <em style="color: var(--accent-60); font-style: italic;">como corresponde.</em>
          </h1>
          <p style="font-size: 19px; max-width: 620px; color: var(--fg-muted); line-height: 1.5;">
            Listar tu local en Portal Panorama es gratis. Si quieres más visibilidad,
            mejores fotos y estadísticas, hay un plan Premium pensado para negocios pequeños y medianos.
          </p>

          <div class="plans-grid">
            <article class="plan">
              <div>
                <span class="eyebrow">Plan</span>
                <h3>Free</h3>
              </div>
              <div class="plan__price">
                <span class="num">$0</span>
                <span class="unit">CLP / Para siempre</span>
              </div>
              <p style="color: var(--fg-muted); font-size: 14px; line-height: 1.5; margin: 0;">
                Para que cualquier negocio aparezca, sin barreras. Ideal para
                empezar a recibir tráfico desde Portal Panorama.
              </p>
              <ul class="plan-list">
                ${free.map(f => `
                  <li class="${f.ok ? '' : 'disabled'}">
                    ${f.ok ? I("check", 14) : I("close", 14)}
                    <span>${f.t}</span>
                  </li>
                `).join("")}
              </ul>
              <button class="btn btn--ghost" style="justify-content: center;">Crear ficha gratis</button>
            </article>

            <article class="plan plan--premium">
              <div>
                <span class="eyebrow" style="color: var(--paper-30)">Plan</span>
                <h3 style="color: var(--paper-05)">Premium</h3>
              </div>
              <div class="plan__price">
                <span class="num">$24.900</span>
                <span class="unit">CLP / mes · IVA incluido</span>
              </div>
              <p style="color: var(--paper-30); font-size: 14px; line-height: 1.5; margin: 0;">
                Para locales que quieren destacar. Posición prioritaria,
                galería ilimitada, estadísticas y aparición editorial.
              </p>
              <ul class="plan-list">
                ${premium.map(f => `
                  <li>${I("check", 14)}<span>${f.t}</span></li>
                `).join("")}
              </ul>
              <button class="btn btn--accent" style="justify-content: center;">Empezar prueba de 14 días ${I("arrowR", 14)}</button>
              <span style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--paper-30); text-align: center;">Sin compromiso · Cancela cuando quieras</span>
            </article>
          </div>

          <h2 class="sec-head__title" style="margin: var(--s-24) 0 var(--s-3); font-size: clamp(32px, 4vw, 56px);">
            Comparación <em style="font-style:italic; color: var(--accent-60)">detallada</em>
          </h2>
          <hr class="hairline">

          <table class="compare">
            <thead>
              <tr><th>Característica</th><th>Free</th><th>Premium</th></tr>
            </thead>
            <tbody>
              ${[
                ["Ficha del lugar", "Sí", "Sí, con video de portada"],
                ["Fotos en galería", "3", "Ilimitadas"],
                ["Posición en búsquedas", "Estándar", "Prioritaria"],
                ["Estadísticas de visitas", "Básica", "Avanzada · exportable"],
                ["Respuesta a reseñas", "Sí", "Sí · plantillas"],
                ["Eventos publicados", "1 por mes", "Ilimitados"],
                ["Aparición en newsletter", "—", "Sí · cuando aplique"],
                ["Aparición en home", "—", "Rotación destacada"],
                ["Soporte", "Email", "Email · WhatsApp prioritario"],
              ].map(row => `
                <tr>
                  <td>${row[0]}</td>
                  <td>${row[1] === '—' ? '<span style="color: var(--fg-subtle)">—</span>' : row[1]}</td>
                  <td class="${row[2] !== row[1] ? 'accent' : ''}">${row[2]}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="margin-top: var(--s-16); padding: var(--s-8); background: var(--bg-raised); border: 1px solid var(--surface-line); border-radius: var(--r-lg); display: grid; grid-template-columns: auto 1fr auto; gap: var(--s-6); align-items: center;">
            <div style="font-family: var(--font-mono); font-size: 32px; color: var(--accent-60); font-weight: 500;">?</div>
            <div>
              <div style="font-family: var(--font-display); font-size: 24px; font-weight: 500; line-height: 1.2; margin-bottom: 4px;">¿Tienes varios locales?</div>
              <div style="color: var(--fg-muted); font-size: 14px;">Hablemos de un plan corporativo a medida.</div>
            </div>
            <a href="#" class="btn btn--primary">Contactar ${I("arrowR", 14)}</a>
          </div>
        </section>
      </main>
      ${R.footer()}
    `;
  }

  // ---------- LOGIN ----------
  function login() {
    return `
      ${R.topbar()}
      <main class="page-enter">
        <div class="auth-shell">
          <aside class="auth-shell__art">
            <div>
              <span class="eyebrow" style="color: var(--paper-30)">Portal Panorama</span>
            </div>
            <h2>«Bienvenido de<br>vuelta a la <em style="color: var(--accent-50);">ciudad</em>».</h2>
            <div style="font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--paper-40);">
              Edición #04 · Otoño 2026
            </div>
          </aside>
          <section class="auth-shell__form">
            <span class="eyebrow">Iniciar sesión</span>
            <h1 style="font-family: var(--font-display); font-size: 48px; font-weight: 400; line-height: 1; letter-spacing: var(--tr-tight); margin: var(--s-2) 0 var(--s-8); font-variation-settings: 'opsz' 144;">
              Hola de <em style="font-style:italic; color: var(--accent-60);">nuevo</em>.
            </h1>
            <form onsubmit="event.preventDefault(); window.PP_ROUTER.go('/');" style="display: flex; flex-direction: column; gap: var(--s-4)">
              <label style="display: flex; flex-direction: column; gap: 6px;">
                <span class="eyebrow">Email</span>
                <input class="input" type="email" placeholder="tu@email.cl" required>
              </label>
              <label style="display: flex; flex-direction: column; gap: 6px;">
                <span class="eyebrow">Contraseña</span>
                <input class="input" type="password" placeholder="••••••••" required>
              </label>
              <a href="#" style="font-size: 13px; color: var(--accent-60); border-bottom: 1px solid; align-self: start;">Olvidé mi contraseña</a>
              <button class="btn btn--primary" style="justify-content: center; margin-top: var(--s-3)">Entrar ${I("arrowR", 14)}</button>
              <div style="display: flex; align-items: center; gap: var(--s-3); margin: var(--s-3) 0;">
                <span style="flex:1; height:1px; background: var(--surface-line);"></span>
                <span class="eyebrow">o</span>
                <span style="flex:1; height:1px; background: var(--surface-line);"></span>
              </div>
              <button type="button" class="btn btn--ghost" style="justify-content: center;">Continuar con Google</button>
              <p style="font-size: 13px; color: var(--fg-muted); text-align: center; margin: var(--s-5) 0 0;">
                ¿Recién llegas? <a href="#/login" style="color: var(--accent-60); border-bottom: 1px solid;">Crea tu cuenta</a>
              </p>
            </form>
          </section>
        </div>
      </main>
    `;
  }

  // ---------- SISTEMA ----------
  function sistema() {
    const swatches = [
      ["--paper-00", "Paper 00"],
      ["--paper-05", "Paper 05 · BG"],
      ["--paper-10", "Paper 10"],
      ["--paper-20", "Paper 20"],
      ["--paper-30", "Paper 30 · Line"],
      ["--paper-50", "Paper 50 · Muted"],
      ["--ink-90", "Ink 90"],
      ["--ink-100", "Ink 100 · Text"],
    ];
    const accents = [
      ["--accent-soft", "Soft"],
      ["--accent-50", "Atardecer 50"],
      ["--accent-60", "Atardecer 60 · Primary"],
      ["--accent-70", "Atardecer 70 · Hover"],
      ["--accent-80", "Atardecer 80"],
    ];
    const sem = [
      ["--success", "Success"], ["--warning", "Warning"],
      ["--error", "Error"], ["--info", "Info"]
    ];

    const swatch = ([v, label]) => `
      <div style="display:flex; flex-direction: column; gap: 8px;">
        <div style="height: 88px; background: var(${v}); border-radius: 6px; border: 1px solid var(--surface-line);"></div>
        <div style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--fg-muted);">${v}</div>
        <div style="font-size: 13px;">${label}</div>
      </div>
    `;

    return `
      ${R.topbar("sistema")}
      <main class="page-enter">
        <section class="container" style="padding: var(--s-12) 0 var(--s-8)">
          <div class="hero__eyebrow"><span class="line"></span><span class="eyebrow">Sistema de diseño · v0.1</span></div>
          <h1 style="font-family: var(--font-display); font-size: clamp(48px, 8vw, 120px); font-weight: 400; line-height: 0.95; letter-spacing: -0.035em; margin: 0 0 var(--s-3); font-variation-settings: 'opsz' 144;">
            El <em style="color: var(--accent-60); font-style: italic;">cómo</em> y por qué.
          </h1>
          <p style="font-size: 18px; max-width: 720px; color: var(--fg-muted); line-height: 1.55;">
            Una guía visual editorial — Fraunces para personalidad, Geist Mono para metadatos,
            Inter Tight para densidad UI. Paleta cálida sobre papel crema con acento atardecer.
          </p>
        </section>

        <section class="container">
          ${R.sectionHead("01", "Tipografía", "", "")}
          <div style="display: grid; gap: var(--s-8);">
            <div style="border-top: 1px solid var(--ink-100); padding-top: var(--s-4);">
              <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: var(--s-3);">
                <span>Fraunces · Display Italic</span><span>Variable opsz 144 · SOFT 100</span>
              </div>
              <div style="font-family: var(--font-display); font-size: clamp(56px, 10vw, 156px); font-style: italic; line-height: 0.95; letter-spacing: var(--tr-tight); font-variation-settings: 'opsz' 144, 'SOFT' 100; color: var(--accent-60);">
                Panorama
              </div>
            </div>
            <div style="border-top: 1px solid var(--surface-line); padding-top: var(--s-4);">
              <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: var(--s-3);">
                <span>Fraunces · Display Roman</span><span>Variable opsz 144 · SOFT 50</span>
              </div>
              <div style="font-family: var(--font-display); font-size: clamp(56px, 10vw, 156px); line-height: 0.95; letter-spacing: var(--tr-tight); font-variation-settings: 'opsz' 144, 'SOFT' 50;">
                La ciudad escrita.
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-8); border-top: 1px solid var(--surface-line); padding-top: var(--s-4)">
              <div>
                <div style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: var(--s-3);">Inter Tight · UI</div>
                <div style="font-size: 19px;">Una guía editorial de panoramas y salidas.</div>
                <div style="font-size: 15px; color: var(--fg-muted); margin-top: 8px;">Cuerpo regular para densidad UI: filtros, tablas, formularios.</div>
              </div>
              <div>
                <div style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: var(--s-3);">Geist Mono · Meta</div>
                <div style="font-family: var(--font-mono); font-size: 14px;">CATEGORÍA · BARRIO · 4.7★</div>
                <div style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted); margin-top: 8px; letter-spacing: 0.06em;">PARA NUMERACIÓN, EYEBROWS, METADATOS.</div>
              </div>
            </div>
          </div>
        </section>

        <section class="container" style="margin-top: var(--s-16)">
          ${R.sectionHead("02", "Paleta", "", "")}
          <div>
            <h5 style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-muted); margin: 0 0 var(--s-4); font-weight: 500;">Neutros · Papel cálido</h5>
            <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: var(--s-4)">
              ${swatches.map(swatch).join("")}
            </div>
          </div>
          <div style="margin-top: var(--s-8)">
            <h5 style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-muted); margin: 0 0 var(--s-4); font-weight: 500;">Acento · Atardecer</h5>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--s-4)">
              ${accents.map(swatch).join("")}
            </div>
          </div>
          <div style="margin-top: var(--s-8)">
            <h5 style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-muted); margin: 0 0 var(--s-4); font-weight: 500;">Semántica</h5>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s-4)">
              ${sem.map(swatch).join("")}
            </div>
          </div>
        </section>

        <section class="container" style="margin-top: var(--s-16)">
          ${R.sectionHead("03", "Componentes", "", "")}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-8)">
            <div style="display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-6); border: 1px solid var(--surface-line); border-radius: 8px;">
              <span class="eyebrow">Botones</span>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn--primary">Primario</button>
                <button class="btn btn--accent">Acento</button>
                <button class="btn btn--ghost">Ghost</button>
                <button class="btn btn--primary btn--sm">Small</button>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-6); border: 1px solid var(--surface-line); border-radius: 8px;">
              <span class="eyebrow">Chips</span>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="chip" aria-pressed="true">Restaurantes</button>
                <button class="chip">Bares</button>
                <button class="chip">Cafés</button>
                <button class="chip">Museos</button>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-6); border: 1px solid var(--surface-line); border-radius: 8px;">
              <span class="eyebrow">Premium signal</span>
              <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                <span class="premium-badge">Premium</span>
                <span style="font-size: 13px; color: var(--fg-muted)">Punto naranja + borde tinta. Sin oro chillón.</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--s-4); padding: var(--s-6); border: 1px solid var(--surface-line); border-radius: 8px;">
              <span class="eyebrow">Input</span>
              <input class="input" placeholder="Buscar restaurante…">
            </div>
          </div>

          <div style="margin-top: var(--s-8); display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--grid-gutter)">
            ${D.places.slice(0, 3).map(p => R.placeCard(p)).join("")}
          </div>
        </section>

        <section class="container" style="margin-top: var(--s-16)">
          ${R.sectionHead("04", "Espaciado · Radio · Sombra", "", "")}
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s-8)">
            <div>
              <span class="eyebrow">Spacing (4px base)</span>
              <div style="margin-top: var(--s-3); display: flex; flex-direction: column; gap: 6px;">
                ${[1,2,3,4,5,6,8,10,12,16,20].map(n => `
                  <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted);">
                    <span style="width: 50px;">s-${n}</span>
                    <span style="height: 8px; width: ${n * 4}px; background: var(--ink-100);"></span>
                    <span>${n*4}px</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <div>
              <span class="eyebrow">Radii</span>
              <div style="margin-top: var(--s-3); display: flex; flex-direction: column; gap: 12px;">
                ${[["xs",2],["sm",4],["md",8],["lg",12],["xl",20]].map(([n,v]) => `
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 56px; height: 40px; background: var(--accent-60); border-radius: ${v}px;"></div>
                    <div style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted);">r-${n} · ${v}px</div>
                  </div>
                `).join("")}
              </div>
            </div>
            <div>
              <span class="eyebrow">Shadows</span>
              <div style="margin-top: var(--s-3); display: flex; flex-direction: column; gap: 16px;">
                ${[["1","--shadow-1"],["2","--shadow-2"],["3","--shadow-3"],["pop","--shadow-pop"]].map(([n,v]) => `
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 80px; height: 48px; background: var(--bg-raised); border-radius: 6px; box-shadow: var(${v});"></div>
                    <div style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted);">shadow-${n}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </section>
      </main>
      ${R.footer()}
    `;
  }

  return { home, buscar, lugar, planes, login, sistema };
})();
