/* Horizon Group — interfaz. Un solo mapa y una sola caja para Horizon
   Restaurant Group (restaurantes, módulos BRAND/SABOR/SIM) y Horizon Hotels
   (hoteles, módulos HBRAND/HSABOR/HSIM). Este fichero decide, para cada
   local, a qué motor pertenece (r.kind === "hotel" o "restaurant") y llama
   al módulo correspondiente; el banco (caja, préstamos, trucos) es único y
   siempre pasa por SIM, que ya cuenta restaurantes + hoteles juntos. */
(function (global) {
  let game;
  let openKind = null; /* "restaurant" | "hotel" del panel/ficha abierto actualmente */

  const GROUP_NAME = "Horizon Group";
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

  function venueMetaHtml(ids, noun) {
    const n = noun || "local";
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
          <img id="${pImg}" alt="Foto del ${n}" hidden />
          <div class="venue-photo-ph" id="${pPh}">Sin foto de este ${n}</div>
        </div>
        <div class="venue-photo-actions">
          <input type="file" id="${pFile}" accept="image/jpeg,image/png,image/webp,image/gif" hidden />
          <button type="button" class="btn primary" id="${pBtn}">Cambiar imagen</button>
          <button type="button" class="btn ghost" id="${pClear}">Quitar foto</button>
          <p class="muted">Foto de este ${n} (no el logo de la marca). Se comprime y se guarda en la partida.</p>
        </div>
      </div>
      <label class="venue-desc"><span>Descripción del ${n}</span>
        <textarea id="${dTa}" maxlength="${DESC_MAX}" rows="4" placeholder="Ambiente, historia, notas de este ${n}…"></textarea>
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

  /** Foto + descripción de un local YA construido (restaurante u hotel): ambos
   * guardan photo/description igual en el objeto del venue, así que esta única
   * función sirve para los dos tipos. */
  function bindVenuePhotoDesc(r) {
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
        clearTimeout(bindVenuePhotoDesc._t);
        bindVenuePhotoDesc._t = setTimeout(() => {
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

  const BACKUP_PROMPT_KEY = "horizon-group-backup-prompt-seen";

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
    const rGroup = document.createElement("optgroup");
    rGroup.label = "Horizon Restaurant Group";
    BRAND.list.forEach((b) => rGroup.append(new Option(b.name, b.id)));
    fb.append(rGroup);
    const hGroup = document.createElement("optgroup");
    hGroup.label = "Horizon Hotels";
    HBRAND.list.forEach((b) => hGroup.append(new Option(b.name, b.id)));
    fb.append(hGroup);

    const fc = U.$("#f-cuisine");
    const cGroup = document.createElement("optgroup");
    cGroup.label = "Cocinas (restaurantes)";
    BRAND.cuisines.forEach((c) => cGroup.append(new Option(c, "c:" + c)));
    fc.append(cGroup);
    const sGroup = document.createElement("optgroup");
    sGroup.label = "Segmentos (hoteles)";
    HBRAND.segments.forEach((s) => sGroup.append(new Option(s.name, "s:" + s.id)));
    fc.append(sGroup);

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
    ["f-kind", "f-brand", "f-cuisine", "f-country", "f-status", "f-profit", "f-sort"].forEach((id) => {
      U.$("#" + id).addEventListener("change", () => {
        game.filters.kind = U.$("#f-kind").value;
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
    const yr = U.$("#btn-year");
    if (yr)
      yr.onclick = () => {
        const list = (game.state && game.state.yearbooks) || [];
        if (!list.length) {
          toast("Aún no hay anuario. Salta hasta el 31 de diciembre.");
          return;
        }
        showYearbook(list[list.length - 1]);
      };
    const sfx = U.$("#btn-sfx");
    if (sfx)
      sfx.onclick = () => {
        const nowMuted = !SABOR.muted();
        SABOR.setMuted(nowMuted);
        try {
          HSABOR.setMuted(nowMuted);
        } catch (_) {}
        sfx.textContent = nowMuted ? "Sonido" : "Sonido on";
        sfx.setAttribute("aria-pressed", nowMuted ? "false" : "true");
        if (!nowMuted) SABOR.sfx.cash();
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
    const buildBtn = U.$("#btn-build-new");
    if (buildBtn)
      buildBtn.onclick = () => toast("Clic en el mapa (tierra urbana) para elegir el sitio del local o hotel nuevo.");
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
        UI.toast("Clic en el mapa para un local o hotel nuevo. Elige el tipo arriba del modal.");
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        U.$("#search").focus();
      }
      if (e.key === "t" || e.key === "T") showTable();
      if (["1", "2", "3", "4", "5", "6"].includes(e.key) && U.$("#sz")) {
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

  function combinedAlerts(s) {
    const shared = ["cash", "low", "debt", "year"];
    const seen = new Set();
    const out = [];
    for (const a of SABOR.alerts(s).concat(HSABOR.alerts(s))) {
      if (shared.includes(a.k)) {
        if (seen.has(a.k)) continue;
        seen.add(a.k);
      }
      out.push(a);
    }
    return out.slice(0, 8);
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
      const als = combinedAlerts(s);
      alertsBox.innerHTML = als.map((a) => `<div class="al ${a.bad ? "bad" : ""}">${a.t}</div>`).join("");
    }
    const leg = U.$("#legend");
    if (leg) {
      const used = new Map();
      for (const r of s.restaurants) used.set(r.brandId, (used.get(r.brandId) || 0) + 1);
      for (const r of s.hotels) used.set(r.brandId, (used.get(r.brandId) || 0) + 1);
      leg.innerHTML = [...used.entries()]
        .slice(0, 24)
        .map(([id, n]) => {
          const b = BRAND.get(id) || HBRAND.get(id);
          return b ? `<span>${b.logo}${b.name} · ${n}</span>` : "";
        })
        .join("");
    }
  }

  function brandOf(v) {
    return v.kind === "hotel" ? HBRAND.get(v.brandId) : BRAND.get(v.brandId);
  }

  function allVenues() {
    const s = game.state;
    if (!s) return [];
    return (s.restaurants || []).concat(s.hotels || []);
  }

  function listVenues() {
    const f = game.filters;
    let list = allVenues().filter((r) => {
      if (r.hallParentId) return false;
      if (f.kind && r.kind !== f.kind) return false;
      if (f.brand && r.brandId !== f.brand) return false;
      if (f.cuisine) {
        if (f.cuisine.indexOf("c:") === 0) {
          if (r.kind === "hotel") return false;
          const b = BRAND.get(r.brandId);
          if (!b || !b.cuisines.includes(f.cuisine.slice(2))) return false;
        } else if (f.cuisine.indexOf("s:") === 0) {
          if (r.kind !== "hotel") return false;
          const b = HBRAND.get(r.brandId);
          if (!b || b.segment !== f.cuisine.slice(2)) return false;
        }
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

  function openVenue(r) {
    if (r.kind === "hotel") game.openHotel(r.id);
    else game.openRestaurant(r.id);
  }

  function renderPanel() {
    if (!game.state) return;
    const body = U.$("#panel-body");
    const tab = game.uiTab || "locales";
    if (tab === "locales") {
      const list = listVenues();
      const av = allVenues();
      const open = av.filter((r) => r.status === "abierto").length;
      const countries = new Set(av.map((r) => r.country)).size;
      const nR = (game.state.restaurants || []).length;
      const nH = (game.state.hotels || []).length;
      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><b>${U.formatInt(av.length)}</b><span>Locales</span></div>
          <div class="kpi"><b>${U.formatInt(nR)}</b><span>Restaurantes</span></div>
          <div class="kpi"><b>${U.formatInt(nH)}</b><span>Hoteles</span></div>
          <div class="kpi"><b>${countries}</b><span>Países</span></div>
        </div>
        <div id="list-root"></div>`;
      const root = U.$("#list-root");
      const slice = list.slice(0, 80);
      if (!slice.length) {
        root.innerHTML = `<p class="muted">Haz clic en el mapa (tierra urbana, no parques ni océano) para construir un restaurante o un hotel. Los datos del lugar salen de OpenStreetMap.</p>`;
        return;
      }
      const frag = document.createDocumentFragment();
      for (const r of slice) {
        const isHotel = r.kind === "hotel";
        const brand = brandOf(r);
        if (!brand) continue;
        const profit = r.finance.revTotal - r.finance.costTotal;
        const btn = document.createElement("button");
        btn.className = "list-item";
        const leftH = r.statusUntil && (r.status === "permisos" || r.status === "obras") ? Math.max(0, (r.statusUntil - game.state.gameTime) / 3600000) : 0;
        const statusTxt = leftH ? `${STATUS_L[r.status]} · ${leftH >= 24 ? (leftH / 24).toFixed(1) + " d" : Math.ceil(leftH) + " h"}` : STATUS_L[r.status];
        const chips = isHotel
          ? [
              `<span class="chip lux">Hotel</span>`,
              r.owned ? `<span class="chip ok">Propiedad</span>` : "",
              r.metro ? `<span class="chip sky">Metro</span>` : "",
              r.pedestrian ? `<span class="chip">Peatonal</span>` : "",
              (r.amenities || []).length ? `<span class="chip warn">${r.amenities.length} amenities</span>` : "",
            ].join("")
          : [
              r.size === "ghost" ? `<span class="chip violet">Fantasma</span>` : "",
              r.size === "food_hall" ? `<span class="chip warn">Food hall</span>` : "",
              r.size === "puesto" || r.hallParentId ? `<span class="chip">Puesto</span>` : "",
              r.owned ? `<span class="chip ok">Propiedad</span>` : "",
              r.metro ? `<span class="chip sky">Metro</span>` : "",
              r.pedestrian ? `<span class="chip">Peatonal</span>` : "",
            ].join("");
        const photo = U.safePhoto(r.photo);
        const snip = (r.description || "").trim();
        btn.innerHTML = `
          ${photo ? `<img class="logo" src="${photo}" alt="">` : `<div class="logo">${brand.logo}</div>`}
          <div class="meta"><b>${U.escapeHtml(r.name)}</b><small>${statusTxt} · ${U.escapeHtml(r.city || r.countryName)}</small>${snip ? `<span class="snip">${U.escapeHtml(snip)}</span>` : ""}<div class="chips">${chips}</div></div>
          <div class="right"><div class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</div><div class="stars">${"★".repeat(Math.round(r.stars))}</div></div>`;
        btn.onclick = () => openVenue(r);
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
      const av = allVenues();
      const byC = {};
      for (const r of av) {
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
          <div class="kpi"><b>${U.formatMoney(av.reduce((a, r) => a + r.finance.revTotal, 0))}</b><span>Facturación</span></div>
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
        <p class="muted">No se pinta en el mapa. La barra es tu cuota frente a otras cadenas (restaurantes y hoteles a la vez).</p>
        ${rows
          .map((r) => {
            const pct = Math.round(r.share * 100);
            return `<div class="rank-row"><div style="flex:1"><b>${WORLD.country(r.cc).name}</b>
              <div class="comp-bar"><i style="width:${pct}%"></i></div>
              <div class="muted">${r.n} locales · tuya ${pct}% · ajena ${100 - pct}%</div></div><div>${U.formatMoney(r.rev)}</div></div>`;
          })
          .join("") || "<p class='muted'>Todavía no hay ranking.</p>"}`;
    } else {
      renderPrensa(body);
    }
  }

  function renderMatriz(body) {
    SABOR.ensureBooks(game.state);
    try {
      HSABOR.ensureBooks(game.state);
    } catch (_) {}
    SIM.ensureLoans(game.state);
    const books = game.state.books;
    let bookKind = game._bookKind || "restaurant";
    let brandId = game._bookBrand || null;
    const paint = () => {
      const BR = bookKind === "hotel" ? HBRAND : BRAND;
      const SB = bookKind === "hotel" ? HSABOR : SABOR;
      let brand = BR.get(brandId) || BR.list[0];
      brandId = brand.id;
      game._bookKind = bookKind;
      game._bookBrand = brandId;
      const bk = books[brandId] || SB.defaultBook(brand);
      const loans = game.state.loans || [];
      const debt = SIM.debtTotal(game.state);
      const room = SIM.creditLimit(game.state);
      body.innerHTML = `
        <h3>Caja y banco</h3>
        <p class="muted">Una sola caja para Horizon Restaurant Group y Horizon Hotels: la banca de ${GROUP_NAME} presta según el tamaño de todo el grupo.</p>
        <div class="kpis">
          <div class="kpi teal"><b>${U.formatMoney(game.state.cash, 0)}</b><span>Caja</span></div>
          <div class="kpi coral"><b>${U.formatMoney(debt, 0)}</b><span>Deuda viva</span></div>
          <div class="kpi gold"><b>${U.formatMoney(room, 0)}</b><span>Crédito disponible</span></div>
        </div>
        <div class="book-card">
          <p class="muted">Pide un préstamo a la banca de ${GROUP_NAME}. La cuota se cobra cada mes de juego. Interés más alto si la caja está en descubierto.</p>
          <label><span>Importe (€)</span><input type="number" id="ln-amt" min="25000" step="25000" value="${Math.min(500000, Math.max(25000, Math.round(room / 4 / 25000) * 25000 || 25000))}"/></label>
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
          <p><b>Trucos de dinero</b> <span class="muted">solo caja. No afectan a la simulación de locales ni hoteles.</span></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn ghost sm" data-cheat="100000">+100.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="1000000">+1.000.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="10000000">+10.000.000 €</button>
            <button type="button" class="btn ghost sm" data-cheat="50000000">+50.000.000 €</button>
            <button type="button" class="btn danger sm" data-cheat="-1">Vaciar caja</button>
          </div>
        </div>
        <h3>Libro de marca</h3>
        <div class="seg" id="bk-kind" role="group" aria-label="Tipo de negocio">
          <button type="button" data-k="restaurant" class="${bookKind === "restaurant" ? "active" : ""}">Restaurantes</button>
          <button type="button" data-k="hotel" class="${bookKind === "hotel" ? "active" : ""}">Hoteles</button>
        </div>
        <p class="muted">${bookKind === "hotel" ? "Rango de tarifa (ADR) que la dirección de cada hotel de esta filial debe respetar." : "Normas que el gerente de cada local de esa filial debe cumplir (firma, alcohol, rango de precios, género)."}</p>
        <label class="muted">Filial
          <select id="bk-brand">${BR.list.map((b) => `<option value="${b.id}" ${b.id === brandId ? "selected" : ""}>${b.name}</option>`).join("")}</select>
        </label>
        <div class="book-card">
          ${
            bookKind === "hotel"
              ? `<div style="display:flex;gap:10px;align-items:center">${brand.logo}<div><b>${brand.name}</b><div class="muted">${HBRAND.SEGMENTS[brand.segment].name} · ${HBRAND.TIERS[brand.tier].name} · ${brand.stars}★</div></div></div>
                 <label><span>ADR mín. ×${bk.minMul.toFixed(2)}</span><input type="range" id="bk-min" min="50" max="100" value="${Math.round(bk.minMul * 100)}"/></label>
                 <label><span>ADR máx. ×${bk.maxMul.toFixed(2)}</span><input type="range" id="bk-max" min="100" max="180" value="${Math.round(bk.maxMul * 100)}"/></label>`
              : `<div style="display:flex;gap:10px;align-items:center">${brand.logo}<div><b>${brand.name}</b><div class="muted">${brand.dishes.length} platos · ${brand.cuisines.join(", ")}</div></div></div>
                 <label><span>Plato firma obligatorio</span><input type="checkbox" id="bk-sig" ${bk.enforceSig ? "checked" : ""}/></label>
                 <label><span>Permitir alcohol</span><input type="checkbox" id="bk-alc" ${bk.allowAlc ? "checked" : ""}/></label>
                 <label><span>Precio mín. ×${bk.minMul.toFixed(2)}</span><input type="range" id="bk-min" min="50" max="100" value="${Math.round(bk.minMul * 100)}"/></label>
                 <label><span>Precio máx. ×${bk.maxMul.toFixed(2)}</span><input type="range" id="bk-max" min="100" max="180" value="${Math.round(bk.maxMul * 100)}"/></label>
                 <label><span>Género mínimo</span>
                   <select id="bk-inq">${[0, 1, 2].map((n) => `<option value="${n}" ${bk.minIngQ === n ? "selected" : ""}>${["Económico", "Estándar", "Premium"][n]}</option>`).join("")}</select>
                 </label>`
          }
          <button type="button" class="btn primary" id="bk-apply">Aplicar a ${bookKind === "hotel" ? "las direcciones" : "los gerentes"} de esta marca</button>
        </div>`;
      U.$("#bk-kind").onclick = (ev) => {
        const b = ev.target.closest("button[data-k]");
        if (!b) return;
        bookKind = b.dataset.k;
        brandId = null;
        paint();
      };
      U.$("#bk-brand").onchange = () => {
        brandId = U.$("#bk-brand").value;
        paint();
      };
      const save = () => {
        if (bookKind === "hotel") {
          books[brandId] = {
            minMul: +U.$("#bk-min").value / 100,
            maxMul: Math.max(+U.$("#bk-min").value / 100 + 0.05, +U.$("#bk-max").value / 100),
          };
        } else {
          books[brandId] = {
            enforceSig: U.$("#bk-sig").checked,
            allowAlc: U.$("#bk-alc").checked,
            minMul: +U.$("#bk-min").value / 100,
            maxMul: Math.max(+U.$("#bk-min").value / 100 + 0.05, +U.$("#bk-max").value / 100),
            minIngQ: +U.$("#bk-inq").value,
            maxIngQ: 2,
          };
        }
        game.dirty();
      };
      (bookKind === "hotel" ? ["bk-min", "bk-max"] : ["bk-sig", "bk-alc", "bk-min", "bk-max", "bk-inq"]).forEach((id) => {
        U.$("#" + id).onchange = () => {
          save();
          paint();
        };
      });
      U.$("#bk-apply").onclick = () => {
        save();
        const b = BR.get(brandId);
        const arr = bookKind === "hotel" ? game.state.hotels : game.state.restaurants;
        arr
          .filter((r) => r.brandId === brandId && r.managerAI !== false)
          .forEach((r) => SB.runManager(game.state, r, b, game.state.gameTime));
        toast((bookKind === "hotel" ? "Las direcciones" : "Los gerentes") + " de " + b.name + " actualizan al libro de marca.");
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
    const year = SIM.yearOf(game.state.gameTime);
    const dec = SABOR.decadeMeta(year);
    const news = game.state.news || [];
    const ybs = game.state.yearbooks || [];
    body.innerHTML = `
      <article class="paper" style="background:${dec.paper};color:${dec.ink};border-color:${dec.accent}">
        <div class="kicker" style="color:${dec.accent}">${dec.kicker} · ${dec.y}s</div>
        <h3>${dec.title}</h3>
        <p class="lede">${dec.tone}</p>
      </article>
      <h3>Anuarios</h3>
      ${
        ybs.length
          ? ybs
              .slice()
              .reverse()
              .map(
                (y) => `<button type="button" class="year-card" data-y="${y.year}">
            <header><b>Anuario ${y.year}</b><span class="chip">${y.n} locales</span></header>
            <div class="muted">${y.best ? "Estrella: " + y.best.name : "Sin locales"} · ${y.worst ? "Sangra: " + y.worst.name : ""}</div>
          </button>`
              )
              .join("")
          : `<p class="muted">El primer anuario se imprime el 31 de diciembre de ${year}.</p>`
      }
      <h3>Teletipo del grupo</h3>
      <p class="muted">Aperturas, inspecciones, congresos y movimientos de mercado de Horizon Restaurant Group y Horizon Hotels a la vez.</p>
      ${
        news
          .slice(0, 36)
          .map((n) => {
            const d = SABOR.decadeMeta(new Date(n.t).getUTCFullYear());
            return `<div class="news-item" style="border-left:4px solid ${d.accent};padding-left:8px"><time>${U.formatDateTime(n.t)} · ${d.title}</time>${n.text}</div>`;
          })
          .join("") || "<p class='muted'>Sin noticias.</p>"
      }`;
    body.querySelectorAll("[data-y]").forEach((btn) => {
      btn.onclick = () => {
        const y = ybs.find((x) => x.year === +btn.dataset.y);
        if (y) showYearbook(y);
      };
    });
  }

  function showYearbook(yb) {
    if (!yb) return;
    if (game.state && game.state.yearbookNew === yb.year) game.state.yearbookNew = 0;
    const dec = yb.decade || SABOR.decadeMeta(yb.year);
    const star = yb.starBrandId ? BRAND.get(yb.starBrandId) : null;
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card" style="width:min(720px,96%);background:${dec.paper};color:${dec.ink}">
      <div class="kicker" style="color:${dec.accent}">${dec.title} · anuario</div>
      <h2>${GROUP_NAME} ${yb.year}</h2>
      <p class="muted">${dec.tone}</p>
      <div class="kpis">
        <div class="kpi teal"><b>${U.formatMoney(yb.yRev)}</b><span>Ingresos del año</span></div>
        <div class="kpi coral"><b>${U.formatMoney(yb.yCost)}</b><span>Costes</span></div>
        <div class="kpi gold"><b>${yb.open}/${yb.n}</b><span>Abiertos / total</span></div>
        <div class="kpi sky"><b>${yb.countries}</b><span>Países</span></div>
      </div>
      <p>Filial estrella: <b>${star ? star.name : "—"}</b> ${star ? star.logo : ""}</p>
      <p>Local del año: <b>${yb.best ? yb.best.name : "—"}</b> ${yb.best ? U.formatMoney(yb.best.ebitda) : ""}</p>
      <p>El que más sangra: <b>${yb.worst ? yb.worst.name : "—"}</b> ${yb.worst ? U.formatMoney(yb.worst.ebitda) : ""}</p>
      <h3>Titulares</h3>
      ${(yb.headlines || []).map((h) => `<div class="news-item">${h}</div>`).join("") || "<p class='muted'>Año tranquilo.</p>"}
      <div style="text-align:right;margin-top:12px"><button type="button" class="btn primary" id="yb-ok">Cerrar</button></div>
    </div>`;
    modal.classList.add("show");
    U.$("#yb-ok").onclick = closeModal;
    if (yb.best) {
      const go = document.createElement("button");
      go.className = "btn ghost";
      go.textContent = "Ir al local estrella";
      go.onclick = () => {
        closeModal();
        if (yb.best && yb.best.id) game.openRestaurant(yb.best.id);
      };
      U.$("#yb-ok").parentNode.prepend(go);
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
    openKind = null;
  }

  function showBuild(place) {
    const year = SIM.yearOf(game.state.gameTime);
    const infl = WORLD.inflationFactor(place.countryCode, year);
    const ctry = WORLD.country(place.countryCode);
    let kind = "restaurant";
    let rBrandId = BRAND.list[0].id;
    let rSizeId = SABOR.suggestSize(BRAND.get(rBrandId), place);
    let rSizeTouched = false;
    let hallBrands = [];
    let hBrandId = HBRAND.list[0].id;
    let hSizeId = HSABOR.suggestFormat(HBRAND.get(hBrandId), place);
    let hSizeTouched = false;
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
      return kind === "hotel" ? HSIM.buildQuote(HBRAND.get(hBrandId), hSizeId, place, game.state.gameTime) : SIM.buildQuote(BRAND.get(rBrandId), rSizeId, place, game.state.gameTime);
    }
    function paint() {
      const prevDesc = U.$("#b-desc");
      if (prevDesc) draftDesc = prevDesc.value.slice(0, DESC_MAX);
      const q = quote();
      const sett = GEO.formatSettlement(place);
      const settChipClass =
        place.settlementKind === "city" ? "sky" : place.settlementKind === "town" ? "ok" : place.settlementKind === "village" || place.settlementKind === "hamlet" ? "pueblo" : "";
      const pl = WORLD.priceLevel(place.countryCode, year);
      const rBrand = BRAND.get(rBrandId);
      const hBrand = HBRAND.get(hBrandId);
      const brand = kind === "hotel" ? hBrand : rBrand;
      modal.innerHTML = `<div class="card" id="build-card">
        <h2>Nuevo local</h2>
        <div class="seg" id="bd-kind" role="group" aria-label="Tipo de negocio a construir">
          <button type="button" data-k="restaurant" class="${kind === "restaurant" ? "active" : ""}">🍽️ Restaurante</button>
          <button type="button" data-k="hotel" class="${kind === "hotel" ? "active" : ""}">🏨 Hotel</button>
        </div>
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
            ${
              kind === "hotel"
                ? `<div>ADR estimado <b>${U.formatMoney(HSIM.fairADR(hBrand, pl), 0)}/noche</b></div>`
                : `<div>Gusto vs marca <b>×${SABOR.tasteFit(rBrand, place.countryCode).toFixed(2)}</b></div><div>Alcohol <b>${SABOR.alcoholPolicy(place.countryCode).mode === "dry" ? "país seco" : SABOR.alcoholPolicy(place.countryCode).mode === "license" ? "licencia" : "libre"}</b></div>`
            }
          </div>
        </div>
        ${
          kind === "hotel"
            ? `<p class="muted">Filial de Horizon Hotels · ${HBRAND.SEGMENTS[hBrand.segment].name} · ${HBRAND.TIERS[hBrand.tier].name} · ${hBrand.stars}★</p>
               <div class="brand-grid" id="bg"></div>
               <p class="muted">Formato de hotel</p>
               <div class="format-grid" id="sz"></div>`
            : `<p class="muted">Filial de Horizon Restaurant Group · ${rBrand.cuisines.join(", ")} · ${BRAND.tiers[rBrand.tier].name} · ${rBrand.dishes.length} platos</p>
               <div class="brand-grid" id="bg"></div>
               <p class="muted">Formato (teclas 1–6)</p>
               <div class="format-grid" id="sz"></div>
               ${
                 rSizeId === "food_hall"
                   ? `<p class="muted">Food hall: hasta 3 filiales invitadas. Cada una abre un puesto con su propio gerente, carta y P&amp;L.</p><div class="brand-grid" id="hallg"></div>`
                   : rSizeId === "ghost"
                     ? `<p class="muted">Cocina fantasma: sin sala, delivery incluido, inversión y alquiler más bajos.</p>`
                     : ""
               }`
        }
        <div class="place-box">
          <div>Permisos ${U.formatMoney(q.permits)} · Obra ${U.formatMoney(q.works + q.fitout)}</div>
          <div><b>Inversión ${U.formatMoney(q.total)}</b> · Alquiler ${U.formatMoney(q.rentMonthly)}/mes</div>
          ${q.total > game.state.cash ? `<p class="loss">Caja ${U.formatMoney(game.state.cash)}: no alcanza. En Matriz puedes pedir un préstamo o usar un truco.</p>` : ""}
          <div class="muted">${kind === "hotel" ? "" : SIM.sizeOf(rSizeId).ghost ? "Sin terraza. Delivery de serie. " : SIM.sizeOf(rSizeId).hall ? "Varias filiales, un edificio. " : ""}Permisos ~${Math.round(q.permitH / 24)} d · Obra ~${Math.round(q.buildH / 24)} d</div>
        </div>
        <h3>Foto y descripción</h3>
        <p class="muted">Opcional. También puedes añadirlas después, en la ficha del local.</p>
        ${venueMetaHtml(BUILD_META, kind === "hotel" ? "hotel" : "local")}
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" id="cancel-b">Cancelar</button>
          <button class="btn primary" id="ok-b">Tramitar y construir</button>
        </div>
      </div>`;
      U.$("#bd-kind").onclick = (ev) => {
        const b = ev.target.closest("button[data-k]");
        if (!b || b.dataset.k === kind) return;
        kind = b.dataset.k;
        paint();
      };
      const bg = U.$("#bg");
      if (kind === "hotel") {
        HBRAND.list.forEach((b) => {
          const t = document.createElement("button");
          t.className = "brand-tile" + (b.id === hBrandId ? " on" : "");
          t.innerHTML = `${b.logo}<span>${b.name}</span>`;
          t.title = b.tagline;
          t.onclick = () => {
            hBrandId = b.id;
            if (!hSizeTouched) hSizeId = HSABOR.suggestFormat(HBRAND.get(hBrandId), place);
            paint();
          };
          bg.append(t);
        });
        const sz = U.$("#sz");
        const recommended = HSABOR.suggestFormat(hBrand, place);
        HSIM.HTYPES.forEach((s) => {
          const isRec = s.id === recommended;
          const t = document.createElement("button");
          t.type = "button";
          t.className = "size-tile" + (s.id === hSizeId ? " on" : "") + (isRec ? " rec" : "");
          t.innerHTML = `<b>${s.name}${isRec ? '<span class="rec-badge">Recomendado</span>' : ""}</b><small>${s.rooms} hab. · ${U.formatInt(s.rooms * s.m2r)} m² · ${s.star.join("–")}★</small>`;
          t.onclick = () => {
            hSizeId = s.id;
            hSizeTouched = true;
            paint();
          };
          sz.append(t);
        });
      } else {
        BRAND.list.forEach((b) => {
          const t = document.createElement("button");
          t.className = "brand-tile" + (b.id === rBrandId ? " on" : "");
          t.innerHTML = `${b.logo}<span>${b.name}</span>`;
          t.title = b.tagline;
          t.onclick = () => {
            rBrandId = b.id;
            if (!rSizeTouched) rSizeId = SABOR.suggestSize(BRAND.get(rBrandId), place);
            paint();
          };
          bg.append(t);
        });
        const sz = U.$("#sz");
        const recommended = SABOR.suggestSize(rBrand, place);
        SIM.SIZES.forEach((s) => {
          if (s.stall) return;
          const isRec = s.id === recommended;
          const t = document.createElement("button");
          t.type = "button";
          t.className = "size-tile" + (s.id === rSizeId ? " on" : "") + (isRec ? " rec" : "");
          t.innerHTML = `<b>${s.name}${isRec ? '<span class="rec-badge">Recomendado</span>' : ""}</b><small>${s.seats} cubiertos · ${s.m2} m²${s.ghost ? " · delivery" : ""}${s.hall ? " · multi-marca" : ""}</small>`;
          t.onclick = () => {
            rSizeId = s.id;
            rSizeTouched = true;
            if (s.id !== "food_hall") hallBrands = [];
            paint();
          };
          sz.append(t);
        });
        const hg = U.$("#hallg");
        if (hg) {
          BRAND.list.forEach((b) => {
            if (b.id === rBrandId) return;
            const t = document.createElement("button");
            t.type = "button";
            t.className = "brand-tile" + (hallBrands.includes(b.id) ? " on" : "");
            t.innerHTML = `${b.logo}<span>${b.name}</span>`;
            t.onclick = () => {
              if (hallBrands.includes(b.id)) hallBrands = hallBrands.filter((x) => x !== b.id);
              else if (hallBrands.length < 3) hallBrands = hallBrands.concat(b.id);
              paint();
            };
            hg.append(t);
          });
        }
      }
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
        const ok = game.confirmBuild(kind, kind === "hotel" ? hBrandId : rBrandId, kind === "hotel" ? hSizeId : rSizeId, place, quote(), {
          hallBrands,
          photo: draftPhoto,
          description: draftDesc,
        });
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
    openKind = "restaurant";
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
          <p class="muted">Filial de ${SABOR.HOLDING} · ${brand.name} · ${brand.cuisines.join(", ")} · ${SIM.sizeOf(r.size).name} · ${brand.dishes.length} platos</p>
          <p class="muted">${r.settlementKind === "village" || r.settlementKind === "hamlet" ? "Pueblo de " : r.settlementKind === "city" ? "Ciudad de " : ""}${r.city}${r.municipality && r.municipality !== r.city ? " · " + r.municipality : ""}, ${r.countryName} · ${SABOR.POI_L[r.poi] || r.poi} · gusto ×${SABOR.tasteFit(brand, r.country).toFixed(2)}</p>
          <div class="place-flags">
            ${r.size === "ghost" ? `<span class="chip violet">Cocina fantasma</span>` : ""}
            ${r.size === "food_hall" ? `<span class="chip warn">Food hall</span>` : ""}
            ${r.owned ? `<span class="chip ok">Bajo en propiedad</span>` : `<span class="chip">Alquiler</span>`}
            ${r.metro ? `<span class="chip sky">Metro</span>` : ""}
            ${r.pedestrian ? `<span class="chip">Peatonal</span>` : ""}
            ${(r.hallBrands || []).map((id) => { const bb = BRAND.get(id); return bb ? `<span class="chip">${bb.name}</span>` : ""; }).join("")}
          </div>
          ${
            r.size === "food_hall"
              ? `<p class="muted">Cada puesto tiene su gerente y su carta. El hall y cada marca se simulan por separado.</p>
                 <div class="place-flags">${(SIM.hallStalls(game.state, r.id) || [])
                   .map((st) => {
                     const bb = BRAND.get(st.brandId);
                     const sk = SIM.managerSkill(st);
                     return `<button type="button" class="chip" data-stall="${st.id}">${bb ? bb.name : st.name} · ger. ${Math.round(sk)}</button>`;
                   })
                   .join("")}</div>`
              : ""
          }
          ${r.hallParentId ? `<p class="muted">Puesto dentro de un food hall. Su gerente gestiona solo este fogón según su habilidad.</p>` : ""}
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META, "local")}
          ${(() => {
            const mgrs = r.staff.filter((s) => s.role === "gerente");
            const sk = SIM.managerSkill(r);
            return mgrs.length
              ? `<p>Gerente: <b>${mgrs.map((s) => s.name).join(", ")}</b> · habilidad ${Math.round(sk)}/100. ${r.managerAI !== false ? "Lleva el local entero (carta, horario, género, plantilla, ampliaciones) según esa habilidad." : "IA apagada: tú gestionas a mano."}</p>`
              : `<p class="loss">Este local no tiene gerente. Sin gerencia el local no se gestiona solo.</p>`;
          })()}
          <label><input type="checkbox" id="mgr" ${r.managerAI !== false ? "checked" : ""}/> Gerente IA (gestiona todo el local según su habilidad)</label>
          <p class="muted">${r.managerNote || ""}</p>
          ${miss.length ? `<p class="loss">Falta personal: ${miss.join(", ")}. El local no atiende.</p>` : ""}
          <h3>Reseñas</h3>
          ${(r.reviews || []).map((rv) => `<div class="news-item">${rv.stars}★ · ${U.escapeHtml(rv.text)}</div>`).join("") || "<p class='muted'>Aún no hay reseñas.</p>"}
        `;
        bindVenuePhotoDesc(r);
        body.querySelectorAll("[data-stall]").forEach((btn) => {
          btn.onclick = () => game.openRestaurant(btn.dataset.stall);
        });
        const mgr = U.$("#mgr");
        if (mgr)
          mgr.onchange = () => {
            r.managerAI = mgr.checked;
            if (r.managerAI) SABOR.runManager(game.state, r, brand, game.state.gameTime);
            game.dirty();
            paint();
          };
      } else if (tab === "carta") {
        body.innerHTML = `<p class="muted">${r.managerAI !== false ? "El gerente fija carta, precios y género del local según su habilidad y el libro de marca. Desactívalo en Resumen para editar a mano." : "Tú fijas carta y precios. El libro de marca de la matriz sigue limitando firma, alcohol y rango."}</p>
          <p class="muted">${brand.dishes.length} platos en esta filial.</p>
          <label class="muted">Género del local
            <select id="ingq"><option value="0">Económico</option><option value="1">Estándar</option><option value="2">Premium</option></select>
          </label>
          <div id="dishes"></div>`;
        U.$("#ingq").value = String(r.ingQ ?? 1);
        U.$("#ingq").disabled = r.managerAI !== false;
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
        body.innerHTML = `<p class="muted">${r.managerAI !== false ? "El gerente cubre huecos, forma y ajusta plantilla según su habilidad. Puedes intervenir; en el próximo ciclo la IA vuelve a decidir." : "Salarios ligados al mínimo del país (inflado desde 2000). Entrenar cuesta y sube habilidad."}</p>
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
          <label><input type="checkbox" id="auto" ${r.autoRestock ? "checked" : ""} ${r.managerAI !== false ? "disabled" : ""}/> Reposición automática ${r.managerAI !== false ? "(la lleva el gerente)" : ""}</label>
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
            <div class="kpi"><b>${U.formatMoney(r.finance.taxTotal || 0)}</b><span>Sociedades acum.</span></div>
            <div class="kpi"><b>${U.formatMoney(dayP)}</b><span>Hoy (juego)</span></div>
          </div>
          <p>Alquiler mensual ${U.formatMoney(r.rentMonthly)} · masa salarial ~${U.formatMoney(st.wageDay)}/día laboral${r.hallParentId ? " · puesto de food hall (sin alquiler propio)" : ""}</p>
          <p class="muted">El impuesto de sociedades del país se cobra sobre el beneficio operativo de este local. La inflación (y los brotes) suben alquiler, salarios y género.</p>
          <h3>Mensual</h3>
          ${months.map(([k, v]) => `<div class="rank-row"><div>${k}</div><div class="${v.rev - v.cost >= 0 ? "gain" : "loss"}">${U.formatMoney(v.rev - v.cost)}</div></div>`).join("") || "<p class='muted'>Sin meses aún.</p>"}`;
      } else {
        const val = SIM.sellValue(r, game.state.gameTime);
        const pol = SABOR.alcoholPolicy(r.country);
        if (!r.hours) r.hours = SABOR.defaultHours(brand);
        body.innerHTML = `
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META, "local")}
          <p>Superficie ${SIM.sizeOf(r.size).m2} m² · ${SIM.sizeOf(r.size).seats} cubiertos · ${SABOR.POI_L[r.poi] || r.poi}</p>
          <p>Limpieza</p>
          <div class="bar"><i style="width:${r.cleanliness}%"></i></div>
          <h3>Horario local (hora del sitio)</h3>
          <p class="muted">Siete días, dos franjas (comida y cena). 24 = medianoche, 26 = 02:00. ${r.managerAI !== false ? "El gerente fija el horario según su habilidad. Desactiva la IA en Resumen para editarlo a mano." : "Tú fijas el horario. El gerente no lo pisa."}</p>
          <div class="hours-presets" id="hpre">
            <button type="button" class="btn ghost sm" data-hp="marca" ${r.managerAI !== false ? "disabled" : ""}>Marca</button>
            <button type="button" class="btn ghost sm" data-hp="24h" ${r.managerAI !== false ? "disabled" : ""}>24 h</button>
            <button type="button" class="btn ghost sm" data-hp="lunoff" ${r.managerAI !== false ? "disabled" : ""}>Cerrado lunes</button>
            <button type="button" class="btn ghost sm" data-hp="finde" ${r.managerAI !== false ? "disabled" : ""}>Finde largo</button>
            <button type="button" class="btn ghost sm" data-hp="split" ${r.managerAI !== false ? "disabled" : ""}>Comida+cena</button>
            <button type="button" class="btn ghost sm" data-hp="copylun" ${r.managerAI !== false ? "disabled" : ""}>Lun → semana</button>
          </div>
          <div class="hours-grid" id="hours"></div>
          <h3>Ampliaciones</h3>
          <label><input type="checkbox" id="deliv" ${r.delivery ? "checked" : ""} ${r.size === "ghost" || r.managerAI !== false ? "disabled" : ""}/> Delivery (${r.size === "ghost" ? "incluido" : U.formatMoney(r.rentMonthly * 0.15) + " alta"})${r.managerAI !== false ? " · lo decide el gerente" : ""}</label><br>
          <label><input type="checkbox" id="terr" ${r.terrace ? "checked" : ""} ${r.size === "ghost" || r.managerAI !== false ? "disabled" : ""}/> Terraza (${U.formatMoney(r.rentMonthly * 0.12)} alta)${r.managerAI !== false ? " · lo decide el gerente" : ""}</label>
          <h3>El bajo</h3>
          <p>${r.owned ? `Propiedad · valor ${U.formatMoney(r.propertyValue || 0)} · comunidad ~${U.formatMoney((r.communityMonthly || r.rentMonthly * 0.08))}/mes` : `Alquiler ${U.formatMoney(r.rentMonthly)}/mes · comprar el bajo ${U.formatMoney(r.propertyValue || r.rentMonthly * 108)}`}</p>
          <div class="place-flags">
            ${r.metro ? `<span class="chip sky">Metro cerca</span>` : `<span class="chip">Sin metro</span>`}
            ${r.pedestrian ? `<span class="chip ok">Calle peatonal</span>` : ""}
          </div>
          ${r.owned ? `<button type="button" class="btn ghost" id="sell-brick">Vender solo el ladrillo</button>` : r.hallParentId ? "" : `<button type="button" class="btn primary" id="buy-brick">Comprar el bajo</button>`}
          <p class="muted">Alcohol: ${pol.mode === "dry" ? "país seco — no se puede servir" : pol.mode === "license" ? "requiere licencia" : "libre con tasa"} · ${r.alcoholLicense ? "licencia activa" : "sin licencia"}${r.managerAI !== false && !r.alcoholLicense ? " · el gerente la gestiona" : ""}</p>
          ${pol.mode !== "dry" && !r.alcoholLicense && r.managerAI === false ? `<button class="btn ghost" id="lic">Comprar licencia (${U.formatMoney(pol.license * WORLD.inflationFactor(r.country, SIM.yearOf(game.state.gameTime)))})</button>` : ""}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn ghost" id="clean">Brigada de limpieza</button>
            <button class="btn warn" id="reno">Reformar</button>
            <button class="btn ghost" id="rebrand">Cambiar marca</button>
            <button class="btn ghost" id="toggle">${r.status === "cerrado" ? "Reabrir" : "Cerrar temporalmente"}</button>
            <button class="btn danger" id="sell">Vender negocio${r.owned ? " + bajo" : ""} (${U.formatMoney(val)})</button>
          </div>
          <div id="rebrand-box"></div>`;
        bindVenuePhotoDesc(r);
        const lockOps = r.managerAI !== false;
        const hg = U.$("#hours");
        const daysN = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const paintHours = () => {
          hg.innerHTML = `<span class="hh"></span><span class="hh">Abre</span><span class="hh">Franja 1</span><span class="hh">a</span><span class="hh">Franja 2</span><span class="hh">a</span>`;
          r.hours.forEach((h, i) => {
            const row = document.createElement("div");
            row.style.display = "contents";
            row.innerHTML = `<span class="hd">${daysN[i]}</span>
              <input type="checkbox" title="Abre" ${h.open ? "checked" : ""} ${lockOps ? "disabled" : ""}/>
              <input type="number" min="0" max="27" value="${h.a}" title="Apertura 1" ${lockOps ? "disabled" : ""}/>
              <input type="number" min="0" max="27" value="${h.b}" title="Cierre 1" ${lockOps ? "disabled" : ""}/>
              <input type="number" min="0" max="27" value="${h.c || 0}" title="Apertura 2 (0 = no)" ${lockOps ? "disabled" : ""}/>
              <input type="number" min="0" max="27" value="${h.d || 0}" title="Cierre 2" ${lockOps ? "disabled" : ""}/>`;
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
          if (lockOps) return;
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
        const buyB = U.$("#buy-brick");
        if (buyB)
          buyB.onclick = () => {
            const price = r.propertyValue || r.rentMonthly * 108;
            if (game.state.cash < price) return toast("No alcanza el bajo.", true);
            game.state.cash -= price;
            r.owned = true;
            r.communityMonthly = r.rentMonthly * 0.08;
            toast("Has comprado el bajo. El alquiler pasa a comunidad.");
            game.dirty();
            paint();
          };
        const sellB = U.$("#sell-brick");
        if (sellB)
          sellB.onclick = () => {
            const price = r.propertyValue || 0;
            game.state.cash += price;
            r.owned = false;
            toast("Has vendido el ladrillo. Vuelves al alquiler.");
            game.dirty();
            paint();
          };
        U.$("#deliv").onchange = () => {
          if (lockOps) return;
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
          if (lockOps) return;
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
          if (r.size === "food_hall") {
            SIM.hallStalls(game.state, r.id).forEach((st) => {
              st.status = r.status;
              st.closedReason = r.closedReason;
            });
          }
          game.dirty();
          paint();
          MAP.refresh();
        };
        U.$("#sell").onclick = () => {
          if (!confirm("¿Vender este local?")) return;
          let pay = val;
          const drop = new Set([r.id]);
          if (r.size === "food_hall") {
            SIM.hallStalls(game.state, r.id).forEach((st) => {
              pay += SIM.sellValue(st, game.state.gameTime);
              drop.add(st.id);
            });
          }
          game.state.cash += pay;
          game.state.restaurants = game.state.restaurants.filter((x) => !drop.has(x.id));
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

  function showHotel(id) {
    const r = game.state.hotels.find((x) => x.id === id);
    if (!r) return;
    game.openId = id;
    openKind = "hotel";
    const brand = HBRAND.get(r.brandId);
    const sheet = U.$("#sheet");
    let tab = "resumen";
    function paint() {
      const q = HSIM.qualityOf(r, brand);
      const st = HSIM.staffStats(r.staff);
      const miss = HSIM.understaffed(brand, r.htype, r.staff);
      const profit = r.finance.revTotal - r.finance.costTotal;
      const loc = HSIM.localHour(game.state.gameTime, r.tz);
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
      const sz = HSIM.sizeOf(r.htype);
      if (tab === "resumen") {
        body.innerHTML = `
          <div class="kpis">
            <div class="kpi"><b>${q.toFixed(0)}</b><span>Calidad</span></div>
            <div class="kpi"><b>${r.cleanliness.toFixed(0)}</b><span>Limpieza</span></div>
            <div class="kpi"><b>${U.formatMoney(r.adr || 0, 0)}</b><span>ADR</span></div>
            <div class="kpi"><b class="${profit >= 0 ? "gain" : "loss"}">${U.formatMoney(profit)}</b><span>Resultado</span></div>
          </div>
          <p>${brand.tagline}</p>
          <p class="muted">Filial de ${HSABOR.HOLDING} · ${brand.name} · ${HBRAND.SEGMENTS[brand.segment].name} · ${sz.name} (${sz.rooms} habitaciones)</p>
          <p class="muted">${r.settlementKind === "village" || r.settlementKind === "hamlet" ? "Pueblo de " : r.settlementKind === "city" ? "Ciudad de " : ""}${r.city}${r.municipality && r.municipality !== r.city ? " · " + r.municipality : ""}, ${r.countryName} · ${HSABOR.POI_L[r.poi] || r.poi}</p>
          <div class="place-flags">
            ${r.owned ? `<span class="chip ok">Bajo en propiedad</span>` : `<span class="chip">Alquiler</span>`}
            ${r.metro ? `<span class="chip sky">Metro/estación</span>` : ""}
            ${r.pedestrian ? `<span class="chip">Peatonal</span>` : ""}
          </div>
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META, "hotel")}
          ${(() => {
            const mgrs = r.staff.filter((s) => s.role === "gerente");
            const sk = HSIM.managerSkill(r);
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
        bindVenuePhotoDesc(r);
        const mgr = U.$("#mgr");
        if (mgr)
          mgr.onchange = () => {
            r.managerAI = mgr.checked;
            if (r.managerAI) HSABOR.runManager(game.state, r, brand, game.state.gameTime);
            game.dirty();
            paint();
          };
      } else if (tab === "amenities") {
        const lockOps = r.managerAI !== false;
        body.innerHTML = `<p class="muted">${lockOps ? "La dirección añade amenities (spa, restaurante, piscina…) según su habilidad y el segmento de la marca. Desactiva la IA en Resumen para gestionarlas a mano." : "Tú decides qué amenities instalar."}</p>
          <div id="amelist"></div>`;
        const box = U.$("#amelist");
        Object.entries(HSABOR.AMENITIES).forEach(([key, def]) => {
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
          row.innerHTML = `<div><b>${s.name}</b><div class="muted">${HSIM.ROLES[s.role].name} · habilidad ${s.skill}</div></div>
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
        Object.keys(HSIM.ROLES).forEach((role) => {
          const b = document.createElement("button");
          b.className = "btn ghost sm";
          b.textContent = "+ " + HSIM.ROLES[role].name;
          b.onclick = () => {
            const rng = Math.random;
            const year = SIM.yearOf(game.state.gameTime);
            const wageH = WORLD.country(r.country).wage * WORLD.inflationFactor(r.country, year);
            const skill = Math.round(40 + Math.random() * 30);
            r.staff.push({
              id: U.uid("st"),
              role,
              name: HSIM.personName(rng),
              skill,
              wage: +(wageH * HSIM.ROLES[role].wage * (0.7 + skill / 200)).toFixed(2),
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
        const val = HSIM.sellValue(r, game.state.gameTime);
        body.innerHTML = `
          <h3>Foto y descripción</h3>
          ${venueMetaHtml(REST_META, "hotel")}
          <p>Formato ${sz.name} · ${sz.rooms} habitaciones · ${U.formatInt(sz.rooms * sz.m2r)} m² · ${HSABOR.POI_L[r.poi] || r.poi}</p>
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
        bindVenuePhotoDesc(r);
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
          HBRAND.list.forEach((b) => {
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
    let list = listVenues();
    const modal = U.$("#modal");
    const rowH = 32;
    modal.innerHTML = `<div class="card" style="width:min(1040px,96%)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
        <h2>Tabla de locales</h2>
        <input id="qtab" placeholder="Buscar nombre, ciudad, marca" style="flex:1;min-width:160px;padding:8px;border-radius:10px;border:1px solid var(--line)"/>
        <button class="btn ghost" id="csv">CSV</button>
        <button class="btn ghost" id="ct">Cerrar</button>
      </div>
      <p class="muted" id="tabn">${U.formatInt(list.length)} en vista</p>
      <div class="vt-wrap" id="vt">
        <div id="vt-spacer" style="position:relative">
          <table class="data" style="position:sticky;top:0;background:#fffaf2;z-index:1"><thead><tr><th>Tipo</th><th>Local</th><th>Marca</th><th>Ciudad</th><th>País</th><th>Estado</th><th>★</th><th>Resultado</th></tr></thead></table>
          <div id="vt-rows"></div>
        </div>
      </div>
    </div>`;
    modal.classList.add("show");
    const apply = () => {
      const q = (U.$("#qtab").value || "").toLowerCase();
      list = listVenues().filter((r) => {
        if (!q) return true;
        const b = brandOf(r);
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
          const b = brandOf(r);
          const p = r.finance.revTotal - r.finance.costTotal;
          return `<tr data-id="${r.id}" data-kind="${r.kind}"><td>${r.kind === "hotel" ? "Hotel" : "Restaurante"}</td><td>${r.name}</td><td>${b ? b.name : ""}</td><td>${r.city}</td><td>${r.countryName}</td><td>${STATUS_L[r.status]}</td><td>${(r.stars || 0).toFixed(1)}</td><td class="${p >= 0 ? "gain" : "loss"}">${U.formatMoney(p)}</td></tr>`;
        })
        .join("")}</tbody></table>`;
      rows.querySelectorAll("tr").forEach((tr) => {
        tr.style.cursor = "pointer";
        tr.onclick = () => {
          closeModal();
          if (tr.dataset.kind === "hotel") game.openHotel(tr.dataset.id);
          else game.openRestaurant(tr.dataset.id);
        };
      });
    };
    U.$("#vt").addEventListener("scroll", paintRows);
    U.$("#qtab").addEventListener("input", apply);
    U.$("#csv").onclick = () => {
      const lines = [["tipo", "nombre", "marca", "ciudad", "pais", "estado", "estrellas", "resultado", "descripcion"].join(";")];
      list.forEach((r) => {
        const b = brandOf(r);
        const p = r.finance.revTotal - r.finance.costTotal;
        const desc = String(r.description || "").replace(/[\r\n;]+/g, " ").trim();
        lines.push([r.kind === "hotel" ? "hotel" : "restaurante", r.name, b ? b.name : "", r.city, r.countryName, r.status, r.stars, p.toFixed(2), desc].join(";"));
      });
      U.download("horizon-group-locales.csv", lines.join("\n"));
    };
    U.$("#ct").onclick = closeModal;
    paintRows();
  }

  async function showSaves(fromGame) {
    const slots = await STORE.listSlots();
    const modal = U.$("#modal");
    modal.innerHTML = `<div class="card">
      <h2>8 ranuras — ${GROUP_NAME}</h2>
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
    maybeShowBackupPrompt,
    showBuild,
    showRestaurant,
    showHotel,
    showTable,
    showSaves,
    showYearbook,
    closeModal,
    closeSheet,
    refreshOpen() {
      if (!game.openId) return;
      if (openKind === "hotel") showHotel(game.openId);
      else showRestaurant(game.openId);
    },
  };
})(window);
