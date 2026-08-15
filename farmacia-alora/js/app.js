/**
 * Farmacia Álora TPV — práctica completa
 * 1 min real = 1 h juego · clientes procedurales · caja euro visual
 */
(function () {
  "use strict";

  const STORAGE_KEY = "farmacia-alora-v10";
  const REAL_MS_PER_GAME_HOUR = 60 * 1000;
  const Clinica = window.FarmaciaClinica;
  const Caja = window.FarmaciaCaja;
  const Clientes = window.FarmaciaClientes;
  const Sounds = window.FarmaciaSounds;
  const Minis = window.FarmaciaMinijuegos;
  const Extras = window.FarmaciaExtras;
  const Pack = window.FarmaciaPackshot;
  const Clinic = window.FarmaciaClinicTools;
  const Plus = window.FarmaciaPracticePlus;

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
  let sintomaActivo = "", categoriaActiva = "", pagoMetodo = "efectivo";
  let pacienteEditId = null, selectedPacienteId = null, almPickId = null;
  let soundOn = true;
  let pendingCtrlContinue = null;
  let pendingPago = null;
  let miniQueue = [];
  let miniIndex = 0;
  let miniFails = 0;
  let gestPickId = null;
  let rotPickId = null;
  let sigrePickId = null;
  let pendingAlbId = null;
  let pendingVisadoContinue = null;
  let lastTicket = null;
  let docTipo = "ticket";
  let catalogView = "cards";
  let planoPickShelf = null;

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
  function packOf(p, size) {
    if (!p || !Pack) return `<span class="prod-ico">${p?.icon || "💊"}</span>`;
    return Pack.packHtml(p, size || "md");
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
      version: 7,
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
      devoluciones: [],
      roturas: [],
      gastos: [],
      conteoFisico: {},
      sigre: [],
      adherencias: [],
      vitals: [],
      magistrales: [],
      chatMedico: [],
      planograma: null,
      plus: Plus ? Plus.defaultPlus() : {},
      copagoMes: {},
      ofertasDia: makeOfertas(list),
      caja: Caja.defaultCaja(start.getTime()),
      stats: { tickets: 0, facturacion: 0, recetas: 0, minijuegosOk: 0, minijuegosFail: 0, sigre: 0 },
      nextCustomerAt: start.getTime() + 15 * 60 * 1000,
      settings: { horarioManana:[9,14], horarioTarde:[17,20.5], abiertoSabadoManana:true, enGuardia:false },
    };
  }

  function emptyCliente() {
    return {
      nombre: "", dni: "", telefono: "", pacienteId: null, seedId: null,
      tramoSNS: "particular", familiaNumerosa: false,
      peticionTexto: "", sintomas: [], quiereProductoIds: [], modo: "",
      alergias: [], cronicos: [],
      embarazo: false, lactancia: false, edad: null,
      metodoPago: null,
      perfilId: null,
      tutor: null,
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
        devoluciones: data.devoluciones || [],
        roturas: data.roturas || [],
        gastos: data.gastos || [],
        conteoFisico: data.conteoFisico || {},
        sigre: data.sigre || [],
        adherencias: data.adherencias || [],
        vitals: data.vitals || [],
        magistrales: data.magistrales || [],
        chatMedico: data.chatMedico || [],
        planograma: data.planograma || null,
        plus: { ...(Plus ? Plus.defaultPlus() : {}), ...(data.plus || {}) },
        copagoMes: data.copagoMes || {},
        stats: { tickets: 0, facturacion: 0, recetas: 0, minijuegosOk: 0, minijuegosFail: 0, sigre: 0, ...(data.stats || {}) },
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
  function cadClass(p) {
    const d = daysToExpiry(p);
    if (d < 0 || d <= 30) return "r";
    if (d <= 90) return "o";
    return "g";
  }
  function cadLabel(p) {
    const d = daysToExpiry(p);
    if (d < 0) return "Caducado";
    if (d <= 30) return "Crítico (" + Math.ceil(d) + "d)";
    if (d <= 90) return "Pronto (" + Math.ceil(d) + "d)";
    return "Ok (" + Math.ceil(d) + "d)";
  }
  function metodoNombre(id) {
    return (Caja.METODOS.find((m) => m.id === id) || {}).nombre || id || "—";
  }
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
      tickPracticePlus();
      if (Math.floor(now/5000) !== Math.floor((now-dt)/5000)) save();
    }
    renderClock();
    clockTimer = requestAnimationFrame(tick);
  }

  function tickPracticePlus() {
    if (!Plus || !state.plus) return;
    const enAtencion = !!(state.clienteActual && state.clienteActual.peticionTexto);
    const enGuardia = !!state.settings.enGuardia;
    const fuera = isOutsideNormal(state.gameTimeMs);
    const int = Plus.maybeInterrupcion(state.plus, state.gameTimeMs, enAtencion, enGuardia && fuera);
    if (int) renderInterruptBanner();
    const alerta = Plus.maybeSpawnAlertaLote(state.plus, productos, state.gameTimeMs);
    if (alerta) {
      toast("🚨 Alerta AEMPS: " + alerta.nombre, "warn");
      Sounds.beepWarn && Sounds.beepWarn();
      renderStats();
    }
    // fatiga baja despacio fuera de guardia
    if (!(enGuardia && fuera) && state.plus.fatiga > 0 && Math.random() < 0.02) {
      state.plus.fatiga = Math.max(0, state.plus.fatiga - 1);
    }
    updateScoreHud();
    updateFatigaBadge();
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
    const enGuardia = state.settings.enGuardia && isOutsideNormal(state.gameTimeMs);
    const fatiga = state.plus?.fatiga || 0;
    state.nextCustomerAt = state.gameTimeMs + (Plus
      ? Plus.nextCustomerDelayMs(!!state.settings.enGuardia, isOutsideNormal(state.gameTimeMs), fatiga, r)
      : (7 + Math.floor(r()*22)) * 60 * 1000);
    if (enGuardia) state.plus.fatiga = Math.min(100, (state.plus.fatiga || 0) + 2);
    renderCola();
    save();
  }

  function crearPedido() {
    const season = seasonInfo(state.gameTimeMs);
    const cli = Clientes.clienteAleatorio(productos, Math.floor(state.gameTimeMs), season.boost);
    const enGuardia = state.settings.enGuardia && isOutsideNormal(state.gameTimeMs);
    // Guardia: más urgencias / alarmas
    if (enGuardia && Math.random() < 0.35 && Clientes.generarCliente) {
      // forzar modo alarma a veces re-roll
      const urg = Clientes.generarCliente(Math.floor(Math.random() * 1e7), productos, season.boost);
      if (urg.modo === "alarma" || Math.random() < 0.5) {
        Object.assign(cli, urg);
        cli.urgencia = true;
        cli.modo = cli.modo === "alarma" ? "alarma" : cli.modo;
        cli.peticionTexto = (cli.peticionTexto || "") + " (llega en GUARDIA).";
        if (state.plus?.guardiaStats) state.plus.guardiaStats.urgencias += 1;
      }
    }
    if (enGuardia && cli.urgencia) cli.peticionTexto = "🚑 GUARDIA · " + cli.peticionTexto;
    let receta = null;
    if (cli.quiereReceta && cli.productosReceta?.length) {
      const r = rng(cli.seedId);
      const med = pick(r, MEDICOS);
      const emitida = state.gameTimeMs - Math.floor(r() * 8) * 86400000;
      // a veces receta “mala” para practicar rechazo (10%)
      let items = cli.productosReceta.map((x) => ({ ...x }));
      let pacienteDni = cli.dni;
      let obs = items.some((i) => i.controlado) ? "Controlado: DNI + libro." : "";
      if (r() < 0.1) {
        pacienteDni = "00000000T"; // DNI incorrecto a propósito
        obs = "ATENCIÓN formativa: esta receta puede no coincidir.";
      }
      const tipoRx = r() < 0.55 ? "electronica" : "papel";
      const fase = tipoRx === "electronica" ? pick(r, ["primera", "continuacion", "fin"]) : "unica";
      items = items.map((it) => {
        const p = productos.find((x) => x.id === it.productId);
        return { ...it, requiereVisado: Extras.needsVisado(p) };
      });
      if (tipoRx === "papel") obs = (obs ? obs + " " : "") + "Receta papel: cortar códigos y sellar.";
      else {
        const faseTxt = { primera: "PRIMERA dispensación", continuacion: "continuación", fin: "FIN de tratamiento" }[fase];
        obs = (obs ? obs + " " : "") + `Receta electrónica SNS · ${faseTxt}.`;
      }
      if (items.some((i) => i.requiereVisado)) obs += " Requiere VISADO.";
      receta = {
        numero: genRecetaNum(r, emitida), tipo: tipoRx, fase,
        pacienteNombre: cli.nombre, pacienteDni,
        medico: med.nombre, colegiado: med.colegiado,
        fechaEmision: emitida,
        validezDias: items.some((i) => i.controlado) ? 10 : 30,
        productos: items, dispensada: false, observaciones: obs,
        visadoOk: false, visadoRef: "",
      };
    }
    if (receta) {
      cli.peticionTexto = (cli.peticionTexto || "") + (receta.tipo === "papel"
        ? " (es receta en papel)."
        : ` (e-receta SNS · ${receta.fase}).`);
      if (receta.productos.some((p) => p.requiereVisado)) cli.peticionTexto += " Creo que lleva visado.";
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
      if (!ped.recibido && !ped.llegado && state.gameTimeMs >= ped.llegadaMs) {
        ped.llegado = true;
        ped.albLoteSugerido = "L" + Math.floor(100000 + Math.random() * 899999);
        ped.albCadSugerida = state.gameTimeMs + (180 + Math.floor(Math.random() * 400)) * 86400000;
        changed = true;
        toast(`Pedido en muelle: recepciona albarán de ${ped.nombre}`, "warn");
        Sounds.beepWarn();
      }
    }
    if (changed) { renderAlmacen(); save(); }
  }

  function openAlbaran(id) {
    const ped = state.pedidosAlmacen.find((p) => p.id === id);
    if (!ped || ped.recibido || !ped.llegado) return;
    pendingAlbId = id;
    $("#alb-msg").textContent = `${ped.nombre} · pedido ×${ped.cantidad}`;
    $("#alb-qty").value = ped.cantidad;
    $("#alb-lote").value = ped.albLoteSugerido || ("L" + Math.floor(100000 + Math.random() * 899999));
    const d = new Date(ped.albCadSugerida || (state.gameTimeMs + 200 * 86400000));
    $("#alb-cad").value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    $("#alb-ok").checked = false;
    $("#modal-albaran").classList.add("open");
  }

  function confirmarAlbaran() {
    const ped = state.pedidosAlmacen.find((p) => p.id === pendingAlbId);
    if (!ped) return;
    if (!$("#alb-ok").checked) { toast("Marca la comprobación del albarán", "warn"); return; }
    const qty = Math.max(1, Number($("#alb-qty").value) || ped.cantidad);
    const lote = ($("#alb-lote").value || "").trim() || ped.albLoteSugerido;
    const cadStr = $("#alb-cad").value;
    const cadMs = cadStr ? new Date(cadStr + "T12:00:00").getTime() : ped.albCadSugerida;
    state.stock[ped.productId] = (state.stock[ped.productId] || 0) + qty;
    state.lotes[ped.productId] = {
      ...(state.lotes[ped.productId] || {}),
      lote, caducidadMs: cadMs, stockMinimo: state.lotes[ped.productId]?.stockMinimo || 10,
    };
    ped.recibido = true;
    ped.cantidadRecibida = qty;
    ped.loteRecibido = lote;
    $("#modal-albaran").classList.remove("open");
    pendingAlbId = null;
    Sounds.beepOk();
    toast(`Albarán OK: ${ped.nombre} ×${qty} · lote ${lote}`, "ok");
    renderAlmacen(); renderCatalog(); renderStats(); save();
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

  function mesCopagoKey() {
    return Extras.monthKey(state.gameTimeMs) + "|" + (state.clienteActual.dni || "anon");
  }
  function copagoAcumulado() {
    return state.copagoMes[mesCopagoKey()] || 0;
  }
  function cartTotals() {
    let base = 0, iva = 0, coste = 0, brutoMed = 0;
    const basesIva = { 4: 0, 10: 0, 21: 0 };
    for (const l of state.cart) {
      const lt = lineTotals(l);
      base += lt.base; iva += lt.iva; coste += lt.coste;
      if (lt.ivaPct === 4) brutoMed += lt.total;
      const k = String(lt.ivaPct);
      if (basesIva[k] != null) basesIva[k] += lt.base;
      else basesIva[k] = lt.base;
    }
    const bruto = base + iva;
    let descPct = 0;
    if (state.flagsDesc.pensionista || state.tramoSNS === "pensionista") descPct += 10;
    if (state.flagsDesc.familia || state.clienteActual.familiaNumerosa) descPct += 15;
    descPct = Math.min(40, descPct);
    const desc = bruto * (descPct / 100);
    const trasDesc = bruto - desc;

    let cubiertoSNS = 0;
    let aportacionCliente = 0;
    let topeAplicado = false;
    let topeInfo = null;
    if (state.tramoSNS !== "particular" && state.mutuaId === "ss") {
      const aport = Clientes.aportacionSNS(state.tramoSNS);
      const medTras = brutoMed * (1 - descPct / 100);
      const teoricaAport = medTras * aport;
      const tope = Extras.topeSNS(state.tramoSNS);
      const ya = copagoAcumulado();
      const restoTope = Math.max(0, tope - ya);
      aportacionCliente = Math.min(teoricaAport, restoTope);
      if (teoricaAport > restoTope + 1e-9) topeAplicado = true;
      cubiertoSNS = Math.max(0, medTras - aportacionCliente);
      topeInfo = { tope, ya, restoTope, teoricaAport, aportacionCliente };
    }
    const mutua = getMutua();
    let cubiertoMutua = 0;
    if (mutua.cobertura > 0 && state.mutuaId !== "ss") {
      cubiertoMutua = brutoMed * (1 - descPct / 100) * mutua.cobertura;
    }
    const cubierto = cubiertoSNS + cubiertoMutua;
    const aPagar = Math.max(0, trasDesc - cubierto);
    return {
      base, iva, bruto, descPct, desc, trasDesc, cubierto, cubiertoSNS, cubiertoMutua, aPagar, mutua, coste,
      margen: Math.max(0, aPagar - coste * 0.5), basesIva, aportacionCliente, topeAplicado, topeInfo,
    };
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
    const edad = state.clienteActual.edad;
    for (const l of state.cart) {
      const p = productos.find((x) => x.id === l.productId);
      if (!p) continue;
      if (isExpired(p)) alerts.push({ tipo: "caducidad", nivel: "grave", msg: `${p.nombre} está CADUCADO` });
      else if (expiresSoon(p)) alerts.push({ tipo: "caducidad", nivel: "moderada", msg: `${p.nombre} caduca pronto (${Math.ceil(daysToExpiry(p))} días)` });
      if (isLow(p)) alerts.push({ tipo: "stock", nivel: "leve", msg: `Stock bajo de ${p.nombre}` });
      if (p.nevera) alerts.push({ tipo: "nevera", nivel: "moderada", msg: `❄ ${p.nombre} es de FRIGORÍFICO: mantén cadena de frío` });
      if (edad != null) {
        if (p.categoria === "Salud íntima y sexual" && edad < 16) {
          alerts.push({ tipo: "edad", nivel: "grave", msg: `Edad ${edad}: revisar venta de salud sexual (menor de 16)` });
        } else if (p.categoria === "Salud íntima y sexual" && edad < 18) {
          alerts.push({ tipo: "edad", nivel: "moderada", msg: `Edad ${edad}: precaución en salud sexual (menor de 18)` });
        }
        if ((p.categoria === "Corticoides sistémicos" || p.controlado) && edad < 12) {
          alerts.push({ tipo: "edad", nivel: "grave", msg: `Edad ${edad}: no dispensar ${p.categoria} sin criterio pediátrico` });
        }
        if (p.controlado && edad < 18) {
          alerts.push({ tipo: "edad", nivel: "moderada", msg: `Controlado en menor (${edad} años): verificar tutores / receta` });
        }
      }
    }
    const bar = $("#alerts-bar");
    if (!alerts.length) { bar.hidden = true; bar.innerHTML = ""; return alerts; }
    bar.hidden = false;
    bar.innerHTML = alerts.map((a) => `<div class="alert alert-${a.nivel}">⚠ ${escapeHtml(a.msg)}</div>`).join("");
    return alerts;
  }

  function recetaVigente(receta) {
    if (!receta) return { ok: false, motivo: "No hay receta" };
    if (state.gameTimeMs > receta.fechaEmision + receta.validezDias * 86400000) return { ok: false, motivo: "Receta caducada — RECHAZAR venta" };
    if (receta.dispensada) return { ok: false, motivo: "Receta ya dispensada — RECHAZAR" };
    if (!receta.numero || !receta.pacienteDni || !receta.medico) return { ok: false, motivo: "Receta incompleta — RECHAZAR" };
    return { ok: true, motivo: "Válida" };
  }

  function validarDispensacion() {
    const necesita = state.cart.filter((l) => productos.find((x) => x.id === l.productId)?.requiereReceta);
    for (const l of state.cart) {
      const p = productos.find((x) => x.id === l.productId);
      if (p && isExpired(p)) return { ok: false, motivo: `RECHAZAR: caducado ${p.nombre}`, warnings: [] };
    }
    if (!necesita.length) return { ok: true, warnings: [] };
    const receta = state.recetaActiva;
    const vig = recetaVigente(receta);
    if (!vig.ok) return { ok: false, motivo: vig.motivo, warnings: [] };
    if (!state.clienteActual.dni) return { ok: false, motivo: "RECHAZAR: falta DNI del cliente para receta", warnings: [] };
    if (receta.pacienteDni.toUpperCase() !== state.clienteActual.dni.toUpperCase()) {
      return { ok: false, motivo: "RECHAZAR: el DNI no coincide con la receta", warnings: [] };
    }
    if (!receta.tipo || (receta.tipo !== "papel" && receta.tipo !== "electronica")) {
      return { ok: false, motivo: "RECHAZAR: tipo de receta desconocido (papel/electrónica)", warnings: [] };
    }
    const warnings = [];
    if (receta.tipo === "papel") warnings.push("Receta en PAPEL: cortar/pegar códigos + sello obligatorio.");
    if (receta.tipo === "electronica") {
      const fase = receta.fase || "primera";
      const faseTxt = { primera: "PRIMERA dispensación", continuacion: "continuación de tratamiento", fin: "FIN de tratamiento" }[fase] || fase;
      warnings.push(`Receta ELECTRÓNICA SNS: PIN + marcar ${faseTxt}.`);
      if (fase === "fin") warnings.push("Fin de tratamiento: informa al paciente y cierra la línea en e-receta.");
      if (fase === "primera") warnings.push("Primera dispensación: verifica posología con el paciente.");
    }
    let needVisado = false;
    for (const linea of necesita) {
      const p = productos.find((x) => x.id === linea.productId);
      const en = receta.productos.find((rp) => rp.productId === linea.productId);
      if (!en) return { ok: false, motivo: `RECHAZAR: "${p.nombre}" no está en la receta`, warnings };
      if (linea.cantidad > en.cantidad) return { ok: false, motivo: `RECHAZAR: cantidad de "${p.nombre}" supera la prescrita`, warnings };
      if (p.controlado) warnings.push("Controlado: DNI + libro + firma del farmacéutico.");
      if (p.nevera) warnings.push(`Frigorífico: ${p.nombre}`);
      if (en.requiereVisado || Extras.needsVisado(p)) {
        needVisado = true;
        warnings.push(`Visado / inspección requerido: ${p.nombre}`);
      }
    }
    if (needVisado && !receta.visadoOk) {
      return { ok: false, motivo: "Pendiente de VISADO / inspección antes de cobrar", warnings, needVisado: true };
    }
    return { ok: true, warnings, needVisado };
  }

  function buscarSustitutos(p) {
    return productos.filter((x) => {
      if (x.id === p.id) return false;
      if ((state.stock[x.id] || 0) <= 0) return false;
      if (isExpired(x)) return false;
      if (x.requiereReceta !== p.requiereReceta) return false;
      if (p.principioActivo && x.principioActivo === p.principioActivo) return true;
      if (x.categoria === p.categoria) return true;
      return false;
    }).slice(0, 8);
  }

  function showSustitutos(p) {
    const alts = buscarSustitutos(p);
    $("#sustituto-msg").textContent = `No queda stock de «${p.nombre}». Elige un sustituto:`;
    $("#sustituto-list").innerHTML = alts.map((a) => `
      <div class="list-item">
        <div class="prod-row">${packOf(a, "sm")}
          <div><strong>${escapeHtml(a.nombre)}</strong><div class="muted tiny">${escapeHtml(a.categoria)} · stock ${state.stock[a.id]||0} · ${euro(a.precio)}</div></div>
        </div>
        <button class="btn btn-sm btn-primary" data-add="${a.id}">Añadir</button>
      </div>`).join("") || `<div class="empty">No hay sustitutos con stock</div>`;
    $("#modal-sustituto").classList.add("open");
  }

  function addToCart(productId, qty = 1) {
    const p = productos.find((x) => x.id === productId);
    if (!p) return;
    if (isExpired(p)) { toast("Producto caducado: retíralo", "err"); Sounds.beepWarn(); return; }
    const stock = state.stock[p.id] || 0;
    const existing = state.cart.find((l) => l.productId === productId);
    const newQty = (existing ? existing.cantidad : 0) + qty;
    if (stock <= 0 || newQty > stock) {
      toast(`Sin stock de ${p.nombre}`, "warn");
      showSustitutos(p);
      Sounds.beepWarn();
      return;
    }
    if (existing) existing.cantidad = newQty;
    else state.cart.push({ productId, cantidad: qty });
    if (p.nevera) toast("❄ Producto de frigorífico", "warn");
    if (p.controlado) toast("🔒 Controlado: DNI + libro + firma", "warn");
    Sounds.beepCoin();
    renderCart(); refreshClinicalAlerts(); maybeAutoPedidoCategoria(p.categoria); save();
    toast("Añadido · " + (p.requiereReceta ? "con receta" : "OTC"), "ok");
    const procBox = $("#proc-box");
    if (procBox && p.procedimiento) {
      procBox.hidden = false;
      procBox.innerHTML = `<strong>Procedimiento · ${escapeHtml(p.nombre)}</strong><p>${escapeHtml(p.procedimiento)}</p>`;
    }
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
    if (!state.cart.length) { toast("Carrito vacío: elige según lo que pide el cliente", "warn"); return; }
    if (!state.caja.abierta) { toast("Abre la caja primero", "warn"); showTab("caja"); return; }
    for (const l of state.cart) if ((state.stock[l.productId] || 0) < l.cantidad) { toast("Stock insuficiente", "warn"); return; }
    const val = validarDispensacion();
    if (!val.ok && !val.needVisado) { toast(val.motivo, "err"); Sounds.beepWarn(); return; }

    const needVisado = val.needVisado || (state.recetaActiva && state.recetaActiva.productos?.some((rp) => {
      const p = productos.find((x) => x.id === rp.productId);
      return (rp.requiereVisado || Extras.needsVisado(p)) && state.cart.some((l) => l.productId === rp.productId);
    }) && !state.recetaActiva.visadoOk);

    if (needVisado) {
      const items = state.cart.map((l) => productos.find((x) => x.id === l.productId)).filter((p) => p && Extras.needsVisado(p));
      $("#visado-list").innerHTML = items.map((p) => `<div class="list-item"><strong>${escapeHtml(p.nombre)}</strong><span class="tag tag-ctrl">VISADO</span></div>`).join("") || "<div class='empty'>Medicamentos con visado</div>";
      $("#visado-check").checked = false;
      $("#visado-ref").value = "VIS-" + Math.floor(100000 + Math.random() * 899999);
      pendingVisadoContinue = () => continueAfterVisado();
      $("#modal-visado").classList.add("open");
      return;
    }
    continueAfterVisado();
  }

  function continueAfterVisado() {
    const val = validarDispensacion();
    if (!val.ok) { toast(val.motivo, "err"); Sounds.beepWarn(); return; }
    const hasCtrl = state.cart.some((l) => productos.find((x) => x.id === l.productId)?.controlado);
    if (hasCtrl) {
      $("#ctrl-dni").value = state.clienteActual.dni || "";
      $("#ctrl-libro").checked = false;
      $("#ctrl-id").checked = false;
      pendingCtrlContinue = () => openPagoModalAfterCtrl();
      $("#modal-controlado").classList.add("open");
      return;
    }
    openPagoModalAfterCtrl();
  }

  function openPagoModalAfterCtrl() {
    const alerts = refreshClinicalAlerts();
    const preferido = state.clienteActual.metodoPago;
    pagoMetodo = preferido && Caja.METODOS.some((m) => m.id === preferido) ? preferido : "efectivo";
    const tot = cartTotals();
    $("#pago-total").textContent = euro(tot.aPagar);
    $("#pago-recibido").value = tot.aPagar.toFixed(2);
    $("#mixto-efectivo").value = "0";
    $("#mixto-tarjeta").value = tot.aPagar.toFixed(2);
    $("#mixto-bizum").value = "0";
    renderMetodos();
    updatePagoUI();
    const val = validarDispensacion();
    const pagoHint = preferido
      ? `<div class="alert alert-leve">Cliente elige pagar con <strong>${escapeHtml(metodoNombre(preferido))}</strong> — usa ese método.</div>`
      : "";
    const topeHint = tot.topeAplicado
      ? `<div class="alert alert-leve">Tope mensual SNS alcanzado (ya ${euro(tot.topeInfo.ya)} / tope ${euro(tot.topeInfo.tope)}). Aportación limitada a ${euro(tot.aportacionCliente)}.</div>`
      : (tot.topeInfo && tot.topeInfo.tope < Infinity
        ? `<div class="alert alert-leve">Copago SNS este mes: ${euro(tot.topeInfo.ya)} / tope ${euro(tot.topeInfo.tope)} · aportación venta ${euro(tot.aportacionCliente)}</div>`
        : "");
    $("#pago-alerts").innerHTML = [
      pagoHint, topeHint,
      ...(val.warnings || []).map((w) => `<div class="alert alert-moderada">${escapeHtml(w)}</div>`),
      ...alerts.filter((a) => a.nivel !== "leve").map((a) => `<div class="alert alert-${a.nivel}">${escapeHtml(a.msg)}</div>`),
    ].join("");
    Sounds.beepPay();
    $("#modal-pago").classList.add("open");
  }

  function renderMetodos() {
    const forced = state.clienteActual.metodoPago;
    $("#metodos-grid").innerHTML = Caja.METODOS.map((m) => {
      const locked = forced && forced !== m.id;
      const active = pagoMetodo === m.id;
      return `<button type="button" class="metodo-btn ${active ? "active" : ""} ${locked ? "locked" : ""}" data-metodo="${m.id}"${locked ? " disabled" : ""}><span>${m.icon}</span>${m.nombre}${forced === m.id ? '<em class="metodo-cli">Cliente</em>' : ""}</button>`;
    }).join("");
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
    const forced = state.clienteActual.metodoPago;
    if (forced && pagoMetodo !== forced) {
      toast("El cliente quiere pagar con " + metodoNombre(forced), "err");
      Sounds.beepAlert();
      return;
    }
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
    $("#modal-pago").classList.remove("open");
    startMinigameQueue(pago, tot);
  }

  function buildSaleGameCtx(pago, tot) {
    const lineas = state.cart.map((l) => {
      const p = productos.find((x) => x.id === l.productId);
      return {
        productId: l.productId, nombre: p?.nombre, icon: p?.icon, ean: p?.ean, sku: p?.sku,
        requiereReceta: !!p?.requiereReceta, controlado: !!p?.controlado, nevera: !!p?.nevera,
        categoria: p?.categoria, principioActivo: p?.principioActivo, cantidad: l.cantidad,
      };
    });
    const gens = lineas[0]?.principioActivo
      ? productos.filter((x) => x.principioActivo === lineas[0].principioActivo).slice(0, 6)
      : [];
    return {
      lineas,
      receta: state.recetaActiva,
      cliente: state.clienteActual,
      hasNevera: lineas.some((l) => l.nevera),
      hasCtrl: lineas.some((l) => l.controlado),
      metodoPago: pago.metodo,
      cambioSugerido: pago.cambio || 1.25,
      categorias: catalogMeta.categoriasUI || [],
      genericos: gens,
    };
  }

  function startMinigameQueue(pago, tot) {
    if (!Minis) { finalizarVenta(pago, tot); return; }
    const ctx = buildSaleGameCtx(pago, tot);
    miniQueue = Minis.pickGamesForSale(ctx);
    miniIndex = 0;
    miniFails = 0;
    pendingPago = { pago, tot };
    if (!miniQueue.length) { finalizarVenta(pago, tot); return; }
    $("#modal-minijuego").classList.add("open");
    runNextMinigame();
  }

  function runNextMinigame() {
    if (miniIndex >= miniQueue.length) {
      $("#modal-minijuego").classList.remove("open");
      const { pago, tot } = pendingPago;
      pendingPago = null;
      if (miniFails > 0) toast(`Minijuegos: ${miniFails} fallo(s) — se completa la venta igual`, "warn");
      finalizarVenta(pago, tot);
      return;
    }
    const game = miniQueue[miniIndex];
    const total = miniQueue.length;
    $("#mini-progress").innerHTML = miniQueue.map((_, i) =>
      `<span class="mini-step ${i < miniIndex ? "done" : i === miniIndex ? "now" : ""}">${i + 1}</span>`
    ).join("");
    $("#mini-status").textContent = `Minijuego ${miniIndex + 1} de ${total}`;
    Minis.runGame(game, $("#mini-root"), (ok) => {
      if (ok) state.stats.minijuegosOk = (state.stats.minijuegosOk || 0) + 1;
      else {
        miniFails += 1;
        state.stats.minijuegosFail = (state.stats.minijuegosFail || 0) + 1;
        toast("Minijuego fallido — reintenta o sigue", ok ? "ok" : "warn");
      }
      miniIndex += 1;
      setTimeout(runNextMinigame, ok ? 350 : 550);
    });
  }

  function renderMiniTrain() {
    if (!Minis || !$("#mini-train-grid")) return;
    $("#mini-train-grid").innerHTML = Minis.DEFS.map((d) =>
      `<button type="button" class="mini-train-card" data-mini="${d.id}"><span>${d.icon === "Stamp" ? "🔖" : d.icon}</span><strong>${escapeHtml(d.nombre)}</strong><span class="muted tiny">${escapeHtml(d.desc)}</span></button>`
    ).join("");
  }

  function practiceMini(type) {
    if (!Minis) return;
    const sample = productos[Math.floor(Math.random() * productos.length)];
    const gameMap = {
      barcode_scan: { type, product: sample },
      cut_paste_rx: {
        type, receta: { numero: "RE-PRACTICA", tipo: "papel" },
        productos: productos.filter((p) => p.requiereReceta).slice(0, 3).map((p) => ({ productId: p.id, nombre: p.nombre, ean: p.ean })),
      },
      e_receta_pin: { type, receta: { numero: "RE-ELEC-DEMO" } },
      firma_controlado: { type },
      contar_blister: { type },
      nevera_temp: { type },
      ordenar_caducidad: { type },
      verificar_dni: { type, dni: state.clienteActual.dni || "12345678Z" },
      bolsa_frio: {
        type,
        lineas: productos.filter((p) => p.nevera).slice(0, 2).concat(productos.filter((p) => !p.nevera).slice(0, 2))
          .map((p) => ({ nombre: p.nombre, icon: p.icon, nevera: !!p.nevera })),
      },
      cambio_rapido: { type, cambio: 1.35 },
      etiqueta_estante: { type, product: sample, categorias: catalogMeta.categoriasUI || [] },
      sello_receta: { type, tipo: Math.random() < 0.5 ? "papel" : "electronica" },
      emparejar_generico: { type, product: sample, opciones: productos.filter((p) => p.principioActivo === sample.principioActivo).slice(0, 4) },
      lavado_manos: { type },
      preguntar_alergia: { type, alergias: state.clienteActual.alergias?.length ? state.clienteActual.alergias : ["penicilina"] },
      pesar_pomada: { type, gramos: 20 + Math.floor(Math.random() * 30) },
      triage_urgencia: { type, urgencia: Math.random() < 0.45 },
    };
    const game = gameMap[type] || { type };
    miniQueue = [game];
    miniIndex = 0;
    miniFails = 0;
    pendingPago = null;
    $("#modal-minijuego").classList.add("open");
    $("#mini-progress").innerHTML = `<span class="mini-step now">★</span>`;
    $("#mini-status").textContent = "Modo entrenamiento";
    Minis.runGame(game, $("#mini-root"), (ok) => {
      if (ok) { state.stats.minijuegosOk = (state.stats.minijuegosOk || 0) + 1; toast("¡Bien!", "ok"); }
      else { state.stats.minijuegosFail = (state.stats.minijuegosFail || 0) + 1; toast("Fallaste — prueba otra vez", "warn"); }
      setTimeout(() => $("#modal-minijuego").classList.remove("open"), 500);
      save();
    });
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
      basesIva: tot.basesIva, aportacionCliente: tot.aportacionCliente || 0,
      topeAplicado: !!tot.topeAplicado, topeInfo: tot.topeInfo || null,
      guardia: state.settings.enGuardia && isOutsideNormal(state.gameTimeMs),
      recargoGuardia: 0,
      season: seasonInfo(state.gameTimeMs).id,
      receta: state.recetaActiva ? {
        numero: state.recetaActiva.numero, pacienteDni: state.recetaActiva.pacienteDni,
        medico: state.recetaActiva.medico, colegiado: state.recetaActiva.colegiado,
        tipo: state.recetaActiva.tipo, fase: state.recetaActiva.fase || null,
        visadoRef: state.recetaActiva.visadoRef || "",
      } : null,
    };

    if (ticket.guardia && Plus) {
      ticket.recargoGuardia = Plus.recargoGuardia(ticket.total);
      ticket.total = Caja.round2(ticket.total + ticket.recargoGuardia);
      pago.total = ticket.total;
      if (state.plus.guardiaStats) {
        state.plus.guardiaStats.ventasGuardia += 1;
        state.plus.guardiaStats.recargo = Caja.round2((state.plus.guardiaStats.recargo || 0) + ticket.recargoGuardia);
      }
      state.plus.fatiga = Math.min(100, (state.plus.fatiga || 0) + 5);
    }

    if (Plus && state.plus) {
      const urgOk = !(state.clienteActual.urgencia && lineas.some((l) => !l.requiereReceta));
      if (state.clienteActual.urgencia) {
        Plus.scoreEvent(state.plus, "alarma", urgOk,
          urgOk ? "No se forzó OTC en alarma" : "Se vendió OTC en contexto de alarma", urgOk ? 10 : -8);
      }
      if (ticket.receta) Plus.scoreEvent(state.plus, "receta", true, "Dispensación con receta", 6);
      else Plus.scoreEvent(state.plus, "venta", true, "Venta completada", 3);
      if (lineas.some((l) => l.controlado)) Plus.scoreEvent(state.plus, "controlado", true, "Controlado dispensado", 8);
    }

    if (tot.aportacionCliente > 0) {
      const k = mesCopagoKey();
      state.copagoMes[k] = Caja.round2((state.copagoMes[k] || 0) + tot.aportacionCliente);
    }

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
    Sounds.beepPay();
    save();
    renderCart(); renderReceta(); renderStats(); renderCatalog();
    renderCaja(); renderLibro(); renderPacientes(); renderSpeech();
    refreshClinicalAlerts();
    lastTicket = ticket;
    mostrarTicket(ticket);
    updateScoreHud();
    toast(ticket.recargoGuardia ? `Cobro OK · recargo guardia ${euro(ticket.recargoGuardia)}` : "Cobro TPV OK", "ok");
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
      q: ($("#search-q").value || "").trim().toLowerCase(),
      receta: $("#filter-receta").value,
      marca: ($("#filter-marca").value || "").trim().toLowerCase(),
      pa: ($("#filter-pa").value || "").trim().toLowerCase(),
    };
    return productos.filter((p) => {
      if (categoriaActiva && p.categoria !== categoriaActiva) return false;
      if (f.receta === "con" && !p.requiereReceta) return false;
      if (f.receta === "sin" && p.requiereReceta) return false;
      if (f.receta === "controlado" && !p.controlado) return false;
      if (f.receta === "nevera" && !p.nevera) return false;
      if (f.receta === "oferta" && !state.ofertasDia.includes(p.id)) return false;
      if (f.receta === "caduca" && !expiresSoon(p)) return false;
      if (f.receta === "bajo" && !isLow(p) && !isOut(p)) return false;
      if (f.marca && !(p.marca || "").toLowerCase().includes(f.marca)) return false;
      if (f.pa && !(p.principioActivo || "").toLowerCase().includes(f.pa)) return false;
      if (f.q) {
        const blob = `${p.nombre} ${p.marca} ${p.principioActivo} ${(p.sintomas || []).join(" ")} ${p.categoria} ${p.ean}`.toLowerCase();
        if (!blob.includes(f.q)) return false;
      }
      return true;
    });
  }

  function renderCatGrid() {
    const cats = catalogMeta.categoriasUI || window.FarmaciaCatalogo.CATEGORIAS_UI || [];
    const ramas = {};
    for (const c of cats) {
      const r = c.rama || "Otros";
      (ramas[r] = ramas[r] || []).push(c);
    }
    let html = `<button type="button" class="cat-btn ${!categoriaActiva ? "active" : ""}" data-cat="" style="background:linear-gradient(135deg,#334155,#0f172a)">
      <span class="cat-ico">🏪</span><span class="cat-name">Todas</span><span class="cat-count">${productos.length} prod.</span>
    </button>`;
    for (const [rama, list] of Object.entries(ramas)) {
      html += `<div class="cat-rama-label">${escapeHtml(rama)}</div>`;
      html += list.map((c) => `
      <button type="button" class="cat-btn ${categoriaActiva === c.nombre ? "active" : ""}" data-cat="${escapeHtml(c.nombre)}" style="background:${c.color}">
        <span class="cat-ico">${c.icon}</span>
        <span class="cat-name">${escapeHtml(c.nombre)}</span>
        <span class="cat-count">${c.count}${c.requiereReceta ? " · ℞" : ""}</span>
      </button>`).join("");
    }
    $("#cat-grid").innerHTML = html;
  }

  function renderPedidoExacto() {
    const box = $("#pedido-exacto");
    const ids = state.clienteActual.quiereProductoIds || [];
    if (!ids.length) { box.classList.add("hidden"); box.innerHTML = ""; return; }
    box.classList.remove("hidden");
    box.innerHTML = `<strong>El cliente pide exactamente:</strong>` + ids.map((id) => {
      const p = productos.find((x) => x.id === id);
      if (!p) return "";
      return `<button type="button" class="btn btn-sm btn-accent btn-pack" data-add="${p.id}">${packOf(p, "xs")} <span>${escapeHtml(p.nombre)}</span></button>`;
    }).join("");
  }

  function renderSintomas() {
    const list = Clinica.SINTOMAS_UI || catalogMeta.sintomas || [];
    $("#sintomas-row").innerHTML = `<button type="button" class="chip ${!sintomaActivo ? "active" : ""}" data-sintoma="">Todos síntomas</button>` +
      list.map((s) => `<button type="button" class="chip ${sintomaActivo === s ? "active" : ""}" data-sintoma="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("");
  }

  function renderCatalog() {
    const list = filteredProducts();
    const slice = list.slice(0, 80);
    $("#catalog-count").textContent = `${list.length} productos` + (categoriaActiva ? ` · ${categoriaActiva}` : "");
    $("#catalog-body").innerHTML = slice.map((p) => {
      const stock = state.stock[p.id] ?? 0;
      const offer = state.ofertasDia.includes(p.id);
      const cc = cadClass(p);
      const badges = [
        `<span class="cad-dot ${cc}" title="${escapeHtml(cadLabel(p))}"></span>`,
        p.requiereReceta ? '<span class="tag tag-rx">Receta</span>' : '<span class="tag tag-otc">OTC</span>',
        p.controlado ? '<span class="tag tag-ctrl">CTRL</span>' : "",
        p.nevera ? '<span class="tag tag-exp">❄ Nevera</span>' : "",
        p.esGenerico ? '<span class="tag tag-gen">EFG</span>' : "",
        offer ? '<span class="tag tag-offer">−15%</span>' : "",
        expiresSoon(p) ? '<span class="tag tag-exp">Caduca</span>' : "",
        isExpired(p) ? '<span class="tag tag-ctrl">CADUCADO</span>' : "",
      ].join("");
      const precioShow = offer ? Caja.round2(p.precio * 0.85) : p.precio;
      return `<tr>
        <td>
          <div class="prod-row">
            ${packOf(p, "md")}
            <div>
              <div class="prod-name">${escapeHtml(p.nombre)}</div>
              <div class="prod-meta">${escapeHtml(p.marca)} · ${escapeHtml(p.principioActivo)} · ${escapeHtml(p.categoria)} · <span class="cad-txt ${cc}">${escapeHtml(cadLabel(p))}</span></div>
              <div class="prod-tags">${badges}</div>
            </div>
          </div>
        </td>
        <td>${euro(precioShow)}</td>
        <td class="${stock < 10 || isLow(p) ? "stock-low" : ""}">${stock}</td>
        <td><button class="btn btn-sm btn-primary" data-add="${p.id}" ${isExpired(p) ? "disabled" : ""}>Añadir</button></td>
      </tr>`;
    }).join("") || `<tr><td colspan="4" class="empty">Sin resultados — prueba otra categoría o síntoma</td></tr>`;

    const cards = $("#catalog-cards");
    const tableWrap = $("#catalog-table-wrap");
    if (cards && tableWrap) {
      const showCards = catalogView === "cards";
      cards.classList.toggle("hidden", !showCards);
      tableWrap.classList.toggle("hidden", showCards);
      $("#btn-view-cards")?.classList.toggle("btn-primary", showCards);
      $("#btn-view-table")?.classList.toggle("btn-primary", !showCards);
      cards.innerHTML = slice.map((p) => {
        const stock = state.stock[p.id] ?? 0;
        const offer = state.ofertasDia.includes(p.id);
        const precioShow = offer ? Caja.round2(p.precio * 0.85) : p.precio;
        return `<article class="prod-card ${isExpired(p)?"expired":""}">
          ${packOf(p, "lg")}
          <div class="prod-card-body">
            <strong>${escapeHtml(p.nombre)}</strong>
            <span class="muted tiny">${escapeHtml(p.marca)} · stock ${stock}</span>
            <span class="prod-card-price">${euro(precioShow)}${offer?" · oferta":""}</span>
            <button class="btn btn-sm btn-primary" data-add="${p.id}" ${isExpired(p)?"disabled":""}>＋ Añadir</button>
          </div>
        </article>`;
      }).join("") || `<div class="empty">Sin resultados</div>`;
    }
    renderCampania();
  }

  function renderCampania() {
    const box = $("#campania-banner");
    if (!box || !Clinic) return;
    const season = seasonInfo(state.gameTimeMs);
    const c = Clinic.campaniaActual(season.id);
    box.hidden = false;
    box.style.setProperty("--camp-color", c.color);
    box.innerHTML = `
      <div class="camp-ico">${c.icon}</div>
      <div>
        <strong>${escapeHtml(c.titulo)}</strong>
        <p>${escapeHtml(c.script)}</p>
      </div>
      <button type="button" class="btn btn-sm btn-primary" id="btn-camp-apply">Usar en venta</button>`;
  }

  function renderCart() {
    if (!state.cart.length) $("#cart-body").innerHTML = `<div class="empty">🧺 Carrito vacío<br><span class="muted">Atiende a un cliente o pulsa una categoría y “＋ Añadir”</span></div>`;
    else {
      $("#cart-body").innerHTML = state.cart.map((l) => {
        const t = lineTotals(l); const p = t.producto;
        return `<div class="cart-line">
          <div class="cart-line-main cart-with-pack">
            ${packOf(p, "sm")}
            <div>
              <strong>${escapeHtml(p.nombre)}</strong>
              <span class="muted">${euro(t.precio)}${t.oferta?" · oferta":""} · ${p.requiereReceta?"℞":"OTC"}</span>
            </div>
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
    $("#tot-mutua").textContent = euro(tot.cubierto) + (tot.topeAplicado ? " · tope" : "");
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
    const modoMap = (Clientes && Clientes.MODOS_LABEL) || {};
    const modo = c.modoLabel || modoMap[c.modo] || c.modo || "";
    const pagoTxt = c.metodoPago ? " · Paga: " + metodoNombre(c.metodoPago) : "";
    const perfilTxt = c.perfilId ? " · Perfil" : "";
    const tutorTxt = c.tutor ? ` · Tutor: ${c.tutor}` : "";
    const urgTxt = c.urgencia ? " · ⚠ URGENTE" : "";
    $("#speech-name").textContent = `${c.nombre || "Cliente"}${c.edad != null ? ` (${c.edad} años)` : ""}${modo ? " · " + modo : ""}${pagoTxt}${perfilTxt}${tutorTxt}${urgTxt}`;
    $("#speech-text").textContent = `«${c.peticionTexto}»`;
    const tags = (c.sintomas || []).map((s) => `<button type="button" class="chip" data-sintoma="${escapeHtml(s)}">${escapeHtml(s)}</button>`);
    if (c.metodoPago) tags.push(`<span class="chip chip-pago">💳 ${escapeHtml(metodoNombre(c.metodoPago))}</span>`);
    if (c.urgencia) tags.push(`<span class="chip chip-warn">⚠ Valorar derivación</span>`);
    if (c.pista) tags.push(`<span class="chip chip-pista">💡 ${escapeHtml(c.pista)}</span>`);
    if (c.paraQuien) tags.push(`<span class="chip">Para: ${escapeHtml(c.paraQuien)}</span>`);
    if (state.recetaActiva) tags.push(`<span class="chip">${state.recetaActiva.tipo === "papel" ? "📄 Papel" : "💻 Electrónica"}</span>`);
    $("#speech-tags").innerHTML = tags.join("");
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
        <div><span class="lbl">Tipo</span> ${r.tipo === "papel" ? "📄 Papel" : "💻 Electrónica"} ${r.fase && r.tipo === "electronica" ? "· " + escapeHtml(r.fase) : ""}</div>
        <div><span class="lbl">Médico</span> ${escapeHtml(r.medico)}</div>
        <div><span class="lbl">Paciente</span> ${escapeHtml(r.pacienteNombre)} (${escapeHtml(r.pacienteDni)})</div>
        <div><span class="lbl">Validez</span> ${r.validezDias} días ${r.visadoOk ? "· ✅ Visado" : ""}</div>
      </div>
      ${r.observaciones ? `<p class="muted tiny">${escapeHtml(r.observaciones)}</p>` : ""}
      <ul class="receta-items">${r.productos.map((rp)=>{
        const full = productos.find((x) => x.id === rp.productId);
        return `<li class="rx-li">${full ? packOf(full, "xs") : ""}<span>${escapeHtml(rp.nombre)} × ${rp.cantidad}${rp.requiereVisado || Extras.needsVisado(full) ? ' <span class="tag tag-ctrl">VISADO</span>' : ""}</span>
        <button class="btn btn-sm btn-primary" data-add="${rp.productId}">Añadir</button></li>`;
      }).join("")}</ul>`;
  }

  function renderCola() {
    $("#cola-count").textContent = String(state.cola.length);
    if (!state.cola.length) { $("#cola-list").innerHTML = `<div class="empty">💬 Nadie en cola</div>`; return; }
    $("#cola-list").innerHTML = state.cola.map((ped) => {
      const c = ped.cliente;
      const modoMap = (Clientes && Clientes.MODOS_LABEL) || {};
      const modoLabel = c.modoLabel || modoMap[c.modo] || c.modo;
      return `<article class="pedido-card ${ped.guardia ? "guardia" : ""} ${c.urgencia ? "urgencia" : ""}">
        <header><strong>${escapeHtml(c.nombre)}</strong><span class="muted">${formatShort(ped.llegada)}</span></header>
        <div class="muted tiny">${escapeHtml(c.id)} · ${c.edad || "?"} años · ${escapeHtml(modoLabel)}${c.urgencia ? " · ⚠" : ""}</div>
        <p class="quote">«${escapeHtml(c.peticionTexto)}»</p>
        <div>${(c.sintomas || []).map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}
          ${ped.receta ? `<span class="tag tag-rx">Receta ${ped.receta.tipo === "papel" ? "papel" : "e-"}×${ped.receta.productos.length}</span>` : ""}
          ${(c.quiereProductoIds || []).length ? '<span class="tag tag-offer">Pide exacto</span>' : ""}
          ${c.urgencia ? '<span class="tag tag-ctrl">Alarma</span>' : ""}
          ${c.metodoPago ? `<span class="tag tag-otc">💳 ${escapeHtml(metodoNombre(c.metodoPago))}</span>` : ""}
        </div>
        <div class="pedido-actions" style="margin-top:10px">
          <button class="btn btn-sm btn-primary" data-atender="${ped.id}">Atender</button>
          <button class="btn btn-sm" data-descartar="${ped.id}">Descartar</button>
        </div>
      </article>`;
    }).join("");
  }

  function renderStats() {
    $("#stat-catalog").textContent = productos.length.toLocaleString("es-ES");
    $("#stat-tickets").textContent = String(state.stats.tickets);
    $("#stat-fact").textContent = euro(state.stats.facturacion);
    const low = productos.filter(isLow).length + productos.filter(isOut).length;
    const exp = productos.filter(expiresSoon).length;
    $("#stat-low").textContent = String(low);
    $("#stat-exp").textContent = String(exp);
    const lotEl = $("#stat-lotes");
    if (lotEl) lotEl.textContent = String((state.plus?.alertasLote || []).filter((a) => !a.resuelta).length);
    updateScoreHud();
  }

  function renderMutuas() {
    const opts = MUTUAS.map((m)=>`<option value="${m.id}">${m.nombre}</option>`).join("");
    $("#mutua-select").innerHTML = opts;
    $("#mutua-select").value = state.mutuaId;
    $("#np-mutua").innerHTML = opts;
  }

  function renderCategorias() { /* categorías vía cat-grid */ renderCatGrid(); }

  function stockByCategory(nombre) {
    const list = productos.filter((p) => p.categoria === nombre);
    let stock = 0, min = 0;
    for (const p of list) {
      stock += state.stock[p.id] || 0;
      min += state.lotes[p.id]?.stockMinimo ?? p.stockMinimo ?? 5;
    }
    return { list, stock, min, low: stock < min * 0.5 };
  }

  function maybeAutoPedidoCategoria(catNombre) {
    const info = stockByCategory(catNombre);
    if (!info.low) return;
    const pending = state.pedidosAlmacen.some((p) => !p.recibido && productos.find((x) => x.id === p.productId)?.categoria === catNombre);
    if (pending) return;
    // pedir el más bajo de la categoría
    const sorted = info.list.slice().sort((a, b) => (state.stock[a.id] || 0) - (state.stock[b.id] || 0));
    const target = sorted[0];
    if (!target) return;
    pedirAlmacen(target.id, Math.max(15, target.stockMinimo || 10));
    toast(`Pedido automático: categoría «${catNombre}» baja`, "warn");
  }

  function autoPedidosCategoriasBajas() {
    const cats = catalogMeta.categoriasUI || [];
    let n = 0;
    for (const c of cats) {
      const info = stockByCategory(c.nombre);
      if (!info.low) continue;
      const pending = state.pedidosAlmacen.some((p) => !p.recibido && productos.find((x) => x.id === p.productId)?.categoria === c.nombre);
      if (pending) continue;
      const sorted = info.list.slice().sort((a, b) => (state.stock[a.id] || 0) - (state.stock[b.id] || 0));
      if (sorted[0]) { pedirAlmacen(sorted[0].id, 20); n++; }
    }
    toast(n ? `Pedidos auto: ${n} categorías` : "Ninguna categoría crítica", n ? "ok" : "warn");
  }

  function renderInventario() {
    const cats = catalogMeta.categoriasUI || [];
    $("#inventario-cats").innerHTML = cats.map((c) => {
      const info = stockByCategory(c.nombre);
      const crit = info.list.filter((p) => cadClass(p) === "r").length;
      const soon = info.list.filter((p) => cadClass(p) === "o").length;
      return `<div class="inv-card ${info.low ? "low" : ""}" style="background:${c.color}">
        <div class="inv-top"><span>${c.icon} ${escapeHtml(c.nombre)}</span><strong>${info.stock}</strong></div>
        <div class="inv-meta">${c.count} refs · mín. ~${info.min}${info.low ? " · ⚠ BAJO" : ""}${c.requiereReceta ? " · ℞" : ""}</div>
        <div class="inv-cad"><span class="cad-dot r"></span>${crit} · <span class="cad-dot o"></span>${soon} · <span class="cad-dot g"></span>${info.list.length - crit - soon}</div>
      </div>`;
    }).join("");
  }

  function renderConteoFisico() {
    const box = $("#inv-fisico-box");
    if (!box) return;
    const q = ($("#dev-search")?.value || "").toLowerCase(); // reuse search optional
    // show products with mismatch or sample from active category / low stock
    let list = productos.filter((p) => isLow(p) || isOut(p) || cadClass(p) !== "g").slice(0, 25);
    if (!list.length) list = productos.slice(0, 15);
    box.innerHTML = list.map((p) => {
      const teorico = state.stock[p.id] || 0;
      const fisico = state.conteoFisico[p.id];
      const diff = fisico == null ? "—" : (fisico - teorico);
      return `<div class="list-item conteo-row">
        <div class="prod-row"><span class="cad-dot ${cadClass(p)}"></span>${packOf(p, "xs")}
          <div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">Teórico ${teorico} · ${escapeHtml(cadLabel(p))}</div></div>
        </div>
        <div class="conteo-actions">
          <input type="number" min="0" class="conteo-in" data-conteo="${p.id}" value="${fisico == null ? teorico : fisico}" />
          <button type="button" class="btn btn-sm btn-primary" data-aplicar-conteo="${p.id}">Corregir</button>
          <span class="muted tiny">${diff === "—" ? "" : ("Δ " + diff)}</span>
        </div>
      </div>`;
    }).join("") || `<div class="empty">Sin ítems</div>`;
  }

  function aplicarConteo(productId, fisico) {
    const teorico = state.stock[productId] || 0;
    state.conteoFisico[productId] = fisico;
    state.stock[productId] = Math.max(0, fisico);
    const delta = fisico - teorico;
    toast(delta === 0 ? "Conteo OK (sin cambio)" : `Stock corregido Δ${delta > 0 ? "+" : ""}${delta}`, delta === 0 ? "ok" : "warn");
    Sounds.beepOk();
    renderConteoFisico(); renderCatalog(); renderInventario(); renderStats(); save();
  }

  function renderGestion() {
    const devList = $("#dev-list");
    const rotList = $("#gastos-list"); // roturas shown before gastos - use separate
    if ($("#dev-list")) {
      $("#dev-list").innerHTML = (state.devoluciones || []).slice().reverse().slice(0, 30).map((d) =>
        `<div class="list-item"><div><strong>${escapeHtml(d.nombre)}</strong><div class="muted tiny">×${d.cantidad} · ${escapeHtml(d.motivo)} · ${formatShort(d.fecha)}</div></div><span class="badge badge-warn">DEV</span></div>`
      ).join("") || `<div class="empty">Sin devoluciones</div>`;
    }
    // roturas: insert list if missing - use rot-suggest sibling... we'll put recent in rot-suggest area after button via #rot-list if exists
    let rotBox = $("#rot-list");
    if (!rotBox && $("#btn-rotura")) {
      rotBox = document.createElement("div");
      rotBox.id = "rot-list";
      rotBox.className = "list-block";
      $("#btn-rotura").after(rotBox);
    }
    if (rotBox) {
      rotBox.innerHTML = (state.roturas || []).slice().reverse().slice(0, 20).map((d) =>
        `<div class="list-item"><div><strong>${escapeHtml(d.nombre)}</strong><div class="muted tiny">×${d.cantidad} · ${escapeHtml(d.motivo)} · ${formatShort(d.fecha)}</div></div><span class="badge badge-err">ROT</span></div>`
      ).join("") || `<div class="empty">Sin roturas</div>`;
    }
    if ($("#gastos-list")) {
      $("#gastos-list").innerHTML = (state.gastos || []).slice().reverse().slice(0, 30).map((g) =>
        `<div class="list-item"><div><strong>${escapeHtml(g.tipo)}</strong><div class="muted tiny">${formatShort(g.fecha)}</div></div><strong>${euro(g.importe)}</strong></div>`
      ).join("") || `<div class="empty">Sin gastos</div>`;
      const sum = (state.gastos || []).reduce((a, g) => a + (g.importe || 0), 0);
      $("#gastos-total").textContent = "Gastos: " + euro(sum);
    }
    renderSigre();
  }

  function suggestGestion(inputId, suggestId, pickVar) {
    const q = ($(inputId)?.value || "").toLowerCase();
    const hits = !q ? [] : productos.filter((p) => `${p.nombre} ${p.marca}`.toLowerCase().includes(q)).slice(0, 12);
    $(suggestId).innerHTML = hits.map((p) =>
      `<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">stock ${state.stock[p.id]||0} · <span class="cad-dot ${cadClass(p)}"></span>${escapeHtml(cadLabel(p))}</div></div>
      <button class="btn btn-sm" data-gpick="${p.id}">Elegir</button></div>`
    ).join("") || (q ? `<div class="empty">Sin resultados</div>` : `<div class="empty">Escribe para buscar</div>`);
  }

  function registrarDevolucion() {
    if (!gestPickId) { toast("Elige producto", "warn"); return; }
    const p = productos.find((x) => x.id === gestPickId);
    const qty = Math.max(1, Number($("#dev-qty").value) || 1);
    if ((state.stock[p.id] || 0) < qty) { toast("No hay stock suficiente", "err"); return; }
    state.stock[p.id] -= qty;
    state.devoluciones.unshift({
      id: "DEV-" + Date.now().toString(36), fecha: state.gameTimeMs, productId: p.id,
      nombre: p.nombre, cantidad: qty, motivo: $("#dev-motivo").value,
    });
    Sounds.beepWarn();
    toast(`Devolución: ${p.nombre} ×${qty}`, "ok");
    gestPickId = null; renderGestion(); renderCatalog(); renderInventario(); save();
  }

  function registrarRotura() {
    if (!rotPickId) { toast("Elige producto", "warn"); return; }
    const p = productos.find((x) => x.id === rotPickId);
    const qty = Math.max(1, Number($("#rot-qty").value) || 1);
    if ((state.stock[p.id] || 0) < qty) { toast("No hay stock suficiente", "err"); return; }
    state.stock[p.id] -= qty;
    state.roturas.unshift({
      id: "ROT-" + Date.now().toString(36), fecha: state.gameTimeMs, productId: p.id,
      nombre: p.nombre, cantidad: qty, motivo: $("#rot-motivo").value,
    });
    Sounds.beepAlert();
    toast(`Rotura registrada: ${p.nombre} ×${qty}`, "warn");
    rotPickId = null; renderGestion(); renderCatalog(); renderInventario(); save();
  }

  function registrarGasto() {
    const importe = Number($("#gasto-imp").value) || 0;
    if (importe <= 0) { toast("Importe inválido", "warn"); return; }
    state.gastos.unshift({
      id: "GAS-" + Date.now().toString(36), fecha: state.gameTimeMs,
      tipo: $("#gasto-tipo").value, importe: Caja.round2(importe),
    });
    // restar de caja efectivo si abierta
    if (state.caja.abierta) {
      state.caja.movimientos.push({
        id: "MOV-G-" + Date.now().toString(36), fecha: state.gameTimeMs,
        metodo: "gasto", total: -importe, ticketId: "GASTO",
      });
    }
    Sounds.beepCoin();
    toast("Gasto añadido", "ok");
    renderGestion(); renderCaja(); save();
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
    $("#alm-pedidos").innerHTML = state.pedidosAlmacen.slice().reverse().slice(0,40).map((p)=>{
      let st = "EN CAMINO"; let badge = "badge-warn"; let action = "";
      if (p.recibido) { st = "RECIBIDO · lote " + (p.loteRecibido || "—"); badge = "badge-ok"; }
      else if (p.llegado) {
        st = "EN MUELLE — falta albarán"; badge = "badge-purple";
        action = `<button class="btn btn-sm btn-primary" data-albaran="${p.id}">📋 Albarán</button>`;
      }
      return `<div class="list-item">
        <div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">×${p.cantidad} · ${formatShort(p.llegadaMs)} · ${escapeHtml(st)}</div></div>
        <div class="actions-row" style="margin:0">${action}<span class="badge ${badge}">${p.recibido?"OK":p.llegado?"ALB":"…"}</span></div>
      </div>`;
    }).join("") || `<div class="empty">Sin pedidos</div>`;

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
    const hoy = state.ventas.filter((v) => dayKey(v.fechaJuego) === dayKey(state.gameTimeMs));
    const r = Caja.resumenCaja(state.caja, hoy);
    const topMap = {};
    const catMap = {};
    for (const v of hoy) {
      for (const l of v.lineas) {
        topMap[l.nombre] = (topMap[l.nombre] || 0) + l.cantidad;
        const p = productos.find((x) => x.id === l.productId);
        const cat = p?.categoria || "Otros";
        catMap[cat] = (catMap[cat] || 0) + l.total;
      }
    }
    const top = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const season = seasonInfo(state.gameTimeMs);
    const F = Extras.FARMACIA;
    $("#informe-content").innerHTML = `
      <div class="doc-sheet doc-informe" id="informe-print-inner">
        <div class="doc-banner">
          <div class="doc-logo">✚</div>
          <div>
            <div class="doc-brand">${escapeHtml(F.nombre)}</div>
            <div class="doc-sub">${escapeHtml(F.direccion)} · NIF ${escapeHtml(F.nif)}</div>
          </div>
          <div class="doc-badge">INFORME DEL DÍA</div>
        </div>
        <p class="doc-meta-line">${formatGameDate(state.gameTimeMs)} · ${season.label}</p>
        <div class="informe-kpis">
          <div class="ik"><span>Tickets</span><strong>${hoy.length}</strong></div>
          <div class="ik"><span>Facturación</span><strong>${euro(r.facturacion)}</strong></div>
          <div class="ik"><span>Margen est.</span><strong>${euro(r.margen)}</strong></div>
          <div class="ik"><span>SIGRE</span><strong>${state.stats.sigre||0}</strong></div>
          <div class="ik"><span>Nota</span><strong>${Plus ? Plus.notaDelDia(state.plus, state.stats).letra : "—"} · ${state.plus?.evaluacion?.puntos||0} pts</strong></div>
        </div>
        <div class="informe-grid">
          <div class="informe-card c-teal"><h3>📂 Categorías</h3>
            ${cats.map(([n, tt]) => `<div class="inf-row"><span>${escapeHtml(n)}</span><strong>${euro(tt)}</strong></div>`).join("") || "<p>Sin datos</p>"}
          </div>
          <div class="informe-card c-blue"><h3>💳 Métodos TPV</h3>
            ${Caja.METODOS.map((m) => `<div class="inf-row"><span>${m.icon} ${m.nombre}</span><strong>${euro(r.porMetodo[m.id] || 0)}</strong></div>`).join("")}
          </div>
          <div class="informe-card c-amber"><h3>🏆 Top productos</h3>
            <ol>${top.map(([n, c]) => `<li>${escapeHtml(n)} ×${c}</li>`).join("") || "<li>Sin datos</li>"}</ol>
          </div>
          <div class="informe-card c-pink"><h3>🎮 Gestión</h3>
            <div class="inf-row"><span>Minijuegos OK/Fail</span><strong>${state.stats.minijuegosOk||0}/${state.stats.minijuegosFail||0}</strong></div>
            <div class="inf-row"><span>Devoluciones</span><strong>${(state.devoluciones||[]).length}</strong></div>
            <div class="inf-row"><span>Roturas</span><strong>${(state.roturas||[]).length}</strong></div>
            <div class="inf-row"><span>Adherencias</span><strong>${(state.adherencias||[]).length}</strong></div>
            <div class="inf-row"><span>Gastos</span><strong>${euro((state.gastos||[]).reduce((a,g)=>a+(g.importe||0),0))}</strong></div>
          </div>
        </div>
        <div class="doc-foot"><span>Informe de práctica · Farmacia Álora</span><span>${formatShort(state.gameTimeMs)}</span></div>
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
    const ped = state.cola.find((p) => p.id === id);
    if (!ped) return;
    const c = ped.cliente;
    state.clienteActual = {
      nombre: c.nombre, dni: c.dni, telefono: c.telefono, pacienteId: c.id, seedId: c.seedId,
      tramoSNS: c.tramoSNS, familiaNumerosa: !!c.familiaNumerosa,
      peticionTexto: c.peticionTexto, sintomas: c.sintomas || [],
      quiereProductoIds: c.quiereProductoIds || [], modo: c.modo, modoLabel: c.modoLabel || "",
      alergias: c.alergias || [], cronicos: c.cronicos || [],
      embarazo: !!c.embarazo, lactancia: !!c.lactancia, edad: c.edad,
      metodoPago: c.metodoPago || null,
      urgencia: !!c.urgencia, pista: c.pista || "", paraQuien: c.paraQuien || null,
      tutor: c.tutor || null, tono: c.tono || "normal",
    };
    state.mutuaId = c.mutuaId || "particular";
    state.tramoSNS = c.tramoSNS || "particular";
    state.flagsDesc.pensionista = c.tramoSNS === "pensionista";
    state.flagsDesc.familia = !!c.familiaNumerosa;
    state.cart = [];
    state.recetaActiva = ped.receta ? { ...ped.receta, productos: ped.receta.productos.map((x) => ({ ...x })) } : null;
    state.cola = state.cola.filter((p) => p.id !== id);

    sintomaActivo = (c.sintomas && c.sintomas[0]) || "";
    categoriaActiva = "";
    $("#search-q").value = sintomaActivo;
    bindClienteForm();
    renderMutuas(); renderSpeech(); renderPedidoExacto(); renderSintomas();
    renderCatGrid(); renderCatalog();
    renderCart(); renderReceta(); renderCola(); refreshClinicalAlerts();
    save();
    if (c.urgencia) toast(`⚠ ${c.nombre}: valorar derivación / alarma clínica`, "warn");
    else toast(`Atiende a ${c.nombre}`, "ok");
    if (Plus && ped.receta?.tipo === "electronica") {
      state.plus.erecetaSesion = Plus.crearSesionEreceta(c, ped.receta);
    } else if (state.plus) {
      state.plus.erecetaSesion = null;
    }
    showTab("venta");
    renderEreceta();
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
    lastTicket = ticket;
    renderDocumento(ticket, docTipo);
    showTab("ticket");
  }

  function renderDocumento(ticket, tipo) {
    if (!ticket) {
      $("#ticket-content").innerHTML = `<p class="empty">Sin ticket aún</p>`;
      return;
    }
    const F = Extras.FARMACIA;
    const isFact = tipo === "simplificada" || tipo === "completa";
    const title = tipo === "completa" ? "FACTURA COMPLETA" : tipo === "simplificada" ? "FACTURA SIMPLIFICADA" : "TICKET DE VENTA";
    const ivaRows = Object.entries(ticket.basesIva || {}).filter(([, b]) => b > 0).map(([pct, b]) => {
      const cuota = b * (Number(pct) / 100);
      return `<tr><td>IVA ${pct}%</td><td>${euro(b)}</td><td>${euro(cuota)}</td></tr>`;
    }).join("");
    const clienteBlock = isFact ? `
      <div class="doc-party">
        <div class="doc-party-label">Cliente</div>
        <strong>${escapeHtml(ticket.cliente.nombre || "Consumidor final")}</strong>
        <div>DNI/NIE: ${escapeHtml(ticket.cliente.dni || (tipo === "completa" ? "—" : "—"))}</div>
        ${tipo === "completa" ? `<div>Tramo SNS: ${escapeHtml(ticket.tramoSNS)}</div><div>Mutua: ${escapeHtml(ticket.mutua)}</div>` : ""}
      </div>` : `
      <div class="doc-meta-line">Cliente: <strong>${escapeHtml(ticket.cliente.nombre || "—")}</strong> · ${escapeHtml(ticket.cliente.dni || "—")}</div>
      <div class="doc-meta-line">SNS: ${escapeHtml(ticket.tramoSNS)} · Pago: ${escapeHtml(metodoNombre(ticket.pago?.metodo))}${ticket.pago?.cambio ? " · Cambio " + euro(ticket.pago.cambio) : ""}</div>`;

    $("#ticket-content").innerHTML = `
      <div class="doc-sheet doc-${tipo}" id="ticket-print-area">
        <div class="doc-banner">
          <div class="doc-logo">✚</div>
          <div>
            <div class="doc-brand">${escapeHtml(F.nombre)}</div>
            <div class="doc-sub">${escapeHtml(F.direccion)} · Tel. ${escapeHtml(F.telefono)}</div>
            <div class="doc-sub">NIF ${escapeHtml(F.nif)} · Col. ${escapeHtml(F.colegiado)}</div>
          </div>
          <div class="doc-badge">${title}</div>
        </div>
        <div class="doc-grid">
          <div>
            <div class="doc-id">${escapeHtml(ticket.id)}</div>
            <div class="doc-meta-line">${formatShort(ticket.fechaJuego)}${ticket.guardia ? " · GUARDIA" : ""}</div>
            ${ticket.receta ? `<div class="doc-meta-line">Receta ${escapeHtml(ticket.receta.tipo)} ${ticket.receta.fase ? "· " + escapeHtml(ticket.receta.fase) : ""} · ${escapeHtml(ticket.receta.numero)}</div>` : ""}
          </div>
          ${clienteBlock}
        </div>
        <table class="doc-table">
          <thead><tr><th>Descripción</th><th>Ud</th><th>PVP</th><th>Importe</th></tr></thead>
          <tbody>
            ${ticket.lineas.map((l) => `<tr>
              <td><strong>${escapeHtml(l.nombre)}</strong>${l.oferta ? " <span class='doc-tag'>Oferta</span>" : ""}
                <div class="doc-mini">Lote ${escapeHtml(l.lote || "—")} · IVA ${l.iva}%</div></td>
              <td>${l.cantidad}</td><td>${euro(l.precio)}</td><td>${euro(l.total)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
        ${isFact ? `<table class="doc-table doc-iva"><thead><tr><th>Tipo</th><th>Base</th><th>Cuota</th></tr></thead><tbody>${ivaRows || "<tr><td colspan=3>—</td></tr>"}</tbody></table>` : ""}
        <div class="doc-totals">
          <div><span>Base imponible</span><span>${euro(ticket.base)}</span></div>
          <div><span>IVA</span><span>${euro(ticket.iva)}</span></div>
          <div><span>Bruto</span><span>${euro(ticket.bruto)}</span></div>
          <div><span>Descuentos</span><span>−${euro(ticket.descuento)}</span></div>
          <div><span>SNS / Mutua</span><span>−${euro(ticket.coberturaMutua)}</span></div>
          ${ticket.aportacionCliente ? `<div><span>Aportación SNS cliente</span><span>${euro(ticket.aportacionCliente)}</span></div>` : ""}
          <div class="doc-grand"><span>TOTAL</span><span>${euro(ticket.total)}</span></div>
        </div>
        <div class="doc-foot">
          <span>Documento de práctica educativa · no válido fiscalmente</span>
          <span>Farmacia Álora · Álora (Málaga)</span>
        </div>
      </div>`;
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
      fase: $("#rx-fase")?.value || "primera",
      pacienteNombre:$("#rx-paciente").value.trim(), pacienteDni:$("#rx-dni").value.trim().toUpperCase(),
      medico:$("#rx-medico").value.trim(), colegiado:$("#rx-colegiado").value.trim(),
      fechaEmision: fechaStr?new Date(fechaStr+"T12:00:00").getTime():state.gameTimeMs,
      validezDias:Number($("#rx-validez").value)||30,
      productos: productosRx.map((x) => ({ ...x, requiereVisado: Extras.needsVisado(productos.find((p) => p.id === x.productId)) })),
      dispensada:false, observaciones:$("#rx-obs").value.trim(),
      visadoOk: false, visadoRef: "",
    };
    $("#modal-receta").classList.remove("open");
    renderReceta(); save(); toast("Receta activa", "ok");
  }


  function renderPerfiles() {
    const box = $("#perfiles-grid");
    if (!box || !Extras) return;
    box.innerHTML = Extras.PERFILES.map((p) =>
      `<button type="button" class="perfil-card" data-perfil="${p.id}"><span>${p.icon}</span><strong>${escapeHtml(p.label)}</strong><span class="muted tiny">${escapeHtml(p.nombre)}</span></button>`
    ).join("");
  }

  function atenderPerfil(id) {
    const p = Extras.PERFILES.find((x) => x.id === id);
    if (!p) return;
    let receta = null;
    if (p.quiereReceta) {
      const r = rng(Date.now());
      const med = pick(r, MEDICOS);
      const chronics = productos.filter((x) => x.requiereReceta && p.cronicos.some((c) => (x.principioActivo || "").toLowerCase().includes(c) || (x.nombre || "").toLowerCase().includes(c)));
      let pool = chronics.length ? chronics : productos.filter((x) => x.requiereReceta && x.categoria === "Cardiovascular");
      const items = pool.slice(0, 2).map((x) => ({
        productId: x.id, nombre: x.nombre, cantidad: 1, controlado: !!x.controlado, requiereVisado: Extras.needsVisado(x), ean: x.ean,
      }));
      if (!items.length) {
        const any = productos.filter((x) => x.requiereReceta).slice(0, 2);
        items.push(...any.map((x) => ({ productId: x.id, nombre: x.nombre, cantidad: 1, controlado: !!x.controlado, requiereVisado: Extras.needsVisado(x), ean: x.ean })));
      }
      receta = {
        numero: genRecetaNum(r, state.gameTimeMs), tipo: "electronica", fase: "continuacion",
        pacienteNombre: p.nombre, pacienteDni: p.dni, medico: med.nombre, colegiado: med.colegiado,
        fechaEmision: state.gameTimeMs - 2 * 86400000, validezDias: 30, productos: items,
        dispensada: false, observaciones: "Perfil práctica · e-receta continuación.", visadoOk: false, visadoRef: "",
      };
    }
    state.clienteActual = {
      ...emptyCliente(),
      nombre: p.nombre, dni: p.dni, edad: p.edad, tramoSNS: p.tramoSNS, familiaNumerosa: !!p.familiaNumerosa,
      peticionTexto: p.peticionTexto, sintomas: p.sintomas || [], quiereProductoIds: p.quiereProductoIds || [],
      modo: p.modo, alergias: p.alergias || [], cronicos: p.cronicos || [],
      embarazo: !!p.embarazo, lactancia: !!p.lactancia, metodoPago: p.metodoPago,
      perfilId: p.id, tutor: p.tutor || null, telefono: "600000000",
    };
    state.mutuaId = p.mutuaId || "particular";
    state.tramoSNS = p.tramoSNS;
    state.flagsDesc.pensionista = p.tramoSNS === "pensionista";
    state.cart = [];
    state.recetaActiva = receta;
    sintomaActivo = (p.sintomas && p.sintomas[0]) || "";
    $("#search-q").value = sintomaActivo;
    bindClienteForm(); renderMutuas(); renderSpeech(); renderPedidoExacto(); renderSintomas();
    renderCatGrid(); renderCatalog(); renderCart(); renderReceta(); renderAdherenciaPanel();
    refreshClinicalAlerts(); save();
    toast(`Perfil: ${p.label}`, "ok");
    showTab("venta");
  }

  function renderAdherenciaPanel() {
    const box = $("#adh-cronicos");
    if (!box) return;
    const c = state.clienteActual.cronicos || [];
    if (!c.length) { box.innerHTML = `<div class="empty">Sin crónicos en el paciente actual</div>`; return; }
    box.innerHTML = c.map((med) => `
      <div class="list-item adh-row">
        <strong>${escapeHtml(med)}</strong>
        <div class="actions-row" style="margin:0">
          <button class="btn btn-sm btn-primary" data-adh="${escapeHtml(med)}" data-res="si">Cumple</button>
          <button class="btn btn-sm btn-accent" data-adh="${escapeHtml(med)}" data-res="parcial">Parcial</button>
          <button class="btn btn-sm" data-adh="${escapeHtml(med)}" data-res="no">No cumple</button>
        </div>
      </div>`).join("");
    renderAdherenciaLista();
  }

  function renderAdherenciaLista() {
    const list = $("#adh-list");
    if (!list) return;
    const dni = state.clienteActual.dni;
    const rows = (state.adherencias || []).filter((a) => !dni || a.dni === dni).slice(0, 20);
    list.innerHTML = rows.map((a) =>
      `<div class="list-item"><div><strong>${escapeHtml(a.medicamento)}</strong> · ${escapeHtml(a.resultado)}
        <div class="muted tiny">${formatShort(a.fecha)} · ${escapeHtml(a.nota || "")}</div></div></div>`
    ).join("") || `<div class="empty">Sin registros de adherencia</div>`;
  }

  function guardarAdherencia(medicamento, resultado) {
    if (!state.clienteActual.dni && !state.clienteActual.nombre) { toast("Atiende a un paciente primero", "warn"); return; }
    state.adherencias.unshift({
      id: "ADH-" + Date.now().toString(36), fecha: state.gameTimeMs,
      dni: state.clienteActual.dni || "", nombre: state.clienteActual.nombre || "",
      medicamento, resultado, nota: ($("#adh-nota")?.value || "").trim(),
    });
    toast(`Adherencia ${medicamento}: ${resultado}`, "ok");
    Sounds.beepOk();
    renderAdherenciaLista(); save();
  }

  function renderSigre() {
    const list = $("#sigre-list");
    if (!list) return;
    list.innerHTML = (state.sigre || []).slice(0, 30).map((s) =>
      `<div class="list-item"><div><strong>${escapeHtml(s.nombre)}</strong><div class="muted tiny">×${s.cantidad} · ${escapeHtml(s.tipo)} · ${formatShort(s.fecha)}</div></div><span class="badge badge-ok">SIGRE</span></div>`
    ).join("") || `<div class="empty">Sin recogidas SIGRE</div>`;
  }

  function registrarSigre() {
    const nombre = ($("#sigre-search")?.value || "").trim();
    const p = sigrePickId ? productos.find((x) => x.id === sigrePickId) : null;
    const label = p ? p.nombre : nombre;
    if (!label) { toast("Indica el medicamento", "warn"); return; }
    const qty = Math.max(1, Number($("#sigre-qty").value) || 1);
    state.sigre.unshift({
      id: "SG-" + Date.now().toString(36), fecha: state.gameTimeMs,
      productId: p?.id || null, nombre: label, cantidad: qty, tipo: $("#sigre-tipo").value,
    });
    state.stats.sigre = (state.stats.sigre || 0) + qty;
    sigrePickId = null;
    toast("Registrado en punto SIGRE", "ok");
    Sounds.beepOk();
    renderSigre(); save();
  }

  function renderABC() {
    const box = $("#inv-abc");
    if (!box) return;
    const rows = Extras.clasificarABC(state.ventas, productos, state.stock).slice(0, 36);
    const groups = { A: [], B: [], C: [] };
    for (const r of rows) groups[r.abc].push(r);
    box.innerHTML = ["A", "B", "C"].map((k) => `
      <div class="abc-col abc-${k}">
        <h4>Clase ${k} <span>${groups[k].length}</span></h4>
        ${groups[k].slice(0, 10).map((r) => `<div class="abc-item"><span>${escapeHtml(r.nombre)}</span><strong>${euro(r.valor)}</strong></div>`).join("") || "<div class='muted tiny'>Sin datos</div>"}
      </div>`).join("");
  }


  function ensurePlanograma() {
    if (!state.planograma || !state.planograma.length) {
      state.planograma = Clinic.defaultPlanograma(productos);
    }
    return state.planograma;
  }

  function renderVitals() {
    const list = $("#vitals-list");
    if (!list) return;
    const dni = state.clienteActual.dni;
    const rows = (state.vitals || []).filter((v) => !dni || v.dni === dni).slice(0, 25);
    list.innerHTML = rows.map((v) =>
      `<div class="list-item"><div><strong>${escapeHtml(v.tipo)}</strong> · ${escapeHtml(v.valor)}
        <div class="muted tiny">${formatShort(v.fecha)} · ${escapeHtml(v.nivel)} · ${escapeHtml(v.consejo)}</div></div></div>`
    ).join("") || `<div class="empty">Aún no hay mediciones. Atiende a un cliente y registra TA o glucemia.</div>`;
  }

  function registrarVital(tipo, valor, nivel, consejo) {
    state.vitals.unshift({
      id: "VT-" + Date.now().toString(36), fecha: state.gameTimeMs,
      dni: state.clienteActual.dni || "", nombre: state.clienteActual.nombre || "Cliente",
      tipo, valor, nivel, consejo,
    });
    // also onto patient ficha if exists
    const pac = state.pacientes.find((p) => p.dni && p.dni === state.clienteActual.dni);
    if (pac) {
      pac.vitals = pac.vitals || [];
      pac.vitals.unshift({ fecha: state.gameTimeMs, tipo, valor, nivel });
    }
    renderVitals(); save();
    toast(tipo + " registrada", "ok");
    Sounds.beepOk();
  }

  function renderMedicoChat() {
    const box = $("#medico-chat");
    if (!box) return;
    if (!state.chatMedico.length) {
      box.innerHTML = `<div class="chat-bubble bot">Hola, soy el médico de guardia (simulado). ¿En qué puedo ayudarte con la dispensación?</div>`;
      return;
    }
    box.innerHTML = state.chatMedico.map((m) =>
      `<div class="chat-bubble ${m.role}">${escapeHtml(m.text)}</div>`
    ).join("");
    box.scrollTop = box.scrollHeight;
  }

  function sendMedico(text) {
    const q = (text || "").trim();
    if (!q) return;
    state.chatMedico.push({ role: "user", text: q, fecha: state.gameTimeMs });
    const ans = Clinic.replyMedico(q);
    state.chatMedico.push({ role: "bot", text: ans, fecha: state.gameTimeMs });
    if (state.chatMedico.length > 80) state.chatMedico = state.chatMedico.slice(-80);
    renderMedicoChat(); save();
  }

  function renderPlanograma() {
    ensurePlanograma();
    const pool = $("#plano-pool");
    const shelves = $("#plano-shelves");
    if (!pool || !shelves) return;
    const q = ($("#plano-search")?.value || "").toLowerCase();
    const used = new Set(state.planograma.flatMap((s) => s.slots));
    const otc = productos.filter((p) => !p.requiereReceta && (!q || `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase().includes(q))).slice(0, 40);
    pool.innerHTML = otc.map((p) =>
      `<button type="button" class="plano-item ${used.has(p.id)?"used":""}" data-plano-add="${p.id}">${packOf(p,"xs")}<span>${escapeHtml(p.nombre)}</span></button>`
    ).join("") || `<div class="empty">Sin OTC</div>`;
    shelves.innerHTML = state.planograma.map((s) => `
      <div class="shelf-card ${planoPickShelf===s.id?"active-shelf":""}" data-shelf="${s.id}">
        <div class="shelf-head"><strong>${escapeHtml(s.nombre)}</strong>
          <button type="button" class="btn btn-sm" data-shelf-pick="${s.id}">Colocar aquí</button></div>
        <div class="shelf-slots">
          ${s.slots.map((id) => {
            const p = productos.find((x) => x.id === id);
            if (!p) return "";
            return `<div class="shelf-slot">${packOf(p,"sm")}<button class="btn btn-icon danger" data-shelf-rem="${s.id}" data-pid="${id}">✕</button><span class="tiny">${escapeHtml(p.nombre)}</span></div>`;
          }).join("") || `<div class="empty tiny">Estante vacío — elige “Colocar aquí” y un producto</div>`}
        </div>
      </div>`).join("");
  }

  function updateScoreHud() {
    if (!Plus || !state.plus) return;
    const n = Plus.notaDelDia(state.plus, state.stats);
    const letra = $("#score-letra");
    const pts = $("#score-pts");
    if (letra) letra.textContent = n.letra;
    if (pts) pts.textContent = String(n.pts);
  }

  function updateFatigaBadge() {
    const el = $("#fatiga-badge");
    if (!el) return;
    const f = Math.round(state.plus?.fatiga || 0);
    const show = !!state.settings.enGuardia || f > 15;
    el.classList.toggle("hidden", !show);
    el.textContent = `😮‍💨 Fatiga ${f}`;
  }

  function renderInterruptBanner() {
    const box = $("#interrupt-banner");
    if (!box || !Plus) return;
    const i = state.plus?.interrupcion;
    if (!i) { box.classList.add("hidden"); box.innerHTML = ""; return; }
    box.classList.remove("hidden");
    box.classList.toggle("urgent", !!i.urgencia);
    box.innerHTML = `
      <div><strong>${i.icon} Interrupción · ${escapeHtml(i.titulo)}</strong>
      <div>${escapeHtml(i.texto)}</div></div>
      <div class="ib-actions">
        <button type="button" class="btn btn-sm" id="btn-int-ok">Atender</button>
        <button type="button" class="btn btn-sm" id="btn-int-later">Aplazar</button>
      </div>`;
    $("#btn-int-ok").onclick = () => {
      const x = Plus.dismissInterrupcion(state.plus, "atender");
      renderInterruptBanner(); updateScoreHud(); save();
      if (x?.id === "lote") showTab("lotes");
      else if (x?.id === "botiquin") showTab("botiquines");
      else if (x?.id === "alarma_nevera") showTab("checklist");
      else if (x?.id === "repartidor") showTab("almacen");
      else toast("Interrupción atendida (+pts)", "ok");
    };
    $("#btn-int-later").onclick = () => {
      Plus.dismissInterrupcion(state.plus, "aplazar");
      renderInterruptBanner(); updateScoreHud(); save();
      toast("Interrupción aplazada", "warn");
    };
  }

  function renderNota() {
    if (!Plus || !$("#nota-hero")) return;
    const n = Plus.notaDelDia(state.plus, state.stats);
    $("#nota-hero").innerHTML = `
      <div class="letra">${escapeHtml(n.letra)}</div>
      <div class="pts">${n.pts} puntos · ${n.ok} aciertos · ${n.fail} fallos</div>
      <div class="fatiga-bar" title="Fatiga"><span style="width:${Math.min(100, state.plus.fatiga || 0)}%"></span></div>
      <p style="margin-top:10px;opacity:.9">Guardia: ${state.plus.guardiaStats?.ventasGuardia || 0} ventas · recargo ${euro(state.plus.guardiaStats?.recargo || 0)} · urgencias ${state.plus.guardiaStats?.urgencias || 0}</p>
      <ul>${n.consejos.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`;
    const hist = state.plus.evaluacion?.historial || [];
    $("#nota-historial").innerHTML = hist.slice(0, 20).map((h) =>
      `<div class="${h.ok ? "hist-ok" : "hist-fail"}"><strong>${escapeHtml(h.tipo)}</strong> ${h.ok ? "+" : ""}${h.pts} · ${escapeHtml(h.detalle || "")}</div>`
    ).join("") || `<div class="empty">Aún no hay eventos. Atiende clientes, lotes e interrupciones.</div>`;
    updateScoreHud();
  }

  function renderLotes() {
    const root = $("#lotes-list");
    if (!root) return;
    const list = state.plus?.alertasLote || [];
    if (!list.length) {
      root.innerHTML = `<div class="empty">Sin alertas. Pulsa “Simular alerta” o espera un aviso AEMPS.</div>`;
      return;
    }
    root.innerHTML = list.map((a) => `
      <article class="lote-card ${a.resuelta ? "resuelta" : ""}">
        <header style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <strong>🚨 ${escapeHtml(a.id)}</strong>
          <span class="gravedad-${escapeHtml(a.gravedad)}">${escapeHtml(a.gravedad)}</span>
        </header>
        <p><strong>${escapeHtml(a.nombre)}</strong> · lote <code>${escapeHtml(a.lote)}</code></p>
        <p class="muted">${escapeHtml(a.motivo)}</p>
        <p class="muted tiny">Stock actual: ${state.stock[a.productId] || 0}${a.resuelta ? ` · retiradas ${a.unidadesRetiradas}` : ""}</p>
        ${a.resuelta ? `<span class="badge badge-ok">Resuelta</span>` :
          `<button type="button" class="btn btn-danger-soft" data-retirar-lote="${escapeHtml(a.id)}">Retirar lote del stock</button>`}
      </article>`).join("");
  }

  function renderBotiquines() {
    const root = $("#botiquines-list");
    if (!root || !Plus) return;
    const list = state.plus.botiquines || [];
    if (!list.length) {
      root.innerHTML = `<div class="empty">No hay pedidos. Crea uno de empresa o residencia.</div>`;
      return;
    }
    root.innerHTML = list.map((b) => {
      const total = Plus.totalBotiquin(b);
      return `<article class="bot-card">
        <header style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <strong>${b.tipo === "empresa" ? "🏢" : "🏠"} ${escapeHtml(b.cliente)}</strong>
          <span class="badge">${escapeHtml(b.estado)}</span>
        </header>
        <p class="muted tiny">${escapeHtml(b.albaran)} · NIF ${escapeHtml(b.nif)} · ${euro(total)}</p>
        <ul>${b.items.map((i) => `<li>${escapeHtml(i.nombre)} ×${i.cantidad}</li>`).join("")}</ul>
        <div class="actions-row">
          ${b.estado === "pedido" ? `<button class="btn btn-primary btn-sm" data-bot-prep="${b.id}">Preparar</button>` : ""}
          ${b.estado === "preparado" ? `<input class="bot-firma" data-bot-firma-in="${b.id}" placeholder="Firma responsable" style="max-width:200px" />
            <button class="btn btn-accent btn-sm" data-bot-firmar="${b.id}">Registrar firma</button>` : ""}
          ${b.estado === "firmado" ? `<button class="btn btn-primary btn-sm" data-bot-ent="${b.id}">Entregar / cobrar</button>` : ""}
          ${b.estado === "entregado" ? `<span class="badge badge-ok">Entregado · ${escapeHtml(b.firmaResponsable || "")}</span>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  function renderChecklist() {
    const root = $("#checklist-root");
    if (!root || !Plus) return;
    if (!state.plus.checklists) state.plus.checklists = {};
    root.innerHTML = Plus.CHECKLISTS.map((c) => {
      const saved = state.plus.checklists[c.id] || {};
      const done = c.items.every((it) => saved[it.id]);
      return `<article class="check-card ${done ? "check-done" : ""}" style="border-color:${c.color}">
        ${Plus.svgEscena(c.escena, c.color)}
        <h3>${escapeHtml(c.titulo)}</h3>
        ${c.items.map((it) => `
          <label class="check-item"><input type="checkbox" data-check="${c.id}" data-item="${it.id}" ${saved[it.id] ? "checked" : ""}/>
          <span>${escapeHtml(it.txt)}</span></label>`).join("")}
        ${done ? `<p class="muted">✅ Completo (+pts)</p>` : ""}
      </article>`;
    }).join("");
  }

  function renderEreceta() {
    const root = $("#ereceta-module");
    if (!root || !Plus) return;
    const s = state.plus?.erecetaSesion;
    if (!s) {
      root.innerHTML = `<div class="ereceta-body"><p class="empty">Sin sesión. Atiende un cliente con e-receta o sincroniza.</p></div>`;
      return;
    }
    root.innerHTML = `
      <div class="ereceta-top">
        <div><strong>SNS · Receta electrónica (simulación)</strong><div class="tiny">Nº ${escapeHtml(s.numero)} · fase ${escapeHtml(s.fase)}</div></div>
        <div>CIP ${escapeHtml(s.cip)} · DNI ${escapeHtml(s.dni)}</div>
      </div>
      <div class="ereceta-body">
        ${s.bloqueada ? `<div class="alert alert-grave">Sesión bloqueada</div>` : ""}
        ${!s.pinOk ? `<div class="pin-row">
          <div><label class="lbl">PIN (pista formativa en consola/toast)</label>
          <input id="ereceta-pin" type="password" maxlength="6" placeholder="PIN" /></div>
          <button type="button" class="btn btn-primary" id="btn-ereceta-pin">Entrar</button>
          <button type="button" class="btn btn-sm" id="btn-ereceta-hint">Ver PIN (práctica)</button>
        </div>` : `<p class="badge badge-ok">PIN OK · puedes dispensar</p>`}
        ${(s.dispensaciones || []).map((d) => `
          <div class="ereceta-line ${d.estado === "dispensada" ? "done" : ""}">
            <span>${escapeHtml(d.nombre)} ×${d.cantidad} · <em>${escapeHtml(d.estado)}</em></span>
            ${s.pinOk && d.estado !== "dispensada" ? `<button class="btn btn-sm btn-primary" data-ere-disp="${d.productId}">Marcar dispensado + añadir</button>` : ""}
          </div>`).join("")}
        <div class="ereceta-log">${(s.log || []).map((l) => escapeHtml(l)).join("<br/>")}</div>
      </div>`;
    $("#btn-ereceta-hint")?.addEventListener("click", () => toast("PIN de práctica: " + s.pinEsperado, "ok"));
    $("#btn-ereceta-pin")?.addEventListener("click", () => {
      const pin = $("#ereceta-pin")?.value || "";
      const res = Plus.intentarPin(s, pin);
      if (res.ok) {
        Plus.scoreEvent(state.plus, "ereceta_pin", true, "PIN e-receta OK", 5);
        toast(res.msg, "ok");
      } else {
        Plus.scoreEvent(state.plus, "ereceta_pin", false, res.msg, -2);
        toast(res.msg, "err");
      }
      updateScoreHud(); renderEreceta(); save();
    });
  }

  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
    if (name === "caja") renderCaja();
    if (name === "informes") renderInforme();
    if (name === "pacientes") renderPacientes();
    if (name === "libro") renderLibro();
    if (name === "almacen") renderAlmacen();
    if (name === "inventario") { renderInventario(); renderConteoFisico(); renderABC(); }
    if (name === "gestion") { renderGestion(); renderSigre(); renderAdherenciaPanel(); }
    if (name === "minijuegos") renderMiniTrain();
    if (name === "pedidos") { renderCola(); renderPerfiles(); }
    if (name === "ticket" && lastTicket) renderDocumento(lastTicket, docTipo);
    if (name === "clinica") renderVitals();
    if (name === "medico") renderMedicoChat();
    if (name === "escaparate") renderPlanograma();
    if (name === "evaluacion") renderNota();
    if (name === "lotes") renderLotes();
    if (name === "botiquines") renderBotiquines();
    if (name === "checklist") renderChecklist();
    if (name === "ereceta") renderEreceta();
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

    $("#quick-bar")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-goto]"); if (b) showTab(b.dataset.goto);
    });
    $("#btn-view-cards")?.addEventListener("click", () => { catalogView = "cards"; renderCatalog(); });
    $("#btn-view-table")?.addEventListener("click", () => { catalogView = "table"; renderCatalog(); });
    $("#catalog-cards")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]"); if (b) addToCart(Number(b.dataset.add));
    });
    document.body.addEventListener("click", (e) => {
      if (e.target.id === "btn-camp-apply" || e.target.closest?.("#btn-camp-apply")) {
        const season = seasonInfo(state.gameTimeMs);
        const c = Clinic.campaniaActual(season.id);
        categoriaActiva = c.categoriasBoost[0] || "";
        sintomaActivo = "";
        $("#search-q").value = "";
        renderCatGrid(); renderSintomas(); renderCatalog();
        toast("Campaña aplicada al catálogo", "ok");
        showTab("venta");
      }
    });

    $("#btn-ped-calc")?.addEventListener("click", () => {
      const r = Clinic.calcPediatrico({
        pesoKg: $("#ped-peso").value, dosisMgKg: $("#ped-dosis").value,
        tomasDia: $("#ped-tomas").value, concentracionMgMl: $("#ped-conc").value,
      });
      if (!r.ok) { $("#ped-result").textContent = "Revisa peso y dosis."; return; }
      $("#ped-result").innerHTML = `<strong>${r.mgToma} mg/toma</strong> · ${r.mgDia} mg/día`
        + (r.mlToma != null ? `<br>Jarabe: <strong>${r.mlToma} ml/toma</strong> (${r.mlDia} ml/día)</br>` : "")
        + (r.aviso ? `<div class="alert alert-moderada">${escapeHtml(r.aviso)}</div>` : "");
      Sounds.beepOk();
    });
    $("#btn-mag-calc")?.addEventListener("click", () => {
      const r = Clinic.calcMagistral({
        principio: $("#mag-pa").value, dosisMg: $("#mag-dosis").value,
        volumenMl: $("#mag-vol").value, vehiculo: $("#mag-veh").value,
      });
      if (!r.ok) { $("#mag-result").textContent = "Completa principio, mg y ml."; return; }
      state.magistrales.unshift({ id: "MAG-"+Date.now().toString(36), fecha: state.gameTimeMs, etiqueta: r.etiqueta, concentracion: r.concentracion });
      $("#mag-result").innerHTML = `<strong>${escapeHtml(r.etiqueta)}</strong><ol class="help-steps">${r.pasos.map((p)=>`<li>${escapeHtml(p)}</li>`).join("")}</ol>`;
      save(); Sounds.beepOk(); toast("Fórmula preparada (práctica)", "ok");
    });
    $("#btn-ta")?.addEventListener("click", () => {
      const sis = $("#ta-sis").value, dia = $("#ta-dia").value;
      const r = Clinic.interpretarTA(sis, dia);
      $("#ta-result").innerHTML = `<strong>${escapeHtml(r.nivel)}</strong><div class="muted">${escapeHtml(r.consejo)}</div>`;
      registrarVital("Tensión arterial", `${sis}/${dia} mmHg`, r.nivel, r.consejo);
    });
    $("#btn-glu")?.addEventListener("click", () => {
      const v = $("#glu-val").value; const ay = $("#glu-ayunas").checked;
      const r = Clinic.interpretarGlucemia(v, ay);
      $("#glu-result").innerHTML = `<strong>${escapeHtml(r.nivel)}</strong><div class="muted">${escapeHtml(r.consejo)}</div>`;
      registrarVital("Glucemia" + (ay ? " (ayunas)" : ""), `${v} mg/dL`, r.nivel, r.consejo);
    });

    $("#btn-medico-send")?.addEventListener("click", () => {
      sendMedico($("#medico-q").value); $("#medico-q").value = "";
    });
    $("#medico-q")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { sendMedico($("#medico-q").value); $("#medico-q").value = ""; }
    });
    $("#medico-quick")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mq]"); if (b) sendMedico(b.dataset.mq);
    });

    $("#btn-plano-reset")?.addEventListener("click", () => {
      state.planograma = Clinic.defaultPlanograma(productos); planoPickShelf = null; renderPlanograma(); save(); toast("Planograma reiniciado", "ok");
    });
    $("#plano-search")?.addEventListener("input", renderPlanograma);
    $("#plano-pool")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-plano-add]"); if (!b) return;
      if (!planoPickShelf) { toast("Primero pulsa “Colocar aquí” en un estante", "warn"); return; }
      const shelf = state.planograma.find((s) => s.id === planoPickShelf);
      const pid = Number(b.dataset.planoAdd);
      if (!shelf) return;
      if (shelf.slots.includes(pid)) { toast("Ya está en el estante", "warn"); return; }
      if (shelf.slots.length >= 6) { toast("Estante lleno (máx. 6)", "warn"); return; }
      shelf.slots.push(pid); renderPlanograma(); save(); Sounds.beepCoin();
    });
    $("#plano-shelves")?.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-shelf-pick]");
      const rem = e.target.closest("[data-shelf-rem]");
      if (pick) { planoPickShelf = pick.dataset.shelfPick; renderPlanograma(); toast("Estante seleccionado", "ok"); }
      if (rem) {
        const shelf = state.planograma.find((s) => s.id === rem.dataset.shelfRem);
        const pid = Number(rem.dataset.pid);
        if (shelf) shelf.slots = shelf.slots.filter((x) => x !== pid);
        renderPlanograma(); save();
      }
    });

    ["search-q", "filter-receta", "filter-marca", "filter-pa"].forEach((id) => {
      const el = $("#" + id);
      if (!el) return;
      el.addEventListener("input", () => {
        if (id === "search-q") sintomaActivo = "";
        renderSintomas();
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderCatalog, 100);
      });
      el.addEventListener("change", () => {
        if (id === "search-q") sintomaActivo = "";
        renderSintomas();
        renderCatalog();
      });
    });

    $("#cat-grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      categoriaActiva = b.dataset.cat || "";
      sintomaActivo = "";
      $("#search-q").value = "";
      renderCatGrid(); renderSintomas(); renderCatalog();
    });

    $("#pedido-exacto").addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (b) addToCart(Number(b.dataset.add));
    });

    document.body.addEventListener("click", (e) => {
      const syn = e.target.closest("[data-sintoma]");
      if (syn && (syn.closest("#sintomas-row") || syn.closest("#speech-tags"))) {
        sintomaActivo = syn.dataset.sintoma || "";
        categoriaActiva = "";
        $("#search-q").value = sintomaActivo;
        renderCatGrid(); renderSintomas(); renderCatalog();
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
    $("#btn-auto-pedidos")?.addEventListener("click", autoPedidosCategoriasBajas);

    $("#btn-cerrar-sustituto")?.addEventListener("click", () => $("#modal-sustituto").classList.remove("open"));
    $("#sustituto-list")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (!b) return;
      addToCart(Number(b.dataset.add));
      $("#modal-sustituto").classList.remove("open");
    });

    $("#btn-ctrl-cancel")?.addEventListener("click", () => {
      $("#modal-controlado").classList.remove("open");
      pendingCtrlContinue = null;
    });
    $("#btn-ctrl-ok")?.addEventListener("click", () => {
      const dni = ($("#ctrl-dni").value || "").trim().toUpperCase();
      if (!dni || dni !== (state.clienteActual.dni || "").toUpperCase()) {
        toast("DNI no coincide — RECHAZAR / corregir", "err"); Sounds.beepWarn(); return;
      }
      if (!$("#ctrl-libro").checked || !$("#ctrl-id").checked) {
        toast("Marca las dos confirmaciones", "warn"); return;
      }
      state.clienteActual.dni = dni;
      $("#cliente-dni").value = dni;
      $("#modal-controlado").classList.remove("open");
      Sounds.beepFirma();
      const fn = pendingCtrlContinue; pendingCtrlContinue = null;
      if (fn) fn();
    });

    $("#btn-inv-fisico")?.addEventListener("click", () => { renderConteoFisico(); toast("Conteo físico listo", "ok"); });
    $("#inv-fisico-box")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-aplicar-conteo]");
      if (!b) return;
      const id = Number(b.dataset.aplicarConteo);
      const inp = $(`#inv-fisico-box [data-conteo="${id}"]`);
      aplicarConteo(id, Math.max(0, Number(inp?.value) || 0));
    });

    $("#dev-search")?.addEventListener("input", () => suggestGestion("#dev-search", "#dev-suggest"));
    $("#dev-suggest")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-gpick]"); if (!b) return;
      gestPickId = Number(b.dataset.gpick); toast("Producto para devolución", "ok");
    });
    $("#btn-devolver")?.addEventListener("click", registrarDevolucion);

    $("#rot-search")?.addEventListener("input", () => {
      const q = ($("#rot-search").value || "").toLowerCase();
      const hits = !q ? [] : productos.filter((p) => `${p.nombre} ${p.marca}`.toLowerCase().includes(q)).slice(0, 12);
      $("#rot-suggest").innerHTML = hits.map((p) =>
        `<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong><div class="muted tiny">stock ${state.stock[p.id]||0}</div></div>
        <button class="btn btn-sm" data-rpick="${p.id}">Elegir</button></div>`
      ).join("") || (q ? `<div class="empty">Sin resultados</div>` : `<div class="empty">Escribe para buscar</div>`);
    });
    $("#rot-suggest")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rpick]"); if (!b) return;
      rotPickId = Number(b.dataset.rpick); toast("Producto para rotura", "ok");
    });
    $("#btn-rotura")?.addEventListener("click", registrarRotura);
    $("#btn-gasto")?.addEventListener("click", registrarGasto);

    $("#perfiles-grid")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-perfil]"); if (b) atenderPerfil(b.dataset.perfil);
    });
    $("#sigre-search")?.addEventListener("input", () => {
      const q = ($("#sigre-search").value || "").toLowerCase();
      const hits = !q ? [] : productos.filter((p) => `${p.nombre} ${p.marca}`.toLowerCase().includes(q)).slice(0, 10);
      $("#sigre-suggest").innerHTML = hits.map((p) =>
        `<div class="list-item"><div><strong>${escapeHtml(p.nombre)}</strong></div>
        <button class="btn btn-sm" data-spick="${p.id}">Elegir</button></div>`
      ).join("") || "";
    });
    $("#sigre-suggest")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-spick]"); if (!b) return;
      sigrePickId = Number(b.dataset.spick);
      const p = productos.find((x) => x.id === sigrePickId);
      if (p) $("#sigre-search").value = p.nombre;
      toast("Producto SIGRE elegido", "ok");
    });
    $("#btn-sigre")?.addEventListener("click", registrarSigre);
    $("#adh-cronicos")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-adh]"); if (!b) return;
      guardarAdherencia(b.dataset.adh, b.dataset.res);
    });
    $("#btn-adh-guardar")?.addEventListener("click", () => {
      const c = state.clienteActual.cronicos?.[0];
      if (!c) { toast("Sin crónico o usa los botones Cumple/Parcial/No", "warn"); return; }
      guardarAdherencia(c, "seguimiento");
    });
    $("#alm-pedidos")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-albaran]"); if (b) openAlbaran(b.dataset.albaran);
    });
    $("#btn-alb-ok")?.addEventListener("click", confirmarAlbaran);
    $("#btn-alb-cancel")?.addEventListener("click", () => { $("#modal-albaran").classList.remove("open"); pendingAlbId = null; });
    $("#btn-visado-ok")?.addEventListener("click", () => {
      if (!$("#visado-check").checked) { toast("Confirma el visado", "warn"); return; }
      if (state.recetaActiva) {
        state.recetaActiva.visadoOk = true;
        state.recetaActiva.visadoRef = ($("#visado-ref").value || "").trim();
      }
      $("#modal-visado").classList.remove("open");
      const fn = pendingVisadoContinue; pendingVisadoContinue = null;
      Sounds.beepOk();
      if (fn) fn();
    });
    $("#btn-visado-cancel")?.addEventListener("click", () => {
      $("#modal-visado").classList.remove("open"); pendingVisadoContinue = null;
    });
    document.querySelectorAll('input[name="doc-tipo"]').forEach((r) => {
      r.addEventListener("change", () => {
        if (r.checked) { docTipo = r.value; if (lastTicket) renderDocumento(lastTicket, docTipo); }
      });
    });
    $("#btn-regen-doc")?.addEventListener("click", () => {
      if (!lastTicket) { toast("No hay ticket", "warn"); return; }
      const sel = document.querySelector('input[name="doc-tipo"]:checked');
      docTipo = sel?.value || "ticket";
      renderDocumento(lastTicket, docTipo);
    });

    $("#btn-mini-random")?.addEventListener("click", () => {
      if (!Minis) return;
      const d = Minis.DEFS[Math.floor(Math.random() * Minis.DEFS.length)];
      practiceMini(d.id);
    });
    $("#mini-train-grid")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mini]"); if (!b) return;
      practiceMini(b.dataset.mini);
    });

    // no cerrar minijuego de cobro al clic fuera
    $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
      if (e.target !== m) return;
      if (m.id === "modal-minijuego" && pendingPago) return;
      m.classList.remove("open");
    }));

    $("#btn-reset").onclick = ()=>{
      if(!confirm("¿Reiniciar todo?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state=defaultState(productos);
      state.cola.push(crearPedido(), crearPedido(), crearPedido());
      bindClienteForm(); renderAll(); save(); toast("Reiniciado", "ok");
    };

    // ——— Practice Plus ———
    $("#btn-refresh-nota")?.addEventListener("click", renderNota);
    $("#btn-simular-lote")?.addEventListener("click", () => {
      if (!Plus) return;
      const a = Plus.generarAlertaLote(productos, state.gameTimeMs);
      state.plus.alertasLote = state.plus.alertasLote || [];
      state.plus.alertasLote.unshift(a);
      renderLotes(); renderStats(); save();
      toast("Alerta AEMPS simulada", "warn");
    });
    $("#lotes-list")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-retirar-lote]");
      if (!b || !Plus) return;
      const res = Plus.retirarLote(state.plus, state.stock, state.lotes, b.dataset.retirarLote);
      if (!res.ok) { toast(res.msg, "err"); return; }
      toast(`Lote retirado · ${res.qty} uds`, "ok");
      renderLotes(); renderCatalog(); renderStats(); updateScoreHud(); save();
    });
    $("#btn-nuevo-botiquin")?.addEventListener("click", () => {
      if (!Plus) return;
      state.plus.botiquines = state.plus.botiquines || [];
      state.plus.botiquines.unshift(Plus.crearBotiquin(Date.now(), productos));
      renderBotiquines(); save(); toast("Pedido de botiquín creado", "ok");
    });
    $("#botiquines-list")?.addEventListener("click", (e) => {
      const prep = e.target.closest("[data-bot-prep]");
      const firmar = e.target.closest("[data-bot-firmar]");
      const ent = e.target.closest("[data-bot-ent]");
      const list = state.plus.botiquines || [];
      if (prep) {
        const b = list.find((x) => x.id === prep.dataset.botPrep);
        if (b) { b.estado = "preparado"; Plus.scoreEvent(state.plus, "botiquin", true, "Botiquín preparado", 4); }
      }
      if (firmar) {
        const b = list.find((x) => x.id === firmar.dataset.botFirmar);
        const inp = $(`[data-bot-firma-in="${firmar.dataset.botFirmar}"]`);
        if (b && inp?.value.trim()) {
          b.firmaResponsable = inp.value.trim();
          b.estado = "firmado";
          Plus.scoreEvent(state.plus, "botiquin", true, "Firma botiquín", 6);
        } else toast("Falta firma del responsable", "warn");
      }
      if (ent) {
        const b = list.find((x) => x.id === ent.dataset.botEnt);
        if (b) {
          for (const it of b.items) {
            state.stock[it.productId] = Math.max(0, (state.stock[it.productId] || 0) - it.cantidad);
          }
          b.estado = "entregado";
          const total = Plus.totalBotiquin(b);
          state.stats.tickets += 1;
          state.stats.facturacion += total;
          Plus.scoreEvent(state.plus, "botiquin", true, "Botiquín entregado", 8);
          toast(`Botiquín entregado · ${euro(total)}`, "ok");
        }
      }
      renderBotiquines(); renderStats(); renderCatalog(); updateScoreHud(); save();
    });
    $("#checklist-root")?.addEventListener("change", (e) => {
      const inp = e.target.closest("input[data-check]");
      if (!inp || !Plus) return;
      const cid = inp.dataset.check, iid = inp.dataset.item;
      state.plus.checklists = state.plus.checklists || {};
      state.plus.checklists[cid] = state.plus.checklists[cid] || {};
      state.plus.checklists[cid][iid] = !!inp.checked;
      const def = Plus.CHECKLISTS.find((c) => c.id === cid);
      if (def && def.items.every((it) => state.plus.checklists[cid][it.id])) {
        Plus.scoreEvent(state.plus, "checklist", true, "Checklist " + def.titulo, 10);
        toast("Checklist completo (+10)", "ok");
      }
      renderChecklist(); updateScoreHud(); save();
    });
    $("#btn-sync-ereceta")?.addEventListener("click", () => {
      if (!Plus) return;
      if (state.recetaActiva?.tipo === "electronica") {
        state.plus.erecetaSesion = Plus.crearSesionEreceta(state.clienteActual, state.recetaActiva);
        toast("Sesión e-receta sincronizada", "ok");
      } else toast("El cliente actual no tiene e-receta activa", "warn");
      renderEreceta(); save();
    });
    $("#ereceta-module")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ere-disp]");
      if (!b || !Plus) return;
      const ses = state.plus.erecetaSesion;
      const res = Plus.marcarDispensadoEreceta(ses, Number(b.dataset.ereDisp));
      if (!res.ok) { toast(res.msg, "err"); return; }
      addToCart(Number(b.dataset.ereDisp), 1);
      Plus.scoreEvent(state.plus, "ereceta_disp", true, "Dispensado en módulo SNS", 5);
      renderEreceta(); updateScoreHud(); save();
    });
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
      if(e.key==="Escape"){
        $$(".modal.open").forEach((m)=>{ if(m.id==="modal-minijuego" && pendingPago) return; m.classList.remove("open"); });
        e.preventDefault();
      }
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
    renderClock(); renderCategorias(); renderSintomas(); renderPedidoExacto();
    renderCatalog(); renderCart(); renderReceta(); renderCola(); renderStats();
    renderCaja(); renderLibro(); renderPacientes(); renderAlmacen(); renderInventario();
    renderConteoFisico(); renderGestion(); renderMiniTrain();
    renderPerfiles(); renderSigre(); renderAdherenciaPanel(); renderABC();
    renderCampania(); renderVitals(); renderMedicoChat();
    if (!state.planograma) ensurePlanograma();
    renderSpeech(); refreshClinicalAlerts();
    updateScoreHud(); updateFatigaBadge(); renderInterruptBanner();
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
