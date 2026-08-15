/** Datos de campaña, cadenas guiadas y clientes B2B */
window.IM_DATA = window.IM_DATA || {};

window.IM_DATA.campaignChapters = [
  {
    id: 1,
    name: 'Fundación',
    goal: 'Establece tu primera planta y genera caja.',
    unlocks: ['build', 'market'],
  },
  {
    id: 2,
    name: 'Primera cadena',
    goal: 'Completa una cadena mena → producto.',
    unlocks: ['chains', 'logistics'],
  },
  {
    id: 3,
    name: 'Clientes B2B',
    goal: 'Cumple contratos con clientes industriales.',
    unlocks: ['b2b', 'reputation'],
  },
  {
    id: 4,
    name: 'Automatización',
    goal: 'Despliega blueprints y mantenimiento.',
    unlocks: ['blueprints', 'maintenance', 'auto_expand'],
  },
  {
    id: 5,
    name: 'Globalización',
    goal: 'Opera en varias divisas y climas.',
    unlocks: ['fx', 'seasons', 'semis'],
  },
];

window.IM_DATA.productChains = [
  {
    id: 'cadena_acero',
    name: 'Del mineral al acero',
    steps: [
      { item: 'mena_de_hierro', action: 'produce', qty: 20, hint: 'Extrae mena de hierro en zona minera' },
      { item: 'arrabio', action: 'produce', qty: 10, hint: 'Fundición' },
      { item: 'acero_liquido', action: 'produce', qty: 8, hint: 'Afino' },
      { item: 'acero_laminado', action: 'produce', qty: 5, hint: 'Laminación' },
      { item: 'acero_laminado', action: 'sell', qty: 5, hint: 'Vende acero laminado' },
    ],
    reward: { money: 250000, xp: 400, chapter: 2 },
  },
  {
    id: 'cadena_aceituna',
    name: 'De la aceituna al aceite',
    steps: [
      { item: 'aceituna', action: 'produce', qty: 30, hint: 'Cultiva aceituna (mejor en clima mediterráneo)' },
      { item: 'aceite_de_oliva', action: 'produce', qty: 5, hint: 'Almazara' },
      { item: 'aceite_de_oliva', action: 'sell', qty: 5, hint: 'Vende aceite' },
    ],
    reward: { money: 120000, xp: 250, chapter: 2 },
  },
  {
    id: 'cadena_petroleo',
    name: 'Del crudo a los combustibles',
    steps: [
      { item: 'petroleo_crudo', action: 'produce', qty: 40, hint: 'Extracción o compra de crudo' },
      { item: 'gasolina', action: 'produce', qty: 5, hint: 'Refino' },
      { item: 'diesel', action: 'produce', qty: 5, hint: 'Refino' },
      { item: 'gasolina', action: 'sell', qty: 5, hint: 'Vende gasolina' },
    ],
    reward: { money: 300000, xp: 450, chapter: 2 },
  },
  {
    id: 'cadena_bateria',
    name: 'Cadena de baterías Li-ion',
    steps: [
      { item: 'espodumeno_litio', action: 'produce', qty: 5, hint: 'Litio' },
      { item: 'litio_metal', action: 'produce', qty: 2, hint: 'Refino de litio' },
      { item: 'catodo_nmc', action: 'produce', qty: 2, hint: 'Cátodo NMC' },
      { item: 'celda_li_ion', action: 'produce', qty: 50, hint: 'Ensamble de celdas' },
      { item: 'paquete_bateria_ev', action: 'produce', qty: 5, hint: 'Paquete EV' },
    ],
    reward: { money: 800000, xp: 800, chapter: 5 },
  },
  {
    id: 'cadena_chip',
    name: 'Cadena de semiconductores',
    steps: [
      { item: 'arena_de_silice', action: 'produce', qty: 10, hint: 'Sílice' },
      { item: 'silicio_metalurgico', action: 'produce', qty: 5, hint: 'Silicio metalúrgico' },
      { item: 'silicio_electronico', action: 'produce', qty: 1, hint: 'Silicio electrónico' },
      { item: 'oblea_200mm', action: 'produce', qty: 10, hint: 'Obleas' },
      { item: 'chip_logico_28nm', action: 'produce', qty: 100, hint: 'Chips 28nm' },
    ],
    reward: { money: 1200000, xp: 1000, chapter: 5 },
  },
  {
    id: 'cadena_coche',
    name: 'Del acero a la furgoneta',
    steps: [
      { item: 'chapa_de_acero', action: 'produce', qty: 8, hint: 'Chapa' },
      { item: 'motor_electrico_55_kw', action: 'produce', qty: 2, hint: 'Motor' },
      { item: 'neumatico', action: 'produce', qty: 8, hint: 'Neumáticos' },
      { item: 'furgoneta_industrial', action: 'produce', qty: 1, hint: 'Montaje' },
      { item: 'furgoneta_industrial', action: 'sell', qty: 1, hint: 'Venta B2B' },
    ],
    reward: { money: 500000, xp: 700, chapter: 3 },
  },
];

