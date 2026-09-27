import { BUILDINGS, BUILDING_LIST } from "../data/buildings.js";
import { ELEMENTS, CATEGORIES, ELEMENT_BY_SYMBOL, elementItemId } from "../data/elements.js";
import { ITEM_BY_ID, RECIPES, searchItems, getItem } from "../data/catalog.js";
import { ERAS, RESEARCH, RESEARCH_BY_ID, isResearched, canResearch } from "../data/research.js";
import { FEATURED, FEATURED_BY_ID } from "../data/highlights.js";
import { PLAYER, COUNTRY_BY_CODE } from "../data/countries.js";
import { serialize, addInventory } from "../game/state.js";
import { handCraft, startResearch, recipeById } from "../game/sim.js";
import { fulfillOrder, acceptOrder, rejectOrder, negotiateOrder, availableCount, labelOf, worldRanking } from "../game/orders.js";
import { focusDeposit, findDeposit, isEarthNatural, groupProgressOf } from "../game/focus.js";
import { buildChain, chainToHtml } from "../game/chain.js";
import { setMuted, isMuted, sfx } from "../audio/sound.js";
import { listSaves, writeSave, clearSave, resolveSaveKey } from "../game/saves.js";

let uiState = {
  modal: null,
  pediaQuery: "",
  pediaSel: "plate-fe",
  pediaTab: "featured",
  periodicSel: "Fe",
  researchKey: "",
  inspectKey: "",
  saveKey: "periodica-save-v4",
};

export function bindUI(game, opts = {}) {
  uiState.saveKey = opts.saveKey || resolveSaveKey();
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
    writeSave(uiState.saveKey, serialize(game));
    game.messages.unshift({ t: game.tick, text: `Partida guardada (${uiState.saveKey.includes("slot") ? "ranura" : "auto"}).` });
  });
  $("btn-new").addEventListener("click", () => {
    clearSave(uiState.saveKey);
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
  if (id === "rank") renderRank(game);
  if (id === "saves") renderSaves(game);
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
  const rank = worldRanking(game);
  setStat("stat-power", `${power.produced | 0}/${power.demand | 0}`);
  setStat("stat-rep", `${game.reputation ?? 50} rep`);
  setStat("stat-eu", `${game.repEU ?? 50} UE`);
  setStat("stat-rank", `#${rank.rank}`);
  setStat("stat-pollution", `${game.pollution ?? 0}`);
  setStat("stat-orders", `${(game.orders || []).filter((o) => o.status === "open" || o.status === "offer").length} pedidos`);
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
  renderPin(game);
  renderNews(game);
  renderAlerts(game);
  renderMessages(game);
  renderInspect(game);
  renderInventory(game);
  if (uiState.modal === "periodic") renderPeriodic(game);
  if (uiState.modal === "orders") renderOrdersFull(game);
  if (uiState.modal === "stats") renderStats(game);
  if (uiState.modal === "rank") renderRank(game);
  if (uiState.modal === "saves") renderSaves(game);
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

function bindOrderButtons(game, root) {
  root.querySelectorAll("[data-ship]").forEach((btn) => {
    btn.onclick = () => {
      if (!fulfillOrder(game, btn.dataset.ship)) {
        game.messages.unshift({ t: game.tick, text: "No tienes suficiente para enviar." });
      }
    };
  });
  root.querySelectorAll("[data-accept]").forEach((btn) => {
    btn.onclick = () => acceptOrder(game, btn.dataset.accept);
  });
  root.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.onclick = () => rejectOrder(game, btn.dataset.reject);
  });
  root.querySelectorAll("[data-nego]").forEach((btn) => {
    btn.onclick = () => negotiateOrder(game, btn.dataset.nego);
  });
}

function orderActions(o, have) {
  if (o.status === "offer") {
    return `<div class="order-actions">
      <button data-accept="${o.id}">Aceptar</button>
      <button data-reject="${o.id}">Rechazar</button>
      ${o.crisis || o.negotiated ? "" : `<button data-nego="${o.id}">Negociar</button>`}
    </div>`;
  }
  if (o.status === "open") {
    return `<div class="order-actions">
      <button data-ship="${o.id}" ${have >= o.amount ? "" : "disabled"}>Enviar</button>
      ${o.crisis || o.negotiated ? "" : `<button data-nego="${o.id}">Negociar</button>`}
    </div>`;
  }
  return "";
}

