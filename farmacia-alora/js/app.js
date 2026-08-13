/**
 * Farmacia Álora — simulador de práctica ampliado
 * 1 min real = 1 h juego
 */
(function () {
  "use strict";

  const STORAGE_KEY = "farmacia-alora-v2";
  const REAL_MS_PER_GAME_HOUR = 60 * 1000;
  const Clinica = window.FarmaciaClinica;
  const Caja = window.FarmaciaCaja;

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

  const ALERGIAS_POOL = ["penicilina", "aines", "aspirina", "metamizol", "lactosa"];
  const CRONICOS_POOL = ["enalapril", "metformina", "atorvastatina", "omeprazol", "sertralina", "bisoprolol"];

  let state;
  let productos = [];
  let catalogMeta = null;
  let clockTimer = null;
  let lastFrame = 0;
  let searchTimer = null;
  let sintomaActivo = "";
  let pagoMetodo = "efectivo";
  let pacienteEditId = null;
  let selectedPacienteId = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function euro(n) {
    return (Number(n) || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function formatGameDate(ms) {
    const d = new Date(ms);
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return `${dias[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function formatShort(ms) {
    const d = new Date(ms);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function dayKey(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a * 1664525 + 1013904223) >>> 0;
      return a / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function genDNI(r) {
    const num = Math.floor(10000000 + r() * 89999999);
    return String(num) + "TRWAGMYFPDXBNJZSQVHLCKE"[num % 23];
  }
  function genRecetaNum(r, fechaMs) {
    const d = new Date(fechaMs);
    return `RE-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(100000 + r() * 899999)}`;
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function toast(msg, type = "ok") {
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3200);
  }

  function seedPacientes() {
    const r = rng(42);
    const list = [];
    for (let i = 0; i < 12; i++) {
      const alergias = r() < 0.35 ? [pick(r, ALERGIAS_POOL)] : [];
      if (r() < 0.1) alergias.push(pick(r, ALERGIAS_POOL));
      const cronicos = r() < 0.5 ? [pick(r, CRONICOS_POOL)] : [];
      if (r() < 0.3) cronicos.push(pick(r, CRONICOS_POOL));
      list.push({
        id: "pac-" + i,
        nombre: pick(r, NOMBRES),
        dni: genDNI(r),
        telefono: "6" + Math.floor(10000000 + r() * 89999999),
        mutuaId: pick(r, MUTUAS).id,
        alergias: [...new Set(alergias)],
        cronicos: [...new Set(cronicos)],
        embarazo: r() < 0.08,
        lactancia: r() < 0.05,
        notas: "",
        historial: [],
      });
    }
    return list;
  }

  function defaultState(productosList) {
    const stock = {};
    for (const p of productosList) stock[p.id] = p.stockInicial ?? p.stock;
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    return {
      version: 2,
      gameTimeMs: start.getTime(),
      paused: false,
      stock,
      cart: [],
      recetaActiva: null,
      mutuaId: "particular",
      descuentoPct: 0,
      clienteActual: { nombre: "", dni: "", telefono: "", pacienteId: null },
      cola: [],
      ventas: [],
      recetasValidadas: [],
      pacientes: seedPacientes(),
      libroEstupefacientes: [],
      caja: Caja.defaultCaja(start.getTime()),
      stats: { tickets: 0, facturacion: 0, recetas: 0 },
      nextCustomerAt: start.getTime() + 20 * 60 * 1000,
      settings: {
        horarioManana: [9, 14],
        horarioTarde: [17, 20.5],
        abiertoSabadoManana: true,
        enGuardia: false,
      },
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: state.version,
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
        pacientes: state.pacientes,
        libroEstupefacientes: state.libroEstupefacientes.slice(-500),
        caja: state.caja,
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
        pacientes: data.pacientes?.length ? data.pacientes : base.pacientes,
        libroEstupefacientes: data.libroEstupefacientes || [],
        caja: data.caja || base.caja,
        settings: { ...base.settings, ...(data.settings || {}) },
      };
    } catch {
      return defaultState(productosList);
    }
  }

  function isOpenAt(ms) {
    if (state.settings.enGuardia) return true;
    const d = new Date(ms);
    const day = d.getDay();
    const hour = d.getHours() + d.getMinutes() / 60;
    const { horarioManana: m, horarioTarde: t, abiertoSabadoManana } = state.settings;
    if (day === 0) return false;
    if (day === 6) return abiertoSabadoManana && hour >= m[0] && hour < m[1];
    return (hour >= m[0] && hour < m[1]) || (hour >= t[0] && hour < t[1]);
  }

  function isOutsideNormalHours(ms) {
    const d = new Date(ms);
    const day = d.getDay();
    const hour = d.getHours() + d.getMinutes() / 60;
    const { horarioManana: m, horarioTarde: t, abiertoSabadoManana } = state.settings;
    if (day === 0) return true;
    if (day === 6) return !(abiertoSabadoManana && hour >= m[0] && hour < m[1]);
    return !((hour >= m[0] && hour < m[1]) || (hour >= t[0] && hour < t[1]));
  }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    const dt = Math.min(1000, now - lastFrame);
    lastFrame = now;
    if (!state.paused) {
      state.gameTimeMs += (dt / REAL_MS_PER_GAME_HOUR) * 60 * 60 * 1000;
      maybeSpawnCustomer();
      if (Math.floor(now / 5000) !== Math.floor((now - dt) / 5000)) save();
    }
    renderClock();
    clockTimer = requestAnimationFrame(tick);
  }

  function renderClock() {
    const open = isOpenAt(state.gameTimeMs);
    const guardia = state.settings.enGuardia;
    $("#game-clock").textContent = formatGameDate(state.gameTimeMs);
    const badge = $("#open-badge");
    if (guardia && isOutsideNormalHours(state.gameTimeMs)) {
      badge.textContent = "Guardia";
      badge.className = "badge badge-purple";
    } else {
      badge.textContent = open ? "Abierta" : "Cerrada";
      badge.className = "badge " + (open ? "badge-ok" : "badge-warn");
    }
    $("#guardia-badge").classList.toggle("hidden", !guardia);
    $("#btn-guardia").textContent = guardia ? "Desactivar guardia" : "Activar guardia";
    $("#pause-btn").textContent = state.paused ? "▶ Reanudar" : "⏸ Pausar";
  }

  function maybeSpawnCustomer() {
    if (state.gameTimeMs < state.nextCustomerAt) return;
    if (!isOpenAt(state.gameTimeMs)) {
      state.nextCustomerAt = state.gameTimeMs + 30 * 60 * 1000;
      return;
    }
    if (state.cola.length >= 10) {
      state.nextCustomerAt = state.gameTimeMs + 12 * 60 * 1000;
      return;
    }
    state.cola.push(crearPedido());
    const r = rng(Math.floor(state.gameTimeMs) ^ state.cola.length);
    const gap = state.settings.enGuardia && isOutsideNormalHours(state.gameTimeMs)
      ? 15 + Math.floor(r() * 35)
      : 8 + Math.floor(r() * 25);
    state.nextCustomerAt = state.gameTimeMs + gap * 60 * 1000;
    renderCola();
    save();
  }

  function getOrCreatePaciente(cliente) {
    let p = state.pacientes.find((x) => x.dni === cliente.dni);
    if (p) return p;
    const r = rng(cliente.dni.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    p = {
      id: "pac-" + Date.now().toString(36),
      nombre: cliente.nombre,
      dni: cliente.dni,
      telefono: cliente.telefono || "",
      mutuaId: "particular",
      alergias: r() < 0.25 ? [pick(r, ALERGIAS_POOL)] : [],
      cronicos: r() < 0.4 ? [pick(r, CRONICOS_POOL)] : [],
      embarazo: false,
      lactancia: false,
      notas: "",
      historial: [],
    };
    state.pacientes.unshift(p);
    return p;
  }

  function crearPedido() {
    const r = rng((Math.random() * 1e9) ^ Date.now());
    const fromFicha = r() < 0.55 ? pick(r, state.pacientes) : null;
    const nombre = fromFicha ? fromFicha.nombre : pick(r, NOMBRES);
    const dni = fromFicha ? fromFicha.dni : genDNI(r);
    const conReceta = r() < 0.45;
    const nItems = 1 + Math.floor(r() * 4);
    const pool = conReceta
      ? productos.filter((p) => p.requiereReceta && (state.stock[p.id] || 0) > 0)
      : productos.filter((p) => !p.requiereReceta && (state.stock[p.id] || 0) > 0);
    const source = pool.length ? pool : productos.filter((p) => (state.stock[p.id] || 0) > 0);
    const items = [];
    for (let i = 0; i < nItems && source.length; i++) {
      const p = pick(r, source);
      if (items.some((x) => x.productId === p.id)) continue;
      items.push({
        productId: p.id, nombre: p.nombre, cantidad: 1 + (r() < 0.15 ? 1 : 0),
        requiereReceta: p.requiereReceta, controlado: p.controlado,
      });
    }
    let receta = null;
    if (items.some((i) => i.requiereReceta)) {
      const med = pick(r, MEDICOS);
      const emitida = state.gameTimeMs - Math.floor(r() * 10) * 24 * 60 * 60 * 1000;
      receta = {
        numero: genRecetaNum(r, emitida),
        tipo: r() < 0.7 ? "electronica" : "papel",
        pacienteNombre: nombre,
        pacienteDni: dni,
        medico: med.nombre,
        colegiado: med.colegiado,
        fechaEmision: emitida,
        validezDias: items.some((i) => i.controlado) ? 10 : 30,
        productos: items.filter((i) => i.requiereReceta).map((i) => ({
          productId: i.productId, nombre: i.nombre, cantidad: i.cantidad, controlado: i.controlado,
        })),
        dispensada: false,
        observaciones: items.some((i) => i.controlado) ? "Controlado: libro de estupefacientes." : "",
      };
    }
    const guardia = state.settings.enGuardia && isOutsideNormalHours(state.gameTimeMs);
    return {
      id: "ped-" + Date.now().toString(36) + Math.floor(r() * 1000),
      llegada: state.gameTimeMs,
      cliente: { nombre, dni, telefono: fromFicha?.telefono || ("6" + Math.floor(10000000 + r() * 89999999)), pacienteId: fromFicha?.id || null },
      items, receta,
      mutuaId: fromFicha?.mutuaId || pick(r, MUTUAS).id,
      estado: "en_cola",
      guardia,
      notas: (conReceta ? "Trae receta" : "Sin receta") + (guardia ? " · GUARDIA" : ""),
    };
  }

  function getMutua() { return MUTUAS.find((m) => m.id === state.mutuaId) || MUTUAS[0]; }
  function getPacienteActual() {
    if (state.clienteActual.pacienteId) {
      return state.pacientes.find((p) => p.id === state.clienteActual.pacienteId) || null;
    }
    if (state.clienteActual.dni) {
      return state.pacientes.find((p) => p.dni.toUpperCase() === state.clienteActual.dni.toUpperCase()) || null;
    }
    return null;
  }

  function cartProducts() {
    return state.cart.map((l) => {
      const p = productos.find((x) => x.id === l.productId);
      return p ? { ...p, _qty: l.cantidad } : null;
    }).filter(Boolean);
  }

  function lineTotals(linea) {
    const p = productos.find((x) => x.id === linea.productId);
    if (!p) return { base: 0, iva: 0, total: 0, coste: 0 };
    const base = p.precio * linea.cantidad;
    const iva = base * (p.iva / 100);
    const coste = (p.coste || p.precio * 0.65) * linea.cantidad;
    return { base, iva, total: base + iva, precio: p.precio, ivaPct: p.iva, producto: p, coste };
  }

  function cartTotals() {
    let base = 0, iva = 0, coste = 0;
    for (const l of state.cart) {
      const t = lineTotals(l);
      base += t.base; iva += t.iva; coste += t.coste;
    }
    const bruto = base + iva;
    const descPct = Math.min(100, Math.max(0, Number(state.descuentoPct) || 0));
    const desc = bruto * (descPct / 100);
    const trasDesc = bruto - desc;
    const mutua = getMutua();
    let cubierto = 0;
    if (mutua.cobertura > 0) {
      let baseMed = 0;
      for (const l of state.cart) {
        const t = lineTotals(l);
        if (t.ivaPct === 4) baseMed += t.total;
      }
      cubierto = baseMed * (1 - descPct / 100) * mutua.cobertura;
    }
    const aPagar = Math.max(0, trasDesc - cubierto);
    const margen = Math.max(0, aPagar - coste * (aPagar / (bruto || 1)));
    return { base, iva, bruto, descPct, desc, trasDesc, cubierto, aPagar, mutua, coste, margen };
  }

  function refreshClinicalAlerts() {
    const pac = getPacienteActual();
    const alerts = Clinica.analizarClinica(cartProducts(), pac);
    const bar = $("#alerts-bar");
    if (!alerts.length) {
      bar.hidden = true;
      bar.innerHTML = "";
      return alerts;
    }
    bar.hidden = false;
    bar.innerHTML = alerts.map((a) => `<div class="alert alert-${a.nivel}">⚠ ${escapeHtml(a.msg)}</div>`).join("");
    return alerts;
  }

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
    const necesita = state.cart.filter((l) => productos.find((x) => x.id === l.productId)?.requiereReceta);
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
      const enReceta = receta.productos.find((rp) => rp.productId === linea.productId);
      if (!enReceta) return { ok: false, motivo: `"${p.nombre}" no figura en la receta activa`, warnings };
      if (linea.cantidad > enReceta.cantidad) {
        return { ok: false, motivo: `Cantidad de "${p.nombre}" superior a la prescrita`, warnings };
      }
      if (p.controlado && !state.clienteActual.dni) {
        return { ok: false, motivo: "Medicamento controlado: DNI obligatorio", warnings };
      }
      if (p.controlado) warnings.push("Controlado: se registrará en el libro de estupefacientes.");
    }
    return { ok: true, warnings };
  }

  function addToCart(productId, qty = 1) {
    const p = productos.find((x) => x.id === productId);
    if (!p) return;
    const stock = state.stock[p.id] || 0;
    const existing = state.cart.find((l) => l.productId === productId);
    const newQty = (existing ? existing.cantidad : 0) + qty;
    if (newQty > stock) { toast(`Stock insuficiente (${stock})`, "warn"); return; }
    if (existing) existing.cantidad = newQty;
    else state.cart.push({ productId, cantidad: qty });
    renderCart();
    refreshClinicalAlerts();
    save();
    toast(`Añadido: ${p.nombre}`, "ok");
  }

  function setCartQty(productId, qty) {
    const line = state.cart.find((l) => l.productId === productId);
    if (!line) return;
    const stock = state.stock[productId] || 0;
    if (qty <= 0) state.cart = state.cart.filter((l) => l.productId !== productId);
    else line.cantidad = Math.min(qty, stock);
    renderCart();
    refreshClinicalAlerts();
    save();
  }

  function replaceInCart(oldId, newId) {
    const line = state.cart.find((l) => l.productId === oldId);
    if (!line) return;
    const stock = state.stock[newId] || 0;
    if (stock < line.cantidad) { toast("Stock insuficiente del genérico", "warn"); return; }
    const other = state.cart.find((l) => l.productId === newId);
    if (other) {
      other.cantidad += line.cantidad;
      state.cart = state.cart.filter((l) => l.productId !== oldId);
    } else {
      line.productId = newId;
    }
    renderCart();
    refreshClinicalAlerts();
    save();
    toast("Sustituido por genérico", "ok");
  }

  function openPagoModal() {
    if (!state.cart.length) { toast("El carrito está vacío", "warn"); return; }
    if (!state.caja.abierta) { toast("La caja está cerrada. Ábrela primero.", "warn"); showTab("caja"); return; }
    for (const l of state.cart) {
      if ((state.stock[l.productId] || 0) < l.cantidad) { toast("Stock insuficiente", "warn"); return; }
    }
    const val = validarDispensacion();
    if (!val.ok) { toast(val.motivo, "err"); return; }

    const alerts = refreshClinicalAlerts();
    const graves = alerts.filter((a) => a.nivel === "grave");
    pagoMetodo = "efectivo";
    const tot = cartTotals();
    $("#pago-total").textContent = euro(tot.aPagar);
    $("#pago-recibido").value = tot.aPagar.toFixed(2);
    $("#mixto-efectivo").value = "0";
    $("#mixto-tarjeta").value = tot.aPagar.toFixed(2);
    $("#mixto-bizum").value = "0";
    renderMetodos();
    updatePagoUI();
    $("#pago-alerts").innerHTML = [
      ...val.warnings.map((w) => `<div class="alert alert-moderada">${escapeHtml(w)}</div>`),
      ...alerts.map((a) => `<div class="alert alert-${a.nivel}">${escapeHtml(a.msg)}</div>`),
    ].join("");
    if (graves.length) {
      $("#pago-alerts").innerHTML += `<div class="alert alert-grave">Hay alertas graves. Confirma solo si procede en esta simulación.</div>`;
    }
    $("#modal-pago").classList.add("open");
  }

  function renderMetodos() {
    $("#metodos-grid").innerHTML = Caja.METODOS.map((m) => `
      <button type="button" class="metodo-btn ${pagoMetodo === m.id ? "active" : ""}" data-metodo="${m.id}">
        <span>${m.icon}</span>${m.nombre}
      </button>
    `).join("");
    $("#quick-cash").innerHTML = [5, 10, 20, 50, 100, 200].map((n) =>
      `<button type="button" class="chip" data-quick="${n}">${n} €</button>`
    ).join("") + `<button type="button" class="chip" data-quick="exacto">Exacto</button>`;
  }

  function updatePagoUI() {
    const tot = cartTotals().aPagar;
    const ef = pagoMetodo === "efectivo";
    const mx = pagoMetodo === "mixto";
    $("#pago-efectivo-panel").classList.toggle("hidden", !ef);
    $("#pago-mixto-panel").classList.toggle("hidden", !mx);
    $$(".metodo-btn").forEach((b) => b.classList.toggle("active", b.dataset.metodo === pagoMetodo));

    if (ef) {
      const recibido = Number($("#pago-recibido").value) || 0;
      const cambio = Caja.round2(Math.max(0, recibido - tot));
      $("#pago-cambio").textContent = euro(cambio);
      const calc = Caja.calcularCambio(cambio, state.caja.denoms);
      $("#cambio-desglose").innerHTML = calc.desglose.length
        ? calc.desglose.map((d) => `<span class="chip">${d.cantidad} × ${euro(d.valor)}${d.sinStock ? " *" : ""}</span>`).join("")
        : `<span class="muted">Sin cambio</span>`;
    }
    if (mx) {
      const a = Number($("#mixto-efectivo").value) || 0;
      const b = Number($("#mixto-tarjeta").value) || 0;
      const c = Number($("#mixto-bizum").value) || 0;
      $("#mixto-suma").textContent = euro(a + b + c);
    }
  }

  function confirmarPago() {
    const tot = cartTotals();
    const total = tot.aPagar;
    let pago = { metodo: pagoMetodo, total, recibido: 0, cambio: 0, mixto: null, cambioUsado: null, entregaDenoms: null };

    if (pagoMetodo === "efectivo") {
      const recibido = Number($("#pago-recibido").value) || 0;
      if (recibido + 1e-9 < total) { toast("Importe entregado insuficiente", "err"); return; }
      const cambio = Caja.round2(recibido - total);
      const calc = Caja.calcularCambio(cambio, state.caja.denoms);
      pago.recibido = recibido;
      pago.cambio = cambio;
      pago.cambioUsado = calc.usado;
      pago.entregaDenoms = Caja.desgloseEntregaRapida(recibido);
    } else if (pagoMetodo === "mixto") {
      const ef = Number($("#mixto-efectivo").value) || 0;
      const tj = Number($("#mixto-tarjeta").value) || 0;
      const bz = Number($("#mixto-bizum").value) || 0;
      if (Caja.round2(ef + tj + bz) + 1e-9 < total) { toast("La suma mixta no cubre el total", "err"); return; }
      pago.mixto = { efectivo: ef, tarjeta: tj, bizum: bz };
      pago.recibido = ef;
      if (ef > 0) {
        pago.entregaDenoms = Caja.desgloseEntregaRapida(ef);
        // si entrega más efectivo del necesario en la parte efectivo, no damos cambio en mixto simplificado
      }
    } else {
      pago.recibido = total;
    }

    finalizarVenta(pago, tot);
  }

  function finalizarVenta(pago, tot) {
    const lineas = state.cart.map((l) => {
      const t = lineTotals(l);
      return {
        productId: l.productId,
        nombre: t.producto.nombre,
        cantidad: l.cantidad,
        precio: t.precio,
        coste: t.coste / l.cantidad,
        iva: t.ivaPct,
        base: t.base,
        total: t.total,
        requiereReceta: t.producto.requiereReceta,
        controlado: t.producto.controlado,
        principioActivo: t.producto.principioActivo,
        ean: t.producto.ean,
      };
    });

    const ticket = {
      id: "T-" + Date.now().toString(36).toUpperCase(),
      fechaJuego: state.gameTimeMs,
      fechaReal: Date.now(),
      cliente: { ...state.clienteActual },
      mutua: tot.mutua.nombre,
      mutuaId: tot.mutua.id,
      descuentoPct: tot.descPct,
      descuento: tot.desc,
      coberturaMutua: tot.cubierto,
      base: tot.base,
      iva: tot.iva,
      bruto: tot.bruto,
      total: tot.aPagar,
      margen: tot.margen,
      coste: tot.coste,
      lineas,
      pago,
      guardia: state.settings.enGuardia && isOutsideNormalHours(state.gameTimeMs),
      receta: state.recetaActiva ? {
        numero: state.recetaActiva.numero,
        pacienteDni: state.recetaActiva.pacienteDni,
        medico: state.recetaActiva.medico,
        colegiado: state.recetaActiva.colegiado,
        tipo: state.recetaActiva.tipo,
      } : null,
    };

    for (const l of state.cart) state.stock[l.productId] -= l.cantidad;

    // Libro estupefacientes
    for (const l of lineas) {
      if (!l.controlado) continue;
      state.libroEstupefacientes.unshift({
        id: "LE-" + Date.now().toString(36) + l.productId,
        fecha: state.gameTimeMs,
        tipo: "salida",
        productId: l.productId,
        nombre: l.nombre,
        principioActivo: l.principioActivo,
        cantidad: l.cantidad,
        pacienteDni: state.clienteActual.dni || ticket.receta?.pacienteDni || "—",
        pacienteNombre: state.clienteActual.nombre || "—",
        ticketId: ticket.id,
        recetaNumero: ticket.receta?.numero || "—",
        medico: ticket.receta?.medico || "—",
        operador: state.caja.operador,
      });
    }

    if (state.recetaActiva && lineas.some((l) => l.requiereReceta)) {
      state.recetaActiva.dispensada = true;
      state.recetasValidadas.push({ ...state.recetaActiva, ticketId: ticket.id, fecha: state.gameTimeMs });
      state.stats.recetas += 1;
      state.recetaActiva = null;
    }

    // Historial paciente
    const pac = getOrCreatePaciente({
      nombre: state.clienteActual.nombre || "Cliente",
      dni: state.clienteActual.dni || ("TMP" + Date.now()),
      telefono: state.clienteActual.telefono,
    });
    pac.historial.unshift({
      ticketId: ticket.id,
      fecha: state.gameTimeMs,
      total: ticket.total,
      items: lineas.map((l) => l.nombre),
    });
    pac.historial = pac.historial.slice(0, 30);
    state.clienteActual.pacienteId = pac.id;

    state.caja = Caja.registrarPago(state.caja, {
      fecha: state.gameTimeMs,
      metodo: pago.metodo,
      total: ticket.total,
      recibido: pago.recibido,
      cambio: pago.cambio,
      ticketId: ticket.id,
      detalle: pago.metodo,
      mixto: pago.mixto,
      cambioUsado: pago.cambioUsado,
      entregaDenoms: pago.entregaDenoms,
    });

    state.ventas.push(ticket);
    state.stats.tickets += 1;
    state.stats.facturacion += ticket.total;
    state.cart = [];
    $("#modal-pago").classList.remove("open");
    save();
    renderCart();
    renderReceta();
    renderStats();
    renderCatalog();
    renderCaja();
    renderLibro();
    renderPacientes();
    refreshClinicalAlerts();
    mostrarTicket(ticket);
    toast("Venta cobrada · " + pago.metodo, "ok");
  }

  /* -------------------- Render -------------------- */
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
    if (sintomaActivo) {
      return Clinica.filtrarPorSintoma(productos, sintomaActivo, state.stock);
    }
    const f = getFilters();
    return productos.filter((p) => {
      if (f.cat && p.categoria !== f.cat) return false;
      if (f.receta === "con" && !p.requiereReceta) return false;
      if (f.receta === "sin" && p.requiereReceta) return false;
      if (f.receta === "controlado" && !p.controlado) return false;
      if (f.marca && !(p.marca || "").toLowerCase().includes(f.marca)) return false;
      if (f.pa && !(p.principioActivo || "").toLowerCase().includes(f.pa)) return false;
      if (f.q) {
        const blob = `${p.nombre} ${p.marca} ${p.principioActivo} ${(p.sintomas || []).join(" ")} ${p.ean} ${p.sku}`.toLowerCase();
        if (!blob.includes(f.q)) return false;
      }
      return true;
    });
  }

  function renderSintomas() {
    const list = Clinica.SINTOMAS_UI;
    $("#sintomas-row").innerHTML = `<button type="button" class="chip ${!sintomaActivo ? "active" : ""}" data-sintoma="">Todos</button>` +
      list.map((s) => `<button type="button" class="chip ${sintomaActivo === s ? "active" : ""}" data-sintoma="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("");
  }

  function renderCatalog() {
    const list = filteredProducts();
    const max = 80;
    const slice = list.slice(0, max);
    $("#catalog-count").textContent = `${list.length.toLocaleString("es-ES")} productos` + (list.length > max ? ` (mostrando ${max})` : "");
    $("#catalog-body").innerHTML = slice.map((p) => {
      const stock = state.stock[p.id] ?? 0;
      const badges = [
        p.requiereReceta ? '<span class="tag tag-rx">Receta</span>' : '<span class="tag tag-otc">OTC</span>',
        p.controlado ? '<span class="tag tag-ctrl">Controlado</span>' : "",
        p.esGenerico ? '<span class="tag tag-gen">EFG</span>' : "",
      ].join("");
      return `<tr>
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

  function renderCart() {
    const body = $("#cart-body");
    if (!state.cart.length) body.innerHTML = `<div class="empty">🛒 Carrito vacío</div>`;
    else {
      body.innerHTML = state.cart.map((l) => {
        const t = lineTotals(l);
        const p = t.producto;
        return `<div class="cart-line">
          <div class="cart-line-main">
            <strong>${escapeHtml(p.nombre)}</strong>
            <span class="muted">${euro(p.precio)} · ${p.requiereReceta ? "℞" : "OTC"}${p.controlado ? " · CTRL" : ""}</span>
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
    renderPacienteChips();
  }

  function renderPacienteChips() {
    const pac = getPacienteActual();
    const el = $("#paciente-chips");
    if (!pac) { el.innerHTML = ""; return; }
    const chips = [];
    if (pac.alergias?.length) chips.push(...pac.alergias.map((a) => `<span class="chip danger">过敏 ${escapeHtml(a)}</span>`.replace("过敏", "⚠ Alergia:")));
    if (pac.embarazo) chips.push(`<span class="chip warn">Embarazo</span>`);
    if (pac.lactancia) chips.push(`<span class="chip warn">Lactancia</span>`);
    if (pac.cronicos?.length) chips.push(...pac.cronicos.map((c) => `<span class="chip">Crónico: ${escapeHtml(c)}</span>`));
    el.innerHTML = chips.join("");
  }

  function renderReceta() {
    const r = state.recetaActiva;
    if (!r) {
      $("#receta-panel").innerHTML = `<p class="muted">No hay receta activa.</p>`;
      $("#receta-status").textContent = "Sin receta";
      $("#receta-status").className = "badge badge-muted";
      return;
    }
    const vig = recetaVigente(r, state.gameTimeMs);
    $("#receta-status").textContent = vig.ok ? "Válida" : vig.motivo;
    $("#receta-status").className = "badge " + (vig.ok ? "badge-ok" : "badge-err");
    $("#receta-panel").innerHTML = `
      <div class="receta-grid">
        <div><span class="lbl">Nº</span> ${escapeHtml(r.numero)}</div>
        <div><span class="lbl">Tipo</span> ${r.tipo === "electronica" ? "Electrónica" : "Papel"}</div>
        <div><span class="lbl">Paciente</span> ${escapeHtml(r.pacienteNombre)} (${escapeHtml(r.pacienteDni)})</div>
        <div><span class="lbl">Médico</span> ${escapeHtml(r.medico)} · ${escapeHtml(r.colegiado)}</div>
        <div><span class="lbl">Emisión</span> ${formatShort(r.fechaEmision)}</div>
        <div><span class="lbl">Validez</span> ${r.validezDias} días</div>
      </div>
      <ul class="receta-items">${r.productos.map((p) => `<li>${escapeHtml(p.nombre)} × ${p.cantidad}${p.controlado ? ' <span class="tag tag-ctrl">CTRL</span>' : ""}</li>`).join("")}</ul>
      ${r.observaciones ? `<p class="warn-text">${escapeHtml(r.observaciones)}</p>` : ""}
    `;
  }

  function renderCola() {
    const el = $("#cola-list");
    $("#cola-count").textContent = String(state.cola.length);
    if (!state.cola.length) { el.innerHTML = `<div class="empty">👥 No hay clientes en cola</div>`; return; }
    el.innerHTML = state.cola.map((ped) => `
      <article class="pedido-card ${ped.guardia ? "guardia" : ""}">
        <header>
          <strong>${escapeHtml(ped.cliente.nombre)}</strong>
          <span class="muted">${formatShort(ped.llegada)}</span>
        </header>
        <p class="muted">${escapeHtml(ped.notas)} · ${ped.items.length} art.</p>
        <ul>${ped.items.slice(0, 4).map((i) => `<li>${escapeHtml(i.nombre)}${i.requiereReceta ? " ℞" : ""}</li>`).join("")}</ul>
        <div class="pedido-actions">
          <button class="btn btn-sm btn-primary" data-atender="${ped.id}">Atender</button>
          <button class="btn btn-sm" data-descartar="${ped.id}">Descartar</button>
        </div>
        ${ped.guardia ? '<span class="badge badge-purple">Guardia</span>' : ""}
      </article>
    `).join("");
  }

  function renderStats() {
    $("#stat-catalog").textContent = productos.length.toLocaleString("es-ES");
    $("#stat-tickets").textContent = String(state.stats.tickets);
    $("#stat-fact").textContent = euro(state.stats.facturacion);
    $("#stat-recetas").textContent = String(state.stats.recetas);
    $("#stat-caja").textContent = euro(Caja.totalDenoms(state.caja.denoms));
  }

  function renderMutuas() {
    const opts = MUTUAS.map((m) =>
      `<option value="${m.id}">${m.nombre}${m.cobertura ? ` (−${Math.round(m.cobertura * 100)}% med.)` : ""}</option>`
    ).join("");
    $("#mutua-select").innerHTML = opts;
    $("#mutua-select").value = state.mutuaId;
    $("#np-mutua").innerHTML = opts;
  }

  function renderCategorias() {
    const cats = (catalogMeta.categorias || []).slice().sort((a, b) => a.localeCompare(b, "es"));
    $("#filter-cat").innerHTML = `<option value="">Todas las categorías</option>` +
      cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  function renderPacientes() {
    const q = ($("#paciente-search")?.value || "").toLowerCase();
    const list = state.pacientes.filter((p) =>
      !q || p.nombre.toLowerCase().includes(q) || p.dni.toLowerCase().includes(q)
    );
    $("#pacientes-list").innerHTML = list.map((p) => `
      <div class="list-item" data-pac="${p.id}">
        <div>
          <strong>${escapeHtml(p.nombre)}</strong>
          <div class="muted tiny">${escapeHtml(p.dni)} · ${escapeHtml(getMutuaById(p.mutuaId).nombre)}</div>
        </div>
        <div class="actions-row" style="margin:0">
          <button class="btn btn-sm btn-primary" data-usar-pac="${p.id}">Usar</button>
          <button class="btn btn-sm" data-ver-pac="${p.id}">Ver</button>
        </div>
      </div>
    `).join("") || `<div class="empty">Sin fichas</div>`;

    if (selectedPacienteId) {
      const p = state.pacientes.find((x) => x.id === selectedPacienteId);
      if (p) {
        $("#paciente-detail").innerHTML = `
          <h3>${escapeHtml(p.nombre)}</h3>
          <p><strong>DNI:</strong> ${escapeHtml(p.dni)} · <strong>Tel:</strong> ${escapeHtml(p.telefono || "—")}</p>
          <p><strong>Mutua:</strong> ${escapeHtml(getMutuaById(p.mutuaId).nombre)}</p>
          <p><strong>Alergias:</strong> ${p.alergias?.length ? escapeHtml(p.alergias.join(", ")) : "—"}</p>
          <p><strong>Crónicos:</strong> ${p.cronicos?.length ? escapeHtml(p.cronicos.join(", ")) : "—"}</p>
          <p><strong>Embarazo:</strong> ${p.embarazo ? "Sí" : "No"} · <strong>Lactancia:</strong> ${p.lactancia ? "Sí" : "No"}</p>
          <p class="muted">${escapeHtml(p.notas || "")}</p>
          <h4 class="subh">Historial reciente</h4>
          <ul>${(p.historial || []).slice(0, 8).map((h) =>
            `<li>${formatShort(h.fecha)} · ${escapeHtml(h.ticketId)} · ${euro(h.total)}<br><span class="muted tiny">${escapeHtml((h.items || []).join(", "))}</span></li>`
          ).join("") || "<li class='muted'>Sin compras</li>"}</ul>
          <div class="actions-row">
            <button class="btn btn-sm" data-edit-pac="${p.id}">Editar</button>
          </div>
        `;
      }
    }
  }

  function getMutuaById(id) { return MUTUAS.find((m) => m.id === id) || MUTUAS[0]; }

  function renderCaja() {
    const r = Caja.resumenCaja(state.caja, state.ventas.filter((v) => dayKey(v.fechaJuego) === dayKey(state.gameTimeMs)));
    $("#caja-estado").textContent = state.caja.abierta ? "Abierta" : "Cerrada";
    $("#caja-estado").className = "badge " + (state.caja.abierta ? "badge-ok" : "badge-warn");
    $("#caja-resumen").innerHTML = `
      <div class="caja-kpi"><div class="lbl">Sesión</div><strong>${escapeHtml(state.caja.sesionId)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Fondo inicial</div><strong>${euro(state.caja.fondoInicial)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Contado (cajón)</div><strong>${euro(r.contado)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Teórico</div><strong>${euro(r.teorico)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Diferencia</div><strong style="color:${r.diferencia === 0 ? "var(--ok)" : "var(--red)"}">${euro(r.diferencia)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Efectivo hoy</div><strong>${euro(r.porMetodo.efectivo || 0)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Tarjeta hoy</div><strong>${euro(r.porMetodo.tarjeta || 0)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Bizum hoy</div><strong>${euro(r.porMetodo.bizum || 0)}</strong></div>
    `;
    $("#caja-denoms").innerHTML = Caja.DENOMS.map((d) => `
      <div class="denom-card ${d.tipo}">
        <strong>${euro(d.valor)}</strong>
        <span>× ${state.caja.denoms[d.id] || 0}</span>
      </div>
    `).join("");
    $("#caja-movimientos").innerHTML = (state.caja.movimientos || []).slice().reverse().slice(0, 40).map((m) => `
      <div class="list-item">
        <div>
          <strong>${escapeHtml(m.metodo)}</strong> · ${escapeHtml(m.ticketId || "")}
          <div class="muted tiny">${formatShort(m.fecha)}${m.cambio ? " · cambio " + euro(m.cambio) : ""}</div>
        </div>
        <strong>${euro(m.total)}</strong>
      </div>
    `).join("") || `<div class="empty">Sin movimientos</div>`;
  }

  function renderLibro() {
    const rows = state.libroEstupefacientes;
    if (!rows.length) {
      $("#libro-list").innerHTML = `<div class="empty">📕 Aún no hay salidas controladas</div>`;
      return;
    }
    $("#libro-list").innerHTML = `<table>
      <thead><tr><th>Fecha</th><th>Producto</th><th>Ud</th><th>Paciente</th><th>Receta</th><th>Ticket</th><th>Operador</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td>${formatShort(r.fecha)}</td>
        <td>${escapeHtml(r.nombre)}<div class="muted tiny">${escapeHtml(r.principioActivo)}</div></td>
        <td>${r.cantidad}</td>
        <td>${escapeHtml(r.pacienteNombre)}<div class="muted tiny">${escapeHtml(r.pacienteDni)}</div></td>
        <td>${escapeHtml(r.recetaNumero)}</td>
        <td>${escapeHtml(r.ticketId)}</td>
        <td>${escapeHtml(r.operador)}</td>
      </tr>`).join("")}</tbody></table>`;
  }

  function renderInforme() {
    const hoy = state.ventas.filter((v) => dayKey(v.fechaJuego) === dayKey(state.gameTimeMs));
    const r = Caja.resumenCaja(state.caja, hoy);
    const topMap = {};
    for (const v of hoy) {
      for (const l of v.lineas) {
        topMap[l.nombre] = (topMap[l.nombre] || 0) + l.cantidad;
      }
    }
    const top = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const recetas = hoy.filter((v) => v.receta).length;
    const guardia = hoy.filter((v) => v.guardia).length;
    $("#informe-content").innerHTML = `
      <div class="informe-card"><h3>💰 Ventas del día</h3>
        <p><strong>${hoy.length}</strong> tickets</p>
        <p>Facturación: <strong>${euro(r.facturacion)}</strong></p>
        <p>Margen estimado: <strong>${euro(r.margen)}</strong></p>
        <p>Recetas: <strong>${recetas}</strong> · Guardia: <strong>${guardia}</strong></p>
      </div>
      <div class="informe-card"><h3>💳 Por método de pago</h3>
        <p>Efectivo: ${euro(r.porMetodo.efectivo || 0)}</p>
        <p>Tarjeta: ${euro(r.porMetodo.tarjeta || 0)}</p>
        <p>Bizum: ${euro(r.porMetodo.bizum || 0)}</p>
        <p>Transferencia: ${euro(r.porMetodo.transferencia || 0)}</p>
        <p>Mixto: ${euro(r.porMetodo.mixto || 0)}</p>
      </div>
      <div class="informe-card"><h3>🏆 Top productos</h3>
        <ol>${top.map(([n, c]) => `<li>${escapeHtml(n)} <span class="muted">×${c}</span></li>`).join("") || "<li class='muted'>Sin datos</li>"}</ol>
      </div>
      <div class="informe-card"><h3>🖥 Caja</h3>
        <p>Fondo: ${euro(r.fondoInicial)}</p>
        <p>Contado: ${euro(r.contado)}</p>
        <p>Teórico: ${euro(r.teorico)}</p>
        <p>Diferencia: <strong>${euro(r.diferencia)}</strong></p>
      </div>
    `;
  }

  function atenderPedido(id) {
    const ped = state.cola.find((p) => p.id === id);
    if (!ped) return;
    const pac = getOrCreatePaciente(ped.cliente);
    state.clienteActual = {
      nombre: pac.nombre,
      dni: pac.dni,
      telefono: pac.telefono || ped.cliente.telefono || "",
      pacienteId: pac.id,
    };
    state.mutuaId = ped.mutuaId || pac.mutuaId || "particular";
    state.cart = [];
    for (const item of ped.items) {
      const stock = state.stock[item.productId] || 0;
      if (stock >= item.cantidad) state.cart.push({ productId: item.productId, cantidad: item.cantidad });
      else if (stock > 0) {
        state.cart.push({ productId: item.productId, cantidad: stock });
        toast(`Stock parcial: ${item.nombre}`, "warn");
      } else toast(`Sin stock: ${item.nombre}`, "warn");
    }
    state.recetaActiva = ped.receta
      ? { ...ped.receta, productos: ped.receta.productos.map((x) => ({ ...x })) }
      : null;
    state.cola = state.cola.filter((p) => p.id !== id);
    $("#cliente-nombre").value = state.clienteActual.nombre;
    $("#cliente-dni").value = state.clienteActual.dni;
    $("#cliente-tel").value = state.clienteActual.telefono;
    renderMutuas();
    renderCart();
    renderReceta();
    renderCola();
    refreshClinicalAlerts();
    save();
    toast(`Atendiendo a ${pac.nombre}`, "ok");
    showTab("venta");
  }

  function usarPaciente(id) {
    const p = state.pacientes.find((x) => x.id === id);
    if (!p) return;
    state.clienteActual = { nombre: p.nombre, dni: p.dni, telefono: p.telefono || "", pacienteId: p.id };
    state.mutuaId = p.mutuaId || "particular";
    $("#cliente-nombre").value = p.nombre;
    $("#cliente-dni").value = p.dni;
    $("#cliente-tel").value = p.telefono || "";
    renderMutuas();
    renderPacienteChips();
    refreshClinicalAlerts();
    save();
    toast("Ficha cargada en venta", "ok");
    showTab("venta");
  }

  function mostrarTicket(ticket) {
    $("#ticket-content").innerHTML = `
      <div class="ticket-paper" id="ticket-print-area">
        <h2>✚ Farmacia Álora</h2>
        <p class="muted">Simulador de práctica${ticket.guardia ? " · GUARDIA" : ""}</p>
        <p><strong>Ticket:</strong> ${ticket.id}<br><strong>Fecha:</strong> ${formatShort(ticket.fechaJuego)}</p>
        <p><strong>Cliente:</strong> ${escapeHtml(ticket.cliente.nombre || "—")}<br>
        <strong>DNI:</strong> ${escapeHtml(ticket.cliente.dni || "—")}</p>
        <p><strong>Pago:</strong> ${escapeHtml(ticket.pago?.metodo || "—")}
        ${ticket.pago?.cambio ? `<br><strong>Cambio:</strong> ${euro(ticket.pago.cambio)}` : ""}
        ${ticket.pago?.mixto ? `<br>Mixto: ef ${euro(ticket.pago.mixto.efectivo)} / tj ${euro(ticket.pago.mixto.tarjeta)} / bz ${euro(ticket.pago.mixto.bizum)}` : ""}
        </p>
        ${ticket.receta ? `<p><strong>Receta:</strong> ${escapeHtml(ticket.receta.numero)}</p>` : ""}
        <table class="ticket-table">
          <thead><tr><th>Producto</th><th>Ud</th><th>Importe</th></tr></thead>
          <tbody>${ticket.lineas.map((l) => `<tr>
            <td>${escapeHtml(l.nombre)}<br><span class="muted">IVA ${l.iva}%${l.requiereReceta ? " · ℞" : ""}${l.controlado ? " · CTRL" : ""}</span></td>
            <td>${l.cantidad}</td><td>${euro(l.total)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="ticket-totals">
          <div><span>Base</span><span>${euro(ticket.base)}</span></div>
          <div><span>IVA</span><span>${euro(ticket.iva)}</span></div>
          <div><span>Descuento</span><span>−${euro(ticket.descuento)}</span></div>
          <div><span>Mutua</span><span>−${euro(ticket.coberturaMutua)}</span></div>
          <div class="grand"><span>TOTAL</span><span>${euro(ticket.total)}</span></div>
        </div>
        <p class="muted tiny">Documento simulado · No válido como factura real.</p>
      </div>`;
    showTab("ticket");
  }

  function openGenericos() {
    if (!state.cart.length) { toast("Añade productos al carrito", "warn"); return; }
    const blocks = [];
    for (const l of state.cart) {
      const p = productos.find((x) => x.id === l.productId);
      if (!p || p.principioActivo === "—") continue;
      const gens = Clinica.buscarGenericos(p, productos, state.stock);
      if (!gens.length) continue;
      blocks.push(`
        <div class="list-item" style="flex-direction:column;align-items:stretch">
          <strong>Original: ${escapeHtml(p.nombre)}</strong>
          <span class="muted tiny">${euro(p.precio)}</span>
          ${gens.map((g) => `
            <div class="list-item">
              <div>
                <div>${escapeHtml(g.producto.nombre)}</div>
                <div class="muted tiny">${euro(g.producto.precio)} · ahorras ${euro(g.ahorro)} (${g.ahorroPct}%)</div>
              </div>
              <button class="btn btn-sm btn-primary" data-sub-old="${p.id}" data-sub-new="${g.producto.id}">Sustituir</button>
            </div>
          `).join("")}
        </div>
      `);
    }
    $("#generico-list").innerHTML = blocks.join("") || `<div class="empty">No hay genéricos más baratos en stock</div>`;
    $("#modal-generico").classList.add("open");
  }

  function openRecetaModal(prefill) {
    $("#rx-numero").value = prefill?.numero || genRecetaNum(() => Math.random(), state.gameTimeMs);
    $("#rx-tipo").value = prefill?.tipo || "electronica";
    $("#rx-paciente").value = prefill?.pacienteNombre || state.clienteActual.nombre || "";
    $("#rx-dni").value = prefill?.pacienteDni || state.clienteActual.dni || "";
    $("#rx-medico").value = prefill?.medico || MEDICOS[0].nombre;
    $("#rx-colegiado").value = prefill?.colegiado || MEDICOS[0].colegiado;
    const em = prefill?.fechaEmision ? new Date(prefill.fechaEmision) : new Date(state.gameTimeMs);
    $("#rx-fecha").value = `${em.getFullYear()}-${pad(em.getMonth() + 1)}-${pad(em.getDate())}`;
    $("#rx-validez").value = prefill?.validezDias || 30;
    $("#rx-obs").value = prefill?.observaciones || "";
    const rxItems = (prefill?.productos) || state.cart.map((l) => {
      const p = productos.find((x) => x.id === l.productId);
      return p && p.requiereReceta ? { productId: p.id, cantidad: l.cantidad } : null;
    }).filter(Boolean);
    $("#rx-productos").value = rxItems.map((p) => `${p.productId}|${p.cantidad}`).join("\n");
    $("#rx-hint").textContent = "Formato: idProducto|cantidad por línea";
    $("#modal-receta").classList.add("open");
  }

  function saveRecetaModal() {
    const productosRx = [];
    for (const line of $("#rx-productos").value.trim().split("\n").filter(Boolean)) {
      const [idStr, qtyStr] = line.split("|").map((s) => s.trim());
      const p = productos.find((x) => x.id === Number(idStr));
      if (!p) { toast(`Producto ${idStr} no encontrado`, "err"); return; }
      productosRx.push({ productId: p.id, nombre: p.nombre, cantidad: Math.max(1, Number(qtyStr) || 1), controlado: p.controlado });
    }
    if (!productosRx.length) { toast("Añade productos a la receta", "warn"); return; }
    const fechaStr = $("#rx-fecha").value;
    state.recetaActiva = {
      numero: $("#rx-numero").value.trim(),
      tipo: $("#rx-tipo").value,
      pacienteNombre: $("#rx-paciente").value.trim(),
      pacienteDni: $("#rx-dni").value.trim().toUpperCase(),
      medico: $("#rx-medico").value.trim(),
      colegiado: $("#rx-colegiado").value.trim(),
      fechaEmision: fechaStr ? new Date(fechaStr + "T12:00:00").getTime() : state.gameTimeMs,
      validezDias: Number($("#rx-validez").value) || 30,
      productos: productosRx,
      dispensada: false,
      observaciones: $("#rx-obs").value.trim(),
    };
    if (!$("#cliente-dni").value) {
      state.clienteActual.dni = state.recetaActiva.pacienteDni;
      state.clienteActual.nombre = state.recetaActiva.pacienteNombre;
      $("#cliente-dni").value = state.clienteActual.dni;
      $("#cliente-nombre").value = state.clienteActual.nombre;
    }
    $("#modal-receta").classList.remove("open");
    renderReceta();
    save();
    toast("Receta activada", "ok");
  }

  function openPacienteModal(p) {
    pacienteEditId = p?.id || null;
    $("#np-nombre").value = p?.nombre || "";
    $("#np-dni").value = p?.dni || "";
    $("#np-tel").value = p?.telefono || "";
    $("#np-mutua").value = p?.mutuaId || "particular";
    $("#np-alergias").value = (p?.alergias || []).join(", ");
    $("#np-cronicos").value = (p?.cronicos || []).join(", ");
    $("#np-embarazo").checked = !!p?.embarazo;
    $("#np-lactancia").checked = !!p?.lactancia;
    $("#np-notas").value = p?.notas || "";
    $("#modal-paciente").classList.add("open");
  }

  function savePacienteModal() {
    const data = {
      nombre: $("#np-nombre").value.trim(),
      dni: $("#np-dni").value.trim().toUpperCase(),
      telefono: $("#np-tel").value.trim(),
      mutuaId: $("#np-mutua").value,
      alergias: $("#np-alergias").value.split(",").map((s) => s.trim()).filter(Boolean),
      cronicos: $("#np-cronicos").value.split(",").map((s) => s.trim()).filter(Boolean),
      embarazo: $("#np-embarazo").checked,
      lactancia: $("#np-lactancia").checked,
      notas: $("#np-notas").value.trim(),
    };
    if (!data.nombre || !data.dni) { toast("Nombre y DNI obligatorios", "warn"); return; }
    if (pacienteEditId) {
      const p = state.pacientes.find((x) => x.id === pacienteEditId);
      Object.assign(p, data);
      selectedPacienteId = p.id;
    } else {
      const p = { id: "pac-" + Date.now().toString(36), historial: [], ...data };
      state.pacientes.unshift(p);
      selectedPacienteId = p.id;
    }
    $("#modal-paciente").classList.remove("open");
    renderPacientes();
    save();
    toast("Ficha guardada", "ok");
  }

  function exportCSV() {
    if (!state.ventas.length) { toast("No hay ventas", "warn"); return; }
    const rows = [["ticket_id", "fecha", "cliente", "dni", "metodo_pago", "producto", "cantidad", "total_linea", "ticket_total", "receta"]];
    for (const v of state.ventas) {
      for (const l of v.lineas) {
        rows.push([v.id, formatShort(v.fechaJuego), v.cliente.nombre || "", v.cliente.dni || "", v.pago?.metodo || "", l.nombre, l.cantidad, l.total.toFixed(2), v.total.toFixed(2), v.receta?.numero || ""]);
      }
    }
    downloadCsv(rows, `farmacia-alora-ventas-${Date.now()}.csv`);
    toast("CSV exportado", "ok");
  }

  function exportLibro() {
    const rows = [["fecha", "producto", "pa", "cantidad", "paciente", "dni", "receta", "ticket", "operador"]];
    for (const r of state.libroEstupefacientes) {
      rows.push([formatShort(r.fecha), r.nombre, r.principioActivo, r.cantidad, r.pacienteNombre, r.pacienteDni, r.recetaNumero, r.ticketId, r.operador]);
    }
    downloadCsv(rows, `libro-estupefacientes-${Date.now()}.csv`);
    toast("Libro exportado", "ok");
  }

  function downloadCsv(rows, name) {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
    if (name === "caja") renderCaja();
    if (name === "informes") renderInforme();
    if (name === "pacientes") renderPacientes();
    if (name === "libro") renderLibro();
  }

  function closeModals() {
    $$(".modal.open").forEach((m) => m.classList.remove("open"));
  }

  function bindEvents() {
    $("#pause-btn").addEventListener("click", () => { state.paused = !state.paused; lastFrame = 0; save(); renderClock(); });
    $("#btn-guardia").addEventListener("click", () => {
      state.settings.enGuardia = !state.settings.enGuardia;
      if (state.settings.enGuardia) toast("Modo guardia activo: atención 24h", "ok");
      else toast("Guardia desactivada", "warn");
      renderClock();
      save();
    });

    $$(".tab").forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

    ["search-q", "filter-cat", "filter-receta", "filter-marca", "filter-pa"].forEach((id) => {
      $("#" + id).addEventListener("input", () => {
        sintomaActivo = "";
        renderSintomas();
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderCatalog, 100);
      });
      $("#" + id).addEventListener("change", () => { sintomaActivo = ""; renderSintomas(); renderCatalog(); });
    });

    $("#sintomas-row").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sintoma]");
      if (!btn) return;
      sintomaActivo = btn.dataset.sintoma || "";
      $("#search-q").value = sintomaActivo;
      renderSintomas();
      renderCatalog();
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

    $("#btn-cobrar").addEventListener("click", openPagoModal);
    $("#btn-vaciar").addEventListener("click", () => { state.cart = []; renderCart(); refreshClinicalAlerts(); save(); });
    $("#btn-sugerir-generico").addEventListener("click", openGenericos);
    $("#btn-print").addEventListener("click", () => window.print());
    $("#btn-csv").addEventListener("click", exportCSV);
    $("#btn-libro-csv").addEventListener("click", exportLibro);
    $("#btn-refresh-informe").addEventListener("click", renderInforme);
    $("#btn-spawn").addEventListener("click", () => { state.cola.push(crearPedido()); renderCola(); save(); toast("Nuevo cliente", "ok"); });

    $("#cola-list").addEventListener("click", (e) => {
      const a = e.target.closest("[data-atender]");
      const d = e.target.closest("[data-descartar]");
      if (a) atenderPedido(a.dataset.atender);
      if (d) { state.cola = state.cola.filter((p) => p.id !== d.dataset.descartar); renderCola(); save(); }
    });

    $("#mutua-select").addEventListener("change", (e) => { state.mutuaId = e.target.value; renderCart(); save(); });
    $("#descuento-pct").addEventListener("input", (e) => { state.descuentoPct = Number(e.target.value) || 0; renderCart(); });
    $("#descuento-pct").addEventListener("change", save);
    ["cliente-nombre", "cliente-dni", "cliente-tel"].forEach((id) => {
      $("#" + id).addEventListener("change", () => {
        state.clienteActual.nombre = $("#cliente-nombre").value.trim();
        state.clienteActual.dni = $("#cliente-dni").value.trim().toUpperCase();
        state.clienteActual.telefono = $("#cliente-tel").value.trim();
        const pac = state.pacientes.find((p) => p.dni === state.clienteActual.dni);
        state.clienteActual.pacienteId = pac?.id || null;
        if (pac) state.mutuaId = pac.mutuaId;
        renderMutuas();
        renderPacienteChips();
        refreshClinicalAlerts();
        save();
      });
    });

    $("#btn-nueva-receta").addEventListener("click", () => openRecetaModal(null));
    $("#btn-limpiar-receta").addEventListener("click", () => { state.recetaActiva = null; renderReceta(); save(); });
    $("#btn-rx-guardar").addEventListener("click", saveRecetaModal);
    $("#btn-rx-cerrar").addEventListener("click", () => $("#modal-receta").classList.remove("open"));

    $("#btn-confirmar-pago").addEventListener("click", confirmarPago);
    $("#btn-cancelar-pago").addEventListener("click", () => $("#modal-pago").classList.remove("open"));
    $("#metodos-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-metodo]");
      if (!b) return;
      pagoMetodo = b.dataset.metodo;
      updatePagoUI();
    });
    $("#pago-recibido").addEventListener("input", updatePagoUI);
    ["mixto-efectivo", "mixto-tarjeta", "mixto-bizum"].forEach((id) => $("#" + id).addEventListener("input", updatePagoUI));
    $("#quick-cash").addEventListener("click", (e) => {
      const b = e.target.closest("[data-quick]");
      if (!b) return;
      const tot = cartTotals().aPagar;
      if (b.dataset.quick === "exacto") $("#pago-recibido").value = tot.toFixed(2);
      else {
        const n = Number(b.dataset.quick);
        const cur = Number($("#pago-recibido").value) || 0;
        $("#pago-recibido").value = (cur < tot ? n : Caja.round2(cur + n)).toFixed(2);
        if (Number($("#pago-recibido").value) < tot) $("#pago-recibido").value = Math.max(n, Math.ceil(tot / n) * n).toFixed(2);
      }
      updatePagoUI();
    });

    $("#btn-load-paciente").addEventListener("click", () => showTab("pacientes"));
    $("#btn-nuevo-paciente").addEventListener("click", () => openPacienteModal(null));
    $("#btn-guardar-paciente").addEventListener("click", savePacienteModal);
    $("#btn-cerrar-paciente").addEventListener("click", () => $("#modal-paciente").classList.remove("open"));
    $("#paciente-search").addEventListener("input", renderPacientes);
    $("#pacientes-list").addEventListener("click", (e) => {
      const usar = e.target.closest("[data-usar-pac]");
      const ver = e.target.closest("[data-ver-pac]");
      if (usar) usarPaciente(usar.dataset.usarPac);
      if (ver) { selectedPacienteId = ver.dataset.verPac; renderPacientes(); }
    });
    $("#paciente-detail").addEventListener("click", (e) => {
      const ed = e.target.closest("[data-edit-pac]");
      if (ed) openPacienteModal(state.pacientes.find((p) => p.id === ed.dataset.editPac));
    });

    $("#btn-cerrar-generico").addEventListener("click", () => $("#modal-generico").classList.remove("open"));
    $("#generico-list").addEventListener("click", (e) => {
      const b = e.target.closest("[data-sub-old]");
      if (!b) return;
      replaceInCart(Number(b.dataset.subOld), Number(b.dataset.subNew));
      $("#modal-generico").classList.remove("open");
    });

    $("#btn-abrir-caja").addEventListener("click", () => {
      state.caja = Caja.defaultCaja(state.gameTimeMs);
      renderCaja(); renderStats(); save();
      toast("Caja abierta con fondo", "ok");
    });
    $("#btn-arqueo").addEventListener("click", () => {
      const r = Caja.resumenCaja(state.caja, state.ventas.filter((v) => dayKey(v.fechaJuego) === dayKey(state.gameTimeMs)));
      state.caja.abierta = false;
      state.caja.cierreMs = state.gameTimeMs;
      renderCaja(); save();
      alert(`Arqueo de caja\nContado: ${euro(r.contado)}\nTeórico: ${euro(r.teorico)}\nDiferencia: ${euro(r.diferencia)}`);
      toast("Caja cerrada (arqueo)", "warn");
    });

    $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("open"); }));

    $("#btn-reset").addEventListener("click", () => {
      if (!confirm("¿Restablecer todo el simulador?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState(productos);
      state.cola.push(crearPedido(), crearPedido(), crearPedido());
      bindStateToForm();
      renderAll();
      save();
      toast("Reiniciado", "ok");
    });
    $("#btn-restock").addEventListener("click", () => {
      for (const p of productos) state.stock[p.id] = p.stockInicial;
      renderCatalog(); save(); toast("Stock repuesto", "ok");
    });
    $("#btn-export-json").addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ state, totalProductos: productos.length }, null, 2)], { type: "application/json" }));
      a.download = "farmacia-alora-estado.json";
      a.click();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeModals(); e.preventDefault(); return; }
      if (e.key === "F2") { e.preventDefault(); showTab("venta"); $("#search-q").focus(); $("#search-q").select(); return; }
      if (e.key === "F4") { e.preventDefault(); openPagoModal(); }
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
    renderSintomas();
    renderCatalog();
    renderCart();
    renderReceta();
    renderCola();
    renderStats();
    renderCaja();
    renderLibro();
    renderPacientes();
    refreshClinicalAlerts();
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
