import assert from "node:assert/strict";
import test from "node:test";
import { SPAIN_CITIES } from "../src/data/spain.js";
import { CITY_ORDERS } from "../src/data/diplomacy.js";
import { getItem, ITEM_BY_ID } from "../src/data/catalog.js";
import { BUILDINGS, BUILDING_LIST, BUILDING_TABS, canCraftRecipe, buildingSpeed } from "../src/data/buildings.js";
import { RESEARCH, RESEARCH_BY_ID } from "../src/data/research.js";
import { planFactory, machinesFor, recipeFor } from "../src/game/calc.js";
import { createGame } from "../src/game/state.js";
import { placeBuilding } from "../src/game/sim.js";

test("España tiene muchas ciudades reales con pedidos posibles", () => {
  assert.ok(SPAIN_CITIES.length >= 50, SPAIN_CITIES.length);
  assert.equal(CITY_ORDERS.length, SPAIN_CITIES.length);
  const ids = new Set();
  for (const c of SPAIN_CITIES) {
    assert.ok(c.name && c.region, c.id);
    assert.ok(c.x > 0 && c.x < 100 && c.y > 0 && c.y < 100, c.id);
    assert.equal(ids.has(c.id), false, c.id);
    ids.add(c.id);
    for (const itemId of c.items) assert.ok(getItem(itemId), `${c.id}:${itemId}`);
  }
  assert.ok(SPAIN_CITIES.find((c) => c.id === "madrid"));
  assert.ok(SPAIN_CITIES.find((c) => c.id === "barcelona"));
  assert.ok(SPAIN_CITIES.find((c) => c.id === "laspalmas"));
});

test("hay muchas fábricas, niveles II/III y pestañas", () => {
  assert.ok(BUILDING_LIST.length >= 55, BUILDING_LIST.length);
  assert.equal(BUILDING_TABS.length, 7);
  assert.ok(BUILDINGS.extractor2 && BUILDINGS.furnace2 && BUILDINGS.assembler2);
  assert.ok(BUILDINGS.extractor3 && BUILDINGS.furnace3 && BUILDINGS.assembler3);
  assert.equal(buildingSpeed("furnace2"), 1.8);
  assert.equal(buildingSpeed("furnace3"), 2.8);
  assert.ok(canCraftRecipe("furnace2", { building: "furnace", research: "start" }));
  assert.ok(canCraftRecipe("kiln", { building: "furnace", research: "ceramics" }));
  assert.equal(canCraftRecipe("kiln", { building: "furnace", research: "nuclear" }), false);
  for (const def of BUILDING_LIST) {
    assert.ok(def.tab, def.id);
    assert.ok(RESEARCH_BY_ID[def.research] || def.research === "start", def.research);
    for (const id of Object.keys(def.cost)) assert.ok(ITEM_BY_ID.get(id), `${def.id} coste ${id}`);
  }
});

test("la calculadora pide más hornos si quieres más acero", () => {
  const rec = recipeFor("steel");
  assert.ok(rec);
  const few = machinesFor(rec, 3);
  const many = machinesFor(rec, 30);
  assert.ok(many > few);
  const plan = planFactory("steel", 12);
  assert.equal(plan.itemId, "steel");
  assert.ok(plan.machines >= 1);
  assert.ok(plan.inputs.length >= 1);
});

test("las fábricas II se investigan y se pueden colocar", () => {
  assert.ok(RESEARCH.find((r) => r.id === "industry-2"));
  assert.ok(RESEARCH.find((r) => r.id === "industry-3"));
  const game = createGame(118);
  game.researched["industry-2"] = true;
  game.inventory["steel"] = 40;
  game.inventory["brick-fire"] = 20;
  const { x, y } = game.world.spawn;
  assert.equal(placeBuilding(game, "furnace2", x + 1, y, 0), true);
});
