import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLines, summarizeLines } from "./index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");

const cmd = process.argv[2] || "sample";
const count = Number(process.argv[3] || (cmd === "sample" ? 250 : 5000));

const operators = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));

const lines = generateLines({
  hubs: hubs.hubs,
  operators: operators.operators,
  tipos: lineTypes.tipos,
  count,
  seed: 42,
});

fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, cmd === "sample" ? "lines-sample.json" : `lines-batch-${count}.json`);
const payload = {
  version: "0.1.0",
  generado: new Date().toISOString(),
  resumen: summarizeLines(lines),
  lines,
};
fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Escrito ${file}`);
console.log(JSON.stringify(payload.resumen, null, 2));
