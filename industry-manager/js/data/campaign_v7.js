/** Datos v7: escenarios sandbox, eventos políticos, tutorial steps */
window.IM_DATA = window.IM_DATA || {};

window.IM_DATA.buildingCategoryLabel = {
  extraccion: 'Extracción',
  procesado: 'Procesado',
  quimica: 'Química & farma',
  alimentacion: 'Alimentación',
  energia: 'Energía',
  alta_tech: 'Alta tecnología',
  logistica: 'Logística',
  reciclaje: 'Reciclaje',
  investigacion: 'I+D',
  admin: 'Administración',
};

window.IM_DATA.sandboxScenarios = [
  {
    id: 'sandbox_libre',
    name: 'Sandbox libre',
    blurb: 'Sin arco de campaña. Dinero alto, todo desbloqueado.',
    unlockChapter: 24,
    money: 500000000,
    unlockAll: true,
    chapter: 24,
  },
  {
    id: 'sandbox_crisis',
    name: 'Crisis energética',
    blurb: 'Electricidad cara, hay que pivota a renovables.',
    unlockChapter: 20,
    money: 80000000,
    unlockAll: false,
    chapter: 10,
    flags: { energyCrisis: true },
  },
  {
    id: 'sandbox_export',
    name: 'Rey del export',
    blurb: 'Empiezas con hub portuario y foco exportador.',
    unlockChapter: 15,
    money: 150000000,
    unlockAll: false,
    chapter: 8,
    flags: { exportKing: true },
  },
  {
    id: 'sandbox_andaluz',
    name: 'Solo Andalucía',
    blurb: 'Agro, vino, corcho e ibéricos. Resto penalizado.',
    unlockChapter: 12,
    money: 120000000,
    unlockAll: false,
    chapter: 6,
    branch: 'agro_andaluz',
    flags: { andaluciaOnly: true },
  },
];

window.IM_DATA.politicalEvents = [
  { id: 'subv_verde', title: 'Subvención verde', text: 'El Estado bonifica renovables y reciclaje.', effect: { greenCredit: 250000, pollutionMul: 0.9 } },
  { id: 'arancel_metales', title: 'Arancel a metales', text: 'Suben aranceles: metales más caros de importar, mejor vender local.', effect: { categoryPrice: { metales: 1.12, minerales: 1.08 } } },
  { id: 'iva_consumo', title: 'Subida IVA consumo', text: 'La demanda de consumo se enfría.', effect: { categoryDemand: { consumo: 0.85, hogar_smart: 0.9 } } },
  { id: 'plan_chips', title: 'Plan chips nacional', text: 'Ayudas a semiconductores y electrónica.', effect: { money: 400000, categoryPrice: { electronica: 1.1 } } },
  { id: 'huelga_transporte', title: 'Huelga de transporte', text: 'La logística se encarece una semana.', effect: { freightMul: 1.4, days: 7 } },
  { id: 'derechos_agua', title: 'Restricción de agua', text: 'Coste del agua industrial al alza.', effect: { waterMul: 1.35, days: 10 } },
  { id: 'fondo_agro', title: 'Fondo agro', text: 'Pagos directos al sector agrícola.', effect: { money: 180000, categoryPrice: { agricolas: 1.06, alimentacion: 1.04 } } },
  { id: 'impuesto_carbono', title: 'Impuesto al carbono', text: 'Multas por contaminación más duras.', effect: { pollutionFineMul: 1.5 } },
  { id: 'apertura_comercial', title: 'Apertura comercial', text: 'Bajan aranceles: boom export.', effect: { exportMul: 1.12 } },
  { id: 'rescate_pyme', title: 'Línea ICO express', text: 'Crédito blando disponible (rating +).', effect: { creditRating: 5, money: 100000 } },
];

window.IM_DATA.tutorialSteps = [
  { id: 'welcome', title: 'Bienvenida', body: 'Industry Manager es una campaña industrial de décadas. Empiezas con 100 M€ y cero plantas. Este tutorial te guía la primera hora.', panel: null, action: null },
  { id: 'branch', title: 'Elige rama', body: 'Agro andaluz, Acero o Chips. Marca misiones y el tono de la campaña. Si ya elegiste, pulsa Siguiente.', panel: 'campana', check: (g) => !!g.state.campaignBranch },
  { id: 'map', title: 'Fundá en el mapa', body: 'Ve a Mapa y haz click en una ciudad real (OSM). Andalucía para agro, costa para puerto, capital = suelo caro.', panel: 'mapa', check: (g) => g.state.sites.length > 0 },
  { id: 'filial', title: 'Filial especializada', body: 'En Filiales, crea o confirma la especialización de tu primera planta.', panel: 'filiales', check: (g) => Object.keys(g.state.subsidiaries || {}).length > 0 },
  { id: 'build', title: 'Construye', body: 'En Industria, filtra por tipo y construye un edificio con logo. Hay cientos, ordenados por categoría.', panel: 'industria', check: (g) => g.state.sites.some((s) => s.buildings.length > 1) },
  { id: 'machine', title: 'Instala máquina', body: 'Abre un edificio, instala máquina + receta en un hueco. ¡Sin esto no produces!', panel: 'industria', check: (g) => g.state.sites.some((s) => s.buildings.some((b) => (b.slots || []).some(Boolean))) },
  { id: 'market', title: 'Mercado', body: 'Compra inputs o vende outputs. Cada producto tiene su logo. Prueba el Comparador.', panel: 'mercado', check: (g) => (g.state.stats?.revenue || 0) > 0 || Object.keys(g.state.soldLifetime || {}).length > 0 },
  { id: 'coach', title: '¿Qué hago?', body: 'Si te pierdes, abre ¿Qué hago? o mira el dock inferior. El Consejo vota prioridades semanales.', panel: 'coach' },
  { id: 'cloud', title: 'Guardado nube', body: 'En Ajustes → Nube: crea cuenta local, sube/descarga partidas. También tienes códigos IM6.', panel: 'ajustes' },
  { id: 'done', title: '¡Listo!', body: 'La campaña dura años (24 capítulos). Al llegar lejos desbloqueas escenarios sandbox. ¡Buena industria!', panel: 'campana' },
];
