/** Motor principal del juego */
window.IM = window.IM || {};

IM.createInitialState = function () {
  const cfg = IM_CONFIG;
  const locId = cfg.startingLocation;
  const prices = {};
  (IM_DATA.items || []).forEach((it) => {
    prices[it.id] = it.basePrice;
  });

  const warehouses = {};
    warehouses[locId] = { capacity: 20000, stock: {} };

  // Stock inicial generoso para poder jugar
  const starter = [
    ['carbon_mineral', 200],
    ['mena_de_hierro', 300],
    ['caliza', 200],
    ['arcilla_industrial', 100],
    ['petroleo_crudo', 150],
    ['gas_natural', 5000],
    ['trigo', 100],
    ['electricidad', 20000],
    ['agua_industrial', 2000],
  ];
  starter.forEach(([id, qty]) => {
    if (IM.itemById(id)) warehouses[locId].stock[id] = { qty, quality: 55 };
  });

  return {
    version: cfg.version,
    companyName: 'Tu Corporación Industrial',
    money: cfg.startingMoney,
    year: 2026,
    day: 1,
    hour: 8,
    minute: 0,
    speed: 1,
    paused: false,
    inflationIndex: 1,
    interestRate: cfg.baseInterestRate,
    creditRating: 70,
    loans: [],
    researched: {},
    researchQueue: null,
    unlockAll: false,
    sites: [
      {
        id: IM.uid('site'),
        locationId: locId,
        name: 'Sede Madrid',
        buildings: [],
      },
    ],
    warehouses,
    shipments: [],
    marketOrders: [],
    producedLifetime: {},
    soldLifetime: {},
    transportedLifetime: {},
    bestQuality: {},
    profitLifetime: 0,
    profitYear: 0,
    employees: 0,
    wageMultiplier: 1,
    strikeUntil: null,
    pollutionTotal: 0,
    missionsCompleted: {},
    activeMissionIds: [],
    missionChapter: 1,
    xp: 0,
    events: [],
    log: [],
    competitors: (IM_DATA.competitors || []).map((c) => ({
      ...c,
      money: c.capital,
      marketShare: 0.05,
    })),
    stats: {
      revenue: 0,
      expenses: 0,
      taxesPaid: 0,
      interestPaid: 0,
    },
    prices,
    demand: {},
    supply: {},
    lastTickHour: 8,
    ui: {
      selectedLocationId: locId,
      selectedSiteId: null,
      panel: 'mapa',
      encyclopediaQuery: '',
      encyclopediaCategory: 'all',
    },
  };
};

