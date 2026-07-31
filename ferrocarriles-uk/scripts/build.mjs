import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { operators, lands } from "./seed-operators.mjs";
import { assignFleets } from "./assign-fleet.mjs";
import { generateLogos } from "./generate-logos.mjs";
import { generateDocs } from "./generate-docs.mjs";
import { buildFleetDocument } from "./seed-fleet.mjs";
import { buildHubsDocument } from "./seed-hubs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

function assertUniqueIds(ops) {
  const ids = new Set();
  const shorts = new Set();
  for (const op of ops) {
    if (ids.has(op.id)) throw new Error(`ID duplicado: ${op.id}`);
    ids.add(op.id);
    if (shorts.has(op.nombre_corto)) throw new Error(`Código corto duplicado: ${op.nombre_corto}`);
    shorts.add(op.nombre_corto);
  }
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function uniquifyColors(ops) {
  const used = new Set();
  let tweak = 0;
  for (const op of ops) {
    let color = op.color.toUpperCase();
    while (used.has(color)) {
      const rgb = hexToRgb(color);
      tweak += 1;
      color = rgbToHex({
        r: (rgb.r + 37 * tweak) % 220 + 20,
        g: (rgb.g + 53 * tweak) % 220 + 20,
        b: (rgb.b + 97 * tweak) % 220 + 20,
      });
    }
    used.add(color);
    op.color = color;
  }
}

const fleetDoc = buildFleetDocument();
fs.writeFileSync(path.join(dataDir, "fleet.json"), JSON.stringify(fleetDoc, null, 2) + "\n", "utf8");

const hubsDoc = buildHubsDocument();
fs.writeFileSync(path.join(dataDir, "hubs.json"), JSON.stringify(hubsDoc, null, 2) + "\n", "utf8");

const lineTypes = JSON.parse(fs.readFileSync(path.join(dataDir, "line-types.json"), "utf8"));
const corridors = JSON.parse(fs.readFileSync(path.join(dataDir, "corridors.json"), "utf8"));

assertUniqueIds(operators);
uniquifyColors(operators);
const withFleet = assignFleets(operators, fleetDoc.unidades);
generateLogos(withFleet);

const operatorsDoc = {
  version: "0.3.0",
  pais: "Reino Unido",
  generado: new Date().toISOString(),
  idioma: "es",
  regla_color: "color de línea = color del operador",
  nota: "Actuales/futuros con nombres oficiales o proyectados; inventados en español.",
  total: withFleet.length,
  lands,
  operators: withFleet,
};

fs.writeFileSync(path.join(dataDir, "operators.json"), JSON.stringify(operatorsDoc, null, 2) + "\n", "utf8");

generateDocs({
  operators: withFleet,
  lands,
  lineTypes,
  fleet: fleetDoc,
  hubs: hubsDoc,
  corridors,
});

const byTipo = withFleet.reduce((acc, op) => {
  acc[op.tipo] = (acc[op.tipo] || 0) + 1;
  return acc;
}, {});

console.log("Build OK");
console.log(`  Operadores: ${withFleet.length}`);
console.log(`  Flota: ${fleetDoc.total} unidades`);
console.log(`  Hubs: ${hubsDoc.total}`);
console.log(`  Corredores: ${corridors.corredores.length}`);
console.log(`  Tipos operador: ${JSON.stringify(byTipo)}`);
console.log(`  Logos + docs regenerados`);
