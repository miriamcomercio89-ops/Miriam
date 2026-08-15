/** Sistemas v7: tutorial, política, chat, escenarios, edificios family, cloud */
window.IM = window.IM || {};

(function v7() {
  const Proto = IM.Game && IM.Game.prototype;
  if (!Proto) return;

  const _init = Proto.init;
  Proto.init = function (saved) {
    _init.call(this, saved);
    const st = this.state;
    st.tutorialStep = st.tutorialStep || 0;
    st.tutorialDone = !!st.tutorialDone;
    st.tutorialSkipped = !!st.tutorialSkipped;
    st.corpChat = st.corpChat || [];
    st.politicalEvents = st.politicalEvents || [];
    st.policyMods = st.policyMods || { freightMul: 1, waterMul: 1, exportMul: 1, pollutionFineMul: 1, untilDay: null };
    st.unlockedScenarios = st.unlockedScenarios || [];
    st.sandboxId = st.sandboxId || null;
    st.mode = st.mode || 'campaign'; // campaign | sandbox
    // Unlock scenarios by chapter progress
    (IM_DATA.sandboxScenarios || []).forEach((sc) => {
      if ((st.campaignChapter || 1) >= sc.unlockChapter && !st.unlockedScenarios.includes(sc.id)) {
        st.unlockedScenarios.push(sc.id);
      }
    });
    this.emit();
  };

  // ——— Edificios: family compatible con recetas ———
  Proto.buildingRecipeFamily = function (buildingTypeId) {
    const b = IM.buildingById(buildingTypeId);
    return b?.family || buildingTypeId;
  };

  const _install = Proto.installMachine;
  Proto.installMachine = function (siteId, buildingId, slotIndex, machineId, recipeId, opts = {}) {
    const site = this.state.sites.find((s) => s.id === siteId);
    const building = site?.buildings.find((b) => b.id === buildingId);
    const recipe = IM.recipeById(recipeId);
    if (building && recipe) {
      const fam = this.buildingRecipeFamily(building.type);
      if (recipe.building !== building.type && recipe.building !== fam) {
        return { ok: false, error: 'Receta incompatible con este edificio' };
      }
      // Temporarily alias type for base installer
      const realType = building.type;
      if (recipe.building === fam && recipe.building !== realType) {
        building.type = fam;
        const r = _install.call(this, siteId, buildingId, slotIndex, machineId, recipeId, opts);
        building.type = realType;
        return r;
      }
    }
    return _install.call(this, siteId, buildingId, slotIndex, machineId, recipeId, opts);
  };

  // ——— Chat corporativo ———
  Proto.pushCorpChat = function (msg, kind = 'info', from = 'HQ') {
    this.state.corpChat.unshift({
      id: IM.uid('chat'),
      t: Date.now(),
      day: this.state.day,
      year: this.state.year,
      from,
      kind,
      text: msg,
    });
    if (this.state.corpChat.length > 80) this.state.corpChat.length = 80;
  };

  Proto.tickCorpChat = function () {
    // Messages from subsidiaries
    Object.values(this.state.subsidiaries || {}).forEach((sub) => {
      if (Math.random() > 0.12) return;
      const loc = IM.locationById(sub.locationId);
      const site = this.state.sites.find((s) => s.id === sub.siteId);
      const status = this.subsidiaryHealth(sub);
      const lines = {
        green: [`${sub.name}: producción estable en ${loc?.name || ''}.`, `${sub.name}: sin incidencias este turno.`],
        amber: [`${sub.name}: atención — posibles cuellos en ${loc?.name || ''}.`, `${sub.name}: stock o energía justos.`],
        red: [`${sub.name}: ALERTA en ${loc?.name || ''} — revisar planta.`, `${sub.name}: OEE bajo / bloqueos.`],
      };
      const pool = lines[status] || lines.amber;
      this.pushCorpChat(pool[Math.floor(Math.random() * pool.length)], status === 'red' ? 'alert' : 'info', sub.name);
    });
    if (this.state.politicalEvents?.[0] && Math.random() < 0.3) {
      this.pushCorpChat(`Asuntos públicos: ${this.state.politicalEvents[0].title}`, 'politics', 'Lobby');
    }
  };

  Proto.subsidiaryHealth = function (sub) {
    const site = this.state.sites.find((s) => s.id === sub.siteId);
    if (!site) return 'red';
    const slots = site.buildings.flatMap((b) => b.slots || []).filter(Boolean);
    if (!slots.length) return 'amber';
    const blocked = slots.filter((s) => s.lastBlockReason).length;
    const ratio = blocked / slots.length;
    if (ratio > 0.45) return 'red';
    if (ratio > 0.15 || slots.some((s) => (s.condition || 1) < 0.45)) return 'amber';
    return 'green';
  };

  Proto.getSubsidiaryMinimap = function () {
    return Object.values(this.state.subsidiaries || {}).map((sub) => {
      const loc = IM.locationById(sub.locationId);
      const site = this.state.sites.find((s) => s.id === sub.siteId);
      return {
        id: sub.id,
        name: sub.name,
        specialty: sub.specialty,
        location: loc?.name,
        lat: loc?.lat,
        lng: loc?.lng,
        status: this.subsidiaryHealth(sub),
        buildings: site?.buildings?.length || 0,
      };
    });
  };

  // ——— Eventos políticos ———
  Proto.spawnPoliticalEvent = function () {
    const pool = IM_DATA.politicalEvents || [];
    if (!pool.length) return;
    const ev = pool[Math.floor(Math.random() * pool.length)];
    const active = {
      ...ev,
      uid: IM.uid('pol'),
      day: this.state.day,
      year: this.state.year,
      expiresDay: this.state.day + (ev.effect?.days || 12),
    };
    this.state.politicalEvents.unshift(active);
    if (this.state.politicalEvents.length > 5) this.state.politicalEvents.length = 5;
    this.applyPoliticalEffect(active);
    this.pushCorpChat(`Boletín oficial: ${ev.title} — ${ev.text}`, 'politics', 'Gobierno');
    this.log(`Política: ${ev.title}`, 'alert');
  };

  Proto.applyPoliticalEffect = function (ev) {
    const e = ev.effect || {};
    if (e.money) this.earn(e.money);
    if (e.greenCredit) this.state.greenCredits = (this.state.greenCredits || 0) + e.greenCredit;
    if (e.creditRating) this.state.creditRating = IM.clamp(this.state.creditRating + e.creditRating, 10, 100);
    if (e.categoryPrice) {
      Object.entries(e.categoryPrice).forEach(([cat, mul]) => {
        (IM_DATA.items || []).forEach((it) => {
          if (it.category === cat) this.state.prices[it.id] = (this.state.prices[it.id] || it.basePrice) * mul;
        });
      });
    }
    if (e.categoryDemand) {
      Object.entries(e.categoryDemand).forEach(([cat, mul]) => {
        (IM_DATA.items || []).forEach((it) => {
          if (it.category === cat) this.state.demand[it.id] = (this.state.demand[it.id] || 1) * mul;
        });
      });
    }
    this.state.policyMods = this.state.policyMods || {};
    if (e.freightMul) this.state.policyMods.freightMul = e.freightMul;
    if (e.waterMul) this.state.policyMods.waterMul = e.waterMul;
    if (e.exportMul) this.state.policyMods.exportMul = e.exportMul;
    if (e.pollutionFineMul) this.state.policyMods.pollutionFineMul = e.pollutionFineMul;
    if (e.days) this.state.policyMods.untilDay = this.state.day + e.days;
  };

  Proto.tickPoliticalEvents = function () {
    this.state.politicalEvents = (this.state.politicalEvents || []).filter(
      (e) => !(e.year === this.state.year && this.state.day > e.expiresDay)
    );
    if (this.state.policyMods?.untilDay && this.state.day > this.state.policyMods.untilDay) {
      this.state.policyMods = { freightMul: 1, waterMul: 1, exportMul: 1, pollutionFineMul: 1 };
    }
    if (Math.random() < 0.16) this.spawnPoliticalEvent();
  };

  const _exportViaHub = Proto.exportViaHub;
  Proto.exportViaHub = function (locationId, itemId, qty, mode) {
    const r = _exportViaHub.call(this, locationId, itemId, qty, mode);
    if (r.ok && this.state.policyMods?.exportMul && this.state.policyMods.exportMul !== 1) {
      const extra = (r.revenue || 0) * (this.state.policyMods.exportMul - 1);
      this.earn(extra);
      r.revenue += extra;
    }
    return r;
  };

  // ——— Escenarios sandbox ———
  Proto.refreshScenarioUnlocks = function () {
    (IM_DATA.sandboxScenarios || []).forEach((sc) => {
      if ((this.state.campaignChapter || 1) >= sc.unlockChapter && !this.state.unlockedScenarios.includes(sc.id)) {
        this.state.unlockedScenarios.push(sc.id);
        this.pushCorpChat(`Escenario desbloqueado: ${sc.name}`, 'ok', 'Campaña');
      }
    });
  };

  Proto.startSandbox = function (scenarioId) {
    const sc = (IM_DATA.sandboxScenarios || []).find((s) => s.id === scenarioId);
    if (!sc) return { ok: false, error: 'Escenario desconocido' };
    if (!this.state.unlockedScenarios.includes(sc.id) && !this.state.unlockAll) {
      return { ok: false, error: `Desbloquea el capítulo ${sc.unlockChapter} de campaña` };
    }
    const base = IM.createInitialState();
    base.money = sc.money;
    base.campaignChapter = sc.chapter || 1;
    base.campaignBranch = sc.branch || this.state.campaignBranch || 'agro_andaluz';
    base.unlockAll = !!sc.unlockAll;
    base.mode = 'sandbox';
    base.sandboxId = sc.id;
    base.tutorialDone = true;
    base.unlockedScenarios = this.state.unlockedScenarios.slice();
    this.init(base);
    this.pushCorpChat(`Escenario iniciado: ${sc.name}`, 'ok', 'Director');
    this.log(`Sandbox: ${sc.name}`, 'mission');
    this.emit();
    return { ok: true };
  };

  // ——— Tutorial ———
  Proto.tutorialCurrent = function () {
    const steps = IM_DATA.tutorialSteps || [];
    return steps[this.state.tutorialStep] || null;
  };

  Proto.tutorialNext = function () {
    const steps = IM_DATA.tutorialSteps || [];
    if (this.state.tutorialStep >= steps.length - 1) {
      this.state.tutorialDone = true;
      this.pushCorpChat('Tutorial completado. ¡A conquistar décadas!', 'ok', 'Tutor');
      this.emit();
      return { ok: true, done: true };
    }
    this.state.tutorialStep += 1;
    this.emit();
    return { ok: true };
  };

  Proto.tutorialSkip = function () {
    this.state.tutorialDone = true;
    this.state.tutorialSkipped = true;
    this.emit();
    return { ok: true };
  };

  // ——— Cloud apply ———
  Proto.applyCloudSnapshot = function (data) {
    const base = IM.createInitialState();
    Object.assign(base, data);
    base.prices = {};
    (IM_DATA.items || []).forEach((it) => {
      base.prices[it.id] = it.basePrice * (base.inflationIndex || 1);
    });
    this.init(base);
    return { ok: true };
  };

  const _onDay = Proto.onDay;
  Proto.onDay = function () {
    _onDay.call(this);
    this.tickPoliticalEvents();
    this.tickCorpChat();
    this.refreshScenarioUnlocks();
  };
})();
