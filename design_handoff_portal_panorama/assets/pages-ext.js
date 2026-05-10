// Páginas extendidas: Checkout, Dashboard Usuario, Dashboard Negocio
window.PP_PAGES_EXT = (() => {
  const I = window.PP_ICON;
  const D = window.PP_DATA;
  const R = window.PP_R;

  // ─── GRUPOS (localStorage) ──────────────────────────────────────────────────
  const GRUPOS = (() => {
    const KEY = "pp.grupos.v1";
    const defaults = [
      { id: "g1", name: "Por visitar",         icon: "pin",   places: ["ambrosia","siete-negronis"] },
      { id: "g2", name: "Mejores restaurantes", icon: "star",  places: ["salvador","liguria"] },
      { id: "g3", name: "Plan en pareja",        icon: "heart", places: ["rooftop-norte","nolita"] },
    ];
    const load = () => {
      try { return JSON.parse(localStorage.getItem(KEY)) || defaults; } catch { return defaults; }
    };
    const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));
    let cache = load();
    return {
      all: () => cache,
      add: (name) => { const g = {id:"g"+Date.now(), name, icon:"grid", places:[]}; cache.push(g); save(cache); return g; },
      remove: (id) => { cache = cache.filter(g => g.id !== id); save(cache); },
      addPlace: (gid, pid) => { const g = cache.find(x=>x.id===gid); if(g && !g.places.includes(pid)) { g.places.push(pid); save(cache); } },
      removePlace: (gid, pid) => { const g = cache.find(x=>x.id===gid); if(g) { g.places = g.places.filter(p=>p!==pid); save(cache); } },
    };
  })();

  // ─── SHARED UI ──────────────────────────────────────────────────────────────
  const dashSidebar = (active, mode="usuario") => {
    const links = mode === "negocio" ? [
      ["Resumen",      "/dashboard-negocio",                   "grid",   "resumen"],
      ["Mis fichas",   "/dashboard-negocio?tab=fichas",        "pin",    "fichas"],
      ["Estadísticas", "/dashboard-negocio?tab=stats",         "sparkle","stats"],
      ["Reseñas",      "/dashboard-negocio?tab=resenas",       "star",   "resenas"],
      ["Eventos",      "/dashboard-negocio?tab=eventos",       "catEvt", "eventos"],
      ["Plan",         "/dashboard-negocio?tab=plan",          "check",  "plan"],
      ["—"],
      ["Guardados",    "/dashboard-negocio?tab=guardados",     "heart",  "guardados"],
      ["Mis listas",   "/dashboard-negocio?tab=listas",        "grid",   "listas"],
      ["Mi perfil",    "/dashboard-negocio?tab=perfil",        "user",   "perfil"],
    ] : [
      ["Guardados",    "/dashboard-usuario",                   "heart",  "guardados"],
      ["Mis listas",   "/dashboard-usuario?tab=listas",        "grid",   "listas"],
      ["Historial",    "/dashboard-usuario?tab=historial",     "clock",  "historial"],
      ["Mis reseñas",  "/dashboard-usuario?tab=resenas",       "star",   "resenas"],
      ["Eventos",      "/dashboard-usuario?tab=eventos",       "catEvt", "eventos"],
      ["—"],
      ["Perfil",       "/dashboard-usuario?tab=perfil",        "user",   "perfil"],
      ["Configuración","/dashboard-usuario?tab=config",        "filter", "config"],
    ];
    return `
      <aside style="display:flex;flex-direction:column;gap:2px;padding-top:var(--s-6);position:sticky;top:96px;align-self:start;min-width:200px;">
        ${links.map(l => l[0]==="—" ? `<hr class="hairline" style="margin:var(--s-3) 0">` : `
          <a href="#${l[1]}" style="display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;border-radius:var(--r-sm);font-size:14px;transition:background var(--d-fast);${active===l[3]?'background:var(--ink-100);color:var(--paper-00)':'color:var(--fg-muted)'}">
            ${I(l[2],16)} ${l[0]}
          </a>
        `).join('')}
        <hr class="hairline" style="margin:var(--s-3) 0">
        <a href="#/" style="display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;font-size:14px;color:var(--fg-muted)">${I("close",16)} Cerrar sesión</a>
      </aside>`;
  };

  const dashShell = (active, mode, header, content) => {
    const tabLinks = mode === "negocio" ? [
      ["Resumen",      "/dashboard-negocio",              "resumen"],
      ["Fichas",       "/dashboard-negocio?tab=fichas",   "fichas"],
      ["Estadísticas", "/dashboard-negocio?tab=stats",    "stats"],
      ["Reseñas",      "/dashboard-negocio?tab=resenas",  "resenas"],
      ["Eventos",      "/dashboard-negocio?tab=eventos",  "eventos"],
      ["Plan",         "/dashboard-negocio?tab=plan",     "plan"],
      ["Guardados",    "/dashboard-negocio?tab=guardados","guardados"],
      ["Listas",       "/dashboard-negocio?tab=listas",   "listas"],
    ] : [
      ["Guardados",  "/dashboard-usuario",                   "guardados"],
      ["Listas",     "/dashboard-usuario?tab=listas",        "listas"],
      ["Historial",  "/dashboard-usuario?tab=historial",     "historial"],
      ["Reseñas",    "/dashboard-usuario?tab=resenas",       "resenas"],
      ["Eventos",    "/dashboard-usuario?tab=eventos",       "eventos"],
      ["Perfil",     "/dashboard-usuario?tab=perfil",        "perfil"],
    ];
    return `
      ${R.topbar(mode === "negocio" ? "dashboard-negocio" : "")}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-8) 0 var(--s-5);border-bottom:1px solid var(--surface-line)">
          <div class="dash-header-grid" style="display:grid;grid-template-columns:auto 1fr auto;gap:var(--s-5);align-items:center;flex-wrap:wrap">
            ${header}
          </div>
        </section>
        <!-- Mobile tabs -->
        <div class="container">
          <div class="dash-tabs-mobile">
            ${tabLinks.map(([l, href, key]) => `<a href="#${href}" class="${active===key?'active':''}">${l}</a>`).join('')}
          </div>
        </div>
        <section class="container dash-shell-grid" style="display:grid;grid-template-columns:220px 1fr;gap:var(--s-10);padding:var(--s-6) 0 var(--s-16);align-items:start">
          <div class="dash-sidebar-desktop">
            ${dashSidebar(active, mode)}
          </div>
          <div style="padding-top:var(--s-2)">
            ${content}
          </div>
        </section>
      </main>
      ${R.footer()}
    `;
  };

  // ─── CHECKOUT ────────────────────────────────────────────────────────────────
  function checkout(params) {
    const step = parseInt(params.step || "1");
    const cycle = params.cycle || "mensual";
    const price = cycle === "anual" ? 19900 : 24900;
    const saving = (24900 * 12) - (19900 * 12);

    const steps = ["Elige tu plan", "Datos del negocio", "Pago", "Listo"];
    const stepBar = `
      <div style="display:flex;align-items:center;gap:0;margin-bottom:var(--s-8)">
        ${steps.map((s,i) => `
          <div style="display:flex;align-items:center;flex:${i<steps.length-1?'1':'0'}">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <div style="width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;font-weight:600;
                ${i+1<step?'background:var(--accent-60);color:var(--paper-00);border:0':i+1===step?'background:var(--ink-100);color:var(--paper-00);border:0':'background:transparent;color:var(--fg-muted);border:1px solid var(--surface-line)'}">
                ${i+1<step?I("check",14):(i+1)}
              </div>
              <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${i+1===step?'var(--fg)':'var(--fg-muted)'};white-space:nowrap">${s}</span>
            </div>
            ${i<steps.length-1?`<div style="flex:1;height:1px;background:${i+1<step?'var(--accent-60)':'var(--surface-line)'};margin:0 var(--s-3);margin-bottom:20px"></div>`:''}
          </div>
        `).join('')}
      </div>`;

    // Step 1: elegir plan
    if (step === 1) return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-10) 0;max-width:900px">
          <span class="eyebrow">Checkout</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(40px,5vw,72px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:var(--s-2) 0 var(--s-8);font-variation-settings:'opsz' 144,'SOFT' 50">
            Elige tu <em style="font-style:italic;color:var(--accent-60)">plan</em>.
          </h1>
          ${stepBar}
          <div style="display:flex;justify-content:center;margin-bottom:var(--s-6)">
            <div style="display:inline-flex;padding:3px;border:1px solid var(--surface-line);border-radius:var(--r-pill);background:var(--bg-raised)">
              <a href="#/checkout?step=1&cycle=mensual" class="btn btn--sm" style="border-radius:999px;height:36px;padding:0 20px;${cycle==='mensual'?'background:var(--ink-100);color:var(--paper-00)':'background:transparent;color:var(--fg-muted)'}">Mensual</a>
              <a href="#/checkout?step=1&cycle=anual" class="btn btn--sm" style="border-radius:999px;height:36px;padding:0 20px;${cycle==='anual'?'background:var(--ink-100);color:var(--paper-00)':'background:transparent;color:var(--fg-muted)'}">
                Anual <span style="font-family:var(--font-mono);font-size:10px;background:var(--accent-60);color:var(--paper-00);padding:2px 6px;border-radius:3px;margin-left:6px">−20%</span>
              </a>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-5);margin-bottom:var(--s-8)">
            ${[
              {key:"free",  name:"Free",    price:"$0",      sub:"Para siempre", features:["Ficha básica","3 fotos","Aparece en búsquedas","Reseñas de visitantes"]},
              {key:"prem",  name:"Premium", price:`$${price.toLocaleString('es-CL')}`, sub:`/${cycle==='anual'?'mes · facturado anual':'mes'}`, features:["Todo lo de Free","Galería ilimitada","Posición prioritaria","Estadísticas avanzadas","Newsletter editorial","Soporte prioritario"]},
            ].map(plan => `
              <div style="border:${plan.key==='prem'?'2px solid var(--ink-100)':'1px solid var(--surface-line)'};border-radius:var(--r-md);padding:var(--s-6);background:${plan.key==='prem'?'var(--ink-100)':'var(--bg-raised)'};color:${plan.key==='prem'?'var(--paper-05)':'var(--fg)'};display:flex;flex-direction:column;gap:var(--s-4);position:relative">
                ${plan.key==='prem'?`<div style="position:absolute;top:var(--s-4);right:var(--s-4);font-family:var(--font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;background:var(--accent-60);color:var(--paper-00);padding:3px 8px;border-radius:var(--r-xs)">Recomendado</div>`:''}
                <h3 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">${plan.name}</h3>
                <div style="display:flex;align-items:baseline;gap:6px">
                  <span style="font-family:var(--font-display);font-size:52px;font-weight:500;line-height:1;letter-spacing:var(--tr-tight)">${plan.price}</span>
                  <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${plan.key==='prem'?'rgba(246,242,234,0.5)':'var(--fg-muted)'}">${plan.sub}</span>
                </div>
                <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
                  ${plan.features.map(f=>`<li style="display:flex;align-items:center;gap:8px;font-size:14px">${I("check",14)} ${f}</li>`).join('')}
                </ul>
                <a href="#/checkout?step=2&plan=${plan.key}&cycle=${cycle}" class="btn ${plan.key==='prem'?'btn--accent':'btn--ghost'}" style="justify-content:center;margin-top:var(--s-2);${plan.key==='free'?'':''}">
                  ${plan.key==='free'?'Crear ficha gratis':'Empezar 14 días gratis'} ${I("arrowR",14)}
                </a>
                ${plan.key==='prem'&&cycle==='anual'?`<p style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-align:center;color:rgba(246,242,234,0.5);margin:0">Ahorras $${saving.toLocaleString('es-CL')} al año</p>`:''}
              </div>
            `).join('')}
          </div>
          <div style="display:flex;justify-content:center;gap:var(--s-6);font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">
            ${["Sin comisiones por reservas","Cancela cuando quieras","Datos seguros · 256-bit"].map(t=>`<span>${I("check",12)} ${t}</span>`).join('')}
          </div>
        </section>
      </main>
      ${R.footer()}`;

    // Step 2: datos del negocio
    if (step === 2) return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-10) 0">
          <span class="eyebrow">Checkout · ${params.plan==='prem'?'Premium':'Free'}</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(36px,4.5vw,64px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:var(--s-2) 0 var(--s-8);font-variation-settings:'opsz' 144,'SOFT' 50">
            Cuéntanos de <em style="font-style:italic;color:var(--accent-60)">tu negocio</em>.
          </h1>
          ${stepBar}
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:var(--s-12);align-items:start">
            <form onsubmit="event.preventDefault();window.PP_ROUTER.go('/checkout',{step:${params.plan==='free'?'4':'3'},plan:'${params.plan}',cycle:'${cycle}'})" style="display:flex;flex-direction:column;gap:var(--s-5)">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)">
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Nombre del local</span><input class="input" placeholder="Ej. Café Altura" required></label>
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Categoría</span><select class="input">${D.categories.map(c=>`<option>${c.label}</option>`).join('')}</select></label>
              </div>
              <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Dirección</span><input class="input" placeholder="Ej. Merced 838, Santiago Centro" required></label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)">
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Barrio</span><select class="input">${D.neighborhoods.map(n=>`<option>${n}</option>`).join('')}</select></label>
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Teléfono</span><input class="input" placeholder="+56 9 1234 5678"></label>
              </div>
              <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Sitio web</span><input class="input" placeholder="milocal.cl" type="url"></label>
              <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">RUT del negocio</span><input class="input" placeholder="76.123.456-7" required></label>
              <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Breve descripción</span><textarea class="input" rows="3" style="height:auto;padding-top:12px;resize:vertical" placeholder="Qué hace especial a tu local…"></textarea></label>
              <button class="btn btn--primary btn--lg" style="justify-content:center">Continuar ${I("arrowR",16)}</button>
            </form>
            <!-- Resumen lateral -->
            <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised);display:flex;flex-direction:column;gap:var(--s-4)">
              <span class="eyebrow">Resumen</span>
              <div style="font-family:var(--font-display);font-size:28px;font-weight:500;line-height:1">${params.plan==='prem'?'Premium':'Free'}</div>
              <div style="font-size:14px;color:var(--fg-muted)">Plan ${params.plan==='prem'?cycle:''} · ${params.plan==='prem'?`$${price.toLocaleString('es-CL')} / mes`:'Sin costo'}</div>
              <hr class="hairline">
              <div style="font-family:var(--font-display);font-size:32px;font-weight:500">Hoy: $0</div>
              <div style="font-size:12px;color:var(--fg-muted);line-height:1.5">${params.plan==='prem'?'14 días de prueba sin cargo. Te avisamos antes de cobrar.':'Sin tarjeta requerida.'}</div>
            </div>
          </div>
        </section>
      </main>
      ${R.footer()}`;

    // Step 3: pago (solo si es premium)
    if (step === 3) return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-10) 0">
          <span class="eyebrow">Checkout · Premium</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(36px,4.5vw,64px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:var(--s-2) 0 var(--s-8);font-variation-settings:'opsz' 144,'SOFT' 50">
            Datos de <em style="font-style:italic;color:var(--accent-60)">pago</em>.
          </h1>
          ${stepBar}
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:var(--s-12);align-items:start">
            <form onsubmit="event.preventDefault();window.PP_ROUTER.go('/checkout',{step:4,plan:'prem',cycle:'${cycle}'})" style="display:flex;flex-direction:column;gap:var(--s-5)">
              <div style="display:flex;gap:var(--s-2);flex-wrap:wrap;margin-bottom:var(--s-2)">
                ${["Tarjeta de crédito/débito","Webpay Plus","Transferencia bancaria"].map((m,i)=>`<button type="button" class="chip" aria-pressed="${i===0}">${m}</button>`).join('')}
              </div>
              <label style="display:flex;flex-direction:column;gap:6px">
                <span class="eyebrow">Número de tarjeta</span>
                <div style="position:relative">
                  <input class="input" placeholder="4242 4242 4242 4242" required>
                  <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;color:var(--fg-muted)">VISA</span>
                </div>
              </label>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--s-3)">
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Vence</span><input class="input" placeholder="MM/AA"></label>
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">CVC</span><input class="input" placeholder="123"></label>
                <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Cuotas</span><select class="input"><option>1 cuota</option><option>3 cuotas sin interés</option><option>6 cuotas</option></select></label>
              </div>
              <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">Nombre en la tarjeta</span><input class="input" placeholder="Como aparece en la tarjeta" required></label>
              <label style="display:flex;gap:var(--s-3);align-items:start;font-size:13px;color:var(--fg-muted);cursor:pointer">
                <input type="checkbox" required style="margin-top:4px;flex-shrink:0">
                <span>Acepto los <a href="#" style="color:var(--accent-60);border-bottom:1px solid">Términos del servicio</a>. Mi tarjeta no se cobrará durante los primeros 14 días.</span>
              </label>
              <button class="btn btn--primary btn--lg" style="justify-content:center">Activar prueba gratuita ${I("arrowR",16)}</button>
              <div style="display:flex;justify-content:center;gap:var(--s-4);font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">
                <span>${I("check",12)} Pago seguro 256-bit</span>
                <span>${I("check",12)} Cancela sin penalidad</span>
              </div>
            </form>
            <div style="border:1px solid var(--ink-100);border-radius:var(--r-md);padding:var(--s-5);background:var(--ink-100);color:var(--paper-05);display:flex;flex-direction:column;gap:var(--s-4)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="eyebrow" style="color:var(--paper-30)">Resumen</span>
                <span class="premium-badge" style="background:transparent;border-color:rgba(246,242,234,0.3);color:var(--paper-05)">Premium</span>
              </div>
              <div style="font-family:var(--font-display);font-size:28px;font-weight:400">Plan ${cycle}</div>
              <hr style="border:0;border-top:1px solid rgba(246,242,234,0.15);margin:0">
              <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--paper-30)">
                <div style="display:flex;justify-content:space-between"><span>Hoy pagas</span><strong style="color:var(--paper-00);font-size:18px">$0</strong></div>
                <div style="display:flex;justify-content:space-between"><span>Desde el 13 may 2026</span><span>$${price.toLocaleString('es-CL')} / mes</span></div>
                ${cycle==='anual'?`<div style="display:flex;justify-content:space-between;color:var(--accent-50)"><span>Ahorro anual</span><span>$${saving.toLocaleString('es-CL')}</span></div>`:''}
              </div>
              <div style="background:rgba(246,242,234,0.07);border-radius:var(--r-sm);padding:var(--s-3);font-size:12px;line-height:1.5;color:var(--paper-30)">
                Te enviaremos un recordatorio 3 días antes de tu primer cobro.
              </div>
              ${["Galería ilimitada","Posición prioritaria","Estadísticas avanzadas","Newsletter editorial"].map(f=>`
                <div style="display:flex;align-items:center;gap:8px;font-size:13px">${I("check",12)} ${f}</div>
              `).join('')}
            </div>
          </div>
        </section>
      </main>
      ${R.footer()}`;

    // Step 4: confirmación
    return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-16) 0;text-align:center;max-width:680px;margin:0 auto">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--accent-60);display:inline-flex;align-items:center;justify-content:center;margin-bottom:var(--s-6);color:var(--paper-00)">${I("check",32)}</div>
          <span class="eyebrow">¡Listo!</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(48px,7vw,96px);font-weight:400;line-height:0.95;letter-spacing:var(--tr-tight);margin:var(--s-3) 0 var(--s-5);font-variation-settings:'opsz' 144,'SOFT' 100">
            Ya estás en <em style="font-style:italic;color:var(--accent-60)">Portal Panorama</em>.
          </h1>
          <p style="font-size:18px;color:var(--fg-muted);line-height:1.55;margin:0 0 var(--s-8)">
            Tu ficha está activa. ${params.plan==='prem'?'Tu prueba Premium de 14 días comienza hoy — no se cobrará nada hasta el 13 de mayo.':'Puedes mejorar a Premium en cualquier momento desde tu panel.'}
          </p>
          <div style="display:flex;gap:var(--s-3);justify-content:center;flex-wrap:wrap">
            <a href="#/dashboard-negocio" class="btn btn--primary btn--lg">Ir a mi panel ${I("arrowR",16)}</a>
            <a href="#/" class="btn btn--ghost btn--lg">Ver el portal</a>
          </div>
          <div style="margin-top:var(--s-12);padding:var(--s-6);background:var(--bg-raised);border:1px solid var(--surface-line);border-radius:var(--r-md);text-align:left;display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)">
            ${[
              ["Próximo paso","Completa tu ficha con fotos y horario"],
              ["Soporte","hola@portalpanorama.cl"],
              ["Tu plan","${params.plan==='prem'?'Premium 14 días gratis':'Free'}"],
              ["Documentación","guia.portalpanorama.cl"]
            ].map(([l,v])=>`
              <div><div class="eyebrow" style="margin-bottom:4px">${l}</div><div style="font-size:14px">${v}</div></div>
            `).join('')}
          </div>
        </section>
      </main>
      ${R.footer()}`;
  }

  // ─── DASHBOARD USUARIO ───────────────────────────────────────────────────────
  function dashUsuario(params) {
    const tab = params.tab || "guardados";
    const grupos = GRUPOS.all();
    const favIds = window.PP_FAVS.list();
    let favPlaces = D.places.filter(p => favIds.includes(p.id));
    if (!favPlaces.length) favPlaces = D.places.slice(0, 4);

    const header = `
      <div style="display:grid;grid-template-columns:auto 1fr auto;gap:var(--s-5);align-items:center;flex-wrap:wrap">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--paper-10);border:1px solid var(--surface-line);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;font-size:28px;color:var(--accent-60);font-variation-settings:'opsz' 100,'SOFT' 100">M</div>
        <div>
          <span class="eyebrow">Mi cuenta · Miembro desde marzo 2026</span>
          <h1 style="font-family:var(--font-display);font-size:clamp(28px,4vw,48px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:6px 0 0;font-variation-settings:'opsz' 144,'SOFT' 50">
            Hola, <em style="font-style:italic;color:var(--accent-60)">Martín</em>.
          </h1>
          <div style="display:flex;gap:var(--s-5);margin-top:var(--s-2);font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">
            <span><strong style="font-family:var(--font-display);font-size:16px;color:var(--fg);margin-right:4px">${favPlaces.length}</strong>Guardados</span>
            <span><strong style="font-family:var(--font-display);font-size:16px;color:var(--fg);margin-right:4px">${grupos.length}</strong>Listas</span>
            <span><strong style="font-family:var(--font-display);font-size:16px;color:var(--fg);margin-right:4px">7</strong>Reseñas</span>
          </div>
        </div>
        <div style="display:flex;gap:var(--s-2)">
          <a href="#/dashboard-negocio" class="btn btn--ghost btn--sm">${I("grid",14)} Mi negocio</a>
          <button class="btn btn--primary btn--sm">Editar perfil</button>
        </div>
      </div>`;

    let content = "";

    if (tab === "guardados") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-6)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Lugares <em style="font-style:italic;color:var(--accent-60)">guardados</em></h2>
          <div style="display:flex;gap:var(--s-2)">
            <select class="chip" style="border:1px solid var(--surface-line)"><option>Más recientes</option><option>Mejor evaluados</option><option>Por barrio</option></select>
          </div>
        </div>
        <div class="results-grid">
          ${favPlaces.map(p => R.placeCard(p)).join('')}
        </div>
        <div style="margin-top:var(--s-6);padding:var(--s-5);background:var(--bg-raised);border:1px dashed var(--surface-line);border-radius:var(--r-md);display:flex;align-items:center;gap:var(--s-4)">
          ${I("heart",22)}
          <div style="flex:1">
            <div style="font-weight:500;margin-bottom:2px">Guarda más lugares</div>
            <div style="font-size:13px;color:var(--fg-muted)">Pulsa el corazón en cualquier ficha para guardarlo aquí.</div>
          </div>
          <a href="#/buscar" class="btn btn--ghost btn--sm">Explorar ${I("arrowR",12)}</a>
        </div>`;
    }

    if (tab === "listas") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-6)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Mis <em style="font-style:italic;color:var(--accent-60)">listas</em></h2>
          <button class="btn btn--primary btn--sm" onclick="window.PP_APP.createGroup()">${I("plus",14)} Nueva lista</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)">
          ${grupos.map(g => {
            const places = D.places.filter(p => g.places.includes(p.id));
            return `
            <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);overflow:hidden;background:var(--bg-raised)">
              <div style="display:grid;grid-template-columns:1fr 1fr;height:120px">
                ${[0,1,2,3].map(i => places[i] ? `<div class="placeholder-stripe" data-label="${places[i].cover}" style="height:60px"></div>` : `<div style="background:var(--paper-10);height:60px"></div>`).join('')}
              </div>
              <div style="padding:var(--s-4)">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--s-3);margin-bottom:8px">
                  <div style="display:flex;align-items:center;gap:8px">
                    ${I(g.icon || "grid",16)}
                    <strong style="font-size:16px">${g.name}</strong>
                  </div>
                  <div style="display:flex;gap:var(--s-1)">
                    <button class="icon-btn" style="width:32px;height:32px" title="Editar nombre" onclick="window.PP_APP.renameGroup('${g.id}')">${I("filter",14)}</button>
                    <button class="icon-btn" style="width:32px;height:32px;color:var(--error)" title="Eliminar lista" onclick="window.PP_APP.removeGroup('${g.id}')">${I("close",14)}</button>
                  </div>
                </div>
                <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted);margin-bottom:var(--s-3)">${places.length} lugar${places.length!==1?'es':''} · Privada</div>
                ${places.slice(0,3).map(p=>`
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-top:1px solid var(--surface-line-soft);font-size:13px">
                    <a href="#/lugar?id=${p.id}" style="flex:1">${p.name}</a>
                    <button style="color:var(--fg-muted);font-size:11px" onclick="window.PP_APP.removePlaceFromGroup('${g.id}','${p.id}')">${I("close",12)}</button>
                  </div>
                `).join('')}
                <button class="btn btn--ghost btn--sm" style="width:100%;justify-content:center;margin-top:var(--s-3)" onclick="window.PP_APP.addPlaceToGroup('${g.id}')">${I("plus",12)} Agregar lugar</button>
              </div>
            </div>`;
          }).join('')}
          <button onclick="window.PP_APP.createGroup()" style="border:1px dashed var(--surface-line);border-radius:var(--r-md);min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--fg-muted);transition:all var(--d-fast);background:transparent;cursor:pointer" onmouseover="this.style.borderColor='var(--ink-100)';this.style.color='var(--fg)'" onmouseout="this.style.borderColor='var(--surface-line)';this.style.color='var(--fg-muted)'">
            <span style="width:48px;height:48px;border-radius:50%;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center">${I("plus",20)}</span>
            <span style="font-family:var(--font-display);font-size:20px;color:var(--fg)">Nueva lista</span>
          </button>
        </div>`;
    }

    if (tab === "resenas") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Mis <em style="font-style:italic;color:var(--accent-60)">reseñas</em></h2>
        ${D.places.slice(0,3).map(p=>`
          <div style="display:grid;grid-template-columns:80px 1fr auto;gap:var(--s-4);padding:var(--s-5) 0;border-top:1px solid var(--surface-line);align-items:start">
            <div class="placeholder-stripe" data-label="${p.cover}" style="height:80px;border-radius:var(--r-sm)"></div>
            <div>
              <div style="display:flex;gap:var(--s-3);align-items:center;margin-bottom:6px">
                <a href="#/lugar?id=${p.id}" style="font-weight:500;font-size:15px">${p.name}</a>
                <span class="rating" style="font-size:13px">${I("starF",12)}<span style="margin-left:3px">4.5</span></span>
              </div>
              <p style="margin:0;font-size:14px;color:var(--ink-90);line-height:1.5">Excelente experiencia. El ambiente y la atención hacen que valga cada peso.</p>
              <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;color:var(--fg-muted);margin-top:4px;display:block">Hace 2 semanas</span>
            </div>
            <div style="display:flex;gap:var(--s-1)">
              <button class="btn btn--ghost btn--sm">Editar</button>
              <button class="btn btn--ghost btn--sm" style="color:var(--error)">Borrar</button>
            </div>
          </div>
        `).join('')}`;
    }

    if (tab === "historial") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Lugares <em style="font-style:italic;color:var(--accent-60)">visitados</em></h2>
        <div class="results-grid">
          ${D.places.slice(2,8).map(p => R.placeCard(p)).join('')}
        </div>`;
    }

    if (tab === "perfil" || tab === "config") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">${tab==='perfil'?'Mi <em style="font-style:italic;color:var(--accent-60)">perfil</em>':'<em style="font-style:italic;color:var(--accent-60)">Configuración</em>'}</h2>
        <div style="display:flex;flex-direction:column;gap:var(--s-4);max-width:520px">
          ${[["Nombre","Martín González"],["Email","martin@gmail.com"],["Teléfono","+56 9 8877 6655"],["Ciudad","Santiago, Chile"]].map(([l,v])=>`
            <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${l}</span><input class="input" value="${v}"></label>
          `).join('')}
          <button class="btn btn--primary" style="align-self:start;margin-top:var(--s-3)">Guardar cambios ${I("check",14)}</button>
        </div>`;
    }

    return dashShell(tab, "usuario", header, content);
  }

  // ─── DASHBOARD NEGOCIO ───────────────────────────────────────────────────────
  function dashNegocio(params) {
    const tab = params.tab || "resumen";
    const grupos = GRUPOS.all();
    const favIds = window.PP_FAVS.list();
    let favPlaces = D.places.filter(p => favIds.includes(p.id));
    if (!favPlaces.length) favPlaces = D.places.slice(0, 3);

    const myPlaces = D.places.filter(p => p.premium).slice(0,3);

    const header = `
      <div style="display:grid;grid-template-columns:auto 1fr auto;gap:var(--s-5);align-items:center;flex-wrap:wrap">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--paper-10);border:1px solid var(--surface-line);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;font-size:24px;color:var(--accent-60)">AB</div>
        <div>
          <div style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:4px">
            <span class="eyebrow">Panel de negocio</span>
            <span class="premium-badge">Premium · Activo</span>
          </div>
          <h1 style="font-family:var(--font-display);font-size:clamp(28px,4vw,48px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 144,'SOFT' 50">
            Hola, <em style="font-style:italic;color:var(--accent-60)">Camila</em>.
          </h1>
        </div>
        <div style="display:flex;gap:var(--s-2);flex-wrap:wrap">
          <a href="#/dashboard-usuario" class="btn btn--ghost btn--sm">${I("user",14)} Mi cuenta</a>
          <button class="btn btn--ghost btn--sm">${I("plus",14)} Publicar evento</button>
          <a href="#/lugar?id=ambrosia" class="btn btn--primary btn--sm">Ver ficha ${I("arrowUR",14)}</a>
        </div>
      </div>`;

    let content = "";

    // ── Resumen ──
    if (tab === "resumen") {
      const days = ["L","M","X","J","V","S","D"];
      const vals = [240,320,280,410,520,680,590];
      const max = Math.max(...vals);
      content = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s-3);margin-bottom:var(--s-6)">
          ${[["Vistas",  "3.421","+12%",false],["Cómo llegar","287","+8%",false],["Llamadas","94","+3%",false],["Posición","#4","−1 pos",false]].map(([l,v,d])=>`
            <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
              <span class="eyebrow">${l}</span>
              <div style="font-family:var(--font-display);font-size:40px;font-weight:500;line-height:1;letter-spacing:var(--tr-tight);margin:8px 0 4px;font-variation-settings:'opsz' 100">${v}</div>
              <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--success)">${d} vs sem anterior</span>
            </div>
          `).join('')}
        </div>
        <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-6);background:var(--bg-raised);margin-bottom:var(--s-6)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-5)">
            <div><span class="eyebrow">Vistas · Últimos 7 días</span><div style="font-family:var(--font-display);font-size:28px;font-weight:500;line-height:1;margin-top:4px">3.421 <em style="font-size:16px;font-style:italic;color:var(--accent-60);font-weight:400">+12%</em></div></div>
            <div style="display:inline-flex;padding:3px;border:1px solid var(--surface-line);border-radius:var(--r-pill)">${["7d","30d","90d"].map((l,i)=>`<button style="height:30px;padding:0 12px;border-radius:999px;font-size:13px;${i===0?'background:var(--ink-100);color:var(--paper-00)':''}">${l}</button>`).join('')}</div>
          </div>
          <div style="display:flex;gap:var(--s-2);align-items:end;height:180px">
            ${vals.map((v,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%"><div style="flex:1;width:100%;display:flex;align-items:end;justify-content:center"><div style="width:70%;height:${(v/max*100).toFixed(0)}%;background:${i===5?'var(--accent-60)':'var(--ink-100)'};border-radius:2px 2px 0 0"></div></div><span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.08em;color:var(--fg-muted)">${days[i]}</span></div>`).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:var(--s-5)">
          <!-- Reseñas -->
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s-4)"><span class="eyebrow">Reseñas recientes</span><a href="#/dashboard-negocio?tab=resenas" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">Ver todas →</a></div>
            ${[{n:"Camila R.",r:5,t:"Lo mejor del barrio.",w:"Hace 2 días",replied:false},{n:"Tomás P.",r:4,t:"Buen ambiente y producto.",w:"Hace 1 semana",replied:true}].map(rev=>`
              <div style="display:grid;grid-template-columns:36px 1fr auto;gap:var(--s-3);padding:var(--s-3) 0;border-top:1px solid var(--surface-line-soft);align-items:start">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--paper-10);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;color:var(--accent-60)">${rev.n[0]}</div>
                <div><div style="display:flex;gap:6px;align-items:center;margin-bottom:2px"><strong style="font-size:13px">${rev.n}</strong><span class="rating" style="font-size:11px">${I("starF",11)} ${rev.r}.0</span></div><p style="margin:0;font-size:12px;color:var(--ink-90);line-height:1.4">${rev.t}</p></div>
                <button class="btn btn--ghost btn--sm">${rev.replied?"Editada":"Responder"}</button>
              </div>
            `).join('')}
          </div>
          <!-- Estado ficha -->
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised);display:flex;flex-direction:column;gap:var(--s-3)">
            <span class="eyebrow">Estado de tu ficha</span>
            <div class="placeholder-stripe" data-label="FACHADA" style="height:100px;border-radius:var(--r-sm)"></div>
            <div style="font-family:var(--font-display);font-size:20px;font-weight:500">Ambrosía Bistró</div>
            ${[["Portada","ok"],["Galería (8 fotos)","ok"],["Horarios","ok"],["Menú","warn"],["Fotos de otoño","todo"]].map(([l,s])=>`
              <div style="display:flex;align-items:center;gap:8px;font-size:13px">
                <span style="width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;${s==='ok'?'background:var(--success);color:#fff':s==='warn'?'background:var(--warning);color:var(--ink-100)':'background:var(--bg-sunken);color:var(--fg-muted);border:1px solid var(--surface-line)'}">${s==='ok'?I("check",10):s==='warn'?'!':'·'}</span>
                <span style="${s==='todo'?'color:var(--fg-muted)':''}">${l}</span>
              </div>
            `).join('')}
            <div style="height:4px;background:var(--bg-sunken);border-radius:2px;overflow:hidden;margin-top:4px"><div style="height:100%;width:80%;background:var(--accent-60)"></div></div>
            <a href="#/dashboard-negocio?tab=fichas" class="btn btn--ghost btn--sm" style="justify-content:center">Editar mi ficha ${I("arrowR",12)}</a>
          </div>
        </div>`;
    }

    // ── Mis fichas ──
    if (tab === "fichas") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-6)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Mis <em style="font-style:italic;color:var(--accent-60)">fichas</em></h2>
          <a href="#/checkout?step=2&plan=free" class="btn btn--primary btn--sm">${I("plus",14)} Agregar local</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--s-3)">
          ${myPlaces.map(p=>`
            <div style="display:grid;grid-template-columns:100px 1fr auto auto auto;gap:var(--s-4);padding:var(--s-4);border:1px solid var(--surface-line);border-radius:var(--r-md);background:var(--bg-raised);align-items:center">
              <div class="placeholder-stripe" data-label="${p.cover}" style="height:70px;border-radius:var(--r-sm)"></div>
              <div>
                <div style="display:flex;align-items:center;gap:var(--s-2);margin-bottom:4px">
                  <strong>${p.name}</strong>
                  ${p.premium?`<span class="premium-badge">Premium</span>`:''}
                </div>
                <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--fg-muted)">${p.category} · ${p.neighborhood}</div>
                <div style="font-size:13px;color:var(--success);margin-top:4px">${p.hours}</div>
              </div>
              <div style="text-align:center"><div style="font-family:var(--font-display);font-size:22px;font-weight:500">${Math.floor(Math.random()*800+200)}</div><div class="eyebrow">Vistas</div></div>
              <div style="text-align:center"><div style="font-family:var(--font-display);font-size:22px;font-weight:500">${p.rating.toFixed(1)}</div><div class="eyebrow">Rating</div></div>
              <div style="display:flex;flex-direction:column;gap:var(--s-1)">
                <a href="#/lugar?id=${p.id}" class="btn btn--ghost btn--sm">${I("arrowUR",12)} Ver</a>
                <button class="btn btn--ghost btn--sm">${I("filter",12)} Editar</button>
              </div>
            </div>
          `).join('')}
        </div>`;
    }

    // ── Estadísticas ──
    if (tab === "stats") {
      const months = ["Oct","Nov","Dic","Ene","Feb","Mar"];
      const vs = [1200,1800,2100,1600,2800,3421];
      const mx = Math.max(...vs);
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Estadísticas <em style="font-style:italic;color:var(--accent-60)">detalladas</em></h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--s-4);margin-bottom:var(--s-6)">
          ${[["Vistas totales","14.832","este mes"],["Búsquedas donde apareces","3.211","esta semana"],["Posición media en búsquedas","#4","en Restaurantes"]].map(([l,v,sub])=>`
            <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
              <span class="eyebrow">${l}</span>
              <div style="font-family:var(--font-display);font-size:36px;font-weight:500;line-height:1;margin:8px 0 4px;font-variation-settings:'opsz' 100">${v}</div>
              <span style="font-size:13px;color:var(--fg-muted)">${sub}</span>
            </div>
          `).join('')}
        </div>
        <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-6);background:var(--bg-raised);margin-bottom:var(--s-5)">
          <span class="eyebrow" style="display:block;margin-bottom:var(--s-4)">Vistas por mes · últimos 6 meses</span>
          <div style="display:flex;gap:var(--s-4);align-items:end;height:200px">
            ${vs.map((v,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%">
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted)">${v.toLocaleString()}</span>
                <div style="flex:1;width:100%;display:flex;align-items:end;justify-content:center">
                  <div style="width:80%;height:${(v/mx*100).toFixed(0)}%;background:${i===vs.length-1?'var(--accent-60)':'var(--ink-100)'};border-radius:2px 2px 0 0"></div>
                </div>
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted)">${months[i]}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-5)">
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
            <span class="eyebrow" style="display:block;margin-bottom:var(--s-4)">Cómo te encuentran</span>
            ${[["Búsqueda directa","48%"],["Categoría Restaurantes","32%"],["Newsletter editorial","12%"],["Búsqueda por barrio","8%"]].map(([l,pct])=>`
              <div style="margin-bottom:var(--s-3)">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${l}</span><strong>${pct}</strong></div>
                <div style="height:4px;background:var(--bg-sunken);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct};background:var(--ink-100)"></div></div>
              </div>
            `).join('')}
          </div>
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
            <span class="eyebrow" style="display:block;margin-bottom:var(--s-4)">Acciones desde tu ficha</span>
            ${[["Cómo llegar","287","↑ 8%"],["Llamadas","94","↑ 3%"],["Guardados","156","↑ 18%"],["Compartidos","43","↑ 5%"]].map(([l,v,d])=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--surface-line-soft);font-size:13px">
                <span>${l}</span>
                <div style="display:flex;align-items:center;gap:var(--s-3)">
                  <strong style="font-family:var(--font-display);font-size:18px">${v}</strong>
                  <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;color:var(--success)">${d}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }

    // ── Plan ──
    if (tab === "plan") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Tu <em style="font-style:italic;color:var(--accent-60)">plan</em></h2>
        <div style="border:1px solid var(--ink-100);border-radius:var(--r-md);padding:var(--s-6);background:var(--ink-100);color:var(--paper-05);margin-bottom:var(--s-5);display:grid;grid-template-columns:1fr auto;gap:var(--s-6);align-items:center">
          <div>
            <span class="eyebrow" style="color:var(--paper-30)">Plan activo</span>
            <div style="font-family:var(--font-display);font-size:48px;font-weight:400;line-height:1;margin:8px 0;font-variation-settings:'opsz' 144">Premium</div>
            <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:var(--paper-30)">Mensual · $24.900 / mes · Próximo cobro: 29 May 2026</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--s-2)">
            <button class="btn btn--ghost" style="color:var(--paper-05);border-color:rgba(246,242,234,0.3)">Cambiar a anual ${I("arrowR",14)}</button>
            <button class="btn btn--ghost" style="color:var(--paper-30);border-color:rgba(246,242,234,0.15);font-size:13px">Cancelar suscripción</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-5);margin-bottom:var(--s-6)">
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
            <span class="eyebrow">Historial de pagos</span>
            ${[["29 Apr 2026","$24.900","Pagado"],["29 Mar 2026","$24.900","Pagado"],["29 Feb 2026","$24.900","Pagado"]].map(([d,m,s])=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--surface-line-soft);font-size:13px">
                <span style="color:var(--fg-muted)">${d}</span>
                <strong>${m}</strong>
                <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--success)">${s}</span>
              </div>
            `).join('')}
          </div>
          <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);padding:var(--s-5);background:var(--bg-raised)">
            <span class="eyebrow">Método de pago</span>
            <div style="display:flex;align-items:center;gap:var(--s-3);margin:var(--s-4) 0">
              <div style="width:48px;height:32px;border:1px solid var(--surface-line);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px">VISA</div>
              <div><div style="font-size:14px;font-weight:500">•••• •••• •••• 4242</div><div style="font-size:12px;color:var(--fg-muted)">Vence 08/28</div></div>
            </div>
            <button class="btn btn--ghost btn--sm">Actualizar tarjeta</button>
          </div>
        </div>`;
    }

    // ── Reseñas del negocio ──
    if (tab === "resenas") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-5)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Reseñas <em style="font-style:italic;color:var(--accent-60)">(312)</em></h2>
          <span class="rating">${I("starF")} <strong style="margin-left:4px">4.7</strong> <span style="color:var(--fg-muted);font-size:14px">promedio</span></span>
        </div>
        ${[{n:"Camila R.",r:5,t:"Lo mejor del barrio. La carta cambia con la temporada y siempre encontramos algo nuevo. La atención es impecable.",w:"Hace 2 días",replied:false},{n:"Tomás P.",r:4,t:"Buen ambiente y producto. La sobremesa se hace larga (en el mejor sentido). Reservar con tiempo los viernes.",w:"Hace 1 semana",replied:true},{n:"Florencia M.",r:5,t:"Volví por tercera vez en el mes. El equipo te atiende como si fueras parte de la casa.",w:"Hace 2 semanas",replied:false}].map(rev=>`
          <div style="display:grid;grid-template-columns:48px 1fr;gap:var(--s-4);padding:var(--s-5) 0;border-top:1px solid var(--surface-line)">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--paper-10);border:1px solid var(--surface-line);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;color:var(--accent-60)">${rev.n[0]}</div>
            <div>
              <div style="display:flex;gap:var(--s-3);align-items:baseline;margin-bottom:6px;flex-wrap:wrap">
                <strong>${rev.n}</strong>
                <span class="rating" style="font-size:13px">${I("starF",12)} ${rev.r}.0</span>
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);letter-spacing:0.06em">${rev.w}</span>
              </div>
              <p style="margin:0 0 var(--s-3);line-height:1.5;font-size:14px">${rev.t}</p>
              ${rev.replied?`<div style="background:var(--bg-sunken);border-left:2px solid var(--ink-100);padding:var(--s-3);font-size:13px;color:var(--fg-muted)"><strong style="color:var(--fg)">Tu respuesta:</strong> Gracias por visitarnos, ¡esperamos verte pronto!</div>`:`<button class="btn btn--ghost btn--sm">${I("arrowR",12)} Responder</button>`}
            </div>
          </div>
        `).join('')}`;
    }

    // ── Eventos del negocio ──
    if (tab === "eventos") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-5)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Tus <em style="font-style:italic;color:var(--accent-60)">eventos</em></h2>
          <button class="btn btn--primary btn--sm">${I("plus",14)} Nuevo evento</button>
        </div>
        ${[["02 May","Cena maridaje · Vinos del Maule","19:30","Publicado","48 vistas"],["15 May","Almuerzo de temporada · Otoño","13:00","Borrador","—"],["28 May","Cocina en vivo · Chef invitado","20:00","Publicado","21 vistas"]].map(([d,t,h,s,v])=>`
          <div style="display:grid;grid-template-columns:80px 1fr auto auto auto;gap:var(--s-4);padding:var(--s-4);border:1px solid var(--surface-line);border-radius:var(--r-md);background:var(--bg-raised);align-items:center;margin-bottom:var(--s-3)">
            <div style="font-family:var(--font-display);font-weight:500;font-size:20px;line-height:1">${d}<span style="display:block;font-family:var(--font-mono);font-size:11px;font-weight:400;color:var(--fg-muted);letter-spacing:0.06em;margin-top:2px">${h}</span></div>
            <div style="font-weight:500">${t}</div>
            <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${s==='Borrador'?'var(--warning)':'var(--success)'}">${s}</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--fg-muted)">${v}</span>
            <div style="display:flex;gap:var(--s-1)"><button class="btn btn--ghost btn--sm">Editar</button></div>
          </div>
        `).join('')}`;
    }

    // ── Guardados (usuario dentro del negocio) ──
    if (tab === "guardados") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Lugares <em style="font-style:italic;color:var(--accent-60)">guardados</em></h2>
        <div class="results-grid">${favPlaces.map(p => R.placeCard(p)).join('')}</div>`;
    }

    // ── Listas (usuario dentro del negocio) ──
    if (tab === "listas") {
      content = `
        <div style="display:flex;justify-content:space-between;align-items:end;padding-bottom:var(--s-4);border-bottom:1px solid var(--surface-line);margin-bottom:var(--s-6)">
          <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0;font-variation-settings:'opsz' 100">Mis <em style="font-style:italic;color:var(--accent-60)">listas</em></h2>
          <button class="btn btn--primary btn--sm" onclick="window.PP_APP.createGroup()">${I("plus",14)} Nueva lista</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)">
          ${grupos.map(g => {
            const places = D.places.filter(p => g.places.includes(p.id));
            return `
            <div style="border:1px solid var(--surface-line);border-radius:var(--r-md);overflow:hidden;background:var(--bg-raised)">
              <div style="display:grid;grid-template-columns:1fr 1fr;height:100px">
                ${[0,1,2,3].map(i => places[i] ? `<div class="placeholder-stripe" data-label="${places[i].cover}" style="height:50px"></div>` : `<div style="background:var(--paper-10);height:50px"></div>`).join('')}
              </div>
              <div style="padding:var(--s-4)">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                  <strong>${g.name}</strong>
                  <button class="icon-btn" style="width:28px;height:28px;color:var(--error)" onclick="window.PP_APP.removeGroup('${g.id}')">${I("close",12)}</button>
                </div>
                <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">${places.length} lugares</div>
              </div>
            </div>`;
          }).join('')}
          <button onclick="window.PP_APP.createGroup()" style="border:1px dashed var(--surface-line);border-radius:var(--r-md);min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--fg-muted);transition:all var(--d-fast);background:transparent;cursor:pointer">
            <span style="width:44px;height:44px;border-radius:50%;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center">${I("plus",18)}</span>
            <span style="font-family:var(--font-display);font-size:18px;color:var(--fg)">Nueva lista</span>
          </button>
        </div>`;
    }

    // ── Perfil del negocio ──
    if (tab === "perfil") {
      content = `
        <h2 style="font-family:var(--font-display);font-size:32px;font-weight:400;letter-spacing:var(--tr-tight);margin:0 0 var(--s-6);font-variation-settings:'opsz' 100">Mi <em style="font-style:italic;color:var(--accent-60)">perfil</em></h2>
        <div style="display:flex;flex-direction:column;gap:var(--s-4);max-width:520px">
          ${[["Nombre","Camila Rodríguez"],["Email","camila@ambrosia.cl"],["Teléfono","+56 9 9988 7766"],["RUT","12.345.678-9"]].map(([l,v])=>`
            <label style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${l}</span><input class="input" value="${v}"></label>
          `).join('')}
          <button class="btn btn--primary" style="align-self:start;margin-top:var(--s-2)">Guardar cambios ${I("check",14)}</button>
        </div>`;
    }

    return dashShell(tab, "negocio", header, content);
  }

  // ─── PERFIL PÚBLICO NEGOCIO ──────────────────────────────────────────────────
  function perfilNegocio(params) {
    const owner = D.owners.find(o => o.id === params.id) || D.owners[0];
    const places = D.places.filter(p => owner.places.includes(p.id));
    const events = D.events.filter(e => owner.events.includes(e.id));
    const isEditorial = owner.id === "o3";

    return `
      ${R.topbar()}
      <main class="page-enter">
        <section class="container" style="padding:var(--s-10) 0 var(--s-8);border-bottom:1px solid var(--surface-line)">
          <div style="display:grid;grid-template-columns:auto 1fr auto;gap:var(--s-6);align-items:center;flex-wrap:wrap">
            <div style="width:96px;height:96px;border-radius:50%;background:var(--ink-100);color:var(--paper-00);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-style:italic;font-size:36px;font-variation-settings:'opsz' 100,'SOFT' 100">${owner.avatar}</div>
            <div>
              <div style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:6px">
                <span class="eyebrow">${isEditorial ? 'Perfil editorial' : 'Perfil de negocio'}</span>
                ${isEditorial ? `<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;background:var(--paper-10);border:1px solid var(--surface-line);padding:3px 8px;border-radius:var(--r-xs);color:var(--fg-muted)">Portal Panorama</span>` : `<span class="premium-badge">Verificado</span>`}
              </div>
              <h1 style="font-family:var(--font-display);font-size:clamp(32px,5vw,64px);font-weight:400;line-height:1;letter-spacing:var(--tr-tight);margin:0 0 var(--s-2);font-variation-settings:'opsz' 144,'SOFT' 50">
                ${owner.name}
              </h1>
              <p style="margin:0;color:var(--fg-muted);font-size:15px;max-width:540px;line-height:1.5">${owner.bio}</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--s-2);align-items:end">
              <div style="display:flex;gap:var(--s-8);font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-muted)">
                <div><strong style="font-family:var(--font-display);font-size:28px;color:var(--fg);display:block;margin-bottom:2px">${places.length}</strong>Local${places.length!==1?'es':''}</div>
                <div><strong style="font-family:var(--font-display);font-size:28px;color:var(--fg);display:block;margin-bottom:2px">${events.length}</strong>Evento${events.length!==1?'s':''}</div>
              </div>
              ${!isEditorial ? `<a href="#/checkout?step=1" class="btn btn--ghost btn--sm">${I("share",14)} Contactar</a>` : ''}
            </div>
          </div>
        </section>

        <section class="container" style="padding:var(--s-10) 0">
          ${places.length ? `
            ${R.sectionHead("", `Sus <em>locales</em>`, "", "")}
            <div class="results-grid" style="margin-bottom:var(--s-12)">
              ${places.map(p => R.placeCard(p)).join("")}
            </div>
          ` : ""}

          ${events.length ? `
            ${R.sectionHead("", `Sus <em>eventos</em>`, "", "")}
            <div>
              ${events.map(R.eventCard).join("")}
              <div style="border-bottom:1px solid var(--surface-line)"></div>
            </div>
          ` : ""}

          ${isEditorial ? `
            <div style="margin-top:var(--s-12);padding:var(--s-6);background:var(--bg-raised);border:1px solid var(--surface-line);border-radius:var(--r-md);display:grid;grid-template-columns:1fr auto;gap:var(--s-6);align-items:center">
              <div>
                <span class="eyebrow" style="display:block;margin-bottom:var(--s-2)">¿Eres dueño de alguno de estos locales?</span>
                <p style="margin:0;font-size:14px;color:var(--fg-muted);line-height:1.5;max-width:480px">Estas fichas fueron creadas por el equipo de Portal Panorama. Si representas a uno de estos negocios, puedes reclamarlo para editarlo y mejorarlo.</p>
              </div>
              <a href="#/checkout?step=1" class="btn btn--primary">Reclamar mi ficha ${I("arrowR",14)}</a>
            </div>
          ` : ""}
        </section>
      </main>
      ${R.footer()}
    `;
  }

  return { checkout, dashUsuario, dashNegocio, perfilNegocio, GRUPOS };
})();
