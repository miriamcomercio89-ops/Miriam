import test from "node:test";
import { CATALOG_STATS } from "../src/data/catalog.js";

test("imprime tamaño del catálogo", () => {
  console.log(CATALOG_STATS);
});
