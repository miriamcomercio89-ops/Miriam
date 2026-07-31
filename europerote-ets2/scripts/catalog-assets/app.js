(() => {
  let DATA = window.CATALOG_DATA && window.CATALOG_DATA.routes ? window.CATALOG_DATA : null;
  const state = {
    page: 0,
    pageSize: 24,
    filtered: [],
    cityId: "",
    map: null,
    markers: new Map(),
    selectedMarker: null,
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uniq = (arr) => [...new Set(arr)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), "es"));

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
        setBoot(22);
        const total = meta.chunks || 0;
        if (!total) throw new Error("meta.json sin chunks");
        const routes = [];
        const batch = 3;
        for (let i = 0; i < total; i += batch) {
          const slice = [];
          for (let j = i; j < Math.min(total, i + batch); j++) slice.push(j);
          const parts = await Promise.all(slice.map((j) => fetchJson(base + "/chunks/routes-" + j + ".json")));
          parts.forEach((p) => routes.push(...p));
          setBoot(22 + (74 * Math.min(total, i + batch)) / Math.max(total, 1));
        }
        if (!routes.length) throw new Error("No se cargaron rutas");
        setBoot(98);
        return { ...meta, routes, cities: cities.cities || cities };
      } catch (e) {
        lastErr = e;
        console.warn("Fallo carga desde", base, e);
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
      .filter((c) => c.lat != null && c.lon != null)
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.pais.toLowerCase().includes(q) || (c.iso || "").toLowerCase().includes(q))
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

  function initFilters() {
    fillSelect("tipo", uniq(DATA.routes.map((r) => r.tipo)), (id) => DATA.tipoNames[id] || id);
    fillSelect("pais", uniq(DATA.routes.flatMap((r) => r.paises || [])));
    fillSelect("addon", uniq(DATA.routes.flatMap((r) => r.addons || [])), (id) => DATA.addonNames[id] || id);
    fillCitySelect("");
  }

  function routeCard(r, asH4) {
    const tipo = DATA.tipoNames[r.tipo] || r.tipo;
    const addons = (r.addons || []).map((a) => DATA.addonNames[a] || a).join(" · ");
    const titleTag = asH4 ? "h4" : "h2";
    return (
      '<article class="card">' +
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
      " km · " +
      esc(r.n) +
      " paradas</p></div><span class=\"code\">" +
      esc(r.codigo) +
      "</span></div>" +
      '<div class="tags">' +
      '<span class="tag">' +
      esc(tipo) +
      "</span>" +
      '<span class="tag gold">' +
      esc(r.mat || "") +
      "</span>" +
      (addons ? '<span class="tag">' + esc(addons) + "</span>" : "") +
      "</div>" +
      '<p class="desc">' +
      esc(r.desc || "") +
      "</p>" +
      '<div class="stops"><strong>Itinerario:</strong> ' +
      esc((r.paradas || []).join(" → ")) +
      "</div></article>"
    );
  }

  function baseFilter(r) {
    const q = (($("q")?.value || "") + " " + ($("qTop")?.value || "")).trim().toLowerCase();
    const tipo = $("tipo")?.value || "";
    const pais = $("pais")?.value || "";
    const addon = $("addon")?.value || "";
    const ambito = $("ambito")?.value || "";
    if (tipo && r.tipo !== tipo) return false;
    if (pais && !(r.paises || []).includes(pais)) return false;
    if (addon && !(r.addons || []).includes(addon)) return false;
    if (ambito === "nacional" && !r.nacional) return false;
    if (ambito === "internacional" && r.nacional) return false;
    if (q) {
      const blob = [r.codigo, r.nombre, r.desc, r.mat, ...(r.paradas || []), ...(r.paises || [])].join(" ").toLowerCase();
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
    const name = city.nombre;
    const ends = [];
    const through = [];
    for (const r of DATA.routes) {
      if (!baseFilter(r)) continue;
      const ids = r.paradaIds || [];
      const names = r.paradas || [];
      const hitId = ids.includes(cityId);
      const hitName = names.includes(name);
      if (!hitId && !hitName) continue;
      const isEnd =
        names[0] === name ||
        names[names.length - 1] === name ||
        ids[0] === cityId ||
        ids[ids.length - 1] === cityId;
      if (isEnd) ends.push(r);
      else through.push(r);
    }
    sortRoutes(ends);
    sortRoutes(through);
    return { ends, through, city };
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

  function renderList() {
    const list = $("list");
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page >= pages) state.page = pages - 1;
    const start = state.page * state.pageSize;
    const slice = state.filtered.slice(start, start + state.pageSize);
    if ($("resultCount")) $("resultCount").textContent = total + " rutas · página " + (state.page + 1) + "/" + pages;
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
      " · " +
      esc(city.iso || "") +
      " · ProMods real · " +
      ends.length +
      " cabeceras · " +
      through.length +
      " de paso</p>";

    const showEnds = mode === "both" || mode === "ends";
    const showThrough = mode === "both" || mode === "through";
    $("listEnds").parentElement.hidden = !showEnds;
    $("listThrough").parentElement.hidden = !showThrough;
    $("listEnds").innerHTML = showEnds
      ? ends.length
        ? ends.map((r) => routeCard(r, true)).join("")
        : '<p class="meta">Ninguna ruta con origen/destino aquí.</p>'
      : "";
    $("listThrough").innerHTML = showThrough
      ? through.length
        ? through.map((r) => routeCard(r, true)).join("")
        : '<p class="meta">Ninguna ruta de paso.</p>'
      : "";

    updateMetrics(ends.length + through.length);
    if ($("mapHint")) {
      $("mapHint").textContent = `Ciudad seleccionada: ${city.nombre}. Cabeceras ${ends.length} · De paso ${through.length}.`;
    }
    focusCityOnMap(city.id);
  }

  function updateMetrics(filtered) {
    if (!$("metrics")) return;
    $("metrics").innerHTML =
      '<span class="metric"><strong>' +
      (DATA.total || DATA.routes.length) +
      "</strong> rutas</span>" +
      '<span class="metric"><strong>' +
      (DATA.cities?.length || 0) +
      "</strong> ciudades ProMods</span>" +
      '<span class="metric"><strong>' +
      filtered +
      "</strong> en vista</span>" +
      '<span class="metric">Operador <strong>EuroPerote</strong></span>';
  }

  function initMap() {
    if (!window.L || state.map) return;
    state.map = L.map("map", { scrollWheelZoom: true }).setView([52.5, 13.4], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(state.map);

    const bounds = [];
    for (const c of DATA.cities || []) {
      if (c.lat == null || c.lon == null) continue;
      const marker = L.circleMarker([c.lat, c.lon], {
        radius: 5,
        color: "#fff",
        weight: 1.5,
        fillColor: "#0B3D91",
        fillOpacity: 0.9,
      });
      marker.bindTooltip(c.nombre + " (" + (c.iso || c.pais) + ")", { direction: "top" });
      marker.on("click", () => selectCity(c.id, true));
      marker.addTo(state.map);
      state.markers.set(c.id, marker);
      bounds.push([c.lat, c.lon]);
    }
    if (bounds.length) state.map.fitBounds(bounds, { padding: [24, 24] });
    setTimeout(() => state.map.invalidateSize(), 200);
  }

  function focusCityOnMap(cityId) {
    const marker = state.markers.get(cityId);
    const city = DATA.cities.find((c) => c.id === cityId);
    if (!marker || !city || !state.map) return;
    if (state.selectedMarker) {
      state.selectedMarker.setStyle({ fillColor: "#0B3D91", radius: 5 });
    }
    marker.setStyle({ fillColor: "#F2A900", radius: 9 });
    state.selectedMarker = marker;
    state.map.setView([city.lat, city.lon], Math.max(state.map.getZoom(), 6), { animate: true });
  }

  function selectCity(cityId, fromMap) {
    state.cityId = cityId || "";
    if ($("citySelect") && cityId) $("citySelect").value = cityId;
    if (!fromMap) fillCitySelect($("citySearch")?.value || "");
    applyFilters();
  }

  function bind() {
    $("applyBtn")?.addEventListener("click", applyFilters);
    $("resetBtn")?.addEventListener("click", () => {
      ["q", "qTop", "tipo", "pais", "addon", "ambito", "citySearch"].forEach((id) => {
        if ($(id)) $(id).value = "";
      });
      if ($("cityMode")) $("cityMode").value = "both";
      state.cityId = "";
      fillCitySelect("");
      if (state.selectedMarker) {
        state.selectedMarker.setStyle({ fillColor: "#0B3D91", radius: 5 });
        state.selectedMarker = null;
      }
      applyFilters();
    });
    $("clearCity")?.addEventListener("click", () => {
      state.cityId = "";
      if ($("citySelect")) $("citySelect").selectedIndex = -1;
      if (state.selectedMarker) {
        state.selectedMarker.setStyle({ fillColor: "#0B3D91", radius: 5 });
        state.selectedMarker = null;
      }
      if ($("mapHint")) $("mapHint").textContent = "Clic en un marcador o elige ciudad a la izquierda.";
      applyFilters();
    });
    $("citySelect")?.addEventListener("change", (e) => selectCity(e.target.value, false));
    $("citySearch")?.addEventListener("input", (e) => fillCitySelect(e.target.value));
    $("cityMode")?.addEventListener("change", () => state.cityId && renderCityView());
    ["q", "qTop"].forEach((id) => $(id)?.addEventListener("input", () => applyFilters()));
    ["tipo", "pais", "addon", "ambito", "sort"].forEach((id) => $(id)?.addEventListener("change", () => applyFilters()));
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
