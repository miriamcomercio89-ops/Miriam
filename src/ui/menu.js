import { CATALOG_STATS } from "../data/catalog.js";
import { BUILDING_LIST } from "../data/buildings.js";
import { FEATURED } from "../data/highlights.js";
import { logoImg } from "../render/logos.js";
import { listSaves } from "../game/saves.js";

export function isMenuOpen() {
  return document.getElementById("main-menu")?.classList.contains("show");
}

export function showMainMenu() {
  const el = document.getElementById("main-menu");
  if (!el) return;
  renderMenu();
  el.classList.add("show");
}

export function hideMainMenu() {
  document.getElementById("main-menu")?.classList.remove("show");
}

export function bindMenu(hooks) {
  const el = document.getElementById("main-menu");
  if (!el) return;
  renderMenu();
  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-menu]");
    if (!btn) return;
    const action = btn.dataset.menu;
    if (action === "continue") hooks.continueGame?.();
    if (action === "normal") hooks.newGame?.("normal");
    if (action === "sandbox") hooks.newGame?.("sandbox");
  });
}

function hasAnySave() {
  return listSaves().some((s) => !s.empty);
}

function renderMenu() {
  const stats = document.getElementById("menu-stats");
  if (stats) {
    stats.innerHTML = `
      <span><b>${CATALOG_STATS.items.toLocaleString("es")}</b> productos</span>
      <span><b>${CATALOG_STATS.raw.toLocaleString("es")}</b> materias primas</span>
      <span><b>${CATALOG_STATS.mid.toLocaleString("es")}</b> semiproductos</span>
      <span><b>${CATALOG_STATS.end.toLocaleString("es")}</b> productos finales</span>
      <span><b>${BUILDING_LIST.length}</b> fábricas</span>
    `;
  }
  const mosaic = document.getElementById("menu-mosaic");
  if (mosaic && !mosaic.dataset.ready) {
    const ids = FEATURED.map((f) => f.id).slice(0, 18);
    mosaic.innerHTML = ids.map((id) => logoImg(id, "logo lg")).join("");
    mosaic.dataset.ready = "1";
  }
  const cont = document.getElementById("btn-continue");
  if (cont) cont.hidden = !hasAnySave();
}
