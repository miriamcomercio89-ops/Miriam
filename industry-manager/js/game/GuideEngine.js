/** Motor de guía siglo (compartido juego + generador PDF) */
window.IM = window.IM || {};

IM.mulberry32 = function (a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

IM.GuideEngine = {
  ROADMAP: [
    { from: 0, to: 2, ring: 'Málaga y Costa del Sol', focus: 'Agro, lonja, puerto y primera industria ligera' },
    { from: 3, to: 7, ring: 'Andalucía', focus: 'Aceite, vino, metales, cemento y hubs regionales' },
    { from: 8, to: 14, ring: 'España peninsular', focus: 'Corredor mediterráneo, norte industrial y Madrid' },
    { from: 15, to: 24, ring: 'Europa occidental', focus: 'Puertos UE, química, auto y electrónica' },
    { from: 25, to: 39, ring: 'Mediterráneo ampliado', focus: 'Magreb, Adriático, Egeo y cadenas cortas' },
    { from: 40, to: 59, ring: 'Atlántico y América', focus: 'Commodities, graneles y ensamblaje' },
    { from: 60, to: 79, ring: 'Asia-Pacífico', focus: 'Electrónica, semicon, logística container' },
    { from: 80, to: 99, ring: 'Dominio global', focus: 'Cada categoría del catálogo, circularidad y marca' },
  ],

  CITIES: [
    ['Málaga', 36.72, -4.42], ['Sevilla', 37.39, -5.99], ['Algeciras', 36.14, -5.45],
    ['Almería', 36.84, -2.46], ['Granada', 37.18, -3.60], ['Córdoba', 37.89, -4.78],
    ['Cádiz', 36.53, -6.29], ['Huelva', 37.26, -6.95], ['Jaén', 37.77, -3.79],
    ['Valencia', 39.47, -0.38], ['Barcelona', 41.39, 2.17], ['Bilbao', 43.26, -2.93],
    ['Vigo', 42.24, -8.72], ['Madrid', 40.42, -3.70], ['Zaragoza', 41.65, -0.88],
    ['Lisboa', 38.72, -9.14], ['Marsella', 43.30, 5.37], ['Róterdam', 51.92, 4.48],
    ['Hamburgo', 53.55, 9.99], ['Génova', 44.41, 8.93], ['Nápoles', 40.85, 14.27],
    ['Atenas', 37.98, 23.73], ['Casablanca', 33.57, -7.59], ['Tánger', 35.76, -5.83],
    ['Estambul', 41.01, 28.98], ['Nueva York', 40.71, -74.01], ['Santos', -23.96, -46.33],
    ['Houston', 29.76, -95.37], ['Shanghái', 31.23, 121.47], ['Singapur', 1.35, 103.82],
    ['Busán', 35.18, 129.08], ['Tokio', 35.68, 139.69], ['Dubái', 25.20, 55.27],
    ['Ciudad del Cabo', -33.92, 18.42], ['Sídney', -33.87, 151.21],
  ],

  ACTIONS: [
    'Construye tipología única (tienda por pestañas)',
    'Instala máquina + receta en un hueco libre',
    'Compra inputs baratos en bolsa / mercado',
    'Vende excedente con calidad ≥ objetivo',
    'Abre o refuerza ruta logística desde la ciudad ancla',
    'Investiga una tech alineada con el foco del día',
    'Revisa OEE y cuellos de botella de la planta',
    'Firma o cumple un contrato B2B',
    'Reduce polución / gana créditos verdes',
    'Crea o especializa una filial',
    'Exporta vía hub portuario o ferroviario',
    'Automatiza compra/venta del ítem foco',
  ],

  ringForYear(year) {
    const y = Math.max(0, (year || 2000) - 2000);
    return this.ROADMAP.find((r) => y >= r.from && y <= r.to) || this.ROADMAP[this.ROADMAP.length - 1];
  },

  page(year, dayOfYear, game) {
    const days = IM.daysInYear(year);
    const day = Math.min(Math.max(1, dayOfYear || 1), days);
    const seed = year * 10000 + day * 17 + 2000;
    const rnd = IM.mulberry32(seed);
    const ring = this.ringForYear(year);
    const city = this.CITIES[Math.floor(rnd() * Math.min(this.CITIES.length, 6 + Math.floor((year - 2000) / 3)))];
    const items = (typeof IM_DATA !== 'undefined' && IM_DATA.items) || [];
    const pickItems = [];
    if (items.length) {
      const n = 4 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const it = items[Math.floor(rnd() * items.length)];
        if (it && !pickItems.find((x) => x.id === it.id)) pickItems.push(it);
      }
    }
    // Cobertura de catálogo: índice global día absoluto
    const absDay = (year - 2000) * 366 + day;
    const coverIdx = items.length ? absDay % items.length : 0;
    const coverItem = items[coverIdx];
    if (coverItem && !pickItems.find((x) => x.id === coverItem.id)) pickItems.unshift(coverItem);

    const buildings = (typeof IM_DATA !== 'undefined' && IM_DATA.buildings) || [];
    const b1 = buildings[Math.floor(rnd() * Math.max(1, buildings.length))];
    const b2 = buildings[Math.floor(rnd() * Math.max(1, buildings.length))];
    const actions = [];
    const used = new Set();
    while (actions.length < 4) {
      const a = this.ACTIONS[Math.floor(rnd() * this.ACTIONS.length)];
      if (!used.has(a)) {
        used.add(a);
        actions.push(a);
      }
    }
    const dt = IM.dateFromDayOfYear(year, day);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mood = ['agresivo mercado', 'consolidación', 'expansión geográfica', 'calidad total', 'logística', 'I+D', 'circular'][Math.floor(rnd() * 7)];

    return {
      year,
      day,
      dateLabel: `${dt.day} de ${months[dt.month - 1]} de ${year}`,
      ring: ring.ring,
      ringFocus: ring.focus,
      city: city[0],
      cityLat: city[1],
      cityLng: city[2],
      mood,
      items: pickItems.map((i) => ({ id: i.id, name: i.name, category: i.category })),
      coverItem: coverItem ? { id: coverItem.id, name: coverItem.name } : null,
      buildings: [b1, b2].filter(Boolean).map((b) => ({ id: b.id, name: b.name, category: b.category })),
      actions,
      tip: `Parte desde Málaga históricamente; hoy ancla operativa sugerida: ${city[0]}. Variedad del día: modo ${mood}.`,
      companyAge: game?.companyYearsElapsed?.() ?? Math.max(0, year - 2000),
    };
  },
};
