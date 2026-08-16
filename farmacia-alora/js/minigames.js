/**
 * Minijuegos de mostrador: escanear, cortar/pegar códigos, firmar, etc.
 */
(function (global) {
  const Sounds = () => global.FarmaciaSounds || {};

  const DEFS = [
    { id: "barcode_scan", nombre: "Escanear código de barras", icon: "📶", desc: "Alinea el escáner y pulsa cuando coincida." },
    { id: "cut_paste_rx", nombre: "Cortar y pegar en receta", icon: "✂️", desc: "Arrastra los códigos de cada medicamento a la receta en papel." },
    { id: "e_receta_pin", nombre: "Validar receta electrónica", icon: "🔐", desc: "Introduce el PIN de la receta electrónica." },
    { id: "firma_controlado", nombre: "Firma del farmacéutico", icon: "✍️", desc: "Dibuja tu firma para el libro de controlados." },
    { id: "contar_blister", nombre: "Contar comprimidos", icon: "💊", desc: "Cuenta rápido los comprimidos visibles." },
    { id: "nevera_temp", nombre: "Temperatura del frigorífico", icon: "❄", desc: "Mantén la temperatura entre 2 y 8 °C." },
    { id: "ordenar_caducidad", nombre: "Ordenar por caducidad", icon: "📅", desc: "Ordena: verde → naranja → rojo." },
    { id: "verificar_dni", nombre: "Verificar DNI", icon: "🪪", desc: "Pulsa los dígitos correctos del DNI." },
    { id: "bolsa_frio", nombre: "Separar bolsa frío", icon: "🧊", desc: "Mete nevera a la izquierda y normal a la derecha." },
    { id: "cambio_rapido", nombre: "Dar el cambio", icon: "💶", desc: "Selecciona monedas/billetes hasta el cambio exacto." },
    { id: "etiqueta_estante", nombre: "Ubicar en estante", icon: "🗄️", desc: "Elige la categoría correcta del producto." },
    { id: "sello_receta", nombre: "Sellar receta", icon: "🔖", desc: "Elige el sello correcto (papel o electrónica)." },
    { id: "emparejar_generico", nombre: "Emparejar genérico", icon: "♻", desc: "Elige el EFG correcto del mismo principio activo." },
    { id: "lavado_manos", nombre: "Higiene de manos", icon: "🧼", desc: "Sigue el orden correcto de lavado." },
    { id: "preguntar_alergia", nombre: "Preguntar alergias", icon: "⚠", desc: "Pregunta y marca la alergia del paciente." },
    { id: "pesar_pomada", nombre: "Dosificar pomada", icon: "🧴", desc: "Ajusta la cantidad prescrita en gramos." },
    { id: "triage_urgencia", nombre: "Triaje mostrador", icon: "🚨", desc: "Decide si es urgencia o venta normal." },
  ];

  function shuffle(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((r ? r() : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickGamesForSale(ctx) {
    // ctx: { lineas, receta, cliente, hasNevera, hasCtrl, metodoPago }
    const games = [];
    const r = Math.random;
    // Always scan at least one product
    games.push({ type: "barcode_scan", product: ctx.lineas[0] });
    if (ctx.lineas.length > 1 && r() < 0.6) {
      games.push({ type: "barcode_scan", product: ctx.lineas[Math.min(1, ctx.lineas.length - 1)] });
    }
    if (ctx.receta) {
      if (ctx.receta.tipo === "papel") {
        games.push({ type: "cut_paste_rx", receta: ctx.receta, productos: ctx.lineas.filter((l) => l.requiereReceta) });
        games.push({ type: "sello_receta", tipo: "papel" });
      } else {
        games.push({ type: "e_receta_pin", receta: ctx.receta });
        if (r() < 0.5) games.push({ type: "sello_receta", tipo: "electronica" });
      }
      Sounds().beepReceta?.();
    }
    if (ctx.hasCtrl) games.push({ type: "firma_controlado" });
    if (ctx.hasNevera) games.push({ type: "nevera_temp" }, { type: "bolsa_frio", lineas: ctx.lineas });
    if (ctx.cliente?.dni && (ctx.receta || ctx.hasCtrl)) games.push({ type: "verificar_dni", dni: ctx.cliente.dni });
    if (r() < 0.45) games.push({ type: "contar_blister" });
    if (r() < 0.35) games.push({ type: "ordenar_caducidad" });
    if (r() < 0.4 && ctx.lineas[0]) games.push({ type: "etiqueta_estante", product: ctx.lineas[0], categorias: ctx.categorias || [] });
    if (ctx.metodoPago === "efectivo" && r() < 0.5) games.push({ type: "cambio_rapido", cambio: ctx.cambioSugerido || 1.2 });
    if (r() < 0.35) games.push({ type: "lavado_manos" });
    if (ctx.cliente?.alergias?.length) games.push({ type: "preguntar_alergia", alergias: ctx.cliente.alergias });
    else if (r() < 0.25) games.push({ type: "preguntar_alergia", alergias: ["penicilina"] });
    if (r() < 0.3 && ctx.lineas[0]) {
      const pa = ctx.lineas[0].principioActivo;
      games.push({ type: "emparejar_generico", product: ctx.lineas[0], opciones: ctx.genericos || [] });
    }
    if (r() < 0.25) games.push({ type: "pesar_pomada", gramos: 15 + Math.floor(r() * 40) });
    if (r() < 0.2) games.push({ type: "triage_urgencia", urgencia: r() < 0.4 });
    // limit to keep flow fun
    return games.slice(0, 6);
  }

  function barcodeSvg(code) {
    const digits = String(code || "8400000000000");
    let bars = "";
    let x = 4;
    for (let i = 0; i < digits.length; i++) {
      const n = Number(digits[i]) || 0;
      const w = 1 + (n % 3);
      bars += `<rect x="${x}" y="4" width="${w}" height="36" fill="#0f172a"/>`;
      x += w + 1 + (n % 2);
    }
    return `<svg class="barcode-svg" viewBox="0 0 ${x + 4} 48" xmlns="http://www.w3.org/2000/svg">${bars}
      <text x="${(x + 4) / 2}" y="46" text-anchor="middle" font-size="6" fill="#334155">${digits}</text></svg>`;
  }

  /** Render + run one minigame inside containerEl; calls onDone(ok) */
  function runGame(game, containerEl, onDone) {
    containerEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "mini-wrap";
    containerEl.appendChild(wrap);
    const title = DEFS.find((d) => d.id === game.type) || { nombre: game.type, icon: "🎮", desc: "" };
    wrap.innerHTML = `<div class="mini-head"><span class="mini-ico">${title.icon === "Stamp" ? "Stamp" : title.icon}</span><div><strong>${title.nombre}</strong><div class="muted tiny">${title.desc}</div></div></div><div class="mini-body"></div>`;
    // fix stamp emoji
    const body = wrap.querySelector(".mini-body");

    const finish = (ok) => {
      if (ok) Sounds().beepMiniOk?.(); else Sounds().beepMiniFail?.();
      onDone(!!ok);
    };

    switch (game.type) {
      case "barcode_scan": return gameBarcode(body, game, finish);
      case "cut_paste_rx": return gameCutPaste(body, game, finish);
      case "e_receta_pin": return gameEPin(body, game, finish);
      case "firma_controlado": return gameFirma(body, finish);
      case "contar_blister": return gameContar(body, finish);
      case "nevera_temp": return gameNevera(body, finish);
      case "ordenar_caducidad": return gameCaducidad(body, finish);
      case "verificar_dni": return gameDni(body, game, finish);
      case "bolsa_frio": return gameBolsa(body, game, finish);
      case "cambio_rapido": return gameCambio(body, game, finish);
      case "etiqueta_estante": return gameEstante(body, game, finish);
      case "sello_receta": return gameSello(body, game, finish);
      case "emparejar_generico": return gameGenerico(body, game, finish);
      case "lavado_manos": return gameLavado(body, finish);
      case "preguntar_alergia": return gameAlergia(body, game, finish);
      case "pesar_pomada": return gamePesar(body, game, finish);
      case "triage_urgencia": return gameTriage(body, game, finish);
      default: finish(true);
    }
  }

  function gameBarcode(body, game, finish) {
    const code = game.product?.ean || game.product?.sku || "8400000123456";
    const target = 40 + Math.floor(Math.random() * 40); // 40-80%
    body.innerHTML = `
      <div class="scan-stage">
        <div class="scan-product">${game.product?.icon || "💊"} ${game.product?.nombre || "Producto"}</div>
        <div class="barcode-track">${barcodeSvg(code)}</div>
        <div class="scanner-line" id="scanner-line"></div>
      </div>
      <p class="muted">Mueve el escáner con ← → o arrastra. Pulsa <strong>Espacio / Escanear</strong> en la zona verde.</p>
      <input type="range" id="scan-pos" min="0" max="100" value="10" />
      <button type="button" class="btn btn-primary" id="scan-btn">📶 Escanear</button>`;
    const range = body.querySelector("#scan-pos");
    const line = body.querySelector("#scanner-line");
    const sync = () => { line.style.left = range.value + "%"; };
    sync();
    range.oninput = sync;
    const tryScan = () => {
      const v = Number(range.value);
      Sounds().beepScan?.();
      if (Math.abs(v - target) <= 8) finish(true);
      else {
        body.insertAdjacentHTML("beforeend", `<div class="alert alert-moderada">Fallaste (zona ~${target}%). Reintenta.</div>`);
        setTimeout(() => finish(false), 700);
      }
    };
    body.querySelector("#scan-btn").onclick = tryScan;
    body._keydown = (e) => {
      if (e.key === "ArrowLeft") { range.value = String(Math.max(0, Number(range.value) - 3)); sync(); }
      if (e.key === "ArrowRight") { range.value = String(Math.min(100, Number(range.value) + 3)); sync(); }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); tryScan(); }
    };
    document.addEventListener("keydown", body._keydown);
    const oldFinish = finish;
    // cleanup wrapper
    const finish2 = (ok) => { document.removeEventListener("keydown", body._keydown); oldFinish(ok); };
    body.querySelector("#scan-btn").onclick = () => {
      const v = Number(range.value);
      Sounds().beepScan?.();
      if (Math.abs(v - target) <= 8) finish2(true);
      else {
        body.insertAdjacentHTML("beforeend", `<div class="alert alert-moderada">Fallaste. Zona correcta ~${target}%.</div>`);
        setTimeout(() => finish2(false), 650);
      }
    };
  }

  function gameCutPaste(body, game, finish) {
    const prods = (game.productos || []).slice(0, 4);
    if (!prods.length) return finish(true);
    const slots = prods.map((p, i) => ({ id: p.productId || p.id, nombre: p.nombre, code: p.ean || ("RX" + i) }));
    const chips = shuffle(slots.map((s) => ({ ...s })), Math.random);
    body.innerHTML = `
      <div class="cut-board">
        <div class="rx-paper">
          <strong>Receta en papel</strong>
          <div class="rx-slots">${slots.map((s) => `<div class="rx-slot" data-need="${s.id}"><span class="muted">${s.nombre}</span><div class="rx-drop" data-need="${s.id}">Pegar código aquí</div></div>`).join("")}</div>
        </div>
        <div class="cut-codes">
          <strong>Códigos recortados</strong>
          <div class="code-pile" id="code-pile">${chips.map((c) => `<div class="code-chip" draggable="true" data-id="${c.id}">${c.code.slice(-6)}</div>`).join("")}</div>
        </div>
      </div>
      <button type="button" class="btn btn-primary" id="cut-check">Comprobar</button>`;
    let dragging = null;
    body.querySelectorAll(".code-chip").forEach((chip) => {
      chip.ondragstart = () => { dragging = chip; };
    });
    body.querySelectorAll(".rx-drop").forEach((drop) => {
      drop.ondragover = (e) => e.preventDefault();
      drop.ondrop = (e) => {
        e.preventDefault();
        if (!dragging) return;
        drop.textContent = dragging.textContent;
        drop.dataset.got = dragging.dataset.id;
        drop.classList.add("filled");
        dragging.remove();
        dragging = null;
      };
      drop.onclick = () => {
        // click-to-place fallback: pick first chip
        const chip = body.querySelector(".code-chip");
        if (!chip) return;
        drop.textContent = chip.textContent;
        drop.dataset.got = chip.dataset.id;
        drop.classList.add("filled");
        chip.remove();
      };
    });
    body.querySelector("#cut-check").onclick = () => {
      const ok = [...body.querySelectorAll(".rx-drop")].every((d) => d.dataset.got === d.dataset.need);
      finish(ok);
    };
  }

  function gameEPin(body, game, finish) {
    const pin = String(1000 + Math.floor(Math.random() * 9000));
    // store expected in closure; show scrambled hint
    body.innerHTML = `
      <p>Receta <strong>${game.receta?.numero || "RE-XXXX"}</strong></p>
      <p class="muted">PIN enviado al TPV (memoriza): <strong id="pin-flash">${pin}</strong></p>
      <input id="pin-input" type="text" maxlength="4" placeholder="PIN de 4 dígitos" />
      <button type="button" class="btn btn-primary" id="pin-ok">Validar</button>`;
    setTimeout(() => { const el = body.querySelector("#pin-flash"); if (el) el.textContent = "••••"; }, 1600);
    body.querySelector("#pin-ok").onclick = () => {
      finish(body.querySelector("#pin-input").value.trim() === pin);
    };
  }

  function gameFirma(body, finish) {
    body.innerHTML = `
      <p>Firma en el recuadro (mantén pulsado y dibuja)</p>
      <canvas id="firma-cv" width="420" height="140"></canvas>
      <div class="actions-row">
        <button type="button" class="btn" id="firma-clear">Borrar</button>
        <button type="button" class="btn btn-primary" id="firma-ok">Firmar</button>
      </div>`;
    const cv = body.querySelector("#firma-cv");
    const ctx = cv.getContext("2d");
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    let drawing = false, points = 0;
    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return { x: x * (cv.width / r.width), y: y * (cv.height / r.height) };
    };
    const start = (e) => { e.preventDefault(); drawing = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = (e) => { if (!drawing) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); points++; };
    const end = () => { drawing = false; };
    cv.onmousedown = start; cv.onmousemove = move; cv.onmouseup = end; cv.onmouseleave = end;
    cv.ontouchstart = start; cv.ontouchmove = move; cv.ontouchend = end;
    body.querySelector("#firma-clear").onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); points = 0; };
    body.querySelector("#firma-ok").onclick = () => {
      Sounds().beepFirma?.();
      finish(points > 25);
    };
  }

  function gameContar(body, finish) {
    const n = 6 + Math.floor(Math.random() * 10);
    let pills = "";
    for (let i = 0; i < n; i++) pills += `<span class="pill">💊</span>`;
    body.innerHTML = `
      <div class="blister">${pills}</div>
      <label class="lbl">¿Cuántos hay?</label>
      <input id="count-in" type="number" min="1" max="30" />
      <button type="button" class="btn btn-primary" id="count-ok">Comprobar</button>`;
    body.querySelector("#count-ok").onclick = () => finish(Number(body.querySelector("#count-in").value) === n);
  }

  function gameNevera(body, finish) {
    let temp = 12;
    body.innerHTML = `
      <div class="temp-gauge"><strong id="temp-val">${temp.toFixed(1)} °C</strong><div class="muted">Objetivo: 2–8 °C</div></div>
      <input id="temp-range" type="range" min="-2" max="20" step="0.5" value="${temp}" />
      <button type="button" class="btn btn-primary" id="temp-ok">Confirmar temperatura</button>`;
    const range = body.querySelector("#temp-range");
    const label = body.querySelector("#temp-val");
    range.oninput = () => { label.textContent = Number(range.value).toFixed(1) + " °C"; };
    body.querySelector("#temp-ok").onclick = () => {
      const t = Number(range.value);
      finish(t >= 2 && t <= 8);
    };
  }

  function gameCaducidad(body, finish) {
    const items = shuffle([
      { id: "g", label: "Verde (ok)", color: "#16a34a" },
      { id: "o", label: "Naranja (pronto)", color: "#f59e0b" },
      { id: "r", label: "Rojo (crítico)", color: "#dc2626" },
    ], Math.random);
    body.innerHTML = `
      <p>Haz clic en orden: <strong>verde → naranja → rojo</strong></p>
      <div class="cad-row">${items.map((i) => `<button type="button" class="cad-chip" data-id="${i.id}" style="background:${i.color}">${i.label}</button>`).join("")}</div>
      <div class="muted" id="cad-prog">Selecciona…</div>`;
    const need = ["g", "o", "r"];
    let i = 0;
    body.querySelectorAll(".cad-chip").forEach((btn) => {
      btn.onclick = () => {
        if (btn.dataset.id === need[i]) {
          btn.disabled = true;
          i++;
          body.querySelector("#cad-prog").textContent = i >= 3 ? "¡Bien!" : `Siguiente… (${i}/3)`;
          if (i >= 3) finish(true);
        } else finish(false);
      };
    });
  }

  function gameDni(body, game, finish) {
    const dni = String(game.dni || "12345678Z").toUpperCase();
    const wrong = shuffle((dni + "ABCDEFGH").split(""), Math.random).slice(0, 10);
    const pool = shuffle([...new Set((dni + wrong.join("")).split(""))], Math.random).slice(0, 12);
    body.innerHTML = `
      <p>DNI objetivo: <strong>${dni[0]}•••${dni.slice(-2)}</strong> (completa todos los caracteres)</p>
      <div class="dni-out" id="dni-out"></div>
      <div class="dni-keys">${pool.map((ch) => `<button type="button" class="btn btn-sm dni-key" data-ch="${ch}">${ch}</button>`).join("")}</div>`;
    let built = "";
    const out = body.querySelector("#dni-out");
    body.querySelectorAll(".dni-key").forEach((b) => {
      b.onclick = () => {
        built += b.dataset.ch;
        out.textContent = built;
        if (built.length >= dni.length) finish(built === dni);
      };
    });
  }

  function gameBolsa(body, game, finish) {
    const lineas = (game.lineas || []).slice(0, 5);
    if (!lineas.length) return finish(true);
    body.innerHTML = `
      <div class="bag-board">
        <div class="bag bag-cold" data-bag="cold"><strong>❄ Frío</strong><div class="bag-drop" id="bag-cold"></div></div>
        <div class="bag bag-norm" data-bag="norm"><strong>🛍 Normal</strong><div class="bag-drop" id="bag-norm"></div></div>
      </div>
      <div class="bag-items" id="bag-items">${lineas.map((l, idx) => `<button type="button" class="btn btn-sm bag-item" data-idx="${idx}" data-cold="${l.nevera ? 1 : 0}">${l.icon || "💊"} ${l.nombre}</button>`).join("")}</div>
      <p class="muted">Haz clic en el producto y luego en la bolsa correcta.</p>
      <button type="button" class="btn btn-primary" id="bag-ok">Comprobar</button>`;
    let selected = null;
    const placed = {};
    body.querySelectorAll(".bag-item").forEach((it) => {
      it.onclick = () => { selected = it; body.querySelectorAll(".bag-item").forEach((x) => x.classList.remove("active")); it.classList.add("active"); };
    });
    body.querySelectorAll(".bag").forEach((bag) => {
      bag.onclick = () => {
        if (!selected) return;
        const drop = bag.querySelector(".bag-drop");
        drop.appendChild(selected);
        placed[selected.dataset.idx] = bag.dataset.bag;
        selected.classList.remove("active");
        selected = null;
      };
    });
    body.querySelector("#bag-ok").onclick = () => {
      let ok = true;
      body.querySelectorAll(".bag-item").forEach((it) => {
        const need = it.dataset.cold === "1" ? "cold" : "norm";
        if (placed[it.dataset.idx] !== need) ok = false;
      });
      // all must be placed
      if (Object.keys(placed).length < lineas.length) ok = false;
      finish(ok);
    };
  }

  function gameCambio(body, game, finish) {
    const target = Math.round((game.cambio || 1.25) * 100) / 100;
    const coins = [2, 1, 0.5, 0.2, 0.1, 0.05];
    let sum = 0;
    body.innerHTML = `
      <p>Cambio a dar: <strong>${target.toFixed(2)} €</strong></p>
      <div class="cambio-sum" id="csum">0.00 €</div>
      <div class="dni-keys">${coins.map((c) => `<button type="button" class="btn btn-sm coin-add" data-v="${c}">+ ${c.toFixed(2)} €</button>`).join("")}
        <button type="button" class="btn btn-sm" id="creset">Reset</button>
      </div>
      <button type="button" class="btn btn-primary" id="cok">Listo</button>`;
    const sumEl = body.querySelector("#csum");
    const upd = () => { sumEl.textContent = sum.toFixed(2) + " €"; };
    body.querySelectorAll(".coin-add").forEach((b) => {
      b.onclick = () => { sum = Math.round((sum + Number(b.dataset.v)) * 100) / 100; upd(); };
    });
    body.querySelector("#creset").onclick = () => { sum = 0; upd(); };
    body.querySelector("#cok").onclick = () => finish(Math.abs(sum - target) < 0.009);
  }

  function gameEstante(body, game, finish) {
    const correct = game.product?.categoria || "Digestivo OTC";
    const cats = (game.categorias || []).map((c) => c.nombre || c).filter(Boolean);
    let options = shuffle([correct, ...cats.filter((c) => c !== correct)], Math.random).slice(0, 4);
    if (!options.includes(correct)) options[0] = correct;
    options = shuffle(options, Math.random);
    body.innerHTML = `
      <p>¿Dónde va <strong>${game.product?.nombre || "este producto"}</strong>?</p>
      <div class="dni-keys">${options.map((o) => `<button type="button" class="btn btn-sm shelf-btn" data-v="${o}">${o}</button>`).join("")}</div>`;
    body.querySelectorAll(".shelf-btn").forEach((b) => {
      b.onclick = () => finish(b.dataset.v === correct);
    });
  }

  function gameSello(body, game, finish) {
    const need = game.tipo === "papel" ? "papel" : "electronica";
    body.innerHTML = `
      <p>Elige el sello correcto para esta receta (<strong>${need}</strong>)</p>
      <div class="dni-keys">
        <button type="button" class="btn sello-btn" data-v="papel">📄 Sello PAPEL</button>
        <button type="button" class="btn sello-btn" data-v="electronica">💻 Sello ELECTRÓNICA</button>
        <button type="button" class="btn sello-btn" data-v="anulado">❌ Anulado</button>
      </div>`;
    body.querySelectorAll(".sello-btn").forEach((b) => {
      b.onclick = () => finish(b.dataset.v === need);
    });
  }

  function gameGenerico(body, game, finish) {
    const correct = game.product?.nombre || "Genérico EFG";
    let opts = (game.opciones || []).map((o) => o.nombre || o).filter(Boolean);
    if (opts.length < 2) opts = [correct, "Otro principio distinto", "Vitamina C 1g", "Suero fisiológico"];
    if (!opts.includes(correct)) opts[0] = correct;
    opts = shuffle([...new Set(opts)], Math.random).slice(0, 4);
    if (!opts.includes(correct)) opts[0] = correct;
    opts = shuffle(opts, Math.random);
    body.innerHTML = `
      <p>Mismo principio activo que <strong>${game.product?.principioActivo || "el prescrito"}</strong>:</p>
      <div class="dni-keys">${opts.map((o) => `<button type="button" class="btn btn-sm shelf-btn" data-v="${o.replace(/"/g, "")}">${o}</button>`).join("")}</div>`;
    body.querySelectorAll(".shelf-btn").forEach((b) => {
      b.onclick = () => finish(b.dataset.v === correct);
    });
  }

  function gameLavado(body, finish) {
    const steps = shuffle([
      { id: 1, t: "Mojar" }, { id: 2, t: "Jabón" }, { id: 3, t: "Frotar 20s" }, { id: 4, t: "Aclarar" }, { id: 5, t: "Secar" },
    ], Math.random);
    body.innerHTML = `
      <p>Orden correcto de higiene de manos (1→5)</p>
      <div class="cad-row">${steps.map((s) => `<button type="button" class="cad-chip lav-step" data-id="${s.id}" style="background:#0ea5e9">${s.t}</button>`).join("")}</div>
      <div class="muted" id="lav-prog">Selecciona el 1.º…</div>`;
    let need = 1;
    body.querySelectorAll(".lav-step").forEach((btn) => {
      btn.onclick = () => {
        if (Number(btn.dataset.id) === need) {
          btn.disabled = true; need++;
          body.querySelector("#lav-prog").textContent = need > 5 ? "¡Correcto!" : `Siguiente: paso ${need}`;
          if (need > 5) finish(true);
        } else finish(false);
      };
    });
  }

  function gameAlergia(body, game, finish) {
    const real = (game.alergias && game.alergias[0]) || "penicilina";
    const opts = shuffle([real, "ninguna", "látex", "yodo", "marisco"].filter((x, i, a) => a.indexOf(x) === i), Math.random);
    body.innerHTML = `
      <p>Pregunta al paciente: <em>«¿Tiene alguna alergia a medicamentos?»</em></p>
      <p class="muted">Respuesta correcta según ficha: <strong>${real}</strong></p>
      <div class="dni-keys">${opts.map((o) => `<button type="button" class="btn btn-sm" data-v="${o}">${o}</button>`).join("")}</div>`;
    body.querySelectorAll("button[data-v]").forEach((b) => {
      b.onclick = () => finish(b.dataset.v === real);
    });
  }

  function gamePesar(body, game, finish) {
    const target = game.gramos || 30;
    body.innerHTML = `
      <p>Dosifica <strong>${target} g</strong> de pomada</p>
      <input id="peso-r" type="range" min="5" max="80" value="10" />
      <div class="temp-gauge"><strong id="peso-v">10 g</strong></div>
      <button type="button" class="btn btn-primary" id="peso-ok">Confirmar</button>`;
    const r = body.querySelector("#peso-r");
    const v = body.querySelector("#peso-v");
    r.oninput = () => { v.textContent = r.value + " g"; };
    body.querySelector("#peso-ok").onclick = () => finish(Math.abs(Number(r.value) - target) <= 2);
  }

  function gameTriage(body, game, finish) {
    const urg = !!game.urgencia;
    body.innerHTML = `
      <p>El cliente dice: <strong>${urg ? "Me cuesta mucho respirar y tengo dolor en el pecho" : "Quiero un protector solar y chicles"}</strong></p>
      <div class="dni-keys">
        <button type="button" class="btn btn-accent" data-v="urgencia">🚨 Derivación / urgencias</button>
        <button type="button" class="btn btn-primary" data-v="normal">🛒 Venta normal</button>
      </div>`;
    body.querySelectorAll("button[data-v]").forEach((b) => {
      b.onclick = () => finish((b.dataset.v === "urgencia") === urg);
    });
  }

  global.FarmaciaMinijuegos = {
    DEFS,
    pickGamesForSale,
    runGame,
    barcodeSvg,
  };
})(typeof window !== "undefined" ? window : globalThis);
