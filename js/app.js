/* Meridiano — bucle de juego */
(function () {
  const GAME_MS_PER_REAL_MS = 60; /* 1 s real = 1 min de juego a 1× */

  const game = {
    state: null,
    uiTab: "locales",
    openId: null,
    filters: { brand: "", cuisine: "", country: "", status: "", profit: "", sort: "new" },
    _lastUi: 0,
    _lastSave: 0,
    _lastNews: 0,
    _busyGeo: false,
    _mapReady: false,
  };

  function dirty() {
    game._dirty = true;
  }

  function ensureMap() {
    if (!game._mapReady) {
      MAP.init(game);
      game._mapReady = true;
    }
    MAP.invalidate();
    MAP.refresh();
  }

  async function newGame() {
    const input = U.$("#new-name");
    const name = ((input && input.value) || "Meridiano 2000").trim() || "Meridiano 2000";
    game.state = STORE.blankState(name);
    await STORE.save(game.state);
    boot();
    UI.toast("Libros abiertos. Caja: 2.000.000 €. 1 de enero de 2000.");
  }

  async function continueGame() {
    const m = STORE.meta();
    const slots = await STORE.listSlots();
    const id = m.current || (slots[0] && slots[0].id);
    if (!id) return newGame();
    return loadSlot(id);
  }

  async function loadSlot(id) {
    const s = await STORE.load(id);
    if (!s) {
      UI.toast("No se pudo cargar.", true);
      return;
    }
    game.state = s;
    boot();
  }

  function boot() {
    UI.hideSplash();
    UI.closeModal();
    ensureMap();
    UI.renderHud();
    UI.renderPanel();
    MAP.refresh();
    dirty();
  }

  function setSpeed(sp) {
    if (!game.state) return;
    if (sp === 0) {
      game.state.paused = true;
      game.state.speed = 0;
    } else {
      game.state.paused = false;
      game.state.speed = sp;
    }
    UI.renderHud();
  }

  function togglePause() {
    if (!game.state) return;
    if (game.state.paused || game.state.speed === 0) setSpeed(1);
    else setSpeed(0);
    U.$$("#speeds button").forEach((x) => x.classList.toggle("active", +x.dataset.sp === (game.state.paused ? 0 : game.state.speed)));
  }

  function skipDay() {
    if (!game.state) return;
    advance(24 * 3600000, true);
    UI.toast("Has saltado un día de juego.");
  }

  function advance(gameMs, force) {
    const s = game.state;
    if (!s) return;
    const from = s.gameTime;
    const to = from + gameMs;
    s.gameTime = to;
    SIM.tickReopen(s, to);
    const n = s.restaurants.length;
    if (n > 2500 && gameMs > 6 * 3600000) {
      const step = Math.ceil(n / 400);
      for (let i = 0; i < n; i += step) SIM.settleOne(s, s.restaurants[i], s.restaurants[i].lastSim || from, to);
      for (const r of s.restaurants) if (r.lastSim < to - 3600000) r.lastSim = to;
    } else {
      SIM.settleAll(s, to);
    }
    SIM.maybeEvents(s, from, to);
    SIM.driftCompetition(s, gameMs / 3600000);
    if (s.cash < 0) s.cash -= ((-s.cash) * 0.08 * gameMs) / (365 * 86400000);
    if (!s.cashHistory) s.cashHistory = [];
    if (!s.cashHistory.length || to - s.cashHistory[s.cashHistory.length - 1].t > 12 * 3600000) {
      s.cashHistory.push({ t: to, v: s.cash });
      if (s.cashHistory.length > 120) s.cashHistory.shift();
    }
    dirty();
    if (force) {
      UI.renderHud();
      UI.renderPanel();
      MAP.refresh();
    }
  }

  async function onMapClick(lat, lon) {
    if (!game.state || game._busyGeo) return;
    game._busyGeo = true;
    UI.toast("Consultando OpenStreetMap…");
    try {
      const raw = await GEO.reverse(lat, lon);
      if (!raw.ok) {
        UI.toast(raw.reason || "No edificable.", true);
        return;
      }
      const place = GEO.enrich(raw);
      UI.showBuild(place);
    } catch (e) {
      UI.toast("Falló la geocodificación.", true);
    } finally {
      game._busyGeo = false;
    }
  }

  function confirmBuild(brandId, sizeId, place, quote) {
    const s = game.state;
    if (s.cash < quote.total) {
      UI.toast("No hay caja para esta inversión.", true);
      return false;
    }
    s.cash -= quote.total;
    const r = SIM.createRestaurant(s, { brandId, size: sizeId, place, quote });
    s.restaurants.push(r);
    if (!s.competitors[r.country]) s.competitors[r.country] = { strength: WORLD.competitorBase(r.country) };
    SIM.pushNews(s, s.gameTime, `Solicitud de permisos: ${r.name} (${U.formatMoney(quote.total)}).`);
    UI.toast("Permisos en marcha. El tiempo de juego hace el resto.");
    UI.renderHud();
    UI.renderPanel();
    MAP.refresh();
    dirty();
    return true;
  }

  function openRestaurant(id) {
    const r = game.state.restaurants.find((x) => x.id === id);
    if (!r) return;
    MAP.fly(r.lat, r.lon, 16);
    UI.showRestaurant(id);
  }

  function goMyLocation() {
    if (!navigator.geolocation) return UI.toast("Sin geolocalización.", true);
    navigator.geolocation.getCurrentPosition(
      (p) => MAP.fly(p.coords.latitude, p.coords.longitude, 14),
      () => UI.toast("No se pudo leer tu ubicación.", true),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function exportSave() {
    if (game.state) STORE.exportJSON(game.state);
  }

  async function importSave(text) {
    try {
      const data = STORE.parseImport(text);
      data.id = U.uid("slot");
      game.state = data;
      await STORE.save(data);
      boot();
      UI.toast("Partida importada.");
    } catch {
      UI.toast("JSON inválido.", true);
    }
  }

  let lastTs = performance.now();
  function loop(ts) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.2, (ts - lastTs) / 1000);
    lastTs = ts;
    const s = game.state;
    if (!s) return;
    if (!s.paused && s.speed > 0) {
      advance(dt * 1000 * GAME_MS_PER_REAL_MS * s.speed, false);
    }
    if (ts - game._lastUi > 400) {
      game._lastUi = ts;
      UI.renderHud();
      if (game.uiTab === "locales" || game.uiTab === "ranking") UI.renderPanel();
    }
    if (game._dirty && ts - game._lastSave > 20000) {
      game._lastSave = ts;
      game._dirty = false;
      STORE.save(s);
    }
  }

  game.onMapClick = onMapClick;
  game.confirmBuild = confirmBuild;
  game.openRestaurant = openRestaurant;
  game.setSpeed = setSpeed;
  game.togglePause = togglePause;
  game.skipDay = skipDay;
  game.goMyLocation = goMyLocation;
  game.exportSave = exportSave;
  game.importSave = importSave;
  game.newGame = newGame;
  game.continueGame = continueGame;
  game.loadSlot = loadSlot;
  game.dirty = dirty;

  UI.mount(game);
  requestAnimationFrame(loop);
  window.GAME = game;
})();
