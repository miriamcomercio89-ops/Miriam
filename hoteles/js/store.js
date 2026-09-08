/* Horizon Hotels — partidas: localStorage primero (funciona abriendo el HTML), IndexedDB opcional.
   Claves propias (horizon-hotels-*) para no colisionar con el simulador de
   restaurantes si ambos se abren en el mismo origen/navegador. */
(function (global) {
  const DB_NAME = "horizon-hotels-db";
  const DB_VER = 1;
  const META = "horizon-hotels-meta";
  const INDEX = "horizon-hotels-index";

  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("timeout")), ms);
      promise.then(
        (v) => {
          clearTimeout(t);
          resolve(v);
        },
        (e) => {
          clearTimeout(t);
          reject(e);
        }
      );
    });
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error("no idb"));
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("saves")) db.createObjectStore("saves", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("idb blocked"));
    });
  }

  async function idbPut(save) {
    const db = await withTimeout(openDb(), 800);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").put(save);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbGet(id) {
    const db = await withTimeout(openDb(), 800);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readonly");
      const rq = tx.objectStore("saves").get(id);
      rq.onsuccess = () => resolve(rq.result || null);
      rq.onerror = () => reject(rq.error);
    });
  }

  async function idbDel(id) {
    const db = await withTimeout(openDb(), 800);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbAll() {
    const db = await withTimeout(openDb(), 800);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readonly");
      const rq = tx.objectStore("saves").getAll();
      rq.onsuccess = () => resolve(rq.result || []);
      rq.onerror = () => reject(rq.error);
    });
  }

  function meta() {
    try {
      return JSON.parse(localStorage.getItem(META) || "{}");
    } catch {
      return {};
    }
  }
  function setMeta(m) {
    try {
      localStorage.setItem(META, JSON.stringify(m));
    } catch (_) {}
  }

  function lsIndex() {
    try {
      return JSON.parse(localStorage.getItem(INDEX) || "[]");
    } catch {
      return [];
    }
  }

  function setLsIndex(arr) {
    try {
      localStorage.setItem(INDEX, JSON.stringify(arr));
    } catch (_) {}
  }

  function lsSaveKey(id) {
    return "horizon-hotels-save-" + id;
  }

  function blankState(name) {
    const competitors = {};
    for (const iso of Object.keys(WORLD.COUNTRIES)) {
      competitors[iso] = { strength: WORLD.competitorBase(iso) };
    }
    return {
      id: U.uid("slot"),
      name: name || "Partida",
      createdAt: Date.now(),
      savedAt: Date.now(),
      gameTime: Date.UTC(2000, 0, 1, 8, 0, 0),
      speed: 1,
      paused: false,
      cash: 5000000,
      loans: [],
      hotels: [],
      events: [],
      news: [
        {
          t: Date.UTC(2000, 0, 1, 8, 0, 0),
          kind: "editorial",
          decade: 2000,
          text: "1 de enero de 2000. Horizon Hotels abre su primer libro de reservas. El mundo entero está por hospedar.",
        },
      ],
      competitors,
      revByCountry: {},
      cashHistory: [{ t: Date.UTC(2000, 0, 1, 8, 0, 0), v: 5000000 }],
      books: {},
      yearbooks: [],
    };
  }

  function summaryOf(state) {
    return {
      id: state.id,
      name: state.name,
      savedAt: state.savedAt,
      gameTime: state.gameTime,
      cash: state.cash,
      n: (state.hotels || []).length,
      countries: new Set((state.hotels || []).map((r) => r.country)).size,
      thumb: state.thumb || null,
    };
  }

  function readLocal(id) {
    try {
      const raw = localStorage.getItem(lsSaveKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async function listSlots() {
    const local = lsIndex();
    try {
      const all = await idbAll();
      const map = {};
      local.forEach((s) => {
        map[s.id] = s;
      });
      all.forEach((s) => {
        const sum = summaryOf(s);
        if (!map[sum.id] || sum.savedAt >= (map[sum.id].savedAt || 0)) map[sum.id] = sum;
      });
      return Object.values(map).sort((a, b) => b.savedAt - a.savedAt);
    } catch {
      return local.sort((a, b) => b.savedAt - a.savedAt);
    }
  }

  function stripTransient(state) {
    delete state._vp;
    delete state._openId;
    return state;
  }

  async function save(state) {
    state.savedAt = Date.now();
    stripTransient(state);
    const clone = JSON.parse(JSON.stringify(state));
    const json = JSON.stringify(clone);
    try {
      localStorage.setItem(lsSaveKey(state.id), json);
    } catch (_) {
      try {
        const slim = JSON.parse(json);
        (slim.hotels || []).forEach((r) => {
          r.photo = "";
        });
        localStorage.setItem(lsSaveKey(state.id), JSON.stringify(slim));
      } catch (e2) {
        console.warn("No se pudo guardar en localStorage", e2);
      }
    }
    const idx = lsIndex().filter((x) => x.id !== state.id);
    idx.unshift(summaryOf(state));
    setLsIndex(idx.slice(0, 16));
    const m = meta();
    m.current = state.id;
    setMeta(m);
    try {
      await idbPut(clone);
    } catch (_) {}
    return summaryOf(state);
  }

  async function load(id) {
    let local = readLocal(id);
    let idb = null;
    try {
      idb = await idbGet(id);
    } catch (_) {}
    let s = null;
    if (local && idb) s = (idb.savedAt || 0) >= (local.savedAt || 0) ? idb : local;
    else s = local || idb;
    if (s) {
      const m = meta();
      m.current = id;
      setMeta(m);
      stripTransient(s);
      if (Array.isArray(s.hotels)) sanitizeHotels(s.hotels);
    }
    return s;
  }

  async function remove(id) {
    try {
      localStorage.removeItem(lsSaveKey(id));
    } catch (_) {}
    setLsIndex(lsIndex().filter((x) => x.id !== id));
    try {
      await idbDel(id);
    } catch (_) {}
    const m = meta();
    if (m.current === id) delete m.current;
    setMeta(m);
  }

  function exportJSON(state) {
    stripTransient(state);
    const blob = JSON.stringify(state);
    U.download(`horizon-hotels-${state.name.replace(/\s+/g, "_")}-${new Date(state.gameTime).toISOString().slice(0, 10)}.json`, blob);
  }

  function sanitizeHotels(list) {
    for (const r of list) {
      if (!r || typeof r !== "object") continue;
      if (!r.gh && Number.isFinite(r.lat) && Number.isFinite(r.lon)) r.gh = U.geohash(r.lat, r.lon, 6);
      if (!r.finance) {
        r.finance = { revTotal: 0, costTotal: 0, taxTotal: 0, customersTotal: 0, revToday: 0, costToday: 0, customersToday: 0, dayStamp: "", months: {} };
      }
      if (!Array.isArray(r.staff)) r.staff = [];
      if (!Array.isArray(r.amenities)) r.amenities = [];
      if (!Array.isArray(r.reviews)) r.reviews = [];
      if (!r.status) r.status = "abierto";
      if (!r.htype && r.size) r.htype = r.size;
    }
    return list;
  }

  function parseImport(text) {
    const data = JSON.parse(text);
    if (!data || !data.gameTime || !Array.isArray(data.hotels)) throw new Error("Archivo no válido");
    data.id = data.id || U.uid("slot");
    data.savedAt = Date.now();
    if (!Array.isArray(data.loans)) data.loans = [];
    stripTransient(data);
    sanitizeHotels(data.hotels);
    return data;
  }

  global.STORE = { blankState, summaryOf, listSlots, save, load, remove, exportJSON, parseImport, meta, setMeta };
})(window);
