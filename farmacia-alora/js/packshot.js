/**
 * Envases ficticios generados (SVG) por producto — sin fotos de marca reales.
 */
(function (global) {
  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shade(hex, amt) {
    const h = (hex || "#0f766e").replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function formFromPresentacion(p) {
    const t = `${p.presentacion || ""} ${p.nombre || ""}`.toLowerCase();
    if (/jarabe|soluci[oó]n|gotas|elixir|suspens/.test(t)) return "bottle";
    if (/spray|aerosol|inhal/.test(t)) return "spray";
    if (/pomada|crema|gel|ung[uü]ento|tubo/.test(t)) return "tube";
    if (/sobre|efervescente/.test(t)) return "sachet";
    if (/ampolla|vial|inyect/.test(t)) return "vial";
    if (/bebida|agua|refresco|zumo/.test(t) || p.categoria === "Bebidas") return "can";
    if (/snack|chicle|caramelo|galleta|revista/.test(t) || p.categoria === "Snacks / Aperitivos" || p.categoria === "Revistas") return "pouch";
    if (p.nevera) return "vial";
    return "box";
  }

  function shortName(nombre, max) {
    const s = String(nombre || "");
    if (s.length <= max) return s;
    return s.slice(0, max - 1) + "…";
  }

  function packSvg(p, opts) {
    opts = opts || {};
    const w = opts.w || 72;
    const h = opts.h || 88;
    const color = p.colorCategoria || "#0f766e";
    const dark = shade(color, -40);
    const light = shade(color, 55);
    const form = formFromPresentacion(p);
    const marca = shortName(p.marca || "Álora", 12);
    const nombre = shortName(p.nombre || "Producto", 18);
    const dosis = shortName(p.dosis || p.presentacion || "", 14);
    const icon = p.icon || "💊";
    const uid = "pk" + (p.id || Math.random().toString(36).slice(2, 8));

    let body = "";
    if (form === "bottle") {
      body = `
        <rect x="26" y="8" width="20" height="10" rx="2" fill="${dark}"/>
        <rect x="22" y="16" width="28" height="8" rx="2" fill="${shade(color, -20)}"/>
        <path d="M18 28 h36 v48 a8 8 0 0 1 -8 8 H26 a8 8 0 0 1 -8 -8 Z" fill="${color}"/>
        <rect x="22" y="36" width="28" height="28" rx="4" fill="#fff" opacity=".92"/>
        <text x="36" y="48" text-anchor="middle" font-size="7" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="58" text-anchor="middle" font-size="5.5" fill="#334155">${esc(shortName(nombre, 14))}</text>`;
    } else if (form === "spray") {
      body = `
        <rect x="30" y="4" width="12" height="14" rx="2" fill="${dark}"/>
        <circle cx="42" cy="8" r="3" fill="${shade(color, 20)}"/>
        <rect x="24" y="18" width="24" height="58" rx="10" fill="${color}"/>
        <rect x="28" y="28" width="16" height="34" rx="3" fill="#fff" opacity=".9"/>
        <text x="36" y="42" text-anchor="middle" font-size="6" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="52" text-anchor="middle" font-size="5" fill="#475569">${esc(shortName(nombre, 12))}</text>`;
    } else if (form === "tube") {
      body = `
        <path d="M20 12 L52 12 L48 72 L24 72 Z" fill="${color}"/>
        <rect x="22" y="8" width="28" height="8" rx="2" fill="${dark}"/>
        <ellipse cx="36" cy="74" rx="14" ry="5" fill="${dark}"/>
        <rect x="26" y="28" width="20" height="26" rx="3" fill="#fff" opacity=".92"/>
        <text x="36" y="40" text-anchor="middle" font-size="6" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="49" text-anchor="middle" font-size="5" fill="#475569">${esc(shortName(nombre, 11))}</text>`;
    } else if (form === "sachet") {
      body = `
        <path d="M14 16 h44 l-4 56 H18 Z" fill="${color}"/>
        <path d="M14 16 h44 l-2 8 H16 Z" fill="${dark}"/>
        <rect x="22" y="32" width="28" height="24" rx="3" fill="#fff" opacity=".92"/>
        <text x="36" y="44" text-anchor="middle" font-size="6.5" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="53" text-anchor="middle" font-size="5" fill="#475569">${esc(shortName(nombre, 12))}</text>`;
    } else if (form === "vial") {
      body = `
        <rect x="28" y="6" width="16" height="10" rx="2" fill="${dark}"/>
        <rect x="24" y="16" width="24" height="6" fill="${shade(color, -15)}"/>
        <rect x="22" y="22" width="28" height="50" rx="6" fill="${light}" stroke="${color}" stroke-width="2"/>
        <rect x="26" y="34" width="20" height="22" rx="3" fill="#fff" opacity=".95"/>
        <text x="36" y="46" text-anchor="middle" font-size="6" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="54" text-anchor="middle" font-size="5" fill="#334155">${esc(shortName(nombre, 10))}</text>`;
    } else if (form === "can") {
      body = `
        <rect x="18" y="14" width="36" height="60" rx="8" fill="${color}"/>
        <rect x="18" y="14" width="36" height="10" rx="4" fill="${dark}"/>
        <rect x="22" y="30" width="28" height="28" rx="4" fill="#fff" opacity=".9"/>
        <text x="36" y="44" text-anchor="middle" font-size="7" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="54" text-anchor="middle" font-size="5" fill="#475569">${esc(shortName(nombre, 12))}</text>`;
    } else if (form === "pouch") {
      body = `
        <rect x="12" y="18" width="48" height="52" rx="10" fill="${color}"/>
        <rect x="18" y="28" width="36" height="28" rx="4" fill="#fff" opacity=".92"/>
        <text x="36" y="42" text-anchor="middle" font-size="7" font-weight="700" fill="${dark}">${esc(marca)}</text>
        <text x="36" y="52" text-anchor="middle" font-size="5" fill="#475569">${esc(shortName(nombre, 12))}</text>`;
    } else {
      // box
      body = `
        <defs>
          <linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${light}"/>
            <stop offset="55%" stop-color="${color}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>
        </defs>
        <rect x="8" y="10" width="56" height="68" rx="6" fill="url(#${uid}g)" stroke="${dark}" stroke-width="1"/>
        <rect x="8" y="10" width="56" height="16" rx="6" fill="${dark}"/>
        <rect x="8" y="20" width="56" height="6" fill="${dark}"/>
        <text x="36" y="21" text-anchor="middle" font-size="7" font-weight="800" fill="#fff">${esc(marca)}</text>
        <rect x="14" y="32" width="44" height="34" rx="4" fill="#fff" opacity=".94"/>
        <text x="36" y="46" text-anchor="middle" font-size="6.5" font-weight="700" fill="${dark}">${esc(shortName(nombre, 16))}</text>
        <text x="36" y="56" text-anchor="middle" font-size="5" fill="#64748b">${esc(dosis)}</text>
        <text x="36" y="70" text-anchor="middle" font-size="10">${icon}</text>`;
    }

    const badges = [];
    if (p.requiereReceta) {
      badges.push(`<rect x="48" y="4" width="20" height="12" rx="3" fill="#db2777"/><text x="58" y="13" text-anchor="middle" font-size="7" font-weight="800" fill="#fff">℞</text>`);
    }
    if (p.nevera) {
      badges.push(`<circle cx="14" cy="10" r="8" fill="#0284c7"/><text x="14" y="13" text-anchor="middle" font-size="8">❄</text>`);
    }
    if (p.controlado) {
      badges.push(`<rect x="2" y="72" width="22" height="12" rx="3" fill="#7c3aed"/><text x="13" y="81" text-anchor="middle" font-size="6" font-weight="800" fill="#fff">CTRL</text>`);
    }

    return `<svg class="pack-svg" viewBox="0 0 72 88" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.nombre || "Envase")}">${body}${badges.join("")}</svg>`;
  }

  function packHtml(p, size) {
    size = size || "md";
    const map = { xs: [40, 48], sm: [52, 64], md: [72, 88], lg: [110, 134] };
    const [w, h] = map[size] || map.md;
    return `<span class="pack pack-${size}" title="${esc(p.nombre || "")}">${packSvg(p, { w, h })}</span>`;
  }

  global.FarmaciaPackshot = { packSvg, packHtml, formFromPresentacion };
})(typeof window !== "undefined" ? window : globalThis);
