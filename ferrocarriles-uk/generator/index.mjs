/**
 * Generador UK: corredores + cuotas + paradas completas.
 */

function pick(arr, i) {
  return arr[i % arr.length];
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
    av: 30, ld: 60, px: 45, ir: 60, re: 30, rb: 60, s: 10, u: 5, t: 8,
    tt: 15, ae: 15, n: 1440, tur: 120, or: 12, mc: 15, rl: 90,
  }[tipoId] ?? 60;
  if (["s", "u", "t", "or"].includes(tipoId)) return base;
  if (distanceKm > 400) return base + 30;
  if (distanceKm < 40) return Math.max(10, base - 15);
  return base;
}

function maxDistanceFor(tipoId) {
  return ({
    av: 900, ld: 800, px: 700, n: 1000, ir: 450, re: 280, rb: 160, rl: 90,
    s: 90, or: 80, mc: 80, ae: 70, u: 40, t: 30, tt: 60, tur: 400,
  })[tipoId] ?? 300;
}

function minDistanceFor(tipoId) {
  return ({
    av: 60, ld: 40, px: 50, n: 100, ir: 30, re: 10, rb: 4, rl: 2,
    s: 2, or: 6, mc: 6, ae: 6, u: 1, t: 1, tt: 4, tur: 15,
  })[tipoId] ?? 5;
}

function resolveHubs(corridor, hubById) {
  return corridor.hubs.map((id) => hubById.get(id)).filter(Boolean);
}

function operatorsForRoute(operators, a, b, tipoId) {
  return operators.filter((op) => {
    if (!op.servicios.includes(tipoId)) return false;
    const coversA = op.lands.includes(a.land);
    const coversB = op.lands.includes(b.land);
    if (["nacional", "internacional", "especializado"].includes(op.tipo)) {
      return coversA || coversB || op.lands.length >= 8;
    }
    if (["urbano", "metropolitano"].includes(op.tipo)) return coversA && coversB;
    return coversA || coversB;
  });
}

function pathSlice(path, aIdx, bIdx) {
  const start = Math.min(aIdx, bIdx);
  const end = Math.max(aIdx, bIdx);
  const slice = path.slice(start, end + 1);
  return aIdx > bIdx ? [...slice].reverse() : slice;
}

