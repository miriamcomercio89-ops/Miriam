/** Balance sim — simula ~5 años de ticks ligeros y reporta métricas */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = {
  console,
  performance: { now: () => Date.now() },
  localStorage: {
    _d: {},
    setItem(k, v) {
      this._d[k] = String(v);
    },
    getItem(k) {
      return this._d[k] ?? null;
    },
    removeItem(k) {
      delete this._d[k];
    },
  },
  fetch: async () => ({ ok: false }),
  Worker: undefined,
};
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);
function load(f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
[
  'js/config.js',
  'js/data/summary.js',
  'js/data/items.js',
  'js/data/recipes.js',
  'js/data/buildings.js',
  'js/data/machines.js',
  'js/data/techs.js',
  'js/data/locations.js',
  'js/data/missions.js',
  'js/data/competitors.js',
  'js/data/transport.js',
  'js/data/campaign.js',
  'js/game/utils.js',
  'js/game/Geo.js',
  'js/game/Save.js',
  'js/game/Game.js',
  'js/game/Systems.js',
].forEach(load);

const g = new ctx.IM.Game();
g.init();

// Seed a fake discovered location (Sevilla-like) without Nominatim
const loc = {
  id: 'sim_sevilla',
  name: 'Sevilla',
  country: 'España',
  countryCode: 'ES',
  region: 'Europa',
  lat: 37.39,
  lng: -5.98,
  type: 'agro',
  tariffs: 0.05,
  laborCost: 0.95,
  energyCost: 1.05,
  resources: [
    { item: 'aceituna', richness: 1.4 },
    { item: 'mena_de_hierro', richness: 1.1 },
    { item: 'trigo', richness: 1.2 },
  ],
  pollutionLimit: 80,
  hasPort: false,
  hasRail: true,
  hasAirport: false,
  currency: 'EUR',
  specialization: 'agro',
};
g.registerLocation(loc);
g.state.fogExplored[loc.id] = true;
g.foundInCity(loc.id);
g.buildBuilding(loc.id, 'granja');
g.buildBuilding(loc.id, 'almazara');
g.buildBuilding(loc.id, 'mina');
g.buildBuilding(loc.id, 'central_ciclo_combinado');
g.unlockAllTechs();
g.setAutomation({ autoBuyInputs: true, autoSellOutputs: true, autoRepair: true });

const site = g.state.sites[0];
const granja = site.buildings.find((b) => b.type === 'granja');
const alma = site.buildings.find((b) => b.type === 'almazara');
const mina = site.buildings.find((b) => b.type === 'mina');
const power = site.buildings.find((b) => b.type === 'central_ciclo_combinado');

function install(building, pred) {
  if (!building) return;
  const rec = ctx.IM_DATA.recipes.find((r) => r.building === building.type && pred(r));
  if (!rec) return;
  g.installMachine(site.id, building.id, 0, rec.machine, rec.id, { priority: 8 });
}
install(granja, (r) => r.outputs?.[0]?.item === 'aceituna');
install(alma, (r) => (r.outputs || []).some((o) => o.item === 'aceite_de_oliva'));
install(mina, (r) => r.outputs?.[0]?.item === 'mena_de_hierro');
install(power, (r) => (r.outputs || []).some((o) => o.item === 'electricidad'));

g.buyFromMarket(loc.id, 'gas_natural', 100000, true);
g.buyFromMarket(loc.id, 'agua_industrial', 5000, true);

const minutesPerYear = 360 * 24 * 60;
const years = 5;
const startMoney = g.state.money;
let minMoney = startMoney;
let maxMoney = startMoney;

// Simulación acelerada: 1 paso = 1 hora de juego
for (let y = 0; y < years; y++) {
  for (let d = 0; d < 360; d++) {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m++) g.advanceOneGameMinute();
    }
    minMoney = Math.min(minMoney, g.state.money);
    maxMoney = Math.max(maxMoney, g.state.money);
  }
  console.log(`Año ${y + 1}: money=${Math.round(g.state.money)} pollution=${g.state.pollutionTotal.toFixed(1)} chapter=${g.state.campaignChapter}`);
}

const report = {
  years,
  startMoney,
  endMoney: g.state.money,
  minMoney,
  maxMoney,
  profitLifetime: g.state.profitLifetime,
  rejected: g.state.rejectedLifetime,
  fines: g.state.finesPaid,
  employees: g.state.employees,
  campaignChapter: g.state.campaignChapter,
  producedAceituna: g.state.producedLifetime.aceituna || 0,
  producedAceite: g.state.producedLifetime.aceite_de_oliva || 0,
  flags: {
    moneyExplosion: g.state.money > startMoney * 50,
    bankruptRisk: minMoney < 0,
    stuck: g.state.profitLifetime < startMoney * 0.01 && g.state.money < startMoney * 1.1,
  },
};
console.log('REPORT', JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(root, 'tools/balance-report.json'), JSON.stringify(report, null, 2));
