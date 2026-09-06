/* Saborama — gerente IA, horarios, turismo, gusto, alcohol, clima, alertas, sonido */
(function (global) {
  const HOLDING = "Horizon Restaurant Group";

  const DRY = new Set(["SA", "KW", "IR", "LY", "SD", "YE", "AF", "SO", "BN", "PK", "MR", "MV", "QA"]);
  const LICENSE = new Set(["US", "NO", "SE", "FI", "CA", "IS", "GB", "IE", "AU", "NZ"]);
  const STRICT_H = new Set(["NO", "SE", "FI", "IS", "RU"]);

  const TASTE = {
    ES: ["española", "tapas", "mediterránea", "brunch"],
    PT: ["portuguesa", "mediterránea", "pescado"],
    FR: ["francesa", "alta cocina", "mediterránea", "brunch"],
    IT: ["italiana", "pizza", "alta cocina", "pasta", "postres"],
    GR: ["griega", "mediterránea"],
    TR: ["turca", "kebab"],
    DE: ["alemana", "hot dog", "cerveza"],
    GB: ["británica", "pescado", "pub", "brunch", "café"],
    IE: ["británica", "pub"],
    PL: ["polaca", "del este"],
    RU: ["del este"],
    US: ["americana", "hamburguesas", "barbacoa", "diner"],
    MX: ["mexicana", "tex-mex", "tequila"],
    AR: ["argentina", "empanadas", "parrilla"],
    BR: ["brasileña", "parrilla"],
    PE: ["peruana"],
    CL: ["parrilla", "mediterránea"],
    CO: ["empanadas"],
    JP: ["japonesa", "sushi", "ramen", "izakaya", "kaiseki"],
    KR: ["coreana"],
    CN: ["china", "bao", "dim sum", "cantonesa", "wok"],
    TW: ["china", "dim sum"],
    HK: ["china", "dim sum", "cantonesa"],
    TH: ["tailandesa"],
    VN: ["vietnamita"],
    IN: ["india"],
    PK: ["india"],
    ID: ["china"],
    MY: ["china", "india"],
    PH: ["china"],
    SG: ["china", "india", "malasia"],
    MA: ["marroquí", "magrebí"],
    TN: ["magrebí", "mediterránea"],
    DZ: ["magrebí"],
    EG: ["levantina"],
    LB: ["libanesa", "levantina", "mediterránea"],
    JO: ["levantina"],
    IL: ["levantina"],
    AE: ["levantina", "india"],
    SA: ["levantina"],
    JM: ["caribeña"],
    CU: ["caribeña", "cubana"],
    DO: ["caribeña"],
    TT: ["caribeña"],
    AU: ["americana", "poké", "hawaiana"],
    NZ: ["pescado"],
    ZA: ["barbacoa"],
    NG: ["caribeña"],
    KE: ["caribeña"],
    CH: ["suiza", "alpina", "francesa"],
    AT: ["alpina"],
    SE: ["nórdica"],
    NO: ["nórdica", "pescado"],
    DK: ["nórdica"],
    FI: ["nórdica"],
    NL: ["pub", "cerveza"],
    BE: ["francesa", "cerveza"],
    HU: ["del este"],
    CZ: ["del este", "cerveza"],
    RO: ["del este"],
  };

  const MONSOON = new Set(["IN", "BD", "MM", "TH", "KH", "LA", "VN", "PH", "ID", "LK", "NP"]);
  const MED = new Set(["ES", "PT", "IT", "GR", "HR", "FR", "MT", "CY", "TR", "TN", "MA"]);

  /* Inicio aproximado de Ramadán (mes JS 0-11, día) 2000–2032 */
  const RAMADAN = {
    2000: [10, 27], 2001: [10, 16], 2002: [10, 5], 2003: [9, 26], 2004: [9, 15],
    2005: [9, 4], 2006: [8, 23], 2007: [8, 12], 2008: [8, 1], 2009: [7, 21],
    2010: [7, 10], 2011: [6, 31], 2012: [6, 20], 2013: [6, 9], 2014: [5, 28],
    2015: [5, 17], 2016: [5, 5], 2017: [4, 26], 2018: [4, 15], 2019: [4, 5],
    2020: [3, 23], 2021: [3, 12], 2022: [3, 2], 2023: [2, 22], 2024: [2, 10],
    2025: [1, 28], 2026: [1, 17], 2027: [1, 7], 2028: [0, 26], 2029: [0, 14],
    2030: [0, 4], 2031: [11, 24], 2032: [11, 13],
  };

  function easterUTC(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(y, month - 1, day);
  }

  function alcoholPolicy(cc) {
    if (DRY.has(cc)) return { mode: "dry", license: 0, from: 0, to: 0 };
    if (LICENSE.has(cc)) return { mode: "license", license: STRICT_H.has(cc) ? 18000 : 8500, from: 12, to: 26 };
    return { mode: "free", license: 1200, from: 10, to: 28 };
  }

  function canServeAlcohol(r, brand, gameMs) {
    const pol = alcoholPolicy(r.country);
    if (pol.mode === "dry") return false;
    if (pol.mode === "license" && !r.alcoholLicense) return false;
    if (brand.tier !== "bar" && !r.alcoholLicense && pol.mode === "license") return false;
    const loc = SIM.localHour(gameMs, r.tz);
    let h = loc.h;
    if (h < 6) h += 24;
    return h >= pol.from && h < pol.to;
  }

  function tasteFit(brand, cc) {
    const liked = TASTE[cc] || [];
    if (!liked.length) return 1;
    const hit = brand.cuisines.some((c) => liked.includes(c));
    const bar = brand.tier === "bar";
    if (hit) return 1.38;
    if (bar) return 1.02;
    return 0.72;
  }

  function classifyPoi(place) {
    const blob = [place.osmKey, place.osmValue, place.type, place.name, place.display, place.city]
      .join(" ")
      .toLowerCase();
    if (/beach|playa|coast|bay|playa/.test(blob)) return "playa";
    if (/aerodrome|airport|aeroway|aeropuerto/.test(blob)) return "aeropuerto";
    if (/stadium|estadio|sports_centre|arena/.test(blob)) return "estadio";
    if (/historic|castle|cathedral|monument|old.?town|casco|heritage|ruins/.test(blob)) return "historico";
    if (/industrial|warehouse|factory|pol[ií]gono/.test(blob)) return "poligono";
    if (/tourism|attraction|theme_park|museum|zoo/.test(blob)) return "turistico";
    if (/retail|commercial|mall|pedestrian|shopping/.test(blob)) return "comercial";
    if (/village|hamlet|farm/.test(blob)) return "rural";
    return "urbano";
  }

  const POI_L = {
    playa: "Playa / costa",
    aeropuerto: "Aeropuerto",
    estadio: "Estadio / recinto",
    historico: "Casco histórico",
    poligono: "Polígono industrial",
    turistico: "Atracción turística",
    comercial: "Zona comercial",
    rural: "Pueblo / rural",
    urbano: "Urbano",
  };

  function poiDemand(poi, brand) {
    const t = brand.tier;
    if (poi === "playa") return t === "food_truck" || t === "fast_food" || t === "bar" ? 1.48 : 1.12;
    if (poi === "aeropuerto") return t === "fast_food" || t === "food_truck" ? 1.72 : t === "luxury" ? 0.7 : 1.15;
    if (poi === "estadio") return t === "bar" || t === "fast_food" ? 1.42 : 1.08;
    if (poi === "historico") return t === "luxury" || t === "casual" ? 1.38 : 1.1;
    if (poi === "poligono") return 0.52;
    if (poi === "turistico") return 1.32;
    if (poi === "comercial") return 1.22;
    if (poi === "rural") return 0.62;
    return 1;
  }

  function calendarMod(cc, brand, poi, gameMs) {
    const d = new Date(gameMs);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const t = brand.tier;
    let demand = 1;
    let terrace = 1;
    if (m === 11 && day >= 24 && day <= 26) demand *= t === "bar" ? 1.15 : 1.45;
    if (m === 11 && day === 31) demand *= t === "bar" ? 2.1 : 1.2;
    if (m === 0 && day === 1) demand *= t === "bar" ? 0.35 : 0.55;
    if (m === 0 && day === 6 && MED.has(cc)) demand *= 1.2;
    const e0 = easterUTC(y);
    if (gameMs >= e0 - 5 * 86400000 && gameMs <= e0 + 86400000 && (MED.has(cc) || cc === "ES" || cc === "IT" || cc === "MX" || cc === "CO" || cc === "AR")) {
      demand *= t === "bar" ? 0.75 : 1.35;
    }
    const ram = RAMADAN[y];
    if (ram) {
      const start = Date.UTC(y, ram[0], ram[1]);
      if (gameMs >= start && gameMs < start + 30 * 86400000) {
        const mus = new Set(["SA", "AE", "EG", "MA", "TR", "ID", "PK", "BD", "MY", "IR", "IQ", "DZ", "TN", "JO", "QA", "KW"]);
        if (mus.has(cc)) {
          demand *= t === "bar" ? 0.25 : 0.82;
          if (d.getUTCHours() >= 18) demand *= 1.35;
        }
      }
    }
    if (MONSOON.has(cc) && m >= 5 && m <= 8) {
      demand *= 0.86;
      terrace *= 0.28;
    }
    if (MED.has(cc) && m >= 5 && m <= 7) {
      terrace *= poi === "playa" ? 1.7 : 1.35;
      if (poi === "playa") demand *= 1.22;
    }
    if ((cc === "US" || cc === "CA") && m === 10 && day >= 22 && day <= 28) demand *= 1.25;
    return { demand, terrace };
  }

  function defaultHours(brand) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      if (brand.tier === "luxury" && d === 1) days.push({ open: false, a: 13, b: 16, c: 19, d: 23 });
      else if (brand.tier === "luxury") days.push({ open: true, a: 13, b: 16, c: 19, d: 23 });
      else if (brand.tier === "bar") days.push({ open: true, a: 17, b: 27, c: 0, d: 0 });
      else if (brand.tier === "food_truck") days.push({ open: d !== 1, a: 11, b: 23, c: 0, d: 0 });
      else if (brand.tier === "fast_food") days.push({ open: true, a: 10, b: 24, c: 0, d: 0 });
      else days.push({ open: true, a: 12, b: 23, c: 0, d: 0 });
    }
    return days;
  }

  function applyHoursPreset(brand, kind) {
    const h = defaultHours(brand);
    if (kind === "24h") {
      h.forEach((d) => {
        d.open = true;
        d.a = 0;
        d.b = 24;
        d.c = 0;
        d.d = 0;
      });
    } else if (kind === "lunoff") {
      h.forEach((d, i) => {
        d.open = i !== 1;
      });
    } else if (kind === "finde") {
      h.forEach((d, i) => {
        if (i === 0 || i === 5 || i === 6) {
          d.open = true;
          d.a = Math.min(d.a, 11);
          d.b = Math.max(d.b, 26);
        }
      });
    } else if (kind === "split") {
      h.forEach((d, i) => {
        d.open = i !== 1;
        d.a = 13;
        d.b = 16;
        d.c = 20;
        d.d = 24;
      });
    }
    return h;
  }

  function isOpenAt(r, brand, localH, dow) {
    const days = r.hours || defaultHours(brand);
    const day = days[dow];
    if (!day || !day.open) return false;
    const inRange = (h, a, b) => {
      if (a == null || b == null || (!a && !b && a !== 0)) return false;
      if (b > 24) return h >= a || h < b - 24;
      if (b === 24) return h >= a;
      if (b <= a) return h >= a || h < b;
      return h >= a && h < b;
    };
    if (day.c && day.d) return inRange(localH, day.a, day.b) || inRange(localH, day.c, day.d);
    return inRange(localH, day.a, day.b);
  }

  function runManager(state, r, brand, gameMs) {
    if (r.managerAI === false) return;
    ensureBooks(state);
    const year = SIM.yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const fair = 8 * BRAND.tiers[brand.tier].ticket * Math.sqrt(Math.max(0.2, pl));
    const taste = tasteFit(brand, r.country);
    const pol = alcoholPolicy(r.country);
    const alcOk = pol.mode !== "dry" && (pol.mode === "free" || r.alcoholLicense);
    const avgBase = brand.dishes.reduce((a, d) => a + d.price, 0) / brand.dishes.length;
    let nOn = 0;
    brand.dishes.forEach((d, i) => {
      if (!r.menu[i]) r.menu[i] = { on: true, price: d.price };
      let on = true;
      if (d.alc && !alcOk) on = false;
      if (!d.sig && d.price > avgBase * 1.6 && pl < 0.55) on = false;
      if (d.sig) on = !(d.alc && !alcOk);
      const target = fair * (d.price / avgBase) * (taste > 1 ? 1.08 : 0.92);
      r.menu[i].price = Math.round(target * 10) / 10;
      r.menu[i].on = on;
      if (on) nOn++;
    });
    if (nOn === 0 && r.menu[0]) r.menu[0].on = true;
    const book = applyBook(state, r, brand);
    if (!r.hoursCustom) {
      const hrs = r.hours || defaultHours(brand);
      const poi = r.poi || "urbano";
      if (poi === "aeropuerto") {
        hrs.forEach((h) => {
          h.open = true;
          h.a = 6;
          h.b = 23;
          h.c = 0;
          h.d = 0;
        });
      } else if (poi === "playa") {
        hrs.forEach((h, i) => {
          h.open = i !== 1 || brand.tier !== "luxury";
          h.a = 11;
          h.b = 23;
        });
      }
      r.hours = hrs;
    }
    if (!r.delivery && (r.popK || 0) > 180 && brand.tier !== "luxury") {
      /* el gerente propone, no compra solo */
    }
    r.managerNote =
      (book.enforceSig ? "Libro de marca: plato firma obligatorio. " : "") +
      (taste > 1.2
        ? "El gerente ajusta precios al gusto local: aquí esta cocina encaja."
        : taste < 0.85
          ? "Gusto local flojo para esta cocina: carta más corta y precios contenidos."
          : "Carta y precios alineados al poder adquisitivo y a la competencia oculta.");
    r.lastManagerRun = gameMs;
  }

  function alerts(state) {
    const list = [];
    if (!state) return list;
    if (state.cash < 0) list.push({ k: "cash", bad: true, t: "Caja negativa. Intereses de descubierto." });
    if (state.cash < 80000 && state.cash >= 0) list.push({ k: "low", bad: true, t: "Caja baja: menos de 80.000 €." });
    let noStock = 0,
      loss = 0,
      insp = 0;
    const now = state.gameTime;
    for (const r of state.restaurants) {
      if (r.status === "abierto" && r.stock < 8) noStock++;
      if (r.finance.revTotal < r.finance.costTotal && r.status === "abierto") loss++;
    }
    for (const ev of state.events || []) {
      if (ev.kind === "inspeccion" && now >= ev.start - 2 * 86400000 && now <= ev.end) {
        insp++;
        list.push({ k: "insp", bad: true, t: ev.news || "Inspección sanitaria próxima." });
      }
    }
    if (noStock) list.push({ k: "stock", bad: true, t: noStock + " local(es) sin género." });
    if (loss) list.push({ k: "loss", bad: false, t: loss + " local(es) en pérdidas acumuladas." });
    if (state.yearbookNew) {
      list.unshift({ k: "year", bad: false, t: "Anuario " + state.yearbookNew + " listo. Ábrelo en Prensa." });
    }
    return list.slice(0, 8);
  }

  let audioCtx = null;
  let muted = true;
  try {
    muted = localStorage.getItem("saborama-sfx") !== "on";
  } catch (_) {}

  function setMuted(v) {
    muted = v;
    try {
      localStorage.setItem("saborama-sfx", v ? "off" : "on");
    } catch (_) {}
  }

  function beep(freq, dur, type, vol) {
    if (muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = vol || 0.04;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.12));
      o.stop(audioCtx.currentTime + (dur || 0.12) + 0.02);
    } catch (_) {}
  }

  const sfx = {
    cash: () => {
      beep(880, 0.07, "square", 0.03);
      setTimeout(() => beep(1320, 0.08, "square", 0.025), 70);
    },
    open: () => beep(523, 0.18, "triangle", 0.05),
    enter: () => {
      beep(196, 0.4, "sine", 0.02);
    },
    bad: () => beep(140, 0.2, "sawtooth", 0.03),
  };

  function monthKey(ms) {
    return new Date(ms).toISOString().slice(0, 7);
  }

  function addPnl(r, state, rev, cost, ms) {
    const k = monthKey(ms);
    r.finance.months = r.finance.months || {};
    if (!r.finance.months[k]) r.finance.months[k] = { rev: 0, cost: 0 };
    r.finance.months[k].rev += rev;
    r.finance.months[k].cost += cost;
    state.pnl = state.pnl || {};
    if (!state.pnl[k]) state.pnl[k] = { rev: 0, cost: 0 };
    state.pnl[k].rev += rev;
    state.pnl[k].cost += cost;
  }

  function estimateHover(lat, lon, gameMs) {
    const city = WORLD.nearestCity(lat, lon, 120);
    const cc = city ? city.cc : null;
    const ctry = cc ? WORLD.country(cc) : WORLD.DEFAULT;
    const popK = city ? city.popK : 8;
    const dummy = { countryCode: ctry.iso || "XX", popK, residential: false, commercial: true };
    const q = SIM.buildQuote(BRAND.list[0], "local", dummy, gameMs || Date.UTC(2000, 0, 1));
    const ocean = !city && Math.abs(lat) < 60;
    return {
      city: city ? city.name : "Zona poco poblada",
      country: ctry.name,
      cc: ctry.iso,
      popK,
      rentMonthly: q.rentMonthly,
      likelyLand: !!city || Math.abs(lat) > 5,
      distKm: city ? city.distKm : 999,
    };
  }

  function streetFlags(place) {
    const blob = [place.osmKey, place.osmValue, place.type, place.name, place.display, place.street]
      .join(" ")
      .toLowerCase();
    return {
      metro: /subway|station|railway|metro|tram|light.rail|public_transport|train/.test(blob),
      pedestrian: /pedestrian|footway|living_street|plaza|square|old.?town|casco|promenade/.test(blob),
    };
  }

  function defaultBook(brand) {
    const hasAlc = brand.tier === "bar" || brand.dishes.some((d) => d.alc);
    return {
      enforceSig: true,
      minMul: brand.tier === "luxury" ? 0.95 : 0.78,
      maxMul: brand.tier === "fast_food" ? 1.25 : 1.45,
      allowAlc: hasAlc,
      minIngQ: brand.tier === "luxury" ? 1 : 0,
      maxIngQ: 2,
    };
  }

  function ensureBooks(state) {
    state.books = state.books || {};
    for (const b of BRAND.list) {
      if (!state.books[b.id]) state.books[b.id] = defaultBook(b);
    }
    return state.books;
  }

  function applyBook(state, r, brand) {
    const book = (state.books && state.books[brand.id]) || defaultBook(brand);
    const pol = alcoholPolicy(r.country);
    const alcOk = book.allowAlc && pol.mode !== "dry" && (pol.mode === "free" || r.alcoholLicense);
    if (r.ingQ == null) r.ingQ = 1;
    r.ingQ = U.clamp(r.ingQ, book.minIngQ, book.maxIngQ);
    brand.dishes.forEach((d, i) => {
      if (!r.menu[i]) r.menu[i] = { on: true, price: d.price };
      const lo = +(d.price * book.minMul).toFixed(1);
      const hi = +(d.price * book.maxMul).toFixed(1);
      r.menu[i].price = U.clamp(r.menu[i].price, lo, hi);
      if (d.alc && !alcOk) r.menu[i].on = false;
      if (book.enforceSig && d.sig && !(d.alc && !alcOk)) r.menu[i].on = true;
    });
    return book;
  }

  function decadeMeta(year) {
    const d = Math.floor(year / 10) * 10;
    if (d >= 2020)
      return {
        y: 2020,
        title: "Horizon Live",
        kicker: "Era delivery y reels",
        tone: "Titulares cortos, emojis de relleno y apps de comida.",
        ink: "#0b5348",
        paper: "#f4fff8",
        accent: "#e85d4c",
      };
    if (d >= 2010)
      return {
        y: 2010,
        title: "Horizon 24h",
        kicker: "Food trucks y estrellas",
        tone: "Crónicas de expansión, street food y críticas con foto.",
        ink: "#1d3557",
        paper: "#eef4ff",
        accent: "#c9a227",
      };
    return {
      y: 2000,
      title: "Diario Horizon",
      kicker: "El nuevo milenio",
      tone: "Editorial de papel, euro a la vista y carta de siempre.",
      ink: "#3d2b1f",
      paper: "#fff6e4",
      accent: "#9b2226",
    };
  }

  function compileYearbook(state, year) {
    const prefix = String(year);
    const byBrand = {};
    let best = null;
    let worst = null;
    let yRev = 0;
    let yCost = 0;
    for (const r of state.restaurants) {
      const months = Object.entries(r.finance.months || {}).filter(([k]) => k.startsWith(prefix));
      const rev = months.reduce((a, [, v]) => a + (v.rev || 0), 0);
      const cost = months.reduce((a, [, v]) => a + (v.cost || 0), 0);
      const ebitda = rev - cost;
      yRev += rev;
      yCost += cost;
      byBrand[r.brandId] = (byBrand[r.brandId] || 0) + rev;
      if (!best || ebitda > best.ebitda) best = { id: r.id, name: r.name, brandId: r.brandId, ebitda, city: r.city };
      if (!worst || ebitda < worst.ebitda) worst = { id: r.id, name: r.name, brandId: r.brandId, ebitda, city: r.city };
    }
    const star = Object.entries(byBrand).sort((a, b) => b[1] - a[1])[0];
    const headlines = (state.news || [])
      .filter((n) => new Date(n.t).getUTCFullYear() === year)
      .slice(0, 8)
      .map((n) => n.text);
    const countries = new Set(state.restaurants.map((r) => r.country)).size;
    return {
      year,
      decade: decadeMeta(year),
      yRev,
      yCost,
      cash: state.cash,
      n: state.restaurants.length,
      open: state.restaurants.filter((r) => r.status === "abierto").length,
      countries,
      starBrandId: star ? star[0] : null,
      starRev: star ? star[1] : 0,
      best,
      worst,
      headlines,
    };
  }

  function maybeYearbook(state, fromMs, toMs) {
    const y0 = new Date(fromMs).getUTCFullYear();
    const y1 = new Date(toMs).getUTCFullYear();
    if (y1 <= y0) return null;
    state.yearbooks = state.yearbooks || [];
    let last = null;
    for (let y = y0; y < y1; y++) {
      if (state.yearbooks.some((x) => x.year === y)) continue;
      const book = compileYearbook(state, y);
      state.yearbooks.push(book);
      state.yearbookNew = y;
      state.news = state.news || [];
      state.news.unshift({
        t: Date.UTC(y + 1, 0, 1, 0, 5, 0),
        kind: "yearbook",
        decade: Math.floor(y / 10) * 10,
        text: "Anuario " + y + " de Horizon. La filial estrella y el local que más sangra, en Prensa.",
      });
      last = book;
    }
    return last;
  }

  global.SABOR = {
    HOLDING,
    DRY,
    alcoholPolicy,
    canServeAlcohol,
    tasteFit,
    classifyPoi,
    POI_L,
    poiDemand,
    calendarMod,
    defaultHours,
    applyHoursPreset,
    isOpenAt,
    runManager,
    alerts,
    sfx,
    muted: () => muted,
    setMuted,
    addPnl,
    monthKey,
    estimateHover,
    streetFlags,
    defaultBook,
    ensureBooks,
    applyBook,
    decadeMeta,
    compileYearbook,
    maybeYearbook,
  };
})(window);
