/**
 * Generador de líneas ferroviarias.
 * Escalable: a partir de hubs + operadores + tipos produce lotes grandes.
 */

function pick(arr, i) {
  return arr[i % arr.length];
}

function frequencyFor(tipoId) {
  const map = {
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
  };
  return map[tipoId] ?? 60;
}

/**
 * @param {object} opts
 * @param {object[]} opts.hubs
 * @param {object[]} opts.operators
 * @param {object[]} opts.tipos
 * @param {number} opts.count
 * @param {number} [opts.seed]
 */
export function generateLines({ hubs, operators, tipos, count, seed = 1 }) {
  const lines = [];
  const counters = Object.fromEntries(tipos.map((t) => [t.id, t.rango_numeros[0]]));
  const tipoById = Object.fromEntries(tipos.map((t) => [t.id, t]));

  // Prefer pair hubs that share plausible service roles
  for (let i = 0; i < count; i++) {
    const a = pick(hubs, seed + i * 7);
    let b = pick(hubs, seed + i * 13 + 3);
    if (b.id === a.id) b = pick(hubs, seed + i * 17 + 5);

    const candidates = operators.filter((op) => {
      const coversA = op.lands.includes(a.land);
      const coversB = op.lands.includes(b.land);
      return coversA || coversB;
    });
    if (candidates.length === 0) continue;

    const op = pick(candidates, seed + i * 3);
    const servicePool = op.servicios.filter((s) => tipoById[s]);
    const tipoId = pick(servicePool.length ? servicePool : op.servicios, seed + i * 11);
    const tipo = tipoById[tipoId];
    if (!tipo) continue;

    const num = counters[tipoId]++;
    const codigo =
      tipo.prefijo === "S" || tipo.prefijo === "U" || tipo.prefijo === "T"
        ? `${tipo.prefijo}${((num - 1) % 99) + 1}`
        : `${tipo.prefijo}${num}`;

    const sameLand = a.land === b.land;
    const origenDatos =
      a.origen_datos === "ficticia" || b.origen_datos === "ficticia"
        ? "hibrida"
        : sameLand && (tipoId === "s" || tipoId === "u" || tipoId === "t")
          ? "hibrida"
          : i % 5 === 0
            ? "real"
            : "ficticia";

    const material = (op.flota || [])
      .filter((f) => f.papel === "principal")
      .slice(0, 2)
      .map((f) => f.unidad_id);

    lines.push({
      id: `line-${String(i + 1).padStart(5, "0")}`,
      codigo,
      codigo_interno: `${tipo.prefijo}-${a.land}-${num}`,
      nombre: `${tipo.nombre} ${a.nombre.replace(/ Central.*/, "")}–${b.nombre.replace(/ Central.*/, "")}`,
      tipo_id: tipoId,
      prefijo: tipo.prefijo,
      operador_id: op.id,
      operador_nombre: op.nombre,
      color: op.color,
      origen: a.id,
      destino: b.id,
      via: [],
      frecuencia_min: frequencyFor(tipoId),
      material: material.length ? material : (op.flota || []).slice(0, 1).map((f) => f.unidad_id),
      origen_datos: origenDatos,
      lands: [...new Set([a.land, b.land])],
    });
  }

  return lines;
}

export function summarizeLines(lines) {
  const byTipo = {};
  const byOp = {};
  const byOrigen = {};
  for (const l of lines) {
    byTipo[l.tipo_id] = (byTipo[l.tipo_id] || 0) + 1;
    byOp[l.operador_id] = (byOp[l.operador_id] || 0) + 1;
    byOrigen[l.origen_datos] = (byOrigen[l.origen_datos] || 0) + 1;
  }
  return {
    total: lines.length,
    por_tipo: byTipo,
    por_origen_datos: byOrigen,
    operadores_distintos: Object.keys(byOp).length,
  };
}