function renderOrdersMini(game) {
  const open = (game.orders || []).filter((o) => o.status === "open" || o.status === "offer").slice(0, 4);
  const box = document.getElementById("orders-body");
  box.innerHTML = open
    .map((o) => {
      const item = getItem(o.itemId);
      const have = availableCount(game, o.itemId);
      const left = Math.max(0, Math.ceil((o.deadline - game.tick) / 20));
      const tag = o.crisis ? "crisis" : o.eu ? "ue" : o.kind === "city" ? "ciudad" : "";
      return `<div class="order-row ${o.status}">
        <span>${labelOf(o)} ${tag ? `<small class="chip">${tag}</small>` : ""}</span>
        <span>${have}/${o.amount} ${item?.name ?? o.itemId}</span>
        <span class="muted">${left}s · ${o.status === "offer" ? "oferta" : "aceptado"}</span>
        ${orderActions(o, have)}
      </div>`;
    })
    .join("") || `<p class="muted">${PLAYER.flag} Esperando cable diplomático…</p>`;
  bindOrderButtons(game, box);
}

function renderOrdersFull(game) {
  const lead = document.getElementById("orders-lead");
  if (lead) {
    lead.textContent = `${PLAYER.flag} ${PLAYER.name} exporta desde la península. Mundo ${game.reputation ?? 50} · UE ${game.repEU ?? 50} · Completados ${game.ordersCompleted ?? 0} · Crisis ${game.crisesSolved ?? 0}.`;
  }
  const box = document.getElementById("orders-full");
  if (!box) return;
  box.innerHTML = (game.orders || [])
    .map((o) => {
      const c = COUNTRY_BY_CODE[o.country];
      const item = getItem(o.itemId);
      const feat = FEATURED_BY_ID[o.itemId];
      const have = availableCount(game, o.itemId);
      return `<div class="order-card ${o.status}">
        <h3>${labelOf(o)} · ${c?.region || (o.kind === "city" ? "España" : o.kind)}</h3>
        <p>${o.amount}× <b>${item?.name}</b> ${feat ? `— ${feat.why}` : ""} ${o.note && o.note !== feat?.why ? `· ${o.note}` : ""}</p>
        <p>Tienes ${have} (inventario + puerto). Recompensa: ${o.rewardN} ${getItem(o.rewardSci)?.name} · +${o.rep} rep · ${o.status}</p>
        ${orderActions(o, have)}
      </div>`;
    })
    .join("");
  bindOrderButtons(game, box);
}

function renderPin(game) {
  const body = document.getElementById("pin-body");
  if (!body) return;
  if (!game.pinned) {
    body.innerHTML = `<span class="muted">En Recetas, pulsa Fijar para no perder de vista una cadena.</span>`;
    return;
  }
  const item = getItem(game.pinned);
  const rec = item?.recipes?.[0];
  if (!item || !rec) {
    body.innerHTML = `<span class="muted">No hay receta para ${game.pinned}.</span>`;
    return;
  }
  const rows = rec.inputs
    .map((i) => {
      const have = game.inventory[i.id] ?? 0;
      const name = getItem(i.id)?.name ?? i.id;
      const ok = have >= i.n;
      return `<div class="inv-row ${ok ? "" : "missing"}"><span>${name}</span><b>${have}/${i.n}</b></div>`;
    })
    .join("");
  body.innerHTML = `<p><b>${item.name}</b></p>${rows}<button id="unpin">Quitar</button>`;
  const unpin = document.getElementById("unpin");
  if (unpin) unpin.onclick = () => {
    game.pinned = null;
    renderPin(game);
  };
}

function renderNews(game) {
  const body = document.getElementById("news-body");
  if (!body) return;
  const list = game.headlines || [];
  if (!list.length && !game.headline) {
    body.innerHTML = `<span class="muted">Sin crisis en el teletipo.</span>`;
    return;
  }
  body.innerHTML = (list.length ? list : [{ text: game.headline }])
    .slice(0, 3)
    .map((h) => `<div class="news-line">${h.text}</div>`)
    .join("");
}

