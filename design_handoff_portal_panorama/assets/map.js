// Portal Panorama — Mapa con clusters (Leaflet + MarkerCluster)
window.PP_MAP = (() => {
  // Coordenadas aproximadas por barrio en Santiago
  const COORDS = {
    "Lastarria":   [-33.4372, -70.6370],
    "Bellavista":  [-33.4274, -70.6384],
    "Providencia": [-33.4321, -70.6112],
    "Italia":      [-33.4352, -70.6250],
    "Ñuñoa":       [-33.4558, -70.6010],
    "Vitacura":    [-33.3985, -70.5860],
    "Las Condes":  [-33.4149, -70.5748],
    "Yungay":      [-33.4452, -70.6710],
    "Brasil":      [-33.4432, -70.6680],
    "Centro":      [-33.4378, -70.6504],
    "Franklin":    [-33.4671, -70.6492],
  };

  // Variación aleatoria (seeded por id) para no apilar todos en el mismo punto
  function jitter(str, base) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return base + ((h % 100) - 50) * 0.0012;
  }

  const catAbbr = {
    "Restaurantes": "RS",
    "Bares":        "BR",
    "Cafés":        "CF",
    "Museos":       "MU",
    "Parques":      "PQ",
    "Eventos":      "EV",
    "Vida nocturna":"NO",
    "Panoramas al aire libre": "AL",
    "Panoramas":    "AL",
  };

  let map = null;
  let clusterGroup = null;

  function init(containerId, places, onPlaceClick) {
    if (map) { map.remove(); map = null; }

    const el = document.getElementById(containerId);
    if (!el) return;

    // Santiago center
    map = L.map(containerId, {
      center: [-33.437, -70.634],
      zoom: 13,
      zoomControl: false,
    });

    // OSM tiles — warm style
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Cluster group
    clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 36 : count < 30 ? 44 : 52;
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:#14110F;color:#F6F2EA;
            display:flex;align-items:center;justify-content:center;
            font-family:'Fraunces',serif;font-size:${size > 40 ? 16 : 14}px;font-style:italic;
            border:2px solid #F6F2EA;
            box-shadow:0 2px 12px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size/2, size/2],
        });
      },
    });

    places.forEach(p => {
      const base = COORDS[p.neighborhood] || COORDS["Centro"];
      const lat = jitter(p.id + "lat", base[0]);
      const lng = jitter(p.id + "lng", base[1]);
      const abbr = catAbbr[p.category] || "??";

      const icon = L.divIcon({
        html: `<div class="pp-marker ${p.premium ? 'premium' : ''}" title="${p.name}">${abbr}</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([lat, lng], { icon });

      const popup = L.popup({ maxWidth: 240, minWidth: 240, closeButton: true })
        .setContent(`
          <div class="pp-popup">
            <div class="pp-popup__img">
              <span class="pp-popup__img-label">${p.cover}</span>
              ${p.premium ? `<span class="premium-badge" style="position:absolute;top:8px;left:8px;background:var(--paper-00)">Premium</span>` : ""}
            </div>
            <div class="pp-popup__body">
              <div class="pp-popup__meta">${p.category} · ${p.neighborhood}</div>
              <h3 class="pp-popup__name">${p.name}</h3>
              <div class="pp-popup__row">
                <svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#E08450"><path d="m12 3 2.6 5.6 6 .9-4.3 4.3 1 6.2-5.3-2.9-5.3 2.9 1-6.2L3.4 9.5l6-.9L12 3Z" fill="currentColor"/></svg>
                <strong>${p.rating.toFixed(1)}</strong>
                <span>(${p.reviews})</span>
                <span>·</span>
                <span>${p.price}</span>
              </div>
              <div class="pp-popup__row" style="margin-top:4px;color:var(--success,#3a7a4a)">
                ${p.hours.split('·')[0].trim()}
              </div>
            </div>
            <a href="#/lugar?id=${p.id}" class="pp-popup__cta" onclick="document.querySelector('.leaflet-popup-close-button')?.click()">Ver ficha completa →</a>
          </div>
        `);

      marker.bindPopup(popup);
      if (onPlaceClick) marker.on("click", () => onPlaceClick(p.id));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
  }

  function highlightPlace(id) {
    // Optionally pan to a place
    const p = window.PP_DATA.places.find(x => x.id === id);
    if (!p || !map) return;
    const base = COORDS[p.neighborhood] || COORDS["Centro"];
    const lat = jitter(p.id + "lat", base[0]);
    const lng = jitter(p.id + "lng", base[1]);
    map.setView([lat, lng], 15, { animate: true, duration: 0.5 });
  }

  function destroy() {
    if (map) { map.remove(); map = null; clusterGroup = null; }
  }

  return { init, highlightPlace, destroy };
})();
