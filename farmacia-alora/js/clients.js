/**
 * Clientes procedurales — piden producto exacto, por síntoma, receta, o ambas.
 */
(function (global) {
  const TOTAL = 5000000;

  const NOMBRES = [
    "María", "Carmen", "Ana", "Laura", "Isabel", "Lucía", "Paula", "Elena", "Sara", "Marta",
    "Antonio", "José", "Manuel", "Francisco", "Juan", "David", "Javier", "Carlos", "Miguel", "Pedro",
    "Sofía", "Valeria", "Hugo", "Martín", "Daniel", "Pablo", "Diego", "Raúl", "Nuria", "Irene",
  ];
  const APELLIDOS = [
    "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
    "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez", "Romero", "Navarro", "Torres", "Ramos",
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
  function genDNI(r) {
    const num = 10000000 + Math.floor(r() * 89999999);
    return String(num) + "TRWAGMYFPDXBNJZSQVHLCKE"[num % 23];
  }

  function generarCliente(id, productos, seasonBoost) {
    const n = ((Number(id) % TOTAL) + TOTAL) % TOTAL;
    const r = mulberry32(n * 2654435761 + 99);
    const nombre = `${pick(r, NOMBRES)} ${pick(r, APELLIDOS)} ${pick(r, APELLIDOS)}`;
    const edad = 1 + Math.floor(r() * 95);
    let tramoSNS = pick(r, ["exento", "pensionista", "activo_bajo", "activo_medio", "activo_alto", "particular"]);
    if (edad >= 65 && r() < 0.7) tramoSNS = "pensionista";
    if (edad < 18 && r() < 0.35) tramoSNS = "exento";

    const otc = productos.filter((p) => !p.requiereReceta);
    const rx = productos.filter((p) => p.requiereReceta);
    const modeRoll = r();
    // 0.35 exacto, 0.25 sintoma, 0.25 receta, 0.15 ambas
    let modo = "exacto";
    if (modeRoll < 0.35) modo = "exacto";
    else if (modeRoll < 0.60) modo = "sintoma";
    else if (modeRoll < 0.85) modo = "receta";
    else modo = "ambas";

    let peticionTexto = "";
    let sintomas = [];
    let quiereProductoIds = [];
    let quiereReceta = false;
    let productosReceta = [];

    if (modo === "exacto" || modo === "ambas") {
      let pool = otc;
      if (seasonBoost?.length) {
        const boosted = otc.filter((p) => (p.sintomas || []).some((s) => seasonBoost.includes(s)));
        if (boosted.length) pool = boosted;
      }
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      peticionTexto = `Quiero exactamente: ${p.nombre}.`;
    }

    if (modo === "sintoma" || (modo === "ambas" && r() < 0.5)) {
      const conSint = otc.filter((p) => (p.sintomas || []).length);
      const p = pick(r, conSint.length ? conSint : otc);
      sintomas = (p.sintomas || []).slice(0, 2);
      if (!sintomas.length) sintomas = ["dolor de cabeza"];
      peticionTexto = (peticionTexto ? peticionTexto + " " : "") +
        `Me pasa esto: ${sintomas.join(" y ")}. ¿Qué me recomienda?`;
      if (modo === "sintoma") quiereProductoIds = [];
    }

    if (modo === "receta" || modo === "ambas") {
      quiereReceta = true;
      const nRx = 1 + Math.floor(r() * 3); // 1–3 meds
      const used = new Set();
      for (let i = 0; i < nRx && rx.length; i++) {
        const p = pick(r, rx);
        if (used.has(p.id)) continue;
        used.add(p.id);
        productosReceta.push({
          productId: p.id,
          nombre: p.nombre,
          cantidad: 1 + (r() < 0.2 ? 1 : 0),
          controlado: !!p.controlado,
          nevera: !!p.nevera,
        });
      }
      peticionTexto = (peticionTexto ? peticionTexto + " " : "") +
        `Traigo receta con ${productosReceta.length} medicamento(s).`;
    }

    if (!peticionTexto) peticionTexto = "Buenas, ¿me puede atender?";

    const metodos = ["efectivo", "tarjeta_contactless", "tarjeta_chip", "bizum", "transferencia", "vale", "ticket_rest", "mixto"];
    // SNS cargo more likely if mutua ss / has recipe
    if (quiereReceta && (tramoSNS !== "particular") && r() < 0.35) metodos.push("sns_cargo");
    const metodoPago = pick(r, metodos);
    const metodoNombre = {
      efectivo: "efectivo",
      tarjeta_contactless: "tarjeta contactless",
      tarjeta_chip: "tarjeta con chip",
      bizum: "Bizum",
      transferencia: "transferencia",
      vale: "vale regalo",
      ticket_rest: "ticket restaurant",
      sns_cargo: "cargo SNS / receta",
      mixto: "pago mixto",
    }[metodoPago] || metodoPago;
    peticionTexto += ` Pagaré con ${metodoNombre}.`;

    return {
      id: "CLI-" + String(n).padStart(7, "0"),
      seedId: n,
      nombre,
      dni: genDNI(r),
      telefono: "6" + String(100000000 + Math.floor(r() * 89999999)).slice(0, 8),
      edad,
      tramoSNS,
      familiaNumerosa: r() < 0.12,
      mutuaId: pick(r, ["particular", "ss", "adeslas", "sanitas", "asisa", "dkv"]),
      alergias: r() < 0.15 ? [pick(r, ["penicilina", "aines", "aspirina", "metamizol"])] : [],
      cronicos: r() < 0.3 ? [pick(r, ["enalapril", "metformina", "atorvastatina", "omeprazol"])] : [],
      embarazo: edad >= 18 && edad <= 45 && r() < 0.04,
      lactancia: edad >= 18 && edad <= 45 && r() < 0.03,
      modo,
      peticionTexto,
      sintomas,
      quiereProductoIds,
      quiereReceta,
      productosReceta,
      metodoPago,
    };
  }

  function clienteAleatorio(productos, extraSeed, seasonBoost) {
    const r = mulberry32((Date.now() ^ (extraSeed || 0) ^ (Math.random() * 1e9)) >>> 0);
    return generarCliente(Math.floor(r() * TOTAL), productos, seasonBoost);
  }

  function aportacionSNS(tramo) {
    switch (tramo) {
      case "exento": return 0;
      case "pensionista": return 0.1;
      case "activo_bajo": return 0.4;
      case "activo_medio": return 0.5;
      case "activo_alto": return 0.6;
      default: return 1;
    }
  }

  global.FarmaciaClientes = { TOTAL, generarCliente, clienteAleatorio, aportacionSNS };
})(typeof window !== "undefined" ? window : globalThis);
