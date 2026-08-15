/** Motor RoI: producción, almacenes, camiones, contratos semanales, estaciones */
window.IM = window.IM || {};

IM.createInitialState = function () {
  const world = IM.WorldGen.generate(200014);
  return {
    version: IM_CONFIG.version,
    companyName: 'Industrias Málaga S.L.',
    money: IM_CONFIG.startingMoney,
    year: IM_CONFIG.startYear || 2000,
    day: 1,
    tick: 0,
    speed: 1,
    paused: false,
    researched: {},
    unlockAll: false,
    buildings: [],
    trucks: [],
    routes: [],
    contracts: [],
    contractHistory: [],
    log: [],
    stats: { sold: 0, produced: 0, contractsDone: 0, contractsFail: 0 },
    world,
    ui: {
      tool: 'select',
      buildId: null,
      selectedId: null,
      camX: 10,
      camY: 8,
      panel: 'build',
      hover: null,
    },
    hqPlaced: false,
  };
};

IM.Game = class Game {
  constructor() {
    this.state = null;
    this.listeners = new Set();
    this._acc = 0;
  }

  init(saved) {
    this.state = saved || IM.createInitialState();
    const st = this.state;
    st.contracts = st.contracts || [];
    st.trucks = st.trucks || [];
    st.routes = st.routes || [];
    st.researched = st.researched || {};
    st.ui = Object.assign(IM.createInitialState().ui, st.ui || {});
    if (!st.contracts.length) this.refreshWeeklyContracts();
    this.emit();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((fn) => {
      try { fn(this.state); } catch (e) { console.error(e); }
    });
  }

  log(msg, type = 'info') {
    this.state.log.unshift({ t: Date.now(), msg, type, day: this.state.day, year: this.state.year });
    if (this.state.log.length > 120) this.state.log.length = 120;
  }

  setSpeed(s) {
    this.state.speed = s;
    this.state.paused = s === 0;
    this.emit();
  }

  season() {
    return IM.season(this.state.day);
  }

  hasTech(id) {
    return this.state.unlockAll || !!this.state.researched[id];
  }

  canAfford(n) {
    return this.state.money >= n;
  }

  spend(n) {
    this.state.money -= n;
  }

  earn(n) {
    this.state.money += n;
  }

  /** Trucos de dinero / desbloqueo */
  applyCheat(code) {
    const c = String(code || '').trim().toUpperCase();
    if (c === (IM_CONFIG.cheatMoneyCode || 'PASTA_GORDA')) {
      const amt = IM_CONFIG.cheatMoneyAmount || 500000;
      this.earn(amt);
      this.log(`Truco ${c}: +${IM.formatMoney(amt)}`, 'cheat');
      this.emit();
      return { ok: true, msg: `+${IM.formatMoney(amt)}` };
    }
    if (c === 'MILLON_EXPRESS') {
      this.earn(1000000);
      this.log('Truco MILLON_EXPRESS: +1.000.000 €', 'cheat');
      this.emit();
      return { ok: true, msg: '+1.000.000 €' };
    }
    if (c === 'SOCORRO_CAJA') {
      this.state.money = Math.max(this.state.money, 100000);
      this.log('Truco SOCORRO_CAJA: tesorería mínima 100.000 €', 'cheat');
      this.emit();
      return { ok: true, msg: 'Caja saneada a ≥ 100.000 €' };
    }
    if (c === (IM_CONFIG.cheatUnlockCode || 'INDUSTRIA_TOTAL')) {
      this.state.unlockAll = true;
      (IM_DATA.techs || []).forEach((t) => { this.state.researched[t.id] = true; });
      this.log('Truco INDUSTRIA_TOTAL: todo desbloqueado', 'cheat');
      this.emit();
      return { ok: true, msg: 'I+D completo' };
    }
    if (c === 'REPUTACION_MAX') {
      (this.state.world.towns || []).forEach((t) => { t.reputation = 100; t.shopClosedUntil = null; });
      this.log('Truco REPUTACION_MAX', 'cheat');
      this.emit();
      return { ok: true, msg: 'Reputación al máximo' };
    }
    return { ok: false, error: 'Código desconocido' };
  }

  tile(x, y) {
    const w = this.state.world;
    if (y < 0 || x < 0 || y >= w.H || x >= w.W) return null;
    return w.tiles[y][x];
  }

  buildingAt(x, y) {
    return this.state.buildings.find(
      (b) => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h
    );
  }

  unlockedBuilding(def) {
    if (!def.unlock) return true;
    return this.hasTech(def.unlock);
  }

  canPlace(def, x, y) {
    if (!def) return { ok: false, error: 'Edificio inválido' };
    if (!this.unlockedBuilding(def)) return { ok: false, error: 'Bloqueado por I+D' };
    if (def.id !== 'hq' && !this.state.hqPlaced) return { ok: false, error: 'Coloca primero la Sede' };
    if (def.id === 'hq' && this.state.hqPlaced) return { ok: false, error: 'Ya tienes sede' };
    for (let dy = 0; dy < def.h; dy++) {
      for (let dx = 0; dx < def.w; dx++) {
        const t = this.tile(x + dx, y + dy);
        if (!t) return { ok: false, error: 'Fuera del mapa' };
        if (t.buildingId) return { ok: false, error: 'Ocupado' };
        if (t.terrain === 'town') return { ok: false, error: 'Terreno del pueblo' };
        if (t.terrain === 'water' && !(def.needs || []).includes('water')) {
          return { ok: false, error: 'Sobre agua' };
        }
        const terr = IM_DATA.terrain[t.terrain];
        if (terr && terr.build === false && t.terrain !== 'coast') {
          return { ok: false, error: 'No edificable' };
        }
      }
    }
    if (def.needs?.length) {
      let okNeed = false;
      for (let dy = 0; dy < def.h; dy++) {
        for (let dx = 0; dx < def.w; dx++) {
          const t = this.tile(x + dx, y + dy);
          const res = IM_DATA.terrain[t.terrain]?.resource;
          if (def.needs.includes(res) || def.needs.includes(t.terrain)) okNeed = true;
          if (def.needs.includes('water') && (t.terrain === 'water' || t.terrain === 'coast')) okNeed = true;
        }
      }
      // también adyacente costa para bomba
      if (!okNeed && def.needs.includes('water')) {
        for (let dy = -1; dy <= def.h; dy++) {
          for (let dx = -1; dx <= def.w; dx++) {
            const t = this.tile(x + dx, y + dy);
            if (t && (t.terrain === 'water' || t.terrain === 'coast')) okNeed = true;
          }
        }
      }
      if (!okNeed) return { ok: false, error: `Requiere: ${def.needs.join(', ')}` };
    }
    return { ok: true };
  }

  placeBuilding(typeId, x, y) {
    const def = IM.building(typeId);
    const check = this.canPlace(def, x, y);
    if (!check.ok) return check;
    const cost = def.cost || 0;
    if (!this.canAfford(cost)) return { ok: false, error: 'Sin fondos' };
    this.spend(cost);
    const b = {
      id: IM.uid('b'),
      type: typeId,
      x,
      y,
      w: def.w,
      h: def.h,
      stock: {},
      progress: 0,
      recipeId: def.recipe || null,
    };
    this.state.buildings.push(b);
    for (let dy = 0; dy < def.h; dy++) {
      for (let dx = 0; dx < def.w; dx++) {
        const t = this.tile(x + dx, y + dy);
        if (t) t.buildingId = b.id;
      }
    }
    if (typeId === 'hq') this.state.hqPlaced = true;
    this.log(`Construido ${def.name} en (${x},${y})`, 'build');
    this.emit();
    return { ok: true, building: b };
  }

  paintRoad(x, y) {
    const t = this.tile(x, y);
    if (!t || t.terrain === 'water' || t.terrain === 'town') return { ok: false, error: 'No' };
    if (t.road) return { ok: true };
    if (!this.canAfford(IM_CONFIG.roadBuildCost)) return { ok: false, error: 'Sin fondos' };
    this.spend(IM_CONFIG.roadBuildCost);
    t.road = true;
    this.emit();
    return { ok: true };
  }

  eraseRoad(x, y) {
    const t = this.tile(x, y);
    if (!t || t.terrain === 'town') return;
    t.road = false;
    this.emit();
  }

  stockQty(b, pid) {
    return b.stock[pid] || 0;
  }

  addStock(b, pid, qty) {
    b.stock[pid] = (b.stock[pid] || 0) + qty;
  }

  takeStock(b, pid, qty) {
    const have = this.stockQty(b, pid);
    if (have < qty) return false;
    b.stock[pid] = have - qty;
    return true;
  }

  warehouses() {
    return this.state.buildings.filter((b) => b.type === 'warehouse' || b.type === 'truck_depot');
  }

  dist(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  inRadius(wh, b) {
    const def = IM.building(wh.type);
    const r = def?.radius || IM_CONFIG.warehouseRadius;
    const cx = wh.x + wh.w / 2;
    const cy = wh.y + wh.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    return Math.hypot(cx - bx, cy - by) <= r + 0.5;
  }

  nearestWarehouse(b) {
    let best = null;
    let bestD = 1e9;
    this.warehouses().forEach((wh) => {
      if (!this.inRadius(wh, b) && wh.type === 'warehouse') return;
      const d = this.dist(wh, b);
      if (d < bestD) {
        bestD = d;
        best = wh;
      }
    });
    return best;
  }

  tickProduction() {
    const season = this.season();
    this.state.buildings.forEach((b) => {
      const def = IM.building(b.type);
      if (!def || !b.recipeId) return;
      const recipe = IM.recipe(b.recipeId);
      if (!recipe) return;
      const mul = IM.yieldMulFor(b.type, season);
      const need = recipe.time || 5;
      // inputs
      if (recipe.in) {
        for (const [pid, q] of Object.entries(recipe.in)) {
          if (this.stockQty(b, pid) < q) {
            // pedir al almacén cercano
            const wh = this.nearestWarehouse(b);
            if (wh && this.stockQty(wh, pid) >= q) {
              this.takeStock(wh, pid, q);
              this.addStock(b, pid, q);
              this.spawnTruck(wh, b, pid, q, 'deliver');
            } else {
              b.progress = 0;
              return;
            }
          }
        }
      }
      b.progress += 1 * mul;
      if (b.progress >= need) {
        b.progress = 0;
        if (recipe.in) {
          for (const [pid, q] of Object.entries(recipe.in)) {
            if (!this.takeStock(b, pid, q)) return;
          }
        }
        for (const [pid, q] of Object.entries(recipe.out || {})) {
          const produced = Math.max(1, Math.round(q * mul));
          this.addStock(b, pid, produced);
          this.state.stats.produced += produced;
          // auto push to warehouse
          const wh = this.nearestWarehouse(b);
          if (wh && b.type !== 'warehouse' && b.type !== 'truck_depot') {
            const move = Math.min(produced, this.stockQty(b, pid));
            if (move > 0) {
              this.takeStock(b, pid, move);
              this.addStock(wh, pid, move);
              this.spawnTruck(b, wh, pid, move, 'collect');
            }
          }
        }
      }
    });
  }

  spawnTruck(from, to, productId, qty, kind) {
    if (this.state.trucks.length > 80) return;
    this.state.trucks.push({
      id: IM.uid('trk'),
      x: from.x + from.w / 2,
      y: from.y + from.h / 2,
      tx: to.x + to.w / 2,
      ty: to.y + to.h / 2,
      productId,
      qty,
      kind,
      progress: 0,
    });
  }

  tickTrucks() {
    const speed = IM_CONFIG.truckSpeed * 0.08;
    this.state.trucks = this.state.trucks.filter((tr) => {
      const dx = tr.tx - tr.x;
      const dy = tr.ty - tr.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist < 0.15) return false;
      tr.x += (dx / dist) * Math.min(speed, dist);
      tr.y += (dy / dist) * Math.min(speed, dist);
      return true;
    });
  }

  /** Contratos semanales con pueblos */
  refreshWeeklyContracts() {
    const st = this.state;
    const season = this.season();
    const rnd = IM.mulberry32(st.year * 1000 + Math.floor(st.day / 7) * 17 + 9);
    st.contracts = [];
    const towns = st.world.towns.filter((t) => !t.shopClosedUntil || st.day >= t.shopClosedUntil || st.year > (t._closeYear || st.year));
    towns.forEach((town) => {
      if (town.shopClosedUntil && st.year === (town._closeYear || st.year) && st.day < town.shopClosedUntil) return;
      town.shops.forEach((shop) => {
        if (rnd() > 0.55) return;
        const def = IM_DATA.shopTypes[shop.type];
        const buys = def?.buys || [];
        if (!buys.length) return;
        // priorizar productos de temporada
        const ranked = [...buys].sort((a, b) => IM.demandMulForProduct(b, season) - IM.demandMulForProduct(a, season));
        const pid = ranked[Math.floor(rnd() * Math.min(3, ranked.length))];
        const demMul = IM.demandMulForProduct(pid, season);
        const qty = Math.round((12 + rnd() * 28) * demMul);
        const prod = IM.product(pid);
        const unit = Math.round((prod?.price || 10) * (1.15 + rnd() * 0.35) * (0.9 + town.reputation / 200));
        st.contracts.push({
          id: IM.uid('ctr'),
          townId: town.id,
          townName: town.name,
          shopType: shop.type,
          shopName: def.name,
          productId: pid,
          qty,
          delivered: 0,
          unitPrice: unit,
          deadlineDay: st.day + 7,
          deadlineYear: st.day + 7 > (IM_CONFIG.daysPerYear || 120) ? st.year + 1 : st.year,
          status: 'active',
        });
      });
    });
    this.log(`Nuevos contratos semanales: ${st.contracts.length} (${season.name})`, 'contract');
  }

  deliverToContract(contractId, fromBuildingId) {
    const c = this.state.contracts.find((x) => x.id === contractId);
    const b = this.state.buildings.find((x) => x.id === fromBuildingId);
    if (!c || c.status !== 'active') return { ok: false, error: 'Contrato inválido' };
    if (!b) return { ok: false, error: 'Sin edificio' };
    const town = this.state.world.towns.find((t) => t.id === c.townId);
    if (town?.shopClosedUntil && this.state.day < town.shopClosedUntil && this.state.year === (town._closeYear || this.state.year)) {
      return { ok: false, error: 'Tienda cerrada por reputación' };
    }
    const need = c.qty - c.delivered;
    const have = this.stockQty(b, c.productId);
    if (have <= 0) return { ok: false, error: 'Sin stock' };
    const qty = Math.min(need, have);
    this.takeStock(b, c.productId, qty);
    c.delivered += qty;
    const money = qty * c.unitPrice;
    this.earn(money);
    this.state.stats.sold += money;
    if (town) {
      this.spawnTruck(b, { x: town.x, y: town.y, w: 1, h: 1 }, c.productId, qty, 'sell');
    }
    if (c.delivered >= c.qty) {
      c.status = 'done';
      this.state.stats.contractsDone++;
      if (town) town.reputation = IM.clamp(town.reputation + (IM_CONFIG.contractWinRep || 6), 0, 100);
      this.log(`Contrato cumplido: ${c.qty} ${IM.product(c.productId)?.name} → ${c.townName} (+${IM.formatMoney(c.qty * c.unitPrice)})`, 'ok');
    }
    this.emit();
    return { ok: true, money };
  }

  /** Entrega automática desde almacenes a contratos cercanos */
  tickAutoDeliver() {
    this.state.contracts.filter((c) => c.status === 'active').forEach((c) => {
      const town = this.state.world.towns.find((t) => t.id === c.townId);
      if (!town) return;
      if (town.shopClosedUntil && this.state.day < town.shopClosedUntil) return;
      const wh = this.warehouses()
        .map((w) => ({ w, d: Math.hypot(w.x - town.x, w.y - town.y) }))
        .filter((x) => x.d < 18)
        .sort((a, b) => a.d - b.d)[0]?.w;
      if (!wh) return;
      if (this.stockQty(wh, c.productId) <= 0) return;
      if (Math.random() > 0.35) return;
      this.deliverToContract(c.id, wh.id);
    });
  }

  resolveExpiredContracts() {
    const st = this.state;
    st.contracts.forEach((c) => {
      if (c.status !== 'active') return;
      const expired =
        st.year > c.deadlineYear ||
        (st.year === c.deadlineYear && st.day > c.deadlineDay) ||
        (c.deadlineYear === st.year && st.day > c.deadlineDay);
      // simplify: week = 7 days within year wrap
      const startApprox = c.deadlineDay - 7;
      const overdue = st.day > c.deadlineDay && st.year >= c.deadlineYear;
      if (!overdue) return;
      c.status = 'failed';
      st.stats.contractsFail++;
      const town = st.world.towns.find((t) => t.id === c.townId);
      if (town) {
        town.reputation = IM.clamp(town.reputation - (IM_CONFIG.contractFailRep || 12), 0, 100);
        if (town.reputation < 25) {
          town.shopClosedUntil = st.day + (IM_CONFIG.shopCloseDays || 10);
          town._closeYear = st.year;
          if (town.shopClosedUntil > (IM_CONFIG.daysPerYear || 120)) {
            town._closeYear = st.year + 1;
            town.shopClosedUntil -= IM_CONFIG.daysPerYear || 120;
          }
          this.log(`¡${town.name} cierra tiendas ${IM_CONFIG.shopCloseDays} días por mala reputación!`, 'alert');
        }
      }
      this.log(`Contrato fallido: ${IM.product(c.productId)?.name} → ${c.townName}`, 'alert');
    });
  }

  research(techId) {
    const tech = IM.tech(techId);
    if (!tech) return { ok: false, error: 'Tech inválida' };
    if (this.hasTech(techId)) return { ok: false, error: 'Ya investigada' };
    if ((tech.req || []).some((r) => !this.hasTech(r))) return { ok: false, error: 'Faltan requisitos' };
    if (!this.canAfford(tech.cost)) return { ok: false, error: 'Sin fondos' };
    this.spend(tech.cost);
    this.state.researched[techId] = true;
    this.log(`I+D: ${tech.name}`, 'research');
    this.emit();
    return { ok: true };
  }

  advanceDay() {
    const st = this.state;
    st.day += 1;
    if (st.day > (IM_CONFIG.daysPerYear || 120)) {
      st.day = 1;
      st.year += 1;
      this.log(`Año nuevo ${st.year}`, 'info');
    }
    // reopen shops
    st.world.towns.forEach((t) => {
      if (t.shopClosedUntil && st.year >= (t._closeYear || st.year) && st.day >= t.shopClosedUntil) {
        t.shopClosedUntil = null;
        this.log(`${t.name}: tiendas reabiertas`, 'ok');
      }
    });
    this.resolveExpiredContracts();
    if ((st.day - 1) % 7 === 0) this.refreshWeeklyContracts();
    // refresh shop base demand with season
    const season = this.season();
    st.world.towns.forEach((town) => {
      town.shops.forEach((shop) => {
        const def = IM_DATA.shopTypes[shop.type];
        (def?.buys || []).forEach((pid) => {
          const base = shop.demand[pid] || 10;
          shop.demand[pid] = Math.max(4, Math.round(base * (0.85 + 0.15 * IM.demandMulForProduct(pid, season))));
        });
      });
    });
    if (st.day === 1 || (st.day - 1) % (IM_CONFIG.daysPerSeason || 30) === 0) {
      this.log(`Estación: ${season.name} — agro ×${season.farmMul.toFixed(2)} · turismo ×${season.tourism.toFixed(2)}`, 'season');
    }
  }

  tick(realDt) {
    if (!this.state || this.state.paused || this.state.speed === 0) return;
    this._acc += realDt * this.state.speed;
    const step = IM_CONFIG.tickMs;
    let guard = 0;
    while (this._acc >= step && guard++ < 12) {
      this._acc -= step;
      this.state.tick++;
      this.tickProduction();
      this.tickTrucks();
      this.tickAutoDeliver();
      // ~8 ticks = 1 día de juego
      if (this.state.tick % 8 === 0) this.advanceDay();
    }
    this.emit();
  }

  skipOneDay() {
    for (let i = 0; i < 8; i++) {
      this.state.tick++;
      this.tickProduction();
      this.tickTrucks();
      this.tickAutoDeliver();
    }
    this.advanceDay();
    this.emit();
  }
};
