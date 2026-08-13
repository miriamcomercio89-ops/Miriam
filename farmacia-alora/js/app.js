/**
 * Farmacia Álora — simulador de práctica (catálogo / mostrador digital)
 * Escala temporal: 1 minuto real = 1 hora de juego
 */
(function () {
  "use strict";

  const STORAGE_KEY = "farmacia-alora-v1";
  const REAL_MS_PER_GAME_HOUR = 60 * 1000; // 1 min real = 1 h juego
  const IVA_LABEL = { 4: "IVA 4%", 10: "IVA 10%", 21: "IVA 21%" };

  const MUTUAS = [
    { id: "particular", nombre: "Particular (sin mutua)", cobertura: 0 },
    { id: "ss", nombre: "Seguridad Social (SNS)", cobertura: 0.6 },
    { id: "adeslas", nombre: "Adeslas", cobertura: 0.5 },
    { id: "sanitas", nombre: "Sanitas", cobertura: 0.5 },
    { id: "asisa", nombre: "Asisa", cobertura: 0.45 },
    { id: "dkv", nombre: "DKV", cobertura: 0.5 },
    { id: "mapfre", nombre: "Mapfre", cobertura: 0.4 },
    { id: "caser", nombre: "Caser", cobertura: 0.4 },
    { id: "axa", nombre: "AXA Health", cobertura: 0.35 },
  ];

  const NOMBRES = [
    "María García", "Antonio López", "Carmen Martínez", "José Sánchez", "Ana Rodríguez",
    "Manuel Fernández", "Laura Gómez", "Francisco Díaz", "Elena Ruiz", "David Moreno",
    "Isabel Jiménez", "Javier Muñoz", "Lucía Álvarez", "Pedro Romero", "Sara Navarro",
    "Miguel Torres", "Paula Domínguez", "Carlos Vázquez", "Marta Gil", "Raúl Serrano",
    "Nuria Ramos", "Alberto Castro", "Cristina Ortega", "Jorge Delgado", "Patricia Rubio",
  ];

  const MEDICOS = [
    { nombre: "Dra. Elena Vargas", colegiado: "29/28451" },
    { nombre: "Dr. Pablo Herrera", colegiado: "29/19302" },
    { nombre: "Dra. Sofía Mendoza", colegiado: "29/31044" },
    { nombre: "Dr. Luis Cabrera", colegiado: "29/15788" },
    { nombre: "Dra. Inés Molina", colegiado: "29/27601" },
  ];

  /** @type {any} */
  let state;
  /** @type {any[]} */
  let productos = [];
  let catalogMeta = null;
  let clockTimer = null;
  let lastFrame = 0;
  let searchTimer = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function euro(n) {
    return (Number(n) || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatGameDate(ms) {
    const d = new Date(ms);
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return `${dias[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function formatShort(ms) {
    const d = new Date(ms);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a * 1664525 + 1013904223) >>> 0;
      return a / 4294967296;
    };
  }

  function pick(r, arr) {
    return arr[Math.floor(r() * arr.length)];
  }

  function genDNI(r) {
    const num = Math.floor(10000000 + r() * 89999999);
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    return String(num) + letras[num % 23];
  }

  function genRecetaNum(r, fechaMs) {
    const d = new Date(fechaMs);
    return `RE-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(100000 + r() * 899999)}`;
  }

  /* -------------------- Persistencia -------------------- */
  function defaultState(productosList) {
    const stock = {};
    for (const p of productosList) stock[p.id] = p.stockInicial ?? p.stock;
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    return {
      version: 1,
      gameEpochReal: Date.now(),
      gameTimeMs: start.getTime(),
      paused: false,
      stock,
      cart: [],
      recetaActiva: null,
      mutuaId: "particular",
      descuentoPct: 0,
      clienteActual: { nombre: "", dni: "", telefono: "" },
      cola: [],
      ventas: [],
      recetasValidadas: [],
      stats: { tickets: 0, facturacion: 0, recetas: 0 },
      nextCustomerAt: start.getTime() + 20 * 60 * 1000,
      settings: {
        horarioManana: [9, 14],
        horarioTarde: [17, 20.5],
        abiertoSabadoManana: true,
      },
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: state.version,
        gameEpochReal: state.gameEpochReal,
        gameTimeMs: state.gameTimeMs,
        paused: state.paused,
        stock: state.stock,
        cart: state.cart,
        recetaActiva: state.recetaActiva,
        mutuaId: state.mutuaId,
        descuentoPct: state.descuentoPct,
        clienteActual: state.clienteActual,
        cola: state.cola,
        ventas: state.ventas.slice(-500),
        recetasValidadas: state.recetasValidadas.slice(-200),
        stats: state.stats,
        nextCustomerAt: state.nextCustomerAt,
        settings: state.settings,
      }));
    } catch (e) {
      console.warn("No se pudo guardar", e);
    }
  }

  function load(productosList) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState(productosList);
      const data = JSON.parse(raw);
      const base = defaultState(productosList);
      return {
        ...base,
        ...data,
        stock: { ...base.stock, ...(data.stock || {}) },
        cart: data.cart || [],
        cola: data.cola || [],
        ventas: data.ventas || [],
        settings: { ...base.settings, ...(data.settings || {}) },
      };
    } catch {
      return defaultState(productosList);
    }
  }

  /* -------------------- Reloj -------------------- */
  function isOpenAt(ms) {
    const d = new Date(ms);
    const day = d.getDay();
    const hour = d.getHours() + d.getMinutes() / 60;
    const { horarioManana: m, horarioTarde: t, abiertoSabadoManana } = state.settings;
    if (day === 0) return false;
    if (day === 6) return abiertoSabadoManana && hour >= m[0] && hour < m[1];
    return (hour >= m[0] && hour < m[1]) || (hour >= t[0] && hour < t[1]);
  }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    const dt = Math.min(1000, now - lastFrame);
    lastFrame = now;
    if (!state.paused) {
      const gameAdvance = (dt / REAL_MS_PER_GAME_HOUR) * 60 * 60 * 1000;
      state.gameTimeMs += gameAdvance;
      maybeSpawnCustomer();
      if (Math.floor(now / 5000) !== Math.floor((now - dt) / 5000)) save();
    }
    renderClock();
    clockTimer = requestAnimationFrame(tick);
  }

  function renderClock() {
    const open = isOpenAt(state.gameTimeMs);
    $("#game-clock").textContent = formatGameDate(state.gameTimeMs);
    const badge = $("#open-badge");
    badge.textContent = open ? "Abierta" : "Cerrada";
    badge.className = "badge " + (open ? "badge-ok" : "badge-warn");
    $("#pause-btn").textContent = state.paused ? "▶ Reanudar" : "⏸ Pausar";
  }

  /* -------------------- Clientes / pedidos -------------------- */
  function maybeSpawnCustomer() {
    if (state.gameTimeMs < state.nextCustomerAt) return;
    if (!isOpenAt(state.gameTimeMs)) {
      state.nextCustomerAt = state.gameTimeMs + 30 * 60 * 1000;
      return;
    }
    if (state.cola.length >= 8) {
      state.nextCustomerAt = state.gameTimeMs + 15 * 60 * 1000;
      return;
    }
    state.cola.push(crearPedido());
    const r = rng(Math.floor(state.gameTimeMs) ^ state.cola.length);
    state.nextCustomerAt = state.gameTimeMs + (8 + Math.floor(r() * 25)) * 60 * 1000;
    renderCola();
    save();
  }

  function crearPedido() {
    const r = rng((Math.random() * 1e9) ^ Date.now());
    const nombre = pick(r, NOMBRES);
    const dni = genDNI(r);
    const conReceta = r() < 0.45;
    const nItems = 1 + Math.floor(r() * 4);
    const items = [];
    const pool = conReceta
      ? productos.filter((p) => p.requiereReceta && (state.stock[p.id] || 0) > 0)
      : productos.filter((p) => !p.requiereReceta && (state.stock[p.id] || 0) > 0);

    const fallback = productos.filter((p) => (state.stock[p.id] || 0) > 0);
    const source = pool.length ? pool : fallback;

    for (let i = 0; i < nItems && source.length; i++) {
      const p = pick(r, source);
      if (items.some((x) => x.productId === p.id)) continue;
      items.push({
        productId: p.id,
        nombre: p.nombre,
        cantidad: 1 + (r() < 0.15 ? 1 : 0),
        requiereReceta: p.requiereReceta,
        controlado: p.controlado,
      });
    }

    let receta = null;
    if (items.some((i) => i.requiereReceta)) {
      const med = pick(r, MEDICOS);
      const emitida = state.gameTimeMs - Math.floor(r() * 10) * 24 * 60 * 60 * 1000;
      const validezDias = items.some((i) => i.controlado) ? 10 : 30;
      receta = {
        numero: genRecetaNum(r, emitida),
        tipo: r() < 0.7 ? "electronica" : "papel",
        pacienteNombre: nombre,
        pacienteDni: dni,
        medico: med.nombre,
        colegiado: med.colegiado,
        fechaEmision: emitida,
        validezDias,
        productos: items.filter((i) => i.requiereReceta).map((i) => ({
          productId: i.productId,
          nombre: i.nombre,
          cantidad: i.cantidad,
          controlado: i.controlado,
        })),
        dispensada: false,
        observaciones: items.some((i) => i.controlado)
          ? "Psicótropo/estupefaciente: verificar identidad y libro de control."
          : "",
      };
    }

    return {
      id: "ped-" + Date.now().toString(36) + Math.floor(r() * 1000),
      llegada: state.gameTimeMs,
      cliente: { nombre, dni, telefono: "6" + Math.floor(10000000 + r() * 89999999) },
      items,
      receta,
      mutuaId: pick(r, MUTUAS).id,
      estado: "en_cola",
      notas: conReceta ? "Trae receta médica" : "Pedido sin receta",
    };
  }

  /* -------------------- Recetas -------------------- */
  function recetaVigente(receta, ahora) {
    if (!receta) return { ok: false, motivo: "No hay receta" };
    const fin = receta.fechaEmision + receta.validezDias * 24 * 60 * 60 * 1000;
    if (ahora > fin) return { ok: false, motivo: "Receta caducada" };
    if (receta.dispensada) return { ok: false, motivo: "Receta ya dispensada" };
    if (!receta.numero || !receta.pacienteDni || !receta.medico || !receta.colegiado) {
      return { ok: false, motivo: "Datos incompletos de receta" };
    }
    if (!/^[0-9]{8}[A-Z]$/i.test(receta.pacienteDni) && !/^[XYZ][0-9]{7}[A-Z]$/i.test(receta.pacienteDni)) {
      return { ok: false, motivo: "DNI/NIE del paciente no válido" };
    }
    return { ok: true, motivo: "Receta válida" };
  }

  function validarDispensacion() {
    const necesita = state.cart.filter((l) => {
      const p = productos.find((x) => x.id === l.productId);
      return p && p.requiereReceta;
    });
    if (!necesita.length) return { ok: true, warnings: [] };

    const receta = state.recetaActiva;
    const vig = recetaVigente(receta, state.gameTimeMs);
    if (!vig.ok) return { ok: false, motivo: vig.motivo, warnings: [] };

    if (state.clienteActual.dni && receta.pacienteDni.toUpperCase() !== state.clienteActual.dni.toUpperCase()) {
      return { ok: false, motivo: "El DNI del cliente no coincide con el de la receta", warnings: [] };
    }

    const warnings = [];
    for (const linea of necesita) {
      const p = productos.find((x) => x.id === linea.productId);
      const enReceta = receta.productos.find((rp) =>
        rp.productId === linea.productId ||
        (rp.nombre && p && rp.nombre.toLowerCase().includes(p.principioActivo.toLowerCase().slice(0, 8)))
      );
      if (!enReceta) {
        return { ok: false, motivo: `"${p.nombre}" no figura en la receta activa`, warnings };
      }
      if (linea.cantidad > enReceta.cantidad) {
        return { ok: false, motivo: `Cantidad de "${p.nombre}" superior a la prescrita (${enReceta.cantidad})`, warnings };
      }
      if (p.controlado) {
        if (receta.tipo !== "electronica" && !receta.observaciones) {
          warnings.push("Medicamento controlado: anote dispensación en libro de estupefacientes.");
        }
        if (!state.clienteActual.dni) {
          return { ok: false, motivo: "Medicamento controlado: DNI del paciente obligatorio", warnings };
        }
      }
    }
    return { ok: true, warnings };
  }

  /* -------------------- Carrito / precios -------------------- */
  function getMutua() {
    return MUTUAS.find((m) => m.id === state.mutuaId) || MUTUAS[0];
  }

  function lineTotals(linea) {
    const p = productos.find((x) => x.id === linea.productId);
    if (!p) return { base: 0, iva: 0, total: 0 };
    const base = p.precio * linea.cantidad;
    const iva = base * (p.iva / 100);
    return { base, iva, total: base + iva, precio: p.precio, ivaPct: p.iva, producto: p };
  }

  function cartTotals() {
    let base = 0;
    let iva = 0;
    for (const l of state.cart) {
      const t = lineTotals(l);
      base += t.base;
      iva += t.iva;
    }
    const bruto = base + iva;
    const descPct = Math.min(100, Math.max(0, Number(state.descuentoPct) || 0));
    const desc = bruto * (descPct / 100);
    const trasDesc = bruto - desc;
    const mutua = getMutua();
    // La mutua solo cubre medicamentos (iva 4%) en este simulador
    let cubierto = 0;
    if (mutua.cobertura > 0) {
      let baseMed = 0;
      for (const l of state.cart) {
        const t = lineTotals(l);
        if (t.ivaPct === 4) baseMed += t.total;
      }
      const medTrasDesc = baseMed * (1 - descPct / 100);
      cubierto = medTrasDesc * mutua.cobertura;
    }
    const aPagar = Math.max(0, trasDesc - cubierto);
    return { base, iva, bruto, descPct, desc, trasDesc, cubierto, aPagar, mutua };
  }

  /* -------------------- Acciones UI -------------------- */
  function addToCart(productId, qty = 1) {
    const p = productos.find((x) => x.id === productId);
    if (!p) return;
    const stock = state.stock[p.id] || 0;
    const existing = state.cart.find((l) => l.productId === productId);
    const newQty = (existing ? existing.cantidad : 0) + qty;
    if (newQty > stock) {
      toast(`Stock insuficiente (${stock} uds.)`, "warn");
      return;
    }
    if (existing) existing.cantidad = newQty;
    else state.cart.push({ productId, cantidad: qty });
    renderCart();
    save();
    toast(`Añadido: ${p.nombre}`, "ok");
  }

  function setCartQty(productId, qty) {
    const line = state.cart.find((l) => l.productId === productId);
    if (!line) return;
    const stock = state.stock[productId] || 0;
    if (qty <= 0) {
      state.cart = state.cart.filter((l) => l.productId !== productId);
    } else if (qty > stock) {
      toast(`Stock máximo: ${stock}`, "warn");
      line.cantidad = stock;
    } else {
      line.cantidad = qty;
    }
    renderCart();
    save();
  }

  function clearCart() {
    state.cart = [];
    renderCart();
    save();
  }

  function cobrar() {
    if (!state.cart.length) {
      toast("El carrito está vacío", "warn");
      return;
    }
    for (const l of state.cart) {
      if ((state.stock[l.productId] || 0) < l.cantidad) {
        toast("Stock insuficiente en algún producto", "warn");
        return;
      }
    }
    const val = validarDispensacion();
    if (!val.ok) {
      toast(val.motivo, "err");
      return;
    }
    for (const w of val.warnings || []) toast(w, "warn");

    const totals = cartTotals();
    const lineas = state.cart.map((l) => {
      const t = lineTotals(l);
      return {
        productId: l.productId,
        nombre: t.producto.nombre,
        cantidad: l.cantidad,
        precio: t.precio,
        iva: t.ivaPct,
        base: t.base,
        total: t.total,
        requiereReceta: t.producto.requiereReceta,
        controlado: t.producto.controlado,
        ean: t.producto.ean,
      };
    });

    const ticket = {
      id: "T-" + Date.now().toString(36).toUpperCase(),
      fechaJuego: state.gameTimeMs,
      fechaReal: Date.now(),
      cliente: { ...state.clienteActual },
      mutua: totals.mutua.nombre,
      mutuaId: totals.mutua.id,
      descuentoPct: totals.descPct,
      descuento: totals.desc,
      coberturaMutua: totals.cubierto,
      base: totals.base,
      iva: totals.iva,
      bruto: totals.bruto,
      total: totals.aPagar,
      lineas,
      receta: state.recetaActiva
        ? {
            numero: state.recetaActiva.numero,
            pacienteDni: state.recetaActiva.pacienteDni,
            medico: state.recetaActiva.medico,
            colegiado: state.recetaActiva.colegiado,
            tipo: state.recetaActiva.tipo,
          }
        : null,
    };

    for (const l of state.cart) {
      state.stock[l.productId] -= l.cantidad;
    }
    if (state.recetaActiva && lineas.some((l) => l.requiereReceta)) {
      state.recetaActiva.dispensada = true;
      state.recetasValidadas.push({ ...state.recetaActiva, ticketId: ticket.id, fecha: state.gameTimeMs });
      state.stats.recetas += 1;
      state.recetaActiva = null;
    }
    state.ventas.push(ticket);
    state.stats.tickets += 1;
    state.stats.facturacion += ticket.total;
    state.cart = [];
    save();
    renderCart();
    renderReceta();
    renderStats();
    renderCatalog();
    mostrarTicket(ticket);
    toast("Venta registrada", "ok");
  }

  /* -------------------- Render -------------------- */
  function toast(msg, type = "ok") {
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function getFilters() {
    return {
      q: ($("#search-q").value || "").trim().toLowerCase(),
      cat: $("#filter-cat").value,
      receta: $("#filter-receta").value,
      marca: ($("#filter-marca").value || "").trim().toLowerCase(),
      pa: ($("#filter-pa").value || "").trim().toLowerCase(),
    };
  }

  function filteredProducts() {
    const f = getFilters();
    return productos.filter((p) => {
      if (f.cat && p.categoria !== f.cat) return false;
      if (f.receta === "con" && !p.requiereReceta) return false;
      if (f.receta === "sin" && p.requiereReceta) return false;
      if (f.receta === "controlado" && !p.controlado) return false;
      if (f.marca && !(p.marca || "").toLowerCase().includes(f.marca)) return false;
      if (f.pa && !(p.principioActivo || "").toLowerCase().includes(f.pa)) return false;
      if (f.q) {
        const blob = `${p.nombre} ${p.marca} ${p.principioActivo} ${p.ean} ${p.sku}`.toLowerCase();
        if (!blob.includes(f.q)) return false;
      }
      return true;
    });
  }

  function renderCatalog() {
    const list = filteredProducts();
    const max = 80;
    const slice = list.slice(0, max);
    $("#catalog-count").textContent = `${list.length.toLocaleString("es-ES")} productos` +
      (list.length > max ? ` (mostrando ${max})` : "");
    const tbody = $("#catalog-body");
    tbody.innerHTML = slice.map((p) => {
      const stock = state.stock[p.id] ?? 0;
      const badges = [
        p.requiereReceta ? '<span class="tag tag-rx">Receta</span>' : '<span class="tag tag-otc">OTC</span>',
        p.controlado ? '<span class="tag tag-ctrl">Controlado</span>' : "",
      ].join("");
      return `<tr data-id="${p.id}">
        <td>
          <div class="prod-name">${escapeHtml(p.nombre)}</div>
          <div class="prod-meta">${escapeHtml(p.marca)} · ${escapeHtml(p.principioActivo)} · ${escapeHtml(p.categoria)}</div>
          <div class="prod-tags">${badges}</div>
        </td>
        <td>${euro(p.precio)} <span class="muted">+${p.iva}%</span></td>
        <td class="${stock < 10 ? "stock-low" : ""}">${stock}</td>
        <td><button class="btn btn-sm btn-primary" data-add="${p.id}">Añadir</button></td>
      </tr>`;
    }).join("") || `<tr><td colspan="4" class="empty">Sin resultados</td></tr>`;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCart() {
    const body = $("#cart-body");
    if (!state.cart.length) {
      body.innerHTML = `<div class="empty">Carrito vacío</div>`;
    } else {
      body.innerHTML = state.cart.map((l) => {
        const t = lineTotals(l);
        const p = t.producto;
        return `<div class="cart-line">
          <div class="cart-line-main">
            <strong>${escapeHtml(p.nombre)}</strong>
            <span class="muted">${euro(p.precio)} · ${p.requiereReceta ? "Receta" : "OTC"}</span>
          </div>
          <div class="cart-line-actions">
            <button class="btn btn-icon" data-dec="${p.id}">−</button>
            <span>${l.cantidad}</span>
            <button class="btn btn-icon" data-inc="${p.id}">+</button>
            <button class="btn btn-icon danger" data-rem="${p.id}">✕</button>
          </div>
          <div class="cart-line-total">${euro(t.total)}</div>
        </div>`;
      }).join("");
    }
    const tot = cartTotals();
    $("#tot-base").textContent = euro(tot.base);
    $("#tot-iva").textContent = euro(tot.iva);
    $("#tot-desc").textContent = euro(tot.desc);
    $("#tot-mutua").textContent = euro(tot.cubierto);
    $("#tot-pagar").textContent = euro(tot.aPagar);
    $("#mutua-label").textContent = tot.mutua.nombre;
  }

  function renderReceta() {
    const box = $("#receta-panel");
    const r = state.recetaActiva;
    if (!r) {
      box.innerHTML = `<p class="muted">No hay receta activa. Cárgala desde un pedido o créala manualmente.</p>`;
      $("#receta-status").textContent = "Sin receta";
      $("#receta-status").className = "badge badge-muted";
      return;
    }
    const vig = recetaVigente(r, state.gameTimeMs);
    $("#receta-status").textContent = vig.ok ? "Válida" : vig.motivo;
    $("#receta-status").className = "badge " + (vig.ok ? "badge-ok" : "badge-err");
    box.innerHTML = `
      <div class="receta-grid">
        <div><span class="lbl">Nº</span> ${escapeHtml(r.numero)}</div>
        <div><span class="lbl">Tipo</span> ${r.tipo === "electronica" ? "Electrónica" : "Papel"}</div>
        <div><span class="lbl">Paciente</span> ${escapeHtml(r.pacienteNombre)} (${escapeHtml(r.pacienteDni)})</div>
        <div><span class="lbl">Médico</span> ${escapeHtml(r.medico)} · Col. ${escapeHtml(r.colegiado)}</div>
        <div><span class="lbl">Emisión</span> ${formatShort(r.fechaEmision)}</div>
        <div><span class="lbl">Validez</span> ${r.validezDias} días</div>
      </div>
      <ul class="receta-items">
        ${r.productos.map((p) => `<li>${escapeHtml(p.nombre)} × ${p.cantidad}${p.controlado ? ' <span class="tag tag-ctrl">Controlado</span>' : ""}</li>`).join("")}
      </ul>
      ${r.observaciones ? `<p class="warn-text">${escapeHtml(r.observaciones)}</p>` : ""}
    `;
  }

  function renderCola() {
    const el = $("#cola-list");
    if (!state.cola.length) {
      el.innerHTML = `<div class="empty">No hay clientes en cola</div>`;
      $("#cola-count").textContent = "0";
      return;
    }
    $("#cola-count").textContent = String(state.cola.length);
    el.innerHTML = state.cola.map((ped, idx) => `
      <article class="pedido-card" data-ped="${ped.id}">
        <header>
          <strong>${escapeHtml(ped.cliente.nombre)}</strong>
          <span class="muted">${formatShort(ped.llegada)}</span>
        </header>
        <p class="muted">${escapeHtml(ped.notas)} · ${ped.items.length} artículo(s)</p>
        <ul>${ped.items.slice(0, 4).map((i) => `<li>${escapeHtml(i.nombre)}${i.requiereReceta ? " ℞" : ""}</li>`).join("")}</ul>
        <div class="pedido-actions">
          <button class="btn btn-sm btn-primary" data-atender="${ped.id}">Atender</button>
          <button class="btn btn-sm" data-descartar="${ped.id}">Descartar</button>
        </div>
        ${idx === 0 ? '<span class="tag">Siguiente</span>' : ""}
      </article>
    `).join("");
  }

  function renderStats() {
    $("#stat-tickets").textContent = String(state.stats.tickets);
    $("#stat-fact").textContent = euro(state.stats.facturacion);
    $("#stat-recetas").textContent = String(state.stats.recetas);
    $("#stat-catalog").textContent = productos.length.toLocaleString("es-ES");
  }

  function renderMutuas() {
    const sel = $("#mutua-select");
    sel.innerHTML = MUTUAS.map((m) =>
      `<option value="${m.id}">${m.nombre}${m.cobertura ? ` (−${Math.round(m.cobertura * 100)}% med.)` : ""}</option>`
    ).join("");
    sel.value = state.mutuaId;
  }

  function renderCategorias() {
    const sel = $("#filter-cat");
    const cats = catalogMeta.categorias.slice().sort((a, b) => a.localeCompare(b, "es"));
    sel.innerHTML = `<option value="">Todas las categorías</option>` +
      cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  function atenderPedido(id) {
    const ped = state.cola.find((p) => p.id === id);
    if (!ped) return;
    state.clienteActual = { ...ped.cliente };
    state.mutuaId = ped.mutuaId || "particular";
    state.cart = [];
    for (const item of ped.items) {
      const stock = state.stock[item.productId] || 0;
      if (stock >= item.cantidad) {
        state.cart.push({ productId: item.productId, cantidad: item.cantidad });
      } else if (stock > 0) {
        state.cart.push({ productId: item.productId, cantidad: stock });
        toast(`Stock parcial para ${item.nombre}`, "warn");
      } else {
        toast(`Sin stock: ${item.nombre}`, "warn");
      }
    }
    if (ped.receta) {
      state.recetaActiva = { ...ped.receta, productos: ped.receta.productos.map((x) => ({ ...x })) };
    } else {
      state.recetaActiva = null;
    }
    state.cola = state.cola.filter((p) => p.id !== id);
    $("#cliente-nombre").value = state.clienteActual.nombre || "";
    $("#cliente-dni").value = state.clienteActual.dni || "";
    $("#cliente-tel").value = state.clienteActual.telefono || "";
    $("#descuento-pct").value = state.descuentoPct;
    renderMutuas();
    renderCart();
    renderReceta();
    renderCola();
    save();
    toast(`Atendiendo a ${ped.cliente.nombre}`, "ok");
    showTab("venta");
  }

  function mostrarTicket(ticket) {
    const el = $("#ticket-content");
    el.innerHTML = `
      <div class="ticket-paper" id="ticket-print-area">
        <h2>Farmacia Álora</h2>
        <p class="muted">Simulador de práctica · Álora</p>
        <p><strong>Ticket:</strong> ${ticket.id}<br>
        <strong>Fecha (juego):</strong> ${formatShort(ticket.fechaJuego)}</p>
        <p><strong>Cliente:</strong> ${escapeHtml(ticket.cliente.nombre || "—")}<br>
        <strong>DNI:</strong> ${escapeHtml(ticket.cliente.dni || "—")}</p>
        ${ticket.receta ? `<p><strong>Receta:</strong> ${escapeHtml(ticket.receta.numero)} · ${escapeHtml(ticket.receta.medico)}</p>` : ""}
        <table class="ticket-table">
          <thead><tr><th>Producto</th><th>Ud</th><th>Importe</th></tr></thead>
          <tbody>
            ${ticket.lineas.map((l) => `<tr>
              <td>${escapeHtml(l.nombre)}<br><span class="muted">IVA ${l.iva}%${l.requiereReceta ? " · ℞" : ""}</span></td>
              <td>${l.cantidad}</td>
              <td>${euro(l.total)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
        <div class="ticket-totals">
          <div><span>Base</span><span>${euro(ticket.base)}</span></div>
          <div><span>IVA</span><span>${euro(ticket.iva)}</span></div>
          <div><span>Descuento (${ticket.descuentoPct}%)</span><span>−${euro(ticket.descuento)}</span></div>
          <div><span>Mutua (${escapeHtml(ticket.mutua)})</span><span>−${euro(ticket.coberturaMutua)}</span></div>
          <div class="grand"><span>TOTAL</span><span>${euro(ticket.total)}</span></div>
        </div>
        <p class="muted tiny">Documento simulado · No válido como factura real · No constituye consejo médico.</p>
      </div>
    `;
    showTab("ticket");
  }

  function exportCSV() {
    if (!state.ventas.length) {
      toast("No hay ventas para exportar", "warn");
      return;
    }
    const rows = [["ticket_id", "fecha_juego", "cliente", "dni", "mutua", "producto", "ean", "cantidad", "precio", "iva", "linea_total", "ticket_total", "receta"]];
    for (const v of state.ventas) {
      for (const l of v.lineas) {
        rows.push([
          v.id,
          formatShort(v.fechaJuego),
          v.cliente.nombre || "",
          v.cliente.dni || "",
          v.mutua,
          l.nombre,
          l.ean,
          l.cantidad,
          l.precio.toFixed(2),
          l.iva,
          l.total.toFixed(2),
          v.total.toFixed(2),
          v.receta ? v.receta.numero : "",
        ]);
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `farmacia-alora-ventas-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("CSV exportado", "ok");
  }

  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
  }

  function openRecetaModal(prefill) {
    const m = $("#modal-receta");
    $("#rx-numero").value = prefill?.numero || genRecetaNum(Math.random, state.gameTimeMs);
    $("#rx-tipo").value = prefill?.tipo || "electronica";
    $("#rx-paciente").value = prefill?.pacienteNombre || state.clienteActual.nombre || "";
    $("#rx-dni").value = prefill?.pacienteDni || state.clienteActual.dni || "";
    $("#rx-medico").value = prefill?.medico || MEDICOS[0].nombre;
    $("#rx-colegiado").value = prefill?.colegiado || MEDICOS[0].colegiado;
    const em = prefill?.fechaEmision ? new Date(prefill.fechaEmision) : new Date(state.gameTimeMs);
    $("#rx-fecha").value = `${em.getFullYear()}-${pad(em.getMonth() + 1)}-${pad(em.getDate())}`;
    $("#rx-validez").value = prefill?.validezDias || 30;
    $("#rx-obs").value = prefill?.observaciones || "";
    // Productos del carrito con receta como base
    const rxItems = (prefill?.productos) || state.cart
      .map((l) => {
        const p = productos.find((x) => x.id === l.productId);
        return p && p.requiereReceta ? { productId: p.id, nombre: p.nombre, cantidad: l.cantidad, controlado: p.controlado } : null;
      })
      .filter(Boolean);
    $("#rx-productos").value = rxItems.map((p) => `${p.productId}|${p.cantidad}`).join("\n");
    $("#rx-hint").textContent = "Formato por línea: idProducto|cantidad  (usa los ID del catálogo o deja las líneas del carrito ℞)";
    m.classList.add("open");
  }

  function saveRecetaModal() {
    const numero = $("#rx-numero").value.trim();
    const pacienteDni = $("#rx-dni").value.trim().toUpperCase();
    const pacienteNombre = $("#rx-paciente").value.trim();
    const medico = $("#rx-medico").value.trim();
    const colegiado = $("#rx-colegiado").value.trim();
    const tipo = $("#rx-tipo").value;
    const validezDias = Number($("#rx-validez").value) || 30;
    const fechaStr = $("#rx-fecha").value;
    const fechaEmision = fechaStr ? new Date(fechaStr + "T12:00:00").getTime() : state.gameTimeMs;
    const observaciones = $("#rx-obs").value.trim();

    const productosRx = [];
    const lines = $("#rx-productos").value.trim().split("\n").filter(Boolean);
    for (const line of lines) {
      const [idStr, qtyStr] = line.split("|").map((s) => s.trim());
      const pid = Number(idStr);
      const p = productos.find((x) => x.id === pid);
      if (!p) {
        toast(`Producto ID ${idStr} no encontrado`, "err");
        return;
      }
      if (!p.requiereReceta) {
        toast(`"${p.nombre}" no requiere receta`, "warn");
      }
      productosRx.push({
        productId: p.id,
        nombre: p.nombre,
        cantidad: Math.max(1, Number(qtyStr) || 1),
        controlado: p.controlado,
      });
    }
    if (!productosRx.length) {
      toast("Añade al menos un producto a la receta", "warn");
      return;
    }

    state.recetaActiva = {
      numero, tipo, pacienteNombre, pacienteDni, medico, colegiado,
      fechaEmision, validezDias, productos: productosRx, dispensada: false, observaciones,
    };
    if (!$("#cliente-dni").value) {
      state.clienteActual.dni = pacienteDni;
      state.clienteActual.nombre = pacienteNombre;
      $("#cliente-dni").value = pacienteDni;
      $("#cliente-nombre").value = pacienteNombre;
    }
    $("#modal-receta").classList.remove("open");
    renderReceta();
    save();
    const vig = recetaVigente(state.recetaActiva, state.gameTimeMs);
    toast(vig.ok ? "Receta cargada y válida" : "Receta cargada: " + vig.motivo, vig.ok ? "ok" : "warn");
  }

  function bindEvents() {
    $("#pause-btn").addEventListener("click", () => {
      state.paused = !state.paused;
      lastFrame = 0;
      save();
      renderClock();
    });
    $("#speed-label").textContent = "1 min real = 1 h juego";

    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => showTab(tab.dataset.tab));
    });

    ["search-q", "filter-cat", "filter-receta", "filter-marca", "filter-pa"].forEach((id) => {
      $("#" + id).addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderCatalog, 120);
      });
      $("#" + id).addEventListener("change", renderCatalog);
    });

    $("#catalog-body").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (btn) addToCart(Number(btn.dataset.add));
    });

    $("#cart-body").addEventListener("click", (e) => {
      const t = e.target.closest("[data-inc],[data-dec],[data-rem]");
      if (!t) return;
      const id = Number(t.dataset.inc || t.dataset.dec || t.dataset.rem);
      const line = state.cart.find((l) => l.productId === id);
      if (!line) return;
      if (t.dataset.inc) setCartQty(id, line.cantidad + 1);
      else if (t.dataset.dec) setCartQty(id, line.cantidad - 1);
      else setCartQty(id, 0);
    });

    $("#btn-cobrar").addEventListener("click", cobrar);
    $("#btn-vaciar").addEventListener("click", clearCart);
    $("#btn-print").addEventListener("click", () => window.print());
    $("#btn-csv").addEventListener("click", exportCSV);
    $("#btn-spawn").addEventListener("click", () => {
      state.cola.push(crearPedido());
      renderCola();
      save();
      toast("Nuevo cliente en cola", "ok");
    });

    $("#cola-list").addEventListener("click", (e) => {
      const a = e.target.closest("[data-atender]");
      const d = e.target.closest("[data-descartar]");
      if (a) atenderPedido(a.dataset.atender);
      if (d) {
        state.cola = state.cola.filter((p) => p.id !== d.dataset.descartar);
        renderCola();
        save();
      }
    });

    $("#mutua-select").addEventListener("change", (e) => {
      state.mutuaId = e.target.value;
      renderCart();
      save();
    });
    $("#descuento-pct").addEventListener("input", (e) => {
      state.descuentoPct = Number(e.target.value) || 0;
      renderCart();
    });
    $("#descuento-pct").addEventListener("change", save);

    ["cliente-nombre", "cliente-dni", "cliente-tel"].forEach((id) => {
      $("#" + id).addEventListener("change", () => {
        state.clienteActual = {
          nombre: $("#cliente-nombre").value.trim(),
          dni: $("#cliente-dni").value.trim().toUpperCase(),
          telefono: $("#cliente-tel").value.trim(),
        };
        save();
      });
    });

    $("#btn-nueva-receta").addEventListener("click", () => openRecetaModal(null));
    $("#btn-limpiar-receta").addEventListener("click", () => {
      state.recetaActiva = null;
      renderReceta();
      save();
    });
    $("#btn-rx-guardar").addEventListener("click", saveRecetaModal);
    $("#btn-rx-cerrar").addEventListener("click", () => $("#modal-receta").classList.remove("open"));
    $("#modal-receta").addEventListener("click", (e) => {
      if (e.target.id === "modal-receta") $("#modal-receta").classList.remove("open");
    });

    $("#btn-reset").addEventListener("click", () => {
      if (!confirm("¿Restablecer todo el simulador (stock, ventas, cola)?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState(productos);
      // reponer algunos clientes
      state.cola.push(crearPedido(), crearPedido());
      state.nextCustomerAt = state.gameTimeMs + 15 * 60 * 1000;
      bindStateToForm();
      renderAll();
      save();
      toast("Simulador restablecido", "ok");
    });

    $("#btn-restock").addEventListener("click", () => {
      for (const p of productos) state.stock[p.id] = p.stockInicial;
      renderCatalog();
      save();
      toast("Stock restablecido a valores fijos iniciales", "ok");
    });

    $("#btn-export-json").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ state, meta: { totalProductos: productos.length } }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "farmacia-alora-estado.json";
      a.click();
    });
  }

  function bindStateToForm() {
    $("#cliente-nombre").value = state.clienteActual.nombre || "";
    $("#cliente-dni").value = state.clienteActual.dni || "";
    $("#cliente-tel").value = state.clienteActual.telefono || "";
    $("#descuento-pct").value = state.descuentoPct || 0;
    renderMutuas();
  }

  function renderAll() {
    renderClock();
    renderCategorias();
    renderCatalog();
    renderCart();
    renderReceta();
    renderCola();
    renderStats();
  }

  function init() {
    catalogMeta = window.FarmaciaCatalogo.getCatalogo();
    productos = catalogMeta.productos;
    state = load(productos);
    if (!state.cola.length && isOpenAt(state.gameTimeMs)) {
      state.cola.push(crearPedido(), crearPedido(), crearPedido());
    }
    bindEvents();
    bindStateToForm();
    renderAll();
    save();
    clockTimer = requestAnimationFrame(tick);
    console.info(`Farmacia Álora lista · ${productos.length} productos`);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
