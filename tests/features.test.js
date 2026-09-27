import assert from "node:assert/strict";
import test from "node:test";
import { COUNTRIES, ORDER_COUNTRIES, PLAYER } from "../src/data/countries.js";
import { FEATURED, ORDER_POOL } from "../src/data/highlights.js";
import { getItem } from "../src/data/catalog.js";
import { buildChain } from "../src/game/chain.js";
import { createGame, deserialize, serialize } from "../src/game/state.js";
import { placeTracked, undoLast, bresenham } from "../src/game/history.js";
import {
  ensureOrders,
  fulfillOrder,
  acceptOrder,
  rejectOrder,
  negotiateOrder,
  spawnCrisis,
  worldRanking,
} from "../src/game/orders.js";
import { addInventory } from "../src/game/state.js";
import { isEarthNatural } from "../src/game/focus.js";
import { ELEMENT_BY_SYMBOL } from "../src/data/elements.js";
import { BUILDINGS } from "../src/data/buildings.js";
import { RESEARCH } from "../src/data/research.js";
import { CITY_ORDERS, COUNTRY_WANTS, CRISES } from "../src/data/diplomacy.js";
import { SAVE_SLOTS } from "../src/game/saves.js";
import { computePollution, placeBuilding } from "../src/game/sim.js";

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

test("pedidos de ciudades, países y crisis usan ítems reales", () => {
  for (const city of CITY_ORDERS) {
    for (const id of city.items) assert.ok(getItem(id), `${city.id}:${id}`);
  }
  for (const [code, ids] of Object.entries(COUNTRY_WANTS)) {
    for (const id of ids) assert.ok(getItem(id), `${code}:${id}`);
  }
  for (const c of CRISES) {
    assert.ok(getItem(c.item), c.id);
  }
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

test("un pedido se acepta y se despacha desde España", () => {
  const game = createGame(118);
  ensureOrders(game);
  const offer = game.orders.find((o) => o.status === "offer") || game.orders.find((o) => o.status === "open");
  assert.ok(offer);
  if (offer.status === "offer") assert.equal(acceptOrder(game, offer.id), true);
  addInventory(game, offer.itemId, offer.amount);
  const before = game.reputation;
  assert.equal(fulfillOrder(game, offer.id), true);
  assert.equal(offer.status, "done");
  assert.ok(game.reputation > before);
});

test("se puede rechazar y negociar una oferta", () => {
  const game = createGame(118);
  ensureOrders(game);
  const offer = game.orders.find((o) => o.status === "offer" && !o.crisis);
  assert.ok(offer);
  const amount = offer.amount;
  assert.equal(negotiateOrder(game, offer.id), true);
  assert.ok(offer.amount <= amount);
  assert.equal(offer.status, "open");
  const other = game.orders.find((o) => o.status === "offer");
  if (other) {
    assert.equal(rejectOrder(game, other.id), true);
    assert.equal(other.status, "rejected");
  }
});

test("hay puerto, divisor, filtro y subterránea", () => {
  for (const id of ["port", "splitter", "filter", "underground"]) {
    assert.ok(BUILDINGS[id], id);
  }
  assert.equal(BUILDINGS.port.research, "commerce");
  assert.equal(BUILDINGS.splitter.research, "logistics-2");
});

test("el árbol y el ranking tienen variedad", () => {
  assert.ok(RESEARCH.length >= 40, RESEARCH.length);
  assert.ok(RESEARCH.find((r) => r.id === "commerce"));
  assert.ok(RESEARCH.find((r) => r.id === "aviation"));
  const game = createGame(118);
  game.ordersCompleted = 12;
  game.reputation = 80;
  const { rank, rows } = worldRanking(game);
  assert.ok(rank >= 1 && rank <= rows.length);
  assert.ok(rows.find((r) => r.player));
});

test("hay varias ranuras de guardado y contaminación se calcula", () => {
  assert.ok(SAVE_SLOTS.length >= 4);
  const game = createGame(118);
  assert.equal(computePollution(game), 0);
  const { x, y } = game.world.spawn;
  assert.equal(placeBuilding(game, "furnace", x, y, 0), true);
  assert.ok(computePollution(game) >= 1);
});

test("cargar una partida no castiga pedidos ya caducados", () => {
  const game = createGame(118);
  game.tick = 20000;
  game.orders = [
    { id: "old", status: "open", itemId: "plate-fe", amount: 4, deadline: 10, country: "DE", rewardSci: "sci-mining", rewardN: 1, rep: 3 },
  ];
  const again = deserialize(serialize(game));
  assert.equal(again.orders[0].status, "failed");
  assert.equal(again.reputation, game.reputation);
});

test("una crisis genera titular", () => {
  const game = createGame(118);
  game.researched.logistics = true;
  game.researched.fluids = true;
  game.researched.steel = true;
  const crisis = spawnCrisis(game);
  assert.ok(crisis);
  assert.equal(crisis.kind, "crisis");
  assert.ok(game.headline || game.headlines.length);
});
