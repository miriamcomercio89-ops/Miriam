import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function mdTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

export function generateDocs({ operators, lands, lineTypes, fleet }) {
  const docsDir = path.join(root, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const byTipo = {};
  for (const op of operators) {
    byTipo[op.tipo] = (byTipo[op.tipo] || 0) + 1;
  }

  const operadoresMd = `# Catálogo de operadores

Versión del catálogo: **${operators.length} operadores**.
Idioma de marca: **español**.
Regla de color: **cada línea hereda el color del operador**.

## Resumen por tipo

${mdTable(
  ["Tipo", "Cantidad"],
  Object.entries(byTipo)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, String(v)])
)}

## Competencia

- **Dominante**: operador principal de un territorio o modo.
- **Competitiva**: comparte corredores con otros.
- **Nicho**: servicios especializados (nocturno, turístico, aeropuerto, ferias…).

En la red conviven monopolios locales (p. ej. metros urbanos) y competencia abierta en ejes nacionales/regionales.

## Listado

${operators
  .map((op) => {
    const landsTxt = op.lands.map((id) => lands.find((l) => l.id === id)?.nombre || id).join(", ");
    const flota = (op.flota || []).map((f) => `${f.nombre} (×${f.unidades_estimadas})`).join("; ");
    return `### ${op.nombre} (\`${op.id}\`)

![logo](../${op.logo})

| Campo | Valor |
| --- | --- |
| Código corto | **${op.nombre_corto}** |
| Tipo | ${op.tipo} |
| Competencia | ${op.competencia} |
| Color | \`${op.color}\` / \`${op.color_secundario}\` |
| Sede | ${op.sede} |
| Lands | ${landsTxt} |
| Servicios | ${op.servicios.map((s) => "`" + s + "`").join(", ")} |
| Eslogan | *${op.eslogan}* |
| Logo | \`${op.logo}\` |
| Flota | ${flota || "—"} |
`;
  })
  .join("\n")}
`;

  const nomenclaturaMd = `# Nomenclatura de líneas

## Regla general

\`\`\`text
CODIGO_PUBLICO = {PREFIJO}{NUMERO}
\`\`\`

- El **prefijo** indica el **tipo de servicio**.
- El **número** es único dentro de ese prefijo a escala nacional (excepto S/U/T, locales al área; el generador guarda \`codigo_interno\`).
- El **color** de la línea es siempre el del **operador**, no del tipo.

## Tipos

${mdTable(
  ["Prefijo", "Tipo", "Vmax obj.", "Ámbito", "Rango nº"],
  lineTypes.tipos.map((t) => [
    `\`${t.prefijo}\``,
    t.nombre,
    `${t.velocidad_objetivo_kmh} km/h`,
    t.ambito.join(", "),
    `${t.rango_numeros[0]}–${t.rango_numeros[1]}`,
  ])
)}

## Ejemplos

