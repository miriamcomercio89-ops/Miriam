(() => {
  const DATA = window.CATALOG_DATA;
  const state = {
    view: "routes",
    page: 0,
    pageSize: 24,
    est: new Set(),
    opEst: new Set(),
    filtered: [],
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const uniq = (arr) =>
    [...new Set(arr)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), "es"));

  function fillSelect(sel, entries) {
    for (const v of entries) {
      const opt = document.createElement("option");
      opt.value = Array.isArray(v) ? v[0] : v;
      opt.textContent = Array.isArray(v) ? v[1] : v;
      sel.appendChild(opt);
    }
  }

  function mkChips(el, values, set) {
    el.innerHTML = values
      .map((v) => '<button type="button" class="chip" data-v="' + esc(v) + '">' + esc(v) + "</button>")
      .join("");
    el.querySelectorAll(".chip").forEach((btn) =>
      btn.addEventListener("click", () => {
        const v = btn.dataset.v;
        if (set.has(v)) set.delete(v);
        else set.add(v);
        btn.classList.toggle("on", set.has(v));
        applyFilters(true);
      })
    );
  }

  function initControls() {
    fillSelect($("tipo"), Object.entries(DATA.tipoNames));
    fillSelect($("prefijo"), uniq(DATA.routes.map((r) => r.prefijo)));
    fillSelect(
      $("op"),
      DATA.ops.map((o) => [o.id, o.nombre + " (" + o.corto + ")"])
    );
    fillSelect($("opTipo"), uniq(DATA.ops.map((o) => o.tipo)));
    fillSelect($("opTipo2"), uniq(DATA.ops.map((o) => o.tipo)));
    fillSelect($("corredor"), Object.entries(DATA.corredorNames));
    fillSelect($("land"), Object.entries(DATA.landNames));
    fillSelect($("opLand"), Object.entries(DATA.landNames));
    fillSelect($("opServ"), uniq(DATA.ops.flatMap((o) => o.servicios || [])));
    mkChips($("estChips"), ["actual", "futuro", "inventado"], state.est);
    mkChips($("opEstChips"), ["actual", "futuro", "inventado"], state.opEst);
  }

  function numOr(id) {
    const v = $(id).value.trim();
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function routeMatch(r, q, qStation, qEndpoint) {
    if (state.est.size && !state.est.has(r.est)) return false;
    if ($("tipo").value && r.tipo !== $("tipo").value) return false;
    if ($("prefijo").value && r.prefijo !== $("prefijo").value) return false;
    if ($("op").value && r.op !== $("op").value) return false;
    if ($("opTipo").value) {
      const op = DATA.ops.find((o) => o.id === r.op);
      if (!op || op.tipo !== $("opTipo").value) return false;
    }
    if ($("corredor").value && r.corredor !== $("corredor").value) return false;
    if ($("land").value && !(r.lands || []).includes($("land").value)) return false;
    if ($("origenDatos").value && r.origen_datos !== $("origenDatos").value) return false;
    if ($("patron").value && r.patron !== $("patron").value) return false;

    const minN = numOr("minN");
    const maxN = numOr("maxN");
    const minKm = numOr("minKm");
    const maxKm = numOr("maxKm");
    const minFreq = numOr("minFreq");
    const maxFreq = numOr("maxFreq");
    if (minN != null && r.n < minN) return false;
    if (maxN != null && r.n > maxN) return false;
    if (minKm != null && r.km < minKm) return false;
    if (maxKm != null && r.km > maxKm) return false;
    if (minFreq != null && r.freq < minFreq) return false;
    if (maxFreq != null && r.freq > maxFreq) return false;

    if (qStation) {
      if (!(r.paradas || []).some((p) => p.toLowerCase().includes(qStation))) return false;
    }
    if (qEndpoint) {
      const o = (r.origen || "").toLowerCase();
      const d = (r.destino || "").toLowerCase();
      if (!o.includes(qEndpoint) && !d.includes(qEndpoint)) return false;
    }
    if (q) {
      const hay = [
        r.codigo,
        r.nombre,
        r.opn,
        r.origen,
        r.destino,
        ...(r.paradas || []),
        DATA.corredorNames[r.corredor] || "",
        DATA.tipoNames[r.tipo] || "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function opMatch(o, q) {
    if (state.opEst.size && !state.opEst.has(o.estado)) return false;
    if ($("opTipo2").value && o.tipo !== $("opTipo2").value) return false;
    if ($("opComp").value && o.competencia !== $("opComp").value) return false;
    if ($("opLand").value && !(o.lands || []).includes($("opLand").value)) return false;
    if ($("opServ").value && !(o.servicios || []).includes($("opServ").value)) return false;
    if (q) {
      const lands = (o.lands || []).map((id) => DATA.landNames[id] || id).join(" ");
      const hay = [o.nombre, o.corto, o.sede, o.eslogan, o.tipo, o.estado, lands, ...(o.servicios || []), ...(o.flota || [])]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function sortItems(items) {
    const mode = $("sort").value;
    const arr = items.slice();
    const cmp = (a, b) => String(a).localeCompare(String(b), "es", { numeric: true });
    if (state.view === "ops") {
      if (mode === "nombre") arr.sort((a, b) => cmp(a.nombre, b.nombre));
      else arr.sort((a, b) => cmp(a.estado + a.nombre, b.estado + b.nombre));
      return arr;
    }
    if (mode === "codigo") arr.sort((a, b) => cmp(a.codigo, b.codigo));
    else if (mode === "nombre") arr.sort((a, b) => cmp(a.nombre, b.nombre));
    else if (mode === "paradas_desc") arr.sort((a, b) => b.n - a.n);
    else if (mode === "paradas_asc") arr.sort((a, b) => a.n - b.n);
    else if (mode === "km_desc") arr.sort((a, b) => b.km - a.km);
    else if (mode === "km_asc") arr.sort((a, b) => a.km - b.km);
    else if (mode === "freq_asc") arr.sort((a, b) => a.freq - b.freq);
    return arr;
  }

  function applyFilters(resetPage = true) {
    const qTop = $("qTop").value.trim().toLowerCase();
    if (state.view === "routes") {
      const q = ($("q").value.trim() || qTop).toLowerCase();
      const qStation = $("qStation").value.trim().toLowerCase();
      const qEndpoint = $("qEndpoint").value.trim().toLowerCase();
      state.filtered = sortItems(DATA.routes.filter((r) => routeMatch(r, q, qStation, qEndpoint)));
    } else {
      const q = ($("opq").value.trim() || qTop).toLowerCase();
      state.filtered = sortItems(DATA.ops.filter((o) => opMatch(o, q)));
    }
    if (resetPage) state.page = 0;
    render();
  }

  function activeFilterChips() {
    const chips = [];
    const add = (k, v, clear) => chips.push({ k, v, clear });
    if (state.view === "routes") {
      if ($("q").value || $("qTop").value) add("Texto", $("q").value || $("qTop").value, () => { $("q").value = ""; $("qTop").value = ""; });
      if ($("qStation").value) add("Estación", $("qStation").value, () => ($("qStation").value = ""));
      if ($("qEndpoint").value) add("Extremo", $("qEndpoint").value, () => ($("qEndpoint").value = ""));
      [...state.est].forEach((v) => add("Estado", v, () => state.est.delete(v)));
      [
        ["tipo", "Tipo"],
        ["prefijo", "Prefijo"],
        ["op", "Operador"],
        ["opTipo", "Tipo op."],
        ["corredor", "Corredor"],
        ["land", "Región"],
        ["origenDatos", "Datos"],
        ["patron", "Patrón"],
      ].forEach(([id, label]) => {
        if ($(id).value) add(label, $(id).selectedOptions[0]?.textContent || $(id).value, () => ($(id).value = ""));
      });
      if ($("minN").value || $("maxN").value)
        add("Paradas", ($("minN").value || "…") + "-" + ($("maxN").value || "…"), () => { $("minN").value = ""; $("maxN").value = ""; });
      if ($("minKm").value || $("maxKm").value)
        add("Km", ($("minKm").value || "…") + "-" + ($("maxKm").value || "…"), () => { $("minKm").value = ""; $("maxKm").value = ""; });
      if ($("minFreq").value || $("maxFreq").value)
        add("Freq", ($("minFreq").value || "…") + "-" + ($("maxFreq").value || "…"), () => { $("minFreq").value = ""; $("maxFreq").value = ""; });
    } else {
      if ($("opq").value || $("qTop").value) add("Texto", $("opq").value || $("qTop").value, () => { $("opq").value = ""; $("qTop").value = ""; });
      [...state.opEst].forEach((v) => add("Estado", v, () => state.opEst.delete(v)));
      [
        ["opTipo2", "Tipo"],
        ["opComp", "Competencia"],
        ["opLand", "Región"],
        ["opServ", "Servicio"],
      ].forEach(([id, label]) => {
        if ($(id).value) add(label, $(id).selectedOptions[0]?.textContent || $(id).value, () => ($(id).value = ""));
      });
    }
    $("activeFilters").innerHTML = chips
      .map(
        (c, i) =>
          '<span class="af">' +
          esc(c.k) +
          ": <strong>" +
          esc(c.v) +
          '</strong><button type="button" data-i="' +
          i +
          '" aria-label="Quitar">×</button></span>'
      )
      .join("");
    $("activeFilters").querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        chips[Number(btn.dataset.i)].clear();
        document.querySelectorAll("#estChips .chip").forEach((b) => b.classList.toggle("on", state.est.has(b.dataset.v)));
        document.querySelectorAll("#opEstChips .chip").forEach((b) => b.classList.toggle("on", state.opEst.has(b.dataset.v)));
        applyFilters(true);
      })
    );
  }

  function stopsHtml(paradas) {
    if (!paradas?.length) return "";
    return paradas
      .map((p, i) => {
        const cls = i === 0 || i === paradas.length - 1 ? "end" : "";
        return '<span class="' + cls + '">' + esc(p) + "</span>";
      })
      .join('<span class="dot">→</span>');
  }

  function openRoute(r) {
    const lands = (r.lands || []).map((id) => DATA.landNames[id] || id).join(", ");
    $("drawerBody").innerHTML =
      "<h2>" +
      esc(r.codigo) +
      "</h2><div class=\"title\">" +
      esc(r.nombre) +
      '</div><div class="meta" style="margin-top:.5rem"><span class="badge b-' +
      esc(r.est) +
      '">' +
      esc(r.est) +
      '</span><span class="badge b-soft">' +
      esc(DATA.tipoNames[r.tipo] || r.tipo) +
      '</span><span class="badge b-soft">' +
      esc(r.patron) +
      '</span></div><div class="kv"><div>Operador</div><div>' +
      esc(r.opn) +
      "</div><div>Origen</div><div>" +
      esc(r.origen) +
      "</div><div>Destino</div><div>" +
      esc(r.destino) +
      "</div><div>Paradas</div><div>" +
      esc(r.n) +
      "</div><div>Distancia</div><div>" +
      esc(r.km) +
      ' km</div><div>Frecuencia</div><div>cada ' +
      esc(r.freq) +
      " min</div><div>Corredor</div><div>" +
      esc(DATA.corredorNames[r.corredor] || "—") +
      "</div><div>Regiones</div><div>" +
      esc(lands || "—") +
      "</div><div>Datos</div><div>" +
      esc(r.origen_datos) +
      '</div></div><div class="section-label">Recorrido completo</div><div class="stops">' +
      stopsHtml(r.paradas) +
      "</div>";
    $("drawer").classList.add("on");
    $("backdrop").classList.add("on");
  }

  function openOp(o) {
    const lands = (o.lands || []).map((id) => DATA.landNames[id] || id).join(", ");
    const logo = DATA.logos[o.id] ? '<img class="logo" src="' + DATA.logos[o.id] + '" alt=""/>' : "";
    $("drawerBody").innerHTML =
      '<div style="display:flex;gap:.8rem;align-items:center;margin-bottom:.4rem">' +
      logo +
      "<div><h2 style=\"margin:0\">" +
      esc(o.nombre) +
      '</h2><div class="meta">' +
      esc(o.corto) +
      '</div></div></div><div class="meta"><span class="badge b-' +
      esc(o.estado) +
      '">' +
      esc(o.estado) +
      '</span><span class="badge b-soft">' +
      esc(o.tipo) +
      '</span><span class="badge b-soft">' +
      esc(o.competencia) +
      '</span></div><p style="color:var(--muted)">' +
      esc(o.eslogan || "") +
      '</p><div class="kv"><div>Sede</div><div>' +
      esc(o.sede) +
      "</div><div>Regiones</div><div>" +
      esc(lands) +
      "</div><div>Servicios</div><div>" +
      esc((o.servicios || []).join(", ")) +
      '</div><div>Color</div><div><span class="swatch" style="background:' +
      esc(o.color) +
      '"></span> ' +
      esc(o.color) +
      "</div><div>Flota</div><div>" +
      esc((o.flota || []).join(" · ") || "—") +
      "</div></div>";
    $("drawer").classList.add("on");
    $("backdrop").classList.add("on");
  }

  function renderMetrics() {
    const r = DATA.resumen;
    $("metrics").innerHTML = [
      ["Rutas", r.rutas],
      ["Operadores", r.operadores],
      ["Hubs", r.hubs],
      ["Media paradas", r.media_paradas ?? "—"],
    ]
      .map((row) => '<div class="metric"><b>' + esc(row[1]) + "</b><span>" + esc(row[0]) + "</span></div>")
      .join("");
  }

  function render() {
    activeFilterChips();
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages - 1) state.page = pages - 1;
    const start = state.page * state.pageSize;
    const slice = state.filtered.slice(start, start + state.pageSize);
    $("resultCount").textContent =
      total +
      (state.view === "routes" ? " rutas" : " operadores") +
      " · mostrando " +
      (total ? start + 1 + "–" + Math.min(start + state.pageSize, total) : 0);
    $("pageInfo").textContent = "Página " + (state.page + 1) + " / " + pages;
    $("prev").disabled = state.page <= 0;
    $("next").disabled = state.page >= pages - 1;

    if (!slice.length) {
      $("list").innerHTML =
        '<div class="empty"><h3>Sin resultados</h3><p>Prueba a quitar algún filtro o ampliar el rango.</p></div>';
      return;
    }

    if (state.view === "routes") {
      $("list").innerHTML = slice
        .map(
          (r) =>
            '<article class="card" data-id="' +
            esc(r.id) +
            '" tabindex="0" role="button"><div class="card-head"><div class="left-head"><div><div class="code"><span class="swatch" style="background:' +
            esc(r.color) +
            '"></span>' +
            esc(r.codigo) +
            '</div><div class="title">' +
            esc(r.nombre) +
            '</div><div class="meta"><span class="badge b-' +
            esc(r.est) +
            '">' +
            esc(r.est) +
            "</span><span>" +
            esc(r.opn) +
            "</span><span>" +
            esc(DATA.tipoNames[r.tipo] || r.tipo) +
            "</span><span>" +
            esc(r.n) +
            " paradas</span><span>" +
            esc(r.km) +
            " km</span><span>cada " +
            esc(r.freq) +
            ' min</span></div></div></div></div><div class="stops">' +
            stopsHtml(r.paradas) +
            "</div></article>"
        )
        .join("");
      $("list").querySelectorAll(".card").forEach((card) =>
        card.addEventListener("click", () => {
          const r = state.filtered.find((x) => x.id === card.dataset.id) || DATA.routes.find((x) => x.id === card.dataset.id);
          if (r) openRoute(r);
        })
      );
    } else {
      $("list").innerHTML = slice
        .map((o) => {
          const logo = DATA.logos[o.id]
            ? '<img class="logo" src="' + DATA.logos[o.id] + '" alt=""/>'
            : '<div class="logo" style="background:' + esc(o.color) + '"></div>';
          const lands = (o.lands || [])
            .map((id) => DATA.landNames[id] || id)
            .slice(0, 4)
            .join(", ");
          return (
            '<article class="card" data-id="' +
            esc(o.id) +
            '" tabindex="0" role="button"><div class="card-head"><div class="left-head">' +
            logo +
            '<div><div class="title">' +
            esc(o.nombre) +
            '</div><div class="meta"><span class="badge b-' +
            esc(o.estado) +
            '">' +
            esc(o.estado) +
            "</span><span>" +
            esc(o.tipo) +
            "</span><span>" +
            esc(o.sede) +
            "</span><span>" +
            esc(lands) +
            '</span></div><div class="meta" style="margin-top:.35rem">' +
            esc(o.eslogan || "") +
            "</div></div></div></div></article>"
          );
        })
        .join("");
      $("list").querySelectorAll(".card").forEach((card) =>
        card.addEventListener("click", () => {
          const o = DATA.ops.find((x) => x.id === card.dataset.id);
          if (o) openOp(o);
        })
      );
    }
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $("filters-routes").hidden = view !== "routes";
    $("filters-ops").hidden = view !== "ops";
    applyFilters(true);
  }

  function resetAll() {
    [
      "q", "qTop", "qStation", "qEndpoint", "opq", "tipo", "prefijo", "op", "opTipo", "corredor", "land",
      "origenDatos", "patron", "minN", "maxN", "minKm", "maxKm", "minFreq", "maxFreq", "opTipo2", "opComp", "opLand", "opServ",
    ].forEach((id) => {
      if ($(id)) $(id).value = "";
    });
    state.est.clear();
    state.opEst.clear();
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
    applyFilters(true);
  }

  let t = null;
  function live() {
    clearTimeout(t);
    t = setTimeout(() => applyFilters(true), 120);
  }

  initControls();
  renderMetrics();
  setView("routes");

  document.querySelectorAll(".nav button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  $("applyBtn").onclick = () => applyFilters(true);
  $("resetBtn").onclick = resetAll;
  $("prev").onclick = () => {
    state.page--;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  $("next").onclick = () => {
    state.page++;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  $("sort").onchange = () => applyFilters(true);
  $("pageSizeSeg").querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => {
      $("pageSizeSeg").querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      state.pageSize = Number(b.dataset.size);
      applyFilters(true);
    })
  );
  [
    "q", "qTop", "qStation", "qEndpoint", "opq", "tipo", "prefijo", "op", "opTipo", "corredor", "land",
    "origenDatos", "patron", "minN", "maxN", "minKm", "maxKm", "minFreq", "maxFreq", "opTipo2", "opComp", "opLand", "opServ",
  ].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", live);
    el.addEventListener("change", live);
  });
  $("qTop").addEventListener("input", () => {
    if (state.view === "routes") $("q").value = $("qTop").value;
    else $("opq").value = $("qTop").value;
    live();
  });
  $("closeDrawer").onclick = () => {
    $("drawer").classList.remove("on");
    $("backdrop").classList.remove("on");
  };
  $("backdrop").onclick = () => {
    $("drawer").classList.remove("on");
    $("backdrop").classList.remove("on");
  };
  $("toggleFilters").onclick = () => $("sidebar").classList.toggle("open");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $("drawer").classList.remove("on");
      $("backdrop").classList.remove("on");
      $("sidebar").classList.remove("open");
    }
  });
})();
