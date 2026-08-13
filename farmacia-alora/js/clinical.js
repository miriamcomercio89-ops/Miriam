/**
 * Lógica clínica de práctica: interacciones, alergias, genéricos, síntomas.
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

  function gruposDeProducto(p) {
    return [p.grupoInteraccion].filter(Boolean);
  }

  function analizarInteracciones(productosSeleccionados, cronicosNombres) {
    const alerts = [];
    const grupos = [];
    for (const p of productosSeleccionados) {
      for (const g of gruposDeProducto(p)) grupos.push({ g, nombre: p.nombre });
    }
    for (const c of cronicosNombres || []) {
      grupos.push({ g: inferGrupoDesdeTexto(c), nombre: "Crónico: " + c });
    }
    for (let i = 0; i < grupos.length; i++) {
      for (let j = i + 1; j < grupos.length; j++) {
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

  function inferGrupoDesdeTexto(txt) {
    const t = String(txt || "").toLowerCase();
    if (/ibuprofeno|naproxeno|diclofenaco|aines|aas|aspirina|dexketoprofeno/.test(t)) return "nsaid";
    if (/warfarina|apixabán|rivaroxabán|anticoag|sintrom|eliquis|xarelto/.test(t)) return "anticoagulante";
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
    return "otro";
  }

  function analizarAlergias(productosSeleccionados, alergias) {
    const alerts = [];
    const list = (alergias || []).map((a) => String(a).toLowerCase());
    for (const p of productosSeleccionados) {
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
      for (const p of productosSeleccionados) {
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
      for (const p of productosSeleccionados) {
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

  function analizarClinica(productosSeleccionados, paciente) {
    const all = [
      ...analizarAlergias(productosSeleccionados, paciente?.alergias),
      ...analizarEmbarazoLactancia(productosSeleccionados, paciente),
      ...analizarInteracciones(productosSeleccionados, paciente?.cronicos),
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
        if (dosis && p.dosis && p.dosis.toLowerCase() !== dosis && !String(p.nombre).includes(producto.dosis)) {
          // allow loose match if dosis empty on either
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

  const SINTOMAS_UI = [
    "dolor de cabeza", "fiebre", "tos", "alergia", "acidez", "diarrea",
    "estreñimiento", "congestión", "dolor muscular", "piel irritada",
    "insomnio", "estres", "vitaminas", "higiene bucal", "solar",
  ];

  global.FarmaciaClinica = {
    analizarClinica,
    buscarGenericos,
    filtrarPorSintoma,
    inferGrupoDesdeTexto,
    SINTOMAS_UI,
    INTERACCIONES,
  };
})(typeof window !== "undefined" ? window : globalThis);
