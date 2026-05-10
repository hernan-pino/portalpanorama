// Inline SVG icon set — minimal line, currentColor stroke
window.PP_ICON = (name, size = 18) => {
  const paths = {
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>',
    pin:    '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    star:   '<path d="m12 3 2.6 5.6 6 .9-4.3 4.3 1 6.2-5.3-2.9-5.3 2.9 1-6.2L3.4 9.5l6-.9L12 3Z"/>',
    starF:  '<path d="m12 3 2.6 5.6 6 .9-4.3 4.3 1 6.2-5.3-2.9-5.3 2.9 1-6.2L3.4 9.5l6-.9L12 3Z" fill="currentColor"/>',
    heart:  '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>',
    heartF: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" fill="currentColor"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    arrowR: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    arrowUR:'<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
    arrowD: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
    chev:   '<path d="m6 9 6 6 6-6"/>',
    close:  '<path d="m6 6 12 12M18 6 6 18"/>',
    menu:   '<path d="M4 7h16M4 12h16M4 17h16"/>',
    clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone:  '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    web:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    share:  '<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 11 8-4M8 13l8 4"/>',
    grid:   '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    map:    '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v16M15 6v16"/>',
    filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    check:  '<path d="m5 12 5 5 9-11"/>',
    plus:   '<path d="M12 5v14M5 12h14"/>',
    sun:    '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5"/>',
    moon:   '<path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z"/>',
    sparkle:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m6 6 3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    spark:  '<path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z"/>',
    /* category icons (line, currentColor) */
    catRest: '<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M11 3v8"/><path d="M7 3v8"/><path d="M17 3c-1.5 1-2 3-2 5s.5 3 2 4v9"/>',
    catBar:  '<path d="M5 3h14l-6 8v8"/><path d="M9 19h8"/><path d="M11 11h4"/>',
    catCafe: '<path d="M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3"/>',
    catMus:  '<path d="m4 9 8-5 8 5v11H4z"/><path d="M4 20h16"/><path d="M9 20v-7M15 20v-7M12 20v-9"/>',
    catPark: '<path d="M12 3 6 13h4l-2 5h8l-2-5h4z"/><path d="M12 18v3"/>',
    catEvt:  '<rect x="4" y="6" width="16" height="15" rx="1"/><path d="M4 11h16"/><path d="M9 3v5M15 3v5"/>',
    catNoct: '<path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z"/><circle cx="17" cy="6" r="0.8" fill="currentColor"/><circle cx="13" cy="4" r="0.6" fill="currentColor"/>',
    catOut:  '<path d="m3 19 5-7 4 5 3-3 6 5"/><circle cx="17" cy="6" r="2"/>',
  };
  const inner = paths[name] || '';
  const cls = size === 14 ? 'ico ico-sm' : size === 22 ? 'ico ico-lg' : 'ico';
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
};
