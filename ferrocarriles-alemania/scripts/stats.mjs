import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ops = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const fleet = JSON.parse(fs.readFileSync(path.join(root, "data/fleet.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const types = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));

const byTipo = {};
const byComp = {};
let flotaTotal = 0;
for (const op of ops.operators) {
  byTipo[op.tipo] = (byTipo[op.tipo] || 0) + 1;
  byComp[op.competencia] = (byComp[op.competencia] || 0) + 1;
  flotaTotal += (op.flota || []).reduce((s, f) => s + f.unidades_estimadas, 0);
}

console.log(
  JSON.stringify(
    {
      operadores: ops.total,
      por_tipo: byTipo,
      por_competencia: byComp,
      tipos_linea: types.tipos.length,
      unidades_catalogo: fleet.unidades.length,
      unidades_estimadas_en_flotas: flotaTotal,
      hubs: hubs.hubs.length,
    },
    null,
    2
  )
);
