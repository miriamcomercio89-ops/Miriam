import { BUILDINGS, BUILDING_LIST } from "../data/buildings.js";
import { ELEMENTS, CATEGORIES, ELEMENT_BY_SYMBOL, elementItemId } from "../data/elements.js";
import { CATALOG_STATS, ITEM_BY_ID, RECIPES, searchItems, getItem } from "../data/catalog.js";
import { ERAS, RESEARCH, RESEARCH_BY_ID, isResearched, canResearch } from "../data/research.js";
import { serialize, addInventory } from "../game/state.js";
import { handCraft, startResearch, recipeById } from "../game/sim.js";

let uiState = {
  modal: null,
  pediaQuery: "",
  pediaSel: "plate-fe",
  periodicSel: "Fe",
  researchKey: "",
  inspectKey: "",
};

const TUTORIAL = [
  { id: "extract", text: "Coloca un extractor sobre hierro (Fe) o carbón (C)." },
  { id: "power", text: "Construye un generador de carbón y llévale carbono." },
  { id: "smelt", text: "Pon un horno y conéctalo con cintas. Funde mineral + carbón." },
  { id: "science", text: "Fabrica ciencia de minería y ábrela en Ciencia (T)." },
  { id: "explore", text: "Explora la tabla (P) y la enciclopedia (E)." },
];

export function bindUI(game) {
  const $ = (id) => document.getElementById(id);
  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(game, btn.dataset.modal));
  });
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModals());
  });
  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModals();
    });
  });
  $("btn-pause").addEventListener("click", () => {
    game.paused = !game.paused;
  });
  $("btn-speed").addEventListener("click", () => {
    game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 3 : 1;
  });
  $("btn-save").addEventListener("click", () => {
    localStorage.setItem("periodica-save-v2", serialize(game));
    game.messages.unshift({ t: game.tick, text: "Partida guardada en este navegador." });
  });
  $("pedia-search").addEventListener("input", (e) => {
    uiState.pediaQuery = e.target.value;
    renderPedia(game);
  });
  buildHotbar(game);
  buildPeriodic();
  renderPedia(game);
  renderResearch(game);
}

export function openModal(game, id) {
  closeModals();
  uiState.modal = id;
  const el = document.getElementById(`modal-${id}`);
  if (el) el.hidden = false;
  if (id === "periodic") renderPeriodic(game);
  if (id === "research") renderResearch(game);
  if (id === "pedia") renderPedia(game);
}

export function closeModals() {
  uiState.modal = null;
  document.querySelectorAll(".modal").forEach((m) => {
    m.hidden = true;
  });
}

export function isModalOpen() {
  return Boolean(uiState.modal);
}

function buildHotbar(game) {
  const bar = document.getElementById("hotbar");
  bar.innerHTML = "";
  for (const def of BUILDING_LIST) {
    const btn = document.createElement("button");
    btn.className = "hot";
    btn.dataset.type = def.id;
    btn.title = `${def.name}: ${def.desc}`;
    btn.innerHTML = `<span class="ico">${def.icon}</span><small>${def.name}</small>`;
    btn.addEventListener("click", () => {
      game.build.type = def.id;
    });
    btn.addEventListener("mouseenter", (e) => showTip(e, `${def.name}<br>${def.desc}<br>Coste: ${costText(def.cost)}`));
    btn.addEventListener("mouseleave", hideTip);
    bar.appendChild(btn);
  }
}

function costText(cost) {
  return Object.entries(cost)
    .map(([id, n]) => `${n} ${getItem(id)?.name ?? id}`)
    .join(", ");
}

function buildPeriodic() {
  const grid = document.getElementById("periodic-grid");
  grid.innerHTML = "";
  const cells = Array.from({ length: 9 * 18 }, () => null);
  for (const el of ELEMENTS) {
    const { col, row } = tablePos(el);
    cells[(row - 1) * 18 + (col - 1)] = el;
  }
  cells.forEach((el) => {
    const cell = document.createElement("button");
    if (!el) {
      cell.className = "el";
      cell.style.visibility = "hidden";
      grid.appendChild(cell);
      return;
    }
    cell.className = "el";
    cell.style.color = el.color;
    cell.innerHTML = `<b>${el.symbol}</b>${el.z}`;
    cell.dataset.symbol = el.symbol;
    cell.addEventListener("click", () => {
      uiState.periodicSel = el.symbol;
      uiState.pediaSel = elementItemId(el.symbol);
    });
    grid.appendChild(cell);
  });
}

