/** Campaña v4: briefings, ramas, miles de misiones */
window.IM_DATA = window.IM_DATA || {};

window.IM_DATA.campaignBranches = [
  {
    id: 'agro_andaluz',
    name: 'Agro andaluz',
    blurb: 'Aceituna, aceite, cítricos y exportación mediterránea.',
    color: '#5B8C3E',
    focuses: ['agricolas', 'alimentacion', 'agroquimicos'],
    starterHint: 'Fundá en Andalucía (Sevilla, Jaén, Córdoba, Málaga…).',
  },
  {
    id: 'acero_industrial',
    name: 'Acero e industria',
    blurb: 'Minería, fundición, laminados y bienes de capital.',
    color: '#64748B',
    focuses: ['minerales', 'metales', 'mecanicos', 'bienes_capital'],
    starterHint: 'Busca zonas mineras o industriales (Bilbao, Asturias, Ruhr…).',
  },
  {
    id: 'chips_baterias',
    name: 'Chips y baterías',
    blurb: 'Semiconductores, electrónica y almacenamiento energético.',
    color: '#2563EB',
    focuses: ['electronica', 'quimicos', 'energia'],
    starterHint: 'Hubs tecnológicos y zonas con sílice / litio.',
  },
];

window.IM_DATA.campaignChapters = [
  {
    id: 1,
    name: 'Fundación',
    briefing:
      'Tu corporación acaba de nacer con capital sobrado y cero plantas. Elige una especialización y planta tu primera bandera en el mapa real.',
    goal: 'Fundar la primera planta y elegir rama.',
    unlocks: ['build', 'market', 'branch'],
  },
  {
    id: 2,
    name: 'Primera cadena',
    briefing:
      'Sin cadena no hay industria. Completa el flujo básico de tu rama y demuestra que sabes transformar materia prima.',
    goal: 'Avanzar la cadena principal de tu rama.',
    unlocks: ['chains', 'logistics', 'parcels'],
  },
  {
    id: 3,
    name: 'Clientes y reputación',
    briefing:
      'Los pedidos B2B llegan. Cumple calidad y plazos: la reputación abre mejores contratos.',
    goal: 'Cumplir pedidos B2B y subir reputación.',
    unlocks: ['b2b', 'reputation', 'bolsa'],
  },
  {
    id: 4,
    name: 'Automatización',
    briefing:
      'Escala sin ahogarte en microgestión. Blueprints, mantenimiento y expansión automática.',
    goal: 'Automatizar líneas y mantener OEE alto.',
    unlocks: ['blueprints', 'maintenance', 'auto_expand'],
  },
  {
    id: 5,
    name: 'Globalización',
    briefing:
      'Clima, divisas y políticas nacionales entran en juego. Opera como un grupo multinacional.',
    goal: 'Expandirte y dominar tu sector.',
    unlocks: ['fx', 'seasons', 'semis', 'climate'],
  },
  {
    id: 6,
    name: 'Campeón industrial',
    briefing:
      'Eres un actor global. Optimiza margen, reduce contaminación y cierra las grandes cadenas.',
    goal: 'Dominio de mercado y excelencia operativa.',
    unlocks: ['endgame'],
  },
];

// Keep existing productChains / b2b / fx / policies if already defined by merging below
window.IM_DATA.productChains = window.IM_DATA.productChains || [];
window.IM_DATA.b2bClients = window.IM_DATA.b2bClients || [];
window.IM_DATA.fxRates = window.IM_DATA.fxRates || { EUR: 1, USD: 0.92, GBP: 1.17, JPY: 0.0061, CNY: 0.13, BRL: 0.16 };
window.IM_DATA.countryPolicies = window.IM_DATA.countryPolicies || {
  ES: { subsidyAgro: 0.08, subsidyGreen: 0.1, tariffExtra: 0, name: 'España' },
  DE: { subsidyAgro: 0.05, subsidyGreen: 0.12, tariffExtra: 0, name: 'Alemania' },
  US: { subsidyAgro: 0.06, subsidyGreen: 0.05, tariffExtra: 0.02, name: 'EE.UU.' },
  CN: { subsidyAgro: 0.04, subsidyGreen: 0.08, tariffExtra: 0.03, name: 'China' },
  DEFAULT: { subsidyAgro: 0.03, subsidyGreen: 0.04, tariffExtra: 0.02, name: 'Genérico' },
};

