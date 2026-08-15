/**
 * Practice Plus — Fase 3 formativa
 * 1) Nota del día  4) Interrupciones  6) Alertas lote AEMPS
 * 7) Botiquines empresa/residencia  8) Guardia realista
 * 11) Checklist visual  12) Módulo e-receta SNS
 */
(function (global) {
  const INTERRUPCIONES = [
    { id: "telefono", icon: "📞", titulo: "Teléfono", texto: "Llama un paciente preguntando si tiene su medicación crónica lista.", urgencia: false, fatiga: 4 },
    { id: "repartidor", icon: "🚚", titulo: "Repartidor", texto: "Hay un albarán en el muelle: confirma recepción cuando puedas.", urgencia: false, fatiga: 3 },
    { id: "medico", icon: "👨‍⚕️", titulo: "Médico", texto: "El centro de salud pregunta por un desabastecimiento de un antibiótico.", urgencia: false, fatiga: 5 },
    { id: "alarma_nevera", icon: "❄️", titulo: "Nevera", texto: "¡Alarma de temperatura en frigorífico! Revisa la cadena de frío.", urgencia: true, fatiga: 8 },
    { id: "cola", icon: "😤", titulo: "Cola", texto: "Un cliente de la cola se queja del tiempo de espera.", urgencia: false, fatiga: 6 },
    { id: "lote", icon: "🚨", titulo: "AEMPS", texto: "Llega un aviso de retirada de lote. Abre Alertas lote.", urgencia: true, fatiga: 7 },
    { id: "botiquin", icon: "🏢", titulo: "Botiquín", texto: "Una residencia pide confirmar pedido de botiquín.", urgencia: false, fatiga: 4 },
  ];

  const CHECKLISTS = [
    {
      id: "mostrador",
      titulo: "Mostrador limpio y ordenado",
      color: "#0ea5e9",
      escena: "counter",
      items: [
        { id: "limpio", txt: "Superficie limpia, sin cajas abiertas" },
        { id: "tpv", txt: "TPV y datáfono accesibles" },
        { id: "privacidad", txt: "Pantalla no visible para otros clientes" },
        { id: "gel", txt: "Gel hidroalcohólico a mano" },
        { id: "bolsas", txt: "Bolsas y papel de receta preparados" },
      ],
    },
    {
      id: "nevera",
      titulo: "Frigorífico / cadena de frío",
      color: "#0284c7",
      escena: "fridge",
      items: [
        { id: "temp", txt: "Temperatura entre 2 y 8 °C" },
        { id: "term", txt: "Termómetro visible y registrado" },
        { id: "orden", txt: "Productos sin tocar paredes/fondo" },
        { id: "fifo", txt: "FEFO: caduca antes → delante" },
        { id: "hielo", txt: "Bolsas isotérmicas listas" },
      ],
    },
    {
      id: "estanteria",
      titulo: "Estantería OTC / escaparate",
      color: "#059669",
      escena: "shelf",
      items: [
        { id: "precio", txt: "Precios visibles y correctos" },
        { id: "cad", txt: "Sin caducados a la vista" },
        { id: "altura", txt: "Productos pesados abajo" },
        { id: "ninos", txt: "Medicamentos fuera del alcance infantil" },
        { id: "campania", txt: "Campaña de temporada colocada" },
      ],
    },
  ];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  function defaultPlus() {
    return {
      evaluacion: { aciertos: [], fallos: [], puntos: 0, historial: [] },
      interrupcion: null,
      nextInterrupcionAt: 0,
      alertasLote: [],
      lotesRetirados: [],
      botiquines: [],
      fatiga: 0,
      checklists: {},
      erecetaSesion: null,
      guardiaStats: { ventasGuardia: 0, urgencias: 0, recargo: 0 },
    };
  }

  /** Registrar evento de evaluación */
  function scoreEvent(plus, tipo, ok, detalle, pts) {
    const ev = { tipo, ok: !!ok, detalle, pts: pts || (ok ? 5 : -3), ts: Date.now() };
    if (ok) plus.evaluacion.aciertos.push(ev);
    else plus.evaluacion.fallos.push(ev);
    plus.evaluacion.historial.unshift(ev);
    plus.evaluacion.historial = plus.evaluacion.historial.slice(0, 80);
    plus.evaluacion.aciertos = plus.evaluacion.aciertos.slice(-40);
    plus.evaluacion.fallos = plus.evaluacion.fallos.slice(-40);
    plus.evaluacion.puntos = Math.max(0, (plus.evaluacion.puntos || 0) + ev.pts);
    return ev;
  }

  function notaDelDia(plus, stats) {
    const pts = plus.evaluacion.puntos || 0;
    const ok = (plus.evaluacion.aciertos || []).length;
    const fail = (plus.evaluacion.fallos || []).length;
    const total = ok + fail || 1;
    const ratio = ok / total;
    let letra = "C";
    if (pts >= 80 && ratio >= 0.85) letra = "A";
    else if (pts >= 50 && ratio >= 0.7) letra = "B";
    else if (pts >= 25) letra = "C";
    else letra = "D";
    const consejos = [];
    if (fail > ok) consejos.push("Revisa validación de recetas y alarmas clínicas.");
    if ((stats.minijuegosFail || 0) > (stats.minijuegosOk || 0)) consejos.push("Entrena minijuegos de mostrador.");
    if ((plus.alertasLote || []).some((a) => !a.resuelta)) consejos.push("Hay alertas de lote pendientes.");
    if ((plus.fatiga || 0) > 60) consejos.push("Fatiga alta en guardia: baja el ritmo y prioriza seguridad.");
    if (!consejos.length) consejos.push("Buen ritmo: sigue documentando y comprobando.");
    return { pts, ok, fail, ratio, letra, consejos };
  }

  function maybeInterrupcion(plus, gameTimeMs, enAtencion, enGuardia) {
    if (!enAtencion) return null;
    if (plus.interrupcion) return plus.interrupcion;
    if (!plus.nextInterrupcionAt) plus.nextInterrupcionAt = gameTimeMs + 45 * 60 * 1000;
    if (gameTimeMs < plus.nextInterrupcionAt) return null;
    const r = mulberry32(Math.floor(gameTimeMs) ^ 4242);
    // más interrupciones en guardia
    const chance = enGuardia ? 0.85 : 0.55;
    if (r() > chance) {
      plus.nextInterrupcionAt = gameTimeMs + (20 + Math.floor(r() * 40)) * 60 * 1000;
      return null;
    }
    const pool = enGuardia
      ? INTERRUPCIONES
      : INTERRUPCIONES.filter((x) => x.id !== "alarma_nevera" || r() < 0.3);
    const item = pick(r, pool);
    plus.interrupcion = { ...item, llegada: gameTimeMs, idUnico: "int-" + Date.now().toString(36) };
    plus.nextInterrupcionAt = gameTimeMs + (25 + Math.floor(r() * 50)) * 60 * 1000;
    plus.fatiga = Math.min(100, (plus.fatiga || 0) + item.fatiga);
    return plus.interrupcion;
  }

  function dismissInterrupcion(plus, accion) {
    const i = plus.interrupcion;
    plus.interrupcion = null;
    if (!i) return null;
    if (accion === "atender") scoreEvent(plus, "interrupcion", true, "Atendida: " + i.titulo, 4);
    else if (accion === "aplazar") {
      scoreEvent(plus, "interrupcion", false, "Aplazada: " + i.titulo, -1);
      plus.fatiga = Math.min(100, (plus.fatiga || 0) + 3);
    }
    return i;
  }

  function generarAlertaLote(productos, gameTimeMs) {
    const pool = productos.filter((p) => p.requiereReceta || p.nevera || p.controlado);
    const r = mulberry32(Math.floor(gameTimeMs) ^ 777);
    const p = pick(r, pool.length ? pool : productos);
    const lote = p.lote || ("L" + (100000 + Math.floor(r() * 899999)));
    return {
      id: "AEMPS-" + Date.now().toString(36).toUpperCase(),
      fecha: gameTimeMs,
      productId: p.id,
      nombre: p.nombre,
      principioActivo: p.principioActivo,
      lote,
      motivo: pick(r, [
        "Posible defecto de calidad en el lote",
        "Retirada preventiva AEMPS",
        "Error de etiquetado en fabricación",
        "Desviación en estabilidad",
      ]),
      gravedad: pick(r, ["moderada", "grave", "leve"]),
      resuelta: false,
      unidadesRetiradas: 0,
    };
  }

  function maybeSpawnAlertaLote(plus, productos, gameTimeMs) {
    if (!plus.alertasLote) plus.alertasLote = [];
    const pending = plus.alertasLote.filter((a) => !a.resuelta).length;
    if (pending >= 2) return null;
    const r = mulberry32(Math.floor(gameTimeMs / 3600000));
    // ~ cada varias horas de juego
    if (r() > 0.08) return null;
    const alerta = generarAlertaLote(productos, gameTimeMs);
    // evitar duplicar mismo producto activo
    if (plus.alertasLote.some((a) => !a.resuelta && a.productId === alerta.productId)) return null;
    plus.alertasLote.unshift(alerta);
    plus.alertasLote = plus.alertasLote.slice(0, 20);
    return alerta;
  }

  function retirarLote(plus, stock, lotes, alertaId) {
    const a = (plus.alertasLote || []).find((x) => x.id === alertaId);
    if (!a || a.resuelta) return { ok: false, msg: "Alerta no encontrada" };
    const qty = stock[a.productId] || 0;
    stock[a.productId] = 0;
    a.resuelta = true;
    a.unidadesRetiradas = qty;
    a.resueltaAt = Date.now();
    plus.lotesRetirados = plus.lotesRetirados || [];
    plus.lotesRetirados.unshift({ ...a, stockAntes: qty });
    scoreEvent(plus, "lote_aemps", true, `Retirado ${a.nombre} lote ${a.lote} (×${qty})`, 12);
    return { ok: true, qty, alerta: a };
  }

  function crearBotiquin(rSeed, productos) {
    const r = mulberry32(rSeed);
    const tipo = r() < 0.5 ? "empresa" : "residencia";
    const nombres = tipo === "empresa"
      ? ["Hotel Sierra", "Taller Mecánico Sol", "Oficina Ayuntamiento", "Colegio San José"]
      : ["Residencia Los Olivos", "Residencia Santa Clara", "Centro de día Álora"];
    const otc = productos.filter((p) => !p.requiereReceta && ["Apósitos y primeros auxilios", "Dolor y fiebre", "Digestivo OTC", "Viaje y botiquín"].includes(p.categoria));
    const pool = otc.length ? otc : productos.filter((p) => !p.requiereReceta);
    const n = 4 + Math.floor(r() * 5);
    const items = [];
    const used = new Set();
    for (let i = 0; i < n && pool.length; i++) {
      const p = pick(r, pool);
      if (used.has(p.id)) continue;
      used.add(p.id);
      items.push({ productId: p.id, nombre: p.nombre, cantidad: 2 + Math.floor(r() * 6), precio: p.precio });
    }
    return {
      id: "BOT-" + Date.now().toString(36).toUpperCase(),
      tipo,
      cliente: pick(r, nombres),
      nif: "B" + String(10000000 + Math.floor(r() * 89999999)),
      items,
      estado: "pedido", // pedido | preparado | firmado | entregado
      firmaResponsable: "",
      albaran: "ALB-BOT-" + Math.floor(r() * 99999),
      creado: Date.now(),
    };
  }

  function totalBotiquin(b) {
    return b.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  }

  /** Intervalo de clientes según guardia/fatiga */
  function nextCustomerDelayMs(enGuardia, fueraHorario, fatiga, r) {
    if (enGuardia && fueraHorario) {
      // menos clientes, más espaciados
      const base = 18 + Math.floor(r() * 35); // 18–53 min juego
      const fat = fatiga > 70 ? 8 : 0;
      return (base + fat) * 60 * 1000;
    }
    return (7 + Math.floor(r() * 22)) * 60 * 1000;
  }

  function recargoGuardia(total) {
    return Math.round(total * 0.15 * 100) / 100;
  }

  function svgEscena(tipo, color) {
    if (tipo === "fridge") {
      return `<svg viewBox="0 0 320 200" class="check-svg" aria-hidden="true">
        <rect width="320" height="200" rx="16" fill="#e0f2fe"/>
        <rect x="90" y="20" width="140" height="160" rx="10" fill="${color}"/>
        <rect x="100" y="30" width="120" height="60" rx="6" fill="#bae6fd"/>
        <rect x="100" y="100" width="120" height="70" rx="6" fill="#7dd3fc"/>
        <circle cx="210" cy="60" r="6" fill="#fff"/>
        <text x="160" y="185" text-anchor="middle" fill="#0c4a6e" font-size="12" font-family="sans-serif">Frigorífico 2–8 °C</text>
      </svg>`;
    }
    if (tipo === "shelf") {
      return `<svg viewBox="0 0 320 200" class="check-svg" aria-hidden="true">
        <rect width="320" height="200" rx="16" fill="#ecfdf5"/>
        <rect x="30" y="30" width="260" height="140" rx="8" fill="#fff" stroke="${color}" stroke-width="4"/>
        <rect x="45" y="50" width="50" height="70" rx="4" fill="#fca5a5"/>
        <rect x="105" y="50" width="50" height="70" rx="4" fill="#93c5fd"/>
        <rect x="165" y="50" width="50" height="70" rx="4" fill="#fde68a"/>
        <rect x="225" y="50" width="50" height="70" rx="4" fill="#bbf7d0"/>
        <line x1="40" y1="130" x2="280" y2="130" stroke="${color}" stroke-width="3"/>
        <text x="160" y="175" text-anchor="middle" fill="#065f46" font-size="12" font-family="sans-serif">Estantería OTC</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 320 200" class="check-svg" aria-hidden="true">
      <rect width="320" height="200" rx="16" fill="#fef3c7"/>
      <rect x="20" y="110" width="280" height="50" rx="6" fill="#f59e0b"/>
      <rect x="40" y="70" width="80" height="40" rx="6" fill="#fff"/>
      <rect x="140" y="60" width="60" height="50" rx="6" fill="#38bdf8"/>
      <rect x="220" y="75" width="50" height="35" rx="6" fill="#a78bfa"/>
      <circle cx="280" cy="40" r="18" fill="#fbbf24"/>
      <text x="160" y="185" text-anchor="middle" fill="#92400e" font-size="12" font-family="sans-serif">Mostrador</text>
    </svg>`;
  }

  function crearSesionEreceta(cli, receta) {
    if (!receta || receta.tipo !== "electronica") return null;
    const pin = String(1000 + Math.floor(Math.random() * 9000));
    return {
      abierta: true,
      dni: cli?.dni || receta.pacienteDni,
      cip: "AN" + String(100000000 + Math.floor(Math.random() * 899999999)),
      pinEsperado: pin,
      pinOk: false,
      intentos: 0,
      fase: receta.fase || "primera",
      numero: receta.numero,
      bloqueada: false,
      dispensaciones: (receta.productos || []).map((p) => ({
        ...p,
        estado: "pendiente", // pendiente | dispensada | bloqueada
      })),
      log: ["Sesión SNS simulada abierta", "Fase: " + (receta.fase || "primera")],
    };
  }

  function intentarPin(sesion, pin) {
    if (!sesion || sesion.bloqueada) return { ok: false, msg: "Sesión bloqueada" };
    sesion.intentos += 1;
    if (String(pin).trim() === String(sesion.pinEsperado)) {
      sesion.pinOk = true;
      sesion.log.push("PIN correcto");
      return { ok: true, msg: "Acceso al módulo e-receta OK" };
    }
    if (sesion.intentos >= 3) {
      sesion.bloqueada = true;
      sesion.log.push("Sesión bloqueada por PIN incorrecto ×3");
      return { ok: false, msg: "Bloqueado tras 3 intentos" };
    }
    sesion.log.push("PIN incorrecto (" + sesion.intentos + "/3)");
    return { ok: false, msg: "PIN incorrecto. Pista formativa: " + sesion.pinEsperado };
  }

  function marcarDispensadoEreceta(sesion, productId) {
    if (!sesion?.pinOk) return { ok: false, msg: "Introduce PIN primero" };
    const line = sesion.dispensaciones.find((d) => d.productId === productId);
    if (!line) return { ok: false, msg: "No está en la e-receta" };
    if (sesion.fase === "fin" && line.estado === "dispensada") {
      return { ok: false, msg: "Fase FIN: no hay más dispensaciones" };
    }
    line.estado = "dispensada";
    sesion.log.push("Dispensado: " + line.nombre);
    return { ok: true };
  }

  global.FarmaciaPracticePlus = {
    INTERRUPCIONES,
    CHECKLISTS,
    defaultPlus,
    scoreEvent,
    notaDelDia,
    maybeInterrupcion,
    dismissInterrupcion,
    generarAlertaLote,
    maybeSpawnAlertaLote,
    retirarLote,
    crearBotiquin,
    totalBotiquin,
    nextCustomerDelayMs,
    recargoGuardia,
    svgEscena,
    crearSesionEreceta,
    intentarPin,
    marcarDispensadoEreceta,
  };
})(typeof window !== "undefined" ? window : globalThis);