function tablePos(el) {
  if (el.category === "lanthanide") return { col: el.z - 54, row: 8 };
  if (el.category === "actinide") return { col: el.z - 86, row: 9 };
  return { col: el.group, row: el.period };
}

export function renderUI(game) {
  const power = game.power ?? { produced: 0, demand: 0, satisfaction: 1 };
  setStat("stat-power", `${power.produced | 0}/${power.demand | 0} (${Math.round((power.satisfaction ?? 1) * 100)}%)`);
  setStat("stat-items", `${CATALOG_STATS.items} ítems`);
  setStat("stat-tech", `${Object.keys(game.researched).length}/${RESEARCH.length}`);
  setStat("stat-time", `t ${game.tick} · x${game.speed}${game.paused ? " · pausa" : ""}`);
  document.getElementById("btn-pause").textContent = game.paused ? "Reanudar" : "Pausa";
  document.getElementById("btn-speed").textContent = `x${game.speed}`;

  document.querySelectorAll(".hot").forEach((btn) => {
    const def = BUILDINGS[btn.dataset.type];
    btn.classList.toggle("selected", game.build.type === def.id);
    btn.classList.toggle("locked", def.research && !isResearched(game, def.research));
  });

  renderTutorial(game);
  renderMessages(game);
  renderInspect(game);
  renderInventory(game);
  if (uiState.modal === "periodic") renderPeriodic(game);
  if (uiState.modal === "research") {
    const key = `${game.researching?.id || ""}:${Object.keys(game.researched).length}:${JSON.stringify(game.scienceBuffer)}`;
    if (key !== uiState.researchKey) {
      uiState.researchKey = key;
      renderResearch(game);
    }
  }
}

function setStat(id, text) {
  const b = document.querySelector(`#${id} b`);
  if (b) b.textContent = text;
}

function renderTutorial(game) {
  const haveExtractor = Object.values(game.buildings).some((b) => b.type === "extractor");
  const havePower = (game.power?.produced ?? 0) > 0;
  const haveFurnace = Object.values(game.buildings).some((b) => b.type === "furnace");
  const haveSci = (game.produced["sci-mining"] ?? 0) > 0 || (game.inventory["sci-mining"] ?? 0) > 0;
  const done = [haveExtractor, havePower, haveFurnace, haveSci, haveSci];
  const list = document.getElementById("tutorial-list");
  list.innerHTML = TUTORIAL.map((step, i) => {
    const cls = done[i] ? "done" : done[i - 1] || i === 0 ? "now" : "";
    return `<li class="${cls}">${step.text}</li>`;
  }).join("");
}

function renderMessages(game) {
  document.getElementById("messages").innerHTML = game.messages
    .slice(0, 5)
    .map((m) => `<div>${m.text}</div>`)
    .join("");
}

function renderInventory(game) {
  const entries = Object.entries(game.inventory)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);
  document.getElementById("inventory-body").innerHTML = entries
    .map(([id, n]) => {
      const item = getItem(id);
      return `<div class="inv-row"><span><i class="swatch" style="background:${item?.color || "#888"}"></i>${item?.name ?? id}</span><b>${n}</b></div>`;
    })
    .join("");
}

function renderInspect(game) {
  const body = document.getElementById("inspect-body");
  const sel = game.selected;
  const key = !sel
    ? `none:${game.build.type}`
    : sel.kind === "tile"
      ? `tile:${sel.x},${sel.y}`
      : `b:${sel.x},${sel.y}:${sel.building.recipe}`;
  const live = document.getElementById("inspect-live");
  if (live && key === uiState.inspectKey && sel?.kind === "building") {
    const b = sel.building;
    live.innerHTML = `<div class="progress"><span style="width:${Math.round((b.progress || 0) * 100)}%"></span></div>
      <p>Entrada: ${fmtBuf(b.input)}<br>Salida: ${fmtBuf(b.output)}</p>`;
    return;
  }
  uiState.inspectKey = key;
  if (!sel) {
    body.innerHTML = `<p class="muted">Edificio activo: <b>${BUILDINGS[game.build.type].name}</b>. Rota con R.</p>`;
    return;
  }
  if (sel.kind === "tile") {
    const tile = game.world.tiles[sel.y][sel.x];
    const el = tile.deposit ? ELEMENT_BY_SYMBOL[tile.deposit] : null;
    body.innerHTML = `
      <p><b>${tile.terrain}</b> (${sel.x},${sel.y})</p>
      <p>${el ? `Yacimiento: <b>${el.name} (${el.symbol})</b> · reserva ${tile.reserve}` : "Sin yacimiento."}</p>
      <p class="muted">${el ? CATEGORIES[el.category].name : ""}</p>`;
    return;
  }
  const b = sel.building;
  const def = BUILDINGS[b.type];
  const rec = b.recipe ? recipeById(b.recipe) : null;
  const options = recOptions(game, b);
  body.innerHTML = `
    <p><b>${def.icon} ${def.name}</b></p>
    <p>${def.desc}</p>
    <div id="inspect-live">
    <div class="progress"><span style="width:${Math.round((b.progress || 0) * 100)}%"></span></div>
    <p>Entrada: ${fmtBuf(b.input)}<br>Salida: ${fmtBuf(b.output)}</p>
    </div>
    <label>Receta
      <select id="recipe-select">${options
        .map((r) => `<option value="${r.id}" ${r.id === b.recipe ? "selected" : ""}>${r.name}</option>`)
        .join("")}</select>
    </label>
    ${rec ? `<p class="muted">${recipeText(rec)}</p>` : ""}
    <button id="feed-building">Meter materiales del inventario</button>
  `;
  const select = document.getElementById("recipe-select");
  if (select) {
    select.onchange = () => {
      b.recipe = select.value || null;
      b.progress = 0;
    };
  }
  const feed = document.getElementById("feed-building");
  if (feed) {
    feed.onclick = () => feedBuilding(game, b);
  }
}

