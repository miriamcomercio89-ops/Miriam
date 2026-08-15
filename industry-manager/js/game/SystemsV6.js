/** Sistemas v6: índices, consejo, códigos de partida, campaña multi-año, audio zone */
window.IM = window.IM || {};

(function v6() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) return;

  const _init = Proto.init;
  Proto.init = function (saved) {
    _init.call(this, saved);
    const st = this.state;
    st.sectorIndexHistory = st.sectorIndexHistory || {};
    st.board = st.board || { activeMotionId: null, nextVoteDay: 7, votes: {}, lastResult: null };
    st.boardEffects = st.boardEffects || {};
    st.companyAgeYears = st.companyAgeYears || 0;
    st.ui = Object.assign(st.ui || {}, {
      compareA: st.ui?.compareA || 'aceituna',
      compareB: st.ui?.compareB || 'aceite_de_oliva',
      audioEnabled: st.ui?.audioEnabled !== false,
      navGroup: st.ui?.navGroup || 'mundo',
    });
    this.recordSectorIndices();
    this.emit();
  };

  Proto.companyYearsElapsed = function () {
    return Math.max(0, (this.state.year || 2026) - 2026);
  };

  // ——— Campaña profunda multi-año ———
  const _checkCampaignAdvance = Proto.checkCampaignAdvance;
  Proto.checkCampaignAdvance = function () {
    const years = this.companyYearsElapsed();
    this.state.companyAgeYears = years;
    const chapters = IM_DATA.campaignChapters || [];
    let target = 1;
    const xp = this.state.xp || 0;
    chapters.forEach((c) => {
      const needXp = (c.id - 1) * 180;
      if (years >= (c.yearTarget || 0) && xp >= needXp) target = Math.max(target, c.id);
    });
    // Mission chapter track (for thousands of missions) grows slower with years
    const missionCh = Math.min(100, 1 + Math.floor(years * 4 + xp / 250));
    if (missionCh > (this.state.missionChapter || 1)) {
      this.state.missionChapter = missionCh;
    }
    // Align campaign chapter used by mission filter with narrative depth
    const deepCh = Math.min(100, Math.max(target, 1 + Math.floor(years * 3.5 + xp / 300)));
    if (deepCh > (this.state.campaignMissionChapter || 1)) {
      this.state.campaignMissionChapter = deepCh;
    }
    if (target > (this.state.campaignChapter || 1)) {
      this.state.campaignChapter = target;
      const meta = chapters.find((c) => c.id === target);
      this.log(`Campaña año ${years}: capítulo ${target}${meta ? ' — ' + meta.name : ''}`, 'mission');
      this.state.ui.showBriefing = true;
      if (this.refreshCampaignMissions) this.refreshCampaignMissions();
      this.emit();
    } else {
      _checkCampaignAdvance.call(this);
    }
  };

  const _refreshCampaign = Proto.refreshCampaignMissions;
  Proto.refreshCampaignMissions = function () {
    // Prefer deep mission chapter track for pool
    const chapter = this.state.campaignMissionChapter || this.state.campaignChapter || 1;
    const branch = this.state.campaignBranch;
    const all = IM_DATA.campaignMissions || [];
    let pool = all.filter((m) => m.chapter === chapter && !this.state.missionsCompleted[m.id]);
    if (branch) pool = pool.filter((m) => m.branch === branch);
    if (!pool.length) {
      pool = all.filter((m) => m.chapter <= chapter && !this.state.missionsCompleted[m.id] && (!branch || m.branch === branch));
    }
    this.state.activeMissionIds = pool.slice(0, 10).map((m) => m.id);
    this._campaignMissionMap = this._campaignMissionMap || {};
    pool.slice(0, 10).forEach((m) => {
      this._campaignMissionMap[m.id] = m;
    });
    if (!this.state.activeMissionIds.length && _refreshCampaign) _refreshCampaign.call(this);
  };

  // ——— Índices sectoriales ———
  Proto.computeSectorIndex = function (def) {
    const cats = new Set(def.categories || []);
    const items = (IM_DATA.items || []).filter((i) => cats.has(i.category));
    if (!items.length) return 100;
    let sum = 0;
    let w = 0;
    items.forEach((it) => {
      const base = it.basePrice * (this.state.inflationIndex || 1);
      const price = this.state.prices[it.id] || base;
      const ratio = price / Math.max(0.0001, base);
      sum += ratio;
      w += 1;
    });
    return Math.round((sum / w) * 1000) / 10; // 100 = par
  };

  Proto.recordSectorIndices = function () {
    (IM_DATA.sectorIndices || []).forEach((def) => {
      const v = this.computeSectorIndex(def);
      if (!this.state.sectorIndexHistory[def.id]) this.state.sectorIndexHistory[def.id] = [];
      const arr = this.state.sectorIndexHistory[def.id];
      arr.push(v);
      if (arr.length > 60) arr.shift();
    });
  };

  Proto.sectorSeries = function (indexId, points = 48) {
    const arr = this.state.sectorIndexHistory?.[indexId] || [];
    if (arr.length >= 8) return arr.slice(-points);
    const def = (IM_DATA.sectorIndices || []).find((d) => d.id === indexId);
    const cur = def ? this.computeSectorIndex(def) : 100;
    const out = [];
    for (let i = 0; i < points; i++) out.push(cur * (0.97 + Math.sin(i / 6) * 0.02 + i / points * 0.03));
    out[out.length - 1] = cur;
    return out;
  };

  // ——— Consejo de administración ———
  Proto.proposeBoardMotion = function (motionId) {
    const m = (IM_DATA.boardMotions || []).find((x) => x.id === motionId);
    if (!m) return { ok: false, error: 'Moción inválida' };
    this.state.board.pendingMotionId = motionId;
    this.state.board.votes = {};
    this.emit();
    return { ok: true };
  };

  Proto.castBoardVote = function (seat, approve) {
    this.state.board.votes = this.state.board.votes || {};
    this.state.board.votes[seat] = !!approve;
    this.emit();
    return { ok: true };
  };

  Proto.resolveBoardVote = function () {
    const pending = this.state.board.pendingMotionId;
    if (!pending) return { ok: false, error: 'No hay moción' };
    const votes = Object.values(this.state.board.votes || {});
    // Auto seats if empty: CEO + 2 independent
    if (votes.length < 3) {
      this.state.board.votes = {
        ceo: true,
        ops: Math.random() > 0.35,
        finance: Math.random() > 0.4,
      };
    }
    const yes = Object.values(this.state.board.votes).filter(Boolean).length;
    const no = Object.values(this.state.board.votes).length - yes;
    const passed = yes > no;
    if (passed) {
      const motion = (IM_DATA.boardMotions || []).find((m) => m.id === pending);
      this.state.board.activeMotionId = pending;
      this.state.boardEffects = { ...(motion?.effect || {}) };
      this.state.board.lastResult = { motionId: pending, passed: true, day: this.state.day, year: this.state.year };
      this.log(`Consejo aprueba: ${motion?.name}`, 'finance');
    } else {
      this.state.board.lastResult = { motionId: pending, passed: false, day: this.state.day, year: this.state.year };
      this.log('Consejo rechaza la moción', 'alert');
    }
    this.state.board.pendingMotionId = null;
    this.state.board.votes = {};
    this.state.board.nextVoteDay = this.state.day + 7;
    this.emit();
    return { ok: true, passed };
  };

  Proto.tickBoard = function () {
    if (this.state.day >= (this.state.board.nextVoteDay || 7) && this.state.board.pendingMotionId) {
      this.resolveBoardVote();
    }
    // Soft apply austerity strike risk
    if (this.state.boardEffects?.moraleRisk && Math.random() < 0.02) {
      this.state.strikeUntil = this.state.day + 1;
      this.log('Malestar laboral tras austeridad del consejo', 'alert');
    }
  };

  // Apply board research mul if any
  const _researchTick = Proto.tickResearch;
  if (_researchTick) {
    Proto.tickResearch = function (gameMinutes) {
      const mul = this.state.boardEffects?.researchMul || 1;
      _researchTick.call(this, gameMinutes * mul);
    };
  }

  const _payWages = Proto.payWagesHourly;
  Proto.payWagesHourly = function () {
    const old = this.state.wageMultiplier;
    const boardWage = this.state.boardEffects?.wageMul || 1;
    this.state.wageMultiplier = old * boardWage;
    _payWages.call(this);
    this.state.wageMultiplier = old;
    if (this.state.boardEffects?.cashDrain) {
      this.state.money -= this.state.boardEffects.cashDrain / 24;
    }
  };

  const _exportViaHub = Proto.exportViaHub;
  Proto.exportViaHub = function (locationId, itemId, qty, mode) {
    const r = _exportViaHub.call(this, locationId, itemId, qty, mode);
    if (r.ok && this.state.boardEffects?.exportMul) {
      const extra = (r.revenue || 0) * (this.state.boardEffects.exportMul - 1);
      this.earn(extra);
      r.revenue += extra;
    }
    return r;
  };

  // ——— Códigos de partida (compartibles) ———
  Proto.exportShareCode = function () {
    try {
      const st = this.state;
      const portable = {
        v: 6,
        name: st.companyName,
        money: Math.round(st.money),
        year: st.year,
        day: st.day,
        hour: st.hour,
        branch: st.campaignBranch,
        chapter: st.campaignChapter,
        missionChapter: st.missionChapter,
        campaignMissionChapter: st.campaignMissionChapter,
        xp: st.xp,
        researched: st.researched,
        missionsCompleted: st.missionsCompleted,
        sites: st.sites,
        warehouses: st.warehouses,
        subsidiaries: st.subsidiaries,
        discoveredLocations: st.discoveredLocations,
        fogExplored: st.fogExplored,
        loans: st.loans,
        franchiseContracts: st.franchiseContracts,
        board: st.board,
        boardEffects: st.boardEffects,
        shiftPolicy: st.shiftPolicy,
        parcels: st.parcels,
        climate: st.climate,
        chainProgress: st.chainProgress,
        blueprints: st.blueprints,
        b2bReputation: st.b2bReputation,
        producedLifetime: st.producedLifetime,
        soldLifetime: st.soldLifetime,
        bestQuality: st.bestQuality,
        employees: st.employees,
        creditRating: st.creditRating,
        inflationIndex: st.inflationIndex,
        profitLifetime: st.profitLifetime,
        ui: { panel: 'mapa', selectedLocationId: st.ui?.selectedLocationId },
      };
      const json = JSON.stringify(portable);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const code = `IM6.${b64}`;
      const shortId = `IM6S.${Date.now().toString(36)}`;
      try {
        localStorage.setItem(shortId, code);
        localStorage.setItem('industry_manager_share_index', shortId);
      } catch (e) {
        /* quota — still return full code */
      }
      return { ok: true, code, shortId };
    } catch (e) {
      return { ok: false, error: 'No se pudo generar el código' };
    }
  };

  Proto.importShareCode = function (code) {
    try {
      let raw = String(code || '').trim();
      if (raw.startsWith('IM6S.')) {
        const stored = localStorage.getItem(raw);
        if (!stored) return { ok: false, error: 'Código corto no encontrado en este navegador' };
        raw = stored;
      }
      if (!raw.startsWith('IM6.')) return { ok: false, error: 'Código inválido (IM6. o IM6S.)' };
      const json = decodeURIComponent(escape(atob(raw.slice(4))));
      const p = JSON.parse(json);
      const base = IM.createInitialState();
      Object.assign(base, p);
      base.prices = base.prices || {};
      base.priceHistory = {};
      base.demand = {};
      base.supply = {};
      (IM_DATA.items || []).forEach((it) => {
        if (base.prices[it.id] == null) base.prices[it.id] = it.basePrice * (base.inflationIndex || 1);
      });
      base.version = IM_CONFIG.version;
      this.init(base);
      this.log(`Partida importada: ${p.name || 'corporación'}`, 'info');
      this.emit();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Código corrupto o incompleto' };
    }
  };

  // ——— Comparador helpers ———
  Proto.compareProducts = function (idA, idB) {
    const a = IM.itemById(idA);
    const b = IM.itemById(idB);
    if (!a || !b) return null;
    const priceA = this.priceOf(idA);
    const priceB = this.priceOf(idB);
    const prodA = this.state.producedLifetime[idA] || 0;
    const prodB = this.state.producedLifetime[idB] || 0;
    const sellA = this.state.soldLifetime[idA] || 0;
    const sellB = this.state.soldLifetime[idB] || 0;
    const qA = this.state.bestQuality[idA] || 0;
    const qB = this.state.bestQuality[idB] || 0;
    return { a, b, priceA, priceB, prodA, prodB, sellA, sellB, qA, qB };
  };

  // ——— Day / hour hooks ———
  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    this.recordSectorIndices();
    this.tickBoard();
    this.checkCampaignAdvance();
  };

  const _onHour = Proto.onHour;
  Proto.onHour = function () {
    _onHour.call(this);
  };
})();
