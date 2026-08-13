/**
 * Sistema de caja completo — métodos de pago y cambio en euros.
 */
(function (global) {
  const DENOMS = [
    { id: "500", valor: 500, tipo: "billete" },
    { id: "200", valor: 200, tipo: "billete" },
    { id: "100", valor: 100, tipo: "billete" },
    { id: "50", valor: 50, tipo: "billete" },
    { id: "20", valor: 20, tipo: "billete" },
    { id: "10", valor: 10, tipo: "billete" },
    { id: "5", valor: 5, tipo: "billete" },
    { id: "2", valor: 2, tipo: "moneda" },
    { id: "1", valor: 1, tipo: "moneda" },
    { id: "0.50", valor: 0.5, tipo: "moneda" },
    { id: "0.20", valor: 0.2, tipo: "moneda" },
    { id: "0.10", valor: 0.1, tipo: "moneda" },
    { id: "0.05", valor: 0.05, tipo: "moneda" },
    { id: "0.02", valor: 0.02, tipo: "moneda" },
    { id: "0.01", valor: 0.01, tipo: "moneda" },
  ];

  const METODOS = [
    { id: "efectivo", nombre: "Efectivo", icon: "💶", color: "#1b7f4a" },
    { id: "tarjeta", nombre: "Tarjeta", icon: "💳", color: "#1d4ed8" },
    { id: "bizum", nombre: "Bizum", icon: "📱", color: "#0e7490" },
    { id: "transferencia", nombre: "Transferencia", icon: "🏦", color: "#6d28d9" },
    { id: "mixto", nombre: "Pago mixto", icon: "🔀", color: "#c2410c" },
  ];

  function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function emptyDenoms(preset) {
    const d = {};
    for (const x of DENOMS) d[x.id] = 0;
    if (preset === "fondo") {
      d["50"] = 1;
      d["20"] = 2;
      d["10"] = 3;
      d["5"] = 4;
      d["2"] = 10;
      d["1"] = 10;
      d["0.50"] = 10;
      d["0.20"] = 15;
      d["0.10"] = 20;
      d["0.05"] = 20;
      d["0.02"] = 30;
      d["0.01"] = 50;
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
      sesionId: "CJ-" + Date.now().toString(36).toUpperCase(),
      operador: "Farmacéutico/a Álora",
    };
  }

  /** Desglose greedy del cambio preferiendo existencias de caja */
  function calcularCambio(importeCambio, denomsDisponibles) {
    let resto = round2(importeCambio);
    if (resto < 0) return { ok: false, motivo: "Importe inválido", desglose: [], usado: {} };
    const usado = emptyDenoms();
    const desglose = [];
    const copia = { ...denomsDisponibles };

    for (const d of DENOMS) {
      if (resto <= 0) break;
      const maxNeed = Math.floor((resto + 1e-9) / d.valor);
      const disponibles = copia[d.id] || 0;
      const take = Math.min(maxNeed, disponibles);
      if (take > 0) {
        usado[d.id] = take;
        copia[d.id] -= take;
        resto = round2(resto - take * d.valor);
        desglose.push({ id: d.id, valor: d.valor, cantidad: take, tipo: d.tipo });
      }
    }

    // Si falta, completar sin stock (simulación formativa)
    if (resto > 0) {
      for (const d of DENOMS) {
        if (resto <= 0) break;
        const take = Math.floor((resto + 1e-9) / d.valor);
        if (take > 0) {
          usado[d.id] = (usado[d.id] || 0) + take;
          resto = round2(resto - take * d.valor);
          const prev = desglose.find((x) => x.id === d.id);
          if (prev) prev.cantidad += take;
          else desglose.push({ id: d.id, valor: d.valor, cantidad: take, tipo: d.tipo, sinStock: true });
        }
      }
    }

    return {
      ok: resto <= 0.001,
      resto: Math.max(0, resto),
      desglose,
      usado,
      total: round2(importeCambio),
    };
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

  /** Heurística: repartir un importe entregado en billetes/monedas típicos */
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
    const next = {
      ...caja,
      movimientos: [...caja.movimientos, mov],
      denoms: { ...caja.denoms },
    };
    if (pago.metodo === "efectivo" || (pago.metodo === "mixto" && pago.mixto?.efectivo > 0)) {
      if (pago.entregaDenoms) {
        next.denoms = aplicarEntradaEfectivo(next.denoms, pago.entregaDenoms);
      } else {
        // suma neta: total en efectivo - cambio ya descontado vía used
        const neto = pago.metodo === "mixto" ? pago.mixto.efectivo : pago.total;
        // aproximación: meter el neto como desglose rápido y luego quitar cambio
        const entrada = desgloseEntregaRapida(pago.recibido || neto);
        next.denoms = aplicarEntradaEfectivo(next.denoms, entrada);
      }
      if (pago.cambioUsado) {
        next.denoms = aplicarSalidaCambio(next.denoms, pago.cambioUsado);
      }
    }
    return next;
  }

  function resumenCaja(caja, ventas) {
    const porMetodo = { efectivo: 0, tarjeta: 0, bizum: 0, transferencia: 0, mixto: 0 };
    let tickets = 0;
    let facturacion = 0;
    let margen = 0;
    for (const v of ventas || []) {
      tickets++;
      facturacion += v.total || 0;
      margen += v.margen || 0;
      const m = v.pago?.metodo || "efectivo";
      if (porMetodo[m] != null) porMetodo[m] += v.total || 0;
      else porMetodo.mixto += v.total || 0;
    }
    const efectivoTeorico = round2(caja.fondoInicial + porMetodo.efectivo + (porMetodo.mixto * 0)); // mixto handled below
    let efectivoDeMixto = 0;
    for (const v of ventas || []) {
      if (v.pago?.metodo === "mixto") efectivoDeMixto += v.pago.mixto?.efectivo || 0;
    }
    const teorico = round2(caja.fondoInicial + porMetodo.efectivo + efectivoDeMixto);
    const contado = totalDenoms(caja.denoms);
    return {
      tickets,
      facturacion: round2(facturacion),
      margen: round2(margen),
      porMetodo: {
        ...porMetodo,
        efectivo: round2(porMetodo.efectivo + efectivoDeMixto),
      },
      fondoInicial: caja.fondoInicial,
      teorico,
      contado,
      diferencia: round2(contado - teorico),
      totalDenoms: contado,
    };
  }

  global.FarmaciaCaja = {
    DENOMS,
    METODOS,
    round2,
    emptyDenoms,
    totalDenoms,
    defaultCaja,
    calcularCambio,
    desgloseEntregaRapida,
    registrarPago,
    resumenCaja,
  };
})(typeof window !== "undefined" ? window : globalThis);
