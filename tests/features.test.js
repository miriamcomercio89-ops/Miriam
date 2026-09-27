import assert from "node:assert/strict";
import test from "node:test";
import { COUNTRIES, ORDER_COUNTRIES, PLAYER } from "../src/data/countries.js";
import { FEATURED, ORDER_POOL } from "../src/data/highlights.js";
import { getItem } from "../src/data/catalog.js";
import { buildChain } from "../src/game/chain.js";
import { createGame } from "../src/game/state.js";
import { placeTracked, undoLast, bresenham } from "../src/game/history.js";
import { ensureOrders, fulfillOrder } from "../src/game/orders.js";
import { addInventory } from "../src/game/state.js";
import { isEarthNatural } from "../src/game/focus.js";
import { ELEMENT_BY_SYMBOL } from "../src/data/elements.js";

test("España es el jugador y no pide a sí misma", () => {
  assert.equal(PLAYER.code, "ES");
  assert.equal(PLAYER.name, "España");
  assert.ok(COUNTRIES.length >= 180);
  assert.ok(ORDER_COUNTRIES.every((c) => c.code !== "ES"));
  assert.ok(ORDER_COUNTRIES.find((c) => c.code === "DE"));
  assert.ok(ORDER_COUNTRIES.find((c) => c.code === "JP"));
});

test("los productos destacados existen y tienen cadena", () => {
  for (const f of FEATURED) {
    const item = getItem(f.id);
    assert.ok(item, f.id);
    const chain = buildChain(f.id);
    assert.ok(chain, f.id);
  }
  for (const p of ORDER_POOL) assert.ok(getItem(p.id), p.id);
});

test("el hierro es terrestre y el oganesón no", () => {
  assert.equal(isEarthNatural(ELEMENT_BY_SYMBOL.Fe), true);
  assert.equal(isEarthNatural(ELEMENT_BY_SYMBOL.Og), false);
  assert.equal(isEarthNatural(ELEMENT_BY_SYMBOL.Tc), false);
});

test("deshacer quita un edificio colocado", () => {
  const game = createGame(118);
  const { x, y } = game.world.spawn;
  assert.equal(placeTracked(game, "belt", x, y, 0), true);
  assert.ok(game.buildings[`${x},${y}`]);
  assert.equal(undoLast(game), true);
  assert.equal(game.buildings[`${x},${y}`], undefined);
});

test("bresenham traza una línea de cintas", () => {
  const pts = bresenham(0, 0, 3, 0);
  assert.equal(pts.length, 4);
});

test("un pedido se despacha desde el inventario de España", () => {
  const game = createGame(118);
  ensureOrders(game);
  const open = game.orders.find((o) => o.status === "open");
  assert.ok(open);
  addInventory(game, open.itemId, open.amount);
  const before = game.reputation;
  assert.equal(fulfillOrder(game, open.id), true);
  assert.equal(open.status, "done");
  assert.ok(game.reputation > before);
});
