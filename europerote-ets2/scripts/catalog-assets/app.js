(() => {
  let DATA = window.CATALOG_DATA && window.CATALOG_DATA.routes ? window.CATALOG_DATA : null;
  const state = { page: 0, pageSize: 24, filtered: [] };

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const uniq = (arr) =>
    [...new Set(arr)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), "es"));

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
        setBoot(14);
        const total = meta.chunks || 0;
        if (!total) throw new Error("meta.json sin chunks");
        const routes = [];
        const batch = 3;
        for (let i = 0; i < total; i += batch) {
          const slice = [];
          for (let j = i; j < Math.min(total, i + batch); j++) slice.push(j);
          const parts = await Promise.all(slice.map((j) => fetchJson(base + "/chunks/routes-" + j + ".json")));
          parts.forEach((p) => routes.push(...p));
          setBoot(14 + (82 * Math.min(total, i + batch)) / Math.max(total, 1));
        }
        if (!routes.length) throw new Error("No se cargaron rutas");
        setBoot(98);
        return { ...meta, routes };
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

  function initFilters() {
    fillSelect("tipo", uniq(DATA.routes.map((r) => r.tipo)), (id) => DATA.tipoNames[id] || id);
    fillSelect("pais", uniq(DATA.routes.flatMap((r) => r.paises || [])));
    fillSelect("addon", uniq(DATA.routes.flatMap((r) => r.addons || [])), (id) => DATA.addonNames[id] || id);
    fillSelect("material", uniq(DATA.routes.map((r) => r.mat)));
  }

  function applyFilters() {
    const q = (($("q")?.value || "") + " " + ($("qTop")?.value || "")).trim().toLowerCase();
    const qStop = ($("qStop")?.value || "").trim().toLowerCase();
    const tipo = $("tipo")?.value || "";
    const pais = $("pais")?.value || "";
    const addon = $("addon")?.value || "";
    const material = $("material")?.value || "";
    const patron = $("patron")?.value || "";
    const minN = Number($("minN")?.value || 0);
    const maxN = Number($("maxN")?.value || 0);
    const minKm = Number($("minKm")?.value || 0);
    const maxKm = Number($("maxKm")?.value || 0);

    state.filtered = DATA.routes.filter((r) => {
      if (tipo && r.tipo !== tipo) return false;
      if (pais && !(r.paises || []).includes(pais)) return false;
      if (addon && !(r.addons || []).includes(addon)) return false;
      if (material && r.mat !== material) return false;
      if (patron && r.patron !== patron) return false;
      if (minN && r.n < minN) return false;
      if (maxN && r.n > maxN) return false;
      if (minKm && r.km < minKm) return false;
      if (maxKm && r.km > maxKm) return false;
      if (qStop) {
        const hit = (r.paradas || []).some((p) => String(p).toLowerCase().includes(qStop));
        if (!hit) return false;
      }
      if (q) {
        const blob = [r.codigo, r.nombre, r.desc, r.mat, ...(r.paradas || []), ...(r.paises || [])].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    const sort = $("sort")?.value || "codigo";
    state.filtered.sort((a, b) => {
      if (sort === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      if (sort === "paradas_desc") return b.n - a.n;
      if (sort === "paradas_asc") return a.n - b.n;
      if (sort === "km_desc") return b.km - a.km;
      if (sort === "km_asc") return a.km - b.km;
      return String(a.codigo).localeCompare(String(b.codigo), "es");
    });
    state.page = 0;
    render();
  }

  function render() {
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

    if ($("metrics")) {
      $("metrics").innerHTML =
        '<span class="metric"><strong>' +
        (DATA.total || DATA.routes.length) +
        "</strong> en catálogo</span>" +
        '<span class="metric"><strong>' +
        total +
        "</strong> filtradas</span>" +
        '<span class="metric">Operador <strong>EuroPerote</strong></span>';
    }

    list.innerHTML = slice
      .map((r) => {
        const tipo = DATA.tipoNames[r.tipo] || r.tipo;
        const addons = (r.addons || []).map((a) => DATA.addonNames[a] || a).join(" · ");
        return (
          '<article class="card">' +
          '<div class="card-head"><div>' +
          "<h2>" +
          esc(r.nombre) +
          "</h2>" +
          '<p class="sub">' +
          esc(tipo) +
          " · " +
          esc((r.paises || []).join(", ")) +
          " · " +
          esc(r.km) +
          " km · " +
          esc(r.n) +
          " paradas</p>" +
          "</div><span class=\"code\">" +
          esc(r.codigo) +
          "</span></div>" +
          '<div class="tags">' +
          '<span class="tag">' +
          esc(tipo) +
          "</span>" +
          '<span class="tag gold">' +
          esc(r.mat || "") +
          "</span>" +
          (r.patron ? '<span class="tag">' + esc(r.patron) + "</span>" : "") +
          (addons ? '<span class="tag">' + esc(addons) + "</span>" : "") +
          "</div>" +
          '<p class="desc">' +
          esc(r.desc || "") +
          "</p>" +
          '<div class="stops"><strong>Itinerario:</strong> ' +
          esc((r.paradas || []).join(" → ")) +
          "</div></article>"
        );
      })
      .join("");
  }

  function bind() {
    $("applyBtn")?.addEventListener("click", applyFilters);
    $("resetBtn")?.addEventListener("click", () => {
      ["q", "qTop", "qStop", "tipo", "pais", "addon", "material", "patron", "minN", "maxN", "minKm", "maxKm"].forEach((id) => {
        const el = $(id);
        if (el) el.value = "";
      });
      applyFilters();
    });
    ["q", "qTop", "qStop"].forEach((id) => $(id)?.addEventListener("input", () => applyFilters()));
    ["tipo", "pais", "addon", "material", "patron", "sort"].forEach((id) =>
      $(id)?.addEventListener("change", () => applyFilters())
    );
    $("prev")?.addEventListener("click", () => {
      state.page--;
      render();
    });
    $("next")?.addEventListener("click", () => {
      state.page++;
      render();
    });
    $("pageSizeSeg")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-size]");
      if (!btn) return;
      state.pageSize = Number(btn.dataset.size);
      [...$("pageSizeSeg").querySelectorAll("button")].forEach((b) => b.classList.toggle("on", b === btn));
      state.page = 0;
      render();
    });
    $("toggleFilters")?.addEventListener("click", () => $("sidebar")?.classList.toggle("open"));
  }

  async function main() {
    try {
      if (!DATA) DATA = await loadCatalogFromCdn();
      window.CATALOG_DATA = DATA;
      initFilters();
      bind();
      applyFilters();
      hideBoot();
    } catch (e) {
      setBoot(100, String(e.message || e));
    }
  }

  main();
})();
