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
    const kind = (place.settlementKind || "").toLowerCase();
    if (kind === "village" || kind === "hamlet" || kind === "isolated_dwelling" || kind === "farm") return "rural";
    const blob = [place.osmKey, place.osmValue, place.type, place.name, place.display, place.city, kind]
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

  function managerSkill(r) {
    const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
    if (!mgrs.length) return 0;
    return Math.max(...mgrs.map((s) => s.skill || 0));
  }

  function spendOps(state, cost, urgent) {
    if (cost <= 0) return true;
    const reserve = urgent ? 0 : 35000;
    if (state.cash < cost + reserve) return false;
    state.cash -= cost;
    return true;
  }

  function runManager(state, r, brand, gameMs) {
    if (r.managerAI === false) return;
    ensureBooks(state);
    const skill = managerSkill(r);
    const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
    const mgrName = mgrs[0] ? mgrs[0].name : "sin gerente";
    const acts = [];
    if (skill < 1) {
      r.managerNote = "No hay gerente. El local no se gestiona solo: contrata gerencia.";
      r.lastManagerRun = gameMs;
      return;
    }

    const year = SIM.yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const fair = 8 * BRAND.tiers[brand.tier].ticket * Math.sqrt(Math.max(0.2, pl));
    const taste = tasteFit(brand, r.country);
    const pol = alcoholPolicy(r.country);
    const book = (state.books && state.books[brand.id]) || defaultBook(brand);
    const sz = SIM.sizeOf(r.size);
    const miss = SIM.understaffed(brand, r.size, r.staff);
    const st = SIM.staffStats(r.staff);
    const need = sz.staff;
    const noiseAmp = U.clamp(1 - skill / 100, 0.04, 0.55);

    /* Personal: un gerente hábil cubre huecos; uno flojo se retrasa o contrata mal. */
    if (miss.length && skill >= 28) {
      const mapMiss = { gerencia: "gerente", cocina: "cocinero", barra: "bartender" };
      for (const m of miss) {
        const role = mapMiss[m];
        if (!role) continue;
        if (role !== "gerente" && skill < 42 && Math.random() > skill / 85) continue;
        SIM.hireRole(r, role, gameMs, skill);
        acts.push("contrató " + SIM.ROLES[role].name.toLowerCase());
        break;
      }
    }
    if (skill >= 52 && r.cleanliness < 48 && (st.by.limpieza.length || 0) < Math.max(1, need.limpieza || 1)) {
      SIM.hireRole(r, "limpieza", gameMs, skill);
      acts.push("contrató limpieza");
    }
    if (skill >= 58 && brand.tier !== "food_truck" && (st.by.camarero.length || 0) < Math.ceil((need.camarero || 0) * 0.6)) {
      SIM.hireRole(r, "camarero", gameMs, skill);
      acts.push("contrató sala");
    }
    if (skill >= 72) {
      for (const [role, arr] of Object.entries(st.by)) {
        const cap = Math.ceil((need[role] || 0) * 1.35) + (role === "gerente" ? 0 : 1);
        if (arr.length > cap && role !== "gerente") {
          const extra = arr.slice().sort((a, b) => a.skill - b.skill)[0];
          r.staff = r.staff.filter((s) => s.id !== extra.id);
          acts.push("ajustó plantilla");
          break;
        }
      }
    }
    if (skill >= 68 && state.cash > 80000) {
      const pupil = r.staff.filter((s) => s.skill < 88).sort((a, b) => a.skill - b.skill)[0];
      if (pupil && Math.random() < skill / 140) {
        const cost = 400 * pl;
        if (spendOps(state, cost, false)) {
          pupil.skill = Math.min(99, pupil.skill + 6);
          pupil.wage = +(pupil.wage * 1.04).toFixed(2);
          acts.push("formó a " + pupil.name.split(" ")[0]);
        }
      }
    }

    /* Género y stock */
    r.autoRestock = skill >= 32;
    const stockFloor = skill >= 70 ? 48 : skill >= 45 ? 28 : 12;
    if (r.stock < stockFloor) {
      const needSt = 100 - r.stock;
      const restock = needSt * 2.2 * pl * (sz.seats / 20) * (1 + (r.ingQ || 1) * 0.25);
      if (spendOps(state, restock, r.stock < 10)) {
        r.stock = 100;
        r.finance.costTotal += restock;
        acts.push("repuso género");
      }
    }
    let wantQ = 1;
    if (brand.tier === "luxury" && skill >= 62) wantQ = 2;
    else if (skill < 38) wantQ = 0;
    else if (skill >= 78 && brand.tier !== "fast_food" && brand.tier !== "food_truck") wantQ = 2;
    r.ingQ = U.clamp(wantQ, book.minIngQ, book.maxIngQ);

    /* Licencia, delivery, terraza */
    const alcWanted = book.allowAlc && pol.mode !== "dry" && (brand.tier === "bar" || brand.dishes.some((d) => d.alc));
    if (alcWanted && pol.mode === "license" && !r.alcoholLicense && skill >= 55) {
      const lic = pol.license * WORLD.inflationFactor(r.country, year);
      if (spendOps(state, lic, brand.tier === "bar")) {
        r.alcoholLicense = true;
        r.finance.costTotal += lic;
        acts.push("sacó licencia de alcohol");
      }
    }
    const alcOk = pol.mode !== "dry" && (pol.mode === "free" || r.alcoholLicense);
    if (!r.delivery && r.size !== "ghost" && skill >= 58 && (sz.ghost || (r.popK || 0) > 140 && brand.tier !== "luxury")) {
      const c = r.rentMonthly * 0.15;
      if (spendOps(state, c, false)) {
        r.delivery = true;
        r.finance.costTotal += c;
        acts.push("activó delivery");
      }
    }
    if (r.size === "ghost") r.delivery = true;
    if (!r.terrace && !r.hallParentId && r.size !== "ghost" && skill >= 60 && (r.poi === "playa" || r.poi === "turistico" || r.pedestrian)) {
      const c = r.rentMonthly * 0.12;
      if (spendOps(state, c, false)) {
        r.terrace = true;
        r.finance.costTotal += c;
        acts.push("montó terraza");
      }
    }
    if (r.cleanliness < 42 && skill >= 48) {
      const c = 220 * pl * (sz.m2 / 80);
      if (spendOps(state, c, r.cleanliness < 22)) {
        r.cleanliness = Math.min(100, r.cleanliness + 28);
        acts.push("mandó limpiar");
      }
    }

    /* Carta y precios: el error baja con la habilidad */
    const avgBase = brand.dishes.reduce((a, d) => a + d.price, 0) / brand.dishes.length;
    let nOn = 0;
    brand.dishes.forEach((d, i) => {
      if (!r.menu[i]) r.menu[i] = { on: true, price: d.price };
      let on = true;
      if (d.alc && !alcOk) on = false;
      if (!d.sig && d.price > avgBase * 1.6 && pl < 0.55) on = skill < 50 ? Math.random() < 0.4 : false;
      if (d.sig) on = !(d.alc && !alcOk);
      if (skill < 35 && !d.sig && Math.random() < 0.18) on = !on;
      const tasteMul = taste > 1 ? 1.08 : 0.92;
      const noise = (Math.random() * 2 - 1) * noiseAmp * 0.35;
      const target = fair * (d.price / avgBase) * tasteMul * (1 + noise);
      r.menu[i].price = Math.round(target * 10) / 10;
      r.menu[i].on = on;
      if (on) nOn++;
    });
    if (nOn === 0 && r.menu[0]) r.menu[0].on = true;
    applyBook(state, r, brand);

    /* Horario: el gerente lo lleva siempre; un crack adapta al sitio */
    const hrs = r.hours || defaultHours(brand);
    const poi = r.poi || "urbano";
    if (skill < 40) {
      hrs.forEach((h, i) => {
        h.open = i !== 1;
        h.a = 13;
        h.b = 16;
        h.c = skill >= 28 ? 20 : 0;
        h.d = skill >= 28 ? 23 : 0;
      });
    } else if (poi === "aeropuerto" && skill >= 55) {
      hrs.forEach((h) => {
        h.open = true;
        h.a = skill >= 75 ? 0 : 6;
        h.b = skill >= 75 ? 24 : 23;
        h.c = 0;
        h.d = 0;
      });
    } else if (poi === "playa" && skill >= 50) {
      hrs.forEach((h, i) => {
        h.open = i !== 1 || brand.tier !== "luxury";
        h.a = 11;
        h.b = 24;
      });
    } else if (skill >= 80 && brand.tier === "fast_food") {
      hrs.forEach((h) => {
        h.open = true;
        h.a = 10;
        h.b = 24;
      });
    } else if (skill < 48 && Math.random() < 0.18) {
      hrs.forEach((h, i) => {
        if (i === 2) h.open = false;
      });
    }
    r.hours = hrs;
    r.hoursCustom = false;

    const grade = skill >= 80 ? "excelente" : skill >= 62 ? "sólida" : skill >= 45 ? "correcta" : "justita";
    r.managerNote =
      `${mgrName} (hab. ${Math.round(skill)}, gestión ${grade}) lleva carta, precios, horario, género y plantilla. ` +
      (acts.length ? "Ahora: " + acts.join(", ") + ". " : "") +
      (book.enforceSig ? "Libro de marca: firma obligatoria. " : "") +
      (taste > 1.2 ? "La cocina encaja aquí." : taste < 0.85 ? "Gusto local flojo: carta contenida." : "Precios al poder adquisitivo local.");
    r.lastManagerRun = gameMs;
  }

  function alerts(state) {
    const list = [];
    if (!state) return list;
    if (state.cash < 0) list.push({ k: "cash", bad: true, t: "Caja negativa. Intereses de descubierto." });
    if (state.cash < 80000 && state.cash >= 0) list.push({ k: "low", bad: true, t: "Caja baja: menos de 80.000 €." });
    const debt = SIM.debtTotal ? SIM.debtTotal(state) : 0;
    if (debt > 0) list.push({ k: "debt", bad: false, t: "Deuda bancaria: " + Math.round(debt).toLocaleString("es-ES") + " €." });
    let noStock = 0,
      loss = 0,
      noMgr = 0,
      insp = 0;
    const now = state.gameTime;
    for (const r of state.restaurants) {
      if (r.status === "abierto" && r.stock < 8) noStock++;
      if (r.finance.revTotal < r.finance.costTotal && r.status === "abierto") loss++;
      if (r.status === "abierto" && r.managerAI !== false && !(r.staff || []).some((s) => s.role === "gerente")) noMgr++;
    }
    for (const ev of state.events || []) {
      if (ev.kind === "inspeccion" && now >= ev.start - 2 * 86400000 && now <= ev.end) {
        insp++;
        list.push({ k: "insp", bad: true, t: ev.news || "Inspección sanitaria próxima." });
      }
    }
    if (noStock) list.push({ k: "stock", bad: true, t: noStock + " local(es) sin género." });
    if (noMgr) list.push({ k: "mgr", bad: true, t: noMgr + " local(es) sin gerente: no se gestionan solos." });
    if (loss) list.push({ k: "loss", bad: false, t: loss + " local(es) en pérdidas acumuladas." });
    if (state.yearbookNew) {
      list.unshift({ k: "year", bad: false, t: "Anuario " + state.yearbookNew + " listo. Ábrelo en Prensa." });
    }
    return list.slice(0, 8);
  }

  let audioCtx = null;
  let muted = true;
  try {
    muted = localStorage.getItem("horizon-sfx") !== "on" && localStorage.getItem("saborama-sfx") !== "on";
  } catch (_) {}

  function setMuted(v) {
    muted = v;
    try {
      localStorage.setItem("horizon-sfx", v ? "off" : "on");
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
    const city = WORLD.nearestCity(lat, lon, 18);
    const far = WORLD.nearestCity(lat, lon, 120);
    const cc = (city || far) ? (city || far).cc : null;
    const ctry = cc ? WORLD.country(cc) : WORLD.DEFAULT;
    const popK = city ? city.popK : 2.2;
    const dummy = { countryCode: ctry.iso || "XX", popK, residential: false, commercial: true };
    const q = SIM.buildQuote(BRAND.list[0], "local", dummy, gameMs || Date.UTC(2000, 0, 1));
    return {
      city: city ? city.name : "Pueblo / zona rural",
      country: ctry.name,
      cc: ctry.iso,
      popK,
      rentMonthly: q.rentMonthly,
      likelyLand: !!far || Math.abs(lat) > 5,
      distKm: far ? far.distKm : 999,
      hint: city ? "" : far ? `Cerca de ${far.name} (${Math.round(far.distKm)} km)` : "Clic para identificar el núcleo",
    };
  }

  function suggestSize(brand, place) {
    const pop = (place.popK || 0) * 1000;
    const poi = place.poi;
    const metro = !!place.metro;
    const tier = brand.tier;
    const beach = poi === "playa";
    const mallOk = poi === "comercial";
    const stadiumOk = poi === "estadio";
    const edge = poi === "poligono" || poi === "rural";
    if (beach) return "kiosco_playa";
    if (metro && (tier === "fast_food" || tier === "food_truck") && pop < 60000) return "kiosco_estacion";
    if (stadiumOk && pop >= 60000) return "estadio";
    if (mallOk && pop >= 15000) return "local_mall";
    if (edge && pop >= 8000 && (tier === "fast_food" || tier === "food_truck")) return "drive_thru";
    if (tier === "luxury") return pop >= 150000 ? "rooftop" : pop >= 30000 ? "flagship" : "local_grande";
    if (tier === "bar") return pop >= 80000 ? "rooftop" : pop >= 20000 ? "flagship" : "local_grande";
    if (poi === "historico" || poi === "turistico") return pop >= 12000 ? "local_grande" : "bistro";
    if (pop >= 60000) return "local_grande";
    if (pop >= 20000) return "flagship";
    if (pop >= 3000) return "bistro";
    if (pop >= 900) return "local";
    return "kiosco";
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
    managerSkill,
    alerts,
    sfx,
    muted: () => muted,
    setMuted,
    addPnl,
    monthKey,
    estimateHover,
    streetFlags,
    suggestSize,
    defaultBook,
    ensureBooks,
    applyBook,
    decadeMeta,
    compileYearbook,
    maybeYearbook,
  };
})(window);
