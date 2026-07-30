/**
 * Generador de líneas por corredor + cuotas + ramales locales.
 */

function pick(arr, i) {
  return arr[i % arr.length];
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function frequencyFor(tipoId, distanceKm) {
  const base = {
    av: 30,
    ld: 60,
    px: 45,
    ir: 60,
    re: 30,
    rb: 60,
    s: 10,
    u: 5,
    t: 8,
    tt: 15,
    ae: 15,
    n: 1440,
    tur: 120,
    or: 12,
    mc: 15,
    rl: 90,
  }[tipoId] ?? 60;

  if (tipoId === "s" || tipoId === "u" || tipoId === "t" || tipoId === "or") return base;
  if (distanceKm > 400) return base + 30;
  if (distanceKm < 40) return Math.max(10, base - 15);
  return base;
}

function maxDistanceFor(tipoId) {
  return (
    {
      av: 900,
      ld: 800,
      px: 700,
      n: 1000,
      ir: 450,
      re: 280,
      rb: 160,
      rl: 80,
      s: 90,
      or: 70,
      mc: 80,
      ae: 60,
      u: 35,
      t: 25,
      tt: 60,
      tur: 350,
    }[tipoId] ?? 300
  );
}

function minDistanceFor(tipoId) {
  return (
    {
      av: 80,
      ld: 60,
      px: 70,
      n: 120,
      ir: 40,
      re: 15,
      rb: 5,
      rl: 3,
      s: 3,
      or: 8,
      mc: 8,
      ae: 8,
      u: 1,
      t: 1,
      tt: 5,
      tur: 20,
    }[tipoId] ?? 5
  );
}

function resolveHubs(corridor, hubById) {
  return corridor.hubs.map((id) => hubById.get(id)).filter(Boolean);
}

function operatorsForRoute(operators, a, b, tipoId) {
  return operators.filter((op) => {
    if (!op.servicios.includes(tipoId)) return false;
    const coversA = op.lands.includes(a.land);
    const coversB = op.lands.includes(b.land);
    // nacionales / multi-land: al menos uno; regionales: preferible ambos o uno
    if (op.tipo === "nacional" || op.tipo === "internacional" || op.tipo === "especializado") {
      return coversA || coversB || op.lands.length >= 10;
    }
    if (op.tipo === "urbano" || op.tipo === "metropolitano") {
      return coversA && coversB;
    }
    return coversA || coversB;
  });
}

function intermediateVia(pathHubs, aIdx, bIdx, maxVia = 3) {
  if (Math.abs(bIdx - aIdx) <= 1) return [];
  const start = Math.min(aIdx, bIdx);
  const end = Math.max(aIdx, bIdx);
  const mid = pathHubs.slice(start + 1, end);
  if (mid.length <= maxVia) return mid.map((h) => h.id);
  // muestrear uniformemente
  const out = [];
  for (let i = 1; i <= maxVia; i++) {
    const idx = Math.round((i * (mid.length + 1)) / (maxVia + 1)) - 1;
    if (mid[idx]) out.push(mid[idx].id);
  }
  return [...new Set(out)];
}

function nearestHubs(hub, hubs, limit, maxKm) {
  return hubs
    .filter((h) => h.id !== hub.id)
    .map((h) => ({ h, d: haversineKm(hub, h) }))
    .filter((x) => x.d <= maxKm)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.h);
}

function allocateQuotas(count, cuotas, tipoIds) {
  const entries = tipoIds.map((id) => [id, cuotas[id] ?? 0]);
  const sum = entries.reduce((s, [, w]) => s + w, 0) || 1;
  const raw = entries.map(([id, w]) => [id, Math.floor((count * w) / sum)]);
  let assigned = raw.reduce((s, [, n]) => s + n, 0);
  let i = 0;
  while (assigned < count) {
    raw[i % raw.length][1] += 1;
    assigned++;
    i++;
  }
  return Object.fromEntries(raw);
}

function makeCodigo(tipo, num, areaCode) {
  if (tipo.prefijo === "S" || tipo.prefijo === "U" || tipo.prefijo === "T") {
    return {
      codigo: `${tipo.prefijo}${((num - 1) % 99) + 1}`,
      codigo_interno: `${tipo.prefijo}-${areaCode}-${num}`,
    };
  }
  return {
    codigo: `${tipo.prefijo}${num}`,
    codigo_interno: `${tipo.prefijo}-${areaCode}-${num}`,
  };
}

