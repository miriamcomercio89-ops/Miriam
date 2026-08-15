/** Sistemas v5: filiales, suelo, hubs export, turnos, noticias, crédito, balance, coach */
window.IM = window.IM || {};

(function v5() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) return;

  const _init = Proto.init;
  Proto.init = function (saved) {
    _init.call(this, saved);
    const st = this.state;
    st.subsidiaries = st.subsidiaries || {};
    st.shiftPolicy = st.shiftPolicy || 'standard'; // standard | dual | triple
    st.marketNews = st.marketNews || [];
    st.newsHistory = st.newsHistory || [];
    st.bankCovenants = st.bankCovenants || [];
    st.franchiseContracts = st.franchiseContracts || [];
    st.playMinutesReal = st.playMinutesReal || 0;
    st.autoBalanceDone = st.autoBalanceDone || 0;
    st.layoutByBuilding = st.layoutByBuilding || {};
    st.ui = Object.assign(st.ui || {}, {
      coachOpen: st.ui?.coachOpen !== false,
      selectedSubsidiaryId: st.ui?.selectedSubsidiaryId || null,
    });
    // Enrich discovered locations with land/hub fields
    (st.discoveredLocations || []).forEach((loc) => this.enrichLocationEconomics(loc));
    this.emit();
  };

  // ——— Economía de suelo / hubs ———
  Proto.enrichLocationEconomics = function (loc) {
    if (!loc) return loc;
    if (loc.landCost == null || loc.zone == null) {
      const info = IM.Geo.inferLandZone(loc);
      loc.zone = loc.zone || info.zone;
      loc.landCost = loc.landCost || info.landCost;
      loc.hasPort = loc.hasPort || info.hasPort;
      loc.hasAirport = loc.hasAirport || info.hasAirport;
    }
    return loc;
  };

  Proto.landCostMul = function (locationId) {
    const loc = IM.locationById(locationId);
    if (!loc) return 1;
    this.enrichLocationEconomics(loc);
    return loc.landCost || 1;
  };

  const _foundInCity = Proto.foundInCity;
  Proto.foundInCity = function (locationId) {
    const loc = IM.locationById(locationId);
    if (loc) this.enrichLocationEconomics(loc);
    const r = _foundInCity.call(this, locationId);
    if (r.ok && loc) {
      // Adjust: Game already charged laborCost; charge extra land premium/discount delta
      const base = IM_CONFIG.foundingOfficeCost * this.state.inflationIndex * (loc.laborCost || 1);
      const withLand = base * (loc.landCost || 1);
      const delta = withLand - base;
      if (delta > 0) {
        if (!this.canAfford(delta)) {
          // refund-ish: can't easily undo; just spend what we can
        } else this.spend(delta);
      } else if (delta < 0) {
        this.earn(-delta);
      }
      // Auto-create HQ subsidiary if first site
      if (Object.keys(this.state.subsidiaries).length === 0) {
        this.createSubsidiary(r.site.id, {
          name: `${this.state.companyName} HQ`,
          specialty: this.state.campaignBranch === 'agro_andaluz' ? 'agro' : this.state.campaignBranch === 'chips_baterias' ? 'electronica' : 'metales',
        });
      }
    }
    return r;
  };

  const _buildBuilding = Proto.buildBuilding;
  Proto.buildBuilding = function (locationId, buildingTypeId) {
    const loc = IM.locationById(locationId);
    if (loc) this.enrichLocationEconomics(loc);
    const r = _buildBuilding.call(this, locationId, buildingTypeId);
    if (r.ok && loc) {
      const def = IM.buildingById(buildingTypeId);
      const base = def.cost * (loc.laborCost || 1) * this.state.inflationIndex;
      const withLand = base * (loc.landCost || 1);
      const delta = withLand - base;
      if (delta > 0 && this.canAfford(delta)) this.spend(delta);
      else if (delta < 0) this.earn(-delta);
    }
    return r;
  };

  // ——— Filiales ———
  Proto.createSubsidiary = function (siteId, opts = {}) {
    const site = this.state.sites.find((s) => s.id === siteId);
    if (!site) return { ok: false, error: 'Sitio no encontrado' };
    if (Object.values(this.state.subsidiaries).some((s) => s.siteId === siteId)) {
      return { ok: false, error: 'Este sitio ya es una filial' };
    }
    const spec =
      (IM_DATA.subsidiarySpecialties || []).find((s) => s.id === opts.specialty) ||
      (IM_DATA.subsidiarySpecialties || [])[0];
    const loc = IM.locationById(site.locationId);
    const id = IM.uid('fil');
    const sub = {
      id,
      siteId,
      locationId: site.locationId,
      name: opts.name || `Filial ${loc?.name || siteId}`,
      specialty: spec.id,
      createdDay: this.state.day,
      createdYear: this.state.year,
      bonus: 1.12,
    };
    this.state.subsidiaries[id] = sub;
    site.subsidiaryId = id;
    this.log(`Filial creada: ${sub.name} (${spec.name})`, 'build');
    this.emit();
    return { ok: true, subsidiary: sub };
  };

  Proto.setSubsidiarySpecialty = function (subsidiaryId, specialtyId) {
    const sub = this.state.subsidiaries[subsidiaryId];
    const spec = (IM_DATA.subsidiarySpecialties || []).find((s) => s.id === specialtyId);
    if (!sub || !spec) return { ok: false, error: 'Filial o especialidad inválida' };
    sub.specialty = specialtyId;
    this.log(`Filial ${sub.name} → ${spec.name}`, 'build');
    this.emit();
    return { ok: true };
  };

  Proto.subsidiaryForSite = function (site) {
    if (!site) return null;
    if (site.subsidiaryId && this.state.subsidiaries[site.subsidiaryId]) {
      return this.state.subsidiaries[site.subsidiaryId];
    }
    return Object.values(this.state.subsidiaries).find((s) => s.siteId === site.id) || null;
  };

  Proto.subsidiaryBonus = function (site, building) {
    const sub = this.subsidiaryForSite(site);
    if (!sub) return 1;
    const spec = (IM_DATA.subsidiarySpecialties || []).find((s) => s.id === sub.specialty);
    if (!spec) return 1;
    if ((spec.buildings || []).includes(building.type)) return sub.bonus || 1.12;
    // Category via recipes on slots
    let hit = false;
    (building.slots || []).forEach((slot) => {
      if (!slot) return;
      const recipe = IM.recipeById(slot.recipeId);
      (recipe?.outputs || []).forEach((o) => {
        const it = IM.itemById(o.item);
        if (it && (spec.categories || []).includes(it.category)) hit = true;
      });
    });
    return hit ? (sub.bonus || 1.12) : 0.97; // ligera penalización fuera de especialidad
  };

  // ——— Turnos ———
  Proto.currentShift = function () {
    const h = this.state.hour || 0;
    if (h >= 6 && h < 14) return 'mañana';
    if (h >= 14 && h < 22) return 'tarde';
    return 'noche';
  };

  Proto.shiftWageMul = function () {
    const shift = this.currentShift();
    const policy = this.state.shiftPolicy || 'standard';
    if (policy === 'standard') {
      // Solo turno diurno productivo; noche paga vigilancia baja
      if (shift === 'noche') return 0.35;
      return 1;
    }
    if (policy === 'dual') {
      if (shift === 'noche') return 0.45;
      if (shift === 'tarde') return 1.15;
      return 1;
    }
    // triple
    if (shift === 'noche') return 1.35;
    if (shift === 'tarde') return 1.1;
    return 1;
  };

  Proto.shiftEfficiencyMul = function () {
    const shift = this.currentShift();
    const policy = this.state.shiftPolicy || 'standard';
    if (policy === 'standard') {
      return shift === 'noche' ? 0.15 : 1;
    }
    if (policy === 'dual') {
      if (shift === 'noche') return 0.2;
      if (shift === 'tarde') return 0.92;
      return 1;
    }
    // triple: produce 24h, noche un poco peor
    if (shift === 'noche') return 0.82;
    if (shift === 'tarde') return 0.95;
    return 1;
  };

  Proto.setShiftPolicy = function (policy) {
    if (!['standard', 'dual', 'triple'].includes(policy)) return { ok: false, error: 'Política inválida' };
    this.state.shiftPolicy = policy;
    this.log(`Turnicidad: ${policy}`, 'info');
    this.emit();
    return { ok: true };
  };

  const _payWages = Proto.payWagesHourly;
  Proto.payWagesHourly = function () {
    const old = this.state.wageMultiplier;
    this.state.wageMultiplier = old * this.shiftWageMul();
    _payWages.call(this);
    this.state.wageMultiplier = old;
  };

  const _tickProduction = Proto.tickProduction;
  Proto.tickProduction = function (gameMinutes) {
    const backups = [];
    this.state.sites.forEach((site) => {
      site.buildings.forEach((b) => {
        backups.push([b, b.efficiency]);
        b.efficiency = (b.efficiency || 1) * this.shiftEfficiencyMul() * this.subsidiaryBonus(site, b);
      });
    });
    _tickProduction.call(this, gameMinutes);
    backups.forEach(([b, e]) => {
      b.efficiency = e;
    });
  };

  // ——— Export hubs (puertos / aeropuertos) ———
  Proto.exportViaHub = function (locationId, itemId, qty, mode = 'sea') {
    const loc = IM.locationById(locationId);
    if (!loc) return { ok: false, error: 'Ubicación inválida' };
    this.enrichLocationEconomics(loc);
    if (mode === 'sea' && !loc.hasPort) return { ok: false, error: 'Sin puerto en esta ciudad' };
    if (mode === 'air' && !loc.hasAirport) return { ok: false, error: 'Sin aeropuerto en esta ciudad' };
    qty = Number(qty) || 0;
    if (qty <= 0) return { ok: false, error: 'Cantidad inválida' };
    if (this.stockQty(locationId, itemId) < qty) return { ok: false, error: 'Stock insuficiente' };
    this.removeStock(locationId, itemId, qty);
    const premium = mode === 'air' ? 1.22 : 1.14;
    const hubBonus = 1 + 0.03 * (loc.hubLevel || 1);
    const rev = this.priceOf(itemId) * qty * premium * hubBonus;
    this.earn(rev);
    this.state.soldLifetime[itemId] = (this.state.soldLifetime[itemId] || 0) + qty;
    this.state.transportedLifetime[itemId] = (this.state.transportedLifetime[itemId] || 0) + qty;
    this.log(`Export ${mode === 'air' ? 'aérea' : 'marítima'} desde ${loc.name}: +${IM.formatMoney(rev)}`, 'market');
    this.emit();
    return { ok: true, revenue: rev };
  };

  // ——— Noticias de mercado ———
  Proto.spawnMarketNews = function () {
    const pool = IM_DATA.marketNewsPool || [];
    if (!pool.length) return;
    if (this.state.marketNews.length >= 3) return;
    const n = pool[Math.floor(Math.random() * pool.length)];
    const news = {
      ...n,
      uid: IM.uid('news'),
      expiresDay: this.state.day + (n.days || 10),
      year: this.state.year,
    };
    this.state.marketNews.push(news);
    this.state.newsHistory.unshift({ headline: n.headline, day: this.state.day, year: this.state.year });
    if (this.state.newsHistory.length > 40) this.state.newsHistory.length = 40;
    this.applyNewsToPrices(news);
    this.log(`Noticia: ${n.headline}`, 'market');
  };

  Proto.applyNewsToPrices = function (news) {
    (IM_DATA.items || []).forEach((it) => {
      if (it.category !== news.category) return;
      const p = this.state.prices[it.id] || it.basePrice;
      this.state.prices[it.id] = p * (news.priceMul || 1);
      this.state.demand[it.id] = (this.state.demand[it.id] || 1) * (news.demandMul || 1);
    });
  };

  Proto.tickMarketNews = function () {
    const keep = [];
    this.state.marketNews.forEach((n) => {
      if (n.year < this.state.year || (n.year === this.state.year && this.state.day > n.expiresDay)) {
        // mean-revert lightly
        (IM_DATA.items || []).forEach((it) => {
          if (it.category !== n.category) return;
          const target = it.basePrice * this.state.inflationIndex;
          const cur = this.state.prices[it.id] || target;
          this.state.prices[it.id] = cur * 0.7 + target * 0.3;
        });
        return;
      }
      keep.push(n);
    });
    this.state.marketNews = keep;
    if (Math.random() < 0.22) this.spawnMarketNews();
  };

  // ——— Crédito con covenants ———
  Proto.takeBankProduct = function (productId, amount) {
    const prod = (IM_DATA.bankProducts || []).find((p) => p.id === productId);
    if (!prod) return { ok: false, error: 'Producto bancario desconocido' };
    amount = Math.round(Number(amount) || 0);
    if (amount < 10000) return { ok: false, error: 'Mínimo 10.000 €' };
    if (amount > prod.maxAmount) return { ok: false, error: `Máximo ${IM.formatMoney(prod.maxAmount)}` };
    if (prod.covenant?.requireHub) {
      const hasHub = (this.state.discoveredLocations || []).some(
        (l) => this.state.sites.some((s) => s.locationId === l.id) && (l.hasPort || l.hasAirport)
      );
      if (!hasHub) return { ok: false, error: 'Requiere planta en puerto o aeropuerto' };
    }
    const rate = this.state.interestRate * (prod.rateMul || 1) * (this.hasTech('finanzas_corporativas') ? 0.85 : 1);
    const years = prod.years;
    const currentDebt = this.state.loans.reduce((a, l) => a + l.principal, 0);
    const maxLoan = 40000000 * (this.state.creditRating / 50);
    if (currentDebt + amount > maxLoan) return { ok: false, error: 'Límite de crédito del rating' };
    this.state.loans.push({
      id: IM.uid('loan'),
      productId: prod.id,
      principal: amount,
      rate,
      years,
      remainingDays: years * 360,
      dailyPayment: (amount * (1 + rate * years)) / (years * 360),
      covenant: { ...prod.covenant },
    });
    this.state.money += amount;
    this.state.creditRating = IM.clamp(this.state.creditRating - 1, 20, 100);
    this.log(`Crédito ${prod.name}: ${IM.formatMoney(amount)}`, 'finance');
    this.emit();
    return { ok: true };
  };

  Proto.totalDebt = function () {
    return this.state.loans.reduce((a, l) => a + l.principal, 0);
  };

  Proto.checkBankCovenants = function () {
    const debt = this.totalDebt();
    const assetsProxy = Math.max(this.state.money + debt, 1);
    const debtRatio = debt / assetsProxy;
    this.state.loans.forEach((loan) => {
      const c = loan.covenant;
      if (!c) return;
      let breach = false;
      if (c.minCash != null && this.state.money < c.minCash) breach = true;
      if (c.maxDebtRatio != null && debtRatio > c.maxDebtRatio) breach = true;
      if (breach) {
        this.state.creditRating = IM.clamp(this.state.creditRating - 3, 10, 100);
        this.state.interestRate = Math.min(0.18, this.state.interestRate * 1.02);
        loan.dailyPayment *= 1.01;
        this.log(`Covenant incumplido (${loan.productId || 'préstamo'}) — penalización`, 'alert');
      }
    });
  };

  // ——— Franquicias B2B ———
  Proto.spawnFranchiseOrder = function () {
    const frans = (IM_DATA.b2bClients || []).filter((c) => c.franchise);
    if (!frans.length || this.state.b2bOrders.length >= 8) return;
    if ((this.state.campaignChapter || 1) < 3 && !this.state.unlockAll) return;
    const c = frans[Math.floor(Math.random() * frans.length)];
    const prefs = (c.preferred || []).filter((id) => IM.itemById(id));
    if (!prefs.length) return;
    const itemId = prefs[Math.floor(Math.random() * prefs.length)];
    const qty = (20 + Math.floor(Math.random() * 60)) * (c.orderMul || 3);
    this.state.b2bOrders.push({
      id: IM.uid('b2b'),
      clientId: c.id,
      itemId,
      qty,
      minQuality: c.minQuality,
      priceMul: (c.priceMul || 1.1) + (this.state.b2bReputation[c.id] || 50) / 400,
      deadlineDay: this.state.day + 18,
      year: this.state.year,
      recurring: true,
      franchise: true,
    });
  };

  Proto.signFranchiseContract = function (clientId) {
    const c = (IM_DATA.b2bClients || []).find((x) => x.id === clientId && x.franchise);
    if (!c) return { ok: false, error: 'Franquicia desconocida' };
    if (this.state.franchiseContracts.includes(clientId)) return { ok: false, error: 'Ya firmada' };
    const fee = 150000 * this.state.inflationIndex;
    if (!this.canAfford(fee)) return { ok: false, error: 'Fondos insuficientes' };
    this.spend(fee);
    this.state.franchiseContracts.push(clientId);
    this.state.b2bReputation[clientId] = Math.max(this.state.b2bReputation[clientId] || 50, 60);
    this.log(`Contrato franquicia: ${c.name}`, 'mission');
    this.spawnFranchiseOrder();
    this.emit();
    return { ok: true };
  };

  // ——— Coach / qué hago ahora ———
  Proto.getNextActions = function () {
    const st = this.state;
    const tips = [];
    if (!st.campaignBranch) {
      tips.push({ id: 'branch', text: 'Elige tu rama industrial en el modal de inicio.', panel: 'campana', priority: 100 });
    }
    if (!st.sites.length) {
      tips.push({ id: 'found', text: 'Haz click en el mapa para fundar tu primera planta (ciudad OSM).', panel: 'mapa', priority: 95 });
    }
    if (st.sites.length && Object.keys(st.subsidiaries).length === 0) {
      tips.push({ id: 'filial', text: 'Crea una filial y elige su especialización.', panel: 'filiales', priority: 90 });
    }
    if (st.sites.length) {
      const hasMachine = st.sites.some((s) => s.buildings.some((b) => (b.slots || []).some(Boolean)));
      if (!hasMachine) {
        tips.push({ id: 'build', text: 'Construye un edificio productivo e instala una máquina.', panel: 'industria', priority: 88 });
      }
    }
    const bottlenecks = this.collectBottlenecks().slice(0, 2);
    bottlenecks.forEach((b) => {
      tips.push({ id: 'bn_' + b.id, text: `Cuello de botella: ${b.suggestion}`, panel: 'planner', priority: 70 });
    });
    if ((st.campaignChapter || 1) >= 3 && !(st.franchiseContracts || []).length) {
      tips.push({ id: 'fran', text: 'Firma un contrato con una franquicia B2B grande.', panel: 'b2b', priority: 60 });
    }
    if (st.money < 500000 && this.totalDebt() < 1) {
      tips.push({ id: 'loan', text: 'Tesorería baja: valora un crédito bancario con covenants.', panel: 'finanzas', priority: 75 });
    }
    if (st.marketNews?.length) {
      tips.push({
        id: 'news',
        text: `Noticia activa: ${st.marketNews[0].headline}`,
        panel: 'mercado',
        priority: 50,
      });
    }
    const hubs = (st.discoveredLocations || []).filter(
      (l) => st.sites.some((s) => s.locationId === l.id) && (l.hasPort || l.hasAirport)
    );
    if (hubs.length) {
      tips.push({ id: 'export', text: 'Tienes hub: exporta por puerto/aeropuerto con prima.', panel: 'export', priority: 45 });
    } else if (st.sites.length) {
      tips.push({ id: 'hub', text: 'Fundá cerca de costa o hub para desbloquear export.', panel: 'mapa', priority: 40 });
    }
    tips.push({ id: 'keys', text: 'Atajos: Espacio pausa · 1-5 velocidad · M mapa · I industria · B bolsa · E enciclopedia', panel: null, priority: 5 });
    tips.sort((a, b) => b.priority - a.priority);
    return tips.slice(0, 6);
  };

  // ——— Cuellos de botella ———
  Proto.collectBottlenecks = function () {
    const out = [];
    this.state.sites.forEach((site) => {
      const flow = this.getFactoryFlow?.(site.id);
      if (!flow) return;
      flow.nodes.forEach((n) => {
        if (!n.block) return;
        let suggestion = n.block;
        if (n.block === 'mantenimiento') suggestion = `Repara ${n.label} (mantenimiento bajo)`;
        else if (/energia|electric/i.test(n.block)) suggestion = `Compra electricidad o genera en planta para ${n.label}`;
        else if (/agua/i.test(n.block)) suggestion = `Reabastece agua industrial para ${n.label}`;
        else if (/input|materia|stock|falta/i.test(n.block)) suggestion = `Falta input en ${n.label}: compra o produce el eslabón anterior`;
        else if (/almacen|storage|lleno/i.test(n.block)) suggestion = `Amplía almacén: ${n.label} no puede sacar producto`;
        else suggestion = `${n.label}: ${n.block} — revisa inputs/energía/almacén`;
        out.push({
          id: n.id,
          siteId: site.id,
          label: n.label,
          block: n.block,
          suggestion,
        });
      });
      // Empty slots with buildings
      site.buildings.forEach((b) => {
        const empty = (b.slots || []).filter((s) => !s).length;
        if (empty > 0 && b.type !== 'oficina') {
          out.push({
            id: b.id + '_empty',
            siteId: site.id,
            label: IM.buildingById(b.type)?.name || b.type,
            block: 'slot_vacio',
            suggestion: `Hay ${empty} hueco(s) libre(s) en ${IM.buildingById(b.type)?.name}: instala máquinas`,
          });
        }
      });
    });
    return out;
  };

  // ——— Layout visual ———
  Proto.setSlotLayout = function (buildingId, slotIndex, x, y) {
    if (!this.state.layoutByBuilding[buildingId]) this.state.layoutByBuilding[buildingId] = {};
    this.state.layoutByBuilding[buildingId][slotIndex] = { x: Number(x) || 0, y: Number(y) || 0 };
    this.emit();
    return { ok: true };
  };

  Proto.getSlotLayout = function (buildingId, slotIndex, fallbackIndex) {
    const pos = this.state.layoutByBuilding[buildingId]?.[slotIndex];
    if (pos) return pos;
    const col = (fallbackIndex || 0) % 4;
    const row = Math.floor((fallbackIndex || 0) / 4);
    return { x: 20 + col * 160, y: 20 + row * 100 };
  };

  // ——— Balance automático ———
  Proto.tickAutoBalance = function (realDtMs) {
    this.state.playMinutesReal += realDtMs / 60000;
    // Cada ~45 min reales de juego activo, un pase de balance
    const tier = Math.floor(this.state.playMinutesReal / 45);
    if (tier <= this.state.autoBalanceDone) return;
    this.state.autoBalanceDone = tier;
    let adjusted = 0;
    (IM_DATA.items || []).forEach((it) => {
      const target = it.basePrice * this.state.inflationIndex;
      const cur = this.state.prices[it.id];
      if (cur == null) return;
      const ratio = cur / Math.max(0.0001, target);
      if (ratio > 2.5 || ratio < 0.35) {
        this.state.prices[it.id] = cur * 0.6 + target * 0.4;
        adjusted++;
      }
    });
    // Soft demand reset extremes
    Object.keys(this.state.demand || {}).forEach((id) => {
      const d = this.state.demand[id];
      if (d > 5) this.state.demand[id] = 5;
      if (d < 0.2) this.state.demand[id] = 0.2;
    });
    if (adjusted) this.log(`Balance automático: ${adjusted} precios recalibrados`, 'finance');
  };

  // ——— Informe corporativo (datos para PDF/impresión) ———
  Proto.buildCompanyReport = function () {
    const st = this.state;
    const subs = Object.values(st.subsidiaries || {});
    return {
      title: st.companyName || 'Corporación',
      version: IM_CONFIG.version,
      generatedAt: new Date().toISOString(),
      money: st.money,
      profitLifetime: st.profitLifetime,
      creditRating: st.creditRating,
      debt: this.totalDebt(),
      employees: st.employees,
      chapter: st.campaignChapter,
      branch: st.campaignBranch,
      season: st.season,
      shiftPolicy: st.shiftPolicy,
      sites: st.sites.map((s) => {
        const loc = IM.locationById(s.locationId);
        const sub = this.subsidiaryForSite(s);
        return {
          location: loc?.name,
          country: loc?.country,
          zone: loc?.zone,
          landCost: loc?.landCost,
          hasPort: loc?.hasPort,
          hasAirport: loc?.hasAirport,
          buildings: s.buildings.length,
          subsidiary: sub?.name,
          specialty: sub?.specialty,
        };
      }),
      subsidiaries: subs.map((s) => ({
        name: s.name,
        specialty: s.specialty,
        location: IM.locationById(s.locationId)?.name,
      })),
      franchises: (st.franchiseContracts || []).map((id) => IM_DATA.b2bClients.find((c) => c.id === id)?.name || id),
      news: (st.newsHistory || []).slice(0, 8),
      bottlenecks: this.collectBottlenecks().slice(0, 10),
      stats: st.stats,
    };
  };

  // ——— Hooks día / hora / tick ———
  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    this.tickMarketNews();
    this.checkBankCovenants();
    if (Math.random() < 0.28) this.spawnFranchiseOrder();
  };

  const _onHour = Proto.onHour;
  Proto.onHour = function () {
    _onHour.call(this);
  };

  const _tick = Proto.tick;
  Proto.tick = function (realDtMs) {
    _tick.call(this, realDtMs);
    if (this.state && !this.state.paused && this.state.speed > 0) {
      this.tickAutoBalance(realDtMs * this.state.speed);
    }
  };

  // Override B2B spawn to sometimes prefer franchises
  const _spawnB2B = Proto.spawnB2BOrder;
  Proto.spawnB2BOrder = function () {
    if (Math.random() < 0.35 && (this.state.franchiseContracts || []).length) {
      return this.spawnFranchiseOrder();
    }
    return _spawnB2B.call(this);
  };
})();
