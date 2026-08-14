/**
 * Herramientas clínicas de práctica: magistral, pediatría, vitals, campañas, médico, planograma.
 */
(function (global) {
  const CAMPANIAS = [
    {
      id: "gripe",
      estaciones: ["invierno", "otono"],
      titulo: "Campaña vacuna / prevención gripe",
      icon: "💉",
      color: "#0ea5e9",
      script: "¿Ha pensado en la vacuna de la gripe este año? Puedo orientarle sobre prevención y productos de soporte (no sustituye consejo médico).",
      categoriasBoost: ["Resfriado y gripe", "Vitaminas"],
    },
    {
      id: "solar",
      estaciones: ["verano", "primavera"],
      titulo: "Campaña fotoprotección",
      icon: "☀",
      color: "#f59e0b",
      script: "Con este sol, ¿lleva protector solar adecuado? Le ayudo a elegir FPS según piel y tiempo de exposición.",
      categoriasBoost: ["Piel / Dermatología", "Viaje"],
    },
    {
      id: "alergia",
      estaciones: ["primavera"],
      titulo: "Campaña alergia primaveral",
      icon: "🌸",
      color: "#ec4899",
      script: "Si tiene estornudos o picor de ojos, podemos revisar antihistamínicos OTC y lavados nasales.",
      categoriasBoost: ["Resfriado y gripe", "Piel / Dermatología"],
    },
    {
      id: "hidratacion",
      estaciones: ["verano"],
      titulo: "Campaña hidratación y calor",
      icon: "💧",
      color: "#14b8a6",
      script: "Con el calor conviene beber agua y vigilar sueros de rehidratación si hay diarrea o mareo.",
      categoriasBoost: ["Digestivo", "Bebidas", "Viaje"],
    },
  ];

  const MEDICO_RESPUESTAS = [
    { keys: ["interaccion", "interact"], text: "Revise alergias y evite AINE + anticoagulante sin control. Si duda, no dispense y derive." },
    { keys: ["embaraz", "gestant"], text: "En embarazo priorice paracetamol a dosis habitual; evite AINE en 3.er trimestre salvo criterio médico." },
    { keys: ["niñ", "pediatr", "peso", "mg/kg"], text: "Calcule siempre mg/kg y redondee a presentación segura. Confirme edad y peso con el tutor." },
    { keys: ["visado", "inspeccion"], text: "Si requiere visado, no dispense hasta confirmación electrónica. Anote referencia." },
    { keys: ["controlado", "estupe"], text: "Exija DNI, receta válida y asiento en libro. Firma del farmacéutico obligatoria." },
    { keys: ["fiebre", "tos", "gripe"], text: "Valore alarmas (disnea, rigidez de nuca, <3 meses). Si no hay alarma, consejo sintomático y seguimiento 48–72 h." },
    { keys: ["default"], text: "Gracias por consultar. Documente la duda, verifique receta/alergias y, si el riesgo es alto, derive a urgencias o médico de familia." },
  ];

  function campaniaActual(seasonId) {
    const list = CAMPANIAS.filter((c) => c.estaciones.includes(seasonId));
    if (!list.length) return CAMPANIAS[0];
    return list[Math.floor(Date.now() / 86400000) % list.length];
  }

  function calcPediatrico({ pesoKg, dosisMgKg, tomasDia, concentracionMgMl }) {
    const peso = Number(pesoKg) || 0;
    const dosis = Number(dosisMgKg) || 0;
    const tomas = Math.max(1, Number(tomasDia) || 1);
    const conc = Number(concentracionMgMl) || 0;
    const mgToma = peso * dosis;
    const mgDia = mgToma * tomas;
    const mlToma = conc > 0 ? mgToma / conc : null;
    const mlDia = mlToma != null ? mlToma * tomas : null;
    return {
      ok: peso > 0 && dosis > 0,
      mgToma: Math.round(mgToma * 10) / 10,
      mgDia: Math.round(mgDia * 10) / 10,
      mlToma: mlToma != null ? Math.round(mlToma * 100) / 100 : null,
      mlDia: mlDia != null ? Math.round(mlDia * 100) / 100 : null,
      aviso: peso < 5 ? "Peso muy bajo: revise con pediatría." : peso > 70 ? "Peso alto: confirme si aplica dosis de adulto." : "",
    };
  }

  function calcMagistral({ principio, dosisMg, volumenMl, vehiculo }) {
    const d = Number(dosisMg) || 0;
    const v = Number(volumenMl) || 0;
    const conc = v > 0 ? d / v : 0;
    const pasos = [
      `Pesar ${d} mg de ${principio || "principio activo"}.`,
      `Disolver / dispersar en parte del vehículo (${vehiculo || "agua purificada"}).`,
      `Enrasar a ${v} ml y homogeneizar.`,
      `Etiquetar: nombre, concentración ${conc.toFixed(2)} mg/ml, fecha, caducidad corta, “Agitar”.`,
      `Registrar en libro de fórmulas (práctica).`,
    ];
    return {
      ok: d > 0 && v > 0 && !!principio,
      concentracion: Math.round(conc * 100) / 100,
      pasos,
      etiqueta: `${principio || "PA"} ${conc.toFixed(2)} mg/ml · ${v} ml · ${vehiculo || "vehículo"}`,
    };
  }

  function interpretarTA(sis, dia) {
    sis = Number(sis); dia = Number(dia);
    if (!sis || !dia) return { nivel: "—", consejo: "Introduce valores." };
    if (sis >= 180 || dia >= 120) return { nivel: "Crisis hipertensiva (simulación)", consejo: "Derivación urgente. No automedicar." };
    if (sis >= 140 || dia >= 90) return { nivel: "Alta", consejo: "Recomendar control médico; revisar medicación crónica." };
    if (sis < 90 || dia < 60) return { nivel: "Baja", consejo: "Valorar mareo/síntomas; hidratación y criterio médico." };
    return { nivel: "Normal / aceptable", consejo: "Registrar y aconsejar seguimiento periódico." };
  }

  function interpretarGlucemia(mgdl, ayunas) {
    const v = Number(mgdl);
    if (!v) return { nivel: "—", consejo: "Introduce valor." };
    if (ayunas) {
      if (v < 70) return { nivel: "Hipoglucemia", consejo: "Azúcar de acción rápida y reevaluar. Si grave, urgencias." };
      if (v >= 126) return { nivel: "Alta en ayunas", consejo: "Derivar a control médico / diabetes." };
      if (v >= 100) return { nivel: "Alterada", consejo: "Consejo de estilo de vida y seguimiento." };
      return { nivel: "Normal (ayunas)", consejo: "Registrar en ficha." };
    }
    if (v < 70) return { nivel: "Hipoglucemia", consejo: "Actuar como hipoglucemia." };
    if (v >= 200) return { nivel: "Muy alta", consejo: "Derivar; posible descompensación." };
    if (v >= 140) return { nivel: "Elevada", consejo: "Revisar con médico." };
    return { nivel: "Aceptable (no ayunas)", consejo: "Registrar." };
  }

  function replyMedico(pregunta) {
    const q = (pregunta || "").toLowerCase();
    for (const r of MEDICO_RESPUESTAS) {
      if (r.keys.includes("default")) continue;
      if (r.keys.some((k) => q.includes(k))) return r.text;
    }
    return MEDICO_RESPUESTAS.find((r) => r.keys.includes("default")).text;
  }

  function defaultPlanograma(productos) {
    const cats = ["Resfriado y gripe", "Digestivo", "Alivio del dolor", "Piel / Dermatología", "Vitaminas", "Viaje"];
    const shelves = cats.map((cat, i) => {
      const picks = productos.filter((p) => p.categoria === cat && !p.requiereReceta).slice(0, 4).map((p) => p.id);
      return { id: "est-" + i, nombre: cat, slots: picks };
    });
    return shelves;
  }

  global.FarmaciaClinicTools = {
    CAMPANIAS,
    campaniaActual,
    calcPediatrico,
    calcMagistral,
    interpretarTA,
    interpretarGlucemia,
    replyMedico,
    defaultPlanograma,
  };
})(typeof window !== "undefined" ? window : globalThis);
