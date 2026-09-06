/* Meridiano — partidas: IndexedDB + localStorage, varias ranuras, auto-guardado */
(function (global) {
  const DB_NAME = "meridiano-db";
  const DB_VER = 1;
  const META = "meridiano-meta";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("saves")) db.createObjectStore("saves", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(save) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").put(save);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbGet(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readonly");
      const rq = tx.objectStore("saves").get(id);
      rq.onsuccess = () => resolve(rq.result || null);
      rq.onerror = () => reject(rq.error);
    });
  }

  async function idbDel(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbAll() {
    const db = await openDb();
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
    localStorage.setItem(META, JSON.stringify(m));
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
      cash: 2_000_000,
      restaurants: [],
      events: [],
      news: [
        {
          t: Date.UTC(2000, 0, 1, 8, 0, 0),
          text: "1 de enero de 2000. Grupo Meridiano abre libros. El mundo es una carta en blanco.",
        },
      ],
      competitors,
      revByCountry: {},
      cashHistory: [{ t: Date.UTC(2000, 0, 1, 8, 0, 0), v: 2_000_000 }],
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
    };
  }

  async function listSlots() {
    try {
      const all = await idbAll();
      return all.map(summaryOf).sort((a, b) => b.savedAt - a.savedAt);
    } catch {
      return [];
    }
  }

  async function save(state) {
    state.savedAt = Date.now();
    const clone = JSON.parse(JSON.stringify(state));
    try {
      await idbPut(clone);
    } catch (e) {
      localStorage.setItem("meridiano-fallback-" + state.id, JSON.stringify(clone));
    }
    const m = meta();
    m.current = state.id;
    setMeta(m);
    return summaryOf(state);
  }

  async function load(id) {
    let s = await idbGet(id);
    if (!s) {
      const raw = localStorage.getItem("meridiano-fallback-" + id);
      if (raw) s = JSON.parse(raw);
    }
    if (s) {
      const m = meta();
      m.current = id;
      setMeta(m);
    }
    return s;
  }

  async function remove(id) {
    await idbDel(id);
    localStorage.removeItem("meridiano-fallback-" + id);
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
