/** Sistemas v3: campaña, blueprints, B2B, niebla, FX, estaciones, mantenimiento */
window.IM = window.IM || {};

(function extendGame() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) {
    console.warn('IM.Game no cargado aún');
    return;
  }

  const _init = Proto.init;
  Proto.init = function (saved) {
    IM.currentGame = this;
    _init.call(this, saved);
    IM.currentGame = this;
    const st = this.state;
    st.discoveredLocations = st.discoveredLocations || [];
    st.campaignChapter = st.campaignChapter || 1;
    st.campaignOnly = true;
    st.chainProgress = st.chainProgress || {};
    st.activeChainId = st.activeChainId || (IM_DATA.productChains?.[0]?.id || null);
    st.blueprints = st.blueprints || [];
    st.b2bOrders = st.b2bOrders || [];
    st.b2bReputation = st.b2bReputation || {};
    (IM_DATA.b2bClients || []).forEach((c) => {
      if (st.b2bReputation[c.id] == null) st.b2bReputation[c.id] = c.reputation;
    });
    st.fogExplored = st.fogExplored || {};
    st.fx = Object.assign({ EUR: 1, USD: 0.92, GBP: 1.17, JPY: 0.0061, CNY: 0.13, BRL: 0.16 }, IM_DATA.fxRates || {}, st.fx || {});
    st.season = st.season || 'primavera';
    st.policies = st.policies || JSON.parse(JSON.stringify(IM_DATA.countryPolicies || {}));
    st.placeMode = st.placeMode || false;
    st.ui = Object.assign(st.ui || {}, { mapSearch: '', plannerSiteId: null });
    if (!st.sites) st.sites = [];
    // Partida limpia: sin edificios predefinidos
    if (!saved) {
      st.sites = [];
      st.warehouses = {};
      st.money = IM_CONFIG.startingMoney;
      st.discoveredLocations = [];
    }
    this._initWorker();
    this.refreshMissions();
    this.emit();
  };

  Proto._initWorker = function () {
    if (this._worker) return;
    try {
      this._worker = new Worker('js/game/marketWorker.js');
      this._workerBusy = false;
      this._worker.onmessage = (ev) => {
        this._workerBusy = false;
        if (ev.data?.type !== 'tickMarketAIResult') return;
        const p = ev.data.payload;
        Object.assign(this.state.prices, p.prices);
        Object.assign(this.state.demand, p.demand);
        Object.assign(this.state.supply, p.supply);
        this.state.competitors = p.competitors;
      };
    } catch (e) {
      this._worker = null;
    }
  };

  Proto.campaignUnlocked = function (feature) {
    const chapter = this.state.campaignChapter || 1;
    const chapters = IM_DATA.campaignChapters || [];
    const unlocked = new Set();
    chapters.forEach((c) => {
      if (c.id <= chapter) (c.unlocks || []).forEach((u) => unlocked.add(u));
    });
    // Chapter 1 basics always
    unlocked.add('build');
    unlocked.add('market');
    return unlocked.has(feature);
  };

  Proto.registerLocation = function (loc) {
    if (!loc?.id) return null;
    const exists = this.state.discoveredLocations.find((l) => l.id === loc.id);
    if (exists) return exists;
    // merge nearby same name
    const near = this.state.discoveredLocations.find(
      (l) => Math.abs(l.lat - loc.lat) < 0.05 && Math.abs(l.lng - loc.lng) < 0.05
    );
    if (near) return near;
    loc.fog = true;
    this.state.discoveredLocations.push(loc);
    return loc;
  };

  Proto.exploreLocation = function (locationId) {
    const loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ubicación desconocida' };
    if (this.state.fogExplored[locationId]) return { ok: true, loc };
    const cost = IM_CONFIG.exploreCost * this.state.inflationIndex;
    if (!this.canAfford(cost)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(cost);
    this.state.fogExplored[locationId] = true;
    loc.fog = false;
    loc.discovered = true;
    this.log(`Exploración industrial en ${loc.name}: recursos revelados.`, 'info');
    this.emit();
    return { ok: true, loc };
  };

  Proto.foundAtCoordinates = async function (lat, lng) {
    if (!this.campaignUnlocked('build')) return { ok: false, error: 'Bloqueado por campaña' };
    this.log('Detectando ciudad (OpenStreetMap)…', 'info');
    const loc = await IM.Geo.reverse(lat, lng);
    const registered = this.registerLocation(loc);
    const r = this.foundInCity(registered.id);
    if (r.ok) {
      // Auto-explore on found
      this.state.fogExplored[registered.id] = true;
      registered.fog = false;
    }
    return { ...r, loc: registered };
  };

  const _foundInCity = Proto.foundInCity;
  Proto.foundInCity = function (locationId) {
    // Ensure location exists in discovered
    let loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ciudad no registrada. Haz click en el mapa.' };
    this.registerLocation(loc);
    return _foundInCity.call(this, locationId);
  };

  const _buildBuilding = Proto.buildBuilding;
  Proto.buildBuilding = function (locationId, buildingTypeId) {
    const loc = IM.locationById(locationId);
    if (loc && !this.state.fogExplored[locationId]) {
      const ex = this.exploreLocation(locationId);
      if (!ex.ok) return ex;
    }
    const r = _buildBuilding.call(this, locationId, buildingTypeId);
    if (r.ok) {
      // Specialization bonus
      const spec = loc?.specialization;
      const def = IM.buildingById(buildingTypeId);
      if (spec && def) {
        const map = {
          agro: ['granja', 'almazara', 'azucarera', 'molino_harinero'],
          electronica: ['electronica'],
          mineria: ['mina', 'planta_concentracion', 'fundicion'],
          energia: ['central_termica', 'central_ciclo_combinado', 'parque_solar', 'parque_eolico', 'refineria'],
          industria: ['fundicion', 'laminacion', 'planta_quimica'],
          logistica: ['almacen', 'puerto', 'terminal_ferroviaria'],
        };
        if ((map[spec] || []).includes(buildingTypeId)) {
          const b = this.state.sites.find((s) => s.locationId === locationId)?.buildings.slice(-1)[0];
          if (b) {
            b.efficiency = (b.efficiency || 1) * 1.12;
            b.specBonus = true;
            this.log(`Bonus de especialización (${spec}) en ${loc.name}`, 'build');
          }
        }
      }
    }
    return r;
  };

  // ——— Mantenimiento ———
  const _tickProduction = Proto.tickProduction;
  Proto.tickProduction = function (gameMinutes) {
    // Wear
    this.state.sites.forEach((site) => {
      site.buildings.forEach((b) => {
        b.slots.forEach((slot) => {
          if (!slot || !slot.enabled) return;
          slot.condition = slot.condition == null ? 1 : slot.condition;
          slot.condition = Math.max(0.15, slot.condition - IM_CONFIG.maintenanceWearPerHour * (gameMinutes / 60));
          if (slot.condition < 0.4) {
            slot.lastBlockReason = 'mantenimiento';
            if (this.state.automation?.autoRepair && this.hasTech('automatizacion')) {
              this.repairSlot(site.id, b.id, slot);
            } else if (slot.condition < 0.25) {
              slot.enabled = false;
            }
          }
        });
      });
    });
    // Season modifiers for extract agro
    const seasonMul = this.seasonMultiplier();
    this._seasonMul = seasonMul;
    _tickProduction.call(this, gameMinutes);
  };

  Proto.repairSlot = function (siteId, buildingId, slot) {
    const cost = 5000 * this.state.inflationIndex * (1.1 - (slot.condition || 0));
    if (!this.canAfford(cost)) return false;
    this.spend(cost);
    slot.condition = 1;
    slot.enabled = true;
    slot.lastBlockReason = null;
    return true;
  };

  Proto.seasonMultiplier = function () {
    const s = this.state.season;
    if (s === 'verano') return { agro: 1.2, logistics: 0.95, energy: 1.1 };
    if (s === 'invierno') return { agro: 0.7, logistics: 0.85, energy: 1.25 };
    if (s === 'otoño') return { agro: 1.05, logistics: 1.0, energy: 1.0 };
    return { agro: 1.0, logistics: 1.0, energy: 0.95 }; // primavera
  };

  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    // Seasons
    const cycle = IM_CONFIG.seasonCycleDays || 90;
    const idx = Math.floor(((this.state.day - 1) % (cycle * 4)) / cycle);
    this.state.season = ['primavera', 'verano', 'otoño', 'invierno'][idx];
    // FX drift
    Object.keys(this.state.fx || {}).forEach((k) => {
      if (k === 'EUR') return;
      this.state.fx[k] *= 1 + (Math.random() - 0.5) * 0.01;
    });
    // Policy events
    if (Math.random() < 0.08) this.tickPolicyEvent();
    // B2B spawn
    if (this.campaignUnlocked('b2b') && Math.random() < 0.35) this.spawnB2BOrder();
    this.tickB2BOrders();
    this.updateChainProgress();
    this.checkCampaignAdvance();
  };

  Proto.tickPolicyEvent = function () {
    const codes = Object.keys(this.state.policies || {});
    if (!codes.length) return;
    const code = codes[Math.floor(Math.random() * codes.length)];
    const p = this.state.policies[code];
    if (!p || code === 'DEFAULT') return;
    if (Math.random() < 0.5) {
      p.subsidyGreen = IM.clamp((p.subsidyGreen || 0) + 0.02, 0, 0.25);
      this.log(`Política verde reforzada en ${p.name || code}`, 'event');
    } else {
      p.tariffExtra = IM.clamp((p.tariffExtra || 0) + 0.01, 0, 0.15);
      this.log(`Aranceles temporales en ${p.name || code}`, 'event');
    }
    this.state.events.unshift({
      title: `Regulación: ${p.name || code}`,
      desc: `Subsidio verde ${(p.subsidyGreen * 100).toFixed(0)}% · arancel extra ${(p.tariffExtra * 100).toFixed(0)}%`,
      day: this.state.day,
      year: this.state.year,
    });
  };

  // FX-aware market buy
  const _buy = Proto.buyFromMarket;
  Proto.buyFromMarket = function (locationId, itemId, qty, silent = false) {
    const loc = IM.locationById(locationId);
    const policy = this.state.policies?.[loc?.countryCode] || this.state.policies?.DEFAULT;
    const r = _buy.call(this, locationId, itemId, qty, true);
    if (!r.ok) return r;
    // Apply FX + policy tariff as surcharge already partly in buy — add policy extra
    if (policy?.tariffExtra && r.cost) {
      const extra = r.cost * policy.tariffExtra;
      this.state.money -= extra;
      this.state.stats.expenses += extra;
    }
    // Subsidy agro refund
    const item = IM.itemById(itemId);
    if (policy?.subsidyAgro && item?.category === 'agricolas') {
      const refund = (r.cost || 0) * policy.subsidyAgro;
      this.state.money += refund;
    }
    if (!silent) {
      const cur = loc?.currency || 'EUR';
      this.log(`Compra ${item?.name} (${cur})`, 'market');
      this.emit();
    }
    return r;
  };

  // ——— Blueprints ———
  Proto.saveBlueprint = function (siteId, name) {
    if (!this.campaignUnlocked('blueprints')) return { ok: false, error: 'Desbloquea el capítulo de automatización' };
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) return { ok: false, error: 'Sitio no encontrado' };
    const bp = {
      id: IM.uid('bp'),
      name: name || site.name,
      buildings: site.buildings.map((b) => ({
        type: b.type,
        level: b.level || 1,
        slots: b.slots.map((s) =>
          s
            ? {
                machineId: s.machineId,
                recipeId: s.recipeId,
                priority: s.priority,
                maxOutputStock: s.maxOutputStock,
              }
            : null
        ),
      })),
    };
    this.state.blueprints.push(bp);
    this.log(`Blueprint guardado: ${bp.name}`, 'build');
    this.emit();
    return { ok: true, bp };
  };

  Proto.applyBlueprint = function (locationId, blueprintId) {
    if (!this.campaignUnlocked('blueprints')) return { ok: false, error: 'Bloqueado' };
    const bp = this.state.blueprints.find((b) => b.id === blueprintId);
    if (!bp) return { ok: false, error: 'Blueprint inexistente' };
    if (!this.state.sites.some((s) => s.locationId === locationId)) {
      const f = this.foundInCity(locationId);
      if (!f.ok) return f;
    }
    for (const bd of bp.buildings) {
      const r = this.buildBuilding(locationId, bd.type);
      if (!r.ok) return r;
      const site = this.state.sites.find((s) => s.locationId === locationId);
      const building = site.buildings[site.buildings.length - 1];
      while ((building.level || 1) < (bd.level || 1)) {
        const u = this.upgradeBuilding(site.id, building.id);
        if (!u.ok) break;
      }
      (bd.slots || []).forEach((slot, idx) => {
        if (!slot) return;
        if (!building.slots[idx]) {
          // ensure slot exists
          while (building.slots.length <= idx) building.slots.push(null);
        }
        this.installMachine(site.id, building.id, idx, slot.machineId, slot.recipeId, {
          priority: slot.priority || 5,
          maxOutputStock: slot.maxOutputStock || 1e12,
        });
      });
    }
    this.log(`Blueprint aplicado en ${IM.locationById(locationId)?.name}`, 'build');
    this.emit();
    return { ok: true };
  };

  // Auto-expand by resource
  Proto.autoExpandResource = async function (itemId, minRichness = 1.1, count = 3) {
    if (!this.campaignUnlocked('auto_expand')) return { ok: false, error: 'Bloqueado por campaña' };
    // Search among discovered locations first
    const candidates = this.state.discoveredLocations
      .filter((l) => (l.resources || []).some((r) => r.item === itemId && r.richness >= minRichness))
      .filter((l) => !this.state.sites.some((s) => s.locationId === l.id))
      .slice(0, count);
    let made = 0;
    for (const loc of candidates) {
      const f = this.foundInCity(loc.id);
      if (!f.ok) continue;
      const btype = itemId.includes('petroleo') || itemId.includes('gas') ? 'pozo_petroleo' : itemId.includes('aceituna') || itemId.includes('trigo') || itemId.includes('maiz') ? 'granja' : 'mina';
      const b = this.buildBuilding(loc.id, btype);
      if (b.ok) made++;
    }
    this.log(`Auto-expansión ${itemId}: ${made} plantas`, 'build');
    this.emit();
    return { ok: true, made };
  };

  // ——— B2B ———
  Proto.spawnB2BOrder = function () {
    if (this.state.b2bOrders.length >= 6) return;
    const clients = IM_DATA.b2bClients || [];
    if (!clients.length) return;
    const c = clients[Math.floor(Math.random() * clients.length)];
    const itemId = c.preferred[Math.floor(Math.random() * c.preferred.length)];
    if (!IM.itemById(itemId)) return;
    const qty = 10 + Math.floor(Math.random() * 40);
    this.state.b2bOrders.push({
      id: IM.uid('b2b'),
      clientId: c.id,
      itemId,
      qty,
      minQuality: c.minQuality,
      priceMul: 1.15 + (this.state.b2bReputation[c.id] || 50) / 500,
      deadlineDay: this.state.day + 20,
      year: this.state.year,
      recurring: Math.random() > 0.6,
    });
  };

  Proto.tickB2BOrders = function () {
    const keep = [];
    this.state.b2bOrders.forEach((o) => {
      if (o.year < this.state.year || (o.year === this.state.year && this.state.day > o.deadlineDay)) {
        this.state.b2bReputation[o.clientId] = IM.clamp((this.state.b2bReputation[o.clientId] || 50) - 5, 0, 100);
        this.log(`Pedido B2B fallido (${IM_DATA.b2bClients.find((c) => c.id === o.clientId)?.name})`, 'alert');
        return;
      }
      // Try fulfill from any warehouse
      let fulfilled = false;
      for (const site of this.state.sites) {
        const q = this.stockQuality(site.locationId, o.itemId);
        const have = this.stockQty(site.locationId, o.itemId);
        if (have >= o.qty && q >= o.minQuality) {
          this.removeStock(site.locationId, o.itemId, o.qty);
          const rev = this.priceOf(o.itemId) * o.qty * o.priceMul;
          this.earn(rev);
          this.state.b2bReputation[o.clientId] = IM.clamp((this.state.b2bReputation[o.clientId] || 50) + 3, 0, 100);
          this.state.soldLifetime[o.itemId] = (this.state.soldLifetime[o.itemId] || 0) + o.qty;
          this.log(`Pedido B2B cumplido (+${IM.formatMoney(rev)})`, 'mission');
          fulfilled = true;
          if (o.recurring) {
            keep.push({
              ...o,
              id: IM.uid('b2b'),
              deadlineDay: this.state.day + 25,
              year: this.state.year,
            });
          }
          break;
        }
      }
      if (!fulfilled) keep.push(o);
    });
    this.state.b2bOrders = keep;
  };

  // ——— Cadenas ———
  Proto.updateChainProgress = function () {
    const chains = IM_DATA.productChains || [];
    chains.forEach((chain) => {
      if (!this.state.chainProgress[chain.id]) {
        this.state.chainProgress[chain.id] = { step: 0, done: false };
      }
      const prog = this.state.chainProgress[chain.id];
      if (prog.done) return;
      const step = chain.steps[prog.step];
      if (!step) {
        prog.done = true;
        return;
      }
      let ok = false;
      if (step.action === 'produce') ok = (this.state.producedLifetime[step.item] || 0) >= step.qty;
      if (step.action === 'sell') ok = (this.state.soldLifetime[step.item] || 0) >= step.qty;
      if (ok) {
        prog.step += 1;
        if (prog.step >= chain.steps.length) {
          prog.done = true;
          this.state.money += chain.reward.money || 0;
          this.state.xp += chain.reward.xp || 0;
          this.log(`Cadena completada: ${chain.name}`, 'mission');
          if (chain.reward.chapter) {
            this.state.campaignChapter = Math.max(this.state.campaignChapter, chain.reward.chapter);
          }
        }
      }
    });
  };

  Proto.checkCampaignAdvance = function () {
    // Advance chapter if enough XP / chains
    const xp = this.state.xp || 0;
    const thresholds = [0, 200, 600, 1200, 2000, 3500];
    let ch = 1;
    for (let i = 0; i < thresholds.length; i++) if (xp >= thresholds[i]) ch = i + 1;
    if (ch > this.state.campaignChapter) {
      this.state.campaignChapter = ch;
      const meta = (IM_DATA.campaignChapters || []).find((c) => c.id === ch);
      this.log(`Campaña: capítulo ${ch}${meta ? ' — ' + meta.name : ''}`, 'mission');
    }
  };

  const _missionSatisfied = Proto.missionSatisfied;
  Proto.missionSatisfied = function (m) {
    if (m.requirement?.type === 'site_count') {
      return this.state.sites.length >= (m.requirement.qty || 1);
    }
    return _missionSatisfied.call(this, m);
  };

  const _missionProgress = Proto.missionProgress;
  Proto.missionProgress = function (m) {
    if (m.requirement?.type === 'site_count') {
      return IM.clamp(this.state.sites.length / (m.requirement.qty || 1), 0, 1);
    }
    return _missionProgress.call(this, m);
  };

  // Worker market tick override
  const _tickMarket = Proto.tickMarket;
  Proto.tickMarket = function () {
    if (this._worker && !this._workerBusy) {
      this._workerBusy = true;
      const items = (IM_DATA.items || []).map((i) => ({ id: i.id, basePrice: i.basePrice, category: i.category }));
      // Send subset if huge — sample for performance, then full local for utilities
      const sample = items.length > 2500 ? items.filter((_, idx) => idx % 3 === 0) : items;
      this._worker.postMessage({
        type: 'tickMarketAI',
        payload: {
          items: sample,
          prices: this.state.prices,
          demand: this.state.demand,
          supply: this.state.supply,
          inflationIndex: this.state.inflationIndex,
          competitors: this.state.competitors,
          categoryCrisis: this.state.categoryCrisis,
          energyFloor: IM_CONFIG.energyPriceFloor,
          waterFloor: IM_CONFIG.waterPriceFloor,
        },
      });
      // Still run a light local pass for electricity/water floors
      ['electricidad', 'agua_industrial'].forEach((id) => {
        const it = IM.itemById(id);
        if (!it) return;
        this.state.prices[id] = Math.max(
          (id === 'electricidad' ? IM_CONFIG.energyPriceFloor : IM_CONFIG.waterPriceFloor) * this.state.inflationIndex,
          this.state.prices[id] || it.basePrice
        );
      });
      return;
    }
    _tickMarket.call(this);
  };

  // Planner helper
  Proto.getFactoryFlow = function (siteId) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) return null;
    const nodes = [];
    const edges = [];
    site.buildings.forEach((b) => {
      b.slots.forEach((slot, idx) => {
        if (!slot) return;
        const recipe = IM.recipeById(slot.recipeId);
        if (!recipe) return;
        const id = `${b.id}_${idx}`;
        nodes.push({
          id,
          label: recipe.name,
          building: IM.buildingById(b.type)?.name,
          block: slot.lastBlockReason,
          condition: slot.condition ?? 1,
          priority: slot.priority,
        });
        (recipe.inputs || []).forEach((inp) => {
          edges.push({ from: inp.item, to: id, qty: inp.qty, kind: 'in' });
        });
        (recipe.outputs || []).forEach((out) => {
          edges.push({ from: id, to: out.item, qty: out.qty, kind: 'out' });
        });
      });
    });
    return { nodes, edges, locationId: site.locationId };
  };

  // Enable autoRepair flag default
  const _create = IM.createInitialState;
  IM.createInitialState = function () {
    const st = _create();
    st.discoveredLocations = [];
    st.sites = [];
    st.warehouses = {};
    st.money = IM_CONFIG.startingMoney;
    st.campaignChapter = 1;
    st.campaignOnly = true;
    st.chainProgress = {};
    st.activeChainId = IM_DATA.productChains?.[0]?.id || null;
    st.blueprints = [];
    st.b2bOrders = [];
    st.b2bReputation = {};
    st.fogExplored = {};
    st.fx = { ...(IM_DATA.fxRates || { EUR: 1 }) };
    st.season = 'primavera';
    st.policies = JSON.parse(JSON.stringify(IM_DATA.countryPolicies || {}));
    st.automation = Object.assign(st.automation || {}, { autoRepair: true });
    st.ui = Object.assign(st.ui || {}, { panel: 'mapa', selectedLocationId: null, placeMode: true });
    return st;
  };
})();