function feedBuilding(game, b) {
  const def = BUILDINGS[b.type];
  const recipe = b.recipe ? recipeById(b.recipe) : null;
  const wanted = new Set();
  if (def.fuel) wanted.add(def.fuel);
  if (recipe) recipe.inputs.forEach((i) => wanted.add(i.id));
  if (b.type === "lab") {
    Object.keys(game.inventory)
      .filter((id) => id.startsWith("sci-"))
      .forEach((id) => wanted.add(id));
  }
  let moved = 0;
  for (const id of wanted) {
    const have = game.inventory[id] ?? 0;
    if (have <= 0) continue;
    const n = Math.min(5, have);
    addInventory(game, id, -n);
    b.input[id] = (b.input[id] ?? 0) + n;
    moved += n;
  }
  game.messages.unshift({
    t: game.tick,
    text: moved ? `Has metido ${moved} ítems en el edificio.` : "No tienes materiales que este edificio acepte.",
  });
}

function recOptions(game, b) {
  const tile = game.world.tiles[b.y][b.x];
  return RECIPES.filter((r) => r.building === b.type && !r.science)
    .filter((r) => !r.research || isResearched(game, r.research))
    .filter((r) => {
      if (b.type !== "extractor" && b.type !== "pump") return true;
      const dep = tile.deposit || (tile.terrain === "water" ? "water" : null);
      return r.deposit === dep;
    });
}

function fmtBuf(buf) {
  const e = Object.entries(buf || {}).filter(([, n]) => n > 0);
  if (!e.length) return "—";
  return e.map(([id, n]) => `${n} ${getItem(id)?.name ?? id}`).join(", ");
}

function recipeText(r) {
  const ins = r.inputs.map((i) => `${i.n}× ${getItem(i.id)?.name ?? i.id}`).join(" + ") || "yacimiento";
  const out = r.output?.n ? `${r.output.n}× ${getItem(r.output.id)?.name}` : "ciencia";
  return `${ins} → ${out}  (${r.time}s, ${r.building})`;
}

function renderPeriodic(game) {
  const owned = new Set();
  const onmap = new Set();
  for (const [id, n] of Object.entries(game.inventory)) {
    const item = getItem(id);
    if (n > 0 && item) item.elements.forEach((s) => owned.add(s));
  }
  for (const n of Object.keys(game.produced)) {
    const item = getItem(n);
    if (item) item.elements.forEach((s) => owned.add(s));
  }
  for (const row of game.world.tiles) {
    for (const t of row) if (t.deposit && ELEMENT_BY_SYMBOL[t.deposit]) onmap.add(t.deposit);
  }
  document.querySelectorAll("#periodic-grid .el[data-symbol]").forEach((cell) => {
    const sym = cell.dataset.symbol;
    const el = ELEMENT_BY_SYMBOL[sym];
    cell.classList.toggle("owned", owned.has(sym));
    cell.classList.toggle("onmap", onmap.has(sym));
    cell.classList.toggle("locked", !isResearched(game, researchGate(el)));
  });
  const el = ELEMENT_BY_SYMBOL[uiState.periodicSel];
  if (!el) return;
  const derived = [...ITEM_BY_ID.values()].filter((i) => i.elements.includes(el.symbol)).slice(0, 24);
  document.getElementById("periodic-detail").innerHTML = `
    <h3>${el.name} · ${el.symbol} · Z=${el.z}</h3>
    <p>${CATEGORIES[el.category].name} · masa ${el.mass} · ${el.phase} · ${el.abundance}${el.radioactive ? " · radiactivo" : ""}</p>
    <p>${derived.map((i) => `<span class="chip">${i.name}</span>`).join(" ")}</p>
  `;
}