/** Cadena de paradas por proximidad entre dos hubs (greedy). */
function nearestPath(a, b, hubs, maxStops = 12) {
  const maxD = haversineKm(a, b) * 1.35 + 40;
  const remaining = new Set(hubs.map((h) => h.id));
  remaining.delete(a.id);
  const chain = [a];
  let current = a;
  while (chain.length < maxStops && current.id !== b.id) {
    remaining.delete(current.id);
    let best = null;
    let bestScore = Infinity;
    for (const id of remaining) {
      const h = hubs.find((x) => x.id === id);
      if (!h) continue;
      const dCur = haversineKm(current, h);
      const dEnd = haversineKm(h, b);
      if (dCur + dEnd > maxD) continue;
      const score = dCur + dEnd * 0.85;
      if (score < bestScore) {
        bestScore = score;
        best = h;
      }
    }
    if (!best) break;
    chain.push(best);
    current = best;
    if (best.id === b.id) break;
    // si ya estamos cerca del destino, cerrar
    if (haversineKm(current, b) < 25 && chain.length > 1) {
      if (chain[chain.length - 1].id !== b.id) chain.push(b);
      break;
    }
  }
  if (chain[chain.length - 1].id !== b.id) chain.push(b);
  // dedupe
  const seen = new Set();
  return chain.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
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
  if (["S", "U", "T"].includes(tipo.prefijo)) {
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
  return nombre.replace(/^Londres /, "").replace(/ Central$/, "").replace(/ Parkway$/, "");
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
  const patterns = ["parador", "base", "retorno", "parador", "base", "directo"];

  const corridorCache = corridors
    .map((c) => ({ ...c, path: resolveHubs(c, hubById) }))
    .filter((c) => c.path.length >= 2);

  let i = 0;

  function tryPush({ stops, tipoId, corridor, origenOverride, i, pattern = "base" }) {
    if (!stops || stops.length < 2) return false;
    const a = stops[0];
    const b = stops[stops.length - 1];
    const tipo = tipoById[tipoId];
    if (!tipo || a.id === b.id) return false;
    const dist = haversineKm(a, b);
    if (dist < minDistanceFor(tipoId) || dist > maxDistanceFor(tipoId)) return false;

    let candidates = operatorsForRoute(operators, a, b, tipoId);
    if (!candidates.length) candidates = operators.filter((op) => op.servicios.includes(tipoId));
    if (!candidates.length) return false;

    candidates = [...candidates].sort((x, y) => {
      const score = (op) =>
        (op.lands.includes(a.land) ? 2 : 0) +
        (op.lands.includes(b.land) ? 2 : 0) +
        (op.competencia === "dominante" ? 1 : 0) +
        (op.estado === "actual" ? 1 : 0);
      return score(y) - score(x);
    });
    const opPool = candidates.slice(0, Math.min(8, candidates.length));
    const op = pick(opPool, seed + i * 3 + patterns.indexOf(pattern));

    const key = `${tipoId}|${op.id}|${a.id}|${b.id}|${pattern}|${stops.length}`;
    if (usedKeys.has(key)) return false;
    usedKeys.add(key);

    let paradas = stops.map((h) => h.id);
    if (pattern === "directo" && stops.length > 2) {
      // solo extremos + máximo 1 intermedio importante (tier<=2)
      const mids = stops.slice(1, -1).filter((h) => h.tier <= 2);
      const mid = mids.length ? [mids[Math.floor(mids.length / 2)].id] : [];
      paradas = [a.id, ...mid, b.id];
    } else if (pattern === "parador" && corridor?.path?.length) {
      // ya es completo en corredor
      paradas = stops.map((h) => h.id);
    }

    const num = counters[tipoId]++;
    const areaCode = a.metro_area || a.land;
    const { codigo, codigo_interno } = makeCodigo(tipo, num, areaCode);
    const origen_datos =
      origenOverride ||
      corridor?.origen_datos ||
      (a.origen_datos === "ficticia" || b.origen_datos === "ficticia"
        ? "hibrida"
        : i % 4 === 0
          ? "real"
          : "ficticia");

    const material = (op.flota || [])
      .filter((f) => f.papel === "principal")
      .slice(0, 3)
      .map((f) => f.unidad_id);
    if (!material.length && op.flota?.length) material.push(op.flota[0].unidad_id);

    const patternLabel =
      pattern === "retorno" ? " (retorno)" : pattern === "directo" ? " directo" : pattern === "parador" ? " parador" : "";

    const via = paradas.slice(1, -1);
    lines.push({
      id: `line-${String(lines.length + 1).padStart(5, "0")}`,
      codigo,
      codigo_interno,
      nombre: `${tipo.nombre} ${shortName(a.nombre)}–${shortName(b.nombre)}${patternLabel}`,
      tipo_id: tipoId,
      prefijo: tipo.prefijo,
      operador_id: op.id,
      operador_nombre: op.nombre,
      operador_estado: op.estado || "inventado",
      color: op.color,
      origen: a.id,
      destino: b.id,
      via,
      paradas,
      paradas_nombres: paradas.map((id) => hubById.get(id)?.nombre || id),
      num_paradas: paradas.length,
      distancia_km: Math.round(dist),
      frecuencia_min: frequencyFor(tipoId, dist) + (pattern === "parador" ? 10 : 0),
      material,
      origen_datos,
      patron: pattern,
      lands: [...new Set(paradas.map((id) => hubById.get(id)?.land).filter(Boolean))],
      corredor_id: corridor?.id || null,
    });
    return true;
  }

  for (const [tipoId, quota] of Object.entries(quotas)) {
    let made = 0;
    const preferCors = corridorCache.filter((c) => c.tipo_preferido.includes(tipoId));
    const cors = preferCors.length ? preferCors : corridorCache;

    // Más peso a parador/base para listas largas de paradas
    const routePatterns = ["parador", "base", "retorno", "parador", "base", "directo"];
    for (let pass = 0; pass < 12 && made < quota; pass++) {
      const pattern = routePatterns[pass % routePatterns.length];
      for (const c of cors) {
        if (made >= quota) break;
        const path = c.path;
        // Preferir tramos largos primero para maximizar paradas
        const maxJump = Math.min(14, path.length - 1);
        for (let jump = maxJump; jump >= 1; jump--) {
          for (let aIdx = 0; aIdx + jump < path.length; aIdx++) {
            const bIdx = aIdx + jump;
            const fromIdx = pattern === "retorno" ? bIdx : aIdx;
            const toIdx = pattern === "retorno" ? aIdx : bIdx;
            const stops = pathSlice(path, fromIdx, toIdx);
            const ok = tryPush({ stops, tipoId, corridor: c, i: i++, pattern });
            if (ok) made++;
            if (made >= quota) break;
          }
          if (made >= quota) break;
        }
      }
    }

    const localPool = hubs.filter((h) => {
      if (["u", "t"].includes(tipoId)) return h.tier <= 4;
      if (["s", "or", "mc", "ae"].includes(tipoId)) return h.tier <= 4;
      return true;
    });

    let guard = 0;
    while (made < quota && guard < quota * 40) {
      guard++;
      const a = pick(localPool, seed + i * 7 + guard);
      const neighbors = nearestHubs(a, localPool, 18, maxDistanceFor(tipoId));
      if (!neighbors.length) continue;
      const b = pick(neighbors, seed + i * 13 + guard);
      if (!["av", "ld", "px", "n", "ir", "tur"].includes(tipoId) && a.land !== b.land) continue;
      const pattern = patterns[guard % patterns.length];
      const ordered = pattern === "retorno" ? [b, a] : [a, b];
      // construir paradas intermedias por proximidad en el mismo land / vecinos
      const pool = localPool.filter(
        (h) => h.land === a.land || h.land === b.land || ["av", "ld", "ir", "px", "n"].includes(tipoId)
      );
      let stops = nearestPath(ordered[0], ordered[1], pool, pattern === "directo" ? 3 : 16);
      if (pattern === "directo") stops = [ordered[0], ordered[1]];
      const ok = tryPush({ stops, tipoId, corridor: null, i: i++, pattern });
      if (ok) made++;
    }

    guard = 0;
    while (made < quota && guard < quota * 25) {
      guard++;
      const a = pick(hubs, seed + i * 17 + guard);
      const b = pick(hubs, seed + i * 19 + guard * 3);
      const pattern = patterns[guard % patterns.length];
      const ordered = pattern === "retorno" ? [b, a] : [a, b];
      const stops =
        pattern === "directo"
          ? ordered
          : nearestPath(ordered[0], ordered[1], hubs, 8);
      const ok = tryPush({ stops, tipoId, corridor: null, i: i++, pattern });
      if (ok) made++;
    }
  }

  lines.forEach((l, idx) => {
    l.id = `line-${String(idx + 1).padStart(5, "0")}`;
  });
  return lines.slice(0, count);
}

export function summarizeLines(lines) {
  const byTipo = {};
  const byOp = {};
  const byOrigen = {};
  const byEstado = {};
  let dist = 0;
  let stops = 0;
  for (const l of lines) {
    byTipo[l.tipo_id] = (byTipo[l.tipo_id] || 0) + 1;
    byOp[l.operador_id] = (byOp[l.operador_id] || 0) + 1;
    byOrigen[l.origen_datos] = (byOrigen[l.origen_datos] || 0) + 1;
    byEstado[l.operador_estado] = (byEstado[l.operador_estado] || 0) + 1;
    dist += l.distancia_km || 0;
    stops += l.num_paradas || 0;
  }
  return {
    total: lines.length,
    distancia_total_km: dist,
    paradas_totales_en_rutas: stops,
    media_paradas: lines.length ? Math.round((stops / lines.length) * 10) / 10 : 0,
    por_tipo: byTipo,
    por_origen_datos: byOrigen,
    por_estado_operador: byEstado,
    operadores_distintos: Object.keys(byOp).length,
  };
}
