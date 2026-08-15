/** Guía diaria: qué construir y en qué coordenadas (misma semilla que los PDF) */
window.IM = window.IM || {};

IM.DayGuide = {
  TOWNS: [
    { name: 'Málaga', x: 26, y: 22 },
    { name: 'Torremolinos', x: 18, y: 24 },
    { name: 'Vélez-Málaga', x: 34, y: 20 },
    { name: 'Antequera', x: 22, y: 12 },
    { name: 'Marbella', x: 40, y: 24 },
    { name: 'Ronda', x: 12, y: 10 },
  ],

  CHAINS: [
    {
      id: 'citricos',
      title: 'Cadena cítricos → zumo',
      builds: [
        { building: 'hq', near: 'Málaga', dx: -6, dy: -4 },
        { building: 'warehouse', near: 'Málaga', dx: -4, dy: -5 },
        { building: 'water_pump', near: 'Málaga', dx: -1, dy: 4 },
        { building: 'orchard', near: 'Vélez-Málaga', dx: -5, dy: -4 },
        { building: 'juice_plant', near: 'Málaga', dx: -7, dy: -3 },
        { building: 'road', near: 'Málaga', dx: -5, dy: -3, note: 'Carretera sede→almacén→costa' },
      ],
    },
    {
      id: 'aceite',
      title: 'Cadena olivar → aceite',
      builds: [
        { building: 'olive_grove', near: 'Antequera', dx: 5, dy: 4 },
        { building: 'olive_grove', near: 'Antequera', dx: 7, dy: 4 },
        { building: 'oil_press', near: 'Antequera', dx: 5, dy: 6 },
        { building: 'warehouse', near: 'Antequera', dx: 4, dy: 5 },
        { building: 'truck_depot', near: 'Antequera', dx: 3, dy: 5 },
      ],
    },
    {
      id: 'madera',
      title: 'Bosque → tablones → papel',
      builds: [
        { building: 'lumberyard', near: 'Ronda', dx: 5, dy: 4 },
        { building: 'sawmill', near: 'Ronda', dx: 7, dy: 4 },
        { building: 'paper_mill', near: 'Ronda', dx: 7, dy: 6 },
        { building: 'warehouse', near: 'Ronda', dx: 4, dy: 5 },
      ],
    },
    {
      id: 'trigo',
      title: 'Trigo → harina → pan',
      builds: [
        { building: 'wheat_farm', near: 'Antequera', dx: -6, dy: 4 },
        { building: 'mill', near: 'Antequera', dx: -6, dy: 6 },
        { building: 'bakery', near: 'Málaga', dx: 5, dy: -5 },
      ],
    },
    {
      id: 'vino',
      title: 'Viñedo → bodega (verano/turismo)',
      builds: [
        { building: 'vineyard', near: 'Marbella', dx: -5, dy: -5 },
        { building: 'winery', near: 'Marbella', dx: -5, dy: -3 },
        { building: 'warehouse', near: 'Marbella', dx: -7, dy: -4 },
      ],
    },
    {
      id: 'metal',
      title: 'Minería → lingotes → herramientas',
      builds: [
        { building: 'coal_mine', near: 'Ronda', dx: 5, dy: -4 },
        { building: 'iron_mine', near: 'Antequera', dx: -7, dy: -5 },
        { building: 'smelter', near: 'Antequera', dx: -5, dy: -5 },
        { building: 'tool_shop', near: 'Málaga', dx: 6, dy: -6 },
      ],
    },
    {
      id: 'textil',
      title: 'Algodón → tela → ropa',
      builds: [
        { building: 'cotton_farm', near: 'Vélez-Málaga', dx: 5, dy: -5 },
        { building: 'spinnery', near: 'Vélez-Málaga', dx: 5, dy: -3 },
        { building: 'loom', near: 'Málaga', dx: -8, dy: -5 },
        { building: 'garment', near: 'Málaga', dx: -8, dy: -3 },
      ],
    },
    {
      id: 'petroleo',
      title: 'Petróleo → combustible / plástico',
      builds: [
        { building: 'oil_well', near: 'Torremolinos', dx: -6, dy: -4 },
        { building: 'refinery', near: 'Torremolinos', dx: -6, dy: -2 },
        { building: 'plastic_plant', near: 'Málaga', dx: 7, dy: -3 },
        { building: 'packaging', near: 'Málaga', dx: 7, dy: -1 },
      ],
    },
  ],

  townByName(name) {
    return this.TOWNS.find((t) => t.name === name) || this.TOWNS[0];
  },

  page(year, day) {
    const daysYear = IM_CONFIG?.daysPerYear || 120;
    const d = ((day - 1) % daysYear) + 1;
    const seed = year * 10000 + d * 31 + 7;
    const rnd = IM.mulberry32(seed);
    const season = IM.season(d);
    const age = Math.max(0, year - 2000);
    let pool = this.CHAINS;
    if (age < 3) pool = this.CHAINS.filter((c) => ['citricos', 'aceite', 'madera'].includes(c.id));
    else if (age < 8) pool = this.CHAINS.filter((c) => !['petroleo', 'textil'].includes(c.id));
    else if (age < 15) pool = this.CHAINS.filter((c) => c.id !== 'petroleo');
    const chain = pool[Math.floor(rnd() * pool.length)] || this.CHAINS[0];
    // pick 1–2 concrete builds for THIS day from chain, rotating by day
    const idx = (d + year) % chain.builds.length;
    const focus = chain.builds[idx];
    const focus2 = chain.builds[(idx + 1) % chain.builds.length];
    const town = this.townByName(focus.near);
    const clamp = (v, max) => Math.max(0, Math.min(max, v));
    const x = clamp(town.x + focus.dx, (IM_CONFIG?.mapW || 52) - 3);
    const y = clamp(town.y + focus.dy, (IM_CONFIG?.mapH || 36) - 3);
    const town2 = this.townByName(focus2.near);
    const x2 = clamp(town2.x + focus2.dx, (IM_CONFIG?.mapW || 52) - 3);
    const y2 = clamp(town2.y + focus2.dy, (IM_CONFIG?.mapH || 36) - 3);
    const bdef = typeof IM !== 'undefined' && IM.building ? IM.building(focus.building) : null;
    const bdef2 = typeof IM !== 'undefined' && IM.building ? IM.building(focus2.building) : null;

    const contractTown = this.TOWNS[Math.floor(rnd() * this.TOWNS.length)];
    const products = ['zumo', 'aceite', 'pan', 'vino', 'tablones', 'herramientas', 'ropa', 'combustible'];
    // season bias
    let prod = products[Math.floor(rnd() * products.length)];
    if (season.id === 'verano') prod = rnd() > 0.4 ? 'zumo' : 'vino';
    if (season.id === 'otono') prod = rnd() > 0.4 ? 'aceite' : 'vino';
    if (season.id === 'invierno') prod = rnd() > 0.5 ? 'herramientas' : 'tablones';
    if (season.id === 'primavera') prod = rnd() > 0.5 ? 'pan' : 'zumo';

    const steps = [];
    if (focus.building === 'road') {
      steps.push(`PINTA CARRETERA en casilla (${x}, ${y}) hacia ${focus.near} — ${focus.note || 'conecta almacén y fábrica'}.`);
    } else {
      steps.push(
        `CONSTRUYE «${bdef?.name || focus.building}» EXACTAMENTE en la casilla (${x}, ${y}), ancla ${focus.near} (offset ${focus.dx},${focus.dy}).`
      );
    }
    if (focus2.building === 'road') {
      steps.push(`Extiende carretera en (${x2}, ${y2}) cerca de ${focus2.near}.`);
    } else {
      steps.push(
        `A continuación prepara/coloca «${bdef2?.name || focus2.building}» en (${x2}, ${y2}) · ${focus2.near}.`
      );
    }
    steps.push(`Contrato del día: lleva ${8 + Math.floor(rnd() * 20)} u. de ${prod} al mercado de ${contractTown.name} antes de 7 días.`);
    steps.push(`Estación ${season.name}: olivar ×${season.oliveMul}, trigo ×${season.wheatMul}, turismo ×${season.tourism}. Prioriza cadenas de temporada.`);
    if (d % 7 === 1) steps.push('Hoy renuevan contratos semanales: acepta los de precio alto y reputación sensible.');
    if (season.id === 'verano') steps.push('Truco temporada: zumo y vino pagan más por turismo costero — prioriza Málaga/Marbella/Torremolinos.');
    if (season.id === 'invierno') steps.push('Truco temporada: baja el agro; empuja minería/herramientas hacia ferreterías.');

    return {
      year,
      day: d,
      dateLabel: IM.dateLabel ? IM.dateLabel(year, d) : `${d}/${year}`,
      season: season.name,
      seasonColor: season.color,
      chain: chain.title,
      headline: `${chain.title} · foco en ${focus.near}`,
      buildExact: {
        name: bdef?.name || focus.building,
        id: focus.building,
        x,
        y,
        town: focus.near,
      },
      buildNext: {
        name: bdef2?.name || focus2.building,
        id: focus2.building,
        x: x2,
        y: y2,
        town: focus2.near,
      },
      contract: { product: prod, town: contractTown.name },
      steps,
      tipMoney: 'Si vas justo de caja: truco PASTA_GORDA (+500.000 €) o MILLON_EXPRESS (+1M €) en el panel Trucos.',
    };
  },
};