function shortName(nombre) {
  return nombre
    .replace(/ Central$/, "")
    .replace(/ Aeropuerto.*$/, " Aeropuerto")
    .replace(/ \(ficticio\)/gi, "");
}

/**
 * @param {object} opts
 */
export function generateLines({
  hubs,
  operators,
  tipos,
  corridors = [],
  cuotas = {},
  count = 1000,
  seed = 1,
}) {
  const hubById = new Map(hubs.map((h) => [h.id, h]));
  const tipoById = Object.fromEntries(tipos.map((t) => [t.id, t]));
  const tipoIds = tipos.map((t) => t.id);
  const quotas = allocateQuotas(count, cuotas, tipoIds);
  const counters = Object.fromEntries(tipos.map((t) => [t.id, t.rango_numeros[0]]));

  const lines = [];
  const usedKeys = new Set();

  const corridorCache = corridors
    .map((c) => ({ ...c, path: resolveHubs(c, hubById) }))
    .filter((c) => c.path.length >= 2);

  const hubsByLand = new Map();
  for (const h of hubs) {
    if (!hubsByLand.has(h.land)) hubsByLand.set(h.land, []);
    hubsByLand.get(h.land).push(h);
  }

  function tryPush({ a, b, via, tipoId, corridor, origenOverride, i, pattern = "base" }) {
    const tipo = tipoById[tipoId];
    if (!tipo || a.id === b.id) return false;
    const dist = haversineKm(a, b);
    if (dist < minDistanceFor(tipoId) || dist > maxDistanceFor(tipoId)) return false;

    let candidates = operatorsForRoute(operators, a, b, tipoId);
    if (!candidates.length) {
      candidates = operators.filter((op) => op.servicios.includes(tipoId));
    }
    if (!candidates.length) return false;

    // Prefer dominante en mismos lands; si no, competitiva
    candidates = [...candidates].sort((x, y) => {
      const score = (op) =>
        (op.lands.includes(a.land) ? 2 : 0) +
        (op.lands.includes(b.land) ? 2 : 0) +
        (op.competencia === "dominante" ? 1 : 0) +
        (op.servicios.includes(tipoId) ? 2 : 0);
      return score(y) - score(x);
    });
    // Rotar operador para permitir competencia en el mismo OD
    const opPool = candidates.slice(0, Math.min(8, candidates.length));
    const op = pick(opPool, seed + i * 3 + (pattern === "retorno" ? 1 : 0) + (pattern === "directo" ? 2 : 0));

    const key = `${tipoId}|${op.id}|${a.id}|${b.id}|${pattern}`;
    if (usedKeys.has(key)) return false;
    usedKeys.add(key);

    const num = counters[tipoId]++;
    const areaCode = a.metro_area || a.land;
    const { codigo, codigo_interno } = makeCodigo(tipo, num, areaCode);

    let origen_datos =
      origenOverride ||
      corridor?.origen_datos ||
      (a.origen_datos === "ficticia" || b.origen_datos === "ficticia"
        ? "hibrida"
        : a.origen_datos === "real" && b.origen_datos === "real"
          ? i % 4 === 0
            ? "real"
            : "ficticia"
          : "hibrida");

    const material = (op.flota || [])
      .filter((f) => f.papel === "principal")
      .slice(0, 3)
      .map((f) => f.unidad_id);
    if (!material.length && op.flota?.length) material.push(op.flota[0].unidad_id);

    const patternLabel =
      pattern === "retorno" ? " (retorno)" : pattern === "directo" ? " directo" : pattern === "parador" ? " parador" : "";

    lines.push({
      id: `line-${String(lines.length + 1).padStart(5, "0")}`,
      codigo,
      codigo_interno,
      nombre: `${tipo.nombre} ${shortName(a.nombre)}–${shortName(b.nombre)}${patternLabel}`,
      tipo_id: tipoId,
      prefijo: tipo.prefijo,
      operador_id: op.id,
      operador_nombre: op.nombre,
      color: op.color,
      origen: a.id,
      destino: b.id,
      via: pattern === "directo" ? [] : via || [],
      distancia_km: Math.round(dist),
      frecuencia_min: frequencyFor(tipoId, dist) + (pattern === "parador" ? 10 : 0),
      material,
      origen_datos,
      patron: pattern,
      lands: [...new Set([a.land, b.land, ...(via || []).map((id) => hubById.get(id)?.land).filter(Boolean)])],
      corredor_id: corridor?.id || null,
    });
    return true;
  }

  // 1) Líneas a lo largo de corredores (pares y saltos)
  let i = 0;
  for (const [tipoId, quota] of Object.entries(quotas)) {
    let made = 0;
    const preferCors = corridorCache.filter((c) => c.tipo_preferido.includes(tipoId));
    const cors = preferCors.length ? preferCors : corridorCache;

    // Pases sobre corredores (ida, retorno, directo, parador)
    const patterns = ["base", "retorno", "directo", "parador"];
    for (let pass = 0; pass < 10 && made < quota; pass++) {
      const pattern = patterns[pass % patterns.length];
      for (const c of cors) {
        if (made >= quota) break;
        const path = c.path;
        for (let aIdx = 0; aIdx < path.length; aIdx++) {
          for (let jump = 1; jump <= 4; jump++) {
            const bIdx = aIdx + jump;
            if (bIdx >= path.length) break;
            const from = pattern === "retorno" ? path[bIdx] : path[aIdx];
            const to = pattern === "retorno" ? path[aIdx] : path[bIdx];
            const ok = tryPush({
              a: from,
              b: to,
              via: intermediateVia(path, aIdx, bIdx),
              tipoId,
              corridor: c,
              i: i++,
              pattern,
            });
            if (ok) made++;
            if (made >= quota) break;
          }
          if (made >= quota) break;
        }
      }
    }

    // 2) Ramales locales / metropolitanos por proximidad
    const localPool = hubs.filter((h) => {
      if (["u", "t"].includes(tipoId)) return (h.roles || []).some((r) => ["u", "t", "s"].includes(r)) || h.tier >= 4;
      if (["s", "or", "mc", "ae"].includes(tipoId)) return h.tier <= 4;
      if (tipoId === "rl") return h.tier >= 3;
      return true;
    });

    let guard = 0;
    while (made < quota && guard < quota * 40) {
      guard++;
      const a = pick(localPool, seed + i * 7 + guard);
      const maxD = maxDistanceFor(tipoId);
      const neighbors = nearestHubs(a, localPool, 20, maxD);
      if (!neighbors.length) continue;
      const b = pick(neighbors, seed + i * 13 + guard);
      const sameLandBias = a.land === b.land || ["av", "ld", "px", "n", "ir"].includes(tipoId);
      if (!sameLandBias && !["av", "ld", "px", "n", "ir", "tur"].includes(tipoId)) continue;
      const pattern = patterns[guard % patterns.length];

      const ok = tryPush({
        a: pattern === "retorno" ? b : a,
        b: pattern === "retorno" ? a : b,
        via: [],
        tipoId,
        corridor: null,
        i: i++,
        pattern,
      });
      if (ok) made++;
    }

    // 3) Relleno inter-land / exhaustivo si aún falta
    guard = 0;
    while (made < quota && guard < quota * 30) {
      guard++;
      const a = pick(hubs, seed + i * 17 + guard);
      const b = pick(hubs, seed + i * 19 + guard * 3);
      const pattern = patterns[guard % patterns.length];
      const ok = tryPush({
        a: pattern === "retorno" ? b : a,
        b: pattern === "retorno" ? a : b,
        via: [],
        tipoId,
        corridor: null,
        i: i++,
        pattern,
      });
      if (ok) made++;
    }
  }

  // Re-id secuencial limpio
  lines.forEach((l, idx) => {
    l.id = `line-${String(idx + 1).padStart(5, "0")}`;
  });

  return lines.slice(0, count);
}

export function summarizeLines(lines) {
  const byTipo = {};
  const byOp = {};
  const byOrigen = {};
  const byCorridor = {};
  let dist = 0;
  for (const l of lines) {
    byTipo[l.tipo_id] = (byTipo[l.tipo_id] || 0) + 1;
    byOp[l.operador_id] = (byOp[l.operador_id] || 0) + 1;
    byOrigen[l.origen_datos] = (byOrigen[l.origen_datos] || 0) + 1;
    const c = l.corredor_id || "sin_corredor";
    byCorridor[c] = (byCorridor[c] || 0) + 1;
    dist += l.distancia_km || 0;
  }
  return {
    total: lines.length,
    distancia_total_km: dist,
    por_tipo: byTipo,
    por_origen_datos: byOrigen,
    operadores_distintos: Object.keys(byOp).length,
    corredores_distintos: Object.keys(byCorridor).filter((k) => k !== "sin_corredor").length,
    top_corredores: Object.entries(byCorridor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, n]) => ({ id, lineas: n })),
  };
}

export { haversineKm, allocateQuotas, clamp };
