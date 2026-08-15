/** Campaña v6: arco multi-año profundo + índices + consejo */
window.IM_DATA = window.IM_DATA || {};

/** 24 capítulos narrativos pensados para durar muchos años de juego */
window.IM_DATA.campaignChapters = [
  { id: 1, yearTarget: 0, era: 'Arranque', name: 'Fundación', briefing: 'Año 0. Capital sobrado, cero plantas. Elige rama y clava la primera bandera.', goal: 'Fundar y elegir especialización.', unlocks: ['build', 'market', 'branch'] },
  { id: 2, yearTarget: 0, era: 'Arranque', name: 'Primera cadena', briefing: 'Demuestra que sabes transformar materia prima en producto.', goal: 'Avanzar cadena de rama.', unlocks: ['chains', 'logistics', 'parcels'] },
  { id: 3, yearTarget: 1, era: 'Arranque', name: 'Clientes y caja', briefing: 'Primer año fiscal. Los B2B miden tu reputación.', goal: 'Pedidos B2B y tesorería sana.', unlocks: ['b2b', 'reputation', 'bolsa'] },
  { id: 4, yearTarget: 1, era: 'Escalado', name: 'Filiales', briefing: 'Una sola planta no basta. Especializa filiales.', goal: 'Crear filiales con foco.', unlocks: ['filiales'] },
  { id: 5, yearTarget: 2, era: 'Escalado', name: 'Automatización', briefing: 'Sin automatizar, el crecimiento te come.', goal: 'Blueprints y OEE.', unlocks: ['blueprints', 'maintenance', 'auto_expand'] },
  { id: 6, yearTarget: 2, era: 'Escalado', name: 'Hubs y export', briefing: 'Puertos y aeropuertos abren el mundo.', goal: 'Exportar desde un hub.', unlocks: ['export', 'climate'] },
  { id: 7, yearTarget: 3, era: 'Grupo', name: 'Consejo de administración', briefing: 'El consejo vota prioridades cada semana de juego.', goal: 'Usar el consejo semanal.', unlocks: ['board', 'fx'] },
  { id: 8, yearTarget: 3, era: 'Grupo', name: 'Crédito y covenants', briefing: 'La banca te mira el rating. Cumple covenants.', goal: 'Gestionar deuda sana.', unlocks: ['credit'] },
  { id: 9, yearTarget: 4, era: 'Grupo', name: 'Franquicias', briefing: 'Grandes cuentas: volumen a cambio de disciplina.', goal: 'Firmar una franquicia.', unlocks: ['franchises'] },
  { id: 10, yearTarget: 5, era: 'Nacional', name: 'Campeón nacional', briefing: 'Cinco años. Domina tu sector en el país.', goal: 'Liderazgo nacional.', unlocks: ['national'] },
  { id: 11, yearTarget: 6, era: 'Nacional', name: 'Diversificación', briefing: 'Un solo foco es riesgo. Abre una segunda vertical.', goal: 'Segunda especialidad activa.', unlocks: ['diversify'] },
  { id: 12, yearTarget: 7, era: 'Nacional', name: 'Calidad total', briefing: 'La calidad se convierte en marca país.', goal: 'Calidad media alta sostenida.', unlocks: ['quality'] },
  { id: 13, yearTarget: 8, era: 'Europa', name: 'Puente europeo', briefing: 'Divisas, normas y clientes UE.', goal: 'Operar multi-país UE.', unlocks: ['europe'] },
  { id: 14, yearTarget: 9, era: 'Europa', name: 'I+D profundo', briefing: 'Sin I+D te quedas en commodity.', goal: 'Tech tree avanzado.', unlocks: ['rnd'] },
  { id: 15, yearTarget: 10, era: 'Europa', name: 'Década', briefing: 'Diez años de corporación. Celebra… y aprieta.', goal: 'Supervivencia década.', unlocks: ['decade'] },
  { id: 16, yearTarget: 11, era: 'Global', name: 'Cadenas globales', briefing: 'Inputs de un continente, ventas de otro.', goal: 'Cadena intercontinental.', unlocks: ['global_chain'] },
  { id: 17, yearTarget: 12, era: 'Global', name: 'Índices y bolsa', briefing: 'Los índices sectoriales guían tu estrategia.', goal: 'Dominar índices clave.', unlocks: ['indices'] },
  { id: 18, yearTarget: 13, era: 'Global', name: 'Economía circular', briefing: 'Residuos que vuelven como margen.', goal: 'Reciclaje rentable.', unlocks: ['circular'] },
  { id: 19, yearTarget: 14, era: 'Global', name: 'Marca industrial', briefing: 'Tu nombre vale casi tanto como tus plantas.', goal: 'Reputación global.', unlocks: ['brand'] },
  { id: 20, yearTarget: 15, era: 'Leyenda', name: 'Quince años', briefing: 'Pocas corporaciones llegan aquí sin quebrarse.', goal: 'Estabilidad quinceañera.', unlocks: ['legacy'] },
  { id: 21, yearTarget: 16, era: 'Leyenda', name: 'Conglomerado', briefing: 'Múltiples filiales, un solo holding.', goal: 'Holding diversificado.', unlocks: ['holding'] },
  { id: 22, yearTarget: 18, era: 'Leyenda', name: 'Resiliencia', briefing: 'Crisis, noticias y clima: sobrevive al ciclo.', goal: 'Agonitar una crisis.', unlocks: ['resilience'] },
  { id: 23, yearTarget: 20, era: 'Leyenda', name: 'Veinte años', briefing: 'Una generación industrial. El mapa es tuyo.', goal: 'Imperio de 20 años.', unlocks: ['empire'] },
  { id: 24, yearTarget: 25, era: 'Eternidad', name: 'Dinastía industrial', briefing: 'Más allá de una vida laboral. Dejas escuela.', goal: 'Dinastía a 25 años.', unlocks: ['endgame', 'dynasty'] },
];

