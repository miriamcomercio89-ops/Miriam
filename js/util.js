/* Meridiano — utilidades */
(function (global) {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function uid(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function mulberry32(seed) {
    let a = seed | 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function formatMoney(n, digits = 0) {
    if (!Number.isFinite(n)) return "—";
    const abs = Math.abs(n);
    const sign = n < 0 ? "−" : "";
    if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + " B€";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + " mil M€";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + " M€";
    if (abs >= 10000) return sign + Math.round(abs).toLocaleString("es-ES") + " €";
    return sign + abs.toLocaleString("es-ES", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " €";
  }

  function formatInt(n) {
    return Math.round(n).toLocaleString("es-ES");
  }

  function formatDate(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString("es-ES", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  }

  function formatDateTime(ms) {
    const d = new Date(ms);
    return d.toLocaleString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function gameParts(ms) {
    const d = new Date(ms);
    return {
      y: d.getUTCFullYear(),
      m: d.getUTCMonth(),
      day: d.getUTCDate(),
      h: d.getUTCHours(),
      min: d.getUTCMinutes(),
      dow: d.getUTCDay(),
      iso: d.toISOString().slice(0, 10),
    };
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function throttleQueue(minInterval) {
    let last = 0;
    let chain = Promise.resolve();
    return function (fn) {
      chain = chain.then(async () => {
        const wait = minInterval - (Date.now() - last);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        last = Date.now();
        return fn();
      });
      return chain;
    };
  }

  /* Geohash (base32) para índice espacial */
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  function geohash(lat, lon, precision = 6) {
    let idx = 0;
    let bit = 0;
    let even = true;
    let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
    let hash = "";
    while (hash.length < precision) {
      if (even) {
        const mid = (lonMin + lonMax) / 2;
        if (lon >= mid) {
          idx = idx * 2 + 1;
          lonMin = mid;
        } else {
          idx = idx * 2;
          lonMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if (lat >= mid) {
          idx = idx * 2 + 1;
          latMin = mid;
        } else {
          idx = idx * 2;
          latMax = mid;
        }
      }
      even = !even;
      if (bit < 4) bit++;
      else {
        hash += BASE32[idx];
        bit = 0;
        idx = 0;
      }
    }
    return hash;
  }

  function haversineKm(aLat, aLon, bLat, bLon) {
    const R = 6371;
    const dLat = ((bLat - aLat) * Math.PI) / 180;
    const dLon = ((bLon - aLon) * Math.PI) / 180;
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  function svgToDataUri(svg) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, "");
      else if (v !== false && v != null) n.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  global.U = {
    $,
    $$,
    uid,
    clamp,
    lerp,
    rand,
    pick,
    mulberry32,
    hash32,
    formatMoney,
    formatInt,
    formatDate,
    formatDateTime,
    pad2,
    gameParts,
    debounce,
    throttleQueue,
    geohash,
    haversineKm,
    download,
    svgToDataUri,
    el,
  };
})(window);
