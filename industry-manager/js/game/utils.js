window.IM = window.IM || {};

IM.uid = (() => { let n = 0; return (p) => `${p || 'id'}_${Date.now().toString(36)}_${(n++).toString(36)}`; })();
IM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
IM.formatMoney = (n) => (Number(n) || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
IM.formatNum = (n, d = 1) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + ' M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + ' k';
  return v.toLocaleString('es-ES', { maximumFractionDigits: d });
};
IM.mulberry32 = (a) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
IM.product = (id) => (IM_DATA.products || []).find((p) => p.id === id);
IM.building = (id) => (IM_DATA.buildings || []).find((b) => b.id === id);
IM.recipe = (id) => IM_DATA.recipes?.[id];
IM.tech = (id) => (IM_DATA.techs || []).find((t) => t.id === id);

IM.SEASONS = [
  { id: 'primavera', name: 'Primavera', color: '#86efac', farmMul: 1.15, oliveMul: 1.1, wheatMul: 1.2, tourism: 0.9, citrusMul: 1.05 },
  { id: 'verano', name: 'Verano', color: '#fde047', farmMul: 1.0, oliveMul: 0.85, wheatMul: 0.7, tourism: 1.45, citrusMul: 1.35 },
  { id: 'otono', name: 'Otoño', color: '#fdba74', farmMul: 1.1, oliveMul: 1.4, wheatMul: 1.0, tourism: 1.0, citrusMul: 1.15 },
  { id: 'invierno', name: 'Invierno', color: '#93c5fd', farmMul: 0.55, oliveMul: 0.6, wheatMul: 0.4, tourism: 0.75, citrusMul: 0.7 },
];

IM.seasonIndex = (dayOfYear) => Math.min(3, Math.floor(((dayOfYear - 1) % (IM_CONFIG.daysPerYear || 120)) / (IM_CONFIG.daysPerSeason || 30)));
IM.season = (dayOfYear) => IM.SEASONS[IM.seasonIndex(dayOfYear)];

IM.dateLabel = (year, dayOfYear) => {
  const s = IM.season(dayOfYear);
  const d = ((dayOfYear - 1) % (IM_CONFIG.daysPerSeason || 30)) + 1;
  return `${d} ${s.name} ${year}`;
};

IM.yieldMulFor = (buildingId, season) => {
  const s = season || IM.SEASONS[0];
  if (['olive_grove', 'oil_press'].includes(buildingId)) return s.oliveMul;
  if (['wheat_farm', 'mill', 'bakery'].includes(buildingId)) return s.wheatMul;
  if (['orchard', 'juice_plant'].includes(buildingId)) return s.citrusMul;
  if (['vineyard', 'winery'].includes(buildingId)) return s.tourism > 1 ? 1.15 : s.farmMul;
  if ((IM.building(buildingId) || {}).kind === 'farm') return s.farmMul;
  return 1;
};

IM.demandMulForProduct = (productId, season) => {
  const s = season || IM.SEASONS[0];
  if (['zumo', 'vino', 'naranja'].includes(productId)) return s.tourism;
  if (['pan', 'harina', 'trigo'].includes(productId)) return s.wheatMul > 1 ? 1.1 : 0.95;
  if (['aceite', 'aceituna'].includes(productId)) return s.oliveMul > 1 ? 1.15 : 1;
  return 1;
};
