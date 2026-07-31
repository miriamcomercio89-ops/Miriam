(() => {
  let DATA = window.CATALOG_DATA && window.CATALOG_DATA.routes ? window.CATALOG_DATA : null;
  const FAV_KEY = "europerote-favs";
  const state = {
    page: 0,
    pageSize: 24,
    filtered: [],
    cityId: "",
    map: null,
    markers: new Map(),
    selectedMarker: null,
    routeLine: null,
    favs: new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")),
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uniq = (arr) => [...new Set(arr)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), "es"));

  function saveFavs() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...state.favs]));
  }

  function setBoot(pct, err) {
    const bar = $("bootBar");
    const label = $("bootPct");
    const errEl = $("bootErr");
    if (bar) bar.style.width = Math.max(6, Math.min(100, pct)) + "%";
    if (label) label.textContent = err ? "Error" : Math.round(pct) + "%";
    if (errEl && err) {
      errEl.hidden = false;
      errEl.textContent = err;
    }
  }
  function hideBoot() {
    const boot = $("boot");
    if (boot) boot.hidden = true;
    document.body.classList.remove("booting");
  }
  function fetchJson(url) {
    return fetch(url, { cache: "no-cache", mode: "cors" }).then(async (r) => {
      if (!r.ok) throw new Error("HTTP " + r.status + " en " + url.split("/").slice(-2).join("/"));
      return r.json();
    });
  }

  async function loadCatalogFromCdn() {
    const bases = [
      (window.CATALOG_BASE || "").replace(/\/$/, ""),
      "https://cdn.jsdelivr.net/gh/miriamcomercio89-ops/Miriam@cursor/red-ferroviaria-alemania-555a/europerote-ets2/web",
    ].filter((b, i, arr) => b && arr.indexOf(b) === i);
    setBoot(4);
    let lastErr = null;
    for (const base of bases) {
      try {
        const meta = await fetchJson(base + "/meta.json");
        setBoot(12);
        const cities = await fetchJson(base + "/cities.json");
        setBoot(20);
        let pdfs = null;
        try {
          pdfs = await fetchJson(base + "/pdfs/index.json");
        } catch (_) {}
        const total = meta.chunks || 0;
        const routes = [];
        const batch = 3;
        for (let i = 0; i < total; i += batch) {
          const slice = [];
          for (let j = i; j < Math.min(total, i + batch); j++) slice.push(j);
          const parts = await Promise.all(slice.map((j) => fetchJson(base + "/chunks/routes-" + j + ".json")));
          parts.forEach((p) => routes.push(...p));
          setBoot(20 + (75 * Math.min(total, i + batch)) / Math.max(total, 1));
        }
        setBoot(98);
        return { ...meta, routes, cities: cities.cities || cities, pdfs, _base: base };
      } catch (e) {
        lastErr = e;
        console.warn("Fallo", base, e);
      }
    }
    throw lastErr || new Error("No se pudo cargar el catálogo");
  }

  function fillSelect(id, values, labelFn) {
    const el = $(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = '<option value="">Todos</option>';
    for (const v of values) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = labelFn ? labelFn(v) : v;
      el.appendChild(opt);
    }
    if (cur) el.value = cur;
  }

  function fillCitySelect(filterText) {
    const el = $("citySelect");
    if (!el || !DATA.cities) return;
    const q = (filterText || "").trim().toLowerCase();
    const list = DATA.cities
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || (c.pais || "").toLowerCase().includes(q))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    el.innerHTML = "";
    for (const c of list) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.nombre} (${c.iso || c.pais})`;
      if (c.id === state.cityId) opt.selected = true;
      el.appendChild(opt);
    }
  }

  function fillDatalist() {
    const dl = $("cityDatalist");
    if (!dl) return;
    dl.innerHTML = DATA.cities
      .map((c) => `<option value="${esc(c.nombre)}"></option>`)
      .join("");
  }

  function initFilters() {
    fillSelect("tipo", uniq(DATA.routes.map((r) => r.tipo)), (id) => DATA.tipoNames[id] || id);
    fillSelect("pais", uniq(DATA.routes.flatMap((r) => r.paises || [])));
    fillCitySelect("");
    fillDatalist();
    renderPdfLinks();
  }

  function renderPdfLinks() {
    const el = $("pdfLinks");
    if (!el) return;
    const mapas = DATA.pdfs?.mapas || [];
    if (!mapas.length) {
      el.textContent = "PDFs aún no disponibles en este commit.";
      return;
    }
    const base = DATA._base || window.CATALOG_BASE || "";
    el.innerHTML = mapas
      .map(
        (m) =>
          `<a href="${esc(base + "/" + m.file)}" target="_blank" rel="noopener">${esc(m.pais)}</a> <span class="meta">(${m.rutas})</span>`
      )
      .join(" · ");
  }

  function gameToImage(xx, yy, proj) {
    const xtot = proj.x2 - proj.x1;
    const ytot = proj.y2 - proj.y1;
    const xrel = (xx - proj.x1) / xtot;
    const yrel = (yy - proj.y1) / ytot;
    return [xrel * proj.MAX_X, yrel * proj.MAX_Y];
  }

  function cityLatLng(c) {
    const proj = DATA.mapProjection;
    if (!state.map || !proj) return null;
    const xx = c.map_x != null ? c.map_x : c.x;
    const yy = c.map_y != null ? c.map_y : c.z;
    const [ix, iy] = gameToImage(xx, yy, proj);
    return state.map.unproject([ix, iy], 8);
  }

  function initMap() {
    if (!window.L || state.map) return;
    const proj = DATA.mapProjection || {
      tileUrl: "https://ets2.online/map/ets2mappromods_158/{z}/{x}/{y}.png",
      maxZoom: 8,
      minZoom: 2,
      tileSize: 256,
      MAX_X: 65536,
      MAX_Y: 65536,
      x1: -135110.156,
      x2: 168923.75,
      y1: -179273.531,
      y2: 124760.375,
    };
    DATA.mapProjection = proj;

    state.map = L.map("map", { crs: L.CRS.Simple, minZoom: proj.minZoom || 2, maxZoom: proj.maxZoom || 8 });
    const bounds = L.latLngBounds(state.map.unproject([0, 65535], 8), state.map.unproject([65535, 0], 8));
    L.tileLayer(proj.tileUrl, {
      maxZoom: proj.maxZoom || 8,
      minZoom: proj.minZoom || 2,
      bounds,
      tileSize: proj.tileSize || 256,
      attribution: proj.attribution || 'Mapa ProMods · <a href="https://ets2.online/map/ets2pro" target="_blank">ets2.online</a>',
      crossOrigin: true,
    }).addTo(state.map);
    state.map.setMaxBounds(bounds);
    state.map.setView(state.map.unproject([256, 256], 0), 2);

    for (const c of DATA.cities || []) {
      const ll = cityLatLng(c);
      if (!ll) continue;
      const marker = L.circleMarker(ll, {
        radius: 4,
        color: "#fff",
        weight: 1,
        fillColor: "#0B3D91",
        fillOpacity: 0.9,
      });
      marker.bindTooltip(c.nombre + " (" + (c.iso || c.pais) + ")", { direction: "top" });
      marker.on("click", () => selectCity(c.id));
      marker.addTo(state.map);
      state.markers.set(c.id, marker);
    }
    setTimeout(() => state.map.invalidateSize(), 250);
  }

  function drawRoute(r) {
    if (!state.map) return;
    if (state.routeLine) {
      state.map.removeLayer(state.routeLine);
      state.routeLine = null;
    }
    if (!r) return;
    const ids = r.paradaIds || [];
    const pts = [];
    for (const id of ids) {
      const c = DATA.cities.find((x) => x.id === id);
      if (!c) continue;
      const ll = cityLatLng(c);
      if (ll) pts.push(ll);
    }
    if (pts.length < 2) return;
    state.routeLine = L.polyline(pts, { color: "#F2A900", weight: 4, opacity: 0.9 }).addTo(state.map);
    state.map.fitBounds(state.routeLine.getBounds(), { padding: [30, 30], maxZoom: 6 });
  }

  function focusCityOnMap(cityId) {
    const marker = state.markers.get(cityId);
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!marker || !city || !state.map) return;
    if (state.selectedMarker) state.selectedMarker.setStyle({ fillColor: "#0B3D91", radius: 4 });
    marker.setStyle({ fillColor: "#F2A900", radius: 8 });
    state.selectedMarker = marker;
    const ll = cityLatLng(city);
    if (ll) state.map.setView(ll, Math.max(state.map.getZoom(), 5), { animate: true });
  }

  function routeCard(r, asH4) {
    const tipo = DATA.tipoNames[r.tipo] || r.tipo;
    const tags = (r.etiquetas || r.tags || []).map((t) => '<span class="tag tag-' + esc(t) + '">' + esc(t) + "</span>").join("");
    const fav = state.favs.has(r.codigo);
    const addons = (r.addons || []).map((a) => DATA.addonNames?.[a] || a).join(" · ");
    const titleTag = asH4 ? "h4" : "h2";
    return (
      '<article class="card" data-codigo="' +
      esc(r.codigo) +
      '">' +
      '<div class="card-head"><div>' +
      `<${titleTag}>` +
      esc(r.nombre) +
      `</${titleTag}>` +
      '<p class="sub">' +
      esc(tipo) +
      " · " +
      esc(r.nacional ? "Nacional" : "Internacional") +
      " · " +
      esc((r.paises || []).join(", ")) +
      " · " +
      esc(r.km) +
      " km</p></div><span class=\"code\">" +
      esc(r.codigo) +
      "</span></div>" +
      '<div class="tags">' +
      '<span class="tag">' +
      esc(tipo) +
      "</span>" +
      tags +
      (addons ? '<span class="tag gold">Addons: ' + esc(addons) + "</span>" : "") +
      "</div>" +
      '<p class="desc">' +
      esc(r.desc || "") +
      "</p>" +
      '<div class="stops"><strong>Itinerario:</strong> ' +
      esc((r.paradas || []).join(" → ")) +
      "</div>" +
      '<div class="card-actions">' +
      '<button type="button" class="mini" data-act="map">Ver en mapa</button> ' +
      '<button type="button" class="mini" data-act="fav">' +
      (fav ? "★ Favorito" : "☆ Favorito") +
      "</button>" +
      "</div></article>"
    );
  }

  function findCityByName(name) {
    const q = (name || "").trim().toLowerCase();
    if (!q) return null;
    return DATA.cities.find((c) => c.nombre.toLowerCase() === q) || DATA.cities.find((c) => c.nombre.toLowerCase().includes(q));
  }

  function baseFilter(r) {
    const q = (($("q")?.value || "") + " " + ($("qTop")?.value || "")).trim().toLowerCase();
    const tipo = $("tipo")?.value || "";
    const pais = $("pais")?.value || "";
    const tag = $("tag")?.value || "";
    const ambito = $("ambito")?.value || "";
    const favOnly = $("favOnly")?.value === "1";
    const from = findCityByName($("fromCity")?.value || "");
    const to = findCityByName($("toCity")?.value || "");
    if (tipo && r.tipo !== tipo) return false;
    if (pais && !(r.paises || []).includes(pais)) return false;
    if (tag && !(r.etiquetas || r.tags || []).includes(tag)) return false;
    if (ambito === "nacional" && !r.nacional) return false;
    if (ambito === "internacional" && r.nacional) return false;
    if (favOnly && !state.favs.has(r.codigo)) return false;
    if (from || to) {
      const ids = r.paradaIds || [];
      const names = r.paradas || [];
      const hasFrom = from && (ids.includes(from.id) || names.includes(from.nombre));
      const hasTo = to && (ids.includes(to.id) || names.includes(to.nombre));
      if (from && to) {
        if (!hasFrom || !hasTo) return false;
        const iFrom = ids.indexOf(from.id);
        const iTo = ids.indexOf(to.id);
        if (iFrom >= 0 && iTo >= 0 && iFrom > iTo) return false;
      } else if (from && !hasFrom) return false;
      else if (to && !hasTo) return false;
    }
    if (q) {
      const blob = [r.codigo, r.nombre, r.desc, ...(r.paradas || []), ...(r.paises || []), ...(r.etiquetas || [])]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  }

  function sortRoutes(arr) {
    const sort = $("sort")?.value || "codigo";
    arr.sort((a, b) => {
      if (sort === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      if (sort === "paradas_desc") return b.n - a.n;
      if (sort === "km_desc") return b.km - a.km;
      if (sort === "km_asc") return a.km - b.km;
      return String(a.codigo).localeCompare(String(b.codigo), "es");
    });
  }

  function routesForCity(cityId) {
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!city) return { ends: [], through: [], city: null };
    const ends = [];
    const through = [];
    for (const r of DATA.routes) {
      if (!baseFilter(r)) continue;
      const ids = r.paradaIds || [];
      const names = r.paradas || [];
      if (!ids.includes(cityId) && !names.includes(city.nombre)) continue;
      const isEnd = names[0] === city.nombre || names.at(-1) === city.nombre || ids[0] === cityId || ids.at(-1) === cityId;
      (isEnd ? ends : through).push(r);
    }
    sortRoutes(ends);
    sortRoutes(through);
    return { ends, through, city };
  }

  function updateMetrics(filtered) {
    if (!$("metrics")) return;
    const cov = DATA.cobertura_pct != null ? DATA.cobertura_pct : "";
    $("metrics").innerHTML =
      '<span class="metric"><strong>' +
      (DATA.total || DATA.routes.length) +
      "</strong> rutas</span>" +
      '<span class="metric"><strong>' +
      (DATA.cities?.length || 0) +
      "</strong> ciudades</span>" +
      (cov !== "" ? '<span class="metric">Cobertura <strong>' + cov + "%</strong></span>" : "") +
      '<span class="metric"><strong>' +
      filtered +
      "</strong> en vista</span>" +
      '<span class="metric">★ <strong>' +
      state.favs.size +
      "</strong></span>";
  }

  function renderList() {
    const list = $("list");
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page >= pages) state.page = pages - 1;
    const start = state.page * state.pageSize;
    const slice = state.filtered.slice(start, start + state.pageSize);
    if ($("resultCount")) $("resultCount").textContent = total + " rutas · pág. " + (state.page + 1) + "/" + pages;
    if ($("pageInfo")) $("pageInfo").textContent = state.page + 1 + " / " + pages;
    if ($("prev")) $("prev").disabled = state.page <= 0;
    if ($("next")) $("next").disabled = state.page >= pages - 1;
    updateMetrics(total);
    list.innerHTML = slice.map((r) => routeCard(r, false)).join("");
  }

  function renderCityView() {
    const mode = $("cityMode")?.value || "both";
    const { ends, through, city } = routesForCity(state.cityId);
    if (!city) return;
    $("cityPanels").hidden = false;
    $("allToolbar").hidden = true;
    $("list").hidden = true;
    $("pager").hidden = true;
    $("cityHeading").innerHTML =
      "<h2>" +
      esc(city.nombre) +
      "</h2><p>" +
      esc(city.pais) +
      " · cabeceras " +
      ends.length +
      " · paso " +
      through.length +
      "</p>";
    const showEnds = mode === "both" || mode === "ends";
    const showThrough = mode === "both" || mode === "through";
    $("listEnds").parentElement.hidden = !showEnds;
    $("listThrough").parentElement.hidden = !showThrough;
    $("listEnds").innerHTML = showEnds
      ? ends.length
        ? ends.map((r) => routeCard(r, true)).join("")
        : '<p class="meta">Sin cabeceras.</p>'
      : "";
    $("listThrough").innerHTML = showThrough
      ? through.length
        ? through.map((r) => routeCard(r, true)).join("")
        : '<p class="meta">Sin rutas de paso.</p>'
      : "";
    updateMetrics(ends.length + through.length);
    focusCityOnMap(city.id);
  }

  function applyFilters() {
    if (state.cityId) {
      renderCityView();
      return;
    }
    $("cityPanels").hidden = true;
    $("allToolbar").hidden = false;
    $("list").hidden = false;
    $("pager").hidden = false;
    state.filtered = DATA.routes.filter(baseFilter);
    sortRoutes(state.filtered);
    state.page = 0;
    renderList();
  }

  function selectCity(cityId) {
    state.cityId = cityId || "";
    if ($("citySelect") && cityId) $("citySelect").value = cityId;
    applyFilters();
  }

  function exportCsv() {
    const rows = state.cityId
      ? (() => {
          const { ends, through } = routesForCity(state.cityId);
          return [...ends, ...through];
        })()
      : state.filtered;
    const header = ["codigo", "nombre", "tipo", "km", "paises", "etiquetas", "paradas", "addons"];
    const lines = [header.join(",")].concat(
      rows.map((r) =>
        [
          r.codigo,
          JSON.stringify(r.nombre),
          r.tipo,
          r.km,
          JSON.stringify((r.paises || []).join("|")),
          JSON.stringify((r.etiquetas || []).join("|")),
          JSON.stringify((r.paradas || []).join(" > ")),
          JSON.stringify((r.addons || []).join("|")),
        ].join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "europerote-rutas.csv";
    a.click();
  }

  function bind() {
    $("applyBtn")?.addEventListener("click", applyFilters);
    $("exportCsv")?.addEventListener("click", exportCsv);
    $("resetBtn")?.addEventListener("click", () => {
      ["q", "qTop", "tipo", "pais", "tag", "ambito", "citySearch", "fromCity", "toCity", "favOnly"].forEach((id) => {
        if ($(id)) $(id).value = "";
      });
      state.cityId = "";
      drawRoute(null);
      fillCitySelect("");
      applyFilters();
    });
    $("clearCity")?.addEventListener("click", () => {
      state.cityId = "";
      if ($("citySelect")) $("citySelect").selectedIndex = -1;
      applyFilters();
    });
    $("citySelect")?.addEventListener("change", (e) => selectCity(e.target.value));
    $("citySearch")?.addEventListener("input", (e) => fillCitySelect(e.target.value));
    $("cityMode")?.addEventListener("change", () => state.cityId && renderCityView());
    ["q", "qTop", "fromCity", "toCity"].forEach((id) => $(id)?.addEventListener("input", () => applyFilters()));
    ["tipo", "pais", "tag", "ambito", "sort", "favOnly"].forEach((id) => $(id)?.addEventListener("change", () => applyFilters()));
    $("prev")?.addEventListener("click", () => {
      state.page--;
      renderList();
    });
    $("next")?.addEventListener("click", () => {
      state.page++;
      renderList();
    });
    $("pageSizeSeg")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-size]");
      if (!btn) return;
      state.pageSize = Number(btn.dataset.size);
      [...$("pageSizeSeg").querySelectorAll("button")].forEach((b) => b.classList.toggle("on", b === btn));
      state.page = 0;
      if (!state.cityId) renderList();
    });
    $("toggleFilters")?.addEventListener("click", () => $("sidebar")?.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const card = btn.closest(".card");
      const codigo = card?.dataset.codigo;
      const r = DATA.routes.find((x) => x.codigo === codigo);
      if (!r) return;
      if (btn.dataset.act === "map") drawRoute(r);
      if (btn.dataset.act === "fav") {
        if (state.favs.has(codigo)) state.favs.delete(codigo);
        else state.favs.add(codigo);
        saveFavs();
        applyFilters();
      }
    });
  }

  async function main() {
    try {
      if (!DATA) DATA = await loadCatalogFromCdn();
      if (!DATA.cities) DATA.cities = [];
      window.CATALOG_DATA = DATA;
      initFilters();
      bind();
      initMap();
      applyFilters();
      hideBoot();
    } catch (e) {
      setBoot(100, String(e.message || e));
    }
  }
  main();
})();
