/**
 * Lógica clínica de práctica: interacciones, alergias, genéricos, síntomas, etiquetas.
 * Simulación educativa — no es consejo médico.
 */
(function (global) {
  const INTERACCIONES = [
    { a: "nsaid", b: "anticoagulante", nivel: "grave", msg: "AINE + anticoagulante: riesgo hemorrágico elevado." },
    { a: "nsaid", b: "ieca", nivel: "moderada", msg: "AINE + IECA: posible reducción del efecto antihipertensivo y riesgo renal." },
    { a: "nsaid", b: "diuretico", nivel: "moderada", msg: "AINE + diurético: riesgo de insuficiencia renal." },
    { a: "isrs", b: "nsaid", nivel: "moderada", msg: "ISRS + AINE: mayor riesgo de sangrado digestivo." },
    { a: "isrs", b: "anticoagulante", nivel: "grave", msg: "ISRS + anticoagulante: riesgo hemorrágico." },
    { a: "isrs", b: "tramadol_opioide", nivel: "grave", msg: "ISRS + tramadol/opioide: riesgo de síndrome serotoninérgico." },
    { a: "benzo", b: "opioide", nivel: "grave", msg: "Benzodiacepina + opioide: depresión respiratoria." },
    { a: "benzo", b: "zolpidem", nivel: "moderada", msg: "Sedantes combinados: potenciar somnolencia." },
    { a: "estatina", b: "antibiotico_macrolido", nivel: "moderada", msg: "Estatina + macrólido: posible aumento de toxicidad muscular." },
    { a: "anticoagulante", b: "antibiotico", nivel: "moderada", msg: "Antibiótico puede alterar INR/efecto anticoagulante." },
    { a: "metformina", b: "contraste", nivel: "moderada", msg: "Metformina: precaución en procedimientos (simulado)." },
    { a: "ipp", b: "anticoagulante", nivel: "leve", msg: "Algunos IBP pueden interactuar con anticoagulantes." },
    { a: "antihistaminico", b: "benzo", nivel: "leve", msg: "Antihistamínico + benzo: mayor sedación." },
    { a: "opioide", b: "tramadol_opioide", nivel: "grave", msg: "Opioides combinados: riesgo de depresión respiratoria." },
  ];

  const ALERGIA_MAP = [
    { key: "penicilina", match: /amoxicilina|clavulánico|penicilina|ampicilina/i },
    { key: "aines", match: /ibuprofeno|naproxeno|diclofenaco|dexketoprofeno|ácido acetilsalicílico|aas/i },
    { key: "aspirina", match: /ácido acetilsalicílico|aspirina/i },
    { key: "sulfamidas", match: /sulfametoxazol|cotrimoxazol/i },
    { key: "lactosa", match: /lactosa/i },
    { key: "metamizol", match: /metamizol|nolotil/i },
    { key: "latex", match: /látex|latex/i },
  ];

  const EMBARAZO_EVITAR = /isotretinoína|warfarina|metotrexato|ace|ieca|enalapril|ramipril|estatina|atorvastatina|simvastatina|doxiciclina|ciprofloxacino|metamizol/i;

  const SINTOMAS_UI = [
    "dolor de cabeza", "fiebre", "tos", "alergia", "acidez", "diarrea",
    "estreñimiento", "congestión", "dolor muscular", "piel irritada",
    "insomnio", "estres", "vitaminas", "higiene bucal", "solar",
  ];

  function gruposDeProducto(p) {
    return [p.grupoInteraccion].filter(Boolean);
  }

  function inferGrupoDesdeTexto(txt) {
    const t = String(txt || "").toLowerCase();
    if (/ibuprofeno|naproxeno|diclofenaco|aines|aas|aspirina|dexketoprofeno/.test(t)) return "nsaid";
    if (/warfarina|apixabán|rivaroxabán|anticoag|sintrom|eliquis|xarelto|acenocumarol/.test(t)) return "anticoagulante";
    if (/sertralina|escitalopram|fluoxetina|isrs|antidepres/.test(t)) return "isrs";
    if (/alprazolam|lorazepam|diazepam|benzo|orfidal|trankimazin/.test(t)) return "benzo";
    if (/tramadol|fentanilo|morfina|opioide|adolonta|durogesic/.test(t)) return "tramadol_opioide";
    if (/atorvastatina|simvastatina|estatina/.test(t)) return "estatina";
    if (/enalapril|ramipril|ieca|losartán/.test(t)) return "ieca";
    if (/furosemida|diurético/.test(t)) return "diuretico";
    if (/azitromicina|claritromicina|macrólido/.test(t)) return "antibiotico_macrolido";
    if (/amoxicilina|ciprofloxacino|antibiótico|antibiotico/.test(t)) return "antibiotico";
    if (/omeprazol|pantoprazol|ibp|ipp/.test(t)) return "ipp";
    if (/metformina/.test(t)) return "metformina";
    if (/loratadina|cetirizina|antihist/.test(t)) return "antihistaminico";
    if (/zolpidem|stilnox/.test(t)) return "zolpidem";
    if (/paracetamol/.test(t)) return "analgesico";
    return "otro";
  }

  function analizarInteracciones(productosSeleccionados, cronicosNombres) {
    const alerts = [];
    const grupos = [];
    for (const p of productosSeleccionados || []) {
      for (const g of gruposDeProducto(p)) grupos.push({ g, nombre: p.nombre });
      // también inferir del PA
      const inferred = inferGrupoDesdeTexto(p.principioActivo || p.nombre);
      if (inferred && inferred !== "otro" && !gruposDeProducto(p).includes(inferred)) {
        grupos.push({ g: inferred, nombre: p.nombre });
      }
    }
    for (const c of cronicosNombres || []) {
      grupos.push({ g: inferGrupoDesdeTexto(c), nombre: "Crónico: " + c });
    }
    for (let i = 0; i < grupos.length; i++) {
      for (let j = i + 1; j < grupos.length; j++) {
        if (grupos[i].nombre === grupos[j].nombre && grupos[i].g === grupos[j].g) continue;
        const hit = INTERACCIONES.find(
          (x) =>
            (x.a === grupos[i].g && x.b === grupos[j].g) ||
            (x.b === grupos[i].g && x.a === grupos[j].g)
        );
        if (hit) {
          alerts.push({
            tipo: "interaccion",
            nivel: hit.nivel,
            msg: `${hit.msg} (${grupos[i].nombre} ↔ ${grupos[j].nombre})`,
          });
        }
      }
    }
    return alerts;
  }

  function analizarAlergias(productosSeleccionados, alergias) {
    const alerts = [];
    const list = (alergias || []).map((a) => String(a).toLowerCase());
    for (const p of productosSeleccionados || []) {
      const blob = `${p.nombre} ${p.principioActivo} ${p.marca}`;
      for (const a of list) {
        if (a && blob.toLowerCase().includes(a)) {
          alerts.push({ tipo: "alergia", nivel: "grave", msg: `Posible alérgeno «${a}» en ${p.nombre}` });
          continue;
        }
        for (const m of ALERGIA_MAP) {
          if ((a.includes(m.key) || m.key.includes(a)) && m.match.test(blob)) {
            alerts.push({ tipo: "alergia", nivel: "grave", msg: `Alergia a ${a}: conflicto con ${p.nombre}` });
          }
        }
      }
    }
    return alerts;
  }

  function analizarEmbarazoLactancia(productosSeleccionados, paciente) {
    const alerts = [];
    if (!paciente) return alerts;
    if (paciente.embarazo) {
      for (const p of productosSeleccionados || []) {
        const blob = `${p.nombre} ${p.principioActivo}`;
        if (EMBARAZO_EVITAR.test(blob) || p.controlado) {
          alerts.push({
            tipo: "embarazo",
            nivel: "grave",
            msg: `Embarazo: revisar/evitar ${p.nombre} (simulación formativa).`,
          });
        }
      }
    }
    if (paciente.lactancia) {
      for (const p of productosSeleccionados || []) {
        if (/metamizol|codeína|tramadol|doxiciclina/i.test(`${p.nombre} ${p.principioActivo}`)) {
          alerts.push({
            tipo: "lactancia",
            nivel: "moderada",
            msg: `Lactancia: precaución con ${p.nombre}.`,
          });
        }
      }
    }
    return alerts;
  }

  function normalizarPA(pa) {
    return String(pa || "")
      .toLowerCase()
      .replace(/\+/g, " ")
      .replace(/[^a-záéíóúñ0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function esParacetamol(pa) {
    return /paracetamol|acetaminofen|acetaminofén/.test(normalizarPA(pa));
  }

  function analizarDuplicadosPrincipio(productosSeleccionados) {
    const alerts = [];
    const byPa = {};
    let paraCount = 0;
    const paraNombres = [];
    for (const p of productosSeleccionados || []) {
      const pa = normalizarPA(p.principioActivo);
      if (!pa || pa === "—") continue;
      const parts = pa.split(/\s+/).filter(Boolean);
      const key = parts.includes("paracetamol") ? "paracetamol" : pa.split(" ")[0];
      if (esParacetamol(p.principioActivo) || parts.includes("paracetamol")) {
        paraCount += 1;
        paraNombres.push(p.nombre);
      }
      byPa[key] = byPa[key] || [];
      byPa[key].push(p.nombre);
    }
    if (paraCount >= 2) {
      alerts.push({
        tipo: "duplicado_pa",
        nivel: "grave",
        msg: `Varios productos con PARACETAMOL: ${paraNombres.join(" + ")}. Riesgo de superar 3–4 g/día.`,
      });
    }
    for (const [pa, nombres] of Object.entries(byPa)) {
      if (nombres.length < 2 || pa === "paracetamol") continue;
      alerts.push({
        tipo: "duplicado_pa",
        nivel: "moderada",
        msg: `Mismo principio «${pa}» en: ${nombres.join(" + ")}. Revisa si es necesario.`,
      });
    }
    return alerts;
  }

  function analizarClinica(productosSeleccionados, paciente) {
    const all = [
      ...analizarAlergias(productosSeleccionados, paciente?.alergias),
      ...analizarEmbarazoLactancia(productosSeleccionados, paciente),
      ...analizarInteracciones(productosSeleccionados, paciente?.cronicos),
      ...analizarDuplicadosPrincipio(productosSeleccionados),
    ];
    const seen = new Set();
    return all.filter((a) => {
      const k = a.tipo + a.msg;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function buscarGenericos(producto, catalogo, stockMap) {
    if (!producto || !producto.principioActivo || producto.principioActivo === "—") return [];
    const pa = producto.principioActivo.toLowerCase();
    const dosis = (producto.dosis || "").toLowerCase();
    return catalogo
      .filter((p) => {
        if (p.id === producto.id) return false;
        if ((p.principioActivo || "").toLowerCase() !== pa) return false;
        if (dosis && p.dosis && p.dosis.toLowerCase() !== dosis) {
          if (p.dosis && producto.dosis) return p.dosis.toLowerCase() === dosis;
        }
        if ((stockMap[p.id] || 0) <= 0) return false;
        return p.esGenerico || p.precio < producto.precio;
      })
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 8)
      .map((p) => ({
        producto: p,
        ahorro: Math.max(0, Math.round((producto.precio - p.precio) * 100) / 100),
        ahorroPct: producto.precio > 0 ? Math.round((1 - p.precio / producto.precio) * 100) : 0,
      }));
  }

  function filtrarPorSintoma(catalogo, sintoma, stockMap) {
    const s = String(sintoma || "").toLowerCase().trim();
    if (!s) return [];
    return catalogo.filter((p) => {
      if (p.requiereReceta && !(p.sintomas || []).length) return false;
      const tags = (p.sintomas || []).join(" ").toLowerCase();
      const blob = `${p.nombre} ${p.principioActivo} ${tags}`.toLowerCase();
      return tags.includes(s) || blob.includes(s);
    }).filter((p) => (stockMap[p.id] || 0) > 0).slice(0, 60);
  }

  function etiquetaPosologia(producto, opts) {
    const p = producto || {};
    const nombre = opts?.pacienteNombre || "Paciente";
    const pa = p.principioActivo || "medicamento";
    const rx = !!p.requiereReceta;
    let como = "Según indicación del farmacéutico / médico.";
    const blob = `${p.nombre} ${pa} ${p.presentacion || ""}`.toLowerCase();
    if (/paracetamol|gelocatil|termalgin/.test(blob)) {
      como = "1 comprimido cada 6–8 horas si hay dolor o fiebre. No superar 3 g/día (adulto) salvo criterio médico.";
    } else if (/ibuprofeno|espidifen|enantyum|dexketoprofeno/.test(blob)) {
      como = "1 comprimido cada 8 horas con comida si duele. No usar muchos días seguidos sin consejo.";
    } else if (/omeprazol|pantoprazol|ibp|ipp/.test(blob)) {
      como = "1 cápsula al día, por la mañana en ayunas, tragar entera con agua.";
    } else if (/amoxicilina|azitromicina|antibiótico|antibiotico/.test(blob)) {
      como = "Tomar exactamente como indica la receta. Completar todo el tratamiento aunque se encuentre mejor.";
    } else if (/loratadina|cetirizina|desloratadina|antihist/.test(blob)) {
      como = "1 comprimido al día. Puede producir sueño (según el tipo): no conduzca si se encuentra somnoliento.";
    } else if (p.nevera) {
      como = "Conservar en nevera (2–8 °C). No congelar. Usar según receta.";
    } else if (rx) {
      como = `Tomar según receta médica. Principio: ${pa}. Si tiene dudas, pregunte en farmacia.`;
    } else {
      como = `Usar según el prospecto. Principio: ${pa}. Si no mejora en 2–3 días, consulte.`;
    }
    const avisos = [];
    if (p.nevera) avisos.push("❄ Cadena de frío");
    if (p.controlado) avisos.push("🔒 Uso controlado");
    if (/nsaid|ibuprofeno|aine|diclofenaco/.test(blob)) avisos.push("No combinar con anticoagulantes sin consejo");
    if (/paracetamol/.test(blob)) avisos.push("No acumular con otros productos que lleven paracetamol");
    return {
      titulo: "Farmacia Álora · Etiqueta al paciente",
      paciente: nombre,
      producto: p.nombre,
      principioActivo: pa,
      presentacion: p.presentacion || p.dosis || "",
      lote: opts?.lote || p.lote || "—",
      posologia: como,
      avisos,
      fecha: opts?.fechaTexto || new Date().toLocaleDateString("es-ES"),
    };
  }

  global.FarmaciaClinica = {
    INTERACCIONES,
    SINTOMAS_UI,
    analizarInteracciones,
    analizarAlergias,
    analizarEmbarazoLactancia,
    analizarDuplicadosPrincipio,
    analizarClinica,
    buscarGenericos,
    filtrarPorSintoma,
    inferGrupoDesdeTexto,
    etiquetaPosologia,
  };
})(typeof window !== "undefined" ? window : globalThis);