IM.Game = class Game {
  constructor() {
    this.state = null;
    this.accumRealMs = 0;
    this.lastFrame = performance.now();
    this.listeners = new Set();
    this._autosaveAcc = 0;
  }

  init(saved) {
    this.state = saved || IM.createInitialState();
    if (!this.state.activeMissionIds || this.state.activeMissionIds.length === 0) {
      this.refreshMissions();
    }
    this.state.ui = this.state.ui || { panel: 'mapa', selectedLocationId: IM_CONFIG.startingLocation };
    this.emit();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.state);
      } catch (e) {
        console.error(e);
      }
    });
  }

  log(msg, type = 'info') {
    this.state.log.unshift({ t: Date.now(), msg, type });
    if (this.state.log.length > 200) this.state.log.length = 200;
  }

  setSpeed(s) {
    this.state.speed = s;
    this.state.paused = s === 0;
    this.emit();
  }

  togglePause() {
    if (this.state.paused) this.setSpeed(this.state.speed || 1);
    else {
      this.state.paused = true;
      this.emit();
    }
  }

  tick(realDtMs) {
    if (!this.state || this.state.paused || this.state.speed === 0) return;
    this.accumRealMs += realDtMs * this.state.speed;
    this._autosaveAcc += realDtMs;
    const step = IM_CONFIG.realMsPerGameMinute;
    let guard = 0;
    while (this.accumRealMs >= step && guard < 120) {
      this.accumRealMs -= step;
      this.advanceOneGameMinute();
      guard++;
    }
    if (this._autosaveAcc > IM_CONFIG.autosaveMinutesReal * 60 * 1000) {
      this._autosaveAcc = 0;
      IM.Save.autosave(this.state);
    }
  }

  advanceOneGameMinute() {
    const st = this.state;
    st.minute += 1;
    if (st.minute >= 60) {
      st.minute = 0;
      st.hour += 1;
      this.onHour();
    }
    if (st.hour >= 24) {
      st.hour = 0;
      st.day += 1;
      this.onDay();
    }
    // Mes / año simplificado: 30 días
    if (st.day > 360) {
      st.day = 1;
      st.year += 1;
      this.onYear();
    }
    this.tickProduction(1);
    this.tickShipments(1);
    this.tickResearch(1);
  }

  onHour() {
    this.payWagesHourly();
    this.tickMarket();
    this.tickAI();
    this.checkMissions();
    this.emit();
  }

  onDay() {
    this.tickLoansDaily();
    this.tickEvents();
    this.applySoftInflationDaily();
    this.checkStrikes();
    this.refreshMissions();
    IM.Save.autosave(this.state);
    this.emit();
  }

  onYear() {
    this.payCorporateTax();
    this.state.profitYear = 0;
    this.log(`Cierre fiscal ${this.state.year - 1} completado.`, 'finance');
  }

  applySoftInflationDaily() {
    const daily = Math.pow(1 + IM_CONFIG.inflationYearly, 1 / 360) - 1;
    this.state.inflationIndex *= 1 + daily;
  }

  // ——— Inventario ———
  ensureWarehouse(locationId) {
    if (!this.state.warehouses[locationId]) {
      this.state.warehouses[locationId] = { capacity: 2000, stock: {} };
    }
    return this.state.warehouses[locationId];
  }

  stockQty(locationId, itemId) {
    const wh = this.ensureWarehouse(locationId);
    return wh.stock[itemId]?.qty || 0;
  }

  stockQuality(locationId, itemId) {
    return this.ensureWarehouse(locationId).stock[itemId]?.quality || 0;
  }

  storageUnits(itemId, qty) {
    const it = IM.itemById(itemId);
    if (!it) return qty;
    // Electricidad no ocupa almacén físico
    if (it.id === 'electricidad' || it.isEnergy && it.unit === 'kWh') return 0;
    const u = it.unit || 't';
    const factor =
      u === 't' ? 1 :
      u === 'kg' ? 0.001 :
      u === 'l' ? 0.001 :
      u === 'm³' || u === 'm3' ? 0.001 :
      u === 'ud' ? 0.01 :
      u === 'm' || u === 'm²' || u === 'm2' ? 0.01 :
      1;
    return (qty || 0) * factor;
  }

  usedStorage(locationId) {
    const wh = this.ensureWarehouse(locationId);
    return Object.entries(wh.stock).reduce(
      (a, [id, s]) => a + this.storageUnits(id, s.qty || 0),
      0
    );
  }

  storageCap(locationId) {
    const wh = this.ensureWarehouse(locationId);
    let cap = wh.capacity;
    this.state.sites
      .filter((s) => s.locationId === locationId)
      .forEach((site) => {
        site.buildings.forEach((b) => {
          const def = IM.buildingById(b.type);
          if (def) cap += def.storage;
        });
      });
    return cap;
  }

  addStock(locationId, itemId, qty, quality = 50) {
    if (qty <= 0) return false;
    const wh = this.ensureWarehouse(locationId);
    const free = this.storageCap(locationId) - this.usedStorage(locationId);
    const unitW = this.storageUnits(itemId, 1);
    const maxBySpace = unitW <= 0 ? qty : free / unitW;
    const add = Math.min(qty, Math.max(0, maxBySpace));
    if (add <= 0) return false;
    const cur = wh.stock[itemId] || { qty: 0, quality: quality };
    const total = cur.qty + add;
    const q = total <= 0 ? quality : (cur.quality * cur.qty + quality * add) / total;
    wh.stock[itemId] = { qty: total, quality: IM.clamp(q, 0, IM_CONFIG.maxQuality) };
    const bq = this.state.bestQuality[itemId] || 0;
    if (wh.stock[itemId].quality > bq) this.state.bestQuality[itemId] = wh.stock[itemId].quality;
    return add;
  }

  removeStock(locationId, itemId, qty) {
    const wh = this.ensureWarehouse(locationId);
    const cur = wh.stock[itemId];
    if (!cur || cur.qty < qty) return false;
    cur.qty -= qty;
    if (cur.qty <= 1e-9) delete wh.stock[itemId];
    return true;
  }

  // ——— Construcción ———
  getOrCreateSite(locationId) {
    let site = this.state.sites.find((s) => s.locationId === locationId);
    if (!site) {
      const loc = IM.locationById(locationId);
      site = {
        id: IM.uid('site'),
        locationId,
        name: `Planta ${loc?.name || locationId}`,
        buildings: [],
      };
      this.state.sites.push(site);
      this.ensureWarehouse(locationId);
    }
    return site;
  }

  canAfford(cost) {
    return this.state.money >= cost;
  }

  spend(amount, reason) {
    if (amount <= 0) return true;
    if (this.state.money < amount) return false;
    this.state.money -= amount;
    this.state.stats.expenses += amount;
    return true;
  }

  earn(amount, reason) {
    this.state.money += amount;
    this.state.stats.revenue += amount;
    this.state.profitLifetime += amount;
    this.state.profitYear += amount;
  }

  buildBuilding(locationId, buildingTypeId) {
    const def = IM.buildingById(buildingTypeId);
    if (!def) return { ok: false, error: 'Edificio desconocido' };
    const loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ubicación inválida' };
    const cost = def.cost * (loc.laborCost || 1) * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    const site = this.getOrCreateSite(locationId);
    const building = {
      id: IM.uid('bld'),
      type: buildingTypeId,
      slots: Array.from({ length: def.slots }, () => null),
      efficiency: 1,
      maintenance: 1,
      employees: Math.max(2, Math.ceil(def.slots * 3)),
    };
    site.buildings.push(building);
    this.state.employees += building.employees;
    this.log(`Construido ${def.name} en ${loc.name} (−${IM.formatMoney(cost)})`, 'build');
    this.emit();
    return { ok: true, building };
  }

  installMachine(siteId, buildingId, slotIndex, machineId, recipeId) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) return { ok: false, error: 'Sitio no encontrado' };
    const building = site.buildings.find((b) => b.id === buildingId);
    if (!building) return { ok: false, error: 'Edificio no encontrado' };
    const bdef = IM.buildingById(building.type);
    const mdef = IM.machineById(machineId);
    const recipe = IM.recipeById(recipeId);
    if (!mdef || !recipe) return { ok: false, error: 'Máquina o receta inválida' };
    if (recipe.building !== building.type) return { ok: false, error: 'La receta no corresponde a este edificio' };
    if (recipe.machine !== machineId) return { ok: false, error: 'La máquina no corresponde a la receta' };
    if (recipe.tech && !this.hasTech(recipe.tech)) return { ok: false, error: 'Tecnología no investigada' };
    if (slotIndex < 0 || slotIndex >= building.slots.length) return { ok: false, error: 'Slot inválido' };
    const cost = mdef.cost * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    building.slots[slotIndex] = {
      machineId,
      recipeId,
      progress: 0,
      enabled: true,
      auto: true,
      produced: 0,
    };
    this.log(`Instalada ${mdef.name} → ${recipe.name}`, 'build');
    this.emit();
    return { ok: true };
  }

  hasTech(techId) {
    if (!techId) return true;
    if (this.state.unlockAll) return true;
    return !!this.state.researched[techId];
  }

  // ——— Producción ———
  tickProduction(gameMinutes) {
    const st = this.state;
    st.sites.forEach((site) => {
      const loc = IM.locationById(site.locationId);
      site.buildings.forEach((building) => {
        const bdef = IM.buildingById(building.type);
        if (!bdef) return;
        building.slots.forEach((slot) => {
          if (!slot || !slot.enabled) return;
          const recipe = IM.recipeById(slot.recipeId);
          const machine = IM.machineById(slot.machineId);
          if (!recipe || !machine) return;
          if (recipe.tech && !this.hasTech(recipe.tech)) return;

          const speed =
            machine.speed *
            building.efficiency *
            (this.hasTech('automatizacion') ? 1.15 : 1) *
            (st.strikeUntil && st.day < st.strikeUntil ? 0.2 : 1);

          // Energía
          const energyNeed = (recipe.energyKwh / Math.max(1, recipe.timeMinutes)) * gameMinutes * speed;
          if (energyNeed > 0) {
            const have = this.stockQty(site.locationId, 'electricidad');
            if (have < energyNeed) return;
          }

          // Agua
          const waterNeed = ((recipe.waterM3 || 0) / Math.max(1, recipe.timeMinutes)) * gameMinutes * speed;
          if (waterNeed > 0 && this.stockQty(site.locationId, 'agua_industrial') < waterNeed) return;

          // Si no hay progreso, intentar consumir inputs para un batch
          if (slot.progress <= 0) {
            const canStart = (recipe.inputs || []).every(
              (inp) => this.stockQty(site.locationId, inp.item) >= inp.qty
            );
            if (!canStart) return;
            // Capacidad salida
            const outSpace = (recipe.outputs || []).reduce(
              (a, o) => a + this.storageUnits(o.item, o.qty),
              0
            );
            if (this.usedStorage(site.locationId) + outSpace > this.storageCap(site.locationId)) return;

            (recipe.inputs || []).forEach((inp) => this.removeStock(site.locationId, inp.item, inp.qty));
            if (energyNeed > 0) this.removeStock(site.locationId, 'electricidad', Math.min(energyNeed, this.stockQty(site.locationId, 'electricidad')));
            if (waterNeed > 0) this.removeStock(site.locationId, 'agua_industrial', Math.min(waterNeed, this.stockQty(site.locationId, 'agua_industrial')));
            slot.progress = 0.0001;
            slot.batchQuality = this.computeBatchQuality(site, recipe, machine, building);
          } else {
            // Consumo continuo de energía durante el proceso
            if (energyNeed > 0) {
              const have = this.stockQty(site.locationId, 'electricidad');
              this.removeStock(site.locationId, 'electricidad', Math.min(energyNeed, have));
            }
          }

          const need = recipe.timeMinutes / speed;
          slot.progress += gameMinutes;
          if (slot.progress >= need) {
            const q = slot.batchQuality || recipe.qualityBase || 50;
            (recipe.outputs || []).forEach((out) => {
              const added = this.addStock(site.locationId, out.item, out.qty, q);
              if (added) {
                st.producedLifetime[out.item] = (st.producedLifetime[out.item] || 0) + added;
                slot.produced += added;
              }
            });
            (recipe.byproducts || []).forEach((bp) => {
              this.addStock(site.locationId, bp.item, bp.qty, 20);
            });
            st.pollutionTotal += (recipe.pollution || 0) * (bdef.pollutionBase || 1) * 0.01;
            slot.progress = 0;
            slot.batchQuality = null;
            // Auto-restart handled next minute
          }
        });
      });
    });
  }

  computeBatchQuality(site, recipe, machine, building) {
    let q = recipe.qualityBase || 50;
    q += machine.quality || 0;
    q += (building.efficiency - 1) * 20;
    if (this.hasTech('calidad_six_sigma')) q += 10;
    // Calidad media de inputs
    const inputs = recipe.inputs || [];
    if (inputs.length) {
      let sum = 0;
      inputs.forEach((inp) => {
        sum += this.stockQuality(site.locationId, inp.item) || 40;
      });
      q = q * 0.6 + (sum / inputs.length) * 0.4;
    }
    // Empleados / huelga
    if (this.state.strikeUntil && this.state.day < this.state.strikeUntil) q -= 15;
    return IM.clamp(q + (Math.random() * 6 - 3), 1, IM_CONFIG.maxQuality);
  }

  // ——— Mercado ———
  priceOf(itemId) {
    return this.state.prices[itemId] ?? IM.itemById(itemId)?.basePrice ?? 1;
  }

  tickMarket() {
    const st = this.state;
    (IM_DATA.items || []).forEach((it) => {
      const base = it.basePrice * st.inflationIndex;
      const demand = st.demand[it.id] || 1;
      const supply = st.supply[it.id] || 1;
      const pressure = demand / Math.max(0.2, supply);
      // Suave hacia equilibrio (crecimiento estable)
      const target = base * IM.clamp(0.7 + pressure * 0.3, 0.5, 2.2);
      const cur = st.prices[it.id] ?? base;
      st.prices[it.id] = cur * 0.92 + target * 0.08;
      // Decay de oferta/demanda hacia 1
      st.demand[it.id] = (demand - 1) * 0.98 + 1;
      st.supply[it.id] = (supply - 1) * 0.98 + 1;
    });

    // Demanda de competidores
    st.competitors.forEach((c) => {
      const focusItems = (IM_DATA.items || []).filter((i) => i.category === c.focus).slice(0, 20);
      focusItems.forEach((it) => {
        st.demand[it.id] = (st.demand[it.id] || 1) + 0.01 * c.aggressiveness;
      });
    });
  }

  buyFromMarket(locationId, itemId, qty) {
    const item = IM.itemById(itemId);
    if (!item || qty <= 0) return { ok: false, error: 'Pedido inválido' };
    const loc = IM.locationById(locationId);
    const tariff = loc?.tariffs || 0;
    const unit = this.priceOf(itemId) * (1 + tariff);
    const cost = unit * qty;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    if (this.usedStorage(locationId) + this.storageUnits(itemId, qty) > this.storageCap(locationId)) {
      return { ok: false, error: 'Sin capacidad de almacén' };
    }
    this.spend(cost);
    this.addStock(locationId, itemId, qty, 50);
    this.state.supply[itemId] = (this.state.supply[itemId] || 1) + qty * 0.001;
    this.log(`Compra ${IM.formatNum(qty)} ${item.unit} ${item.name} en ${loc.name}`, 'market');
    this.emit();
    return { ok: true };
  }

  sellToMarket(locationId, itemId, qty) {
    const item = IM.itemById(itemId);
    if (!item || qty <= 0) return { ok: false, error: 'Pedido inválido' };
    if (this.stockQty(locationId, itemId) < qty) return { ok: false, error: 'Stock insuficiente' };
    const loc = IM.locationById(locationId);
    const q = this.stockQuality(locationId, itemId);
    const qualityMult = 0.7 + (q / 100) * 0.6;
    const unit = this.priceOf(itemId) * qualityMult;
    this.removeStock(locationId, itemId, qty);
    this.earn(unit * qty);
    this.state.soldLifetime[itemId] = (this.state.soldLifetime[itemId] || 0) + qty;
    this.state.demand[itemId] = Math.max(0.2, (this.state.demand[itemId] || 1) - qty * 0.001);
    this.state.supply[itemId] = (this.state.supply[itemId] || 1) + qty * 0.002;
    this.log(`Venta ${IM.formatNum(qty)} ${item.unit} ${item.name} (+${IM.formatMoney(unit * qty)})`, 'market');
    this.emit();
    return { ok: true };
  }

  // ——— Logística ———
  startShipment(fromId, toId, itemId, qty, modeId) {
    const mode = (IM_DATA.transportModes || []).find((m) => m.id === modeId);
    if (!mode) return { ok: false, error: 'Modo inválido' };
    if (mode.unlock && !this.hasTech(mode.unlock)) return { ok: false, error: 'Modo bloqueado' };
    if (fromId === toId) return { ok: false, error: 'Origen = destino' };
    if (this.stockQty(fromId, itemId) < qty) return { ok: false, error: 'Stock insuficiente' };
    const a = IM.locationById(fromId);
    const b = IM.locationById(toId);
    if (!a || !b) return { ok: false, error: 'Ubicación inválida' };
    const dist = IM.haversineKm(a.lat, a.lng, b.lat, b.lng);
    const batches = Math.ceil(qty / mode.capacity);
    const cost = dist * qty * mode.costPerKmTon * this.state.inflationIndex * batches * 0.25;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    const hours = (dist / mode.speedKmh) * batches;
    this.spend(cost);
    const q = this.stockQuality(fromId, itemId);
    this.removeStock(fromId, itemId, qty);
    this.state.shipments.push({
      id: IM.uid('ship'),
      fromId,
      toId,
      itemId,
      qty,
      quality: q,
      modeId,
      cost,
      remainingMinutes: hours * 60,
      totalMinutes: hours * 60,
    });
    this.log(`Envío ${mode.name}: ${IM.formatNum(qty)} → ${b.name} (${Math.round(dist)} km)`, 'logistics');
    this.emit();
    return { ok: true };
  }

  tickShipments(gameMinutes) {
    const left = [];
    this.state.shipments.forEach((sh) => {
      sh.remainingMinutes -= gameMinutes;
      if (sh.remainingMinutes <= 0) {
        this.ensureWarehouse(sh.toId);
        this.addStock(sh.toId, sh.itemId, sh.qty, sh.quality);
        this.state.transportedLifetime[sh.itemId] =
          (this.state.transportedLifetime[sh.itemId] || 0) + sh.qty;
      } else left.push(sh);
    });
    this.state.shipments = left;
  }

  // ——— Investigación ———
  startResearch(techId) {
    const tech = IM.techById(techId);
    if (!tech) return { ok: false, error: 'Tech inválida' };
    if (this.hasTech(techId)) return { ok: false, error: 'Ya investigada' };
    if (this.state.researchQueue) return { ok: false, error: 'Ya hay investigación en curso' };
    const missing = (tech.requires || []).filter((r) => !this.hasTech(r));
    if (missing.length) return { ok: false, error: 'Faltan requisitos' };
    const cost = tech.cost * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    this.state.researchQueue = { techId, remaining: tech.time, total: tech.time };
    this.log(`Investigando: ${tech.name}`, 'research');
    this.emit();
    return { ok: true };
  }

  tickResearch(gameMinutes) {
    const q = this.state.researchQueue;
    if (!q) return;
    q.remaining -= gameMinutes;
    if (q.remaining <= 0) {
      this.state.researched[q.techId] = true;
      const tech = IM.techById(q.techId);
      this.log(`Tecnología desbloqueada: ${tech?.name || q.techId}`, 'research');
      this.state.researchQueue = null;
      this.state.xp += 250;
    }
  }

  unlockAllTechs() {
    this.state.unlockAll = true;
    (IM_DATA.techs || []).forEach((t) => {
      this.state.researched[t.id] = true;
    });
    this.log('Truco ACTIVADO: todas las tecnologías desbloqueadas.', 'cheat');
    this.emit();
  }

  // ——— Finanzas ———
  takeLoan(amount, years = 5) {
    amount = Math.round(amount);
    if (amount < 10000) return { ok: false, error: 'Mínimo 10.000 €' };
    const maxLoan = 5000000 * (this.state.creditRating / 50);
    const currentDebt = this.state.loans.reduce((a, l) => a + l.principal, 0);
    if (currentDebt + amount > maxLoan) return { ok: false, error: 'Límite de crédito' };
    const rate = this.state.interestRate * (this.hasTech('finanzas_corporativas') ? 0.85 : 1);
    this.state.loans.push({
      id: IM.uid('loan'),
      principal: amount,
      rate,
      years,
      remainingDays: years * 360,
      dailyPayment: (amount * (1 + rate * years)) / (years * 360),
    });
    this.state.money += amount;
    this.state.creditRating = IM.clamp(this.state.creditRating - 3, 20, 100);
    this.log(`Préstamo recibido: ${IM.formatMoney(amount)}`, 'finance');
    this.emit();
    return { ok: true };
  }

  tickLoansDaily() {
    const keep = [];
    this.state.loans.forEach((loan) => {
      const pay = loan.dailyPayment;
      if (this.state.money >= pay) {
        this.state.money -= pay;
        this.state.stats.interestPaid += pay * 0.3;
        this.state.stats.expenses += pay;
        loan.principal = Math.max(0, loan.principal - pay * 0.7);
        loan.remainingDays -= 1;
        if (loan.remainingDays > 0 && loan.principal > 1) keep.push(loan);
        else {
          this.state.creditRating = IM.clamp(this.state.creditRating + 2, 20, 100);
          this.log('Préstamo amortizado.', 'finance');
        }
      } else {
        this.state.creditRating = IM.clamp(this.state.creditRating - 5, 10, 100);
        loan.remainingDays -= 1;
        keep.push(loan);
        this.log('Impago parcial de préstamo — rating crediticio baja.', 'alert');
        if (this.state.creditRating <= 15 && this.state.money < 0) {
          this.log('Situación cercana a insolvencia. Vende activos o reestructura deuda.', 'alert');
        }
      }
    });
    this.state.loans = keep;
  }

  payCorporateTax() {
    const profit = Math.max(0, this.state.profitYear);
    const tax = profit * IM_CONFIG.corporateTax;
    if (tax > 0) {
      this.state.money -= tax;
      this.state.stats.taxesPaid += tax;
      this.log(`Impuesto de sociedades: ${IM.formatMoney(tax)}`, 'finance');
    }
  }

  payWagesHourly() {
    if (this.state.employees <= 0) return;
    let wage =
      this.state.employees *
      IM_CONFIG.employeeBaseWageHourly *
      this.state.wageMultiplier *
      this.state.inflationIndex;
    // Ajuste regional medio
    wage *= 1;
    if (this.state.money >= wage) {
      this.state.money -= wage;
      this.state.stats.expenses += wage;
    } else {
      this.state.money -= wage;
      this.state.wageMultiplier = Math.max(0.8, this.state.wageMultiplier);
      if (Math.random() < 0.05) {
        this.state.strikeUntil = this.state.day + 2;
        this.log('Huelga laboral iniciada (2 días). Sube salarios o espera.', 'alert');
      }
    }
  }

  setWageMultiplier(m) {
    this.state.wageMultiplier = IM.clamp(m, 0.7, 2);
    if (m >= 1.1 && this.state.strikeUntil) {
      this.state.strikeUntil = null;
      this.log('Huelga desconvocada tras mejora salarial.', 'info');
    }
    this.emit();
  }

  checkStrikes() {
    if (this.state.strikeUntil && this.state.day >= this.state.strikeUntil) {
      this.state.strikeUntil = null;
      this.log('La huelga ha terminado.', 'info');
    }
  }

  // ——— Eventos ———
  tickEvents() {
    if (Math.random() > 0.12) return;
    const events = [
      {
        id: 'boom_demanda',
        title: 'Auge de demanda',
        desc: 'La demanda global de metales y químicos sube.',
        apply: () => {
          (IM_DATA.items || [])
            .filter((i) => i.category === 'metales' || i.category === 'quimicos')
            .forEach((i) => {
              this.state.demand[i.id] = (this.state.demand[i.id] || 1) * 1.15;
            });
        },
      },
      {
        id: 'crisis_energia',
        title: 'Tensión energética',
        desc: 'Sube el coste implícito de la electricidad.',
        apply: () => {
          this.state.prices.electricidad = (this.state.prices.electricidad || 0.12) * 1.25;
        },
      },
      {
        id: 'subsidio_verde',
        title: 'Subsidio verde',
        desc: 'Ayuda pública a renovables y reciclaje.',
        apply: () => {
          this.state.money += 150000 * this.state.inflationIndex;
        },
      },
      {
        id: 'aranceles',
        title: 'Ajuste arancelario',
        desc: 'Algunas regiones modifican aranceles.',
        apply: () => {
          // solo mensaje; aranceles están en locations
        },
      },
      {
        id: 'buena_cosecha',
        title: 'Buena cosecha',
        desc: 'Caen precios agrícolas temporales.',
        apply: () => {
          (IM_DATA.items || [])
            .filter((i) => i.category === 'agricolas')
            .forEach((i) => {
              this.state.prices[i.id] *= 0.92;
              this.state.supply[i.id] = (this.state.supply[i.id] || 1) * 1.2;
            });
        },
      },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    ev.apply();
    this.state.events.unshift({ id: ev.id, title: ev.title, desc: ev.desc, day: this.state.day, year: this.state.year });
    if (this.state.events.length > 50) this.state.events.length = 50;
    this.log(`Evento: ${ev.title} — ${ev.desc}`, 'event');
  }

  // ——— IA ———
  tickAI() {
    this.state.competitors.forEach((c) => {
      c.money *= 1 + 0.0002 * c.aggressiveness;
      c.marketShare = IM.clamp(c.marketShare + (Math.random() - 0.48) * 0.002 * c.aggressiveness, 0.01, 0.4);
      const focusItems = (IM_DATA.items || []).filter((i) => i.category === c.focus);
      if (!focusItems.length) return;
      const it = focusItems[Math.floor(Math.random() * Math.min(30, focusItems.length))];
      this.state.supply[it.id] = (this.state.supply[it.id] || 1) + 0.02 * c.aggressiveness;
      this.state.demand[it.id] = (this.state.demand[it.id] || 1) + 0.01;
    });
  }

  // ——— Misiones ———
  refreshMissions() {
    const chapter = this.state.missionChapter || 1;
    const available = (IM_DATA.missions || []).filter(
      (m) => m.chapter === chapter && !this.state.missionsCompleted[m.id]
    );
    const active = available.slice(0, 5).map((m) => m.id);
    // Si no quedan, avanzar capítulo
    if (active.length === 0 && chapter < 40) {
      this.state.missionChapter = chapter + 1;
      return this.refreshMissions();
    }
    this.state.activeMissionIds = active;
  }

  checkMissions() {
    const st = this.state;
    st.activeMissionIds.forEach((mid) => {
      if (st.missionsCompleted[mid]) return;
      const m = IM.missionById(mid);
      if (!m) return;
      if (this.missionSatisfied(m)) {
        st.missionsCompleted[mid] = true;
        st.money += m.reward.money || 0;
        st.xp += m.reward.xp || 0;
        (m.unlocks || []).forEach((tid) => {
          st.researched[tid] = true;
        });
        this.log(`Misión completada: ${m.title} (+${IM.formatMoney(m.reward.money || 0)})`, 'mission');
      }
    });
    // Refrescar si todas completadas
    if (st.activeMissionIds.every((id) => st.missionsCompleted[id])) {
      this.refreshMissions();
    }
  }

  missionSatisfied(m) {
    const r = m.requirement;
    const st = this.state;
    switch (r.type) {
      case 'produce':
        return (st.producedLifetime[r.item] || 0) >= r.qty;
      case 'sell':
        return (st.soldLifetime[r.item] || 0) >= r.qty;
      case 'stock': {
        const total = Object.values(st.warehouses).reduce(
          (a, wh) => a + (wh.stock[r.item]?.qty || 0),
          0
        );
        return total >= r.qty;
      }
      case 'build': {
        let count = 0;
        st.sites.forEach((s) => s.buildings.forEach((b) => { if (b.type === r.building) count++; }));
        return count >= (r.qty || 1);
      }
      case 'research':
        return this.hasTech(r.tech);
      case 'profit':
        return st.profitLifetime >= r.amount;
      case 'transport':
        return (st.transportedLifetime[r.item] || 0) >= r.qty;
      case 'quality':
        return (st.bestQuality[r.item] || 0) >= r.quality;
      case 'employees':
        return st.employees >= r.qty;
      case 'locations':
        return st.sites.some((s) => s.locationId === r.location);
      default:
        return false;
    }
  }

  missionProgress(m) {
    const r = m.requirement;
    const st = this.state;
    const pct = (cur, need) => IM.clamp(need ? cur / need : 1, 0, 1);
    switch (r.type) {
      case 'produce':
        return pct(st.producedLifetime[r.item] || 0, r.qty);
      case 'sell':
        return pct(st.soldLifetime[r.item] || 0, r.qty);
      case 'stock': {
        const total = Object.values(st.warehouses).reduce(
          (a, wh) => a + (wh.stock[r.item]?.qty || 0),
          0
        );
        return pct(total, r.qty);
      }
      case 'build': {
        let count = 0;
        st.sites.forEach((s) => s.buildings.forEach((b) => { if (b.type === r.building) count++; }));
        return pct(count, r.qty || 1);
      }
      case 'research':
        return this.hasTech(r.tech) ? 1 : 0;
      case 'profit':
        return pct(st.profitLifetime, r.amount);
      case 'transport':
        return pct(st.transportedLifetime[r.item] || 0, r.qty);
      case 'quality':
        return pct(st.bestQuality[r.item] || 0, r.quality);
      case 'employees':
        return pct(st.employees, r.qty);
      case 'locations':
        return st.sites.some((s) => s.locationId === r.location) ? 1 : 0;
      default:
        return 0;
    }
  }
};
