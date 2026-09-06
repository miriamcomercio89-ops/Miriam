/* Meridiano — partidas: localStorage primero (funciona abriendo el HTML), IndexedDB opcional */
(function (global) {
  const DB_NAME = "meridiano-db";
  const DB_VER = 1;
  const META = "meridiano-meta";
  const INDEX = "meridiano-index";

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
    return "meridiano-save-" + id;
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
      cash: 2000000,
      restaurants: [],
      events: [],
      news: [
        {
          t: Date.UTC(2000, 0, 1, 8, 0, 0),
          kind: "editorial",
          decade: 2000,
          text: "1 de enero de 2000. Horizon Restaurant Group abre libros. El mundo es una carta en blanco.",
        },
      ],
      competitors,
      revByCountry: {},
      cashHistory: [{ t: Date.UTC(2000, 0, 1, 8, 0, 0), v: 2000000 }],
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
      n: (state.restaurants || []).length,
      countries: new Set((state.restaurants || []).map((r) => r.country)).size,
      thumb: state.thumb || null,
    };
  }

  function readLocal(id) {
    try {
      const raw = localStorage.getItem(lsSaveKey(id)) || localStorage.getItem("meridiano-fallback-" + id);
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

  async function save(state) {
    state.savedAt = Date.now();
    const clone = JSON.parse(JSON.stringify(state));
    const json = JSON.stringify(clone);
    try {
      localStorage.setItem(lsSaveKey(state.id), json);
    } catch (_) {
      try {
        const slim = JSON.parse(json);
        (slim.restaurants || []).forEach((r) => {
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
    }
    return s;
  }

  async function remove(id) {
    try {
      localStorage.removeItem(lsSaveKey(id));
      localStorage.removeItem("meridiano-fallback-" + id);
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
    const blob = JSON.stringify(state);
    U.download(`meridiano-${state.name.replace(/\s+/g, "_")}-${new Date(state.gameTime).toISOString().slice(0, 10)}.json`, blob);
  }

  function parseImport(text) {
    const data = JSON.parse(text);
    if (!data || !data.gameTime || !Array.isArray(data.restaurants)) throw new Error("Archivo no válido");
    data.id = data.id || U.uid("slot");
    data.savedAt = Date.now();
    return data;
  }

  global.STORE = { blankState, summaryOf, listSlots, save, load, remove, exportJSON, parseImport, meta, setMeta };
})(window);
