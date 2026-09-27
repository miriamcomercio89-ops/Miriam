import { BUILDINGS, BUILDING_LIST } from "../data/buildings.js";
import { ELEMENTS, CATEGORIES, ELEMENT_BY_SYMBOL, elementItemId } from "../data/elements.js";
import { ITEM_BY_ID, RECIPES, searchItems, getItem } from "../data/catalog.js";
import { ERAS, RESEARCH, RESEARCH_BY_ID, isResearched, canResearch } from "../data/research.js";
import { FEATURED, FEATURED_BY_ID } from "../data/highlights.js";
import { PLAYER, COUNTRY_BY_CODE } from "../data/countries.js";
import { serialize, addInventory } from "../game/state.js";
import { handCraft, startResearch, recipeById } from "../game/sim.js";
import { fulfillOrder } from "../game/orders.js";
import { focusDeposit, findDeposit, isEarthNatural, groupProgressOf } from "../game/focus.js";
import { buildChain, chainToHtml } from "../game/chain.js";
import { setMuted, isMuted, sfx } from "../audio/sound.js";

let uiState = {
  modal: null,
  pediaQuery: "",
  pediaSel: "plate-fe",
  pediaTab: "featured",
  periodicSel: "Fe",
  researchKey: "",
  inspectKey: "",
  saveKey: "periodica-save-v3",
};

export function bindUI(game, opts = {}) {
  uiState.saveKey = opts.saveKey || "periodica-save-v3";
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
    localStorage.setItem(uiState.saveKey, serialize(game));
    game.messages.unshift({ t: game.tick, text: "Partida guardada." });
  });
  $("btn-new").addEventListener("click", () => {
    localStorage.removeItem(uiState.saveKey);
    location.reload();
  });
  $("btn-color").addEventListener("click", () => {
    game.colorblind = !game.colorblind;
    document.body.classList.toggle("colorblind", game.colorblind);
  });
  $("btn-mute").addEventListener("click", () => {
    game.muted = !game.muted;
    setMuted(game.muted);
  });
  $("pedia-search").addEventListener("input", (e) => {
    uiState.pediaQuery = e.target.value;
    renderPedia(game);
  });
  document.querySelectorAll("[data-pedia-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.pediaTab = btn.dataset.pediaTab;
      document.querySelectorAll("[data-pedia-tab]").forEach((b) => b.classList.toggle("active", b === btn));
      renderPedia(game);
    });
  });
  buildHotbar(game);
  buildPeriodic(game);
  renderPedia(game);
  renderResearch(game);
  document.body.classList.toggle("colorblind", game.colorblind);
  setMuted(Boolean(game.muted));
}

export function openModal(game, id) {
  closeModals();
  uiState.modal = id;
  const el = document.getElementById(`modal-${id}`);
  if (el) el.hidden = false;
  if (id === "periodic") renderPeriodic(game);
  if (id === "research") renderResearch(game);
  if (id === "pedia") renderPedia(game);
  if (id === "orders") renderOrdersFull(game);
  if (id === "stats") renderStats(game);
  sfx("click");
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
      game.pasteMode = false;
    });
    bar.appendChild(btn);
  }
}