window.IM_DATA.sectorIndices = [
  { id: 'idx_agro', name: 'Índice Agro', categories: ['agricolas', 'alimentacion', 'agroquimicos', 'vitivinicultura', 'corcho_iberico'], color: '#5B8C3E' },
  { id: 'idx_metales', name: 'Índice Metales', categories: ['minerales', 'metales', 'mecanicos', 'bienes_capital'], color: '#64748B' },
  { id: 'idx_chips', name: 'Índice Tech', categories: ['electronica', 'software_ind', 'renovables_eq', 'instrumentos'], color: '#2563EB' },
  { id: 'idx_energia', name: 'Índice Energía', categories: ['energia', 'renovables_eq'], color: '#E6A817' },
  { id: 'idx_consumo', name: 'Índice Consumo', categories: ['consumo', 'textiles', 'mobiliario', 'cosmetica', 'hogar_smart'], color: '#F43F5E' },
];

window.IM_DATA.boardMotions = [
  { id: 'expand', name: 'Priorizar expansión', effect: { buildCostMul: 0.92, wageMul: 1.02 }, blurb: 'Suelo y obras más baratas; salarios un poco al alza.' },
  { id: 'quality', name: 'Priorizar calidad', effect: { qualityBonus: 4, speedMul: 0.95 }, blurb: 'Mejor calidad, ritmo algo más lento.' },
  { id: 'export', name: 'Priorizar exportación', effect: { exportMul: 1.08, domesticMul: 0.97 }, blurb: 'Más prima en hubs; mercado local flojea.' },
  { id: 'rnd', name: 'Priorizar I+D', effect: { researchMul: 1.2, cashDrain: 8000 }, blurb: 'I+D más rápido; gasto fijo diario.' },
  { id: 'green', name: 'Priorizar sostenibilidad', effect: { pollutionMul: 0.85, energyMul: 1.05 }, blurb: 'Menos multas; energía algo más cara.' },
  { id: 'austerity', name: 'Austeridad', effect: { wageMul: 0.92, moraleRisk: true }, blurb: 'Ahorro salarial; riesgo de huelga.' },
];

