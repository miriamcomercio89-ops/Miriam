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

export function generateDocs({ operators, lands, lineTypes, fleet, hubs, corridors }) {
  const docsDir = path.join(root, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const byTipo = {};
  for (const op of operators) {
    byTipo[op.tipo] = (byTipo[op.tipo] || 0) + 1;
  }
  const hubTotal = hubs?.total || hubs?.hubs?.length || 0;
  const corridorTotal = corridors?.corredores?.length || 0;
  const fleetBases = fleet.unidades.filter((u) => u.variante === "base" || !u.variante);
  const fleetVariants = fleet.unidades.length - fleetBases.length;

  const byEstado = {};
  for (const op of operators) {
    const e = op.estado || "inventado";
    byEstado[e] = (byEstado[e] || 0) + 1;
  }

  const operadoresMd = `# Catálogo de operadores — Reino Unido

Versión del catálogo: **${operators.length} operadores**.
Ámbito: **Reino Unido** (actuales, futuros e inventados).
Inventados: nombres en **español**. Actuales/futuros: nombres oficiales o proyectados.
Regla de color: **cada línea hereda el color del operador**.

## Resumen por estado

${mdTable(
  ["Estado", "Cantidad"],
  Object.entries(byEstado)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, String(v)])
)}

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
| Estado | ${op.estado || "inventado"} |
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

  const disenoMd = `# Diseño del sistema ferroviario — Reino Unido

## Objetivo

Recrear una red **supercompleta** en el Reino Unido para Nimby Rails:

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

- Unidades catalogadas: **${fleet.unidades.length}** (${fleetBases.length} base + ${fleetVariants} variantes)
- Asignación: automática según servicios del operador (ver \`data/operators.json\` → \`flota\`)
- Colecciones Workshop recomendadas: ver \`data/fleet.json\`

## Hubs y corredores

- Estaciones/hubs: **${hubTotal}**
- Corredores: **${corridorTotal}**
- Detalle: \`data/hubs.json\`, \`data/corridors.json\`

## Generador

Entrada:

- \`data/operators.json\`
- \`data/line-types.json\`
- \`data/hubs.json\`
- \`data/fleet.json\`
- \`data/corridors.json\`

Salida:

- \`output/lines-sample.json\` (muestra)
- \`output/lines-mass.json\` (lote masivo)
- \`output/*-summary.json\`

## Fases

| Fase | Estado | Contenido |
| --- | --- | --- |
| A | Hecha | Catálogo operadores + logos + colores + zonas |
| B | Hecha | Nomenclatura y tipos de línea |
| C | Hecha | Catálogo flota ampliado (cientos) + asignación mixta |
| D | Hecha | Generador por corredor + cuotas |
| E | Hecha | Hubs densificados + miles de líneas |
| F | Hecha | Guía de importación a partida Nimby Rails |
`;

  const byCat = {};
  for (const u of fleet.unidades) {
    byCat[u.categoria] = (byCat[u.categoria] || 0) + 1;
  }

  const flotaMd = `# Flota (Workshop Nimby Rails)

Material de **pasajeros** moderno. Los \`workshop_ref\` son nombres de búsqueda orientativos.

## Totales

- **${fleet.unidades.length}** unidades en catálogo
- **${fleetBases.length}** modelos base
- **${fleetVariants}** variantes (composición, livrea, aeropuerto)

## Por categoría

${mdTable(
  ["Categoría", "Unidades"],
  Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, String(v)])
)}

## Colecciones

${fleet.colecciones_recomendadas
  .map((c) => `- [${c.nombre}](${c.url}) — ${c.uso}`)
  .join("\n")}

## Modelos base (referencia)

${mdTable(
  ["ID", "Nombre", "Vmax", "Cap.", "Servicios", "Workshop"],
  fleetBases.map((u) => [
    `\`${u.id}\``,
    u.nombre,
    String(u.vmax_kmh),
    String(u.capacidad),
    u.servicios.join(", "),
    u.workshop_ref,
  ])
)}

> El catálogo completo (incluidas variantes) está en \`data/fleet.json\`.
`;

  const generadorMd = `# Generador de red

## Idea

1. Toma **corredores** (secuencias de hubs) y genera pares/saltos con \`via\`.
2. Respeta **cuotas por tipo** (\`AV\`, \`RE\`, \`S\`…).
3. Rellena con **ramales por proximidad** (haversine) y filtros de distancia min/max.
4. Asigna operador según cobertura de Lands + tipo de servicio + competencia.
5. Copia el **color del operador** y elige material de su flota principal.

## Comandos

\`\`\`bash
npm run build
npm run generate:sample   # ~400 líneas
npm run generate:mass     # 8000 líneas
node generator/cli.mjs batch 3000
\`\`\`

## Campos de cada línea

\`id\`, \`codigo\`, \`codigo_interno\`, \`nombre\`, \`tipo_id\`, \`prefijo\`, \`operador_id\`, \`color\`, \`origen\`, \`destino\`, \`via\`, \`distancia_km\`, \`frecuencia_min\`, \`material\`, \`origen_datos\`, \`lands\`, \`corredor_id\`
`;

  const importacionMd = `# Guía de importación a Nimby Rails

Nimby Rails no importa este JSON de forma nativa. Este proyecto es la **capa de diseño/planificación** para construir la partida a mano (o con herramientas externas) de forma coherente.

## Flujo recomendado

1. **Suscribir Workshop**  
   Usa las colecciones de \`docs/FLOTA.md\` / \`data/fleet.json\`. Busca cada \`workshop_ref\` y suscríbete.

2. **Crear operadores en la partida**  
   Para cada entrada de \`data/operators.json\`:
   - nombre en español
   - color corporativo
   - logo SVG de \`assets/logos/{id}.svg\` (exporta a PNG si el juego lo pide)

3. **Plantar hubs**  
   Prioriza tier 1–2 de \`data/hubs.json\`, luego metropolitanos, luego ficticios de densificación.

4. **Trazar corredores**  
   Sigue \`data/corridors.json\` (AV del Rin, eje norte-sur, S-Bahn, etc.).

5. **Abrir líneas desde el lote**  
   Usa \`output/lines-mass.json\` (o la sample) filtrando por \`corredor_id\` o \`tipo_id\`.  
   Código público = \`codigo\`; color = \`color\`; tren = primer id de \`material\`.

6. **Competencia**  
   En un mismo eje pueden aparecer varios \`operador_id\`. Mantén ambos si quieres rivalidad; o deja el dominante local.

## Orden práctico de construcción

1. AV/LD nacionales  
2. S/U/T de las 8–10 áreas metro  
3. RE/RB por Land  
4. RL/TUR/AE/N de relleno  

## Archivos clave

| Archivo | Uso |
| --- | --- |
| \`data/operators.json\` | Marca y flota |
| \`data/fleet.json\` | Material Workshop |
| \`data/hubs.json\` | Estaciones |
| \`data/corridors.json\` | Ejes |
| \`output/lines-mass.json\` | Miles de líneas listas para ejecutar |
`;

  fs.writeFileSync(path.join(docsDir, "OPERADORES.md"), operadoresMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "NOMENCLATURA.md"), nomenclaturaMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "DISENO.md"), disenoMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "FLOTA.md"), flotaMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "GENERADOR.md"), generadorMd, "utf8");
  fs.writeFileSync(path.join(docsDir, "IMPORTACION.md"), importacionMd, "utf8");
}