| Código | Significado |
| --- | --- |
| \`AV12\` | Alta velocidad nº 12 |
| \`LD340\` | Larga distancia nº 340 |
| \`RE1205\` | Regional exprés nº 1205 |
| \`S3\` | Cercanías línea 3 (área local) |
| \`U2\` | Metro línea 2 |
| \`TT14\` | Tranvía-tren 14 |
| \`AE4\` | Aeropuerto exprés 4 |
| \`N7\` | Nocturno 7 |
| \`TUR22\` | Turístico 22 |
| \`RL880\` | Ramal local 880 |

## Metadatos de línea (generador)

Cada línea generada incluye:

- \`codigo\`, \`codigo_interno\`
- \`tipo_id\`, \`operador_id\`
- \`color\` (copiado del operador)
- \`origen\`, \`destino\`, \`via\` (estaciones)
- \`frecuencia_min\`
- \`material\` (ids de flota)
- \`origen_datos\`: \`real\` | \`ficticia\` | \`hibrida\`
`;

  const disenoMd = `# Diseño del sistema ferroviario — Alemania

## Objetivo

Recrear una red **supercompleta** en Alemania para Nimby Rails:

- Base **realista** (corredores, nodos y jerarquía reconocibles).
- Miles de **líneas nuevas ficticias** que densifican la red.
- **${operators.length} operadores** con marca en español, color y logo.
- Flota moderna mixta inspirada en el Workshop de Nimby Rails.
- Solo **pasajeros**.

## Principios

1. **Marca por operador**: color y logo definen la identidad visual de cada línea.
2. **Tipo por prefijo**: la nomenclatura comunica el producto (AV, RE, S…).
3. **Competencia mixta**: hay operadores dominantes locales y varios compitiendo en ejes gordos.
4. **Flota mixta**: cada operador usa varias series; no hay monocultivo de material.
5. **Escalabilidad**: el generador produce lotes enormes a partir de hubs + reglas.

## Capas de red

| Capa | Tipos | Rol |
| --- | --- | --- |
| Troncal AV/LD | AV, LD, PX, N | Larga distancia nacional/internacional |
| Interregional | IR, RE | Puentes entre Lands y ciudades medias |
| Regional/local | RB, RL, TUR | Cobertura y ramales |
| Metropolitana | S, OR, MC, AE | Alta frecuencia periurbana |
| Urbana | U, T, TT | Metro, tranvía, tram-train |

## Distribución de operadores

${mdTable(
  ["Tipo", "Cantidad", "Notas"],
  Object.entries(byTipo).map(([k, v]) => {
    const note =
      {
        nacional: "Ejes federales y competencia abierta",
        internacional: "Enlaces Francia/Benelux/Alpes/Polonia/Chequia",
        regional: "1–3 por Land + operadores transversales",
        metropolitano: "S-Bahn de grandes áreas",
        urbano: "Metro y tranvía",
        especializado: "Nocturno, turismo, aeropuerto, ferias, universidades",
      }[k] || "";
    return [k, String(v), note];
  })
)}

## Lands cubiertos

${mdTable(
  ["Código", "Land", "Capital"],
  lands.map((l) => [`\`${l.id}\``, l.nombre, l.capital])
)}

## Flota

- Unidades catalogadas: **${fleet.unidades.length}**
- Asignación: automática según servicios del operador (ver \`data/operators.json\` → \`flota\`)
- Colecciones Workshop recomendadas: ver \`data/fleet.json\`

## Generador

Entrada:

- \`data/operators.json\`
- \`data/line-types.json\`
- \`data/hubs.json\`
- \`data/fleet.json\`

Salida:

- \`output/lines-sample.json\` (muestra)
- futuras corridas masivas: \`output/lines-batch-*.json\`

## Fases

| Fase | Estado | Contenido |
| --- | --- | --- |
| A | Hecha | Catálogo operadores + logos + colores + zonas |
| B | Base lista | Nomenclatura y tipos de línea |
| C | Base lista | Catálogo flota + asignación mixta |
| D | Scaffold | Generador de líneas a escala |
| E | Pendiente | Hubs/estaciones exhaustivos + miles de líneas |
| F | Pendiente | Guía de importación a partida Nimby Rails |
`;

  const flotaMd = `# Flota (Workshop Nimby Rails)

Material de **pasajeros** moderno. Los \`workshop_ref\` son nombres de búsqueda orientativos.

## Colecciones

${fleet.colecciones_recomendadas
  .map((c) => `- [${c.nombre}](${c.url}) — ${c.uso}`)
  .join("\n")}

## Unidades

${mdTable(
  ["ID", "Nombre", "Vmax", "Cap.", "Servicios", "Workshop"],
  fleet.unidades.map((u) => [
    `\`${u.id}\``,
    u.nombre,
    String(u.vmax_kmh),
    String(u.capacidad),
    u.servicios.join(", "),
    u.workshop_ref,
  ])
)}
`;

  fs.writeFileSync(path.join(docsDir, "OPERADORES.md"), operadoresMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "NOMENCLATURA.md"), nomenclaturaMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "DISENO.md"), disenoMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "FLOTA.md"), flotaMd, "utf8");
}