function renderRank(game) {
  const box = document.getElementById("rank-body");
  const lead = document.getElementById("rank-lead");
  const { rank, total, rows } = worldRanking(game);
  if (lead) lead.textContent = `${PLAYER.flag} España es la #${rank} de ${total}. Reputación ${game.reputation ?? 50}, UE ${game.repEU ?? 50}.`;
  if (!box) return;
  box.innerHTML = rows
    .slice(0, 16)
    .map((r, i) => `<div class="rank-row ${r.player ? "player" : ""}"><b>#${i + 1}</b><span>${r.flag} ${r.name}</span><b>${r.score}</b></div>`)
    .join("");
}

function renderSaves(game) {
  const box = document.getElementById("saves-body");
  if (!box) return;
  const slots = listSaves();
  box.innerHTML = slots
    .map((s) => {
      const active = s.id === uiState.saveKey;
      const info = s.empty ? "vacía" : `t ${s.tick} · ${s.rep} rep · ${s.orders} pedidos`;
      return `<div class="save-row ${active ? "active" : ""}">
        <div><b>${s.label}</b><div class="muted">${info}</div></div>
        <div class="order-actions">
          <button data-save-write="${s.id}">Guardar aquí</button>
          <button data-save-load="${s.id}" ${s.empty ? "disabled" : ""}>Cargar</button>
          <button data-save-clear="${s.id}" ${s.empty ? "disabled" : ""}>Borrar</button>
        </div>
      </div>`;
    })
    .join("");
  box.querySelectorAll("[data-save-write]").forEach((btn) => {
    btn.onclick = () => {
      writeSave(btn.dataset.saveWrite, serialize(game));
      uiState.saveKey = btn.dataset.saveWrite;
      game.messages.unshift({ t: game.tick, text: `Guardado en ${btn.dataset.saveWrite}.` });
      renderSaves(game);
    };
  });
  box.querySelectorAll("[data-save-load]").forEach((btn) => {
    btn.onclick = () => {
      localStorage.setItem("periodica-active-slot", btn.dataset.saveLoad);
      location.reload();
    };
  });
  box.querySelectorAll("[data-save-clear]").forEach((btn) => {
    btn.onclick = () => {
      clearSave(btn.dataset.saveClear);
      renderSaves(game);
    };
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
      : `b:${sel.x},${sel.y}:${sel.building.recipe}:${sel.building.filterId || ""}`;
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
    ${b.type === "filter" ? `<label>Dejar pasar
      <select id="filter-select"><option value="">todo</option>${filterOptions(game, b)}</select>
    </label>` : ""}
    ${rec ? `<button id="pin-recipe">Fijar receta</button>` : ""}
    <button id="feed-building">Meter del inventario</button>
  `;
  const select = document.getElementById("recipe-select");
  if (select) select.onchange = () => {
    b.recipe = select.value || null;
    b.progress = 0;
  };
  const filterSel = document.getElementById("filter-select");
  if (filterSel) filterSel.onchange = () => {
    b.filterId = filterSel.value || null;
  };
  const pin = document.getElementById("pin-recipe");
  if (pin) pin.onclick = () => {
    game.pinned = rec.output?.id || b.recipe;
    game.messages.unshift({ t: game.tick, text: `Fijada: ${getItem(game.pinned)?.name}.` });
  };
  const feed = document.getElementById("feed-building");
  if (feed) feed.onclick = () => feedBuilding(game, b);
}

function filterOptions(game, b) {
  const ids = new Set([...Object.keys(game.inventory), b.filterId].filter(Boolean));
  return [...ids]
    .map((id) => {
      const item = getItem(id);
      if (!item) return "";
      return `<option value="${id}" ${b.filterId === id ? "selected" : ""}>${item.name}</option>`;
    })
    .join("");
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
          <button data-craft="${r.id}" ${can && !r.deposit ? "" : "disabled"}>Craftear 1</button>
          <button data-pin="${item.id}">Fijar</button></div>`;
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
  detail.querySelectorAll("[data-pin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      game.pinned = btn.dataset.pin;
      game.messages.unshift({ t: game.tick, text: `Fijada: ${getItem(game.pinned)?.name}.` });
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