function researchGate(el) {
  if (el.category === "lanthanide") return "rare-earths";
  if (el.category === "actinide" || el.z >= 84) return "nuclear";
  if (el.category === "noble") return "noble-gases";
  if (el.abundance === "common") return "start";
  if (el.abundance === "uncommon") return "metallurgy";
  return "advanced-metals";
}

function renderResearch(game) {
  const box = document.getElementById("research-tree");
  const prog = document.getElementById("research-progress");
  if (game.researching) {
    const node = RESEARCH_BY_ID[game.researching.id];
    const parts = Object.entries(node.cost)
      .map(([id, n]) => `${game.scienceBuffer[id] ?? 0}/${n} ${getItem(id)?.name ?? id}`)
      .join(" · ");
    prog.textContent = `En curso: ${node.name} (${parts}). Lleva los paquetes a un laboratorio.`;
  } else {
    prog.textContent = "Elige una tarjeta disponible. Los laboratorios consumen ciencia automáticamente.";
  }
  box.innerHTML = ERAS.map((era) => {
    const nodes = RESEARCH.filter((r) => r.era === era.id)
      .map((r) => {
        const done = isResearched(game, r.id);
        const avail = canResearch(game, r);
        const busy = game.researching?.id === r.id;
        const cls = done ? "done" : busy ? "busy" : avail ? "available" : "";
        const cost = Object.entries(r.cost)
          .map(([id, n]) => `${n} ${getItem(id)?.name ?? id}`)
          .join(", ") || "gratis";
        return `<button class="node ${cls}" data-tech="${r.id}">
          <b>${r.name}</b>
          <div class="muted">${r.desc}</div>
          <div>${cost}</div>
        </button>`;
      })
      .join("");
    return `<section class="era"><h3 style="color:${era.color}">${era.name}</h3><div class="era-nodes">${nodes}</div></section>`;
  }).join("");
  box.querySelectorAll("[data-tech]").forEach((btn) => {
    btn.addEventListener("click", () => startResearch(game, btn.dataset.tech));
  });
}

function renderPedia(game) {
  const list = document.getElementById("pedia-list");
  const hits = searchItems(uiState.pediaQuery, 80);
  list.innerHTML = hits
    .map((item) => {
      return `<button class="list-row" data-item="${item.id}"><span><i class="swatch" style="background:${item.color}"></i>${item.name}</span><span class="muted">${item.kind}</span></button>`;
    })
    .join("");
  list.querySelectorAll("[data-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.pediaSel = btn.dataset.item;
      renderPedia(game);
    });
  });
  const item = getItem(uiState.pediaSel) ?? hits[0];
  const detail = document.getElementById("pedia-detail");
  if (!item) {
    detail.innerHTML = "";
    return;
  }
  const recs = item.recipes ?? [];
  detail.innerHTML = `
    <h3>${item.name}</h3>
    <p>${item.desc || ""}</p>
    <p>${(item.elements || []).map((s) => `<span class="chip">${s}</span>`).join("")}</p>
    ${recs
      .map((r) => {
        const can = !r.research || isResearched(game, r.research);
        return `<div class="recipe-line">
          <div>${recipeText(r)}</div>
          <button data-craft="${r.id}" ${can && !r.deposit ? "" : "disabled"}>Craftear 1</button>
        </div>`;
      })
      .join("") || "<p class='muted'>Sin receta (recurso bruto o ciencia).</p>"}
  `;
  detail.querySelectorAll("[data-craft]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = recipeById(btn.dataset.craft);
      if (r) {
        const n = handCraft(game, r, 1);
        if (!n) game.messages.unshift({ t: game.tick, text: "Te faltan materiales en el inventario." });
      }
    });
  });
}

export function showTip(e, html) {
  const tip = document.getElementById("tooltip");
  tip.hidden = false;
  tip.innerHTML = html;
  tip.style.left = `${e.clientX + 12}px`;
  tip.style.top = `${e.clientY + 12}px`;
}

export function hideTip() {
  document.getElementById("tooltip").hidden = true;
}

export function takeFromChest(game, building, id) {
  if ((building.input[id] ?? 0) <= 0) return;
  building.input[id] -= 1;
  addInventory(game, id, 1);
}
