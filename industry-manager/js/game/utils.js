/** Utilidades compartidas */
window.IM = window.IM || {};

IM.uid = (function () {
  let n = 0;
  return (prefix) => `${prefix || 'id'}_${Date.now().toString(36)}_${(n++).toString(36)}`;
})();

IM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

IM.formatMoney = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
};

IM.formatNum = (n, digits = 1) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + ' M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + ' k';
  return v.toLocaleString('es-ES', { maximumFractionDigits: digits });
};

IM.daysInYear = (year) => {
  const y = Number(year) || 2000;
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 366 : 365;
};

IM.dateFromDayOfYear = (year, dayOfYear) => {
  const months = [31, IM.daysInYear(year) === 366 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = Math.max(1, Number(dayOfYear) || 1);
  for (let m = 0; m < 12; m++) {
    if (d <= months[m]) return { year, month: m + 1, day: d };
    d -= months[m];
  }
  return { year, month: 12, day: months[11] };
};

IM.formatGameDate = (state) => {
  const dt = IM.dateFromDayOfYear(state.year, state.day);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dt.day} ${months[dt.month - 1]} ${dt.year}`;
};

IM.formatGameTime = (state) => {
  const h = String(state.hour).padStart(2, '0');
  const m = String(Math.floor(state.minute)).padStart(2, '0');
  return `${IM.formatGameDate(state)} · ${h}:${m}`;
};

IM.haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

IM.itemById = (id) => (window.IM_DATA.items || []).find((i) => i.id === id);
IM.recipeById = (id) => (window.IM_DATA.recipes || []).find((r) => r.id === id);
IM.buildingById = (id) => (window.IM_DATA.buildings || []).find((b) => b.id === id);
IM.machineById = (id) => (window.IM_DATA.machines || []).find((m) => m.id === id);
IM.techById = (id) => (window.IM_DATA.techs || []).find((t) => t.id === id);
IM.missionById = (id) => (window.IM_DATA.missions || []).find((m) => m.id === id);
IM.locationById = (id) => {
  const dyn = (window.IM?.currentGame?.state?.discoveredLocations) || [];
  return dyn.find((l) => l.id === id) || (window.IM_DATA.locations || []).find((l) => l.id === id);
};
IM.allLocations = () => {
  const dyn = window.IM?.currentGame?.state?.discoveredLocations || [];
  const base = window.IM_DATA.locations || [];
  const map = new Map();
  [...base, ...dyn].forEach((l) => map.set(l.id, l));
  return [...map.values()];
};

IM.categoryLabel = {
  minerales: 'Minerales',
  agricolas: 'Agrícolas',
  energia: 'Energía y utilities',
  residuos: 'Residuos',
  metales: 'Metales',
  quimicos: 'Químicos',
  farmaceuticos: 'Farmacéuticos',
  construccion: 'Construcción',
  textiles: 'Textiles',
  electronica: 'Electrónica',
  mecanicos: 'Mecánicos',
  alimentacion: 'Alimentación',
  embalaje: 'Embalaje',
  bienes_capital: 'Bienes de capital',
  papel: 'Papel',
  agroquimicos: 'Agroquímicos',
  consumo: 'Consumo',
  naval: 'Naval',
  aeroespacial: 'Aeroespacial',
  mobiliario: 'Mobiliario',
  cosmetica: 'Cosmética',
  juguetes: 'Juguetes',
  deportes: 'Deportes',
  joyeria: 'Joyería',
  ceramica_arte: 'Cerámica y arte',
  vitivinicultura: 'Vitivinicultura',
  corcho_iberico: 'Corcho e ibéricos',
  biotecnologia: 'Biotecnología',
  renovables_eq: 'Equipos renovables',
  software_ind: 'Software industrial',
  agua_tratamiento: 'Agua y tratamiento',
  optica_iluminacion: 'Óptica e iluminación',
  ferroviario: 'Ferroviario',
  seguridad_ind: 'Seguridad industrial',
  hogar_smart: 'Hogar inteligente',
  instrumentos: 'Instrumentación',
  educacion: 'Educación',
  medios: 'Medios',
  turismo_ind: 'Turismo industrial',
  impresion_3d: 'Impresión 3D',
  baterias_estac: 'Baterías estacionarias',
  hidrogeno: 'Hidrógeno',
  drones: 'Drones',
  robotica: 'Robótica',
};

IM.el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
};
