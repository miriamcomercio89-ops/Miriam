/* Horizon Hotels — interfaz */
(function (global) {
  let game;

  const STATUS_L = { permisos: "Permisos", obras: "En obras", abierto: "Abierto", cerrado: "Cerrado" };
  const DESC_MAX = 800;
  const REST_META = {
    photoBtn: "r-photo-btn",
    photoFile: "r-photo-file",
    photoImg: "r-photo-img",
    photoPh: "r-photo-ph",
    photoClear: "r-photo-clear",
    desc: "r-desc",
    descN: "r-desc-n",
  };

  function venueMetaHtml(ids) {
    const pBtn = ids.photoBtn;
    const pFile = ids.photoFile;
    const pImg = ids.photoImg;
    const pPh = ids.photoPh;
    const pClear = ids.photoClear;
    const dTa = ids.desc;
    const dN = ids.descN;
    return `<div class="venue-meta">
      <div class="venue-photo">
        <div class="venue-photo-frame">
          <img id="${pImg}" alt="Foto del hotel" hidden />
          <div class="venue-photo-ph" id="${pPh}">Sin foto de este hotel</div>
        </div>
        <div class="venue-photo-actions">
          <input type="file" id="${pFile}" accept="image/jpeg,image/png,image/webp,image/gif" hidden />
          <button type="button" class="btn primary" id="${pBtn}">Cambiar imagen</button>
          <button type="button" class="btn ghost" id="${pClear}">Quitar foto</button>
          <p class="muted">Foto de este hotel (no el logo de la marca). Se comprime y se guarda en la partida.</p>
        </div>
      </div>
      <label class="venue-desc"><span>Descripción del hotel</span>
        <textarea id="${dTa}" maxlength="${DESC_MAX}" rows="4" placeholder="Ambiente, historia, notas de este hotel…"></textarea>
        <span class="count" id="${dN}">0 / ${DESC_MAX}</span>
      </label>
    </div>`;
  }

  let lightboxBound = false;
  let lightboxZoom = 1;
  const LIGHTBOX_ZOOM_MIN = 1;
  const LIGHTBOX_ZOOM_MAX = 6;

  function setLightboxZoom(img, zoom) {
    lightboxZoom = U.clamp(zoom, LIGHTBOX_ZOOM_MIN, LIGHTBOX_ZOOM_MAX);
    img.style.transform = lightboxZoom > 1 ? `scale(${lightboxZoom.toFixed(3)})` : "";
    img.style.cursor = lightboxZoom > 1 ? "zoom-out" : "zoom-in";
  }

  function bindPhotoLightboxOnce() {
    if (lightboxBound) return;
    lightboxBound = true;
    const box = U.$("#photo-lightbox");
    const closeBtn = U.$("#photo-lightbox-close");
    const img = U.$("#photo-lightbox-img");
    if (!box) return;
    const close = () => {
      box.hidden = true;
      if (img) {
        img.removeAttribute("src");
        setLightboxZoom(img, 1);
      }
    };
    box.addEventListener("click", (ev) => {
      if (ev.target === box || ev.target === closeBtn) close();
    });
    if (closeBtn) closeBtn.onclick = close;
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && !box.hidden) close();
    });
    if (img) {
      img.addEventListener(
        "wheel",
        (ev) => {
          ev.preventDefault();
          const factor = Math.exp(-ev.deltaY * 0.0015);
          setLightboxZoom(img, lightboxZoom * factor);
        },
        { passive: false }
      );
      img.addEventListener("dblclick", () => setLightboxZoom(img, lightboxZoom > 1 ? 1 : 2.5));
    }
  }

  function openPhotoLightbox(url) {
    if (!url) return;
    bindPhotoLightboxOnce();
    const box = U.$("#photo-lightbox");
    const img = U.$("#photo-lightbox-img");
    if (!box || !img) return;
    img.src = url;
    setLightboxZoom(img, 1);
    box.hidden = false;
  }

  function applyPhotoFrame(photo, imgId, phId) {
    const img = U.$(imgId.startsWith("#") ? imgId : "#" + imgId);
    const ph = U.$(phId.startsWith("#") ? phId : "#" + phId);
    const url = U.safePhoto(photo);
    if (!img) return;
    const frame = img.closest(".venue-photo-frame");
    if (url) {
      img.src = url;
      img.hidden = false;
      if (ph) ph.hidden = true;
      if (frame) frame.classList.add("has-photo");
      img.onclick = () => openPhotoLightbox(url);
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      if (ph) ph.hidden = false;
      if (frame) frame.classList.remove("has-photo");
      img.onclick = null;
    }
  }

  function bindVenueMeta(getPhoto, setPhoto, getDesc, setDesc, ids, onPhotoChange) {
    const ta = U.$("#" + ids.desc);
    const count = U.$("#" + ids.descN);
    const file = U.$("#" + ids.photoFile);
    const btn = U.$("#" + ids.photoBtn);
    const clear = U.$("#" + ids.photoClear);
    const paintCount = () => {
      if (count) count.textContent = `${(getDesc() || "").length} / ${DESC_MAX}`;
    };
    applyPhotoFrame(getPhoto(), ids.photoImg, ids.photoPh);
    if (ta) {
      ta.value = getDesc() || "";
      paintCount();
      ta.oninput = () => {
        setDesc(ta.value.slice(0, DESC_MAX));
        if (ta.value.length > DESC_MAX) ta.value = ta.value.slice(0, DESC_MAX);
        paintCount();
      };
    }
    if (btn && file) {
      btn.onclick = () => file.click();
      file.onchange = () => {
        const f = file.files && file.files[0];
        file.value = "";
        if (!f) return;
        U.compressPhoto(f)
          .then((url) => {
            setPhoto(url);
            applyPhotoFrame(url, ids.photoImg, ids.photoPh);
            if (onPhotoChange) onPhotoChange();
          })
          .catch(() => toast("No se pudo leer la imagen.", true));
      };
    }
    if (clear)
      clear.onclick = () => {
        setPhoto("");
        applyPhotoFrame("", ids.photoImg, ids.photoPh);
        if (onPhotoChange) onPhotoChange();
      };
  }

  function bindHotelPhotoDesc(r) {
    bindVenueMeta(
      () => r.photo,
      (v) => {
        r.photo = v;
        game.dirty(true);
        renderPanel();
      },
      () => r.description || "",
      (v) => {
        r.description = v;
        game.dirty();
        clearTimeout(bindHotelPhotoDesc._t);
        bindHotelPhotoDesc._t = setTimeout(() => {
          if (game.saveNow) game.saveNow();
        }, 700);
      },
      REST_META
    );
  }

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

  const BACKUP_PROMPT_KEY = "horizon-hotels-backup-prompt-seen";

  function bindBackupPrompt() {
    const box = U.$("#backup-prompt");
    if (!box) return;
    const yes = U.$("#backup-prompt-yes");
    const no = U.$("#backup-prompt-no");
    const dismiss = () => {
      box.classList.remove("show");
      try {
        localStorage.setItem(BACKUP_PROMPT_KEY, "1");
      } catch (_) {}
    };
    if (yes)
      yes.onclick = async () => {
        dismiss();
        const r = await game.backupEnable();
        if (r.active) {
          toast(
            r.fallback
              ? "Este navegador no permite elegir un archivo fijo, así que cada varios minutos se descargará automáticamente una copia de tu partida a la carpeta de Descargas."
              : "Autoguardado en tu ordenador activo en " + (r.fileName || "el archivo elegido") + ". Cada partida se escribirá también ahí, aunque borres la caché del navegador."
          );
        } else if (r.lastError === "elegir-archivo") {
          toast("No se pudo activar el autoguardado en tu ordenador.", true);
        }
      };
    if (no) no.onclick = dismiss;
  }

  function maybeShowBackupPrompt() {
    const box = U.$("#backup-prompt");
    if (!box || !game || !game.backupStatus) return;
    let seen = false;
    try {
      seen = localStorage.getItem(BACKUP_PROMPT_KEY) === "1";
    } catch (_) {}
    if (seen) return;
    const st = game.backupStatus();
    if (st.active) return;
    setTimeout(() => {
      if (game.backupStatus().active) return;
      box.classList.add("show");
    }, 2500);
  }

  function fillFilterSelects() {
    const fb = U.$("#f-brand");
    BRAND.list.forEach((b) => {
      fb.append(new Option(b.name, b.id));
    });
    const fc = U.$("#f-segment");
    BRAND.segments.forEach((s) => fc.append(new Option(s.name, s.id)));
    const fp = U.$("#f-country");
    Object.values(WORLD.COUNTRIES)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .forEach((c) => fp.append(new Option(c.name, c.iso)));
  }

  function bind() {
    U.$$(".panel-tabs button").forEach((b) =>
      b.addEventListener("click", () => {
        b.classList.add("active");
        b.setAttribute("aria-selected", "true");
        U.$$(".panel-tabs button").forEach((x) => {
          if (x !== b) {
            x.classList.remove("active");
            x.setAttribute("aria-selected", "false");
          }
        });
        game.uiTab = b.dataset.tab;
        renderPanel();
      })
    );
    const cashBoxBtn = U.$("#cash-box");
    if (cashBoxBtn)
      cashBoxBtn.addEventListener("click", () => {
        const tab = U.$('.panel-tabs button[data-tab="matriz"]');
        if (tab) tab.click();
      });
    ["f-brand", "f-segment", "f-country", "f-status", "f-profit", "f-sort"].forEach((id) => {
      U.$("#" + id).addEventListener("change", () => {
        game.filters.brand = U.$("#f-brand").value;
        game.filters.segment = U.$("#f-segment").value;
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
        sfx.setAttribute("aria-pressed", SABOR.muted() ? "false" : "true");
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
    const backupBtn = U.$("#btn-backup");
    if (backupBtn) {
      backupBtn.addEventListener("click", async () => {
        const st = game.backupStatus();
        if (st.active) {
          const msg = st.fallback
            ? "Descarga automática activa: cada varios minutos se guarda una copia de tu partida en la carpeta de Descargas. ¿Desactivarla?"
            : "Copia de seguridad automática activa" + (st.fileName ? " en " + st.fileName : "") + ". ¿Desactivarla? El archivo ya escrito no se borra.";
          if (confirm(msg)) {
            game.backupDisable();
            renderBackupBtn();
            toast("Copia de seguridad automática desactivada.");
          }
          return;
        }
        if (!st.supported) {
          const r = await game.backupEnable();
          renderBackupBtn();
          if (r.active) toast("Este navegador no permite elegir un archivo fijo, así que cada varios minutos se descargará automáticamente una copia de tu partida a la carpeta de Descargas: tampoco se borra al limpiar la caché.");
          return;
        }
        if (st.hasHandle) {
          const r = await game.backupReactivate();
          renderBackupBtn();
          if (r.active) {
            toast("Copia de seguridad reactivada en " + (r.fileName || "el archivo elegido") + ".");
          } else {
            game.backupDisable();
            renderBackupBtn();
            toast("No se pudo recuperar el permiso. Pulsa otra vez para elegir el archivo de copia de nuevo (tu partida sigue a salvo en este dispositivo).", true);
          }
          return;
        }
        const r = await game.backupEnable();
        renderBackupBtn();
        if (r.active) toast("Copia de seguridad automática activa en " + (r.fileName || "el archivo elegido") + ". Cada partida se escribirá también ahí, aunque borres la caché del navegador.");
        else if (r.lastError === "elegir-archivo") toast("No se pudo activar la copia de seguridad.", true);
      });
      game.backupOnChange(renderBackupBtn);
      renderBackupBtn();
    }
    function renderBackupBtn() {
      if (!backupBtn) return;
      const st = game.backupStatus();
      backupBtn.classList.remove("primary", "warn");
      if (st.active) {
        backupBtn.classList.add("primary");
        backupBtn.title = st.fallback
          ? "Descarga automática activa: cada varios minutos se guarda una copia en tu carpeta de Descargas. Clic para desactivar."
          : "Copia de seguridad automática activa" + (st.fileName ? " (" + st.fileName + ")" : "") + ". Clic para desactivar.";
      } else if (!st.supported) {
        backupBtn.title = "Activar autoguardado en tu ordenador (recomendado): tu navegador no permite elegir un archivo fijo, así que se descargará una copia periódicamente en Descargas.";
      } else if (st.hasHandle) {
        backupBtn.classList.add("warn");
        backupBtn.title = "Copia de seguridad en pausa: falta permiso. Clic para reactivarla.";
      } else {
        backupBtn.title = "Activar autoguardado en tu ordenador (recomendado): la partida y las fotos se escriben también en un archivo real que no se borra al limpiar la caché del navegador.";
      }
    }
    bindBackupPrompt();
    const search = U.$("#search");
    const sug = U.$("#suggest");
    let lastHits = [];
    const goToHit = (h) => {
      sug.style.display = "none";
      search.value = h.label;
      MAP.fly(h.lat, h.lon, 16);
      MAP.dropSearchPin(h.lat, h.lon, h.label);
    };
    const runSearch = U.debounce(async () => {
      const q = search.value.trim();
      if (q.length < 2) {
        sug.style.display = "none";
        lastHits = [];
        return;
      }
      const hits = await GEO.search(q);
      lastHits = hits;
      sug.innerHTML = "";
      hits.forEach((h) => {
        const b = document.createElement("button");
        b.innerHTML = `<span class="sug-ico">📍</span><span>${h.label}</span>`;
        b.onclick = () => goToHit(h);
        sug.append(b);
      });
      sug.style.display = hits.length ? "block" : "none";
    }, 450);
    search.addEventListener("input", runSearch);
    search.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && lastHits.length) {
        e.preventDefault();
        goToHit(lastHits[0]);
      } else if (e.key === "Escape") {
        sug.style.display = "none";
        search.blur();
      }
    });
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
        UI.toast("Clic en el mapa para un hotel nuevo. Elige marca y formato en el modal.");
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        U.$("#search").focus();
      }
      if (e.key === "t" || e.key === "T") showTable();
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
    const debtEl = U.$("#debt");
    const debt = SIM.debtTotal ? SIM.debtTotal(s) : 0;
    if (debtEl) {
      if (debt > 0) {
        debtEl.hidden = false;
        debtEl.textContent = "Deuda " + U.formatMoney(debt, 0);
      } else {
        debtEl.hidden = true;
      }
    }
    const cashBox = U.$("#cash-box");
    if (cashBox) cashBox.classList.toggle("neg", s.cash < 0);
    const p = U.gameParts(s.gameTime);
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    U.$("#gdate").textContent = `${p.day} ${months[p.m]} ${p.y}`;
    const sp = s.paused || s.speed === 0 ? "pausa" : s.speed + "×";
    U.$("#gtime").textContent = `${U.pad2(p.h)}:${U.pad2(p.min)} UTC · ${sp} · 1 min real = 1 h juego`;
    const alertsBox = U.$("#alerts");
    if (alertsBox) {
      const als = SABOR.alerts(s);
      alertsBox.innerHTML = als.map((a) => `<div class="al ${a.bad ? "bad" : ""}">${a.t}</div>`).join("");
    }
    const leg = U.$("#legend");
    if (leg) {
      const used = new Map();
      for (const r of s.hotels) used.set(r.brandId, (used.get(r.brandId) || 0) + 1);
      leg.innerHTML = [...used.entries()]
        .slice(0, 24)
        .map(([id, n]) => {
          const b = BRAND.get(id);
          return `<span>${b.logo}${b.name} · ${n}</span>`;
        })
        .join("");
    }
  }

  function listHotels() {
    const f = game.filters;
    let list = game.state.hotels.filter((r) => {
      if (f.brand && r.brandId !== f.brand) return false;
      if (f.segment) {
        const b = BRAND.get(r.brandId);
        if (!b || b.segment !== f.segment) return false;
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
      const list = listHotels();
      const open = game.state.hotels.filter((r) => r.status === "abierto").length;
      const countries = new Set(game.state.hotels.map((r) => r.country)).size;
      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><b>${U.formatInt(game.state.hotels.length)}</b><span>Hoteles</span></div>
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
        const chips = [
          r.owned ? `<span class="chip ok">Propiedad</span>` : "",
          r.metro ? `<span class="chip sky">Metro/estación</span>` : "",
          r.pedestrian ? `<span class="chip">Peatonal</span>` : "",
          (r.amenities || []).length ? `<span class="chip warn">${r.amenities.length} amenities</span>` : "",
        ].join("");
        const photo = U.safePhoto(r.photo);
        const snip = (r.description || "").trim();
        btn.innerHTML = `
          ${photo ? `<img class="logo" src="${photo}" alt="">` : `<div class="logo">${brand.logo}</div>`}
          <div class="meta"><b>${U.escapeHtml(r.name)}</b><small>${statusTxt} · ${U.escapeHtml(r.city || r.countryName)}</small>${snip ? `<span class="snip">${U.escapeHtml(snip)}</span>` : ""}<div class="chips">${chips}</div></div>
          <div class="right"><div class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</div><div class="stars">${"★".repeat(Math.round(r.stars))}</div></div>`;
        btn.onclick = () => game.openHotel(r.id);
        frag.append(btn);
      }
      if (list.length > 80) {
        const more = document.createElement("p");
        more.className = "muted";
        more.textContent = `Mostrando 80 de ${U.formatInt(list.length)}. Usa la tabla o los filtros.`;
        frag.append(more);
      }
      root.append(frag);
    } else if (tab === "matriz") {
      renderMatriz(body);
    } else if (tab === "ranking") {
      const byC = {};
      for (const r of game.state.hotels) {
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
          <div class="kpi"><b>${U.formatMoney(game.state.hotels.reduce((a, r) => a + r.finance.revTotal, 0))}</b><span>Facturación</span></div>
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
        <p class="muted">No se pinta en el mapa. La barra es tu cuota frente a otras cadenas hoteleras.</p>
        ${rows
          .map((r) => {
            const pct = Math.round(r.share * 100);
            return `<div class="rank-row"><div style="flex:1"><b>${WORLD.country(r.cc).name}</b>
              <div class="comp-bar"><i style="width:${pct}%"></i></div>
              <div class="muted">${r.n} hoteles · tuya ${pct}% · ajena ${100 - pct}%</div></div><div>${U.formatMoney(r.rev)}</div></div>`;
          })
          .join("") || "<p class='muted'>Todavía no hay ranking.</p>"}`;
    } else {
      renderPrensa(body);
    }
  }

  function renderMatriz(body) {
    SABOR.ensureBooks(game.state);
    SIM.ensureLoans(game.state);
    const books = game.state.books;
    let brandId = game._bookBrand || BRAND.list[0].id;
    const paint = () => {
      game._bookBrand = brandId;
      const brand = BRAND.get(brandId);
      const bk = books[brandId] || SABOR.defaultBook(brand);
      const loans = game.state.loans || [];
      const debt = SIM.debtTotal(game.state);
      const room = SIM.creditLimit(game.state);
      body.innerHTML = `
        <h3>Caja y banco</h3>
        <div class="kpis">
          <div class="kpi teal"><b>${U.formatMoney(game.state.cash, 0)}</b><span>Caja</span></div>
          <div class="kpi coral"><b>${U.formatMoney(debt, 0)}</b><span>Deuda viva</span></div>
          <div class="kpi gold"><b>${U.formatMoney(room, 0)}</b><span>Crédito disponible</span></div>
        </div>
        <div class="book-card">
          <p class="muted">Pide un préstamo a la banca de Horizon Hotels. La cuota se cobra cada mes de juego. Interés más alto si la caja está en descubierto.</p>
          <label><span>Importe (€)</span><input type="number" id="ln-amt" min="50000" step="50000" value="${Math.min(1000000, Math.max(50000, Math.round(room / 4 / 50000) * 50000 || 50000))}"/></label>
          <label><span>Plazo</span>
            <select id="ln-term">
              <option value="12">12 meses</option>
              <option value="24" selected>24 meses</option>
              <option value="36">36 meses</option>
              <option value="48">48 meses</option>
            </select>
          </label>
          <button type="button" class="btn primary" id="ln-go">Pedir préstamo</button>
          ${
            loans.length
              ? `<h4>Préstamos abiertos</h4>` +
                loans
                  .map(
                    (l) => `<div class="rank-row"><div>Restan ${U.formatMoney(l.remaining)} · cuota ${U.formatMoney(l.monthly)}/mes · ${(l.rate * 100).toFixed(1)}% · ${l.leftMonths || l.months} m</div>
                    <button type="button" class="btn sm ghost" data-pay="${l.id}">Saldar</button></div>`
                  )
                  .join("")
              : `<p class="muted">Sin préstamos abiertos.</p>`
          }
        </div>
        <div class="book-card">
          <p><b>Trucos de dinero</b> <span class="muted">solo caja. No afectan a la simulación de hoteles.</span></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn ghost sm" data-cheat="100000">+100.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="1000000">+1.000.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="10000000">+10.000.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="50000000">+50.000.000 €</button>
            <button type="button" class="btn danger sm" data-cheat="-1">Vaciar caja</button>
          </div>
        </div>
        <h3>Libro de marca</h3>
        <p class="muted">Rango de tarifa (ADR) que la dirección de cada hotel de esta filial debe respetar.</p>
        <label class="muted">Filial
          <select id="bk-brand">${BRAND.list.map((b) => `<option value="${b.id}" ${b.id === brandId ? "selected" : ""}>${b.name}</option>`).join("")}</select>
        </label>
        <div class="book-card">
          <div style="display:flex;gap:10px;align-items:center">${brand.logo}<div><b>${brand.name}</b><div class="muted">${BRAND.SEGMENTS[brand.segment].name} · ${BRAND.TIERS[brand.tier].name} · ${brand.stars}★</div></div></div>
          <label><span>ADR mín. ×${bk.minMul.toFixed(2)}</span><input type="range" id="bk-min" min="50" max="100" value="${Math.round(bk.minMul * 100)}"/></label>
          <label><span>ADR máx. ×${bk.maxMul.toFixed(2)}</span><input type="range" id="bk-max" min="100" max="180" value="${Math.round(bk.maxMul * 100)}"/></label>
          <button type="button" class="btn primary" id="bk-apply">Aplicar a las direcciones de esta marca</button>
        </div>`;
      U.$("#bk-brand").onchange = () => {
        brandId = U.$("#bk-brand").value;
        paint();
      };
      const save = () => {
        books[brandId] = {
          minMul: +U.$("#bk-min").value / 100,
          maxMul: Math.max(+U.$("#bk-min").value / 100 + 0.05, +U.$("#bk-max").value / 100),
        };
        game.dirty();
      };
      ["bk-min", "bk-max"].forEach((id) => {
        U.$("#" + id).onchange = () => {
          save();
          paint();
        };
      });
      U.$("#bk-apply").onclick = () => {
        save();
        const b = BRAND.get(brandId);
        game.state.hotels
          .filter((r) => r.brandId === brandId && r.managerAI !== false)
          .forEach((r) => SABOR.runManager(game.state, r, b, game.state.gameTime));
        toast("Las direcciones de " + b.name + " actualizan el hotel al libro de marca.");
        game.dirty();
      };
      U.$("#ln-go").onclick = () => {
        const res = SIM.takeLoan(game.state, +U.$("#ln-amt").value, +U.$("#ln-term").value);
        if (!res.ok) return toast(res.err, true);
        toast("El banco ingresa " + U.formatMoney(res.loan.principal) + ". Cuota " + U.formatMoney(res.loan.monthly) + "/mes.");
        try {
          SABOR.sfx.cash();
        } catch (_) {}
        game.dirty(true);
        paint();
        renderHud();
      };
      body.querySelectorAll("[data-pay]").forEach((btn) => {
        btn.onclick = () => {
          const res = SIM.payoffLoan(game.state, btn.dataset.pay);
          if (!res.ok) return toast(res.err, true);
          toast("Préstamo saldado.");
          game.dirty(true);
          paint();
          renderHud();
        };
      });
      body.querySelectorAll("[data-cheat]").forEach((btn) => {
        btn.onclick = () => {
          let amt = +btn.dataset.cheat;
          if (amt === -1) amt = -game.state.cash;
          SIM.cheatCash(game.state, amt);
          toast(amt >= 0 ? "Truco: +" + U.formatMoney(amt) : "Caja a cero.");
          try {
            if (amt > 0) SABOR.sfx.cash();
          } catch (_) {}
          game.dirty(true);
          paint();
          renderHud();
        };
      });
    };
    paint();
  }

  function renderPrensa(body) {
    const news = game.state.news || [];
    body.innerHTML = `
      <article class="paper">
        <div class="kicker">${SABOR.HOLDING}</div>
        <h3>El teletipo del grupo</h3>
        <p class="lede">Aperturas, inspecciones, congresos y movimientos de mercado de toda la red hotelera.</p>
      </article>
      <h3>Teletipo</h3>
      ${
        news
          .slice(0, 40)
          .map((n) => `<div class="news-item"><time>${U.formatDateTime(n.t)}</time>${n.text}</div>`)
          .join("") || "<p class='muted'>Sin noticias.</p>"
      }`;
  }

  async function renderSplash() {
    const slots = await STORE.listSlots();
    const box = U.$("#slot-list");
    box.innerHTML = "";
    if (U.$("#continue-game")) U.$("#continue-game").style.display = "block";
    slots.slice(0, 6).forEach((s) => {
      const b = document.createElement("button");
      b.className = "slot";
      b.innerHTML = `<div><b>${s.name}</b><div style="opacity:.75;font-size:12px">${U.formatDate(s.gameTime)} · ${s.n} hoteles · ${U.formatMoney(s.cash)}</div></div><span>Abrir</span>`;
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
    let htypeId = SABOR.suggestFormat(BRAND.get(brandId), place);
    let htypeTouched = false;
    let draftPhoto = "";
    let draftDesc = "";
    const BUILD_META = {
      photoBtn: "b-photo-btn",
      photoFile: "b-photo-file",
      photoImg: "b-photo-img",
      photoPh: "b-photo-ph",
      photoClear: "b-photo-clear",
      desc: "b-desc",
      descN: "b-desc-n",
    };
    const flags = SABOR.streetFlags(place);
    place.metro = place.metro || flags.metro;
    place.pedestrian = place.pedestrian || flags.pedestrian;
    const modal = U.$("#modal");
    function quote() {
      return SIM.buildQuote(BRAND.get(brandId), htypeId, place, game.state.gameTime);
    }
    function paint() {
      const prevDesc = U.$("#b-desc");
      if (prevDesc) draftDesc = prevDesc.value.slice(0, DESC_MAX);
      const q = quote();
      const brand = BRAND.get(brandId);
      const pl = WORLD.priceLevel(place.countryCode, year);
      const sett = GEO.formatSettlement(place);
      const settChipClass =
        place.settlementKind === "city" ? "sky" : place.settlementKind === "town" ? "ok" : place.settlementKind === "village" || place.settlementKind === "hamlet" ? "pueblo" : "";
      modal.innerHTML = `<div class="card" id="build-card">
        <h2>Nuevo hotel</h2>
        <div class="place-box">
          <b class="settlement-title">${U.escapeHtml(sett.title)}</b>
          <div class="settlement-sub">${U.escapeHtml(sett.subtitle || ctry.name)}</div>
          <div class="place-flags">
            <span class="chip ${settChipClass}">${U.escapeHtml(sett.label)}</span>
            <span class="chip">${SABOR.POI_L[place.poi] || "Urbano"}</span>
            ${place.metro ? `<span class="chip sky">Metro / estación</span>` : ""}
            ${place.pedestrian ? `<span class="chip ok">Peatonal</span>` : ""}
          </div>
          <div class="muted">${U.escapeHtml(place.street || "")}${place.postcode ? " · CP " + U.escapeHtml(place.postcode) : ""}</div>
          ${
            place.metroName
              ? `<div class="metro-hint">Ciudad de referencia (no es este núcleo): ${U.escapeHtml(place.metroName)}${
                  place.metroKm != null ? " a " + Math.round(place.metroKm) + " km" : ""
                }</div>`
              : ""
          }
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
            <div>ADR estimado <b>${U.formatMoney(SIM.fairADR(brand, pl), 0)}/noche</b></div>
          </div>
        </div>
        <p class="muted">Filial · ${BRAND.SEGMENTS[brand.segment].name} · ${BRAND.TIERS[brand.tier].name} · ${brand.stars}★</p>
        <div class="brand-grid" id="bg"></div>
        <p class="muted">Formato de hotel</p>
        <div class="format-grid" id="sz"></div>
        <div class="place-box">
          <div>Permisos ${U.formatMoney(q.permits)} · Obra ${U.formatMoney(q.works + q.fitout)}</div>
          <div><b>Inversión ${U.formatMoney(q.total)}</b> · Alquiler ${U.formatMoney(q.rentMonthly)}/mes</div>
          ${q.total > game.state.cash ? `<p class="loss">Caja ${U.formatMoney(game.state.cash)}: no alcanza. En Matriz puedes pedir un préstamo o usar un truco.</p>` : ""}
          <div class="muted">Permisos ~${Math.round(q.permitH / 24)} d · Obra ~${Math.round(q.buildH / 24)} d</div>
        </div>
        <h3>Foto y descripción</h3>
        <p class="muted">Opcional. También puedes añadirlas después, en la ficha del hotel.</p>
        ${venueMetaHtml(BUILD_META)}
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
          if (!htypeTouched) htypeId = SABOR.suggestFormat(BRAND.get(brandId), place);
          paint();
        };
        bg.append(t);
      });
      const sz = U.$("#sz");
      const recommended = SABOR.suggestFormat(brand, place);
      SIM.HTYPES.forEach((s) => {
        const isRec = s.id === recommended;
        const t = document.createElement("button");
        t.type = "button";
        t.className = "size-tile" + (s.id === htypeId ? " on" : "") + (isRec ? " rec" : "");
        t.innerHTML = `<b>${s.name}${isRec ? '<span class="rec-badge">Recomendado</span>' : ""}</b><small>${s.rooms} hab. · ${U.formatInt(s.rooms * s.m2r)} m² · ${s.star.join("–")}★</small>`;
        t.onclick = () => {
          htypeId = s.id;
          htypeTouched = true;
          paint();
        };
        sz.append(t);
      });
      U.$("#cancel-b").onclick = closeModal;
      bindVenueMeta(
        () => draftPhoto,
        (v) => {
          draftPhoto = v;
        },
        () => draftDesc,
        (v) => {
          draftDesc = v;
        },
        BUILD_META
      );
      U.$("#ok-b").onclick = () => {
        const ta = U.$("#b-desc");
        if (ta) draftDesc = ta.value.slice(0, DESC_MAX);
        const ok = game.confirmBuild(brandId, htypeId, place, quote(), {
          photo: draftPhoto,
          description: draftDesc,
        });
        if (ok) closeModal();
      };
    }
    paint();
    modal.classList.add("show");
  }

  function showHotel(id) {
    const r = game.state.hotels.find((x) => x.id === id);
    if (!r) return;
    game.openId = id;
    const brand = BRAND.get(r.brandId);
    const sheet = U.$("#sheet");
    let tab = "resumen";
    function paint() {
      const q = SIM.qualityOf(r, brand);
      const st = SIM.staffStats(r.staff);
      const miss = SIM.understaffed(brand, r.htype, r.staff);
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
            ${["resumen", "amenities", "personal", "finanzas", "local"].map((t) => `<button data-t="${t}" class="${tab === t ? "on" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
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
      const sz = SIM.sizeOf(r.htype);
      if (tab === "resumen") {
        body.innerHTML = `
          <div class="kpis">
            <div class="kpi"><b>${q.toFixed(0)}</b><span>Calidad</span></div>
            <div class="kpi"><b>${r.cleanliness.toFixed(0)}</b><span>Limpieza</span></div>
            <div class="kpi"><b>${U.formatMoney(r.adr || 0, 0)}</b><span>ADR</span></div>
            <div class="kpi"><b class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</b><span>Resultado</span></div>
          </div>
          <p>${brand.tagline}</p>
          <p class="muted">Filial de ${SABOR.HOLDING} · ${brand.name} · ${BRAND.SEGMENTS[brand.segment].name} · ${sz.name} (${sz.rooms} habitaciones)</p>
          <p class="muted">${r.settlementKind === "village" || r.settlementKind === "hamlet" ? "Pueblo de " : r.settlementKind === "city" ? "Ciudad de " : ""}${r.city}${r.municipality && r.municipality !== r.city ? " · " + r.municipality : ""}, ${r.countryName} · ${SABOR.POI_L[r.poi] || r.poi}</p>
          <div class="place-flags">
            ${r.owned ? `<span class="chip ok">Bajo en propiedad</span>` : `<span class="chip">Alquiler</span>`}
            ${r.metro ? `<span class="chip sky">Metro/estación</span>` : ""}
            ${r.pedestrian ? `<span class="chip">Peatonal</span>` : ""}
          </div>
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META)}
          ${(() => {
            const mgrs = r.staff.filter((s) => s.role === "gerente");
            const sk = SIM.managerSkill(r);
            return mgrs.length
              ? `<p>Dirección: <b>${mgrs.map((s) => s.name).join(", ")}</b> · habilidad ${Math.round(sk)}/100. ${r.managerAI !== false ? "Lleva el hotel entero (tarifas, personal, mantenimiento, amenities) según esa habilidad." : "IA apagada: tú gestionas a mano."}</p>`
              : `<p class="loss">Este hotel no tiene dirección. Sin dirección el hotel no se gestiona solo.</p>`;
          })()}
          <label><input type="checkbox" id="mgr" ${r.managerAI !== false ? "checked" : ""}/> Dirección IA (gestiona todo el hotel según su habilidad)</label>
          <p class="muted">${r.managerNote || ""}</p>
          ${miss.length ? `<p class="loss">Falta personal: ${miss.join(", ")}. El hotel no atiende bien.</p>` : ""}
          <h3>Reseñas</h3>
          ${(r.reviews || []).map((rv) => `<div class="news-item">${rv.stars}★ · ${U.escapeHtml(rv.text)}</div>`).join("") || "<p class='muted'>Aún no hay reseñas.</p>"}
        `;
        bindHotelPhotoDesc(r);
        const mgr = U.$("#mgr");
        if (mgr)
          mgr.onchange = () => {
            r.managerAI = mgr.checked;
            if (r.managerAI) SABOR.runManager(game.state, r, brand, game.state.gameTime);
            game.dirty();
            paint();
          };
      } else if (tab === "amenities") {
        const lockOps = r.managerAI !== false;
        body.innerHTML = `<p class="muted">${lockOps ? "La dirección añade amenities (spa, restaurante, piscina…) según su habilidad y el segmento de la marca. Desactiva la IA en Resumen para gestionarlas a mano." : "Tú decides qué amenities instalar."}</p>
          <div id="amelist"></div>`;
        const box = U.$("#amelist");
        Object.entries(SABOR.AMENITIES).forEach(([key, def]) => {
          const on = (r.amenities || []).includes(key);
          const row = document.createElement("div");
          row.className = "staff-row";
          row.innerHTML = `<div><b>${def.name}</b></div><label><input type="checkbox" ${on ? "checked" : ""} ${lockOps ? "disabled" : ""}/> Activa</label>`;
          const ck = row.querySelector("input");
          ck.onchange = () => {
            r.amenities = r.amenities || [];
            if (ck.checked) {
              const cost = (def.cost || 1) * r.rentMonthly * 0.9;
              if (game.state.cash < cost) {
                ck.checked = false;
                return toast("No alcanza esta amenity.", true);
              }
              game.state.cash -= cost;
              r.amenities.push(key);
              toast(def.name + " instalada.");
            } else {
              r.amenities = r.amenities.filter((a) => a !== key);
            }
            game.dirty();
            paint();
          };
          box.append(row);
        });
      } else if (tab === "personal") {
        body.innerHTML = `<p class="muted">${r.managerAI !== false ? "La dirección cubre huecos, forma y ajusta plantilla según su habilidad. Puedes intervenir; en el próximo ciclo la IA vuelve a decidir." : "Salarios ligados al mínimo del país (inflado desde 2000). Entrenar cuesta y sube habilidad."}</p>
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
            const cost = 420 * WORLD.priceLevel(r.country, SIM.yearOf(game.state.gameTime));
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
            <div class="kpi"><b>${U.formatMoney(r.finance.taxTotal || 0)}</b><span>Sociedades acum.</span></div>
            <div class="kpi"><b>${U.formatMoney(dayP)}</b><span>Hoy (juego)</span></div>
          </div>
          <p>Alquiler mensual ${U.formatMoney(r.rentMonthly)} · masa salarial ~${U.formatMoney(st.wageDay)}/día</p>
          <p class="muted">El impuesto de sociedades del país se cobra sobre el beneficio operativo de este hotel. La inflación (y los brotes) suben alquiler, salarios y suministros.</p>
          <h3>Mensual</h3>
          ${months.map(([k, v]) => `<div class="rank-row"><div>${k}</div><div class="${v.rev - v.cost >= 0 ? "gain" : "loss"}">${U.formatMoney(v.rev - v.cost)}</div></div>`).join("") || "<p class='muted'>Sin meses aún.</p>"}`;
      } else {
        const val = SIM.sellValue(r, game.state.gameTime);
        body.innerHTML = `
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META)}
          <p>Formato ${sz.name} · ${sz.rooms} habitaciones · ${U.formatInt(sz.rooms * sz.m2r)} m² · ${SABOR.POI_L[r.poi] || r.poi}</p>
          <p>Limpieza</p>
          <div class="bar"><i style="width:${r.cleanliness}%"></i></div>
          <h3>El edificio</h3>
          <p>${r.owned ? `Propiedad · valor ${U.formatMoney(r.propertyValue || 0)} · comunidad ~${U.formatMoney(r.communityMonthly || r.rentMonthly * 0.08)}/mes` : `Alquiler ${U.formatMoney(r.rentMonthly)}/mes · comprar el edificio ${U.formatMoney(r.propertyValue || r.rentMonthly * 108)}`}</p>
          <div class="place-flags">
            ${r.metro ? `<span class="chip sky">Metro/estación cerca</span>` : `<span class="chip">Sin metro</span>`}
            ${r.pedestrian ? `<span class="chip ok">Calle peatonal</span>` : ""}
          </div>
          ${r.owned ? `<button type="button" class="btn ghost" id="sell-brick">Vender solo el edificio</button>` : `<button type="button" class="btn primary" id="buy-brick">Comprar el edificio</button>`}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn ghost" id="clean">Brigada de limpieza</button>
            <button class="btn warn" id="reno">Reformar</button>
            <button class="btn ghost" id="rebrand">Cambiar marca</button>
            <button class="btn ghost" id="toggle">${r.status === "cerrado" ? "Reabrir" : "Cerrar temporalmente"}</button>
            <button class="btn danger" id="sell">Vender negocio${r.owned ? " + edificio" : ""} (${U.formatMoney(val)})</button>
          </div>
          <div id="rebrand-box"></div>`;
        bindHotelPhotoDesc(r);
        const buyB = U.$("#buy-brick");
        if (buyB)
          buyB.onclick = () => {
            const price = r.propertyValue || r.rentMonthly * 108;
            if (game.state.cash < price) return toast("No alcanza el edificio.", true);
            game.state.cash -= price;
            r.owned = true;
            r.communityMonthly = r.rentMonthly * 0.08;
            toast("Has comprado el edificio. El alquiler pasa a comunidad.");
            game.dirty();
            paint();
          };
        const sellB = U.$("#sell-brick");
        if (sellB)
          sellB.onclick = () => {
            const price = r.propertyValue || 0;
            game.state.cash += price;
            r.owned = false;
            toast("Has vendido el edificio. Vuelves al alquiler.");
            game.dirty();
            paint();
          };
        U.$("#clean").onclick = () => {
          const c = 300 * WORLD.priceLevel(r.country, SIM.yearOf(game.state.gameTime));
          game.state.cash -= c;
          r.cleanliness = 100;
          toast("Hotel reluciente.");
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
          if (!confirm("¿Vender este hotel?")) return;
          game.state.cash += val;
          game.state.hotels = game.state.hotels.filter((x) => x.id !== r.id);
          toast("Hotel vendido.");
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
    let list = listHotels();
    const modal = U.$("#modal");
    const rowH = 32;
    modal.innerHTML = `<div class="card" style="width:min(980px,96%)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
        <h2>Tabla de hoteles</h2>
        <input id="qtab" placeholder="Buscar nombre, ciudad, marca" style="flex:1;min-width:160px;padding:8px;border-radius:10px;border:1px solid var(--line)"/>
        <button class="btn ghost" id="csv">CSV</button>
        <button class="btn ghost" id="ct">Cerrar</button>
      </div>
      <p class="muted" id="tabn">${U.formatInt(list.length)} en vista</p>
      <div class="vt-wrap" id="vt">
        <div id="vt-spacer" style="position:relative">
          <table class="data" style="position:sticky;top:0;background:#fffaf2;z-index:1"><thead><tr><th>Hotel</th><th>Marca</th><th>Ciudad</th><th>País</th><th>Estado</th><th>★</th><th>Resultado</th></tr></thead></table>
          <div id="vt-rows"></div>
        </div>
      </div>
    </div>`;
    modal.classList.add("show");
    const apply = () => {
      const q = (U.$("#qtab").value || "").toLowerCase();
      list = listHotels().filter((r) => {
        if (!q) return true;
        const b = BRAND.get(r.brandId);
        return (r.name + r.city + r.countryName + (r.description || "") + (b && b.name)).toLowerCase().includes(q);
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
          game.openHotel(tr.dataset.id);
        };
      });
    };
    U.$("#vt").addEventListener("scroll", paintRows);
    U.$("#qtab").addEventListener("input", apply);
    U.$("#csv").onclick = () => {
      const lines = [["nombre", "marca", "ciudad", "pais", "estado", "estrellas", "resultado", "descripcion"].join(";")];
      list.forEach((r) => {
        const b = BRAND.get(r.brandId);
        const p = r.finance.revTotal - r.finance.costTotal;
        const desc = String(r.description || "").replace(/[\r\n;]+/g, " ").trim();
        lines.push([r.name, b.name, r.city, r.countryName, r.status, r.stars, p.toFixed(2), desc].join(";"));
      });
      U.download("horizon-hotels.csv", lines.join("\n"));
    };
    U.$("#ct").onclick = closeModal;
    paintRows();
  }

  async function showSaves(fromGame) {
    const slots = await STORE.listSlots();
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card">
      <h2>8 ranuras — ${SABOR.HOLDING}</h2>
      <p class="muted">Miniatura del mapa de hoteles, fecha de juego y última vez real.</p>
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
          <div><b>${s.name}</b><div class="muted">Juego ${U.formatDate(s.gameTime)} · ${s.n} hoteles · ${U.formatMoney(s.cash)}</div>
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
    maybeShowBackupPrompt,
    showBuild,
    showHotel,
    showTable,
    showSaves,
    closeModal,
    closeSheet,
    refreshOpen() {
      if (game.openId) showHotel(game.openId);
    },
  };
})(window);