/** Regenera misiones profundas: 100 caps × 3 ramas × 50 = 15000 */
(function buildDeepCampaignMissions() {
  const branches = window.IM_DATA.campaignBranches || [];
  if (!branches.length) return;
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
  for (let chapter = 1; chapter <= 100; chapter++) {
    for (let bi = 0; bi < branches.length; bi++) {
      const branch = branches[bi];
      for (let n = 0; n < 50; n++) {
        id++;
        const verb = verbs[n % verbs.length];
        const focusCat = branch.focuses[n % branch.focuses.length];
        const scale = chapter * (1 + Math.floor(n / 10));
        let title;
        let requirement;
        let reward;
        if (verb.type === 'produce' || verb.type === 'sell' || verb.type === 'stock' || verb.type === 'transport' || verb.type === 'quality') {
          title = `Año~${Math.floor(chapter / 4)} Cap.${chapter} [${branch.name}]: ${verb.label} #${n + 1}`;
          requirement = {
            type: verb.type,
            category: focusCat,
            qty: verb.type === 'quality' ? undefined : 8 * scale,
            quality: verb.type === 'quality' ? 50 + (chapter % 45) : undefined,
            item: null,
          };
          reward = { money: 12000 * chapter + n * 300, xp: 50 + chapter * 10 };
        } else if (verb.type === 'build') {
          const b = buildings[n % buildings.length];
          title = `Cap.${chapter} [${branch.name}]: Construir ${b.replace(/_/g, ' ')}`;
          requirement = { type: 'build', building: b, qty: 1 + Math.floor(chapter / 20) };
          reward = { money: 25000 * chapter, xp: 70 + chapter * 12 };
        } else if (verb.type === 'research') {
          const t = techs[n % techs.length];
          title = `Cap.${chapter} [${branch.name}]: I+D ${t.replace(/_/g, ' ')}`;
          requirement = { type: 'research', tech: t };
          reward = { money: 30000 * chapter, xp: 90 + chapter * 14 };
        } else if (verb.type === 'profit') {
          title = `Cap.${chapter} [${branch.name}]: Beneficio ${scale * 35000} €`;
          requirement = { type: 'profit', amount: scale * 35000 };
          reward = { money: scale * 4000, xp: 80 + chapter * 12 };
        } else if (verb.type === 'employees') {
          title = `Cap.${chapter} [${branch.name}]: Plantilla ${12 * scale}`;
          requirement = { type: 'employees', qty: 12 * scale };
          reward = { money: 6000 * chapter, xp: 55 };
        } else if (verb.type === 'site_count') {
          title = `Cap.${chapter} [${branch.name}]: ${1 + Math.floor(chapter / 6)} plantas`;
          requirement = { type: 'site_count', qty: 1 + Math.floor(chapter / 6) };
          reward = { money: 40000 * chapter, xp: 100 };
        } else if (verb.type === 'reputation') {
          title = `Cap.${chapter} [${branch.name}]: Reputación ${45 + chapter}`;
          requirement = { type: 'reputation', amount: 45 + chapter };
          reward = { money: 18000 * chapter, xp: 75 };
        } else {
          title = `Cap.${chapter} [${branch.name}]: Cadena +${1 + Math.floor(n / 15)}`;
          requirement = { type: 'chain_step', amount: 1 + Math.floor(n / 15) };
          reward = { money: 22000 * chapter, xp: 110 };
        }
        missions.push({
          id: `cm_${id}`,
          chapter,
          branch: branch.id,
          order: n,
          title,
          description: `Misión profunda ${id}. Cap. ${chapter} · arco multi-año · ${branch.name}.`,
          requirement,
          reward,
          unlocks: [],
        });
      }
    }
  }
  window.IM_DATA.campaignMissions = missions;
})();
