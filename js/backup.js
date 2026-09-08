/* Horizon — copia de seguridad real en disco (File System Access API) + almacenamiento
   persistente, para que las partidas guardadas y las fotos subidas no dependan solo de
   localStorage/IndexedDB (que el navegador puede borrar al "borrar caché y datos del
   sitio"). Si el navegador lo soporta (Chrome/Edge de escritorio), el jugador elige una
   vez un archivo real en su disco y, a partir de ahí, cada guardado se escribe también
   ahí de forma automática: ese archivo no lo toca ningún borrado de caché del navegador.
   En navegadores sin esa API (Firefox, Safari…) se activa en su lugar una descarga
   periódica automática del guardado a la carpeta de Descargas, para que el respaldo en
   disco también funcione ahí. */
(function (global) {
  const DB_NAME = "horizon-backup-db";
  const DB_VER = 1;
  const STORE_NAME = "handles";
  const HANDLE_KEY = "backup-file";
  const FALLBACK_KEY = "horizon-backup-fallback";
  const FALLBACK_MIN_GAP_MS = 5 * 60 * 1000; /* no descargar más de una vez cada 5 min reales */

  let handle = null;
  let active = false;
  let lastError = "";
  let fileName = "";
  let fallbackActive = false;
  let lastFallbackWriteMs = 0;
  const listeners = [];

  function supported() {
    return typeof global.showSaveFilePicker === "function";
  }

  function readFallbackFlag() {
    try {
      return global.localStorage.getItem(FALLBACK_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function writeFallbackFlag(on) {
    try {
      if (on) global.localStorage.setItem(FALLBACK_KEY, "1");
      else global.localStorage.removeItem(FALLBACK_KEY);
    } catch (_) {}
  }

  function status() {
    return { supported: supported(), active: active || fallbackActive, fallback: fallbackActive, hasHandle: !!handle, lastError, fileName };
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function notify() {
    const s = status();
    listeners.forEach((fn) => {
      try {
        fn(s);
      } catch (_) {}
    });
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error("no idb"));
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("idb blocked"));
    });
  }

  async function persistHandle(h) {
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(h, HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (_) {}
  }

  async function loadPersistedHandle() {
    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const rq = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
        rq.onsuccess = () => resolve(rq.result || null);
        rq.onerror = () => reject(rq.error);
      });
    } catch (_) {
      return null;
    }
  }

  async function clearPersistedHandle() {
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (_) {}
  }

  async function requestPersistentStorage() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        await navigator.storage.persist();
      }
    } catch (_) {}
  }

  /** Al arrancar: si ya se eligió un archivo en una sesión anterior, comprueba el
   * permiso sin mostrar ningún diálogo (queryPermission no requiere gesto del usuario). */
  async function restore() {
    if (!supported()) {
      fallbackActive = readFallbackFlag();
      notify();
      return status();
    }
    try {
      const h = await loadPersistedHandle();
      if (!h) {
        notify();
        return status();
      }
      handle = h;
      fileName = h.name || "";
      const perm = await h.queryPermission({ mode: "readwrite" });
      active = perm === "granted";
      lastError = active ? "" : "permiso";
    } catch (_) {
      lastError = "restaurar";
    }
    notify();
    return status();
  }

  /** Requiere gesto del usuario (clic): vuelve a pedir permiso sobre el mismo archivo
   * ya elegido, sin necesidad de escoger el archivo de nuevo. */
  async function reactivate() {
    if (!handle) return status();
    try {
      const perm = await handle.requestPermission({ mode: "readwrite" });
      active = perm === "granted";
      lastError = active ? "" : "permiso";
    } catch (_) {
      active = false;
      lastError = "permiso";
    }
    notify();
    return status();
  }

  /** Requiere gesto del usuario (clic): elige o crea el archivo real de copia de
   * seguridad en disco. En navegadores sin la File System Access API (Firefox,
   * Safari…) activa en su lugar la descarga periódica automática a la carpeta de
   * Descargas, que tampoco depende de la caché del navegador. */
  async function enable(suggestedName) {
    if (!supported()) {
      fallbackActive = true;
      lastError = "";
      writeFallbackFlag(true);
      notify();
      return status();
    }
    try {
      const h = await global.showSaveFilePicker({
        suggestedName: suggestedName || "horizon-backup.json",
        types: [{ description: "Copia de seguridad de Horizon", accept: { "application/json": [".json"] } }],
      });
      handle = h;
      fileName = h.name || "";
      active = true;
      lastError = "";
      await persistHandle(h);
    } catch (e) {
      if (e && e.name !== "AbortError") lastError = "elegir-archivo";
    }
    notify();
    return status();
  }

  function disable() {
    handle = null;
    fileName = "";
    active = false;
    fallbackActive = false;
    lastError = "";
    clearPersistedHandle();
    writeFallbackFlag(false);
    notify();
    return status();
  }

  /** Descarga el JSON de la partida a la carpeta de Descargas del navegador (best
   * effort, sin bloquear el juego). Se usa como respaldo en disco cuando el
   * navegador no admite elegir un archivo fijo (File System Access API). */
  function downloadNow(state) {
    try {
      const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "horizon-autoguardado.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      lastError = "";
    } catch (_) {
      lastError = "descarga";
    }
  }

  let writing = false;
  let pending = null;
  /** Escribe la partida completa (incluidas las fotos) en el archivo real; nunca
   * bloquea el juego: mejor esfuerzo, con reintento si llega un guardado mientras
   * se está escribiendo el anterior. */
  async function writeNow(state) {
    if (!state) return;
    if (fallbackActive) {
      const now = Date.now();
      if (now - lastFallbackWriteMs >= FALLBACK_MIN_GAP_MS) {
        lastFallbackWriteMs = now;
        downloadNow(state);
      }
      return;
    }
    if (!active || !handle) return;
    pending = state;
    if (writing) return;
    writing = true;
    try {
      while (pending) {
        const s = pending;
        pending = null;
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(s));
        await writable.close();
      }
      lastError = "";
    } catch (_) {
      active = false;
      lastError = "escritura";
      notify();
    } finally {
      writing = false;
    }
  }

  global.BACKUP = {
    supported,
    status,
    onChange,
    requestPersistentStorage,
    restore,
    reactivate,
    enable,
    disable,
    writeNow,
    downloadNow,
  };
})(window);