function buildPeriodic(game) {
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
    cell.innerHTML = `<small>${el.z}</small><b>${el.symbol}</b>`;
    cell.dataset.symbol = el.symbol;
    cell.title = `${el.name} (${el.symbol})`;
    cell.addEventListener("click", () => {
      uiState.periodicSel = el.symbol;
      uiState.pediaSel = elementItemId(el.symbol);
      const jumped = focusDeposit(game, el.symbol);
      if (jumped) {
        closeModals();
        game.messages.unshift({ t: game.tick, text: `Yacimiento de ${el.name} (${el.symbol}).` });
      } else {
        renderPeriodic(game);
      }
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
  setStat("stat-power", `${power.produced | 0}/${power.demand | 0}`);
  setStat("stat-rep", `${game.reputation ?? 50} rep`);
  setStat("stat-orders", `${(game.orders || []).filter((o) => o.status === "open").length} pedidos`);
  setStat("stat-tech", `${Object.keys(game.researched).length}/${RESEARCH.length}`);
  setStat("stat-time", `t ${game.tick} · x${game.speed}${game.paused ? " · pausa" : ""}`);
  document.getElementById("btn-pause").textContent = game.paused ? "Reanudar" : "Pausa";
  document.getElementById("btn-speed").textContent = `x${game.speed}`;
  document.getElementById("btn-color").classList.toggle("active", game.colorblind);
  document.getElementById("btn-mute").textContent = isMuted() || game.muted ? "Silencio" : "Sonido";

  document.querySelectorAll(".hot").forEach((btn) => {
    const def = BUILDINGS[btn.dataset.type];
    btn.classList.toggle("selected", game.build.type === def.id && !game.pasteMode);
    btn.classList.toggle("locked", def.research && !isResearched(game, def.research));
  });

  renderOrdersMini(game);
  renderAlerts(game);
  renderMessages(game);
  renderInspect(game);
  renderInventory(game);
  if (uiState.modal === "periodic") renderPeriodic(game);
  if (uiState.modal === "orders") renderOrdersFull(game);
  if (uiState.modal === "stats") renderStats(game);
  if (uiState.modal === "research") {
    const key = `${game.researching?.id || ""}:${Object.keys(game.researched).length}`;
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

function renderOrdersMini(game) {
  const open = (game.orders || []).filter((o) => o.status === "open").slice(0, 4);
  document.getElementById("orders-body").innerHTML = open
    .map((o) => {
      const c = COUNTRY_BY_CODE[o.country];
      const item = getItem(o.itemId);
      const have = game.inventory[o.itemId] ?? 0;
      const left = Math.max(0, Math.ceil((o.deadline - game.tick) / 20));
      return `<div class="order-row">
        <span>${c?.flag || ""} ${c?.name || o.country}</span>
        <span>${have}/${o.amount} ${item?.name ?? o.itemId}</span>
        <span class="muted">${left}s</span>
        <button data-ship="${o.id}" ${have >= o.amount ? "" : "disabled"}>Enviar</button>
      </div>`;
    })
    .join("") || `<p class="muted">${PLAYER.flag} Esperando cable diplomático…</p>`;
  document.querySelectorAll("#orders-body [data-ship]").forEach((btn) => {
    btn.onclick = () => {
      if (!fulfillOrder(game, btn.dataset.ship)) {
        game.messages.unshift({ t: game.tick, text: "No tienes suficiente en el inventario." });
      }
    };
  });
}

function renderOrdersFull(game) {
  const lead = document.getElementById("orders-lead");
  if (lead) {
    lead.textContent = `${PLAYER.flag} ${PLAYER.name} exporta desde la península. Reputación ${game.reputation ?? 50}. Completados: ${game.ordersCompleted ?? 0}.`;
  }
  const box = document.getElementById("orders-full");
  if (!box) return;
  box.innerHTML = (game.orders || [])
    .map((o) => {
      const c = COUNTRY_BY_CODE[o.country];
      const item = getItem(o.itemId);
      const feat = FEATURED_BY_ID[o.itemId];
      const have = game.inventory[o.itemId] ?? 0;
      return `<div class="order-card ${o.status}">
        <h3>${c?.flag || ""} ${c?.name || o.country} · ${c?.region || ""}</h3>
        <p>${o.amount}× <b>${item?.name}</b> ${feat ? `— ${feat.why}` : ""}</p>
        <p>Tienes ${have}. Recompensa: ${o.rewardN} ${getItem(o.rewardSci)?.name} · +${o.rep} rep · ${o.status}</p>
        ${o.status === "open" ? `<button data-ship-full="${o.id}" ${have >= o.amount ? "" : "disabled"}>Despachar desde España</button>` : ""}
      </div>`;
    })
    .join("");
  box.querySelectorAll("[data-ship-full]").forEach((btn) => {
    btn.onclick = () => fulfillOrder(game, btn.dataset.shipFull);
  });
}

function renderAlerts(game) {
  const list = game.alerts || [];
  document.getElementById("alerts-body").innerHTML = list.length
    ? list.map((a) => `<div class="alert ${a.level}">${a.text}</div>`).join("")
    : `<span class="muted">Fábrica estable.</span>`;
}

function renderMessages(game) {
  document.getElementById("messages").innerHTML = game.messages
    .slice(0, 4)
    .map((m) => `<div>${m.text}</div>`)
    .join("");
}

function renderInventory(game) {
  const entries = Object.entries(game.inventory)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);
  document.getElementById("inventory-body").innerHTML = entries
    .map(([id, n]) => {
      const item = getItem(id);
      const logo = item?.symbol ? `<span class="el-mini" style="color:${item.color}">${item.symbol}</span>` : `<i class="swatch" style="background:${item?.color || "#888"}"></i>`;
      return `<div class="inv-row"><span>${logo}${item?.name ?? id}</span><b>${n}</b></div>`;
    })
    .join("");
}

function renderInspect(game) {
  const body = document.getElementById("inspect-body");
  const sel = game.selected;
  const key = !sel
    ? `none:${game.build.type}:${game.pasteMode}`
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
    body.innerHTML = `<p class="muted">Edificio: <b>${BUILDINGS[game.build.type].name}</b>. ${game.pasteMode ? "Pegando plano." : "Arrastra cintas. R rota."}</p>`;
    return;
  }
  if (sel.kind === "tile") {
    const tile = game.world.tiles[sel.y][sel.x];
    const el = tile.deposit ? ELEMENT_BY_SYMBOL[tile.deposit] : null;
    body.innerHTML = `
      <p><b>${tile.terrain}</b> (${sel.x},${sel.y})</p>
      <p>${el ? `Yacimiento: <b>${el.name} (${el.symbol})</b> · Z=${el.z}` : "Sin yacimiento."}</p>
      <p class="muted">${el ? CATEGORIES[el.category].name : ""}</p>`;
    return;
  }
  const b = sel.building;
  const def = BUILDINGS[b.type];
  const rec = b.recipe ? recipeById(b.recipe) : null;
  const options = recOptions(game, b);
  body.innerHTML = `
    <p><b>${def.name}</b></p>
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
    <button id="feed-building">Meter del inventario</button>
  `;
  const select = document.getElementById("recipe-select");
  if (select) select.onchange = () => {
    b.recipe = select.value || null;
    b.progress = 0;
  };
  const feed = document.getElementById("feed-building");
  if (feed) feed.onclick = () => feedBuilding(game, b);
}

function feedBuilding(game, b) {
  const def = BUILDINGS[b.type];
  const recipe = b.recipe ? recipeById(b.recipe) : null;
  const wanted = new Set();
  if (def.fuel) wanted.add(def.fuel);
  if (recipe) recipe.inputs.forEach((i) => wanted.add(i.id));
  if (b.type === "lab") Object.keys(game.inventory).filter((id) => id.startsWith("sci-")).forEach((id) => wanted.add(id));
  let moved = 0;
  for (const id of wanted) {
    const have = game.inventory[id] ?? 0;
    if (have <= 0) continue;
    const n = Math.min(5, have);
    addInventory(game, id, -n);
    b.input[id] = (b.input[id] ?? 0) + n;
    moved += n;
  }
  game.messages.unshift({ t: game.tick, text: moved ? `Has metido ${moved} ítems.` : "Nada que meter." });
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
  return `${ins} → ${out}  (${r.time}s)`;
}

function researchGate(el) {
  if (el.category === "lanthanide") return "rare-earths";
  if (el.category === "actinide" || el.z >= 84) return "nuclear";
  if (el.category === "noble") return "noble-gases";
  if (el.abundance === "common") return "start";
  if (el.abundance === "uncommon") return "metallurgy";
  return "advanced-metals";
}

function renderPeriodic(game) {
  const owned = new Set();
  const onmap = new Set();
  for (const [id, n] of Object.entries(game.inventory)) {
    if (n > 0) getItem(id)?.elements.forEach((s) => owned.add(s));
  }
  for (const n of Object.keys(game.produced)) getItem(n)?.elements.forEach((s) => owned.add(s));
  for (const row of game.world.tiles) {
    for (const t of row) if (t.deposit && ELEMENT_BY_SYMBOL[t.deposit]) onmap.add(t.deposit);
  }
  document.querySelectorAll("#periodic-grid .el[data-symbol]").forEach((cell) => {
    const sym = cell.dataset.symbol;
    const el = ELEMENT_BY_SYMBOL[sym];
    cell.classList.toggle("owned", owned.has(sym));
    cell.classList.toggle("onmap", onmap.has(sym));
    cell.classList.toggle("locked", !isResearched(game, researchGate(el)));
    cell.classList.toggle("synthetic", !isEarthNatural(el));
    cell.classList.toggle("selected-el", uiState.periodicSel === sym);
  });
  const gp = document.getElementById("group-progress");
  if (gp) {
    gp.innerHTML = Object.values(CATEGORIES)
      .map((c) => {
        const p = groupProgressOf(game, c.id, getItem);
        return `<span class="chip" style="color:${c.color}">${c.name} ${p.have}/${p.total}${p.done ? " ✓" : ""}</span>`;
      })
      .join(" ");
  }
  const el = ELEMENT_BY_SYMBOL[uiState.periodicSel];
  if (!el) return;
  const here = findDeposit(game, el.symbol);
  const derived = [...ITEM_BY_ID.values()].filter((i) => i.kind === "named" && i.elements.includes(el.symbol)).slice(0, 10);
  document.getElementById("periodic-detail").innerHTML = `
    <h3>${el.name} · ${el.symbol} · Z=${el.z}</h3>
    <p>${CATEGORIES[el.category].name} · ${isEarthNatural(el) ? "natural en la Tierra" : "sintético / laboratorio"}</p>
    <p>${here ? `Yacimiento en (${here.x},${here.y}) — clic en la celda para ir.` : "No hay yacimiento. Se obtiene por síntesis."}</p>
    <p>${derived.map((i) => `<span class="chip">${i.name}</span>`).join(" ")}</p>
  `;
}

function renderResearch(game) {
  const box = document.getElementById("research-tree");
  const prog = document.getElementById("research-progress");
  if (!box || !prog) return;
  if (game.researching) {
    const node = RESEARCH_BY_ID[game.researching.id];
    const parts = Object.entries(node.cost)
      .map(([id, n]) => `${game.scienceBuffer[id] ?? 0}/${n} ${getItem(id)?.name ?? id}`)
      .join(" · ");
    prog.textContent = `En curso: ${node.name} (${parts}).`;
  } else {
    prog.textContent = "Elige una tarjeta. Los laboratorios comen ciencia.";
  }
  box.innerHTML = ERAS.map((era) => {
    const nodes = RESEARCH.filter((r) => r.era === era.id)
      .map((r) => {
        const done = isResearched(game, r.id);
        const avail = canResearch(game, r);
        const busy = game.researching?.id === r.id;
        const cost = Object.entries(r.cost).map(([id, n]) => `${n} ${getItem(id)?.name ?? id}`).join(", ") || "gratis";
        return `<button class="node ${done ? "done" : busy ? "busy" : avail ? "available" : ""}" data-tech="${r.id}">
          <b>${r.name}</b><div class="muted">${r.desc}</div><div>${cost}</div>
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
  let hits;
  if (uiState.pediaTab === "featured" && !uiState.pediaQuery.trim()) {
    hits = FEATURED.map((f) => getItem(f.id)).filter(Boolean);
  } else {
    hits = searchItems(uiState.pediaQuery, 80);
  }
  list.innerHTML = hits
    .map((item) => `<button class="list-row" data-item="${item.id}"><span>${item.name}</span><span class="muted">${item.kind}</span></button>`)
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
  const feat = FEATURED_BY_ID[item.id];
  const recs = item.recipes ?? [];
  const chain = buildChain(item.id);
  detail.innerHTML = `
    <h3>${item.name}</h3>
    <p>${feat?.blurb || item.desc || ""}</p>
    <p>${(item.elements || []).map((s) => `<span class="chip">${s}</span>`).join("")}</p>
    ${recs
      .map((r) => {
        const can = !r.research || isResearched(game, r.research);
        return `<div class="recipe-line"><div>${recipeText(r)}</div>
          <button data-craft="${r.id}" ${can && !r.deposit ? "" : "disabled"}>Craftear 1</button></div>`;
      })
      .join("")}
    <h4>Desde cero</h4>
    <div class="chain">${chainToHtml(chain)}</div>
  `;
  detail.querySelectorAll("[data-craft]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = recipeById(btn.dataset.craft);
      if (r && !handCraft(game, r, 1)) game.messages.unshift({ t: game.tick, text: "Te faltan materiales." });
    });
  });
}

function renderStats(game) {
  const body = document.getElementById("stats-body");
  if (!body) return;
  const entries = Object.entries(game.rates || {}).sort((a, b) => b[1] - a[1]).slice(0, 16);
  const max = entries[0]?.[1] || 1;
  body.innerHTML = entries.length
    ? entries
        .map(([id, n]) => {
          const item = getItem(id);
          const w = Math.round((n / max) * 100);
          return `<div class="stat-bar"><span>${item?.name ?? id}</span>
            <div class="progress"><span style="width:${w}%"></span></div>
            <b>${n}/min</b></div>`;
        })
        .join("")
    : `<p class="muted">Cuando la fábrica produzca, aquí verás el ritmo.</p>`;
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
