/* Horizon Hotels — reglas de simulación: formatos, personal, ocupación, ADR, economía */
(function (global) {
  /* 30 formatos de hotel: habitaciones, categoría orientativa, plantilla y coste.
     poiTag/segTag = afinidad fuerte con esa ubicación o esos segmentos de marca
     (se usa para sugerir formato según el lugar real, y para el afinamiento de
     demanda). starMin/starMax = rango de categorías (2-5) para las que tiene
     sentido este formato. */
  const HTYPES = [
    { id: "hostal_pequeno", name: "Hostal pequeño", rooms: 12, m2r: 16, star: [2, 3], permitH: 10, buildH: 20, cost: 95000, rentMult: 0.75, staff: { gerente: 1, recepcion: 1, limpieza: 1, mantenimiento: 0 } },
    { id: "hostal_grande", name: "Hostal grande", rooms: 30, m2r: 16, star: [2, 3], permitH: 16, buildH: 32, cost: 220000, rentMult: 0.8, staff: { gerente: 1, recepcion: 2, limpieza: 2, mantenimiento: 1 } },
    { id: "motel_carretera", name: "Motel de carretera", rooms: 24, m2r: 20, star: [2], permitH: 14, buildH: 28, cost: 190000, rentMult: 0.55, staff: { gerente: 1, recepcion: 1, limpieza: 2, mantenimiento: 1 }, poiTag: "poligono" },
    { id: "capsula_aeropuerto", name: "Hotel cápsula de aeropuerto", rooms: 60, m2r: 7, star: [2, 3], permitH: 20, buildH: 40, cost: 260000, rentMult: 1.3, staff: { gerente: 1, recepcion: 3, limpieza: 3, mantenimiento: 1 }, poiTag: "aeropuerto" },
    { id: "urbano_pequeno", name: "Hotel urbano pequeño", rooms: 25, m2r: 22, star: [3], permitH: 24, buildH: 48, cost: 310000, rentMult: 1, staff: { gerente: 1, recepcion: 2, limpieza: 2, mantenimiento: 1 } },
    { id: "urbano_mediano", name: "Hotel urbano mediano", rooms: 60, m2r: 24, star: [3, 4], permitH: 34, buildH: 72, cost: 780000, rentMult: 1.05, staff: { gerente: 1, recepcion: 3, limpieza: 5, mantenimiento: 2 } },
    { id: "urbano_grande", name: "Hotel urbano grande", rooms: 120, m2r: 24, star: [3, 4], permitH: 48, buildH: 110, cost: 1650000, rentMult: 1.1, staff: { gerente: 2, recepcion: 5, limpieza: 9, mantenimiento: 3 } },
    { id: "aparthotel_estudio", name: "Aparthotel de estudios", rooms: 40, m2r: 30, star: [3], permitH: 30, buildH: 64, cost: 620000, rentMult: 0.95, staff: { gerente: 1, recepcion: 2, limpieza: 3, mantenimiento: 1 } },
    { id: "boutique_pequeno", name: "Hotel boutique", rooms: 18, m2r: 30, star: [4, 5], permitH: 28, buildH: 60, cost: 520000, rentMult: 1.2, staff: { gerente: 1, recepcion: 2, limpieza: 2, mantenimiento: 1 } },
    { id: "business_torre", name: "Torre de negocios", rooms: 180, m2r: 26, star: [4], permitH: 60, buildH: 150, cost: 3200000, rentMult: 1.2, staff: { gerente: 2, recepcion: 6, limpieza: 12, mantenimiento: 4 }, poiTag: "comercial" },
    { id: "aeropuerto_plaza", name: "Hotel de aeropuerto superior", rooms: 150, m2r: 26, star: [4], permitH: 50, buildH: 120, cost: 2400000, rentMult: 1.35, staff: { gerente: 2, recepcion: 6, limpieza: 10, mantenimiento: 3 }, poiTag: "aeropuerto" },
    { id: "resort_playa_medio", name: "Resort de playa mediano", rooms: 200, m2r: 32, star: [4], permitH: 60, buildH: 160, cost: 3400000, rentMult: 1.15, staff: { gerente: 2, recepcion: 6, limpieza: 14, mantenimiento: 4 }, poiTag: "playa" },
    { id: "resort_playa_grande", name: "Resort de playa grande", rooms: 400, m2r: 34, star: [4, 5], permitH: 90, buildH: 240, cost: 7200000, rentMult: 1.2, staff: { gerente: 3, recepcion: 10, limpieza: 26, mantenimiento: 7 }, poiTag: "playa" },
    { id: "todo_incluido_mega", name: "Mega resort todo incluido", rooms: 600, m2r: 34, star: [4], permitH: 120, buildH: 320, cost: 10500000, rentMult: 1.1, staff: { gerente: 4, recepcion: 14, limpieza: 40, mantenimiento: 10 }, poiTag: "playa" },
    { id: "spa_bienestar", name: "Hotel spa & bienestar", rooms: 80, m2r: 34, star: [4], permitH: 44, buildH: 100, cost: 1900000, rentMult: 1.25, staff: { gerente: 2, recepcion: 4, limpieza: 6, mantenimiento: 2 } },
    { id: "golf_resort", name: "Resort de golf", rooms: 150, m2r: 32, star: [4], permitH: 60, buildH: 150, cost: 2800000, rentMult: 1.15, staff: { gerente: 2, recepcion: 5, limpieza: 9, mantenimiento: 4 } },
    { id: "eco_lodge", name: "Eco-lodge rural", rooms: 20, m2r: 26, star: [3], permitH: 20, buildH: 46, cost: 260000, rentMult: 0.6, staff: { gerente: 1, recepcion: 1, limpieza: 2, mantenimiento: 1 }, poiTag: "rural" },
    { id: "refugio_montana", name: "Refugio de montaña", rooms: 30, m2r: 20, star: [3], permitH: 24, buildH: 56, cost: 340000, rentMult: 0.7, staff: { gerente: 1, recepcion: 2, limpieza: 2, mantenimiento: 1 } },
    { id: "chalet_esqui", name: "Chalet de esquí de lujo", rooms: 40, m2r: 34, star: [5], permitH: 40, buildH: 90, cost: 1350000, rentMult: 1.1, staff: { gerente: 1, recepcion: 3, limpieza: 4, mantenimiento: 2 } },
    { id: "manor_historico", name: "Casa señorial histórica", rooms: 25, m2r: 30, star: [4], permitH: 30, buildH: 70, cost: 680000, rentMult: 0.95, staff: { gerente: 1, recepcion: 2, limpieza: 3, mantenimiento: 1 }, poiTag: "historico" },
    { id: "palacio_patrimonio", name: "Palacio patrimonio restaurado", rooms: 60, m2r: 36, star: [5], permitH: 60, buildH: 160, cost: 3600000, rentMult: 1.1, staff: { gerente: 2, recepcion: 4, limpieza: 8, mantenimiento: 3 }, poiTag: "historico" },
    { id: "design_loft", name: "Hotel de diseño / loft", rooms: 35, m2r: 28, star: [4], permitH: 30, buildH: 68, cost: 620000, rentMult: 1.15, staff: { gerente: 1, recepcion: 3, limpieza: 3, mantenimiento: 1 }, poiTag: "turistico" },
    { id: "grand_hotel_lujo", name: "Gran hotel de lujo", rooms: 250, m2r: 40, star: [5], permitH: 90, buildH: 220, cost: 9000000, rentMult: 1.3, staff: { gerente: 3, recepcion: 10, limpieza: 20, mantenimiento: 6 } },
    { id: "suite_only_ultra", name: "Hotel solo-suites ultralujo", rooms: 60, m2r: 55, star: [5], permitH: 60, buildH: 150, cost: 4800000, rentMult: 1.5, staff: { gerente: 2, recepcion: 6, limpieza: 8, mantenimiento: 3 } },
    { id: "residencias_lujo", name: "Residencias con servicios (lujo)", rooms: 90, m2r: 48, star: [5], permitH: 60, buildH: 150, cost: 5200000, rentMult: 1.25, staff: { gerente: 2, recepcion: 5, limpieza: 8, mantenimiento: 3 } },
    { id: "rooftop_skybar_hotel", name: "Torre skyline con rooftop", rooms: 300, m2r: 30, star: [5], permitH: 100, buildH: 260, cost: 11500000, rentMult: 1.4, staff: { gerente: 3, recepcion: 10, limpieza: 22, mantenimiento: 6 }, poiTag: "comercial" },
    { id: "isla_privada", name: "Resort de isla privada", rooms: 50, m2r: 60, star: [5], permitH: 90, buildH: 220, cost: 6800000, rentMult: 1.35, staff: { gerente: 2, recepcion: 5, limpieza: 10, mantenimiento: 4 }, poiTag: "playa" },
    { id: "termas_wellness", name: "Balneario termal wellness ultralujo", rooms: 70, m2r: 42, star: [5], permitH: 70, buildH: 170, cost: 4200000, rentMult: 1.3, staff: { gerente: 2, recepcion: 5, limpieza: 8, mantenimiento: 3 } },
    { id: "tren_crucero_tematico", name: "Hotel temático experiencial", rooms: 45, m2r: 30, star: [4], permitH: 34, buildH: 80, cost: 980000, rentMult: 1.1, staff: { gerente: 1, recepcion: 3, limpieza: 4, mantenimiento: 2 }, poiTag: "turistico" },
    { id: "glamping_lujo", name: "Glamping de lujo", rooms: 15, m2r: 40, star: [4], permitH: 16, buildH: 34, cost: 320000, rentMult: 0.5, staff: { gerente: 1, recepcion: 1, limpieza: 2, mantenimiento: 1 }, poiTag: "rural" },
  ];
  const HTYPE_BY = Object.fromEntries(HTYPES.map((s) => [s.id, s]));

  const ROLES = {
    gerente: { name: "Dirección", wage: 2.6, skillFx: "ops" },
    recepcion: { name: "Recepción", wage: 1.3, skillFx: "service" },
    limpieza: { name: "Pisos / limpieza", wage: 1.1, skillFx: "clean" },
    mantenimiento: { name: "Mantenimiento", wage: 1.5, skillFx: "maint" },
  };

  const NAMES_A = ["Ana","Luis","Mei","Omar","Inés","Hugo","Sofía","Kenji","Amara","Pavel","Léa","Diego","Noor","Iris","Mateo","Yara","Ravi","Clara","Jonas","Lila","Efe","Nia","Piotr","Hana","Gael","Zeynep","Ivo","Amina","Theo","Lucia"];
  const NAMES_B = ["García","Nakamura","Silva","Nguyen","Kowalski","Diallo","Berg","Hassan","Rossi","Costa","Müller","Papadopoulos","Kim","Patel","Okafor","López","Andersen","Ivanov","Fernández","Yilmaz"];

  function personName(rng) {
    return NAMES_A[(rng() * NAMES_A.length) | 0] + " " + NAMES_B[(rng() * NAMES_B.length) | 0];
  }

  function sizeOf(id) {
    return HTYPE_BY[id] || HTYPES[4];
  }

  function yearOf(gameMs) {
    return new Date(gameMs).getUTCFullYear();
  }

  function localHour(gameMs, tz) {
    const utc = new Date(gameMs);
    let h = utc.getUTCHours() + (tz || 0);
    let extraDay = 0;
    while (h < 0) {
      h += 24;
      extraDay--;
    }
    while (h >= 24) {
      h -= 24;
      extraDay++;
    }
    return { h, extraDay, min: utc.getUTCMinutes() };
  }

  /* ADR "justo" (tarifa media diaria) según la marca y el nivel de precios del
     país; ver nota equivalente en el simulador de restaurantes: el resto de
     costes (salarios, alquiler, suministros) escala de forma ~lineal con el
     nivel de precios, así que la tarifa debe crecer casi igual de rápido para
     no perder margen en los países más caros. */
  function fairADR(brand, pl) {
    return 70 * brand.adr * Math.pow(Math.max(0.2, pl), 0.8);
  }

  function buildQuote(brand, htype, place, gameMs) {
    const year = yearOf(gameMs);
    const infl = WORLD.inflationFactor(place.countryCode, year);
    const ctry = WORLD.country(place.countryCode);
    const popK = place.popK || 10;
    const cityFactor = U.clamp(Math.log10(popK + 10) / 2.2, 0.55, 2.8);
    const rentIdx = (ctry.rent / 72) * cityFactor;
    const sz = sizeOf(htype);
    const permitMult = place.residential ? 1.3 : place.commercial ? 0.9 : 1;
    const base = sz.cost * infl * U.clamp(0.45 + rentIdx * 0.55, 0.4, 3.6);
    const permits = base * 0.06 * permitMult;
    const works = base;
    const starMul = 0.7 + (sz.star[sz.star.length - 1] || 3) * 0.16;
    const furniture = sz.rooms * 3200 * starMul * infl * (ctry.rent / 72);
    const total = Math.round(permits + works + furniture);
    const rentMonthly = sz.rooms * sz.m2r * 7.5 * infl * rentIdx * (sz.rentMult != null ? sz.rentMult : 1);
    return {
      total,
      permits: Math.round(permits),
      works: Math.round(works),
      fitout: Math.round(furniture),
      rentMonthly,
      permitH: Math.round(sz.permitH * permitMult),
      buildH: sz.buildH,
      wageHour: ctry.wage * infl,
      tax: ctry.tax,
      vat: ctry.vat,
      infl,
      cityFactor,
      rentIdx,
    };
  }

  function hireKit(brand, htype, place, gameMs, rng) {
    const sz = sizeOf(htype);
    const need = { ...sz.staff };
    need.gerente = Math.max(1, need.gerente || 0);
    const quote = buildQuote(brand, htype, place, gameMs);
    const staff = [];
    for (const [role, n] of Object.entries(need)) {
      for (let i = 0; i < n; i++) {
        const skill = Math.round(42 + rng() * 28);
        staff.push({
          id: U.uid("st"),
          role,
          name: personName(rng),
          skill,
          wage: +(quote.wageHour * ROLES[role].wage * (0.7 + skill / 200)).toFixed(2),
        });
      }
    }
    return staff;
  }

  function staffStats(staff) {
    const by = { gerente: [], recepcion: [], limpieza: [], mantenimiento: [] };
    for (const s of staff) (by[s.role] || []).push(s);
    const avg = (arr) => (arr.length ? arr.reduce((a, x) => a + x.skill, 0) / arr.length : 0);
    const wageDay = staff.reduce((a, s) => a + s.wage * 8, 0);
    return {
      avgMgr: avg(by.gerente),
      avgFront: avg(by.recepcion),
      avgClean: avg(by.limpieza),
      avgMaint: avg(by.mantenimiento),
      n: staff.length,
      by,
      wageDay,
    };
  }

  function understaffed(brand, htype, staff) {
    const need = sizeOf(htype).staff;
    const st = staffStats(staff);
    const miss = [];
    if ((st.by.gerente.length || 0) < 1) miss.push("direccion");
    if ((st.by.recepcion.length || 0) < Math.max(1, Math.ceil((need.recepcion || 1) * 0.4))) miss.push("recepcion");
    if ((st.by.limpieza.length || 0) < Math.max(1, Math.ceil((need.limpieza || 1) * 0.3))) miss.push("limpieza");
    return miss;
  }

  function qualityOf(r, brand) {
    const st = staffStats(r.staff);
    const ameScore = U.clamp(40 + (r.amenities || []).length * 9, 40, 96);
    return U.clamp(
      0.3 * st.avgFront + 0.22 * r.cleanliness + 0.16 * ameScore + 0.18 * st.avgMgr + 0.14 * st.avgMaint,
      8,
      99
    );
  }

  function eventMod(state, r, gameMs) {
    let m = 1;
    for (const ev of state.events || []) {
      if (gameMs < ev.start || gameMs > ev.end) continue;
      if (ev.cc && ev.cc !== r.country) continue;
      if (ev.city && ev.city !== r.city) continue;
      m *= ev.demand || 1;
    }
    return m;
  }

  function competingShare(state, cc) {
    const c = state.competitors[cc] || { strength: WORLD.competitorBase(cc) };
    return U.clamp(c.strength, 0.05, 0.9);
  }

  /* Ocupación (0-1): a diferencia del restaurante, un hotel no tiene una curva
     horaria fuerte (una habitación vendida "de noche" se factura igual estés
     dormido a las 3h o desayunando a las 9h), así que aquí el factor principal
     es el día de la semana + la temporada + el ajuste de tarifa/calidad, y el
     resultado se reparte igual entre las 24h del día para poder seguir usando
     el mismo bucle horario de asentamiento que el resto de Horizon. */
  function occupancy(r, brand, state, gameMs) {
    if (r.status !== "abierto") return 0;
    const miss = understaffed(brand, r.htype, r.staff);
    if (miss.length) return 0;
    const year = yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const wealth = U.clamp(pl, 0.2, 3.2);
    const q = qualityOf(r, brand) / 100;
    const adr = r.adr || fairADR(brand, pl);
    const fair = fairADR(brand, pl);
    const priceFit = U.clamp(1.3 - Math.abs(adr - fair) / Math.max(20, fair), 0.25, 1.2);
    const stars = (r.stars || 3.4) / 5;
    const clean = r.cleanliness / 100;
    const share = competingShare(state, r.country);
    const compFit = 1 - share * 0.5 + q * 0.22;
    const pop = Math.log10((r.popK || 10) * 1000 + 8);
    const poi = r.poi || "urbano";
    const seg = BRAND.SEGMENTS[brand.segment];
    const poiFit = seg.poi.includes(poi) ? 1.3 : brand.segment === "urbano" ? 0.95 : 0.6;
    const d = new Date(gameMs);
    const dow = d.getUTCDay();
    const m = d.getUTCMonth();
    const leisure = brand.segment === "playa" || brand.segment === "todoincluido" || brand.segment === "montana" || brand.segment === "rural" || brand.segment === "bienestar" || brand.segment === "historico" || brand.segment === "boutique";
    const weekFit = leisure ? (dow === 5 || dow === 6 || dow === 0 ? 1.22 : 0.88) : dow === 0 || dow === 6 ? 0.68 : 1.1;
    const southern = (r.lat || 0) < 0;
    const summerMonth = southern ? m >= 11 || m <= 1 : m >= 5 && m <= 7;
    const winterMonth = southern ? m >= 5 && m <= 7 : m >= 11 || m <= 1;
    let seasonFit = 1;
    if (brand.segment === "playa" || brand.segment === "todoincluido") seasonFit = summerMonth ? 1.45 : m === 3 || m === 8 ? 1.1 : 0.72;
    else if (brand.segment === "montana") seasonFit = winterMonth ? 1.5 : 0.65;
    else if (brand.segment === "aeropuerto" || brand.segment === "urbano" || brand.segment === "aparthotel") seasonFit = summerMonth ? 0.9 : 1;
    const cal = calendarMod(r.country, brand, poi, gameMs);
    /* Media ponderada (no producto) de los factores de ajuste: con tantos
       factores multiplicándose, un producto puro se hunde o se dispara con
       facilidad; la media ponderada da un rango de ocupación mucho más
       estable y realista (entre ~5% y ~97%). */
    const mult =
      (wealth * 0.34 +
        q * 0.5 +
        priceFit * 0.42 +
        stars * 0.26 +
        clean * 0.18 +
        compFit * 0.3 +
        poiFit * 0.32 +
        weekFit * 0.28 +
        seasonFit * 0.34 +
        cal * 0.12 +
        eventMod(state, r, gameMs) * 0.12 +
        pop * 0.11) /
      3.15;
    return U.clamp(mult, 0.05, 0.97);
  }

  /* Estacionalidad festiva: sube en Navidad/Año Nuevo para todo, más para
     ocio; sube en Semana Santa para ocio en países de tradición católica. */
  function calendarMod(cc, brand, poi, gameMs) {
    const d = new Date(gameMs);
    const m = d.getUTCMonth();
    const day = d.getUTCDate();
    const leisure = brand.segment !== "urbano" && brand.segment !== "aeropuerto" && brand.segment !== "aparthotel";
    let f = 1;
    if (m === 11 && day >= 22 && day <= 31) f *= leisure ? 1.4 : 0.85;
    if (m === 0 && day <= 3) f *= leisure ? 1.25 : 0.8;
    return f;
  }

  function settleOne(state, r, fromMs, toMs) {
    if (toMs <= fromMs) return { rev: 0, cost: 0, cust: 0 };
    const brand = BRAND.get(r.brandId);
    if (!brand) return { rev: 0, cost: 0, cust: 0 };
    if (r.managerAI == null) r.managerAI = true;
    if (!r.poi) r.poi = "urbano";
    if (!r.finance.months) r.finance.months = {};
    if (!r.amenities) r.amenities = [];

    const year = yearOf(toMs);
    const shock = 1 + (((state.competitors[r.country] || {}).inflBump) || 0);
    const pl = WORLD.priceLevel(r.country, year) * shock;
    const ctry = WORLD.country(r.country);
    const inflNow = WORLD.inflationFactor(r.country, year);
    const inflOpen = r.openInfl || WORLD.inflationFactor(r.country, yearOf(r.builtAt || toMs));
    const inflMul = (inflNow / Math.max(0.25, inflOpen)) * shock;

    if (r.status === "permisos" || r.status === "obras") {
      let guard = 0;
      while ((r.status === "permisos" || r.status === "obras") && toMs >= r.statusUntil && guard++ < 6) {
        if (r.status === "permisos") {
          r.status = "obras";
          r.statusUntil = r.statusUntil + sizeOf(r.htype).buildH * 3600000;
          pushNews(state, toMs, `Obras iniciadas: ${r.name}`);
        } else {
          r.status = "abierto";
          r.statusUntil = 0;
          r.openedAt = toMs;
          SABOR.runManager(state, r, brand, toMs);
          try {
            SABOR.sfx.open();
          } catch (_) {}
          pushNews(state, toMs, `Abre ${r.name} en ${r.city || WORLD.country(r.country).name}`);
        }
      }
      if (r.status !== "abierto") {
        r.lastSim = toMs;
        return { rev: 0, cost: 0, cust: 0 };
      }
    }

    if (r.status === "cerrado") {
      const rent = (r.rentMonthly * inflMul / 30 / 24) * ((toMs - fromMs) / 3600000);
      r.finance.costTotal += rent;
      state.cash -= rent;
      r.lastSim = toMs;
      return { rev: 0, cost: rent, cust: 0 };
    }

    const hours = Math.min(2400, (toMs - fromMs) / 3600000);
    let rev = 0;
    let cost = 0;
    let cust = 0;
    const st = staffStats(r.staff);
    const wageHour = (st.wageDay / 8) * inflMul;
    const rentMonth = r.owned ? (r.communityMonthly || r.rentMonthly * 0.08) : r.rentMonthly;
    const rentHour = (rentMonth * inflMul) / 30 / 24;
    const rooms = sizeOf(r.htype).rooms;
    const utilHour = rooms * sizeOf(r.htype).m2r * 0.03 * pl;
    const adr = r.adr || fairADR(brand, pl);
    const vat = ctry.vat || 0;
    const ameMul = 1 + (r.amenities || []).length * 0.045;
    const shiftCoverage = U.clamp(0.62 - (st.n - 4) * 0.01, 0.42, 0.62);
    const step = hours > 72 ? 6 : 1;
    let wagesSum = 0;
    for (let h = 0; h < hours; h += step) {
      const t = fromMs + h * 3600000;
      const occ = occupancy(r, brand, state, t);
      const roomsSoldHour = (rooms * occ * step) / 24;
      const open = occ > 0.03;
      cust += roomsSoldHour;
      const sales = roomsSoldHour * adr * ameMul;
      const vatPaid = sales * vat;
      const laundry = roomsSoldHour * 4.2 * pl;
      const wages = (open ? wageHour * shiftCoverage : wageHour * 0.35) * step;
      const rent = rentHour * step;
      const util = (open ? utilHour : utilHour * 0.4) * step;
      rev += sales;
      cost += laundry + wages + rent + util + vatPaid;
      wagesSum += wages;
      r.cleanliness = U.clamp(r.cleanliness - occ * 0.05 * step + (st.avgClean > 0 ? st.by.limpieza.length * 0.3 * step : -0.08 * step), 8, 100);
    }

    if (r.owned && r.propertyValue) {
      r.propertyValue *= 1 + 0.000035 * hours * shock;
    }
    let profit = rev - cost;
    let tax = 0;
    if (profit > 0) {
      tax = profit * (ctry.tax || 0);
      cost += tax;
      profit -= tax;
    }
    r.finance.taxTotal = (r.finance.taxTotal || 0) + tax;
    SABOR.addPnl(r, state, rev, cost, toMs);
    if (!r.lastManagerRun || toMs - r.lastManagerRun > 20 * 3600000) {
      SABOR.runManager(state, r, brand, toMs);
    }
    r.finance.revTotal += rev;
    r.finance.costTotal += cost;
    r.finance.customersTotal += cust;
    r.finance.revToday += rev;
    r.finance.costToday += cost;
    r.finance.customersToday += cust;
    r.finance.wagesToday = (r.finance.wagesToday || 0) + wagesSum;
    const iso = new Date(toMs).toISOString().slice(0, 10);
    if (r.finance.dayStamp !== iso) {
      r.finance.revYesterday = r.finance.revToday;
      r.finance.costYesterday = r.finance.costToday;
      r.finance.custYesterday = r.finance.customersToday;
      r.finance.wagesYesterday = r.finance.wagesToday;
      r.finance.revToday = 0;
      r.finance.costToday = 0;
      r.finance.customersToday = 0;
      r.finance.wagesToday = 0;
      r.finance.dayStamp = iso;
    }

    const qNow = qualityOf(r, brand);
    r.quality = qNow;
    const sat = U.clamp(qNow / 20 + (r.cleanliness / 100) * 1.2 + U.rand(-0.15, 0.15), 1, 5);
    r.stars = r.stars * 0.97 + sat * 0.03;
    r.reviewCount = (r.reviewCount || 0) + (cust > 3 ? 1 : 0);
    if (cust > 4 && Math.random() < 0.08) {
      const texts = [
        "Habitación impecable, volveré.",
        "El check-in fue rápido y amable.",
        "Un poco caro para lo que ofrece.",
        "Desayuno correcto, buena ubicación.",
        "Se nota el mantenimiento cuidado.",
        "Algo de ruido, pero limpio.",
        "El personal muy atento.",
        "De los mejores de la zona.",
      ];
      r.reviews = r.reviews || [];
      r.reviews.unshift({ stars: +sat.toFixed(1), text: U.pick(texts), t: toMs });
      r.reviews = r.reviews.slice(0, 8);
    }

    state.cash += profit;
    const cc = r.country;
    state.revByCountry[cc] = (state.revByCountry[cc] || 0) + rev;
    r.lastSim = toMs;
    return { rev, cost, cust };
  }

  function settleAll(state, toMs) {
    const vpRaw = state._vp;
    const vp = vpRaw && typeof vpRaw.has === "function" ? vpRaw : null;
    const n = state.hotels.length;
    const openId = state._openId;
    let rev = 0,
      cost = 0,
      cust = 0;
    for (let i = 0; i < n; i++) {
      const r = state.hotels[i];
      const from = r.lastSim || toMs;
      const dt = toMs - from;
      if (dt <= 0) continue;
      const hot = n < 120 || !vp || vp.has(r.id) || r.id === openId;
      if (!hot && dt < 3 * 3600000) continue;
      const s = settleOne(state, r, from, toMs);
      rev += s.rev;
      cost += s.cost;
      cust += s.cust;
    }
    return { rev, cost, cust };
  }

  function maybeEvents(state, fromMs, toMs) {
    const days = (toMs - fromMs) / 86400000;
    if (days <= 0) return;
    const p = Math.min(0.4, days * 0.1);
    if (Math.random() > p) return;
    const types = ["inspeccion", "feria", "inflacion", "obraVecina", "critico", "huelga", "clima", "boom", "aeropuertoNuevo"];
    const kind = U.pick(types);
    const rs = state.hotels.filter((x) => x.status === "abierto");
    const target = rs.length ? U.pick(rs) : null;
    const cc = target ? target.country : U.pick(Object.keys(WORLD.COUNTRIES));
    const start = toMs;
    const mk = (ev) => {
      state.events.push(ev);
      if (state.events.length > 40) state.events = state.events.slice(-40);
      pushNews(state, toMs, ev.news);
    };
    if (kind === "inspeccion" && target) {
      const fine = target.cleanliness < 55 ? target.rentMonthly * 0.3 : 0;
      if (fine) {
        state.cash -= fine;
        target.status = "cerrado";
        target.closedReason = "Cerrado por inspección de seguridad y salubridad";
        setTimeoutStatus(target, toMs, 30);
      }
      mk({ id: U.uid("ev"), kind, cc, start, end: start + 2 * 86400000, demand: 1, news: fine ? `Inspección en ${target.name}: cierre temporal y multa de ${U.formatMoney(fine)}.` : `Inspección en ${target.name}: todo en orden.` });
    } else if (kind === "feria" && target) {
      mk({ id: U.uid("ev"), kind, cc, city: target.city, start, end: start + 5 * 86400000, demand: 1.55, news: `Gran congreso/feria en ${target.city || WORLD.country(cc).name}. Ocupación al alza 5 días.` });
    } else if (kind === "inflacion") {
      const c = state.competitors[cc] || { strength: WORLD.competitorBase(cc) };
      c.inflBump = (c.inflBump || 0) + 0.04;
      state.competitors[cc] = c;
      mk({ id: U.uid("ev"), kind, cc, start, end: start + 60 * 86400000, demand: 0.94, news: `Brote inflacionario en ${WORLD.country(cc).name}. Alquileres y salarios suben.` });
    } else if (kind === "obraVecina" && target) {
      mk({ id: U.uid("ev"), kind, cc, city: target.city, start, end: start + 12 * 86400000, demand: 0.8, news: `Obras en la manzana de ${target.name}. Ocupación resentida.` });
    } else if (kind === "critico" && target) {
      target.stars = U.clamp(target.stars + 0.4, 1, 5);
      mk({ id: U.uid("ev"), kind, cc, start, end: start + 14 * 86400000, demand: 1.2, news: `Reseña destacada de ${target.name} (${target.stars.toFixed(1)}★). Reservas al alza.` });
    } else if (kind === "huelga" && target) {
      mk({ id: U.uid("ev"), kind, cc, start, end: start + 4 * 86400000, demand: 0.75, news: `Tensión laboral en ${WORLD.country(cc).name}. Servicio más lento.` });
    } else if (kind === "clima" && target) {
      mk({ id: U.uid("ev"), kind, cc, city: target.city, start, end: start + 3 * 86400000, demand: 0.6, news: `Temporal en ${target.city || WORLD.country(cc).name}. Cancelaciones de última hora.` });
    } else if (kind === "boom") {
      const c = state.competitors[cc] || { strength: WORLD.competitorBase(cc) };
      c.strength = U.clamp(c.strength - 0.04, 0.08, 0.9);
      state.competitors[cc] = c;
      mk({ id: U.uid("ev"), kind, cc, start, end: start + 21 * 86400000, demand: 1.18, news: `Vacío de oferta hotelera en ${WORLD.country(cc).name}. Ventana de expansión.` });
    } else if (kind === "aeropuertoNuevo" && target) {
      const mates = state.hotels.filter((x) => x.city && x.city === target.city);
      mates.forEach((x) => (x.metro = true));
      mk({ id: U.uid("ev"), kind, cc, city: target.city, start, end: start + 365 * 86400000, demand: 1.1, news: `Nueva ruta aérea/conexión hacia ${target.city || WORLD.country(cc).name}. Sube la llegada de huéspedes.` });
    }
  }

  function setTimeoutStatus(r, now, hours) {
    r.statusUntil = now + hours * 3600000;
    r._reopen = true;
  }

  function tickReopen(state, now) {
    for (const r of state.hotels) {
      if (r._reopen && r.status === "cerrado" && r.statusUntil && now >= r.statusUntil) {
        r.status = "abierto";
        r.closedReason = "";
        r._reopen = false;
      }
    }
  }

  function pushNews(state, t, text) {
    state.news = state.news || [];
    state.news.unshift({ t, text });
    state.news = state.news.slice(0, 80);
  }

  function driftCompetition(state, hours) {
    for (const cc of Object.keys(state.competitors)) {
      const c = state.competitors[cc];
      c.strength = U.clamp(c.strength + (Math.random() - 0.48) * 0.002 * hours, 0.08, 0.88);
    }
  }

  function createHotel(state, opts) {
    const brand = BRAND.get(opts.brandId);
    const rng = U.mulberry32(
      U.hash32(
        [opts.place.lat, opts.place.lon, opts.brandId, opts.htype, state.gameTime, opts.seedSalt || "", (state.hotels || []).length].join("|")
      )
    );
    const staff = hireKit(brand, opts.htype, opts.place, state.gameTime, rng);
    const quote = opts.quote;
    const r = {
      id: U.uid("h"),
      name: `${brand.name} · ${opts.place.city || opts.place.municipality || opts.place.countryName}`,
      brandId: brand.id,
      htype: opts.htype,
      lat: opts.place.lat,
      lon: opts.place.lon,
      gh: U.geohash(opts.place.lat, opts.place.lon, 5),
      country: opts.place.countryCode,
      countryName: opts.place.countryName,
      city: opts.place.city || opts.place.municipality || "",
      municipality: opts.place.municipality || "",
      settlementKind: opts.place.settlementKind || "",
      region: opts.place.region || opts.place.province || "",
      address: opts.place.display,
      street: opts.place.street || "",
      osmKey: opts.place.osmKey,
      osmValue: opts.place.osmValue,
      tz: opts.place.tz,
      popK: opts.place.popK,
      status: "permisos",
      statusUntil: state.gameTime + quote.permitH * 3600000,
      builtAt: state.gameTime,
      openedAt: 0,
      lastSim: state.gameTime,
      quality: 62,
      cleanliness: 96,
      stars: 3.4,
      reviewCount: 0,
      reviews: [],
      rentMonthly: quote.rentMonthly,
      staff,
      adr: fairADR(brand, WORLD.priceLevel(opts.place.countryCode, yearOf(state.gameTime))),
      finance: {
        revTotal: 0,
        costTotal: 0,
        taxTotal: 0,
        customersTotal: 0,
        revToday: 0,
        costToday: 0,
        customersToday: 0,
        dayStamp: new Date(state.gameTime).toISOString().slice(0, 10),
        months: {},
      },
      closedReason: "",
      sellValue: quote.total * 0.62,
      openInfl: WORLD.inflationFactor(opts.place.countryCode, yearOf(state.gameTime)),
      managerAI: true,
      managerNote: "El director/a de este hotel llevará tarifas, personal y mantenimiento según su habilidad.",
      lastManagerRun: 0,
      poi: opts.place.poi || "urbano",
      amenities: opts.amenities || [],
      metro: !!opts.place.metro,
      pedestrian: !!opts.place.pedestrian,
      owned: false,
      propertyValue: Math.round(quote.rentMonthly * 108),
      photo: U.safePhoto(opts.photo) || "",
      description: String(opts.description || "").slice(0, 800),
    };
    return r;
  }

  function sellValue(r, gameMs) {
    const ageY = Math.max(0.05, (gameMs - r.builtAt) / (365 * 86400000));
    const profit = r.finance.revTotal - r.finance.costTotal;
    const biz = Math.max(8000, r.sellValue * Math.pow(0.97, ageY) + profit * 0.12 + r.stars * 4000);
    return biz + (r.owned ? r.propertyValue || 0 : 0);
  }

  function ensureLoans(state) {
    if (!state.loans) state.loans = [];
    return state.loans;
  }

  function debtTotal(state) {
    return ensureLoans(state).reduce((a, l) => a + (l.remaining || 0), 0);
  }

  function creditLimit(state) {
    const n = (state.hotels || []).length;
    const rev = (state.hotels || []).reduce((a, r) => a + (r.finance && r.finance.revTotal ? r.finance.revTotal : 0), 0);
    const base = 900000 + n * 350000 + Math.min(rev * 0.12, 24000000) + Math.max(0, state.cash || 0) * 0.2;
    return Math.max(0, Math.round(base - debtTotal(state)));
  }

  function takeLoan(state, amount, months) {
    amount = Math.round(+amount || 0);
    months = +months || 24;
    if (![12, 24, 36, 48].includes(months)) months = 24;
    if (amount < 50000) return { ok: false, err: "El banco pide un mínimo de 50.000 €." };
    const room = creditLimit(state);
    if (amount > room) return { ok: false, err: "Crédito disponible: " + Math.round(room).toLocaleString("es-ES") + " €." };
    const rate = (state.cash || 0) < 0 ? 0.145 : nHotels(state) >= 10 ? 0.068 : 0.092;
    const i = rate / 12;
    const monthly = Math.round((amount * i) / (1 - Math.pow(1 + i, -months)));
    const loan = { id: U.uid("ln"), principal: amount, remaining: amount, rate, months, leftMonths: months, monthly, started: state.gameTime, paid: 0 };
    ensureLoans(state).push(loan);
    state.cash += amount;
    pushNews(state, state.gameTime, `Préstamo bancario de ${Math.round(amount).toLocaleString("es-ES")} € a ${months} meses (${(rate * 100).toFixed(1)}% TAE).`);
    return { ok: true, loan };
  }

  function nHotels(state) {
    return (state.hotels || []).length;
  }

  function tickLoans(state, fromMs, toMs) {
    const loans = ensureLoans(state);
    if (!loans.length || toMs <= fromMs) return 0;
    const fromM = new Date(fromMs).getUTCFullYear() * 12 + new Date(fromMs).getUTCMonth();
    const toM = new Date(toMs).getUTCFullYear() * 12 + new Date(toMs).getUTCMonth();
    const steps = Math.min(48, Math.max(0, toM - fromM));
    let paid = 0;
    for (let s = 0; s < steps; s++) {
      for (const ln of loans) {
        if (ln.remaining <= 0) continue;
        const interest = (ln.remaining * ln.rate) / 12;
        const pay = Math.min(ln.monthly, ln.remaining + interest);
        const prin = Math.min(ln.remaining, Math.max(0, pay - interest));
        ln.remaining = Math.max(0, +(ln.remaining - prin).toFixed(2));
        ln.leftMonths = Math.max(0, (ln.leftMonths || ln.months) - 1);
        ln.paid = (ln.paid || 0) + pay;
        state.cash -= pay;
        paid += pay;
      }
    }
    state.loans = loans.filter((l) => l.remaining > 1);
    return paid;
  }

  function payoffLoan(state, id) {
    const loans = ensureLoans(state);
    const ln = loans.find((l) => l.id === id);
    if (!ln) return { ok: false, err: "Préstamo no encontrado." };
    if (state.cash < ln.remaining) return { ok: false, err: "No hay caja para cancelar." };
    state.cash -= ln.remaining;
    ln.remaining = 0;
    state.loans = loans.filter((l) => l.remaining > 1);
    pushNews(state, state.gameTime, "Has cancelado un préstamo.");
    return { ok: true };
  }

  function cheatCash(state, amount) {
    amount = Math.round(+amount || 0);
    if (!amount) return;
    state.cash += amount;
    pushNews(state, state.gameTime, (amount > 0 ? "Truco de caja +" : "Truco de caja ") + Math.round(amount).toLocaleString("es-ES") + " €.");
  }

  global.SIM = {
    SIZES: HTYPES,
    HTYPES,
    ROLES,
    sizeOf,
    yearOf,
    localHour,
    fairADR,
    buildQuote,
    hireKit,
    staffStats,
    understaffed,
    qualityOf,
    occupancy,
    calendarMod,
    settleOne,
    settleAll,
    maybeEvents,
    tickReopen,
    pushNews,
    driftCompetition,
    createHotel,
    createRestaurant: createHotel,
    sellValue,
    competingShare,
    personName,
    managerSkill: function (r) {
      const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
      if (!mgrs.length) return 0;
      return Math.max(...mgrs.map((s) => +s.skill || 0));
    },
    hireRole: function (r, role, gameMs, mgrSkill) {
      const year = yearOf(gameMs);
      const ctry = WORLD.country(r.country);
      const infl = WORLD.inflationFactor(r.country, year);
      const wageH = ctry.wage * infl;
      const skill = Math.round(U.clamp(30 + (mgrSkill || 50) * 0.32 + Math.random() * 22, 28, 96));
      r.staff = r.staff || [];
      r.staff.push({ id: U.uid("st"), role, name: personName(Math.random), skill, wage: +(wageH * ROLES[role].wage * (0.7 + skill / 200)).toFixed(2) });
    },
    ensureLoans,
    debtTotal,
    creditLimit,
    takeLoan,
    tickLoans,
    payoffLoan,
    cheatCash,
  };
})(window);
