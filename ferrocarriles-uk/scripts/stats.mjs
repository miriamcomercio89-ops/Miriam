import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ops = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const fleet = JSON.parse(fs.readFileSync(path.join(root, "data/fleet.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const types = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const corridors = JSON.parse(fs.readFileSync(path.join(root, "data/corridors.json"), "utf8"));

const byTipo = {};
const byComp = {};
const byEstado = {};
let flotaTotal = 0;
let seriesAsignadas = 0;
for (const op of ops.operators) {
  byTipo[op.tipo] = (byTipo[op.tipo] || 0) + 1;
  byComp[op.competencia] = (byComp[op.competencia] || 0) + 1;
  const e = op.estado || "inventado";
  byEstado[e] = (byEstado[e] || 0) + 1;
  seriesAsignadas += (op.flota || []).length;
  flotaTotal += (op.flota || []).reduce((s, f) => s + f.unidades_estimadas, 0);
}

const hubsByOrigen = hubs.hubs.reduce((acc, h) => {
  const k = h.origen_datos || "real";
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

console.log(
  JSON.stringify(
    {
      pais: ops.pais || "Reino Unido",
      operadores: ops.total,
      por_estado: byEstado,
      por_tipo: byTipo,
      por_competencia: byComp,
      tipos_linea: types.tipos.length,
      unidades_catalogo: fleet.total || fleet.unidades.length,
      series_en_flotas_operador: seriesAsignadas,
      unidades_estimadas_en_flotas: flotaTotal,
      hubs: hubs.total || hubs.hubs.length,
      hubs_por_origen: hubsByOrigen,
      corredores: corridors.corredores.length,
    },
    null,
    2
  )
);
