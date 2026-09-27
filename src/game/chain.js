import { getItem } from "../data/catalog.js";
import { logoImg } from "../render/logos.js";

const RAW = new Set(["element", "ore", "fluid"]);

export function buildChain(itemId, seen = new Set(), depth = 0) {
  if (!itemId || seen.has(itemId) || depth > 8) return null;
  const item = getItem(itemId);
  if (!item) return null;
  seen.add(itemId);
  const recipe = (item.recipes || []).find((r) => r.output?.id === itemId && !r.science) || item.recipes?.[0];
  if (!recipe || recipe.deposit || RAW.has(item.kind)) {
    return { item, recipe: recipe || null, inputs: [], raw: true };
  }
  return {
    item,
    recipe,
    raw: false,
    inputs: recipe.inputs.map((inp) => ({
      n: inp.n,
      node: buildChain(inp.id, new Set(seen), depth + 1),
    })),
  };
}

export function chainToHtml(node, depth = 0) {
  if (!node) return "";
  const name = node.item.name;
  const mark = node.raw ? "yacimiento / elemento" : node.recipe?.building || "";
  const kids = (node.inputs || [])
    .filter((x) => x.node)
    .map((x) => `<div class="chain-branch">${x.n}× ${chainToHtml(x.node, depth + 1)}</div>`)
    .join("");
  return `<div class="chain-node" style="margin-left:${depth * 8}px">
    <div class="with-logo">${logoImg(node.item.id, "logo xs")}<b>${name}</b> <span class="muted">${mark}</span></div>
    ${kids}
  </div>`;
}
