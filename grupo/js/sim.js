/* Horizon — reglas de simulación, tamaños, personal, economía */
(function (global) {
  const SIZES = [
    { id: "kiosco", name: "Kiosco", seats: 8, m2: 22, permitH: 12, buildH: 24, cost: 22000, staff: { gerente: 1, cocinero: 1, camarero: 1, limpieza: 0, bartender: 0 } },
    { id: "bistro", name: "Barra/Bistró", seats: 16, m2: 60, permitH: 16, buildH: 32, cost: 68000, rentMult: 0.85, staff: { gerente: 1, cocinero: 1, camarero: 2, limpieza: 0, bartender: 0 } },
    { id: "local", name: "Local", seats: 42, m2: 140, permitH: 24, buildH: 48, cost: 165000, staff: { gerente: 1, cocinero: 2, camarero: 2, limpieza: 1, bartender: 0 } },
    { id: "local_grande", name: "Local grande", seats: 80, m2: 260, permitH: 40, buildH: 96, cost: 440000, rentMult: 1.15, staff: { gerente: 1, cocinero: 4, camarero: 4, limpieza: 1, bartender: 1 } },
    { id: "ghost", name: "Cocina fantasma", seats: 6, m2: 38, permitH: 8, buildH: 16, cost: 42000, rentMult: 0.55, staff: { gerente: 1, cocinero: 2, camarero: 0, limpieza: 0, bartender: 0 }, ghost: true },
    { id: "flagship", name: "Flagship", seats: 140, m2: 480, permitH: 72, buildH: 192, cost: 920000, staff: { gerente: 2, cocinero: 6, camarero: 6, limpieza: 2, bartender: 1 } },
    { id: "food_hall", name: "Food hall", seats: 168, m2: 640, permitH: 96, buildH: 240, cost: 1480000, rentMult: 1.05, staff: { gerente: 2, cocinero: 6, camarero: 3, limpieza: 3, bartender: 2 }, hall: true },
    { id: "puesto", name: "Puesto", seats: 22, m2: 32, permitH: 0, buildH: 0, cost: 0, staff: { gerente: 1, cocinero: 1, camarero: 1, limpieza: 0, bartender: 0 }, stall: true },
    { id: "estadio", name: "Estadio", seats: 480, m2: 2800, permitH: 168, buildH: 480, cost: 4800000, staff: { gerente: 4, cocinero: 16, camarero: 20, limpieza: 6, bartender: 4 } },
    { id: "kiosco_playa", name: "Kiosco de playa", seats: 6, m2: 14, permitH: 6, buildH: 10, cost: 20000, rentMult: 0.9, staff: { gerente: 1, cocinero: 1, camarero: 1, limpieza: 0, bartender: 0 }, poiTag: "playa" },
    { id: "kiosco_estacion", name: "Kiosco de estación", seats: 10, m2: 18, permitH: 10, buildH: 16, cost: 25000, rentMult: 1.1, staff: { gerente: 1, cocinero: 1, camarero: 1, limpieza: 0, bartender: 0 }, poiTag: "metro" },
    { id: "local_mall", name: "Local de centro comercial", seats: 36, m2: 110, permitH: 30, buildH: 60, cost: 150000, rentMult: 1.25, staff: { gerente: 1, cocinero: 2, camarero: 2, limpieza: 1, bartender: 0 }, poiTag: "comercial" },
    { id: "drive_thru", name: "Drive-thru", seats: 24, m2: 90, permitH: 36, buildH: 80, cost: 180000, rentMult: 0.85, staff: { gerente: 1, cocinero: 2, camarero: 1, limpieza: 1, bartender: 0 }, poiTag: "poligono" },
    { id: "rooftop", name: "Rooftop", seats: 90, m2: 230, permitH: 60, buildH: 150, cost: 500000, rentMult: 1.6, staff: { gerente: 2, cocinero: 4, camarero: 5, limpieza: 1, bartender: 2 }, poiTag: "rooftop" },
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

  function fairTicket(brand, pl) {
    /* El género (avgCogs) y el alquiler/sueldos ya escalan de forma ~lineal
       con el nivel de precios del país; si el ticket "justo" solo crecía con
       su raíz cuadrada, el margen se estrechaba mucho en los países con
       sueldos altos en proporción a su PIB per cápita (Alemania, Reino
       Unido, Japón…) aunque no fueran los de "pl" más extremo. Con una
       potencia algo mayor (0.8) el precio sube más al ritmo de esos costes
       sin llegar a la escala lineal (que dispararía los precios en los
       países más ricos más de la cuenta). */
    return 9 * BRAND.tiers[brand.tier].ticket * Math.pow(Math.max(0.2, pl), 0.8);
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
    const rentMonthly = sz.m2 * 9 * infl * rentIdx * (sz.rentMult != null ? sz.rentMult : 1);
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
    need.gerente = Math.max(1, need.gerente || 0);
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
    if ((st.by.gerente.length || 0) < 1) miss.push("gerencia");
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
    const dow = new Date(gameMs).getUTCDay();
    if (!SABOR.isOpenAt(r, brand, loc.h, dow)) return 0;
    if (brand.dishes.some((d) => d.alc) && avgTicket(r, brand) > 0) {
      /* alcohol hours: if only alc dishes on and can't serve, zero */
    }
    const placePop = r.popK || 10;
    const year = yearOf(gameMs);
    const pl = WORLD.priceLevel(r.country, year);
    const wealth = U.clamp(pl, 0.2, 3.2);
    const sz = sizeOf(r.size);
    const q = qualityOf(r, brand) / 100;
    const ticket = avgTicket(r, brand);
    /* Mismo suelo que el precio "justo" que fija el gerente (SABOR.runManager):
       si no coincidieran, un local con precios bien puestos parecería "caro" y
       perdía clientes que no debía perder, sobre todo en países pobres. */
    const fairTicket = SIM.fairTicket(brand, pl);
    const priceFit = U.clamp(1.35 - Math.abs(ticket - fairTicket) / Math.max(4, fairTicket), 0.25, 1.25);
    const stars = (r.stars || 3) / 5;
    const clean = r.cleanliness / 100;
    const share = competingShare(state, r.country);
    const compFit = 1 - share * 0.55 + q * 0.25;
    const curve = demandCurve(loc.h, brand.tier);
    const pop = Math.log10(placePop + 8);
    const cal = SABOR.calendarMod(r.country, brand, r.poi || "urbano", gameMs);
    const seatsCap = sz.seats * 0.55 * (r.delivery || sz.ghost ? 1.35 : 1);
    const alcPen = brand.tier === "bar" && SABOR.alcoholPolicy(r.country).mode === "dry" ? 0.22 : 1;
    const street =
      (r.metro ? 1.22 : 1) *
      (r.pedestrian ? (brand.tier === "fast_food" ? 1.08 : 1.18) : 1);
    const ghostMul = sz.ghost ? 0.92 : 1;
    const walkCurve = sz.ghost ? 0.22 + (r.delivery ? 1.05 : 0.4) : curve;
    const raw =
      pop *
      4.0 *
      wealth *
      walkCurve *
      (0.45 + q) *
      priceFit *
      (0.55 + stars * 0.7) *
      (0.5 + clean * 0.6) *
      compFit *
      eventMod(state, r, gameMs) *
      SABOR.tasteFit(brand, r.country) *
      SABOR.poiDemand(r.poi || "urbano", brand) *
      cal.demand *
      (r.delivery || sz.ghost ? 1.16 : 1) *
      (r.terrace && !sz.ghost ? 1.06 * cal.terrace : 1) *
      alcPen *
      street *
      ghostMul *
      /* Formatos pequeños (kiosco, food truck…) viven de un público de paso muy
         rápido: no tiene sentido que su tráfico caiga en línea recta con el
         aforo. Se usa una potencia intermedia para suavizar el castigo a lo
         pequeño sin des-premiar en exceso a los formatos grandes (que además
         cargan con plantillas mucho más caras, proporcionales al aforo). */
      Math.pow(sz.seats / 42, 0.68);
    return U.clamp(raw, 0, seatsCap);
  }

  function settleOne(state, r, fromMs, toMs) {
    if (toMs <= fromMs) return { rev: 0, cost: 0, cust: 0 };
    const brand = BRAND.get(r.brandId);
    if (!brand) return { rev: 0, cost: 0, cust: 0 };
    if (!r.hours) r.hours = SABOR.defaultHours(brand);
    if (r.hoursCustom == null) r.hoursCustom = false;
    if (r.managerAI == null) r.managerAI = true;
    if (!r.poi) r.poi = "urbano";
    if (!r.finance.months) r.finance.months = {};
    SABOR.ensureBooks(state);
    brand.dishes.forEach((d, i) => {
      if (!r.menu[i]) r.menu[i] = { on: true, price: d.price };
    });
    if (r.size === "food_hall") ensureHallStalls(state, r);
    if (r.hallParentId) {
      const parent = state.restaurants.find((x) => x.id === r.hallParentId);
      if (parent) {
        if (parent.status !== "abierto") {
          r.status = parent.status;
          r.statusUntil = parent.statusUntil;
          r.lastSim = toMs;
          return { rev: 0, cost: 0, cust: 0 };
        }
        if (r.status !== "abierto") {
          r.status = "abierto";
          r.statusUntil = 0;
          r.openedAt = parent.openedAt || toMs;
          SABOR.runManager(state, r, brand, toMs);
        }
      }
    }

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
          r.statusUntil = r.statusUntil + sizeOf(r.size).buildH * 3600000;
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
    const utilHour = sizeOf(r.size).m2 * 0.035 * pl;
    const ticket = avgTicket(r, brand);
    const cogs = avgCogs(r, brand, pl);
    const vat = ctry.vat || 0;

    /* wageHour asume que TODA la plantilla trabaja a la vez cada hora abierta,
       pero en la realidad los turnos se escalonan (descansos, entradas/salidas
       por franjas, limpieza fuera de las horas punta…). Cuantos más empleados
       tiene un local, más margen hay para organizar turnos eficientes, así que
       la cobertura media baja un poco con la plantilla (un kiosco de 3
       personas casi siempre las necesita a las tres a la vez; un food hall de
       16 puede escalonarlos mucho más). */
    const shiftCoverage = U.clamp(0.7 - (st.n - 3) * 0.013, 0.55, 0.7);
    const step = hours > 72 ? 3 : 1;
    let wagesSum = 0;
    for (let h = 0; h < hours; h += step) {
      const t = fromMs + h * 3600000;
      const c = hourCustomers(r, brand, state, t) * step;
      const open = c > 0.02;
      cust += c;
      const sales = c * ticket;
      const vatPaid = sales * vat;
      const cogsPay = c * cogs;
      const wages = (open ? wageHour * shiftCoverage : wageHour * 0.08) * step;
      const rent = rentHour * step;
      const util = (open ? utilHour : utilHour * 0.25) * step;
      rev += sales;
      cost += cogsPay + wages + rent + util + vatPaid;
      wagesSum += wages;
      r.stock = U.clamp(r.stock - c * 0.15 * step, 0, 100);
      r.cleanliness = U.clamp(r.cleanliness - c * 0.07 * step + (st.avgClean > 0 ? st.by.limpieza.length * 0.35 * step : -0.08 * step), 8, 100);
    }

    if (r.autoRestock && r.stock < 35) {
      const need = 100 - r.stock;
      const restock = need * 2.2 * pl * (sizeOf(r.size).seats / 20) * (1 + (r.ingQ || 1) * 0.25);
      cost += restock;
      r.stock = 100;
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
    /* _vp es un Set volátil que pinta MAP.refresh() para saber qué locales
       están en pantalla; si una partida se exporta a JSON y se vuelve a
       importar, un Set se serializa como "{}" (no como Set), así que aquí
       no puede asumirse que siga siendo uno. */
    const vpRaw = state._vp;
    const vp = vpRaw && typeof vpRaw.has === "function" ? vpRaw : null;
    const n = state.restaurants.length;
    const openId = state._openId;
    let rev = 0,
      cost = 0,
      cust = 0;
    for (let i = 0; i < n; i++) {
      const r = state.restaurants[i];
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
    const p = Math.min(0.45, days * 0.12);
    if (Math.random() > p) return;
    const types = ["inspeccion", "feria", "inflacion", "apagon", "critico", "huelga", "clima", "boom", "metro", "peatonal"];
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
        news: `Brote inflacionario en ${WORLD.country(cc).name}. Alquileres, salarios y género suben.`,
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
    } else if (kind === "metro" && target) {
      const mates = state.restaurants.filter((x) => x.city && x.city === target.city);
      mates.forEach((x) => {
        x.metro = true;
      });
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        city: target.city,
        start,
        end: start + 365 * 86400000,
        demand: 1.12,
        news: `Nueva estación de metro cerca de ${target.city || WORLD.country(cc).name}. La demanda del barrio sube.`,
      });
    } else if (kind === "peatonal" && target) {
      const mates = state.restaurants.filter((x) => x.city && x.city === target.city);
      mates.forEach((x) => {
        x.pedestrian = true;
      });
      mk({
        id: U.uid("ev"),
        kind,
        cc,
        city: target.city,
        start,
        end: start + 400 * 86400000,
        demand: 1.1,
        news: `Peatonalizan el centro de ${target.city || WORLD.country(cc).name}. Más paseo, menos coche.`,
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
    const rng = U.mulberry32(
      U.hash32(
        [
          opts.place.lat,
          opts.place.lon,
          opts.brandId,
          opts.size,
          state.gameTime,
          opts.seedSalt || "",
          (state.restaurants || []).length,
        ].join("|")
      )
    );
    const staff = hireKit(brand, opts.size, opts.place, state.gameTime, rng);
    const quote = opts.quote;
    const r = {
      id: U.uid("r"),
      name: `${brand.name} · ${opts.place.city || opts.place.municipality || opts.place.countryName}`,
      brandId: brand.id,
      size: opts.size,
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
      menu: defaultMenu(brand),
      stock: 100,
      autoRestock: true,
      ingQ: 1,
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
      managerNote: "El gerente de este local llevará carta, precios, horario, género y plantilla según su habilidad.",
      lastManagerRun: 0,
      hours: SABOR.defaultHours(brand),
      hoursCustom: false,
      poi: opts.place.poi || "urbano",
      terrace: false,
      alcoholLicense: SABOR.alcoholPolicy(opts.place.countryCode).mode === "free",
      metro: !!opts.place.metro,
      pedestrian: !!opts.place.pedestrian,
      owned: false,
      propertyValue: Math.round(quote.rentMonthly * 108),
      hallBrands: opts.hallBrands || [],
      delivery: sizeOf(opts.size).ghost ? true : false,
      photo: U.safePhoto(opts.photo) || "",
      description: String(opts.description || "").slice(0, 800),
      hallParentId: opts.hallParentId || null,
      hallStallIds: opts.hallStallIds || [],
    };
    return r;
  }

  function placeFromRestaurant(r) {
    return {
      countryCode: r.country,
      countryName: r.countryName,
      lat: r.lat,
      lon: r.lon,
      city: r.city,
      municipality: r.municipality,
      settlementKind: r.settlementKind,
      region: r.region,
      display: r.address,
      street: r.street,
      osmKey: r.osmKey,
      osmValue: r.osmValue,
      tz: r.tz,
      popK: r.popK,
      poi: r.poi,
      metro: r.metro,
      pedestrian: r.pedestrian,
    };
  }

  function spawnHallStalls(state, hall, brandIds) {
    if (!hall || hall.size !== "food_hall") return [];
    hall.hallStallIds = hall.hallStallIds || [];
    const have = new Set(
      state.restaurants.filter((x) => x.hallParentId === hall.id).map((x) => x.brandId)
    );
    const ids = (brandIds || hall.hallBrands || []).filter((id) => id && id !== hall.brandId && !have.has(id)).slice(0, 3);
    const born = [];
    const place = placeFromRestaurant(hall);
    ids.forEach((bid, i) => {
      const brand = BRAND.get(bid);
      if (!brand) return;
      /* El puesto no paga entrada (cost:0, sin obras/permisos: se monta con el
         food hall), pero SÍ paga un alquiler de local pequeño dentro del
         centro: si no, todo el peso del alquiler del edificio entero recaía
         solo sobre el local ancla, que además solo se queda con su propia
         parte de la facturación del conjunto. */
      const puestoQuote = buildQuote(brand, "puesto", place, state.gameTime);
      const quote = {
        total: 0,
        permits: 0,
        works: 0,
        fitout: 0,
        rentMonthly: puestoQuote.rentMonthly * 0.6,
        permitH: 0,
        buildH: 0,
      };
      const stall = createRestaurant(state, {
        brandId: bid,
        size: "puesto",
        place,
        quote,
        seedSalt: `${hall.id}:${bid}:${i}`,
      });
      stall.hallParentId = hall.id;
      stall.status = hall.status;
      stall.statusUntil = hall.statusUntil;
      stall.owned = false;
      stall.name = `${brand.name} · puesto · ${hall.city || hall.countryName}`;
      stall.managerNote = "Este puesto lo gestiona su propio gerente, según su habilidad.";
      stall.photo = "";
      stall.description = "Puesto del food hall " + (hall.name || "");
      stall.openInfl = hall.openInfl;
      stall.kind = "restaurant";
      state.restaurants.push(stall);
      hall.hallStallIds.push(stall.id);
      hall.hallBrands = hall.hallBrands || [];
      if (!hall.hallBrands.includes(bid)) hall.hallBrands.push(bid);
      born.push(stall);
    });
    return born;
  }

  function ensureHallStalls(state, hall) {
    if (!hall || hall.size !== "food_hall") return;
    const kids = state.restaurants.filter((x) => x.hallParentId === hall.id);
    hall.hallStallIds = kids.map((x) => x.id);
    if (kids.length) return;
    const guests = (hall.hallBrands || []).filter((id) => id && id !== hall.brandId).slice(0, 3);
    if (!guests.length) {
      const extras = BRAND.list.filter((b) => b.id !== hall.brandId).slice(0, 2).map((b) => b.id);
      spawnHallStalls(state, hall, extras);
    } else {
      spawnHallStalls(state, hall, guests);
    }
  }

  function hallStalls(state, hallId) {
    return (state.restaurants || []).filter((x) => x.hallParentId === hallId);
  }

  function hireRole(r, role, gameMs, mgrSkill) {
    const year = yearOf(gameMs);
    const ctry = WORLD.country(r.country);
    const infl = WORLD.inflationFactor(r.country, year);
    const wageH = ctry.wage * infl;
    const skill = Math.round(U.clamp(30 + (mgrSkill || 50) * 0.32 + Math.random() * 22, 28, 96));
    r.staff = r.staff || [];
    r.staff.push({
      id: U.uid("st"),
      role,
      name: personName(Math.random),
      skill,
      wage: +(wageH * ROLES[role].wage * (0.7 + skill / 200)).toFixed(2),
    });
  }

  function managerSkill(r) {
    const mgrs = (r.staff || []).filter((s) => s.role === "gerente");
    if (!mgrs.length) return 0;
    return Math.max(...mgrs.map((s) => +s.skill || 0));
  }

  function ensureLoans(state) {
    if (!state.loans) state.loans = [];
    return state.loans;
  }

  function debtTotal(state) {
    return ensureLoans(state).reduce((a, l) => a + (l.remaining || 0), 0);
  }

  function creditLimit(state) {
    /* Horizon Group: la caja, los préstamos y el crédito bancario son comunes a
       Horizon Restaurant Group y Horizon Hotels, así que el tamaño del grupo (para
       calcular cuánto le presta el banco) cuenta locales Y hoteles juntos. */
    const n = nRestaurants(state);
    const rev =
      (state.restaurants || []).reduce((a, r) => a + (r.finance && r.finance.revTotal ? r.finance.revTotal : 0), 0) +
      (state.hotels || []).reduce((a, r) => a + (r.finance && r.finance.revTotal ? r.finance.revTotal : 0), 0);
    const base = 500000 + n * 140000 + Math.min(rev * 0.12, 12000000) + Math.max(0, state.cash || 0) * 0.2;
    return Math.max(0, Math.round(base - debtTotal(state)));
  }

  function takeLoan(state, amount, months) {
    amount = Math.round(+amount || 0);
    months = +months || 24;
    if (![12, 24, 36, 48].includes(months)) months = 24;
    if (amount < 25000) return { ok: false, err: "El banco pide un mínimo de 25.000 €." };
    const room = creditLimit(state);
    if (amount > room) return { ok: false, err: "Crédito disponible: " + Math.round(room).toLocaleString("es-ES") + " €." };
    const rate = (state.cash || 0) < 0 ? 0.145 : nRestaurants(state) >= 10 ? 0.072 : 0.096;
    const i = rate / 12;
    const monthly = Math.round((amount * i) / (1 - Math.pow(1 + i, -months)));
    const loan = {
      id: U.uid("ln"),
      principal: amount,
      remaining: amount,
      rate,
      months,
      leftMonths: months,
      monthly,
      started: state.gameTime,
      paid: 0,
    };
    ensureLoans(state).push(loan);
    state.cash += amount;
    pushNews(state, state.gameTime, `Préstamo bancario de ${Math.round(amount).toLocaleString("es-ES")} € a ${months} meses (${(rate * 100).toFixed(1)}% TAE).`);
    return { ok: true, loan };
  }

  function nRestaurants(state) {
    return (state.restaurants || []).length + (state.hotels || []).length;
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
        const interest = ln.remaining * ln.rate / 12;
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

  function sellValue(r, gameMs) {
    const ageY = Math.max(0.05, (gameMs - r.builtAt) / (365 * 86400000));
    const profit = r.finance.revTotal - r.finance.costTotal;
    const biz = Math.max(8000, r.sellValue * Math.pow(0.97, ageY) + profit * 0.12 + r.stars * 4000);
    return biz + (r.owned ? r.propertyValue || 0 : 0);
  }

  global.SIM = {
    SIZES,
    ROLES,
    sizeOf,
    yearOf,
    localHour,
    isOpenHour,
    fairTicket,
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
    spawnHallStalls,
    ensureHallStalls,
    hallStalls,
    sellValue,
    competingShare,
    personName,
    hireRole,
    managerSkill,
    ensureLoans,
    debtTotal,
    creditLimit,
    takeLoan,
    tickLoans,
    payoffLoan,
    cheatCash,
  };
})(window);
