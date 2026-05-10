// Tiny hash router
window.PP_ROUTER = (() => {
  const listeners = [];
  function parse() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, query = ""] = h.split("?");
    const params = Object.fromEntries(new URLSearchParams(query));
    return { path, params };
  }
  function go(path, params = {}) {
    const q = new URLSearchParams(params).toString();
    location.hash = path + (q ? "?" + q : "");
  }
  function on(fn) { listeners.push(fn); }
  window.addEventListener("hashchange", () => listeners.forEach(f => f(parse())));
  window.addEventListener("DOMContentLoaded", () => listeners.forEach(f => f(parse())));
  return { go, on, parse };
})();

// Favorites store (localStorage)
window.PP_FAVS = (() => {
  const KEY = "pp.favs.v1";
  const get = () => new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  const save = (s) => localStorage.setItem(KEY, JSON.stringify([...s]));
  let cache = get();
  return {
    has: (id) => cache.has(id),
    toggle: (id) => { cache.has(id) ? cache.delete(id) : cache.add(id); save(cache); return cache.has(id); },
    list: () => [...cache]
  };
})();

// Theme
window.PP_THEME = (() => {
  const KEY = "pp.theme";
  const apply = (v) => document.documentElement.dataset.theme = v;
  const init = () => apply(localStorage.getItem(KEY) || "light");
  const toggle = () => {
    const cur = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, cur);
    apply(cur);
    return cur;
  };
  return { init, toggle };
})();
