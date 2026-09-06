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
    heatmap: false,
  };

  function dirty(immediate) {
    game._dirty = true;
    if (immediate) saveNow();
  }

  function saveNow() {
    const s = game.state;
    if (!s) return;
    game._dirty = false;
    game._lastSave = performance.now();
    try {
      s.thumb = MAP.dotsThumb();
    } catch (_) {}
    STORE.save(s).catch(function () {});
  }

  function ensureMap() {
    if (!window.L) {
      UI.toast("El mapa no se ha cargado (vendor/leaflet.js). El resto del juego sí arranca.", true);
      return;
    }
    try {
      if (!game._mapReady) {
        MAP.init(game);
        game._mapReady = true;
      }
      MAP.invalidate();
      MAP.refresh();
    } catch (err) {
      console.error(err);
      UI.toast("Error al crear el mapa: " + (err && err.message ? err.message : err), true);
    }
  }

  function newGame() {
    try {
      const input = U.$("#new-name");
      const name = ((input && input.value) || "Horizon 2000").trim() || "Horizon 2000";
      game.state = STORE.blankState(name);
      try {
        SABOR.ensureBooks(game.state);
      } catch (_) {}
      boot();
      STORE.save(game.state).catch(function () {});
      UI.toast("Horizon abre libros. Caja: 2.000.000 €. 1 de enero de 2000.");
    } catch (err) {
      console.error(err);
      alert("No se pudo empezar la partida: " + (err && err.message ? err.message : err));
    }
  }

  function continueGame() {
    try {
      const m = STORE.meta();
      const idx = (function () {
        try {
          return JSON.parse(localStorage.getItem("meridiano-index") || "[]");
        } catch {
          return [];
        }
      })();
      const id = m.current || (idx[0] && idx[0].id);
      if (!id) {
        UI.toast("No hay partida guardada. Se abre una nueva.", true);
        return newGame();
      }
      return loadSlot(id);
    } catch (err) {
      console.error(err);
      UI.toast("No hay partida guardada. Se abre una nueva.", true);
      return newGame();
    }
  }

  function loadSlot(id) {
    return STORE.load(id)
      .then(function (s) {
        if (!s) {
          UI.toast("No se pudo cargar.", true);
          return;
        }
        game.state = s;
        boot();
      })
      .catch(function (err) {
        console.error(err);
        UI.toast("No se pudo cargar la partida.", true);
      });
  }

  function boot() {
    UI.hideSplash();
    UI.closeModal();
    ensureMap();
    UI.renderHud();
    UI.renderPanel();
    if (game._mapReady) MAP.refresh();
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
    try {
      const yb = SABOR.maybeYearbook(s, from, to);
      if (yb && force) UI.toast("Anuario " + yb.year + " listo en Prensa.");
    } catch (_) {}
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

  function confirmBuild(brandId, sizeId, place, quote, extra) {
    const s = game.state;
    if (s.cash < quote.total) {
      UI.toast("No hay caja para esta inversión.", true);
      return false;
    }
    s.cash -= quote.total;
    const r = SIM.createRestaurant(s, {
      brandId,
      size: sizeId,
      place,
      quote,
      hallBrands: (extra && extra.hallBrands) || [],
      photo: extra && extra.photo,
      description: extra && extra.description,
    });
    s.restaurants.push(r);
    try {
      SABOR.sfx.cash();
    } catch (_) {}
    if (!s.competitors[r.country]) s.competitors[r.country] = { strength: WORLD.competitorBase(r.country) };
    SIM.pushNews(s, s.gameTime, `Solicitud de permisos: ${r.name} (${U.formatMoney(quote.total)})${r.size === "food_hall" ? " · food hall" : r.size === "ghost" ? " · cocina fantasma" : ""}.`);
    UI.toast("Permisos en marcha. El tiempo de juego hace el resto.");
    UI.renderHud();
    UI.renderPanel();
    MAP.refresh();
    saveNow();
    return true;
  }

  function openRestaurant(id) {
    const r = game.state.restaurants.find((x) => x.id === id);
    if (!r) return;
    MAP.fly(r.lat, r.lon, 16);
    try {
      SABOR.sfx.enter();
    } catch (_) {}
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
      saveNow();
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
  game.saveNow = saveNow;

  window.GAME = game;
  try {
    UI.mount(game);
  } catch (err) {
    console.error(err);
    alert("Error al iniciar Meridiano: " + (err && err.message ? err.message : err));
  }
  requestAnimationFrame(loop);
})();
