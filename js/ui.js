/* Meridiano — interfaz */
(function (global) {
  let game;

  const STATUS_L = { permisos: "Permisos", obras: "En obras", abierto: "Abierto", cerrado: "Cerrado" };

  function mount(g) {
    game = g;
    try {
      fillFilterSelects();
    } catch (err) {
      console.error(err);
    }
    bind();
    renderSplash().catch(function () {});
  }

  function fillFilterSelects() {
    const fb = U.$("#f-brand");
    BRAND.list.forEach((b) => {
      fb.append(new Option(b.name, b.id));
    });
    const fc = U.$("#f-cuisine");
    BRAND.cuisines.forEach((c) => fc.append(new Option(c, c)));
    const fp = U.$("#f-country");
    Object.values(WORLD.COUNTRIES)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .forEach((c) => fp.append(new Option(c.name, c.iso)));
  }

  function bind() {
    U.$$(".panel-tabs button").forEach((b) =>
      b.addEventListener("click", () => {
        U.$$(".panel-tabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        game.uiTab = b.dataset.tab;
        renderPanel();
      })
    );
    ["f-brand", "f-cuisine", "f-country", "f-status", "f-profit", "f-sort"].forEach((id) => {
      U.$("#" + id).addEventListener("change", () => {
        game.filters.brand = U.$("#f-brand").value;
        game.filters.cuisine = U.$("#f-cuisine").value;
        game.filters.country = U.$("#f-country").value;
        game.filters.status = U.$("#f-status").value;
        game.filters.profit = U.$("#f-profit").value;
        game.filters.sort = U.$("#f-sort").value;
        renderPanel();
        try {
          MAP.refresh();
        } catch (_) {}
      });
    });
    U.$("#speeds").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      game.setSpeed(+b.dataset.sp);
      U.$$("#speeds button").forEach((x) => x.classList.toggle("active", x === b));
    });
    U.$("#btn-day").addEventListener("click", () => game.skipDay());
    U.$("#btn-geo").addEventListener("click", () => game.goMyLocation());
    U.$("#btn-table").addEventListener("click", () => showTable());
    U.$("#btn-saves").addEventListener("click", () => showSaves(true));
    const heat = U.$("#btn-heat");
    if (heat)
      heat.onclick = () => {
        game.heatmap = !game.heatmap;
        heat.classList.toggle("primary", game.heatmap);
        MAP.refresh();
      };
    const sfx = U.$("#btn-sfx");
    if (sfx)
      sfx.onclick = () => {
        SABOR.setMuted(!SABOR.muted());
        sfx.textContent = SABOR.muted() ? "Sonido" : "Sonido on";
        if (!SABOR.muted()) SABOR.sfx.cash();
      };
    const bb = U.$("#btn-best");
    if (bb) bb.onclick = () => MAP.jumpProfit(true);
    const bw = U.$("#btn-worst");
    if (bw) bw.onclick = () => MAP.jumpProfit(false);
    U.$("#btn-export").addEventListener("click", () => game.exportSave());
    U.$("#btn-import").addEventListener("click", () => U.$("#import-file").click());
    U.$("#import-file").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      game.importSave(await f.text());
      e.target.value = "";
    });
    const search = U.$("#search");
    const sug = U.$("#suggest");
    const runSearch = U.debounce(async () => {
      const q = search.value.trim();
      if (q.length < 2) {
        sug.style.display = "none";
        return;
      }
      const hits = await GEO.search(q);
      sug.innerHTML = "";
      hits.forEach((h) => {
        const b = document.createElement("button");
        b.textContent = h.label;
        b.onclick = () => {
          sug.style.display = "none";
          search.value = h.label;
          MAP.fly(h.lat, h.lon, 14);
        };
        sug.append(b);
      });
      sug.style.display = hits.length ? "block" : "none";
    }, 450);
    search.addEventListener("input", runSearch);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-row")) sug.style.display = "none";
    });

    U.$("#sheet").addEventListener("click", (e) => {
      if (e.target.id === "sheet") closeSheet();
    });
    U.$("#modal").addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select")) return;
      if (e.code === "Space") {
        e.preventDefault();
        game.togglePause();
      }
      if (e.key === "Escape") {
        closeSheet();
        closeModal();
      }
      if (e.key === "n" || e.key === "N") {
        UI.toast("Clic en el mapa para un local nuevo. 1–4 eligen tamaño en el modal.");
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        U.$("#search").focus();
      }
      if (e.key === "t" || e.key === "T") showTable();
      if (["1", "2", "3", "4"].includes(e.key) && U.$("#sz")) {
        const btn = U.$("#sz").children[+e.key - 1];
        if (btn) btn.click();
      }
    });
  }

  function toast(msg, bad) {
    const n = document.createElement("div");
    n.className = "toast" + (bad ? " bad" : "");
    n.textContent = msg;
    U.$("#toasts").append(n);
    setTimeout(() => n.remove(), 4200);
  }

  function renderHud() {
    const s = game.state;
    if (!s) return;
    const cash = U.$("#cash");
    cash.textContent = U.formatMoney(s.cash, 0);
    cash.classList.toggle("neg", s.cash < 0);
    const p = U.gameParts(s.gameTime);
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    U.$("#gdate").textContent = `${p.day} ${months[p.m]} ${p.y}`;
    const sp = s.paused || s.speed === 0 ? "pausa" : s.speed + "×";
    U.$("#gtime").textContent = `${U.pad2(p.h)}:${U.pad2(p.min)} UTC · ${sp} · 1 min real = 1 h juego`;
    const box = U.$("#alerts");
    if (box) {
      const als = SABOR.alerts(s);
      box.innerHTML = als.map((a) => `<div class="al ${a.bad ? "bad" : ""}">${a.t}</div>`).join("");
    }
    const leg = U.$("#legend");
    if (leg) {
      const used = new Map();
      for (const r of s.restaurants) used.set(r.brandId, (used.get(r.brandId) || 0) + 1);
      leg.innerHTML = [...used.entries()]
        .slice(0, 24)
        .map(([id, n]) => {
          const b = BRAND.get(id);
          return `<span>${b.logo}${b.name} · ${n}</span>`;
        })
        .join("");
    }
  }

  function listRestaurants() {
    const f = game.filters;
    let list = game.state.restaurants.filter((r) => {
      if (f.brand && r.brandId !== f.brand) return false;
      if (f.cuisine) {
        const b = BRAND.get(r.brandId);
        if (!b.cuisines.includes(f.cuisine)) return false;
      }
      if (f.country && r.country !== f.country) return false;
      if (f.status && r.status !== f.status) return false;
      const profit = r.finance.revTotal - r.finance.costTotal;
      if (f.profit === "gain" && profit <= 0) return false;
      if (f.profit === "loss" && profit > 0) return false;
      return true;
    });
    const sort = f.sort || "new";
    list.sort((a, b) => {
      if (sort === "rev") return b.finance.revTotal - a.finance.revTotal;
      if (sort === "stars") return b.stars - a.stars;
      if (sort === "name") return a.name.localeCompare(b.name, "es");
      return (b.builtAt || 0) - (a.builtAt || 0);
    });
    return list;
  }

  function renderPanel() {
    if (!game.state) return;
    const body = U.$("#panel-body");
    const tab = game.uiTab || "locales";
    if (tab === "locales") {
      const list = listRestaurants();
      const open = game.state.restaurants.filter((r) => r.status === "abierto").length;
      const countries = new Set(game.state.restaurants.map((r) => r.country)).size;
      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><b>${U.formatInt(game.state.restaurants.length)}</b><span>Locales</span></div>
          <div class="kpi"><b>${U.formatInt(open)}</b><span>Abiertos</span></div>
          <div class="kpi"><b>${countries}</b><span>Países</span></div>
          <div class="kpi"><b>${U.formatInt(BRAND.list.length)}</b><span>Marcas</span></div>
        </div>
        <div id="list-root"></div>`;
      const root = U.$("#list-root");
      const slice = list.slice(0, 80);
      if (!slice.length) {
        root.innerHTML = `<p class="muted">Haz clic en el mapa (tierra urbana, no parques ni océano) para construir. Los datos del lugar salen de OpenStreetMap.</p>`;
        return;
      }
      const frag = document.createDocumentFragment();
      for (const r of slice) {
        const brand = BRAND.get(r.brandId);
        const profit = r.finance.revTotal - r.finance.costTotal;
        const btn = document.createElement("button");
        btn.className = "list-item";
        const leftH = r.statusUntil && (r.status === "permisos" || r.status === "obras") ? Math.max(0, (r.statusUntil - game.state.gameTime) / 3600000) : 0;
        const statusTxt = leftH ? `${STATUS_L[r.status]} · ${leftH >= 24 ? (leftH / 24).toFixed(1) + " d" : Math.ceil(leftH) + " h"}` : STATUS_L[r.status];
        btn.innerHTML = `
          <div class="logo">${brand.logo}</div>
          <div class="meta"><b>${r.name}</b><small>${statusTxt} · ${r.city || r.countryName}</small></div>
          <div class="right"><div class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</div><div class="stars">${"★".repeat(Math.round(r.stars))}</div></div>`;
        btn.onclick = () => game.openRestaurant(r.id);
        frag.append(btn);
      }
      if (list.length > 80) {
        const more = document.createElement("p");
        more.className = "muted";
        more.textContent = `Mostrando 80 de ${U.formatInt(list.length)}. Usa la tabla o los filtros.`;
        frag.append(more);
      }
      root.append(frag);
    } else if (tab === "ranking") {
      const byC = {};
      for (const r of game.state.restaurants) {
        if (!byC[r.country]) byC[r.country] = { n: 0, rev: 0, stars: 0 };
        byC[r.country].n++;
        byC[r.country].rev += r.finance.revTotal;
        byC[r.country].stars += r.stars;
      }
      const rows = Object.entries(byC)
        .map(([cc, v]) => ({ cc, ...v, share: 1 - SIM.competingShare(game.state, cc) }))
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 16);
      const totalC = Object.keys(WORLD.COUNTRIES).length;
      const pnl = Object.entries(game.state.pnl || {})
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 8);
      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><b>${Object.keys(byC).length}/${totalC}</b><span>Cobertura países</span></div>
          <div class="kpi"><b>${U.formatMoney(game.state.restaurants.reduce((a, r) => a + r.finance.revTotal, 0))}</b><span>Facturación</span></div>
        </div>
        <h3>P&amp;L mensual (EBITDA operativo)</h3>
        ${
          pnl
            .map(([k, v]) => {
              const e = v.rev - v.cost;
              return `<div class="rank-row"><div>${k}<div class="muted">Ing. ${U.formatMoney(v.rev)} · Coste ${U.formatMoney(v.cost)}</div></div><div class="${e >= 0 ? "gain" : "loss"}">${U.formatMoney(e)}</div></div>`;
            })
            .join("") || "<p class='muted'>Aún no hay meses cerrados.</p>"
        }
        <h3>Competencia oculta</h3>
        <p class="muted">No se pinta en el mapa. La barra es tu cuota frente a otras cadenas.</p>
        ${rows
          .map((r) => {
            const pct = Math.round(r.share * 100);
            return `<div class="rank-row"><div style="flex:1"><b>${WORLD.country(r.cc).name}</b>
              <div class="comp-bar"><i style="width:${pct}%"></i></div>
              <div class="muted">${r.n} locales · tuya ${pct}% · ajena ${100 - pct}%</div></div><div>${U.formatMoney(r.rev)}</div></div>`;
          })
          .join("") || "<p class='muted'>Todavía no hay ranking.</p>"}`;
    } else {
      const news = game.state.news || [];
      body.innerHTML = news
        .slice(0, 40)
        .map((n) => `<div class="news-item"><time>${U.formatDateTime(n.t)}</time>${n.text}</div>`)
        .join("") || "<p class='muted'>Sin noticias.</p>";
    }
  }

  async function renderSplash() {
    const slots = await STORE.listSlots();
    const box = U.$("#slot-list");
    box.innerHTML = "";
    if (U.$("#continue-game")) U.$("#continue-game").style.display = "block";
    slots.slice(0, 6).forEach((s) => {
      const b = document.createElement("button");
      b.className = "slot";
      b.innerHTML = `<div><b>${s.name}</b><div style="opacity:.75;font-size:12px">${U.formatDate(s.gameTime)} · ${s.n} locales · ${U.formatMoney(s.cash)}</div></div><span>Abrir</span>`;
      b.onclick = () => game.loadSlot(s.id);
      box.append(b);
    });
  }

  function hideSplash() {
    U.$("#splash").classList.add("hidden");
  }
  function showSplash() {
    U.$("#splash").classList.remove("hidden");
    renderSplash();
  }

  function closeModal() {
    U.$("#modal").classList.remove("show");
    U.$("#modal").innerHTML = "";
  }
  function closeSheet() {
    U.$("#sheet").classList.remove("show");
    U.$("#sheet").innerHTML = "";
    game.openId = null;
  }

  function showBuild(place) {
    const year = SIM.yearOf(game.state.gameTime);
    const infl = WORLD.inflationFactor(place.countryCode, year);
    const ctry = WORLD.country(place.countryCode);
    let brandId = BRAND.list[0].id;
    let sizeId = "local";
    const modal = U.$("#modal");
    function quote() {
      return SIM.buildQuote(BRAND.get(brandId), sizeId, place, game.state.gameTime);
    }
    function paint() {
      const q = quote();
      const brand = BRAND.get(brandId);
      modal.innerHTML = `<div class="card" id="build-card">
        <h2>Nuevo local</h2>
        <div class="place-box">
          <b>${place.display || place.city || ctry.name}</b>
          <div>${place.cityMatch || place.city || "—"} · ${ctry.name}</div>
          <div class="muted">${place.street || ""} ${place.osmKey ? " · OSM " + place.osmKey + "/" + place.osmValue : ""}</div>
          <div style="margin-top:8px" class="grid2">
            <div>Población est. <b>${U.formatInt((place.popK || 0) * 1000)}</b></div>
            <div>PIB/cap (2000×infl) <b>${U.formatMoney(ctry.gdppc * infl)}</b></div>
            <div>Salario mín. <b>${(ctry.wage * infl).toFixed(2)} €/h</b></div>
            <div>IVA / Soc. <b>${Math.round(ctry.vat * 100)}% / ${Math.round(ctry.tax * 100)}%</b></div>
            <div>Alquiler índice <b>${q.rentIdx.toFixed(2)}</b></div>
            <div>Zona horaria <b>UTC${place.tz >= 0 ? "+" : ""}${place.tz}</b></div>
            <div>Competencia <b>${place.competitor > 0.6 ? "alta" : place.competitor > 0.35 ? "media" : "baja"}</b></div>
            <div>Año juego <b>${year}</b></div>
            <div>Sitio <b>${SABOR.POI_L[place.poi] || "Urbano"}</b></div>
            <div>Gusto vs marca <b>×${SABOR.tasteFit(brand, place.countryCode).toFixed(2)}</b></div>
            <div>Alcohol <b>${SABOR.alcoholPolicy(place.countryCode).mode === "dry" ? "país seco" : SABOR.alcoholPolicy(place.countryCode).mode === "license" ? "licencia" : "libre"}</b></div>
          </div>
        </div>
        <p class="muted">Marca · ${brand.cuisines.join(", ")} · ${BRAND.tiers[brand.tier].name}</p>
        <div class="brand-grid" id="bg"></div>
        <div class="grid2" id="sz" style="margin:12px 0"></div>
        <div class="place-box">
          <div>Permisos ${U.formatMoney(q.permits)} · Obra ${U.formatMoney(q.works + q.fitout)}</div>
          <div><b>Inversión ${U.formatMoney(q.total)}</b> · Alquiler ${U.formatMoney(q.rentMonthly)}/mes</div>
          <div class="muted">Permisos ~${Math.round(q.permitH / 24)} d · Obra ~${Math.round(q.buildH / 24)} d (tiempo de juego)</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" id="cancel-b">Cancelar</button>
          <button class="btn primary" id="ok-b">Tramitar y construir</button>
        </div>
      </div>`;
      const bg = U.$("#bg");
      BRAND.list.forEach((b) => {
        const t = document.createElement("button");
        t.className = "brand-tile" + (b.id === brandId ? " on" : "");
        t.innerHTML = `${b.logo}<span>${b.name}</span>`;
        t.title = b.tagline;
        t.onclick = () => {
          brandId = b.id;
          paint();
        };
        bg.append(t);
      });
      const sz = U.$("#sz");
      SIM.SIZES.forEach((s) => {
        const t = document.createElement("button");
        t.className = "size-tile" + (s.id === sizeId ? " on" : "");
        t.innerHTML = `<b>${s.name}</b><span class="muted">${s.seats} cubiertos · ${s.m2} m²</span>`;
        t.onclick = () => {
          sizeId = s.id;
          paint();
        };
        sz.append(t);
      });
      U.$("#cancel-b").onclick = closeModal;
      U.$("#ok-b").onclick = () => {
        const ok = game.confirmBuild(brandId, sizeId, place, quote());
        if (ok) closeModal();
      };
    }
    paint();
    modal.classList.add("show");
  }

  function showRestaurant(id) {
    const r = game.state.restaurants.find((x) => x.id === id);
    if (!r) return;
    game.openId = id;
    const brand = BRAND.get(r.brandId);
    const sheet = U.$("#sheet");
    let tab = "resumen";
    function paint() {
      const q = SIM.qualityOf(r, brand);
      const st = SIM.staffStats(r.staff);
      const miss = SIM.understaffed(brand, r.size, r.staff);
      const profit = r.finance.revTotal - r.finance.costTotal;
      const loc = SIM.localHour(game.state.gameTime, r.tz);
      sheet.innerHTML = `<div class="sheet">
        <header class="page">
          <div class="logo" style="width:48px;height:48px;border-radius:14px;overflow:hidden">${brand.logo}</div>
          <div style="flex:1">
            <h2 contenteditable="true" id="r-name">${r.name}</h2>
            <div class="muted">${STATUS_L[r.status]}${r.closedReason ? " · " + r.closedReason : ""} · ${r.address}</div>
          </div>
          <div style="text-align:right">
            <div class="stars">${r.stars.toFixed(1)} ★</div>
            <div class="muted">Hora local ${U.pad2(loc.h)}:${U.pad2(loc.min)}</div>
          </div>
          <button class="btn ghost" id="close-s">Cerrar</button>
        </header>
        <div class="content">
          <div class="tabs-inline" id="rtabs">
            ${["resumen", "carta", "personal", "inventario", "finanzas", "local"].map((t) => `<button data-t="${t}" class="${tab === t ? "on" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
          </div>
          <div id="rbody"></div>
        </div>
      </div>`;
      U.$("#close-s").onclick = closeSheet;
      U.$("#r-name").onblur = () => {
        r.name = U.$("#r-name").textContent.trim() || r.name;
        game.dirty();
      };
      U.$$("#rtabs button").forEach((b) =>
        b.addEventListener("click", () => {
          tab = b.dataset.t;
          paint();
        })
      );
      const body = U.$("#rbody");
      if (tab === "resumen") {
        body.innerHTML = `
          <div class="kpis">
            <div class="kpi"><b>${q.toFixed(0)}</b><span>Calidad</span></div>
            <div class="kpi"><b>${r.cleanliness.toFixed(0)}</b><span>Limpieza</span></div>
            <div class="kpi"><b>${U.formatInt(r.finance.customersTotal)}</b><span>Clientes acum.</span></div>
            <div class="kpi"><b class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</b><span>Resultado</span></div>
          </div>
          <p>${brand.tagline}</p>
          <p class="muted">Filial de ${SABOR.HOLDING} · ${brand.name} · ${brand.cuisines.join(", ")} · ${SIM.sizeOf(r.size).name}</p>
          <p class="muted">${r.city}, ${r.countryName} · ${SABOR.POI_L[r.poi] || r.poi} · gusto local ×${SABOR.tasteFit(brand, r.country).toFixed(2)}</p>
          ${(() => {
            const mgrs = r.staff.filter((s) => s.role === "gerente");
            return mgrs.length
              ? `<p>Gerente en sala: <b>${mgrs.map((s) => s.name).join(", ")}</b> (IA de carta y precios ${r.managerAI !== false ? "activa" : "apagada"})</p>`
              : `<p class="loss">Este local no tiene gerente. Contrata uno en Personal.</p>`;
          })()}
          <label><input type="checkbox" id="mgr" ${r.managerAI !== false ? "checked" : ""}/> Gerente IA (establece carta y precios)</label>
          <p class="muted">${r.managerNote || ""}</p>
          ${miss.length ? `<p class="loss">Falta personal: ${miss.join(", ")}. El local no atiende.</p>` : ""}
          <h3>Reseñas</h3>
          ${(r.reviews || []).map((rv) => `<div class="news-item">${rv.stars}★ · ${rv.text}</div>`).join("") || "<p class='muted'>Aún no hay reseñas.</p>"}
        `;
        const mgr = U.$("#mgr");
        if (mgr)
          mgr.onchange = () => {
            r.managerAI = mgr.checked;
            if (r.managerAI) SABOR.runManager(game.state, r, brand, game.state.gameTime);
            game.dirty();
            paint();
          };
      } else if (tab === "carta") {
        body.innerHTML = `<p class="muted">${r.managerAI !== false ? "El gerente IA fija carta y precios. Desactívalo en Resumen para editar a mano." : "Tú fijas carta y precios."}</p>
          <label class="muted">Género del local
            <select id="ingq"><option value="0">Económico</option><option value="1">Estándar</option><option value="2">Premium</option></select>
          </label>
          <div id="dishes"></div>`;
        U.$("#ingq").value = String(r.ingQ ?? 1);
        U.$("#ingq").onchange = () => {
          r.ingQ = +U.$("#ingq").value;
          game.dirty();
        };
        const box = U.$("#dishes");
        brand.dishes.forEach((d, i) => {
          const m = r.menu[i] || { on: true, price: d.price };
          const row = document.createElement("div");
          row.className = "dish-row";
          row.innerHTML = `<input type="checkbox" ${m.on ? "checked" : ""}/>
            <div><b>${d.name}</b>${d.sig ? " · firma" : ""}${d.alc ? " · alcohol" : ""}${d.veg ? " · veg" : ""}<div class="muted">${d.ings.map((x) => BRAND.ings[x]?.n || x).join(", ")}</div></div>
            <input type="number" step="0.1" min="0" value="${m.price}" />
            <span class="muted">coste ~${U.formatMoney(d.cost, 2)}</span>`;
          const [ck, , price] = [row.children[0], row.children[1], row.children[2]];
          const lock = r.managerAI !== false;
          ck.disabled = lock;
          price.disabled = lock;
          ck.onchange = () => {
            r.menu[i].on = ck.checked;
            game.dirty();
          };
          price.onchange = () => {
            r.menu[i].price = Math.max(0, +price.value || 0);
            game.dirty();
          };
          box.append(row);
        });
      } else if (tab === "personal") {
        body.innerHTML = `<p class="muted">Salarios ligados al mínimo del país (inflado desde 2000). Entrenar cuesta y sube habilidad.</p>
          <div id="staff"></div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap" id="hire"></div>`;
        const box = U.$("#staff");
        r.staff.forEach((s) => {
          const row = document.createElement("div");
          row.className = "staff-row";
          row.innerHTML = `<div><b>${s.name}</b><div class="muted">${SIM.ROLES[s.role].name} · habilidad ${s.skill}</div></div>
            <div>${s.wage.toFixed(2)} €/h</div>
            <button class="btn sm ghost">Entrenar</button>
            <button class="btn sm danger">Despedir</button>`;
          row.children[2].onclick = () => {
            const cost = 400 * WORLD.priceLevel(r.country, SIM.yearOf(game.state.gameTime));
            if (game.state.cash < cost) return toast("Sin caja para formar.", true);
            game.state.cash -= cost;
            s.skill = Math.min(99, s.skill + 8);
            s.wage = +(s.wage * 1.06).toFixed(2);
            game.dirty();
            paint();
          };
          row.children[3].onclick = () => {
            r.staff = r.staff.filter((x) => x.id !== s.id);
            game.dirty();
            paint();
          };
          box.append(row);
        });
        const hire = U.$("#hire");
        Object.keys(SIM.ROLES).forEach((role) => {
          const b = document.createElement("button");
          b.className = "btn ghost sm";
          b.textContent = "+ " + SIM.ROLES[role].name;
          b.onclick = () => {
            const rng = Math.random;
            const year = SIM.yearOf(game.state.gameTime);
            const wageH = WORLD.country(r.country).wage * WORLD.inflationFactor(r.country, year);
            const skill = Math.round(40 + Math.random() * 30);
            r.staff.push({
              id: U.uid("st"),
              role,
              name: SIM.personName(rng),
              skill,
              wage: +(wageH * SIM.ROLES[role].wage * (0.7 + skill / 200)).toFixed(2),
            });
            game.dirty();
            paint();
          };
          hire.append(b);
        });
      } else if (tab === "inventario") {
        body.innerHTML = `
          <p>Stock operativo</p>
          <div class="bar"><i style="width:${r.stock}%"></i></div>
          <p class="muted">${r.stock.toFixed(0)} / 100 · cada local compra en su mercado (autónomo).</p>
          <label><input type="checkbox" id="auto" ${r.autoRestock ? "checked" : ""}/> Reposición automática</label>
          <div style="margin-top:10px"><button class="btn primary" id="restock">Repostar ahora</button></div>
          <h3>Género de la carta</h3>
          <table class="data"><thead><tr><th>Ingrediente</th><th>Grupo</th><th>Caduca (días)</th></tr></thead><tbody id="ings"></tbody></table>`;
        U.$("#auto").onchange = () => {
          r.autoRestock = U.$("#auto").checked;
          game.dirty();
        };
        U.$("#restock").onclick = () => {
          const pl = WORLD.priceLevel(r.country, SIM.yearOf(game.state.gameTime));
          const cost = (100 - r.stock) * 2.2 * pl * (SIM.sizeOf(r.size).seats / 20);
          game.state.cash -= cost;
          r.stock = 100;
          toast("Repuesto por " + U.formatMoney(cost));
          game.dirty();
          paint();
        };
        const used = new Set(brand.dishes.flatMap((d) => d.ings));
        U.$("#ings").innerHTML = [...used]
          .map((k) => {
            const i = BRAND.ings[k];
            return `<tr><td>${i?.n || k}</td><td>${i?.g || ""}</td><td>${i?.d ?? "—"}</td></tr>`;
          })
          .join("");
      } else if (tab === "finanzas") {
        const dayP = r.finance.revToday - r.finance.costToday;
        const months = Object.entries(r.finance.months || {})
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 10);
        body.innerHTML = `
          <div class="kpis">
            <div class="kpi"><b>${U.formatMoney(r.finance.revTotal)}</b><span>Ingresos</span></div>
            <div class="kpi"><b>${U.formatMoney(r.finance.costTotal)}</b><span>Costes</span></div>
            <div class="kpi"><b class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</b><span>EBITDA acum.</span></div>
            <div class="kpi"><b>${U.formatMoney(dayP)}</b><span>Hoy (juego)</span></div>
          </div>
          <p>Alquiler mensual ${U.formatMoney(r.rentMonthly)} · masa salarial ~${U.formatMoney(st.wageDay)}/día laboral</p>
          <h3>Mensual</h3>
          ${months.map(([k, v]) => `<div class="rank-row"><div>${k}</div><div class="${v.rev - v.cost >= 0 ? "gain" : "loss"}">${U.formatMoney(v.rev - v.cost)}</div></div>`).join("") || "<p class='muted'>Sin meses aún.</p>"}`;
      } else {
        const val = SIM.sellValue(r, game.state.gameTime);
        const pol = SABOR.alcoholPolicy(r.country);
        if (!r.hours) r.hours = SABOR.defaultHours(brand);
        body.innerHTML = `
          <p>Superficie ${SIM.sizeOf(r.size).m2} m² · ${SIM.sizeOf(r.size).seats} cubiertos · ${SABOR.POI_L[r.poi] || r.poi}</p>
          <p>Limpieza</p>
          <div class="bar"><i style="width:${r.cleanliness}%"></i></div>
          <h3>Horario local (hora del sitio)</h3>
          <p class="muted">Siete días, dos franjas (comida y cena). 24 = medianoche, 26 = 02:00. El gerente IA no pisa un horario que tú edites.</p>
          <div class="hours-presets" id="hpre">
            <button type="button" class="btn ghost sm" data-hp="marca">Marca</button>
            <button type="button" class="btn ghost sm" data-hp="24h">24 h</button>
            <button type="button" class="btn ghost sm" data-hp="lunoff">Cerrado lunes</button>
            <button type="button" class="btn ghost sm" data-hp="finde">Finde largo</button>
            <button type="button" class="btn ghost sm" data-hp="split">Comida+cena</button>
            <button type="button" class="btn ghost sm" data-hp="copylun">Lun → semana</button>
          </div>
          <div class="hours-grid" id="hours"></div>
          <h3>Ampliaciones</h3>
          <label><input type="checkbox" id="deliv" ${r.delivery ? "checked" : ""}/> Delivery (${U.formatMoney(r.rentMonthly * 0.15)} alta)</label><br>
          <label><input type="checkbox" id="terr" ${r.terrace ? "checked" : ""}/> Terraza (${U.formatMoney(r.rentMonthly * 0.12)} alta)</label>
          <p class="muted">Alcohol: ${pol.mode === "dry" ? "país seco — no se puede servir" : pol.mode === "license" ? "requiere licencia" : "libre con tasa"} · ${r.alcoholLicense ? "licencia activa" : "sin licencia"}</p>
          ${pol.mode !== "dry" && !r.alcoholLicense ? `<button class="btn ghost" id="lic">Comprar licencia (${U.formatMoney(pol.license * WORLD.inflationFactor(r.country, SIM.yearOf(game.state.gameTime)))})</button>` : ""}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn ghost" id="clean">Brigada de limpieza</button>
            <button class="btn warn" id="reno">Reformar</button>
            <button class="btn ghost" id="rebrand">Cambiar marca</button>
            <button class="btn ghost" id="toggle">${r.status === "cerrado" ? "Reabrir" : "Cerrar temporalmente"}</button>
            <button class="btn danger" id="sell">Vender (${U.formatMoney(val)})</button>
          </div>
          <div id="rebrand-box"></div>`;
        const hg = U.$("#hours");
        const daysN = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const paintHours = () => {
          hg.innerHTML = `<span class="hh"></span><span class="hh">Abre</span><span class="hh">Franja 1</span><span class="hh">a</span><span class="hh">Franja 2</span><span class="hh">a</span>`;
          r.hours.forEach((h, i) => {
            const row = document.createElement("div");
            row.style.display = "contents";
            row.innerHTML = `<span class="hd">${daysN[i]}</span>
              <input type="checkbox" title="Abre" ${h.open ? "checked" : ""}/>
              <input type="number" min="0" max="27" value="${h.a}" title="Apertura 1"/>
              <input type="number" min="0" max="27" value="${h.b}" title="Cierre 1"/>
              <input type="number" min="0" max="27" value="${h.c || 0}" title="Apertura 2 (0 = no)"/>
              <input type="number" min="0" max="27" value="${h.d || 0}" title="Cierre 2"/>`;
            const [ck, a, b, c, d] = [row.children[1], row.children[2], row.children[3], row.children[4], row.children[5]];
            const touch = () => {
              r.hoursCustom = true;
              game.dirty();
            };
            ck.onchange = () => {
              h.open = ck.checked;
              touch();
            };
            a.onchange = () => {
              h.a = +a.value;
              touch();
            };
            b.onchange = () => {
              h.b = +b.value;
              touch();
            };
            c.onchange = () => {
              h.c = +c.value;
              touch();
            };
            d.onchange = () => {
              h.d = +d.value;
              touch();
            };
            hg.append(row);
          });
        };
        paintHours();
        U.$("#hpre").onclick = (ev) => {
          const btn = ev.target.closest("button[data-hp]");
          if (!btn) return;
          const k = btn.dataset.hp;
          if (k === "copylun") {
            const src = { ...r.hours[1] };
            r.hours = r.hours.map(() => ({ ...src }));
          } else if (k === "marca") r.hours = SABOR.defaultHours(brand);
          else r.hours = SABOR.applyHoursPreset(brand, k);
          r.hoursCustom = true;
          game.dirty();
          paintHours();
        };
        U.$("#deliv").onchange = () => {
          if (U.$("#deliv").checked && !r.delivery) {
            const c = r.rentMonthly * 0.15;
            if (game.state.cash < c) {
              U.$("#deliv").checked = false;
              return toast("No alcanza el delivery.", true);
            }
            game.state.cash -= c;
            r.delivery = true;
            toast("Delivery activado.");
          } else r.delivery = U.$("#deliv").checked;
          game.dirty();
        };
        U.$("#terr").onchange = () => {
          if (U.$("#terr").checked && !r.terrace) {
            const c = r.rentMonthly * 0.12;
            if (game.state.cash < c) {
              U.$("#terr").checked = false;
              return toast("No alcanza la terraza.", true);
            }
            game.state.cash -= c;
            r.terrace = true;
          } else r.terrace = U.$("#terr").checked;
          game.dirty();
        };
        const lic = U.$("#lic");
        if (lic)
          lic.onclick = () => {
            const c = pol.license * WORLD.inflationFactor(r.country, SIM.yearOf(game.state.gameTime));
            if (game.state.cash < c) return toast("Sin caja para la licencia.", true);
            game.state.cash -= c;
            r.alcoholLicense = true;
            toast("Licencia de alcohol concedida.");
            game.dirty();
            paint();
          };
        U.$("#clean").onclick = () => {
          const c = 250 * WORLD.priceLevel(r.country, SIM.yearOf(game.state.gameTime));
          game.state.cash -= c;
          r.cleanliness = 100;
          toast("Local reluciente.");
          game.dirty();
          paint();
        };
        U.$("#reno").onclick = () => {
          const c = r.rentMonthly * 1.8;
          if (game.state.cash < c) return toast("No alcanza la reforma.", true);
          game.state.cash -= c;
          r.quality = Math.min(99, r.quality + 8);
          r.stars = Math.min(5, r.stars + 0.15);
          r.sellValue *= 1.08;
          toast("Reforma completada.");
          game.dirty();
          paint();
        };
        U.$("#toggle").onclick = () => {
          if (r.status === "abierto") {
            r.status = "cerrado";
            r.closedReason = "Cierre voluntario";
          } else if (r.status === "cerrado") {
            r.status = "abierto";
            r.closedReason = "";
          }
          game.dirty();
          paint();
          MAP.refresh();
        };
        U.$("#sell").onclick = () => {
          if (!confirm("¿Vender este local?")) return;
          game.state.cash += val;
          game.state.restaurants = game.state.restaurants.filter((x) => x.id !== r.id);
          toast("Local vendido.");
          game.dirty();
          closeSheet();
          renderPanel();
          MAP.refresh();
        };
        U.$("#rebrand").onclick = () => {
          const box = U.$("#rebrand-box");
          box.innerHTML = `<p class="muted">Cambio de marca: 3 días de obras y un 18% del valor.</p><div class="brand-grid" id="rb"></div>`;
          BRAND.list.forEach((b) => {
            const t = document.createElement("button");
            t.className = "brand-tile";
            t.innerHTML = `${b.logo}<span>${b.name}</span>`;
            t.onclick = () => {
              const fee = val * 0.18;
              game.state.cash -= fee;
              r.brandId = b.id;
              r.menu = SIM.defaultMenu(b);
              r.name = `${b.name} · ${r.city || r.countryName}`;
              r.status = "obras";
              r.statusUntil = game.state.gameTime + 72 * 3600000;
              toast("Cambio de marca en obras.");
              game.dirty();
              paint();
              MAP.refresh();
            };
            U.$("#rb").append(t);
          });
        };
      }
    }
    paint();
    sheet.classList.add("show");
  }

  function showTable() {
    let list = listRestaurants();
    const modal = U.$("#modal");
    const rowH = 32;
    modal.innerHTML = `<div class="card" style="width:min(980px,96%)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
        <h2>Tabla de locales</h2>
        <input id="qtab" placeholder="Buscar nombre, ciudad, marca" style="flex:1;min-width:160px;padding:8px;border-radius:10px;border:1px solid var(--line)"/>
        <button class="btn ghost" id="csv">CSV</button>
        <button class="btn ghost" id="ct">Cerrar</button>
      </div>
      <p class="muted" id="tabn">${U.formatInt(list.length)} en vista</p>
      <div class="vt-wrap" id="vt">
        <div id="vt-spacer" style="position:relative">
          <table class="data" style="position:sticky;top:0;background:#fffaf2;z-index:1"><thead><tr><th>Local</th><th>Marca</th><th>Ciudad</th><th>País</th><th>Estado</th><th>★</th><th>Resultado</th></tr></thead></table>
          <div id="vt-rows"></div>
        </div>
      </div>
    </div>`;
    modal.classList.add("show");
    const apply = () => {
      const q = (U.$("#qtab").value || "").toLowerCase();
      list = listRestaurants().filter((r) => {
        if (!q) return true;
        const b = BRAND.get(r.brandId);
        return (r.name + r.city + r.countryName + (b && b.name)).toLowerCase().includes(q);
      });
      U.$("#tabn").textContent = U.formatInt(list.length) + " en vista";
      paintRows();
    };
    const paintRows = () => {
      const wrap = U.$("#vt");
      const vis = Math.ceil(wrap.clientHeight / rowH) + 8;
      const start = Math.max(0, Math.floor(wrap.scrollTop / rowH) - 2);
      const end = Math.min(list.length, start + vis);
      U.$("#vt-spacer").style.height = list.length * rowH + 36 + "px";
      const rows = U.$("#vt-rows");
      rows.style.position = "absolute";
      rows.style.top = 36 + start * rowH + "px";
      rows.style.left = 0;
      rows.style.right = 0;
      rows.innerHTML = `<table class="data"><tbody>${list
        .slice(start, end)
        .map((r) => {
          const b = BRAND.get(r.brandId);
          const p = r.finance.revTotal - r.finance.costTotal;
          return `<tr data-id="${r.id}"><td>${r.name}</td><td>${b.name}</td><td>${r.city}</td><td>${r.countryName}</td><td>${STATUS_L[r.status]}</td><td>${(r.stars || 0).toFixed(1)}</td><td class="${p >= 0 ? "gain" : "loss"}">${U.formatMoney(p)}</td></tr>`;
        })
        .join("")}</tbody></table>`;
      rows.querySelectorAll("tr").forEach((tr) => {
        tr.style.cursor = "pointer";
        tr.onclick = () => {
          closeModal();
          game.openRestaurant(tr.dataset.id);
        };
      });
    };
    U.$("#vt").addEventListener("scroll", paintRows);
    U.$("#qtab").addEventListener("input", apply);
    U.$("#csv").onclick = () => {
      const lines = [["nombre", "marca", "ciudad", "pais", "estado", "estrellas", "resultado"].join(";")];
      list.forEach((r) => {
        const b = BRAND.get(r.brandId);
        const p = r.finance.revTotal - r.finance.costTotal;
        lines.push([r.name, b.name, r.city, r.countryName, r.status, r.stars, p.toFixed(2)].join(";"));
      });
      U.download("saborama-locales.csv", lines.join("\n"));
    };
    U.$("#ct").onclick = closeModal;
    paintRows();
  }

  async function showSaves(fromGame) {
    const slots = await STORE.listSlots();
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card">
      <h2>8 ranuras — ${SABOR.HOLDING}</h2>
      <p class="muted">Miniatura del mapa de locales, fecha de juego y última vez real.</p>
      <div id="sv"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn primary" id="sv-new">Nueva</button>
        <button class="btn ghost" id="sv-x">Cerrar</button>
      </div>
    </div>`;
    const sv = U.$("#sv");
    for (let i = 0; i < 8; i++) {
      const s = slots[i];
      const row = document.createElement("div");
      row.className = "rank-row";
      if (!s) {
        row.innerHTML = `<div class="slot-card"><div style="width:88px;height:48px;border-radius:8px;background:#efe6d4"></div><div><b>Ranura ${i + 1}</b><div class="muted">Vacía</div></div></div>`;
      } else {
        row.innerHTML = `<div class="slot-card">${s.thumb ? `<img src="${s.thumb}" alt="">` : `<div style="width:88px;height:48px;border-radius:8px;background:#d5e4d0"></div>`}
          <div><b>${s.name}</b><div class="muted">Juego ${U.formatDate(s.gameTime)} · ${s.n} locales · ${U.formatMoney(s.cash)}</div>
          <div class="muted">Guardado ${s.savedAt ? new Date(s.savedAt).toLocaleString("es-ES") : "—"}</div></div></div>
          <div style="display:flex;gap:6px">
            <button class="btn sm ghost">Cargar</button>
            <button class="btn sm danger">Borrar</button>
          </div>`;
        row.querySelector(".ghost").onclick = () => game.loadSlot(s.id);
        row.querySelector(".danger").onclick = async () => {
          if (!confirm("¿Borrar partida?")) return;
          await STORE.remove(s.id);
          showSaves(fromGame);
        };
      }
      sv.append(row);
    }
    U.$("#sv-new").onclick = () => game.newGame();
    U.$("#sv-x").onclick = closeModal;
    modal.classList.add("show");
  }

  global.UI = {
    mount,
    toast,
    renderHud,
    renderPanel,
    renderSplash,
    hideSplash,
    showSplash,
    showBuild,
    showRestaurant,
    showTable,
    showSaves,
    closeModal,
    closeSheet,
    refreshOpen() {
      if (game.openId) showRestaurant(game.openId);
    },
  };
})(window);
