/** Datos v5: especialidades de filiales, franquicias B2B, noticias, hubs */
window.IM_DATA = window.IM_DATA || {};

window.IM_DATA.subsidiarySpecialties = [
  { id: 'agro', name: 'Agroalimentaria', color: '#5B8C3E', categories: ['agricolas', 'alimentacion', 'agroquimicos'], buildings: ['granja', 'almazara', 'azucarera', 'molino_harinero'] },
  { id: 'metales', name: 'Metalurgia', color: '#64748B', categories: ['minerales', 'metales', 'mecanicos'], buildings: ['mina', 'fundicion', 'laminacion', 'planta_concentracion'] },
  { id: 'electronica', name: 'Electrónica & chips', color: '#2563EB', categories: ['electronica', 'energia'], buildings: ['electronica', 'planta_quimica'] },
  { id: 'logistica', name: 'Logística & hubs', color: '#0EA5E9', categories: ['embalaje', 'consumo'], buildings: ['almacen', 'puerto', 'terminal_ferroviaria'] },
  { id: 'energia', name: 'Energía', color: '#E6A817', categories: ['energia'], buildings: ['central_termica', 'parque_solar', 'parque_eolico', 'refineria', 'central_ciclo_combinado'] },
  { id: 'consumo', name: 'Bienes de consumo', color: '#F43F5E', categories: ['consumo', 'textiles', 'mobiliario', 'juguetes', 'deportes', 'cosmetica'], buildings: ['planta_consumo', 'planta_textil'] },
  { id: 'naval', name: 'Naval & cerámica', color: '#1D4ED8', categories: ['naval', 'ceramica_arte', 'construccion'], buildings: ['astillero', 'planta_ceramica', 'planta_cemento'] },
  { id: 'quimica', name: 'Química & farma', color: '#7C3AED', categories: ['quimicos', 'farmaceuticos'], buildings: ['planta_quimica', 'planta_farma'] },
];

window.IM_DATA.bankProducts = [
  {
    id: 'pyme',
    name: 'Crédito PYME',
    maxAmount: 5000000,
    years: 5,
    rateMul: 1.0,
    covenant: { minCash: 200000, maxDebtRatio: 0.55 },
  },
  {
    id: 'expansion',
    name: 'Crédito expansión industrial',
    maxAmount: 25000000,
    years: 8,
    rateMul: 1.15,
    covenant: { minCash: 1000000, maxDebtRatio: 0.65 },
  },
  {
    id: 'export',
    name: 'Financiación export',
    maxAmount: 12000000,
    years: 4,
    rateMul: 0.9,
    covenant: { minCash: 500000, maxDebtRatio: 0.5, requireHub: true },
  },
];

window.IM_DATA.marketNewsPool = [
  { id: 'sequia', headline: 'Sequía en el sur: presión sobre cultivos', category: 'agricolas', priceMul: 1.18, demandMul: 1.1, days: 12 },
  { id: 'acero_boom', headline: 'Boom de obra pública: sube el acero', category: 'metales', priceMul: 1.14, demandMul: 1.2, days: 10 },
  { id: 'chip_shortage', headline: 'Escasez global de chips', category: 'electronica', priceMul: 1.22, demandMul: 1.25, days: 14 },
  { id: 'petroleo_baja', headline: 'Excedente de crudo: caen combustibles', category: 'energia', priceMul: 0.88, demandMul: 0.95, days: 8 },
  { id: 'turismo', headline: 'Temporada turística: tirón de consumo', category: 'consumo', priceMul: 1.1, demandMul: 1.15, days: 9 },
  { id: 'farma', headline: 'Demanda farmacéutica al alza', category: 'farmaceuticos', priceMul: 1.12, demandMul: 1.1, days: 11 },
  { id: 'naval_order', headline: 'Pedidos navales en astilleros europeos', category: 'naval', priceMul: 1.16, demandMul: 1.2, days: 15 },
  { id: 'cosmetica', headline: 'Moda beauty: cosmética premium', category: 'cosmetica', priceMul: 1.13, demandMul: 1.18, days: 7 },
  { id: 'reciclaje', headline: 'Normativa verde: premio al reciclaje', category: 'residuos', priceMul: 1.08, demandMul: 1.3, days: 20 },
  { id: 'cemento', headline: 'Parón urbanístico: baja el cemento', category: 'construccion', priceMul: 0.9, demandMul: 0.85, days: 10 },
];

/** Franquicias / grandes clientes B2B */
window.IM_DATA.franchiseClients = [
  {
    id: 'fran_mercalia',
    name: 'Mercalia Distribución',
    sector: 'alimentacion',
    preferred: ['aceite_de_oliva', 'harina_de_trigo', 'aceituna', 'gazpacho_premium'],
    minQuality: 62,
    reputation: 55,
    franchise: true,
    orderMul: 4,
    priceMul: 1.08,
    blurb: 'Gran distribución alimentaria — pedidos grandes y recurrentes.',
  },
  {
    id: 'fran_autovolt',
    name: 'AutoVolt Iberia',
    sector: 'automocion',
    preferred: ['chapa_de_acero', 'paquete_bateria_ev', 'neumatico', 'motor_electrico_55_kw'],
    minQuality: 72,
    reputation: 50,
    franchise: true,
    orderMul: 5,
    priceMul: 1.12,
    blurb: 'OEM automoción — exige calidad y plazos.',
  },
  {
    id: 'fran_energysa',
    name: 'Energía SA Utilities',
    sector: 'energia',
    preferred: ['electricidad', 'modulo_fv_500w_topcon', 'diesel'],
    minQuality: 60,
    reputation: 58,
    franchise: true,
    orderMul: 6,
    priceMul: 1.05,
    blurb: 'Utility — volúmenes enormes de energía y equipos.',
  },
  {
    id: 'fran_tecnohub',
    name: 'TecnoHub Semicon',
    sector: 'electronica',
    preferred: ['chip_logico_28nm', 'pcb_ensamblada_comercial', 'oblea_200mm'],
    minQuality: 78,
    reputation: 48,
    franchise: true,
    orderMul: 3,
    priceMul: 1.2,
    blurb: 'Fabricante de electrónica — márgenes altos, calidad estricta.',
  },
  {
    id: 'fran_obrasur',
    name: 'ObraSur Constructora',
    sector: 'construccion',
    preferred: ['cemento_portland', 'hormigon_fresco', 'acero_laminado'],
    minQuality: 55,
    reputation: 52,
    franchise: true,
    orderMul: 5,
    priceMul: 1.06,
    blurb: 'Gran constructora — contratos de obra civil.',
  },
  {
    id: 'fran_marazul',
    name: 'MarAzul Shipping',
    sector: 'naval',
    preferred: ['diesel', 'acero_naval', 'hélice_naval'],
    minQuality: 65,
    reputation: 50,
    franchise: true,
    orderMul: 3,
    priceMul: 1.15,
    blurb: 'Naviera — compra en puertos preferente.',
  },
];

// Merge franchises into b2bClients if not present
(function mergeFranchises() {
  const list = window.IM_DATA.b2bClients || [];
  const ids = new Set(list.map((c) => c.id));
  (window.IM_DATA.franchiseClients || []).forEach((f) => {
    if (!ids.has(f.id)) list.push(f);
  });
  window.IM_DATA.b2bClients = list;
})();
