import assert from "node:assert/strict";
import test from "node:test";
import { CATALOG_STATS, ITEMS, getItem } from "../src/data/catalog.js";
import { BUILDING_LIST, BUILDINGS } from "../src/data/buildings.js";
import { RESEARCH, isResearched } from "../src/data/research.js";
import { createGame, serialize, deserialize, sandboxStock } from "../src/game/state.js";
import { placeBuilding } from "../src/game/sim.js";
import { logoSpec } from "../src/render/logos.js";

test("el catálogo separa materias primas, semiproductos y finales", () => {
  assert.ok(CATALOG_STATS.items >= 2200, CATALOG_STATS.items);
  assert.ok(CATALOG_STATS.raw >= 180, CATALOG_STATS.raw);
  assert.ok(CATALOG_STATS.mid >= 800, CATALOG_STATS.mid);
  assert.ok(CATALOG_STATS.end >= 80, CATALOG_STATS.end);
  assert.equal(ITEMS.filter((i) => i.lane === "raw").length, CATALOG_STATS.raw);
  assert.ok(getItem("ore-fe").lane === "raw");
  assert.ok(getItem("ingot-fe").lane === "mid");
  assert.ok(getItem("fridge").lane === "end");
  assert.ok(getItem("fridge"));
  assert.ok(getItem("sheet-alloy-fe-mn"));
});

test("hay decenas de fábricas con logo y recetas", () => {
  assert.ok(BUILDING_LIST.length >= 55, BUILDING_LIST.length);
  assert.ok(BUILDINGS.quarry && BUILDINGS.autoWorks && BUILDINGS.hydro);
  for (const def of BUILDING_LIST) {
    assert.ok(def.icon || def.visual, def.id);
  }
});

test("el sandbox desbloquea investigación y deja colocar cualquier fábrica", () => {
  const game = createGame(118, { mode: "sandbox" });
  assert.equal(game.mode, "sandbox");
  assert.equal(Object.keys(game.researched).length, RESEARCH.length);
  for (const r of RESEARCH) assert.equal(isResearched(game, r.id), true);
  const { x, y } = game.world.spawn;
  assert.equal(placeBuilding(game, "furnace3", x + 2, y, 0), true);
  const stock = sandboxStock();
  for (const def of BUILDING_LIST) {
    for (const id of Object.keys(def.cost)) {
      assert.ok((stock[id] ?? 0) >= def.cost[id], `${def.id} ${id}`);
    }
  }
});

test("el modo normal sigue empezando bloqueado y el guardado recuerda el modo", () => {
  const normal = createGame(118, { mode: "normal" });
  assert.equal(normal.mode, "normal");
  assert.equal(isResearched(normal, "nuclear"), false);
  const again = deserialize(serialize(createGame(7, { mode: "sandbox" })));
  assert.equal(again.mode, "sandbox");
  assert.equal(isResearched(again, "periodica-core"), true);
});

test("los nuevos productos finales tienen logo propio", () => {
  for (const id of ["fridge", "laptop", "scooter", "foam-pe", "paint-yellow"]) {
    const spec = logoSpec(getItem(id));
    assert.notEqual(spec.glyph, "box", id);
  }
});