window.IM_DATA.b2bClients = [
  { id: 'cli_renfe_cargo', name: 'Renfe Mercancías', sector: 'logistica', preferred: ['diesel', 'acero_laminado'], minQuality: 60, reputation: 50 },
  { id: 'cli_seat', name: 'SEAT Industrial', sector: 'automocion', preferred: ['chapa_de_acero', 'paquete_bateria_ev'], minQuality: 70, reputation: 50 },
  { id: 'cli_mercadona', name: 'Cadena alimentaria', sector: 'alimentacion', preferred: ['aceite_de_oliva', 'harina_de_trigo'], minQuality: 55, reputation: 50 },
  { id: 'cli_iberdrola', name: 'Utility energética', sector: 'energia', preferred: ['electricidad', 'modulo_fv_500w_topcon'], minQuality: 65, reputation: 50 },
  { id: 'cli_indra', name: 'Electrónica de defensa civil', sector: 'electronica', preferred: ['pcb_ensamblada_comercial', 'chip_logico_28nm'], minQuality: 75, reputation: 50 },
  { id: 'cli_acs', name: 'Constructora', sector: 'construccion', preferred: ['cemento_portland', 'hormigon_fresco'], minQuality: 50, reputation: 50 },
  { id: 'cli_farmacia', name: 'Laboratorio genérico', sector: 'farmaceuticos', preferred: ['paracetamol_api', 'comprimido_generico'], minQuality: 80, reputation: 50 },
  { id: 'cli_export_and', name: 'Exportadora andaluza', sector: 'agro', preferred: ['aceituna', 'aceite_de_oliva', 'naranja'], minQuality: 60, reputation: 50 },
];

window.IM_DATA.fxRates = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  JPY: 0.0061,
  CNY: 0.13,
  BRL: 0.16,
};

window.IM_DATA.countryPolicies = {
  ES: { subsidyAgro: 0.08, subsidyGreen: 0.1, tariffExtra: 0, name: 'España' },
  DE: { subsidyAgro: 0.05, subsidyGreen: 0.12, tariffExtra: 0, name: 'Alemania' },
  US: { subsidyAgro: 0.06, subsidyGreen: 0.05, tariffExtra: 0.02, name: 'EE.UU.' },
  CN: { subsidyAgro: 0.04, subsidyGreen: 0.08, tariffExtra: 0.03, name: 'China' },
  SA: { subsidyAgro: 0.02, subsidyGreen: 0.02, tariffExtra: 0, name: 'Arabia Saudí' },
  BR: { subsidyAgro: 0.1, subsidyGreen: 0.06, tariffExtra: 0.04, name: 'Brasil' },
  DEFAULT: { subsidyAgro: 0.03, subsidyGreen: 0.04, tariffExtra: 0.02, name: 'Genérico' },
};
