import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLines, summarizeLines } from "./index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");

const cmd = process.argv[2] || "sample";
const count = Number(
  process.argv[3] || (cmd === "sample" ? 400 : cmd === "mass" ? 8000 : 5000)
);

const operators = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const corridorsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/corridors.json"), "utf8"));

const lines = generateLines({
  hubs: hubs.hubs,
  operators: operators.operators,
  tipos: lineTypes.tipos,
  corridors: corridorsDoc.corredores,
  cuotas: corridorsDoc.cuotas_por_tipo,
  count,
  seed: 42,
});

fs.mkdirSync(outDir, { recursive: true });
const resumen = summarizeLines(lines);
const fileName =
  cmd === "sample"
    ? "lines-sample.json"
    : cmd === "mass"
      ? "lines-mass.json"
      : `lines-batch-${count}.json`;
const file = path.join(outDir, fileName);
const payload = {
  version: "0.2.0",
  generado: new Date().toISOString(),
  resumen,
  lines,
};
fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");

const summaryFile = path.join(outDir, fileName.replace(/\.json$/, "-summary.json"));
fs.writeFileSync(summaryFile, JSON.stringify(resumen, null, 2) + "\n", "utf8");

console.log(`Escrito ${file}`);
console.log(`Resumen ${summaryFile}`);
console.log(JSON.stringify(resumen, null, 2));