/** Genera miles de misiones de campaña con progresión por capítulo y rama */
(function buildCampaignMissions() {
  const branches = window.IM_DATA.campaignBranches;
  const verbs = [
    { type: 'produce', label: 'Producir' },
    { type: 'sell', label: 'Vender' },
    { type: 'stock', label: 'Acumular' },
    { type: 'build', label: 'Construir' },
    { type: 'research', label: 'Investigar' },
    { type: 'profit', label: 'Beneficio' },
    { type: 'transport', label: 'Transportar' },
    { type: 'quality', label: 'Calidad' },
    { type: 'employees', label: 'Plantilla' },
    { type: 'site_count', label: 'Expandir' },
    { type: 'reputation', label: 'Reputación B2B' },
    { type: 'chain_step', label: 'Avanzar cadena' },
  ];
  const buildings = ['mina', 'granja', 'fundicion', 'almazara', 'planta_quimica', 'electronica', 'almacen', 'reciclaje', 'parque_solar'];
  const techs = ['metalurgia_basica', 'quimica_basica', 'polimeros', 'electronica_basica', 'baterias', 'semiconductores', 'reciclaje', 'automatizacion', 'bolsa_materias'];

  const missions = [];
  let id = 0;
  for (let chapter = 1; chapter <= 60; chapter++) {
    for (let branchIdx = 0; branchIdx < branches.length; branchIdx++) {
      const branch = branches[branchIdx];
      for (let n = 0; n < 45; n++) {
        id++;
        const verb = verbs[n % verbs.length];
        const focusCat = branch.focuses[n % branch.focuses.length];
        let title;
        let requirement;
        let reward;
        const scale = chapter * (1 + Math.floor(n / 10));

        if (verb.type === 'produce' || verb.type === 'sell' || verb.type === 'stock' || verb.type === 'transport' || verb.type === 'quality') {
          title = `Cap.${chapter} [${branch.name}]: ${verb.label} lote #${n + 1} (${focusCat})`;
          requirement = {
            type: verb.type,
            category: focusCat,
            qty: verb.type === 'quality' ? undefined : 5 * scale,
            quality: verb.type === 'quality' ? 50 + (chapter % 40) : undefined,
            // item resolved at runtime by category if item missing
            item: null,
          };
          reward = { money: 8000 * chapter + n * 200, xp: 40 + chapter * 8 };
        } else if (verb.type === 'build') {
          const b = buildings[n % buildings.length];
          title = `Cap.${chapter} [${branch.name}]: Construir ${b.replace(/_/g, ' ')}`;
          requirement = { type: 'build', building: b, qty: 1 + Math.floor(chapter / 15) };
          reward = { money: 20000 * chapter, xp: 60 + chapter * 10 };
        } else if (verb.type === 'research') {
          const t = techs[n % techs.length];
          title = `Cap.${chapter} [${branch.name}]: Investigar ${t.replace(/_/g, ' ')}`;
          requirement = { type: 'research', tech: t };
          reward = { money: 25000 * chapter, xp: 80 + chapter * 12 };
        } else if (verb.type === 'profit') {
          title = `Cap.${chapter} [${branch.name}]: Beneficio ${scale * 20000} €`;
          requirement = { type: 'profit', amount: scale * 20000 };
          reward = { money: scale * 3000, xp: 70 + chapter * 10 };
        } else if (verb.type === 'employees') {
          title = `Cap.${chapter} [${branch.name}]: Plantilla ${10 * scale}`;
          requirement = { type: 'employees', qty: 10 * scale };
          reward = { money: 5000 * chapter, xp: 50 };
        } else if (verb.type === 'site_count') {
          title = `Cap.${chapter} [${branch.name}]: Tener ${1 + Math.floor(chapter / 8)} plantas`;
          requirement = { type: 'site_count', qty: 1 + Math.floor(chapter / 8) };
          reward = { money: 30000 * chapter, xp: 90 };
        } else if (verb.type === 'reputation') {
          title = `Cap.${chapter} [${branch.name}]: Reputación B2B ${40 + chapter}`;
          requirement = { type: 'reputation', amount: 40 + chapter };
          reward = { money: 15000 * chapter, xp: 70 };
        } else {
          title = `Cap.${chapter} [${branch.name}]: Avanzar cadena`;
          requirement = { type: 'chain_step', amount: 1 + Math.floor(n / 20) };
          reward = { money: 18000 * chapter, xp: 100 };
        }

        missions.push({
          id: `cm_${id}`,
          chapter,
          branch: branch.id,
          order: n,
          title,
          description: `Misión de campaña ${id}. Progresión del capítulo ${chapter} · rama ${branch.name}.`,
          briefing: chapter <= 6 ? (window.IM_DATA.campaignChapters.find((c) => c.id === chapter)?.briefing || '') : '',
          requirement,
          reward,
          unlocks: [],
        });
      }
    }
  }
  // 60 * 3 * 45 = 8100 missions
  window.IM_DATA.campaignMissions = missions;
})();
