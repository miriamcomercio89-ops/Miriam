/**
 * Farmacia Álora TPV — práctica completa
 * 1 min real = 1 h juego · clientes procedurales · caja euro visual
 */
(function () {
  "use strict";

  const STORAGE_KEY = "farmacia-alora-v3";
  const REAL_MS_PER_GAME_HOUR = 60 * 1000;
  const Clinica = window.FarmaciaClinica;
  const Caja = window.FarmaciaCaja;
  const Clientes = window.FarmaciaClientes;
  const Sounds = window.FarmaciaSounds;

  const MUTUAS = [
    { id: "particular", nombre: "Particular", cobertura: 0 },
    { id: "ss", nombre: "Seguridad Social (SNS)", cobertura: 0 },
    { id: "adeslas", nombre: "Adeslas", cobertura: 0.5 },
    { id: "sanitas", nombre: "Sanitas", cobertura: 0.5 },
    { id: "asisa", nombre: "Asisa", cobertura: 0.45 },
    { id: "dkv", nombre: "DKV", cobertura: 0.5 },
    { id: "mapfre", nombre: "Mapfre", cobertura: 0.4 },
    { id: "caser", nombre: "Caser", cobertura: 0.4 },
    { id: "axa", nombre: "AXA Health", cobertura: 0.35 },
  ];

  const MEDICOS = [
    { nombre: "Dra. Elena Vargas", colegiado: "29/28451" },
    { nombre: "Dr. Pablo Herrera", colegiado: "29/19302" },
    { nombre: "Dra. Sofía Mendoza", colegiado: "29/31044" },
    { nombre: "Dr. Luis Cabrera", colegiado: "29/15788" },
  ];

  let state, productos = [], catalogMeta = null;
  let clockTimer = null, lastFrame = 0, searchTimer = null;
  let sintomaActivo = "", pagoMetodo = "efectivo";
  let pacienteEditId = null, selectedPacienteId = null, almPickId = null;
  let soundOn = true;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const euro = (n) => (Number(n) || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
  function formatGameDate(ms) {
    const d = new Date(ms);
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    return `${dias[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function formatShort(ms) {
    const d = new Date(ms);
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function toast(msg, type="ok") {
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3200);
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function genRecetaNum(r, fechaMs) {
    const d = new Date(fechaMs);
    return `RE-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(100000 + r()*899999)}`;
  }

  function seasonInfo(ms) {
    const m = new Date(ms).getMonth();
    if (m === 11 || m <= 1) return { id: "invierno", label: "❄ Invierno", boost: ["tos","congestión","fiebre","dolor de cabeza","vitaminas"] };
    if (m >= 2 && m <= 4) return { id: "primavera", label: "🌸 Primavera", boost: ["alergia","congestión","piel irritada"] };
    if (m >= 5 && m <= 7) return { id: "verano", label: "☀ Verano", boost: ["solar","piel irritada","diarrea"] };
    return { id: "otono", label: "🍂 Otoño", boost: ["vitaminas","tos","estres","fiebre"] };
  }

  function makeOfertas(list) {
    const r = rng(20260813 ^ list.length);
    const otc = list.filter((p) => !p.requiereReceta);
    const ids = [];
    for (let i = 0; i < 40 && otc.length; i++) ids.push(pick(r, otc).id);
    return [...new Set(ids)];
  }

  function defaultState(list) {
    const stock = {}, lotes = {};
    for (const p of list) {
      stock[p.id] = p.stockInicial ?? p.stock;
      lotes[p.id] = { lote: p.lote, caducidadMs: p.caducidadMs, stockMinimo: p.stockMinimo || 10 };
    }
    const start = new Date(); start.setHours(9,0,0,0);
    return {
      version: 3,
      gameTimeMs: start.getTime(),
      paused: false,
      stock, lotes,
      cart: [],
      recetaActiva: null,
      mutuaId: "particular",
      tramoSNS: "particular",
      flagsDesc: { pensionista: false, familia: false, oferta: true },
      clienteActual: emptyCliente(),
      cola: [],
      ventas: [],
      recetasValidadas: [],
      pacientes: [],
      libroEstupefacientes: [],
      pedidosAlmacen: [],
      ofertasDia: makeOfertas(list),
      caja: Caja.defaultCaja(start.getTime()),
      stats: { tickets: 0, facturacion: 0, recetas: 0 },
      nextCustomerAt: start.getTime() + 15 * 60 * 1000,
      settings: { horarioManana:[9,14], horarioTarde:[17,20.5], abiertoSabadoManana:true, enGuardia:false },
    };
  }

  function emptyCliente() {
    return {
      nombre:"", dni:"", telefono:"", pacienteId:null, seedId:null,
      tramoSNS:"particular", familiaNumerosa:false,
      peticionTexto:"", sintomas:[], alergias:[], cronicos:[],
      embarazo:false, lactancia:false, edad:null,
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        ventas: state.ventas.slice(-500),
        libroEstupefacientes: state.libroEstupefacientes.slice(-500),
        pacientes: state.pacientes.slice(0, 200),
        cola: state.cola.slice(0, 20),
      }));
    } catch (e) { console.warn(e); }
  }

  function load(list) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState(list);
      const data = JSON.parse(raw);
      const base = defaultState(list);
      return {
        ...base, ...data,
        stock: { ...base.stock, ...(data.stock || {}) },
        lotes: { ...base.lotes, ...(data.lotes || {}) },
        flagsDesc: { ...base.flagsDesc, ...(data.flagsDesc || {}) },
        settings: { ...base.settings, ...(data.settings || {}) },
        caja: data.caja || base.caja,
        ofertasDia: data.ofertasDia?.length ? data.ofertasDia : base.ofertasDia,
        pedidosAlmacen: data.pedidosAlmacen || [],
        pacientes: data.pacientes || [],
      };
    } catch { return defaultState(list); }
  }

  function isOutsideNormal(ms) {
    const d = new Date(ms), day = d.getDay(), hour = d.getHours() + d.getMinutes()/60;
    const { horarioManana:m, horarioTarde:t, abiertoSabadoManana } = state.settings;
    if (day === 0) return true;
    if (day === 6) return !(abiertoSabadoManana && hour >= m[0] && hour < m[1]);
    return !((hour >= m[0] && hour < m[1]) || (hour >= t[0] && hour < t[1]));
  }
  function isOpenAt(ms) { return state.settings.enGuardia || !isOutsideNormal(ms); }

  function daysToExpiry(p) {
    const cad = state.lotes[p.id]?.caducidadMs ?? p.caducidadMs;
    return (cad - state.gameTimeMs) / (24*60*60*1000);
  }
  function isExpired(p) { return daysToExpiry(p) < 0; }
  function expiresSoon(p) { const d = daysToExpiry(p); return d >= 0 && d <= 60; }
  function isLow(p) {
    const st = state.stock[p.id] || 0;
    const min = state.lotes[p.id]?.stockMinimo ?? p.stockMinimo ?? 10;
    return st > 0 && st <= min;
  }
  function isOut(p) { return (state.stock[p.id] || 0) <= 0; }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    const dt = Math.min(1000, now - lastFrame);
    lastFrame = now;
    if (!state.paused) {
      state.gameTimeMs += (dt / REAL_MS_PER_GAME_HOUR) * 3600 * 1000;
      maybeSpawnCustomer();
      receiveWarehouse();
      if (Math.floor(now/5000) !== Math.floor((now-dt)/5000)) save();
    }
    renderClock();
    clockTimer = requestAnimationFrame(tick);
  }

  function renderClock() {
    const open = isOpenAt(state.gameTimeMs);
    const season = seasonInfo(state.gameTimeMs);
    $("#game-clock").textContent = formatGameDate(state.gameTimeMs);
    const badge = $("#open-badge");
    if (state.settings.enGuardia && isOutsideNormal(state.gameTimeMs)) {
      badge.textContent = "Guardia"; badge.className = "badge badge-purple";
    } else {
      badge.textContent = open ? "Abierta" : "Cerrada";
      badge.className = "badge " + (open ? "badge-ok" : "badge-warn");
    }
    $("#season-badge").textContent = season.label;
    $("#guardia-badge").classList.toggle("hidden", !state.settings.enGuardia);
    $("#btn-guardia").textContent = state.settings.enGuardia ? "Quitar guardia" : "Guardia";
    $("#pause-btn").textContent = state.paused ? "▶ Reanudar" : "⏸ Pausar";
  }

  function maybeSpawnCustomer() {
    if (state.gameTimeMs < state.nextCustomerAt) return;
    if (!isOpenAt(state.gameTimeMs)) { state.nextCustomerAt = state.gameTimeMs + 30*60*1000; return; }
    if (state.cola.length >= 12) { state.nextCustomerAt = state.gameTimeMs + 10*60*1000; return; }
    state.cola.push(crearPedido());
    Sounds.beepCustomer();
    const r = rng(Math.floor(state.gameTimeMs) ^ state.cola.length);
    state.nextCustomerAt = state.gameTimeMs + (7 + Math.floor(r()*22)) * 60 * 1000;
    renderCola();
    save();
  }

  function crearPedido() {
    const season = seasonInfo(state.gameTimeMs);
    let cli = Clientes.clienteAleatorio(Math.floor(state.gameTimeMs));
    // sesgo temporada
    if (cli.sintomas.length && Math.random() < 0.45) {
      cli = { ...cli, sintomas: [pick(rng(cli.seedId), season.boost)], peticionTexto: `Por la temporada: me viene bien algo para ${season.boost[0]}. ${cli.peticionTexto}` };
    }
    let receta = null;
    if (cli.quiereReceta) {
      const r = rng(cli.seedId);
      const pool = productos.filter((p) => p.requiereReceta && !isExpired(p));
      const items = [];
      for (let i = 0; i < 1 + Math.floor(r()*2) && pool.length; i++) {
        const p = pick(r, pool);
        items.push({ productId: p.id, nombre: p.nombre, cantidad: 1, controlado: p.controlado });
      }
      const med = pick(r, MEDICOS);
      const emitida = state.gameTimeMs - Math.floor(r()*8)*86400000;
      receta = {
        numero: genRecetaNum(r, emitida), tipo: "electronica",
        pacienteNombre: cli.nombre, pacienteDni: cli.dni,
        medico: med.nombre, colegiado: med.colegiado,
        fechaEmision: emitida, validezDias: items.some(i=>i.controlado)?10:30,
        productos: items, dispensada: false,
        observaciones: items.some(i=>i.controlado) ? "Controlado: registrar en libro." : "",
      };
    }
    return {
      id: "ped-" + cli.id + "-" + Date.now().toString(36),
      llegada: state.gameTimeMs,
      cliente: cli,
      receta,
      guardia: state.settings.enGuardia && isOutsideNormal(state.gameTimeMs),
    };
  }

  function receiveWarehouse() {
    let changed = false;
    for (const ped of state.pedidosAlmacen) {
      if (!ped.recibido && state.gameTimeMs >= ped.llegadaMs) {
        state.stock[ped.productId] = (state.stock[ped.productId] || 0) + ped.cantidad;
        // renovar lote al recibir
        state.lotes[ped.productId] = {
          ...(state.lotes[ped.productId] || {}),
          lote: "L" + Math.floor(100000 + Math.random()*899999),
          caducidadMs: state.gameTimeMs + (180 + Math.floor(Math.random()*400)) * 86400000,
        };
        ped.recibido = true;
        changed = true;
        toast(`Pedido recibido: ${ped.nombre} ×${ped.cantidad}`, "ok");
        Sounds.beepOk();
      }
    }
    if (changed) { renderAlmacen(); renderCatalog(); renderStats(); save(); }
  }

  function getMutua() { return MUTUAS.find((m) => m.id === state.mutuaId) || MUTUAS[0]; }

  function lineTotals(linea) {
    const p = productos.find((x) => x.id === linea.productId);
    if (!p) return { base:0, iva:0, total:0, coste:0, oferta:false };
    let precio = p.precio;
    let oferta = false;
    if (state.flagsDesc.oferta && state.ofertasDia.includes(p.id)) {
      precio = Caja.round2(precio * 0.85);
      oferta = true;
    }
    const base = precio * linea.cantidad;
    const iva = base * (p.iva / 100);
    const coste = (p.coste || p.precio * 0.65) * linea.cantidad;
    return { base, iva, total: base + iva, precio, ivaPct: p.iva, producto: p, coste, oferta };
  }

  function cartTotals() {
    let base = 0, iva = 0, coste = 0, brutoMed = 0;
    for (const l of state.cart) {
      const t = lineTotals(l);
      base += t.base; iva += t.iva; coste += t.coste;
      if (t.ivaPct === 4) brutoMed += t.total;
    }
    const bruto = base + iva;
    let descPct = 0;
    if (state.flagsDesc.pensionista || state.tramoSNS === "pensionista") descPct += 10;
    if (state.flagsDesc.familia || state.clienteActual.familiaNumerosa) descPct += 15;
    descPct = Math.min(40, descPct);
    const desc = bruto * (descPct / 100);
    const trasDesc = bruto - desc;

    // SNS aportación sobre medicamentos
    let cubiertoSNS = 0;
    if (state.tramoSNS !== "particular" && state.mutuaId === "ss") {
      const aport = Clientes.aportacionSNS(state.tramoSNS);
      const medTras = brutoMed * (1 - descPct / 100);
      cubiertoSNS = medTras * (1 - aport);
    }
    // mutua privada
    const mutua = getMutua();
    let cubiertoMutua = 0;
    if (mutua.cobertura > 0 && state.mutuaId !== "ss") {
      cubiertoMutua = brutoMed * (1 - descPct / 100) * mutua.cobertura;
    }
    const cubierto = cubiertoSNS + cubiertoMutua;
    const aPagar = Math.max(0, trasDesc - cubierto);
    return { base, iva, bruto, descPct, desc, trasDesc, cubierto, cubiertoSNS, cubiertoMutua, aPagar, mutua, coste, margen: Math.max(0, aPagar - coste * 0.5) };
  }

  function cartProducts() {
    return state.cart.map((l) => productos.find((x) => x.id === l.productId)).filter(Boolean);
  }

  function refreshClinicalAlerts() {
    const pac = {
      alergias: state.clienteActual.alergias || [],
      cronicos: state.clienteActual.cronicos || [],
      embarazo: !!state.clienteActual.embarazo,
      lactancia: !!state.clienteActual.lactancia,
    };
    const alerts = Clinica.analizarClinica(cartProducts(), pac);
    // stock / caducidad del carrito
    for (const l of state.cart) {
      const p = productos.find((x) => x.id === l.productId);
      if (!p) continue;
      if (isExpired(p)) alerts.push({ tipo:"caducidad", nivel:"grave", msg:`${p.nombre} está CADUCADO` });
      else if (expiresSoon(p)) alerts.push({ tipo:"caducidad", nivel:"moderada", msg:`${p.nombre} caduca pronto (${Math.ceil(daysToExpiry(p))} días)` });
      if (isLow(p)) alerts.push({ tipo:"stock", nivel:"leve", msg:`Stock bajo de ${p.nombre}` });
    }
    const bar = $("#alerts-bar");
    if (!alerts.length) { bar.hidden = true; bar.innerHTML = ""; return alerts; }
    bar.hidden = false;
    bar.innerHTML = alerts.map((a) => `<div class="alert alert-${a.nivel}">⚠ ${escapeHtml(a.msg)}</div>`).join("");
    return alerts;
  }

  function recetaVigente(receta) {
    if (!receta) return { ok:false, motivo:"No hay receta" };
    if (state.gameTimeMs > receta.fechaEmision + receta.validezDias*86400000) return { ok:false, motivo:"Receta caducada" };
    if (receta.dispensada) return { ok:false, motivo:"Ya dispensada" };
    if (!receta.numero || !receta.pacienteDni || !receta.medico) return { ok:false, motivo:"Datos incompletos" };
    return { ok:true, motivo:"Válida" };
  }

  function validarDispensacion() {
    const necesita = state.cart.filter((l) => productos.find((x)=>x.id===l.productId)?.requiereReceta);
    for (const l of state.cart) {
      const p = productos.find((x)=>x.id===l.productId);
      if (p && isExpired(p)) return { ok:false, motivo:`No se puede vender caducado: ${p.nombre}`, warnings:[] };
    }
    if (!necesita.length) return { ok:true, warnings:[] };
    const receta = state.recetaActiva;
    const vig = recetaVigente(receta);
    if (!vig.ok) return { ok:false, motivo:vig.motivo, warnings:[] };
    if (state.clienteActual.dni && receta.pacienteDni.toUpperCase() !== state.clienteActual.dni.toUpperCase()) {
      return { ok:false, motivo:"DNI no coincide con la receta", warnings:[] };
    }
    const warnings = [];
    for (const linea of necesita) {
      const p = productos.find((x)=>x.id===linea.productId);
      const en = receta.productos.find((rp)=>rp.productId===linea.productId);
      if (!en) return { ok:false, motivo:`"${p.nombre}" no está en la receta`, warnings };
      if (linea.cantidad > en.cantidad) return { ok:false, motivo:`Cantidad de "${p.nombre}" supera la prescrita`, warnings };
      if (p.controlado && !state.clienteActual.dni) return { ok:false, motivo:"Controlado: DNI obligatorio", warnings };
      if (p.controlado) warnings.push("Se registrará en el libro de estupefacientes.");
    }
    return { ok:true, warnings };
  }

  function addToCart(productId, qty=1) {
    const p = productos.find((x)=>x.id===productId);
    if (!p) return;
    if (isExpired(p)) { toast("Producto caducado: retíralo del stock", "err"); Sounds.beepWarn(); return; }
    const stock = state.stock[p.id] || 0;
    const existing = state.cart.find((l)=>l.productId===productId);
    const newQty = (existing?existing.cantidad:0) + qty;
    if (newQty > stock) { toast(`Stock insuficiente (${stock})`, "warn"); return; }
    if (existing) existing.cantidad = newQty;
    else state.cart.push({ productId, cantidad: qty });
    Sounds.beepCoin();
    renderCart(); refreshClinicalAlerts(); save();
    toast("Añadido al carrito", "ok");
  }

  function setCartQty(productId, qty) {
    const line = state.cart.find((l)=>l.productId===productId);
    if (!line) return;
    if (qty <= 0) state.cart = state.cart.filter((l)=>l.productId!==productId);
    else line.cantidad = Math.min(qty, state.stock[productId]||0);
    renderCart(); refreshClinicalAlerts(); save();
  }

  function replaceInCart(oldId, newId) {
    const line = state.cart.find((l)=>l.productId===oldId);
    if (!line) return;
    if ((state.stock[newId]||0) < line.cantidad) { toast("Poco stock del genérico", "warn"); return; }
    const other = state.cart.find((l)=>l.productId===newId);
    if (other) { other.cantidad += line.cantidad; state.cart = state.cart.filter((l)=>l.productId!==oldId); }
    else line.productId = newId;
    renderCart(); refreshClinicalAlerts(); save(); toast("Sustituido por genérico", "ok");
  }

  /* ---------- Pago TPV ---------- */
  function openPagoModal() {
    if (!state.cart.length) { toast("Carrito vacío: elige productos según lo que dice el cliente", "warn"); return; }
    if (!state.caja.abierta) { toast("Abre la caja primero", "warn"); showTab("caja"); return; }
    for (const l of state.cart) if ((state.stock[l.productId]||0) < l.cantidad) { toast("Stock insuficiente", "warn"); return; }
    const val = validarDispensacion();
    if (!val.ok) { toast(val.motivo, "err"); Sounds.beepWarn(); return; }
    const alerts = refreshClinicalAlerts();
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
      ...val.warnings.map((w)=>`<div class="alert alert-moderada">${escapeHtml(w)}</div>`),
      ...alerts.filter(a=>a.nivel!=="leve").map((a)=>`<div class="alert alert-${a.nivel}">${escapeHtml(a.msg)}</div>`),
    ].join("");
    $("#modal-pago").classList.add("open");
  }

  function renderMetodos() {
    $("#metodos-grid").innerHTML = Caja.METODOS.map((m) =>
      `<button type="button" class="metodo-btn ${pagoMetodo===m.id?"active":""}" data-metodo="${m.id}"><span>${m.icon}</span>${m.nombre}</button>`
    ).join("");
    $("#pago-euro-pad").innerHTML = Caja.DENOMS.map((d) => Caja.htmlDenom(d, state.caja.denoms[d.id]||0, { clickable:true })).join("");
    $("#quick-cash").innerHTML = ["exacto",5,10,20,50,100].map((n) =>
      `<button type="button" class="chip" data-quick="${n}">${n==="exacto"?"Exacto":n+" €"}</button>`
    ).join("");
  }

  function updatePagoUI() {
    const tot = cartTotals().aPagar;
    const ef = pagoMetodo === "efectivo";
    const mx = pagoMetodo === "mixto";
    $("#pago-efectivo-panel").classList.toggle("hidden", !ef);
    $("#pago-mixto-panel").classList.toggle("hidden", !mx);
    $$(".metodo-btn").forEach((b)=>b.classList.toggle("active", b.dataset.metodo===pagoMetodo));
    if (ef) {
      const recibido = Number($("#pago-recibido").value)||0;
      const cambio = Caja.round2(Math.max(0, recibido - tot));
      $("#pago-cambio").textContent = euro(cambio);
      const calc = Caja.calcularCambio(cambio, state.caja.denoms);
      $("#cambio-desglose").innerHTML = calc.desglose.length
        ? calc.desglose.map((d)=>Caja.htmlDenom(d, d.cantidad, { dim: !!d.sinStock })).join("")
        : `<span class="muted">Sin cambio</span>`;
    }
    if (mx) {
      const a=Number($("#mixto-efectivo").value)||0, b=Number($("#mixto-tarjeta").value)||0, c=Number($("#mixto-bizum").value)||0;
      $("#mixto-suma").textContent = euro(a+b+c);
    }
  }

  function confirmarPago() {
    const tot = cartTotals();
    const total = tot.aPagar;
    let pago = { metodo:pagoMetodo, total, recibido:0, cambio:0, mixto:null, cambioUsado:null, entregaDenoms:null };
    if (pagoMetodo === "efectivo") {
      const recibido = Number($("#pago-recibido").value)||0;
      if (recibido + 1e-9 < total) { toast("Falta dinero", "err"); return; }
      const cambio = Caja.round2(recibido - total);
      const calc = Caja.calcularCambio(cambio, state.caja.denoms);
      pago = { ...pago, recibido, cambio, cambioUsado: calc.usado, entregaDenoms: Caja.desgloseEntregaRapida(recibido) };
    } else if (pagoMetodo === "mixto") {
      const ef=Number($("#mixto-efectivo").value)||0, tj=Number($("#mixto-tarjeta").value)||0, bz=Number($("#mixto-bizum").value)||0;
      if (Caja.round2(ef+tj+bz)+1e-9 < total) { toast("La suma no llega", "err"); return; }
      pago.mixto = { efectivo:ef, tarjeta:tj, bizum:bz };
      pago.recibido = ef;
      if (ef>0) pago.entregaDenoms = Caja.desgloseEntregaRapida(ef);
    } else pago.recibido = total;
    finalizarVenta(pago, tot);
  }

  function finalizarVenta(pago, tot) {
    const lineas = state.cart.map((l) => {
      const t = lineTotals(l);
      return {
        productId:l.productId, nombre:t.producto.nombre, cantidad:l.cantidad, precio:t.precio,
        coste:t.coste/l.cantidad, iva:t.ivaPct, base:t.base, total:t.total,
        requiereReceta:t.producto.requiereReceta, controlado:t.producto.controlado,
        principioActivo:t.producto.principioActivo, ean:t.producto.ean, oferta:t.oferta,
        lote: state.lotes[l.productId]?.lote || t.producto.lote,
      };
    });
    const ticket = {
      id: "T-" + Date.now().toString(36).toUpperCase(),
      fechaJuego: state.gameTimeMs, fechaReal: Date.now(),
      cliente: { ...state.clienteActual },
      mutua: tot.mutua.nombre, mutuaId: tot.mutua.id, tramoSNS: state.tramoSNS,
      descuentoPct: tot.descPct, descuento: tot.desc,
      coberturaMutua: tot.cubierto, base: tot.base, iva: tot.iva, bruto: tot.bruto,
      total: tot.aPagar, margen: tot.margen, coste: tot.coste, lineas, pago,
      guardia: state.settings.enGuardia && isOutsideNormal(state.gameTimeMs),
      season: seasonInfo(state.gameTimeMs).id,
      receta: state.recetaActiva ? {
        numero: state.recetaActiva.numero, pacienteDni: state.recetaActiva.pacienteDni,
        medico: state.recetaActiva.medico, colegiado: state.recetaActiva.colegiado, tipo: state.recetaActiva.tipo,
      } : null,
    };

    for (const l of state.cart) state.stock[l.productId] -= l.cantidad;

    for (const l of lineas) {
      if (!l.controlado) continue;
      state.libroEstupefacientes.unshift({
        id: "LE-" + Date.now().toString(36) + l.productId, fecha: state.gameTimeMs, tipo:"salida",
        productId:l.productId, nombre:l.nombre, principioActivo:l.principioActivo, cantidad:l.cantidad,
        pacienteDni: state.clienteActual.dni || ticket.receta?.pacienteDni || "—",
        pacienteNombre: state.clienteActual.nombre || "—",
        ticketId: ticket.id, recetaNumero: ticket.receta?.numero || "—",
        medico: ticket.receta?.medico || "—", operador: state.caja.operador,
      });
    }

    if (state.recetaActiva && lineas.some((l)=>l.requiereReceta)) {
      state.recetaActiva.dispensada = true;
      state.recetasValidadas.push({ ...state.recetaActiva, ticketId: ticket.id, fecha: state.gameTimeMs });
      state.stats.recetas += 1;
      state.recetaActiva = null;
    }

    // guardar ficha reciente
    upsertPacienteFromCliente(state.clienteActual, ticket);

    state.caja = Caja.registrarPago(state.caja, {
      fecha: state.gameTimeMs, metodo: pago.metodo, total: ticket.total,
      recibido: pago.recibido, cambio: pago.cambio, ticketId: ticket.id,
      mixto: pago.mixto, cambioUsado: pago.cambioUsado, entregaDenoms: pago.entregaDenoms,
    });

    state.ventas.push(ticket);
    state.stats.tickets += 1;
    state.stats.facturacion += ticket.total;
    state.cart = [];
    $("#modal-pago").classList.remove("open");
    Sounds.beepOk();
    save();
    renderCart(); renderReceta(); renderStats(); renderCatalog();
    renderCaja(); renderLibro(); renderPacientes(); renderSpeech();
    refreshClinicalAlerts();
    mostrarTicket(ticket);
    toast("Cobro TPV OK", "ok");
  }

  function upsertPacienteFromCliente(cli, ticket) {
    if (!cli.dni) return;
    let p = state.pacientes.find((x)=>x.dni===cli.dni);
    if (!p) {
      p = {
        id: cli.id || ("pac-" + Date.now().toString(36)),
        nombre: cli.nombre, dni: cli.dni, telefono: cli.telefono || "",
        mutuaId: state.mutuaId, tramoSNS: state.tramoSNS,
        alergias: cli.alergias||[], cronicos: cli.cronicos||[],
        embarazo: !!cli.embarazo, lactancia: !!cli.lactancia,
        familiaNumerosa: !!cli.familiaNumerosa, notas: "", historial: [],
      };
      state.pacientes.unshift(p);
    }
    p.historial.unshift({ ticketId: ticket.id, fecha: ticket.fechaJuego, total: ticket.total, items: ticket.lineas.map(l=>l.nombre) });
    p.historial = p.historial.slice(0, 25);
    state.pacientes = state.pacientes.slice(0, 200);
  }

  /* ---------- Render ---------- */
  function filteredProducts() {
    if (sintomaActivo) return Clinica.filtrarPorSintoma(productos, sintomaActivo, state.stock);
    const f = {
      q: ($("#search-q").value||"").trim().toLowerCase(),
      cat: $("#filter-cat").value,
      receta: $("#filter-receta").value,
      marca: ($("#filter-marca").value||"").trim().toLowerCase(),
      pa: ($("#filter-pa").value||"").trim().toLowerCase(),
    };
    return productos.filter((p) => {
      if (f.cat && p.categoria !== f.cat) return false;
      if (f.receta === "con" && !p.requiereReceta) return false;
      if (f.receta === "sin" && p.requiereReceta) return false;
      if (f.receta === "controlado" && !p.controlado) return false;
      if (f.receta === "oferta" && !state.ofertasDia.includes(p.id)) return false;
      if (f.receta === "caduca" && !expiresSoon(p)) return false;
      if (f.receta === "bajo" && !isLow(p) && !isOut(p)) return false;
      if (f.marca && !(p.marca||"").toLowerCase().includes(f.marca)) return false;
      if (f.pa && !(p.principioActivo||"").toLowerCase().includes(f.pa)) return false;
      if (f.q) {
        const blob = `${p.nombre} ${p.marca} ${p.principioActivo} ${(p.sintomas||[]).join(" ")} ${p.categoria} ${p.ean}`.toLowerCase();
        if (!blob.includes(f.q)) return false;
      }
      return true;
    });
  }

  function renderSintomas() {
    const list = Clinica.SINTOMAS_UI || [];
    $("#sintomas-row").innerHTML = `<button type="button" class="chip ${!sintomaActivo?"active":""}" data-sintoma="">Todos</button>` +
      list.map((s)=>`<button type="button" class="chip ${sintomaActivo===s?"active":""}" data-sintoma="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("");
  }

  function renderCatalog() {
    const list = filteredProducts();
    const slice = list.slice(0, 80);
    $("#catalog-count").textContent = `${list.length.toLocaleString("es-ES")} productos` + (list.length>80?` (80)`:"");
    $("#catalog-body").innerHTML = slice.map((p) => {
      const stock = state.stock[p.id]??0;
      const offer = state.ofertasDia.includes(p.id);
      const badges = [
        p.requiereReceta?'<span class="tag tag-rx">Receta</span>':'<span class="tag tag-otc">OTC</span>',
        p.controlado?'<span class="tag tag-ctrl">CTRL</span>':"",
        p.esGenerico?'<span class="tag tag-gen">EFG</span>':"",
        offer?'<span class="tag tag-offer">−15% día</span>':"",
        expiresSoon(p)?'<span class="tag tag-exp">Caduca</span>':"",
        isExpired(p)?'<span class="tag tag-ctrl">CADUCADO</span>':"",
      ].join("");
      const precioShow = offer ? Caja.round2(p.precio*0.85) : p.precio;
      return `<tr>
        <td>
          <div class="prod-name">${escapeHtml(p.nombre)}</div>
          <div class="prod-meta">${escapeHtml(p.marca)} · ${escapeHtml(p.principioActivo)} · ${escapeHtml(p.categoria)} · lote ${escapeHtml(state.lotes[p.id]?.lote||p.lote||"—")}</div>
          <div class="prod-tags">${badges}</div>
        </td>
        <td>${euro(precioShow)} <span class="muted">+${p.iva}%</span></td>
        <td class="${stock<10||isLow(p)?"stock-low":""}">${stock}</td>
        <td><button class="btn btn-sm btn-primary" data-add="${p.id}" ${isExpired(p)?"disabled":""}>Añadir</button></td>
      </tr>`;
    }).join("") || `<tr><td colspan="4" class="empty">Sin resultados</td></tr>`;
  }

  function renderCart() {
    if (!state.cart.length) $("#cart-body").innerHTML = `<div class="empty">🧺 Vacío — escucha al cliente y elige productos</div>`;
    else {
      $("#cart-body").innerHTML = state.cart.map((l) => {
        const t = lineTotals(l); const p = t.producto;
        return `<div class="cart-line">
          <div class="cart-line-main">
            <strong>${escapeHtml(p.nombre)}</strong>
            <span class="muted">${euro(t.precio)}${t.oferta?" · oferta":""} · ${p.requiereReceta?"℞":"OTC"}</span>
          </div>
          <div class="cart-line-actions">
            <button class="btn btn-icon" data-dec="${p.id}">−</button><span>${l.cantidad}</span>
            <button class="btn btn-icon" data-inc="${p.id}">+</button>
            <button class="btn btn-icon danger" data-rem="${p.id}">✕</button>
          </div>
          <div class="cart-line-total">${euro(t.total)}</div>
        </div>`;
      }).join("");
    }
    const tot = cartTotals();
    $("#tot-bruto").textContent = euro(tot.bruto);
    $("#tot-desc").textContent = euro(tot.desc);
    $("#tot-mutua").textContent = euro(tot.cubierto);
    $("#tot-pagar").textContent = euro(tot.aPagar);
    renderPacienteChips();
  }

  function renderPacienteChips() {
    const c = state.clienteActual;
    const chips = [];
    if (c.edad) chips.push(`<span class="chip">${c.edad} años</span>`);
    if (c.alergias?.length) chips.push(...c.alergias.map((a)=>`<span class="chip danger">⚠ ${escapeHtml(a)}</span>`));
    if (c.embarazo) chips.push(`<span class="chip warn">Embarazo</span>`);
    if (c.lactancia) chips.push(`<span class="chip warn">Lactancia</span>`);
    if (c.familiaNumerosa) chips.push(`<span class="chip">Familia numerosa</span>`);
    if (c.cronicos?.length) chips.push(...c.cronicos.map((x)=>`<span class="chip">Crónico: ${escapeHtml(x)}</span>`));
    $("#paciente-chips").innerHTML = chips.join("");
  }

  function renderSpeech() {
    const c = state.clienteActual;
    const box = $("#cliente-habla");
    if (!c.peticionTexto) { box.classList.add("hidden"); return; }
    box.classList.remove("hidden");
    $("#speech-name").textContent = c.nombre || "Cliente";
    $("#speech-text").textContent = `«${c.peticionTexto}»`;
    $("#speech-tags").innerHTML = (c.sintomas||[]).map((s)=>`<button type="button" class="chip" data-sintoma="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("");
  }

  function renderReceta() {
    const r = state.recetaActiva;
    if (!r) {
      $("#receta-panel").innerHTML = `<p class="muted">Sin receta activa</p>`;
      $("#receta-status").textContent = "Sin receta";
      $("#receta-status").className = "badge badge-muted";
      return;
    }
    const vig = recetaVigente(r);
    $("#receta-status").textContent = vig.ok ? "Válida" : vig.motivo;
    $("#receta-status").className = "badge " + (vig.ok?"badge-ok":"badge-err");
    $("#receta-panel").innerHTML = `
      <div class="receta-grid">
        <div><span class="lbl">Nº</span> ${escapeHtml(r.numero)}</div>
        <div><span class="lbl">Médico</span> ${escapeHtml(r.medico)}</div>
        <div><span class="lbl">Paciente</span> ${escapeHtml(r.pacienteNombre)} (${escapeHtml(r.pacienteDni)})</div>
        <div><span class="lbl">Validez</span> ${r.validezDias} días</div>
      </div>
      <ul class="receta-items">${r.productos.map((p)=>`<li>${escapeHtml(p.nombre)} × ${p.cantidad}
        <button class="btn btn-sm btn-primary" data-add="${p.productId}">Añadir</button></li>`).join("")}</ul>`;
  }

  function renderCola() {
    $("#cola-count").textContent = String(state.cola.length);
    if (!state.cola.length) { $("#cola-list").innerHTML = `<div class="empty">💬 Nadie en cola</div>`; return; }
    $("#cola-list").innerHTML = state.cola.map((ped) => `
      <article class="pedido-card ${ped.guardia?"guardia":""}">
        <header><strong>${escapeHtml(ped.cliente.nombre)}</strong><span class="muted">${formatShort(ped.llegada)}</span></header>
        <div class="muted tiny">${escapeHtml(ped.cliente.id)} · ${ped.cliente.edad||"?"} años · SNS: ${escapeHtml(ped.cliente.tramoSNS)}</div>
        <p class="quote">«${escapeHtml(ped.cliente.peticionTexto)}»</p>
        <div>${(ped.cliente.sintomas||[]).map(s=>`<span class="chip">${escapeHtml(s)}</span>`).join("")}
          ${ped.receta?'<span class="tag tag-rx">Trae receta</span>':""}
          ${ped.cliente.familiaNumerosa?'<span class="chip">Familia numerosa</span>':""}
        </div>
        <div class="pedido-actions" style="margin-top:10px">
          <button class="btn btn-sm btn-primary" data-atender="${ped.id}">Atender</button>
          <button class="btn btn-sm" data-descartar="${ped.id}">Descartar</button>
        </div>
      </article>`).join("");
  }

  function renderStats() {
    $("#stat-catalog").textContent = productos.length.toLocaleString("es-ES");
    $("#stat-tickets").textContent = String(state.stats.tickets);
    $("#stat-fact").textContent = euro(state.stats.facturacion);
    const low = productos.filter(isLow).length + productos.filter(isOut).length;
    const exp = productos.filter(expiresSoon).length;
    $("#stat-low").textContent = String(low);
    $("#stat-exp").textContent = String(exp);
  }

  function renderMutuas() {
    const opts = MUTUAS.map((m)=>`<option value="${m.id}">${m.nombre}</option>`).join("");
    $("#mutua-select").innerHTML = opts;
    $("#mutua-select").value = state.mutuaId;
    $("#np-mutua").innerHTML = opts;
  }

  function renderCategorias() {
    const cats = (catalogMeta.categorias||[]).slice().sort((a,b)=>a.localeCompare(b,"es"));
    $("#filter-cat").innerHTML = `<option value="">Todas (${cats.length} categorías)</option>` +
      cats.map((c)=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  function renderCaja() {
    const hoy = state.ventas.filter((v)=>dayKey(v.fechaJuego)===dayKey(state.gameTimeMs));
    const r = Caja.resumenCaja(state.caja, hoy);
    $("#caja-estado").textContent = state.caja.abierta ? "Abierta" : "Cerrada";
    $("#caja-estado").className = "badge " + (state.caja.abierta?"badge-ok":"badge-warn");
    $("#caja-resumen").innerHTML = `
      <div class="caja-kpi"><div class="lbl">Terminal</div><strong>${escapeHtml(state.caja.terminal||"TPV")}</strong></div>
      <div class="caja-kpi"><div class="lbl">Sesión</div><strong>${escapeHtml(state.caja.sesionId)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Fondo</div><strong>${euro(state.caja.fondoInicial)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Contado</div><strong>${euro(r.contado)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Teórico</div><strong>${euro(r.teorico)}</strong></div>
      <div class="caja-kpi"><div class="lbl">Diferencia</div><strong style="color:${r.diferencia===0?"var(--ok)":"var(--red)"}">${euro(r.diferencia)}</strong></div>`;
    $("#caja-denoms").innerHTML = Caja.DENOMS.map((d)=>Caja.htmlDenom(d, state.caja.denoms[d.id]||0)).join("");
    $("#caja-movimientos").innerHTML = (state.caja.movimientos||[]).slice().reverse().slice(0,50).map((m)=>`
      <div class="list-item"><div><strong>${escapeHtml(m.metodo)}</strong><div class="muted tiny">${formatShort(m.fecha)} · ${escapeHtml(m.ticketId||"")}${m.cambio?` · cambio ${euro(m.cambio)}`:""}</div></div><strong>${euro(m.total)}</strong></div>`
    ).join("") || `<div class="empty">Sin movimientos</div>`;
  }

  function renderAlmacen() {
    const pending = state.pedidosAlmacen.filter((p)=>!p.recibido);
    $("#alm-count").textContent = String(pending.length);
    $("#alm-pedidos").innerHTML = state.pedidosAlmacen.slice().reverse().slice(0,40).map((p)=>`
      <div class="list-item">
        <div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">×${p.cantidad} · llega ${formatShort(p.llegadaMs)} · ${p.recibido?"RECIBIDO":"EN CAMINO"}</div></div>
        <span class="badge ${p.recibido?"badge-ok":"badge-warn"}">${p.recibido?"OK":"…"}</span>
      </div>`).join("") || `<div class="empty">Sin pedidos</div>`;

    const lows = productos.filter((p)=>isLow(p)||isOut(p)).slice(0,30);
    const exps = productos.filter((p)=>expiresSoon(p)||isExpired(p)).slice(0,30);
    $("#alm-alertas").innerHTML = [
      ...lows.map((p)=>`<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">Stock ${state.stock[p.id]||0} / mín ${state.lotes[p.id]?.stockMinimo||p.stockMinimo}</div></div>
        <button class="btn btn-sm btn-primary" data-pedir="${p.id}">Pedir</button></div>`),
      ...exps.map((p)=>`<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">${isExpired(p)?"CADUCADO":"Caduca en "+Math.ceil(daysToExpiry(p))+" días"} · lote ${escapeHtml(state.lotes[p.id]?.lote||"")}</div></div>
        <span class="badge badge-warn">📅</span></div>`),
    ].join("") || `<div class="empty">Sin alertas</div>`;
  }

  function renderLibro() {
    const rows = state.libroEstupefacientes;
    if (!rows.length) { $("#libro-list").innerHTML = `<div class="empty">Sin registros</div>`; return; }
    $("#libro-list").innerHTML = `<table><thead><tr><th>Fecha</th><th>Producto</th><th>Ud</th><th>Paciente</th><th>Receta</th><th>Ticket</th></tr></thead><tbody>
      ${rows.map((r)=>`<tr><td>${formatShort(r.fecha)}</td><td>${escapeHtml(r.nombre)}</td><td>${r.cantidad}</td>
      <td>${escapeHtml(r.pacienteNombre)}<div class="muted tiny">${escapeHtml(r.pacienteDni)}</div></td>
      <td>${escapeHtml(r.recetaNumero)}</td><td>${escapeHtml(r.ticketId)}</td></tr>`).join("")}</tbody></table>`;
  }

  function renderInforme() {
    const hoy = state.ventas.filter((v)=>dayKey(v.fechaJuego)===dayKey(state.gameTimeMs));
    const r = Caja.resumenCaja(state.caja, hoy);
    const topMap = {};
    for (const v of hoy) for (const l of v.lineas) topMap[l.nombre]=(topMap[l.nombre]||0)+l.cantidad;
    const top = Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const season = seasonInfo(state.gameTimeMs);
    $("#informe-content").innerHTML = `
      <div class="informe-card"><h3>🏪 Farmacia Álora</h3>
        <p>${formatGameDate(state.gameTimeMs)}</p>
        <p>Temporada: <strong>${season.label}</strong></p>
        <p>Tickets: <strong>${hoy.length}</strong></p>
        <p>Facturación: <strong>${euro(r.facturacion)}</strong></p>
        <p>Margen est.: <strong>${euro(r.margen)}</strong></p>
      </div>
      <div class="informe-card"><h3>💳 Métodos TPV</h3>
        ${Caja.METODOS.map((m)=>`<p>${m.icon} ${m.nombre}: ${euro(r.porMetodo[m.id]||0)}</p>`).join("")}
      </div>
      <div class="informe-card"><h3>🏆 Top productos</h3>
        <ol>${top.map(([n,c])=>`<li>${escapeHtml(n)} ×${c}</li>`).join("")||"<li>Sin datos</li>"}</ol>
      </div>
      <div class="informe-card"><h3>🖥 Caja</h3>
        <p>Fondo ${euro(r.fondoInicial)}</p>
        <p>Contado ${euro(r.contado)}</p>
        <p>Teórico ${euro(r.teorico)}</p>
        <p>Diferencia <strong>${euro(r.diferencia)}</strong></p>
        <p>Stock bajo: ${productos.filter(isLow).length} · Caducan: ${productos.filter(expiresSoon).length}</p>
      </div>`;
  }

  function renderPacientes() {
    const q = ($("#paciente-search")?.value||"").toLowerCase();
    const list = state.pacientes.filter((p)=>!q || p.nombre.toLowerCase().includes(q) || p.dni.toLowerCase().includes(q));
    $("#pacientes-list").innerHTML = list.map((p)=>`
      <div class="list-item">
        <div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">${escapeHtml(p.dni)}</div></div>
        <div class="actions-row" style="margin:0">
          <button class="btn btn-sm btn-primary" data-usar-pac="${p.id}">Usar</button>
          <button class="btn btn-sm" data-ver-pac="${p.id}">Ver</button>
        </div>
      </div>`).join("") || `<div class="empty">Aún no hay fichas guardadas (se crean al cobrar)</div>`;
    if (selectedPacienteId) {
      const p = state.pacientes.find((x)=>x.id===selectedPacienteId);
      if (p) {
        $("#paciente-detail").innerHTML = `<h3>${escapeHtml(p.nombre)}</h3>
          <p>DNI ${escapeHtml(p.dni)} · ${escapeHtml(p.telefono||"—")}</p>
          <p>Alergias: ${escapeHtml((p.alergias||[]).join(", ")||"—")}</p>
          <p>Crónicos: ${escapeHtml((p.cronicos||[]).join(", ")||"—")}</p>
          <ul>${(p.historial||[]).slice(0,8).map(h=>`<li>${formatShort(h.fecha)} · ${euro(h.total)}</li>`).join("")||"<li>Sin compras</li>"}</ul>
          <button class="btn btn-sm" data-edit-pac="${p.id}">Editar</button>`;
      }
    }
  }

  function atenderPedido(id) {
    const ped = state.cola.find((p)=>p.id===id);
    if (!ped) return;
    const c = ped.cliente;
    state.clienteActual = {
      nombre: c.nombre, dni: c.dni, telefono: c.telefono, pacienteId: c.id, seedId: c.seedId,
      tramoSNS: c.tramoSNS, familiaNumerosa: !!c.familiaNumerosa,
      peticionTexto: c.peticionTexto, sintomas: c.sintomas||[],
      alergias: c.alergias||[], cronicos: c.cronicos||[],
      embarazo: !!c.embarazo, lactancia: !!c.lactancia, edad: c.edad,
    };
    state.mutuaId = c.mutuaId || "particular";
    state.tramoSNS = c.tramoSNS || "particular";
    state.flagsDesc.pensionista = c.tramoSNS === "pensionista";
    state.flagsDesc.familia = !!c.familiaNumerosa;
    state.cart = []; // el farmacéutico elige
    state.recetaActiva = ped.receta ? { ...ped.receta, productos: ped.receta.productos.map((x)=>({...x})) } : null;
    state.cola = state.cola.filter((p)=>p.id!==id);

    // filtrar por síntoma del cliente
    sintomaActivo = (c.sintomas && c.sintomas[0]) || "";
    $("#search-q").value = sintomaActivo;
    bindClienteForm();
    renderMutuas(); renderSpeech(); renderSintomas(); renderCatalog();
    renderCart(); renderReceta(); renderCola(); refreshClinicalAlerts();
    save();
    toast(`Atiende a ${c.nombre}: escucha y elige productos`, "ok");
    showTab("venta");
  }

  function bindClienteForm() {
    $("#cliente-nombre").value = state.clienteActual.nombre||"";
    $("#cliente-dni").value = state.clienteActual.dni||"";
    $("#tramo-sns").value = state.tramoSNS||"particular";
    $("#chk-pensionista").checked = !!state.flagsDesc.pensionista;
    $("#chk-familia").checked = !!state.flagsDesc.familia;
    $("#chk-oferta").checked = !!state.flagsDesc.oferta;
  }

  function mostrarTicket(ticket) {
    $("#ticket-content").innerHTML = `
      <div class="ticket-paper" id="ticket-print-area">
        <h2>✚ Farmacia Álora</h2>
        <p class="muted">TPV de práctica${ticket.guardia?" · GUARDIA":""} · ${escapeHtml(ticket.season||"")}</p>
        <p><strong>${ticket.id}</strong><br>${formatShort(ticket.fechaJuego)}</p>
        <p>Cliente: ${escapeHtml(ticket.cliente.nombre||"—")} · DNI ${escapeHtml(ticket.cliente.dni||"—")}<br>
        SNS: ${escapeHtml(ticket.tramoSNS)} · Pago: ${escapeHtml(ticket.pago?.metodo||"—")}
        ${ticket.pago?.cambio?`<br>Cambio: ${euro(ticket.pago.cambio)}`:""}</p>
        <table class="ticket-table"><thead><tr><th>Producto</th><th>Ud</th><th>Importe</th></tr></thead>
        <tbody>${ticket.lineas.map((l)=>`<tr><td>${escapeHtml(l.nombre)}${l.oferta?" 🏷":""}<br><span class="muted">lote ${escapeHtml(l.lote||"—")}</span></td><td>${l.cantidad}</td><td>${euro(l.total)}</td></tr>`).join("")}</tbody></table>
        <div class="ticket-totals">
          <div><span>Bruto</span><span>${euro(ticket.bruto)}</span></div>
          <div><span>Descuentos</span><span>−${euro(ticket.descuento)}</span></div>
          <div><span>SNS/Mutua</span><span>−${euro(ticket.coberturaMutua)}</span></div>
          <div class="grand"><span>TOTAL CLIENTE</span><span>${euro(ticket.total)}</span></div>
        </div>
        <p class="muted tiny">Simulado · no es factura real</p>
      </div>`;
    showTab("ticket");
  }

  function pedirAlmacen(productId, qty) {
    const p = productos.find((x)=>x.id===productId);
    if (!p) return;
    const horas = 2 + Math.floor(Math.random()*10);
    state.pedidosAlmacen.push({
      id: "ALM-" + Date.now().toString(36),
      productId: p.id, nombre: p.nombre, cantidad: qty || 20,
      pedidoMs: state.gameTimeMs,
      llegadaMs: state.gameTimeMs + horas * 3600 * 1000,
      recibido: false,
    });
    toast(`Pedido almacén: llega en ~${horas} h de juego`, "ok");
    renderAlmacen(); save();
  }

  function retirarCaducados() {
    let n = 0;
    for (const p of productos) {
      if (isExpired(p) && (state.stock[p.id]||0) > 0) {
        n += state.stock[p.id];
        state.stock[p.id] = 0;
      }
    }
    toast(n ? `Retiradas ${n} unidades caducadas` : "No hay caducados en stock", n?"warn":"ok");
    renderAlmacen(); renderCatalog(); renderStats(); save();
  }

  function openGenericos() {
    if (!state.cart.length) { toast("Carrito vacío", "warn"); return; }
    const blocks = [];
    for (const l of state.cart) {
      const p = productos.find((x)=>x.id===l.productId);
      if (!p || p.principioActivo==="—") continue;
      const gens = Clinica.buscarGenericos(p, productos, state.stock);
      if (!gens.length) continue;
      blocks.push(`<div class="list-item" style="flex-direction:column;align-items:stretch">
        <strong>${escapeHtml(p.nombre)}</strong>
        ${gens.map((g)=>`<div class="list-item"><div>${escapeHtml(g.producto.nombre)}<div class="muted tiny">ahorras ${euro(g.ahorro)}</div></div>
        <button class="btn btn-sm btn-primary" data-sub-old="${p.id}" data-sub-new="${g.producto.id}">Sustituir</button></div>`).join("")}
      </div>`);
    }
    $("#generico-list").innerHTML = blocks.join("") || `<div class="empty">Sin genéricos más baratos</div>`;
    $("#modal-generico").classList.add("open");
  }

  function openRecetaModal() {
    $("#rx-numero").value = genRecetaNum(()=>Math.random(), state.gameTimeMs);
    $("#rx-tipo").value = "electronica";
    $("#rx-paciente").value = state.clienteActual.nombre||"";
    $("#rx-dni").value = state.clienteActual.dni||"";
    $("#rx-medico").value = MEDICOS[0].nombre;
    $("#rx-colegiado").value = MEDICOS[0].colegiado;
    const em = new Date(state.gameTimeMs);
    $("#rx-fecha").value = `${em.getFullYear()}-${pad(em.getMonth()+1)}-${pad(em.getDate())}`;
    $("#rx-validez").value = 30;
    $("#rx-obs").value = "";
    const rxItems = state.cart.map((l)=>{
      const p=productos.find(x=>x.id===l.productId);
      return p&&p.requiereReceta?`${p.id}|${l.cantidad}`:null;
    }).filter(Boolean);
    $("#rx-productos").value = rxItems.join("\n");
    $("#rx-hint").textContent = "Formato: id|cantidad";
    $("#modal-receta").classList.add("open");
  }

  function saveRecetaModal() {
    const productosRx = [];
    for (const line of $("#rx-productos").value.trim().split("\n").filter(Boolean)) {
      const [idStr, qtyStr] = line.split("|").map(s=>s.trim());
      const p = productos.find((x)=>x.id===Number(idStr));
      if (!p) { toast("Producto no encontrado", "err"); return; }
      productosRx.push({ productId:p.id, nombre:p.nombre, cantidad:Math.max(1,Number(qtyStr)||1), controlado:p.controlado });
    }
    if (!productosRx.length) { toast("Añade productos", "warn"); return; }
    const fechaStr = $("#rx-fecha").value;
    state.recetaActiva = {
      numero:$("#rx-numero").value.trim(), tipo:$("#rx-tipo").value,
      pacienteNombre:$("#rx-paciente").value.trim(), pacienteDni:$("#rx-dni").value.trim().toUpperCase(),
      medico:$("#rx-medico").value.trim(), colegiado:$("#rx-colegiado").value.trim(),
      fechaEmision: fechaStr?new Date(fechaStr+"T12:00:00").getTime():state.gameTimeMs,
      validezDias:Number($("#rx-validez").value)||30, productos:productosRx, dispensada:false,
      observaciones:$("#rx-obs").value.trim(),
    };
    $("#modal-receta").classList.remove("open");
    renderReceta(); save(); toast("Receta activa", "ok");
  }

  function showTab(name) {
    $$(".tab").forEach((t)=>t.classList.toggle("active", t.dataset.tab===name));
    $$(".panel").forEach((p)=>p.classList.toggle("active", p.id==="panel-"+name));
    if (name==="caja") renderCaja();
    if (name==="informes") renderInforme();
    if (name==="pacientes") renderPacientes();
    if (name==="libro") renderLibro();
    if (name==="almacen") renderAlmacen();
    if (name==="pedidos") renderCola();
  }

  function bindEvents() {
    $("#pause-btn").onclick = () => { state.paused=!state.paused; lastFrame=0; save(); renderClock(); };
    $("#btn-guardia").onclick = () => {
      state.settings.enGuardia=!state.settings.enGuardia;
      toast(state.settings.enGuardia?"Guardia ON":"Guardia OFF", state.settings.enGuardia?"ok":"warn");
      renderClock(); save();
    };
    $("#btn-sound").onclick = () => {
      soundOn=!soundOn; Sounds.setEnabled(soundOn);
      $("#btn-sound").textContent = soundOn?"🔊":"🔇";
      if (soundOn) Sounds.beepOk();
    };

    $$(".tab").forEach((tab)=>tab.addEventListener("click", ()=>showTab(tab.dataset.tab)));

    ["search-q","filter-cat","filter-receta","filter-marca","filter-pa"].forEach((id)=>{
      $("#"+id).addEventListener("input", ()=>{ sintomaActivo=""; renderSintomas(); clearTimeout(searchTimer); searchTimer=setTimeout(renderCatalog,100); });
      $("#"+id).addEventListener("change", ()=>{ sintomaActivo=""; renderSintomas(); renderCatalog(); });
    });

    document.body.addEventListener("click", (e) => {
      const syn = e.target.closest("[data-sintoma]");
      if (syn && (syn.closest("#sintomas-row") || syn.closest("#speech-tags"))) {
        sintomaActivo = syn.dataset.sintoma || "";
        $("#search-q").value = sintomaActivo;
        renderSintomas(); renderCatalog();
      }
    });

    $("#catalog-body").onclick = (e) => { const b=e.target.closest("[data-add]"); if(b) addToCart(Number(b.dataset.add)); };
    $("#receta-panel").onclick = (e) => { const b=e.target.closest("[data-add]"); if(b) addToCart(Number(b.dataset.add)); };
    $("#cart-body").onclick = (e) => {
      const t=e.target.closest("[data-inc],[data-dec],[data-rem]"); if(!t) return;
      const id=Number(t.dataset.inc||t.dataset.dec||t.dataset.rem);
      const line=state.cart.find(l=>l.productId===id); if(!line) return;
      if(t.dataset.inc) setCartQty(id, line.cantidad+1);
      else if(t.dataset.dec) setCartQty(id, line.cantidad-1);
      else setCartQty(id, 0);
    };

    $("#btn-cobrar").onclick = openPagoModal;
    $("#btn-vaciar").onclick = () => { state.cart=[]; renderCart(); refreshClinicalAlerts(); save(); };
    $("#btn-sugerir-generico").onclick = openGenericos;
    $("#btn-print").onclick = () => { Sounds.beepPrint(); window.print(); };
    $("#btn-print-informe").onclick = () => { renderInforme(); Sounds.beepPrint(); showTab("informes"); setTimeout(()=>window.print(), 200); };
    $("#btn-refresh-informe").onclick = renderInforme;
    $("#btn-csv").onclick = exportCSV;
    $("#btn-libro-csv").onclick = exportLibro;
    $("#btn-spawn").onclick = () => { state.cola.push(crearPedido()); Sounds.beepCustomer(); renderCola(); save(); };

    $("#cola-list").onclick = (e) => {
      const a=e.target.closest("[data-atender]"); const d=e.target.closest("[data-descartar]");
      if(a) atenderPedido(a.dataset.atender);
      if(d){ state.cola=state.cola.filter(p=>p.id!==d.dataset.descartar); renderCola(); save(); }
    };

    $("#mutua-select").onchange = (e) => { state.mutuaId=e.target.value; renderCart(); save(); };
    $("#tramo-sns").onchange = (e) => {
      state.tramoSNS=e.target.value;
      if (e.target.value!=="particular") state.mutuaId="ss";
      state.flagsDesc.pensionista = e.target.value==="pensionista";
      bindClienteForm(); renderMutuas(); renderCart(); save();
    };
    $("#chk-pensionista").onchange = (e)=>{ state.flagsDesc.pensionista=e.target.checked; renderCart(); save(); };
    $("#chk-familia").onchange = (e)=>{ state.flagsDesc.familia=e.target.checked; state.clienteActual.familiaNumerosa=e.target.checked; renderCart(); save(); };
    $("#chk-oferta").onchange = (e)=>{ state.flagsDesc.oferta=e.target.checked; renderCart(); renderCatalog(); save(); };

    ["cliente-nombre","cliente-dni"].forEach((id)=>{
      $("#"+id).onchange = () => {
        state.clienteActual.nombre=$("#cliente-nombre").value.trim();
        state.clienteActual.dni=$("#cliente-dni").value.trim().toUpperCase();
        save();
      };
    });

    $("#btn-nueva-receta").onclick = openRecetaModal;
    $("#btn-limpiar-receta").onclick = ()=>{ state.recetaActiva=null; renderReceta(); save(); };
    $("#btn-rx-guardar").onclick = saveRecetaModal;
    $("#btn-rx-cerrar").onclick = ()=>$("#modal-receta").classList.remove("open");

    $("#btn-confirmar-pago").onclick = confirmarPago;
    $("#btn-cancelar-pago").onclick = ()=>$("#modal-pago").classList.remove("open");
    $("#metodos-grid").onclick = (e)=>{ const b=e.target.closest("[data-metodo]"); if(!b) return; pagoMetodo=b.dataset.metodo; updatePagoUI(); };
    $("#pago-recibido").oninput = updatePagoUI;
    ["mixto-efectivo","mixto-tarjeta","mixto-bizum"].forEach((id)=>$("#"+id).oninput=updatePagoUI);
    $("#pago-euro-pad").onclick = (e) => {
      const b = e.target.closest("[data-denom]");
      if (!b) return;
      const d = Caja.DENOMS.find((x)=>x.id===b.dataset.denom);
      if (!d) return;
      const cur = Number($("#pago-recibido").value)||0;
      $("#pago-recibido").value = Caja.round2(cur + d.valor).toFixed(2);
      Sounds.beepCoin();
      updatePagoUI();
    };
    $("#quick-cash").onclick = (e) => {
      const b=e.target.closest("[data-quick]"); if(!b) return;
      const tot=cartTotals().aPagar;
      if (b.dataset.quick==="exacto") $("#pago-recibido").value=tot.toFixed(2);
      else {
        const n=Number(b.dataset.quick);
        const cur=Number($("#pago-recibido").value)||0;
        let v = cur < tot ? Math.ceil(tot/n)*n : cur+n;
        $("#pago-recibido").value = Caja.round2(v).toFixed(2);
      }
      updatePagoUI();
    };

    $("#btn-load-paciente").onclick = ()=>showTab("pacientes");
    $("#btn-nuevo-paciente").onclick = ()=>openPacienteModal(null);
    $("#btn-guardar-paciente").onclick = savePacienteModal;
    $("#btn-cerrar-paciente").onclick = ()=>$("#modal-paciente").classList.remove("open");
    $("#paciente-search").oninput = renderPacientes;
    $("#pacientes-list").onclick = (e)=>{
      const u=e.target.closest("[data-usar-pac]"); const v=e.target.closest("[data-ver-pac]");
      if(u) usarPaciente(u.dataset.usarPac);
      if(v){ selectedPacienteId=v.dataset.verPac; renderPacientes(); }
    };
    $("#paciente-detail").onclick = (e)=>{ const ed=e.target.closest("[data-edit-pac]"); if(ed) openPacienteModal(state.pacientes.find(p=>p.id===ed.dataset.editPac)); };

    $("#btn-cerrar-generico").onclick = ()=>$("#modal-generico").classList.remove("open");
    $("#generico-list").onclick = (e)=>{
      const b=e.target.closest("[data-sub-old]"); if(!b) return;
      replaceInCart(Number(b.dataset.subOld), Number(b.dataset.subNew));
      $("#modal-generico").classList.remove("open");
    };

    $("#btn-abrir-caja").onclick = ()=>{ state.caja=Caja.defaultCaja(state.gameTimeMs); renderCaja(); save(); toast("Caja abierta", "ok"); };
    $("#btn-arqueo").onclick = ()=>{
      const r=Caja.resumenCaja(state.caja, state.ventas.filter(v=>dayKey(v.fechaJuego)===dayKey(state.gameTimeMs)));
      state.caja.abierta=false; state.caja.cierreMs=state.gameTimeMs; renderCaja(); save();
      alert(`Arqueo\nContado: ${euro(r.contado)}\nTeórico: ${euro(r.teorico)}\nDif: ${euro(r.diferencia)}`);
    };

    $("#btn-hacer-pedido").onclick = ()=>{
      if (!almPickId) { toast("Elige un producto de la lista", "warn"); return; }
      pedirAlmacen(almPickId, Number($("#alm-qty").value)||20);
    };
    $("#alm-search").oninput = ()=>{
      const q=($("#alm-search").value||"").toLowerCase();
      const hits=productos.filter(p=>`${p.nombre} ${p.marca}`.toLowerCase().includes(q)).slice(0,20);
      $("#alm-suggest").innerHTML = hits.map(p=>`<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">stock ${state.stock[p.id]||0}</div></div>
        <button class="btn btn-sm" data-pick="${p.id}">Elegir</button></div>`).join("") || `<div class="empty">Escribe para buscar</div>`;
    };
    $("#alm-suggest").onclick = (e)=>{ const b=e.target.closest("[data-pick]"); if(!b) return; almPickId=Number(b.dataset.pick); toast("Producto elegido para pedido", "ok"); };
    $("#alm-alertas").onclick = (e)=>{ const b=e.target.closest("[data-pedir]"); if(b) pedirAlmacen(Number(b.dataset.pedir), 30); };
    $("#btn-retirar-caducados").onclick = retirarCaducados;

    $$(".modal").forEach((m)=>m.addEventListener("click",(e)=>{ if(e.target===m) m.classList.remove("open"); }));

    $("#btn-reset").onclick = ()=>{
      if(!confirm("¿Reiniciar todo?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state=defaultState(productos);
      state.cola.push(crearPedido(), crearPedido(), crearPedido());
      bindClienteForm(); renderAll(); save(); toast("Reiniciado", "ok");
    };
    $("#btn-restock").onclick = ()=>{
      for (const p of productos) state.stock[p.id]=p.stockInicial;
      renderCatalog(); renderStats(); save(); toast("Stock repuesto", "ok");
    };
    $("#btn-export-json").onclick = ()=>{
      const a=document.createElement("a");
      a.href=URL.createObjectURL(new Blob([JSON.stringify({state, total:productos.length},null,2)],{type:"application/json"}));
      a.download="farmacia-alora.json"; a.click();
    };

    document.addEventListener("keydown", (e)=>{
      if(e.key==="Escape"){ $$(".modal.open").forEach(m=>m.classList.remove("open")); e.preventDefault(); }
      if(e.key==="F2"){ e.preventDefault(); showTab("venta"); $("#search-q").focus(); $("#search-q").select(); }
      if(e.key==="F4"){ e.preventDefault(); openPagoModal(); }
    });
  }

  function openPacienteModal(p) {
    pacienteEditId = p?.id||null;
    $("#np-nombre").value=p?.nombre||""; $("#np-dni").value=p?.dni||""; $("#np-tel").value=p?.telefono||"";
    $("#np-mutua").value=p?.mutuaId||"particular";
    $("#np-alergias").value=(p?.alergias||[]).join(", "); $("#np-cronicos").value=(p?.cronicos||[]).join(", ");
    $("#np-embarazo").checked=!!p?.embarazo; $("#np-lactancia").checked=!!p?.lactancia; $("#np-notas").value=p?.notas||"";
    $("#modal-paciente").classList.add("open");
  }
  function savePacienteModal() {
    const data = {
      nombre:$("#np-nombre").value.trim(), dni:$("#np-dni").value.trim().toUpperCase(),
      telefono:$("#np-tel").value.trim(), mutuaId:$("#np-mutua").value,
      alergias:$("#np-alergias").value.split(",").map(s=>s.trim()).filter(Boolean),
      cronicos:$("#np-cronicos").value.split(",").map(s=>s.trim()).filter(Boolean),
      embarazo:$("#np-embarazo").checked, lactancia:$("#np-lactancia").checked, notas:$("#np-notas").value.trim(),
    };
    if(!data.nombre||!data.dni){ toast("Falta nombre/DNI","warn"); return; }
    if(pacienteEditId){ Object.assign(state.pacientes.find(x=>x.id===pacienteEditId), data); selectedPacienteId=pacienteEditId; }
    else { const p={id:"pac-"+Date.now().toString(36), historial:[], familiaNumerosa:false, tramoSNS:"particular", ...data}; state.pacientes.unshift(p); selectedPacienteId=p.id; }
    $("#modal-paciente").classList.remove("open"); renderPacientes(); save(); toast("Ficha guardada","ok");
  }
  function usarPaciente(id) {
    const p=state.pacientes.find(x=>x.id===id); if(!p) return;
    state.clienteActual={ ...emptyCliente(), nombre:p.nombre, dni:p.dni, telefono:p.telefono, pacienteId:p.id,
      alergias:p.alergias||[], cronicos:p.cronicos||[], embarazo:!!p.embarazo, lactancia:!!p.lactancia,
      familiaNumerosa:!!p.familiaNumerosa, tramoSNS:p.tramoSNS||"particular", peticionTexto:"Cliente de ficha (sin petición nueva).", sintomas:[] };
    state.mutuaId=p.mutuaId||"particular"; state.tramoSNS=p.tramoSNS||"particular";
    bindClienteForm(); renderMutuas(); renderSpeech(); renderPacienteChips(); refreshClinicalAlerts(); save();
    toast("Ficha cargada","ok"); showTab("venta");
  }

  function exportCSV() {
    if(!state.ventas.length){ toast("Sin ventas","warn"); return; }
    const rows=[["ticket","fecha","cliente","dni","pago","producto","ud","total","ticket_total"]];
    for(const v of state.ventas) for(const l of v.lineas)
      rows.push([v.id,formatShort(v.fechaJuego),v.cliente.nombre||"",v.cliente.dni||"",v.pago?.metodo||"",l.nombre,l.cantidad,l.total.toFixed(2),v.total.toFixed(2)]);
    dlCsv(rows, `ventas-${Date.now()}.csv`);
  }
  function exportLibro() {
    const rows=[["fecha","producto","ud","paciente","dni","receta","ticket"]];
    for(const r of state.libroEstupefacientes) rows.push([formatShort(r.fecha),r.nombre,r.cantidad,r.pacienteNombre,r.pacienteDni,r.recetaNumero,r.ticketId]);
    dlCsv(rows, `libro-${Date.now()}.csv`);
  }
  function dlCsv(rows, name) {
    const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"})); a.download=name; a.click();
    toast("Exportado","ok");
  }

  function renderAll() {
    renderClock(); renderCategorias(); renderSintomas(); renderCatalog();
    renderCart(); renderReceta(); renderCola(); renderStats();
    renderCaja(); renderLibro(); renderPacientes(); renderAlmacen();
    renderSpeech(); refreshClinicalAlerts();
  }

  function init() {
    catalogMeta = window.FarmaciaCatalogo.getCatalogo();
    productos = catalogMeta.productos;
    state = load(productos);
    if (!state.cola.length && isOpenAt(state.gameTimeMs)) {
      state.cola.push(crearPedido(), crearPedido(), crearPedido());
    }
    Sounds.setEnabled(true);
    bindEvents();
    bindClienteForm();
    renderMutuas();
    renderAll();
    save();
    clockTimer = requestAnimationFrame(tick);
    console.info(`Farmacia Álora TPV · ${productos.length} productos · ${Clientes.TOTAL} clientes posibles`);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
