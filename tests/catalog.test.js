import assert from "node:assert/strict";
import test from "node:test";
import { ELEMENTS } from "../src/data/elements.js";
import { ITEMS, RECIPES, ITEM_BY_ID, CATALOG_STATS, getItem } from "../src/data/catalog.js";
import { RESEARCH } from "../src/data/research.js";
import { BUILDINGS } from "../src/data/buildings.js";
import { createWorld } from "../src/game/worldgen.js";
import { createGame, hasInventory } from "../src/game/state.js";
import { handCraft, placeBuilding, recipeById } from "../src/game/sim.js";

test("incluye los 118 elementos de la tabla periódica", () => {
  assert.equal(ELEMENTS.length, 118);
  assert.equal(ELEMENTS.at(-1).symbol, "Og");
  assert.equal(ELEMENTS[25].symbol, "Fe");
  const symbols = new Set(ELEMENTS.map((e) => e.symbol));
  assert.equal(symbols.size, 118);
});

test("el catálogo tiene miles de productos y recetas válidas", () => {
  assert.ok(CATALOG_STATS.items >= 2000, `ítems: ${CATALOG_STATS.items}`);
  assert.ok(CATALOG_STATS.recipes >= 2000, `recetas: ${CATALOG_STATS.recipes}`);
  for (const item of ITEMS) {
    assert.ok(item.id && item.name, item.id);
    assert.ok(ITEM_BY_ID.get(item.id) === item);
  }
  for (const r of RECIPES) {
    for (const inp of r.inputs) {
      assert.ok(ITEM_BY_ID.has(inp.id), `input huérfano ${inp.id} en ${r.id}`);
    }
    if (r.output?.id) assert.ok(ITEM_BY_ID.has(r.output.id), `output huérfano ${r.output.id}`);
    if (r.output2?.id) assert.ok(ITEM_BY_ID.has(r.output2.id), `output2 huérfano ${r.output2.id}`);
    assert.ok(BUILDINGS[r.building], `edificio desconocido ${r.building} en ${r.id}`);
  }
});

test("cada elemento tiene ítem y una vía de obtención", () => {
  for (const el of ELEMENTS) {
    const item = getItem(`el-${el.symbol.toLowerCase()}`);
    assert.ok(item, el.symbol);
    const made = RECIPES.some(
      (r) => r.output?.id === item.id || r.output2?.id === item.id || r.deposit === el.symbol
    );
    assert.ok(made, `sin vía para ${el.symbol}`);
  }
});

test("el árbol de investigación está conectado", () => {
  const ids = new Set(RESEARCH.map((r) => r.id));
  assert.ok(RESEARCH.length >= 40, RESEARCH.length);
  for (const r of RESEARCH) {
    for (const req of r.requires) assert.ok(ids.has(req), req);
    for (const id of Object.keys(r.cost)) assert.ok(ITEM_BY_ID.has(id), id);
  }
});

test("el mundo inicial tiene hierro, carbón, cobre y agua cerca del aterrizaje", () => {
  const world = createWorld(118);
  const { x: sx, y: sy } = world.spawn;
  assert.notEqual(world.tiles[sy][sx].terrain, "water");
  const near = (symbol, radius = 8) => {
    for (let y = sy - radius; y <= sy + radius; y++) {
      for (let x = sx - radius; x <= sx + radius; x++) {
        if (world.tiles[y]?.[x]?.deposit === symbol) return true;
      }
    }
    return false;
  };
  assert.ok(near("Fe"), "Fe junto al spawn");
  assert.ok(near("C"), "C junto al spawn");
  assert.ok(near("Cu"), "Cu junto al spawn");
  const water = world.tiles.flat().some((t) => t.terrain === "water");
  assert.ok(water);
});

test("se puede craftear a mano un engranaje y colocar una cinta", () => {
  const game = createGame(118);
  const recipe = recipeById("make-gear-basic");
  assert.ok(recipe);
  const before = game.inventory["gear-basic"] ?? 0;
  assert.ok(hasInventory(game, { "plate-fe": 2 }));
  const made = handCraft(game, recipe, 1);
  assert.equal(made, 1);
  assert.equal(game.inventory["gear-basic"], before + 1);
  const ok = placeBuilding(game, "belt", game.world.spawn.x, game.world.spawn.y, 0);
  assert.equal(ok, true);
});
