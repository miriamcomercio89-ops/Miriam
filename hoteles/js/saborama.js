/* Horizon Hotels — gerencia IA (dirección de hotel), temporada, alertas, sonido.
   Es el equivalente del "Saborama" de Horizon Restaurant Group, adaptado a
   hoteles: aquí no hay carta ni alcohol, pero sí tarifas (ADR), amenities y
   una lógica de temporada/ubicación bastante más rica. */
(function (global) {
  const HOLDING = "Horizon Hotels";

  const AMENITIES = {
    restaurante: { name: "Restaurante interno", cost: 1.0 },
    spa: { name: "Spa / circuito wellness", cost: 1.4 },
    piscina: { name: "Piscina", cost: 0.8 },
    gimnasio: { name: "Gimnasio 24h", cost: 0.5 },
    parking: { name: "Parking cubierto", cost: 0.6 },
    salones: { name: "Salones de eventos", cost: 0.9 },
    playa_privada: { name: "Playa privada", cost: 1.2 },
    business_center: { name: "Business center", cost: 0.4 },
  };

  /* Reutilizado por GEO.enrich(place): clasifica el punto real (OSM) en una
     de estas categorías, que a su vez alimenta la afinidad de segmento de
     marca y la sugerencia de formato. Idéntico al clasificador del
     simulador de restaurantes: es generalista, no depende del negocio. */
  function classifyPoi(place) {
    const kind = (place.settlementKind || "").toLowerCase();
    if (kind === "village" || kind === "hamlet" || kind === "isolated_dwelling" || kind === "farm") return "rural";
    const blob = [place.osmKey, place.osmValue, place.type, place.name, place.display, place.city, kind].join(" ").toLowerCase();
    if (/beach|playa|coast|bay/.test(blob)) return "playa";
    if (/aerodrome|airport|aeroway|aeropuerto/.test(blob)) return "aeropuerto";
    if (/stadium|estadio|sports_centre|arena/.test(blob)) return "estadio";
    if (/historic|castle|cathedral|monument|old.?town|casco|heritage|ruins|palace|palacio/.test(blob)) return "historico";
    if (/industrial|warehouse|factory|pol[ií]gono/.test(blob)) return "poligono";
    if (/tourism|attraction|theme_park|museum|zoo|ski|esqui|nieve/.test(blob)) return "turistico";
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
    turistico: "Zona / atracción turística",
    comercial: "Zona comercial",
    rural: "Pueblo / rural",
    urbano: "Urbano",
  };

  function streetFlags(place) {
    const blob = [place.osmKey, place.osmValue, place.type, place.name, place.display, place.street].join(" ").toLowerCase();
    return {
      metro: /subway|station|railway|metro|tram|light.rail|public_transport|train/.test(blob),
      pedestrian: /pedestrian|footway|living_street|plaza|square|old.?town|casco|promenade/.test(blob),
    };
  }

  /* Sugerencia de formato (uno de los 30 HTYPES) según marca (segmento +
     categoría de estrellas) y lugar real: población, POI clasificado y
     accesos. El jugador puede cambiarlo siempre en el modal de construcción. */
  function suggestFormat(brand, place) {
    const pop = (place.popK || 0) * 1000;
    const poi = place.poi;
    const seg = brand.segment;
    const star = brand.stars;
    if (poi === "playa" && (seg === "playa" || seg === "todoincluido")) {
      if (seg === "todoincluido") return pop >= 4000 ? "todo_incluido_mega" : "resort_playa_medio";
      if (star >= 5) return pop >= 15000 ? "isla_privada" : "resort_playa_grande";
      return pop >= 40000 ? "resort_playa_grande" : "resort_playa_medio";
    }
    if (poi === "aeropuerto" && seg === "aeropuerto") {
      return star >= 4 ? "aeropuerto_plaza" : "capsula_aeropuerto";
    }
    if (poi === "historico" && seg === "historico") {
      return star >= 5 ? "palacio_patrimonio" : "manor_historico";
    }
    if (seg === "montana") {
      return star >= 5 ? "chalet_esqui" : "refugio_montana";
    }
    if (seg === "rural") {
      return star >= 4 ? "glamping_lujo" : "eco_lodge";
    }
    if (seg === "bienestar") {
      return star >= 5 ? "termas_wellness" : "spa_bienestar";
    }
    if (seg === "boutique") {
      if (poi === "historico") return "manor_historico";
      if (poi === "turistico") return star >= 5 ? "design_loft" : "boutique_pequeno";
      return "boutique_pequeno";
    }
    if (seg === "aparthotel") {
      if (star >= 5) return pop >= 60000 ? "residencias_lujo" : "aparthotel_estudio";
      return "aparthotel_estudio";
    }
    if (seg === "urbano") {
      if (star >= 5) return pop >= 200000 ? "rooftop_skybar_hotel" : "grand_hotel_lujo";
      if (star >= 4) return pop >= 300000 ? "business_torre" : "urbano_mediano";
      if (pop >= 30000) return "urbano_mediano";
      if (pop >= 4000) return "urbano_pequeno";
      return "hostal_pequeno";
    }
    if (seg === "todoincluido") return pop >= 4000 ? "todo_incluido_mega" : "resort_playa_medio";
    /* fallback genérico por población + categoría */
    if (star >= 5) return "grand_hotel_lujo";
    if (star >= 4) return pop >= 30000 ? "urbano_mediano" : "boutique_pequeno";
    if (pop >= 20000) return "urbano_pequeno";
    if (pop >= 2000) return "hostal_grande";
    return "hostal_pequeno";
  }

  function defaultBook(brand) {
    return {
      minMul: brand.tier === "ultralujo" ? 0.92 : 0.75,
      maxMul: brand.tier === "economico" ? 1.2 : 1.5,
    };
  }

  function ensureBooks(state) {
    state.books = state.books || {};
    for (const b of BRAND.list) {
      if (!state.books[b.id]) state.books[b.id] = defaultBook(b);
    }
  }

  function applyBook(state, r, brand, pl) {
    ensureBooks(state);
    const book = state.books[brand.id] || defaultBook(brand);
    const fair = SIM.fairADR(brand, pl);
    const lo = fair * book.minMul;
    const hi = fair * book.maxMul;
    r.adr = U.clamp(r.adr || fair, lo, hi);
  }

  function managerSkill(r) {
    const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
    if (!mgrs.length) return 0;
    return Math.max(...mgrs.map((s) => s.skill || 0));
  }

  function spendOps(state, cost, urgent) {
    if (cost <= 0) return true;
    const reserve = urgent ? 0 : 60000;
    if (state.cash < cost + reserve) return false;
    state.cash -= cost;
    return true;
  }

  function runManager(state, r, brand, gameMs) {
    if (r.managerAI === false) return;
    ensureBooks(state);
    const skill = managerSkill(r);
    const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
    const mgrName = mgrs[0] ? mgrs[0].name : "sin dirección";
    const acts = [];
    if (skill < 1) {
      r.managerNote = "No hay dirección. El hotel no se gestiona solo: contrata a un/a director/a.";
      r.lastManagerRun = gameMs;
      return;
    }

    const year = SIM.yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const fair = SIM.fairADR(brand, pl);
    const st = SIM.staffStats(r.staff);
    const miss = SIM.understaffed(brand, r.htype, r.staff);
    const sz = SIM.sizeOf(r.htype);
    const need = sz.staff;

    if (miss.length && skill >= 25) {
      const mapMiss = { direccion: "gerente", recepcion: "recepcion", limpieza: "limpieza" };
      for (const m of miss) {
        const role = mapMiss[m];
        if (!role) continue;
        if (role !== "gerente" && skill < 40 && Math.random() > skill / 85) continue;
        SIM.hireRole(r, role, gameMs, skill);
        acts.push("contrató " + SIM.ROLES[role].name.toLowerCase());
        break;
      }
    }
    if (skill >= 50 && r.cleanliness < 50 && (st.by.limpieza.length || 0) < Math.max(1, need.limpieza || 1)) {
      SIM.hireRole(r, "limpieza", gameMs, skill);
      acts.push("reforzó pisos/limpieza");
    }
    if (skill >= 60 && (st.by.mantenimiento.length || 0) < Math.max(1, Math.ceil((need.mantenimiento || 1) * 0.6))) {
      SIM.hireRole(r, "mantenimiento", gameMs, skill);
      acts.push("contrató mantenimiento");
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
    if (skill >= 68 && state.cash > 150000) {
      const pupil = r.staff.filter((s) => s.skill < 88).sort((a, b) => a.skill - b.skill)[0];
      if (pupil && Math.random() < skill / 140) {
        const cost = 420 * pl;
        if (spendOps(state, cost, false)) {
          pupil.skill = Math.min(99, pupil.skill + 6);
          pupil.wage = +(pupil.wage * 1.04).toFixed(2);
          acts.push("formó a " + pupil.name.split(" ")[0]);
        }
      }
    }

    if (r.cleanliness < 42 && skill >= 45) {
      const c = 260 * pl * (SIM.sizeOf(r.htype).rooms / 40);
      if (spendOps(state, c, r.cleanliness < 22)) {
        r.cleanliness = Math.min(100, r.cleanliness + 26);
        acts.push("reforzó limpieza a fondo");
      }
    }

    /* Amenities: un director hábil añade servicios (spa, restaurante…) que
       suben la demanda y el precio medio si el lugar y el segmento lo piden. */
    const seg = BRAND.SEGMENTS[brand.segment];
    const wantAmenities = [];
    if (seg.id === "playa" || seg.id === "todoincluido") wantAmenities.push("piscina", "playa_privada", "restaurante");
    if (seg.id === "bienestar") wantAmenities.push("spa", "gimnasio");
    if (seg.id === "urbano" || seg.id === "aeropuerto") wantAmenities.push("business_center", "parking");
    if (brand.tier === "lujo" || brand.tier === "ultralujo") wantAmenities.push("spa", "salones");
    r.amenities = r.amenities || [];
    if (skill >= 55 && r.amenities.length < 4) {
      const pick = wantAmenities.find((a) => !r.amenities.includes(a));
      if (pick) {
        const cost = (AMENITIES[pick].cost || 1) * r.rentMonthly * 0.9;
        if (spendOps(state, cost, false)) {
          r.amenities.push(pick);
          acts.push("añadió " + AMENITIES[pick].name.toLowerCase());
        }
      }
    }

    /* Tarifa (ADR): el error se reduce con la habilidad, igual que en
       restaurantes con el precio del ticket. */
    const noiseAmp = U.clamp(1 - skill / 100, 0.04, 0.5);
    const noise = (Math.random() * 2 - 1) * noiseAmp * 0.3;
    const target = fair * (1 + noise);
    r.adr = Math.round(target * 10) / 10;
    applyBook(state, r, brand, pl);

    const grade = skill >= 80 ? "excelente" : skill >= 62 ? "sólida" : skill >= 45 ? "correcta" : "justita";
    r.managerNote =
      `${mgrName} (hab. ${Math.round(skill)}, gestión ${grade}) lleva tarifas, personal, mantenimiento y amenities. ` +
      (acts.length ? "Ahora: " + acts.join(", ") + ". " : "") +
      (seg.poi.includes(r.poi) ? "La ubicación encaja con la marca." : "Ubicación algo atípica para esta marca.");
    r.lastManagerRun = gameMs;
  }

  function alerts(state) {
    const list = [];
    if (!state) return list;
    if (state.cash < 0) list.push({ k: "cash", bad: true, t: "Caja negativa. Intereses de descubierto." });
    if (state.cash < 150000 && state.cash >= 0) list.push({ k: "low", bad: true, t: "Caja baja: menos de 150.000 €." });
    const debt = SIM.debtTotal ? SIM.debtTotal(state) : 0;
    if (debt > 0) list.push({ k: "debt", bad: false, t: "Deuda bancaria: " + Math.round(debt).toLocaleString("es-ES") + " €." });
    let loss = 0,
      noMgr = 0;
    for (const r of state.hotels) {
      if (r.finance.revTotal < r.finance.costTotal && r.status === "abierto") loss++;
      if (r.status === "abierto" && r.managerAI !== false && !(r.staff || []).some((s) => s.role === "gerente")) noMgr++;
    }
    for (const ev of state.events || []) {
      if (ev.kind === "inspeccion" && state.gameTime >= ev.start - 2 * 86400000 && state.gameTime <= ev.end) {
        list.push({ k: "insp", bad: true, t: ev.news || "Inspección próxima." });
      }
    }
    if (noMgr) list.push({ k: "mgr", bad: true, t: noMgr + " hotel(es) sin dirección: no se gestionan solos." });
    if (loss) list.push({ k: "loss", bad: false, t: loss + " hotel(es) en pérdidas acumuladas." });
    if (state.yearbookNew) list.unshift({ k: "year", bad: false, t: "Anuario " + state.yearbookNew + " listo en Prensa." });
    return list.slice(0, 8);
  }

  let audioCtx = null;
  let muted = true;
  try {
    muted = localStorage.getItem("horizon-hotels-sfx") !== "on";
  } catch (_) {}

  function setMuted(v) {
    muted = v;
    try {
      localStorage.setItem("horizon-hotels-sfx", v ? "off" : "on");
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
    enter: () => beep(196, 0.4, "sine", 0.02),
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
    const cc = city || far ? (city || far).cc : null;
    const ctry = cc ? WORLD.country(cc) : WORLD.DEFAULT;
    const popK = city ? city.popK : 2.2;
    const dummy = { countryCode: ctry.iso || "XX", popK, residential: false, commercial: true, poi: "urbano" };
    const q = SIM.buildQuote(BRAND.list[0], "urbano_pequeno", dummy, gameMs || Date.UTC(2000, 0, 1));
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

  global.SABOR = {
    HOLDING,
    AMENITIES,
    POI_L,
    classifyPoi,
    streetFlags,
    suggestFormat,
    defaultBook,
    ensureBooks,
    applyBook,
    runManager,
    alerts,
    setMuted,
    muted: () => muted,
    sfx,
    addPnl,
    estimateHover,
  };
})(window);
