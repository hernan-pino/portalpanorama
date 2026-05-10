// Tweaks panel — Portal Panorama (vanilla JS, no React)
// Handles postMessage protocol for toolbar toggle

window.PP_TWEAKS = (() => {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "cardStyle": "editorial",
    "cardRadius": "8",
    "showHours": true,
    "accentColor": "#E08450"
  }/*EDITMODE-END*/;

  let state = { ...DEFAULTS };
  let panel = null;
  let visible = false;

  function apply() {
    // Card style variant
    document.body.dataset.cardStyle = state.cardStyle;
    // Card radius
    document.documentElement.style.setProperty("--card-radius-override", state.cardRadius + "px");
    // Accent override
    document.documentElement.style.setProperty("--accent-60", state.accentColor);
    // Hours visibility
    document.body.dataset.hideHours = state.showHours ? "" : "1";
    // Persist
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { ...state } }, "*");
  }

  function setKey(key, val) {
    state[key] = val;
    apply();
  }

  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "pp-tweaks";
    panel.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9000;
      width: 280px;
      background: #14110F;
      color: #F6F2EA;
      border-radius: 12px;
      box-shadow: 0 24px 48px -12px rgba(0,0,0,0.5);
      font-family: 'Inter Tight', sans-serif;
      font-size: 13px;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    const header = `
      <div style="padding:14px 16px 10px;border-bottom:1px solid rgba(246,242,234,0.1);display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(246,242,234,0.5)">Tweaks</span>
        <button id="tweaks-close" style="width:24px;height:24px;border-radius:50%;background:rgba(246,242,234,0.1);display:inline-flex;align-items:center;justify-content:center;color:#F6F2EA;font-size:14px">×</button>
      </div>`;

    const section = (label, html) => `
      <div style="padding:12px 16px;border-bottom:1px solid rgba(246,242,234,0.08)">
        <div style="font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(246,242,234,0.4);margin-bottom:10px">${label}</div>
        ${html}
      </div>`;

    const cardStyles = [
      { key: "editorial", label: "Editorial" },
      { key: "horizontal", label: "Horizontal" },
      { key: "minimal",    label: "Minimal" },
      { key: "grande",     label: "Grande" },
    ];

    const radii = [
      { val: "2",  label: "Cuadrado" },
      { val: "8",  label: "Suave" },
      { val: "16", label: "Redondeado" },
    ];

    panel.innerHTML = header +
      section("Estilo de tarjeta", `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${cardStyles.map(s => `
            <button data-card-style="${s.key}" style="
              height:36px;border-radius:6px;font-size:12px;
              background:${state.cardStyle===s.key?'rgba(246,242,234,0.15)':'rgba(246,242,234,0.05)'};
              border:1px solid ${state.cardStyle===s.key?'rgba(246,242,234,0.4)':'rgba(246,242,234,0.1)'};
              color:#F6F2EA;transition:all 140ms;
            ">${s.label}</button>
          `).join("")}
        </div>
      `) +
      section("Radio de tarjeta", `
        <div style="display:flex;gap:6px">
          ${radii.map(r => `
            <button data-radius="${r.val}" style="
              flex:1;height:32px;border-radius:6px;font-size:12px;
              background:${state.cardRadius===r.val?'rgba(246,242,234,0.15)':'rgba(246,242,234,0.05)'};
              border:1px solid ${state.cardRadius===r.val?'rgba(246,242,234,0.4)':'rgba(246,242,234,0.1)'};
              color:#F6F2EA;transition:all 140ms;
            ">${r.label}</button>
          `).join("")}
        </div>
      `) +
      section("Color de acento", `
        <div style="display:flex;gap:8px;align-items:center">
          ${["#E08450","#C04A3A","#6A9F7A","#4A7AB5","#9B6BB5"].map(c => `
            <button data-accent="${c}" style="
              width:28px;height:28px;border-radius:50%;background:${c};
              border:2px solid ${state.accentColor===c?'white':'transparent'};
              transition:border 140ms;flex-shrink:0;
            " title="${c}"></button>
          `).join("")}
          <input type="color" id="accent-custom" value="${state.accentColor}" style="width:28px;height:28px;border:0;background:none;cursor:pointer;padding:0">
        </div>
      `) +
      section("Visibilidad", `
        <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
          <span>Mostrar horario en card</span>
          <input type="checkbox" id="show-hours" ${state.showHours?'checked':''} style="width:16px;height:16px;accent-color:var(--accent-60)">
        </label>
      `) +
      `<div style="padding:12px 16px">
        <button id="tweaks-reset" style="width:100%;height:32px;border-radius:6px;font-size:12px;background:rgba(246,242,234,0.05);border:1px solid rgba(246,242,234,0.1);color:rgba(246,242,234,0.5)">Restaurar valores por defecto</button>
      </div>`;

    document.body.appendChild(panel);
    bindEvents();
  }

  function bindEvents() {
    panel.querySelector("#tweaks-close").onclick = () => {
      hide();
      window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
    };

    panel.querySelectorAll("[data-card-style]").forEach(btn => {
      btn.onclick = () => {
        setKey("cardStyle", btn.dataset.cardStyle);
        panel.querySelectorAll("[data-card-style]").forEach(b => {
          const active = b.dataset.cardStyle === state.cardStyle;
          b.style.background = active ? "rgba(246,242,234,0.15)" : "rgba(246,242,234,0.05)";
          b.style.borderColor = active ? "rgba(246,242,234,0.4)" : "rgba(246,242,234,0.1)";
        });
      };
    });

    panel.querySelectorAll("[data-radius]").forEach(btn => {
      btn.onclick = () => {
        setKey("cardRadius", btn.dataset.radius);
        panel.querySelectorAll("[data-radius]").forEach(b => {
          const active = b.dataset.radius === state.cardRadius;
          b.style.background = active ? "rgba(246,242,234,0.15)" : "rgba(246,242,234,0.05)";
          b.style.borderColor = active ? "rgba(246,242,234,0.4)" : "rgba(246,242,234,0.1)";
        });
      };
    });

    panel.querySelectorAll("[data-accent]").forEach(btn => {
      btn.onclick = () => {
        setKey("accentColor", btn.dataset.accent);
        panel.querySelector("#accent-custom").value = state.accentColor;
        panel.querySelectorAll("[data-accent]").forEach(b => {
          b.style.borderColor = b.dataset.accent === state.accentColor ? "white" : "transparent";
        });
      };
    });

    panel.querySelector("#accent-custom").oninput = (e) => {
      setKey("accentColor", e.target.value);
    };

    panel.querySelector("#show-hours").onchange = (e) => {
      setKey("showHours", e.target.checked);
    };

    panel.querySelector("#tweaks-reset").onclick = () => {
      state = { ...DEFAULTS };
      apply();
      panel.remove();
      panel = null;
      buildPanel();
      show();
    };
  }

  function show() {
    if (!panel) buildPanel();
    panel.style.display = "flex";
    visible = true;
  }

  function hide() {
    if (panel) panel.style.display = "none";
    visible = false;
  }

  // Protocol
  window.addEventListener("message", (e) => {
    if (e.data?.type === "__activate_edit_mode") show();
    if (e.data?.type === "__deactivate_edit_mode") hide();
  });
  window.parent.postMessage({ type: "__edit_mode_available" }, "*");

  apply();
  return { show, hide, setKey };
})();
