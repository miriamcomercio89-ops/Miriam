/**
 * Generador de millones de clientes distintos (procedural, sin guardar todos).
 * Espacio: 5_000_000 identidades únicas.
 */
(function (global) {
  const TOTAL = 5000000;

  const NOMBRES = [
    "María", "Carmen", "Ana", "Laura", "Isabel", "Lucía", "Paula", "Elena", "Sara", "Marta",
    "Cristina", "Patricia", "Laura", "Rosa", "Pilar", "Teresa", "Julia", "Clara", "Nuria", "Irene",
    "Antonio", "José", "Manuel", "Francisco", "Juan", "David", "Javier", "Carlos", "Miguel", "Pedro",
    "Ángel", "Raúl", "Alberto", "Sergio", "Pablo", "Diego", "Jorge", "Álvaro", "Adrián", "Iván",
    "Sofía", "Valeria", "Hugo", "Martín", "Lucas", "Daniel", "Alejandro", "Gonzalo", "Héctor", "Óscar",
  ];
  const APELLIDOS = [
    "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
    "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutierrez",
    "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Molina",
    "Morales", "Suárez", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marín", "Sanz", "Iglesias",
    "Cortés", "Castillo", "Guerrero", "Lozano", "Cano", "Cruz", "Flores", "León", "Herrera", "Gallego",
  ];

  const PETICIONES = [
    { texto: "Me duele mucho la cabeza y tengo un poco de fiebre.", sintomas: ["dolor de cabeza", "fiebre"] },
    { texto: "Estoy resfriado: tos y congestión nasal.", sintomas: ["tos", "congestión"] },
    { texto: "Tengo alergia, me pican los ojos y estornudo mucho.", sintomas: ["alergia"] },
    { texto: "Me arde el estómago, creo que es acidez.", sintomas: ["acidez"] },
    { texto: "Llevo dos días con diarrea.", sintomas: ["diarrea"] },
    { texto: "Estoy estreñido desde hace días.", sintomas: ["estreñimiento"] },
    { texto: "Me duele la espalda y los músculos.", sintomas: ["dolor muscular"] },
    { texto: "Tengo la piel irritada y roja.", sintomas: ["piel irritada"] },
    { texto: "No puedo dormir bien.", sintomas: ["insomnio"] },
    { texto: "Quiero vitaminas porque estoy cansado.", sintomas: ["vitaminas"] },
    { texto: "Necesito protector solar.", sintomas: ["solar"] },
    { texto: "Busco algo para la higiene bucal, se me sangran las encías.", sintomas: ["higiene bucal"] },
    { texto: "Vengo a por mi medicación crónica, traigo receta.", sintomas: [], receta: true },
    { texto: "El médico me ha recetado un antibiótico.", sintomas: [], receta: true },
    { texto: "Necesito algo para el dolor y también para la tos.", sintomas: ["dolor de cabeza", "tos"] },
    { texto: "Mi hijo tiene fiebre, ¿qué me recomienda?", sintomas: ["fiebre"] },
    { texto: "Quiero un test de embarazo y preservativos.", sintomas: [] },
    { texto: "Me han picado unos insectos y me pica la piel.", sintomas: ["piel irritada"] },
    { texto: "Estoy nervioso/a y con estrés, ¿tienen algo suave?", sintomas: ["estres"] },
    { texto: "Necesito material para la diabetes: tiras o lancetas.", sintomas: [] },
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
    return arr[Math.floor(r() * arr.length)];
  }

  function genDNI(r) {
    const num = 10000000 + Math.floor(r() * 89999999);
    return String(num) + "TRWAGMYFPDXBNJZSQVHLCKE"[num % 23];
  }

  /** id entero 0 .. TOTAL-1 */
  function generarCliente(id) {
    const n = ((Number(id) % TOTAL) + TOTAL) % TOTAL;
    const r = mulberry32(n * 2654435761 + 12345);
    const nombre = `${pick(r, NOMBRES)} ${pick(r, APELLIDOS)} ${pick(r, APELLIDOS)}`;
    const dni = genDNI(r);
    const edad = 1 + Math.floor(r() * 95);
    const tramos = ["exento", "pensionista", "activo_bajo", "activo_medio", "activo_alto"];
    let tramoSNS = pick(r, tramos);
    if (edad >= 65 && r() < 0.7) tramoSNS = "pensionista";
    if (edad < 18 && r() < 0.3) tramoSNS = "exento";
    const familiaNumerosa = r() < 0.12;
    const peticion = pick(r, PETICIONES);
    const mutuas = ["particular", "ss", "adeslas", "sanitas", "asisa", "dkv", "mapfre", "caser", "axa"];
    return {
      id: "CLI-" + String(n).padStart(7, "0"),
      seedId: n,
      nombre,
      dni,
      telefono: "6" + String(100000000 + Math.floor(r() * 89999999)).slice(0, 8),
      edad,
      tramoSNS,
      familiaNumerosa,
      mutuaId: pick(r, mutuas),
      alergias: r() < 0.18 ? [pick(r, ["penicilina", "aines", "aspirina", "metamizol", "lactosa"])] : [],
      cronicos: r() < 0.35 ? [pick(r, ["enalapril", "metformina", "atorvastatina", "omeprazol", "sertralina"])] : [],
      embarazo: edad >= 18 && edad <= 45 && r() < 0.04,
      lactancia: edad >= 18 && edad <= 45 && r() < 0.03,
      peticionTexto: peticion.texto,
      sintomas: peticion.sintomas.slice(),
      quiereReceta: !!peticion.receta,
      notas: familiaNumerosa ? "Familia numerosa" : "",
    };
  }

  function clienteAleatorio(extraSeed) {
    const r = mulberry32((Date.now() ^ (extraSeed || 0) ^ Math.floor(Math.random() * 1e9)) >>> 0);
    const id = Math.floor(r() * TOTAL);
    return generarCliente(id);
  }

  /** Aportación SNS simplificada (lo que paga el paciente sobre medicamentos) */
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

  global.FarmaciaClientes = {
    TOTAL,
    generarCliente,
    clienteAleatorio,
    aportacionSNS,
    PETICIONES,
  };
})(typeof window !== "undefined" ? window : globalThis);
