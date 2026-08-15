/**
 * Clientes procedurales — peticiones muy variadas (Fase 2).
 * Modos: exacto, marca, sintoma, para_otro, receta, cronica, ambas,
 * multi, parafarmacia, controlado, nevera, vet, optica, orto, viaje,
 * embarazo, alarma, interaccion, generico, prisa, turista, sigre,
 * vitals, magistral, snack, sustituto.
 */
(function (global) {
  const TOTAL = 8000000;

  const MODOS_LABEL = {
    exacto: "Producto exacto",
    marca: "Pide marca",
    sintoma: "Por síntomas",
    para_otro: "Para otra persona",
    receta: "Con receta",
    cronica: "Receta crónica",
    ambas: "Producto + receta",
    multi: "Varios OTC",
    parafarmacia: "Parafarmacia / consejo",
    controlado: "Controlado",
    nevera: "Frigorífico",
    vet: "Veterinaria",
    optica: "Óptica",
    orto: "Ortopedia / cura",
    viaje: "Viaje / botiquín",
    embarazo: "Embarazo / lactancia",
    alarma: "¡Alarma clínica!",
    interaccion: "Riesgo interacción",
    generico: "Quiere genérico",
    prisa: "Con prisas",
    turista: "Turista",
    sigre: "Punto SIGRE",
    vitals: "Toma de constantes",
    magistral: "Fórmula magistral",
    snack: "Conveniencia",
    sustituto: "Pide sustituto",
  };

  const NOMBRES = [
    "María", "Carmen", "Ana", "Laura", "Isabel", "Lucía", "Paula", "Elena", "Sara", "Marta",
    "Antonio", "José", "Manuel", "Francisco", "Juan", "David", "Javier", "Carlos", "Miguel", "Pedro",
    "Sofía", "Valeria", "Hugo", "Martín", "Daniel", "Pablo", "Diego", "Raúl", "Nuria", "Irene",
    "Pilar", "Rosa", "Teresa", "Cristina", "Beatriz", "Alejandro", "Álvaro", "Sergio", "Rubén", "Iván",
    "Fatima", "Amira", "Omar", "Youssef", "Wei", "John", "Emily", "Hans", "Giulia", "Pierre",
  ];
  const APELLIDOS = [
    "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
    "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez", "Romero", "Navarro", "Torres", "Ramos",
    "Vázquez", "Castro", "Ortega", "Delgado", "Serrano", "Molina", "Suárez", "Blanco", "Rubio", "Méndez",
  ];

  const FRASES_SALUDO = [
    "Buenas,", "Hola,", "Buenos días,", "Buenas tardes,", "Perdone,", "Oiga,",
  ];
  const FRASES_SINTOMA = [
    (s) => `me duele / tengo ${s}. ¿Qué me recomienda?`,
    (s) => `vengo por ${s}, no sé qué comprar.`,
    (s) => `desde ayer con ${s}. ¿Hay algo sin receta?`,
    (s) => `creo que es ${s}, ¿me orienta?`,
    (s) => `no estoy bien: ${s}.`,
  ];
  const PARA_QUIEN = [
    { id: "hijo", txt: "mi hijo", edadFn: (r) => 1 + Math.floor(r() * 12) },
    { id: "hija", txt: "mi hija", edadFn: (r) => 1 + Math.floor(r() * 14) },
    { id: "bebe", txt: "el bebé", edadFn: () => 0 },
    { id: "madre", txt: "mi madre", edadFn: (r) => 65 + Math.floor(r() * 25) },
    { id: "padre", txt: "mi padre", edadFn: (r) => 60 + Math.floor(r() * 30) },
    { id: "pareja", txt: "mi pareja", edadFn: (r) => 25 + Math.floor(r() * 40) },
    { id: "abuela", txt: "mi abuela", edadFn: (r) => 75 + Math.floor(r() * 20) },
  ];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(r() * arr.length)];
  }
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function genDNI(r) {
    const num = 10000000 + Math.floor(r() * 89999999);
    return String(num) + "TRWAGMYFPDXBNJZSQVHLCKE"[num % 23];
  }
  function byCat(productos, nombre) {
    return productos.filter((p) => p.categoria === nombre);
  }
  function otcOf(productos) {
    return productos.filter((p) => !p.requiereReceta);
  }
  function rxOf(productos) {
    return productos.filter((p) => p.requiereReceta);
  }
  function withSint(productos) {
    return productos.filter((p) => (p.sintomas || []).length);
  }

  function chooseModo(r) {
    // Pesos: muchas peticiones distintas (no solo exacto/síntoma/receta)
    const bag = [
      ["exacto", 12], ["marca", 8], ["sintoma", 12], ["para_otro", 8],
      ["receta", 10], ["cronica", 7], ["ambas", 6], ["multi", 6],
      ["parafarmacia", 5], ["controlado", 3], ["nevera", 3],
      ["vet", 3], ["optica", 3], ["orto", 3], ["viaje", 4],
      ["embarazo", 3], ["alarma", 4], ["interaccion", 4],
      ["generico", 4], ["prisa", 4], ["turista", 3], ["sigre", 3],
      ["vitals", 3], ["magistral", 2], ["snack", 3], ["sustituto", 4],
    ];
    const total = bag.reduce((s, x) => s + x[1], 0);
    let roll = r() * total;
    for (const [m, w] of bag) {
      roll -= w;
      if (roll <= 0) return m;
    }
    return "sintoma";
  }

  function pagoFields(r, quiereReceta, tramoSNS) {
    const metodos = ["efectivo", "tarjeta_contactless", "tarjeta_chip", "bizum", "transferencia", "vale", "ticket_rest", "mixto"];
    if (quiereReceta && tramoSNS !== "particular" && r() < 0.4) metodos.push("sns_cargo");
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
    return { metodoPago, metodoNombre };
  }

  function basePersona(r) {
    const nombre = `${pick(r, NOMBRES)} ${pick(r, APELLIDOS)} ${pick(r, APELLIDOS)}`;
    const edad = 1 + Math.floor(r() * 95);
    let tramoSNS = pick(r, ["exento", "pensionista", "activo_bajo", "activo_medio", "activo_alto", "particular"]);
    if (edad >= 65 && r() < 0.7) tramoSNS = "pensionista";
    if (edad < 18 && r() < 0.35) tramoSNS = "exento";
    return {
      nombre,
      edad,
      tramoSNS,
      familiaNumerosa: r() < 0.12,
      mutuaId: pick(r, ["particular", "ss", "adeslas", "sanitas", "asisa", "dkv"]),
      alergias: r() < 0.18 ? [pick(r, ["penicilina", "aines", "aspirina", "metamizol", "lactosa"])] : [],
      cronicos: r() < 0.32 ? [pick(r, ["enalapril", "metformina", "atorvastatina", "omeprazol", "levotiroxina", "sertralina", "bisoprolol"])] : [],
      embarazo: edad >= 18 && edad <= 45 && r() < 0.05,
      lactancia: edad >= 18 && edad <= 45 && r() < 0.04,
    };
  }

  function mkRxItems(r, pool, n) {
    const used = new Set();
    const out = [];
    const shuffled = shuffle(r, pool);
    for (const p of shuffled) {
      if (out.length >= n) break;
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push({
        productId: p.id,
        nombre: p.nombre,
        cantidad: 1 + (r() < 0.18 ? 1 : 0),
        controlado: !!p.controlado,
        nevera: !!p.nevera,
      });
    }
    return out;
  }

  function generarCliente(id, productos, seasonBoost) {
    const n = ((Number(id) % TOTAL) + TOTAL) % TOTAL;
    const r = mulberry32(n * 2654435761 + 99);
    const persona = basePersona(r);
    let { nombre, edad, tramoSNS, familiaNumerosa, mutuaId, alergias, cronicos, embarazo, lactancia } = persona;

    const otc = otcOf(productos);
    const rx = rxOf(productos);
    let modo = chooseModo(r);

    // Fallbacks si el catálogo no tiene categoría
    const has = (cat) => byCat(productos, cat).length > 0;
    if (modo === "controlado" && !productos.some((p) => p.controlado)) modo = "receta";
    if (modo === "nevera" && !productos.some((p) => p.nevera)) modo = "receta";
    if (modo === "vet" && !has("Veterinaria")) modo = "sintoma";
    if (modo === "optica" && !has("Óptica y lentillas")) modo = "parafarmacia";
    if (modo === "orto" && !has("Ortopedia ligera") && !has("Apósitos y primeros auxilios")) modo = "sintoma";

    let peticionTexto = "";
    let sintomas = [];
    let quiereProductoIds = [];
    let quiereReceta = false;
    let productosReceta = [];
    let paraQuien = null;
    let urgencia = false;
    let pista = "";
    let tutor = null;
    let tono = "normal";

    const saludo = pick(r, FRASES_SALUDO);

    // ——— Modos ———
    if (modo === "exacto") {
      let pool = otc;
      if (seasonBoost?.length) {
        const boosted = otc.filter((p) => (p.sintomas || []).some((s) => seasonBoost.includes(s)));
        if (boosted.length && r() < 0.55) pool = boosted;
      }
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      const variantes = [
        `${saludo} quiero exactamente ${p.nombre}.`,
        `${saludo} ¿me da ${p.nombre}? Es el de siempre.`,
        `${saludo} busco ${p.nombre}, el de caja ${p.presentacion || "habitual"}.`,
        `${saludo} me ha dicho mi médico/amigo que compre ${p.nombre}.`,
      ];
      peticionTexto = pick(r, variantes);
    }

    else if (modo === "marca") {
      const p = pick(r, otc);
      quiereProductoIds = [p.id];
      sintomas = (p.sintomas || []).slice(0, 1);
      peticionTexto = `${saludo} ¿tienen ${p.marca}? Cualquier presentación me vale.`;
      pista = `Busca marca «${p.marca}» (p. ej. ${p.nombre}).`;
    }

    else if (modo === "sintoma") {
      let pool = withSint(otc);
      if (seasonBoost?.length) {
        const boosted = pool.filter((p) => (p.sintomas || []).some((s) => seasonBoost.includes(s)));
        if (boosted.length) pool = boosted;
      }
      const p = pick(r, pool.length ? pool : otc);
      sintomas = shuffle(r, p.sintomas || ["malestar"]).slice(0, 1 + Math.floor(r() * 2));
      if (!sintomas.length) sintomas = ["dolor de cabeza"];
      const sTxt = sintomas.join(" y ");
      peticionTexto = `${saludo} ${pick(r, FRASES_SINTOMA)(sTxt)}`;
      if (r() < 0.25) peticionTexto += " No quiero ir al médico si se puede evitar.";
      if (r() < 0.2) peticionTexto += " ¿Es compatible con lo que tomo normalmente?";
    }

    else if (modo === "para_otro") {
      const quien = pick(r, PARA_QUIEN);
      paraQuien = quien.id;
      const edadOtro = quien.edadFn(r);
      if (quien.id === "bebe" || quien.id === "hijo" || quien.id === "hija") {
        tutor = nombre;
        // El "paciente" es el menor: ajustamos edad mostrada del cliente adulto comprador
        if (edad < 18) edad = 25 + Math.floor(r() * 20);
      }
      const pool = withSint(otc);
      const p = pick(r, pool.length ? pool : otc);
      sintomas = (p.sintomas || ["fiebre"]).slice(0, 2);
      peticionTexto = `${saludo} vengo por ${quien.txt}` +
        (edadOtro > 0 ? ` (${edadOtro} años)` : " (pocos meses)") +
        `: tiene ${sintomas.join(" y ")}. ¿Qué le doy?`;
      if (quien.id === "bebe" || edadOtro < 3) {
        urgencia = r() < 0.35;
        pista = "Valorar edad/peso y alarmas pediátricas antes de indicar.";
      }
    }

    else if (modo === "receta") {
      quiereReceta = true;
      const nRx = 1 + Math.floor(r() * 3);
      productosReceta = mkRxItems(r, rx, nRx);
      peticionTexto = `${saludo} traigo receta con ${productosReceta.length} medicamento(s).`;
      if (r() < 0.3) peticionTexto += " ¿Me explica cómo tomarlo?";
    }

    else if (modo === "cronica") {
      quiereReceta = true;
      const cats = ["Cardiovascular", "Diabetes y endocrino", "Hormonas y tiroides", "Salud mental", "Digestivo con receta"];
      let pool = [];
      for (const c of shuffle(r, cats)) {
        pool = byCat(productos, c).filter((p) => p.requiereReceta);
        if (pool.length) break;
      }
      if (!pool.length) pool = rx;
      const nRx = 2 + Math.floor(r() * 3);
      productosReceta = mkRxItems(r, pool, nRx);
      cronicos = productosReceta.slice(0, 2).map((x) => {
        const full = productos.find((p) => p.id === x.productId);
        return (full?.principioActivo || x.nombre).split(" ")[0].toLowerCase();
      });
      if (edad < 50) edad = 55 + Math.floor(r() * 30);
      if (r() < 0.6) tramoSNS = "pensionista";
      peticionTexto = `${saludo} vengo a por mi medicación crónica de siempre (${productosReceta.length} envases).`;
      pista = "Comprobar adherencia, interacciones y fase de e-receta.";
    }

    else if (modo === "ambas") {
      quiereReceta = true;
      productosReceta = mkRxItems(r, rx, 1 + Math.floor(r() * 2));
      const p = pick(r, otc);
      quiereProductoIds = [p.id];
      peticionTexto = `${saludo} traigo receta y además quiero ${p.nombre} para la tos/dolor.`;
    }

    else if (modo === "multi") {
      const n = 2 + Math.floor(r() * 3);
      const picks = shuffle(r, otc).slice(0, n);
      quiereProductoIds = picks.map((p) => p.id);
      peticionTexto = `${saludo} necesito varias cosas: ${picks.map((p) => p.nombre).join(", ")}.`;
    }

    else if (modo === "parafarmacia") {
      const cats = ["Piel y dermatología", "Solar y fotoprotección", "Capilar", "Higiene bucal", "Vitaminas y minerales", "Fitoterapia"];
      let pool = [];
      for (const c of shuffle(r, cats)) {
        pool = byCat(productos, c);
        if (pool.length) break;
      }
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = r() < 0.45 ? [p.id] : [];
      sintomas = (p.sintomas || []).slice(0, 1);
      peticionTexto = quiereProductoIds.length
        ? `${saludo} busco ${p.nombre} / algo de ${p.categoria.toLowerCase()}.`
        : `${saludo} quiero consejo de ${p.categoria.toLowerCase()}, la piel/pelo no me va bien.`;
    }

    else if (modo === "controlado") {
      quiereReceta = true;
      const pool = productos.filter((p) => p.controlado);
      productosReceta = mkRxItems(r, pool, 1);
      peticionTexto = `${saludo} traigo receta de estupefaciente / controlado. Traigo el DNI.`;
      pista = "DNI + libro + cantidad exacta + firma.";
      urgencia = false;
    }

    else if (modo === "nevera") {
      quiereReceta = true;
      const pool = productos.filter((p) => p.nevera);
      productosReceta = mkRxItems(r, pool, 1);
      peticionTexto = `${saludo} vengo a por el medicamento de nevera. ¿Me lo pone en bolsa isotérmica?`;
      pista = "Cadena de frío 2–8 °C.";
    }

    else if (modo === "vet") {
      const pool = byCat(productos, "Veterinaria");
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      const especie = pick(r, ["perro", "gato", "conejo"]);
      peticionTexto = `${saludo} para mi ${especie}: ¿tiene ${p.nombre}? Pesa unos ${4 + Math.floor(r() * 20)} kg.`;
      pista = "Confirmar especie/peso; no improvisar con fármacos humanos.";
    }

    else if (modo === "optica") {
      const pool = byCat(productos, "Óptica y lentillas").concat(byCat(productos, "Audición / pilas"));
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      peticionTexto = `${saludo} necesito ${p.nombre}. Se me han acabado las lentillas/líquido/pilas.`;
    }

    else if (modo === "orto") {
      const pool = byCat(productos, "Ortopedia ligera").concat(byCat(productos, "Apósitos y primeros auxilios"));
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      peticionTexto = `${saludo} me he torcido el tobillo / tengo una herida. ¿Me da ${p.nombre} o me aconseja talla?`;
      pista = "Medir talla y explicar uso.";
    }

    else if (modo === "viaje") {
      const pool = byCat(productos, "Viaje y botiquín");
      const extra = otc.filter((p) => (p.sintomas || []).some((s) => ["diarrea", "insomnio", "picaduras", "mareo"].includes(s)));
      const picks = shuffle(r, (pool.length ? pool : otc).concat(extra)).slice(0, 2 + Math.floor(r() * 2));
      quiereProductoIds = picks.map((p) => p.id);
      const destino = pick(r, ["la playa", "la montaña", "un viaje en avión", "Marruecos", "un camping"]);
      peticionTexto = `${saludo} me voy a ${destino} y quiero botiquín: ${picks.map((p) => p.marca || p.nombre).join(", ")}… ¿me falta algo?`;
    }

    else if (modo === "embarazo") {
      embarazo = true;
      lactancia = r() < 0.3;
      edad = 22 + Math.floor(r() * 18);
      const pool = byCat(productos, "Embarazo y lactancia").concat(
        otc.filter((p) => (p.principioActivo || "").toLowerCase().includes("paracetamol"))
      );
      const p = pick(r, pool.length ? pool : otc);
      sintomas = pick(r, [["náuseas"], ["acidez"], ["dolor de cabeza"], ["estreñimiento"]]);
      quiereProductoIds = r() < 0.4 ? [p.id] : [];
      peticionTexto = `${saludo} estoy embarazada` + (lactancia ? " / en lactancia" : "") +
        ` y tengo ${sintomas.join(" y ")}. ¿Qué puedo tomar con seguridad?`;
      pista = "Priorizar seguridad; evitar AINE en 3.er trimestre salvo criterio médico.";
      urgencia = r() < 0.15;
    }

    else if (modo === "alarma") {
      urgencia = true;
      tono = "urgente";
      const casos = [
        { sintomas: ["fiebre", "rigidez de nuca"], txt: "fiebre alta y el cuello rígido", edadFn: (rr) => 8 + Math.floor(rr() * 40) },
        { sintomas: ["fiebre"], txt: "fiebre en un bebé de 2 meses", edadFn: () => 28, para: "bebe" },
        { sintomas: ["disnea", "tos"], txt: "mucha fatiga al respirar y labios morados", edadFn: (rr) => 40 + Math.floor(rr() * 40) },
        { sintomas: ["dolor de pecho"], txt: "dolor fuerte en el pecho que no se va", edadFn: (rr) => 50 + Math.floor(rr() * 30) },
        { sintomas: ["reacción alérgica"], txt: "la cara hinchada tras tomar un comprimido", edadFn: (rr) => 20 + Math.floor(rr() * 40) },
      ];
      const caso = pick(r, casos);
      sintomas = caso.sintomas;
      edad = caso.edadFn(r);
      if (caso.para) paraQuien = caso.para;
      peticionTexto = `${saludo} ¡es urgente! ${caso.txt}. ¿Qué medicina le doy YA?`;
      pista = "DERIVAR / urgencias. No indicar OTC a ciegas.";
      quiereProductoIds = [];
    }

    else if (modo === "interaccion") {
      cronicos = shuffle(r, ["warfarina", "acenocumarol", "enalapril", "metformina"]).slice(0, 1 + Math.floor(r() * 2));
      alergias = r() < 0.4 ? ["aines"] : alergias;
      const pool = otc.filter((p) => p.grupoInteraccion === "nsaid" || (p.principioActivo || "").toLowerCase().includes("ibuprofeno"));
      const p = pick(r, pool.length ? pool : otc);
      quiereProductoIds = [p.id];
      sintomas = ["dolor"];
      peticionTexto = `${saludo} tomo ${cronicos.join(" y ")} y quiero ${p.nombre} para el dolor. ¿Puedo?`;
      pista = "Alertar interacción / derivar si anticoagulado + AINE.";
      urgencia = true;
    }

    else if (modo === "generico") {
      const pool = productos.filter((p) => p.esGenerico && !p.requiereReceta);
      const p = pick(r, pool.length ? pool : otc.filter((x) => x.esGenerico));
      const alt = p || pick(r, otc);
      quiereProductoIds = [alt.id];
      peticionTexto = `${saludo} quiero el más barato / genérico de ${(alt.principioActivo || alt.nombre).split("+")[0].trim()}.`;
      pista = "Ofrecer EFG y explicar equivalencia.";
    }

    else if (modo === "prisa") {
      tono = "prisa";
      const p = pick(r, otc);
      quiereProductoIds = [p.id];
      peticionTexto = `${saludo} voy con mucha prisa: ${p.nombre} y cobro rápido, por favor. El taxi me espera.`;
    }

    else if (modo === "turista") {
      tono = "turista";
      const p = pick(r, withSint(otc).length ? withSint(otc) : otc);
      sintomas = (p.sintomas || ["headache"]).slice(0, 1);
      const langs = [
        `Hello, I need something for ${sintomas[0]}… ¿medicine?`,
        `Bonjour, j'ai ${sintomas[0]}. ¿Medicamento sin receta?`,
        `Excuse me, pharmacy? I need ${p.marca || "painkiller"}.`,
        `Hola… poco español. ${sintomas[0]} — ¿ayuda?`,
      ];
      peticionTexto = pick(r, langs);
      quiereProductoIds = r() < 0.5 ? [p.id] : [];
      pista = "Lenguaje sencillo; confirmar alergias y embarazo.";
    }

    else if (modo === "sigre") {
      peticionTexto = `${saludo} traigo una bolsa de medicamentos caducados / sobrantes. ¿Dónde está el punto SIGRE?`;
      pista = "Orientar al contenedor SIGRE; no tirar a basura doméstica.";
      quiereProductoIds = r() < 0.25 ? [pick(r, otc).id] : [];
      if (quiereProductoIds.length) {
        const p = productos.find((x) => x.id === quiereProductoIds[0]);
        peticionTexto += ` Y de paso me llevo ${p.nombre}.`;
      }
    }

    else if (modo === "vitals") {
      const que = pick(r, ["tensión", "glucemia", "las dos cosas"]);
      peticionTexto = `${saludo} ¿me puede tomar la ${que}? Me mareo / el médico me lo pidió.`;
      pista = "Usar panel de constantes; interpretar y registrar.";
      if (r() < 0.35) {
        const p = pick(r, otc);
        quiereProductoIds = [p.id];
        peticionTexto += ` Si está alta/baja, a lo mejor compro ${p.marca}.`;
      }
    }

    else if (modo === "magistral") {
      peticionTexto = `${saludo} el dermatólogo me ha pedido una fórmula magistral` +
        ` (por ejemplo ${pick(r, ["eritromicina", "hidroquinona", "ácido salicílico"])} en crema). ¿La preparan?`;
      pista = "Usar herramienta de magistral; registrar y etiquetar.";
      quiereReceta = r() < 0.5;
      if (quiereReceta) productosReceta = mkRxItems(r, rx, 1);
    }

    else if (modo === "snack") {
      const cats = ["Snacks y chicles", "Bebidas", "Revistas y prensa"];
      let pool = [];
      for (const c of cats) pool = pool.concat(byCat(productos, c));
      const picks = shuffle(r, pool.length ? pool : otc).slice(0, 1 + Math.floor(r() * 2));
      quiereProductoIds = picks.map((p) => p.id);
      peticionTexto = `${saludo} solo quiero ${picks.map((p) => p.nombre).join(" y ")} mientras espero.`;
    }

    else if (modo === "sustituto") {
      const p = pick(r, otc);
      quiereProductoIds = [p.id];
      peticionTexto = `${saludo} buscaba ${p.nombre} pero en la otra farmacia no había. ¿Tiene el mismo o un equivalente?`;
      pista = `Ofrecer mismo PA (${p.principioActivo}) u otra marca.`;
    }

    // Edad pediátrica comprando sola → tutor implícito
    if (edad < 16 && !tutor && (quiereReceta || modo === "controlado")) {
      tutor = `${pick(r, NOMBRES)} ${pick(r, APELLIDOS)} (tutor)`;
      peticionTexto += ` Vengo con mi tutor.`;
    }

    if (!peticionTexto) peticionTexto = `${saludo} ¿me puede atender?`;

    const { metodoPago, metodoNombre } = pagoFields(r, quiereReceta, tramoSNS);
    if (modo !== "sigre" || quiereProductoIds.length || quiereReceta) {
      peticionTexto += ` Pagaré con ${metodoNombre}.`;
    } else {
      peticionTexto += " Solo el SIGRE, sin compra.";
    }

    return {
      id: "CLI-" + String(n).padStart(7, "0"),
      seedId: n,
      nombre,
      dni: genDNI(r),
      telefono: "6" + String(100000000 + Math.floor(r() * 89999999)).slice(0, 8),
      edad,
      tramoSNS,
      familiaNumerosa,
      mutuaId,
      alergias,
      cronicos,
      embarazo,
      lactancia,
      modo,
      modoLabel: MODOS_LABEL[modo] || modo,
      peticionTexto,
      sintomas,
      quiereProductoIds,
      quiereReceta,
      productosReceta,
      metodoPago,
      paraQuien,
      urgencia,
      pista,
      tutor,
      tono,
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

  global.FarmaciaClientes = { TOTAL, generarCliente, clienteAleatorio, aportacionSNS, MODOS_LABEL };
})(typeof window !== "undefined" ? window : globalThis);
