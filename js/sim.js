/* Meridiano — reglas de simulación, tamaños, personal, economía */
(function (global) {
  const SIZES = [
    { id: "kiosco", name: "Kiosco", seats: 8, m2: 22, permitH: 12, buildH: 24, cost: 22000, staff: { gerente: 0, cocinero: 1, camarero: 1, limpieza: 0, bartender: 0 } },
    { id: "local", name: "Local", seats: 42, m2: 140, permitH: 24, buildH: 48, cost: 165000, staff: { gerente: 1, cocinero: 2, camarero: 2, limpieza: 1, bartender: 0 } },
    { id: "flagship", name: "Flagship", seats: 140, m2: 480, permitH: 72, buildH: 192, cost: 920000, staff: { gerente: 2, cocinero: 6, camarero: 6, limpieza: 2, bartender: 1 } },
    { id: "estadio", name: "Estadio", seats: 480, m2: 2800, permitH: 168, buildH: 480, cost: 4800000, staff: { gerente: 4, cocinero: 16, camarero: 20, limpieza: 6, bartender: 4 } },
  ];
  const SIZE_BY = Object.fromEntries(SIZES.map((s) => [s.id, s]));

  const ROLES = {
    gerente: { name: "Gerencia", wage: 2.4, skillFx: "ops" },
    cocinero: { name: "Cocina", wage: 1.6, skillFx: "quality" },
    camarero: { name: "Sala", wage: 1.3, skillFx: "service" },
    limpieza: { name: "Limpieza", wage: 1.1, skillFx: "clean" },
    bartender: { name: "Barra", wage: 1.5, skillFx: "bar" },
  };

  const NAMES_A = ["Ana","Luis","Mei","Omar","Inés","Hugo","Sofía","Kenji","Amara","Pavel","Léa","Diego","Noor","Iris","Mateo","Yara","Ravi","Clara","Jonas","Lila","Efe","Nia","Piotr","Hana","Gael","Zeynep","Ivo","Amina","Theo","Lucia"];
  const NAMES_B = ["García","Nakamura","Silva","Nguyen","Kowalski","Diallo","Berg","Hassan","Rossi","Costa","Müller","Papadopoulos","Kim","Patel","Okafor","López","Andersen","Ivanov","Fernández","Yilmaz"];

  function personName(rng) {
    return NAMES_A[(rng() * NAMES_A.length) | 0] + " " + NAMES_B[(rng() * NAMES_B.length) | 0];
  }

  function sizeOf(id) {
    return SIZE_BY[id] || SIZES[1];
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

  function isOpenHour(brand, localH, dow) {
    const hours = BRAND.tiers[brand.tier].hours;
    if (dow === 1 && brand.tier === "luxury") return false;
    if (hours.length === 4) {
      return (localH >= hours[0] && localH < hours[1]) || (localH >= hours[2] && localH < hours[3]);
    }
    let a = hours[0];
    let b = hours[1];
    if (b > 24) {
      return localH >= a || localH < b - 24;
    }
    if (b === 24) return localH >= a;
    return localH >= a && localH < b;
  }

  function demandCurve(h, tier) {
    if (tier === "bar") {
      if (h >= 17 && h < 20) return 0.7;
      if (h >= 20 && h < 24) return 1.35;
      if (h >= 0 && h < 3) return 1.1;
      return 0.15;
    }
    if (tier === "luxury") {
      if (h >= 13 && h < 16) return 1.1;
      if (h >= 19 && h < 23) return 1.35;
      return 0.05;
    }
    if (h >= 12 && h < 15) return 1.25;
    if (h >= 19 && h < 22) return 1.2;
    if (h >= 10 && h < 12) return 0.7;
    if (h >= 15 && h < 19) return 0.85;
    if (h >= 22 && h < 24) return 0.45;
    return 0.12;
  }

  function buildQuote(brand, size, place, gameMs) {
    const year = yearOf(gameMs);
    const infl = WORLD.inflationFactor(place.countryCode, year);
    const ctry = WORLD.country(place.countryCode);
    const popK = place.popK || 10;
    const cityFactor = U.clamp(Math.log10(popK + 10) / 2.2, 0.55, 2.8);
    const rentIdx = (ctry.rent / 72) * cityFactor;
    const sz = sizeOf(size);
    const permitMult = place.residential ? 1.45 : place.commercial ? 0.85 : 1;
    const base = sz.cost * infl * U.clamp(0.45 + rentIdx * 0.55, 0.4, 3.6);
    const permits = base * 0.08 * permitMult;
    const works = base;
    const fitout = sz.m2 * 180 * infl * (ctry.rent / 72);
    const total = Math.round(permits + works + fitout);
    const rentMonthly = sz.m2 * 9 * infl * rentIdx;
    return {
      total,
      permits: Math.round(permits),
      works: Math.round(works),
      fitout: Math.round(fitout),
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

  function hireKit(brand, size, place, gameMs, rng) {
    const sz = sizeOf(size);
    const need = { ...sz.staff };
    if (brand.tier === "bar") {
      need.bartender = Math.max(need.bartender, size === "kiosco" ? 1 : need.bartender || 1);
    }
    if (brand.tier === "food_truck") {
      need.gerente = 0;
      need.limpieza = 0;
    }
    const quote = buildQuote(brand, size, place, gameMs);
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

  function defaultMenu(brand) {
    const menu = {};
    brand.dishes.forEach((d, i) => {
      menu[i] = { on: true, price: d.price, q: 1 };
    });
    return menu;
  }

  function staffStats(staff) {
    const by = { gerente: [], cocinero: [], camarero: [], limpieza: [], bartender: [] };
    for (const s of staff) (by[s.role] || []).push(s);
    const avg = (arr) => (arr.length ? arr.reduce((a, x) => a + x.skill, 0) / arr.length : 0);
    const wageDay = staff.reduce((a, s) => a + s.wage * 8, 0);
    return {
      avgChef: avg(by.cocinero),
      avgWait: avg(by.camarero),
      avgMgr: avg(by.gerente),
      avgClean: avg(by.limpieza),
      avgBar: avg(by.bartender),
      n: staff.length,
      by,
      wageDay,
    };
  }

  function understaffed(brand, size, staff) {
    const need = sizeOf(size).staff;
    const st = staffStats(staff);
    const miss = [];
    if ((st.by.cocinero.length || 0) < Math.max(1, Math.ceil(need.cocinero * 0.5))) miss.push("cocina");
    if (brand.tier === "bar" && (st.by.bartender.length || 0) < 1) miss.push("barra");
    if (size !== "kiosco" && brand.tier !== "food_truck" && (st.by.gerente.length || 0) < 1 && size !== "kiosco") miss.push("gerencia");
    return miss;
  }

  function qualityOf(r, brand) {
    const st = staffStats(r.staff);
    const qIng = r.ingQ == null ? 1 : r.ingQ;
    const ing = qIng === 0 ? 55 : qIng === 2 ? 92 : 74;
    const dishesOn = Object.values(r.menu || {}).filter((m) => m.on).length;
    const menuScore = U.clamp(40 + dishesOn * 6, 40, 95);
    return U.clamp(
      0.32 * st.avgChef + 0.18 * ing + 0.2 * r.cleanliness + 0.12 * menuScore + 0.1 * st.avgMgr + 0.08 * st.avgWait,
      8,
      99
    );
  }

  function avgTicket(r, brand) {
    const items = brand.dishes
      .map((d, i) => ({ d, m: r.menu[i] }))
      .filter((x) => x.m && x.m.on);
    if (!items.length) return 0;
    const sum = items.reduce((a, x) => a + x.m.price, 0);
    return sum / items.length;
  }

  function avgCogs(r, brand, priceLevel) {
    const q = r.ingQ == null ? 1 : r.ingQ;
    const qMul = q === 0 ? 0.72 : q === 2 ? 1.45 : 1;
    const items = brand.dishes.map((d, i) => ({ d, m: r.menu[i] })).filter((x) => x.m && x.m.on);
    if (!items.length) return 0;
    const sum = items.reduce((a, x) => a + x.d.cost * qMul * priceLevel, 0);
    return sum / items.length;
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

  function hourCustomers(r, brand, state, gameMs) {
    if (r.status !== "abierto") return 0;
    const miss = understaffed(brand, r.size, r.staff);
    if (miss.length) return 0;
    if (r.stock < 4) return 0;
    const loc = localHour(gameMs, r.tz);
    if (!isOpenHour(brand, loc.h, new Date(gameMs).getUTCDay())) return 0;
    const placePop = r.popK || 10;
    const year = yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const wealth = U.clamp(pl, 0.15, 3.2);
    const sz = sizeOf(r.size);
    const q = qualityOf(r, brand) / 100;
    const ticket = avgTicket(r, brand);
    const fairTicket = 8 * BRAND.tiers[brand.tier].ticket * Math.sqrt(pl);
    const priceFit = U.clamp(1.35 - Math.abs(ticket - fairTicket) / Math.max(4, fairTicket), 0.25, 1.25);
    const stars = (r.stars || 3) / 5;
    const clean = r.cleanliness / 100;
    const share = competingShare(state, r.country);
    const compFit = 1 - share * 0.55 + q * 0.25;
    const curve = demandCurve(loc.h, brand.tier);
    const pop = Math.log10(placePop + 8);
    const seatsCap = sz.seats * 0.55;
    const raw =
      pop *
      1.15 *
      wealth *
      curve *
      (0.45 + q) *
      priceFit *
      (0.55 + stars * 0.7) *
      (0.5 + clean * 0.6) *
      compFit *
      eventMod(state, r, gameMs) *
      (sz.seats / 42);
    return U.clamp(raw, 0, seatsCap);
  }

  function settleOne(state, r, fromMs, toMs) {
    if (toMs <= fromMs) return { rev: 0, cost: 0, cust: 0 };
    const brand = BRAND.get(r.brandId);
    if (!brand) return { rev: 0, cost: 0, cust: 0 };
    const year = yearOf(toMs);
    const pl = WORLD.priceLevel(r.country, year);
    const ctry = WORLD.country(r.country);

    if (r.status === "permisos" || r.status === "obras") {
      let guard = 0;
      while ((r.status === "permisos" || r.status === "obras") && toMs >= r.statusUntil && guard++ < 6) {
        if (r.status === "permisos") {
          r.status = "obras";
          r.statusUntil = r.statusUntil + sizeOf(r.size).buildH * 3600000;
          pushNews(state, toMs, `Obras iniciadas: ${r.name}`);
        } else {
          r.status = "abierto";
          r.statusUntil = 0;
          r.openedAt = toMs;
          pushNews(state, toMs, `Abre ${r.name} en ${r.city || WORLD.country(r.country).name}`);
        }
      }
      if (r.status !== "abierto") {
        r.lastSim = toMs;
        return { rev: 0, cost: 0, cust: 0 };
      }
    }

    if (r.status === "cerrado") {
      const rent = (r.rentMonthly / 30 / 24) * ((toMs - fromMs) / 3600000);
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
    const wageHour = st.wageDay / 8;
    const rentHour = r.rentMonthly / 30 / 24;
    const utilHour = sizeOf(r.size).m2 * 0.035 * pl;
    const ticket = avgTicket(r, brand);
    const cogs = avgCogs(r, brand, pl);
    const vat = ctry.vat || 0;

    const step = hours > 72 ? 3 : 1;
    for (let h = 0; h < hours; h += step) {
      const t = fromMs + h * 3600000;
      const c = hourCustomers(r, brand, state, t) * step;
      const open = c > 0.02;
      cust += c;
      const sales = c * ticket;
      const vatPaid = sales * vat;
      const cogsPay = c * cogs;
      const wages = (open ? wageHour : wageHour * 0.15) * step;
      const rent = rentHour * step;
      const util = (open ? utilHour : utilHour * 0.25) * step;
      rev += sales;
      cost += cogsPay + wages + rent + util + vatPaid;
      r.stock = U.clamp(r.stock - c * 0.15 * step, 0, 100);
      r.cleanliness = U.clamp(r.cleanliness - c * 0.07 * step + (st.avgClean > 0 ? st.by.limpieza.length * 0.35 * step : -0.08 * step), 8, 100);
    }

    if (r.autoRestock && r.stock < 35) {
      const need = 100 - r.stock;
      const restock = need * 2.2 * pl * (sizeOf(r.size).seats / 20) * (1 + (r.ingQ || 1) * 0.25);
      cost += restock;
      r.stock = 100;
    }

    const profit = rev - cost;
    r.finance.revTotal += rev;
    r.finance.costTotal += cost;
    r.finance.customersTotal += cust;
    r.finance.revToday += rev;
    r.finance.costToday += cost;
    r.finance.customersToday += cust;
    const iso = new Date(toMs).toISOString().slice(0, 10);
    if (r.finance.dayStamp !== iso) {
      r.finance.revYesterday = r.finance.revToday;
      r.finance.revToday = 0;
      r.finance.costToday = 0;
      r.finance.customersToday = 0;
      r.finance.dayStamp = iso;
    }

    const qNow = qualityOf(r, brand);
    r.quality = qNow;
    const sat = U.clamp(qNow / 20 + (r.cleanliness / 100) * 1.2 + U.rand(-0.15, 0.15), 1, 5);
    r.stars = r.stars * 0.97 + sat * 0.03;
    r.reviewCount = (r.reviewCount || 0) + (cust > 8 ? 1 : 0);
    if (cust > 12 && Math.random() < 0.08) {
      const texts = [
        "El servicio fue correcto.",
        "Volveré, el plato estrella está rico.",
        "Un poco caro para lo que es.",
        "Limpio y rápido.",
        "La cocina se nota.",
        "Ruido, pero buena carta.",
        "Mejorable la espera.",
        "Excelente, de los mejores de la zona.",
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
    let rev = 0,
      cost = 0,
      cust = 0;
    for (const r of state.restaurants) {
      const from = r.lastSim || state.gameTime;
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
    const p = Math.min(0.45, days * 0.12);
    if (Math.random() > p) return;
    const types = ["inspeccion", "feria", "inflacion", "apagon", "critico", "huelga", "clima", "boom"];
    const kind = U.pick(types);
    const r = state.restaurants.filter((x) => x.status === "abierto");
    const target = r.length ? U.pick(r) : null;
    const cc = target ? target.country : U.pick(Object.keys(WORLD.COUNTRIES));
    const start = toMs;
    const mk = (ev) => {
      state.events.push(ev);
      if (state.events.length > 40) state.events = state.events.slice(-40);
      pushNews(state, toMs, ev.news);
    };
    if (kind === "inspeccion" && target) {
      const fine = target.cleanliness < 55 ? target.rentMonthly * 0.35 : 0;
      if (fine) {
        state.cash -= fine;
        target.status = "cerrado";
        target.closedReason = "Cerrado por inspección sanitaria";
        setTimeoutStatus(target, toMs, 36);
      }
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 2 * 86400000,
        demand: 1,
        news: fine
          ? `Inspección en ${target.name}: cierre temporal y multa de ${U.formatMoney(fine)}.`
          : `Inspección en ${target.name}: todo en orden.`,
      });
    } else if (kind === "feria" && target) {
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        city: target.city,
        start,
        end: start + 5 * 86400000,
        demand: 1.75,
        news: `Feria gastronómica en ${target.city || WORLD.country(cc).name}. Demanda disparada 5 días.`,
      });
    } else if (kind === "inflacion") {
      const c = state.competitors[cc] || { strength: WORLD.competitorBase(cc) };
      c.inflBump = (c.inflBump || 0) + 0.04;
      state.competitors[cc] = c;
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 60 * 86400000,
        demand: 0.92,
        news: `Brote inflacionario en ${WORLD.country(cc).name}. Costes al alza.`,
      });
    } else if (kind === "apagon" && target) {
      target.status = "cerrado";
      target.closedReason = "Corte de luz";
      setTimeoutStatus(target, toMs, 10);
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 12 * 3600000,
        demand: 0.2,
        news: `Apagón en ${target.city || WORLD.country(cc).name}. ${target.name} sin servicio.`,
      });
    } else if (kind === "critico" && target) {
      target.stars = U.clamp(target.stars + 0.45, 1, 5);
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 14 * 86400000,
        demand: 1.25,
        news: `Un crítico visita ${target.name} (${target.stars.toFixed(1)}★). Reserva llena.`,
      });
    } else if (kind === "huelga" && target) {
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 4 * 86400000,
        demand: 0.7,
        news: `Tensión laboral en ${WORLD.country(cc).name}. Servicio más lento.`,
      });
    } else if (kind === "clima" && target) {
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        city: target.city,
        start,
        end: start + 3 * 86400000,
        demand: 0.55,
        news: `Temporal en ${target.city || WORLD.country(cc).name}. Terrazas vacías.`,
      });
    } else if (kind === "boom") {
      const c = state.competitors[cc] || { strength: WORLD.competitorBase(cc) };
      c.strength = U.clamp(c.strength - 0.04, 0.08, 0.9);
      state.competitors[cc] = c;
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        start,
        end: start + 21 * 86400000,
        demand: 1.2,
        news: `Vacío de competencia en ${WORLD.country(cc).name}. Ventana de expansión.`,
      });
    }
  }

  function setTimeoutStatus(r, now, hours) {
    r.statusUntil = now + hours * 3600000;
    r._reopen = true;
  }

  function tickReopen(state, now) {
    for (const r of state.restaurants) {
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

  function createRestaurant(state, opts) {
    const brand = BRAND.get(opts.brandId);
    const rng = U.mulberry32(U.hash32(opts.lat + "," + opts.lon + state.gameTime));
    const staff = hireKit(brand, opts.size, opts.place, state.gameTime, rng);
    const quote = opts.quote;
    const r = {
      id: U.uid("r"),
      name: `${brand.name} · ${opts.place.cityMatch || opts.place.city || opts.place.countryName}`,
      brandId: brand.id,
      size: opts.size,
      lat: opts.place.lat,
      lon: opts.place.lon,
      gh: U.geohash(opts.place.lat, opts.place.lon, 5),
      country: opts.place.countryCode,
      countryName: opts.place.countryName,
      city: opts.place.cityMatch || opts.place.city || "",
      region: opts.place.region || "",
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
      menu: defaultMenu(brand),
      stock: 100,
      autoRestock: true,
      ingQ: 1,
      finance: {
        revTotal: 0,
        costTotal: 0,
        customersTotal: 0,
        revToday: 0,
        costToday: 0,
        customersToday: 0,
        dayStamp: new Date(state.gameTime).toISOString().slice(0, 10),
      },
      closedReason: "",
      sellValue: quote.total * 0.62,
    };
    return r;
  }

  function sellValue(r, gameMs) {
    const ageY = Math.max(0.05, (gameMs - r.builtAt) / (365 * 86400000));
    const profit = r.finance.revTotal - r.finance.costTotal;
    return Math.max(8000, r.sellValue * Math.pow(0.97, ageY) + profit * 0.12 + r.stars * 4000);
  }

  global.SIM = {
    SIZES,
    ROLES,
    sizeOf,
    yearOf,
    localHour,
    isOpenHour,
    buildQuote,
    hireKit,
    defaultMenu,
    staffStats,
    understaffed,
    qualityOf,
    avgTicket,
    settleOne,
    settleAll,
    maybeEvents,
    tickReopen,
    pushNews,
    driftCompetition,
    createRestaurant,
    sellValue,
    competingShare,
    personName,
  };
})(window);
