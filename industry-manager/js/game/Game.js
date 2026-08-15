/** Industry Manager v2 — motor con automatización, bolsa, IA, calidad, contaminación */
window.IM = window.IM || {};

IM.createInitialState = function () {
  const cfg = IM_CONFIG;
  const prices = {};
  const history = {};
  (IM_DATA.items || []).forEach((it) => {
    prices[it.id] = it.basePrice;
    history[it.id] = [it.basePrice];
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
    creditRating: 75,
    loans: [],
    researched: {},
    researchQueue: null,
    researchAutoQueue: [],
    unlockAll: false,
    sites: [],
    warehouses: {},
    shipments: [],
    contracts: [],
    futures: [],
    producedLifetime: {},
    soldLifetime: {},
    transportedLifetime: {},
    recycledLifetime: {},
    bestQuality: {},
    rejectedLifetime: 0,
    profitLifetime: 0,
    profitYear: 0,
    employees: 0,
    wageMultiplier: 1,
    strikeUntil: null,
    pollutionTotal: 0,
    pollutionByLocation: {},
    greenCredits: 0,
    finesPaid: 0,
    missionsCompleted: {},
    activeMissionIds: [],
    missionChapter: 1,
    xp: 0,
    events: [],
    log: [],
    competitors: (IM_DATA.competitors || []).map((c) => ({
      ...c,
      money: c.capital,
      marketShare: 0.04,
      sites: c.home ? [{ locationId: c.home, buildings: 1 }] : [],
      lastAction: 'Iniciando operaciones',
    })),
    stats: {
      revenue: 0,
      expenses: 0,
      taxesPaid: 0,
      interestPaid: 0,
      energySpent: 0,
      waterSpent: 0,
      freightSpent: 0,
      wagesPaid: 0,
      automationSaved: 0,
    },
    prices,
    priceHistory: history,
    demand: {},
    supply: {},
    categoryCrisis: null,
    automation: {
      autoBuyInputs: true,
      autoSellOutputs: false,
      autoExtract: true,
      autoTransport: true,
      autoResearch: false,
      autoUpgrade: false,
      autoAcceptContracts: true,
      targetQuality: 60,
      sellAboveQuality: 50,
      minEnergyStock: 5000,
      minWaterStock: 500,
      rules: [],
      routes: [],
    },
    plantMetrics: {},
    ui: {
      selectedLocationId: cfg.startingLocation,
      selectedSiteId: null,
      panel: 'mapa',
      mapFilter: 'all',
      encyclopediaQuery: '',
      encyclopediaCategory: 'all',
      encyclopediaItem: null,
    },
  };
};

IM.Game = class Game {
  constructor() {
    this.state = null;
    this.accumRealMs = 0;
    this.listeners = new Set();
    this._autosaveAcc = 0;
    this._pausedByModal = false;
  }

  init(saved) {
    this.state = saved || IM.createInitialState();
    // Migración / defaults
    const st = this.state;
    st.automation = Object.assign(IM.createInitialState().automation, st.automation || {});
    st.priceHistory = st.priceHistory || {};
    st.pollutionByLocation = st.pollutionByLocation || {};
    st.contracts = st.contracts || [];
    st.futures = st.futures || [];
    st.researchAutoQueue = st.researchAutoQueue || [];
    st.plantMetrics = st.plantMetrics || {};
    st.competitors = st.competitors || [];
    if (!st.activeMissionIds || !st.activeMissionIds.length) this.refreshMissions();
    st.ui = Object.assign(IM.createInitialState().ui, st.ui || {});
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
    if (this.state.log.length > 250) this.state.log.length = 250;
  }

  setSpeed(s) {
    this.state.speed = s;
    this.state.paused = s === 0;
    this._pausedByModal = false;
    this.emit();
  }

  pauseForModal(on) {
    if (on) {
      if (!this.state.paused) {
        this._pausedByModal = true;
        this.state.paused = true;
      }
    } else if (this._pausedByModal) {
      this.state.paused = false;
      this._pausedByModal = false;
    }
    this.emit();
  }

  tick(realDtMs) {
    if (!this.state || this.state.paused || this.state.speed === 0) return;
    this.accumRealMs += realDtMs * this.state.speed;
    this._autosaveAcc += realDtMs;
    const step = IM_CONFIG.realMsPerGameMinute;
    let guard = 0;
    while (this.accumRealMs >= step && guard < 180) {
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
    if (st.day > 360) {
      st.day = 1;
      st.year += 1;
      this.onYear();
    }
    this.tickProduction(1);
    this.tickShipments(1);
    this.tickResearch(1);
    this.tickAutomation(1);
  }

  onHour() {
    this.payWagesHourly();
    this.tickMarket();
    this.tickAI();
    this.tickContracts();
    this.checkMissions();
    this.recordPriceHistory();
    this.emit();
  }

  onDay() {
    this.tickLoansDaily();
    this.tickEvents();
    this.applySoftInflationDaily();
    this.checkStrikes();
    this.tickPollutionFines();
    this.refreshMissions();
    this.spawnContracts();
    this.tickFuturesDaily();
    if (this.state.automation.autoUpgrade) this.autoUpgradeBuildings();
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

  // ——— Inventario / storage ———
  ensureWarehouse(locationId) {
    if (!this.state.warehouses[locationId]) {
      this.state.warehouses[locationId] = { capacity: 5000, stock: {} };
    }
    return this.state.warehouses[locationId];
  }

  storageUnits(itemId, qty) {
    const it = IM.itemById(itemId);
    if (!it) return qty;
    if (it.id === 'electricidad' || (it.isEnergy && it.unit === 'kWh')) return 0;
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

  stockQty(locationId, itemId) {
    return this.ensureWarehouse(locationId).stock[itemId]?.qty || 0;
  }

  stockQuality(locationId, itemId) {
    return this.ensureWarehouse(locationId).stock[itemId]?.quality || 0;
  }

  usedStorage(locationId) {
    const wh = this.ensureWarehouse(locationId);
    return Object.entries(wh.stock).reduce((a, [id, s]) => a + this.storageUnits(id, s.qty || 0), 0);
  }

  storageCap(locationId) {
    const wh = this.ensureWarehouse(locationId);
    let cap = wh.capacity;
    this.state.sites
      .filter((s) => s.locationId === locationId)
      .forEach((site) => {
        site.buildings.forEach((b) => {
          const def = IM.buildingById(b.type);
          if (def) cap += def.storage * (1 + 0.25 * ((b.level || 1) - 1));
        });
      });
    return cap;
  }

  addStock(locationId, itemId, qty, quality = 50) {
    if (qty <= 0) return 0;
    const wh = this.ensureWarehouse(locationId);
    const free = this.storageCap(locationId) - this.usedStorage(locationId);
    const unitW = this.storageUnits(itemId, 1);
    const maxBySpace = unitW <= 0 ? qty : free / unitW;
    const add = Math.min(qty, Math.max(0, maxBySpace));
    if (add <= 0) return 0;
    const cur = wh.stock[itemId] || { qty: 0, quality };
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
    if (!cur || cur.qty < qty - 1e-9) return false;
    cur.qty -= qty;
    if (cur.qty <= 1e-9) delete wh.stock[itemId];
    return true;
  }

  // ——— Sitios / edificios ———
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

  spend(amount) {
    if (amount <= 0) return true;
    if (this.state.money < amount) return false;
    this.state.money -= amount;
    this.state.stats.expenses += amount;
    return true;
  }

  earn(amount) {
    this.state.money += amount;
    this.state.stats.revenue += amount;
    this.state.profitLifetime += amount;
    this.state.profitYear += amount;
  }

  foundInCity(locationId) {
    const loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ciudad inválida' };
    if (this.state.sites.some((s) => s.locationId === locationId)) {
      return { ok: false, error: 'Ya tienes presencia aquí' };
    }
    const cost = IM_CONFIG.foundingOfficeCost * this.state.inflationIndex * (loc.laborCost || 1);
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    const site = this.getOrCreateSite(locationId);
    const def = IM.buildingById('oficina');
    site.buildings.push({
      id: IM.uid('bld'),
      type: 'oficina',
      level: 1,
      slots: [],
      efficiency: 1,
      maintenance: 1,
      employees: 4,
      automation: 0,
    });
    this.state.employees += 4;
    this.state.ui.selectedLocationId = locationId;
    this.log(`Fundación en ${loc.name} (−${IM.formatMoney(cost)})`, 'build');
    this.emit();
    return { ok: true, site };
  }

  localRichness(locationId, itemId) {
    const loc = IM.locationById(locationId);
    if (!loc || !loc.resources) return 0.35;
    const hit = loc.resources.find((r) => r.item === itemId);
    return hit ? hit.richness : 0.25;
  }

  buildBuilding(locationId, buildingTypeId) {
    const def = IM.buildingById(buildingTypeId);
    if (!def) return { ok: false, error: 'Edificio desconocido' };
    const loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ubicación inválida' };
    if (!this.state.sites.some((s) => s.locationId === locationId)) {
      const f = this.foundInCity(locationId);
      if (!f.ok) return f;
    }
    const cost = def.cost * (loc.laborCost || 1) * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    const site = this.getOrCreateSite(locationId);
    const building = {
      id: IM.uid('bld'),
      type: buildingTypeId,
      level: 1,
      slots: Array.from({ length: def.slots }, () => null),
      efficiency: 1,
      maintenance: 1,
      employees: Math.max(2, Math.ceil(def.slots * 3)),
      automation: this.hasTech('automatizacion') ? 1 : 0,
    };
    site.buildings.push(building);
    this.state.employees += building.employees;
    this.log(`Construido ${def.name} en ${loc.name}`, 'build');
    this.emit();
    return { ok: true, building };
  }

  upgradeBuilding(siteId, buildingId) {
    const site = this.state.sites.find((s) => s.id === siteId);
    const building = site?.buildings.find((b) => b.id === buildingId);
    if (!building) return { ok: false, error: 'Edificio no encontrado' };
    const def = IM.buildingById(building.type);
    const level = building.level || 1;
    if (level >= 5) return { ok: false, error: 'Nivel máximo (5)' };
    const cost = def.cost * 0.6 * level * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    building.level = level + 1;
    building.efficiency = 1 + 0.08 * (building.level - 1);
    const extraSlots = building.level % 2 === 0 ? 1 : 0;
    if (extraSlots && def.slots > 0) {
      building.slots.push(null);
    }
    building.employees += 2;
    this.state.employees += 2;
    if (this.hasTech('automatizacion_avanzada')) building.automation = Math.min(3, (building.automation || 0) + 1);
    this.log(`Mejora Nv.${building.level}: ${def.name}`, 'build');
    this.emit();
    return { ok: true };
  }

  installMachine(siteId, buildingId, slotIndex, machineId, recipeId, opts = {}) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) return { ok: false, error: 'Sitio no encontrado' };
    const building = site.buildings.find((b) => b.id === buildingId);
    if (!building) return { ok: false, error: 'Edificio no encontrado' };
    const mdef = IM.machineById(machineId);
    const recipe = IM.recipeById(recipeId);
    if (!mdef || !recipe) return { ok: false, error: 'Máquina o receta inválida' };
    if (recipe.building !== building.type) return { ok: false, error: 'Receta incompatible' };
    if (recipe.machine !== machineId) return { ok: false, error: 'Máquina incompatible' };
    if (recipe.tech && !this.hasTech(recipe.tech)) return { ok: false, error: 'Tecnología bloqueada' };
    if (slotIndex < 0 || slotIndex >= building.slots.length) return { ok: false, error: 'Slot inválido' };
    const cost = mdef.cost * this.state.inflationIndex * (1 - 0.05 * ((building.level || 1) - 1));
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    building.slots[slotIndex] = {
      machineId,
      recipeId,
      progress: 0,
      enabled: true,
      auto: true,
      autoBuy: true,
      priority: opts.priority || 5,
      minOutputStock: opts.minOutputStock ?? 0,
      maxOutputStock: opts.maxOutputStock ?? 1e12,
      produced: 0,
      downtime: 0,
      runtime: 0,
      lastBlockReason: null,
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
  getPlantMetrics(locationId) {
    if (!this.state.plantMetrics[locationId]) {
      this.state.plantMetrics[locationId] = {
        energyKwh: 0,
        waterM3: 0,
        output: 0,
        runtime: 0,
        downtime: 0,
        alerts: [],
      };
    }
    return this.state.plantMetrics[locationId];
  }

  tickProduction(gameMinutes) {
    const st = this.state;
    st.sites.forEach((site) => {
      const metrics = this.getPlantMetrics(site.locationId);
      metrics.alerts = [];
      const loc = IM.locationById(site.locationId);
      const energyMult = loc?.energyCost || 1;

      // Ordenar slots por prioridad
      const jobs = [];
      site.buildings.forEach((building) => {
        building.slots.forEach((slot, idx) => {
          if (slot) jobs.push({ building, slot, idx });
        });
      });
      jobs.sort((a, b) => (b.slot.priority || 5) - (a.slot.priority || 5));

      jobs.forEach(({ building, slot }) => {
        if (!slot.enabled) {
          slot.downtime += gameMinutes;
          return;
        }
        const recipe = IM.recipeById(slot.recipeId);
        const machine = IM.machineById(slot.machineId);
        if (!recipe || !machine) return;
        if (recipe.tech && !this.hasTech(recipe.tech)) {
          slot.lastBlockReason = 'tech';
          slot.downtime += gameMinutes;
          metrics.alerts.push(`Tech bloqueada: ${recipe.name}`);
          return;
        }

        // Límite de stock de salida
        const outId = recipe.outputs?.[0]?.item;
        if (outId && slot.maxOutputStock < 1e12) {
          if (this.stockQty(site.locationId, outId) >= slot.maxOutputStock) {
            slot.lastBlockReason = 'stock_max';
            slot.downtime += gameMinutes;
            return;
          }
        }

        const autoBonus = 1 + 0.12 * (building.automation || 0) + (this.hasTech('robotica_industrial') ? 0.1 : 0);
        const speed = machine.speed * building.efficiency * autoBonus * (st.strikeUntil && st.day < st.strikeUntil ? 0.2 : 1);

        // Extracción regional
        const isExtract = !recipe.inputs?.length;
        let richness = 1;
        if (isExtract && recipe.outputs?.[0]) {
          richness = this.localRichness(site.locationId, recipe.outputs[0].item);
          if (richness < 0.4 && !this.state.automation.autoExtract) {
            slot.lastBlockReason = 'recurso_pobre';
            metrics.alerts.push(`Recurso pobre para ${recipe.name}`);
          }
        }

        const energyNeed =
          ((recipe.energyKwh || 0) / Math.max(1, recipe.timeMinutes)) * gameMinutes * speed * energyMult;
        const waterNeed = ((recipe.waterM3 || 0) / Math.max(1, recipe.timeMinutes)) * gameMinutes * speed;

        if (energyNeed > 0 && this.stockQty(site.locationId, 'electricidad') < energyNeed) {
          if (slot.autoBuy && st.automation.autoBuyInputs) {
            this.buyFromMarket(site.locationId, 'electricidad', Math.max(energyNeed * 60, st.automation.minEnergyStock), true);
          }
          if (this.stockQty(site.locationId, 'electricidad') < energyNeed) {
            slot.lastBlockReason = 'energia';
            slot.downtime += gameMinutes;
            metrics.alerts.push('Sin electricidad');
            return;
          }
        }
        if (waterNeed > 0 && this.stockQty(site.locationId, 'agua_industrial') < waterNeed) {
          if (slot.autoBuy && st.automation.autoBuyInputs) {
            this.buyFromMarket(site.locationId, 'agua_industrial', Math.max(waterNeed * 30, st.automation.minWaterStock), true);
          }
          if (this.stockQty(site.locationId, 'agua_industrial') < waterNeed) {
            slot.lastBlockReason = 'agua';
            slot.downtime += gameMinutes;
            metrics.alerts.push('Sin agua industrial');
            return;
          }
        }

        if (slot.progress <= 0) {
          // Auto-buy inputs
          if (slot.autoBuy && st.automation.autoBuyInputs) {
            (recipe.inputs || []).forEach((inp) => {
              const have = this.stockQty(site.locationId, inp.item);
              if (have < inp.qty) {
                this.buyFromMarket(site.locationId, inp.item, inp.qty - have + inp.qty, true);
              }
            });
          }
          const canStart = (recipe.inputs || []).every(
            (inp) => this.stockQty(site.locationId, inp.item) >= inp.qty
          );
          if (!canStart) {
            slot.lastBlockReason = 'inputs';
            slot.downtime += gameMinutes;
            metrics.alerts.push(`Faltan inputs: ${recipe.name}`);
            return;
          }
          const outSpace = (recipe.outputs || []).reduce(
            (a, o) => a + this.storageUnits(o.item, o.qty),
            0
          );
          if (this.usedStorage(site.locationId) + outSpace > this.storageCap(site.locationId)) {
            slot.lastBlockReason = 'almacen';
            slot.downtime += gameMinutes;
            metrics.alerts.push('Almacén lleno');
            // Auto-sell if enabled
            if (st.automation.autoSellOutputs) this.autoSellAt(site.locationId);
            return;
          }
          (recipe.inputs || []).forEach((inp) => this.removeStock(site.locationId, inp.item, inp.qty));
          slot.progress = 0.0001;
          slot.batchQuality = this.computeBatchQuality(site, recipe, machine, building);
          slot.lastBlockReason = null;
        }

        if (energyNeed > 0) {
          this.removeStock(site.locationId, 'electricidad', Math.min(energyNeed, this.stockQty(site.locationId, 'electricidad')));
          metrics.energyKwh += energyNeed;
          st.stats.energySpent += energyNeed * this.priceOf('electricidad');
        }
        if (waterNeed > 0) {
          this.removeStock(site.locationId, 'agua_industrial', Math.min(waterNeed, this.stockQty(site.locationId, 'agua_industrial')));
          metrics.waterM3 += waterNeed;
          st.stats.waterSpent += waterNeed * this.priceOf('agua_industrial');
        }

        const need = recipe.timeMinutes / (speed * Math.max(0.35, richness));
        slot.progress += gameMinutes;
        slot.runtime += gameMinutes;
        metrics.runtime += gameMinutes;

        if (slot.progress >= need) {
          let q = slot.batchQuality || recipe.qualityBase || 50;
          // Rechazo por calidad
          if (q < IM_CONFIG.qualityRejectBelow) {
            st.rejectedLifetime += 1;
            metrics.alerts.push(`Lote rechazado (calidad ${q.toFixed(0)})`);
            this.addStock(site.locationId, 'lodos_industriales', 0.1, 10);
          } else {
            (recipe.outputs || []).forEach((out) => {
              const qty = out.qty * (isExtract ? Math.max(0.5, richness) : 1);
              const added = this.addStock(site.locationId, out.item, qty, q);
              if (added) {
                st.producedLifetime[out.item] = (st.producedLifetime[out.item] || 0) + added;
                slot.produced += added;
                metrics.output += added;
              }
            });
          }
          (recipe.byproducts || []).forEach((bp) => {
            this.addStock(site.locationId, bp.item, bp.qty, 20);
            if (bp.item.includes('recicl') || bp.item.includes('chatarra') || bp.item.includes('recuperado')) {
              st.recycledLifetime[bp.item] = (st.recycledLifetime[bp.item] || 0) + bp.qty;
              st.greenCredits += bp.qty * 0.1;
            }
          });
          const pol = (recipe.pollution || 0) * 0.01 * (IM.buildingById(building.type)?.pollutionBase || 1);
          st.pollutionTotal += pol;
          st.pollutionByLocation[site.locationId] = (st.pollutionByLocation[site.locationId] || 0) + pol;
          slot.progress = 0;
          slot.batchQuality = null;

          // Auto-sell outputs
          if (st.automation.autoSellOutputs && outId) {
            const qNow = this.stockQuality(site.locationId, outId);
            if (qNow >= st.automation.sellAboveQuality) {
              const qty = this.stockQty(site.locationId, outId);
              const keep = slot.minOutputStock || 0;
              if (qty > keep) this.sellToMarket(site.locationId, outId, qty - keep, true);
            }
          }
        }
      });
    });
  }

  computeBatchQuality(site, recipe, machine, building) {
    let q = recipe.qualityBase || 50;
    q += machine.quality || 0;
    q += (building.efficiency - 1) * 20;
    q += (building.automation || 0) * 3;
    if (this.hasTech('calidad_six_sigma')) q += 10;
    if (this.hasTech('calidad_metrologia')) q += 8;
    const inputs = recipe.inputs || [];
    if (inputs.length) {
      let sum = 0;
      inputs.forEach((inp) => {
        sum += this.stockQuality(site.locationId, inp.item) || 40;
      });
      q = q * 0.55 + (sum / inputs.length) * 0.45;
    }
    if (this.state.strikeUntil && this.state.day < this.state.strikeUntil) q -= 15;
    // Target automation pull
    const target = this.state.automation.targetQuality || 60;
    if (building.automation >= 2) q = q * 0.7 + target * 0.3;
    return IM.clamp(q + (Math.random() * 6 - 3), 1, IM_CONFIG.maxQuality);
  }

  // ——— Mercado / bolsa ———
  priceOf(itemId) {
    return this.state.prices[itemId] ?? IM.itemById(itemId)?.basePrice ?? 1;
  }

  recordPriceHistory() {
    // Solo muestrear una porción para no hinchar el save
    const ids = Object.keys(this.state.prices);
    const step = Math.max(1, Math.floor(ids.length / 80));
    for (let i = 0; i < ids.length; i += step) {
      const id = ids[i];
      if (!this.state.priceHistory[id]) this.state.priceHistory[id] = [];
      this.state.priceHistory[id].push(this.state.prices[id]);
      if (this.state.priceHistory[id].length > 48) this.state.priceHistory[id].shift();
    }
  }

  tickMarket() {
    const st = this.state;
    const crisis = st.categoryCrisis;
    (IM_DATA.items || []).forEach((it) => {
      const base = it.basePrice * st.inflationIndex;
      let demand = st.demand[it.id] || 1;
      let supply = st.supply[it.id] || 1;
      if (crisis && it.category === crisis.category) {
        demand *= crisis.demandMul || 1;
        supply *= crisis.supplyMul || 1;
      }
      const pressure = demand / Math.max(0.2, supply);
      const target = base * IM.clamp(0.75 + pressure * 0.28, 0.55, 2.0);
      const cur = st.prices[it.id] ?? base;
      st.prices[it.id] = cur * 0.94 + target * 0.06;
      // Floors utilities
      if (it.id === 'electricidad') st.prices[it.id] = Math.max(IM_CONFIG.energyPriceFloor * st.inflationIndex, st.prices[it.id]);
      if (it.id === 'agua_industrial') st.prices[it.id] = Math.max(IM_CONFIG.waterPriceFloor * st.inflationIndex, st.prices[it.id]);
      st.demand[it.id] = (demand - 1) * 0.985 + 1;
      st.supply[it.id] = (supply - 1) * 0.985 + 1;
    });
    st.competitors.forEach((c) => {
      const focusItems = (IM_DATA.items || []).filter((i) => i.category === c.focus).slice(0, 25);
      focusItems.forEach((it) => {
        st.demand[it.id] = (st.demand[it.id] || 1) + 0.012 * c.aggressiveness;
        st.supply[it.id] = (st.supply[it.id] || 1) + 0.008 * c.aggressiveness;
      });
    });
  }

  buyFromMarket(locationId, itemId, qty, silent = false) {
    const item = IM.itemById(itemId);
    if (!item || qty <= 0) return { ok: false, error: 'Pedido inválido' };
    const loc = IM.locationById(locationId);
    const tariff = (loc?.tariffs || 0) * (this.hasTech('comercio_global') ? 0.7 : 1);
    const energyTax = itemId === 'electricidad' ? loc?.energyCost || 1 : 1;
    const unit = this.priceOf(itemId) * (1 + tariff) * energyTax;
    const cost = unit * qty;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    if (this.usedStorage(locationId) + this.storageUnits(itemId, qty) > this.storageCap(locationId)) {
      return { ok: false, error: 'Sin capacidad de almacén' };
    }
    this.spend(cost);
    this.addStock(locationId, itemId, qty, 50);
    this.state.supply[itemId] = (this.state.supply[itemId] || 1) + qty * 0.0008;
    if (silent) this.state.stats.automationSaved += cost * 0.01;
    else this.log(`Compra ${IM.formatNum(qty)} ${item.unit} ${item.name}`, 'market');
    if (!silent) this.emit();
    return { ok: true, cost };
  }

  sellToMarket(locationId, itemId, qty, silent = false) {
    const item = IM.itemById(itemId);
    if (!item || qty <= 0) return { ok: false, error: 'Pedido inválido' };
    if (this.stockQty(locationId, itemId) < qty) return { ok: false, error: 'Stock insuficiente' };
    const q = this.stockQuality(locationId, itemId);
    if (q < IM_CONFIG.qualityRejectBelow) {
      this.state.rejectedLifetime += qty;
      this.removeStock(locationId, itemId, qty);
      if (!silent) this.log(`Rechazo de mercado: ${item.name} (calidad ${q.toFixed(0)})`, 'alert');
      return { ok: false, error: 'Calidad insuficiente — lote rechazado' };
    }
    let qualityMult = 0.75 + (q / 100) * 0.55;
    if (q >= IM_CONFIG.qualityPremiumAbove) qualityMult += 0.15;
    if (this.hasTech('calidad_metrologia') && q >= 70) qualityMult += 0.05;
    const unit = this.priceOf(itemId) * qualityMult;
    this.removeStock(locationId, itemId, qty);
    this.earn(unit * qty);
    this.state.soldLifetime[itemId] = (this.state.soldLifetime[itemId] || 0) + qty;
    this.state.demand[itemId] = Math.max(0.2, (this.state.demand[itemId] || 1) - qty * 0.0008);
    this.state.supply[itemId] = (this.state.supply[itemId] || 1) + qty * 0.0015;
    if (!silent) this.log(`Venta ${IM.formatNum(qty)} ${item.name} (+${IM.formatMoney(unit * qty)})`, 'market');
    if (!silent) this.emit();
    return { ok: true, revenue: unit * qty };
  }

  autoSellAt(locationId) {
    const wh = this.ensureWarehouse(locationId);
    Object.entries(wh.stock).forEach(([id, s]) => {
      if (id === 'electricidad' || id === 'agua_industrial') return;
      if (s.quality < this.state.automation.sellAboveQuality) return;
      if (s.qty > 10) this.sellToMarket(locationId, id, s.qty * 0.4, true);
    });
  }

  // ——— Logística ———
  startShipment(fromId, toId, itemId, qty, modeId, silent = false) {
    const mode = (IM_DATA.transportModes || []).find((m) => m.id === modeId);
    if (!mode) return { ok: false, error: 'Modo inválido' };
    if (mode.unlock && !this.hasTech(mode.unlock)) return { ok: false, error: 'Modo bloqueado' };
    if (fromId === toId) return { ok: false, error: 'Origen = destino' };
    if (this.stockQty(fromId, itemId) < qty) return { ok: false, error: 'Stock insuficiente' };
    const a = IM.locationById(fromId);
    const b = IM.locationById(toId);
    if (!a || !b) return { ok: false, error: 'Ubicación inválida' };
    if (mode.requiresPort && !(a.hasPort && b.hasPort)) return { ok: false, error: 'Se requieren puertos en origen y destino' };
    if (mode.requiresRail && !(a.hasRail && b.hasRail)) return { ok: false, error: 'Se requiere ferrocarril' };
    if (mode.requiresAirport && !(a.hasAirport && b.hasAirport)) return { ok: false, error: 'Se requieren aeropuertos' };

    const dist = IM.haversineKm(a.lat, a.lng, b.lat, b.lng);
    const techDiscount = this.hasTech('hubs_globales') ? 0.85 : this.hasTech('intermodal') ? 0.92 : 1;
    const batches = Math.ceil(qty / mode.capacity);
    const cost = dist * this.storageUnits(itemId, qty) * mode.costPerKmTon * this.state.inflationIndex * batches * 0.35 * techDiscount;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    const hours = (dist / mode.speedKmh) * Math.max(1, batches * 0.15);
    this.spend(cost);
    this.state.stats.freightSpent += cost;
    const q = this.stockQuality(fromId, itemId);
    this.removeStock(fromId, itemId, qty);
    const legs = mode.legs || [modeId];
    this.state.shipments.push({
      id: IM.uid('ship'),
      fromId,
      toId,
      itemId,
      qty,
      quality: q,
      modeId,
      legs,
      legIndex: 0,
      cost,
      remainingMinutes: hours * 60,
      totalMinutes: hours * 60,
      path: [
        [a.lat, a.lng],
        [b.lat, b.lng],
      ],
    });
    if (!silent) this.log(`Envío ${mode.name}: ${a.name} → ${b.name}`, 'logistics');
    if (!silent) this.emit();
    return { ok: true };
  }

  tickShipments(gameMinutes) {
    const left = [];
    this.state.shipments.forEach((sh) => {
      sh.remainingMinutes -= gameMinutes;
      if (sh.remainingMinutes <= 0) {
        this.addStock(sh.toId, sh.itemId, sh.qty, sh.quality);
        this.state.transportedLifetime[sh.itemId] = (this.state.transportedLifetime[sh.itemId] || 0) + sh.qty;
      } else left.push(sh);
    });
    this.state.shipments = left;
  }

  // ——— Automatización ———
  tickAutomation(gameMinutes) {
    const auto = this.state.automation;
    // Reglas de stock
    (auto.rules || []).forEach((rule) => {
      if (!rule.locationId || !rule.itemId) return;
      const qty = this.stockQty(rule.locationId, rule.itemId);
      if (rule.action === 'buy' && qty < (rule.min || 0)) {
        this.buyFromMarket(rule.locationId, rule.itemId, (rule.min - qty) + (rule.batch || 10), true);
      }
      if (rule.action === 'sell' && qty > (rule.max || 0)) {
        this.sellToMarket(rule.locationId, rule.itemId, qty - rule.max, true);
      }
    });
    // Rutas auto
    if (auto.autoTransport) {
      (auto.routes || []).forEach((rt) => {
        if (this.state.shipments.length > 40) return;
        const have = this.stockQty(rt.fromId, rt.itemId);
        if (have >= (rt.threshold || 20)) {
          const qty = Math.min(have - (rt.keep || 0), rt.qty || 20);
          if (qty > 0) this.startShipment(rt.fromId, rt.toId, rt.itemId, qty, rt.modeId || 'camion', true);
        }
      });
    }
    // Auto research queue
    if (auto.autoResearch && !this.state.researchQueue && this.state.researchAutoQueue.length) {
      const next = this.state.researchAutoQueue[0];
      const r = this.startResearch(next);
      if (r.ok) this.state.researchAutoQueue.shift();
    }
  }

  autoUpgradeBuildings() {
    this.state.sites.forEach((site) => {
      site.buildings.forEach((b) => {
        if ((b.level || 1) < 3 && Math.random() < 0.15) {
          this.upgradeBuilding(site.id, b.id);
        }
      });
    });
  }

  setAutomation(partial) {
    Object.assign(this.state.automation, partial);
    this.emit();
  }

  addAutomationRule(rule) {
    this.state.automation.rules.push({ id: IM.uid('rule'), ...rule });
    this.emit();
  }

  addAutomationRoute(route) {
    this.state.automation.routes.push({ id: IM.uid('route'), ...route });
    this.emit();
  }

  // ——— I+D ———
  startResearch(techId) {
    const tech = IM.techById(techId);
    if (!tech) return { ok: false, error: 'Tech inválida' };
    if (this.hasTech(techId)) return { ok: false, error: 'Ya investigada' };
    if (this.state.researchQueue) return { ok: false, error: 'Investigación en curso' };
    const missing = (tech.requires || []).filter((r) => !this.hasTech(r));
    if (missing.length) return { ok: false, error: 'Faltan requisitos' };
    const cost = tech.cost * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    const speed = this.hasTech('automatizacion_avanzada') ? 1.2 : 1;
    this.state.researchQueue = { techId, remaining: tech.time / speed, total: tech.time / speed };
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
    const maxLoan = 20000000 * (this.state.creditRating / 50);
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
    this.state.creditRating = IM.clamp(this.state.creditRating - 2, 20, 100);
    this.log(`Préstamo: ${IM.formatMoney(amount)}`, 'finance');
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
        else this.state.creditRating = IM.clamp(this.state.creditRating + 2, 20, 100);
      } else {
        this.state.creditRating = IM.clamp(this.state.creditRating - 4, 10, 100);
        loan.remainingDays -= 1;
        keep.push(loan);
        this.log('Impago de préstamo — rating baja.', 'alert');
      }
    });
    this.state.loans = keep;
  }

  payCorporateTax() {
    const tax = Math.max(0, this.state.profitYear) * IM_CONFIG.corporateTax;
    if (tax > 0) {
      this.state.money -= tax;
      this.state.stats.taxesPaid += tax;
      this.log(`Impuesto sociedades: ${IM.formatMoney(tax)}`, 'finance');
    }
  }

  payWagesHourly() {
    if (this.state.employees <= 0) return;
    let wage =
      this.state.employees *
      IM_CONFIG.employeeBaseWageHourly *
      this.state.wageMultiplier *
      this.state.inflationIndex;
    // Descuento por automatización media
    const autos = this.state.sites.flatMap((s) => s.buildings.map((b) => b.automation || 0));
    const avgAuto = autos.length ? autos.reduce((a, b) => a + b, 0) / autos.length : 0;
    wage *= Math.max(0.55, 1 - avgAuto * 0.12);
    this.state.money -= wage;
    this.state.stats.wagesPaid += wage;
    this.state.stats.expenses += wage;
    if (this.state.money < 0 && Math.random() < 0.04) {
      this.state.strikeUntil = this.state.day + 2;
      this.log('Huelga laboral (2 días).', 'alert');
    }
  }

  setWageMultiplier(m) {
    this.state.wageMultiplier = IM.clamp(m, 0.7, 2);
    if (m >= 1.1) this.state.strikeUntil = null;
    this.emit();
  }

  checkStrikes() {
    if (this.state.strikeUntil && this.state.day >= this.state.strikeUntil) {
      this.state.strikeUntil = null;
      this.log('Huelga terminada.', 'info');
    }
  }

  // ——— Contaminación ———
  tickPollutionFines() {
    const discount = this.hasTech('compliance_ambiental') ? 0.6 : 1;
    Object.entries(this.state.pollutionByLocation).forEach(([locId, pol]) => {
      const loc = IM.locationById(locId);
      if (!loc) return;
      const limit = loc.pollutionLimit || 100;
      if (pol > limit) {
        const fine = (pol - limit) * 500 * discount * this.state.inflationIndex;
        this.state.money -= fine;
        this.state.finesPaid += fine;
        this.state.pollutionByLocation[locId] = pol * 0.85;
        this.log(`Multa ambiental en ${loc.name}: ${IM.formatMoney(fine)}`, 'alert');
      } else if (this.state.greenCredits > 0 && pol < limit * 0.5) {
        const bonus = Math.min(this.state.greenCredits, 5) * 2000;
        this.state.greenCredits -= bonus / 2000;
        this.earn(bonus);
      }
      // Decay diario
      this.state.pollutionByLocation[locId] = (this.state.pollutionByLocation[locId] || 0) * 0.92;
    });
  }

  // ——— Contratos / misiones dinámicas ———
  spawnContracts() {
    if (this.state.contracts.length >= 8) return;
    const items = (IM_DATA.items || []).filter((i) => i.tier <= 4 && !i.isWaste && i.category !== 'energia');
    if (!items.length) return;
    const it = items[Math.floor(Math.random() * Math.min(500, items.length))];
    const locs = IM_DATA.locations || [];
    const loc = locs[Math.floor(Math.random() * locs.length)];
    const qty = Math.round(20 + Math.random() * 80);
    const minQ = 45 + Math.floor(Math.random() * 30);
    const price = this.priceOf(it.id) * (1.1 + Math.random() * 0.35);
    this.state.contracts.push({
      id: IM.uid('ctr'),
      itemId: it.id,
      qty,
      minQuality: minQ,
      locationId: loc.id,
      price,
      deadlineDay: this.state.day + 15 + Math.floor(Math.random() * 20),
      year: this.state.year,
      reward: price * qty * 0.15,
      status: 'open',
    });
    if (this.state.automation.autoAcceptContracts) {
      // nothing — already open for fulfillment
    }
  }

  tickContracts() {
    this.state.contracts.forEach((c) => {
      if (c.status !== 'open') return;
      if (c.year < this.state.year || (c.year === this.state.year && this.state.day > c.deadlineDay)) {
        c.status = 'failed';
        this.state.creditRating = IM.clamp(this.state.creditRating - 1, 20, 100);
        return;
      }
      const q = this.stockQuality(c.locationId, c.itemId);
      const have = this.stockQty(c.locationId, c.itemId);
      if (have >= c.qty && q >= c.minQuality) {
        this.removeStock(c.locationId, c.itemId, c.qty);
        this.earn(c.price * c.qty + c.reward);
        c.status = 'done';
        this.state.soldLifetime[c.itemId] = (this.state.soldLifetime[c.itemId] || 0) + c.qty;
        this.log(`Contrato cumplido: ${IM.itemById(c.itemId)?.name}`, 'mission');
        this.state.xp += 80;
      }
    });
    this.state.contracts = this.state.contracts.filter((c) => c.status === 'open' || (c.status === 'done' && false) || c.status === 'open');
    this.state.contracts = this.state.contracts.filter((c) => c.status === 'open');
  }

  // ——— Futuros ———
  openFuture(itemId, qty, direction) {
    if (!this.hasTech('bolsa_materias') && !this.state.unlockAll) {
      return { ok: false, error: 'Requiere tech Bolsa de materias primas' };
    }
    const price = this.priceOf(itemId);
    const margin = price * qty * 0.15;
    if (!this.canAfford(margin)) return { ok: false, error: 'Margen insuficiente' };
    this.spend(margin);
    this.state.futures.push({
      id: IM.uid('fut'),
      itemId,
      qty,
      direction, // 'long' | 'short'
      entry: price,
      margin,
      settleDay: this.state.day + 30,
      year: this.state.year,
    });
    this.emit();
    return { ok: true };
  }

  tickFuturesDaily() {
    const left = [];
    this.state.futures.forEach((f) => {
      if (f.year < this.state.year || (f.year === this.state.year && this.state.day >= f.settleDay)) {
        const now = this.priceOf(f.itemId);
        const delta = (now - f.entry) * f.qty * (f.direction === 'long' ? 1 : -1);
        this.state.money += f.margin + delta;
        this.log(`Futuro liquidado: ${delta >= 0 ? '+' : ''}${IM.formatMoney(delta)}`, 'finance');
      } else left.push(f);
    });
    this.state.futures = left;
  }

  // ——— Eventos ———
  tickEvents() {
    if (Math.random() > 0.14) return;
    const cats = ['metales', 'quimicos', 'energia', 'agricolas', 'electronica'];
    const events = [
      {
        title: 'Auge de demanda',
        desc: 'Sube la demanda industrial global.',
        apply: () => {
          cats.forEach((c) => {
            (IM_DATA.items || [])
              .filter((i) => i.category === c)
              .slice(0, 40)
              .forEach((i) => {
                this.state.demand[i.id] = (this.state.demand[i.id] || 1) * 1.12;
              });
          });
        },
      },
      {
        title: 'Crisis de categoría',
        desc: 'Shock de oferta/demanda en un sector.',
        apply: () => {
          const category = cats[Math.floor(Math.random() * cats.length)];
          this.state.categoryCrisis = {
            category,
            demandMul: 1.3,
            supplyMul: 0.7,
            untilDay: this.state.day + 20,
          };
        },
      },
      {
        title: 'Subsidio verde',
        desc: 'Ayudas a reciclaje y renovables.',
        apply: () => {
          this.state.money += 400000 * this.state.inflationIndex;
          this.state.greenCredits += 20;
        },
      },
      {
        title: 'Tensión energética',
        desc: 'Sube el precio de la electricidad.',
        apply: () => {
          this.state.prices.electricidad = (this.state.prices.electricidad || 0.12) * 1.3;
        },
      },
      {
        title: 'Buena cosecha',
        desc: 'Caen precios agrícolas.',
        apply: () => {
          (IM_DATA.items || [])
            .filter((i) => i.category === 'agricolas')
            .forEach((i) => {
              this.state.prices[i.id] *= 0.9;
            });
        },
      },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    ev.apply();
    if (this.state.categoryCrisis && this.state.day > this.state.categoryCrisis.untilDay) {
      this.state.categoryCrisis = null;
    }
    this.state.events.unshift({ title: ev.title, desc: ev.desc, day: this.state.day, year: this.state.year });
    if (this.state.events.length > 60) this.state.events.length = 60;
    this.log(`Evento: ${ev.title}`, 'event');
  }

  // ——— IA visible ———
  tickAI() {
    const locs = IM_DATA.locations || [];
    this.state.competitors.forEach((c) => {
      c.money *= 1 + 0.00025 * c.aggressiveness;
      c.marketShare = IM.clamp(c.marketShare + (Math.random() - 0.47) * 0.003 * c.aggressiveness, 0.01, 0.45);
      if (Math.random() < 0.08 * c.aggressiveness) {
        const loc = locs[Math.floor(Math.random() * Math.min(400, locs.length))];
        if (loc && !(c.sites || []).some((s) => s.locationId === loc.id)) {
          c.sites = c.sites || [];
          c.sites.push({ locationId: loc.id, buildings: 1 + Math.floor(Math.random() * 3) });
          c.money -= 200000;
          c.lastAction = `Construye en ${loc.name}`;
          this.state.supply[c.focus] = this.state.supply[c.focus]; // noop keep
          // pressure prices in focus
          (IM_DATA.items || [])
            .filter((i) => i.category === c.focus)
            .slice(0, 10)
            .forEach((it) => {
              this.state.supply[it.id] = (this.state.supply[it.id] || 1) + 0.05;
            });
        }
      }
      if (Math.random() < 0.02 * c.aggressiveness && c.money > 5000000) {
        c.lastAction = 'Oferta hostil de compra de cuota';
        c.marketShare = IM.clamp(c.marketShare + 0.01, 0.01, 0.5);
        this.state.creditRating = IM.clamp(this.state.creditRating - 0.2, 20, 100);
      }
    });
  }

  // ——— Misiones ———
  refreshMissions() {
    const chapter = this.state.missionChapter || 1;
    let available = (IM_DATA.missions || []).filter(
      (m) => m.chapter === chapter && !this.state.missionsCompleted[m.id]
    );
    // Dinámicas regionales
    if (this.state.sites.length && Math.random() < 0.5) {
      const site = this.state.sites[0];
      const loc = IM.locationById(site.locationId);
      const res = loc?.resources?.[0];
      if (res) {
        const dynId = `dyn_${chapter}_${site.locationId}_${res.item}`;
        if (!this.state.missionsCompleted[dynId]) {
          available = [
            {
              id: dynId,
              chapter,
              title: `Cadena regional: extraer y vender ${IM.itemById(res.item)?.name || res.item} en ${loc.name}`,
              description: 'Misión dinámica según recursos locales.',
              requirement: { type: 'produce', item: res.item, qty: 25 * chapter },
              reward: { money: 15000 * chapter, xp: 120 * chapter },
              unlocks: [],
            },
            ...available,
          ];
        }
      }
    }
    const active = available.slice(0, 6).map((m) => m.id);
    if (!active.length && chapter < 40) {
      this.state.missionChapter = chapter + 1;
      return this.refreshMissions();
    }
    this.state.activeMissionIds = active;
    // stash dynamic defs
    this._dynMissions = this._dynMissions || {};
    available.forEach((m) => {
      if (String(m.id).startsWith('dyn_')) this._dynMissions[m.id] = m;
    });
  }

  missionById(id) {
    return IM.missionById(id) || this._dynMissions?.[id];
  }

  checkMissions() {
    const st = this.state;
    st.activeMissionIds.forEach((mid) => {
      if (st.missionsCompleted[mid]) return;
      const m = this.missionById(mid);
      if (!m) return;
      if (this.missionSatisfied(m)) {
        st.missionsCompleted[mid] = true;
        st.money += m.reward.money || 0;
        st.xp += m.reward.xp || 0;
        (m.unlocks || []).forEach((tid) => {
          st.researched[tid] = true;
        });
        this.log(`Misión: ${m.title}`, 'mission');
      }
    });
    if (st.activeMissionIds.every((id) => st.missionsCompleted[id])) this.refreshMissions();
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
        const total = Object.values(st.warehouses).reduce((a, wh) => a + (wh.stock[r.item]?.qty || 0), 0);
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
        const total = Object.values(st.warehouses).reduce((a, wh) => a + (wh.stock[r.item]?.qty || 0), 0);
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

  oeeForLocation(locationId) {
    const m = this.getPlantMetrics(locationId);
    const total = m.runtime + m.downtime;
    if (!total) return 0;
    return IM.clamp(m.runtime / total, 0, 1);
  }
};
