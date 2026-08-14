/**
 * Extras de práctica: perfiles, topes SNS, ABC, visado, facturas.
 */
(function (global) {
  const FARMACIA = {
    nombre: "Farmacia Álora",
    direccion: "C/ Lucena 12, 29500 Álora (Málaga)",
    telefono: "952 49 00 00",
    nif: "B29900123",
    colegiado: "F-29481",
  };

  /** Topes mensuales educativos de aportación SNS (€) */
  const TOPES_SNS = {
    exento: 0,
    pensionista: 8.23,
    activo_bajo: 18.52,
    activo_medio: 61.75,
    activo_alto: 61.75,
    particular: Infinity,
  };

  const PERFILES = [
    {
      id: "embarazada",
      nombre: "Laura Ruiz Gómez",
      label: "Embarazada",
      icon: "🤰",
      edad: 32,
      dni: "31245876K",
      tramoSNS: "activo_medio",
      mutuaId: "ss",
      embarazo: true,
      lactancia: false,
      alergias: [],
      cronicos: ["ácido fólico"],
      peticionTexto: "Estoy embarazada de 5 meses. Me duele la cabeza y me han dicho que pregunte qué puedo tomar. Pagaré con tarjeta contactless.",
      sintomas: ["dolor de cabeza"],
      modo: "sintoma",
      metodoPago: "tarjeta_contactless",
      quiereProductoIds: [],
      quiereReceta: false,
    },
    {
      id: "anciano",
      nombre: "Antonio Pérez Martín",
      label: "Anciano polimedicado",
      icon: "👴",
      edad: 78,
      dni: "25110334H",
      tramoSNS: "pensionista",
      mutuaId: "ss",
      embarazo: false,
      lactancia: false,
      alergias: ["aines"],
      cronicos: ["enalapril", "metformina", "atorvastatina", "omeprazol"],
      peticionTexto: "Soy pensionista. Vengo a por mis pastillas de la tensión y a preguntar si las estoy tomando bien. Pagaré con cargo SNS / receta.",
      sintomas: [],
      modo: "receta",
      metodoPago: "sns_cargo",
      quiereProductoIds: [],
      quiereReceta: true,
      familiaNumerosa: false,
    },
    {
      id: "turista",
      nombre: "Emma Johnson",
      label: "Turista (EN)",
      icon: "🧳",
      edad: 29,
      dni: "X1234567L",
      tramoSNS: "particular",
      mutuaId: "particular",
      embarazo: false,
      lactancia: false,
      alergias: [],
      cronicos: [],
      peticionTexto: "Hello, I need something for a stomachache and sunburn. I will pay with card chip. (Particular / turista).",
      sintomas: ["diarrea", "solar"],
      modo: "sintoma",
      metodoPago: "tarjeta_chip",
      quiereProductoIds: [],
      quiereReceta: false,
    },
    {
      id: "menor",
      nombre: "Hugo García López",
      label: "Menor + tutor",
      icon: "🧒",
      edad: 8,
      dni: "00000000T",
      tutor: "Carmen López Díaz",
      tramoSNS: "exento",
      mutuaId: "ss",
      embarazo: false,
      lactancia: false,
      alergias: ["penicilina"],
      cronicos: [],
      peticionTexto: "Soy la madre: mi hijo de 8 años tiene fiebre y tos. Es alérgico a la penicilina. Pagaré con efectivo.",
      sintomas: ["fiebre", "tos"],
      modo: "sintoma",
      metodoPago: "efectivo",
      quiereProductoIds: [],
      quiereReceta: false,
    },
  ];

  function needsVisado(p) {
    if (!p) return false;
    if (p.controlado) return true;
    if (p.categoria === "Hormonas") return true;
    if (p.categoria === "Salud mental" && p.requiereReceta) return true;
    if ((p.precio || 0) >= 45 && p.requiereReceta) return true;
    return false;
  }

  function topeSNS(tramo) {
    return TOPES_SNS[tramo] ?? Infinity;
  }

  /** Clasificación ABC por valor de ventas acumulado */
  function clasificarABC(ventas, productos, stockMap) {
    const map = {};
    for (const v of ventas || []) {
      for (const l of v.lineas || []) {
        if (!map[l.productId]) map[l.productId] = { productId: l.productId, nombre: l.nombre, ud: 0, valor: 0 };
        map[l.productId].ud += l.cantidad;
        map[l.productId].valor += l.total || 0;
      }
    }
    // incluir stock sin ventas con valor teórico bajo
    for (const p of productos || []) {
      if (!map[p.id]) {
        map[p.id] = { productId: p.id, nombre: p.nombre, ud: 0, valor: 0.01 * (stockMap?.[p.id] || 0) };
      }
    }
    const rows = Object.values(map).sort((a, b) => b.valor - a.valor);
    const total = rows.reduce((s, r) => s + r.valor, 0) || 1;
    let acum = 0;
    return rows.map((r) => {
      const prev = acum / total;
      acum += r.valor;
      const pct = acum / total;
      let abc = "C";
      if (prev < 0.8) abc = "A";
      else if (prev < 0.95) abc = "B";
      return { ...r, abc, pctAcum: pct };
    });
  }

  function monthKey(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  global.FarmaciaExtras = {
    FARMACIA,
    TOPES_SNS,
    PERFILES,
    needsVisado,
    topeSNS,
    clasificarABC,
    monthKey,
  };
})(typeof window !== "undefined" ? window : globalThis);
