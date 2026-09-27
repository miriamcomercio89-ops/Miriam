import assert from "node:assert/strict";
import test from "node:test";
import { ITEMS, getItem } from "../src/data/catalog.js";
import { BUILDING_LIST } from "../src/data/buildings.js";
import { logoSpec, itemLogoUrl, factoryLogoUrl, logoImg, factoryImg } from "../src/render/logos.js";

test("cada producto del catálogo tiene un logo con familia y glifo", () => {
  assert.ok(ITEMS.length >= 2000);
  const families = new Set();
  const glyphs = new Set();
  for (const item of ITEMS) {
    const spec = logoSpec(item);
    assert.ok(spec.family, item.id);
    assert.ok(spec.glyph, item.id);
    assert.ok(spec.color, item.id);
    families.add(spec.family);
    glyphs.add(spec.glyph);
  }
  for (const fam of ["element", "ore", "fluid", "form", "compound", "named", "science"]) {
    assert.ok(families.has(fam), fam);
  }
  assert.ok(glyphs.size >= 40, `glifos: ${glyphs.size}`);
});

test("productos clave tienen un dibujo propio, no un cajón genérico", () => {
  const expect = {
    "gear-basic": "gear",
    "ev-car": "car",
    phone: "phone",
    "bottle-glass": "bottle",
    steel: "ingot",
    "circuit-basic": "chip",
    "sci-mining": "science",
    "ore-fe": "ore",
    water: "drop",
    "ingot-fe": "ingot",
    "plate-cu": "plate",
    "wire-cu": "wire",
  };
  for (const [id, glyph] of Object.entries(expect)) {
    assert.equal(logoSpec(getItem(id)).glyph, glyph, id);
  }
});

test("cada fábrica tiene imagen y las URLs de logo son data:", () => {
  for (const def of BUILDING_LIST) {
    const url = factoryLogoUrl(def.id);
    assert.ok(url.startsWith("data:image/"), def.id);
    assert.ok(factoryImg(def.id).includes("img"));
  }
  const itemUrl = itemLogoUrl("gear-basic");
  assert.ok(itemUrl.startsWith("data:image/"));
  assert.ok(logoImg("steel").includes("Acero"));
});
