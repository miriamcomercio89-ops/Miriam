/* Meridiano — interfaz */
(function (global) {
  let game;

  const STATUS_L = { permisos: "Permisos", obras: "En obras", abierto: "Abierto", cerrado: "Cerrado" };

  function mount(g) {
    game = g;
    fillFilterSelects();
    bind();
    renderSplash();
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
        MAP.refresh();
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
    U.$("#btn-export").addEventListener("click", () => game.exportSave());
    U.$("#btn-import").addEventListener("click", () => U.$("#import-file").click());
    U.$("#import-file").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      game.importSave(await f.text());
      e.target.value = "";
    });
    U.$("#new-game").addEventListener("click", () => game.newGame());
    U.$("#continue-game").addEventListener("click", () => game.continueGame());

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
        btn.innerHTML = `
          <div class="logo">${brand.logo}</div>
          <div class="meta"><b>${r.name}</b><small>${STATUS_L[r.status]} · ${r.city || r.countryName}</small></div>
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
      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><b>${Object.keys(byC).length}/${totalC}</b><span>Cobertura países</span></div>
          <div class="kpi"><b>${U.formatMoney(game.state.restaurants.reduce((a, r) => a + r.finance.revTotal, 0))}</b><span>Facturación acumulada</span></div>
        </div>
        <p class="muted">La competencia existe, pero no se pinta en el mapa. La cuota es tuya frente a cadenas ocultas.</p>
        ${rows
          .map(
            (r) => `<div class="rank-row"><div><b>${WORLD.country(r.cc).name}</b><div class="muted">${r.n} locales · cuota ${(r.share * 100).toFixed(0)}%</div></div><div>${U.formatMoney(r.rev)}</div></div>`
          )
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
    U.$("#continue-game").style.display = slots.length ? "block" : "none";
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
          <p class="muted">${brand.name} · ${brand.cuisines.join(", ")} · ${SIM.sizeOf(r.size).name} · ${r.city}, ${r.countryName}</p>
          ${miss.length ? `<p class="loss">Falta personal: ${miss.join(", ")}. El local no atiende.</p>` : ""}
          <h3>Reseñas</h3>
          ${(r.reviews || []).map((rv) => `<div class="news-item">${rv.stars}★ · ${rv.text}</div>`).join("") || "<p class='muted'>Aún no hay reseñas.</p>"}
        `;
      } else if (tab === "carta") {
        body.innerHTML = `<p class="muted">Activa platos, pon precio en euros y calidad de género. Como en una cocina de gestión: la carta es el juego.</p>
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
        body.innerHTML = `
          <div class="kpis">
            <div class="kpi"><b>${U.formatMoney(r.finance.revTotal)}</b><span>Ingresos</span></div>
            <div class="kpi"><b>${U.formatMoney(r.finance.costTotal)}</b><span>Costes</span></div>
            <div class="kpi"><b class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</b><span>Acumulado</span></div>
            <div class="kpi"><b>${U.formatMoney(dayP)}</b><span>Hoy (juego)</span></div>
          </div>
          <p>Alquiler mensual ${U.formatMoney(r.rentMonthly)} · masa salarial ~${U.formatMoney(st.wageDay)}/día laboral</p>
          <p class="muted">Impuestos locales aplicados en cada ticket (IVA) y costes de personal según salario mínimo del país.</p>`;
      } else {
        const val = SIM.sellValue(r, game.state.gameTime);
        body.innerHTML = `
          <p>Superficie ${SIM.sizeOf(r.size).m2} m² · ${SIM.sizeOf(r.size).seats} cubiertos</p>
          <p>Limpieza</p>
          <div class="bar"><i style="width:${r.cleanliness}%"></i></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn ghost" id="clean">Brigada de limpieza</button>
            <button class="btn warn" id="reno">Reformar</button>
            <button class="btn ghost" id="rebrand">Cambiar marca</button>
            <button class="btn ghost" id="toggle">${r.status === "cerrado" ? "Reabrir" : "Cerrar temporalmente"}</button>
            <button class="btn danger" id="sell">Vender (${U.formatMoney(val)})</button>
          </div>
          <div id="rebrand-box"></div>`;
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
    const list = listRestaurants();
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card" style="width:min(980px,96%)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2>Tabla de locales</h2>
        <button class="btn ghost" id="ct">Cerrar</button>
      </div>
      <p class="muted">${U.formatInt(list.length)} en vista filtrada</p>
      <div style="overflow:auto;max-height:70vh">
        <table class="data">
          <thead><tr><th>Local</th><th>Marca</th><th>Ciudad</th><th>País</th><th>Estado</th><th>★</th><th>Resultado</th></tr></thead>
          <tbody>
            ${list
              .slice(0, 400)
              .map((r) => {
                const b = BRAND.get(r.brandId);
                const p = r.finance.revTotal - r.finance.costTotal;
                return `<tr data-id="${r.id}"><td>${r.name}</td><td>${b.name}</td><td>${r.city}</td><td>${r.countryName}</td><td>${STATUS_L[r.status]}</td><td>${r.stars.toFixed(1)}</td><td class="${p >= 0 ? "gain" : "loss"}">${U.formatMoney(p)}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>`;
    modal.classList.add("show");
    U.$("#ct").onclick = closeModal;
    modal.querySelectorAll("tbody tr").forEach((tr) => {
      tr.style.cursor = "pointer";
      tr.onclick = () => {
        closeModal();
        game.openRestaurant(tr.dataset.id);
      };
    });
  }

  async function showSaves(fromGame) {
    const slots = await STORE.listSlots();
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card">
      <h2>Partidas</h2>
      <p class="muted">Varias ranuras, autoguardado y exportar JSON.</p>
      <div id="sv"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn primary" id="sv-new">Nueva</button>
        <button class="btn ghost" id="sv-x">Cerrar</button>
      </div>
    </div>`;
    const sv = U.$("#sv");
    slots.forEach((s) => {
      const row = document.createElement("div");
      row.className = "rank-row";
      row.innerHTML = `<div><b>${s.name}</b><div class="muted">${U.formatDate(s.gameTime)} · ${s.n} locales</div></div>
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
      sv.append(row);
    });
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
