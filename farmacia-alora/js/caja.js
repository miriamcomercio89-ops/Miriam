/**
 * TPV / caja Farmacia Álora — billetes y monedas euro con símbolos visuales.
 */
(function (global) {
  const DENOMS = [
    { id: "500", valor: 500, tipo: "billete", color: "#7c3aed", label: "500 €", simbolo: "Ⅴ" },
    { id: "200", valor: 200, tipo: "billete", color: "#ca8a04", label: "200 €", simbolo: "Ⅱ" },
    { id: "100", valor: 100, tipo: "billete", color: "#15803d", label: "100 €", simbolo: "Ⅰ" },
    { id: "50", valor: 50, tipo: "billete", color: "#ea580c", label: "50 €", simbolo: "🏛" },
    { id: "20", valor: 20, tipo: "billete", color: "#2563eb", label: "20 €", simbolo: "🌉" },
    { id: "10", valor: 10, tipo: "billete", color: "#e11d48", label: "10 €", simbolo: "🚪" },
    { id: "5", valor: 5, tipo: "billete", color: "#64748b", label: "5 €", simbolo: "🏛" },
    { id: "2", valor: 2, tipo: "moneda", color: "#b45309", label: "2 €", anillo: true },
    { id: "1", valor: 1, tipo: "moneda", color: "#a8a29e", label: "1 €", anillo: true },
    { id: "0.50", valor: 0.5, tipo: "moneda", color: "#d6d3d1", label: "50 c", oro: true },
    { id: "0.20", valor: 0.2, tipo: "moneda", color: "#d6d3d1", label: "20 c", oro: true },
    { id: "0.10", valor: 0.1, tipo: "moneda", color: "#d6d3d1", label: "10 c", oro: true },
    { id: "0.05", valor: 0.05, tipo: "moneda", color: "#b45309", label: "5 c", cobre: true },
    { id: "0.02", valor: 0.02, tipo: "moneda", color: "#b45309", label: "2 c", cobre: true },
    { id: "0.01", valor: 0.01, tipo: "moneda", color: "#b45309", label: "1 c", cobre: true },
  ];

  const METODOS = [
    { id: "efectivo", nombre: "Efectivo", icon: "💶", color: "#15803d" },
    { id: "tarjeta_contactless", nombre: "Tarjeta contactless", icon: "📡", color: "#2563eb" },
    { id: "tarjeta_chip", nombre: "Tarjeta chip/PIN", icon: "💳", color: "#1d4ed8" },
    { id: "bizum", nombre: "Bizum", icon: "📱", color: "#0e7490" },
    { id: "transferencia", nombre: "Transferencia", icon: "🏦", color: "#7c3aed" },
    { id: "vale", nombre: "Vale / regalo", icon: "🎁", color: "#db2777" },
    { id: "ticket_rest", nombre: "Ticket restaurant", icon: "🍽", color: "#c2410c" },
    { id: "sns_cargo", nombre: "Cargo SNS / receta", icon: "🏥", color: "#0f766e" },
    { id: "mixto", nombre: "Pago mixto", icon: "🔀", color: "#ea580c" },
  ];

  function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function emptyDenoms(preset) {
    const d = {};
    for (const x of DENOMS) d[x.id] = 0;
    if (preset === "fondo") {
      Object.assign(d, {
        "50": 2, "20": 4, "10": 5, "5": 6,
        "2": 15, "1": 20, "0.50": 20, "0.20": 25, "0.10": 30,
        "0.05": 40, "0.02": 50, "0.01": 80,
      });
    }
    return d;
  }

  function totalDenoms(denoms) {
    let t = 0;
    for (const x of DENOMS) t += (denoms[x.id] || 0) * x.valor;
    return round2(t);
  }

  function defaultCaja(gameTimeMs) {
    const denoms = emptyDenoms("fondo");
    return {
      abierta: true,
      aperturaMs: gameTimeMs,
      cierreMs: null,
      fondoInicial: totalDenoms(denoms),
      denoms,
      movimientos: [],
      sesionId: "TPV-" + Date.now().toString(36).toUpperCase(),
      operador: "Farmacéutico/a Álora",
      terminal: "TPV-ÁLORA-01",
    };
  }

  function calcularCambio(importeCambio, denomsDisponibles) {
    let resto = round2(importeCambio);
    if (resto < 0) return { ok: false, motivo: "Importe inválido", desglose: [], usado: {} };
    const usado = emptyDenoms();
    const desglose = [];
    const copia = { ...denomsDisponibles };
    for (const d of DENOMS) {
      if (resto <= 0) break;
      const maxNeed = Math.floor((resto + 1e-9) / d.valor);
      const take = Math.min(maxNeed, copia[d.id] || 0);
      if (take > 0) {
        usado[d.id] = take;
        copia[d.id] -= take;
        resto = round2(resto - take * d.valor);
        desglose.push({ ...d, cantidad: take });
      }
    }
    if (resto > 0) {
      for (const d of DENOMS) {
        if (resto <= 0) break;
        const take = Math.floor((resto + 1e-9) / d.valor);
        if (take > 0) {
          usado[d.id] = (usado[d.id] || 0) + take;
          resto = round2(resto - take * d.valor);
          const prev = desglose.find((x) => x.id === d.id);
          if (prev) prev.cantidad += take;
          else desglose.push({ ...d, cantidad: take, sinStock: true });
        }
      }
    }
    return { ok: resto <= 0.001, resto: Math.max(0, resto), desglose, usado, total: round2(importeCambio) };
  }

  function desgloseEntregaRapida(importe) {
    const out = emptyDenoms();
    let resto = round2(importe);
    for (const d of DENOMS) {
      const n = Math.floor((resto + 1e-9) / d.valor);
      if (n > 0) {
        out[d.id] = n;
        resto = round2(resto - n * d.valor);
      }
    }
    return out;
  }

  function svgBillete(d) {
    return `<svg class="euro-svg billete" viewBox="0 0 120 64" aria-hidden="true">
      <defs>
        <linearGradient id="g${d.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${d.color}"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.35"/>
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="116" height="56" rx="8" fill="url(#g${d.id})" stroke="#fff" stroke-width="2"/>
      <circle cx="28" cy="32" r="14" fill="rgba(255,255,255,.18)"/>
      <text x="28" y="37" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">€</text>
      <text x="78" y="30" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">${d.valor >= 1 ? d.valor : ""}</text>
      <text x="78" y="46" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">${d.label}</text>
      <text x="108" y="16" text-anchor="end" fill="rgba(255,255,255,.85)" font-size="10">EU</text>
    </svg>`;
  }

  function svgMoneda(d) {
    const fill = d.cobre ? "#c2410c" : d.oro ? "#ca8a04" : d.anillo ? "#a8a29e" : "#d6d3d1";
    const ring = d.anillo
      ? `<circle cx="32" cy="32" r="18" fill="none" stroke="#fef3c7" stroke-width="6"/>`
      : "";
    return `<svg class="euro-svg moneda" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="${fill}" stroke="#78716c" stroke-width="2"/>
      ${ring}
      <text x="32" y="28" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">€</text>
      <text x="32" y="42" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">${d.label}</text>
    </svg>`;
  }

  function htmlDenom(d, cantidad, opts) {
    const q = cantidad ?? 0;
    const visual = d.tipo === "billete" ? svgBillete(d) : svgMoneda(d);
    const clickable = opts?.clickable ? `data-denom="${d.id}"` : "";
    const cls = `euro-piece ${d.tipo} ${opts?.active ? "active" : ""} ${opts?.dim ? "dim" : ""}`;
    return `<button type="button" class="${cls}" ${clickable} title="${d.label}">
      ${visual}
      <span class="euro-qty">× ${q}</span>
      <span class="euro-lab">${d.label}</span>
    </button>`;
  }

  function aplicarEntradaEfectivo(denoms, entregadoDesglose) {
    const next = { ...denoms };
    for (const [id, qty] of Object.entries(entregadoDesglose || {})) {
      next[id] = (next[id] || 0) + (qty || 0);
    }
    return next;
  }

  function aplicarSalidaCambio(denoms, usado) {
    const next = { ...denoms };
    for (const [id, qty] of Object.entries(usado || {})) {
      next[id] = Math.max(0, (next[id] || 0) - (qty || 0));
    }
    return next;
  }

  function registrarPago(caja, pago) {
    const mov = {
      id: "MOV-" + Date.now().toString(36),
      fecha: pago.fecha,
      tipo: "venta",
      metodo: pago.metodo,
      total: pago.total,
      recibido: pago.recibido || 0,
      cambio: pago.cambio || 0,
      ticketId: pago.ticketId,
      detalle: pago.detalle || "",
      mixto: pago.mixto || null,
    };
    const next = { ...caja, movimientos: [...caja.movimientos, mov], denoms: { ...caja.denoms } };
    const esEfectivo = pago.metodo === "efectivo" || (pago.metodo === "mixto" && pago.mixto?.efectivo > 0);
    if (esEfectivo) {
      if (pago.entregaDenoms) next.denoms = aplicarEntradaEfectivo(next.denoms, pago.entregaDenoms);
      else next.denoms = aplicarEntradaEfectivo(next.denoms, desgloseEntregaRapida(pago.recibido || pago.total));
      if (pago.cambioUsado) next.denoms = aplicarSalidaCambio(next.denoms, pago.cambioUsado);
    }
    return next;
  }

  function resumenCaja(caja, ventas) {
    const porMetodo = {};
    for (const m of METODOS) porMetodo[m.id] = 0;
    let tickets = 0, facturacion = 0, margen = 0;
    let efectivoDeMixto = 0;
    for (const v of ventas || []) {
      tickets++;
      facturacion += v.total || 0;
      margen += v.margen || 0;
      const m = v.pago?.metodo || "efectivo";
      if (porMetodo[m] == null) porMetodo[m] = 0;
      porMetodo[m] += v.total || 0;
      if (m === "mixto") efectivoDeMixto += v.pago.mixto?.efectivo || 0;
    }
    const teorico = round2(caja.fondoInicial + (porMetodo.efectivo || 0) + efectivoDeMixto);
    const contado = totalDenoms(caja.denoms);
    return {
      tickets,
      facturacion: round2(facturacion),
      margen: round2(margen),
      porMetodo,
      fondoInicial: caja.fondoInicial,
      teorico,
      contado,
      diferencia: round2(contado - teorico),
    };
  }

  global.FarmaciaCaja = {
    DENOMS, METODOS, round2, emptyDenoms, totalDenoms, defaultCaja,
    calcularCambio, desgloseEntregaRapida, registrarPago, resumenCaja,
    htmlDenom, svgBillete, svgMoneda,
  };
})(typeof window !== "undefined" ? window : globalThis);
