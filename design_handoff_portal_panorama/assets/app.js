// App glue — Portal Panorama
window.PP_APP = (() => {
  const $app = () => document.getElementById("app");
  const I = window.PP_ICON;

  function render() {
    const { path, params } = window.PP_ROUTER.parse();
    const P = window.PP_PAGES;
    const E = window.PP_PAGES_EXT;
    // Destroy map if navigating away
    if (window.PP_MAP) window.PP_MAP.destroy();
    let html = "";
    if      (path === "/" || path === "")         html = P.home();
    else if (path === "/buscar")                  html = P.buscar(params);
    else if (path === "/lugar")                   html = P.lugar(params);
    else if (path === "/planes")                  html = P.planes();
    else if (path === "/login")                   html = P.login();
    else if (path === "/sistema")                 html = P.sistema();
    else if (path === "/checkout")                html = E.checkout(params);
    else if (path === "/dashboard-usuario")       html = E.dashUsuario(params);
    else if (path === "/dashboard-negocio")       html = E.dashNegocio(params);
    else if (path === "/perfil-negocio")           html = E.perfilNegocio(params);
    else html = `<div class="container" style="padding:96px 0"><h1>Página no encontrada</h1><a href="#/" class="btn btn--primary">Volver al inicio</a></div>`;

    $app().innerHTML = html;
    $app().classList.remove("page-enter");
    void $app().offsetWidth;
    $app().classList.add("page-enter");
    window.scrollTo(0, 0);
  }

  function searchSubmit(form) {
    const fd = new FormData(form);
    const params = {};
    if (fd.get("q")) params.q = fd.get("q");
    window.PP_ROUTER.go("/buscar", params);
  }

  function toggleFav(id, btnEl) {
    const isOn = window.PP_FAVS.toggle(id);
    if (btnEl) {
      btnEl.classList.toggle("active", isOn);
      btnEl.innerHTML = isOn ? I("heartF", 14) : I("heart", 14);
    }
    toast(isOn ? "Guardado en tus favoritos" : "Quitado de favoritos");
  }

  function createGroup() {
    const name = prompt("Nombre de la nueva lista:", "Mi nueva lista");
    if (!name) return;
    window.PP_PAGES_EXT.GRUPOS.add(name.trim());
    toast("Lista \"" + name + "\" creada");
    render();
  }

  function removeGroup(id) {
    if (!confirm("¿Eliminar esta lista?")) return;
    window.PP_PAGES_EXT.GRUPOS.remove(id);
    toast("Lista eliminada");
    render();
  }

  function renameGroup(id) {
    const g = window.PP_PAGES_EXT.GRUPOS.all().find(x => x.id === id);
    if (!g) return;
    const name = prompt("Nuevo nombre:", g.name);
    if (!name) return;
    g.name = name.trim();
    localStorage.setItem("pp.grupos.v1", JSON.stringify(window.PP_PAGES_EXT.GRUPOS.all()));
    toast("Lista renombrada");
    render();
  }

  function addPlaceToGroup(gid) {
    const names = window.PP_DATA.places.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
    const idx = parseInt(prompt("Elige un lugar (número):\n" + names)) - 1;
    const place = window.PP_DATA.places[idx];
    if (!place) return;
    window.PP_PAGES_EXT.GRUPOS.addPlace(gid, place.id);
    toast(place.name + " agregado a la lista");
    render();
  }

  function removePlaceFromGroup(gid, pid) {
    window.PP_PAGES_EXT.GRUPOS.removePlace(gid, pid);
    render();
  }

  let toastTimer;
  function toast(msg) {
    let el = document.getElementById("pp-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "pp-toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.innerHTML = `${I("check", 14)} ${msg}`;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el && el.remove(), 2400);
  }

  window.PP_ROUTER.on(render);
  if (document.readyState !== "loading") render();
  else document.addEventListener("DOMContentLoaded", render);

  return { searchSubmit, toggleFav, createGroup, removeGroup, renameGroup, addPlaceToGroup, removePlaceFromGroup, toast };
})();
